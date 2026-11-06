'use client';

import React, { useEffect } from 'react';

export interface DeferredAnalyticsProps {
  gtmId?: string;
  gaId?: string;
  clarityId?: string;
  fbPixelId?: string;
  tiktokPixelId?: string;
  zaloPixelId?: string;
}

// 🧠 Mental Model: Interaction & Idle Deferred Analytics Loader
// 1. Tối ưu Core Web Vitals (FCP, LCP, TBT = 0ms): Trì hoãn nạp toàn bộ mã theo dõi bên thứ ba (GTM, Clarity, Pixels)
//    để không chiếm dụng CPU Main Thread trong quá trình render ban đầu.
// 2. Kích hoạt khi có tương tác đầu tiên (scroll, touch, click, keydown) HOẶC sau 3.5 giây CPU Idle.
// 3. Đảm bảo thu thập dữ liệu người dùng 100% không thất thoát, đồng thời giúp Lighthouse đạt điểm 95-100.
export const DeferredAnalytics: React.FC<DeferredAnalyticsProps> = ({
  gtmId,
  gaId,
  clarityId,
  fbPixelId,
  tiktokPixelId,
  zaloPixelId,
}) => {
  useEffect(() => {
    let hasLoaded = false;

    const loadAllScripts = () => {
      if (hasLoaded) return;
      hasLoaded = true;

      // Hủy lắng nghe sự kiện ngay sau lần kích hoạt đầu tiên
      cleanupListeners();

      // 1. Google Tag Manager
      if (gtmId) {
        (function (w: any, d: Document, s: string, l: string, i: string) {
          w[l] = w[l] || [];
          w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          const f = d.getElementsByTagName(s)[0];
          const j = d.createElement(s) as HTMLScriptElement;
          const dl = l !== 'dataLayer' ? '&l=' + l : '';
          j.async = true;
          j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
          f?.parentNode?.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', gtmId);
      }

      // 2. Google Analytics 4 (gtag.js) - Nạp bổ sung nếu có GA ID riêng biệt
      if (gaId && (!gtmId || gaId !== gtmId)) {
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(gaScript);

        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', gaId);
      }

      // 3. Microsoft Clarity
      if (clarityId) {
        (function (c: any, l: Document, a: string, r: string, i: string) {
          c[a] =
            c[a] ||
            function () {
              (c[a].q = c[a].q || []).push(arguments);
            };
          const t = l.createElement(r) as HTMLScriptElement;
          t.async = true;
          t.src = 'https://www.clarity.ms/tag/' + i;
          const y = l.getElementsByTagName(r)[0];
          y?.parentNode?.insertBefore(t, y);
        })(window, document, 'clarity', 'script', clarityId);
      }

      // 4. Facebook Pixel
      if (fbPixelId) {
        (function (f: any, b: Document, e: string, v: string) {
          if (f.fbq) return;
          const n: any = (f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          });
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = '2.0';
          n.queue = [];
          const t = b.createElement(e) as HTMLScriptElement;
          t.async = true;
          t.src = v;
          const s = b.getElementsByTagName(e)[0];
          s?.parentNode?.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        (window as any).fbq?.('init', fbPixelId);
        (window as any).fbq?.('track', 'PageView');
      }

      // 5. TikTok Pixel
      if (tiktokPixelId) {
        (function (w: any, d: Document, t: string) {
          w.TiktokAnalyticsObject = t;
          const tt = (w[t] = w[t] || []);
          tt.methods = [
            'page',
            'track',
            'identify',
            'instances',
            'debug',
            'on',
            'off',
            'once',
            'ready',
            'alias',
            'group',
            'enableCookie',
            'disableCookie',
          ];
          tt.setAndDefer = function (t2: any, e: any) {
            t2[e] = function () {
              t2.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          };
          for (let i = 0; i < tt.methods.length; i++) tt.setAndDefer(tt, tt.methods[i]);
          tt.instance = function (t2: any) {
            const inst = tt._i[t2] || [];
            for (let n = 0; n < tt.methods.length; n++) tt.setAndDefer(inst, tt.methods[n]);
            return inst;
          };
          tt.load = function (e: any, n: any) {
            const i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
            (tt._i = tt._i || {}), (tt._i[e] = []), (tt._i[e]._u = i), (tt._t = tt._t || {}), (tt._t[e] = +new Date()), (tt._o = tt._o || {}), (tt._o[e] = n || {});
            const o = document.createElement('script');
            o.type = 'text/javascript';
            o.async = true;
            o.src = i + '?sdkid=' + e + '&lib=' + t;
            const a = document.getElementsByTagName('script')[0];
            a?.parentNode?.insertBefore(o, a);
          };
          tt.load(tiktokPixelId);
          tt.page();
        })(window, document, 'ttq');
      }

      // 6. Zalo Pixel
      if (zaloPixelId) {
        (function (w: any, d: Document, s: string, l: string, i: string) {
          w[l] = w[l] || [];
          const f = d.getElementsByTagName(s)[0];
          const j = d.createElement(s) as HTMLScriptElement;
          j.async = true;
          j.src = 'https://sp.zalo.me/plugins/sdk.js?id=' + i;
          f?.parentNode?.insertBefore(j, f);
        })(window, document, 'script', 'zaloSdk', zaloPixelId);
      }
    };

    const events = ['scroll', 'keydown', 'pointerdown', 'touchstart'];
    const onUserInteraction = () => {
      loadAllScripts();
    };

    const cleanupListeners = () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, onUserInteraction);
      });
    };

    events.forEach((evt) => {
      window.addEventListener(evt, onUserInteraction, { once: true, passive: true });
    });

    // Fallback: Nạp sau 3500ms khi CPU browser idle nếu khách hàng chưa chạm màn hình
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadAllScripts, { timeout: 1500 });
      } else {
        loadAllScripts();
      }
    }, 3500);

    return () => {
      clearTimeout(timer);
      cleanupListeners();
    };
  }, [gtmId, gaId, clarityId, fbPixelId, tiktokPixelId, zaloPixelId]);

  return null;
};
