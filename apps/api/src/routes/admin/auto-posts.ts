import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq, desc, asc, count, and } from 'drizzle-orm';
import { authenticateAdmin, checkPermission } from '../../middleware/rbac';
import {
  UpdateAutoPostSettingsInputSchema,
  CreateContentPlanItemInputSchema,
  UpdateContentPlanItemInputSchema,
  GenerateEditorialPlanRequestSchema,
  IngestPlanRequestSchema,
  SyncQueueInputSchema,
  type EditorialPlanItem,
} from '@cardealer/types';
import { reschedulePendingItems } from '@cardealer/core';
import { autoPostSchedulerService } from '../../services/auto-post-scheduler.service';
import { aiService } from '../../services/ai/ai.service';

export async function handleAdminAutoPostRoutes(
  req: IncomingMessage,
  _res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;
  if (!pathname.startsWith('/api/admin/auto-posts')) {
    return false;
  }

  // 1. Kiểm tra xác thực Token Admin
  const auth = await authenticateAdmin(req);
  if (auth.error) {
    sendJson(auth.error.statusCode, { success: false, error: auth.error });
    return true;
  }

  const userRole = auth.user!.role;
  const method = req.method;

  // --------------------------------------------------------------------------
  // 1. GET /api/admin/auto-posts/settings
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/settings' && method === 'GET') {
    if (!checkPermission(userRole, 'posts:read')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền truy cập cấu hình' } });
      return true;
    }

    try {
      let settings = await db.query.autoPostSettings.findFirst({
        where: eq(schema.autoPostSettings.id, 'default'),
      });

      if (!settings) {
        const [created] = await db
          .insert(schema.autoPostSettings)
          .values({
            id: 'default',
            isEnabled: false,
            cronExpression: '0 8 * * *',
            defaultStatus: 'draft',
          })
          .returning();
        settings = created;
      }

      sendJson(200, {
        success: true,
        data: settings,
        isProcessing: autoPostSchedulerService.getIsProcessing(),
      });
      return true;
    } catch (err: unknown) {
      console.error('[AutoPost Settings] Lỗi GET settings:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải cấu hình lập lịch' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 2. PUT /api/admin/auto-posts/settings
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/settings' && method === 'PUT') {
    if (!checkPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền cập nhật cấu hình' } });
      return true;
    }

    try {
      const rawBody = await readBody();
      const parsed = UpdateAutoPostSettingsInputSchema.safeParse(rawBody);
      if (!parsed.success) {
        sendJson(400, {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Dữ liệu cấu hình không hợp lệ',
          },
        });
        return true;
      }

      const [updated] = await db
        .insert(schema.autoPostSettings)
        .values({
          id: 'default',
          isEnabled: parsed.data.isEnabled,
          cronExpression: parsed.data.cronExpression,
          defaultStatus: parsed.data.defaultStatus,
          defaultCategoryId: parsed.data.defaultCategoryId || null,
          defaultAuthorId: parsed.data.defaultAuthorId || null,
        })
        .onConflictDoUpdate({
          target: schema.autoPostSettings.id,
          set: {
            isEnabled: parsed.data.isEnabled,
            cronExpression: parsed.data.cronExpression,
            defaultStatus: parsed.data.defaultStatus,
            defaultCategoryId: parsed.data.defaultCategoryId || null,
            defaultAuthorId: parsed.data.defaultAuthorId || null,
            updatedAt: new Date(),
          },
        })
        .returning();

      // Reload lại Cron task trong memory
      await autoPostSchedulerService.reload();

      // Tự động đồng bộ giờ đăng hoặc tái phân bổ lịch cho các bài viết đang chờ trong hàng đợi
      let syncedCount = 0;
      if (parsed.data.syncPendingQueue !== false) {
        const pendingItems = await db.query.contentPlanItems.findMany({
          where: eq(schema.contentPlanItems.status, 'pending'),
          orderBy: [asc(schema.contentPlanItems.scheduledAt), asc(schema.contentPlanItems.createdAt)],
        });

        if (pendingItems.length > 0) {
          const rescheduleMode = parsed.data.syncMode || 'reschedule_all';
          let targetHour: number | undefined = undefined;
          let targetMinute: number | undefined = undefined;

          if (parsed.data.targetTime) {
            const [hStr, mStr] = parsed.data.targetTime.split(':');
            targetHour = parseInt(hStr || '8', 10);
            targetMinute = parseInt(mStr || '0', 10);
          }

          const rescheduled = reschedulePendingItems(pendingItems, {
            mode: rescheduleMode,
            targetHour,
            targetMinute,
            cronExpression: parsed.data.cronExpression,
            referenceDate: new Date(),
          });

          for (const item of rescheduled) {
            await db
              .update(schema.contentPlanItems)
              .set({
                scheduledAt: item.scheduledAt,
                updatedAt: new Date(),
              })
              .where(eq(schema.contentPlanItems.id, item.id));
          }
          syncedCount = rescheduled.length;
          console.log(`[AutoPost Settings] 🔄 Đã tự động cập nhật lịch cho ${syncedCount} bài viết trong hàng đợi (mode: ${rescheduleMode})`);
        }
      }

      sendJson(200, {
        success: true,
        data: {
          ...updated,
          syncedCount,
        },
        message:
          syncedCount > 0
            ? `Đã cập nhật cấu hình và tự động đồng bộ giờ đăng cho ${syncedCount} bài viết trong hàng đợi thành công!`
            : 'Đã cập nhật cấu hình lập lịch tự động viết bài thành công',
      });
      return true;
    } catch (err: unknown) {
      console.error('[AutoPost Settings] Lỗi PUT settings:', err);
      sendJson(500, { success: false, error: { code: 'SERVER_ERROR', message: 'Lỗi cập nhật cấu hình' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 3. GET /api/admin/auto-posts/plans (Danh sách hàng đợi)
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/plans' && method === 'GET') {
    if (!checkPermission(userRole, 'posts:read')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền đọc hàng đợi' } });
      return true;
    }

    try {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '20', 10)));
      const offset = (page - 1) * limit;
      const statusFilter = url.searchParams.get('status');

      const conditions = [];
      if (statusFilter && statusFilter !== 'all' && ['pending', 'processing', 'completed', 'failed'].includes(statusFilter)) {
        conditions.push(eq(schema.contentPlanItems.status, statusFilter as 'pending' | 'processing' | 'completed' | 'failed'));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [totalCountResult] = await db
        .select({ val: count() })
        .from(schema.contentPlanItems)
        .where(whereClause);
      const totalItems = Number(totalCountResult?.val || 0);

      const items = await db.query.contentPlanItems.findMany({
        where: whereClause,
        orderBy: [asc(schema.contentPlanItems.scheduledAt), desc(schema.contentPlanItems.createdAt)],
        limit,
        offset,
        with: {
          category: {
            columns: {
              id: true,
              tenChuyenMuc: true,
              slug: true,
            },
          },
        },
      });

      sendJson(200, {
        success: true,
        data: {
          items: items.map((item) => ({
            ...item,
            categoryName: item.category?.tenChuyenMuc || undefined,
          })),
          pagination: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
          },
        },
      });
      return true;
    } catch (err: unknown) {
      console.error('[AutoPost Plans] Lỗi GET plans:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải hàng đợi bài viết' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 4. POST /api/admin/auto-posts/plans (Thêm 1 mục vào hàng đợi)
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/plans' && method === 'POST') {
    if (!checkPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền tạo kế hoạch' } });
      return true;
    }

    try {
      const rawBody = await readBody();
      const parsed = CreateContentPlanItemInputSchema.safeParse(rawBody);
      if (!parsed.success) {
        sendJson(400, {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
        });
        return true;
      }

      const [created] = await db
        .insert(schema.contentPlanItems)
        .values({
          title: parsed.data.title,
          focusKeyword: parsed.data.focusKeyword,
          categoryId: parsed.data.categoryId || null,
          targetCar: parsed.data.targetCar || null,
          angle: parsed.data.angle || null,
          summary: parsed.data.summary || null,
          scheduledAt: new Date(parsed.data.scheduledAt),
          status: 'pending',
        })
        .returning();

      sendJson(201, {
        success: true,
        data: created,
        message: 'Đã thêm mục bài viết vào hàng đợi kế hoạch',
      });
      return true;
    } catch (err: unknown) {
      console.error('[AutoPost Plans] Lỗi POST plan item:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tạo mục kế hoạch mới' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 5. PATCH & DELETE /api/admin/auto-posts/plans/:id
  // --------------------------------------------------------------------------
  const planIdMatch = pathname.match(/^\/api\/admin\/auto-posts\/plans\/([a-zA-Z0-9_-]+)$/);
  if (planIdMatch) {
    const planId = planIdMatch[1];

    if (method === 'DELETE') {
      if (!checkPermission(userRole, 'posts:write')) {
        sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền xóa kế hoạch' } });
        return true;
      }

      try {
        await db.delete(schema.contentPlanItems).where(eq(schema.contentPlanItems.id, planId));
        sendJson(200, {
          success: true,
          data: { success: true, message: 'Đã xóa mục khỏi hàng đợi thành công' },
          message: 'Đã xóa mục khỏi hàng đợi thành công',
        });
        return true;
      } catch (err: unknown) {
        console.error('[AutoPost Plans] Lỗi DELETE plan item:', err);
        sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi xóa mục kế hoạch' } });
        return true;
      }
    }

    if (method === 'PATCH') {
      if (!checkPermission(userRole, 'posts:write')) {
        sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền sửa kế hoạch' } });
        return true;
      }

      try {
        const rawBody = await readBody();
        const parsed = UpdateContentPlanItemInputSchema.safeParse(rawBody);
        if (!parsed.success) {
          sendJson(400, {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
          });
          return true;
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
        if (parsed.data.focusKeyword !== undefined) updateData.focusKeyword = parsed.data.focusKeyword;
        if (parsed.data.categoryId !== undefined) updateData.categoryId = parsed.data.categoryId;
        if (parsed.data.targetCar !== undefined) updateData.targetCar = parsed.data.targetCar;
        if (parsed.data.angle !== undefined) updateData.angle = parsed.data.angle;
        if (parsed.data.summary !== undefined) updateData.summary = parsed.data.summary;
        if (parsed.data.scheduledAt !== undefined) updateData.scheduledAt = new Date(parsed.data.scheduledAt);
        if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

        const [updated] = await db
          .update(schema.contentPlanItems)
          .set(updateData)
          .where(eq(schema.contentPlanItems.id, planId))
          .returning();

        sendJson(200, { success: true, data: updated, message: 'Đã cập nhật mục kế hoạch' });
        return true;
      } catch (err: unknown) {
        console.error('[AutoPost Plans] Lỗi PATCH plan item:', err);
        sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi cập nhật mục kế hoạch' } });
        return true;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 6. POST /api/admin/auto-posts/generate-plan (AI Lập kế hoạch 30 ngày)
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/generate-plan' && method === 'POST') {
    if (!checkPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền sử dụng AI Planner' } });
      return true;
    }

    try {
      const rawBody = await readBody();
      const parsed = GenerateEditorialPlanRequestSchema.safeParse(rawBody);
      if (!parsed.success) {
        sendJson(400, {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
        });
        return true;
      }

      console.log(`[AI Planner] 🤖 Đang phân tích kế hoạch 30 ngày (${parsed.data.targetMonthCount} bài)...`);

      // Lấy tên chuyên mục nếu có truyền categoryId
      let categoryName: string | undefined = undefined;
      if (parsed.data.categoryId) {
        const cat = await db.query.categories.findFirst({
          where: eq(schema.categories.id, parsed.data.categoryId),
        });
        if (cat) categoryName = cat.tenChuyenMuc;
      }

      const aiResponse = await aiService.generate({
        action: 'generate_editorial_plan',
        prompt: `Lập kế hoạch nội dung biên tập 30 ngày gồm ${parsed.data.targetMonthCount} bài viết`,
        ideasCount: parsed.data.targetMonthCount,
        category: categoryName,
        carModel: parsed.data.targetCar || undefined,
      });

      const editorialPlan: EditorialPlanItem[] = aiResponse.editorialPlan || [];

      // Tính ngày scheduledAt dự kiến dựa trên suggestedDay
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const itemsWithDates = editorialPlan.map((item: EditorialPlanItem) => {
        const targetDay = item.suggestedDay || 1;
        const scheduledDate = new Date(currentYear, currentMonth, targetDay, 8, 0, 0);
        // Nếu ngày đó đã qua trong tháng này, chuyển sang tháng tiếp theo
        if (scheduledDate < now) {
          scheduledDate.setMonth(scheduledDate.getMonth() + 1);
        }
        return {
          ...item,
          scheduledAt: scheduledDate.toISOString(),
          categoryId: parsed.data.categoryId || null,
        };
      });

      sendJson(200, {
        success: true,
        data: {
          planItems: itemsWithDates,
          deduplicationCount: aiResponse.deduplicationCount || 0,
        },
      });
      return true;
    } catch (err: unknown) {
      console.error('[AI Planner] ❌ Lỗi generate-plan:', err);
      const msg = err instanceof Error ? err.message : 'Lỗi khi tạo kế hoạch 30 ngày từ AI';
      sendJson(500, { success: false, error: { code: 'AI_ERROR', message: msg } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 7. POST /api/admin/auto-posts/ingest-plan (Nạp kế hoạch vào hàng đợi)
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/ingest-plan' && method === 'POST') {
    if (!checkPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền nạp kế hoạch' } });
      return true;
    }

    try {
      const rawBody = await readBody();
      const parsed = IngestPlanRequestSchema.safeParse(rawBody);
      if (!parsed.success) {
        sendJson(400, {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
        });
        return true;
      }

      const rowsToInsert = parsed.data.items.map((item) => ({
        title: item.title,
        focusKeyword: item.focusKeyword,
        categoryId: item.categoryId || null,
        targetCar: item.targetCar || null,
        angle: item.angle || null,
        summary: item.summary || null,
        scheduledAt: new Date(item.scheduledAt),
        status: 'pending' as const,
      }));

      await db.insert(schema.contentPlanItems).values(rowsToInsert);

      sendJson(201, {
        success: true,
        data: {
          success: true,
          count: rowsToInsert.length,
          message: `Đã nạp thành công ${rowsToInsert.length} bài viết vào hàng đợi lập lịch!`,
        },
        message: `Đã nạp thành công ${rowsToInsert.length} bài viết vào hàng đợi lập lịch!`,
        count: rowsToInsert.length,
      });
      return true;
    } catch (err: unknown) {
      console.error('[AutoPost Ingest] Lỗi ingest-plan:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi nạp kế hoạch vào hàng đợi' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 8. POST /api/admin/auto-posts/run-now (Kích hoạt chạy ngay lập tức)
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/run-now' && method === 'POST') {
    if (!checkPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền kích hoạt viết bài' } });
      return true;
    }

    try {
      console.log('[AutoPost] ⚡ Admin kích hoạt "Chạy ngay" (Manual Run Now)...');
      const result = await autoPostSchedulerService.runAutoPostPipeline('manual_run_now');
      sendJson(200, {
        success: true,
        data: result,
        message: 'Đã hoàn tất tự động viết và tạo bài viết thành công!',
      });
      return true;
    } catch (err: unknown) {
      console.error('[AutoPost Run Now] ❌ Lỗi khi chạy ngay:', err);
      const msg = err instanceof Error ? err.message : 'Lỗi trong quá trình viết bài tự động';
      sendJson(500, { success: false, error: { code: 'RUN_NOW_ERROR', message: msg } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 9. GET /api/admin/auto-posts/logs (Lịch sử thực thi)
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/logs' && method === 'GET') {
    if (!checkPermission(userRole, 'posts:read')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền xem nhật ký' } });
      return true;
    }

    try {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '20', 10)));
      const offset = (page - 1) * limit;

      const [totalCountResult] = await db.select({ val: count() }).from(schema.autoPostLogs);
      const totalItems = Number(totalCountResult?.val || 0);

      const logs = await db.query.autoPostLogs.findMany({
        orderBy: [desc(schema.autoPostLogs.createdAt)],
        limit,
        offset,
      });

      sendJson(200, {
        success: true,
        data: {
          items: logs,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
          },
        },
      });
      return true;
    } catch (err: unknown) {
      console.error('[AutoPost Logs] Lỗi GET logs:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải nhật ký thực thi' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 10. POST /api/admin/auto-posts/sync-queue (Đồng bộ thủ công giờ đăng cho hàng đợi)
  // --------------------------------------------------------------------------
  if (pathname === '/api/admin/auto-posts/sync-queue' && method === 'POST') {
    if (!checkPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Không có quyền đồng bộ hàng đợi' } });
      return true;
    }

    try {
      const rawBody = await readBody();
      const parsed = SyncQueueInputSchema.safeParse(rawBody);
      if (!parsed.success) {
        sendJson(400, {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' },
        });
        return true;
      }

      const settings = await db.query.autoPostSettings.findFirst({
        where: eq(schema.autoPostSettings.id, 'default'),
      });

      const cronExpr = parsed.data.cronExpression || settings?.cronExpression || '0 8 * * *';
      const pendingItems = await db.query.contentPlanItems.findMany({
        where: eq(schema.contentPlanItems.status, 'pending'),
        orderBy: [asc(schema.contentPlanItems.scheduledAt), asc(schema.contentPlanItems.createdAt)],
      });

      if (pendingItems.length === 0) {
        sendJson(200, {
          success: true,
          data: { updatedCount: 0 },
          message: 'Hàng đợi không có bài viết nào đang chờ để đồng bộ.',
        });
        return true;
      }

      let targetHour: number | undefined = undefined;
      let targetMinute: number | undefined = undefined;

      if (parsed.data.targetTime) {
        const [hStr, mStr] = parsed.data.targetTime.split(':');
        targetHour = parseInt(hStr || '8', 10);
        targetMinute = parseInt(mStr || '0', 10);
      }

      const rescheduled = reschedulePendingItems(pendingItems, {
        mode: parsed.data.syncMode || 'time_only',
        targetHour,
        targetMinute,
        cronExpression: cronExpr,
        referenceDate: new Date(),
      });

      for (const item of rescheduled) {
        await db
          .update(schema.contentPlanItems)
          .set({
            scheduledAt: item.scheduledAt,
            updatedAt: new Date(),
          })
          .where(eq(schema.contentPlanItems.id, item.id));
      }

      sendJson(200, {
        success: true,
        data: { updatedCount: rescheduled.length },
        message: `Đã đồng bộ giờ đăng thành công cho ${rescheduled.length} bài viết trong hàng đợi!`,
      });
      return true;
    } catch (err: unknown) {
      console.error('[AutoPost Sync Queue] Lỗi sync queue:', err);
      sendJson(500, { success: false, error: { code: 'SYNC_ERROR', message: 'Lỗi đồng bộ giờ đăng' } });
      return true;
    }
  }

  return false;
}
