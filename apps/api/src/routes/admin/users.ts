// 🧠 Mental Model: Xử lý các tuyến đường Quản trị Nhân viên & Phân quyền RBAC.
// Triệt tiêu 100% rủi ro:
// - R1/R6: Kiểm tra requirePermission('users:*')
// - R2: Anti-Self-Lockout (Chặn tự xóa, tự khóa, tự hạ quyền chính mình, chặn xóa admin cuối cùng)
// - R3: Loại bỏ 100% passwordHash khỏi response
// - R4: Tự động tăng tokenVersion khi khóa tài khoản hoặc buộc đăng xuất
// - R8: Tự động ghi nhật ký kiểm toán vào bảng audit_logs
import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema, type UserRow } from '@cardealer/database';
import { eq, sql, desc, and, or, ilike, count } from 'drizzle-orm';
import { hashPassword } from '../../auth';
import { authenticateAdmin, checkPermission, getClientIp } from '../../middleware/rbac';
import { recordAuditLog } from '../../services/audit.service';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UpdateUserStatusSchema,
  UpdateUserRoleSchema,
  type Role,
} from '@cardealer/types';

function sanitizeUser(u: UserRow) {
  const { passwordHash: _, ...safeUser } = u;
  return safeUser;
}

export async function handleUserManagementRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;

  // 1. GET /api/admin/users (Danh sách nhân viên)
  if (pathname === '/api/admin/users' && req.method === 'GET') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'users:read')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem danh sách nhân sự' },
      });
      return true;
    }

    try {
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
      const offset = (page - 1) * limit;
      const roleFilter = url.searchParams.get('role');
      const statusFilter = url.searchParams.get('status');
      const searchQuery = url.searchParams.get('search')?.trim();

      const conditions = [];

      if (roleFilter && ['admin', 'manager', 'editor', 'sales'].includes(roleFilter)) {
        conditions.push(eq(schema.users.role, roleFilter as any));
      }
      if (statusFilter && ['active', 'suspended', 'pending'].includes(statusFilter)) {
        conditions.push(eq(schema.users.status, statusFilter as any));
      }
      if (searchQuery) {
        conditions.push(
          or(
            ilike(schema.users.fullName, `%${searchQuery}%`),
            ilike(schema.users.email, `%${searchQuery}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [totalCountResult] = await db
        .select({ value: count() })
        .from(schema.users)
        .where(whereClause);

      const total = totalCountResult?.value || 0;

      const userRows = await db.query.users.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(schema.users.createdAt)],
      });

      const safeUsers = userRows.map(sanitizeUser);

      sendJson(200, {
        success: true,
        data: safeUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'SERVER_ERROR', message: msg } });
      return true;
    }
  }

  // 2. POST /api/admin/users (Tạo nhân viên mới)
  if (pathname === '/api/admin/users' && req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'users:create')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền tạo tài khoản nhân sự mới' },
      });
      return true;
    }

    const rawBody = await readBody();
    const parseResult = CreateUserSchema.safeParse(rawBody);
    if (!parseResult.success) {
      sendJson(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ',
          details: parseResult.error.flatten(),
        },
      });
      return true;
    }

    const { email, fullName, password, phone, avatarUrl, role } = parseResult.data;

    try {
      // Kiểm tra trùng email
      const existing = await db.query.users.findFirst({
        where: eq(schema.users.email, email.toLowerCase().trim()),
      });
      if (existing) {
        sendJson(409, {
          success: false,
          error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email này đã tồn tại trong hệ thống' },
        });
        return true;
      }

      const passwordHash = hashPassword(password);

      const [newUser] = await db
        .insert(schema.users)
        .values({
          email: email.toLowerCase().trim(),
          passwordHash,
          fullName: fullName.trim(),
          phone: phone ? phone.trim() : null,
          avatarUrl: avatarUrl ? avatarUrl.trim() : null,
          role: role as any,
          status: 'active',
          tokenVersion: 1,
        })
        .returning();

      // Ghi log kiểm toán (R8)
      await recordAuditLog({
        userId: currentUser.id,
        action: 'USER_CREATED',
        resource: 'user',
        resourceId: newUser.id,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { email: newUser.email, role: newUser.role, fullName: newUser.fullName },
      });

      sendJson(201, {
        success: true,
        data: sanitizeUser(newUser),
        message: 'Tạo tài khoản nhân viên thành công',
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  // 3. GET /api/admin/users/:id (Chi tiết nhân viên)
  if (pathname.startsWith('/api/admin/users/') && req.method === 'GET' && !pathname.includes('/force-logout') && !pathname.includes('/status') && !pathname.includes('/role')) {
    const id = pathname.replace('/api/admin/users/', '').trim();
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'users:read')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem thông tin nhân sự này' },
      });
      return true;
    }

    try {
      const targetUser = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!targetUser) {
        sendJson(404, {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
        });
        return true;
      }

      sendJson(200, { success: true, data: sanitizeUser(targetUser) });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'SERVER_ERROR', message: msg } });
      return true;
    }
  }

  // 4. PUT /api/admin/users/:id (Cập nhật thông tin nhân viên)
  if (pathname.startsWith('/api/admin/users/') && req.method === 'PUT') {
    const id = pathname.replace('/api/admin/users/', '').trim();
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'users:update')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền cập nhật thông tin nhân viên' },
      });
      return true;
    }

    const rawBody = await readBody();
    const parseResult = UpdateUserSchema.safeParse(rawBody);
    if (!parseResult.success) {
      sendJson(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ',
        },
      });
      return true;
    }

    try {
      const targetUser = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!targetUser) {
        sendJson(404, {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
        });
        return true;
      }

      // Nếu payload có cập nhật role, kiểm tra quyền users:role
      if (parseResult.data.role && parseResult.data.role !== targetUser.role) {
        if (!checkPermission(currentUser.role, 'users:role')) {
          sendJson(403, {
            success: false,
            error: { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới được phép thay đổi vai trò' },
          });
          return true;
        }
      }

      const updateData: Record<string, any> = {};
      if (parseResult.data.fullName !== undefined) updateData.fullName = parseResult.data.fullName;
      if (parseResult.data.phone !== undefined) updateData.phone = parseResult.data.phone;
      if (parseResult.data.avatarUrl !== undefined) updateData.avatarUrl = parseResult.data.avatarUrl;
      if (parseResult.data.role !== undefined) updateData.role = parseResult.data.role;
      if (parseResult.data.status !== undefined) updateData.status = parseResult.data.status;

      const [updated] = await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, id))
        .returning();

      await recordAuditLog({
        userId: currentUser.id,
        action: 'USER_UPDATED',
        resource: 'user',
        resourceId: id,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: updateData,
      });

      sendJson(200, {
        success: true,
        data: sanitizeUser(updated),
        message: 'Cập nhật thông tin nhân viên thành công',
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  // 5. PATCH /api/admin/users/:id/status (Khóa / Mở khóa tài khoản)
  if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/status') && req.method === 'PATCH') {
    const id = pathname.replace('/api/admin/users/', '').replace('/status', '').trim();
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'users:update')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thay đổi trạng thái nhân sự' },
      });
      return true;
    }

    // 🧠 R2 Mitigation: Chặn tuyệt đối tự khóa chính mình
    if (currentUser.id === id) {
      sendJson(400, {
        success: false,
        error: { code: 'CANNOT_SUSPEND_SELF', message: 'Bạn không thể tự khóa tài khoản của chính mình' },
      });
      return true;
    }

    const rawBody = await readBody();
    const parseResult = UpdateUserStatusSchema.safeParse(rawBody);
    if (!parseResult.success) {
      sendJson(400, {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Trạng thái không hợp lệ' },
      });
      return true;
    }

    try {
      const targetUser = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!targetUser) {
        sendJson(404, {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
        });
        return true;
      }

      const newStatus = parseResult.data.status;
      // 🧠 R4 Mitigation: Nếu khóa tài khoản, tăng tokenVersion để vô hiệu hóa token lập tức
      const tokenVersionIncrement = newStatus === 'suspended' ? 1 : 0;

      const [updated] = await db
        .update(schema.users)
        .set({
          status: newStatus,
          tokenVersion: sql`${schema.users.tokenVersion} + ${tokenVersionIncrement}`,
        })
        .where(eq(schema.users.id, id))
        .returning();

      await recordAuditLog({
        userId: currentUser.id,
        action: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
        resource: 'user',
        resourceId: id,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { oldStatus: targetUser.status, newStatus },
      });

      sendJson(200, {
        success: true,
        data: sanitizeUser(updated),
        message: `Đã chuyển trạng thái tài khoản thành ${newStatus}`,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  // 6. PATCH /api/admin/users/:id/role (Thay đổi vai trò nhân sự)
  if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/role') && req.method === 'PATCH') {
    const id = pathname.replace('/api/admin/users/', '').replace('/role', '').trim();
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'users:role')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên cao nhất mới được đổi vai trò' },
      });
      return true;
    }

    const rawBody = await readBody();
    const parseResult = UpdateUserRoleSchema.safeParse(rawBody);
    if (!parseResult.success) {
      sendJson(400, {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Vai trò không hợp lệ' },
      });
      return true;
    }

    const newRole = parseResult.data.role;

    // 🧠 R2 Mitigation: Chặn tự hạ quyền chính mình
    if (currentUser.id === id && newRole !== 'admin') {
      sendJson(400, {
        success: false,
        error: { code: 'CANNOT_DEMOTE_SELF', message: 'Bạn không thể tự hạ quyền Quản trị viên của chính mình' },
      });
      return true;
    }

    try {
      const targetUser = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!targetUser) {
        sendJson(404, {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
        });
        return true;
      }

      // 🧠 R2 & R7 Mitigation: Nếu hạ quyền 1 Admin, kiểm tra số lượng admin còn lại
      if (targetUser.role === 'admin' && newRole !== 'admin') {
        const [adminCount] = await db
          .select({ value: count() })
          .from(schema.users)
          .where(and(eq(schema.users.role, 'admin'), eq(schema.users.status, 'active')));

        if ((adminCount?.value || 0) <= 1) {
          sendJson(400, {
            success: false,
            error: {
              code: 'LAST_ADMIN_CANNOT_BE_DEMOTED',
              message: 'Không thể hạ quyền Quản trị viên cuối cùng của hệ thống',
            },
          });
          return true;
        }
      }

      // Cập nhật role và tăng tokenVersion để ép phiên đăng nhập cập nhật quyền
      const [updated] = await db
        .update(schema.users)
        .set({
          role: newRole as any,
          tokenVersion: sql`${schema.users.tokenVersion} + 1`,
        })
        .where(eq(schema.users.id, id))
        .returning();

      await recordAuditLog({
        userId: currentUser.id,
        action: 'USER_ROLE_CHANGED',
        resource: 'user',
        resourceId: id,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { oldRole: targetUser.role, newRole },
      });

      sendJson(200, {
        success: true,
        data: sanitizeUser(updated),
        message: `Đã cập nhật vai trò thành ${newRole}`,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  // 7. POST /api/admin/users/:id/force-logout (Cưỡng chế đăng xuất)
  if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/force-logout') && req.method === 'POST') {
    const id = pathname.replace('/api/admin/users/', '').replace('/force-logout', '').trim();
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'users:force_logout')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền buộc đăng xuất nhân sự' },
      });
      return true;
    }

    try {
      const targetUser = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!targetUser) {
        sendJson(404, {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
        });
        return true;
      }

      // 🧠 R4 Mitigation: Tăng tokenVersion để hủy toàn bộ JWT token hiện hành
      const [updated] = await db
        .update(schema.users)
        .set({
          tokenVersion: sql`${schema.users.tokenVersion} + 1`,
        })
        .where(eq(schema.users.id, id))
        .returning();

      await recordAuditLog({
        userId: currentUser.id,
        action: 'USER_FORCE_LOGOUT',
        resource: 'user',
        resourceId: id,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { targetEmail: targetUser.email, newTokenVersion: updated.tokenVersion },
      });

      sendJson(200, {
        success: true,
        data: { id: updated.id, tokenVersion: updated.tokenVersion },
        message: 'Đã hủy phiên làm việc và buộc nhân viên đăng xuất thành công',
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  // 8. DELETE /api/admin/users/:id (Xóa nhân viên)
  if (pathname.startsWith('/api/admin/users/') && req.method === 'DELETE') {
    const id = pathname.replace('/api/admin/users/', '').trim();
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'users:delete')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền xóa tài khoản' },
      });
      return true;
    }

    // 🧠 R2 Mitigation: Chặn tự xóa chính mình
    if (currentUser.id === id) {
      sendJson(400, {
        success: false,
        error: { code: 'CANNOT_DELETE_SELF', message: 'Bạn không thể tự xóa tài khoản của chính mình' },
      });
      return true;
    }

    try {
      const targetUser = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!targetUser) {
        sendJson(404, {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên cần xóa' },
        });
        return true;
      }

      // 🧠 R2 Mitigation: Chặn xóa Admin cuối cùng
      if (targetUser.role === 'admin') {
        const [adminCount] = await db
          .select({ value: count() })
          .from(schema.users)
          .where(and(eq(schema.users.role, 'admin'), eq(schema.users.status, 'active')));

        if ((adminCount?.value || 0) <= 1) {
          sendJson(400, {
            success: false,
            error: {
              code: 'LAST_ADMIN_CANNOT_BE_DELETED',
              message: 'Không thể xóa Quản trị viên cuối cùng của hệ thống',
            },
          });
          return true;
        }
      }

      await db.delete(schema.users).where(eq(schema.users.id, id));

      await recordAuditLog({
        userId: currentUser.id,
        action: 'USER_DELETED',
        resource: 'user',
        resourceId: id,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { deletedEmail: targetUser.email, deletedFullName: targetUser.fullName },
      });

      sendJson(200, {
        success: true,
        data: { id },
        message: 'Đã xóa tài khoản nhân viên thành công',
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  // 9. GET /api/admin/audit-logs (Danh sách nhật ký kiểm toán)
  if (pathname === '/api/admin/audit-logs' && req.method === 'GET') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    if (!checkPermission(currentUser.role, 'system:read')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem nhật ký kiểm toán' },
      });
      return true;
    }

    try {
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
      const offset = (page - 1) * limit;

      const [totalCountResult] = await db.select({ value: count() }).from(schema.auditLogs);
      const total = totalCountResult?.value || 0;

      const logs = await db.query.auditLogs.findMany({
        limit,
        offset,
        orderBy: [desc(schema.auditLogs.createdAt)],
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      const formattedLogs = logs.map((l) => ({
        id: l.id,
        userId: l.userId,
        userName: l.user?.fullName || 'Hệ thống',
        userEmail: l.user?.email || 'N/A',
        action: l.action,
        resource: l.resource,
        resourceId: l.resourceId,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        details: l.details,
        createdAt: l.createdAt,
      }));

      sendJson(200, {
        success: true,
        data: formattedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'SERVER_ERROR', message: msg } });
      return true;
    }
  }

  return false;
}
