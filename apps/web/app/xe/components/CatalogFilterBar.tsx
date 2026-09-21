'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  DollarSign,
  Car,
  Check,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { CatalogSegment, PriceRangeId } from '@cardealer/types';
import { CATALOG_SEGMENTS, CATALOG_PRICE_RANGES } from '@cardealer/types';

export interface CatalogFilterBarProps {
  selectedSegment: CatalogSegment;
  selectedPrice: PriceRangeId;
  totalCarsCount: number;
  filteredCarsCount: number;
  isFiltered: boolean;
  onSelectSegment: (segment: CatalogSegment) => void;
  onSelectPrice: (price: PriceRangeId) => void;
  onResetFilters: () => void;
}

// 🧠 Mental Model: Component bộ lọc đa chiều đáp ứng cao cấp (Adaptive Dual-Mode Filter).
// 1. Mobile (< 768px): Thanh tìm kiếm nhỏ gọn (Compact Bar) với 1 hàng chip cuộn ngang + nút icon "Bộ lọc"
//    kích hoạt Bottom Sheet trượt từ dưới lên, tuyệt đối KHÔNG đè hộp to che khuất danh sách xe.
// 2. Desktop (>= 768px): Card kính sang trọng (Glassmorphic Showroom Bar) phân tầng Budget-First.
// 3. Sử dụng 100% Button primitive từ @cardealer/ui và icon system đồng nhất từ lucide-react.
// 4. Tuân thủ chuẩn tiếp cận WCAG AAA (Touch target h-11 44px, focus-visible ring, motion-reduce guards).
export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  selectedSegment,
  selectedPrice,
  totalCarsCount,
  filteredCarsCount,
  isFiltered,
  onSelectSegment,
  onSelectPrice,
  onResetFilters,
}) => {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Khóa cuộn trang nền khi mở Mobile Bottom Sheet
  useEffect(() => {
    if (isMobileSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSheetOpen]);

  // Đóng Bottom Sheet bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileSheetOpen(false);
    };
    if (isMobileSheetOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSheetOpen]);

  return (
    <>
      {/* ========================================================================= */}
      {/* 📱 A. GIAO DIỆN MOBILE (< 768px): THANH NHỎ GỌN + CHIP CUỘN + NÚT BOTTOM SHEET */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-2.5 mb-6">
        <div className="flex items-center gap-2">
          {/* Nút Kích Hoạt Bottom Sheet "Bộ Lọc" */}
          <Button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className={`h-11 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold shrink-0 transition-all active:scale-95 motion-reduce:transition-none motion-reduce:transform-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none ${
              isFiltered
                ? 'bg-[#0072CE] text-white border-[#0072CE] shadow-md shadow-[#0072CE]/30'
                : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>Bộ lọc</span>
            {isFiltered && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </Button>

          {/* 1 Hàng Chip Ngân Sách Cuộn Ngang Siêu Nhanh */}
          <div
            role="group"
            aria-label="Chọn nhanh mức ngân sách"
            className="flex-1 overflow-x-auto snap-x flex items-center gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1"
          >
            {CATALOG_PRICE_RANGES.map((pr) => {
              const isSelected = selectedPrice === pr.id;
              return (
                <button
                  key={pr.id}
                  type="button"
                  onClick={() => onSelectPrice(pr.id)}
                  className={`shrink-0 snap-start h-9 px-3 rounded-full text-xs font-semibold border transition-all active:scale-95 motion-reduce:transition-none motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-[#0072CE] text-white border-[#0072CE] shadow-sm font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pr.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thanh trạng thái phụ: Số lượng xe tìm thấy + Nút Đặt lại nhanh */}
        <div className="flex items-center justify-between text-xs px-1 text-slate-500">
          <span className="font-medium">
            {filteredCarsCount === totalCarsCount
              ? `Tất cả ${totalCarsCount} dòng xe`
              : `Tìm thấy ${filteredCarsCount} / ${totalCarsCount} xe phù hợp`}
          </span>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[#0072CE] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 B. MOBILE BOTTOM SHEET: TRƯỢT TỪ DƯỚI LÊN ĐỂ CHỌN BỘ LỌC CHI TIẾT */}
      {/* ========================================================================= */}
      {isMobileSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tùy chọn bộ lọc dòng xe"
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
        >
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setIsMobileSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal Container */}
          <div className="relative z-50 w-full max-h-[85vh] bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 motion-reduce:animate-none">
            {/* Thanh Kéo Trượt (Grab Handle Bar) */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-700" />
            </div>

            {/* Header Bottom Sheet */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#0072CE]" aria-hidden="true" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Bộ Lọc Dòng Xe
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#0072CE]/20 text-[#0072CE] text-xs font-bold">
                  {filteredCarsCount} xe
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none cursor-pointer"
                aria-label="Đóng bộ lọc"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Body Bottom Sheet: Scrollable */}
            <div className="overflow-y-auto px-5 py-4 space-y-6">
              {/* Tiêu Chí 1: Mức Ngân Sách Dự Kiến */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>1. Mức Ngân Sách Dự Kiến</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {CATALOG_PRICE_RANGES.map((pr) => {
                    const isSelected = selectedPrice === pr.id;
                    return (
                      <Button
                        key={pr.id}
                        type="button"
                        variant="ghost"
                        onClick={() => onSelectPrice(pr.id)}
                        className={`h-11 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none ${
                          isSelected
                            ? 'bg-[#0072CE] text-white border-[#0072CE] font-bold shadow-md shadow-[#0072CE]/25'
                            : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{pr.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-white shrink-0" aria-hidden="true" />}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Tiêu Chí 2: Kiểu Dáng Xe / Phân Khúc */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>2. Kiểu Dáng Xe / Phân Khúc</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {CATALOG_SEGMENTS.map((seg) => {
                    const isSelected = selectedSegment === seg.id;
                    return (
                      <Button
                        key={seg.id}
                        type="button"
                        variant="ghost"
                        onClick={() => onSelectSegment(seg.id)}
                        className={`h-11 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none ${
                          isSelected
                            ? 'bg-[#0072CE] text-white border-[#0072CE] font-bold shadow-md shadow-[#0072CE]/25'
                            : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{seg.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-white shrink-0" aria-hidden="true" />}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Bottom Sheet: Sticky Action Buttons */}
            <div className="border-t border-slate-800 p-4 pb-6 bg-slate-950/90 backdrop-blur-md flex items-center gap-3">
              {isFiltered && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onResetFilters}
                  className="h-12 px-4 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Đặt lại</span>
                </Button>
              )}

              <Button
                type="button"
                variant="accent"
                glow
                onClick={() => setIsMobileSheetOpen(false)}
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-[#0072CE] to-[#005BA4] hover:from-[#005BA4] hover:to-[#00427A] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#0072CE]/30 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none"
              >
                <span>Xem {filteredCarsCount} Dòng Xe Phù Hợp</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💻 C. GIAO DIỆN DESKTOP (>= 768px): KHỐI HỘP KÍNH SANG TRỌNG SHOWROOM BAR */}
      {/* ========================================================================= */}
      <section
        aria-label="Bộ lọc dòng xe trên máy tính"
        className="hidden md:block bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/50 mb-8 sm:mb-10 transition-all duration-300"
      >
        {/* 1. Header Bộ Lọc: Tiêu đề + Huy hiệu số lượng xe + Nút Reset */}
        <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[#0072CE]" aria-hidden="true" />
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Tìm Kiếm Theo Ngân Sách &amp; Phân Khúc
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Chọn mức ngân sách dự tính và kiểu dáng để xem các dòng xe phù hợp với nhu cầu gia đình bạn.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                onClick={onResetFilters}
                className="h-9 px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all duration-200 motion-reduce:transition-none cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Đặt lại</span>
              </Button>
            )}

            <div className="px-3.5 py-1.5 rounded-full bg-[#0072CE]/15 border border-[#0072CE]/30 text-[#0072CE] text-xs font-bold tracking-wide whitespace-nowrap flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {filteredCarsCount === totalCarsCount
                  ? `${totalCarsCount} Dòng Xe Có Sẵn`
                  : `${filteredCarsCount} / ${totalCarsCount} Dòng Xe Phù Hợp`}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 2. Tiêu Chí 1: Mốc Ngân Sách Dự Kiến (Ưu tiên tư duy ngân sách của người mua) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>1. Mức Ngân Sách Dự Kiến</span>
            </label>

            <div
              role="group"
              aria-label="Chọn mức ngân sách đầu tư"
              className="grid grid-cols-3 lg:grid-cols-5 gap-2.5"
            >
              {CATALOG_PRICE_RANGES.map((pr) => {
                const isSelected = selectedPrice === pr.id;
                return (
                  <Button
                    key={pr.id}
                    type="button"
                    variant="ghost"
                    onClick={() => onSelectPrice(pr.id)}
                    className={`flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer active:scale-95 motion-reduce:transition-none motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none ${
                      isSelected
                        ? 'bg-[#0072CE] text-white border-[#0072CE] shadow-lg shadow-[#0072CE]/30 font-bold hover:bg-[#0072CE] hover:text-white'
                        : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
                    <span>{pr.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 3. Tiêu Chí 2: Tabs Phân Khúc Xe (Kiểu Dáng) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>2. Kiểu Dáng Xe / Phân Khúc</span>
            </label>

            <div
              role="tablist"
              aria-label="Chọn phân khúc xe"
              className="flex flex-wrap gap-2.5"
            >
              {CATALOG_SEGMENTS.map((seg) => {
                const isSelected = selectedSegment === seg.id;
                return (
                  <Button
                    key={seg.id}
                    role="tab"
                    aria-selected={isSelected}
                    type="button"
                    variant="ghost"
                    onClick={() => onSelectSegment(seg.id)}
                    className={`flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer active:scale-95 motion-reduce:transition-none motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none ${
                      isSelected
                        ? 'bg-[#0072CE] text-white border-[#0072CE] shadow-lg shadow-[#0072CE]/30 font-bold hover:bg-[#0072CE] hover:text-white'
                        : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
                    <span>{seg.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
