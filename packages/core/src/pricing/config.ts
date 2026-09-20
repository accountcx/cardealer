import type { LocationRate } from '@cardealer/types';

// 🧠 Mental Model: Tập trung hóa toàn bộ biểu phí nhà nước và thuế lệ phí ô tô tại một điểm duy nhất (Single Source of Truth).
// Giải quyết dứt điểm rủi ro R7 (Hardcoded fees & Regulatory rate changes).
// Khi có sự điều chỉnh thuế trước bạ (ví dụ giảm 50% theo Nghị định) hoặc biểu phí biển số mới,
// lập trình viên chỉ cần thay đổi tại file config này mà không ảnh hưởng tới các tầng khác.

/**
 * Biểu phí lệ phí trước bạ và tiền cấp biển số theo từng địa phương
 */
export const PROVINCE_FEE_CONFIGS: Record<string, LocationRate> = {
  // Thành phố Vinh (Tỉnh Nghệ An) - Trọng tâm Showroom
  nghe_an_vinh: {
    code: 'nghe_an_vinh',
    name: 'TP. Vinh',
    thueTruocBaPercent: 10,
    phiBienSo: 1_000_000,
  },
  // Các huyện, thị xã khác trong tỉnh Nghệ An
  nghe_an_huyen: {
    code: 'nghe_an_huyen',
    name: 'Huyện Khác (Nghệ An)',
    thueTruocBaPercent: 10,
    phiBienSo: 200_000,
  },
  // Tỉnh Hà Tĩnh lân cận
  ha_tinh: {
    code: 'ha_tinh',
    name: 'Hà Tĩnh',
    thueTruocBaPercent: 10,
    phiBienSo: 1_000_000,
  },
  // Khu vực Hà Nội
  ha_noi: {
    code: 'ha_noi',
    name: 'Hà Nội',
    thueTruocBaPercent: 12,
    phiBienSo: 20_000_000,
  },
  // Khu vực TP. Hồ Chí Minh
  ho_chi_minh: {
    code: 'ho_chi_minh',
    name: 'TP. Hồ Chí Minh',
    thueTruocBaPercent: 10,
    phiBienSo: 20_000_000,
  },
};

/**
 * Định mức chi phí cố định theo quy định nhà nước hiện hành cho xe ô tô con
 */
export const FIXED_GOVERNMENT_RATES = {
  // Phí đăng kiểm phương tiện cơ giới đường bộ
  phiDangKiem: 140_000,
  // Phí bảo trì đường bộ 12 tháng (Xe ô tô con dưới 10 chỗ đăng ký tên cá nhân)
  phiBaoTriDuongBo12Thang: 1_560_000,
  // Bảo hiểm trách nhiệm dân sự bắt buộc (Xe dưới 6 chỗ không kinh doanh vận tải)
  phiTNDS_duoi_6_cho: 480_000,
  // Bảo hiểm trách nhiệm dân sự bắt buộc (Xe từ 6 đến 11 chỗ không kinh doanh vận tải)
  phiTNDS_tren_6_cho: 873_000,
  // Tỷ lệ bảo hiểm vật chất / thân vỏ 2 chiều tự nguyện (1.3% giá trị niêm yết)
  tyLeBaoHiemThanVo: 0.013,
  // Phí dịch vụ đăng ký, đăng kiểm trọn gói từ đại lý (Tùy chọn)
  phiDichVuDangKyMacDinh: 2_000_000,
};

/**
 * Hàm tra cứu biểu phí địa phương hỗ trợ cả Code và Name từ form người dùng
 */
export function getLocationRate(identifier: string): LocationRate {
  if (!identifier) {
    return PROVINCE_FEE_CONFIGS.nghe_an_vinh;
  }

  const normalized = identifier.toLowerCase().trim();

  // 1. Khớp theo key trực tiếp
  if (PROVINCE_FEE_CONFIGS[normalized]) {
    return PROVINCE_FEE_CONFIGS[normalized];
  }

  // 2. Khớp linh hoạt theo tên tiếng Việt
  if (normalized.includes('vinh')) {
    return PROVINCE_FEE_CONFIGS.nghe_an_vinh;
  }
  if (normalized.includes('huyện') || normalized.includes('huyen') || normalized.includes('nghệ an')) {
    return PROVINCE_FEE_CONFIGS.nghe_an_huyen;
  }
  if (normalized.includes('hà tĩnh') || normalized.includes('ha tinh')) {
    return PROVINCE_FEE_CONFIGS.ha_tinh;
  }
  if (normalized.includes('hà nội') || normalized.includes('ha noi')) {
    return PROVINCE_FEE_CONFIGS.ha_noi;
  }
  if (normalized.includes('hồ chí minh') || normalized.includes('ho chi minh') || normalized.includes('sài gòn')) {
    return PROVINCE_FEE_CONFIGS.ho_chi_minh;
  }

  // Fallback mặc định về TP. Vinh
  return PROVINCE_FEE_CONFIGS.nghe_an_vinh;
}
