import { eq } from 'drizzle-orm';
import { db, schema } from './client';
import {
  SiteSettingsSchema,
  NavigationSettingsSchema,
  ContactSettingsSchema,
  FloatingSellerSettingsSchema,
  StickyBarSettingsSchema,
  FooterSettingsSchema,
  HomepageSettingsSchema,
} from '@cardealer/types';

// 🧠 Mental Model: Hàm nạp dữ liệu hạt giống (Seed Data) cho 7 Domain Keys trong bảng system_settings.
// Sử dụng phương thức ON CONFLICT DO UPDATE / DO NOTHING để đảm bảo không ghi đè dữ liệu đã được người dùng tùy chỉnh.
export async function seedSystemSettings(dbInstance = db) {
  const defaultKeys = [
    {
      key: 'site_settings',
      data: SiteSettingsSchema.parse({}),
    },
    {
      key: 'navigation_settings',
      data: NavigationSettingsSchema.parse({}),
    },
    {
      key: 'contact_settings',
      data: ContactSettingsSchema.parse({}),
    },
    {
      key: 'floating_seller_settings',
      data: FloatingSellerSettingsSchema.parse({}),
    },
    {
      key: 'sticky_bar_settings',
      data: StickyBarSettingsSchema.parse({}),
    },
    {
      key: 'footer_settings',
      data: FooterSettingsSchema.parse({}),
    },
    {
      key: 'homepage_settings',
      data: HomepageSettingsSchema.parse({}),
    },
    {
      // Duy trì tương thích ngược với Phase 1 Admin Settings
      key: 'showroom_settings',
      data: {
        showroomName: 'Xe Hyundai Vinh',
        diaChi: 'Km 3+500 Đại lộ Lê Nin, TP. Vinh, Tỉnh Nghệ An',
        googleMapsUrl: 'https://maps.google.com/?cid=123456789',
        hotlineKinhDoanh: '0981.234.567',
        hotlineDichVu: '0981.890.123',
        zaloNumber: '0981.234.567',
        email: 'kinhdoanh@xehyundaivinh.com',
        facebookUrl: 'https://facebook.com/hyundaivinh.official',
        youtubeUrl: 'https://youtube.com/@hyundaivinh',
      },
    },
  ];

  const results: string[] = [];

  for (const item of defaultKeys) {
    const existing = await dbInstance.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, item.key),
    });

    if (!existing) {
      await dbInstance
        .insert(schema.systemSettings)
        .values({
          key: item.key,
          data: item.data,
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
      results.push(`Inserted: ${item.key}`);
    } else {
      results.push(`Skipped (already exists): ${item.key}`);
    }
  }

  return results;
}
