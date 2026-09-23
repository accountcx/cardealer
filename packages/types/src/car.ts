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
  slug: z.string().optional().default(''),
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

// 🧠 Mental Model: Kiểu dữ liệu và hằng số cho Bộ Lọc Danh Mục Dòng Xe (Phase 4.3 Catalog & Filter Grid)
export type CatalogSegment = 'all' | 'sedan' | 'suv' | 'mpv' | 'hatchback' | 'ev';

export interface SegmentTabOption {
  id: CatalogSegment;
  label: string;
}

export type PriceRangeId = 'all' | 'under-500' | '500-700' | '700-1000' | 'over-1000';

export interface PriceRangeOption {
  id: PriceRangeId;
  label: string;
  minPrice: number;
  maxPrice: number;
}

export const CATALOG_PRICE_RANGES: PriceRangeOption[] = [
  { id: 'all', label: 'Tất Cả Mức Giá', minPrice: 0, maxPrice: Infinity },
  { id: 'under-500', label: 'Dưới 500 triệu', minPrice: 0, maxPrice: 500_000_000 },
  { id: '500-700', label: '500 - 700 triệu', minPrice: 500_000_000, maxPrice: 700_000_000 },
  { id: '700-1000', label: '700 triệu - 1 tỷ', minPrice: 700_000_000, maxPrice: 1_000_000_000 },
  { id: 'over-1000', label: 'Trên 1 tỷ', minPrice: 1_000_000_000, maxPrice: Infinity },
];

export const CATALOG_SEGMENTS: SegmentTabOption[] = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV' },
  { id: 'mpv', label: 'MPV' },
  { id: 'hatchback', label: 'Hatchback' },
  { id: 'ev', label: 'Xe Điện (EV)' },
];

export interface CarCatalogItem {
  id: string;
  tenXe: string;
  slug: string;
  anhDaiDienUrl: string;
  segment: CarSegment;
  traTruocTu: number | null;
  promotionSummary: string | null;
  fuelType?: string | null;
  seatRange: string;
  minPrice: number;
  maxPrice: number;
  versionCount: number;
  isFeatured: boolean;
  status: CarStatus;
  versions?: {
    id: string;
    tenPhienBan: string;
    giaNiemYet: number;
    giaKhuyenMai?: number | null;
    seatCount?: number;
    dongCo?: string | null;
    hopSo?: string | null;
    danDong?: string | null;
  }[];
}

export interface CatalogFilterState {
  segment: CatalogSegment;
  price: PriceRangeId;
}

// 🧠 Mental Model: Data Contracts cho Trang Chi Tiết Dòng Xe (Phase 4.4 Car Detail Experience)
export const CarDetailVersionSchema = CarVersionSchema.extend({
  colors: z.array(VersionColorSchema).default([]),
});
export type CarDetailVersion = z.infer<typeof CarDetailVersionSchema>;

export const CarDetailSchema = CarSchema.extend({
  minPrice: z.number(),
  maxPrice: z.number(),
  versionCount: z.number().default(0),
  versions: z.array(CarDetailVersionSchema).default([]),
});
export type CarDetail = z.infer<typeof CarDetailSchema>;
