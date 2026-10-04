import { apiClient } from '../lib/api-client';
import type { AiGenerateRequest, AiGenerateResponse } from '@cardealer/types';

// 🧠 Mental Model: Typed Service Layer cho AI Writing Assistant trong Admin.
// Giao tiếp với API /api/admin/ai/generate để sinh dàn ý, viết tiếp, tối ưu SEO và sinh câu hỏi FAQ.
export const aiService = {
  generate: async (req: AiGenerateRequest): Promise<AiGenerateResponse> => {
    return apiClient.post<AiGenerateResponse>('/api/admin/ai/generate', req);
  },
};
