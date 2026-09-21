# 🌐 Frontend Integration & Modern UI Specification: Khung Nền Tảng Storefront & Tiện Ích Chuyển Đổi Toàn Cục

## 1. Cấu Trúc Cây Component Monorepo (Component Hierarchy)

```text
packages/ui/src/components/
├── button.tsx                     # Shared Primitives Button
├── card.tsx                       # Shared Card Container
├── dialog.tsx                     # Shared Modal Dialog
└── skeleton.tsx                   # Shared Skeleton Loader

apps/web/components/
├── layout/
│   ├── TopBar.tsx                 # [Client/Server] Thanh thông tin địa chỉ & Hotline trên cùng
│   ├── Navbar.tsx                 # [Client] Header dính (Sticky), Mega Menu dòng xe, Hotline CTA
│   ├── MobileDrawer.tsx           # [Client] Menu trượt Mobile, Accordion đa cấp, 2 nút liên hệ đáy
│   ├── Footer.tsx                 # [Server/Client] Chân trang Đại lý 3S, bản đồ, pháp lý, icon BCT
│   ├── FloatingSeller.tsx         # [Client] Widget chuyên viên nổi (Pulse, Popup Card 1-click)
│   ├── ProductStickyBar.tsx       # [Client] Thanh chốt đơn chân trang (Scroll detector)
│   └── ViewportCoordinator.tsx   # [Client] Context điều phối vị trí FloatingSeller và StickyBar
└── seo/
    └── AutoDealerJsonLd.tsx       # [Server] Script JSON-LD Schema Google Local Business

apps/admin/app/settings/
├── components/
│   ├── SettingsTabNav.tsx         # Thanh chuyển 4 Tabs trực quan
│   ├── ShowroomSection.tsx        # Tab 1: Cấu hình Showroom, Hotline & Pháp lý
│   ├── NavigationSection.tsx      # Tab 2: Trình dựng Menu đa cấp (Navigation Builder)
│   ├── FloatingSellerSection.tsx  # Tab 3: Chuyên viên tư vấn nổi
│   └── StickyBarSection.tsx       # Tab 4: Thanh chốt đơn đáy trang
└── page.tsx                       # Trang quản trị tổng hợp với React Hook Form
```

---

## 2. Quy Chuẩn Đặt Tên & Xuất Bản (Strict File Naming & 100% Named Export)

* **100% Named Export Only:** Toàn bộ components, hooks, helpers đều sử dụng cú pháp Named Export (`export const Navbar = ...`), **tuyệt đối không sử dụng `export default`** (trừ tệp `page.tsx` và `layout.tsx` theo quy định bắt buộc của Next.js App Router).
* **Thư viện Icon chuẩn:** Sử dụng duy nhất `lucide-react` cho toàn bộ dự án (`PhoneCall`, `MessageSquare`, `MapPin`, `Clock`, `Menu`, `X`, `ChevronDown`, `ShieldCheck`, `CheckCircle2`).
* **Bảo vệ tiền đình (WCAG AAA):** Mọi transition và animation bắt buộc có `motion-reduce:transition-none motion-reduce:transform-none`.

---

## 3. Đặc Tả Props Contracts & Code Mẫu Thành Phần Chính

### 3.1. `Navbar.tsx` (Showroom Header & Mega Menu)
```tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PhoneCall, Menu, ChevronDown, FileText } from 'lucide-react';
import type { NavLink } from '@cardealer/types';

export interface NavbarProps {
  headerLinks: NavLink[];
  hotline: string;
  showroomName: string;
  onOpenLeadModal?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar = ({
  headerLinks,
  hotline,
  showroomName,
  onOpenLeadModal,
  onOpenMobileMenu,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out motion-reduce:transition-none ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80 py-2.5'
          : 'bg-white border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo Đại Lý */}
        <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none">
          <div className="h-10 w-auto flex items-center font-bold text-xl tracking-tight text-[#002C6C]">
            HYUNDAI <span className="text-[#0072CE] ml-1 font-extrabold">VINH</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {headerLinks.map((link) => (
            <div key={link.id} className="relative group">
              <Link
                href={link.url}
                target={link.newTab ? '_blank' : undefined}
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-[#002C6C] rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none"
              >
                {link.label}
                {link.subLinks && link.subLinks.length > 0 && (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200 motion-reduce:transition-none" />
                )}
              </Link>

              {/* Mega Dropdown Submenu */}
              {link.subLinks && link.subLinks.length > 0 && (
                <div className="absolute top-full left-0 hidden group-hover:block pt-2 w-64">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 space-y-1">
                    {link.subLinks.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.url}
                        className="block px-3 py-2 text-sm text-slate-600 hover:text-[#002C6C] hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Action Buttons: Hotline & CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`tel:${hotline.replace(/[^0-9]/g, '')}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#002C6C] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <PhoneCall className="w-4 h-4 text-[#0072CE] animate-pulse motion-reduce:animate-none" />
            <span>{hotline}</span>
          </a>

          <button
            type="button"
            onClick={onOpenLeadModal}
            className="h-10 px-5 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Nhận Báo Giá</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
```

---

### 3.2. `FloatingSeller.tsx` (Widget Chuyên Viên Nổi & Điều Phối Đáy)
```tsx
import React, { useState } from 'react';
import Image from 'next/image';
import { PhoneCall, MessageCircle, X, ShieldCheck } from 'lucide-react';
import type { FloatingSellerSettings } from '@cardealer/types';

export interface FloatingSellerProps {
  settings: FloatingSellerSettings;
  isStickyBarVisible?: boolean; // Được cấp bởi ViewportCoordinator
}

export const FloatingSeller = ({ settings, isStickyBarVisible = false }: FloatingSellerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!settings.enabled) return null;

  return (
    <aside
      aria-label="Tư vấn viên trực tuyến"
      className={`fixed right-4 z-40 transition-all duration-300 ease-in-out motion-reduce:transition-none ${
        isStickyBarVisible ? 'bottom-20 sm:bottom-24' : 'bottom-4 sm:bottom-6'
      }`}
    >
      {/* Expanded Card View */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200 motion-reduce:animate-none">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#0072CE]">
                <Image
                  src={settings.sellerAvatar}
                  alt={settings.sellerName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {settings.sellerName}
                  <ShieldCheck className="w-4 h-4 text-[#0072CE]" />
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping motion-reduce:animate-none" />
                  <span>{settings.statusText}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              aria-label="Đóng bảng tư vấn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {settings.greetingMessage}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${settings.sellerPhone.replace(/[^0-9]/g, '')}`}
              className="h-10 flex items-center justify-center gap-1.5 bg-[#002C6C] hover:bg-[#001D48] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Gọi Ngay</span>
            </a>
            <a
              href={settings.sellerZalo}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 flex items-center justify-center gap-1.5 bg-[#0068FF] hover:bg-[#0052CC] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Zalo</span>
            </a>
          </div>
        </div>
      )}

      {/* Collapsed Bubble Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 p-1.5 bg-white hover:bg-slate-50 border-2 border-[#0072CE] rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none"
        aria-label="Mở chat tư vấn viên"
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={settings.sellerAvatar}
            alt={settings.sellerName}
            fill
            className="object-cover"
          />
        </div>
        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse motion-reduce:animate-none" />
        <span className="hidden sm:inline-block pr-3 text-xs font-bold text-slate-800">
          Tư vấn 24/7
        </span>
      </button>
    </aside>
  );
};
```

---

### 3.3. `ProductStickyBar.tsx` (Thanh Chốt Đơn Cố Định Đáy Trang)
```tsx
import React, { useState, useEffect } from 'react';
import { PhoneCall, Sparkles } from 'lucide-react';
import type { StickyBarSettings } from '@cardealer/types';

export interface ProductStickyBarProps {
  settings: StickyBarSettings;
  carTitle?: string;
  priceText?: string;
  onOpenLeadModal?: () => void;
  onVisibilityChange?: (visible: boolean) => void;
}

export const ProductStickyBar = ({
  settings,
  carTitle = 'Nhận Ưu Đãi & Báo Giá Xe Hyundai',
  priceText = 'Hỗ trợ trả góp 85% • Giao xe tận nhà',
  onOpenLeadModal,
  onVisibilityChange,
}: ProductStickyBarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!settings.enabled) return;
    const handleScroll = () => {
      const show = window.scrollY > 300;
      setIsVisible(show);
      onVisibilityChange?.(show);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [settings.enabled, onVisibilityChange]);

  if (!settings.enabled || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-2xl py-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300 motion-reduce:animate-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Tên xe & Tóm tắt giá / Thông điệp */}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-900 text-sm sm:text-base truncate flex items-center gap-1.5">
            <span>{carTitle}</span>
            <Sparkles className="w-4 h-4 text-amber-500 hidden sm:inline" />
          </div>
          <div className="text-xs sm:text-sm text-slate-500 truncate">{priceText}</div>
        </div>

        {/* Nút Gọi & Nút Nhận Báo Giá */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <a
            href={`tel:${settings.hotline.replace(/[^0-9]/g, '')}`}
            className="h-11 px-4 rounded-xl border border-slate-200 text-[#002C6C] font-semibold text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-[#0072CE]" />
            <span className="hidden md:inline">{settings.hotline}</span>
            <span className="md:hidden">{settings.callText}</span>
          </a>

          <button
            type="button"
            onClick={onOpenLeadModal}
            className="h-11 px-5 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
          >
            {settings.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 4. Tích Hợp Schema JSON-LD Chuẩn SEO (`AutoDealerJsonLd.tsx`)
```tsx
import type { ContactSettings, SiteSettings } from '@cardealer/types';

export const AutoDealerJsonLd = ({
  contact,
  site,
}: {
  contact: ContactSettings;
  site: SiteSettings;
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: contact.showroomName,
    image: site.defaultImage,
    telephone: contact.hotlineKinhDoanh,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.diaChi,
      addressLocality: 'Vinh',
      addressRegion: 'Nghệ An',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.mapLatitude,
      longitude: site.mapLongitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '18:00',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
```
