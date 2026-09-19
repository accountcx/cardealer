import { pgTable, uuid, varchar, bigint, integer, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { cars } from './cars';
import type { SpecGroup } from '@cardealer/types';

export const carVersions = pgTable('car_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  carId: uuid('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  tenPhienBan: varchar('ten_phien_ban', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(),
  giaNiemYet: bigint('gia_niem_yet', { mode: 'number' }).notNull(),
  giaKhuyenMai: bigint('gia_khuyen_mai', { mode: 'number' }),
  seatCount: integer('seat_count').default(5).notNull(),
  dongCo: varchar('dong_co', { length: 100 }),
  hopSo: varchar('hop_so', { length: 100 }),
  danDong: varchar('dan_dong', { length: 100 }),
  anhDaiDienUrl: varchar('anh_dai_dien_url', { length: 500 }),
  boSuuTapAnh: jsonb('bo_suu_tap_anh').$type<string[]>().default([]),
  specGroups: jsonb('spec_groups').$type<SpecGroup[]>().default([]),
  reviewContent: jsonb('review_content'),
  contentBlocks: jsonb('content_blocks'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index('car_versions_car_id_idx').on(table.carId),
  uniqueIndex('car_versions_car_slug_idx').on(table.carId, table.slug),
]);

export type CarVersionRow = typeof carVersions.$inferSelect;
export type NewCarVersionRow = typeof carVersions.$inferInsert;
