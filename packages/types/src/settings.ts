import { z } from 'zod';

// 🧠 Mental Model: Helper tiện ích chuẩn hóa số điện thoại dùng cho giao thức tel: trên thiết bị di động.
// Tự động loại bỏ dấu cách, dấu chấm, dấu gạch ngang để đảm bảo OS Phone Dialer kích hoạt cuộc gọi chính xác 100%.
export function sanitizePhoneNumber(phone: string | undefined | null): string {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

// 🧠 Mental Model: Helper tiện ích chuẩn hóa liên kết Zalo. Nếu người dùng nhập số điện thoại thuần túy
// hoặc link Zalo thiếu https://, hàm tự động chuẩn hóa về định dạng https://zalo.me/[clean_phone].
export function normalizeZaloUrl(zaloOrPhone: string | undefined | null): string {
  if (!zaloOrPhone) return '';
  const trimmed = zaloOrPhone.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanPhone = sanitizePhoneNumber(trimmed);
  return cleanPhone ? `https://zalo.me/${cleanPhone}` : '';
}

// 1. Site Settings Schema
export const SiteSettingsSchema = z.object({
  siteTitle: z.string().default('Xe Hyundai Vinh - Bảng Giá & Ưu Đãi Lăn Bánh'),
  titleSuffix: z.string().default('| Xe Hyundai Vinh'),
  defaultDescription: z.string().default('Website phân phối xe Hyundai chính hãng tại Nghệ An, Hà Tĩnh. Giá tốt nhất, hỗ trợ trả góp 85%, giao xe tận nhà.'),
  defaultImage: z.string().default('/images/og-image.jpg'),
  favicon: z.string().default('/favicon.ico'),
  gaId: z.string().optional(),
  gtmId: z.string().optional(),
  businessName: z.string().default('Xe Hyundai Vinh'),
  address: z.string().default('Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An'),
  phone: z.string().default('0981.234.567'),
  mapLatitude: z.number().default(18.6796),
  mapLongitude: z.number().default(105.6813),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

// 2. Navigation Settings Schemas (Menu điều hướng đa cấp)
export const NavSubLinkSchema = z.object({
  id: z.string().default(''),
  label: z.string().trim().min(1, 'Nhãn menu con không được để trống'),
  url: z.string().trim().min(1, 'Đường dẫn không được để trống'),
  newTab: z.boolean().default(false),
  badge: z.string().optional(),
});
export type NavSubLink = z.infer<typeof NavSubLinkSchema>;

export const NavLinkSchema = z.object({
  id: z.string().default(''),
  label: z.string().trim().min(1, 'Nhãn menu không được để trống'),
  url: z.string().trim().min(1, 'Đường dẫn không được để trống'),
  newTab: z.boolean().default(false),
  badge: z.string().optional(),
  order: z.number().int().default(0),
  subLinks: z.array(NavSubLinkSchema).default([]),
});
export type NavLink = z.infer<typeof NavLinkSchema>;

export const NavigationSettingsSchema = z.object({
  headerLinks: z.array(NavLinkSchema).default(() => [
    {
      id: 'nav-cars',
      label: 'Dòng Xe',
      url: '/xe',
      newTab: false,
      order: 1,
      subLinks: [
        { id: 'sub-sedan', label: 'Sedan (Accent, Elantra)', url: '/xe?kieuDang=Sedan', newTab: false },
        { id: 'sub-suv', label: 'SUV (Creta, Tucson, Santa Fe)', url: '/xe?kieuDang=SUV', newTab: false },
        { id: 'sub-mpv', label: 'MPV (Custin, Stargazer)', url: '/xe?kieuDang=MPV', newTab: false },
      ],
    },
    { id: 'nav-price', label: 'Bảng Giá Xe', url: '/gia-xe-hyundai', newTab: false, order: 2, subLinks: [] },
    { id: 'nav-calc', label: 'Tính Lăn Bánh', url: '/gia-lan-banh', newTab: false, order: 3, subLinks: [] },
    { id: 'nav-install', label: 'Mua Trả Góp', url: '/tra-gop', newTab: false, order: 4, subLinks: [] },
    { id: 'nav-news', label: 'Tin Tức & Ưu Đãi', url: '/tin-tuc', newTab: false, order: 5, subLinks: [] },
    { id: 'nav-contact', label: 'Liên Hệ', url: '/lien-he', newTab: false, order: 6, subLinks: [] },
  ]),
});
export type NavigationSettings = z.infer<typeof NavigationSettingsSchema>;

// 3. Contact & Showroom Settings Schema
export const ContactSettingsSchema = z.object({
  showroomName: z.string().default(''),
  sellerName: z.string().default(''),
  sellerPhone: z.string().default(''),
  sellerZalo: z.string().default(''),
  sellerEmail: z.string().default(''),
  sellerAddress: z.string().default(''),
  sellerAvatar: z.string().default(''),
  hotlineKinhDoanh: z.string().default(''),
  hotlineDichVu: z.string().default(''),
  zaloNumber: z.string().default(''),
  email: z.string().default(''),
  diaChi: z.string().default(''),
  workingHours: z.string().default(''),
  googleMapsUrl: z.string().default(''),
  googleMapEmbed: z.string().optional().default(''),
  socialMedia: z.object({
    facebookUrl: z.string().default(''),
    youtubeUrl: z.string().default(''),
    tiktokUrl: z.string().default(''),
    zaloUrl: z.string().default(''),
  }).default({
    facebookUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
    zaloUrl: '',
  }),
  legal: z.object({
    businessName: z.string().optional().default(''),
    businessLicense: z.string().optional().default(''),
    copyrightText: z.string().optional().default(''),
    bctCertificateUrl: z.string().optional().default(''),
  }).default({
    businessName: '',
    businessLicense: '',
    copyrightText: '',
    bctCertificateUrl: '',
  }),
});
export type ContactSettings = z.infer<typeof ContactSettingsSchema>;

// 4. Floating Seller Settings Schema (Widget chuyên viên tư vấn nổi)
export const FloatingSellerSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  sellerName: z.string().trim().min(1, 'Tên chuyên viên không được để trống').default('Tuấn Hyundai'),
  sellerPhone: z.string().trim().min(1, 'Số hotline không được để trống').default('0981.234.567'),
  sellerZalo: z.string().trim().min(1, 'Link Zalo không được để trống').default('https://zalo.me/0981234567'),
  sellerMessenger: z.string().default('https://m.me/xehyundaivinh'),
  sellerAvatar: z.string().default('/images/avatars/sale-tuan.webp'),
  statusText: z.string().default('Đang trực tuyến - Hỗ trợ 24/7'),
  isOnline: z.boolean().default(true),
  greetingMessage: z.string().default('Xin chào! Tôi có thể hỗ trợ báo giá lăn bánh hoặc tư vấn trả góp cho bạn ngay bây giờ.'),
});
export type FloatingSellerSettings = z.infer<typeof FloatingSellerSettingsSchema>;

// 5. Product Sticky Bar Settings Schema (Thanh chốt đơn chân trang)
export const StickyBarSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  ctaText: z.string().trim().min(1, 'Nhãn nút CTA không được để trống').default('NHẬN BÁO GIÁ'),
  callText: z.string().trim().min(1, 'Nhãn nút Gọi không được để trống').default('GỌI NGAY'),
  hotline: z.string().trim().min(1, 'Số hotline không được để trống').default('0981.234.567'),
  subtitle: z.string().default('Hỗ trợ trả góp 85% • Giao xe tận nhà'),
  showOnDesktop: z.boolean().default(true),
  showOnMobile: z.boolean().default(true),
});
export type StickyBarSettings = z.infer<typeof StickyBarSettingsSchema>;

// 6. Footer Settings Schema (Cấu hình liên kết, nội dung động chân trang)
export const FooterLinkItemSchema = z.object({
  id: z.string().default(''),
  label: z.string().trim().min(1, 'Nhãn liên kết không được để trống'),
  url: z.string().trim().min(1, 'Đường dẫn không được để trống'),
  badge: z.string().optional(),
  newTab: z.boolean().default(false),
});
export type FooterLinkItem = z.infer<typeof FooterLinkItemSchema>;

export const FooterSettingsSchema = z.object({
  column1Description: z.string().default('Chuyên trang phân phối và cập nhật bảng giá xe Hyundai chính hãng tại Nghệ An & Hà Tĩnh.'),
  column2Title: z.string().default('Dòng Xe Hyundai'),
  column2Links: z.array(FooterLinkItemSchema).default(() => [
    { id: 'f-accent', label: 'Hyundai Accent (Sedan hạng B)', url: '/xe?kieuDang=Sedan', newTab: false },
    { id: 'f-creta', label: 'Hyundai Creta (SUV đô thị)', url: '/xe?kieuDang=SUV', newTab: false },
    { id: 'f-tucson', label: 'Hyundai Tucson (SUV Crossover 5 chỗ)', url: '/xe?kieuDang=SUV', newTab: false },
    { id: 'f-santafe', label: 'Hyundai Santa Fe (SUV 7 chỗ cao cấp)', url: '/xe?kieuDang=SUV', newTab: false },
    { id: 'f-custin', label: 'Hyundai Custin (MPV gia đình)', url: '/xe?kieuDang=MPV', newTab: false },
    { id: 'f-stargazer', label: 'Hyundai Stargazer X (MPV 7 chỗ)', url: '/xe?kieuDang=MPV', newTab: false },
  ]),
  column3Title: z.string().default('Công Cụ & Dịch Vụ'),
  column3Links: z.array(FooterLinkItemSchema).default(() => [
    { id: 'f-calc', label: 'Dự toán giá lăn bánh', url: '/gia-lan-banh', badge: 'HOT', newTab: false },
    { id: 'f-installment', label: 'Tính lãi suất mua xe trả góp', url: '/gia-lan-banh', newTab: false },
    { id: 'f-price', label: 'Bảng giá xe Hyundai mới nhất', url: '/tin-tuc', newTab: false },
    { id: 'f-promo', label: 'Chương trình khuyến mãi tháng', url: '/tin-tuc', newTab: false },
    { id: 'f-testdrive', label: 'Đăng ký lái thử tại nhà', url: '/lien-he', newTab: false },
  ]),
  column4Title: z.string().default('Vị Trí Showroom 3S'),
  googleMapEmbed: z.string().default(''),
  certifiedBadgeText: z.string().default('Chính Hãng TC Motor'),
  showCertifiedBadge: z.boolean().default(true),
});
export type FooterSettings = z.infer<typeof FooterSettingsSchema>;

// 7. Bulk Settings Schema (Aggregator nạp gộp toàn bộ cấu hình Storefront)
// 🧠 Mental Model: Cung cấp toàn bộ các nhóm cấu hình trong 1 payload duy nhất giúp Storefront RootLayout
// chỉ cần gọi 1 HTTP request, triệt tiêu độ trễ mạng và loại bỏ hoàn toàn hiện tượng nhảy layout (CLS = 0).
export const BulkSettingsSchema = z.object({
  site: SiteSettingsSchema.default(() => SiteSettingsSchema.parse({})),
  navigation: NavigationSettingsSchema.default(() => NavigationSettingsSchema.parse({})),
  contact: ContactSettingsSchema.default(() => ContactSettingsSchema.parse({})),
  floatingSeller: FloatingSellerSettingsSchema.default(() => FloatingSellerSettingsSchema.parse({})),
  stickyBar: StickyBarSettingsSchema.default(() => StickyBarSettingsSchema.parse({})),
  footer: FooterSettingsSchema.default(() => FooterSettingsSchema.parse({})),
});
export type BulkSettings = z.infer<typeof BulkSettingsSchema>;

// 8. Homepage Funnel 6 Zones Schemas (Phase 4.2)
// 🧠 Mental Model: Mỗi phân khu đều có công tắc enabled độc lập. Khi enabled = false hoặc dữ liệu rỗng,
// Storefront áp dụng cơ chế Graceful Degradation tự động ẩn phân khu, không gây lỗi runtime hay vỡ layout.

// 8.1. Khu 1: Hero Event Banner
export const HeroBannerSchema = z.object({
  enabled: z.boolean().default(true),
  headline: z.string().default('Đại Tiệc Ưu Đãi Ô Tô Hyundai Vinh'),
  subheadline: z.string().default('Hỗ trợ 50% - 100% lệ phí trước bạ, tặng gói phụ kiện chính hãng 30 triệu đồng'),
  mediaType: z.enum(['image', 'video']).default('image'),
  mediaUrl: z.string().default('/images/hero-banner.webp'),
  contentPosition: z.enum(['center-left', 'center-center', 'center-right']).default('center-left'),
  countdown: z.object({
    enabled: z.boolean().default(true),
    targetDate: z.string().default('2026-10-31T23:59:59+07:00'),
    urgencyText: z.string().default('Ưu đãi tháng vàng chỉ còn:'),
  }).default(() => ({
    enabled: true,
    targetDate: '2026-10-31T23:59:59+07:00',
    urgencyText: 'Ưu đãi tháng vàng chỉ còn:',
  })),
  remainingSlots: z.object({
    enabled: z.boolean().default(true),
    slotsCount: z.number().int().min(0, 'Số suất không được âm').default(5),
    badgeText: z.string().default('Chỉ còn 5 suất ưu đãi đặc biệt trong tháng'),
  }).default(() => ({
    enabled: true,
    slotsCount: 5,
    badgeText: 'Chỉ còn 5 suất ưu đãi đặc biệt trong tháng',
  })),
  ctaButton: z.object({
    text: z.string().default('Nhận Báo Giá Lăn Bánh Ngay'),
    action: z.enum(['quote_modal', 'tel', 'url']).default('quote_modal'),
    href: z.string().default(''),
  }).default(() => ({
    text: 'Nhận Báo Giá Lăn Bánh Ngay',
    action: 'quote_modal' as const,
    href: '',
  })),
});
export type HeroBannerConfig = z.infer<typeof HeroBannerSchema>;

// 8.2. Khu 2: Lead Magnet Hub (Bộ Lọc Nhanh)
export const PriceRangeItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  min: z.number().nullable(),
  max: z.number().nullable(),
});
export type PriceRangeItem = z.infer<typeof PriceRangeItemSchema>;

export const BodyStyleItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  segment: z.string(),
});
export type BodyStyleItem = z.infer<typeof BodyStyleItemSchema>;

export const LeadFilterSchema = z.object({
  enabled: z.boolean().default(true),
  headline: z.string().default('Tìm Kiếm Nhanh Chiếc Xe Ưng Ý Của Bạn'),
  priceRanges: z.array(PriceRangeItemSchema).default(() => [
    { id: 'under_500', label: 'Dưới 500 triệu', min: null, max: 500_000_000 },
    { id: '500_800', label: '500 - 800 triệu', min: 500_000_000, max: 800_000_000 },
    { id: 'above_800', label: 'Trên 800 triệu', min: 800_000_000, max: null },
  ]),
  bodyStyles: z.array(BodyStyleItemSchema).default(() => [
    { id: 'sedan', label: 'Sedan Đô Thị', segment: 'sedan' },
    { id: 'suv', label: 'SUV Gầm Cao', segment: 'suv' },
    { id: 'mpv', label: 'MPV 7 Chỗ', segment: 'mpv' },
  ]),
});
export type LeadFilterConfig = z.infer<typeof LeadFilterSchema>;

// 8.3. Khu 3: VIP Showroom / Hồ Sơ Năng Lực Saler
export const CommitmentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().default('shield'),
});
export type CommitmentItem = z.infer<typeof CommitmentItemSchema>;

export const SalerShowroomSchema = z.object({
  enabled: z.boolean().default(true),
  mode: z.enum(['saler', 'showroom']).default('saler'),
  headline: z.string().default('Cam Kết Vàng Từ Chuyên Viên Tư Vấn'),
  subheadline: z.string().default('Đồng hành tận tâm cùng quý khách hàng trên mọi cung đường'),
  salerName: z.string().default('Nguyễn Văn Tuấn'),
  salerTitle: z.string().default('Tư Vấn Bán Hàng Cấp Cao - Hyundai Vinh'),
  avatarUrl: z.string().default('/images/saler-avatar.webp'),
  introStory: z.string().default('Với hơn 6 năm kinh nghiệm tư vấn xe ô tô, tôi cam kết mang đến giải pháp mua xe tối ưu chi phí và minh bạch nhất.'),
  commitments: z.array(CommitmentItemSchema).default(() => [
    { id: 'c1', title: 'Hỗ Trợ Trả Góp 85%', description: 'Bao đậu hồ sơ vay khó, duyệt nhanh trong 24h, lãi suất ưu đãi đại lý.', icon: 'bank' },
    { id: 'c2', title: 'Giao Xe Tận Nhà Toàn Quốc', description: 'Hỗ trợ giao xe tận nơi bằng xe chuyên dụng theo yêu cầu ngày giờ tốt.', icon: 'truck' },
    { id: 'c3', title: 'Bảo Hành Chính Hãng 5 Năm', description: 'Áp dụng chính sách bảo hành toàn quốc tại tất cả đại lý 3S trên cả nước.', icon: 'shield' },
    { id: 'c4', title: 'Hỗ Trợ Thủ Tục 24/7', description: 'Đăng ký, đăng kiểm, bấm biển số, làm biển số đẹp và giao xe lăn bánh trọn gói.', icon: 'clock' },
  ]),
  showroomName: z.string().default('Hyundai Vinh — Đại Lý Ủy Quyền Chuẩn 3S'),
  showroomAddress: z.string().default('Km 3+500 Đại Lộ Lê Nin, TP. Vinh, Nghệ An'),
  showroomBadge: z.string().default('Đại Lý Chuẩn 3S Toàn Cầu GDSI'),
  showroomExperience: z.string().default('Quy mô 5.000m² — Xưởng dịch vụ tiêu chuẩn 3S toàn cầu'),
  showroomIntro: z.string().default('Showroom tiêu chuẩn 3S toàn cầu của Hyundai Thành Công Việt Nam. Chúng tôi cam kết mang đến không gian trải nghiệm đẳng cấp, xưởng dịch vụ kỹ thuật cao cùng kho xe đủ màu sẵn sàng giao ngay.'),
  galleryImages: z.array(z.string()).default(() => ['/images/banners/hero-event.webp']),
});
export type SalerShowroomConfig = z.infer<typeof SalerShowroomSchema>;

// 8.4. Khu 4: Featured Cars Showcase
export const FeaturedCarsZoneSchema = z.object({
  enabled: z.boolean().default(true),
  headline: z.string().default('Các Dòng Xe Hyundai Bán Chạy Nhất'),
  subheadline: z.string().default('Ưu đãi lớn trong tháng, sẵn xe đủ màu giao ngay'),
  maxDisplay: z.number().int().min(1).max(12).default(6),
  viewAllText: z.string().default('Xem Toàn Bộ Bảng Giá Xe'),
  viewAllHref: z.string().default('/xe'),
});
export type FeaturedCarsZoneConfig = z.infer<typeof FeaturedCarsZoneSchema>;

// 8.5. Khu 5: Delivery Stories (Khách Hàng Nhận Xe - Social Proof)
export const DeliveryStoryItemSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  location: z.string().default('TP. Vinh, Nghệ An'),
  carModel: z.string(),
  imageUrl: z.string(),
  quote: z.string().default(''),
  deliveryDate: z.string().default('Tháng 09/2026'),
});
export type DeliveryStoryItem = z.infer<typeof DeliveryStoryItemSchema>;

export const DeliveryStoriesZoneSchema = z.object({
  enabled: z.boolean().default(true),
  headline: z.string().default('Khoảnh Khắc Bàn Giao Xe Thực Tế'),
  subheadline: z.string().default('Hơn 500+ khách hàng đã tin tưởng lựa chọn mua xe cùng chúng tôi'),
  stories: z.array(DeliveryStoryItemSchema).default(() => [
    {
      id: 'story-1',
      customerName: 'Gia Đình Anh Nam',
      location: 'TP. Vinh, Nghệ An',
      carModel: 'Hyundai Tucson 2.0 Xăng Đặc Biệt',
      imageUrl: '/images/delivery/delivery-1.webp',
      quote: 'Tuấn tư vấn rất nhiệt tình, thủ tục giao xe trong ngày nhanh chóng, giá tốt nhất khu vực!',
      deliveryDate: 'Tháng 09/2026',
    },
    {
      id: 'story-2',
      customerName: 'Chị Thanh Mai',
      location: 'Hà Tĩnh',
      carModel: 'Hyundai Creta Cao Cấp (Màu Đỏ)',
      imageUrl: '/images/delivery/delivery-2.webp',
      quote: 'Hỗ trợ lái thử tận nhà, bấm được biển số đẹp rất ưng ý. Dịch vụ showroom rất chu đáo!',
      deliveryDate: 'Tháng 09/2026',
    },
    {
      id: 'story-3',
      customerName: 'Bác Hoàng Minh',
      location: 'Diễn Châu, Nghệ An',
      carModel: 'Hyundai Accent 1.4 AT',
      imageUrl: '/images/delivery/delivery-3.webp',
      quote: 'Hồ sơ ngân hàng duyệt trong 1 ngày, giao xe đúng giờ hoàng đạo. Cảm ơn em Tuấn!',
      deliveryDate: 'Tháng 09/2026',
    },
  ]),
});
export type DeliveryStoriesZoneConfig = z.infer<typeof DeliveryStoriesZoneSchema>;

// 8.6. Khu 6: Latest News & Special Promotions
export const LatestPromotionsZoneSchema = z.object({
  enabled: z.boolean().default(true),
  headline: z.string().default('Tin Tức Khuyến Mại & Sự Kiện'),
  subheadline: z.string().default('Cập nhật chính sách giá và chương trình ưu đãi mới nhất từ đại lý'),
  maxPosts: z.number().int().min(1).max(6).default(3),
  featuredPostIds: z.array(z.string()).default([]),
});
export type LatestPromotionsZoneConfig = z.infer<typeof LatestPromotionsZoneSchema>;

// 8.7. Homepage Settings Tổng Hợp
export const HomepageSettingsSchema = z.object({
  heroBanner: HeroBannerSchema.default(() => HeroBannerSchema.parse({})),
  leadFilter: LeadFilterSchema.default(() => LeadFilterSchema.parse({})),
  salerShowroom: SalerShowroomSchema.default(() => SalerShowroomSchema.parse({})),
  featuredCars: FeaturedCarsZoneSchema.default(() => FeaturedCarsZoneSchema.parse({})),
  deliveryStories: DeliveryStoriesZoneSchema.default(() => DeliveryStoriesZoneSchema.parse({})),
  latestPromotions: LatestPromotionsZoneSchema.default(() => LatestPromotionsZoneSchema.parse({})),
});
export type HomepageSettings = z.infer<typeof HomepageSettingsSchema>;

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = HomepageSettingsSchema.parse({});

// 9. Event Banner & Quote Settings (Duy trì tính tương thích ngược)
export const EventBannerSchema = z.object({
  enableBanner: z.boolean().default(true),
  mediaType: z.enum(['image', 'video']).default('image'),
  bannerImage: z.string().default('/images/banners/hero-event.webp'),
  videoUrl: z.string().optional(),
  title: z.string().default('ƯU ĐÃI ĐẶC QUYỀN THÁNG NÀY'),
  subtitle: z.string().default('Hỗ trợ 50% - 100% lệ phí trước bạ + Tặng gói phụ kiện chính hãng cao cấp'),
  showTitle: z.boolean().default(true),
  showSubtitle: z.boolean().default(true),
  eventBannerType: z.enum(['form', 'link']).default('form'),
  formLeadType: z.string().default('Event Lead'),
  formCtaText: z.string().default('Đăng Ký Nhận Ưu Đãi'),
  linkUrl: z.string().default('/xe'),
  linkCtaText: z.string().default('Xem Danh Mục Xe'),
  contentPosition: z.enum(['center-center', 'center-left', 'center-right', 'top-left', 'bottom-left']).default('center-left'),
  textColor: z.enum(['light', 'dark']).default('light'),
  showCountdown: z.boolean().default(true),
  countdownEndTime: z.string().default('2026-12-31T23:59:59Z'),
  slotsLeft: z.number().default(5),
});
export type EventBanner = z.infer<typeof EventBannerSchema>;

export const QuoteSettingsSchema = z.object({
  phiDangKiNgheAn: z.number().default(1_000_000), // Biển số TP. Vinh
  phiDangKiHuyen: z.number().default(200_000), // Biển số huyện
  phiDangKiem: z.number().default(140_000),
  phiBaoTriDuongBo: z.number().default(1_560_000), // 12 tháng
  phiDichVu: z.number().default(2_500_000), // Cà số, bấm biển
  tyLeBaoHiemThanVo: z.number().default(0.014), // 1.4%
  phiTNDS5Cho: z.number().default(480_700),
  phiTNDS7Cho: z.number().default(873_400),
});
export type QuoteSettings = z.infer<typeof QuoteSettingsSchema>;
