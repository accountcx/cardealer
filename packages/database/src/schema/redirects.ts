import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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

export type RedirectRow = typeof redirects.$inferSelect;
export type NewRedirectRow = typeof redirects.$inferInsert;
