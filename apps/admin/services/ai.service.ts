import { apiClient } from '../lib/api-client';
import type { AiGenerateRequest, AiGenerateResponseData } from '@cardealer/types';

// 🧠 Mental Model: Typed Service Layer cho AI Writing Assistant trong Admin.
// Giao tiếp với API /api/admin/ai/generate để sinh dàn ý, viết tiếp, tối ưu SEO và sinh câu hỏi FAQ.
// Lưu ý: apiClient tự động unwrap payload trả về json.data (AiGenerateResponseData) và throw AppError nếu có lỗi.
export const aiService = {
  generate: async (req: AiGenerateRequest): Promise<AiGenerateResponseData> => {
    const startTime = Date.now();
    console.log('[Admin AI Client] 🚀 Bắt đầu gửi yêu cầu tới /api/admin/ai/generate:', {
      action: req.action,
      carModel: req.carModel,
      promptLength: req.prompt?.length,
    });
    try {
      const res = await apiClient.post<AiGenerateResponseData>('/api/admin/ai/generate', req);
      console.log(`[Admin AI Client] ✅ Thành công sau ${Date.now() - startTime}ms:`, res);
      return res;
    } catch (err) {
      console.error(`[Admin AI Client] ❌ Thất bại sau ${Date.now() - startTime}ms:`, err);
      throw err;
    }
  },
};
