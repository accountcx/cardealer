import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq, desc, and, or, ilike, count, sql } from 'drizzle-orm';
import { authenticateAdmin, checkPermission } from '../../middleware/rbac';
import { UpdateLeadStatusSchema, type LeadStatus } from '@cardealer/types';

// 🧠 Mental Model: Router Quản Trị Khách Hàng Tiềm Năng (Admin CRM Leads).
// 1. RBAC Guard (R4): Bắt buộc xác thực Bearer JWT token.
//    - 'leads:read': Quyền xem danh sách & chi tiết (admin, manager, sales, editor).
//    - 'leads:write': Quyền cập nhật trạng thái & ghi chú (admin, manager, sales).
// 2. Phân trang Server-side (R13): Limit max 100, bảo đảm hiệu năng khi dữ liệu vượt 10.000 records.
// 3. Tối ưu tìm kiếm qua Index (phone, created_at) & (status, created_at).

export async function handleAdminLeadRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;

  // 1. GET /api/admin/leads: Danh sách leads có phân trang & bộ lọc
  if (pathname === '/api/admin/leads' && req.method === 'GET') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'leads:read')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền truy cập dữ liệu khách hàng' },
      });
      return true;
    }

    try {
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
      const offset = (page - 1) * limit;
      const statusFilter = url.searchParams.get('status') as LeadStatus | null;
      const searchQuery = url.searchParams.get('search')?.trim();

      const conditions = [];

      if (statusFilter && ['new', 'contacted', 'converted', 'cancelled'].includes(statusFilter)) {
        conditions.push(eq(schema.leads.status, statusFilter));
      }

      if (searchQuery) {
        conditions.push(
          or(
            ilike(schema.leads.fullName, `%${searchQuery}%`),
            ilike(schema.leads.phone, `%${searchQuery}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Đếm tổng số bản ghi
      const [totalCount] = await db
        .select({ count: count() })
        .from(schema.leads)
        .where(whereClause);

      const total = Number(totalCount?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // Truy vấn danh sách bản ghi
      const items = await db.query.leads.findMany({
        where: whereClause,
        orderBy: [desc(schema.leads.createdAt)],
        limit,
        offset,
        with: {
          carVersion: {
            with: {
              car: true,
            },
          },
        },
      });

      sendJson(200, {
        success: true,
        data: {
          items,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        },
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn danh sách Leads từ database';
      console.error('[Admin Leads Error]:', msg);
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_ERROR', message: msg },
      });
      return true;
    }
  }

  // 2. GET /api/admin/leads/:id: Chi tiết một lead
  if (pathname.startsWith('/api/admin/leads/') && !pathname.endsWith('/status') && req.method === 'GET') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }

    if (!checkPermission(auth.user!.role, 'leads:read')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem chi tiết khách hàng' },
      });
      return true;
    }

    const leadId = pathname.replace('/api/admin/leads/', '');
    try {
      const lead = await db.query.leads.findFirst({
        where: eq(schema.leads.id, leadId),
        with: {
          carVersion: {
            with: {
              car: true,
            },
          },
        },
      });

      if (!lead) {
        sendJson(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Không tìm thấy thông tin khách hàng' },
        });
        return true;
      }

      sendJson(200, { success: true, data: lead });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải thông tin lead';
      sendJson(500, { success: false, error: { code: 'SERVER_ERROR', message: msg } });
      return true;
    }
  }

  // 3. PATCH /api/admin/leads/:id/status: Cập nhật trạng thái lead & ghi chú tư vấn
  if (pathname.startsWith('/api/admin/leads/') && pathname.endsWith('/status') && req.method === 'PATCH') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'leads:write')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền cập nhật trạng thái khách hàng' },
      });
      return true;
    }

    const leadId = pathname.replace('/api/admin/leads/', '').replace('/status', '');

    try {
      const body = await readBody();
      const parseResult = UpdateLeadStatusSchema.safeParse(body);

      if (!parseResult.success) {
        sendJson(400, {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'Dữ liệu trạng thái không hợp lệ',
          },
        });
        return true;
      }

      const { status, notes } = parseResult.data;

      // Tìm lead hiện tại
      const existingLead = await db.query.leads.findFirst({
        where: eq(schema.leads.id, leadId),
      });

      if (!existingLead) {
        sendJson(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Không tìm thấy khách hàng cần cập nhật' },
        });
        return true;
      }

      // Xử lý ghi chú: Append thêm dòng ghi chú kèm tên nhân viên và thời gian (R12)
      let updatedNotes = existingLead.notes || '';
      if (notes && notes.trim()) {
        const timestampStr = new Date().toLocaleString('vi-VN');
        const appendText = `[${timestampStr} - ${currentUser.fullName} (${currentUser.role})]: ${notes.trim()}`;
        updatedNotes = updatedNotes ? `${updatedNotes}\n${appendText}` : appendText;
      }

      const [updatedLead] = await db
        .update(schema.leads)
        .set({
          status,
          notes: updatedNotes,
          updatedAt: new Date(),
        })
        .where(eq(schema.leads.id, leadId))
        .returning();

      sendJson(200, {
        success: true,
        data: updatedLead,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái lead';
      sendJson(500, { success: false, error: { code: 'SERVER_ERROR', message: msg } });
      return true;
    }
  }

  return false;
}
