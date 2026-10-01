import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq, desc, and, or, ilike, count } from 'drizzle-orm';
import { authenticateAdmin, checkPermission } from '../../middleware/rbac';
import {
  createStaticPageSchema,
  updateStaticPageSchema,
  RESERVED_SLUGS,
  type StaticPageTemplate,
  type StaticPageSchemaType,
} from '@cardealer/types';

export async function handleAdminPageRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;

  // 1. GET /api/admin/pages: Danh sách trang tĩnh có phân trang & bộ lọc
  if (pathname === '/api/admin/pages' && req.method === 'GET') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'pages:read')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem danh sách trang tĩnh' },
      });
      return true;
    }

    try {
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
      const offset = (page - 1) * limit;
      const statusFilter = url.searchParams.get('status');
      const templateFilter = url.searchParams.get('templateType') as StaticPageTemplate | null;
      const searchQuery = url.searchParams.get('search')?.trim();

      const conditions = [];

      if (statusFilter === 'published') {
        conditions.push(eq(schema.staticPages.isPublished, true));
      } else if (statusFilter === 'draft') {
        conditions.push(eq(schema.staticPages.isPublished, false));
      }

      if (templateFilter && ['DEFAULT', 'PROFILE_SHOWROOM', 'TIMELINE', 'FINANCE'].includes(templateFilter)) {
        conditions.push(eq(schema.staticPages.templateType, templateFilter));
      }

      if (searchQuery) {
        conditions.push(
          or(
            ilike(schema.staticPages.title, `%${searchQuery}%`),
            ilike(schema.staticPages.slug, `%${searchQuery}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalRes] = await Promise.all([
        db.query.staticPages.findMany({
          where: whereClause,
          orderBy: [desc(schema.staticPages.updatedAt)],
          limit,
          offset,
        }),
        db.select({ count: count() }).from(schema.staticPages).where(whereClause),
      ]);

      const totalItems = totalRes[0]?.count || 0;
      const totalPages = Math.ceil(totalItems / limit) || 1;

      sendJson(200, {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
      });
      return true;
    } catch (error) {
      console.error('[API] Lỗi khi lấy danh sách trang tĩnh:', error);
      sendJson(500, {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi lấy danh sách trang tĩnh' },
      });
      return true;
    }
  }

  // 2. POST /api/admin/pages: Tạo mới trang tĩnh
  if (pathname === '/api/admin/pages' && req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'pages:write')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền tạo trang tĩnh' },
      });
      return true;
    }

    try {
      const rawBody = await readBody();
      const parseResult = createStaticPageSchema.safeParse(rawBody);

      if (!parseResult.success) {
        sendJson(422, {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Dữ liệu trang tĩnh không hợp lệ',
            details: parseResult.error.issues.map((i) => ({ field: i.path.join('.'), issue: i.message })),
          },
        });
        return true;
      }

      const validated = parseResult.data;

      // Kiểm tra trùng lặp slug trong DB
      const existing = await db.query.staticPages.findFirst({
        where: eq(schema.staticPages.slug, validated.slug),
      });

      if (existing) {
        sendJson(409, {
          success: false,
          error: { code: 'SLUG_ALREADY_EXISTS', message: `Slug '${validated.slug}' đã tồn tại, vui lòng chọn tên khác` },
        });
        return true;
      }

      const [newPage] = await db.insert(schema.staticPages).values({
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        templateType: validated.templateType,
        isPublished: validated.isPublished,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
        canonicalUrl: validated.canonicalUrl,
        ogImage: validated.ogImage,
        noIndex: validated.noIndex,
        schemaType: validated.schemaType,
        createdBy: currentUser.id,
        updatedBy: currentUser.id,
      }).returning();

      sendJson(201, {
        success: true,
        data: newPage,
      });
      return true;
    } catch (error) {
      console.error('[API] Lỗi khi tạo trang tĩnh:', error);
      sendJson(500, {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi tạo trang tĩnh' },
      });
      return true;
    }
  }

  // 3. GET /api/admin/pages/:id: Lấy chi tiết trang tĩnh
  const idMatch = pathname.match(/^\/api\/admin\/pages\/([a-zA-Z0-9-]+)$/);
  if (idMatch && req.method === 'GET') {
    const pageId = idMatch[1];
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'pages:read')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem chi tiết trang tĩnh' },
      });
      return true;
    }

    try {
      const page = await db.query.staticPages.findFirst({
        where: eq(schema.staticPages.id, pageId),
      });

      if (!page) {
        sendJson(404, {
          success: false,
          error: { code: 'PAGE_NOT_FOUND', message: 'Không tìm thấy trang tĩnh' },
        });
        return true;
      }

      sendJson(200, {
        success: true,
        data: page,
      });
      return true;
    } catch (error) {
      console.error('[API] Lỗi khi lấy chi tiết trang tĩnh:', error);
      sendJson(500, {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi lấy chi tiết trang tĩnh' },
      });
      return true;
    }
  }

  // 4. PUT /api/admin/pages/:id: Cập nhật trang tĩnh
  if (idMatch && req.method === 'PUT') {
    const pageId = idMatch[1];
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'pages:write')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền cập nhật trang tĩnh' },
      });
      return true;
    }

    try {
      const rawBody = await readBody();
      const parseResult = updateStaticPageSchema.safeParse(rawBody);

      if (!parseResult.success) {
        sendJson(422, {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Dữ liệu cập nhật không hợp lệ',
            details: parseResult.error.issues.map((i) => ({ field: i.path.join('.'), issue: i.message })),
          },
        });
        return true;
      }

      const validated = parseResult.data;

      // Kiểm tra trang có tồn tại không
      const existing = await db.query.staticPages.findFirst({
        where: eq(schema.staticPages.id, pageId),
      });

      if (!existing) {
        sendJson(404, {
          success: false,
          error: { code: 'PAGE_NOT_FOUND', message: 'Không tìm thấy trang tĩnh để cập nhật' },
        });
        return true;
      }

      // Nếu có cập nhật slug, kiểm tra slug mới có bị trùng không
      if (validated.slug && validated.slug !== existing.slug) {
        const slugConflict = await db.query.staticPages.findFirst({
          where: eq(schema.staticPages.slug, validated.slug),
        });

        if (slugConflict) {
          sendJson(409, {
            success: false,
            error: { code: 'SLUG_ALREADY_EXISTS', message: `Slug '${validated.slug}' đã tồn tại ở trang khác` },
          });
          return true;
        }
      }

      const [updatedPage] = await db.update(schema.staticPages)
        .set({
          ...validated,
          updatedBy: currentUser.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.staticPages.id, pageId))
        .returning();

      sendJson(200, {
        success: true,
        data: updatedPage,
      });
      return true;
    } catch (error) {
      console.error('[API] Lỗi khi cập nhật trang tĩnh:', error);
      sendJson(500, {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi cập nhật trang tĩnh' },
      });
      return true;
    }
  }

  // 5. DELETE /api/admin/pages/:id: Xóa trang tĩnh
  if (idMatch && req.method === 'DELETE') {
    const pageId = idMatch[1];
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'pages:delete')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa trang tĩnh' },
      });
      return true;
    }

    try {
      const existing = await db.query.staticPages.findFirst({
        where: eq(schema.staticPages.id, pageId),
      });

      if (!existing) {
        sendJson(404, {
          success: false,
          error: { code: 'PAGE_NOT_FOUND', message: 'Không tìm thấy trang tĩnh để xóa' },
        });
        return true;
      }

      await db.delete(schema.staticPages).where(eq(schema.staticPages.id, pageId));

      sendJson(200, {
        success: true,
        message: 'Đã xóa trang tĩnh thành công',
      });
      return true;
    } catch (error) {
      console.error('[API] Lỗi khi xóa trang tĩnh:', error);
      sendJson(500, {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi xóa trang tĩnh' },
      });
      return true;
    }
  }

  return false;
}
