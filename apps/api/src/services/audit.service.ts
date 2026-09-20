// 🧠 Mental Model: Dịch vụ ghi nhật ký kiểm toán Append-Only (R8 Mitigation).
// Ghi nhận bất biến vào bảng `audit_logs`, khử ký tự xuống dòng chống Log Injection (CWE-117).
import { db, schema } from '@cardealer/database';

export interface AuditLogInput {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown> | null;
}

export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const safeAction = input.action.replace(/[\r\n]/g, '').trim();
    const safeResource = input.resource.replace(/[\r\n]/g, '').trim();

    await db.insert(schema.auditLogs).values({
      userId: input.userId || null,
      action: safeAction,
      resource: safeResource,
      resourceId: input.resourceId || null,
      ipAddress: input.ipAddress ? input.ipAddress.replace(/[\r\n]/g, '').substring(0, 45) : null,
      userAgent: input.userAgent ? input.userAgent.replace(/[\r\n]/g, '').substring(0, 500) : null,
      details: input.details || null,
    });
  } catch (err) {
    console.error('⚠️ [AuditLog] Không thể ghi nhận log:', err);
  }
}
