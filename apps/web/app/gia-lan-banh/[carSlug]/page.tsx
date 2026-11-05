import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteUrl } from '@cardealer/env';
import { sanitizeJsonLd } from '@cardealer/core';
import CalculatorMasterView from '@/components/calculator/CalculatorMasterView';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getCarsList, getCarBySlug } from '@/services/cars.service';
import { getStorefrontSettings } from '@/services/settings.service';

export const revalidate = 60; // Next.js ISR: 60s

interface ProgrammaticGiaLanBanhPageProps {
  params: Promise<{ carSlug: string }>;
  searchParams?: Promise<{
    segment?: string;
    budget?: string;
    tab?: string;
  }>;
}

// 🧠 Mental Model: Dynamic SEO Metadata Generator cho Landing Page Dự toán lăn bánh theo mẫu xe (/gia-lan-banh/[carSlug]).
// Tối ưu chùm từ khóa có Search Intent và Conversion Rate cao nhất ngành ô tô.
export async function generateMetadata({
  params,
}: ProgrammaticGiaLanBanhPageProps): Promise<Metadata> {
  const { carSlug } = await params;

  try {
    const car = await getCarBySlug(carSlug);

    if (!car || car.status !== 'published') {
      return {
        title: '404 - Không tìm thấy dòng xe | Hyundai Vinh',
        description: 'Dòng xe hiện chưa được phát hành hoặc đã ngừng kinh doanh.',
        robots: { index: false, follow: false },
      };
    }

    const title = `Bảng Giá Lăn Bánh Xe ${car.tenXe} 2026 Mới Nhất | Xe Hyundai Vinh`;
    const description = `Dự toán chi phí lăn bánh trọn gói xe ${car.tenXe} 2026 tại Nghệ An & Hà Tĩnh: Giá niêm yết, lệ phí trước bạ, phí biển số, bảo hiểm và ưu đãi trả góp tốt nhất.`;
    const canonicalUrl = `/gia-lan-banh/${car.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
        images: car.anhDaiDienUrl
          ? [
              {
                url: car.anhDaiDienUrl,
                width: 1200,
                height: 630,
                alt: `Giá lăn bánh xe ${car.tenXe}`,
              },
            ]
          : [],
      },
    };
  } catch (error) {
    console.error('[Programmatic GiaLanBanh] Lỗi generateMetadata:', error);
    return {
      title: 'Bảng Tính Giá Lăn Bánh Xe Hyundai Chính Hãng 2026',
      description: 'Dự toán chi phí lăn bánh xe Hyundai chi tiết tại Nghệ An & Hà Tĩnh.',
    };
  }
}

// 🧠 Mental Model: Server Component (RSC) cho Dynamic Route /gia-lan-banh/[carSlug].
// 1. Kiểm tra tính hợp lệ của mẫu xe (Fail-Closed: 404 khi xe không tồn tại).
// 2. Nhúng đa tầng Schema JSON-LD: WebApplication, Product, AggregateOffer và BreadcrumbList.
// 3. Hydrate sẵn initialCarSlug cho Client Island CalculatorMasterView.
export default async function ProgrammaticGiaLanBanhPage(
  props: ProgrammaticGiaLanBanhPageProps
) {
  const { carSlug } = await props.params;

  const [car, cars, settings] = await Promise.all([
    getCarBySlug(carSlug),
    getCarsList(),
    getStorefrontSettings(),
  ]);

  if (!car || car.status !== 'published') {
    notFound();
  }

  const hotline = settings.contact.hotlineKinhDoanh || '0981.234.567';
  const zaloUrl = settings.contact.sellerZalo || 'https://zalo.me/0981234567';
  const siteUrl = getSiteUrl();

  const lowestPrice = car.versions?.[0]?.giaNiemYet || 500000000;

  // JSON-LD Schema đa tầng chuẩn Schema.org
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/gia-lan-banh/${car.slug}#app`,
        url: `${siteUrl}/gia-lan-banh/${car.slug}`,
        name: `Bảng Tính Giá Lăn Bánh Xe Hyundai ${car.tenXe} 2026`,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
      },
      {
        '@type': 'Product',
        '@id': `${siteUrl}/gia-lan-banh/${car.slug}#product`,
        name: `Hyundai ${car.tenXe} 2026`,
        image: car.anhDaiDienUrl ? `${siteUrl}${car.anhDaiDienUrl}` : undefined,
        description: `Dự toán chi phí lăn bánh trọn gói xe Hyundai ${car.tenXe} 2026 tại Nghệ An & Hà Tĩnh.`,
        brand: {
          '@type': 'Brand',
          name: 'Hyundai',
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'VND',
          lowPrice: String(lowestPrice),
          offerCount: car.versions?.length || 1,
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'AutoDealer',
            name: settings.site.businessName || 'Xe Hyundai Vinh',
            url: siteUrl,
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Dự toán giá lăn bánh',
            item: `${siteUrl}/gia-lan-banh`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `Hyundai ${car.tenXe}`,
            item: `${siteUrl}/gia-lan-banh/${car.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full pb-20">
      {/* Script SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLdSchema) }}
      />

      {/* Hero Section Banner */}
      <section className="bg-gradient-to-b from-[#002C6C] to-[#041a3d] text-white py-2.5 sm:pt-8 sm:pb-10 px-3.5 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-left">
          <div className="hidden sm:block">
            <Breadcrumbs
              items={[
                { label: 'Trang chủ', href: '/' },
                { label: 'Dự toán lăn bánh', href: '/gia-lan-banh' },
                { label: car.tenXe },
              ]}
            />
          </div>

          <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Dự Toán Giá Lăn Bánh Xe Hyundai {car.tenXe}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 max-w-2xl leading-relaxed">
              Chi tiết các khoản thuế trước bạ, phí cấp biển số và dự toán tiền lãi trả góp hàng tháng cho tất cả phiên bản {car.tenXe} tại Nghệ An &amp; Hà Tĩnh.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Master View Island */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 -mt-2 sm:-mt-4 relative z-20">
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-100 rounded-3xl" />}>
          <CalculatorMasterView
            cars={cars}
            initialCarSlug={car.slug}
            initialSegment={car.segment}
            defaultHotline={hotline}
            defaultZaloUrl={zaloUrl}
          />
        </Suspense>
      </div>
    </div>
  );
}
