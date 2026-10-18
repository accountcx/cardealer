# 📡 Đặc Tả Giao Diện Lập Trình Ứng Dụng (API_SPEC.md)
## PHASE 1 - CORE DATA LAYER, CAR CATALOG & ADMIN AUTHENTICATION

> **Role:** `feature-spec-generator`  
> **Host Backend:** `apps/api` (Chạy mặc định tại `http://localhost:4000`)  
> **Định dạng:** RESTful JSON  
> **Tiêu chuẩn Envelope:** `{ success: boolean, data?: T, message?: string, error?: ApiError }`  
> **Phạm vi:** Tập trung 100% vào **Auth, Catalog Dòng Xe & Bảng Màu** của Phase 1

---

## 1. Chuẩn Hóa Response & Error Envelopes

### 1.1. Phản hồi Thành công (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Thao tác thành công"
}
```

### 1.2. Phản hồi Thất bại (HTTP 400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu đầu vào không hợp lệ",
    "details": [
      {
        "field": "tenXe",
        "message": "Tên dòng xe không được để trống"
      }
    ]
  }
}
```

---

## 2. Danh Sách Endpoints Xác Thực Admin (`/api/auth`)

### 2.1. Đăng nhập Quản trị viên (`POST /api/auth/login`)
* **Request Body:**
  ```json
  {
    "email": "admin@xehyundaivinh.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response Thành công (HTTP 200):**
  * *Headers:* `Set-Cookie: admin_token=<jwt>; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`
  * *Body:*
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "c1f7b8d4-5e2a-4a6c-9b8e-123456789abc",
          "email": "admin@xehyundaivinh.com",
          "fullName": "Tuấn Hyundai",
          "phone": "0981234567",
          "avatarUrl": "/images/avatars/sale-tuan.webp",
          "role": "admin"
        }
      }
    }
    ```

### 2.2. Lấy thông tin phiên hiện tại (`GET /api/auth/me`)
* **Quyền:** Yêu cầu cookie `admin_token`.
* **Response (HTTP 200):** Trả về object user như trên.

### 2.3. Đăng xuất (`POST /api/auth/logout`)
* **Response (HTTP 200):** Xóa cookie `admin_token=; Max-Age=0`.

---

## 3. Danh Sách Endpoints Danh Mục Xe & Màu Sắc (`/api/cars`, `/api/colors`)

### 3.1. Danh sách Dòng Xe (`GET /api/cars`)
* **Mô tả:** Phục vụ Lưới xe trang chủ, Trang danh mục hoặc Bảng quản trị.
* **Query Params:**
  * `segment`: `sedan` | `suv` | `mpv` | `hatchback` | `ev` (Lọc theo phân khúc).
  * `status`: `published` (mặc định) | `draft` | `all` (kèm quyền admin).
  * `isFeatured`: `true` | `false` (Lấy xe HOT ghim trang chủ).
* **Response Thành công (HTTP 200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e9b2c3a1-7d4f-4a6c-9b8e-123456789abc",
        "tenXe": "Hyundai Tucson 2025",
        "slug": "tucson-2025",
        "anhDaiDienUrl": "/images/cars/tucson-2025.webp",
        "segment": "suv",
        "taxRate": 0.10,
        "traTruocTu": 150000000,
        "promotionSummary": "Giảm 50% trước bạ + Tặng phụ kiện chính hãng",
        "fuelType": "Xăng, Dầu, Turbo",
        "isFeatured": true,
        "status": "published",
        "sortOrder": 1,
        "minPrice": 769000000,
        "maxPrice": 899000000,
        "versionCount": 4
      }
    ]
  }
  ```

---

### 3.2. Chi tiết Dòng Xe Đầy Đủ (`GET /api/cars/:slug`)
* **Mô tả:** Lấy toàn bộ thông tin dòng xe, kèm danh sách phiên bản và các tùy chọn màu sắc liên kết.
* **Response Thành công (HTTP 200):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e9b2c3a1-7d4f-4a6c-9b8e-123456789abc",
      "tenXe": "Hyundai Tucson 2025",
      "slug": "tucson-2025",
      "anhDaiDienUrl": "/images/cars/tucson-2025.webp",
      "catalogFileUrl": "/docs/catalogs/tucson-2025.pdf",
      "segment": "suv",
      "taxRate": 0.10,
      "traTruocTu": 150000000,
      "promotionSummary": "Giảm 50% trước bạ + Tặng phụ kiện chính hãng",
      "fuelType": "Xăng, Dầu, Turbo",
      "highlightFeatures": [
        { "icon": "engine", "title": "ĐỘNG CƠ", "value": "SmartStream 2.0L" },
        { "icon": "transmission", "title": "HỘP SỐ", "value": "Tự động 6 cấp" },
        { "icon": "power", "title": "CÔNG SUẤT", "value": "156 mã lực" },
        { "icon": "seat", "title": "CHỖ NGỒI", "value": "5 Chỗ Rộng Rãi" },
        { "icon": "fuel", "title": "NHIÊN LIỆU", "value": "Xăng (6.8L/100km)" },
        { "icon": "safety", "title": "AN TOÀN", "value": "Hyundai SmartSense" }
      ],
      "versions": [
        {
          "id": "a1b2c3d4-1111-4a6c-9b8e-123456789abc",
          "tenPhienBan": "1.6 Turbo H-Trac",
          "slug": "1-6-turbo-h-trac",
          "giaNiemYet": 859000000,
          "giaKhuyenMai": 829000000,
          "seatCount": 5,
          "dongCo": "Smartstream 1.6 T-GDi",
          "hopSo": "7 DCT",
          "danDong": "HTRAC (4WD)",
          "anhDaiDienUrl": "/images/cars/tucson-turbo.webp",
          "colors": [
            {
              "colorId": "c1111111-2222-4a6c-9b8e-123456789abc",
              "tenMau": "Trắng Ngọc Trai",
              "hexCode": "#F5F5F5",
              "isTwoTone": false,
              "anhXeTheoMauUrl": "/images/cars/tucson-turbo-white.webp",
              "isDefault": true
            },
            {
              "colorId": "c2222222-3333-4a6c-9b8e-123456789abc",
              "tenMau": "Xanh Rêu (Emerald)",
              "hexCode": "#1A4D2E",
              "isTwoTone": false,
              "anhXeTheoMauUrl": "/images/cars/tucson-turbo-green.webp",
              "isDefault": false
            }
          ]
        }
      ]
    }
  }
  ```

---

### 3.3. Danh mục Bảng Màu Ngoại Thất (`GET /api/colors`)
```json
{
  "success": true,
  "data": [
    { "id": "uuid-1", "tenMau": "Trắng Ngọc Trai", "hexCode": "#F5F5F5", "isTwoTone": false },
    { "id": "uuid-2", "tenMau": "Đen Huyền Bí", "hexCode": "#111111", "isTwoTone": false },
    { "id": "uuid-3", "tenMau": "Xanh Rêu Độc Quyền", "hexCode": "#1A4D2E", "isTwoTone": false },
    { "id": "uuid-4", "tenMau": "Đỏ Đô Nóc Đen", "hexCode": "#990000", "isTwoTone": true, "secondaryHexCode": "#000000" }
  ]
}
```

---

## 4. Endpoints Quản Trị CRUD (Protected Admin Routes)

> Yêu cầu cookie `admin_token` và quyền `role: admin`.

| Method | Endpoint | Mô tả | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/admin/cars` | Thêm mới dòng xe | `{ tenXe, slug, anhDaiDienUrl, catalogFileUrl, segment, taxRate, traTruocTu, promotionSummary, highlightFeatures, status, isFeatured, sortOrder }` |
| **PUT** | `/api/admin/cars/:id` | Cập nhật dòng xe | Tương tự POST |
| **DELETE** | `/api/admin/cars/:id` | Xóa dòng xe (cascade xóa phiên bản) | Không |
| **POST** | `/api/admin/cars/:id/versions` | Thêm phiên bản mới | `{ tenPhienBan, slug, giaNiemYet, giaKhuyenMai, seatCount, dongCo, hopSo, danDong, anhDaiDienUrl, specGroups }` |
| **PUT** | `/api/admin/versions/:versionId` | Cập nhật phiên bản | Tương tự POST |
| **DELETE** | `/api/admin/versions/:versionId`| Xóa phiên bản | Không |
| **POST** | `/api/admin/colors` | Tạo màu mới trong hệ thống | `{ tenMau, hexCode, isTwoTone, secondaryHexCode, swatchUrl }` |
| **POST** | `/api/admin/versions/:versionId/colors` | Gán màu & ảnh xe thật cho phiên bản | `{ colorId, anhXeTheoMauUrl, isDefault }` |

---

## 5. Endpoints Cấu Hình Toàn Cục (`GET /api/settings/:key`)

* **Ví dụ:** `GET /api/settings/contact_settings`
```json
{
  "success": true,
  "data": {
    "sellerName": "Tuấn Hyundai",
    "sellerPhone": "0981234567",
    "sellerZalo": "https://zalo.me/0981234567",
    "sellerAddress": "Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An",
    "workingHours": "08:00 - 18:00 (T2 - CN)"
  }
}
```

---

## 6. Lộ Trình Endpoints Cho Các Phase Sau

* **Phase 2 (Pricing & Lead Engine):** Sẽ bổ sung endpoint `POST /api/leads` và `GET /api/admin/leads`.
* **Phase 3 (Storefront & Delivery):** Sẽ bổ sung endpoint `GET /api/testimonials`.
* **Phase 4 (Content & Lexical):** Sẽ bổ sung bộ endpoint bài viết `GET /api/posts`, `GET /api/posts/:slug`, `POST /api/admin/posts`.
