import { relations } from 'drizzle-orm';
import { cars } from './cars';
import { carVersions } from './car_versions';
import { colors, versionColors } from './colors';
import { users } from './users';
import { auditLogs } from './audit_logs';
import { leads } from './leads';

export const carsRelations = relations(cars, ({ many }) => ({
  versions: many(carVersions),
}));

export const carVersionsRelations = relations(carVersions, ({ one, many }) => ({
  car: one(cars, { fields: [carVersions.carId], references: [cars.id] }),
  versionColors: many(versionColors),
  leads: many(leads),
}));

export const versionColorsRelations = relations(versionColors, ({ one }) => ({
  version: one(carVersions, { fields: [versionColors.versionId], references: [carVersions.id] }),
  color: one(colors, { fields: [versionColors.colorId], references: [colors.id] }),
}));

export const colorsRelations = relations(colors, ({ many }) => ({
  versionColors: many(versionColors),
}));

export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  carVersion: one(carVersions, { fields: [leads.carVersionId], references: [carVersions.id] }),
}));
