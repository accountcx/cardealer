import { describe, it, expect } from 'vitest';
import {
  calculateKeywordSimilarity,
  checkTitleOrKeywordOverlap,
  formatExistingArticlesBlacklist,
} from '../seo/deduplication';
import {
  AiActionSchema,
  AiGenerateRequestSchema,
  TopicIdeaItemSchema,
  type TopicIdeaItem,
} from '@cardealer/types';

describe('AI Topic Ideation & Deduplication Engine (US-05)', () => {
  describe('TC-15: Keyword Similarity & Deduplication Algorithms', () => {
    it('tính toán độ tương đồng Jaccard chính xác giữa hai chuỗi từ khóa', () => {
      // 1. Trùng lặp hoàn toàn
      expect(calculateKeywordSimilarity('giá xe santa fe 2026', 'giá xe santa fe 2026')).toBe(1);

      // 2. Trùng lặp từ khóa cao (3/4 từ trùng nhau)
      const simHigh = calculateKeywordSimilarity('đánh giá xe hyundai santa fe', 'đánh giá santa fe 2026');
      expect(simHigh).toBeGreaterThan(0.4);

      // 3. Khác biệt hoàn toàn
      const simZero = calculateKeywordSimilarity('bảng giá hyundai accent lăn bánh', 'hướng dẫn lái xe an toàn mùa mưa');
      expect(simZero).toBe(0);
    });

    it('phát hiện trùng lặp chính xác khi tiêu đề hoặc từ khóa đã tồn tại trong database', () => {
      const existingArticles = [
        {
          carName: 'Hyundai Santa Fe',
          title: 'Đánh Giá Chi Tiết Hyundai Santa Fe 2026 Toàn Diện',
          focusKeyword: 'đánh giá hyundai santa fe 2026',
        },
        {
          carName: 'Hyundai Tucson',
          title: 'Bảng Giá Xe Hyundai Tucson Lăn Bánh Tại Vinh',
          focusKeyword: 'giá lăn bánh tucson',
        },
      ];

      // Case 1: Tiêu đề trùng lặp y hệt hoặc chứa tiêu đề cũ
      expect(
        checkTitleOrKeywordOverlap(
          'Đánh Giá Chi Tiết Hyundai Santa Fe 2026 Toàn Diện',
          'santa fe mới nhất',
          existingArticles
        )
      ).toBe(true);

      // Case 2: Từ khóa chính trùng lặp y hệt
      expect(
        checkTitleOrKeywordOverlap(
          'Trải nghiệm thực tế xe Santa Fe',
          'đánh giá hyundai santa fe 2026',
          existingArticles
        )
      ).toBe(true);

      // Case 3: Từ khóa ăn thịt (Cannibalization Overlap >= 60%)
      expect(
        checkTitleOrKeywordOverlap(
          'Khảo sát giá lăn bánh Tucson mới',
          'giá lăn bánh tucson tại nghệ an',
          existingArticles
        )
      ).toBe(true);

      // Case 4: Ý tưởng hoàn toàn mới mẻ, khai thác Content Gap (Phải PASS)
      expect(
        checkTitleOrKeywordOverlap(
          'Dự Toán Chi Phí Bảo Dưỡng Santa Fe 2026 Sau 5 Năm Chi Tiết',
          'chi phí bảo dưỡng santa fe 5 năm',
          existingArticles
        )
      ).toBe(false);

      expect(
        checkTitleOrKeywordOverlap(
          'Kinh Nghiệm Lái Hyundai Creta Vượt Mùa Mưa Ngập Lụt Tại Vinh',
          'lái creta mùa ngập nước',
          existingArticles
        )
      ).toBe(false);
    });
  });

  describe('TC-16: Negative Grounding Blacklist Prompt Formatting', () => {
    it('định dạng danh sách bài viết hiện có thành chuỗi cấm trùng lặp rõ ràng', () => {
      const existingArticles = [
        {
          carName: 'Hyundai Accent',
          title: 'Bảng Giá Lăn Bánh Hyundai Accent 2026 Mới Nhất',
          focusKeyword: 'giá lăn bánh accent 2026',
        },
        {
          carName: 'Hyundai Creta',
          title: 'Đánh Giá Xe Hyundai Creta Bản Cao Cấp',
          focusKeyword: 'đánh giá creta cao cấp',
        },
      ];

      const formatted = formatExistingArticlesBlacklist(existingArticles);

      expect(formatted).toContain('DANH SÁCH 2 BÀI VIẾT ĐÃ TỒN TẠI TRONG CƠ SỞ DỮ LIỆU');
      expect(formatted).toContain('Bảng Giá Lăn Bánh Hyundai Accent 2026 Mới Nhất');
      expect(formatted).toContain('giá lăn bánh accent 2026');
      expect(formatted).toContain('TUYỆT ĐỐI KHÔNG chọn từ khóa chính (focusKeyword)');
      expect(formatted).toContain('contentGap');
    });

    it('xử lý an toàn khi danh sách bài viết rỗng', () => {
      const formatted = formatExistingArticlesBlacklist([]);
      expect(formatted).toContain('Hệ thống hiện chưa có bài viết nào được lưu');
    });
  });

  describe('TC-17: Schemas & Data Contracts for Topic Ideation', () => {
    it('AiActionSchema chấp nhận action generate_topic_ideas', () => {
      expect(AiActionSchema.parse('generate_topic_ideas')).toBe('generate_topic_ideas');
    });

    it('AiGenerateRequestSchema chấp nhận các tham số mở rộng angle, category, ideasCount', () => {
      const req = AiGenerateRequestSchema.parse({
        action: 'generate_topic_ideas',
        prompt: 'Gợi ý các chủ đề bài viết thực tế cho khách hàng mua xe lần đầu',
        carModel: 'Hyundai Santa Fe',
        category: 'Đánh giá xe',
        angle: 'Chi phí bảo dưỡng & Vận hành thực tế',
        ideasCount: 4,
      });

      expect(req.action).toBe('generate_topic_ideas');
      expect(req.angle).toBe('Chi phí bảo dưỡng & Vận hành thực tế');
      expect(req.category).toBe('Đánh giá xe');
      expect(req.ideasCount).toBe(4);
    });

    it('TopicIdeaItemSchema xác thực đối tượng ý tưởng bài viết đầy đủ', () => {
      const validIdea: TopicIdeaItem = {
        title: 'Dự Toán Chi Phí Nuôi Xe Hyundai Santa Fe 2026 Sau 5 Năm: Chi Tiết',
        slug: 'du-toan-chi-phi-nuoi-xe-santa-fe-5-nam',
        focusKeyword: 'chi phí nuôi xe santa fe 5 năm',
        angle: 'Chi phí vận hành & Khấu hao thực tế',
        contentGap: 'Website đã có bài giá bán lăn bánh nhưng chưa có bài tính tổng chi phí nhiên liệu và bảo dưỡng dài hạn',
        summary: 'Phân tích cụ thể chi phí xăng, bảo dưỡng định kỳ các mốc và bảo hiểm giúp người mua an tâm tài chính.',
        targetCar: 'Hyundai Santa Fe',
        suggestedCategory: 'Tư vấn mua xe',
        outlinePreview: [
          '1. Các khoản chi phí cố định hàng năm',
          '2. Mức tiêu hao nhiên liệu thực tế đường hỗn hợp',
          '3. Lịch trình và bảng giá bảo dưỡng chính hãng',
        ],
        searchIntent: 'commercial',
      };

      const parsed = TopicIdeaItemSchema.parse(validIdea);
      expect(parsed.title).toBe(validIdea.title);
      expect(parsed.focusKeyword).toBe('chi phí nuôi xe santa fe 5 năm');
      expect(parsed.searchIntent).toBe('commercial');
    });

    it('TopicIdeaItemSchema từ chối ý tưởng thiếu các trường bắt buộc', () => {
      const invalidIdea = {
        title: 'Ngắn', // < 5 ký tự
        slug: 'a',
      };

      const result = TopicIdeaItemSchema.safeParse(invalidIdea);
      expect(result.success).toBe(false);
    });
  });
});
