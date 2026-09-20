import { describe, it, expect } from 'vitest';
import { calculateRollingCost } from '../calculate-rolling-cost';
import { calculateInstallment } from '../calculate-installment';
import { getLocationRate, PROVINCE_FEE_CONFIGS, FIXED_GOVERNMENT_RATES } from '../config';

// 🧠 Mental Model: Suite 1 Unit Tests kiểm chứng toàn diện Lõi Tính Giá & Dự Toán Trả Góp (TC-1.1 -> TC-1.5).
// Đảm bảo không có sai số dấu phẩy động, xử lý trơn tru mọi giá trị biên và biểu phí nhà nước.

describe('Suite 1: Core Financial Calculation Engine Tests', () => {
  describe('calculateRollingCost', () => {
    it('TC-1.1: Tính đúng chi phí lăn bánh cho xe tại TP. Vinh (Nghệ An)', () => {
      const giaXe = 769_000_000; // Tucson Tiêu chuẩn
      const result = calculateRollingCost({
        giaXe,
        tinhThanhCode: 'nghe_an_vinh',
        soChoNgoi: 5,
        hasBaoHiemThanVo: false,
        hasPhiDichVu: false,
      });

      // 1. Phí trước bạ: 10% của 769tr = 76.900.000 VNĐ
      expect(result.lePhiTruocBa).toBe(76_900_000);
      // 2. Phí biển số Vinh: 1.000.000 VNĐ
      expect(result.phiBienSo).toBe(1_000_000);
      // 3. Phí đăng kiểm: 140.000 VNĐ
      expect(result.phiDangKiem).toBe(140_000);
      // 4. Phí bảo trì đường bộ 1 năm: 1.560.000 VNĐ
      expect(result.phiBaoTriDuongBo).toBe(1_560_000);
      // 5. Bảo hiểm TNDS 5 chỗ: 480.000 VNĐ
      expect(result.baoHiemTNDS).toBe(480_000);

      // Tổng chi phí lăn bánh: 769tr + 76.9tr + 1tr + 140k + 1.56tr + 480k = 849.080.000 VNĐ
      const expectedTotal = 769_000_000 + 76_900_000 + 1_000_000 + 140_000 + 1_560_000 + 480_000;
      expect(result.tongGiaLanBanh).toBe(expectedTotal);
    });

    it('TC-1.2: Tính đúng chi phí tại Huyện Khác (Nghệ An) với biển số 200.000 VNĐ', () => {
      const giaXe = 769_000_000;
      const result = calculateRollingCost({
        giaXe,
        tinhThanhCode: 'nghe_an_huyen',
        soChoNgoi: 5,
        hasBaoHiemThanVo: false,
        hasPhiDichVu: false,
      });

      // Biển số tại Huyện = 200.000 VNĐ
      expect(result.phiBienSo).toBe(200_000);
      // Tổng chi phí thấp hơn TP. Vinh đúng 800.000 VNĐ
      const vinhResult = calculateRollingCost({
        giaXe,
        tinhThanhCode: 'nghe_an_vinh',
        soChoNgoi: 5,
        hasBaoHiemThanVo: false,
        hasPhiDichVu: false,
      });
      expect(vinhResult.tongGiaLanBanh - result.tongGiaLanBanh).toBe(800_000);
    });

    it('TC-1.3: Đảm bảo số nguyên VNĐ (Integer Arithmetic) trên 50 mức giá khác nhau', () => {
      for (let price = 300_000_000; price <= 2_500_000_000; price += 45_000_000) {
        const result = calculateRollingCost({
          giaXe: price,
          tinhThanhCode: 'nghe_an_vinh',
          soChoNgoi: 5,
          hasBaoHiemThanVo: true, // 1.3% có thể sinh số thập phân nếu không round
          hasPhiDichVu: true,
        });

        expect(Number.isInteger(result.tongGiaLanBanh)).toBe(true);
        expect(Number.isInteger(result.lePhiTruocBa)).toBe(true);
        expect(Number.isInteger(result.baoHiemThanVo)).toBe(true);
      }
    });

    it('TC-1.5a: Chặn giá xe âm hoặc bằng 0 ném RangeError', () => {
      expect(() => {
        calculateRollingCost({
          giaXe: 0,
          tinhThanhCode: 'nghe_an_vinh',
          soChoNgoi: 5,
          hasBaoHiemThanVo: false,
          hasPhiDichVu: false,
        });
      }).toThrow(RangeError);

      expect(() => {
        calculateRollingCost({
          giaXe: -500_000_000,
          tinhThanhCode: 'nghe_an_vinh',
          soChoNgoi: 5,
          hasBaoHiemThanVo: false,
          hasPhiDichVu: false,
        });
      }).toThrow(RangeError);
    });
  });

  describe('calculateInstallment', () => {
    it('TC-1.4: Tính toán chính xác dự toán trả góp ngân hàng dư nợ giảm dần', () => {
      const giaXe = 600_000_000;
      const result = calculateInstallment({
        giaXe,
        tyLeVayPercent: 80, // Vay 480tr, trả trước 120tr
        thoiHanVayThang: 60, // 5 năm
        laiSuatNamPercent: 8.4, // 0.7%/tháng
      });

      // Số tiền trả trước = 120.000.000 VNĐ
      expect(result.soTienTraTruoc).toBe(120_000_000);
      // Số tiền vay = 480.000.000 VNĐ
      expect(result.soTienVay).toBe(480_000_000);
      // Gốc mỗi tháng = 480tr / 60 = 8.000.000 VNĐ
      expect(result.tienGocHangThang).toBe(8_000_000);
      // Lãi tháng đầu = 480tr * (8.4% / 12) = 3.360.000 VNĐ
      expect(result.tienLaiThangDau).toBe(3_360_000);
      // Tổng tháng đầu = 8tr + 3.36tr = 11.360.000 VNĐ
      expect(result.tongTienThangDau).toBe(11_360_000);
      // Kiểm tra tất cả đều là số nguyên
      expect(Number.isInteger(result.tongTienThangDau)).toBe(true);
    });

    it('TC-1.5b: Phòng thủ tham số trả góp ném RangeError khi vượt biên', () => {
      // Giá xe <= 0
      expect(() => {
        calculateInstallment({
          giaXe: 0,
          tyLeVayPercent: 80,
          thoiHanVayThang: 60,
          laiSuatNamPercent: 7.9,
        });
      }).toThrow(RangeError);

      // Thời hạn vay <= 0
      expect(() => {
        calculateInstallment({
          giaXe: 500_000_000,
          tyLeVayPercent: 80,
          thoiHanVayThang: 0,
          laiSuatNamPercent: 7.9,
        });
      }).toThrow(RangeError);

      // Tỷ lệ vay > 100%
      expect(() => {
        calculateInstallment({
          giaXe: 500_000_000,
          tyLeVayPercent: 120,
          thoiHanVayThang: 60,
          laiSuatNamPercent: 7.9,
        });
      }).toThrow(RangeError);
    });
  });

  describe('getLocationRate helper', () => {
    it('tra cứu đúng theo cả mã code lẫn tên hiển thị dropdown', () => {
      expect(getLocationRate('nghe_an_vinh').phiBienSo).toBe(1_000_000);
      expect(getLocationRate('Vinh').phiBienSo).toBe(1_000_000);
      expect(getLocationRate('Huyện Khác (Nghệ An)').phiBienSo).toBe(200_000);
      expect(getLocationRate('Hà Nội').phiBienSo).toBe(20_000_000);
      expect(getLocationRate('TP. Hồ Chí Minh').phiBienSo).toBe(20_000_000);
      expect(getLocationRate('unknown_place').phiBienSo).toBe(1_000_000); // fallback
    });
  });
});
