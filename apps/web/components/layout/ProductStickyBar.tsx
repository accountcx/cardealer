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
  carTitle = 'Nhận Ưu Đãi & Báo Giá Xe Hyundai',
  priceText = 'Hỗ trợ trả góp 85% • Giao xe tận nhà',
  onOpenLeadModal,
  onVisibilityChange,
}: ProductStickyBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cleanHotline = sanitizePhoneNumber(settings.hotline);

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
    <div
      role="region"
      aria-label="Thanh kích cầu tư vấn nhanh"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-2.5 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300 motion-reduce:animate-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Tên xe & Tóm tắt giá / Thông điệp */}
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-slate-900 text-xs sm:text-base truncate flex items-center gap-1.5">
            <span>{carTitle}</span>
            <Sparkles className="w-4 h-4 text-amber-500 hidden sm:inline flex-shrink-0" />
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 truncate font-medium">
            {settings.subtitle || priceText}
          </div>
        </div>

        {/* Nút Gọi & Nút Nhận Báo Giá Nổi Bật (Red Gradient + Pulse) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <a
            href={`tel:${cleanHotline}`}
            className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-slate-200/90 text-[#002C6C] font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:bg-slate-50 transition-colors bg-white shadow-sm whitespace-nowrap"
            aria-label={`Gọi ngay số ${settings.hotline}`}
          >
            <PhoneCall className="w-4 h-4 text-[#0072CE] animate-pulse motion-reduce:animate-none flex-shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">{settings.hotline}</span>
            <span className="md:hidden whitespace-nowrap">{settings.callText}</span>
          </a>

          {/* Nút Nhận Báo Giá: Mục tiêu chuyển đổi tối thượng (Đỏ/Hồng + Pulse) */}
          <Button
            type="button"
            onClick={onOpenLeadModal}
            className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1.5 whitespace-nowrap animate-pulse hover:animate-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer border-0"
          >
            <FileText className="w-4 h-4 text-white flex-shrink-0" />
            <span className="whitespace-nowrap">{settings.ctaText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
