'use client';

import React from 'react';
import type { CarCatalogItem } from '@cardealer/types';
import { SmartCarCard, SmartCarCardSkeleton } from './SmartCarCard';
import { CatalogEmptyState } from './CatalogEmptyState';

export interface CatalogGridProps {
  cars: CarCatalogItem[];
  isLoading?: boolean;
  onResetFilters: () => void;
  contactHotline?: string;
}

// 🧠 Mental Model: Skeleton layout lưới 6 xe đồng bộ tỷ lệ showroom 16:10.
// Ngăn giật layout (CLS), tạo cảm giác tải mượt mà trong giai đoạn khởi tạo / lọc dữ liệu.
export const CatalogGridSkeleton: React.FC = () => {
  return (
    <div
      aria-label="Đang nạp danh sách dòng xe"
      aria-busy="true"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <SmartCarCardSkeleton key={index} />
      ))}
    </div>
  );
};

// 🧠 Mental Model: Lưới hiển thị danh sách dòng xe CatalogGrid.
// 1. Phân phối Layout Grid responsive: 1 cột (Mobile), 2 cột (Tablet), 3 cột (Desktop lớn).
// 2. Chuyển đổi trạng thái mượt mà giữa Loading State, Data State (danh sách xe) và Empty State (0 xe phù hợp).
// 3. Tuân thủ 100% Named Export và nguyên tắc kiến trúc Component-Driven.
export const CatalogGrid: React.FC<CatalogGridProps> = ({
  cars,
  isLoading = false,
  onResetFilters,
  contactHotline,
}) => {
  if (isLoading) {
    return <CatalogGridSkeleton />;
  }

  if (cars.length === 0) {
    return <CatalogEmptyState onReset={onResetFilters} contactHotline={contactHotline} />;
  }

  return (
    <div
      aria-label="Danh sách các dòng xe phù hợp"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
    >
      {cars.map((car) => (
        <SmartCarCard key={car.id} car={car} />
      ))}
    </div>
  );
};
