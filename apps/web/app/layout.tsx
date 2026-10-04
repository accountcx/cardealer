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
// Render ra HTML hoàn chỉnh có sẵn Header, Footer, Analytics, Pixels và các meta thẻ SEO (CLS = 0).
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStorefrontSettings();
  const site = settings.site;

  return (
    <html lang="vi-VN" className="overflow-x-clip scroll-smooth">
      <head>
        {/* 1. Google Tag Manager */}
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

        {/* 2. Google Analytics 4 (khi không dùng GTM) */}
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

        {/* 3. Microsoft Clarity */}
        {site.clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${site.clarityId}");
            `}
          </Script>
        )}

        {/* 4. Facebook Pixel */}
        {site.fbPixelId && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${site.fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {/* 5. TikTok Pixel */}
        {site.tiktokPixelId && (
          <Script id="tiktok-pixel" strategy="afterInteractive">
            {`
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var tt=w[t]=w[t]||[];tt.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],tt.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<tt.methods.length;i++)tt.setAndDefer(tt,tt.methods[i]);tt.instance=function(t){for(var e=tt._i[t]||[],n=0;n<tt.methods.length;n++)tt.setAndDefer(e,tt.methods[n]);return e},tt.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";tt._i=tt._i||{},tt._i[e]=[],tt._i[e]._u=i,tt._t=tt._t||{},tt._t[e]=+new Date,tt._o=tt._o||{},tt._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                tt.load('${site.tiktokPixelId}');
                tt.page();
              }(window, document, 'ttq');
            `}
          </Script>
        )}

        {/* 6. Zalo Pixel */}
        {site.zaloPixelId && (
          <Script id="zalo-pixel" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s);j.async=true;j.src='https://sp.zalo.me/plugins/sdk.js?id='+i;
              f.parentNode.insertBefore(j,f);})(window,document,'script','zaloSdk','${site.zaloPixelId}');
            `}
          </Script>
        )}

        {/* 7. Custom Head Scripts / Meta Tags (Google Search Console, Domain Verifications) */}
        {site.customHeaderScripts && (
          <div
            id="custom-header-scripts"
            dangerouslySetInnerHTML={{ __html: site.customHeaderScripts }}
          />
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

        {/* Facebook Pixel noscript fallback */}
        {site.fbPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${site.fbPixelId}&ev=PageView&noscript=1`}
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
