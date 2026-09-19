import { z } from 'zod';

export const SiteSettingsSchema = z.object({
  siteTitle: z.string().default('Hyundai Vinh - Đại Lý Ô Tô Ủy Quyền Chính Hãng'),
  titleSuffix: z.string().default('| Hotline: 0981.234.567'),
  defaultDescription: z.string().default('Đại lý phân phối xe Hyundai chính hãng tại Nghệ An, Hà Tĩnh. Giá tốt nhất, hỗ trợ trả góp 85%, giao xe tận nhà.'),
  defaultImage: z.string().default('/images/og-image.jpg'),
  favicon: z.string().default('/favicon.ico'),
  gaId: z.string().optional(),
  gtmId: z.string().optional(),
  businessName: z.string().default('Công ty Cổ phần Ô tô Hyundai Vinh'),
  address: z.string().default('Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An'),
  phone: z.string().default('0981.234.567'),
  mapLatitude: z.number().default(18.6796),
  mapLongitude: z.number().default(105.6813),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

export const ContactSettingsSchema = z.object({
  sellerName: z.string().default('Tuấn Hyundai'),
  sellerPhone: z.string().default('0981.234.567'),
  sellerZalo: z.string().default('https://zalo.me/0981234567'),
  sellerEmail: z.string().default('admin@xehyundaivinh.com'),
  sellerAddress: z.string().default('Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An'),
  sellerAvatar: z.string().default('/images/avatars/sale-tuan.webp'),
  workingHours: z.string().default('08:00 - 18:00 (Thứ 2 - Chủ Nhật)'),
  googleMapEmbed: z.string().optional(),
  socialMedia: z.object({
    facebookUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    zaloUrl: z.string().optional(),
  }).default({}),
  legal: z.object({
    businessName: z.string().default('Hyundai Vinh'),
    copyrightText: z.string().default('© 2025 XeHyundaiVinh. All rights reserved.'),
  }).default({
    businessName: 'Hyundai Vinh',
    copyrightText: '© 2025 XeHyundaiVinh. All rights reserved.',
  }),
});
export type ContactSettings = z.infer<typeof ContactSettingsSchema>;

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
