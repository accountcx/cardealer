import cron, { type ScheduledTask } from 'node-cron';
import crypto from 'node:crypto';
import { db, schema } from '@cardealer/database';
import { eq, asc, desc } from 'drizzle-orm';
import { slugifyVietnamese, calculateReadingTimeAndWordCount } from '@cardealer/core';
import type { FullArticleBlock } from '@cardealer/types';
import { aiService } from './ai/ai.service';

// 🔄 Helper chuyển đổi danh sách khối FullArticleBlock sang Tiptap AST Document
export function convertFullArticleBlocksToTiptap(blocks: FullArticleBlock[]): Record<string, unknown> {
  const content = (blocks || []).map((b) => {
    switch (b.type) {
      case 'heading':
        return {
          type: 'heading',
          attrs: { level: b.level || 2 },
          content: [{ type: 'text', text: b.title || b.content || '' }],
        };
      case 'callout':
        return {
          type: 'calloutBlock',
          attrs: {
            type: b.calloutType || 'info',
            title: b.title || '',
            content: b.content || '',
          },
        };
      case 'faq':
        return {
          type: 'faqBlock',
          attrs: {
            title: b.title || 'Câu hỏi thường gặp',
            questions: b.faqs || [],
          },
        };
      case 'prosCons':
        return {
          type: 'prosConsBlock',
          attrs: {
            pros: b.pros || [],
            cons: b.cons || [],
          },
        };
      case 'priceTable':
        return {
          type: 'priceTableBlock',
          attrs: {
            title: b.title || 'Bảng giá tham khảo',
            prices: b.prices || [],
          },
        };
      case 'relatedCar':
        return {
          type: 'relatedCarBlock',
          attrs: {
            carSlug: b.carSlug || '',
            carName: b.carName || '',
            minPrice: b.carPrice || 0,
            anhDaiDienUrl: b.carImage || '',
          },
        };
      case 'singleImage':
        return {
          type: 'singleImageBlock',
          attrs: {
            url: b.imageUrl || '',
            alt: b.imageAlt || '',
            caption: b.caption || '',
          },
        };
      case 'ctaButton':
        return {
          type: 'ctaButtonBlock',
          attrs: {
            text: b.ctaButtonText || 'Nhận Báo Giá',
            actionType: b.ctaActionType || 'hotline',
            phone: b.ctaPhone || '',
          },
        };
      case 'leadForm':
        return {
          type: 'leadFormBlock',
          attrs: {
            headline: b.formHeadline || 'Đăng ký tư vấn',
            carName: b.carName || '',
          },
        };
      case 'paragraph':
      default:
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: b.content || '' }],
        };
    }
  });

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph', content: [{ type: 'text', text: 'Nội dung bài viết' }] }],
  };
}

export class AutoPostSchedulerService {
  private currentJob: ScheduledTask | null = null;
  private isProcessing = false;

  // 1. Khởi động Scheduler Service và nạp cấu hình từ DB
  public async init(): Promise<void> {
    try {
      let settings = await db.query.autoPostSettings.findFirst({
        where: eq(schema.autoPostSettings.id, 'default'),
      });

      if (!settings) {
        const [created] = await db
          .insert(schema.autoPostSettings)
          .values({
            id: 'default',
            isEnabled: false,
            cronExpression: '0 8 * * *',
            defaultStatus: 'draft',
          })
          .returning();
        settings = created;
      }

      if (settings?.isEnabled && settings.cronExpression) {
        if (cron.validate(settings.cronExpression)) {
          this.currentJob = cron.schedule(settings.cronExpression, () => {
            console.log(`[Scheduler] ⏰ Cron tick triggered at ${new Date().toISOString()}`);
            void this.runAutoPostPipeline('cron');
          });
          console.log(`[Scheduler] 🟢 Scheduler started with cron: "${settings.cronExpression}"`);
        } else {
          console.warn(`[Scheduler] ⚠️ Cron expression không hợp lệ: "${settings.cronExpression}"`);
        }
      } else {
        console.log('[Scheduler] ⏸️ Scheduler đang ở trạng thái TẮT.');
      }
    } catch (err: unknown) {
      console.error('[Scheduler] ❌ Lỗi khởi tạo AutoPostSchedulerService:', err);
    }
  }

  // 2. Reload lại Cron Task khi admin đổi cấu hình qua API
  public async reload(): Promise<void> {
    if (this.currentJob) {
      this.currentJob.stop();
      this.currentJob = null;
    }
    await this.init();
  }

  // 3. Dừng an toàn khi server shutdown
  public stop(): void {
    if (this.currentJob) {
      this.currentJob.stop();
      this.currentJob = null;
      console.log('[Scheduler] 🛑 Scheduler stopped.');
    }
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }

  // 4. Pipeline Tự Động Viết Bài Hoàn Chỉnh (Áp dụng cho cả Cron và Run-Now)
  public async runAutoPostPipeline(triggerType: 'cron' | 'manual_run_now'): Promise<{
    postId: string;
    title: string;
    slug: string;
    status: string;
    executionTimeMs: number;
  }> {
    if (this.isProcessing) {
      const msg = 'Hệ thống đang trong quá trình sinh bài viết tự động khác, vui lòng đợi giây lát.';
      if (triggerType === 'manual_run_now') {
        throw new Error(msg);
      }
      console.warn(`[Scheduler] ⚠️ Mutex lock active: ${msg}`);
      return { postId: '', title: '', slug: '', status: 'skipped', executionTimeMs: 0 };
    }

    this.isProcessing = true;
    const startTime = Date.now();
    let targetPlanItem: typeof schema.contentPlanItems.$inferSelect | null = null;

    try {
      const settings = await db.query.autoPostSettings.findFirst({
        where: eq(schema.autoPostSettings.id, 'default'),
      });

      if (triggerType === 'cron' && (!settings || !settings.isEnabled)) {
        console.log('[Scheduler] Scheduler bị tắt, hủy chạy tác vụ cron.');
        return { postId: '', title: '', slug: '', status: 'disabled', executionTimeMs: 0 };
      }

      // Lấy 1 mục pending gần nhất từ hàng đợi
      const foundPlan = await db.query.contentPlanItems.findFirst({
        where: eq(schema.contentPlanItems.status, 'pending'),
        orderBy: [asc(schema.contentPlanItems.scheduledAt), asc(schema.contentPlanItems.createdAt)],
      });

      let targetTitle = '';
      let targetKeyword = '';
      let targetCar = '';
      let targetAngle = '';
      let targetCategoryId = settings?.defaultCategoryId || null;

      if (foundPlan) {
        targetPlanItem = foundPlan;
        targetTitle = foundPlan.title;
        targetKeyword = foundPlan.focusKeyword;
        targetCar = foundPlan.targetCar || 'Xe ô tô Hyundai';
        targetAngle = foundPlan.angle || 'Góc nhìn trải nghiệm thực tế';
        if (foundPlan.categoryId) targetCategoryId = foundPlan.categoryId;

        // Khóa trạng thái processing
        await db
          .update(schema.contentPlanItems)
          .set({ status: 'processing', updatedAt: new Date() })
          .where(eq(schema.contentPlanItems.id, foundPlan.id));
      } else {
        // Hàng đợi rỗng: Tự động dùng AI Ideation để lấy 1 đề tài độc bản mới nhất
        console.log('[Scheduler] Hàng đợi rỗng, kích hoạt AI Ideation để tạo đề tài tự động...');
        const ideaResult = await aiService.generate({
          action: 'generate_topic_ideas',
          prompt: 'Tự động gợi ý 1 đề tài bài viết mới nhất giải quyết Content Gap',
          ideasCount: 1,
        });

        const firstIdea = ideaResult.topicIdeas?.[0];
        targetTitle = firstIdea?.title || 'Đánh Giá Xe Hyundai Mới Nhất: Ưu Nhược Điểm & Giá Lăn Bánh';
        targetKeyword = firstIdea?.focusKeyword || 'đánh giá xe hyundai mới nhất';
        targetCar = firstIdea?.targetCar || 'Xe ô tô Hyundai';
        targetAngle = firstIdea?.angle || 'Đánh giá toàn diện';
      }

      // Gọi AI Service sinh trọn vẹn bài viết Tiptap AST
      console.log(`[Scheduler] 🚀 Đang sinh bài viết: "${targetTitle}" (từ khóa: "${targetKeyword}")...`);
      const fullArticleResponse = await aiService.generate({
        action: 'generate_full_article',
        prompt: targetTitle,
        keyword: targetKeyword,
        carModel: targetCar,
        angle: targetAngle,
      });

      const article = fullArticleResponse.fullArticle;
      if (!article || !article.title) {
        throw new Error('AI Service không trả về cấu trúc bài viết hợp lệ');
      }

      // Tạo Tiptap AST Document
      const tiptapDoc = convertFullArticleBlocksToTiptap(article.blocks || []);
      const { readingTime, wordCount } = calculateReadingTimeAndWordCount(tiptapDoc);

      // Đảm bảo Slug không bị trùng lặp trong cơ sở dữ liệu
      let safeSlug = slugifyVietnamese(article.title);
      const existingPostWithSlug = await db.query.posts.findFirst({
        where: eq(schema.posts.slug, safeSlug),
      });
      if (existingPostWithSlug) {
        safeSlug = `${safeSlug}-${Date.now().toString().slice(-4)}`;
      }

      // Giải quyết Category ID hợp lệ
      let resolvedCatId = targetCategoryId;
      if (!resolvedCatId) {
        const firstCat = await db.query.categories.findFirst();
        if (firstCat) {
          resolvedCatId = firstCat.id;
        } else {
          const [createdCat] = await db
            .insert(schema.categories)
            .values({
              tenChuyenMuc: 'Tin tức chung',
              slug: 'tin-tuc-chung',
              moTa: 'Chuyên mục tin tức tổng hợp',
            })
            .returning();
          resolvedCatId = createdCat.id;
        }
      }

      // Giải quyết Author ID
      let resolvedAuthorId = settings?.defaultAuthorId || null;
      if (!resolvedAuthorId) {
        const firstUser = await db.query.users.findFirst();
        if (firstUser) resolvedAuthorId = firstUser.id;
      }

      const postStatus = settings?.defaultStatus === 'published' ? 'published' : 'draft';
      const previewToken = crypto.randomBytes(32).toString('hex');

      // Thêm bài viết mới vào bảng posts
      const [newPost] = await db
        .insert(schema.posts)
        .values({
          tieuDe: article.title,
          slug: safeSlug,
          categoryId: resolvedCatId,
          authorId: resolvedAuthorId,
          anhDaiDienUrl: '/images/car-placeholder.webp',
          anhDaiDienAlt: article.title,
          tomTat: article.summary || null,
          noiDung: tiptapDoc,
          status: postStatus,
          publishedAt: postStatus === 'published' ? new Date() : null,
          focusKeyword: article.focusKeyword || targetKeyword,
          metaTitle: article.metaTitle || article.title,
          metaDescription: article.metaDescription || article.summary || null,
          readingTime,
          wordCount,
          previewToken,
        })
        .returning();

      // Cập nhật mục kế hoạch nếu có
      if (targetPlanItem) {
        await db
          .update(schema.contentPlanItems)
          .set({
            status: 'completed',
            postId: newPost.id,
            slug: newPost.slug,
            updatedAt: new Date(),
          })
          .where(eq(schema.contentPlanItems.id, targetPlanItem.id));
      }

      const executionTimeMs = Date.now() - startTime;

      // Ghi nhật ký thành công
      await db.insert(schema.autoPostLogs).values({
        triggerType,
        planItemId: targetPlanItem?.id || null,
        postId: newPost.id,
        postTitle: newPost.tieuDe,
        status: 'success',
        executionTimeMs,
      });

      console.log(`[Scheduler] ✅ Xuất bản bài viết tự động thành công (ID: ${newPost.id}, ${executionTimeMs}ms)`);

      return {
        postId: newPost.id,
        title: newPost.tieuDe,
        slug: newPost.slug,
        status: newPost.status,
        executionTimeMs,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi không xác định khi sinh bài tự động';
      const executionTimeMs = Date.now() - startTime;
      console.error(`[Scheduler] ❌ Lỗi tự động viết bài (${triggerType}):`, err);

      if (targetPlanItem) {
        await db
          .update(schema.contentPlanItems)
          .set({
            status: 'failed',
            errorMessage: errMsg,
            updatedAt: new Date(),
          })
          .where(eq(schema.contentPlanItems.id, targetPlanItem.id));
      }

      await db.insert(schema.autoPostLogs).values({
        triggerType,
        planItemId: targetPlanItem?.id || null,
        status: 'failed',
        errorMessage: errMsg,
        executionTimeMs,
      });

      if (triggerType === 'manual_run_now') {
        throw err;
      }

      return { postId: '', title: '', slug: '', status: 'failed', executionTimeMs };
    } finally {
      this.isProcessing = false;
    }
  }
}

export const autoPostSchedulerService = new AutoPostSchedulerService();
