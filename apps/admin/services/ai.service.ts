import { apiClient } from '../lib/api-client';
import type { AiGenerateRequest, AiGenerateResponseData } from '@cardealer/types';

// 🧠 Mental Model: Typed Service Layer cho AI Writing Assistant trong Admin.
// Giao tiếp với API /api/admin/ai/generate để sinh dàn ý, viết tiếp, tối ưu SEO và sinh câu hỏi FAQ.
// Lưu ý: apiClient tự động unwrap payload trả về json.data (AiGenerateResponseData) và throw AppError nếu có lỗi.
export const aiService = {
  generate: async (req: AiGenerateRequest): Promise<AiGenerateResponseData> => {
    return apiClient.post<AiGenerateResponseData>('/api/admin/ai/generate', req);
  },
};
