import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { sanitizeTrackingId } from '@cardealer/types';
import './globals.css';
import { getStorefrontSettings } from '../services/settings.service';
import { ViewportCoordinator } from '../components/layout/ViewportCoordinator';
import { Footer } from '../components/layout/Footer';
import { AutoDealerJsonLd, SalerJsonLd } from '../components/seo/AutoDealerJsonLd';
import { DeferredAnalytics } from '../components/analytics/DeferredAnalytics';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

// 🧠 Mental Model: Sinh SEO Metadata động theo cấu hình SiteSettings được quản trị từ Admin CMS.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings();
  const site = settings.site;
  const baseUrl = (site.siteUrl || 'https://xehyundaivinh.com').replace(/\/$/, '');

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: site.siteTitle || 'Xe Hyundai Vinh | Bảng Giá & Ưu Đãi Lăn Bánh',
      template: site.titleSuffix ? `%s ${site.titleSuffix}` : '%s | Xe Hyundai Vinh',
    },
    description: site.defaultDescription,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: site.siteTitle || 'Xe Hyundai Vinh',
      description: site.defaultDescription,
      url: baseUrl,
      siteName: site.businessName || 'Xe Hyundai Vinh',
      locale: 'vi_VN',
      type: 'website',
      images: site.defaultImage ? [{ url: site.defaultImage, width: 1200, height: 630, alt: site.siteTitle }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.siteTitle,
      description: site.defaultDescription,
      images: site.defaultImage ? [site.defaultImage] : [],
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
    icons: {
      icon: site.favicon || '/favicon.ico',
    },
  };
}

// 🧠 Mental Model: Server Component (RootLayout) nạp toàn bộ cấu hình hệ thống bằng 1 request duy nhất (BulkSettings).
// Render ra HTML hoàn chỉnh có sẵn Header, Footer, Analytics, Pixels và các meta thẻ SEO (CLS = 0).
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStorefrontSettings();
  const site = settings.site;

  // Phòng thủ kép: Khử mọi khoảng trắng & ký tự lạ cho toàn bộ mã Tracking / Pixel
  const gtmId = sanitizeTrackingId(site.gtmId);
  const gaId = sanitizeTrackingId(site.gaId);
  const clarityId = sanitizeTrackingId(site.clarityId);
  const fbPixelId = sanitizeTrackingId(site.fbPixelId);
  const tiktokPixelId = sanitizeTrackingId(site.tiktokPixelId);
  const zaloPixelId = sanitizeTrackingId(site.zaloPixelId);

  return (
    <html lang="vi-VN" className="overflow-x-clip scroll-smooth">
      <head>
        {/* 1. Tối ưu Kết Nối Sớm (Preconnect & DNS-Prefetch) cho CDN ảnh LCP */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {gtmId && <link rel="dns-prefetch" href="https://www.googletagmanager.com" />}
        {clarityId && <link rel="dns-prefetch" href="https://scripts.clarity.ms" />}

        {/* 2. Khởi tạo dataLayer & gtag sớm để lưu trữ sự kiện trước khi script nạp */}
        <script
          id="gtm-datalayer-init"
          dangerouslySetInnerHTML={{
            __html: 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}',
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-[#0072CE] selection:text-white overflow-x-clip flex flex-col justify-between`}
      >
        {/* 3. Tối ưu Third-Party Scripts: Nạp theo tương tác hoặc Idle để giải phóng Main Thread (TBT = 0ms) */}
        <DeferredAnalytics
          gtmId={gtmId}
          gaId={gaId}
          clarityId={clarityId}
          fbPixelId={fbPixelId}
          tiktokPixelId={tiktokPixelId}
          zaloPixelId={zaloPixelId}
        />
        {/* 7. Custom Head / Verification Scripts (Đặt ngoài <head> để không vi phạm HTML5 spec với thẻ <div>) */}
        {site.customHeaderScripts && (
          <div
            id="custom-header-scripts"
            dangerouslySetInnerHTML={{ __html: site.customHeaderScripts }}
          />
        )}

        {/* GTM noscript fallback */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Facebook Pixel noscript fallback */}
        {fbPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}

        <ViewportCoordinator settings={settings}>
          {children}
        </ViewportCoordinator>

        <Footer contact={settings.contact} footer={settings.footer} />

        {/* Local Business JSON-LD Schema */}
        <AutoDealerJsonLd contact={settings.contact} site={settings.site} />

        {/* Sales Consultant Person JSON-LD Schema */}
        <SalerJsonLd contact={settings.contact} site={settings.site} floatingSeller={settings.floatingSeller} />

        {/* 8. Custom Body / Footer Scripts (LiveChat, Messenger / Zalo Chat widgets) */}
        {site.customBodyScripts && (
          <div
            id="custom-body-scripts"
            dangerouslySetInnerHTML={{ __html: site.customBodyScripts }}
          />
        )}
      </body>
    </html>
  );
}
