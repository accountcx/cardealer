import type { BlockType, EditorBlock } from './types';
import type { CarSummary } from '../../../services/catalog.service';

// 🔤 Chuyển đổi chuỗi tiếng Việt có dấu thành URL slug chuẩn SEO
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// 💵 Format tiền tệ VNĐ có phân cách hàng nghìn (ví dụ: 529000000 -> "529.000.000")
export function formatVnd(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'number' ? value : Number(String(value).replace(/\D/g, ''));
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('vi-VN');
}

// Chuyển chuỗi tiền tệ phân cách về số nguyên (ví dụ: "529.000.000" -> 529000000)
export function parseVnd(value: string): number {
  const clean = value.replace(/\D/g, '');
  return clean ? Number(clean) : 0;
}

// Chuyển số tiền sang dạng triệu rút gọn (ví dụ: 529000000 -> "529 tr", 19000000 -> "19 tr")
export function toShortMillion(value: number | undefined | null): string {
  if (!value || isNaN(value) || value === 0) return '';
  if (value >= 1000000000) {
    const ty = (value / 1000000000).toFixed(value % 1000000000 === 0 ? 0 : 2);
    return `${ty} tỷ`;
  }
  if (value >= 1000000) {
    const tr = (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1);
    return `${tr} tr`;
  }
  return `${value.toLocaleString('vi-VN')} đ`;
}

// 🧱 Khởi tạo dữ liệu mẫu mặc định phong phú cho từng loại khối Block
export function createDefaultBlock(
  type: BlockType,
  availableCars: CarSummary[],
  tieuDe: string
): EditorBlock {
  const newId = String(Date.now());
  return {
    id: newId,
    type,
    content: type === 'heading' ? 'Tiêu đề đoạn mới' : type === 'paragraph' ? 'Nhập nội dung đoạn văn...' : '',
    level: 2,
    calloutType: 'info',
    title:
      type === 'faq'
        ? ''
        : type === 'priceTable'
        ? 'Bảng Giá & Chi Phí Lăn Bánh Tham Khảo (Tháng 09/2026)'
        : type === 'imageGallery'
          ? 'Bộ Sưu Tập Hình Ảnh Chi Tiết Ngoại Thất & Nội Thất'
          : type === 'specTable'
            ? 'Bảng So Sánh Thông Số Kỹ Thuật Giữa Các Phiên Bản'
            : type === 'prosCons'
              ? 'Đánh Giá Ưu Điểm & Nhược Điểm Thực Tế'
              : '',
    faqs:
      type === 'faq'
        ? [
          {
            question: 'Giá xe đã bao gồm các loại thuế phí lăn bánh chưa?',
            answer: 'Giá niêm yết đã bao gồm 10% VAT nhưng chưa bao gồm lệ phí trước bạ và phí đăng ký biển số.',
          },
        ]
        : undefined,
    prices:
      type === 'priceTable'
        ? (() => {
          const matchedCar = availableCars.find((c) =>
            tieuDe.toLowerCase().includes(c.tenXe.toLowerCase()) ||
            c.tenXe.toLowerCase().includes(tieuDe.toLowerCase())
          ) || availableCars[0];
          return matchedCar && matchedCar.versions && matchedCar.versions.length > 0
            ? matchedCar.versions.map((v) => {
              const listed = v.giaNiemYet || 0;
              const promo = v.giaKhuyenMai || listed;
              const discount = Math.max(0, listed - promo);
              const cleanVer = v.tenPhienBan.toLowerCase().startsWith(matchedCar.tenXe.toLowerCase())
                ? v.tenPhienBan
                : `${matchedCar.tenXe} ${v.tenPhienBan}`;
              return {
                version: cleanVer,
                listedPrice: listed,
                discount,
                rollingPrice: Math.round(promo * 1.10 + 3500000),
              };
            })
            : [
              { version: 'Hyundai Accent 1.5 AT Tiêu Chuẩn', listedPrice: 489000000, discount: 30000000, rollingPrice: 512000000 },
              { version: 'Hyundai Accent 1.5 AT Đặc Biệt', listedPrice: 569000000, discount: 35000000, rollingPrice: 595000000 },
              { version: 'Hyundai Accent 1.5 AT Cao Cấp', listedPrice: 629000000, discount: 35000000, rollingPrice: 665000000 },
            ];
        })()
        : undefined,
    carFilter:
      type === 'priceTable'
        ? (availableCars.find((c) =>
          tieuDe.toLowerCase().includes(c.tenXe.toLowerCase()) ||
          c.tenXe.toLowerCase().includes(tieuDe.toLowerCase())
        )?.id || (availableCars.length > 0 ? availableCars[0].id : 'all'))
        : undefined,
    carName:
      type === 'relatedCar'
        ? (availableCars[0]?.tenXe || 'Hyundai Accent 2026')
        : type === 'leadForm'
          ? (availableCars[0]?.tenXe || 'Hyundai Accent / Creta')
          : undefined,
    carSlug: type === 'relatedCar' ? (availableCars[0]?.slug || 'hyundai-accent') : undefined,
    carPrice: type === 'relatedCar' ? (availableCars[0]?.minPrice || 439000000) : undefined,
    carImage: type === 'relatedCar' ? (availableCars[0]?.anhDaiDienUrl || '/images/cars/accent.webp') : undefined,
    seatCount: type === 'relatedCar' ? (availableCars[0]?.versions?.[0]?.seatCount || 5) : undefined,
    fuelType: type === 'relatedCar' ? (availableCars[0]?.fuelType || 'Xăng 1.5L Smartstream') : undefined,
    formHeadline: type === 'leadForm' ? 'Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay' : undefined,
    formSubheadline: type === 'leadForm' ? 'Để lại thông tin, chuyên viên tư vấn sẽ gửi bảng tính chi phí lăn bánh chính xác và số tiền trả góp hàng tháng qua Zalo trong 5 phút.' : undefined,
    formButtonText: type === 'leadForm' ? 'Gửi Báo Giá Ngay' : undefined,
    imageUrl: type === 'singleImage' ? '' : undefined,
    imageAlt: type === 'singleImage' ? 'Khoang lái xe Hyundai Tucson phiên bản Cao cấp' : undefined,
    caption: type === 'singleImage' ? 'Khoang lái Tucson phiên bản Cao cấp bọc da nâu sang trọng' : undefined,
    galleryStyle: type === 'imageGallery' ? 'slider' : undefined,
    galleryImages:
      type === 'imageGallery'
        ? [
          { url: '', alt: 'Ngoại thất đầu xe', caption: 'Lưới tản nhiệt dạng tham số tích hợp đèn LED ban ngày ẩn' },
          { url: '', alt: 'Khoang lái tiện nghi', caption: 'Cụm màn hình kép 12.3 inch hướng về phía người lái' },
          { url: '', alt: 'Không gian hàng ghế sau', caption: 'Khoang hành khách rộng rãi và độ ngả lưng ghế thoải mái' },
        ]
        : undefined,
    specVersions: type === 'specTable' ? ['Hyundai Accent 1.5 MT', 'Hyundai Accent 1.5 AT', 'Hyundai Accent Cao Cấp'] : undefined,
    specRows:
      type === 'specTable'
        ? [
          { specName: 'Kích thước D x R x C (mm)', values: ['4.440 x 1.729 x 1.460', '4.440 x 1.729 x 1.460', '4.440 x 1.729 x 1.460'] },
          { specName: 'Chiều dài cơ sở (mm)', values: ['2.600', '2.600', '2.600'] },
          { specName: 'Động cơ', values: ['Smartstream G 1.5L', 'Smartstream G 1.5L', 'Smartstream G 1.5L'] },
          { specName: 'Công suất tối đa (mã lực)', values: ['115 / 6.300', '115 / 6.300', '115 / 6.300'] },
          { specName: 'Hộp số', values: ['Số sàn 6 cấp', 'Vô cấp iVT', 'Vô cấp iVT'] },
          { specName: 'Gói an toàn Hyundai Smartsense', values: ['Không', 'Không', 'Có'] },
        ]
        : undefined,
    ctaButtonText: type === 'ctaButton' ? 'Gọi Hotline Nhận Báo Giá Ưu Đãi' : undefined,
    ctaActionType: type === 'ctaButton' ? 'hotline' : undefined,
    ctaCustomUrl: type === 'ctaButton' ? '' : undefined,
    ctaPhone: type === 'ctaButton' ? '' : undefined,
    ctaSubtext: type === 'ctaButton' ? 'Tư vấn tận tâm - Cam kết giá và ưu đãi tốt nhất tại Showroom' : undefined,
    ctaVariant: type === 'ctaButton' ? 'red' : undefined,
    pros:
      type === 'prosCons'
        ? [
          'Thiết kế tương lai Parametric Dynamic đậm chất thể thao',
          'Không gian nội thất rộng rãi hàng đầu phân khúc B',
          'Trang bị gói an toàn chủ động Hyundai Smartsense cao cấp',
        ]
        : undefined,
    cons:
      type === 'prosCons'
        ? [
          'Chưa trang bị phanh đĩa cho 2 bánh sau ở bản tiêu chuẩn',
          'Độ ồn lốp khi di chuyển ở tốc độ cao trên 100km/h',
        ]
        : undefined,
  };
}
