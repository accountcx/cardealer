import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getStorefrontSettings } from '../services/settings.service';
import { ViewportCoordinator } from '../components/layout/ViewportCoordinator';
import { Footer } from '../components/layout/Footer';
import { AutoDealerJsonLd } from '../components/seo/AutoDealerJsonLd';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

// 🧠 Mental Model: Sinh SEO Metadata động theo cấu hình SiteSettings được quản trị từ Admin CMS.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings();
  const site = settings.site;

  return {
    title: {
      default: site.siteTitle || 'Xe Hyundai Vinh | Bảng Giá & Ưu Đãi Lăn Bánh',
      template: site.titleSuffix ? `%s ${site.titleSuffix}` : '%s | Xe Hyundai Vinh',
    },
    description: site.defaultDescription,
    openGraph: {
      title: site.siteTitle,
      description: site.defaultDescription,
      type: 'website',
      images: site.defaultImage ? [{ url: site.defaultImage }] : [],
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

  return (
    <html lang="vi" className="overflow-x-hidden scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-[#0072CE] selection:text-white overflow-x-hidden flex flex-col justify-between`}
      >
        <ViewportCoordinator settings={settings}>
          {children}
        </ViewportCoordinator>

        <Footer contact={settings.contact} footer={settings.footer} />

        {/* Local Business JSON-LD Schema */}
        <AutoDealerJsonLd contact={settings.contact} site={settings.site} />
      </body>
    </html>
  );
}
