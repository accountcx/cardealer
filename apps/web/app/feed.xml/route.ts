import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { getStorefrontSettings } from '@/services/settings.service';

export const revalidate = 3600; // Cache 1 giờ cho RSS feed

interface FeedPostItem {
  id?: string;
  slug?: string;
  tieuDe?: string;
  tomTat?: string;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
}

interface FeedApiResponse {
  data?: FeedPostItem[];
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 🧠 Mental Model: Dynamic RSS 2.0 Feed Generator theo chuẩn Google News và RSS Reader.
// Tự động tổng hợp 20 bài viết mới nhất phục vụ syndication và tăng tốc độ crawl của bot.
export async function GET() {
  const settings = await getStorefrontSettings();
  const baseUrl = (settings.site?.siteUrl || 'https://xehyundaivinh.com').replace(/\/$/, '');
  const siteTitle = escapeXml(settings.site?.siteTitle || 'Xe Hyundai Vinh');
  const siteDescription = escapeXml(
    settings.site?.defaultDescription || 'Tin tức thị trường ô tô Hyundai, ưu đãi lăn bánh và khuyến mãi xe mới nhất.'
  );

  let posts: FeedPostItem[] = [];
  try {
    const res = await apiClient.get<FeedPostItem[] | FeedApiResponse>('/api/posts', { limit: 20 });
    posts = Array.isArray(res) ? res : res?.data || [];
  } catch (err) {
    console.warn('[RSS Feed] Không thể nạp danh sách bài viết:', err);
  }

  const itemsXml = posts
    .filter((post) => post.slug && post.status !== 'draft')
    .map((post) => {
      const title = escapeXml(post.tieuDe || 'Tin tức xe Hyundai');
      const link = `${baseUrl}/tin-tuc/${post.slug}`;
      const pubDate = new Date(post.publishedAt || post.createdAt || Date.now()).toUTCString();
      const summary = escapeXml(post.tomTat || post.tieuDe || '');

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${summary}]]></description>
    </item>`;
    })
    .join('');

  const now = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>vi-VN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
