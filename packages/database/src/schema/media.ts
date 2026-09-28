import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// 🧠 Mental Model: Schema bảng lưu trữ thông tin Media Library tích hợp Cloudinary
// Lưu trữ URL CDN, Cloudinary Public ID, Metadata (kích thước, dung lượng) và quan hệ với User tải lên.

export const media = pgTable(
  'media',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    filename: varchar('filename', { length: 255 }).notNull(),
    url: varchar('url', { length: 500 }).notNull(),
    publicId: varchar('public_id', { length: 255 }).notNull().unique(),
    format: varchar('format', { length: 20 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(),
    altText: varchar('alt_text', { length: 255 }),
    width: integer('width'),
    height: integer('height'),
    folder: varchar('folder', { length: 100 }).default('cardealer'),
    uploaderId: uuid('uploader_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // 🧠 Index tối ưu hóa truy vấn phân trang danh sách ảnh mới nhất
    createdAtIdx: index('media_created_at_idx').on(table.createdAt),
    // 🧠 Index tối ưu hóa tìm kiếm theo tên tệp hoặc alt text
    filenameIdx: index('media_filename_idx').on(table.filename),
    // 🧠 Unique index bảo vệ tính toàn vẹn ID Cloudinary
    publicIdIdx: index('media_public_id_idx').on(table.publicId),
    // 🧠 Index lọc theo người tải lên
    uploaderIdIdx: index('media_uploader_id_idx').on(table.uploaderId),
  })
);

export type MediaRow = typeof media.$inferSelect;
export type NewMediaRow = typeof media.$inferInsert;

