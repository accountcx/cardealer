import React from 'react';
import type { Metadata } from 'next';
import { getHomepageSettings, getStorefrontSettings } from '../services/settings.service';
import { getFeaturedCars, getCatalogCars } from '../services/cars.service';
import { HeroEventBanner } from '../components/home/HeroEventBanner';
import { LeadMagnetFilter } from '../components/home/LeadMagnetFilter';
import { FeaturedCarsSection } from '../components/home/FeaturedCarsSection';
import { RollingEstimateCalloutBanner } from '../components/home/RollingEstimateCalloutBanner';
import { SalerProfileSection } from '../components/home/SalerProfileSection';
import { DeliveryStoriesSection } from '../components/home/DeliveryStoriesSection';
import { LatestNewsSection, type ArticlePreview } from '../components/home/LatestNewsSection';
import { HomeFilterProvider } from '../components/home/HomeFilterContext';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings();
  return {
    title: `${settings.site.siteTitle} ${settings.site.titleSuffix}`,
    description: settings.site.defaultDescription,
    openGraph: {
      title: settings.site.siteTitle,
      description: settings.site.defaultDescription,
      images: [settings.site.defaultImage],
    },
  };
}

// 🧠 Mental Model: Danh sách bài viết khuyến mãi & cẩm nang mua xe mặc định.
// Phục vụ hiển thị phân khu 6 cho tới khi Phase 5 Content Engine hoàn thành.
// Nếu admin tắt công tắc Khu 6 trong Admin Portal, phân khu này sẽ tự động ẩn đi (Graceful Degradation).
const SAMPLE_PROMOTIONS: ArticlePreview[] = [
  {
    id: 'promo-1',
    title: 'Bảng Giá Xe Ô Tô Hyundai Mới Nhất Tháng 09/2026 Tại Nghệ An',
    slug: 'bang-gia-xe-hyundai-thang-09-2026',
    summary: 'Tổng hợp chính sách giảm giá niêm yết, ưu đãi 50% - 100% lệ phí trước bạ và quà tặng phụ kiện chính hãng tại đại lý.',
    thumbnailUrl: '/images/banners/hero-event.webp',
    publishedAt: '21/09/2026',
  },
  {
    id: 'promo-2',
    title: 'Hướng Dẫn Mua Xe Ô Tô Trả Góp Lãi Suất Thấp — Bao Đậu Hồ Sơ 24h',
    slug: 'huong-dan-mua-xe-tra-gop-ngan-hang',
    summary: 'Chi tiết thủ tục vay ngân hàng đến 85% giá trị xe, cách tính tiền lãi hàng tháng và điều kiện nhận xe ngay.',
    thumbnailUrl: '/images/delivery/delivery-1.webp',
    publishedAt: '18/09/2026',
  },
  {
    id: 'promo-3',
    title: 'Đánh Giá Chi Tiết Hyundai Tucson 2025: Thiết Kế & Trang Bị Đột Phá',
    slug: 'danh-gia-chi-tiet-hyundai-tucson-2025',
    summary: 'Khám phá thế hệ SUV hoàn toàn mới với gói an toàn Hyundai SmartSense và động cơ SmartStream tiết kiệm nhiên liệu.',
    thumbnailUrl: '/images/cars/tucson.webp',
    publishedAt: '15/09/2026',
  },
];

// 🧠 Mental Model: Trang Chủ Phễu Chuyển Đổi 6 Phân Khu (Homepage Conversion Funnel - `/`).
// 1. Server-Side Rendering (RSC) nạp song song Promise.all dữ liệu settings và catalog xe, triệt tiêu CLS = 0.
// 2. Mọi phân khu đều tuân thủ cơ chế Graceful Degradation: Tự động ẩn nếu bị tắt hoặc rỗng dữ liệu.
// 3. Phân Khu 2 (LeadMagnetFilter) và Phân Khu 4 (FeaturedCarsSection) liên kết qua HomeFilterProvider để lọc xe tức thì.
export default async function HomePage() {
  const [homepage, settings, featuredCars, allCars] = await Promise.all([
    getHomepageSettings(),
    getStorefrontSettings(),
    getFeaturedCars(),
    getCatalogCars(),
  ]);

  const hotline = settings.contact.hotlineKinhDoanh || settings.site.phone || '0981.234.567';
  const zalo = settings.contact.zaloNumber || hotline;

  return (
    <div className="w-full bg-white text-slate-900 selection:bg-[#0072CE] selection:text-white min-h-screen">
      {/* Phân Khu 1: Hero Event Banner & Countdown Timer */}
      <HeroEventBanner
        config={homepage.heroBanner}
        hotline={hotline}
      />

      <React.Suspense fallback={null}>
        <HomeFilterProvider
          allCars={allCars}
          defaultFeaturedCars={featuredCars}
          priceRanges={homepage.leadFilter.priceRanges}
          bodyStyles={homepage.leadFilter.bodyStyles}
        >
          {/* Vị trí 2: Khối Bộ Lọc Xe (Filter) */}
          <LeadMagnetFilter
            config={homepage.leadFilter}
            totalCars={allCars.length || featuredCars.length || 8}
          />

          {/* Vị trí 3: Danh Sách Xe Bán Chạy (Hiển thị ngay dưới Filter để khách lọc xong thấy xe ngay) */}
          <FeaturedCarsSection
            config={homepage.featuredCars}
            cars={featuredCars}
          />

          {/* Vị trí 4: BANNER MỒI CÂU DẪN VỀ TRANG TÍNH GIÁ (Lead Magnet Banner) */}
          <RollingEstimateCalloutBanner
            config={homepage.rollingEstimateCallout}
            hotline={hotline}
          />
        </HomeFilterProvider>
      </React.Suspense>

      {/* Vị trí 5: Khối Cam kết đại lý 3S & Uy tín chuyên viên */}
      <SalerProfileSection
        config={homepage.salerShowroom}
        hotline={hotline}
        zalo={zalo}
      />

      {/* Vị trí 6: Khoảnh khắc bàn giao xe thực tế (Social Proof tạo lòng tin) */}
      <DeliveryStoriesSection
        config={homepage.deliveryStories}
      />

      {/* Vị trí 7: Tin tức SEO & Footer */}
      <LatestNewsSection
        config={homepage.latestPromotions}
        posts={SAMPLE_PROMOTIONS}
      />
    </div>
  );
}
