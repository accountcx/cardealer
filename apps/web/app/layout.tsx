import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { getStorefrontSettings } from '../services/settings.service';
import { ViewportCoordinator } from '../components/layout/ViewportCoordinator';
import { Footer } from '../components/layout/Footer';
import { AutoDealerJsonLd, SalerJsonLd } from '../components/seo/AutoDealerJsonLd';

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
// Render ra HTML hoàn chỉnh có sẵn Header, Footer và các meta thẻ SEO (CLS = 0).
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStorefrontSettings();
  const site = settings.site;

  return (
    <html lang="vi" className="overflow-x-clip scroll-smooth">
      <head>
        {/* Google Tag Manager / GA4 Injection nếu có cấu hình */}
        {site.gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${site.gtmId}');
            `}
          </Script>
        )}
        {site.gaId && !site.gtmId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${site.gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-[#0072CE] selection:text-white overflow-x-clip flex flex-col justify-between`}
      >
        {/* GTM noscript fallback */}
        {site.gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${site.gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
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
      </body>
    </html>
  );
}
