# 📜 API & Technical Contract Specification: Quản Trị Chuyên Mục Bài Viết (Admin Categories Management)

## 1. Thông Tin Chung & Authentication Protocols
* **Base URL:** `/api/admin/categories` (Admin Scope) & `/api/posts` (Public Scope)
* **Auth Protocol:** Bearer JWT Token gửi qua Header `Authorization: Bearer <accessToken>` hoặc Cookie `admin_session`.
* **RBAC Permissions Required:**
  - `posts:read`: Dành cho các endpoint lấy danh sách (`GET`).
  - `posts:write`: Dành cho các endpoint thêm, sửa, xóa (`POST`, `PUT`, `DELETE`).
* **Standard Response & Error Envelope:**
```json
// Success Response Envelope
{
  "success": true,
  "data": {},
  "message": "Thông báo tuỳ chọn"
}

// Error Response Envelope
{
  "success": false,
  "error": {
    "code": "SLUG_CONFLICT",
    "message": "Slug này đã tồn tại trên hệ thống, vui lòng chọn một slug khác.",
    "details": {}
  }
}
```

---

## 2. Danh Sách Endpoints Chi Tiết

### 🔹 Endpoint 1: Lấy Danh Sách Chuyên Mục Kèm Số Bài Viết
* **Method & Path:** `GET /api/admin/categories`
* **Permission:** `posts:read`
* **Query Parameters:** Không (Lấy toàn bộ danh mục sắp xếp theo `sortOrder ASC, createdAt DESC`).
* **Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "tenChuyenMuc": "Đánh Giá Xe",
      "slug": "danh-gia-xe",
      "moTa": "Chuyên mục phân tích, trải nghiệm thực tế các dòng xe ô tô Hyundai.",
      "sortOrder": 1,
      "postCount": 14,
      "createdAt": "2026-08-15T08:30:00.000Z",
      "updatedAt": "2026-09-20T10:15:00.000Z"
    },
    {
      "id": "8a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      "tenChuyenMuc": "Tin Khuyến Mãi",
      "slug": "tin-khuyen-mai",
      "moTa": "Chính sách ưu đãi lệ phí trước bạ, giảm giá tiền mặt từ đại lý.",
      "sortOrder": 2,
      "postCount": 8,
      "createdAt": "2026-08-16T09:00:00.000Z",
      "updatedAt": "2026-09-22T14:20:00.000Z"
    }
  ]
}
```

---

### 🔹 Endpoint 2: Tạo Mới Chuyên Mục
* **Method & Path:** `POST /api/admin/categories`
* **Permission:** `posts:write`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "tenChuyenMuc": "Bảng Giá Xe Mới Nhất",
  "slug": "bang-gia-xe-moi-nhat",
  "moTa": "Cập nhật bảng giá niêm yết và giá lăn bánh tạm tính toàn bộ dòng xe Hyundai.",
  "sortOrder": 3
}
```
* **Validation Rules:**
  - `tenChuyenMuc`: string (bắt buộc, độ dài 1-150 ký tự).
  - `slug`: string (bắt buộc, regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, unique toàn hệ thống).
  - `moTa`: string (tùy chọn, tối đa 1000 ký tự).
  - `sortOrder`: number (tùy chọn, số nguyên >= 0, default: 0).
* **Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
    "tenChuyenMuc": "Bảng Giá Xe Mới Nhất",
    "slug": "bang-gia-xe-moi-nhat",
    "moTa": "Cập nhật bảng giá niêm yết và giá lăn bánh tạm tính toàn bộ dòng xe Hyundai.",
    "sortOrder": 3,
    "createdAt": "2026-09-26T00:10:00.000Z",
    "updatedAt": "2026-09-26T00:10:00.000Z"
  },
  "message": "Tạo chuyên mục thành công"
}
```

---

### 🔹 Endpoint 3: Cập Nhật Chuyên Mục
* **Method & Path:** `PUT /api/admin/categories/:id`
* **Permission:** `posts:write`
* **URL Params:** `id` (UUID của chuyên mục cần sửa).
* **Request Body:**
```json
{
  "tenChuyenMuc": "Bảng Giá Xe 2026",
  "slug": "bang-gia-xe-2026",
  "moTa": "Bảng giá xe Hyundai 2026 mới nhất tại đại lý Vinh.",
  "sortOrder": 1
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
    "tenChuyenMuc": "Bảng Giá Xe 2026",
    "slug": "bang-gia-xe-2026",
    "moTa": "Bảng giá xe Hyundai 2026 mới nhất tại đại lý Vinh.",
    "sortOrder": 1,
    "updatedAt": "2026-09-26T00:12:00.000Z"
  },
  "message": "Cập nhật chuyên mục thành công"
}
```

---

### 🔹 Endpoint 4: Xóa Chuyên Mục (Có Restrict Guard)
* **Method & Path:** `DELETE /api/admin/categories/:id`
* **Permission:** `posts:write`
* **URL Params:** `id` (UUID của chuyên mục cần xóa).
* **Xử lý Chặn Xóa:**
  - Nếu `postCount > 0`: Trả về `400 Bad Request` với mã `CATEGORY_IN_USE`.
  - Nếu `postCount == 0`: Tiến hành xóa khỏi DB.
* **Response 200 OK (Thành công):**
```json
{
  "success": true,
  "message": "Đã xóa chuyên mục thành công"
}
```
* **Response 400 Bad Request (Bị chặn do còn bài viết):**
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_IN_USE",
    "message": "Không thể xóa chuyên mục này vì đang có 14 bài viết liên kết. Vui lòng chuyển bài viết sang chuyên mục khác trước khi xóa."
  }
}
```

---

### 🔹 Endpoint 5: Lọc Bài Viết Theo Chuyên Mục (Public Storefront)
* **Method & Path:** `GET /api/posts`
* **Query Parameters:**
  - `category`: string (Slug chuyên mục, ví dụ: `?category=danh-gia-xe`).
  - `status`: string (Mặc định: `published`).
  - `page`: number (Trang, mặc định: 1).
  - `limit`: number (Số bài mỗi trang, mặc định: 12).
* **Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "post-uuid-1",
      "tieuDe": "Đánh Giá Chi Tiết Hyundai Santa Fe 2026",
      "slug": "danh-gia-chi-tiet-hyundai-santa-fe-2026",
      "category": {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "tenChuyenMuc": "Đánh Giá Xe",
        "slug": "danh-gia-xe"
      },
      "anhDaiDienUrl": "/images/cars/santafe.webp",
      "readingTime": 6,
      "createdAt": "2026-09-18T14:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalItems": 14,
    "totalPages": 2
  }
}
```

---

## 3. Ma Trận Mã Lỗi Hệ Thống (Error Matrix)

| HTTP Code | Error Code | Nguyên nhân Kích hoạt | Hành động Phía Client / Admin UI |
| :---: | :--- | :--- | :--- |
| **400** | `INVALID_INPUT` | Tên chuyên mục rỗng, slug sai định dạng regex | Hiển thị thông báo lỗi ngay dưới ô nhập |
| **400** | `CATEGORY_IN_USE` | Chuyên mục có `postCount > 0` bị gửi lệnh xóa | Mở Modal cảnh báo kèm số lượng bài viết đang liên kết |
| **401** | `UNAUTHORIZED` | Token đăng nhập hết hạn hoặc chưa đăng nhập | Điều hướng về trang `/login` |
| **403** | `FORBIDDEN` | Tài khoản không có quyền `posts:write` | Hiển thị Toast đỏ "Bạn không có quyền thực hiện thao tác này" |
| **404** | `NOT_FOUND` | Không tìm thấy ID chuyên mục cần sửa/xóa | Báo lỗi không tìm thấy tài nguyên |
| **409** | `SLUG_CONFLICT` | Slug đã tồn tại trên một chuyên mục khác | Tô đỏ ô Slug và hiển thị thông báo "Slug này đã tồn tại, vui lòng chọn một slug khác" |
| **500** | `DB_ERROR` | Lỗi kết nối PostgreSQL hoặc lỗi nội bộ | Hiển thị thông báo lỗi máy chủ kèm nút thử lại |
