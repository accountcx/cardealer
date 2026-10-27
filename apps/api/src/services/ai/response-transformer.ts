import type {
  AiGenerateResponseData,
  FullArticleResult,
  FullArticleBlock,
  OutlineItem,
  FaqItem,
  SeoOptimizationResult,
  CarFullContentResult,
  TopicIdeaItem,
} from '@cardealer/types';
import { slugifyVietnamese, checkTitleOrKeywordOverlap, sanitizePromotionSummary } from '@cardealer/core';
import type { TransformContext, ExistingCarArticleSummary } from './ai.types';

export { checkTitleOrKeywordOverlap };
import { extractAndParseJson, fallbackTextToFullArticle, cleanAndFormatTitle } from './json-parser';
import { normalizeAndEnrichBlocks, createFallbackFaqBlock } from './block-normalizer';

export { normalizeAndEnrichBlocks as enrichBlocksWithInventory } from './block-normalizer';

// Interface for intermediate parsed JSON structures
interface ParsedFullArticleJson {
  title?: string;
  summary?: string;
  focusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  suggestedKeywords?: string[];
  blocks?: FullArticleBlock[];
  outline?: OutlineItem[];
}

interface ParsedCarContentJson {
  moTaChung?: string;
  promotionSummary?: string;
  traTruocTu?: number;
  highlightFeatures?: Array<{ icon: string; title: string; value: string }>;
  article?: ParsedFullArticleJson;
}

interface ParsedOutlineJson {
  outline?: OutlineItem[];
}

interface ParsedFaqJson {
  faqs?: FaqItem[];
}

interface ParsedBlockJson {
  block?: FullArticleBlock;
  blocks?: FullArticleBlock[];
  summary?: string;
  content?: string;
}

interface ParsedSeoJson {
  metaTitle?: string;
  metaDescription?: string;
  suggestedKeywords?: string[];
  suggestedSlug?: string;
}

// WHY: Chuẩn hóa phản hồi danh sách ý tưởng bài viết và lọc bỏ các ý tưởng trùng lặp với DB.
export function normalizeTopicIdeas(
  rawIdeas: unknown,
  fallbackCar = 'Xe ô tô Hyundai',
  existingArticles: ExistingCarArticleSummary[] = []
): TopicIdeaItem[] {
  let list: unknown[] = [];
  if (Array.isArray(rawIdeas)) {
    list = rawIdeas;
  } else if (rawIdeas && typeof rawIdeas === 'object') {
    const obj = rawIdeas as Record<string, unknown>;
    if (Array.isArray(obj.topicIdeas)) {
      list = obj.topicIdeas;
    } else if (Array.isArray(obj.ideas)) {
      list = obj.ideas;
    }
  }

  const normalized: TopicIdeaItem[] = [];

  for (let idx = 0; idx < list.length; idx++) {
    const item = (list[idx] && typeof list[idx] === 'object' ? list[idx] : {}) as Record<string, unknown>;
    const title = cleanAndFormatTitle(
      String(item.title || item.tieuDe || `Ý tưởng bài viết ${idx + 1} về ${fallbackCar}`),
      fallbackCar
    );
    const focusKeyword = String(item.focusKeyword || item.keyword || item.tuKhoaChinh || `${fallbackCar} mới nhất`).trim();
    const slug = String(item.slug || slugifyVietnamese(title) || `y-tuong-bai-viet-${idx + 1}`).trim();
    const angle = String(item.angle || item.gocTiepCan || 'Góc tiếp cận thực tế').trim();
    const contentGap = String(item.contentGap || item.khoangTrongNoiDung || 'Chủ đề mới mẻ bổ sung khoảng trống nội dung cho website').trim();
    const summary = String(item.summary || item.tomTat || `Bài viết phân tích chuyên sâu về ${title}`).trim();
    const targetCar = String(item.targetCar || item.dongXe || fallbackCar).trim();
    const suggestedCategory = String(item.suggestedCategory || item.category || 'Đánh giá xe').trim();
    const outlinePreview = Array.isArray(item.outlinePreview)
      ? item.outlinePreview.map((o) => String(o).trim())
      : Array.isArray(item.outline)
      ? item.outline.map((o) => String(o).trim())
      : undefined;

    const rawIntent = String(item.searchIntent || '').toLowerCase();
    const searchIntent: TopicIdeaItem['searchIntent'] = ['informational', 'commercial', 'transactional', 'navigational'].includes(rawIntent)
      ? (rawIntent as TopicIdeaItem['searchIntent'])
      : 'commercial';

    // Tier 2 Deduplication Check: Kiểm tra đối soát với DB
    const isDuplicate = checkTitleOrKeywordOverlap(title, focusKeyword, existingArticles);
    if (!isDuplicate) {
      normalized.push({
        title,
        slug,
        focusKeyword,
        angle,
        contentGap,
        summary,
        targetCar,
        suggestedCategory,
        outlinePreview,
        searchIntent,
      });
    }
  }

  return normalized;
}

// WHY: Chuyển đổi và chuẩn hóa toàn bộ phản hồi từ AI thành định dạng chuẩn của hệ thống (@cardealer/types).
export function transformAiResponse(
  aiContent: string,
  model: string,
  ctx: TransformContext,
  isJsonResponse = true
): AiGenerateResponseData {
  const { action, prompt, targetCar, targetLocation, targetKeyword, availableCars, locProfile, calculatedPricing } = ctx;

  const resultData: AiGenerateResponseData = {
    action,
    model,
    rawText: aiContent,
  };

  if (!isJsonResponse) {
    resultData.text = aiContent.trim();
    return resultData;
  }

  const parsedJson = extractAndParseJson<Record<string, unknown>>(aiContent);

  switch (action) {
    case 'generate_full_article': {
      let fullArticleObj: FullArticleResult;
      const articleJson = parsedJson as ParsedFullArticleJson | null;

      if (articleJson && (articleJson.title || articleJson.blocks)) {
        fullArticleObj = {
          title: String(articleJson.title || prompt || 'Bài viết tư vấn mua xe Hyundai'),
          summary: String(articleJson.summary || ''),
          focusKeyword: String(articleJson.focusKeyword || targetKeyword),
          metaTitle: String(articleJson.metaTitle || articleJson.title || ''),
          metaDescription: String(articleJson.metaDescription || articleJson.summary || ''),
          suggestedKeywords: Array.isArray(articleJson.suggestedKeywords) ? articleJson.suggestedKeywords : [targetKeyword],
          blocks: Array.isArray(articleJson.blocks) && articleJson.blocks.length > 0 ? articleJson.blocks : [{ type: 'paragraph', content: aiContent }],
        };
      } else {
        fullArticleObj = fallbackTextToFullArticle(aiContent, prompt, targetKeyword);
      }

      fullArticleObj.blocks = normalizeAndEnrichBlocks(fullArticleObj.blocks, availableCars, targetCar);

      resultData.fullArticle = fullArticleObj;
      resultData.seo = {
        metaTitle: fullArticleObj.metaTitle,
        metaDescription: fullArticleObj.metaDescription,
        suggestedKeywords: fullArticleObj.suggestedKeywords,
      };
      resultData.text = fullArticleObj.summary;
      break;
    }

    case 'generate_outline': {
      const outlineJson = parsedJson as ParsedOutlineJson | null;
      if (outlineJson && Array.isArray(outlineJson.outline)) {
        resultData.outline = outlineJson.outline;
      } else {
        const lines = aiContent.split('\n').filter((l) => l.trim().startsWith('#') || l.trim().startsWith('-'));
        resultData.outline = lines.map((l) => ({
          level: l.startsWith('###') ? 3 : 2,
          title: l.replace(/^#+\s*/, '').replace(/^-\s*/, ''),
        }));
      }
      break;
    }

    case 'generate_faqs': {
      const faqJson = parsedJson as ParsedFaqJson | null;
      if (faqJson && Array.isArray(faqJson.faqs)) {
        resultData.faqs = faqJson.faqs;
      } else {
        resultData.faqs = [
          {
            question: `Giá lăn bánh ${targetCar} tại ${targetLocation} là bao nhiêu?`,
            answer: `Giá lăn bánh bao gồm giá niêm yết sau ưu đãi, thuế trước bạ, phí cấp biển số và các khoản bảo hiểm.`,
          },
          {
            question: `Mua xe ${targetCar} trả góp cần chuẩn bị những gì?`,
            answer: `Chỉ cần CCCD gắn chip và chứng minh thu nhập cơ bản, ngân hàng liên kết hỗ trợ duyệt hồ sơ nhanh trong 24 giờ.`,
          },
        ];
      }
      break;
    }

    case 'continue_writing':
    case 'expand_section': {
      const blockJson = parsedJson as ParsedBlockJson | null;
      let generatedBlocks: FullArticleBlock[] = [];
      let summaryText = '';

      if (blockJson && Array.isArray(blockJson.blocks) && blockJson.blocks.length > 0) {
        generatedBlocks = blockJson.blocks;
        summaryText = blockJson.summary || '';
      } else if (blockJson && blockJson.content) {
        generatedBlocks = [{ type: 'paragraph', content: String(blockJson.content) }];
        summaryText = String(blockJson.content);
      } else {
        const fallbackArticle = fallbackTextToFullArticle(aiContent, prompt, targetKeyword);
        generatedBlocks = fallbackArticle.blocks;
        summaryText = fallbackArticle.summary;
      }

      generatedBlocks = normalizeAndEnrichBlocks(generatedBlocks, availableCars, targetCar);

      resultData.blocks = generatedBlocks;
      resultData.text = summaryText || generatedBlocks.map((b) => b.content || b.title || '').filter(Boolean).join('\n\n');
      break;
    }

    case 'generate_car_content': {
      const carJson = parsedJson as ParsedCarContentJson | null;
      if (carJson && (carJson.moTaChung || carJson.highlightFeatures)) {
        let articleObj = carJson.article;
        if (articleObj && Array.isArray(articleObj.blocks)) {
          articleObj.blocks = normalizeAndEnrichBlocks(articleObj.blocks, availableCars, targetCar);

          // WHY: Code giữ số liệu - AI chỉ làm văn (Áp dụng bảng giá và form chính xác từ database)
          articleObj.blocks = articleObj.blocks.map((blk) => {
            if (blk.type === 'priceTable' && calculatedPricing.versionPrices.length > 0) {
              return {
                ...blk,
                title: blk.title || `Bảng Giá Xe ${targetCar} & Lăn Bánh Tham Khảo Tại ${locProfile.name}`,
                prices: calculatedPricing.versionPrices,
              };
            }
            if (blk.type === 'leadForm') {
              return {
                ...blk,
                carName: targetCar,
                formHeadline: blk.formHeadline || `Đăng Ký Báo Giá Lăn Bánh & Lái Thử ${targetCar} Tại ${locProfile.name}`,
              };
            }
            return blk;
          });

          // 1. Chuẩn hóa tiêu đề bài viết
          articleObj.title = cleanAndFormatTitle(articleObj.title || `Đánh Giá Xe ${targetCar}`, targetCar);

          // 2. Bảo đảm 100% có khối FAQ nếu AI quên sinh hoặc sinh thiếu
          const hasValidFaq = articleObj.blocks.some(
            (b) => b.type === 'faq' && Array.isArray(b.faqs) && b.faqs.length >= 2
          );
          if (!hasValidFaq) {
            const fallbackFaqBlock = createFallbackFaqBlock(targetCar, locProfile.name);
            const insertIdx = articleObj.blocks.findIndex((b) => b.type === 'leadForm' || b.type === 'ctaButton');
            if (insertIdx !== -1) {
              articleObj.blocks.splice(insertIdx, 0, fallbackFaqBlock);
            } else {
              articleObj.blocks.push(fallbackFaqBlock);
            }
          }
        }

        const carContentObj: CarFullContentResult = {
          moTaChung: String(carJson.moTaChung || ''),
          promotionSummary: sanitizePromotionSummary(String(carJson.promotionSummary || '')),
          traTruocTu: calculatedPricing.traTruocTu || (typeof carJson.traTruocTu === 'number' ? carJson.traTruocTu : undefined),
          highlightFeatures: Array.isArray(carJson.highlightFeatures) ? carJson.highlightFeatures : [],
          article: articleObj
            ? {
                title: cleanAndFormatTitle(String(articleObj.title || `Đánh Giá Xe ${targetCar}`), targetCar),
                summary: String(articleObj.summary || ''),
                focusKeyword: String(articleObj.focusKeyword || targetKeyword),
                metaTitle: String(articleObj.metaTitle || articleObj.title || ''),
                metaDescription: String(articleObj.metaDescription || articleObj.summary || ''),
                suggestedKeywords: Array.isArray(articleObj.suggestedKeywords) ? articleObj.suggestedKeywords : [targetKeyword],
                outline: Array.isArray(articleObj.outline) ? articleObj.outline : undefined,
                blocks: Array.isArray(articleObj.blocks) ? articleObj.blocks : [],
              }
            : undefined,
        };

        resultData.carContent = carContentObj;
        resultData.text = carContentObj.moTaChung;
      } else {
        throw new Error('Nội dung trả về từ AI không đúng cấu trúc yêu cầu. Vui lòng thử lại.');
      }
      break;
    }

    case 'generate_single_block': {
      const blockJson = parsedJson as ParsedBlockJson | null;
      let blockObj: FullArticleBlock;
      if (blockJson && blockJson.block) {
        blockObj = blockJson.block;
      } else if (blockJson && Array.isArray(blockJson.blocks) && blockJson.blocks[0]) {
        blockObj = blockJson.blocks[0];
      } else if (
        parsedJson &&
        typeof parsedJson === 'object' &&
        ('type' in parsedJson || 'content' in parsedJson || 'title' in parsedJson || 'pros' in parsedJson || 'faqs' in parsedJson || 'prices' in parsedJson)
      ) {
        // AI trả về trực tiếp object khối mà không bọc trong "block"
        blockObj = {
          type: (parsedJson.type as FullArticleBlock['type']) || (prompt as FullArticleBlock['type']) || 'paragraph',
          ...(parsedJson as Record<string, unknown>),
        } as unknown as FullArticleBlock;
      } else {
        // Fallback an toàn tuyệt đối chống crash
        blockObj = {
          type: (prompt as FullArticleBlock['type']) || 'paragraph',
          content: aiContent.trim(),
        };
      }

      const enriched = normalizeAndEnrichBlocks([blockObj], availableCars, targetCar);
      resultData.blocks = enriched;
      resultData.text = enriched[0]?.content || enriched[0]?.title || '';
      break;
    }

    case 'optimize_seo': {
      const seoJson = parsedJson as ParsedSeoJson | null;
      if (seoJson) {
        resultData.seo = {
          metaTitle: String(seoJson.metaTitle || ''),
          metaDescription: String(seoJson.metaDescription || ''),
          suggestedKeywords: Array.isArray(seoJson.suggestedKeywords) ? seoJson.suggestedKeywords : [],
        } as SeoOptimizationResult;
      } else {
        throw new Error('AI không thể tạo dữ liệu tối ưu SEO theo định dạng JSON yêu cầu. Vui lòng thử lại.');
      }
      break;
    }

    case 'generate_topic_ideas': {
      const ideas = normalizeTopicIdeas(parsedJson, targetCar, ctx.existingArticles || []);
      resultData.topicIdeas = ideas;
      resultData.deduplicationCount = ctx.existingArticles?.length || 0;
      resultData.text = `Đã đề xuất thành công ${ideas.length} ý tưởng bài viết độc bản, không trùng lặp.`;
      break;
    }

    default:
      resultData.text = aiContent;
  }

  return resultData;
}
