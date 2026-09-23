'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PriceRangeItem, BodyStyleItem } from '@cardealer/types';

export interface FilterableCar {
  id: string;
  tenXe: string;
  slug: string;
  anhDaiDienUrl?: string;
  segment?: string;
  fuelType?: string | null;
  seatRange?: string;
  traTruocTu?: number | null;
  promotionSummary?: string | null;
  minPrice?: number;
  maxPrice?: number;
  versions?: Array<{
    id?: string;
    tenPhienBan?: string;
    giaNiemYet?: number;
    giaKhuyenMai?: number | null;
  }>;
  isFeatured?: boolean;
}

export interface HomeFilterContextValue {
  selectedPrice: string;
  selectedSegment: string;
  setPrice: (id: string) => void;
  setSegment: (segment: string) => void;
  resetFilters: () => void;
  isFiltered: boolean;
  isFiltering: boolean;
  matchingCount: number;
  totalCount: number;
  displayCars: FilterableCar[];
}

const HomeFilterContext = createContext<HomeFilterContextValue | null>(null);

export interface HomeFilterProviderProps {
  children: React.ReactNode;
  allCars?: FilterableCar[];
  defaultFeaturedCars?: FilterableCar[];
  priceRanges?: PriceRangeItem[];
  bodyStyles?: BodyStyleItem[];
}

export const HomeFilterProvider: React.FC<HomeFilterProviderProps> = ({
  children,
  allCars = [],
  defaultFeaturedCars = [],
  priceRanges = [],
  bodyStyles = [],
}) => {
  const searchParams = useSearchParams();

  // Đọc giá trị khởi tạo từ URL
  const initialPrice = searchParams?.get('price') || 'all';
  const initialSegment = searchParams?.get('segment') || 'all';

  const [selectedPrice, setSelectedPrice] = useState<string>(initialPrice);
  const [selectedSegment, setSelectedSegment] = useState<string>(initialSegment);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const filterTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Đồng bộ ngầm URL search params khi bộ lọc thay đổi
  const syncUrl = useCallback((price: string, segment: string) => {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      if (price !== 'all') {
        params.set('price', price);
      } else {
        params.delete('price');
      }

      if (segment !== 'all') {
        params.set('segment', segment);
      } else {
        params.delete('segment');
      }

      const qs = params.toString();
      const newUrl = qs ? `/?${qs}` : '/';
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    } catch {
      // Ignored
    }
  }, []);

  const triggerFilterTransition = useCallback(() => {
    setIsFiltering(true);
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => {
      setIsFiltering(false);
    }, 180);
  }, []);

  const handleSetPrice = useCallback(
    (id: string) => {
      setSelectedPrice(id);
      syncUrl(id, selectedSegment);
      triggerFilterTransition();
    },
    [selectedSegment, syncUrl, triggerFilterTransition]
  );

  const handleSetSegment = useCallback(
    (segment: string) => {
      setSelectedSegment(segment);
      syncUrl(selectedPrice, segment);
      triggerFilterTransition();
    },
    [selectedPrice, syncUrl, triggerFilterTransition]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedPrice('all');
    setSelectedSegment('all');
    syncUrl('all', 'all');
    triggerFilterTransition();
  }, [syncUrl, triggerFilterTransition]);

  // Thuật toán lọc in-memory tức thì (< 5ms)
  const isFiltered = selectedPrice !== 'all' || selectedSegment !== 'all';

  // Tập dữ liệu dùng để lọc: Ưu tiên allCars nếu có, nếu không dùng defaultFeaturedCars
  const sourceCars = allCars.length > 0 ? allCars : defaultFeaturedCars;

  const filteredCars = useMemo(() => {
    if (!isFiltered) {
      return defaultFeaturedCars.length > 0 ? defaultFeaturedCars : sourceCars;
    }

    return sourceCars.filter((car) => {
      // 1. Phân khúc (Segment / Kiểu dáng)
      if (selectedSegment !== 'all') {
        const carSeg = (car.segment || '').toLowerCase().trim();
        const targetSeg = selectedSegment.toLowerCase().trim();
        if (carSeg !== targetSeg) {
          return false;
        }
      }

      // 2. Mức ngân sách (Price Range)
      if (selectedPrice !== 'all') {
        const range = priceRanges.find((r) => r.id === selectedPrice);
        if (range) {
          // Tính giá xe nhỏ nhất và lớn nhất
          const minP =
            car.versions && car.versions.length > 0
              ? Math.min(...car.versions.map((v) => Number(v.giaKhuyenMai || v.giaNiemYet || 0)))
              : car.minPrice || 0;
          const maxP =
            car.versions && car.versions.length > 0
              ? Math.max(...car.versions.map((v) => Number(v.giaNiemYet || 0)))
              : car.maxPrice || minP;

          // Điều kiện giao nhau giữa khoảng giá xe và mốc lọc
          if (range.min !== null && range.min !== undefined && maxP < range.min) {
            return false;
          }
          if (range.max !== null && range.max !== undefined && minP > range.max) {
            return false;
          }
        }
      }

      return true;
    });
  }, [isFiltered, defaultFeaturedCars, sourceCars, selectedPrice, selectedSegment, priceRanges]);

  const matchingCount = filteredCars.length;
  const totalCount = sourceCars.length;

  const value: HomeFilterContextValue = {
    selectedPrice,
    selectedSegment,
    setPrice: handleSetPrice,
    setSegment: handleSetSegment,
    resetFilters: handleResetFilters,
    isFiltered,
    isFiltering,
    matchingCount,
    totalCount,
    displayCars: filteredCars,
  };

  return <HomeFilterContext.Provider value={value}>{children}</HomeFilterContext.Provider>;
};

export const useHomeFilter = (): HomeFilterContextValue | null => {
  return useContext(HomeFilterContext);
};
