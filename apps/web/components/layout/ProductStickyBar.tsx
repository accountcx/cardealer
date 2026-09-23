'use client';

import React, { useState, useEffect } from 'react';
import { PhoneCall, Sparkles, FileText } from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { StickyBarSettings } from '@cardealer/types';
import { sanitizePhoneNumber } from '@cardealer/types';

export interface ProductStickyBarProps {
  settings: StickyBarSettings;
  carTitle?: string;
  priceText?: string;
  onOpenLeadModal?: () => void;
  onVisibilityChange?: (visible: boolean) => void;
}

// 🧠 Mental Model: Thanh chốt đơn cố định ở chân màn hình (ProductStickyBar).
// 1. Tự động trượt lên (Slide-up) khi người dùng cuộn qua vùng Hero (> 300px).
// 2. Nút "Nhận Báo Giá" được làm nổi bật với tông Đỏ/Cam cùng hiệu ứng animate-pulse kích thích chuyển đổi.
// 3. Thông báo cho Viewport Coordinator để nâng độ cao của FloatingSeller lên an toàn.
export const ProductStickyBar = ({
  settings,
  carTitle = 'Báo Giá Xe Hyundai',
  priceText = 'Góp 85% • Giao xe tận nhà',
  onOpenLeadModal,
  onVisibilityChange,
}: ProductStickyBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dynamicData, setDynamicData] = useState<{ carTitle?: string; priceText?: string } | null>(null);
  const cleanHotline = sanitizePhoneNumber(settings.hotline);

  // 🔄 Lắng nghe sự kiện cập nhật động từ trang chi tiết xe hoặc các trang chuyên biệt
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        setDynamicData(detail);
      }
    };
    const handleReset = () => {
      setDynamicData(null);
    };

    window.addEventListener('update-sticky-bar', handleUpdate);
    window.addEventListener('reset-sticky-bar', handleReset);
    return () => {
      window.removeEventListener('update-sticky-bar', handleUpdate);
      window.removeEventListener('reset-sticky-bar', handleReset);
    };
  }, []);

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

  const currentTitle = dynamicData?.carTitle || carTitle;
  const currentPriceText = dynamicData?.priceText || priceText || settings.subtitle;

  const handleCtaClick = () => {
    if (onOpenLeadModal) onOpenLeadModal();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-lead-modal', {
          detail: { carTitle: currentTitle },
        })
      );
    }
  };

  return (
    <div
      role="region"
      aria-label="Thanh kích cầu tư vấn nhanh"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-2.5 px-3.5 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300 motion-reduce:animate-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Tên xe & Tóm tắt giá / Thông điệp (Tối ưu flexbox chống vỡ layout khi text dài) */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1 min-w-0">
            <span
              title={currentTitle}
              className="font-extrabold text-slate-900 text-xs sm:text-sm truncate block"
            >
              {currentTitle}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 hidden sm:inline shrink-0" />
          </div>
          <div
            title={currentPriceText}
            className="text-[11px] sm:text-xs text-rose-600 font-bold truncate block mt-0.5"
          >
            {currentPriceText}
          </div>
        </div>

        {/* Nút Gọi & Nút Nhận Báo Giá (Touch target chuẩn 40px, phân tách ranh giới an toàn chống bấm nhầm) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={`tel:${cleanHotline}`}
            className="h-10 sm:h-11 w-10 sm:w-auto px-0 sm:px-3.5 rounded-xl border border-slate-200/90 text-[#002C6C] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-95 transition-all bg-white shadow-2xs shrink-0"
            aria-label={`Gọi ngay số ${settings.hotline}`}
            title={`Gọi ngay: ${settings.hotline}`}
          >
            <PhoneCall className="w-4.5 h-4.5 text-[#0072CE] animate-pulse motion-reduce:animate-none shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">{settings.callText}</span>
          </a>

          {/* Nút Nhận Báo Giá: Mục tiêu chuyển đổi tối thượng (Đỏ/Hồng + Pulse) */}
          <Button
            type="button"
            onClick={handleCtaClick}
            className="h-10 sm:h-11 px-3.5 sm:px-5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-red-600/25 transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-1 whitespace-nowrap animate-pulse hover:animate-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer border-0 shrink-0"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            <span className="whitespace-nowrap">{settings.ctaText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
