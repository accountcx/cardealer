import { z } from 'zod';

// 🧠 Mental Model: Định nghĩa Type Contracts chuẩn hóa cho Module Tính Giá (Pricing Engine).
// Tách biệt hợp đồng kiểu dữ liệu khỏi logic thực thi để đảm bảo tái sử dụng trên cả Monorepo (Core, API, Storefront, Admin).

/**
 * Biểu phí đăng ký xe theo từng địa phương (Tỉnh / Thành phố)
 */
export const LocationRateSchema = z.object({
  code: z.string().min(1, 'Mã địa phương không được để trống'),
  name: z.string().min(1, 'Tên địa phương không được để trống'),
  thueTruocBaPercent: z.number().min(0).max(100), // Ví dụ: 10% hoặc 12%
  phiBienSo: z.number().nonnegative(),           // Vinh: 1.000.000đ, Huyện khác: 200.000đ
});
export type LocationRate = z.infer<typeof LocationRateSchema>;

/**
 * Đầu vào tính giá lăn bánh xe ô tô
 */
export const RollingCostCalculationInputSchema = z.object({
  giaXe: z.number().positive('Giá xe phải là số dương lớn hơn 0'),
  tinhThanhCode: z.string().default('nghe_an_vinh'),
  soChoNgoi: z.number().int().min(2).max(16).default(5),
  hasBaoHiemThanVo: z.boolean().default(false),
  hasPhiDichVu: z.boolean().default(false),
});
export type RollingCostCalculationInput = z.infer<typeof RollingCostCalculationInputSchema>;

/**
 * Chi tiết bóc tách từng khoản phí cấu thành giá lăn bánh
 */
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

/**
 * Đầu vào tính toán trả góp ngân hàng
 */
export const InstallmentCalculationInputSchema = z.object({
  giaXe: z.number().positive('Giá xe phải là số dương lớn hơn 0'),
  tyLeVayPercent: z.number().min(10, 'Tỷ lệ vay tối thiểu 10%').max(85, 'Tỷ lệ vay tối đa 85%').default(80),
  thoiHanVayThang: z.number().int().min(12, 'Thời hạn vay tối thiểu 12 tháng').max(96, 'Thời hạn vay tối đa 96 tháng (8 năm)').default(60),
  laiSuatNamPercent: z.number().min(0, 'Lãi suất không được âm').max(30, 'Lãi suất không vượt quá 30%/năm').default(7.9),
});
export type InstallmentCalculationInput = z.infer<typeof InstallmentCalculationInputSchema>;

/**
 * Kết quả tính toán kế hoạch trả nợ theo phương thức dư nợ giảm dần
 */
export const InstallmentCalculationResultSchema = z.object({
  giaXe: z.number(),
  tyLeVayPercent: z.number(),
  soTienTraTruoc: z.number(),
  soTienVay: z.number(),
  tienGocHangThang: z.number(),
  tienLaiThangDau: z.number(),
  tongTienThangDau: z.number(),
});
export type InstallmentCalculationResult = z.infer<typeof InstallmentCalculationResultSchema>;
