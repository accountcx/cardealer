import { z } from 'zod';

// 🧠 Mental Model: Type Definitions & Zod Schemas cho AI Writing Assistant (ChatGPT / OpenAI Integration).
// Phục vụ tạo Dàn ý SEO, Viết tiếp nội dung, Tối ưu hóa SEO/Meta, và Tự động sinh Khối FAQ chuẩn Schema.
export const AiActionSchema = z.enum([
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

export interface AiGenerateResponseData {
  action: AiAction;
  model?: string;
  text?: string;
  rawText?: string;
  outline?: OutlineItem[];
  faqs?: FaqItem[];
  seo?: SeoOptimizationResult;
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
