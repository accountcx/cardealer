import { apiClient } from '../lib/api-client';
import type { CreateLeadPayload, LeadResponse } from '@cardealer/types';

export interface SubmitLeadResponse extends LeadResponse {
  isDuplicate?: boolean;
  message?: string;
}

// 🧠 Mental Model: Typed Service Layer quản lý gửi Lead từ Storefront (Web).
// Thay thế toàn bộ các lời gọi fetch() trực tiếp trong components.
// Tương tác trực tiếp qua apiClient và tự động chuẩn hóa lỗi/phản hồi.
export const leadsService = {
  /**
   * Tiếp nhận Lead từ Storefront (Báo giá nhanh, Dự toán lăn bánh, Dự toán trả góp)
   */
  createLead: async (payload: CreateLeadPayload): Promise<SubmitLeadResponse> => {
    return apiClient.post<SubmitLeadResponse>('/api/leads', payload);
  },
};
