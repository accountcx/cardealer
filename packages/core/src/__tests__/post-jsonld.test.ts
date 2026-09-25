import { describe, it, expect } from 'vitest';
import {
  generateAutoDealerSchema,
  generatePostBreadcrumbSchema,
  generatePaywallSchema,
  generateFaqSchema,
  generateVideoSchema,
  generateNewsArticleSchema,
  generatePostMasterJsonLd,
  sanitizeCanonicalBaseUrl,
  resolveAvailability,
  type PostForJsonLd,
} from '../seo/json-ld';

describe('Step 3.2: Multi-Tier Post Schema JSON-LD Generator', () => {
  const mockPost: PostForJsonLd = {
    id: 'post-santafe-review',
    tieuDe: 'Đánh Giá Chi Tiết Hyundai Santa Fe 2026: Đột Phá Thiết Kế & Công Nghệ',
    slug: 'danh-gia-hyundai-santa-fe-2026',
    anhDaiDienUrl: 'https://xehyundaivinh.com/images/posts/santafe-2026.webp',
    anhDaiDienAlt: 'Hyundai Santa Fe 2026 màu đen tại đại lý Hyundai Vinh',
    tomTat: 'Đánh giá toàn diện Hyundai Santa Fe 2026 về thiết kế, nội thất, động cơ và giá lăn bánh tại Nghệ An.',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-02T10:30:00.000Z',
    publishedAt: '2026-03-01T09:00:00.000Z',
    category: {
      id: 'cat-danh-gia',
      name: 'Đánh Giá Xe',
      slug: 'danh-gia-xe',
    },
    author: {
      id: 'author-chuyen-gia',
      name: 'Nguyễn Văn Hùng',
      jobTitle: 'Trưởng nhóm Tư vấn Bán hàng & Chuyên gia Hyundai',
      avatarUrl: 'https://xehyundaivinh.com/images/authors/hung-nguyen.webp',
      url: 'https://xehyundaivinh.com/tac-gia/nguyen-van-hung',
      phone: '0942.391.222',
    },
    noiDung: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hyundai Santa Fe 2026 mang đến diện mạo vuông vức hoàn toàn mới...' }],
        },
        {
          type: 'youtubeBlock',
          attrs: {
            videoId: 'dQw4w9WgXcQ',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            caption: 'Video trải nghiệm thực tế Santa Fe 2026 trên cung đường Tây Bắc',
          },
        },
        {
          type: 'tikTokBlock',
          attrs: {
            videoId: '7123456789012345678',
            videoUrl: 'https://www.tiktok.com/@hyundai/video/7123456789012345678',
            title: 'Chi tiết cần số điện tử dạng xoay trên Santa Fe 2026',
            posterImageUrl: 'https://xehyundaivinh.com/images/tiktok/santafe-gear.webp',
          },
        },
        {
          type: 'faqBlock',
          attrs: {
            questions: [
              {
                question: 'Hyundai Santa Fe 2026 có mấy phiên bản?',
                answer: 'Santa Fe 2026 được phân phối với 5 phiên bản: Exclusive, Prestige và Calligraphy.',
              },
              {
                question: 'Giá lăn bánh Santa Fe 2026 tại Nghệ An là bao nhiêu?',
                answer: 'Giá lăn bánh dự kiến từ 1,180 tỷ đến 1,520 tỷ đồng tùy từng phiên bản.',
              },
            ],
          },
        },
        {
          type: 'gatedContent',
          attrs: {
            badgeText: 'Nội dung độc quyền',
            title: 'Tải Bảng Dự Toán Chi Phí Lăn Bánh Chi Tiết Từng Huyện Tại Nghệ An',
            description: 'Để lại SĐT/Zalo nhận ngay file Excel dự toán lăn bánh trong 5 phút.',
          },
        },
      ],
    },
  };

  describe('Canonical Domain Guard', () => {
    it('should fallback localhost or empty siteUrl to official domain https://xehyundaivinh.com', () => {
      expect(sanitizeCanonicalBaseUrl('')).toBe('https://xehyundaivinh.com');
      expect(sanitizeCanonicalBaseUrl('http://localhost:3000')).toBe('https://xehyundaivinh.com');
      expect(sanitizeCanonicalBaseUrl('http://127.0.0.1:4000/')).toBe('https://xehyundaivinh.com');
    });

    it('should preserve valid custom domains and strip trailing slash', () => {
      expect(sanitizeCanonicalBaseUrl('https://xehyundaivinh.com/')).toBe('https://xehyundaivinh.com');
      expect(sanitizeCanonicalBaseUrl('https://hyundaidunglac.vn')).toBe('https://hyundaidunglac.vn');
    });
  });

  describe('generateAutoDealerSchema()', () => {
    it('should generate valid AutoDealer schema with correct default showroom data', () => {
      const dealer = generateAutoDealerSchema('https://xehyundaivinh.com');

      expect(dealer['@type']).toBe('AutoDealer');
      expect(dealer['@id']).toBe('https://xehyundaivinh.com/#autodealer');
      expect(dealer.name).toContain('Hyundai Dũng Lạc');
      expect(dealer.legalName).toBe('Công ty Cổ phần Thương mại Dũng Lạc');
      expect(dealer.telephone).toBe('0942.391.222');
      expect(dealer.address['@type']).toBe('PostalAddress');
      expect(dealer.address.addressLocality).toBe('Thành phố Vinh');
      expect(dealer.address.addressRegion).toBe('Nghệ An');
      expect(dealer.geo['@type']).toBe('GeoCoordinates');
      expect(dealer.geo.latitude).toBeCloseTo(18.698342);
      expect(dealer.openingHoursSpecification).toBeInstanceOf(Array);
    });

    it('should allow overriding dealer attributes via customDealer parameter', () => {
      const dealer = generateAutoDealerSchema('https://xehyundaivinh.com', {
        name: 'Hyundai Hà Tĩnh - Chi nhánh Dũng Lạc',
        telephone: '0912.345.678',
        address: {
          streetAddress: 'Trần Phú, TP Hà Tĩnh',
          addressLocality: 'Thành phố Hà Tĩnh',
          addressRegion: 'Hà Tĩnh',
        },
      });

      expect(dealer.name).toBe('Hyundai Hà Tĩnh - Chi nhánh Dũng Lạc');
      expect(dealer.telephone).toBe('0912.345.678');
      expect(dealer.address.addressLocality).toBe('Thành phố Hà Tĩnh');
    });
  });

  describe('generatePostBreadcrumbSchema()', () => {
    it('should generate 4-tier breadcrumbs when category is present', () => {
      const breadcrumb = generatePostBreadcrumbSchema(mockPost, 'https://xehyundaivinh.com', mockPost.category);

      expect(breadcrumb['@type']).toBe('BreadcrumbList');
      expect(breadcrumb['@id']).toBe('https://xehyundaivinh.com/tin-tuc/danh-gia-hyundai-santa-fe-2026#breadcrumb');
      expect(breadcrumb.itemListElement).toHaveLength(4);
      expect(breadcrumb.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: 'https://xehyundaivinh.com',
      });
      expect(breadcrumb.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Tin tức & Khuyến Mãi',
        item: 'https://xehyundaivinh.com/tin-tuc',
      });
      expect(breadcrumb.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Đánh Giá Xe',
        item: 'https://xehyundaivinh.com/tin-tuc/danh-muc/danh-gia-xe',
      });
      expect(breadcrumb.itemListElement[3]).toEqual({
        '@type': 'ListItem',
        position: 4,
        name: mockPost.tieuDe,
        item: 'https://xehyundaivinh.com/tin-tuc/danh-gia-hyundai-santa-fe-2026',
      });
    });

    it('should generate 3-tier breadcrumbs when category is omitted', () => {
      const breadcrumb = generatePostBreadcrumbSchema(mockPost, 'https://xehyundaivinh.com', null);

      expect(breadcrumb.itemListElement).toHaveLength(3);
      expect(breadcrumb.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: mockPost.tieuDe,
        item: 'https://xehyundaivinh.com/tin-tuc/danh-gia-hyundai-santa-fe-2026',
      });
    });
  });

  describe('generatePaywallSchema()', () => {
    it('should return isAccessibleForFree: false and CSS selector when GatedContent is present', () => {
      const paywall = generatePaywallSchema(mockPost.noiDung);

      expect(paywall.isAccessibleForFree).toBe(false);
      expect(paywall.hasPart).toBeDefined();
      expect(paywall.hasPart?.['@type']).toBe('WebPageElement');
      expect(paywall.hasPart?.isAccessibleForFree).toBe(false);
      expect(paywall.hasPart?.cssSelector).toBe('.gated-content-section');
    });

    it('should return isAccessibleForFree: true without hasPart when post has no GatedContent', () => {
      const regularDoc = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Nội dung miễn phí hoàn toàn.' }] },
        ],
      };
      const paywall = generatePaywallSchema(regularDoc);

      expect(paywall.isAccessibleForFree).toBe(true);
      expect(paywall.hasPart).toBeUndefined();
    });
  });

  describe('generateFaqSchema()', () => {
    it('should return valid FAQPage schema from extracted faqs', () => {
      const faqs = [
        { question: 'Bảo hành mấy năm?', answer: '5 năm hoặc 100.000km.' },
        { question: 'Có hỗ trợ trả góp không?', answer: 'Hỗ trợ vay đến 85% giá trị xe.' },
      ];
      const faqSchema = generateFaqSchema(faqs);

      expect(faqSchema).not.toBeNull();
      expect(faqSchema?.['@type']).toBe('FAQPage');
      expect(faqSchema?.mainEntity).toHaveLength(2);
      expect(faqSchema?.mainEntity[0]).toEqual({
        '@type': 'Question',
        name: 'Bảo hành mấy năm?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '5 năm hoặc 100.000km.',
        },
      });
    });

    it('should return null when faqs array is empty', () => {
      expect(generateFaqSchema([])).toBeNull();
    });
  });

  describe('generateVideoSchema()', () => {
    it('should return VideoObject schemas for both YouTube and TikTok videos', () => {
      const videos = [
        {
          type: 'youtube' as const,
          videoId: 'dQw4w9WgXcQ',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'Review Santa Fe 2026',
        },
        {
          type: 'tiktok' as const,
          videoId: '7123456789012345678',
          url: 'https://www.tiktok.com/@hyundai/video/7123456789012345678',
          title: 'Nội thất sang trọng',
          posterUrl: 'https://xehyundaivinh.com/images/tiktok.webp',
        },
      ];

      const schemas = generateVideoSchema(videos, 'https://xehyundaivinh.com', '2026-03-01T09:00:00Z');

      expect(schemas).toHaveLength(2);
      // Check YouTube
      expect(schemas[0]['@type']).toBe('VideoObject');
      expect(schemas[0].name).toBe('Review Santa Fe 2026');
      expect(schemas[0].thumbnailUrl[0]).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
      expect(schemas[0].embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');

      // Check TikTok
      expect(schemas[1]['@type']).toBe('VideoObject');
      expect(schemas[1].thumbnailUrl[0]).toBe('https://xehyundaivinh.com/images/tiktok.webp');
    });

    it('should return empty array when videos list is empty', () => {
      expect(generateVideoSchema([], 'https://xehyundaivinh.com')).toEqual([]);
    });
  });

  describe('generateNewsArticleSchema()', () => {
    it('should generate complete NewsArticle schema matching Google specifications', () => {
      const article = generateNewsArticleSchema(mockPost, 'https://xehyundaivinh.com');

      expect(article['@type']).toBe('NewsArticle');
      expect(article['@id']).toBe('https://xehyundaivinh.com/tin-tuc/danh-gia-hyundai-santa-fe-2026#article');
      expect(article.headline).toBe(mockPost.tieuDe);
      expect(article.description).toBe(mockPost.tomTat);
      expect(article.image).toEqual([mockPost.anhDaiDienUrl]);
      expect(article.datePublished).toBe('2026-03-01T09:00:00.000Z');
      expect(article.dateModified).toBe('2026-03-02T10:30:00.000Z');
      expect(article.inLanguage).toBe('vi-VN');
      expect(article.articleSection).toBe('Đánh Giá Xe');

      // Check Author (E-E-A-T Person)
      const author = article.author as any;
      expect(author['@type']).toBe('Person');
      expect(author.name).toBe('Nguyễn Văn Hùng');
      expect(author.jobTitle).toContain('Chuyên gia');
      expect(author.worksFor['@id']).toBe('https://xehyundaivinh.com/#autodealer');

      // Check Paywall properties integrated into Article
      expect(article.isAccessibleForFree).toBe(false);
      expect(article.hasPart).toBeDefined();
    });
  });

  describe('generatePostMasterJsonLd()', () => {
    it('should combine all sub-schemas into a single coherent @graph structure', () => {
      const master = generatePostMasterJsonLd(mockPost, 'https://xehyundaivinh.com');

      expect(master['@context']).toBe('https://schema.org');
      expect(master['@graph']).toBeInstanceOf(Array);

      const graphTypes = master['@graph'].map((item) => (item as any)['@type']);

      // Kiểm tra có đủ các thực thể cốt lõi: AutoDealer, NewsArticle, BreadcrumbList, FAQPage, VideoObject
      expect(graphTypes).toContain('AutoDealer');
      expect(graphTypes).toContain('NewsArticle');
      expect(graphTypes).toContain('BreadcrumbList');
      expect(graphTypes).toContain('FAQPage');
      expect(graphTypes).toContain('VideoObject');

      // Kiểm tra thực thể FAQPage trong graph có đúng 2 câu hỏi từ Tiptap AST
      const faqEntity = master['@graph'].find((item) => (item as any)['@type'] === 'FAQPage') as any;
      expect(faqEntity.mainEntity).toHaveLength(2);
      expect(faqEntity.mainEntity[0].name).toBe('Hyundai Santa Fe 2026 có mấy phiên bản?');

      // Kiểm tra thực thể VideoObject có 2 videos (YouTube + TikTok)
      const videoEntities = master['@graph'].filter((item) => (item as any)['@type'] === 'VideoObject');
      expect(videoEntities).toHaveLength(2);
    });
  });

  describe('resolveAvailability()', () => {
    it('should return Discontinued for draft or archived cars', () => {
      expect(resolveAvailability({ status: 'draft' })).toBe('https://schema.org/Discontinued');
      expect(resolveAvailability({ status: 'archived' })).toBe('https://schema.org/Discontinued');
    });

    it('should return OutOfStock when isAvailable is false', () => {
      expect(resolveAvailability({ isAvailable: false })).toBe('https://schema.org/OutOfStock');
    });

    it('should return PreOrder when isPreOrder is true', () => {
      expect(resolveAvailability({ isPreOrder: true })).toBe('https://schema.org/PreOrder');
    });

    it('should default to InStock for active commercial cars', () => {
      expect(resolveAvailability({ status: 'published' })).toBe('https://schema.org/InStock');
      expect(resolveAvailability({})).toBe('https://schema.org/InStock');
    });
  });

  describe('VideoObject with ISO 8601 Duration & Custom Upload Date', () => {
    it('should include duration and prioritize video uploadDate', () => {
      const videos = [
        {
          type: 'youtube' as const,
          videoId: 'abc123xyz',
          url: 'https://www.youtube.com/watch?v=abc123xyz',
          title: 'Review Ioniq 5',
          duration: 'PT5M30S',
          uploadDate: '2025-10-15T12:00:00.000Z',
        },
      ];

      const schemas = generateVideoSchema(videos, 'https://xehyundaivinh.com', '2026-03-01T09:00:00Z');
      expect(schemas[0].duration).toBe('PT5M30S');
      expect(schemas[0].uploadDate).toBe('2025-10-15T12:00:00.000Z');
    });
  });
});

