'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { CarCatalogItem } from '@cardealer/types';
import { useCatalogFilters } from './useCatalogFilters';
import { CatalogFilterBar } from './CatalogFilterBar';
import { CatalogGrid } from './CatalogGrid';

export interface CatalogViewProps {
  initialCars: CarCatalogItem[];
  contactHotline?: string;
  errorMessage?: string;
}

export interface CatalogErrorStateProps {
  message?: string;
  onRetry?: () => void;
  contactHotline?: string;
}

// 🧠 Mental Model: Trạng thái Error State khi API/mạng gặp sự cố.
// Cung cấp thông báo thân thiện, nút bấm thử lại (Retry) và kết nối nhanh hotline tư vấn.
export const CatalogErrorState: React.FC<CatalogErrorStateProps> = ({
  message = 'Không thể kết nối đến máy chủ để tải danh mục xe. Quý khách vui lòng thử lại hoặc liên hệ hotline.',
  onRetry,
  contactHotline,
}) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-rose-200/80 bg-rose-50/30 my-6 space-y-4"
    >
      <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center ring-8 ring-rose-100/40">
        <AlertTriangle className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
        Không Thể Nạp Dữ Liệu Dòng Xe
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md">
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onRetry && (
          <Button
            type="button"
            onClick={onRetry}
            className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Thử Lại Ngay</span>
          </Button>
        )}
        {contactHotline && (
          <a
            href={`tel:${contactHotline.replace(/\s+/g, '')}`}
            className="h-11 px-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-95 motion-reduce:transition-none motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
          >
            Hotline: {contactHotline}
          </a>
        )}
      </div>
    </div>
  );
};

// 🧠 Mental Model: Client Island trung tâm điều phối toàn bộ trang danh mục /xe.
// 1. Kết nối hook useCatalogFilters (in-memory filtering < 5ms + bidirectional URL state sync).
// 2. Phối hợp nhịp nhàng giữa thanh bộ lọc CatalogFilterBar và lưới hiển thị CatalogGrid.
// 3. Đảm bảo toàn bộ trải nghiệm lọc, cuộn và phục hồi diễn ra mượt mà trong Client Island mà không gián đoạn Server Shell.
export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCars,
  contactHotline,
  errorMessage,
}) => {
  const {
    selectedSegment,
    selectedPrice,
    filteredCars,
    setSegment,
    setPrice,
    resetFilters,
    isFiltered,
    totalCount,
    filteredCount,
  } = useCatalogFilters(initialCars);

  if (errorMessage) {
    return (
      <CatalogErrorState
        message={errorMessage}
        onRetry={() => window.location.reload()}
        contactHotline={contactHotline}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Bộ Lọc Đa Chiều (Segment Tabs + Price Range Pills) */}
      <CatalogFilterBar
        selectedSegment={selectedSegment}
        selectedPrice={selectedPrice}
        totalCarsCount={totalCount}
        filteredCarsCount={filteredCount}
        isFiltered={isFiltered}
        onSelectSegment={setSegment}
        onSelectPrice={setPrice}
        onResetFilters={resetFilters}
      />

      {/* 2. Lưới Xe Hoặc Empty State */}
      <CatalogGrid
        cars={filteredCars}
        onResetFilters={resetFilters}
        contactHotline={contactHotline}
      />
    </div>
  );
};
