import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

// 🧠 Enum trạng thái bài viết: Quản lý vòng đời bài viết từ nháp đến xuất bản và hẹn giờ
export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'scheduled', 'archived']);

// 1. Bảng Chuyên Mục Bài Viết (Tin khuyến mãi, Bảng giá xe, Đánh giá xe, Cẩm nang lái xe)
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenChuyenMuc: varchar('ten_chuyen_muc', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  moTa: text('mo_ta'), // Văn bản giàu từ khóa xuất hiện ở đầu trang danh mục hỗ trợ SEO
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index('categories_slug_idx').on(table.slug),
  index('categories_sort_idx').on(table.sortOrder),
]);

// 2. Bảng Bài Viết (Tin Tức, Content Blocks Tiptap & E-E-A-T)
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tieuDe: varchar('tieu_de', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }), // Tư vấn viên / Saler E-E-A-T
  anhDaiDienUrl: varchar('anh_dai_dien_url', { length: 500 }).notNull(),
  anhDaiDienAlt: varchar('anh_dai_dien_alt', { length: 255 }).notNull(),
  tomTat: text('tom_tat'),
  noiDung: jsonb('noi_dung').notNull(), // Tiptap JSON AST Tree
  status: postStatusEnum('status').default('draft').notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  expiredPromoDate: timestamp('expired_promo_date', { withTimezone: true }), // Ngày hết hạn khuyến mãi (hiển thị banner nhắc nhở)
  isFeatured: boolean('is_featured').default(false).notNull(),
  featuredOrder: integer('featured_order').default(0).notNull(), // 1, 2, 3 cho Top 3 bài ghim
  readingTime: integer('reading_time').default(1).notNull(), // Thời gian đọc tính bằng phút
  wordCount: integer('word_count').default(0).notNull(),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  noIndex: boolean('no_index').default(false).notNull(),
  previewToken: varchar('preview_token', { length: 64 }), // Token xem trước bài viết nháp bí mật
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index('posts_slug_idx').on(table.slug),
  index('posts_status_scheduled_idx').on(table.status, table.scheduledAt),
  index('posts_category_status_idx').on(table.categoryId, table.status),
  index('posts_featured_idx').on(table.isFeatured, table.featuredOrder),
  index('posts_author_idx').on(table.authorId),
]);

// 3. Bảng Thẻ Bài Viết (Tags quan hệ 1-N)
export const postTags = pgTable('post_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tag: varchar('tag', { length: 100 }).notNull(),
}, (table) => [
  index('post_tags_post_id_idx').on(table.postId),
  index('post_tags_tag_idx').on(table.tag),
]);

// 4. Bảng Động Cơ Chuyển Hướng 301 (Bảo toàn 100% PageRank khi đổi URL)
export const redirects = pgTable('redirects', {
  id: uuid('id').defaultRandom().primaryKey(),
  oldPath: varchar('old_path', { length: 500 }).notNull(),
  newPath: varchar('new_path', { length: 500 }).notNull(),
  statusCode: integer('status_code').default(301).notNull(),
  hitCount: integer('hit_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('redirects_old_path_uidx').on(table.oldPath),
]);

// TypeScript Types Inference
export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;

export type PostRow = typeof posts.$inferSelect;
export type NewPostRow = typeof posts.$inferInsert;

export type PostTagRow = typeof postTags.$inferSelect;
export type NewPostTagRow = typeof postTags.$inferInsert;

export type RedirectRow = typeof redirects.$inferSelect;
export type NewRedirectRow = typeof redirects.$inferInsert;
