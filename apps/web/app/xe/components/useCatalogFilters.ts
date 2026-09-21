'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CarCatalogItem, CatalogSegment, PriceRangeId } from '@cardealer/types';
import { CATALOG_PRICE_RANGES } from '@cardealer/types';

export interface UseCatalogFiltersReturn {
  selectedSegment: CatalogSegment;
  selectedPrice: PriceRangeId;
  filteredCars: CarCatalogItem[];
  setSegment: (segment: CatalogSegment) => void;
  setPrice: (price: PriceRangeId) => void;
  resetFilters: () => void;
  isFiltered: boolean;
  totalCount: number;
  filteredCount: number;
}

const VALID_SEGMENTS: CatalogSegment[] = ['all', 'sedan', 'suv', 'mpv', 'hatchback', 'ev'];
const VALID_PRICES: PriceRangeId[] = ['all', 'under-500', '500-700', '700-1000', 'over-1000'];

// 🧠 Mental Model: Hook quản lý bộ lọc danh mục xe đa chiều in-memory và đồng bộ URL ngầm.
// 1. Phản hồi lọc chớp mắt (< 5ms) do chạy thuật toán lọc mảng Javascript trên tập dữ liệu đã nạp sẵn từ Server.
// 2. Đồng bộ 2 chiều với URL query params (đọc khi mount, ghi ngầm qua history.replaceState khi click).
// 3. Tương thích ngược: tự động ánh xạ param 'kieuDang' từ menu Header cũ sang 'segment'.
export function useCatalogFilters(initialCars: CarCatalogItem[]): UseCatalogFiltersReturn {
  const searchParams = useSearchParams();

  // 1. Đọc và chuẩn hóa tham số URL ban đầu (chống XSS / Invalid query - Phòng vệ R4)
  const getInitialSegment = useCallback((): CatalogSegment => {
    const raw = (searchParams.get('segment') || searchParams.get('kieuDang') || 'all').toLowerCase();
    return VALID_SEGMENTS.includes(raw as CatalogSegment) ? (raw as CatalogSegment) : 'all';
  }, [searchParams]);

  const getInitialPrice = useCallback((): PriceRangeId => {
    const raw = (searchParams.get('price') || 'all').toLowerCase();
    return VALID_PRICES.includes(raw as PriceRangeId) ? (raw as PriceRangeId) : 'all';
  }, [searchParams]);

  const [selectedSegment, setSelectedSegment] = useState<CatalogSegment>(getInitialSegment);
  const [selectedPrice, setSelectedPrice] = useState<PriceRangeId>(getInitialPrice);

  // Lắng nghe thay đổi searchParams khi người dùng bấm Back/Forward trên trình duyệt
  useEffect(() => {
    setSelectedSegment(getInitialSegment());
    setSelectedPrice(getInitialPrice());
  }, [getInitialSegment, getInitialPrice]);

  // 2. Hàm đồng bộ URL ngầm không giật trang, giữ nguyên vị trí cuộn
  const syncUrl = useCallback((seg: CatalogSegment, prc: PriceRangeId) => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (seg !== 'all') params.set('segment', seg);
    if (prc !== 'all') params.set('price', prc);

    const queryString = params.toString();
    const newUrl = queryString ? `/xe?${queryString}` : '/xe';
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, []);

  const handleSelectSegment = useCallback(
    (seg: CatalogSegment) => {
      setSelectedSegment(seg);
      syncUrl(seg, selectedPrice);
    },
    [selectedPrice, syncUrl]
  );

  const handleSelectPrice = useCallback(
    (prc: PriceRangeId) => {
      setSelectedPrice(prc);
      syncUrl(selectedSegment, prc);
    },
    [selectedSegment, syncUrl]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedSegment('all');
    setSelectedPrice('all');
    syncUrl('all', 'all');
  }, [syncUrl]);

  // 3. Thuật toán lọc in-memory tức thì (< 5ms)
  const filteredCars = useMemo(() => {
    return initialCars.filter((car) => {
      // Tiêu chí 1: Phân khúc xe
      if (selectedSegment !== 'all' && car.segment !== selectedSegment) {
        return false;
      }

      // Tiêu chí 2: Mức giá đầu tư
      if (selectedPrice !== 'all') {
        const range = CATALOG_PRICE_RANGES.find((r) => r.id === selectedPrice);
        if (range) {
          // Xe thỏa mãn nếu khoảng giá của xe giao nhau với khoảng ngân sách tìm kiếm
          const isIntersecting = car.minPrice <= range.maxPrice && car.maxPrice >= range.minPrice;
          if (!isIntersecting) return false;
        }
      }

      return true;
    });
  }, [initialCars, selectedSegment, selectedPrice]);

  return {
    selectedSegment,
    selectedPrice,
    filteredCars,
    setSegment: handleSelectSegment,
    setPrice: handleSelectPrice,
    resetFilters: handleResetFilters,
    isFiltered: selectedSegment !== 'all' || selectedPrice !== 'all',
    totalCount: initialCars.length,
    filteredCount: filteredCars.length,
  };
}
