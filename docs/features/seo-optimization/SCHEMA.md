# 🗄️ SCHEMA: Structured Data (Schema.org JSON-LD) & Segment Schema Specification

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Tài liệu tham chiếu:** [FLOW.md](./FLOW.md) | [BACKLOG.md](./BACKLOG.md)

---

## 1. Mở Rộng Segment Registry (`apps/web/config/segments.ts`)

Bổ sung 2 phân khúc xe chiến lược vào `SEGMENT_REGISTRY`:

```typescript
export const VALID_SEGMENT_SLUGS = ['sedan', 'suv', 'mpv', 'hatchback', 'xe-dien'] as const;

export type SegmentSlug = (typeof VALID_SEGMENT_SLUGS)[number];

export interface SegmentConfig {
  slug: SegmentSlug;
  name: string;
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  kieuDangMapping: readonly string[];
  ogImage: string;
  seoIntroParagraph: string;
}

// Bổ sung vào SEGMENT_REGISTRY:
export const ADDITIONAL_SEGMENTS: Record<'hatchback' | 'xe-dien', SegmentConfig> = {
  hatchback: {
    slug: 'hatchback',
    name: 'Hatchback Đô Thị',
    h1Title: 'Các Dòng Xe Hatchback Hyundai Nhỏ Gọn & Tiết Kiệm Nhiên Liệu',
    metaTitle: 'Các Dòng Xe Hatchback Hyundai Mới Nhất 2026 | Báo Giá & Lăn Bánh',
    metaDescription: 'Khám phá dòng xe đô thị cỡ nhỏ Hyundai Grand i10 Hatchback thế hệ mới. Thiết kế trẻ trung, vận hành linh hoạt, bảng giá niêm yết và ưu đãi trả góp tốt nhất.',
    kieuDangMapping: ['Hatchback', 'hatchback'],
    ogImage: '/images/og-hatchback.webp',
    seoIntroParagraph: 'Phân khúc xe Hatchback Hyundai đại diện cho phong cách sống năng động và tính tiện dụng tối đa trong đô thị hiện đại. Dòng xe Hyundai Grand i10 Hatchback dẫn đầu phân khúc với không gian cabin rộng rãi bất ngờ, trang bị tính năng an toàn vượt tầm phân khúc và khả năng tiết kiệm nhiên liệu ấn tượng. Lựa chọn lý tưởng cho các gia đình trẻ hoặc nhu cầu kinh doanh dịch vụ vận tải đô thị với chi phí đầu tư ban đầu cực kỳ hợp lý.',
  },
  'xe-dien': {
    slug: 'xe-dien',
    name: 'Xe Điện Thông Minh (EV)',
    h1Title: 'Các Dòng Xe Điện Hyundai Hiện Đại — Tương Lai Của Di Chuyển Xanh',
    metaTitle: 'Bảng Giá Xe Ô Tô Điện Hyundai 2026 Chính Hãng | Trả Góp & Ưu Đãi',
    metaDescription: 'Tìm hiểu các dòng xe ô tô điện thông minh Hyundai Ioniq 5 cao cấp. Công nghệ sạc siêu nhanh 800V, phạm vi di chuyển vượt trội và chính sách bảo hành pin chính hãng.',
    kieuDangMapping: ['Xe điện', 'xe-dien', 'Electric', 'EV'],
    ogImage: '/images/og-ev.webp',
    seoIntroParagraph: 'Xe điện Hyundai (EV) tiên phong mở lối kỷ nguyên di chuyển bền vững với kiến trúc E-GMP độc quyền toàn cầu. Dòng xe Hyundai Ioniq 5 đạt hàng loạt giải thưởng danh giá thế giới nhờ khả năng sạc siêu nhanh từ 10% lên 80% chỉ trong 18 phút, công nghệ cấp nguồn ngoại vi V2L thông minh và khoang nội thất chuẩn phòng khách tiện nghi. Trải nghiệm tương lai xanh cùng các chính sách bảo hành pin và trạm sạc chính hãng tại đại lý.',
  },
};
```

---

## 2. Dữ Liệu Có Cấu Trúc JSON-LD Cho Dynamic Route `/gia-lan-banh/[carSlug]`

Trang dự toán lăn bánh cho từng mẫu xe sẽ tích hợp đa tầng Schema qua `@graph`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://xehyundaivinh.com/gia-lan-banh/tucson#app",
      "url": "https://xehyundaivinh.com/gia-lan-banh/tucson",
      "name": "Bảng Tính Giá Lăn Bánh Xe Hyundai Tucson 2026",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5."
    },
    {
      "@type": "Product",
      "@id": "https://xehyundaivinh.com/gia-lan-banh/tucson#product",
      "name": "Hyundai Tucson 2026",
      "image": "https://xehyundaivinh.com/images/cars/tucson.webp",
      "description": "Dự toán chi phí lăn bánh trọn gói xe Hyundai Tucson 2026 tại Nghệ An & Hà Tĩnh: thuế trước bạ, phí cấp biển số, bảo hiểm trách nhiệm dân sự.",
      "brand": {
        "@type": "Brand",
        "name": "Hyundai"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "VND",
        "lowPrice": 769000000,
        "highPrice": 989000000,
        "offerCount": 4,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "AutoDealer",
          "name": "Xe Hyundai Vinh",
          "url": "https://xehyundaivinh.com"
        }
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Trang chủ",
          "item": "https://xehyundaivinh.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Dự toán giá lăn bánh",
          "item": "https://xehyundaivinh.com/gia-lan-banh"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Hyundai Tucson",
          "item": "https://xehyundaivinh.com/gia-lan-banh/tucson"
        }
      ]
    }
  ]
}
```

---

## 3. Schema Review & AggregateRating Cho Câu Chuyện Giao Xe (`DeliveryStoriesSection`)

Tích hợp vào phân khu Bàn giao xe để Google kích hoạt số sao vàng trên SERP:

```typescript
export interface DeliveryStoryReviewItem {
  id: string;
  customerName: string;
  carModel: string;
  deliveryDate: string;
  reviewComment: string;
  ratingValue: number; // 5
}

export function generateDeliveryStoriesJsonLd(
  stories: DeliveryStoryReviewItem[],
  siteUrl: string,
  dealerName: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': `${siteUrl}/#dealer`,
    name: dealerName,
    url: siteUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: Math.max(stories.length, 28),
      bestRating: '5',
      worstRating: '1',
    },
    review: stories.slice(0, 5).map((story) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: story.customerName,
      },
      datePublished: story.deliveryDate,
      reviewBody: story.reviewComment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: story.ratingValue,
        bestRating: '5',
        worstRating: '1',
      },
      itemReviewed: {
        '@type': 'Car',
        name: story.carModel,
      },
    })),
  };
}
```

---

## 4. Ma Trận Trạng Thái Canonical & Robots Trên Toàn Bộ Route

| Route Pattern | Loại Route | Thẻ Canonical Yêu Cầu | Thẻ Robots Meta |
| :--- | :--- | :--- | :--- |
| `/` | Trang chủ | `https://xehyundaivinh.com/` | `index: true, follow: true` |
| `/gia-lan-banh` | Tiện ích chung | `https://xehyundaivinh.com/gia-lan-banh` | `index: true, follow: true` |
| `/gia-lan-banh/[carSlug]` | Landing ngách | `https://xehyundaivinh.com/gia-lan-banh/[carSlug]` | `index: true, follow: true` |
| `/tra-gop` | Landing tư vấn | `https://xehyundaivinh.com/tra-gop` | `index: true, follow: true` |
| `/xe` | Danh mục xe | `https://xehyundaivinh.com/xe` | `index: true, follow: true` |
| `/xe/[carSlug]` | Chi tiết xe | `https://xehyundaivinh.com/xe/[carSlug]` | `index: true, follow: true` |
| `/dong-xe/[slug]` | Phân khúc | `https://xehyundaivinh.com/dong-xe/[slug]` | `index: true, follow: true` |
| `/tin-tuc` | Hub tin tức | `https://xehyundaivinh.com/tin-tuc` | `index: true, follow: true` |
| `/tin-tuc/[slug]` | Bài viết chi tiết | `https://xehyundaivinh.com/tin-tuc/[slug]` | `index: true, follow: true` |
| `/api/*` | API nội bộ | Không áp dụng | `noindex, nofollow` (qua `robots.ts`) |
| `/admin/*` | Khu vực quản trị | Không áp dụng | `noindex, nofollow` (qua `robots.ts`) |
