import type { StaticPage } from '@cardealer/types';
import { extractFaqsFromTiptap, extractVideosFromTiptap } from '../tiptap/extractor';
import { extractStepsFromTiptap } from '../tiptap/steps-extractor';
import {
  generateAutoDealerSchema,
  generateVideoSchema,
  sanitizeCanonicalBaseUrl,
  type AutoDealerInfo,
} from './json-ld';

export interface StaticPageJsonLdOptions {
  siteUrl?: string;
  dealer?: AutoDealerInfo;
}

// WHY: Phòng chống tấn công XSS Script Injection qua thẻ script JSON-LD (CWE-79).
// Ký tự '<' được escape thành '\\u003c' để trình duyệt không thể đóng thẻ <script> sớm và chèn mã độc.
export function sanitizeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// WHY: Bộ phân giải dữ liệu có cấu trúc Schema.org động thực thụ cho Trang Tĩnh (@cardealer/core).
// Khắc phục triệt để các rủi ro Google SEO:
// 1. Zero-Hardcode & Zero-Fallback: Tuyệt đối không sinh dữ liệu giả lập bịa đặt.
// 2. Dynamic AST Extraction: Bóc tách FAQs từ faqBlock, Steps từ timelineStep/Headings, Videos từ youtube/tiktok.
// 3. Fail-Safe Schema Fallback: Nếu bài viết không chứa FAQs hoặc Steps, tự động fallback về WebPage
//    để tránh Google Search Console phạt lỗi thiếu thuộc tính bắt buộc (Missing required field).
// 4. Centralized Dealer Info: Nạp thực thể AutoDealer từ System Settings thay vì hardcode chuỗi chết.
export function generateStaticPageJsonLd(
  page: StaticPage,
  options?: StaticPageJsonLdOptions
): Record<string, unknown> {
  const cleanSiteUrl = sanitizeCanonicalBaseUrl(options?.siteUrl);
  const pageUrl = page.canonicalUrl || `${cleanSiteUrl}/${page.slug}`;
  let schemaType = page.schemaType || 'WebPage';

  const schemaData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.metaTitle || page.title,
    description: page.metaDescription || page.title,
    datePublished: page.createdAt,
    dateModified: page.updatedAt,
    inLanguage: 'vi-VN',
  };

  switch (schemaType) {
    case 'AboutPage': {
      schemaData.mainEntity = generateAutoDealerSchema(cleanSiteUrl, options?.dealer);
      break;
    }

    case 'ContactPage': {
      schemaData.mainEntity = generateAutoDealerSchema(cleanSiteUrl, options?.dealer);
      break;
    }

    case 'FinancialProduct': {
      schemaData.category = 'Auto Financing';
      schemaData.provider = generateAutoDealerSchema(cleanSiteUrl, options?.dealer);
      schemaData.description = page.metaDescription || page.title;
      break;
    }

    case 'FAQPage': {
      const faqItems = extractFaqsFromTiptap(page.content);
      if (faqItems.length > 0) {
        schemaData.mainEntity = faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        }));
      } else {
        // Fallback an toàn về WebPage tiêu chuẩn nếu người dùng chưa biên tập block FAQ
        schemaData['@type'] = 'WebPage';
      }
      break;
    }

    case 'HowTo': {
      const steps = extractStepsFromTiptap(page.content);
      if (steps.length > 0) {
        schemaData.step = steps.map((s) => ({
          '@type': 'HowToStep',
          position: s.position,
          name: s.title,
          text: s.description,
        }));
      } else {
        // Fallback an toàn về WebPage tiêu chuẩn nếu không tìm thấy các bước quy trình thực tế
        schemaData['@type'] = 'WebPage';
      }
      break;
    }

    case 'WebPage':
    default:
      schemaData['@type'] = 'WebPage';
      break;
  }

  // Tự động bóc tách và nhúng VideoObject nếu trang có khối video YouTube hoặc TikTok
  const videos = extractVideosFromTiptap(page.content);
  if (videos.length > 0) {
    schemaData.video = generateVideoSchema(videos, cleanSiteUrl, page.updatedAt);
  }

  return schemaData;
}
