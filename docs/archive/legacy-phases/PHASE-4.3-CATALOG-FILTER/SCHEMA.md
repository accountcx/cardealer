# 🗄️ Technical Schema Specification: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (`/xe`)

## 1. Đánh Giá Hiện Trạng Cơ Sở Dữ Liệu (Database Integrity Audit)

* **Trạng thái Cơ sở Dữ liệu:** 🟢 Không yêu cầu Database Migration (Zero-Mutation Policy).
* **Bảng Hiện Hữu Tương Tác:**
  1. `cars` (`packages/database/src/schema/cars.ts`): Đã có sẵn các trường `id`, `ten_xe`, `slug`, `anh_dai_dien_url`, `segment`, `tra_truoc_tu`, `promotion_summary`, `fuel_type`, `is_featured`, `status`, `sort_order`.
  2. `car_versions` (`packages/database/src/schema/car_versions.ts`): Đã có sẵn `gia_niem_yet`, `gia_khuyen_mai`, `seat_count`, `dong_co`, `hop_so`, `dan_dong`.
* **Kết luận:** Hệ thống cơ sở dữ liệu hiện tại đã đáp ứng 100% nhu cầu nghiệp vụ của Phase 4.3. Không phát sinh thay đổi bảng hay thêm cột mới.

---

## 2. Hợp Đồng Dữ Liệu TypeScript (TypeScript Data Contracts)

### 2.1. Phân Loại Phân Khúc & Mốc Ngân Sách
```typescript
// 1. Phân khúc dòng xe (kế thừa từ @cardealer/types)
export type CatalogSegment = 'all' | 'sedan' | 'suv' | 'mpv' | 'hatchback' | 'ev';

export interface SegmentTabOption {
  id: CatalogSegment;
  label: string;
  iconName?: string;
}

// 2. Mốc ngân sách bấm nhanh
export type PriceRangeId = 'all' | 'under-500' | '500-700' | '700-1000' | 'over-1000';

export interface PriceRangeOption {
  id: PriceRangeId;
  label: string;
  minPrice: number; // Đơn vị: VNĐ
  maxPrice: number; // Đơn vị: VNĐ (Infinity cho mốc không giới hạn)
}

export const CATALOG_PRICE_RANGES: PriceRangeOption[] = [
  { id: 'all', label: 'Tất Cả Mức Giá', minPrice: 0, maxPrice: Infinity },
  { id: 'under-500', label: 'Dưới 500 triệu', minPrice: 0, maxPrice: 500_000_000 },
  { id: '500-700', label: '500 - 700 triệu', minPrice: 500_000_000, maxPrice: 700_000_000 },
  { id: '700-1000', label: '700 triệu - 1 tỷ', minPrice: 700_000_000, maxPrice: 1_000_000_000 },
  { id: 'over-1000', label: 'Trên 1 tỷ', minPrice: 1_000_000_000, maxPrice: Infinity },
];
```

### 2.2. Interface Thẻ Xe Catalog (`CarCatalogItem`)
```typescript
export interface CarCatalogItem {
  id: string;
  tenXe: string;
  slug: string;
  anhDaiDienUrl: string;
  segment: 'sedan' | 'suv' | 'mpv' | 'hatchback' | 'ev';
  traTruocTu: number | null;
  promotionSummary: string | null;
  fuelType?: string | null; // Xăng, Dầu, Hybrid, Điện
  seatRange: string; // Ví dụ: "5 chỗ", "7 chỗ", "5 - 7 chỗ"
  minPrice: number; // Giá thấp nhất trong các phiên bản
  maxPrice: number; // Giá cao nhất trong các phiên bản
  versionCount: number; // Tổng số phiên bản đang bán
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
}
```

### 2.3. State Matrix của Bộ Lọc (`CatalogFilterState`)
```typescript
export interface CatalogFilterState {
  segment: CatalogSegment;
  price: PriceRangeId;
  searchQuery?: string;
}
```

---

## 3. Cấu Trúc JSON-LD Schema (Google Structured Data Contract)

Tuân thủ tiêu chuẩn Google Search Central và Merchant Center cho trang danh mục sản phẩm (`ItemList` + `AggregateOffer`):

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Bảng Giá Các Dòng Xe Hyundai Chính Hãng 2026",
  "description": "Danh sách các dòng xe Hyundai Sedan, SUV, MPV, Hatchback và Xe điện kèm giá niêm yết và dự toán lăn bánh mới nhất.",
  "numberOfItems": 8,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": ["Product", "Car"],
        "name": "Hyundai Tucson",
        "image": "https://domain.com/images/cars/tucson.webp",
        "description": "Dòng xe SUV cỡ C đẳng cấp công nghệ",
        "brand": {
          "@type": "Brand",
          "name": "Hyundai"
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "VND",
          "lowPrice": 769000000,
          "highPrice": 919000000,
          "offerCount": 4,
          "url": "https://domain.com/xe/tucson",
          "availability": "https://schema.org/InStock"
        }
      }
    }
  ]
}
```
