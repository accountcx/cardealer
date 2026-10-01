# 📐 TECHNICAL SPECIFICATION: PHASE 4 - SEO SCHEMAS & UTILS PACKAGE

> **Mã Epic**: `EPIC-PHASE-4-SEO-SCHEMAS-UTILS`  
> **Dự án**: CarDealer Technical SEO Monorepo Package  
> **Trạng thái**: Kế hoạch chuẩn bị cho Bước 2  
> **Tiêu chuẩn**: Universal Agentic Workflow v2.2  

---

## 1. Mục Tiêu Kỹ Thuật
Đóng gói toàn bộ logic SEO kỹ thuật vào Monorepo Package độc lập (`packages/utils` hoặc mở rộng `packages/core`), cung cấp:
1. Trình sinh Metadata chuẩn mực Next.js 15 (`generatePageMetadata`).
2. Bộ làm sạch URL Canonical triệt để (xóa bỏ 100% query tracking `fbclid`, `utm_*`, `gclid`, query tham số lọc).
3. Thư viện sinh 7 cấu trúc dữ liệu có cấu trúc Schema.org JSON-LD SSR chuẩn Google Rich Results.

---

## 2. Đặc Tả Chi Tiết 7 Cấu Trúc Schema JSON-LD

### 2.1 Schema Xe Ô Tô (`Car` & `Product`)
* **Áp dụng tại**: `/xe/[carSlug]`
* **Đặc tính kỹ thuật**:
  * `@type`: `["Product", "Car"]`
  * `name`, `image`, `description`, `sku`, `brand`: `{ @type: "Brand", name: "Hyundai" }`
  * `offers`:
    * `price`: Giá niêm yết chuẩn
    * `priceCurrency`: "VND"
    * `priceValidUntil`: Tự động tính ngày cuối cùng của tháng hiện tại lúc 23:59:59 (Tạo FOMO).
    * `hasMerchantReturnPolicy`: 7 ngày đổi trả nếu phát hiện lỗi kỹ thuật từ nhà sản xuất.
    * `shippingDetails`: Chi phí 0 VNĐ, thời gian 0-3 ngày giao xe tận nhà.
  * `warranty`: Bảo hành chính hãng 5 năm hoặc 100.000 km.

### 2.2 Schema Doanh Nghiệp Địa Phương (`AutoDealer`)
* **Áp dụng tại**: Trang chủ (`/`)
* **Đặc tính kỹ thuật**:
  * `@type`: `"AutoDealer"`
  * `name`: "Hyundai Vinh - Đại Lý Ủy Quyền Chính Hãng"
  * `address`: Địa chỉ chi tiết (Thành phố Vinh, Nghệ An).
  * `geo`: `{ @type: "GeoCoordinates", latitude: 18.679..., longitude: 105.681... }`
  * `telephone`: Hotline bán hàng
  * `priceRange`: `"$$$"`
  * `openingHoursSpecification`: Giờ mở cửa showroom.

### 2.3 Schema Bài Viết Tin Tức (`NewsArticle`)
* **Áp dụng tại**: `/tin-tuc/[slug]`
* **Đặc tính kỹ thuật**:
  * `@type`: `"NewsArticle"`
  * `headline`, `image`, `datePublished`, `dateModified`
  * `author`: `{ @type: "Person", name: "Chuyên Viên Tư Vấn Hyundai" }`
  * `publisher`: `{ @type: "Organization", name: "Hyundai Vinh", logo: { @type: "ImageObject", url: "..." } }`

### 2.4 Schema Câu Hỏi Thường Gặp (`FAQPage`)
* **Áp dụng tại**: Các bài viết hoặc trang tĩnh có khối FAQ Accordion
* **Đặc tính kỹ thuật**:
  * `@type`: `"FAQPage"`
  * `mainEntity`: Danh sách mảng `{ @type: "Question", name: q, acceptedAnswer: { @type: "Answer", text: a } }`

### 2.5 Schema Ứng Dụng Tài Chính (`SoftwareApplication`)
* **Áp dụng tại**: `/gia-lan-banh` và `/tra-gop`
* **Đặc tính kỹ thuật**:
  * `@type`: `"SoftwareApplication"`
  * `name`: "Công Cụ Dự Toán Lăn Bánh & Tính Vay Trả Góp Ô Tô"
  * `applicationCategory`: `"FinanceApplication"`
  * `operatingSystem`: `"Web Browser, iOS, Android"`
  * `offers`: `{ @type: "Offer", price: "0", priceCurrency: "VND" }`

### 2.6 Schema Đối Tượng Video (`VideoObject`)
* **Áp dụng tại**: Các trang/bài viết nhúng video đánh giá xe từ YouTube
* **Đặc tính kỹ thuật**:
  * `@type`: `"VideoObject"`
  * `name`, `description`, `thumbnailUrl`, `uploadDate`, `contentUrl`, `embedUrl`

### 2.7 Schema Phân Cấp Breadcrumb (`BreadcrumbList`)
* **Áp dụng tại**: Tất cả các trang con (`/xe/[carSlug]`, `/dong-xe/[segment]`, `/[slug]`, `/tin-tuc/[slug]`)
* **Đặc tính kỹ thuật**:
  * `@type`: `"BreadcrumbList"`
  * `itemListElement`: Mảng `{ @type: "ListItem", position: 1, name: "Trang chủ", item: "..." }`

---

## 3. Kiến Trúc Package & Export Structure
```
packages/utils/ (hoặc packages/core/src/seo/)
├── src/
│   ├── seo/
│   │   ├── metadata.ts       # generatePageMetadata, cleanCanonicalUrl
│   │   ├── schemas.ts        # 7 schema builders
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```
