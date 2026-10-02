import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pagesService } from '../../../services/pages.service';
import { settingsService } from '../../../services/settings.service';
import { StaticPageJsonLd } from '../../../components/pages/StaticPageJsonLd';
import { DefaultTemplate } from '../../../components/pages/templates/DefaultTemplate';
import { ProfileShowroomTemplate } from '../../../components/pages/templates/ProfileShowroomTemplate';
import { TimelineTemplate } from '../../../components/pages/templates/TimelineTemplate';
import { FinanceTemplate } from '../../../components/pages/templates/FinanceTemplate';
import { ContactTemplate } from '../../../components/pages/templates/ContactTemplate';
import { FaqTemplate } from '../../../components/pages/templates/FaqTemplate';
import type { AutoDealerInfo } from '@cardealer/core';
import { clientEnv } from '@cardealer/env';

interface StaticPageCatchAllProps {
  params: Promise<{
    slug: string;
  }>;
}

// WHY: Sinh Dynamic Technical SEO Metadata tự động cho Googlebot (SSR Metadata Injection).
// Tôn trọng triệt để thuộc tính noIndex, canonicalUrl và OpenGraph image từ CMS.
export async function generateMetadata({ params }: StaticPageCatchAllProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    pagesService.getPageBySlug(slug),
    settingsService.getStorefrontSettings(),
  ]);

  const brandName = settings.site?.businessName || 'Hyundai Vinh';

  if (!page || page.isPublished === false) {
    return {
      title: `Không tìm thấy trang | ${brandName}`,
      robots: { index: false, follow: false },
    };
  }

  const title = page.metaTitle || `${page.title} | ${brandName}`;
  const description = page.metaDescription || undefined;
  const images = page.ogImage ? [{ url: page.ogImage }] : [];

  return {
    title,
    description,
    alternates: page.canonicalUrl ? { canonical: page.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: page.ogImage ? [page.ogImage] : [],
    },
    robots: page.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

// WHY: Dynamic Template Resolver cho Catch-All Route [slug] (Option 3.B Template Registry).
// Nạp song song dữ liệu trang tĩnh và cấu hình Showroom tập trung (0-waterfall SSR).
// Tự động phân giải và truyền dữ liệu thật vào 6 giao diện chuẩn SEO kèm Schema.org JSON-LD.
export default async function StaticPageCatchAll({ params }: StaticPageCatchAllProps) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    pagesService.getPageBySlug(slug),
    settingsService.getStorefrontSettings(),
  ]);

  // WHY: Fail-Closed Protection (R14). Nếu trang chưa xuất bản hoặc không tồn tại, trả về 404 ngay lập tức.
  if (!page || page.isPublished === false) {
    notFound();
  }

  // Chuẩn hóa thực thể AutoDealer từ Settings tập trung
  const dealerInfo: AutoDealerInfo = {
    name: settings.contact?.showroomName || settings.site?.businessName,
    legalName: settings.contact?.legal?.businessName,
    url: settings.site?.siteUrl || clientEnv.NEXT_PUBLIC_SITE_URL,
    telephone: settings.contact?.hotlineKinhDoanh || settings.site?.phone,
    address: {
      streetAddress: settings.contact?.diaChi || settings.site?.address,
      addressLocality: settings.contact?.tinhThanh || 'Nghệ An',
    },
  };

  // Render Template tương ứng với templateType
  const renderTemplate = () => {
    switch (page.templateType) {
      case 'PROFILE_SHOWROOM':
        return <ProfileShowroomTemplate page={page} />;
      case 'TIMELINE':
        return <TimelineTemplate page={page} />;
      case 'FINANCE':
        return <FinanceTemplate page={page} />;
      case 'CONTACT':
        return <ContactTemplate page={page} dealerInfo={dealerInfo} />;
      case 'FAQ':
        return <FaqTemplate page={page} dealerInfo={dealerInfo} />;
      case 'DEFAULT':
      default:
        return <DefaultTemplate page={page} />;
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Schema.org Structured Data */}
      <StaticPageJsonLd page={page} dealerInfo={dealerInfo} />

      {/* Dynamic Template Content */}
      {renderTemplate()}
    </main>
  );
}
