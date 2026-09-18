import type {
  InstallmentCalculationInput,
  InstallmentCalculationResult,
} from '@cardealer/types';

/**
 * Thuật toán tính toán số tiền trả góp hàng tháng theo phương thức Dư Nợ Giảm Dần
 */
export function calculateInstallment(
  input: InstallmentCalculationInput,
): InstallmentCalculationResult {
  const tyLeVay = input.tyLeVayPercent / 100;
  const soTienVay = Math.round(input.giaXe * tyLeVay);
  const soTienTraTruoc = input.giaXe - soTienVay;

  // Tiền gốc cố định trả mỗi tháng
  const tienGocHangThang = Math.round(soTienVay / input.thoiHanVayThang);

  // Lãi suất tháng đầu tiên (lớn nhất)
  const laiSuatThang = input.laiSuatNamPercent / 100 / 12;
  const tienLaiThangDau = Math.round(soTienVay * laiSuatThang);

  // Tổng số tiền cần trả trong tháng đầu tiên
  const tongTienThangDau = tienGocHangThang + tienLaiThangDau;

  return {
    soTienTraTruoc,
    soTienVay,
    tienGocHangThang,
    tienLaiThangDau,
    tongTienThangDau,
  };
}
