import { describe, it, expect } from 'vitest';
import {
  SiteSettingsSchema,
  NavigationSettingsSchema,
  ContactSettingsSchema,
  FloatingSellerSettingsSchema,
  StickyBarSettingsSchema,
  FooterSettingsSchema,
  BulkSettingsSchema,
  sanitizePhoneNumber,
  normalizeZaloUrl,
} from '@cardealer/types';

// 🧠 Mental Model: Test Suite kiểm chứng cơ chế Zero-Crash Default Fallbacks cho Phase 4.1
// Đảm bảo dù cơ sở dữ liệu rỗng hoặc trả về JSONB lỗi, hệ thống vẫn parse ra đầy đủ các trường mặc định hợp lệ.
describe('Settings Zod Schemas & Zero-Crash Fallbacks', () => {
  it('TC-1.1: SiteSettingsSchema tự động sinh đầy đủ các trường mặc định khi parse object rỗng', () => {
    const result = SiteSettingsSchema.parse({});
    expect(result.siteTitle).toContain('Hyundai Vinh');
    expect(result.phone).toBe('0981.234.567');
    expect(result.address).toContain('Đại lộ Lê Nin');
    expect(result.mapLatitude).toBeCloseTo(18.6796);
  });

  it('TC-1.2: NavigationSettingsSchema sinh menu điều hướng 6 mục chuẩn với menu con', () => {
    const result = NavigationSettingsSchema.parse({});
    expect(result.headerLinks).toHaveLength(6);
    const carsMenu = result.headerLinks.find((link) => link.id === 'nav-cars');
    expect(carsMenu).toBeDefined();
    expect(carsMenu?.label).toBe('Dòng Xe');
    expect(carsMenu?.subLinks).toHaveLength(3);
    expect(carsMenu?.subLinks[0].label).toContain('Sedan');
  });

  it('TC-1.3: ContactSettingsSchema sinh hotline, mạng xã hội và thông tin pháp lý tùy chọn (không ép fallback công ty)', () => {
    const result = ContactSettingsSchema.parse({});
    // Mặc định không fallback chuỗi cứng để phù hợp với từng cá nhân saler
    expect(result.showroomName).toBe('');
    expect(result.hotlineKinhDoanh).toBe('');
    expect(result.socialMedia.facebookUrl).toBe('');
    // Pháp lý là tùy chọn cho saler cá nhân, không fallback doanh nghiệp
    expect(result.legal.businessName).toBe('');
    expect(result.legal.businessLicense).toBe('');
    expect(result.legal.copyrightText).toBe('');

    // Kiểm tra parse thành công khi có dữ liệu tùy chỉnh
    const custom = ContactSettingsSchema.parse({
      showroomName: 'Tuấn Hyundai Official',
      hotlineKinhDoanh: '0981.234.567',
      socialMedia: { facebookUrl: 'https://facebook.com/tuanhyundai' },
    });
    expect(custom.showroomName).toBe('Tuấn Hyundai Official');
    expect(custom.hotlineKinhDoanh).toBe('0981.234.567');
    expect(custom.socialMedia.facebookUrl).toBe('https://facebook.com/tuanhyundai');
  });

  it('TC-1.4: FloatingSellerSettingsSchema sinh thông tin chuyên viên tư vấn trực tuyến', () => {
    const result = FloatingSellerSettingsSchema.parse({});
    expect(result.enabled).toBe(true);
    expect(result.sellerName).toBe('Tuấn Hyundai');
    expect(result.sellerPhone).toBe('0981.234.567');
    expect(result.isOnline).toBe(true);
    expect(result.statusText).toContain('Đang trực tuyến');
  });

  it('TC-1.5: StickyBarSettingsSchema sinh thông tin thanh chốt đơn chân trang', () => {
    const result = StickyBarSettingsSchema.parse({});
    expect(result.enabled).toBe(true);
    expect(result.ctaText).toBe('NHẬN BÁO GIÁ');
    expect(result.callText).toBe('GỌI NGAY');
    expect(result.hotline).toBe('0981.234.567');
    expect(result.showOnMobile).toBe(true);
  });

  it('TC-1.6: BulkSettingsSchema nạp gộp toàn bộ 6 keys mà không ném lỗi', () => {
    const parseResult = BulkSettingsSchema.safeParse({});
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.site.siteTitle).toBeDefined();
      expect(parseResult.data.navigation.headerLinks).toBeDefined();
      expect(parseResult.data.contact.hotlineKinhDoanh).toBeDefined();
      expect(parseResult.data.floatingSeller.sellerName).toBeDefined();
      expect(parseResult.data.stickyBar.ctaText).toBeDefined();
      expect(parseResult.data.footer.column2Title).toBe('Dòng Xe Hyundai');
    }
  });

  it('TC-1.9: FooterSettingsSchema sinh cấu hình 4 cột chân trang đầy đủ', () => {
    const result = FooterSettingsSchema.parse({});
    expect(result.column2Title).toBe('Dòng Xe Hyundai');
    expect(result.column2Links.length).toBeGreaterThan(0);
    expect(result.column3Title).toBe('Công Cụ & Dịch Vụ');
    expect(result.column3Links.length).toBeGreaterThan(0);
    expect(result.showCertifiedBadge).toBe(true);
  });

  it('TC-1.7: sanitizePhoneNumber khử sạch ký tự phân cách cho thẻ tel:', () => {
    expect(sanitizePhoneNumber('0981.234.567')).toBe('0981234567');
    expect(sanitizePhoneNumber('0981 234 567')).toBe('0981234567');
    expect(sanitizePhoneNumber('+84 981-234-567')).toBe('+84981234567');
    expect(sanitizePhoneNumber(null)).toBe('');
    expect(sanitizePhoneNumber(undefined)).toBe('');
  });

  it('TC-1.8: normalizeZaloUrl tự động tạo đường dẫn Zalo OA/cá nhân chuẩn xác', () => {
    expect(normalizeZaloUrl('0981.234.567')).toBe('https://zalo.me/0981234567');
    expect(normalizeZaloUrl('https://zalo.me/0981234567')).toBe('https://zalo.me/0981234567');
    expect(normalizeZaloUrl('0981 234 567')).toBe('https://zalo.me/0981234567');
    expect(normalizeZaloUrl('')).toBe('');
  });
});
