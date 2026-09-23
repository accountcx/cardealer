import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCarBySlug } from '@/services/cars.service';
import { getStorefrontSettings } from '@/services/settings.service';
import { generateCarJsonLd } from '@cardealer/core';
import { getSiteUrl } from '@cardealer/env';
import { BulkSettingsSchema } from '@cardealer/types';
import { CarDetailView, type ConsultantInfo } from './components/CarDetailView';
import { CarDetailSkeleton } from './components/CarDetailSkeleton';
import { CarDetailErrorState } from './components/CarDetailErrorState';

export const revalidate = 60; // Next.js Incremental Static Regeneration: 60s

interface PageProps {
  params: Promise<{ carSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 🧠 Mental Model: Dynamic SEO Metadata Generator cho trang chi tiết dòng xe (/xe/[carSlug]).
// Cố định Canonical URL tuyệt đối tại `/xe/[slug]` (bỏ toàn bộ query params)
// nhằm bảo toàn 100% PageRank và triệt tiêu rủi ro Duplicate Content theo chuẩn Google Webmaster Guidelines.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { carSlug } = await params;

  try {
    const car = await getCarBySlug(carSlug);

    if (!car || car.status !== 'published') {
      return {
        title: 'Không tìm thấy dòng xe | Hyundai',
        description: 'Dòng xe hiện chưa được phát hành hoặc đã ngừng kinh doanh.',
      };
    }

    const title = `Bảng Giá Xe ${car.tenXe} 2026 Lăn Bánh & Ưu Đãi Mới Nhất`;
    const description =
      car.promotionSummary ||
      car.moTaChung ||
      `Đánh giá chi tiết xe ${car.tenXe}, bảng giá niêm yết, dự toán lăn bánh, thông số kỹ thuật và ưu đãi trả góp tốt nhất từ chuyên viên tư vấn bán hàng chính hãng.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/xe/${car.slug}`, // Cố định Canonical URL không dính query params
      },
      openGraph: {
        title,
        description,
        url: `/xe/${car.slug}`,
        type: 'website',
        images: [
          {
            url: car.anhDaiDienUrl,
            width: 1200,
            height: 630,
            alt: car.tenXe,
          },
        ],
      },
    };
  } catch (error) {
    console.error('[CarDetailPage generateMetadata] Lỗi:', error);
    return {
      title: 'Chi Tiết Dòng Xe Hyundai Chính Hãng 2026',
      description: 'Khám phá thông số kỹ thuật và ưu đãi dòng xe Hyundai mới nhất.',
    };
  }
}

// 🧠 Mental Model: Next.js App Router Server Component (RSC) cho trang Chi Tiết Dòng Xe.
// 1. Nạp chi tiết xe theo slug qua carsService.getCarBySlug (ISR 60s, tag car-detail-[slug]).
// 2. Kiểm tra nếu xe không tồn tại hoặc draft -> Chuyển sang CarDetailErrorState thân thiện kèm hotline.
// 3. Nạp cấu hình Showroom & Thông tin Saler tư vấn từ settingsService.
// 4. Sinh và nhúng dữ liệu có cấu trúc Google Schema đa tầng (@graph: Product, Car, Person Consultant, BreadcrumbList).
// 5. Bọc Suspense với CarDetailSkeleton đảm bảo CLS = 0 khi truyền dữ liệu sang Client Island CarDetailView.
export default async function CarDetailPage({ params, searchParams }: PageProps) {
  const { carSlug } = await params;
  const resolvedSearchParams = await searchParams;

  const versionParam =
    typeof resolvedSearchParams['phien-ban'] === 'string'
      ? resolvedSearchParams['phien-ban']
      : null;
  const colorParam =
    typeof resolvedSearchParams['mau'] === 'string'
      ? resolvedSearchParams['mau']
      : null;

  let car = null;
  let settings = null;

  try {
    const [fetchedCar, fetchedSettings] = await Promise.all([
      getCarBySlug(carSlug),
      getStorefrontSettings(),
    ]);
    car = fetchedCar;
    settings = fetchedSettings;
  } catch (err) {
    console.error(`[CarDetailPage] Lỗi nạp dữ liệu xe slug "${carSlug}":`, err);
  }

  // Đảm bảo settings luôn có đầy đủ cấu hình theo schema chuẩn
  const safeSettings = settings || BulkSettingsSchema.parse({});

  // 404 Guard: Nếu không tìm thấy xe hoặc xe chưa xuất bản
  if (!car || car.status !== 'published') {
    const hotline =
      safeSettings.stickyBar.hotline ||
      safeSettings.floatingSeller.sellerPhone ||
      safeSettings.contact.hotlineKinhDoanh;
    return <CarDetailErrorState slug={carSlug} hotline={hotline} />;
  }

  const siteUrl =
    safeSettings.site.siteUrl ||
    (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'https://xehyundaivinh.com');

  // 🧠 Mental Model: Lấy trực tiếp thông tin Chuyên Viên Tư Vấn từ cấu hình "Chuyên Viên Nổi" (floatingSeller)
  // được quản trị tại Admin (/settings). Không đoán mò hoặc fallback chuỗi tĩnh tùy tiện.
  const consultant: ConsultantInfo = {
    name: safeSettings.floatingSeller.sellerName,
    phone: safeSettings.floatingSeller.sellerPhone,
    hotline: safeSettings.stickyBar.hotline || safeSettings.floatingSeller.sellerPhone,
    zaloUrl: safeSettings.floatingSeller.sellerZalo,
    avatar: safeSettings.floatingSeller.sellerAvatar,
    statusText: safeSettings.floatingSeller.statusText,
    showroomName: safeSettings.contact.showroomName || safeSettings.site.businessName,
    showroomAddress:
      safeSettings.contact.sellerAddress ||
      safeSettings.contact.diaChi ||
      safeSettings.site.address,
  };

  // Sinh dữ liệu cấu trúc Schema JSON-LD đa tầng
  const schemaJsonLd = generateCarJsonLd(car, siteUrl, {
    consultant: {
      name: consultant.name,
      phone: consultant.phone,
      showroomName: consultant.showroomName,
      showroomAddress: consultant.showroomAddress,
    },
  });

  return (
    <>
      {/* 📊 Schema JSON-LD Đa Tầng cho Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      {/* 🚗 Trải Nghiệm Tương Tác Chi Tiết Xe */}
      <Suspense fallback={<CarDetailSkeleton />}>
        <CarDetailView
          car={car}
          initialVersionSlug={versionParam}
          initialColorSlug={colorParam}
          consultant={consultant}
        />
      </Suspense>

      {/* 🛡️ Disclaimer Minh Bạch Về Website Cá Nhân Của Saler */}
      <footer className="border-t border-slate-200/80 bg-slate-100/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Trang thông tin & tư vấn bán hàng chính hãng
            {consultant.name ? ` của Chuyên viên tư vấn ${consultant.name}` : ''}
            {consultant.showroomName ? ` (${consultant.showroomName})` : ''}
          </p>
          <p className="text-[11px] text-slate-400">
            Thông số kỹ thuật, hình ảnh và giá niêm yết được cập nhật theo tiêu chuẩn mới nhất.
            Giá bán thực tế và chương trình ưu đãi tiền mặt có thể thay đổi tùy thời điểm.
          </p>
        </div>
      </footer>
    </>
  );
}
