import type { MetadataRoute } from 'next';
import { getStorefrontSettings } from '../services/settings.service';

// 🧠 Mental Model: Next.js Dynamic Robots.txt Engine tuân thủ chuẩn Google Search Central 2026.
// Cung cấp chỉ thị crawl cho Googlebot, Bingbot, Yandex bot:
// 1. Cho phép truy cập toàn bộ các trang nội dung công khai (Trang chủ, Dòng xe, Tin tức, Dự toán, Trả góp).
// 2. Chặn bọ cào quét các API endpoints nội bộ, URL Preview bài viết nhạy cảm và khu vực quản trị Admin.
// 3. Khai báo trực tiếp đường dẫn Sitemap XML index trung tâm.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getStorefrontSettings();
  const siteUrl = (settings.site?.siteUrl || 'https://xehyundaivinh.com').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/preview',
          '/*?*token=',
          '/*?*preview=',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/uploads/'],
        disallow: [],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
