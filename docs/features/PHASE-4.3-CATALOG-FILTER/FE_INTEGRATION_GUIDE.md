# 🛠️ Frontend Integration Guide: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (`/xe`)

## 1. Cây Thư Mục File Thành Phần (Component Architecture)

```
apps/web/app/xe/
├── page.tsx                           # Server Component (RSC): Fetch data, Metadata, JSON-LD
└── components/
    ├── CatalogView.tsx                # Client Island chính: Giữ filter state, kết nối FilterBar + Grid
    ├── CatalogFilterBar.tsx           # Client Component: Tabs phân khúc xe & Mốc giá bấm nhanh
    ├── CatalogGrid.tsx                # Client Component: Render danh sách SmartCarCard hoặc EmptyState
    ├── SmartCarCard.tsx               # Client Component: Thẻ xe showroom, specs pills, giá & 2 nút CTA
    ├── CatalogEmptyState.tsx          # Client Component: Giao diện khi 0 xe thỏa mãn bộ lọc
    └── useCatalogFilters.ts           # Custom Hook: Xử lý lọc in-memory & sync URL qua window.history
```

---

## 2. Quy Chuẩn Named Export & Interface Chi Tiết

Tuân thủ 100% nguyên tắc **Named Export Only** (không dùng `export default` cho components).

### 2.1. Component `CatalogFilterBar`
```typescript
import type { CatalogSegment, PriceRangeId } from '@cardealer/types';

export interface CatalogFilterBarProps {
  selectedSegment: CatalogSegment;
  selectedPrice: PriceRangeId;
  totalCarsCount: number;
  filteredCarsCount: number;
  onSelectSegment: (segment: CatalogSegment) => void;
  onSelectPrice: (price: PriceRangeId) => void;
  onResetFilters: () => void;
}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({ ... }) => { ... };
```

### 2.2. Component `SmartCarCard`
```typescript
import type { CarCatalogItem } from '@cardealer/types';

export interface SmartCarCardProps {
  car: CarCatalogItem;
}

export const SmartCarCard: React.FC<SmartCarCardProps> = ({ car }) => { ... };
```

### 2.3. Component `CatalogGrid`
```typescript
export interface CatalogGridProps {
  cars: CarCatalogItem[];
  onResetFilters: () => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({ cars, onResetFilters }) => { ... };
```

### 2.4. Component `CatalogEmptyState`
```typescript
export interface CatalogEmptyStateProps {
  onReset: () => void;
}

export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({ onReset }) => { ... };
```

### 2.5. Custom Hook `useCatalogFilters`
```typescript
export interface UseCatalogFiltersReturn {
  selectedSegment: CatalogSegment;
  selectedPrice: PriceRangeId;
  filteredCars: CarCatalogItem[];
  setSegment: (segment: CatalogSegment) => void;
  setPrice: (price: PriceRangeId) => void;
  resetFilters: () => void;
  isFiltered: boolean;
}

export function useCatalogFilters(initialCars: CarCatalogItem[]): UseCatalogFiltersReturn { ... }
```

---

## 3. Bản Mẫu Triển Khai Logic Custom Hook `useCatalogFilters`

Hook đảm bảo 3 nguyên tắc sống còn:
1. **Khởi tạo đúng từ URL query params:** Nhận diện cả `segment` lẫn `kieuDang`, và `price`.
2. **Lọc in-memory siêu tốc (< 5ms):** Lọc theo phân khúc và theo mốc ngân sách.
3. **Đồng bộ ngầm URL không reload:** Sử dụng `window.history.replaceState` để giữ vị trí cuộn trang.

```typescript
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CarCatalogItem, CatalogSegment, PriceRangeId } from '@cardealer/types';
import { CATALOG_PRICE_RANGES } from '@cardealer/types';

export function useCatalogFilters(initialCars: CarCatalogItem[]) {
  const searchParams = useSearchParams();

  // 1. Đọc tham số URL ban đầu
  const initialSegment = useMemo(() => {
    const s = (searchParams.get('segment') || searchParams.get('kieuDang') || 'all').toLowerCase();
    const validSegments: CatalogSegment[] = ['all', 'sedan', 'suv', 'mpv', 'hatchback', 'ev'];
    return validSegments.includes(s as CatalogSegment) ? (s as CatalogSegment) : 'all';
  }, [searchParams]);

  const initialPrice = useMemo(() => {
    const p = (searchParams.get('price') || 'all').toLowerCase();
    const validPrices: PriceRangeId[] = ['all', 'under-500', '500-700', '700-1000', 'over-1000'];
    return validPrices.includes(p as PriceRangeId) ? (p as PriceRangeId) : 'all';
  }, [searchParams]);

  const [selectedSegment, setSelectedSegment] = useState<CatalogSegment>(initialSegment);
  const [selectedPrice, setSelectedPrice] = useState<PriceRangeId>(initialPrice);

  // 2. Đồng bộ ngầm trạng thái lên URL Query Params
  const syncUrl = useCallback((seg: CatalogSegment, prc: PriceRangeId) => {
    const params = new URLSearchParams();
    if (seg !== 'all') params.set('segment', seg);
    if (prc !== 'all') params.set('price', prc);
    const queryString = params.toString();
    const newUrl = queryString ? `/xe?${queryString}` : '/xe';
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, []);

  const handleSelectSegment = useCallback((seg: CatalogSegment) => {
    setSelectedSegment(seg);
    syncUrl(seg, selectedPrice);
  }, [selectedPrice, syncUrl]);

  const handleSelectPrice = useCallback((prc: PriceRangeId) => {
    setSelectedPrice(prc);
    syncUrl(selectedSegment, prc);
  }, [selectedSegment, syncUrl]);

  const handleResetFilters = useCallback(() => {
    setSelectedSegment('all');
    setSelectedPrice('all');
    syncUrl('all', 'all');
  }, [syncUrl]);

  // 3. Thuật toán lọc in-memory tức thì (< 5ms)
  const filteredCars = useMemo(() => {
    return initialCars.filter((car) => {
      // Lọc theo phân khúc
      if (selectedSegment !== 'all' && car.segment !== selectedSegment) {
        return false;
      }

      // Lọc theo mức giá
      if (selectedPrice !== 'all') {
        const range = CATALOG_PRICE_RANGES.find((r) => r.id === selectedPrice);
        if (range) {
          // Xe khớp nếu khoảng giá của xe giao nhau với khoảng giá lọc
          const isIntersect = car.minPrice <= range.maxPrice && car.maxPrice >= range.minPrice;
          if (!isIntersect) return false;
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
  };
}
```

---

## 4. Cấu Trúc Server Component (`app/xe/page.tsx`)

```typescript
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getCarsList } from '@/services/cars.service';
import { generateCatalogJsonLd } from '@cardealer/core';
import { CatalogView } from './components/CatalogView';

export const revalidate = 60; // Next.js ISR: 60s

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Bảng Giá Các Dòng Xe Hyundai Chính Hãng 2026 | Danh Mục Showroom',
    description: 'Khám phá đầy đủ các dòng xe Hyundai Sedan, SUV, MPV, Hatchback và Xe điện. Dự toán chi phí lăn bánh và ưu đãi trả trước mới nhất.',
    alternates: {
      canonical: '/xe',
    },
    openGraph: {
      title: 'Danh Mục Xe Hyundai Mới Nhất 2026',
      description: 'So sánh và tìm kiếm dòng xe phù hợp với nhu cầu và khả năng tài chính của bạn.',
      images: ['/images/og-catalog.jpg'],
    },
  };
}

export default async function CatalogPage() {
  const cars = await getCarsList();
  const jsonLd = generateCatalogJsonLd(cars, process.env.NEXT_PUBLIC_SITE_URL || 'https://xehyundaivinh.com');

  return (
    <main className="min-h-screen bg-slate-50 pt-6 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Danh mục dòng xe', active: true },
          ]}
        />
        <CatalogView initialCars={cars} />
      </div>
    </main>
  );
}
```
