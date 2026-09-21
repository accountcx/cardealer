// 🧠 Mental Model: Machine Verification Suite cho Phase 4.2 Homepage Conversion Funnel.
// Kiểm thử tự động khế ước 6 phân khu, cơ chế Bật/Tắt độc lập, Zero-Crash Fallback, và Graceful Degradation.

import { describe, it, expect } from 'vitest';
import {
  HomepageSettingsSchema,
  HeroBannerSchema,
  LeadFilterSchema,
  SalerShowroomSchema,
  FeaturedCarsZoneSchema,
  DeliveryStoriesZoneSchema,
  LatestPromotionsZoneSchema,
  DEFAULT_HOMEPAGE_SETTINGS,
} from '@cardealer/types';

describe('🧪 Machine Verification: Phase 4.2 Homepage Conversion Funnel', () => {
  describe('Flow 1: Khế Ước 6 Phân Khu & Fallback Defaults', () => {
    it('TC-1.1: HeroBannerSchema mặc định bật và đầy đủ trường', () => {
      const hero = HeroBannerSchema.parse({});
      expect(hero.enabled).toBe(true);
      expect(hero.headline).toContain('Hyundai Vinh');
      expect(hero.countdown.enabled).toBe(true);
      expect(hero.remainingSlots.slotsCount).toBe(5);
    });

    it('TC-1.2: LeadFilterSchema có đầy đủ mốc ngân sách và kiểu dáng xe', () => {
      const filter = LeadFilterSchema.parse({});
      expect(filter.enabled).toBe(true);
      expect(filter.priceRanges.length).toBe(3);
      expect(filter.bodyStyles.length).toBe(3);
    });

    it('TC-1.3: SalerShowroomSchema sinh đúng tên saler và 4 cam kết vàng', () => {
      const saler = SalerShowroomSchema.parse({});
      expect(saler.enabled).toBe(true);
      expect(saler.salerName).toBe('Nguyễn Văn Tuấn');
      expect(saler.commitments.length).toBe(4);
    });

    it('TC-1.4: FeaturedCarsZoneSchema mặc định bật với maxDisplay = 6', () => {
      const featured = FeaturedCarsZoneSchema.parse({});
      expect(featured.enabled).toBe(true);
      expect(featured.maxDisplay).toBe(6);
      expect(featured.viewAllHref).toBe('/xe');
    });

    it('TC-1.5: DeliveryStoriesZoneSchema có 3 câu chuyện mẫu', () => {
      const stories = DeliveryStoriesZoneSchema.parse({});
      expect(stories.enabled).toBe(true);
      expect(stories.stories.length).toBe(3);
    });

    it('TC-1.6: LatestPromotionsZoneSchema có maxPosts = 3', () => {
      const news = LatestPromotionsZoneSchema.parse({});
      expect(news.enabled).toBe(true);
      expect(news.maxPosts).toBe(3);
    });

    it('TC-1.7: HomepageSettingsSchema nạp gộp toàn bộ 6 phân khu', () => {
      const full = HomepageSettingsSchema.parse({});
      expect(full.heroBanner.enabled).toBe(true);
      expect(full.leadFilter.enabled).toBe(true);
      expect(full.salerShowroom.enabled).toBe(true);
      expect(full.featuredCars.enabled).toBe(true);
      expect(full.deliveryStories.enabled).toBe(true);
      expect(full.latestPromotions.enabled).toBe(true);
      expect(DEFAULT_HOMEPAGE_SETTINGS).toBeDefined();
    });
  });

  describe('Flow 2: Rào Chắn Dữ Liệu & Chặn Giá Trị Sai Lệch', () => {
    it('TC-2.1: Chặn số suất ưu đãi âm', () => {
      expect(() => {
        HeroBannerSchema.parse({
          remainingSlots: { slotsCount: -1 },
        });
      }).toThrow();
    });

    it('TC-2.2: Chặn số lượng xe hiển thị < 1 hoặc > 12', () => {
      expect(() => FeaturedCarsZoneSchema.parse({ maxDisplay: 0 })).toThrow();
      expect(() => FeaturedCarsZoneSchema.parse({ maxDisplay: 15 })).toThrow();
    });
  });

  describe('Flow 3: Graceful Degradation & Toggle Decision Logic', () => {
    it('TC-3.1: Cho phép tắt độc lập bất kỳ phân khu nào', () => {
      const custom = HomepageSettingsSchema.parse({
        heroBanner: { enabled: false },
        deliveryStories: { enabled: false },
        latestPromotions: { enabled: false },
      });
      expect(custom.heroBanner.enabled).toBe(false);
      expect(custom.deliveryStories.enabled).toBe(false);
      expect(custom.latestPromotions.enabled).toBe(false);
      expect(custom.leadFilter.enabled).toBe(true);
      expect(custom.salerShowroom.enabled).toBe(true);
      expect(custom.featuredCars.enabled).toBe(true);
    });
  });
});
