import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq } from 'drizzle-orm';
import { comparePassword, signToken, verifyToken, parseCookies } from '../auth';

// 🧠 Mental Model: API Xác thực Quản trị viên (Authentication Routes).
// Tuyệt đối KHÔNG sử dụng fallback ngầm. Mọi thông tin tài khoản phải được xác thực trực tiếp
// qua bảng `users` trong PostgreSQL với mật khẩu mã hóa Bcrypt.

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

      const jwtToken = signToken({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });

      sendJson(
        200,
        {
          success: true,
          data: {
            user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
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

      sendJson(200, {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatarUrl: user.avatarUrl,
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
