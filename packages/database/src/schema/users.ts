// 🧠 Mental Model: Mở rộng bảng `users` hỗ trợ 4 vai trò RBAC và máy trạng thái tài khoản.
// Token version kiểm soát thu hồi phiên đăng nhập tức thì (Instant Revocation R4).
import { pgTable, uuid, varchar, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'editor', 'sales']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'pending']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: userRoleEnum('role').default('admin').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  tokenVersion: integer('token_version').default(1).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  lastLoginIp: varchar('last_login_ip', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
