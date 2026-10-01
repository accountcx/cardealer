import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Sparkles, ChevronRight, Car, PhoneCall, RefreshCcw } from 'lucide-react';
import type { CarCatalogItem } from '@cardealer/types';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getCatalogCars } from '@/services/cars.service';
import { getStorefrontSettings } from '@/services/settings.service';
import { getSiteUrl } from '@cardealer/env';
import {
  getSegmentConfig,
  getAllSegmentSlugs,
  type SegmentSlug,
} from '@/config/segments';
import { filterCarsBySegment } from '@/lib/car-segment-filter';
import { SmartCarCard } from '@/app/xe/components/SmartCarCard';

export const revalidate = 60; // Next.js Incremental Static Regeneration: Tái tạo trang ngầm sau 60 giây

export interface SegmentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 🧠 Mental Model: Next.js 15 Static Params Prerendering.
// Tiền sinh sẵn 3 phân khúc hợp lệ ('sedan', 'suv', 'mpv') tại build time thành HTML tĩnh tối ưu tốc độ TTFB < 50ms.
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getAllSegmentSlugs().map((slug) => ({ slug }));
}

// 🧠 Mental Model: Sinh thẻ tiêu đề, mô tả và OpenGraph chuẩn mực cho Google Search Engine.
// Bắt buộc await params theo chuẩn Next.js 15 App Router để tránh lỗi runtime warning.
export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getSegmentConfig(slug);

  if (!config) {
    return {
      title: 'Không Tìm Thấy Phân Khúc Xe | Hyundai Vinh',
      robots: { index: false, follow: false },
    };
  }

  let showroom = 'Hyundai Vinh';
  try {
    const settings = await getStorefrontSettings();
    showroom = settings?.site?.businessName || settings?.contact?.showroomName || showroom;
  } catch {
    // Graceful fallback nếu settings service timeout
  }

  return {
    title: `${config.metaTitle} | ${showroom}`,
    description: config.metaDescription,
    alternates: {
      canonical: `/dong-xe/${config.slug}`,
    },
    openGraph: {
      title: `${config.h1Title} | ${showroom}`,
      description: config.metaDescription,
      url: `/dong-xe/${config.slug}`,
      type: 'website',
      images: [
        {
          url: config.ogImage,
          width: 1200,
          height: 630,
          alt: `${config.name} Hyundai tại ${showroom}`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// 🧠 Mental Model: Server Component (RSC) chuyên trách cho Dynamic Route Tĩnh /dong-xe/[slug].
// 1. Whitelist Verification: Chặn 100% slug ngoài danh mục hợp lệ bằng notFound(), loại bỏ hoàn toàn Soft-404.
// 2. Data Fetching Resilience: Lấy dữ liệu qua getCatalogCars() (ISR cache tag 'catalog-cars') với try-catch phòng thủ.
// 3. Dual Schema Injection: Nhúng tự động cả BreadcrumbList và ItemList Schema JSON-LD hỗ trợ Googlebot index giàu dữ liệu.
// 4. E-E-A-T Content Layout: Cung cấp khối bài viết chuyên sâu 200 chữ giải trình ưu điểm phân khúc trước lưới sản phẩm.
export default async function SegmentPage({ params }: SegmentPageProps) {
  const { slug } = await params;
  const config = getSegmentConfig(slug);

  // Chốt chặn bảo vệ: Nếu slug không nằm trong whitelist -> Kích hoạt trang 404 chuẩn của Next.js
  if (!config) {
    notFound();
  }

  let allCars: CarCatalogItem[] = [];
  let contactHotline = '0981.234.567';

  try {
    const [fetchedCars, settings] = await Promise.all([
      getCatalogCars(),
      getStorefrontSettings(),
    ]);
    allCars = fetchedCars;
    if (settings?.contact?.hotlineKinhDoanh) {
      contactHotline = settings.contact.hotlineKinhDoanh;
    }
  } catch (error) {
    console.warn('[SegmentPage] Không thể nạp danh mục xe từ API, fallback mảng rỗng:', error);
  }

  // Lọc xe in-memory thuần túy theo cấu hình phân khúc
  const filteredCars = filterCarsBySegment(allCars, slug);

  const siteUrl = getSiteUrl();

  // 1. Cấu trúc dữ liệu BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang Chủ',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Dòng Xe',
        item: `${siteUrl}/xe`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.name,
        item: `${siteUrl}/dong-xe/${config.slug}`,
      },
    ],
  };

  // 2. Cấu trúc dữ liệu ItemList JSON-LD cho danh sách sản phẩm
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.h1Title,
    description: config.metaDescription,
    url: `${siteUrl}/dong-xe/${config.slug}`,
    numberOfItems: filteredCars.length,
    itemListElement: filteredCars.map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: car.tenXe,
        url: `${siteUrl}/xe/${car.slug}`,
        image: car.anhDaiDienUrl,
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'VND',
          lowPrice: car.minPrice,
          highPrice: car.maxPrice,
          offerCount: car.versionCount || 1,
        },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-4 sm:pt-6 pb-16 sm:pb-20">
      {/* Schema JSON-LD Breadcrumbs cho Google Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Schema JSON-LD Danh mục xe cho Google Merchant & Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* 1. Breadcrumbs Điều Hướng */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Dòng xe', href: '/xe' },
            { label: config.name },
          ]}
        />

        {/* 2. Tiêu Đề H1 Duy Nhất & Badge Phân Khúc */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0072CE]/10 text-[#0072CE] text-xs font-bold uppercase tracking-wider">
            <Car className="w-3.5 h-3.5" />
            <span>Phân Khúc {config.name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {config.h1Title}
          </h1>
        </div>

        {/* 3. Bài Viết SEO E-E-A-T Chuyên Sâu (Chuẩn On-page SEO >= 200 Chữ) */}
        <section
          aria-label="Giới thiệu phân khúc xe"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-50 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#0072CE]" />
              <span>Tổng Quan &amp; Đánh Giá Chuyên Gia</span>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed text-justify">
              {config.seoIntroParagraph}
            </p>

            {/* Quick Commitments Bar */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Bảo hành chính hãng 5 năm</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-[#0072CE] flex-shrink-0" />
                <span>Hỗ trợ trả góp lãi suất ưu đãi</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Hotline: <strong className="text-slate-900">{contactHotline}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Danh Sách Lưới Xe Hoặc Empty State */}
        {filteredCars.length > 0 ? (
          <section aria-label={`Danh sách xe phân khúc ${config.name}`} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Các Mẫu Xe {config.name} Đang Bán ({filteredCars.length})
              </h2>

              <Link
                href="/xe"
                className="text-xs sm:text-sm font-semibold text-[#0072CE] hover:underline inline-flex items-center gap-1"
              >
                <span>Xem tất cả phân khúc</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid 3 cột responsive chuẩn Design System */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCars.map((car) => (
                <SmartCarCard key={car.id} car={car} />
              ))}
            </div>
          </section>
        ) : (
          /* Empty State khi chưa có mẫu xe nào công bố */
          <div className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#0072CE] mx-auto flex items-center justify-center">
              <Car className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Đang Cập Nhật Dòng Xe {config.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hiện tại showroom đang hoàn thiện danh mục sản phẩm phân khúc này. Quý khách vui lòng liên hệ hotline hoặc tham khảo các dòng xe đang sẵn có khác.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/xe"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white text-xs sm:text-sm font-bold transition-colors text-center"
              >
                Xem Toàn Bộ Bảng Giá Xe
              </Link>
              <a
                href={`tel:${contactHotline.replace(/[^0-9]/g, '')}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors text-center inline-flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gọi Hotline Tư Vấn</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
