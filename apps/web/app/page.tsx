import { Button, Card } from '@cardealer/ui';
import { formatVND, formatVNDShort, calculateRollingCost } from '@cardealer/core';
import type { Car } from '@cardealer/types';

export default function HomePage() {
  const sampleCar: Car = {
    id: 'tucson-2025',
    tenXe: 'Hyundai Tucson 2025',
    slug: 'tucson',
    anhDaiDienUrl: '/images/tucson.webp',
    segment: 'suv',
    status: 'published',
    isFeatured: true,
    sortOrder: 1,
    taxRate: 10,
    traTruocTu: 150_000_000,
    promotionSummary: 'Khám phá thế hệ SUV hoàn toàn mới',
    moTaChung: 'Thiết kế Parametric Dynamic táo bạo',
    highlightFeatures: [
      { icon: 'engine', title: 'CÔNG SUẤT', value: '156 Hp' },
      { icon: 'seat', title: 'SỐ CHỖ', value: '5 Chỗ' },
    ],
    versions: [
      {
        id: 'v1',
        carId: 'tucson-2025',
        tenPhienBan: 'Tucson 2.0 Xăng Tiêu Chuẩn',
        slug: 'tucson-20-xang-tieu-chuan',
        giaNiemYet: 769_000_000,
        giaKhuyenMai: 749_000_000,
        seatCount: 5,
        dongCo: 'SmartStream G2.0',
        sortOrder: 1,
        boSuuTapAnh: [],
        specGroups: [],
        colors: [],
      },
    ],
  };

  const rollingEstimate = calculateRollingCost({
    giaXe: sampleCar.versions[0].giaNiemYet,
    tinhThanhCode: 'nghe_an',
    soChoNgoi: 5,
    hasBaoHiemThanVo: true,
    hasPhiDichVu: true,
  });

  return (
    <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#002C6C', marginBottom: '8px' }}>
          🚗 CarDealer Monorepo Platform
        </h1>
        <p style={{ color: '#4B5563', fontSize: '16px' }}>
          Storefront Client kết nối thành công với <code>@cardealer/ui</code>,{' '}
          <code>@cardealer/core</code>, và <code>@cardealer/types</code>
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card title={sampleCar.tenXe} subtitle={`Phân khúc: ${sampleCar.segment}`}>
          <p style={{ fontSize: '15px', color: '#374151', margin: '8px 0' }}>
            <strong>Giá niêm yết:</strong> {formatVND(sampleCar.versions[0].giaNiemYet)} (
            {formatVNDShort(sampleCar.versions[0].giaNiemYet)})
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <Button variant="primary">Đăng Ký Lái Thử</Button>
            <Button variant="outline">Nhận Báo Giá</Button>
          </div>
        </Card>

        <Card title="Dự Toán Lăn Bánh (Nghệ An)" subtitle="Tự động tính từ @cardealer/core">
          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0', fontSize: '14px' }}>
            <li style={{ padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
              Thuế trước bạ (10%): {formatVND(rollingEstimate.lePhiTruocBa)}
            </li>
            <li style={{ padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
              Biển số: {formatVND(rollingEstimate.phiBienSo)}
            </li>
            <li style={{ padding: '4px 0', borderBottom: '1px dashed #E5E7EB' }}>
              Phí bảo trì đường bộ + đăng kiểm: {formatVND(rollingEstimate.phiBaoTriDuongBo + rollingEstimate.phiDangKiem)}
            </li>
            <li style={{ padding: '8px 0', fontWeight: 'bold', color: '#002C6C', fontSize: '16px' }}>
              Tổng lăn bánh: {formatVND(rollingEstimate.tongGiaLanBanh)}
            </li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
