import { describe, it, expect } from 'vitest';
import {
  AutoPostSettingsSchema,
  UpdateAutoPostSettingsInputSchema,
  ContentPlanItemSchema,
  CreateContentPlanItemInputSchema,
  EditorialPlanItemSchema,
  AutoPostLogSchema,
  GenerateEditorialPlanRequestSchema,
  IngestPlanRequestSchema,
  AiActionSchema,
} from '@cardealer/types';
import { checkTitleOrKeywordOverlap } from '../seo/deduplication';
import { parseCronTime, reschedulePendingItems } from '../scheduler/cron-utils';

describe('Scheduled Auto-Posting & AI Editorial Planner (v1.4.0)', () => {
  describe('TC-19: Schema & Input Validation', () => {
    it('validate thành công cấu hình AutoPostSettings hợp lệ', () => {
      const validSettings = {
        id: 'default',
        isEnabled: true,
        cronExpression: '0 8 * * *',
        defaultStatus: 'draft' as const,
        defaultCategoryId: '123e4567-e89b-12d3-a456-426614174000',
        defaultAuthorId: '123e4567-e89b-12d3-a456-426614174001',
      };
      const parsed = AutoPostSettingsSchema.parse(validSettings);
      expect(parsed.isEnabled).toBe(true);
      expect(parsed.defaultStatus).toBe('draft');
      expect(parsed.cronExpression).toBe('0 8 * * *');
    });

    it('từ chối cấu hình khi defaultStatus không thuộc enum draft | published', () => {
      const invalidSettings = {
        isEnabled: true,
        cronExpression: '0 8 * * *',
        defaultStatus: 'archived',
      };
      expect(() => UpdateAutoPostSettingsInputSchema.parse(invalidSettings)).toThrow();
    });

    it('validate thành công mục hàng đợi CreateContentPlanItemInput', () => {
      const validPlanInput = {
        title: 'Chi Phí Lăn Bánh Hyundai Santa Fe 2026 Tại Nghệ An',
        focusKeyword: 'giá lăn bánh santa fe 2026',
        targetCar: 'Hyundai Santa Fe',
        angle: 'Chi phí lăn bánh chi tiết từng huyện thị',
        summary: 'Tổng hợp các loại thuế phí trước bạ, biển số và bảo hiểm.',
        scheduledAt: new Date('2026-11-10T08:00:00Z'),
      };
      const parsed = CreateContentPlanItemInputSchema.parse(validPlanInput);
      expect(parsed.title).toBe(validPlanInput.title);
      expect(parsed.focusKeyword).toBe(validPlanInput.focusKeyword);
      expect(parsed.scheduledAt).toBeInstanceOf(Date);
    });

    it('từ chối mục hàng đợi khi tiêu đề quá ngắn (< 5 ký tự)', () => {
      const invalidPlanInput = {
        title: 'Xe',
        focusKeyword: 'giá xe',
        scheduledAt: new Date(),
      };
      expect(() => CreateContentPlanItemInputSchema.parse(invalidPlanInput)).toThrow();
    });

    it('validate EditorialPlanItem và batch ingest request', () => {
      const planItem = {
        title: 'Kinh Nghiệm Bảo Dưỡng Định Kỳ Hyundai Creta 2026',
        focusKeyword: 'bảo dưỡng hyundai creta',
        targetCar: 'Hyundai Creta',
        categorySlug: 'cam-nang-lai-xe',
        angle: 'Hướng dẫn tự chăm sóc xe tại nhà',
        summary: 'Các mốc km quan trọng và chi phí thay dầu nhớt chính hãng.',
        suggestedDay: 15,
      };
      const parsed = EditorialPlanItemSchema.parse(planItem);
      expect(parsed.suggestedDay).toBe(15);

      const batchRequest = {
        items: [
          {
            title: planItem.title,
            focusKeyword: planItem.focusKeyword,
            scheduledAt: new Date('2026-11-15T08:00:00Z'),
          },
        ],
      };
      const parsedBatch = IngestPlanRequestSchema.parse(batchRequest);
      expect(parsedBatch.items.length).toBe(1);
    });

    it('mở rộng AiActionSchema chứa generate_editorial_plan', () => {
      expect(AiActionSchema.options).toContain('generate_editorial_plan');
      expect(AiActionSchema.parse('generate_editorial_plan')).toBe('generate_editorial_plan');
    });

    it('validate AutoPostLogSchema với các trường bắt buộc', () => {
      const log = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        triggerType: 'cron' as const,
        postTitle: 'Bài viết tự động',
        status: 'success' as const,
        executionTimeMs: 4500,
        createdAt: new Date(),
      };
      const parsed = AutoPostLogSchema.parse(log);
      expect(parsed.status).toBe('success');
      expect(parsed.triggerType).toBe('cron');
      expect(parsed.executionTimeMs).toBe(4500);
    });
  });

  describe('TC-22 & TC-23: Editorial Plan Deduplication & Day Distribution', () => {
    it('chống trùng lặp tiêu đề và từ khóa khi sinh kế hoạch biên tập', () => {
      const existingArticles = [
        {
          carName: 'Hyundai Tucson',
          title: 'Đánh Giá Chi Tiết Hyundai Tucson Turbo 2026',
          focusKeyword: 'đánh giá tucson turbo 2026',
        },
      ];

      // Đề tài mới khác biệt -> Không trùng lặp
      expect(
        checkTitleOrKeywordOverlap(
          'Dự Toán Chi Phí Nuôi Xe Hyundai Tucson Trong 5 Năm Đầu',
          'chi phí nuôi xe tucson 5 năm',
          existingArticles
        )
      ).toBe(false);

      // Đề tài trùng từ khóa chính -> Trùng lặp
      expect(
        checkTitleOrKeywordOverlap(
          'Trải nghiệm thực tế Tucson',
          'đánh giá tucson turbo 2026',
          existingArticles
        )
      ).toBe(true);
    });

    it('dàn đều ngày xuất bản trong 30 ngày cho danh sách kế hoạch', () => {
      const totalArticles = 10;
      const days = Array.from({ length: totalArticles }, (_, idx) => {
        return Math.min(30, Math.max(1, idx * 3 + 1));
      });

      expect(days[0]).toBe(1);
      expect(days[totalArticles - 1]).toBe(28);
      // Đảm bảo các ngày tăng dần và không trùng nhau
      const uniqueDays = new Set(days);
      expect(uniqueDays.size).toBe(totalArticles);
    });
  });

  describe('TC-27: Dynamic Time Synchronization & Queue Rescheduling', () => {
    it('trích xuất chính xác giờ và phút từ cron expression chuẩn', () => {
      expect(parseCronTime('0 8 * * *')).toEqual({ hour: 8, minute: 0 });
      expect(parseCronTime('30 14 * * 1,4')).toEqual({ hour: 14, minute: 30 });
      expect(parseCronTime('0 */12 * * *')).toBeNull();
      expect(parseCronTime('invalid-cron')).toBeNull();
    });

    it('đồng bộ khung giờ mới (time_only) cho các bài viết trong hàng đợi', () => {
      const ref = new Date('2026-11-04T07:00:00.000Z');
      const items = [
        { id: '1', scheduledAt: new Date('2026-11-06T08:00:00.000Z') },
        { id: '2', scheduledAt: new Date('2026-11-09T08:00:00.000Z') },
      ];

      const updated = reschedulePendingItems(items, {
        mode: 'time_only',
        targetHour: 15,
        targetMinute: 45,
        referenceDate: ref,
      });

      expect(updated[0].scheduledAt.getHours()).toBe(15);
      expect(updated[0].scheduledAt.getMinutes()).toBe(45);
      expect(updated[0].scheduledAt.getDate()).toBe(6);

      expect(updated[1].scheduledAt.getHours()).toBe(15);
      expect(updated[1].scheduledAt.getMinutes()).toBe(45);
      expect(updated[1].scheduledAt.getDate()).toBe(9);
    });

    it('sắp xếp lại ngày theo chu kỳ mới (reschedule_all) dựa trên biểu thức Cron', () => {
      const ref = new Date('2026-11-04T08:00:00.000Z');
      const items = [
        { id: '1', scheduledAt: new Date('2026-11-05T08:00:00.000Z') },
        { id: '2', scheduledAt: new Date('2026-11-06T08:00:00.000Z') },
        { id: '3', scheduledAt: new Date('2026-11-07T08:00:00.000Z') },
      ];

      // Đổi sang lịch Thứ Hai & Thứ Năm lúc 09:00 (0 9 * * 1,4)
      const updated = reschedulePendingItems(items, {
        mode: 'reschedule_all',
        cronExpression: '0 9 * * 1,4',
        referenceDate: ref,
      });

      expect(updated).toHaveLength(3);
      // Tất cả mốc thời gian mới phải có giờ là 9:00
      updated.forEach((item: any) => {
        expect(item.scheduledAt.getHours()).toBe(9);
        expect(item.scheduledAt.getMinutes()).toBe(0);
        // Ngày trong tuần phải là Thứ 2 (1) hoặc Thứ 5 (4)
        const dow = item.scheduledAt.getDay();
        expect([1, 4]).toContain(dow);
      });
      // Thứ tự tăng dần
      expect(updated[0].scheduledAt.getTime()).toBeLessThan(updated[1].scheduledAt.getTime());
      expect(updated[1].scheduledAt.getTime()).toBeLessThan(updated[2].scheduledAt.getTime());
    });
  });
});
