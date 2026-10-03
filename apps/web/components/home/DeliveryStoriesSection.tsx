'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { DeliveryStoriesZoneConfig, DeliveryStoryItem } from '@cardealer/types';

export interface DeliveryStoriesSectionProps {
  config: DeliveryStoriesZoneConfig;
}

// 🧠 Mental Model: Phân khu 6 - Testimonials & Delivery Stories (Khoảnh Khắc Bàn Giao Xe Thực Tế).
// 1. Áp dụng Graceful Degradation: Nếu config.enabled = false HOẶC danh sách stories rỗng ➡️ return null.
// 2. Carousel / Slider tương tác: Touch Snap Scroll, Prev/Next buttons, Dots Pagination, Auto-slide & Lightbox.
// 3. Tuân thủ 100% fullstack-dev-executor.xml & unit size limit (< 300 dòng).
export const DeliveryStoriesSection: React.FC<DeliveryStoriesSectionProps> = ({ config }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxStory, setLightboxStory] = useState<DeliveryStoryItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stories = config?.stories || [];
  const totalSlides = stories.length;

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 24
      : 1;
    const index = Math.round(container.scrollLeft / itemWidth);
    setActiveIndex(Math.max(0, Math.min(index, totalSlides - 1)));
  }, [totalSlides]);

  const scrollToSlide = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const targetItem = container.children[index] as HTMLElement | undefined;
    if (targetItem) {
      container.scrollTo({
        left: targetItem.offsetLeft - container.offsetLeft,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  }, []);

  const handlePrev = useCallback(() => {
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : totalSlides - 1;
    scrollToSlide(prevIndex);
  }, [activeIndex, totalSlides, scrollToSlide]);

  const handleNext = useCallback(() => {
    const nextIndex = activeIndex < totalSlides - 1 ? activeIndex + 1 : 0;
    scrollToSlide(nextIndex);
  }, [activeIndex, totalSlides, scrollToSlide]);

  useEffect(() => {
    if (totalSlides <= 1 || isPaused || lightboxStory !== null) return;
    const timer = setInterval(() => handleNext(), 5000);
    return () => clearInterval(timer);
  }, [totalSlides, isPaused, lightboxStory, handleNext]);

  useEffect(() => {
    if (lightboxStory) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setLightboxStory(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [lightboxStory]);

  if (!config || !config.enabled || totalSlides === 0) {
    return null;
  }

  return (
    <section
      className="py-12 sm:py-16 bg-slate-50 relative overflow-hidden border-t border-b border-slate-200/60"
      aria-label="Khoảnh Khắc Bàn Giao Xe Thực Tế"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Người Thật Việc Thật — Bàn Giao Tận Tay</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {config.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {config.subheadline}
            </p>
          </div>

          {/* Controls */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-3 self-start md:self-end">
              <div className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
                <span className="font-bold text-[#0072CE]">{activeIndex + 1}</span> / {totalSlides} khách hàng
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs hover:shadow transition-all active:scale-95"
                  title="Xem ảnh bàn giao trước"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs hover:shadow transition-all active:scale-95"
                  title="Xem ảnh bàn giao tiếp theo"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stories Carousel Track */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stories.map((story, idx) => (
            <div
              key={story.id || idx}
              className="w-[88vw] sm:w-[380px] md:w-[400px] shrink-0 snap-center rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              onClick={() => setLightboxStory(story)}
            >
              <div>
                <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    style={{ backgroundImage: `url(${story.imageUrl || '/images/delivery/default.webp'})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-md">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/95 backdrop-blur shadow-sm border border-slate-200/60 text-slate-800 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#0072CE]" />
                    <span>{story.location || 'TP. Vinh, Nghệ An'}</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#002C6C] transition-colors flex items-center gap-1.5">
                      <span>{story.customerName}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </h3>
                    <p className="text-xs font-bold text-[#0072CE] mt-0.5">
                      {story.carModel}
                    </p>
                  </div>

                  {story.quote && (
                    <blockquote className="text-xs sm:text-sm text-slate-600 italic leading-relaxed relative pl-3.5 border-l-2 border-[#002C6C] bg-slate-50/80 p-3 rounded-r-xl whitespace-pre-line">
                      &ldquo;{story.quote}&rdquo;
                    </blockquote>
                  )}
                </div>
              </div>

              <div className="px-6 pb-5 pt-1 text-[11px] text-slate-400 font-medium flex items-center justify-between border-t border-slate-100 mt-2">
                <span>Bàn giao: {story.deliveryDate || 'Tháng 09/2026'}</span>
                <span className="text-[#0072CE] text-xs font-semibold group-hover:underline inline-flex items-center gap-1">
                  Xem ảnh chi tiết &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Pagination */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {stories.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'w-8 bg-[#0072CE]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Chuyển đến ảnh số ${idx + 1}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxStory && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxStory(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-4 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{lightboxStory.customerName}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                    {lightboxStory.carModel}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>{lightboxStory.location}</span> • <span>Bàn giao: {lightboxStory.deliveryDate}</span>
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLightboxStory(null)}
                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full w-9 h-9"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 relative">
              <img
                src={lightboxStory.imageUrl || '/images/delivery/default.webp'}
                alt={lightboxStory.customerName || 'Ảnh bàn giao'}
                className="w-full h-full object-contain"
              />
            </div>

            {lightboxStory.quote && (
              <p className="text-xs sm:text-sm text-slate-300 italic bg-white/5 p-3.5 rounded-xl border border-white/10 whitespace-pre-line text-center">
                &ldquo;{lightboxStory.quote}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
