import { z } from 'zod';

export type StaticPageTemplate = 'DEFAULT' | 'PROFILE_SHOWROOM' | 'TIMELINE' | 'FINANCE';
export type StaticPageSchemaType = 'AboutPage' | 'HowTo' | 'WebPage';

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
  templateType: z.enum(['DEFAULT', 'PROFILE_SHOWROOM', 'TIMELINE', 'FINANCE']).default('DEFAULT'),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(1000).optional().nullable(),
  canonicalUrl: z.string().url('URL không hợp lệ').max(500).optional().nullable(),
  ogImage: z.string().max(500).optional().nullable(),
  noIndex: z.boolean().default(false),
  schemaType: z.enum(['AboutPage', 'HowTo', 'WebPage']).default('WebPage').optional().nullable(),
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
