// 🧠 Mental Model: Quản trị Hồ sơ Cá nhân & Đổi Mật khẩu Quản trị.
// Triệt tiêu nguy cơ leo thang đặc quyền (R1: Tuyệt đối không cho phép đổi role qua profile)
// và vô hiệu hóa phiên cũ khi đổi mật khẩu (R4: Tăng tokenVersion trong DB).
import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema, type UserRow } from '@cardealer/database';
import { eq, sql } from 'drizzle-orm';
import { comparePassword, hashPassword, signToken } from '../../auth';
import { authenticateAdmin, getClientIp } from '../../middleware/rbac';
import { recordAuditLog } from '../../services/audit.service';
import { UpdateProfileSchema, ChangePasswordSchema } from '@cardealer/types';

function sanitizeUser(u: UserRow) {
  const { passwordHash: _, ...safeUser } = u;
  return safeUser;
}

export async function handleProfileRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;

  // 1. GET /api/admin/profile
  if (pathname === '/api/admin/profile' && req.method === 'GET') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }

    sendJson(200, {
      success: true,
      data: sanitizeUser(auth.user!),
    });
    return true;
  }

  // 2. PUT /api/admin/profile (Cập nhật thông tin cá nhân - Chặn tuyệt đối đổi role/status/email - R1)
  if (pathname === '/api/admin/profile' && req.method === 'PUT') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    const rawBody = await readBody();
    const parseResult = UpdateProfileSchema.safeParse(rawBody);
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
      const [updated] = await db
        .update(schema.users)
        .set({
          fullName: parseResult.data.fullName.trim(),
          phone: parseResult.data.phone ? parseResult.data.phone.trim() : null,
          avatarUrl: parseResult.data.avatarUrl ? parseResult.data.avatarUrl.trim() : null,
        })
        .where(eq(schema.users.id, currentUser.id))
        .returning();

      await recordAuditLog({
        userId: currentUser.id,
        action: 'PROFILE_UPDATED',
        resource: 'user',
        resourceId: currentUser.id,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { fullName: updated.fullName, phone: updated.phone },
      });

      sendJson(200, {
        success: true,
        data: sanitizeUser(updated),
        message: 'Cập nhật hồ sơ cá nhân thành công',
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  // 3. POST /api/admin/profile/change-password
  if (pathname === '/api/admin/profile/change-password' && req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }
    const currentUser = auth.user!;

    const rawBody = await readBody();
    const parseResult = ChangePasswordSchema.safeParse(rawBody);
    if (!parseResult.success) {
      sendJson(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Mật khẩu không hợp lệ',
        },
      });
      return true;
    }

    const { currentPassword, newPassword } = parseResult.data;

    // Kiểm tra mật khẩu hiện tại
    if (!comparePassword(currentPassword, currentUser.passwordHash)) {
      sendJson(400, {
        success: false,
        error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Mật khẩu hiện tại không chính xác' },
      });
      return true;
    }

    try {
      const newHash = hashPassword(newPassword);

      // 🧠 R4 Mitigation: Tăng tokenVersion để hủy phiên đăng nhập ở các thiết bị khác
      const [updated] = await db
        .update(schema.users)
        .set({
          passwordHash: newHash,
          tokenVersion: sql`${schema.users.tokenVersion} + 1`,
        })
        .where(eq(schema.users.id, currentUser.id))
        .returning();

      // Sinh token mới với tokenVersion đã tăng
      const newToken = signToken({
        userId: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        tokenVersion: updated.tokenVersion,
      });

      await recordAuditLog({
        userId: currentUser.id,
        action: 'PASSWORD_CHANGED',
        resource: 'user',
        resourceId: currentUser.id,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      sendJson(
        200,
        {
          success: true,
          token: newToken,
          message: 'Đổi mật khẩu thành công! Các phiên làm việc khác đã được tự động đăng xuất.',
        },
        {
          'Set-Cookie': `admin_token=${newToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        }
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  return false;
}
