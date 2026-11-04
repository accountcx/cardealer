import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { categories, posts } from './posts';
import { users } from './users';

// 🧠 Enum trạng thái hàng đợi kế hoạch đăng bài
export const contentPlanStatusEnum = pgEnum('content_plan_status', ['pending', 'processing', 'completed', 'failed']);

// 1. Bảng Cấu Hình Toàn Cục Tự Động Viết Bài (Auto Post Settings)
export const autoPostSettings = pgTable('auto_post_settings', {
  id: varchar('id', { length: 50 }).primaryKey().default('default'),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  cronExpression: varchar('cron_expression', { length: 50 }).default('0 8 * * *').notNull(),
  defaultStatus: varchar('default_status', { length: 20 }).default('draft').notNull(), // 'draft' | 'published'
  defaultCategoryId: uuid('default_category_id').references(() => categories.id, { onDelete: 'set null' }),
  defaultAuthorId: uuid('default_author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

// 2. Bảng Hàng Đợi Kế Hoạch Biên Tập Bài Viết (Content Plan Queue)
export const contentPlanItems = pgTable('content_plan_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }),
  focusKeyword: varchar('focus_keyword', { length: 255 }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  targetCar: varchar('target_car', { length: 100 }),
  angle: text('angle'),
  summary: text('summary'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  status: contentPlanStatusEnum('status').default('pending').notNull(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'set null' }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index('content_plan_status_scheduled_idx').on(table.status, table.scheduledAt),
  index('content_plan_category_idx').on(table.categoryId),
]);

// 3. Bảng Nhật Ký Thực Thi Tác Vụ Tự Động (Auto Post Logs)
export const autoPostLogs = pgTable('auto_post_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  triggerType: varchar('trigger_type', { length: 30 }).notNull(), // 'cron' | 'manual_run_now'
  planItemId: uuid('plan_item_id').references(() => contentPlanItems.id, { onDelete: 'set null' }),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'set null' }),
  postTitle: varchar('post_title', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull(), // 'success' | 'failed'
  errorMessage: text('error_message'),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('auto_post_logs_created_idx').on(table.createdAt),
  index('auto_post_logs_status_idx').on(table.status),
]);
