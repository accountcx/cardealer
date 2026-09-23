'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { FeaturedCarsZoneConfig, Car } from '@cardealer/types';
import { CarShowcaseCard } from './CarShowcaseCard';
import { useHomeFilter } from './HomeFilterContext';

export interface FeaturedCarsSectionProps {
  config: FeaturedCarsZoneConfig;
  cars: Car[];
}

// 🧠 Mental Model: Skeleton Card mô phỏng hiệu ứng loading nhẹ chuyển đổi bộ lọc (< 200ms).
const ShowcaseCardSkeleton: React.FC = () => (
  <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-5 flex flex-col justify-between h-96 animate-pulse">
    <div>
      <div className="w-full aspect-[16/10] bg-slate-200/80 rounded-2xl mb-4" />
      <div className="space-y-2.5">
        <div className="h-5 bg-slate-200/80 rounded-md w-3/4" />
        <div className="h-3.5 bg-slate-200/60 rounded-md w-1/2" />
        <div className="h-9 bg-slate-100 rounded-xl mt-3" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100">
      <div className="h-9 bg-slate-200/70 rounded-xl" />
      <div className="h-9 bg-slate-200/70 rounded-xl" />
    </div>
  </div>
);

// 🧠 Mental Model: Phân khu 4 - Featured Cars Showcase (Dòng Xe Bán Chạy).
// 1. Kết nối với HomeFilterContext: Tự động cập nhật danh sách xe tức thì khi chọn chip ở Phân Khu 2.
// 2. Hiệu ứng skeleton loading mượt mà khi lọc thay vì phải tải lại trang.
// 3. Graceful Degradation: Tự động ẩn nếu bị tắt trong admin portal.
export const FeaturedCarsSection: React.FC<FeaturedCarsSectionProps> = ({ config, cars }) => {
  const filterContext = useHomeFilter();

  if (!config || !config.enabled) {
    return null;
  }

  const isFiltering = filterContext ? filterContext.isFiltering : false;
  const isFiltered = filterContext ? filterContext.isFiltered : false;
  const displayCars = filterContext
    ? (filterContext.displayCars as Car[])
    : (cars || []).slice(0, config.maxDisplay || 6);

  // Không hiển thị nếu ban đầu không có xe nào và không có bộ lọc
  if (!isFiltered && (!cars || cars.length === 0)) {
    return null;
  }

  return (
    <section
      id="featured-cars"
      className="py-12 sm:py-16 bg-white relative scroll-mt-20"
      aria-label="Dòng Xe Bán Chạy"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8 sm:mb-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-[#0072CE] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isFiltered
                  ? `Đang hiển thị ${displayCars.length} dòng xe phù hợp`
                  : 'Sẵn Xe Đủ Màu — Giao Ngay'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {config.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {config.subheadline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isFiltered && filterContext && (
              <Button
                type="button"
                variant="ghost"
                onClick={filterContext.resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại bộ lọc</span>
              </Button>
            )}

            <Link
              href={config.viewAllHref || '/xe'}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-[#002C6C] hover:text-[#0072CE] transition-colors"
            >
              <span>{config.viewAllText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Cars Grid hoặc Skeleton hoặc Empty State */}
        {isFiltering ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <ShowcaseCardSkeleton />
            <ShowcaseCardSkeleton />
            <ShowcaseCardSkeleton />
          </div>
        ) : displayCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayCars.map((car) => (
              <CarShowcaseCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="py-12 sm:py-16 text-center bg-slate-50/80 rounded-3xl border border-slate-200/80 p-6 sm:p-10">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-[#0072CE] mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner">
              🔍
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Không tìm thấy dòng xe phù hợp với bộ lọc đã chọn
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Quý khách vui lòng thử chọn mức ngân sách hoặc kiểu dáng xe khác, hoặc đặt lại bộ lọc để xem toàn bộ danh mục xe sẵn có.
            </p>
            {filterContext && (
              <Button
                type="button"
                onClick={filterContext.resetFilters}
                className="mt-4 h-10 px-5 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border-0 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xem Tất Cả Dòng Xe</span>
              </Button>
            )}
          </div>
        )}

        {/* Mobile View All Link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href={config.viewAllHref || '/xe'}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm"
          >
            <span>{config.viewAllText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
