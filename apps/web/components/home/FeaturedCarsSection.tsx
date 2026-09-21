import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { FeaturedCarsZoneConfig, Car } from '@cardealer/types';
import { CarShowcaseCard } from './CarShowcaseCard';

export interface FeaturedCarsSectionProps {
  config: FeaturedCarsZoneConfig;
  cars: Car[];
}

// 🧠 Mental Model: Phân khu 4 - Featured Cars Showcase (Dòng Xe Bán Chạy).
// 1. Áp dụng Graceful Degradation: Nếu config.enabled = false HOẶC danh sách cars rỗng ➡️ return null hoàn toàn.
// 2. Nạp dữ liệu xe thực tế từ database, tự động sắp xếp theo thứ tự ưu tiên ghim nổi bật.
export const FeaturedCarsSection: React.FC<FeaturedCarsSectionProps> = ({ config, cars }) => {
  if (!config || !config.enabled || !cars || cars.length === 0) {
    return null;
  }

  const displayCars = cars.slice(0, config.maxDisplay || 6);

  return (
    <section className="py-12 sm:py-16 bg-white relative" aria-label="Dòng Xe Bán Chạy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8 sm:mb-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-[#0072CE] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sẵn Xe Đủ Màu — Giao Ngay</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {config.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {config.subheadline}
            </p>
          </div>

          <Link
            href={config.viewAllHref || '/xe'}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-[#002C6C] hover:text-[#0072CE] transition-colors"
          >
            <span>{config.viewAllText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayCars.map((car) => (
            <CarShowcaseCard key={car.id} car={car} />
          ))}
        </div>

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
