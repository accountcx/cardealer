import { apiClient } from '../lib/api-client';
import type {
  NavigationSettings,
  FloatingSellerSettings,
  StickyBarSettings,
  ContactSettings,
  SiteSettings,
} from '@cardealer/types';

export interface ShowroomSettings {
  showroomName: string;
  hotlineKinhDoanh: string;
  hotlineDichVu: string;
  zaloNumber: string;
  email: string;
  diaChi: string;
  googleMapsUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}

// 🧠 Mental Model: Service quản trị cấu hình hệ thống đa domain cho Admin Portal.
// Hỗ trợ nạp và lưu độc lập từng domain key (Navigation, FloatingSeller, StickyBar, Contact/Showroom)
// giúp phân chia trách nhiệm (SRP) và loại bỏ hoàn toàn nguy cơ ghi đè dữ liệu chéo nhau.
export const settingsService = {
  // Lấy toàn bộ cấu hình hệ thống
  getAllSettings: async (): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>('/api/admin/settings');
  },

  // Lấy cấu hình của 1 key cụ thể
  getSettingByKey: async <T>(key: string): Promise<T> => {
    return apiClient.get<T>(`/api/admin/settings/${key}`);
  },

  // Cập nhật cấu hình của 1 key cụ thể kèm validation
  updateSettingByKey: async <T>(key: string, data: T): Promise<{ success: boolean; data: T }> => {
    return apiClient.put<{ success: boolean; data: T }>(`/api/admin/settings/${key}`, data);
  },

  // Backward-compatible methods cho Showroom settings (Phase 1)
  getSettings: async (): Promise<ShowroomSettings> => {
    return apiClient.get<ShowroomSettings>('/api/admin/settings/showroom_settings');
  },

  updateSettings: async (data: Partial<ShowroomSettings>): Promise<{ success: boolean; data: Partial<ShowroomSettings> }> => {
    return apiClient.put<{ success: boolean; data: Partial<ShowroomSettings> }>('/api/admin/settings/showroom_settings', data);
  },
};
