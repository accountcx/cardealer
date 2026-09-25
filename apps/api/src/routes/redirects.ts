import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq, sql } from 'drizzle-orm';
import { normalizeRedirectPath } from '@cardealer/core';

// 🧠 Mental Model: Public Redirects Lookup Route (Độ trễ < 5ms).
// Phục vụ Next.js Middleware kiểm tra và bảo toàn 100% PageRank cho các URL cũ.
// Tự động tăng hitCount để quản trị viên thống kê được tần suất người dùng và bot truy cập link cũ.

export async function handleRedirectRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  if (url.pathname === '/api/redirects' && req.method === 'GET') {
    const rawPath = url.searchParams.get('path');

    // Trường hợp 1: Tra cứu cho 1 đường dẫn cụ thể
    if (rawPath) {
      const normalized = normalizeRedirectPath(rawPath);
      try {
        const found = await db.query.redirects.findFirst({
          where: eq(schema.redirects.oldPath, normalized),
        });

        if (!found) {
          sendJson(200, { success: true, data: null });
          return true;
        }

        // Tăng hitCount bất đồng bộ (không chặn response)
        db.update(schema.redirects)
          .set({
            hitCount: sql`${schema.redirects.hitCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(schema.redirects.id, found.id))
          .catch((err) => console.error('[Redirects] Lỗi cập nhật hitCount:', err));

        sendJson(200, {
          success: true,
          data: {
            oldPath: found.oldPath,
            newPath: found.newPath,
            statusCode: found.statusCode,
          },
        });
        return true;
      } catch (err: unknown) {
        console.error('[Redirects] Lỗi tra cứu DB:', err);
        sendJson(500, {
          success: false,
          error: { code: 'DB_ERROR', message: 'Lỗi truy vấn bảng redirects' },
        });
        return true;
      }
    }

    // Trường hợp 2: Lấy toàn bộ danh sách quy tắc chuyển hướng (phục vụ bộ đệm cache)
    try {
      const allRules = await db.query.redirects.findMany({
        columns: {
          oldPath: true,
          newPath: true,
          statusCode: true,
        },
      });

      sendJson(200, {
        success: true,
        data: allRules,
      });
      return true;
    } catch (err: unknown) {
      console.error('[Redirects] Lỗi lấy danh sách redirects:', err);
      sendJson(500, {
        success: false,
        error: { code: 'DB_ERROR', message: 'Lỗi lấy danh sách redirects' },
      });
      return true;
    }
  }

  return false;
}
