import React from 'react';
import type { Metadata } from 'next';
import type { CarCatalogItem } from '@cardealer/types';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getCatalogCars } from '@/services/cars.service';
import { getStorefrontSettings } from '@/services/settings.service';
import { generateCatalogJsonLd } from '@cardealer/core';
import { getSiteUrl } from '@cardealer/env';
import { CatalogView } from './components/CatalogView';

export const revalidate = 60; // Next.js Incremental Static Regeneration: 60 giây

// 🧠 Mental Model: Metadata chuẩn SEO Google cho trang Danh mục dòng xe /xe.
// Cố định canonical tại '/xe' để bảo vệ PageRank, tránh bị phạt Duplicate Content khi có query lọc.
export async function generateMetadata(): Promise<Metadata> {
  let showroom = 'Hyundai';
  try {
    const settings = await getStorefrontSettings();
    showroom = settings?.site?.businessName || settings?.contact?.showroomName || 'Hyundai';
  } catch {
    // Fallback nếu settings service không phản hồi
  }

  return {
    title: `Bảng Giá Các Dòng Xe Hyundai Mới Nhất 2026 | ${showroom}`,
    description: `Danh mục toàn bộ các dòng xe Hyundai Sedan, SUV, MPV, Hatchback và Xe điện chính hãng tại ${showroom}. Dự toán chi phí lăn bánh và ưu đãi trả trước mới nhất.`,
    alternates: {
      canonical: '/xe',
    },
    openGraph: {
      title: `Bảng Giá Các Dòng Xe Hyundai Chính Hãng 2026 | ${showroom}`,
      description: `Khám phá và so sánh các dòng xe Hyundai chính hãng. Báo giá lăn bánh và bảng tính trả góp ngân hàng hỗ trợ đến 85%.`,
      url: '/xe',
      type: 'website',
      images: [
        {
          url: '/images/og-catalog.webp',
          width: 1200,
          height: 630,
          alt: `Danh mục xe Hyundai tại ${showroom}`,
        },
      ],
    },
  };
}

// 🧠 Mental Model: Server Component (RSC) cho trang Danh mục dòng xe /xe.
// 1. Nạp trước toàn bộ dòng xe published qua getCatalogCars() với ISR cache tag 'catalog-cars'.
// 2. Nạp cấu hình hotline showroom để phục vụ nút tư vấn khi không tìm thấy xe (Zero-State).
// 3. Nhúng dữ liệu có cấu trúc JSON-LD Schema ItemList + AggregateOffer ngay trong mã nguồn HTML cho Googlebot.
// 4. Hydrate dữ liệu ban đầu cho Client Island CatalogView để xử lý lọc in-memory siêu tốc (< 5ms).
// 5. Bọc try-catch để chuyển mượt sang Error State nếu mạng hoặc backend gặp sự cố.
export default async function CatalogPage() {
  let cars: CarCatalogItem[] = [];
  let contactHotline: string | undefined;
  let errorMessage: string | undefined;

  try {
    const [fetchedCars, settings] = await Promise.all([
      getCatalogCars(),
      getStorefrontSettings(),
    ]);
    cars = fetchedCars;
    contactHotline = settings?.contact?.hotlineKinhDoanh || settings?.contact?.hotlineDichVu;
  } catch (error) {
    console.error('[CatalogPage] Failed to fetch catalog data:', error);
    errorMessage =
      'Không thể tải dữ liệu danh mục xe từ máy chủ. Quý khách vui lòng thử lại hoặc liên hệ hotline để nhận báo giá trực tiếp.';
  }

  const siteUrl = getSiteUrl();
  const jsonLd = generateCatalogJsonLd(cars, siteUrl);

  return (
    <main className="min-h-screen bg-slate-50 pt-4 sm:pt-6 pb-16 sm:pb-20">
      {/* JSON-LD Schema ItemList cho Google Search Engine */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* 1. Breadcrumbs Điều Hướng */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Bảng giá dòng xe' },
          ]}
        />

        {/* 2. Tiêu Đề Trang Danh Mục */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Bảng Giá Các Dòng Xe Hyundai Chính Hãng
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Cập nhật chi tiết bảng giá niêm yết, mức hỗ trợ trả trước và các chương trình ưu đãi mới nhất.
            Bấm chọn phân khúc hoặc ngân sách để tìm dòng xe phù hợp với gia đình bạn.
          </p>
        </div>

        {/* 3. Client Island: Bộ Lọc & Lưới Xe Thông Minh */}
        <React.Suspense fallback={null}>
          <CatalogView
            initialCars={cars}
            contactHotline={contactHotline}
            errorMessage={errorMessage}
          />
        </React.Suspense>
      </div>
    </main>
  );
}
