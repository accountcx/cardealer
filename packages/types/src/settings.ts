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
// 🧠 Mental Model: Cung cấp toàn bộ 6 nhóm cấu hình trong 1 payload duy nhất giúp Storefront RootLayout
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

// 7. Event Banner & Quote Settings (Duy trì tính tương thích ngược cho Phase 3 & 4.2)
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
