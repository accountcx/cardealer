import { describe, it, expect } from 'vitest';
import type { StaticPage } from '@cardealer/types';
import {
  extractStepsFromTiptap,
  generateStaticPageJsonLd,
  sanitizeJsonLd,
} from '../index';

describe('Dynamic Static Page Schema.org & Tiptap AST Extraction', () => {
  const basePage: StaticPage = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Quy trình mua xe và giao nhận',
    slug: 'quy-trinh-mua-xe',
    content: {},
    templateType: 'TIMELINE',
    isPublished: true,
    metaTitle: 'Quy trình 5 bước mua xe Hyundai',
    metaDescription: 'Chi tiết các bước từ lái thử đến bàn giao xe',
    canonicalUrl: null,
    ogImage: null,
    noIndex: false,
    schemaType: 'HowTo',
    createdBy: null,
    updatedBy: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-02T00:00:00.000Z',
  };

  const mockDealer = {
    name: 'Showroom Hyundai Dũng Lạc',
    telephone: '0981.234.567',
    address: {
      streetAddress: 'Km 3 Đại lộ Lê Nin, Vinh',
    },
  };

  it('1. should dynamically extract steps from custom timelineStep nodes', () => {
    const docWithTimeline = {
      type: 'doc',
      content: [
        {
          type: 'timelineStep',
          attrs: { title: 'Chọn xe & Lái thử', description: 'Đăng ký lái thử tận nhà' },
        },
        {
          type: 'timelineStep',
          attrs: { title: 'Ký hợp đồng', description: 'Đặt cọc và làm hồ sơ ngân hàng' },
        },
      ],
    };

    const steps = extractStepsFromTiptap(docWithTimeline);
    expect(steps).toHaveLength(2);
    expect(steps[0]?.title).toBe('Chọn xe & Lái thử');
    expect(steps[0]?.description).toBe('Đăng ký lái thử tận nhà');
    expect(steps[0]?.position).toBe(1);
    expect(steps[1]?.position).toBe(2);
  });

  it('2. should extract steps from "Bước X:" headings and following paragraphs', () => {
    const docWithHeadings = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Bước 1: Tư vấn và thẩm định nhu cầu' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Chuyên viên lắng nghe ngân sách và lựa chọn dòng xe phù hợp.' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Bước 2: Giao xe và hoàn thiện biển số' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hỗ trợ bấm biển số đẹp và bàn giao xe tại nhà.' }],
        },
      ],
    };

    const steps = extractStepsFromTiptap(docWithHeadings);
    expect(steps).toHaveLength(2);
    expect(steps[0]?.title).toBe('Bước 1: Tư vấn và thẩm định nhu cầu');
    expect(steps[0]?.description).toContain('Chuyên viên lắng nghe');
    expect(steps[1]?.title).toBe('Bước 2: Giao xe và hoàn thiện biển số');
  });

  it('3. should generate HowTo schema when steps are present', () => {
    const pageWithSteps: StaticPage = {
      ...basePage,
      content: {
        type: 'doc',
        content: [
          {
            type: 'timelineStep',
            attrs: { title: 'Bước 1: Xem xe', description: 'Đến showroom trải nghiệm' },
          },
        ],
      },
    };

    const schema = generateStaticPageJsonLd(pageWithSteps, {
      siteUrl: 'https://xehyundaivinh.com',
      dealer: mockDealer,
    });

    expect(schema['@type']).toBe('HowTo');
    expect(Array.isArray(schema.step)).toBe(true);
    const steps = schema.step as Array<{ '@type': string; name: string }>;
    expect(steps[0]?.['@type']).toBe('HowToStep');
    expect(steps[0]?.name).toBe('Bước 1: Xem xe');
  });

  it('4. should FAIL-SAFE fallback to WebPage if HowTo has no steps in content', () => {
    const emptyPage: StaticPage = {
      ...basePage,
      content: { type: 'doc', content: [] },
      schemaType: 'HowTo',
    };

    const schema = generateStaticPageJsonLd(emptyPage, { siteUrl: 'https://xehyundaivinh.com' });
    expect(schema['@type']).toBe('WebPage');
    expect(schema.step).toBeUndefined();
  });

  it('5. should generate FAQPage schema from faqBlock and fallback if empty', () => {
    const pageWithFaq: StaticPage = {
      ...basePage,
      schemaType: 'FAQPage',
      content: {
        type: 'doc',
        content: [
          {
            type: 'faqBlock',
            attrs: {
              questions: [
                { question: 'Có hỗ trợ trả góp 85% không?', answer: 'Có, xét duyệt hồ sơ trong 24h.' },
              ],
            },
          },
        ],
      },
    };

    const schema = generateStaticPageJsonLd(pageWithFaq, { siteUrl: 'https://xehyundaivinh.com' });
    expect(schema['@type']).toBe('FAQPage');
    expect(Array.isArray(schema.mainEntity)).toBe(true);

    const emptyFaqPage: StaticPage = {
      ...basePage,
      schemaType: 'FAQPage',
      content: { type: 'doc', content: [] },
    };
    const fallbackSchema = generateStaticPageJsonLd(emptyFaqPage, { siteUrl: 'https://xehyundaivinh.com' });
    expect(fallbackSchema['@type']).toBe('WebPage');
    expect(fallbackSchema.mainEntity).toBeUndefined();
  });

  it('6. should populate real AutoDealer info for AboutPage, ContactPage, FinancialProduct', () => {
    const aboutPage: StaticPage = { ...basePage, schemaType: 'AboutPage' };
    const schema = generateStaticPageJsonLd(aboutPage, {
      siteUrl: 'https://xehyundaivinh.com',
      dealer: mockDealer,
    });

    expect(schema['@type']).toBe('AboutPage');
    const mainEntity = schema.mainEntity as { '@type': string; name: string; telephone: string };
    expect(mainEntity['@type']).toBe('AutoDealer');
    expect(mainEntity.name).toBe('Showroom Hyundai Dũng Lạc');
    expect(mainEntity.telephone).toBe('0981.234.567');
  });

  it('7. should sanitize JSON-LD string to prevent XSS script tag injection (CWE-79)', () => {
    const maliciousData = {
      title: '</script><script>alert("XSS")</script>',
      content: 'Thử nghiệm ký tự < và >',
    };

    const sanitized = sanitizeJsonLd(maliciousData);
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).toContain('\\u003c/script>');
    expect(sanitized).toContain('\\u003cscript>');
  });

  it('8. should extract VideoObject schema dynamically when youtube/tiktok blocks exist in content', () => {
    const pageWithVideo: StaticPage = {
      ...basePage,
      schemaType: 'WebPage',
      content: {
        type: 'doc',
        content: [
          {
            type: 'youtubeBlock',
            attrs: {
              videoId: 'dQw4w9WgXcQ',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              caption: 'Video giới thiệu showroom',
            },
          },
        ],
      },
    };

    const schema = generateStaticPageJsonLd(pageWithVideo, {
      siteUrl: 'https://xehyundaivinh.com',
      dealer: mockDealer,
    });

    expect(schema['@type']).toBe('WebPage');
    expect(Array.isArray(schema.video)).toBe(true);
    const videos = schema.video as Array<{ '@type': string; name: string; embedUrl: string }>;
    expect(videos[0]?.['@type']).toBe('VideoObject');
    expect(videos[0]?.name).toBe('Video giới thiệu showroom');
    expect(videos[0]?.embedUrl).toContain('dQw4w9WgXcQ');
  });
});
