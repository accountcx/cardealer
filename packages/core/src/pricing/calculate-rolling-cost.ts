import type {
  RollingCostCalculationInput,
  RollingCostBreakdown,
  LocationRate,
} from '@cardealer/types';

// Bảng biểu mức thuế phí theo vùng tiêu chuẩn
export const DEFAULT_LOCATIONS: Record<string, LocationRate> = {
  nghe_an: {
    code: 'nghe_an',
    name: 'Nghệ An',
    thueTruocBaPercent: 10,
    phiBienSo: 1_000_000,
  },
  ha_tinh: {
    code: 'ha_tinh',
    name: 'Hà Tĩnh',
    thueTruocBaPercent: 10,
    phiBienSo: 1_000_000,
  },
  ha_noi: {
    code: 'ha_noi',
    name: 'Hà Nội',
    thueTruocBaPercent: 12,
    phiBienSo: 20_000_000,
  },
  ho_chi_minh: {
    code: 'ho_chi_minh',
    name: 'TP. Hồ Chí Minh',
    thueTruocBaPercent: 10,
    phiBienSo: 20_000_000,
  },
};

// Định mức chi phí cố định nhà nước
export const FIXED_RATES = {
  phiDangKiem: 140_000,
  phiBaoTriDuongBo12Thang: 1_560_000,
  phiTNDS_duoi_6_cho: 480_700,
  phiTNDS_tren_6_cho: 873_400,
  tyLeBaoHiemThanVo: 0.013, // 1.3% giá xe
  phiDichVuMacDinh: 2_000_000,
};

/**
 * Thuật toán tính toán chi phí lăn bánh chính xác theo từng tỉnh thành
 */
export function calculateRollingCost(input: RollingCostCalculationInput): RollingCostBreakdown {
  const location = DEFAULT_LOCATIONS[input.tinhThanhCode] || DEFAULT_LOCATIONS.nghe_an;

  // 1. Lệ phí trước bạ
  const lePhiTruocBa = Math.round(input.giaXe * (location.thueTruocBaPercent / 100));

  // 2. Tiền biển số
  const phiBienSo = location.phiBienSo;

  // 3. Phí đăng kiểm
  const phiDangKiem = FIXED_RATES.phiDangKiem;

  // 4. Phí bảo trì đường bộ (12 tháng)
  const phiBaoTriDuongBo = FIXED_RATES.phiBaoTriDuongBo12Thang;

  // 5. Bảo hiểm trách nhiệm dân sự bắt buộc
  const baoHiemTNDS =
    input.soChoNgoi > 5 ? FIXED_RATES.phiTNDS_tren_6_cho : FIXED_RATES.phiTNDS_duoi_6_cho;

  // 6. Bảo hiểm thân vỏ 2 chiều (tự nguyện)
  const baoHiemThanVo = input.hasBaoHiemThanVo
    ? Math.round(input.giaXe * FIXED_RATES.tyLeBaoHiemThanVo)
    : 0;

  // 7. Phí dịch vụ đăng ký đăng kiểm trọn gói
  const phiDichVuDangKy = input.hasPhiDichVu ? FIXED_RATES.phiDichVuMacDinh : 0;

  // Tổng chi phí lăn bánh
  const tongGiaLanBanh =
    input.giaXe +
    lePhiTruocBa +
    phiBienSo +
    phiDangKiem +
    phiBaoTriDuongBo +
    baoHiemTNDS +
    baoHiemThanVo +
    phiDichVuDangKy;

  return {
    giaXe: input.giaXe,
    lePhiTruocBa,
    phiBienSo,
    phiDangKiem,
    phiBaoTriDuongBo,
    baoHiemTNDS,
    baoHiemThanVo,
    phiDichVuDangKy,
    tongGiaLanBanh,
  };
}
