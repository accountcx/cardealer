# 📜 API & Technical Contract Specification: PHASE 2 - STATIC-PAGES-CMS

> **Mã Epic**: `EPIC-PHASE-2-STATIC-PAGES-CMS`  
> **Dự án**: CarDealer API Layer  
> **Giai đoạn**: Phase 2 - Step 2.4: API Specification  
> **Lead Role**: `feature-spec-generator`  
> **Tiêu chuẩn quy trình**: Universal Agentic Workflow v2.2  

---

## 1. Giao Thức Chung & Chuẩn Hóa Lỗi (Standard Protocols)

* **Base URL:** `/api`
* **Xác thực (Authentication):** `Authorization: Bearer <JWT_TOKEN>` (Cho các Admin Endpoints).
* **Cấu trúc Vỏ bọc Lỗi Chuẩn (Standard Error Envelope):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu gửi lên không thỏa mãn điều kiện kiểm thực",
    "details": [
      { "field": "slug", "issue": "Slug không được trùng với route hệ thống" }
    ],
    "timestamp": "2026-10-01T16:30:00.000Z"
  }
}
```

---

## 2. Danh Sách Chi Tiết Các Endpoints

---

### 🔹 EP-01: Lấy Danh Sách Trang Tĩnh (Admin List Pages)
* **Luồng nghiệp vụ:** `US-03` (Hiển thị bảng quản trị trang tĩnh trong Admin)
* **Method & Path:** `GET /api/admin/pages`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Query Parameters:**
  * `page` (number, optional, default: 1)
  * `limit` (number, optional, default: 20, max: 100)
  * `search` (string, optional, tìm kiếm theo `title` hoặc `slug`)
  * `status` (string, optional: `'all' | 'published' | 'draft'`)
  * `templateType` (string, optional: `'DEFAULT' | 'PROFILE_SHOWROOM' | 'TIMELINE' | 'FINANCE'`)
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "e4c5b364-77ef-4b47-b2f7-b24e6c1e5482",
        "title": "Giới thiệu Hyundai Vinh - Đại Lý 3S Chính Hãng",
        "slug": "gioi-thieu",
        "templateType": "PROFILE_SHOWROOM",
        "isPublished": true,
        "metaTitle": "Giới Thiệu Showroom Hyundai Vinh Chuẩn 3S Chính Hãng",
        "noIndex": false,
        "updatedAt": "2026-10-01T15:20:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 4,
      "totalPages": 1
    }
  }
}
```

---

### 🔹 EP-02: Tạo Mới Trang Tĩnh (Create Static Page)
* **Luồng nghiệp vụ:** `US-02`, `US-03`
* **Method & Path:** `POST /api/admin/pages`
* **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body Schema (Zod):**
```typescript
import { z } from 'zod';

export const RESERVED_SLUGS = [
  'xe', 'dong-xe', 'tin-tuc', 'gia-lan-banh', 'tra-gop',
  'admin', 'api', 'login', 'preview', 'settings', 'sitemap'
] as const;

export const createStaticPageSchema = z.object({
  title: z.string().min(2, "Tiêu đề tối thiểu 2 ký tự").max(255),
  slug: z.string()
    .min(2, "Slug tối thiểu 2 ký tự")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường không dấu, số và dấu gạch ngang")
    .refine((val) => !RESERVED_SLUGS.includes(val as any), {
      message: "Slug này trùng với đường dẫn cố định của hệ thống, vui lòng chọn tên khác!"
    }),
  content: z.record(z.any()).default({}),
  templateType: z.enum(['DEFAULT', 'PROFILE_SHOWROOM', 'TIMELINE', 'FINANCE']).default('DEFAULT'),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(1000).optional().nullable(),
  canonicalUrl: z.string().url("URL không hợp lệ").max(500).optional().nullable(),
  ogImage: z.string().max(500).optional().nullable(),
  noIndex: z.boolean().default(false),
  schemaType: z.enum(['AboutPage', 'HowTo', 'WebPage']).default('WebPage').optional().nullable(),
});
```
* **Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "e4c5b364-77ef-4b47-b2f7-b24e6c1e5482",
    "title": "Quy trình mua xe ô tô 5 bước",
    "slug": "quy-trinh-mua-xe",
    "templateType": "TIMELINE",
    "isPublished": false,
    "createdAt": "2026-10-01T16:30:00.000Z"
  }
}
```

---

### 🔹 EP-03: Lấy Chi Tiết Trang Tĩnh (Admin Get Page Detail)
* **Luồng nghiệp vụ:** `US-03` (Nạp dữ liệu vào form soạn thảo)
* **Method & Path:** `GET /api/admin/pages/:id`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "e4c5b364-77ef-4b47-b2f7-b24e6c1e5482",
    "title": "Giới thiệu Hyundai Vinh",
    "slug": "gioi-thieu",
    "content": {
      "type": "doc",
      "content": [
        { "type": "paragraph", "content": [{ "type": "text", "text": "Chào mừng đến với Hyundai Vinh." }] }
      ]
    },
    "templateType": "PROFILE_SHOWROOM",
    "isPublished": true,
    "metaTitle": "Giới thiệu Hyundai Vinh | Đại lý ủy quyền chính hãng",
    "metaDescription": "Hồ sơ năng lực showroom 3S Hyundai Vinh, Nghệ An...",
    "canonicalUrl": null,
    "ogImage": "https://media.cardealer.vn/showroom-banner.webp",
    "noIndex": false,
    "schemaType": "AboutPage",
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-01T15:20:00.000Z"
  }
}
```

---

### 🔹 EP-04: Cập Nhật Trang Tĩnh (Update Static Page)
* **Luồng nghiệp vụ:** `US-02`, `US-03`
* **Method & Path:** `PUT /api/admin/pages/:id`
* **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body:** Partial schema của `createStaticPageSchema`.
* **Response 200 OK:** Trả về đối tượng `StaticPage` đã được cập nhật.

---

### 🔹 EP-05: Xóa Trang Tĩnh (Delete Static Page)
* **Luồng nghiệp vụ:** `US-02`
* **Method & Path:** `DELETE /api/admin/pages/:id`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response 200 OK:**
```json
{
  "success": true,
  "message": "Đã xóa trang tĩnh thành công"
}
```

---

### 🔹 EP-06: Truy Vấn Công Khai Theo Slug (Public Storefront Query)
* **Luồng nghiệp vụ:** `US-04` (Dùng cho Storefront Server Component)
* **Method & Path:** `GET /api/public/pages/:slug`
* **Cache Header:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
* **Response 200 OK (Chỉ trả về khi `isPublished = true`):**
```json
{
  "success": true,
  "data": {
    "title": "Chính Sách Bảo Mật Thông Tin Khách Hàng",
    "slug": "chinh-sach-bao-mat",
    "content": { "type": "doc", "content": [...] },
    "templateType": "DEFAULT",
    "metaTitle": "Chính Sách Bảo Mật | Hyundai Vinh",
    "metaDescription": "Cam kết bảo mật thông tin liên hệ và số điện thoại của quý khách...",
    "canonicalUrl": "https://xehyundaivinh.com/chinh-sach-bao-mat",
    "ogImage": "https://media.cardealer.vn/security.webp",
    "noIndex": false,
    "schemaType": "WebPage",
    "updatedAt": "2026-10-01T15:20:00.000Z"
  }
}
```
* **Response 404 Not Found (Khi trang không tồn tại hoặc `isPublished = false`):**
```json
{
  "success": false,
  "error": {
    "code": "PAGE_NOT_FOUND",
    "message": "Trang tĩnh không tồn tại hoặc chưa được xuất bản",
    "timestamp": "2026-10-01T16:35:00.000Z"
  }
}
```

---

## 3. Ma Trận Mã Lỗi Hệ Thống (Error Matrix)

| HTTP Status | Error Code | Mô Tả Ý Nghĩa | Hướng Xử Lý Phía Client |
| :---: | :--- | :--- | :--- |
| **400** | `BAD_REQUEST` | Tham số ID hoặc Query không đúng định dạng UUID. | Kiểm tra lại URL params. |
| **401** | `UNAUTHORIZED` | Token JWT không hợp lệ hoặc đã hết hạn phiên làm việc. | Chuyển hướng người dùng về trang `/login`. |
| **403** | `FORBIDDEN` | Tài khoản không có quyền biên tập hoặc quản trị trang. | Hiển thị Toast cảnh báo quyền truy cập. |
| **404** | `PAGE_NOT_FOUND` | Không tìm thấy trang tĩnh với ID hoặc Slug cung cấp. | Hiển thị màn hình 404 Not Found. |
| **409** | `SLUG_ALREADY_EXISTS` | Slug đã được sử dụng bởi một trang tĩnh khác trong cơ sở dữ liệu. | Đánh dấu viền đỏ ô input Slug, yêu cầu đổi tên slug. |
| **422** | `RESERVED_SLUG_VIOLATION` | Slug nằm trong danh mục từ khóa cố định của hệ thống (`xe`, `tin-tuc`...). | Hiển thị thông báo giải thích slug hệ thống. |
| **500** | `INTERNAL_SERVER_ERROR` | Lỗi database transaction hoặc crash server ngoài dự kiến. | Hiển thị Error Boundary và nút "Thử lại". |
