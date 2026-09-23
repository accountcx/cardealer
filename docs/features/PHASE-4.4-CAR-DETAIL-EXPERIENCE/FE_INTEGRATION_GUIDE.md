# 🌐 Frontend Integration & Modern UI Specification: Trang Chi Tiết Dòng Xe (`/xe/[carSlug]`)

> **Mã Epic:** `EPIC-PHASE-4.4-CAR-DETAIL-EXPERIENCE`  
> **Giai đoạn:** Giai đoạn 2 — Bước 2.2: Thiết Kế Chi Tiết (Detailed Design Specification)  
> **Role phụ trách:** `tailwind-ui-designer`  
> **Tiêu chuẩn UI:** Production-Grade Accessibility (WCAG AAA Reduced Motion), Unified Icons (`lucide-react`), 100% Named Export, Tailwind Spacing Scale, Complete 4-State UI Parity  
> **Định vị dự án:** Website Bán Hàng Cá Nhân Của Chuyên Viên Tư Vấn Ô Tô (Automotive Sales Consultant)

---

## 1. Cấu Trúc Cây Component Monorepo (Component Hierarchy)

Áp dụng cho kiến trúc Turborepo Monorepo của dự án (`apps/web` và `packages/ui`):

```text
apps/web/app/xe/[carSlug]/
├── page.tsx                                  # Next.js Server Component (RSC, Metadata, Schema JSON-LD)
├── components/
│   ├── CarDetailView.tsx                     # Root Client Component điều phối State & Sub-components
│   ├── CarHeroExperience.tsx                 # Luxury Studio Stage, LCP image, Ambient glow, Fade transition
│   ├── ColorSwatches.tsx                     # Bảng chọn chấm màu xúc giác (Two-tone, Metallic sheen, Tooltips)
│   ├── VersionSelector.tsx                   # Segmented Cards chọn phiên bản kèm giá & trả trước
│   ├── SalerQuickShareBar.tsx                # Nút 1 chạm "Sao chép liên kết cấu hình" gửi Zalo (Toast feedback)
│   ├── ConsultantTrustCard.tsx               # Chân dung Saler, 5 cam kết vàng & Form Đăng ký lái thử tận nhà
│   ├── DynamicSpecsTable.tsx                 # Bảng 5 nhóm thông số kỹ thuật + Nút gạt "Chỉ xem điểm khác biệt"
│   ├── CarGalleryLightbox.tsx                # Thư viện ảnh dạng grid + Modal phóng to toàn màn hình (Keyboard + Swipe)
│   ├── CarReviewWithTOC.tsx                  # Bài viết đánh giá + Sticky TOC cuộn mượt (Scrollspy IntersectionObserver)
│   ├── QuickLoanTeaser.tsx                   # Hộp kéo thanh trượt tính số tiền góp hàng tháng tại chỗ
│   ├── ProductStickyBar.tsx                  # Thanh chốt đơn ghim đáy màn hình mobile & Sub-header desktop
│   ├── CarDetailSkeleton.tsx                 # ⏳ Trạng thái Loading Skeleton matching layout
│   └── CarDetailErrorState.tsx               # ⚠️ Trạng thái Lỗi 404 thân thiện gợi ý xe khác + Hotline Saler
└── hooks/
    ├── use-car-detail-url-sync.ts            # Hook quản lý URL Query 2 chiều & popstate listener
    └── use-image-preloader.ts                # Hook nạp trước toàn bộ ảnh màu vào browser RAM buffer
```

---

## 2. Đặc Tả 4 Trạng Thái UI Bắt Buộc (Mandatory 4-State UI Pattern)

### ⏳ A. Loading State (`CarDetailSkeleton.tsx`)
```tsx
import React from 'react';

export const CarDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-4 pb-20 animate-pulse motion-reduce:animate-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-slate-200 rounded w-48"></div>

        {/* Hero Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột Trái: Car Stage Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[16/10] bg-slate-200 rounded-3xl w-full"></div>
            {/* Color Swatches Skeleton */}
            <div className="flex justify-center items-center gap-3 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-200"></div>
              ))}
            </div>
          </div>

          {/* Cột Phải: Specs & Pricing Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2"></div>
            <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
            <div className="space-y-3 pt-4">
              <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
              <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### ⚠️ B. Error / Not Found State (`CarDetailErrorState.tsx`)
```tsx
import React from 'react';
import Link from 'next/link';
import { AlertCircle, PhoneCall, ArrowLeft } from 'lucide-react';

interface CarDetailErrorStateProps {
  slug?: string;
  hotline?: string;
}

export const CarDetailErrorState = ({ slug, hotline = '0981.234.567' }: CarDetailErrorStateProps) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-lg w-full text-center p-8 sm:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Không tìm thấy thông tin dòng xe
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Dòng xe với mã <code className="font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-semibold">{slug}</code> hiện chưa được phát hành hoặc đã ngừng kinh doanh.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/xe"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 motion-reduce:transition-none shadow-sm active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Xem tất cả các dòng xe
          </Link>
          <a
            href={`tel:${hotline.replace(/\D/g, '')}`}
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Gọi Em Tư Vấn ({hotline})
          </a>
        </div>
      </div>
    </div>
  );
};
```

---

## 3. Đặc Tả Chi Tiết Các Component Đột Phá (Aesthetic & High Conversion)

### 🚗 3.1. `CarHeroExperience.tsx` (Luxury Studio Stage & Fade Transition)
```tsx
import React, { useState } from 'react';
import Image from 'next/image';
import type { VersionColor } from '@cardealer/types';

interface CarHeroExperienceProps {
  carName: string;
  versionName: string;
  currentColor: VersionColor | null;
  fallbackImage: string;
}

export const CarHeroExperience = ({
  carName,
  versionName,
  currentColor,
  fallbackImage,
}: CarHeroExperienceProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const displayImage = currentColor?.anhXeTheoMauUrl || fallbackImage;

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-slate-100/90 via-slate-50/50 to-white border border-slate-200/80 p-4 sm:p-8 overflow-hidden shadow-sm">
      {/* Studio Radial Stage Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-[16/10] bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

      {/* Hero Car Image Container (Tỷ lệ vàng 16:10, CLS = 0) */}
      <div className="relative w-full aspect-[16/10] max-h-[460px] mx-auto flex items-center justify-center">
        <Image
          src={displayImage}
          alt={`${carName} ${versionName} - Màu ${currentColor?.tenMau || 'ngoại thất'}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 750px"
          className={`object-contain transition-opacity duration-200 ease-in-out motion-reduce:transition-none ${
            imageLoaded ? 'opacity-100' : 'opacity-80'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Realistic Ambient Tire Floor Shadow */}
        <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-slate-950/20 blur-xl rounded-full pointer-events-none"></div>
      </div>

      {/* Nhãn Tên Màu Hiện Tại */}
      {currentColor && (
        <div className="text-center pt-3 sm:pt-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Màu sơn ngoại thất:</p>
          <p className="text-sm font-bold text-slate-900">{currentColor.tenMau}</p>
        </div>
      )}
    </div>
  );
};
```

---

### 🎨 3.2. `ColorSwatches.tsx` (Tactile Swatches with Two-Tone & Tooltip)
```tsx
import React from 'react';
import type { VersionColor } from '@cardealer/types';

interface ColorSwatchesProps {
  colors: VersionColor[];
  selectedColorId: string | null;
  onSelectColor: (color: VersionColor) => void;
}

export const ColorSwatches = ({
  colors,
  selectedColorId,
  onSelectColor,
}: ColorSwatchesProps) => {
  return (
    <div
      role="radiogroup"
      aria-label="Chọn màu sơn ngoại thất"
      className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2"
    >
      {colors.map((color) => {
        const isSelected = selectedColorId === color.colorId;
        return (
          <button
            key={color.colorId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectColor(color)}
            title={color.tenMau}
            className={`group relative w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-transform duration-150 ease-in-out motion-reduce:transition-none focus-visible:outline-none ${
              isSelected
                ? 'scale-110 ring-2 ring-blue-600 ring-offset-2 shadow-md'
                : 'hover:scale-105 border border-slate-300'
            }`}
            style={{
              background: color.isTwoTone && color.secondaryHexCode
                ? `linear-gradient(135deg, ${color.secondaryHexCode} 45%, ${color.hexCode} 45%)`
                : color.hexCode,
            }}
          >
            {/* Visual Gloss Highlight */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none"></span>

            {/* Micro-Tooltip hiển thị khi Hover */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg pointer-events-none">
              {color.tenMau}
            </span>
          </button>
        );
      })}
    </div>
  );
};
```

---

### 💼 3.3. `ConsultantTrustCard.tsx` (Thương Hiệu Cá Nhân Của Saler)
```tsx
import React, { useState } from 'react';
import { ShieldCheck, Car, Banknote, Gift, Clock, PhoneCall, MessageSquare, CheckCircle2 } from 'lucide-react';

interface ConsultantTrustCardProps {
  salerName: string;
  hotline: string;
  zaloUrl: string;
  carName: string;
  versionName: string;
}

export const ConsultantTrustCard = ({
  salerName,
  hotline,
  zaloUrl,
  carName,
  versionName,
}: ConsultantTrustCardProps) => {
  const [testDriveDone, setTestDriveDone] = useState(false);

  return (
    <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header: Chân dung & Thông tin Saler */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-blue-500/20">
          {salerName.charAt(0)}
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full">
            Tư Vấn Bán Hàng Xuất Sắc
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
            {salerName}
          </h3>
          <p className="text-xs text-slate-600">Phụ trách kinh doanh xe ô tô chính hãng</p>
        </div>
      </div>

      {/* Bộ 5 Cam Kết Vàng */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>Giá lăn bánh cạnh tranh nhất:</strong> Cam kết hỗ trợ giá và ưu đãi tốt nhất khu vực.</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Car className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>Lái thử tận nhà miễn phí:</strong> Đưa xe đến tận cơ quan hoặc gia đình bạn.</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Banknote className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>Bao đậu hồ sơ vay 85%:</strong> Xử lý nợ xấu nhóm nhẹ, phê duyệt hồ sơ trong 4 giờ.</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Gift className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>Quà tặng độc quyền:</strong> Phụ kiện cao cấp chính hãng từ cá nhân em {salerName}.</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>Giao xe đúng ngày giờ tốt:</strong> Xe chuyên dùng bàn giao tận nhà chu đáo.</span>
        </div>
      </div>

      {/* Nút Hành Động Trực Tiếp */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <a
          href={`tel:${hotline.replace(/\D/g, '')}`}
          className="inline-flex items-center justify-center h-12 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all motion-reduce:transition-none"
        >
          <PhoneCall className="w-4 h-4 mr-1.5" />
          Gọi Em Ngay
        </a>
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-12 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all motion-reduce:transition-none"
        >
          <MessageSquare className="w-4 h-4 mr-1.5" />
          Chat Zalo Báo Giá
        </a>
      </div>
    </div>
  );
};
```

---

### 📊 3.4. `DynamicSpecsTable.tsx` (Công Tắc "Chỉ Xem Điểm Khác Biệt")
```tsx
import React, { useState } from 'react';
import type { CarDetailVersion } from '@cardealer/types';
import { SlidersHorizontal, Check, Minus } from 'lucide-react';

interface DynamicSpecsTableProps {
  versions: CarDetailVersion[];
  selectedVersionId: string;
}

export const DynamicSpecsTable = ({
  versions,
  selectedVersionId,
}: DynamicSpecsTableProps) => {
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const selectedVer = versions.find((v) => v.id === selectedVersionId) || versions[0];
  const specGroups = selectedVer?.specGroups || [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header & Toggle Nút Gạt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Thông Số Kỹ Thuật Chi Tiết
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Đang hiển thị theo phiên bản: <span className="font-bold text-blue-600">{selectedVer.tenPhienBan}</span>
          </p>
        </div>

        {/* Nút công tắc: Chỉ xem điểm khác biệt */}
        <label className="inline-flex items-center gap-3 cursor-pointer self-start sm:self-auto select-none bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            Chỉ xem điểm khác biệt
          </span>
          <input
            type="checkbox"
            checked={onlyDiff}
            onChange={(e) => setOnlyDiff(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
        </label>
      </div>

      {/* Tabs Nhóm Thông Số */}
      {specGroups.length > 0 ? (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {specGroups.map((group, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === idx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {group.groupName}
              </button>
            ))}
          </div>

          {/* Bảng Chi Tiết Thông Số Của Tab */}
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {specGroups[activeTab]?.specs.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className={`grid grid-cols-2 sm:grid-cols-3 p-3.5 sm:p-4 text-xs sm:text-sm ${
                  itemIdx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                }`}
              >
                <span className="font-medium text-slate-600 sm:col-span-1">{item.label}</span>
                <span className="font-bold text-slate-900 sm:col-span-2 text-right sm:text-left">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-slate-500">
          Đang cập nhật bảng thông số kỹ thuật cho phiên bản này.
        </div>
      )}
    </div>
  );
};
```

---

### 📱 3.5. `ProductStickyBar.tsx` (Chốt Đơn Đáy Màn Hình Mobile & Sub-Header Desktop)
```tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PhoneCall, MessageSquare, Calculator } from 'lucide-react';

interface ProductStickyBarProps {
  carName: string;
  versionName: string;
  displayPriceText: string;
  hotline: string;
  zaloUrl: string;
  calculatorUrl: string;
}

export const ProductStickyBar = ({
  carName,
  versionName,
  displayPriceText,
  hotline,
  zaloUrl,
  calculatorUrl,
}: ProductStickyBarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hiện thanh Sticky khi cuộn qua 400px (vượt qua Hero)
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* 📱 1. Mobile Bottom Sticky Bar (Ghim chặt đáy màn hình) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-900 truncate">{carName} {versionName}</p>
          <p className="text-xs font-black text-rose-600">{displayPriceText}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            Zalo
          </a>
          <a
            href={`tel:${hotline.replace(/\D/g, '')}`}
            className="h-10 px-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1" />
            Gọi
          </a>
        </div>
      </div>

      {/* 🖥️ 2. Desktop Sticky Sub-Header (Ghim trên đỉnh màn hình khi cuộn) */}
      <div className="hidden sm:block fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200 motion-reduce:transition-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-black text-slate-900 text-base">{carName}</span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-sm font-semibold text-slate-700">{versionName}</span>
            <span className="text-sm font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {displayPriceText}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={calculatorUrl}
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 mr-1.5" />
              Tính Lăn Bánh
            </Link>
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Chat Zalo Báo Giá
            </a>
            <a
              href={`tel:${hotline.replace(/\D/g, '')}`}
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
              {hotline}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
```

---

## 4. Responsive Tokens & Quy Chuẩn Thang Đo (Tailwind Scale)
* **Touch Target Area:** Bắt buộc dùng `h-11` (44px) hoặc `h-12` (48px) cho tất cả nút CTA di động (tuân thủ tiêu chuẩn Apple Human Interface Guidelines).
* **Z-Index Layer Hierarchy:**
  * `z-10`: Sticky TOC sidebar bài viết.
  * `z-30`: Desktop Sticky Sub-Header.
  * `z-40`: Mobile Sticky Bottom Bar & Drawer Menu.
  * `z-50`: Car Gallery Lightbox Modal & `LeadQuoteModal`.

---

## 5. Danh Mục Snapshot Spec Cho Visual QA Testing (Phase 4)
- [ ] `SNAP-01`: Viewport Mobile (375px) - Car Hero Stage & Color Swatches touch layout.
- [ ] `SNAP-02`: Viewport Mobile (375px) - Mobile Sticky Bottom Bar (Gọi + Zalo).
- [ ] `SNAP-03`: Viewport Desktop (1440px) - Hero Stage với hiệu ứng chuyển màu và Selector phiên bản.
- [ ] `SNAP-04`: Viewport Desktop (1440px) - Bảng Dynamic Specs Table khi gạt "Chỉ xem điểm khác biệt".
- [ ] `SNAP-05`: Fullscreen Modal - Car Gallery Lightbox zoom toàn màn hình.
