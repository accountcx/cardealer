# 📜 Technical Contract & API Specification: Trang Chi Tiết Dòng Xe (`/xe/[carSlug]`)

> **Mã Epic:** `EPIC-PHASE-4.4-CAR-DETAIL-EXPERIENCE`  
> **Giai đoạn:** Giai đoạn 2 — Bước 2.2: Thiết Kế Chi Tiết (Detailed Design Specification)  
> **Role phụ trách:** `feature-spec-generator`  
> **Phương án kiến trúc đã chốt:** **Option B (Modular Clean Architecture & Memory Preloader)**  
> **Định vị dự án:** Website Bán Hàng Cá Nhân Của Chuyên Viên Tư Vấn Ô Tô (Automotive Sales Consultant)

---

## 1. Thông Tin Chung & Chuẩn Giao Tiếp (Overview & Standards)

* **Base URL:** `http://localhost:3001` (Development) hoặc `https://api.domain.com` (Production).
* **Content-Type:** `application/json; charset=utf-8`.
* **Cấu Trúc Phong Bì Phản Hồi Chuẩn (Standard Response Envelope):**
  * **Thành công:** `{ "success": true, "data": T }`
  * **Thất bại:** `{ "success": false, "error": { "code": string, "message": string, "details"?: unknown } }`
* **Xác thực (Authentication):** Public Endpoint dành cho khách hàng Storefront (không yêu cầu Bearer Token). Chỉ trả về dữ liệu các xe đã xuất bản (`status = 'published'`).

---

## 2. Đặc Tả Chi Tiết REST Endpoint: `GET /api/cars/:slug`

### 2.1. Mục Đích & Ranh Giới Nghiệp Vụ
Truy xuất toàn bộ thông tin chi tiết của 1 dòng xe theo `slug` định danh (tiếng Việt không dấu có gạch nối, ví dụ: `tucson-2025`, `santa-fe-2025`), bao gồm tất cả các phiên bản trực thuộc, các màu sơn khả dụng kèm ảnh chụp xe theo màu tương ứng, thư viện ảnh và thông số kỹ thuật.

### 2.2. Chi Tiết Kỹ Thuật
* **HTTP Method:** `GET`
* **Path:** `/api/cars/:slug`
* **URL Parameters:**
  * `slug` (bắt buộc, string, regex: `^[a-z0-9-]+$`): Mã slug của dòng xe cần lấy.
* **Headers Yêu Cầu:**
  * `Accept: application/json`
* **Cache Headers Trả Về:**
  * `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

### 2.3. Cấu Trúc Dữ Liệu Phản Hồi Thành Công (`200 OK`)

```json
{
  "success": true,
  "data": {
    "id": "e9b1d74c-4b53-41bb-98f9-9069d2a37f5b",
    "tenXe": "Hyundai Tucson 2026",
    "slug": "tucson-2026",
    "anhDaiDienUrl": "/images/cars/tucson-2026/hero-white.webp",
    "catalogFileUrl": "/catalogs/hyundai-tucson-2026-brochure.pdf",
    "segment": "suv",
    "taxRate": 0.1,
    "traTruocTu": 150000000,
    "promotionSummary": "Hỗ trợ 50% trước bạ + Tặng gói phụ kiện chính hãng 25 triệu",
    "fuelType": "Xăng / Dầu / Turbo",
    "highlightFeatures": [
      { "icon": "ShieldCheck", "title": "Hyundai SmartSense", "value": "Gói an toàn chủ động cao cấp" },
      { "icon": "Gauge", "title": "Động cơ SmartStream", "value": "1.6L T-GDi / 2.0L MPI mạnh mẽ" },
      { "icon": "Layers", "title": "Màn hình cong đôi", "value": "Kép 12.3 inch siêu nét" },
      { "icon": "Volume2", "title": "Âm thanh Bose", "value": "8 loa cao cấp chân thực" }
    ],
    "moTaChung": "Hyundai Tucson thế hệ mới mang ngôn ngữ thiết kế Sensuous Sportiness đột phá...",
    "isFeatured": true,
    "status": "published",
    "sortOrder": 1,
    "minPrice": 769000000,
    "maxPrice": 919000000,
    "versionCount": 4,
    "versions": [
      {
        "id": "v1-uuid-001",
        "carId": "e9b1d74c-4b53-41bb-98f9-9069d2a37f5b",
        "tenPhienBan": "2.0 Xăng Tiêu Chuẩn",
        "slug": "2-0-xang-tieu-chuan",
        "giaNiemYet": 769000000,
        "giaKhuyenMai": 759000000,
        "seatCount": 5,
        "dongCo": "SmartStream G2.0",
        "hopSo": "6 AT",
        "danDong": "FWD",
        "anhDaiDienUrl": "/images/cars/tucson-2026/white.webp",
        "boSuuTapAnh": [
          "/images/cars/tucson-2026/gallery-01.webp",
          "/images/cars/tucson-2026/gallery-02.webp",
          "/images/cars/tucson-2026/gallery-interior-01.webp"
        ],
        "specGroups": [
          {
            "groupName": "Động cơ & Vận hành",
            "specs": [
              { "label": "Loại động cơ", "value": "SmartStream G2.0 MPI" },
              { "label": "Dung tích công tác", "value": "1.999 cc" },
              { "label": "Công suất tối đa", "value": "156 PS / 6.200 rpm" },
              { "label": "Mô-men xoắn tối đa", "value": "192 Nm / 4.500 rpm" },
              { "label": "Hộp số", "value": "Tự động 6 cấp (6AT)" },
              { "label": "Hệ dẫn động", "value": "Dẫn động cầu trước (FWD)" }
            ]
          },
          {
            "groupName": "Hệ thống An toàn",
            "specs": [
              { "label": "Số túi khí", "value": "6 túi khí" },
              { "label": "Phanh ABS, EBD, BA", "value": "Có" },
              { "label": "Cân bằng điện tử ESC", "value": "Có" },
              { "label": "Hỗ trợ khởi hành ngang dốc HAC", "value": "Có" },
              { "label": "Camera lùi & Cảm biến", "value": "Camera lùi + Cảm biến sau" },
              { "label": "Gói Hyundai SmartSense", "value": "Không trang bị trên bản Tiêu Chuẩn" }
            ]
          }
        ],
        "sortOrder": 1,
        "colors": [
          {
            "colorId": "c1-uuid-white",
            "tenMau": "Trắng Ngọc Trai (Atlas White)",
            "slug": "trang-ngoc-trai",
            "hexCode": "#F8FAFC",
            "isTwoTone": false,
            "secondaryHexCode": null,
            "anhXeTheoMauUrl": "/images/cars/tucson-2026/white.webp",
            "isDefault": true
          },
          {
            "colorId": "c2-uuid-red",
            "tenMau": "Đỏ Mận (Fiery Red)",
            "slug": "do-man",
            "hexCode": "#991B1B",
            "isTwoTone": false,
            "secondaryHexCode": null,
            "anhXeTheoMauUrl": "/images/cars/tucson-2026/red.webp",
            "isDefault": false
          },
          {
            "colorId": "c3-uuid-black",
            "tenMau": "Đen Cát (Phantom Black)",
            "slug": "den-cat",
            "hexCode": "#0F172A",
            "isTwoTone": false,
            "secondaryHexCode": null,
            "anhXeTheoMauUrl": "/images/cars/tucson-2026/black.webp",
            "isDefault": false
          }
        ]
      },
      {
        "id": "v2-uuid-002",
        "carId": "e9b1d74c-4b53-41bb-98f9-9069d2a37f5b",
        "tenPhienBan": "1.6 Turbo HTRAC Cao Cấp",
        "slug": "1-6-turbo-htrac-cao-cap",
        "giaNiemYet": 919000000,
        "giaKhuyenMai": 909000000,
        "seatCount": 5,
        "dongCo": "SmartStream 1.6 T-GDi",
        "hopSo": "7 DCT",
        "danDong": "AWD (HTRAC)",
        "anhDaiDienUrl": "/images/cars/tucson-2026/turbo-green.webp",
        "boSuuTapAnh": [],
        "specGroups": [
          {
            "groupName": "Động cơ & Vận hành",
            "specs": [
              { "label": "Loại động cơ", "value": "SmartStream 1.6 T-GDi Turbo Tăng áp" },
              { "label": "Dung tích công tác", "value": "1.598 cc" },
              { "label": "Công suất tối đa", "value": "180 PS / 5.500 rpm" },
              { "label": "Mô-men xoắn tối đa", "value": "265 Nm / 1.500 - 4.500 rpm" },
              { "label": "Hộp số", "value": "Ly hợp kép 7 cấp (7DCT)" },
              { "label": "Hệ dẫn động", "value": "Dẫn động 4 bánh toàn thời gian HTRAC" }
            ]
          },
          {
            "groupName": "Hệ thống An toàn",
            "specs": [
              { "label": "Gói Hyundai SmartSense", "value": "Trang bị đầy đủ (FCA, LKA, LFA, SCC, BCA, BVM)" },
              { "label": "Camera 360 độ (SVM)", "value": "Có (Hiển thị điểm mù trên màn hình ODO)" }
            ]
          }
        ],
        "sortOrder": 4,
        "colors": [
          {
            "colorId": "c1-uuid-white",
            "tenMau": "Trắng Ngọc Trai (Atlas White)",
            "slug": "trang-ngoc-trai",
            "hexCode": "#F8FAFC",
            "isTwoTone": true,
            "secondaryHexCode": "#0F172A",
            "anhXeTheoMauUrl": "/images/cars/tucson-2026/turbo-white-two-tone.webp",
            "isDefault": false
          },
          {
            "colorId": "c4-uuid-green",
            "tenMau": "Xanh Rêu (Amazon Gray)",
            "slug": "xanh-reu",
            "hexCode": "#3F4F44",
            "isTwoTone": true,
            "secondaryHexCode": "#0F172A",
            "anhXeTheoMauUrl": "/images/cars/tucson-2026/turbo-green.webp",
            "isDefault": true
          }
        ]
      }
    ]
  }
}
```

---

## 3. Bảng Ma Trận Mã Lỗi (Error Response Matrix)

| HTTP Status | Mã Lỗi (`error.code`) | Mô Tả Nghiệp Vụ | Cấu Trúc Response Thất Bại |
| :---: | :--- | :--- | :--- |
| **`404 Not Found`** | `CAR_NOT_FOUND` | Không tìm thấy dòng xe tương ứng với `slug` hoặc xe đang ở trạng thái `draft` / `archived`. | `{"success": false, "error": {"code": "CAR_NOT_FOUND", "message": "Không tìm thấy dòng xe với slug \"...\" trong hệ thống"}}` |
| **`400 Bad Request`** | `INVALID_SLUG_FORMAT` | Slug chứa ký tự đặc biệt nguy hiểm hoặc rỗng. | `{"success": false, "error": {"code": "INVALID_SLUG_FORMAT", "message": "Định dạng slug không hợp lệ"}}` |
| **`500 Internal Server Error`** | `DATABASE_QUERY_ERROR` | Kết nối PostgreSQL bị ngắt quãng hoặc câu lệnh ORM gặp sự cố ngoại lệ. | `{"success": false, "error": {"code": "DATABASE_QUERY_ERROR", "message": "Lỗi truy vấn dữ liệu chi tiết xe từ máy chủ"}}` |

---

## 4. Đặc Tả Hợp Đồng Hàm Tiện Ích Core & Saler Tools

### 4.1. Trình Sinh Dữ Liệu Có Cấu Trúc SEO (`packages/core/src/seo/json-ld.ts`)
* **Chữ ký hàm:**
  ```typescript
  export function generateCarJsonLd(
    car: CarDetail,
    siteUrl: string,
    consultant?: {
      name: string;
      phone: string;
      showroomName: string;
      showroomAddress?: string;
    }
  ): Record<string, unknown>
  ```
* **Payload đầu ra:** Mảng JSON-LD chứa:
  1. `Schema Product & Car`: name, image, description, brand, offers (`AggregateOffer`), `hasMerchantReturnPolicy` (7 ngày), `warranty` (5 năm).
  2. `Schema Person` (Tư vấn bán hàng chính hãng): name, jobTitle, telephone, worksFor (`AutoDealer`).
  3. `Schema BreadcrumbList`: Trang chủ ➡️ Bảng giá xe ➡️ Tên dòng xe.

### 4.2. Trình Tạo Liên Kết Zalo Thông Minh Ngữ Cảnh (`apps/web/lib/zalo.ts`)
* **Chữ ký hàm:**
  ```typescript
  export function generateZaloDeepLink(params: {
    hotline: string;
    salerName: string;
    carName: string;
    versionName: string;
    colorName: string;
  }): string
  ```
* **Logic:**
  ```typescript
  const cleanPhone = params.hotline.replace(/\D/g, '');
  const rawMessage = `Chào em ${params.salerName}, anh/chị đang xem dòng xe ${params.carName} phiên bản ${params.versionName}, màu ${params.colorName}. Em gửi bảng tính giá lăn bánh tốt nhất và chương trình ưu đãi cho anh/chị nhé!`;
  return `https://zalo.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;
  ```

---

## 5. Mock Data Set Chuẩn Phục Vụ Unit / Integration Tests

Để kiểm thử không cần phụ thuộc vào kết nối Database live, sử dụng mock object chuẩn:

```typescript
export const MOCK_TUCSON_DETAIL: CarDetail = {
  id: "mock-car-uuid-001",
  tenXe: "Hyundai Tucson 2026",
  slug: "tucson-2026",
  anhDaiDienUrl: "/images/cars/tucson.webp",
  catalogFileUrl: "/catalogs/tucson.pdf",
  segment: "suv",
  taxRate: 0.1,
  traTruocTu: 150000000,
  promotionSummary: "Giảm 50% trước bạ + Tặng 25tr phụ kiện",
  fuelType: "Xăng / Turbo",
  highlightFeatures: [
    { icon: "Shield", title: "SmartSense", value: "An toàn chủ động" }
  ],
  moTaChung: "Dòng SUV bán chạy hàng đầu phân khúc C.",
  isFeatured: true,
  status: "published",
  sortOrder: 1,
  minPrice: 769000000,
  maxPrice: 919000000,
  versions: [
    {
      id: "mock-v1",
      carId: "mock-car-uuid-001",
      tenPhienBan: "2.0 Tiêu Chuẩn",
      slug: "2-0-tieu-chuan",
      giaNiemYet: 769000000,
      giaKhuyenMai: null,
      seatCount: 5,
      dongCo: "SmartStream 2.0",
      hopSo: "6AT",
      danDong: "FWD",
      anhDaiDienUrl: "/images/cars/tucson-white.webp",
      boSuuTapAnh: [],
      specGroups: [],
      reviewContent: null,
      contentBlocks: null,
      sortOrder: 1,
      colors: [
        {
          colorId: "mock-c1",
          tenMau: "Trắng Ngọc Trai",
          slug: "trang-ngoc-trai",
          hexCode: "#FFFFFF",
          isTwoTone: false,
          secondaryHexCode: null,
          anhXeTheoMauUrl: "/images/cars/tucson-white.webp",
          isDefault: true
        }
      ]
    }
  ]
};
```
