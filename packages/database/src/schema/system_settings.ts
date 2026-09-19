import { pgTable, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const systemSettings = pgTable('system_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SystemSettingRow = typeof systemSettings.$inferSelect;
export type NewSystemSettingRow = typeof systemSettings.$inferInsert;
