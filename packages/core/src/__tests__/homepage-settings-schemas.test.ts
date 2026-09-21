import { describe, it, expect } from 'vitest';
import {
  HeroBannerSchema,
  LeadFilterSchema,
  SalerShowroomSchema,
  FeaturedCarsZoneSchema,
  DeliveryStoriesZoneSchema,
  LatestPromotionsZoneSchema,
  HomepageSettingsSchema,
  DEFAULT_HOMEPAGE_SETTINGS,
} from '@cardealer/types';

// 🧠 Mental Model: Test Suite kiểm chứng tính toàn vẹn của 6 phân khu Phễu Trang Chủ (Phase 4.2).
// Đảm bảo nguyên tắc Zero-Crash Fallback: Dù cơ sở dữ liệu trống, thiếu trường hay truyền object rỗng {},
// hệ thống vẫn tự động sinh cấu hình mặc định an toàn 100%, sẵn sàng render mà không phát sinh lỗi runtime.
describe('Homepage Funnel 6 Zones Schemas & Fallbacks (Phase 4.2)', () => {
  it('TC-1.1: HeroBannerSchema sinh cấu hình mặc định đầy đủ khi parse {}', () => {
    const hero = HeroBannerSchema.parse({});
    expect(hero.enabled).toBe(true);
    expect(hero.headline).toContain('Hyundai Vinh');
    expect(hero.mediaType).toBe('image');
    expect(hero.contentPosition).toBe('center-left');
    expect(hero.countdown.enabled).toBe(true);
    expect(hero.countdown.targetDate).toContain('2026');
    expect(hero.remainingSlots.enabled).toBe(true);
    expect(hero.remainingSlots.slotsCount).toBe(5);
    expect(hero.ctaButton.action).toBe('quote_modal');
  });

  it('TC-1.2b: HeroBannerSchema hỗ trợ contentPosition center-center và center-right', () => {
    const center = HeroBannerSchema.parse({ contentPosition: 'center-center' });
    expect(center.contentPosition).toBe('center-center');

    const right = HeroBannerSchema.parse({ contentPosition: 'center-right' });
    expect(right.contentPosition).toBe('center-right');
  });

  it('TC-1.2: HeroBannerSchema chặn số suất ưu đãi âm', () => {
    expect(() => {
      HeroBannerSchema.parse({
        remainingSlots: { slotsCount: -3 },
      });
    }).toThrow();
  });

  it('TC-1.3: LeadFilterSchema sinh các mốc ngân sách và kiểu dáng xe mặc định', () => {
    const filter = LeadFilterSchema.parse({});
    expect(filter.enabled).toBe(true);
    expect(filter.priceRanges).toHaveLength(3);
    expect(filter.priceRanges[0].id).toBe('under_500');
    expect(filter.bodyStyles).toHaveLength(3);
    expect(filter.bodyStyles.map((b) => b.segment)).toEqual(['sedan', 'suv', 'mpv']);
  });

  it('TC-1.4: SalerShowroomSchema sinh hồ sơ saler và 4 cam kết vàng, hỗ trợ chuyển đổi mode showroom', () => {
    const saler = SalerShowroomSchema.parse({});
    expect(saler.enabled).toBe(true);
    expect(saler.mode).toBe('saler');
    expect(saler.salerName).toBe('Nguyễn Văn Tuấn');
    expect(saler.commitments).toHaveLength(4);
    expect(saler.commitments[0].title).toContain('Trả Góp');
    expect(saler.commitments[1].title).toContain('Giao Xe');

    // Chế độ Showroom 3S
    const showroom = SalerShowroomSchema.parse({
      mode: 'showroom',
      showroomName: 'Hyundai Vinh — Showroom Chuẩn 3S',
    });
    expect(showroom.mode).toBe('showroom');
    expect(showroom.showroomName).toBe('Hyundai Vinh — Showroom Chuẩn 3S');
    expect(showroom.showroomAddress).toBeDefined();
    expect(showroom.showroomBadge).toBeDefined();
  });

  it('TC-1.5: FeaturedCarsZoneSchema xác thực số lượng xe tối đa', () => {
    const featured = FeaturedCarsZoneSchema.parse({});
    expect(featured.enabled).toBe(true);
    expect(featured.maxDisplay).toBe(6);
    expect(featured.viewAllHref).toBe('/xe');

    // Chặn khi maxDisplay < 1 hoặc > 12
    expect(() => FeaturedCarsZoneSchema.parse({ maxDisplay: 0 })).toThrow();
    expect(() => FeaturedCarsZoneSchema.parse({ maxDisplay: 15 })).toThrow();
  });

  it('TC-1.6: DeliveryStoriesZoneSchema sinh danh sách câu chuyện bàn giao xe thực tế', () => {
    const stories = DeliveryStoriesZoneSchema.parse({});
    expect(stories.enabled).toBe(true);
    expect(stories.stories).toHaveLength(3);
    expect(stories.stories[0].customerName).toBe('Gia Đình Anh Nam');
    expect(stories.stories[0].carModel).toContain('Tucson');
  });

  it('TC-1.7: LatestPromotionsZoneSchema cấu hình hiển thị bài viết khuyến mãi', () => {
    const news = LatestPromotionsZoneSchema.parse({});
    expect(news.enabled).toBe(true);
    expect(news.maxPosts).toBe(3);
    expect(news.featuredPostIds).toEqual([]);
  });

  it('TC-1.8: HomepageSettingsSchema nạp gộp toàn bộ 6 phân khu và hỗ trợ toggle độc lập', () => {
    const full = HomepageSettingsSchema.parse({});
    expect(full.heroBanner.enabled).toBe(true);
    expect(full.leadFilter.enabled).toBe(true);
    expect(full.salerShowroom.enabled).toBe(true);
    expect(full.featuredCars.enabled).toBe(true);
    expect(full.deliveryStories.enabled).toBe(true);
    expect(full.latestPromotions.enabled).toBe(true);

    // Kiểm tra toggle tắt độc lập 1 hoặc nhiều phân khu
    const partial = HomepageSettingsSchema.parse({
      heroBanner: { enabled: true, headline: 'Ưu đãi hè' },
      deliveryStories: { enabled: false },
      latestPromotions: { enabled: false },
    });
    expect(partial.heroBanner.headline).toBe('Ưu đãi hè');
    expect(partial.deliveryStories.enabled).toBe(false);
    expect(partial.latestPromotions.enabled).toBe(false);
    expect(partial.featuredCars.enabled).toBe(true); // Vẫn giữ default true
  });

  it('TC-1.9: DEFAULT_HOMEPAGE_SETTINGS tồn tại và có giá trị hợp lệ 100%', () => {
    expect(DEFAULT_HOMEPAGE_SETTINGS).toBeDefined();
    expect(DEFAULT_HOMEPAGE_SETTINGS.heroBanner.headline).toBeDefined();
    expect(DEFAULT_HOMEPAGE_SETTINGS.salerShowroom.salerName).toBe('Nguyễn Văn Tuấn');
  });
});
