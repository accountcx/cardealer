import { describe, it, expect } from 'vitest';
import { formatVND, formatVNDShort } from '../formatters/currency';
import { calculateRollingCost } from '../pricing/calculate-rolling-cost';
import { calculateInstallment } from '../pricing/calculate-installment';

describe('Pricing Engine & Formatters Unit Tests', () => {
  it('định dạng tiền tệ VNĐ chính xác', () => {
    expect(formatVND(1250000000)).toContain('1.250.000.000');
    expect(formatVNDShort(1250000000)).toBe('1 tỷ 250 triệu');
    expect(formatVNDShort(650000000)).toBe('650 triệu');
  });

  it('tính đúng chi phí lăn bánh cho xe tại Nghệ An', () => {
    const result = calculateRollingCost({
      giaXe: 700_000_000,
      tinhThanhCode: 'nghe_an',
      soChoNgoi: 5,
      hasBaoHiemThanVo: true,
      hasPhiDichVu: true,
    });

    // Lệ phí trước bạ 10% của 700tr = 70tr
    expect(result.lePhiTruocBa).toBe(70_000_000);
    // Tiền biển số Nghệ An = 1tr
    expect(result.phiBienSo).toBe(1_000_000);
    // Tổng giá phải lớn hơn giá xe
    expect(result.tongGiaLanBanh).toBeGreaterThan(700_000_000);
  });

  it('tính đúng bảng dự toán trả góp theo dư nợ giảm dần', () => {
    const result = calculateInstallment({
      giaXe: 500_000_000,
      tyLeVayPercent: 80, // Vay 400tr, trả trước 100tr
      thoiHanVayThang: 80,
      laiSuatNamPercent: 8.5,
    });

    expect(result.soTienTraTruoc).toBe(100_000_000);
    expect(result.soTienVay).toBe(400_000_000);
    expect(result.tienGocHangThang).toBe(5_000_000);
    expect(result.tienLaiThangDau).toBeGreaterThan(0);
  });
});
