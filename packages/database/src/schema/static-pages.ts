import { pgTable, uuid, varchar, text, jsonb, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * 📄 BẢNG QUẢN TRỊ TRANG TĨNH ĐỘNG (STATIC_PAGES)
 * Lưu trữ nội dung rich-text Tiptap AST và cấu hình Technical SEO cho các trang E-E-A-T
 * (Giới thiệu, Quy trình mua xe, Chính sách bảo mật, Trả góp...)
 */
export const staticPages = pgTable('static_pages', {
  id: uuid('id').defaultRandom().primaryKey(),

  // 1. Dữ liệu Nội dung & Hiển thị
  title: varchar('title', { length: 255 }).notNull(),
  // WHY: Khóa Idempotency (R13) và Route Resolution duy nhất trên toàn hệ thống Storefront catch-all route [slug].
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  // WHY: Lưu trữ Tiptap JSON AST Tree Node thay vì HTML thô (R4 XSS Guard). Cho phép render linh hoạt và an toàn trên server.
  content: jsonb('content').notNull().default({}),
  templateType: varchar('template_type', { length: 50 }).notNull().default('DEFAULT'), // 'DEFAULT' | 'PROFILE_SHOWROOM' | 'TIMELINE' | 'FINANCE'
  isPublished: boolean('is_published').notNull().default(false),

  // 2. Cấu hình Technical SEO Chuyên Biệt
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  ogImage: varchar('og_image', { length: 500 }),
  noIndex: boolean('no_index').notNull().default(false),
  schemaType: varchar('schema_type', { length: 50 }).default('WebPage'), // 'AboutPage' | 'HowTo' | 'WebPage'

  // 3. Quan hệ Quản trị & Audit Trace
  // WHY: Khóa ngoại Audit Trail truy vết người tạo/sửa. Thiết lập onDelete: 'set null' để bảo toàn nội dung khi nhân sự nghỉ việc.
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),

  // 4. Timestamps chuẩn UTC
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  // WHY: B-Tree Unique Index trên slug đảm bảo tốc độ O(log N) cho định tuyến Storefront và chặn trùng lặp tuyệt đối.
  uniqueIndex('static_pages_slug_uidx').on(table.slug),

  // WHY: Composite Index (slug, is_published) tối ưu hóa truy vấn Fail-Closed Storefront (R14) chỉ quét đúng trang đã xuất bản.
  index('static_pages_slug_published_idx').on(table.slug, table.isPublished),

  // WHY: Composite Index (is_published, template_type, updated_at) hỗ trợ truy vấn lọc đa tiêu chí và sắp xếp phân trang CMS Admin.
  index('static_pages_admin_list_idx').on(table.isPublished, table.templateType, table.updatedAt),

  // Index khóa ngoại audit trace
  index('static_pages_created_by_idx').on(table.createdBy),
]);

export type StaticPageRow = typeof staticPages.$inferSelect;
export type NewStaticPageRow = typeof staticPages.$inferInsert;
