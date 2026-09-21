import React from 'react';
import type { Metadata } from 'next';
import { getHomepageSettings, getStorefrontSettings } from '../services/settings.service';
import { getFeaturedCars } from '../services/cars.service';
import { HeroEventBanner } from '../components/home/HeroEventBanner';
import { LeadMagnetFilter } from '../components/home/LeadMagnetFilter';
import { SalerProfileSection } from '../components/home/SalerProfileSection';
import { FeaturedCarsSection } from '../components/home/FeaturedCarsSection';
import { DeliveryStoriesSection } from '../components/home/DeliveryStoriesSection';
import { LatestNewsSection, type ArticlePreview } from '../components/home/LatestNewsSection';

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
export default async function HomePage() {
  const [homepage, settings, featuredCars] = await Promise.all([
    getHomepageSettings(),
    getStorefrontSettings(),
    getFeaturedCars(),
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

      {/* Phân Khu 2: Lead Magnet Hub (Bộ Lọc Nhanh) */}
      <LeadMagnetFilter
        config={homepage.leadFilter}
        totalCars={featuredCars.length || 8}
      />

      {/* Phân Khu 3: VIP Showroom / Hồ Sơ Saler & 4 Cam Kết Vàng */}
      <SalerProfileSection
        config={homepage.salerShowroom}
        hotline={hotline}
        zalo={zalo}
      />

      {/* Phân Khu 4: Featured Cars Showcase (Dòng Xe Bán Chạy) */}
      <FeaturedCarsSection
        config={homepage.featuredCars}
        cars={featuredCars}
      />

      {/* Phân Khu 5: Testimonials & Delivery Stories (Bàn Giao Xe Thực Tế) */}
      <DeliveryStoriesSection
        config={homepage.deliveryStories}
      />

      {/* Phân Khu 6: Latest News & Special Promotions (Tin Tức Khuyến Mãi) */}
      <LatestNewsSection
        config={homepage.latestPromotions}
        posts={SAMPLE_PROMOTIONS}
      />
    </div>
  );
}
