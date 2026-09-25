import { describe, it, expect } from 'vitest';
import {
  extractHeadingsFromTiptap,
  extractFaqsFromTiptap,
  extractVideosFromTiptap,
  hasGatedContent,
  calculateReadingTimeAndWordCount,
  slugifyVietnamese,
} from '../tiptap/extractor';

describe('Tiptap AST Extractor Suite (Slice 1 Verification)', () => {
  // Mock dữ liệu Tiptap AST mẫu bài viết đánh giá xe Hyundai Tucson 2026
  const sampleTiptapDoc = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Đánh giá ngoại thất Hyundai Tucson 2026' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Hyundai Tucson 2026 sở hữu ngôn ngữ thiết kế Sensuous Sportiness sắc sảo và đậm chất tương lai.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Thiết kế đầu xe và lưới tản nhiệt Parametric' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Đánh giá ngoại thất Hyundai Tucson 2026' }], // Tiêu đề trùng lặp để test deduplication
      },
      {
        type: 'youtubeBlock',
        attrs: {
          videoId: 'dQw4w9WgXcQ',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          caption: 'Video lái thử Tucson 2026 trên cung đường Nghệ An',
        },
      },
      {
        type: 'tikTokBlock',
        attrs: {
          videoId: '71234567890',
          videoUrl: 'https://www.tiktok.com/@hyundaivinh/video/71234567890',
          title: 'Khoảnh khắc giao xe Tucson cho khách hàng tại Vinh',
          posterImageUrl: 'https://cdn.hyundaivinh.vn/poster-tucson.webp',
        },
      },
      {
        type: 'faqBlock',
        attrs: {
          title: 'Câu hỏi thường gặp về Tucson',
          questions: [
            {
              question: 'Hyundai Tucson 2026 có mấy phiên bản?',
              answer: 'Xe được phân phối với 4 phiên bản: Tiêu chuẩn, Đặc biệt, 1.6 Turbo và 2.0 Dầu.',
            },
            {
              question: 'Đại lý Hyundai Vinh có sẵn xe giao ngay không?',
              answer: 'Hiện tại showroom có sẵn đủ màu, hỗ trợ giao xe tận nhà tại Nghệ An và Hà Tĩnh.',
            },
          ],
        },
      },
      {
        type: 'gatedContent',
        attrs: {
          rewardTitle: 'Bảng dự toán chi phí lăn bánh chi tiết từng huyện tại Nghệ An',
          gatedHtml: '<p>Nội dung chi phí trước bạ và biển số chi tiết</p>',
        },
      },
    ],
  };

  describe('slugifyVietnamese', () => {
    it('chuyển đổi tiếng Việt có dấu thành slug URL thân thiện', () => {
      expect(slugifyVietnamese('Đánh giá Hyundai Tucson 2026')).toBe('danh-gia-hyundai-tucson-2026');
      expect(slugifyVietnamese('Bảng Giá Lăn Bánh & Ưu Đãi Tháng 9/2026')).toBe('bang-gia-lan-banh-uu-dai-thang-92026');
      expect(slugifyVietnamese('')).toBe('');
    });
  });

  describe('extractHeadingsFromTiptap', () => {
    it('trích xuất đúng danh sách tiêu đề H2, H3 và khử trùng lặp ID', () => {
      const headings = extractHeadingsFromTiptap(sampleTiptapDoc);
      expect(headings).toHaveLength(3);

      expect(headings[0]).toEqual({
        id: '1-danh-gia-ngoai-that-hyundai-tucson-2026',
        title: '1. Đánh giá ngoại thất Hyundai Tucson 2026',
        level: 2,
      });

      expect(headings[1]).toEqual({
        id: 'thiet-ke-dau-xe-va-luoi-tan-nhiet-parametric',
        title: 'Thiết kế đầu xe và lưới tản nhiệt Parametric',
        level: 3,
      });

      // Tiêu đề trùng lặp phải tự động thêm hậu tố -1
      expect(headings[2].id).toBe('1-danh-gia-ngoai-that-hyundai-tucson-2026-1');
      expect(headings[2].level).toBe(2);
    });

    it('trả về mảng rỗng an toàn khi tài liệu rỗng hoặc không hợp lệ', () => {
      expect(extractHeadingsFromTiptap(null)).toEqual([]);
      expect(extractHeadingsFromTiptap({})).toEqual([]);
      expect(extractHeadingsFromTiptap({ type: 'doc', content: [] })).toEqual([]);
    });
  });

  describe('extractFaqsFromTiptap', () => {
    it('trích xuất đúng danh sách FAQs cho Schema FAQPage', () => {
      const faqs = extractFaqsFromTiptap(sampleTiptapDoc);
      expect(faqs).toHaveLength(2);
      expect(faqs[0].question).toBe('Hyundai Tucson 2026 có mấy phiên bản?');
      expect(faqs[0].answer).toContain('Xe được phân phối với 4 phiên bản');
      expect(faqs[1].question).toBe('Đại lý Hyundai Vinh có sẵn xe giao ngay không?');
    });

    it('trả về mảng rỗng khi không có faqBlock', () => {
      const docWithoutFaq = { type: 'doc', content: [{ type: 'paragraph' }] };
      expect(extractFaqsFromTiptap(docWithoutFaq)).toEqual([]);
    });
  });

  describe('extractVideosFromTiptap', () => {
    it('trích xuất đầy đủ video YouTube và TikTok cho Schema VideoObject', () => {
      const videos = extractVideosFromTiptap(sampleTiptapDoc);
      expect(videos).toHaveLength(2);

      const yt = videos.find((v) => v.type === 'youtube');
      expect(yt).toBeDefined();
      expect(yt?.videoId).toBe('dQw4w9WgXcQ');
      expect(yt?.title).toBe('Video lái thử Tucson 2026 trên cung đường Nghệ An');

      const tt = videos.find((v) => v.type === 'tiktok');
      expect(tt).toBeDefined();
      expect(tt?.videoId).toBe('71234567890');
      expect(tt?.title).toBe('Khoảnh khắc giao xe Tucson cho khách hàng tại Vinh');
      expect(tt?.posterUrl).toBe('https://cdn.hyundaivinh.vn/poster-tucson.webp');
    });
  });

  describe('hasGatedContent', () => {
    it('phát hiện đúng sự hiện diện của Gated Content để tiêm Paywall Schema', () => {
      expect(hasGatedContent(sampleTiptapDoc)).toBe(true);

      const docWithoutGated = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bài viết thông thường' }] }],
      };
      expect(hasGatedContent(docWithoutGated)).toBe(false);
      expect(hasGatedContent(null)).toBe(false);
    });
  });

  describe('calculateReadingTimeAndWordCount', () => {
    it('tính toán số từ và thời gian đọc tối thiểu 1 phút', () => {
      const stats = calculateReadingTimeAndWordCount(sampleTiptapDoc);
      expect(stats.wordCount).toBeGreaterThan(10);
      expect(stats.readingTime).toBeGreaterThanOrEqual(1);

      const emptyStats = calculateReadingTimeAndWordCount(null);
      expect(emptyStats).toEqual({ readingTime: 1, wordCount: 0 });
    });
  });
});
