'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, PhoneCall, Tag } from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { HeroBannerConfig } from '@cardealer/types';
import { CountdownTimer } from './CountdownTimer';

export interface HeroEventBannerProps {
  config: HeroBannerConfig;
  hotline?: string;
}

// 🧠 Mental Model: Phân khu 1 - Hero Event Banner & Countdown Timer.
// 1. Áp dụng Graceful Degradation: Nếu config.enabled = false ➡️ return null hoàn toàn.
// 2. Kích hoạt hiệu ứng visual đẳng cấp: Gradient overlay xanh navy đặc trưng của Hyundai (#002C6C),
//    tôn vinh hình ảnh sự kiện, tích hợp bộ đếm ngược chuẩn múi giờ và nút CTA kích hoạt Lead Modal.
export const HeroEventBanner: React.FC<HeroEventBannerProps> = ({ config, hotline = '0981.234.567' }) => {
  if (!config || !config.enabled) return null;

  const handleCtaClick = () => {
    if (config.ctaButton.action === 'quote_modal') {
      window.dispatchEvent(new CustomEvent('open-lead-modal', { detail: { source: 'homepage_hero' } }));
    }
  };

  const position = config.contentPosition || 'center-left';
  const isCenter = position === 'center-center';
  const isRight = position === 'center-right';

  // 🧠 Mental Model: Lớp phủ Gradient đa tầng thông minh:
  // - Vùng ngay phía sau cụm chữ (0% -> 28%): Đậm vừa đủ (#020617 đến 96%) che chữ in trên ảnh cũ và bảo đảm text đọc rõ nét
  // - Vùng chuyển tiếp (28% -> 48%): Mờ dần cực nhanh (85% -> 55% -> 20% -> 4%)
  // - Nửa khung hình bên phải (từ 50% -> 100%): HOÀN TOÀN TRONG SUỐT (transparent / opacity = 0),
  //   trả lại toàn bộ độ sáng nguyên bản 100% cho chiếc xe thật rực rỡ và sắc nét.
  const desktopGradient =
    isCenter
      ? 'radial-gradient(ellipse at center, rgba(2,6,23,0.75) 0%, rgba(2,6,23,0.35) 45%, transparent 75%)'
      : isRight
      ? 'linear-gradient(270deg, #020617 0%, rgba(2,6,23,0.96) 20%, rgba(2,6,23,0.85) 28%, rgba(2,6,23,0.55) 36%, rgba(2,6,23,0.20) 44%, rgba(2,6,23,0.04) 48%, transparent 52%, transparent 100%)'
      : 'linear-gradient(90deg, #020617 0%, rgba(2,6,23,0.96) 20%, rgba(2,6,23,0.85) 28%, rgba(2,6,23,0.55) 36%, rgba(2,6,23,0.20) 44%, rgba(2,6,23,0.04) 48%, transparent 52%, transparent 100%)';

  const containerClasses = isCenter
    ? 'mx-auto text-center flex flex-col items-center'
    : isRight
    ? 'ml-auto text-left sm:text-right flex flex-col items-start sm:items-end'
    : 'mr-auto text-left flex flex-col items-start';

  const subheadlineClasses = isCenter
    ? 'mx-auto text-center'
    : isRight
    ? 'sm:ml-auto text-left sm:text-right'
    : 'text-left';

  const ctaClasses = isCenter
    ? 'justify-center'
    : isRight
    ? 'justify-start sm:justify-end'
    : 'justify-start';

  return (
    <section className="relative w-full bg-slate-950 overflow-hidden" aria-label="Khuyến Mại Sự Kiện Lớn">
      {/* Background Media & Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        {config.mediaType === 'video' && config.mediaUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-85"
          >
            <source src={config.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className={`w-full h-full bg-cover transition-transform duration-700 hover:scale-105 ${
              isRight ? 'bg-center md:bg-[center_left]' : isCenter ? 'bg-center' : 'bg-center md:bg-[center_right]'
            }`}
            style={{
              backgroundImage: `url(${config.mediaUrl || '/images/banners/hero-event.webp'})`,
              backgroundColor: '#001A44',
            }}
          />
        )}
        {/* Lớp phủ Linear Gradient Đa Tầng Siêu Mịn thích ứng vị trí nội dung */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{ background: desktopGradient }}
        />
        {/* Fallback cho Mobile: Giữ nửa trên sáng hơn để thấy rõ xe */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(2,6,23,0.25) 0%, rgba(2,6,23,0.65) 45%, #020617 90%)',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className={`max-w-3xl space-y-5 sm:space-y-6 ${containerClasses}`}>
          {/* Huy hiệu số suất ưu đãi còn lại */}
          {config.remainingSlots.enabled && config.remainingSlots.slotsCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 border border-red-400/50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/40 animate-pulse">
              <Tag className="w-3.5 h-3.5 text-amber-300" />
              <span>{config.remainingSlots.badgeText}</span>
            </div>
          )}

          {/* Tiêu đề chính & Slogan */}
          <div className="space-y-3 sm:space-y-4 w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-xl">
              {config.headline}
            </h1>
            <p className={`text-base sm:text-lg lg:text-xl text-slate-200 font-medium leading-relaxed max-w-2xl drop-shadow ${subheadlineClasses}`}>
              {config.subheadline}
            </p>
          </div>

          {/* Countdown Timer Island */}
          {config.countdown.enabled && (
            <div className={`pt-2 w-full flex ${ctaClasses}`}>
              <CountdownTimer
                targetDate={config.countdown.targetDate}
                urgencyText={config.countdown.urgencyText}
              />
            </div>
          )}

          {/* Nút Kêu Gọi Hành Động (CTA Buttons) */}
          <div className={`flex flex-wrap items-center gap-3 sm:gap-4 pt-4 w-full ${ctaClasses}`}>
            {config.ctaButton.action === 'quote_modal' ? (
              <Button
                type="button"
                onClick={handleCtaClick}
                className="h-auto flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0072CE] to-[#005BA4] hover:from-[#005BA4] hover:to-[#00427A] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#0072CE]/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#0072CE]/50 border-0"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{config.ctaButton.text}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : config.ctaButton.action === 'tel' ? (
              <a
                href={`tel:${hotline.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0072CE] to-[#005BA4] hover:from-[#005BA4] hover:to-[#00427A] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#0072CE]/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{config.ctaButton.text}</span>
              </a>
            ) : (
              <Link
                href={config.ctaButton.href || '/xe'}
                className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0072CE] to-[#005BA4] hover:from-[#005BA4] hover:to-[#00427A] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#0072CE]/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{config.ctaButton.text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {/* Nút Gọi Hotline Phụ */}
            <a
              href={`tel:${hotline.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-2.5 px-5 sm:px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm sm:text-base backdrop-blur-md shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PhoneCall className="w-4 h-4 text-sky-400" />
              <span>Hotline: {hotline}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
