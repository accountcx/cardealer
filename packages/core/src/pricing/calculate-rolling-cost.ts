import type {
  RollingCostCalculationInput,
  RollingCostBreakdown,
} from '@cardealer/types';
import {
  getLocationRate,
  FIXED_GOVERNMENT_RATES,
  PROVINCE_FEE_CONFIGS,
} from './config';

// 🧠 Mental Model: Thuật toán tính toán chi phí lăn bánh chính xác theo quy định nhà nước.
// 1. Áp dụng Integer Arithmetic (Làm tròn Math.round) trên mọi phép tính tỷ lệ để triệt tiêu hoàn toàn sai số dấu phẩy động (R5).
// 2. Tra cứu mức thuế và tiền biển số từ Config tập trung (R7).
// 3. Phòng thủ biên tham số (R6): Chặn giá xe âm hoặc bằng 0.

export { PROVINCE_FEE_CONFIGS, FIXED_GOVERNMENT_RATES, getLocationRate };

/**
 * Thuật toán tính toán chi phí lăn bánh chính xác theo từng tỉnh thành
 * @param input Thông tin đầu vào gồm giá xe, địa phương, số chỗ ngồi và các tùy chọn bảo hiểm
 * @returns Chi tiết bóc tách từng khoản phí và tổng giá lăn bánh cuối cùng
 */
export function calculateRollingCost(input: RollingCostCalculationInput): RollingCostBreakdown {
  if (!input || input.giaXe <= 0) {
    throw new RangeError('Giá xe tính toán lăn bánh phải là số dương lớn hơn 0');
  }

  // 1. Tra cứu biểu phí địa phương (Mặc định: TP. Vinh)
  const location = getLocationRate(input.tinhThanhCode);

  // 2. Lệ phí trước bạ (10% tại Nghệ An, Hà Tĩnh; 12% tại Hà Nội)
  const lePhiTruocBa = Math.round(input.giaXe * (location.thueTruocBaPercent / 100));

  // 3. Tiền cấp biển số (Vinh: 1.000.000đ, Huyện khác: 200.000đ, Hà Nội/TP.HCM: 20.000.000đ)
  const phiBienSo = location.phiBienSo;

  // 4. Phí đăng kiểm phương tiện cơ giới đường bộ
  const phiDangKiem = FIXED_GOVERNMENT_RATES.phiDangKiem;

  // 5. Phí bảo trì đường bộ 12 tháng
  const phiBaoTriDuongBo = FIXED_GOVERNMENT_RATES.phiBaoTriDuongBo12Thang;

  // 6. Bảo hiểm trách nhiệm dân sự bắt buộc theo số chỗ ngồi
  const soCho = input.soChoNgoi ?? 5;
  const baoHiemTNDS =
    soCho > 5
      ? FIXED_GOVERNMENT_RATES.phiTNDS_tren_6_cho
      : FIXED_GOVERNMENT_RATES.phiTNDS_duoi_6_cho;

  // 7. Bảo hiểm vật chất thân vỏ 2 chiều tự nguyện (1.3% giá trị xe)
  const baoHiemThanVo = input.hasBaoHiemThanVo
    ? Math.round(input.giaXe * FIXED_GOVERNMENT_RATES.tyLeBaoHiemThanVo)
    : 0;

  // 8. Phí dịch vụ đăng ký đăng kiểm trọn gói từ đại lý
  const phiDichVuDangKy = input.hasPhiDichVu
    ? FIXED_GOVERNMENT_RATES.phiDichVuDangKyMacDinh
    : 0;

  // 9. Tổng chi phí lăn bánh trọn gói
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
