import { apiClient } from '../lib/api-client';

export interface CarSummary {
  id: string;
  tenXe: string;
  slug: string;
  anhDaiDienUrl?: string | null;
  segment?: string | null;
  traTruocTu?: string | null;
  promotionSummary?: string | null;
  minPrice: number;
  maxPrice: number;
  versionCount: number;
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  sortOrder?: number;
}

// 🧠 Mental Model: Service quản lý danh mục xe hơi, phiên bản và màu ngoại thất
export const catalogService = {
  getCars: async (segment?: string): Promise<CarSummary[]> => {
    return apiClient.get<CarSummary[]>('/api/admin/cars', segment ? { segment } : undefined);
  },

  getCarBySlug: async <T = unknown>(slug: string): Promise<T> => {
    return apiClient.get<T>(`/api/admin/cars/${slug}`);
  },

  createCar: async <T = unknown>(data: Record<string, unknown>): Promise<T> => {
    return apiClient.post<T>('/api/admin/cars', data);
  },

  updateCar: async <T = unknown>(slugOrId: string, data: Record<string, unknown>): Promise<T> => {
    return apiClient.put<T>(`/api/admin/cars/${slugOrId}`, data);
  },

  deleteCar: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiClient.delete<{ success: boolean; id: string }>(`/api/admin/cars/${id}`);
  },
};
