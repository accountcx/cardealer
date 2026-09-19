import { apiClient } from '../lib/api-client';

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

// 🧠 Mental Model: Service quản lý cấu hình thông tin đại lý, hotline và mạng xã hội.
// Tuyệt đối không fallback ngầm; gọi trực tiếp API /api/admin/settings để tương tác dữ liệu thật.

export const settingsService = {
  getSettings: async (): Promise<ShowroomSettings> => {
    return apiClient.get<ShowroomSettings>('/api/admin/settings');
  },

  updateSettings: async (data: Partial<ShowroomSettings>): Promise<{ success: boolean; data: Partial<ShowroomSettings> }> => {
    return apiClient.put<{ success: boolean; data: Partial<ShowroomSettings> }>('/api/admin/settings', data);
  },
};
