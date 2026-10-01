// 🧠 Mental Model: Segment Registry (SSOT - Single Source of Truth) quản lý kiến trúc Routing tĩnh
// và thông tin tối ưu hóa SEO cho các trang Landing Page phân khúc xe (/dong-xe/[slug]).
// 1. Whitelist Guard: Chỉ cho phép các slug đã được thẩm định an toàn (sedan, suv, mpv) để ngăn chặn Soft-404 và XSS Injection.
// 2. Data Alignment: Ánh xạ chuẩn xác từ URL slug chữ thường sang các định dạng chuỗi kieuDang thực tế lưu trong Database.

export const VALID_SEGMENT_SLUGS = ['sedan', 'suv', 'mpv'] as const;

export type SegmentSlug = (typeof VALID_SEGMENT_SLUGS)[number];

export interface SegmentConfig {
  slug: SegmentSlug;
  name: string;
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  kieuDangMapping: readonly string[];
  ogImage: string;
  seoIntroParagraph: string;
}

export const SEGMENT_REGISTRY: Record<SegmentSlug, SegmentConfig> = {
  sedan: {
    slug: 'sedan',
    name: 'Sedan',
    h1Title: 'Các Dòng Xe Sedan Hyundai Chính Hãng & Bảng Giá Mới Nhất',
    metaTitle: 'Các Dòng Xe Sedan Hyundai Mới Nhất 2026 | Báo Giá & Ưu Đãi Lăn Bánh',
    metaDescription:
      'Khám phá các dòng xe Sedan Hyundai Accent, Elantra chính hãng. Báo giá lăn bánh, ưu đãi trả góp 85%, giao xe ngay.',
    kieuDangMapping: ['Sedan', 'sedan'],
    ogImage: '/images/og-sedan.webp',
    seoIntroParagraph:
      'Dòng xe Sedan Hyundai luôn là lựa chọn hàng đầu cho khách hàng cá nhân và gia đình trẻ nhờ ngôn ngữ thiết kế Sensuous Sportiness thể thao thời thượng, khả năng tiết kiệm nhiên liệu vượt trội và không gian nội thất tiện nghi. Nổi bật với các mẫu xe ăn khách như Hyundai Accent và Hyundai Elantra thế hệ mới, phân khúc Sedan đáp ứng hoàn hảo nhu cầu di chuyển đô thị linh hoạt cũng như những chuyến hành trình dài. Showroom hỗ trợ lái thử tận nơi, trả góp lên đến 85% và ưu đãi giá lăn bánh tốt nhất khu vực.',
  },
  suv: {
    slug: 'suv',
    name: 'SUV / Crossover',
    h1Title: 'Các Dòng Xe SUV & Crossover Hyundai Gầm Cao Đa Dụng',
    metaTitle: 'Các Dòng Xe SUV & Crossover Hyundai Gầm Cao 2026 | Bảng Giá Lăn Bánh',
    metaDescription:
      'Bảng giá và thông số các dòng SUV Hyundai Creta, Tucson, Santa Fe, Venue gầm cao mạnh mẽ. Lái thử tận nhà, ưu đãi lớn.',
    kieuDangMapping: ['SUV', 'suv', 'Crossover', 'crossover'],
    ogImage: '/images/og-suv.webp',
    seoIntroParagraph:
      'Phân khúc SUV Hyundai gầm cao khẳng định vị thế dẫn đầu với dải sản phẩm toàn diện từ đô thị cỡ B đến cỡ D cao cấp: Hyundai Venue cá tính, Hyundai Creta năng động, Hyundai Tucson lịch lãm và Hyundai Santa Fe sang trọng. Trang bị gói an toàn chủ động Hyundai SmartSense độc quyền, dẫn động 4 bánh toàn thời gian HTRAC và động cơ Smartstream mạnh mẽ, các dòng xe SUV Hyundai sẵn sàng chinh phục mọi địa hình và bảo vệ tối đa cho cả gia đình.',
  },
  mpv: {
    slug: 'mpv',
    name: 'MPV Đa Dụng',
    h1Title: 'Các Dòng Xe MPV Đa Dụng Hyundai Cho Doanh Nghiệp & Gia Đình',
    metaTitle: 'Các Dòng Xe MPV Đa Dụng Hyundai 7 Chỗ 2026 | Tiện Nghi & Giá Tốt',
    metaDescription:
      'Khám phá dòng xe MPV gia đình và kinh doanh Hyundai Custin, Stargazer X 7 chỗ tiện nghi bậc nhất. Giá tốt, giao ngay.',
    kieuDangMapping: ['MPV', 'mpv'],
    ogImage: '/images/og-mpv.webp',
    seoIntroParagraph:
      'Dòng xe đa dụng MPV Hyundai (Hyundai Stargazer X và Hyundai Custin) định nghĩa lại tiêu chuẩn di chuyển cho gia đình đông thành viên và doanh nghiệp dịch vụ cao cấp. Thiết kế phi thuyền tương lai, cửa trượt tự động thông minh, hàng ghế cơ trưởng thương gia cùng không gian 7 chỗ ngồi rộng rãi đem lại sự thư thái tối đa trên mọi chặng đường. Động cơ bền bỉ, chi phí bảo dưỡng tối ưu và chính sách bảo hành chính hãng 5 năm là điểm tựa vững chắc cho mọi chủ xe.',
  },
};

/**
 * WHY: Type guard an toàn kiểm tra chuỗi slug truyền vào có nằm trong Whitelist phân khúc không.
 * Ngăn chặn soft-404 và injection attack trước khi thực hiện data fetching.
 */
export function isSegmentSlug(slug: string): slug is SegmentSlug {
  return VALID_SEGMENT_SLUGS.includes(slug as SegmentSlug);
}

/**
 * Lấy cấu hình phân khúc tương ứng. Trả về undefined nếu slug không hợp lệ.
 */
export function getSegmentConfig(slug: string): SegmentConfig | undefined {
  if (!isSegmentSlug(slug)) {
    return undefined;
  }
  return SEGMENT_REGISTRY[slug];
}

/**
 * Trả về danh sách toàn bộ các slug hợp lệ phục vụ hàm generateStaticParams của Next.js
 */
export function getAllSegmentSlugs(): SegmentSlug[] {
  return [...VALID_SEGMENT_SLUGS];
}
