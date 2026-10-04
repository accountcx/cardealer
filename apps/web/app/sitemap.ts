import type { MetadataRoute } from 'next';
import { getStorefrontSettings } from '../services/settings.service';
import { carsService } from '../services/cars.service';
import { pagesService } from '../services/pages.service';
import { apiClient } from '../lib/api-client';
import { getAllSegmentSlugs } from '../config/segments';

// 🧠 Mental Model: Dynamic Sitemap Generator theo chuẩn Google Search Central 2026.
// Tự động thu thập và đồng bộ hóa toàn bộ cây URL của Storefront:
// 1. Static Core Routes (Trang chủ, Bảng giá xe, Tin tức, Dự toán lăn bánh, Mua trả góp, Liên hệ).
// 2. Landing Pages Phân khúc xe (/dong-xe/sedan, /dong-xe/suv, /dong-xe/mpv).
// 3. Dynamic Car Detail Pages (/xe/[slug]).
// 4. Dynamic News & Article Pages (/tin-tuc/[slug]).
// 5. Dynamic CMS Static Pages (/[slug]).
// Hỗ trợ lastModified, changeFrequency và priority tối ưu Indexing Budget của Googlebot.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getStorefrontSettings();
  const baseUrl = (settings.site?.siteUrl || 'https://xehyundaivinh.com').replace(/\/$/, '');

  const now = new Date();

  // 1. Static Core Landing Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/xe`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gia-lan-banh`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tra-gop`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // 2. Segment Landing Pages (/dong-xe/[slug])
  const segmentRoutes: MetadataRoute.Sitemap = getAllSegmentSlugs().map((slug) => ({
    url: `${baseUrl}/dong-xe/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 3. Dynamic Car Detail Pages (/xe/[slug])
  let carRoutes: MetadataRoute.Sitemap = [];
  try {
    const cars = await carsService.getCatalogCars();
    carRoutes = cars
      .filter((c) => c.status === 'published' || !c.status)
      .map((car) => ({
        url: `${baseUrl}/xe/${car.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      }));
  } catch (err) {
    console.warn('[Sitemap] Không thể nạp danh sách xe:', err);
  }

  // 4. Dynamic News & Article Pages (/tin-tuc/[slug])
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const postsRes = await apiClient.get<any>('/api/posts', { limit: 100 });
    const postsList: any[] = Array.isArray(postsRes) ? postsRes : postsRes?.data || [];
    postRoutes = postsList
      .filter((p) => p.slug && p.status !== 'draft')
      .map((post) => ({
        url: `${baseUrl}/tin-tuc/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : post.publishedAt ? new Date(post.publishedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
  } catch (err) {
    console.warn('[Sitemap] Không thể nạp danh sách bài viết:', err);
  }

  // 5. Dynamic CMS Static Pages (/[slug])
  let staticPageRoutes: MetadataRoute.Sitemap = [];
  try {
    const pages = await pagesService.getPublishedPages();
    staticPageRoutes = pages
      .filter((p) => p.isPublished && p.slug && !['trang-chu', 'home', 'index'].includes(p.slug))
      .map((page) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
  } catch (err) {
    console.warn('[Sitemap] Không thể nạp danh sách trang tĩnh:', err);
  }

  return [
    ...staticRoutes,
    ...segmentRoutes,
    ...carRoutes,
    ...postRoutes,
    ...staticPageRoutes,
  ];
}
