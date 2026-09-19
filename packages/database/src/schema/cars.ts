import { pgTable, uuid, varchar, text, decimal, integer, bigint, boolean, timestamp, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import type { HighlightFeature } from '@cardealer/types';

export const carStatusEnum = pgEnum('car_status', ['draft', 'published', 'archived']);
export const carSegmentEnum = pgEnum('car_segment', ['sedan', 'suv', 'mpv', 'hatchback', 'ev']);

export const cars = pgTable('cars', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenXe: varchar('ten_xe', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  anhDaiDienUrl: varchar('anh_dai_dien_url', { length: 500 }).notNull(),
  catalogFileUrl: varchar('catalog_file_url', { length: 500 }),
  segment: carSegmentEnum('segment').default('suv').notNull(),
  taxRate: decimal('tax_rate', { precision: 4, scale: 2 }).default('0.10').notNull(),
  traTruocTu: bigint('tra_truoc_tu', { mode: 'number' }),
  promotionSummary: varchar('promotion_summary', { length: 255 }),
  fuelType: varchar('fuel_type', { length: 50 }),
  highlightFeatures: jsonb('highlight_features').$type<HighlightFeature[]>(),
  moTaChung: text('mo_ta_chung'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  status: carStatusEnum('status').default('draft').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index('cars_slug_idx').on(table.slug),
  index('cars_segment_status_idx').on(table.segment, table.status),
  index('cars_featured_sort_idx').on(table.isFeatured, table.sortOrder),
]);

export type CarRow = typeof cars.$inferSelect;
export type NewCarRow = typeof cars.$inferInsert;
