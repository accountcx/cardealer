# 🌐 API SPECIFICATION: Static Pages CMS & Showroom System Settings

> **Module:** `static-pages`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Public Storefront Endpoints

### 🔹 `GET /api/pages/:slug`
- **Mục đích:** Lấy dữ liệu trang tĩnh đã xuất bản để render phía Storefront.
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "id": "p1a2b3c4-...",
        "title": "Giới thiệu Hyundai Dũng Lạc",
        "slug": "gioi-thieu",
        "content": { "type": "doc", "content": [...] },
        "templateType": "PROFILE_SHOWROOM",
        "metaTitle": "Đại Lý Hyundai Dũng Lạc - Nghệ An",
        "metaDescription": "Showroom ô tô Hyundai chính hãng hàng đầu tại Nghệ An & Hà Tĩnh.",
        "schemaType": "AboutPage"
      }
    }
    ```
  - **`404 Not Found`**: Trang không tồn tại hoặc `is_published = false`.

---

## 2. Admin CMS Endpoints (Protected by JWT)

### 🔹 `GET /api/admin/pages`
- **Headers:** `Authorization: Bearer <token>` (Yêu cầu quyền `pages:read`)
- **Query Parameters:** `page`, `limit`, `search`, `isPublished`
- **Responses:**
  - **`200 OK`**: Danh sách trang tĩnh có phân trang.

---

### 🔹 `POST /api/admin/pages`
- **Headers:** `Authorization: Bearer <token>` (Yêu cầu quyền `pages:write`)
- **Request Body:**
  ```json
  {
    "title": "Chính Sách Bảo Hành 5 Năm",
    "slug": "chinh-sach-bao-hanh",
    "content": { "type": "doc", "content": [...] },
    "templateType": "DEFAULT",
    "isPublished": true
  }
  ```
- **Responses:**
  - **`201 Created`**: Tạo trang mới thành công.
  - **`409 Conflict`**: Slug đã tồn tại.

---

### 🔹 `PUT /api/admin/settings/:key`
- **Headers:** `Authorization: Bearer <token>` (Yêu cầu quyền `system:write`)
- **Responses:**
  - **`200 OK`**: Cập nhật cấu hình thành công.

---

## 3. Helper Functions Specification (Core Package)

### 🔹 Helper: `optimizeCloudinaryUrl(url, options)`
- **Vị trí:** `@cardealer/core`
- **Đầu vào:** `url: string | null | undefined`, `options?: CloudinaryTransformOptions`
- **Đầu ra:** `string` (URL đã được tiêm cờ biến đổi hoặc URL fallback)
- **Hành vi:**
  - Trả về empty string nếu URL null hoặc undefined.
  - Tự động phát hiện URL Cloudinary (`res.cloudinary.com`).
  - Chèn `/upload/f_auto,q_auto,w_...,c_fill/` ngay sau `/upload/`.
  - Nếu đã có cờ transformation cũ, thay thế bằng cờ mới tương thích.
  - Bảo lưu 100% URL gốc nếu không phải Cloudinary.
