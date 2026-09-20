// 🧠 Mental Model: RBAC Route Guard & Token State-Machine Enforcement.
// Thực thi bảo mật Zero-Trust: Kiểm tra tokenVersion tức thì từ DB (R4)
// và xác thực ma trận phân quyền không cho phép vượt cấp (R1, R6).
import { IncomingMessage } from 'node:http';
import { db, schema, type UserRow } from '@cardealer/database';
import { eq } from 'drizzle-orm';
import { verifyToken, parseCookies } from '../auth';
import { hasPermission, type Role, type PermissionAction } from '@cardealer/types';

export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

export interface AuthResult {
  user?: UserRow;
  token?: string;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export async function authenticateAdmin(req: IncomingMessage): Promise<AuthResult> {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer ')) 
    ? authHeader.replace('Bearer ', '').trim() 
    : cookies['admin_token'];

  if (!token) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn',
        statusCode: 401,
      },
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      error: {
        code: 'INVALID_TOKEN',
        message: 'Mã token không hợp lệ hoặc đã hết hạn',
        statusCode: 401,
      },
    };
  }

  // Truy vấn DB kiểm tra trạng thái thực tế và token_version
  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.id, payload.userId),
    });

    if (!dbUser) {
      return {
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Tài khoản không tồn tại trong hệ thống',
          statusCode: 401,
        },
      };
    }

    // 1. Kiểm tra trạng thái tài khoản
    if (dbUser.status === 'suspended') {
      return {
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.',
          statusCode: 403,
        },
      };
    }

    if (dbUser.status === 'pending') {
      return {
        error: {
          code: 'ACCOUNT_PENDING',
          message: 'Tài khoản đang chờ kích hoạt.',
          statusCode: 403,
        },
      };
    }

    // 2. Kiểm tra thu hồi phiên tức thì (R4 Mitigation)
    const clientTokenVersion = payload.tokenVersion ?? 1;
    const dbTokenVersion = dbUser.tokenVersion ?? 1;
    if (clientTokenVersion !== dbTokenVersion) {
      return {
        error: {
          code: 'TOKEN_REVOKED',
          message: 'Phiên đăng nhập đã bị hủy (mật khẩu đổi hoặc bị buộc đăng xuất). Vui lòng đăng nhập lại.',
          statusCode: 401,
        },
      };
    }

    return { user: dbUser, token };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      error: {
        code: 'DATABASE_ERROR',
        message: `Lỗi xác thực: ${msg}`,
        statusCode: 500,
      },
    };
  }
}

export function checkPermission(userRole: string, action: PermissionAction): boolean {
  return hasPermission(userRole as Role, action);
}
