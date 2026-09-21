import { apiClient } from '../lib/api-client';
import {
  BulkSettingsSchema,
  HomepageSettingsSchema,
  type BulkSettings,
  type HomepageSettings,
} from '@cardealer/types';

const isDev = process.env.NODE_ENV !== 'production';

// 🧠 Mental Model: Typed Service Layer quản lý cấu hình Showroom và Trang chủ cho Storefront.
// Thay thế toàn bộ fetch() trực tiếp bằng apiClient trung tâm.
// Tự động chuyển đổi sang Zod Default Fallback nếu API gặp sự cố, bảo đảm Zero-Crash Guarantee.
export const settingsService = {
  /**
   * Nạp cấu hình toàn diện cho Storefront (Site, Navigation, Contact, Floating, Sticky, Footer)
   */
  getStorefrontSettings: async (): Promise<BulkSettings> => {
    try {
      const data = await apiClient.get<unknown>('/api/settings', undefined, {
        cache: isDev ? 'no-store' : undefined,
        next: isDev
          ? undefined
          : {
              tags: ['system-settings'],
              revalidate: 30,
            },
      });

      if (data) {
        return BulkSettingsSchema.parse(data);
      }
    } catch (err: unknown) {
      console.warn(
        '[Storefront Settings] Không thể nạp cấu hình từ API, kích hoạt Zod Default Fallback:',
        err instanceof Error ? err.message : String(err)
      );
    }

    return BulkSettingsSchema.parse({});
  },

  /**
   * Nạp cấu hình riêng cho Phễu Chuyển Đổi Trang Chủ (6 Phân Khu)
   */
  getHomepageSettings: async (): Promise<HomepageSettings> => {
    try {
      const data = await apiClient.get<unknown>('/api/settings/homepage_settings', undefined, {
        cache: isDev ? 'no-store' : undefined,
        next: isDev
          ? undefined
          : {
              tags: ['homepage-settings'],
              revalidate: 30,
            },
      });

      if (data) {
        return HomepageSettingsSchema.parse(data);
      }
    } catch (err: unknown) {
      console.warn(
        '[Homepage Settings] Không thể nạp cấu hình từ API, kích hoạt Default Fallback:',
        err instanceof Error ? err.message : String(err)
      );
    }

    return HomepageSettingsSchema.parse({});
  },
};

// Aliases duy trì tương thích ngược cho các import hiện hữu
export const getStorefrontSettings = settingsService.getStorefrontSettings;
export const getHomepageSettings = settingsService.getHomepageSettings;
