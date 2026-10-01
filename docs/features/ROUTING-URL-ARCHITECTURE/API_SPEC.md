# 📋 Đặc Tả Giao Ước & Giao Diện Kỹ Thuật (API & Component Specification)

> **Feature:** Cấu Trúc Routing Tĩnh & Kiến Trúc Menu (URL Architecture) — `ROUTING-URL-ARCHITECTURE`  
> **Skill Phụ Trách:** `@feature-spec-generator`  
> **Căn cứ:** [FLOW.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/FLOW.md), [SCHEMA.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/SCHEMA.md)

---

## 1. Next.js App Router Dynamic Page Interface

### 1.1. Tọa độ Component
* **Đường dẫn:** `apps/web/app/dong-xe/[slug]/page.tsx`
* **Loại Component:** Server Component (RSC)
* **Chiến lược Cache & ISR:**
  ```typescript
  export const revalidate = 60; // Next.js ISR: Tái xác thực ngầm sau 60 giây
  ```

### 1.2. Server Component Props (Next.js 15 Async Params)
```typescript
export interface SegmentPageProps {
  params: Promise<{
    slug: string;
  }>;
}
```

### 1.3. Khởi tạo Static Params (SSG Prerendering)
```typescript
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [
    { slug: 'sedan' },
    { slug: 'suv' },
    { slug: 'mpv' },
  ];
}
```

---

## 2. Đặc Tả Metadata Chuẩn SEO (Generate Metadata Contract)

```typescript
export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata>
```

### 2.1. Cấu trúc Metadata Output
| Thuộc tính | Giá trị động cho `/dong-xe/sedan` | Giá trị động cho `/dong-xe/suv` | Giá trị động cho `/dong-xe/mpv` |
| :--- | :--- | :--- | :--- |
| `title` | Các Dòng Xe Sedan Hyundai Mới Nhất 2026 \| [Tên Showroom] | Các Dòng Xe SUV & Crossover Hyundai Gầm Cao 2026 \| [Tên Showroom] | Các Dòng Xe MPV Đa Dụng Hyundai 7 Chỗ 2026 \| [Tên Showroom] |
| `description` | Khám phá các dòng xe Sedan Hyundai Accent, Elantra chính hãng. Báo giá lăn bánh, ưu đãi trả góp 85%, giao xe ngay. | Bảng giá và thông số các dòng SUV Hyundai Creta, Tucson, Santa Fe, Venue gầm cao mạnh mẽ. Lái thử tận nhà, ưu đãi lớn. | Khám phá dòng xe MPV gia đình và kinh doanh Hyundai Custin, Stargazer X 7 chỗ tiện nghi bậc nhất. Giá tốt, giao ngay. |
| `alternates.canonical` | `/dong-xe/sedan` | `/dong-xe/suv` | `/dong-xe/mpv` |
| `openGraph.type` | `website` | `website` | `website` |
| `openGraph.url` | `/dong-xe/sedan` | `/dong-xe/suv` | `/dong-xe/mpv` |
| `openGraph.images` | `['/images/og-sedan.webp']` | `['/images/og-suv.webp']` | `['/images/og-mpv.webp']` |

---

## 3. Dữ Liệu Có Cấu Trúc Google Search (JSON-LD Schema Specification)

### 3.1. Schema 1: `BreadcrumbList` (Định hướng phân cấp đường dẫn)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chủ",
      "item": "https://hyundai-nghean.vn"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Dòng xe",
      "item": "https://hyundai-nghean.vn/xe"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Dòng xe SUV",
      "item": "https://hyundai-nghean.vn/dong-xe/suv"
    }
  ]
}
```

### 3.2. Schema 2: `ItemList` (Danh mục sản phẩm xe trong phân khúc)
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Danh mục dòng xe SUV Hyundai chính hãng",
  "description": "Bảng giá và thông số kỹ thuật các mẫu xe SUV Hyundai",
  "numberOfItems": 3,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://hyundai-nghean.vn/xe/hyundai-creta",
      "name": "Hyundai Creta"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "url": "https://hyundai-nghean.vn/xe/hyundai-tucson",
      "name": "Hyundai Tucson"
    }
  ]
}
```

---

## 4. Đặc Tả Dữ Liệu Tĩnh Phân Khúc (Segment Registry Contract)

```typescript
export interface SegmentInfo {
  slug: string;
  name: string;
  matchedSegments: string[];
  h1Title: string;
  badgeLabel: string;
  seoDescription: string;
  ogImage: string;
}

export const SEGMENT_REGISTRY: Record<string, SegmentInfo> = {
  sedan: {
    slug: 'sedan',
    name: 'Sedan',
    matchedSegments: ['Sedan', 'sedan'],
    h1Title: 'Các Dòng Xe Sedan Hyundai Chính Hãng & Bảng Giá Mới Nhất',
    badgeLabel: 'Phân Khúc Sedan',
    seoDescription: 'Dòng xe Sedan Hyundai luôn là lựa chọn hàng đầu cho khách hàng cá nhân và gia đình trẻ nhờ thiết kế Sensuous Sportiness thể thao thời thượng, khả năng tiết kiệm nhiên liệu vượt trội và không gian nội thất tiện nghi. Nổi bật với các mẫu xe ăn khách như Hyundai Accent và Hyundai Elantra thế hệ mới, phân khúc Sedan đáp ứng hoàn hảo nhu cầu di chuyển đô thị linh hoạt cũng như những chuyến hành trình dài. Showroom hỗ trợ lái thử tận nơi, trả góp lên đến 85% và ưu đãi giá lăn bánh tốt nhất khu vực.',
    ogImage: '/images/og-sedan.webp',
  },
  suv: {
    slug: 'suv',
    name: 'SUV / Crossover',
    matchedSegments: ['SUV', 'suv', 'Crossover', 'crossover'],
    h1Title: 'Các Dòng Xe SUV & Crossover Hyundai Gầm Cao Đa Dụng',
    badgeLabel: 'Phân Khúc SUV & Crossover',
    seoDescription: 'Phân khúc SUV Hyundai gầm cao khẳng định vị thế dẫn đầu với dải sản phẩm toàn diện từ đô thị cỡ B đến cỡ D cao cấp: Hyundai Venue cá tính, Hyundai Creta năng động, Hyundai Tucson lịch lãm và Hyundai Santa Fe sang trọng. Trang bị gói an toàn chủ động Hyundai SmartSense độc quyền, dẫn động 4 bánh toàn thời gian HTRAC và động cơ Smartstream mạnh mẽ, các dòng xe SUV Hyundai sẵn sàng chinh phục mọi địa hình và bảo vệ tối đa cho cả gia đình.',
    ogImage: '/images/og-suv.webp',
  },
  mpv: {
    slug: 'mpv',
    name: 'MPV Đa Dụng',
    matchedSegments: ['MPV', 'mpv'],
    h1Title: 'Các Dòng Xe MPV Đa Dụng Hyundai Cho Doanh Nghiệp & Gia Đình',
    badgeLabel: 'Phân Khúc MPV 7 Chỗ',
    seoDescription: 'Dòng xe đa dụng MPV Hyundai (Hyundai Stargazer X và Hyundai Custin) định nghĩa lại tiêu chuẩn di chuyển cho gia đình đông thành viên và doanh nghiệp dịch vụ cao cấp. Thiết kế phi thuyền tương lai, cửa trượt tự động thông minh, hàng ghế cơ trưởng thương gia cùng không gian 7 chỗ ngồi rộng rãi đem lại sự thư thái tối đa trên mọi chặng đường. Động cơ bền bỉ, chi phí bảo dưỡng tối ưu và chính sách bảo hành chính hãng 5 năm là điểm tựa vững chắc cho mọi chủ xe.',
    ogImage: '/images/og-mpv.webp',
  },
};
```
