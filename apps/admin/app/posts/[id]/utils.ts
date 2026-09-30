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

// 💰 Format tiền tệ VNĐ có phân cách hàng nghìn (ví dụ: 529000000 -> "529.000.000")
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
      type === 'priceTable'
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
    specVersions:
      type === 'specTable'
        ? ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt', 'Bản Cao Cấp']
        : undefined,
    specRows:
      type === 'specTable'
        ? [
          { specName: 'Động cơ & Hộp số', values: ['1.5L Xăng (115 Hp) - iVT', '1.5L Xăng (115 Hp) - iVT', '1.5L Turbo (160 Hp) - 7DCT'] },
          { specName: 'Kích thước mâm lốp', values: ['17 inch Hợp kim', '18 inch Phay bóng', '19 inch Thể thao N-Line'] },
          { specName: 'Hệ thống đèn chiếu sáng', values: ['Bi-Halogen Projector', 'LED toàn phần tự động', 'Full LED thích ứng Matrix'] },
          { specName: 'Gói an toàn SmartSense', values: ['Cơ bản (ABS, ESC, HAC)', 'Cảnh báo điểm mù + Cam lùi', 'Full SmartSense chủ động'] },
          { specName: 'Ghế bọc da & Làm mát', values: ['Ghế nỉ cao cấp', 'Da đục lỗ làm mát ghế', 'Da Nappa đục lỗ + Nhớ vị trí'] },
        ]
        : undefined,
    ctaButtonText: type === 'ctaButton' ? 'Gọi Hotline Nhận Báo Giá Ưu Đãi' : undefined,
    ctaActionType: type === 'ctaButton' ? 'hotline' : undefined,
    ctaCustomUrl: type === 'ctaButton' ? '' : undefined,
    ctaSubtext: type === 'ctaButton' ? 'Tư vấn tận tâm - Nhận báo giá lăn bánh kèm ưu đãi tiền mặt tốt nhất' : undefined,
    ctaVariant: type === 'ctaButton' ? 'red' : undefined,
    pros:
      type === 'prosCons'
        ? [
          'Thiết kế ngoại thất Sensuous Sportiness thời thượng, bắt mắt',
          'Khoang nội thất rộng rãi hàng đầu phân khúc, trang bị nhiều tiện nghi hiện đại',
          'Động cơ Smartstream êm ái, vận hành mượt mà và tiết kiệm nhiên liệu',
          'Gói công nghệ an toàn Hyundai SmartSense cao cấp bảo vệ tối đa',
        ]
        : undefined,
    cons:
      type === 'prosCons'
        ? [
          'Phiên bản Tiêu chuẩn vẫn trang bị phanh tay cơ và ghế nỉ',
          'Khả năng cách âm gầm ở dải tốc độ cao trên 100km/h còn tiếng ồn nhẹ',
        ]
        : undefined,
  };
}
