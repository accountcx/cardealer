'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
// 2. Slider Vô Cực (Infinite Loop Carousel): Buffer 5 chu kỳ lặp liền mạch, tự động reset offset ở trạng thái nghỉ mà không giật khung hình.
// 3. Tương tác cao cấp: Touch Snap, Auto-play 5s (pause khi hover/touch), Lightbox phóng to ảnh chất lượng cao.
// 4. Tuân thủ 100% fullstack-dev-executor.xml & unit size limit (< 300 dòng).
export const DeliveryStoriesSection: React.FC<DeliveryStoriesSectionProps> = ({ config }) => {
  const [activeRealIndex, setActiveRealIndex] = useState(0);
  const [lightboxStory, setLightboxStory] = useState<DeliveryStoryItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const normalizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stories = config?.stories || [];
  const totalOriginal = stories.length;

  // Lặp 5 bộ stories để tạo buffer vô cực mượt mà cho cả hướng Prev và Next
  const repeatCount = totalOriginal > 1 ? 5 : 1;
  const extendedStories = useMemo(() => {
    if (totalOriginal <= 1) return stories;
    const list: DeliveryStoryItem[] = [];
    for (let r = 0; r < repeatCount; r++) {
      list.push(...stories);
    }
    return list;
  }, [stories, totalOriginal, repeatCount]);

  const getItemWidth = useCallback(() => {
    if (!scrollRef.current) return 0;
    const firstChild = scrollRef.current.firstElementChild as HTMLElement | null;
    return firstChild ? firstChild.offsetWidth + 24 : 0; // 24px = gap-6
  }, []);

  // Khởi tạo vị trí chính giữa (Set 2) khi mount
  useEffect(() => {
    if (totalOriginal <= 1 || !scrollRef.current) return;
    const itemWidth = getItemWidth();
    if (itemWidth > 0) {
      scrollRef.current.scrollLeft = totalOriginal * 2 * itemWidth;
    }
  }, [totalOriginal, getItemWidth]);

  // Chuẩn hóa vị trí vô cực khi ngừng cuộn (debounce 150ms) để không ngắt animation lướt
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || totalOriginal <= 1) return;
    const container = scrollRef.current;
    const itemWidth = getItemWidth();
    if (itemWidth <= 0) return;

    const currentVirtualIndex = Math.round(container.scrollLeft / itemWidth);
    const realIndex = ((currentVirtualIndex % totalOriginal) + totalOriginal) % totalOriginal;
    setActiveRealIndex(realIndex);

    if (normalizeTimerRef.current) {
      clearTimeout(normalizeTimerRef.current);
    }

    normalizeTimerRef.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const singleSetWidth = totalOriginal * itemWidth;
      const currentScroll = scrollRef.current.scrollLeft;
      const minBound = singleSetWidth * 1.2;
      const maxBound = singleSetWidth * 3.8;

      if (currentScroll < minBound || currentScroll > maxBound) {
        const offsetInSet = currentScroll % singleSetWidth;
        // Đưa về Set 2 một cách tức thì và vô hình với mắt người
        scrollRef.current.scrollLeft = 2 * singleSetWidth + offsetInSet;
      }
    }, 150);
  }, [totalOriginal, getItemWidth]);

  const handlePrev = useCallback(() => {
    if (!scrollRef.current || totalOriginal <= 1) return;
    const itemWidth = getItemWidth();
    if (itemWidth > 0) {
      scrollRef.current.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    }
  }, [totalOriginal, getItemWidth]);

  const handleNext = useCallback(() => {
    if (!scrollRef.current || totalOriginal <= 1) return;
    const itemWidth = getItemWidth();
    if (itemWidth > 0) {
      scrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
    }
  }, [totalOriginal, getItemWidth]);

  const scrollToRealIndex = useCallback(
    (targetRealIndex: number) => {
      if (!scrollRef.current || totalOriginal <= 1) return;
      const itemWidth = getItemWidth();
      if (itemWidth <= 0) return;

      const currentVirtualIndex = Math.round(scrollRef.current.scrollLeft / itemWidth);
      const currentReal = ((currentVirtualIndex % totalOriginal) + totalOriginal) % totalOriginal;
      let diff = targetRealIndex - currentReal;

      // Chọn hướng đi ngắn nhất
      if (diff > totalOriginal / 2) diff -= totalOriginal;
      if (diff < -totalOriginal / 2) diff += totalOriginal;

      const targetVirtualIndex = currentVirtualIndex + diff;
      scrollRef.current.scrollTo({
        left: targetVirtualIndex * itemWidth,
        behavior: 'smooth',
      });
      setActiveRealIndex(targetRealIndex);
    },
    [totalOriginal, getItemWidth]
  );

  // Auto-play vô cực 5s
  useEffect(() => {
    if (totalOriginal <= 1 || isPaused || lightboxStory !== null) return;
    const timer = setInterval(() => handleNext(), 5000);
    return () => clearInterval(timer);
  }, [totalOriginal, isPaused, lightboxStory, handleNext]);

  // Xử lý đóng Lightbox với phím Escape
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

  if (!config || !config.enabled || totalOriginal === 0) {
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

          {/* Controls Next / Prev */}
          {totalOriginal > 1 && (
            <div className="flex items-center gap-2 self-start md:self-end">
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
          )}
        </div>

        {/* Infinite Stories Track */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {extendedStories.map((story, virtualIdx) => (
            <div
              key={`${story.id || 'story'}-${virtualIdx}`}
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

              <div className="px-6 pb-5 pt-3 text-[12px] font-semibold text-[#0072CE] flex items-center justify-end border-t border-slate-100 mt-2 group-hover:translate-x-0.5 transition-transform">
                <span className="inline-flex items-center gap-1">
                  Xem ảnh chi tiết &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Pagination */}
        {totalOriginal > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {stories.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToRealIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeRealIndex === idx ? 'w-8 bg-[#0072CE]' : 'w-2 bg-slate-300 hover:bg-slate-400'
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
                  <span>{lightboxStory.location}</span>
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
