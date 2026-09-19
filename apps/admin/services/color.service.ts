import { apiClient } from '../lib/api-client';
import { Color, CreateColorInput } from '@cardealer/types';

// 🧠 Mental Model: Service quản lý danh mục màu sơn Master toàn hệ thống (Invariant 12)
// Độc quyền giao tiếp backend qua apiClient singleton với Typed DTOs từ @cardealer/types
export const colorService = {
  getColors: async (): Promise<Color[]> => {
    return apiClient.get<Color[]>('/api/admin/colors');
  },

  createColor: async (data: CreateColorInput): Promise<Color> => {
    return apiClient.post<Color>('/api/admin/colors', data);
  },

  updateColor: async (id: string, data: Partial<CreateColorInput>): Promise<Color> => {
    return apiClient.put<Color>(`/api/admin/colors/${id}`, data);
  },

  deleteColor: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiClient.delete<{ success: boolean; id: string }>(`/api/admin/colors/${id}`);
  },

  saveVersionColors: async (
    slug: string,
    items: Array<{
      versionId: string;
      colorId: string;
      anhXeTheoMauUrl?: string;
      isDefault?: boolean;
    }>
  ): Promise<{ success: boolean; savedCount: number }> => {
    return apiClient.post<{ success: boolean; savedCount: number }>(
      `/api/admin/cars/${slug}/version-colors`,
      { items }
    );
  },
};
