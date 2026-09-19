import { pgTable, uuid, varchar, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { carVersions } from './car_versions';

export const colors = pgTable('colors', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenMau: varchar('ten_mau', { length: 100 }).notNull().unique(),
  hexCode: varchar('hex_code', { length: 20 }).notNull(),
  isTwoTone: boolean('is_two_tone').default(false).notNull(),
  secondaryHexCode: varchar('secondary_hex_code', { length: 20 }),
  swatchUrl: varchar('swatch_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const versionColors = pgTable('version_colors', {
  id: uuid('id').defaultRandom().primaryKey(),
  versionId: uuid('version_id').notNull().references(() => carVersions.id, { onDelete: 'cascade' }),
  colorId: uuid('color_id').notNull().references(() => colors.id, { onDelete: 'cascade' }),
  anhXeTheoMauUrl: varchar('anh_xe_theo_mau_url', { length: 500 }),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_version_color_idx').on(table.versionId, table.colorId),
  index('version_colors_version_id_idx').on(table.versionId),
]);

export type ColorRow = typeof colors.$inferSelect;
export type NewColorRow = typeof colors.$inferInsert;

export type VersionColorRow = typeof versionColors.$inferSelect;
export type NewVersionColorRow = typeof versionColors.$inferInsert;
