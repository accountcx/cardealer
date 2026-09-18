import { z } from 'zod';

export const HighlightFeatureSchema = z.object({
  icon: z.string(),
  label: z.string(),
  value: z.string(),
});
export type HighlightFeature = z.infer<typeof HighlightFeatureSchema>;

export const ColorSwatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  hexCode: z.string(),
  swatchImageUrl: z.string().optional(),
});
export type ColorSwatch = z.infer<typeof ColorSwatchSchema>;

export const CarVersionSchema = z.object({
  id: z.string(),
  name: z.string(),
  giaNiemYet: z.number().positive(),
  giaKhuyenMai: z.number().positive().optional(),
  dongCo: z.string().optional(),
  hopSo: z.string().optional(),
  nhienLieu: z.string().optional(),
  soChoNgoi: z.number().default(5),
  availableColors: z.array(ColorSwatchSchema).default([]),
});
export type CarVersion = z.infer<typeof CarVersionSchema>;

export const CarSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  featuredImage: z.string(),
  segment: z.enum(['Sedan', 'SUV', 'Hatchback', 'MPV', 'EV']).default('SUV'),
  headline: z.string().optional(),
  highlightFeatures: z.array(HighlightFeatureSchema).default([]),
  versions: z.array(CarVersionSchema).default([]),
});
export type Car = z.infer<typeof CarSchema>;
