import { relations } from 'drizzle-orm';
import { cars } from './cars';
import { carVersions } from './car_versions';
import { colors, versionColors } from './colors';

export const carsRelations = relations(cars, ({ many }) => ({
  versions: many(carVersions),
}));

export const carVersionsRelations = relations(carVersions, ({ one, many }) => ({
  car: one(cars, { fields: [carVersions.carId], references: [cars.id] }),
  versionColors: many(versionColors),
}));

export const versionColorsRelations = relations(versionColors, ({ one }) => ({
  version: one(carVersions, { fields: [versionColors.versionId], references: [carVersions.id] }),
  color: one(colors, { fields: [versionColors.colorId], references: [colors.id] }),
}));

export const colorsRelations = relations(colors, ({ many }) => ({
  versionColors: many(versionColors),
}));
