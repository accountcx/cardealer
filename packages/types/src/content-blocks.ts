import { z } from 'zod';

// 🧠 Mental Model: Schema Validation cho Toàn Bộ Content Blocks Tiptap & Inbound Marketing
// Hỗ trợ Tiptap Blocks tinh hoa: Heading, Callout, FAQ, PriceTable, RelatedCar, ImageGallery, SpecTable, LeadForm, CtaButton, ProsCons.

export const CalloutBlockAttrsSchema = z.object({
  type: z.enum(['info', 'warning', 'success', 'note']).default('info'),
  title: z.string().optional(),
  content: z.string().optional(),
});
export type CalloutBlockAttrs = z.infer<typeof CalloutBlockAttrsSchema>;

export const SingleImageBlockAttrsSchema = z.object({
  src: z.string().optional(),
  url: z.string().optional(),
  alt: z.string().default(''),
  caption: z.string().optional(),
});
export type SingleImageBlockAttrs = z.infer<typeof SingleImageBlockAttrsSchema>;

export const GalleryImageItemSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});
export type GalleryImageItem = z.infer<typeof GalleryImageItemSchema>;

export const GalleryBlockAttrsSchema = z.object({
  title: z.string().optional(),
  layout: z.enum(['slider', 'grid']).default('slider'),
  style: z.enum(['slider', 'grid']).optional(),
  images: z.array(GalleryImageItemSchema).default([]),
});
export type GalleryBlockAttrs = z.infer<typeof GalleryBlockAttrsSchema>;

export const SpecRowItemSchema = z.object({
  specName: z.string(),
  values: z.array(z.string()),
});
export type SpecRowItem = z.infer<typeof SpecRowItemSchema>;

export const SpecComparisonBlockAttrsSchema = z.object({
  title: z.string().default('Bảng So Sánh Thông Số Kỹ Thuật'),
  versions: z.array(z.string()).default([]),
  rows: z.array(SpecRowItemSchema).default([]),
});
export type SpecComparisonBlockAttrs = z.infer<typeof SpecComparisonBlockAttrsSchema>;

export const PriceTableRowSchema = z.object({
  version: z.string().optional(),
  name: z.string().optional(),
  listedPrice: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().default(0),
  rollingPrice: z.number().nonnegative().optional(),
  onRoadPriceEstimate: z.number().nonnegative().optional(),
});
export type PriceTableRow = z.infer<typeof PriceTableRowSchema>;

export const PriceTableBlockAttrsSchema = z.object({
  title: z.string().default('Bảng Giá Xe Hyundai Mới Nhất'),
  carSlug: z.string().optional(),
  prices: z.array(PriceTableRowSchema).default([]),
});
export type PriceTableBlockAttrs = z.infer<typeof PriceTableBlockAttrsSchema>;

export const RelatedCarBlockAttrsSchema = z.object({
  carName: z.string().default('Hyundai Accent 2026'),
  slug: z.string().default('hyundai-accent'),
  minPrice: z.number().nonnegative().default(439000000),
  imageUrl: z.string().default('/images/cars/accent.webp'),
  seatCount: z.number().int().positive().default(5),
  fuelType: z.string().default('Xăng 1.5L Smartstream'),
});
export type RelatedCarBlockAttrs = z.infer<typeof RelatedCarBlockAttrsSchema>;

export const CtaButtonBlockAttrsSchema = z.object({
  buttonText: z.string().default('Nhận Báo Giá Lăn Bánh & Lái Thử'),
  actionType: z.enum(['hotline', 'zalo', 'quoteForm', 'customLink']).default('hotline'),
  subtext: z.string().optional(),
  variant: z.enum(['red', 'blue', 'emerald']).default('red'),
  phoneNumber: z.string().optional(),
  customUrl: z.string().optional(),
});
export type CtaButtonBlockAttrs = z.infer<typeof CtaButtonBlockAttrsSchema>;

export const ProsConsBlockAttrsSchema = z.object({
  title: z.string().default('Đánh Giá Ưu & Nhược Điểm Thực Tế'),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
});
export type ProsConsBlockAttrs = z.infer<typeof ProsConsBlockAttrsSchema>;

export const FaqQuestionItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export type FaqQuestionItem = z.infer<typeof FaqQuestionItemSchema>;

export const FaqBlockAttrsSchema = z.object({
  title: z.string().default('Câu Hỏi Thường Gặp (FAQ)'),
  questions: z.array(FaqQuestionItemSchema).default([]),
});
export type FaqBlockAttrs = z.infer<typeof FaqBlockAttrsSchema>;

export const LeadFormBlockAttrsSchema = z.object({
  headline: z.string().default('Đăng Ký Nhận Báo Giá Lăn Bánh & Lái Thử Tận Nhà'),
  subheadline: z.string().default('Chuyên viên tư vấn sẽ liên hệ gửi dự toán chi phí chi tiết trong 5 phút.'),
  buttonText: z.string().default('Gửi Yêu Cầu Nhận Báo Giá'),
  carName: z.string().optional(),
});
export type LeadFormBlockAttrs = z.infer<typeof LeadFormBlockAttrsSchema>;

export const PostTocItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.number().int().min(2).max(4), // H2, H3, H4
});
export type PostTocItem = z.infer<typeof PostTocItemSchema>;

export const CreatePostInputSchema = z.object({
  tieuDe: z.string().trim().min(3, 'Tiêu đề bài viết phải có ít nhất 3 ký tự').max(255),
  slug: z.string().trim().min(2, 'Đường dẫn slug phải có ít nhất 2 ký tự').max(255),
  categoryId: z.string().uuid('Chuyên mục không hợp lệ').optional().nullable().or(z.literal('')),
  authorId: z.string().uuid().optional().nullable(),
  anhDaiDienUrl: z.string().optional().nullable().or(z.literal('')),
  anhDaiDienAlt: z.string().optional().nullable().or(z.literal('')),
  tomTat: z.string().max(1000).optional().nullable(),
  noiDung: z.record(z.string(), z.unknown()), // Tiptap JSON AST Tree
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('draft'),
  publishedAt: z.string().optional().nullable().or(z.literal('')),
  createdAt: z.string().optional().nullable().or(z.literal('')),
  scheduledAt: z.string().datetime().optional().nullable().or(z.literal('')),
  expiredPromoDate: z.string().datetime().optional().nullable().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().min(0).max(3).default(0),
  focusKeyword: z.string().max(255).optional().nullable(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().optional().nullable().or(z.literal('')),
  noIndex: z.boolean().default(false),
});
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;

export const UpdatePostInputSchema = CreatePostInputSchema.partial();
export type UpdatePostInput = z.infer<typeof UpdatePostInputSchema>;
