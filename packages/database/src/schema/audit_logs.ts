// 🧠 Mental Model: Bảng `audit_logs` được thiết kế dạng Append-Only bất biến (R8 Mitigation).
// Lưu vết toàn bộ thay đổi người dùng, phân quyền, trạng thái và cập nhật hệ thống.
// Đánh 4 chỉ mục B-Tree (userId, action, resource, createdAt) tối ưu truy vấn phân trang và điều tra bảo mật.
import { pgTable, uuid, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: varchar('resource_id', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    details: jsonb('details'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    resourceIdx: index('audit_logs_resource_idx').on(table.resource),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  })
);

export type AuditLogRow = typeof auditLogs.$inferSelect;
export type NewAuditLogRow = typeof auditLogs.$inferInsert;
