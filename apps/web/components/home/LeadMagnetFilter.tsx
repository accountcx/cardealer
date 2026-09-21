'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, DollarSign, Car, ChevronRight, Check } from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { LeadFilterConfig } from '@cardealer/types';

export interface LeadMagnetFilterProps {
  config: LeadFilterConfig;
  totalCars?: number;
}

// 🧠 Mental Model: Phân khu 2 - Lead Magnet Hub (Bộ Lọc Nhanh).
// 1. Cho phép khách hàng tìm xe theo khả năng tài chính chỉ với 2 chạm (chọn mức giá + chọn kiểu dáng).
// 2. Chuyển tiếp query params mượt mà sang trang Catalog `/xe` của Phase 4.3 mà không làm gián đoạn trải nghiệm.
export const LeadMagnetFilter: React.FC<LeadMagnetFilterProps> = ({ config, totalCars = 8 }) => {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  if (!config || !config.enabled) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedPrice !== 'all') params.set('price', selectedPrice);
    if (selectedSegment !== 'all') params.set('segment', selectedSegment);

    const queryString = params.toString();
    router.push(queryString ? `/xe?${queryString}` : '/xe');
  };

  return (
    <section className="relative -mt-6 sm:-mt-8 z-20 max-w-6xl mx-auto px-4 sm:px-6 mb-4 sm:mb-6">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/50">
        {/* Header Bộ Lọc */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 sm:pb-5 border-b border-slate-800/80">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-4 sm:w-5 h-4 sm:h-5 text-[#0072CE]" />
              <span>{config.headline}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Chọn mức ngân sách và kiểu dáng yêu thích để tìm ngay dòng xe phù hợp với gia đình bạn.
            </p>
          </div>
          <span className="self-start md:self-auto px-3.5 py-1.5 rounded-full bg-[#0072CE]/15 border border-[#0072CE]/30 text-[#0072CE] text-xs font-bold tracking-wide whitespace-nowrap">
            {totalCars} Dòng Xe Có Sẵn Giao Ngay
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-5 sm:space-y-6">
          {/* Mức Ngân Sách */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Mức Ngân Sách Đầu Tư</span>
            </label>
            {/* Mobile: Horizontal scroll with snap; Desktop: 4 columns */}
            <div className="flex overflow-x-auto snap-x pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 gap-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedPrice('all')}
                className={`shrink-0 snap-start min-w-[135px] sm:min-w-0 flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer active:scale-95 ${
                  selectedPrice === 'all'
                    ? 'bg-[#0072CE] text-white border-[#0072CE] shadow-lg shadow-[#0072CE]/30 font-bold hover:bg-[#0072CE] hover:text-white'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {selectedPrice === 'all' && <Check className="w-3.5 h-3.5" />}
                <span>Tất Cả Mức Giá</span>
              </Button>

              {config.priceRanges.map((pr) => (
                <Button
                  key={pr.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedPrice(pr.id)}
                  className={`shrink-0 snap-start min-w-[135px] sm:min-w-0 flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer active:scale-95 ${
                    selectedPrice === pr.id
                      ? 'bg-[#0072CE] text-white border-[#0072CE] shadow-lg shadow-[#0072CE]/30 font-bold hover:bg-[#0072CE] hover:text-white'
                      : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {selectedPrice === pr.id && <Check className="w-3.5 h-3.5" />}
                  <span>{pr.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Kiểu Dáng Xe */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Kiểu Dáng Xe / Phân Khúc</span>
            </label>
            {/* Mobile: Horizontal scroll with snap; Desktop: 4 columns */}
            <div className="flex overflow-x-auto snap-x pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 gap-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedSegment('all')}
                className={`shrink-0 snap-start min-w-[135px] sm:min-w-0 flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer active:scale-95 ${
                  selectedSegment === 'all'
                    ? 'bg-[#0072CE] text-white border-[#0072CE] shadow-lg shadow-[#0072CE]/30 font-bold hover:bg-[#0072CE] hover:text-white'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {selectedSegment === 'all' && <Check className="w-3.5 h-3.5" />}
                <span>Tất Cả Kiểu Dáng</span>
              </Button>

              {config.bodyStyles.map((bs) => (
                <Button
                  key={bs.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedSegment(bs.segment)}
                  className={`shrink-0 snap-start min-w-[135px] sm:min-w-0 flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer active:scale-95 ${
                    selectedSegment === bs.segment
                      ? 'bg-[#0072CE] text-white border-[#0072CE] shadow-lg shadow-[#0072CE]/30 font-bold hover:bg-[#0072CE] hover:text-white'
                      : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {selectedSegment === bs.segment && <Check className="w-3.5 h-3.5" />}
                  <span>{bs.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Nút Tìm Kiếm Nhanh: Full-width trên mobile, góc phải trên desktop */}
          <div className="pt-2 flex justify-end w-full">
            <Button
              type="submit"
              className="h-auto w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0072CE] to-[#005BA4] hover:from-[#005BA4] hover:to-[#00427A] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#0072CE]/30 hover:shadow-[#0072CE]/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer border-0"
            >
              <Search className="w-4 h-4" />
              <span>Xem Các Dòng Xe Phù Hợp</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
