import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq } from 'drizzle-orm';
import { comparePassword, signToken, verifyToken, parseCookies } from '../auth';
import { getClientIp } from '../middleware/rbac';
import { recordAuditLog } from '../services/audit.service';

// 🧠 Mental Model: API Xác thực Quản trị viên (Authentication Routes).
// Xác thực trực tiếp qua PostgreSQL với Bcrypt hash.
// Cập nhật lastLoginAt, lastLoginIp và ghi nhật ký đăng nhập.
// Vô hiệu hóa phiên lập tức nếu tài khoản bị khóa hoặc tokenVersion bị lệch (R4 Mitigation).

export async function handleAuthRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['admin_token'] || req.headers.authorization?.replace('Bearer ', '');

  // 1. POST /api/auth/login
  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await readBody();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });

      if (!user || !comparePassword(password, user.passwordHash)) {
        sendJson(401, {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Tài khoản hoặc mật khẩu không chính xác' },
        });
        return true;
      }

      // Kiểm tra trạng thái tài khoản
      if (user.status === 'suspended') {
        sendJson(403, {
          success: false,
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.',
          },
        });
        return true;
      }

      const clientIp = getClientIp(req);
      const now = new Date();

      // Cập nhật thời điểm đăng nhập cuối và IP
      await db
        .update(schema.users)
        .set({
          lastLoginAt: now,
          lastLoginIp: clientIp,
        })
        .where(eq(schema.users.id, user.id));

      const jwtToken = signToken({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });

      // Ghi nhật ký kiểm toán đăng nhập
      await recordAuditLog({
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'auth',
        resourceId: user.id,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'],
      });

      sendJson(
        200,
        {
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
              status: user.status,
              avatarUrl: user.avatarUrl,
            },
            token: jwtToken,
          },
        },
        {
          'Set-Cookie': `admin_token=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        }
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu khi đăng nhập';
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_AUTH_ERROR', message: msg },
      });
      return true;
    }
  }

  // 2. GET /api/auth/me
  if (url.pathname === '/api/auth/me' && req.method === 'GET') {
    if (!token) {
      sendJson(401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' } });
      return true;
    }

    const payload = verifyToken(token);
    if (!payload) {
      sendJson(401, {
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' },
      });
      return true;
    }

    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, payload.userId),
      });

      if (!user) {
        sendJson(401, {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Tài khoản không còn tồn tại trong cơ sở dữ liệu' },
        });
        return true;
      }

      if (user.status === 'suspended') {
        sendJson(403, {
          success: false,
          error: { code: 'ACCOUNT_SUSPENDED', message: 'Tài khoản đã bị tạm khóa' },
        });
        return true;
      }

      // Kiểm tra thu hồi token tức thì (R4)
      const clientTokenVersion = payload.tokenVersion ?? 1;
      const dbTokenVersion = user.tokenVersion ?? 1;
      if (clientTokenVersion !== dbTokenVersion) {
        sendJson(401, {
          success: false,
          error: { code: 'TOKEN_REVOKED', message: 'Phiên đăng nhập đã bị vô hiệu hóa. Vui lòng đăng nhập lại.' },
        });
        return true;
      }

      sendJson(200, {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatarUrl,
          lastLoginAt: user.lastLoginAt,
        },
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn thông tin tài khoản';
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_ERROR', message: msg },
      });
      return true;
    }
  }

  // 3. POST /api/auth/logout
  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    sendJson(
      200,
      { success: true, message: 'Đăng xuất thành công' },
      {
        'Set-Cookie': 'admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      }
    );
    return true;
  }

  return false;
}
