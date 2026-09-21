import { BulkSettingsSchema, type BulkSettings } from '@cardealer/types';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:4000';

const isDev = process.env.NODE_ENV !== 'production';

// 🧠 Mental Model: Service nạp dữ liệu cấu hình toàn diện cho Storefront Server Components.
// 1. Áp dụng Next.js Cache Tagging 'system-settings' để hỗ trợ On-Demand ISR Revalidation.
// 2. Tự động chuyển đổi sang BulkSettingsSchema.parse({}) dự phòng nếu Backend API đang khởi động
//    hoặc cơ sở dữ liệu chưa sẵn sàng, đảm bảo Storefront KHÔNG BAO GIỜ bị crash màn hình trắng (Zero-Crash Guarantee).
export async function getStorefrontSettings(): Promise<BulkSettings> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings`, {
      cache: isDev ? 'no-store' : undefined,
      next: isDev ? undefined : {
        tags: ['system-settings'],
        revalidate: 30,
      },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Storefront Settings] Backend API trả về HTTP ${res.status}, kích hoạt Zod Fallback`);
      return BulkSettingsSchema.parse({});
    }

    const json = (await res.json()) as { success?: boolean; data?: unknown };
    if (json.success && json.data) {
      return BulkSettingsSchema.parse(json.data);
    }

    return BulkSettingsSchema.parse({});
  } catch (err: unknown) {
    console.warn(
      `[Storefront Settings] Không thể kết nối tới Backend API (${API_BASE_URL}), kích hoạt Default Fallback:`,
      err instanceof Error ? err.message : String(err)
    );
    return BulkSettingsSchema.parse({});
  }
}
