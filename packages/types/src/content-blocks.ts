import { z } from 'zod';

// ============================================================================
// 1. SCHEMAS CHO 8 CONTENT BLOCKS TINH HOA (TIPTAP NODE VIEWS)
// ============================================================================

// 1. CalloutBlock: Hộp ghi chú, cảnh báo hoặc thông báo ưu đãi
export const CalloutBlockAttrsSchema = z.object({
  type: z.enum(['info', 'warning', 'success', 'note']).default('info'),
  title: z.string().optional().nullable(),
  content: z.string().min(1, 'Nội dung ghi chú không được để trống'),
});
export type CalloutBlockAttrs = z.infer<typeof CalloutBlockAttrsSchema>;

// 2. FeatureGridBlock: Lưới trang bị, tiện ích công nghệ SmartSense
export const FeatureItemSchema = z.object({
  title: z.string().min(1, 'Tiêu đề tính năng bắt buộc'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});
export type FeatureItem = z.infer<typeof FeatureItemSchema>;

export const FeatureGridBlockAttrsSchema = z.object({
  columns: z.enum(['2', '3', '4']).default('3'),
  features: z.array(FeatureItemSchema).min(1, 'Cần ít nhất 1 tính năng'),
});
export type FeatureGridBlockAttrs = z.infer<typeof FeatureGridBlockAttrsSchema>;

// 3. TableBlock: Bảng dữ liệu thông minh (cuộn ngang, Live Search, Export UTF-8 BOM CSV)
export const TableCellSchema = z.object({
  content: z.string(),
  isHeader: z.boolean().default(false),
});
export type TableCell = z.infer<typeof TableCellSchema>;

export const TableRowSchema = z.object({
  cells: z.array(TableCellSchema),
});
export type TableRow = z.infer<typeof TableRowSchema>;

export const TableBlockAttrsSchema = z.object({
  caption: z.string().optional().nullable(),
  enableSearch: z.boolean().default(false),
  enableExport: z.boolean().default(false),
  rows: z.array(TableRowSchema).min(1, 'Bảng cần có ít nhất 1 dòng dữ liệu'),
});
export type TableBlockAttrs = z.infer<typeof TableBlockAttrsSchema>;

// 4. RelatedCarBlock: Thẻ xe liên quan gắn giá niêm yết và link trực tiếp
export const RelatedCarBlockAttrsSchema = z.object({
  carId: z.string().uuid('ID xe không hợp lệ'),
  carSlug: z.string().min(1, 'Slug xe bắt buộc'),
  tenXe: z.string().min(1, 'Tên xe bắt buộc'),
  anhDaiDienUrl: z.string().url('URL ảnh không hợp lệ'),
  giaNiemYetTu: z.number().nonnegative('Giá niêm yết không âm'),
  seatCount: z.number().default(5),
  fuelType: z.string().optional().nullable(),
});
export type RelatedCarBlockAttrs = z.infer<typeof RelatedCarBlockAttrsSchema>;

// 5. PriceTableBlock: Bảng giá lăn bánh và ưu đãi đồng bộ tự động từ database
export const PriceTableBlockAttrsSchema = z.object({
  carId: z.string().uuid('ID xe không hợp lệ'),
  headline: z.string().optional().nullable(),
  showNote: z.boolean().default(true),
});
export type PriceTableBlockAttrs = z.infer<typeof PriceTableBlockAttrsSchema>;

// 6. YoutubeBlock: Nhúng video YouTube 16:9 với Facade Lazy Load
export const YoutubeBlockAttrsSchema = z.object({
  videoUrl: z.string().url('URL video không hợp lệ'),
  videoId: z.string().min(1, 'Không trích xuất được video ID'),
  caption: z.string().optional().nullable(),
});
export type YoutubeBlockAttrs = z.infer<typeof YoutubeBlockAttrsSchema>;

// 7. TikTokBlock: Nhúng video dọc 9:16 Facade poster, autoplay v1, khử scrollbar
export const TikTokBlockAttrsSchema = z.object({
  videoUrl: z.string().url('URL TikTok không hợp lệ'),
  videoId: z.string().min(1, 'ID TikTok bắt buộc'),
  title: z.string().min(1, 'Tiêu đề video bắt buộc cho SEO'),
  posterImageUrl: z.string().url('Ảnh bìa video bắt buộc để tối ưu LCP'),
});
export type TikTokBlockAttrs = z.infer<typeof TikTokBlockAttrsSchema>;

// 8. GalleryBlock: Bộ sưu tập ảnh slider vuốt mobile hoặc lưới kèm Lightbox
export const GalleryImageSchema = z.object({
  url: z.string().url('URL ảnh không hợp lệ'),
  alt: z.string().default('Hình ảnh xe Hyundai'),
  caption: z.string().optional().nullable(),
});
export type GalleryImage = z.infer<typeof GalleryImageSchema>;

export const GalleryBlockAttrsSchema = z.object({
  style: z.enum(['grid', 'slider']).default('slider'),
  images: z.array(GalleryImageSchema).min(1, 'Cần ít nhất 1 ảnh trong thư viện'),
});
export type GalleryBlockAttrs = z.infer<typeof GalleryBlockAttrsSchema>;

// 9. FAQBlock: Khối câu hỏi thường gặp Accordion hỗ trợ sinh FAQPage JSON-LD Schema
export const FAQQuestionSchema = z.object({
  question: z.string().min(1, 'Câu hỏi không được để trống'),
  answer: z.string().min(1, 'Câu trả lời không được để trống'),
});
export type FAQQuestion = z.infer<typeof FAQQuestionSchema>;

export const FAQBlockAttrsSchema = z.object({
  title: z.string().default('Câu hỏi thường gặp'),
  questions: z.array(FAQQuestionSchema).min(1, 'Cần ít nhất 1 câu hỏi'),
});
export type FAQBlockAttrs = z.infer<typeof FAQBlockAttrsSchema>;

// ============================================================================
// 2. SCHEMAS CHO CÁC KHỐI INBOUND LEAD MARKETING (1-CHẠM CRO TINH GỌN)
// ============================================================================

// Form nhận báo giá 1-chạm giữa bài viết
export const InlineQuickFormAttrsSchema = z.object({
  headline: z.string().default('Nhận Ưu Đãi & Báo Giá Lăn Bánh'),
  buttonText: z.string().default('Nhận Báo Giá Ngay'),
  carSlug: z.string().optional().nullable(),
});
export type InlineQuickFormAttrs = z.infer<typeof InlineQuickFormAttrsSchema>;

// Khối quà tặng/bảng dự toán đặc quyền bị làm mờ, mở khóa tức thì sau khi điền SĐT
export const GatedContentAttrsSchema = z.object({
  rewardTitle: z.string().default('Bảng Dự Toán Chi Phí Lăn Bánh Chi Tiết Từng Huyện'),
  gatedHtml: z.string().min(1, 'Nội dung khóa không được để trống'),
});
export type GatedContentAttrs = z.infer<typeof GatedContentAttrsSchema>;

// ============================================================================
// 3. SCHEMAS DTO BÀI VIẾT & MỤC LỤC BÀI VIẾT (TOC)
// ============================================================================

export const PostTocItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.number().int().min(2).max(4), // H2, H3, H4
});
export type PostTocItem = z.infer<typeof PostTocItemSchema>;

export const CreatePostInputSchema = z.object({
  tieuDe: z.string().min(20, 'Tiêu đề bài viết phải có ít nhất 20 ký tự').max(255),
  slug: z.string().min(3).max(255),
  categoryId: z.string().uuid('Chuyên mục bắt buộc'),
  authorId: z.string().uuid().optional().nullable(),
  anhDaiDienUrl: z.string().url('Ảnh đại diện bắt buộc'),
  anhDaiDienAlt: z.string().min(5, 'Thẻ Alt ảnh đại diện bắt buộc cho SEO'),
  tomTat: z.string().max(500).optional().nullable(),
  noiDung: z.record(z.string(), z.unknown()), // Tiptap JSON AST Tree
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('draft'),
  scheduledAt: z.string().datetime().optional().nullable(),
  expiredPromoDate: z.string().datetime().optional().nullable(),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().min(0).max(3).default(0),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  noIndex: z.boolean().default(false),
});
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;

export const UpdatePostInputSchema = CreatePostInputSchema.partial();
export type UpdatePostInput = z.infer<typeof UpdatePostInputSchema>;
