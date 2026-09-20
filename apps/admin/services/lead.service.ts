import { apiClient } from '../lib/api-client';
import type { LeadResponse, LeadStatus } from '@cardealer/types';

// 🧠 Mental Model: Typed Service Layer cho Quản trị Leads CRM (apps/admin).
// Tương tác trực tiếp với API namespace /api/admin/leads/*, hỗ trợ phân trang và cập nhật trạng thái tại chỗ (Optimistic).

export interface LeadListResponse {
  items: (LeadResponse & {
    carVersion?: {
      id: string;
      tenPhienBan: string;
      giaNiemYet: number;
      car?: {
        id: string;
        tenXe: string;
      };
    };
  })[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const leadService = {
  /**
   * Lấy danh sách leads kèm bộ lọc và phân trang
   */
  getLeads: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<LeadListResponse> => {
    return apiClient.get<LeadListResponse>('/api/admin/leads', params);
  },

  /**
   * Lấy chi tiết một lead theo ID
   */
  getLeadById: async (id: string): Promise<LeadResponse> => {
    return apiClient.get<LeadResponse>(`/api/admin/leads/${id}`);
  },

  /**
   * Cập nhật trạng thái lead và ghi chú tư vấn
   */
  updateLeadStatus: async (
    id: string,
    status: LeadStatus,
    notes?: string
  ): Promise<LeadResponse> => {
    return apiClient.request<LeadResponse>(`/api/admin/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },
};
