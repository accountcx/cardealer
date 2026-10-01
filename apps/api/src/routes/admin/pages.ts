import { IncomingMessage, ServerResponse } from 'node:http';
import { authenticateAdmin, checkPermission } from '../../middleware/rbac';
import {
  createStaticPageSchema,
  updateStaticPageSchema,
  type StaticPageTemplate,
} from '@cardealer/types';
import {
  listPagesService,
  findPageBySlugService,
  findPageByIdService,
  createPageService,
  updatePageService,
  deletePageService,
} from '../../services/pages.service';

// WHY: Regex kiểm tra tính hợp lệ của UUID v4 trước khi truy vấn database (CWE-20 / OWASP API1 Input Boundary Guard).
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// WHY: Structured Logger & Error Taxonomy (CWE-117, CWE-200, Observability Readiness).
// Khử \r\n chống Log Injection, phân loại Permanent (4xx logic) vs Transient (5xx/DB drop). Cấm ghi secret hay PII.
interface LogContext {
  action: string;
  method: string;
  path: string;
  userId?: string;
  errorType: 'TRANSIENT' | 'PERMANENT';
  error: unknown;
}

function logApiError(ctx: LogContext): void {
  const safeMessage = String(
    ctx.error instanceof Error ? ctx.error.message : ctx.error
  ).replace(/[\r\n]/g, ' ');

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      source: 'ADMIN_PAGES_ROUTER',
      action: ctx.action,
      method: ctx.method,
      path: ctx.path,
      userId: ctx.userId ?? 'ANONYMOUS',
      errorType: ctx.errorType,
      message: safeMessage,
    })
  );
}

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
    // WHY: Fail-Closed Auth Guard (R5). Bắt buộc xác thực và kiểm tra quyền trước khi truy xuất dữ liệu.
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'pages:read')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem danh sách trang tĩnh' } });
      return true;
    }

    try {
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
      const statusFilter = url.searchParams.get('status');
      const templateFilter = url.searchParams.get('templateType') as StaticPageTemplate | null;
      const searchQuery = url.searchParams.get('search')?.trim();

      const result = await listPagesService({ page, limit, statusFilter, templateFilter, searchQuery });
      sendJson(200, { success: true, data: result });
      return true;
    } catch (error) {
      logApiError({
        action: 'LIST_PAGES',
        method: req.method || 'GET',
        path: pathname,
        userId: currentUser.id,
        errorType: 'TRANSIENT',
        error,
      });
      sendJson(500, { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi lấy danh sách trang tĩnh' } });
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
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền tạo trang tĩnh' } });
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

      // WHY: Kiểm tra tính duy nhất của slug trước khi insert để trả thông báo 409 thân thiện (R13 Idempotency).
      const existing = await findPageBySlugService(validated.slug);
      if (existing) {
        sendJson(409, { success: false, error: { code: 'SLUG_ALREADY_EXISTS', message: `Slug '${validated.slug}' đã tồn tại, vui lòng chọn tên khác` } });
        return true;
      }

      const newPage = await createPageService(validated, currentUser.id);
      sendJson(201, { success: true, data: newPage });
      return true;
    } catch (error) {
      logApiError({
        action: 'CREATE_PAGE',
        method: req.method || 'POST',
        path: pathname,
        userId: currentUser.id,
        errorType: 'TRANSIENT',
        error,
      });
      sendJson(500, { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi tạo trang tĩnh' } });
      return true;
    }
  }

  // Phân tích route có param :id
  const idMatch = pathname.match(/^\/api\/admin\/pages\/([a-zA-Z0-9-]+)$/);
  if (!idMatch) return false;

  const pageId = idMatch[1];
  // WHY: Xác thực định dạng UUID ngăn chặn tấn công malformed ID hoặc quét bừa bãi (CWE-20 Input Validation).
  if (!UUID_REGEX.test(pageId)) {
    sendJson(400, { success: false, error: { code: 'INVALID_ID', message: 'ID trang tĩnh không đúng định dạng UUID' } });
    return true;
  }

  const auth = await authenticateAdmin(req);
  if (auth.error) {
    sendJson(auth.error.statusCode, { success: false, error: auth.error });
    return true;
  }
  const currentUser = auth.user!;

  // 3. GET /api/admin/pages/:id: Lấy chi tiết trang tĩnh
  if (req.method === 'GET') {
    if (!checkPermission(currentUser.role, 'pages:read')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem chi tiết trang tĩnh' } });
      return true;
    }

    try {
      const page = await findPageByIdService(pageId);
      if (!page) {
        sendJson(404, { success: false, error: { code: 'PAGE_NOT_FOUND', message: 'Không tìm thấy trang tĩnh' } });
        return true;
      }
      sendJson(200, { success: true, data: page });
      return true;
    } catch (error) {
      logApiError({
        action: 'GET_PAGE_DETAIL',
        method: req.method || 'GET',
        path: pathname,
        userId: currentUser.id,
        errorType: 'TRANSIENT',
        error,
      });
      sendJson(500, { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi lấy chi tiết trang tĩnh' } });
      return true;
    }
  }

  // 4. PUT /api/admin/pages/:id: Cập nhật trang tĩnh
  if (req.method === 'PUT') {
    if (!checkPermission(currentUser.role, 'pages:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền cập nhật trang tĩnh' } });
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
      const existing = await findPageByIdService(pageId);
      if (!existing) {
        sendJson(404, { success: false, error: { code: 'PAGE_NOT_FOUND', message: 'Không tìm thấy trang tĩnh để cập nhật' } });
        return true;
      }

      if (validated.slug && validated.slug !== existing.slug) {
        const slugConflict = await findPageBySlugService(validated.slug);
        if (slugConflict) {
          sendJson(409, { success: false, error: { code: 'SLUG_ALREADY_EXISTS', message: `Slug '${validated.slug}' đã tồn tại ở trang khác` } });
          return true;
        }
      }

      const updatedPage = await updatePageService(pageId, validated, currentUser.id);
      sendJson(200, { success: true, data: updatedPage });
      return true;
    } catch (error) {
      logApiError({
        action: 'UPDATE_PAGE',
        method: req.method || 'PUT',
        path: pathname,
        userId: currentUser.id,
        errorType: 'TRANSIENT',
        error,
      });
      sendJson(500, { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi cập nhật trang tĩnh' } });
      return true;
    }
  }

  // 5. DELETE /api/admin/pages/:id: Xóa trang tĩnh
  if (req.method === 'DELETE') {
    if (!checkPermission(currentUser.role, 'pages:delete')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa trang tĩnh' } });
      return true;
    }

    try {
      const existing = await findPageByIdService(pageId);
      if (!existing) {
        sendJson(404, { success: false, error: { code: 'PAGE_NOT_FOUND', message: 'Không tìm thấy trang tĩnh để xóa' } });
        return true;
      }

      await deletePageService(pageId);
      sendJson(200, { success: true, message: 'Đã xóa trang tĩnh thành công' });
      return true;
    } catch (error) {
      logApiError({
        action: 'DELETE_PAGE',
        method: req.method || 'DELETE',
        path: pathname,
        userId: currentUser.id,
        errorType: 'TRANSIENT',
        error,
      });
      sendJson(500, { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi máy chủ khi xóa trang tĩnh' } });
      return true;
    }
  }

  return false;
}
