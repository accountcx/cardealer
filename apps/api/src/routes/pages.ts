import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq, and } from 'drizzle-orm';

/**
 * 🌐 Router Công Khai Truy Vấn Trang Tĩnh Theo Slug (Public Storefront API)
 * Bảo vệ chống lộ dữ liệu nháp (R14): Chỉ trả về dữ liệu khi is_published = true.
 * Cache-Control: Tối ưu TTFB cho crawler Google và Storefront Server Component.
 */
export async function handlePublicPageRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;

  // GET /api/public/pages/:slug
  const match = pathname.match(/^\/api\/public\/pages\/([a-zA-Z0-9-]+)$/);
  if (match && req.method === 'GET') {
    const slug = match[1];

    try {
      const page = await db.query.staticPages.findFirst({
        where: and(
          eq(schema.staticPages.slug, slug),
          eq(schema.staticPages.isPublished, true)
        ),
      });

      if (!page) {
        sendJson(404, {
          success: false,
          error: {
            code: 'PAGE_NOT_FOUND',
            message: 'Trang tĩnh không tồn tại hoặc chưa được xuất bản',
            timestamp: new Date().toISOString(),
          },
        });
        return true;
      }

      // Trả về dữ liệu trang công khai kèm Cache Header
      sendJson(
        200,
        {
          success: true,
          data: {
            id: page.id,
            title: page.title,
            slug: page.slug,
            content: page.content,
            templateType: page.templateType,
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            canonicalUrl: page.canonicalUrl,
            ogImage: page.ogImage,
            noIndex: page.noIndex,
            schemaType: page.schemaType,
            updatedAt: page.updatedAt,
          },
        },
        {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        }
      );
      return true;
    } catch (error) {
      console.error(`[API] Lỗi khi truy vấn trang tĩnh public /${slug}:`, error);
      sendJson(500, {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Lỗi máy chủ khi truy vấn trang tĩnh',
          timestamp: new Date().toISOString(),
        },
      });
      return true;
    }
  }

  return false;
}
