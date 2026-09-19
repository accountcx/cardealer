import { z } from 'zod';

export const CarSegmentSchema = z.enum(['sedan', 'suv', 'mpv', 'hatchback', 'ev']);
export type CarSegment = z.infer<typeof CarSegmentSchema>;

export const CarStatusSchema = z.enum(['draft', 'published', 'archived']);
export type CarStatus = z.infer<typeof CarStatusSchema>;

export const HighlightFeatureSchema = z.object({
  icon: z.string(),
  title: z.string(),
  value: z.string(),
});
export type HighlightFeature = z.infer<typeof HighlightFeatureSchema>;

export const SpecItemSchema = z.object({
  label: z.string(),
  value: z.string(),
});
export type SpecItem = z.infer<typeof SpecItemSchema>;

export const SpecGroupSchema = z.object({
  groupName: z.string(),
  specs: z.array(SpecItemSchema),
});
export type SpecGroup = z.infer<typeof SpecGroupSchema>;

export const ColorSchema = z.object({
  id: z.string(),
  tenMau: z.string(),
  hexCode: z.string(),
  isTwoTone: z.boolean().default(false),
  secondaryHexCode: z.string().optional().nullable(),
  swatchUrl: z.string().optional().nullable(),
});
export type Color = z.infer<typeof ColorSchema>;

export const VersionColorSchema = z.object({
  colorId: z.string(),
  tenMau: z.string(),
  hexCode: z.string(),
  isTwoTone: z.boolean().default(false),
  secondaryHexCode: z.string().optional().nullable(),
  anhXeTheoMauUrl: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
});
export type VersionColor = z.infer<typeof VersionColorSchema>;

export const CarVersionSchema = z.object({
  id: z.string(),
  carId: z.string(),
  tenPhienBan: z.string(),
  slug: z.string(),
  giaNiemYet: z.number().positive(),
  giaKhuyenMai: z.number().positive().optional().nullable(),
  seatCount: z.number().default(5),
  dongCo: z.string().optional().nullable(),
  hopSo: z.string().optional().nullable(),
  danDong: z.string().optional().nullable(),
  anhDaiDienUrl: z.string().optional().nullable(),
  boSuuTapAnh: z.array(z.string()).default([]),
  specGroups: z.array(SpecGroupSchema).default([]),
  reviewContent: z.unknown().optional().nullable(),
  contentBlocks: z.unknown().optional().nullable(),
  sortOrder: z.number().default(0),
  colors: z.array(VersionColorSchema).default([]),
});
export type CarVersion = z.infer<typeof CarVersionSchema>;

export const CarSchema = z.object({
  id: z.string(),
  tenXe: z.string(),
  slug: z.string(),
  anhDaiDienUrl: z.string(),
  catalogFileUrl: z.string().optional().nullable(),
  segment: CarSegmentSchema.default('suv'),
  taxRate: z.coerce.number().default(0.1),
  traTruocTu: z.number().optional().nullable(),
  promotionSummary: z.string().optional().nullable(),
  fuelType: z.string().optional().nullable(),
  highlightFeatures: z.array(HighlightFeatureSchema).default([]),
  moTaChung: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  status: CarStatusSchema.default('draft'),
  sortOrder: z.number().default(0),
  versions: z.array(CarVersionSchema).default([]),
});
export type Car = z.infer<typeof CarSchema>;

// DTOs for Admin mutations
export const CreateCarInputSchema = CarSchema.omit({ id: true, versions: true });
export type CreateCarInput = z.infer<typeof CreateCarInputSchema>;

export const CreateVersionInputSchema = CarVersionSchema.omit({ id: true, colors: true });
export type CreateVersionInput = z.infer<typeof CreateVersionInputSchema>;

export const CreateColorInputSchema = ColorSchema.omit({ id: true });
export type CreateColorInput = z.infer<typeof CreateColorInputSchema>;
