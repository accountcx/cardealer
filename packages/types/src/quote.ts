import { z } from 'zod';

export const LocationRateSchema = z.object({
  code: z.string(),
  name: z.string(),
  thueTruocBaPercent: z.number(), // Ví dụ: 10% hoặc 12%
  phiBienSo: z.number(),          // Ví dụ: 1.000.000đ hoặc 20.000.000đ
});
export type LocationRate = z.infer<typeof LocationRateSchema>;

export const RollingCostCalculationInputSchema = z.object({
  giaXe: z.number().positive(),
  tinhThanhCode: z.string(),
  soChoNgoi: z.number().default(5),
  hasBaoHiemThanVo: z.boolean().default(true),
  hasPhiDichVu: z.boolean().default(true),
});
export type RollingCostCalculationInput = z.infer<typeof RollingCostCalculationInputSchema>;

export const RollingCostBreakdownSchema = z.object({
  giaXe: z.number(),
  lePhiTruocBa: z.number(),
  phiBienSo: z.number(),
  phiDangKiem: z.number(),
  phiBaoTriDuongBo: z.number(),
  baoHiemTNDS: z.number(),
  baoHiemThanVo: z.number(),
  phiDichVuDangKy: z.number(),
  tongGiaLanBanh: z.number(),
});
export type RollingCostBreakdown = z.infer<typeof RollingCostBreakdownSchema>;

export const InstallmentCalculationInputSchema = z.object({
  giaXe: z.number().positive(),
  tyLeVayPercent: z.number().min(10).max(85).default(80),
  thoiHanVayThang: z.number().min(12).max(96).default(84),
  laiSuatNamPercent: z.number().positive().default(8.5),
});
export type InstallmentCalculationInput = z.infer<typeof InstallmentCalculationInputSchema>;

export const InstallmentCalculationResultSchema = z.object({
  soTienTraTruoc: z.number(),
  soTienVay: z.number(),
  tienGocHangThang: z.number(),
  tienLaiThangDau: z.number(),
  tongTienThangDau: z.number(),
});
export type InstallmentCalculationResult = z.infer<typeof InstallmentCalculationResultSchema>;
