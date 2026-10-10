import { z } from 'zod';

// 🧠 Mental Model: Type Definitions & Zod Schemas cho AI Writing Assistant (ChatGPT / OpenAI Integration).
// Hỗ trợ tự động phân bổ thông minh 14 Content Blocks tinh hoa (Images, SpecTable, RelatedCar, ProsCons, FAQ, Callout, CTA, Video...).
export const AiActionSchema = z.enum([
  'generate_full_article',
  'generate_outline',
  'continue_writing',
  'optimize_seo',
  'generate_faqs',
  'expand_section',
  'generate_car_content',
  'generate_single_block',
]);
export type AiAction = z.infer<typeof AiActionSchema>;

export const AiCarSummarySchema = z.object({
  id: z.string().optional(),
  tenXe: z.string(),
  slug: z.string(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  giaNiemYetTu: z.number().optional(),
  anhDaiDienUrl: z.string().optional().nullable(),
  soChoNgoi: z.number().optional().nullable(),
  seatRange: z.string().optional().nullable(),
  loaiNhienLieu: z.string().optional().nullable(),
  fuelType: z.string().optional().nullable(),
});
export type AiCarSummary = z.infer<typeof AiCarSummarySchema>;

export const AiGenerateRequestSchema = z.object({
  action: AiActionSchema,
  prompt: z.string().trim().min(1, 'Vui lòng nhập chủ đề hoặc nội dung yêu cầu'),
  context: z.string().optional(),
  keyword: z.string().optional(),
  carModel: z.string().optional(),
  carSlug: z.string().optional(),
  location: z.string().optional(),
  availableCars: z.array(AiCarSummarySchema).optional(),
  maxTokens: z.number().int().positive().optional(),
});
export type AiGenerateRequest = z.infer<typeof AiGenerateRequestSchema>;

export interface OutlineItem {
  level: 'h2' | 'h3' | number;
  title: string;
  points?: string[];
  description?: string;
  suggestedBlockType?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoOptimizationResult {
  metaTitle: string;
  metaDescription: string;
  focusKeyword?: string;
  suggestedKeywords?: string[];
  lsiKeywords?: string[];
  suggestedTags?: string[];
}

export type FullArticleBlockType =
  | 'heading'
  | 'paragraph'
  | 'singleImage'
  | 'imageGallery'
  | 'specTable'
  | 'priceTable'
  | 'relatedCar'
  | 'prosCons'
  | 'callout'
  | 'leadForm'
  | 'faq'
  | 'ctaButton'
  | 'youtube'
  | 'tiktok';

export interface FullArticleBlock {
  type: FullArticleBlockType | string;
  level?: number;
  content?: string;
  title?: string;
  calloutType?: 'info' | 'warning' | 'success' | 'note';
  faqs?: Array<{ question: string; answer: string }>;
  pros?: string[];
  cons?: string[];
  ctaButtonText?: string;
  ctaActionType?: 'hotline' | 'zalo' | 'quoteForm' | 'customLink';
  ctaPhone?: string;
  ctaCustomUrl?: string;
  ctaSubtext?: string;
  ctaVariant?: 'red' | 'blue' | 'emerald';
  // Images
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
  galleryImages?: Array<{ url: string; alt?: string; caption?: string }>;
  // Tables
  specVersions?: string[];
  specRows?: Array<{ specName: string; values: string[] }>;
  prices?: Array<{ version: string; listedPrice: number; discount: number; rollingPrice: number }>;
  // Cars & Forms
  carName?: string;
  carSlug?: string;
  carPrice?: number;
  carImage?: string;
  seatCount?: number;
  fuelType?: string;
  formHeadline?: string;
  formSubheadline?: string;
  formButtonText?: string;
  // Video
  videoId?: string;
  videoUrl?: string;
}

export interface FullArticleResult {
  title: string;
  summary: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  suggestedKeywords: string[];
  outline?: OutlineItem[];
  blocks: FullArticleBlock[];
  htmlContent?: string;
}

export interface CarFullContentResult {
  moTaChung: string;
  promotionSummary: string;
  traTruocTu?: number;
  highlightFeatures: Array<{ icon: string; title: string; value: string }>;
  article?: FullArticleResult;
}

export interface AiGenerateResponseData {
  action: AiAction;
  model?: string;
  text?: string;
  rawText?: string;
  blocks?: FullArticleBlock[];
  outline?: OutlineItem[];
  faqs?: FaqItem[];
  seo?: SeoOptimizationResult;
  fullArticle?: FullArticleResult;
  carContent?: CarFullContentResult;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AiGenerateResponse {
  success: boolean;
  data?: AiGenerateResponseData;
  error?: {
    code: string;
    message: string;
  };
}
