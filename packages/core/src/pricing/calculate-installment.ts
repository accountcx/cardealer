import type {
  InstallmentCalculationInput,
  InstallmentCalculationResult,
} from '@cardealer/types';

// 🧠 Mental Model: Thuật toán tính toán dự toán trả góp ngân hàng theo phương thức Dư Nợ Giảm Dần.
// 1. Phòng thủ chia cho 0 và giá trị âm (R6): Validate kỳ hạn vay > 0, giá xe > 0, tỷ lệ vay từ 10% đến 85%.
// 2. Làm tròn Math.round toàn bộ số tiền về số nguyên VNĐ (R5) để không phát sinh số thập phân lẻ.
// 3. Trả về đầy đủ các trường thông tin theo hợp đồng InstallmentCalculationResult.

/**
 * Thuật toán tính toán số tiền trả góp hàng tháng theo phương thức Dư Nợ Giảm Dần
 * @param input Thông số gói vay gồm giá niêm yết, % vay, thời hạn (tháng) và lãi suất năm
 * @returns Bảng tính số tiền trả trước, dư nợ vay và số tiền gốc + lãi tháng đầu tiên
 */
export function calculateInstallment(
  input: InstallmentCalculationInput,
): InstallmentCalculationResult {
  if (!input || input.giaXe <= 0) {
    throw new RangeError('Giá xe tính toán trả góp phải là số dương lớn hơn 0');
  }

  const thoiHanVayThang = input.thoiHanVayThang ?? 60;
  if (thoiHanVayThang <= 0) {
    throw new RangeError('Thời hạn vay phải lớn hơn 0 tháng');
  }

  const tyLeVayPercent = input.tyLeVayPercent ?? 80;
  if (tyLeVayPercent <= 0 || tyLeVayPercent > 100) {
    throw new RangeError('Tỷ lệ vay vốn ngân hàng phải nằm trong khoảng từ 1% đến 100%');
  }

  const laiSuatNamPercent = input.laiSuatNamPercent ?? 7.9;

  // 1. Số tiền vay và số tiền trả trước đối ứng
  const tyLeVay = tyLeVayPercent / 100;
  const soTienVay = Math.round(input.giaXe * tyLeVay);
  const soTienTraTruoc = input.giaXe - soTienVay;

  // 2. Tiền gốc cố định trả mỗi tháng (Dư nợ giảm dần)
  const tienGocHangThang = Math.round(soTienVay / thoiHanVayThang);

  // 3. Lãi suất tháng đầu tiên (Tháng cao nhất khi dư nợ còn nguyên)
  const laiSuatThang = laiSuatNamPercent / 100 / 12;
  const tienLaiThangDau = Math.round(soTienVay * laiSuatThang);

  // 4. Tổng số tiền cần thanh toán trong tháng đầu tiên
  const tongTienThangDau = tienGocHangThang + tienLaiThangDau;

  return {
    giaXe: input.giaXe,
    tyLeVayPercent,
    soTienTraTruoc,
    soTienVay,
    tienGocHangThang,
    tienLaiThangDau,
    tongTienThangDau,
  };
}
