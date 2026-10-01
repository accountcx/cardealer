import { z } from 'zod';

export type StaticPageTemplate =
  | 'DEFAULT'
  | 'PROFILE_SHOWROOM'
  | 'TIMELINE'
  | 'FINANCE'
  | 'CONTACT'
  | 'FAQ';

export type StaticPageSchemaType =
  | 'WebPage'
  | 'AboutPage'
  | 'HowTo'
  | 'FinancialProduct'
  | 'ContactPage'
  | 'FAQPage';

// WHY: Bảng ánh xạ mặc định từ Template sang Schema.org Structured Data (Mental Model Resolver).
// Khi Marketer chọn giao diện (Template), hệ thống tự động gán Schema phù hợp nhất mà vẫn cho phép ghi đè thủ công.
export const TEMPLATE_DEFAULT_SCHEMA: Record<StaticPageTemplate, StaticPageSchemaType> = {
  DEFAULT: 'WebPage',
  PROFILE_SHOWROOM: 'AboutPage',
  TIMELINE: 'HowTo',
  FINANCE: 'FinancialProduct',
  CONTACT: 'ContactPage',
  FAQ: 'FAQPage',
};

// 🧠 Danh sách từ khóa URL cố định dành riêng cho hệ thống (Two-Tier Guard - R12)
export const RESERVED_SLUGS = [
  'xe', 'dong-xe', 'tin-tuc', 'gia-lan-banh', 'tra-gop',
  'admin', 'api', 'login', 'preview', 'settings', 'sitemap', 'robots.txt'
] as const;

export const createStaticPageSchema = z.object({
  title: z.string().min(2, 'Tiêu đề tối thiểu 2 ký tự').max(255),
  slug: z.string()
    .min(2, 'Slug tối thiểu 2 ký tự')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường không dấu, số và dấu gạch ngang')
    .refine((val) => !(RESERVED_SLUGS as readonly string[]).includes(val), {
      message: 'Slug này trùng với đường dẫn cố định của hệ thống, vui lòng chọn tên khác!',
    }),
  content: z.record(z.string(), z.unknown()).default({}),
  templateType: z.enum(['DEFAULT', 'PROFILE_SHOWROOM', 'TIMELINE', 'FINANCE', 'CONTACT', 'FAQ']).default('DEFAULT'),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(1000).optional().nullable(),
  canonicalUrl: z.string().url('URL không hợp lệ').max(500).optional().nullable(),
  ogImage: z.string().max(500).optional().nullable(),
  noIndex: z.boolean().default(false),
  schemaType: z.enum(['WebPage', 'AboutPage', 'HowTo', 'FinancialProduct', 'ContactPage', 'FAQPage']).default('WebPage').optional().nullable(),
});

export const updateStaticPageSchema = createStaticPageSchema.partial();

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  templateType: StaticPageTemplate;
  isPublished: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
  schemaType: StaticPageSchemaType | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateStaticPageDTO = z.input<typeof createStaticPageSchema>;
export type UpdateStaticPageDTO = z.input<typeof updateStaticPageSchema>;
export type StaticPageParsed = z.output<typeof createStaticPageSchema>;
