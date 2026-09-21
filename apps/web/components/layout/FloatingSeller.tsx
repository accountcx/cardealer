'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, MessageCircle, X, ShieldCheck } from 'lucide-react';
import type { FloatingSellerSettings } from '@cardealer/types';
import { sanitizePhoneNumber, normalizeZaloUrl } from '@cardealer/types';

export interface FloatingSellerProps {
  settings: FloatingSellerSettings;
  isStickyBarVisible?: boolean;
}

// 🧠 Mental Model: Widget Chuyên Viên Tư Vấn Nổi Toàn Cục (FloatingSeller).
// 1. Mặc định luôn thu gọn (isOpen = false) dạng nút tròn bo viền, không choán diện tích màn hình.
// 2. Avatar ảnh chân dung thật kèm chấm xanh Online gắn tại góc dưới bên phải.
// 3. Tự động đóng hộp thoại to khi click ra ngoài màn hình (click-outside) hoặc bấm phím Escape.
// 4. Khoảng cách đáy an toàn (bottom-16 đến bottom-28) ngăn ngừa 100% việc dính sát mép hoặc đè lên dòng chữ Copyright/Footer.
// 5. CTA rõ ràng: Nút "Gọi Ngay" màu xanh đậm chủ đạo, nút "Chat Zalo" dạng outline viền xanh.
export const FloatingSeller = ({ settings, isStickyBarVisible = false }: FloatingSellerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!settings.enabled) return null;

  const cleanPhone = sanitizePhoneNumber(settings.sellerPhone);
  const cleanZaloUrl = normalizeZaloUrl(settings.sellerZalo || settings.sellerPhone);
  const avatarUrl =
    settings.sellerAvatar ||
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';

  return (
    <aside
      ref={widgetRef}
      aria-label="Tư vấn viên trực tuyến"
      className={`hidden md:block fixed right-4 sm:right-6 lg:right-8 z-50 transition-all duration-300 ease-in-out motion-reduce:transition-none ${
        isStickyBarVisible
          ? 'bottom-24 sm:bottom-28 lg:bottom-16'
          : 'bottom-16 sm:bottom-18 lg:bottom-16'
      }`}
    >
      {/* Expanded Card View (Hộp thoại tư vấn khi click mở) */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-80 max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200 motion-reduce:animate-none">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar chân dung thật với chấm xanh online góc dưới phải */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#0072CE] bg-slate-100 shadow-sm">
                  <img
                    src={avatarUrl}
                    alt={settings.sellerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Dấu chấm Online gắn chặt góc dưới phải */}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse motion-reduce:animate-none" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {settings.sellerName}
                  <ShieldCheck className="w-4 h-4 text-[#0072CE]" />
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping motion-reduce:animate-none" />
                  <span>{settings.statusText}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Đóng bảng tư vấn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
            {settings.greetingMessage}
          </p>

          {/* CTA Buttons: Gọi Ngay (Solid Navy Blue) & Chat Zalo (Outline Blue) */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${cleanPhone}`}
              className="h-10 flex items-center justify-center gap-1.5 bg-[#002C6C] hover:bg-[#001D48] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Gọi Ngay</span>
            </a>
            <a
              href={cleanZaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 flex items-center justify-center gap-1.5 bg-white hover:bg-blue-50 text-[#0068FF] border border-[#0068FF] rounded-xl text-xs font-extrabold shadow-sm transition-all active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#0068FF]" />
              <span>Chat Zalo</span>
            </a>
          </div>
        </div>
      )}

      {/* Collapsed Bubble Trigger (Mặc định hiển thị nút tròn) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 p-1 bg-white hover:bg-slate-50 border-2 border-[#0072CE] rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none cursor-pointer ml-auto"
        aria-label="Mở chat tư vấn viên showroom"
      >
        {/* Container Avatar Relative */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
            <img
              src={avatarUrl}
              alt={settings.sellerName}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Dấu chấm xanh absolute gắn chặt góc dưới phải */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse motion-reduce:animate-none" />
        </div>

        <span className="hidden sm:inline-block pr-3 text-xs font-bold text-slate-800 whitespace-nowrap">
          Tư vấn 24/7
        </span>
      </button>
    </aside>
  );
};
