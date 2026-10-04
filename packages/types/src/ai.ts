import { z } from 'zod';

// 🧠 Mental Model: Type Definitions & Zod Schemas cho AI Writing Assistant (ChatGPT / OpenAI Integration).
// Phục vụ viết Toàn bộ Bài viết (Full Article A-Z), Dàn ý SEO, Viết tiếp nội dung, Tối ưu hóa SEO/Meta, và Tự động sinh Khối FAQ chuẩn Schema.
export const AiActionSchema = z.enum([
  'generate_full_article',
  'generate_outline',
  'continue_writing',
  'optimize_seo',
  'generate_faqs',
  'expand_section',
]);
export type AiAction = z.infer<typeof AiActionSchema>;

export const AiGenerateRequestSchema = z.object({
  action: AiActionSchema,
  prompt: z.string().trim().min(1, 'Vui lòng nhập chủ đề hoặc nội dung yêu cầu'),
  context: z.string().optional(),
  keyword: z.string().optional(),
  carModel: z.string().optional(),
  location: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
});
export type AiGenerateRequest = z.infer<typeof AiGenerateRequestSchema>;

export interface OutlineItem {
  level: 'h2' | 'h3' | number;
  title: string;
  points?: string[];
  description?: string;
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

export interface FullArticleBlock {
  type: 'heading' | 'paragraph' | 'callout' | 'faq' | 'prosCons' | 'ctaButton';
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
  ctaSubtext?: string;
}

export interface FullArticleResult {
  title: string;
  summary: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  suggestedKeywords: string[];
  blocks: FullArticleBlock[];
  htmlContent?: string;
}

export interface AiGenerateResponseData {
  action: AiAction;
  model?: string;
  text?: string;
  rawText?: string;
  outline?: OutlineItem[];
  faqs?: FaqItem[];
  seo?: SeoOptimizationResult;
  fullArticle?: FullArticleResult;
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
