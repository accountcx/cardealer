import { IncomingMessage, ServerResponse } from 'node:http';
import { authenticateAdmin, checkPermission } from '../../middleware/rbac';
import { AiGenerateRequestSchema } from '@cardealer/types';
import { aiService, AiServiceError } from '../../services/ai/ai.service';

// WHY: Tuyến đường Quản trị Trợ lý AI Viết Bài & Tối Ưu SEO (Admin AI Assistant Routes).
// 1. Kiểm tra xác thực Token & quyền hạn RBAC ('posts:write').
// 2. Validate payload qua AiGenerateRequestSchema (Zod).
// 3. Phân quyền và ủy thác logic sang AiService theo nguyên lý Single Responsibility Principle (SRP).
export async function handleAdminAiRoutes(
  req: IncomingMessage,
  _res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;

  // POST /api/admin/ai/generate
  if (pathname !== '/api/admin/ai/generate' || req.method !== 'POST') {
    return false;
  }

  // 1. Kiểm tra quyền hạn quản trị viên (Fail-Closed)
  const auth = await authenticateAdmin(req);
  if (auth.error) {
    sendJson(auth.error.statusCode, { success: false, error: auth.error });
    return true;
  }

  if (!checkPermission(auth.user!.role, 'posts:write')) {
    sendJson(403, {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Bạn không có quyền sử dụng tính năng Trợ lý AI viết bài.',
      },
    });
    return true;
  }

  try {
    const rawBody = await readBody();
    const parseResult = AiGenerateRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues?.[0]?.message || 'Dữ liệu yêu cầu AI không hợp lệ';
      sendJson(400, {
        success: false,
        error: {
          code: 'INVALID_AI_REQUEST',
          message: firstIssue,
        },
      });
      return true;
    }

    const resultData = await aiService.generate(parseResult.data);

    sendJson(200, {
      success: true,
      data: resultData,
    });
    return true;
  } catch (error: unknown) {
    if (error instanceof AiServiceError) {
      sendJson(error.statusCode, {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return true;
    }

    const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định khi xử lý trợ lý AI';
    sendJson(500, {
      success: false,
      error: {
        code: 'INTERNAL_AI_ERROR',
        message: errorMsg,
      },
    });
    return true;
  }
}
