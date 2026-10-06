import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { cars } from './cars';
import { users } from './users';

// 🧠 Mental Model: Bài viết chuyên sâu gắn liền 1–1 với từng dòng xe (Car Article).
// - Mỗi dòng xe có DUY NHẤT 1 bài (đánh giá / so sánh / cẩm nang...) — ràng buộc bằng UNIQUE(car_id).
// - Nội dung hiển thị trực tiếp như một mục của trang /xe/[slug], KHÔNG xuất hiện ở Hub Tin tức.
// - Lưu Tiptap JSON AST cùng định dạng với posts để tái sử dụng Block Editor & bộ render HTML.
// - Trường SEO riêng (focusKeyword, metaTitle, metaDescription) ghi đè meta mặc định của trang xe.
export const carArticleStatusEnum = pgEnum('car_article_status', ['draft', 'published']);

export const carArticles = pgTable('car_articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  carId: uuid('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }), // E-E-A-T
  tieuDe: varchar('tieu_de', { length: 255 }).notNull(),
  tomTat: text('tom_tat'),
  noiDung: jsonb('noi_dung').notNull(), // Tiptap JSON AST Tree
  status: carArticleStatusEnum('status').default('draft').notNull(),
  focusKeyword: varchar('focus_keyword', { length: 255 }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  readingTime: integer('reading_time').default(1).notNull(),
  wordCount: integer('word_count').default(0).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('car_articles_car_id_uidx').on(table.carId),
]);

export type CarArticleRow = typeof carArticles.$inferSelect;
export type NewCarArticleRow = typeof carArticles.$inferInsert;
