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

  const routeStartTime = Date.now();
  console.log('[AI Route] >>> Bắt đầu xử lý POST /api/admin/ai/generate');

  // 1. Kiểm tra quyền hạn quản trị viên (Fail-Closed)
  const auth = await authenticateAdmin(req);
  if (auth.error) {
    console.warn('[AI Route] ⚠️ Xác thực Admin thất bại:', auth.error);
    sendJson(auth.error.statusCode, { success: false, error: auth.error });
    return true;
  }

  if (!checkPermission(auth.user!.role, 'posts:write')) {
    console.warn(`[AI Route] ⚠️ User ${auth.user?.id} (${auth.user?.role}) không có quyền posts:write`);
    sendJson(403, {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Bạn không có quyền sử dụng tính năng Trợ lý AI viết bài.',
      },
    });
    return true;
  }

  console.log(`[AI Route] ✅ Xác thực thành công: User ${auth.user?.id} (${auth.user?.role})`);

  try {
    console.log('[AI Route] Đang đọc body request...');
    const rawBody = await readBody();
    console.log('[AI Route] Đã nhận rawBody:', {
      action: rawBody?.action,
      carModel: rawBody?.carModel,
      promptLength: typeof rawBody?.prompt === 'string' ? rawBody.prompt.length : 0,
      hasContext: Boolean(rawBody?.context),
    });

    const parseResult = AiGenerateRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues?.[0]?.message || 'Dữ liệu yêu cầu AI không hợp lệ';
      console.warn('[AI Route] ⚠️ Validate schema thất bại:', firstIssue, parseResult.error.issues);
      sendJson(400, {
        success: false,
        error: {
          code: 'INVALID_AI_REQUEST',
          message: firstIssue,
        },
      });
      return true;
    }

    console.log(`[AI Route] Bắt đầu gọi aiService.generate(action="${parseResult.data.action}")...`);
    const resultData = await aiService.generate(parseResult.data);
    const duration = Date.now() - routeStartTime;
    console.log(`[AI Route] ✅ Hoàn thành aiService.generate sau ${duration}ms! Trả về HTTP 200.`);

    sendJson(200, {
      success: true,
      data: resultData,
    });
    return true;
  } catch (error: unknown) {
    const duration = Date.now() - routeStartTime;
    console.error(`[AI Route] ❌ LỖI trong handleAdminAiRoutes sau ${duration}ms:`, error);
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
