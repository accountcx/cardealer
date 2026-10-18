# 📜 API và Technical Contract Specification: Thư Viện Ảnh Admin & Tích Hợp Cloudinary (Admin Image Library)

## 1. Giao thức Chung và Chuẩn Hóa Lỗi
* **Base URL:** `/api/admin/media`
* **Xác thực (Authentication):** Bearer JWT Token (`Authorization: Bearer <jwt_token>`) hoặc HttpOnly Cookie (`admin_token`).
* **Phân quyền (RBAC Matrix):**
  - Xem danh sách / chi tiết ảnh: `media:read` (Roles: `admin`, `manager`, `editor`, `sales`).
  - Upload ảnh / Cập nhật metadata: `media:write` (Roles: `admin`, `manager`, `editor`).
  - Xóa ảnh đơn lẻ / Hàng loạt: `media:delete` (Roles: `admin`, `manager`).
* **Cấu trúc Envelope Phản hồi Chuẩn:**
  - **Thành công (Success Response):**
    ```json
    {
      "success": true,
      "data": {}
    }
    ```
  - **Thất bại (Error Response):**
    ```json
    {
      "success": false,
      "error": {
        "code": "ERROR_CODE_STRING",
        "message": "Mô tả lỗi thân thiện bằng tiếng Việt",
        "details": [],
        "timestamp": "2026-09-29T01:30:00.000Z"
      }
    }
    ```

---

## 2. Danh Sách REST Endpoints Chi Tiết

### 2.1. Endpoint Upload Ảnh Đơn / Từng Tệp trong Hàng Đợi (US-01)
* **Method & Path:** `POST /api/admin/media/upload`
* **Quyền hạn:** `media:write`
* **Headers:**
  - `Content-Type: multipart/form-data`
* **Form-Data Payload:**
  - `file`: `Binary File` *(Required, Dung lượng tối đa: 10MB, MIME: image/jpeg, image/png, image/webp, image/gif, image/svg+xml)*.
  - `altText`: `string` *(Optional, Tối đa 255 ký tự)*.
  - `folder`: `string` *(Optional, Default: 'cardealer')*.
* **Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "7b0a88bf-7c87-43a1-b8ea-b1c430e70a31",
    "filename": "hyundai-santafe-2025-hero.webp",
    "url": "https://res.cloudinary.com/ddozajlqu/image/upload/v1727572800/cardealer/hyundai-santafe-2025-hero.webp",
    "publicId": "cardealer/hyundai-santafe-2025-hero_abc123",
    "format": "webp",
    "mimeType": "image/webp",
    "fileSize": 245890,
    "altText": "Hyundai Santa Fe 2025 phiên bản Hybrid cao cấp",
    "width": 1920,
    "height": 1080,
    "folder": "cardealer",
    "uploaderId": "e3b0c442-98fc-1c14-9afb-4c7fa4f00101",
    "createdAt": "2026-09-29T01:30:00.000Z",
    "updatedAt": "2026-09-29T01:30:00.000Z"
  }
}
```

---

### 2.2. Endpoint Danh Sách & Tìm Kiếm Ảnh Phân Trang (US-02)
* **Method & Path:** `GET /api/admin/media`
* **Quyền hạn:** `media:read`
* **Query Parameters:**
  - `page`: `number` *(Optional, Default: 1, Min: 1)*
  - `limit`: `number` *(Optional, Default: 24, Max: 100)*
  - `search`: `string` *(Optional, Tìm kiếm gần đúng theo filename hoặc altText)*
  - `format`: `string` *(Optional: webp, png, jpg, svg...)*
  - `sortBy`: `enum` *(Optional: `newest` (mặc định), `oldest`, `size_asc`, `size_desc`, `name_asc`)*
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "7b0a88bf-7c87-43a1-b8ea-b1c430e70a31",
        "filename": "hyundai-santafe-2025-hero.webp",
        "url": "https://res.cloudinary.com/ddozajlqu/image/upload/v1727572800/cardealer/hyundai-santafe-2025-hero.webp",
        "publicId": "cardealer/hyundai-santafe-2025-hero_abc123",
        "format": "webp",
        "mimeType": "image/webp",
        "fileSize": 245890,
        "altText": "Hyundai Santa Fe 2025 phiên bản Hybrid cao cấp",
        "width": 1920,
        "height": 1080,
        "folder": "cardealer",
        "createdAt": "2026-09-29T01:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 158,
      "page": 1,
      "limit": 24,
      "totalPages": 7,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2.3. Endpoint Cập Nhật Metadata Ảnh (US-02)
* **Method & Path:** `PUT /api/admin/media/:id`
* **Quyền hạn:** `media:write`
* **URL Params:**
  - `id`: `uuid` *(Required)*
* **Request Body (JSON):**
```json
{
  "altText": "Hình ảnh khoang lái xe Hyundai Tucson 2025"
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "7b0a88bf-7c87-43a1-b8ea-b1c430e70a31",
    "altText": "Hình ảnh khoang lái xe Hyundai Tucson 2025",
    "updatedAt": "2026-09-29T01:35:00.000Z"
  }
}
```

---

### 2.4. Endpoint Xóa Ảnh Đơn Lẻ (US-01 & US-02)
* **Method & Path:** `DELETE /api/admin/media/:id`
* **Quyền hạn:** `media:delete`
* **URL Params:**
  - `id`: `uuid` *(Required)*
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "7b0a88bf-7c87-43a1-b8ea-b1c430e70a31",
    "message": "Đã xóa ảnh thành công khỏi hệ thống và Cloudinary"
  }
}
```

---

### 2.5. Endpoint Xóa Hàng Loạt Nhiều Ảnh (Batch Delete - US-02)
* **Method & Path:** `POST /api/admin/media/batch-delete`
* **Quyền hạn:** `media:delete`
* **Request Body (JSON):**
```json
{
  "ids": [
    "7b0a88bf-7c87-43a1-b8ea-b1c430e70a31",
    "a89f110c-34ea-4bf9-89b1-5e2079bb9910"
  ]
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 2,
    "failedCount": 0,
    "failedIds": []
  }
}
```

---

## 3. Ma Trận Mã Lỗi Nghiệp Vụ (Error Matrix)

| HTTP Status | Mã Lỗi (Error Code) | Nguyên nhân Kích hoạt | Hành động Phía Client UI |
| :---: | :---: | :--- | :--- |
| **400** | `NO_FILE_PROVIDED` | Request upload không chứa trường file | Hiển thị thông báo yêu cầu chọn tệp |
| **400** | `FILE_TOO_LARGE` | Dung lượng tệp vượt quá 10MB | Báo lỗi viền đỏ card upload, chặn gửi request |
| **400** | `INVALID_FILE_TYPE` | Định dạng không nằm trong whitelist (chỉ cho phép JPEG, PNG, WEBP, GIF, SVG) | Báo lỗi định dạng không được hỗ trợ |
| **401** | `UNAUTHORIZED` | Không có token hoặc token đã hết hạn | Chuyển hướng về `/login` |
| **403** | `FORBIDDEN` | Tài khoản không có quyền thao tác (`media:write` hoặc `media:delete`) | Hiển thị Toast cảnh báo quyền hạn |
| **404** | `MEDIA_NOT_FOUND` | ID ảnh không tồn tại trong database | Thông báo ảnh không tồn tại hoặc đã bị xóa trước đó |
| **500** | `DATABASE_ERROR` | Lỗi truy vấn PostgreSQL (Insert/Delete) | Báo lỗi hệ thống, kích hoạt dọn rác Cloudinary |
| **502** | `CLOUDINARY_UPLOAD_FAILED` | Cloudinary từ chối kết nối, hết quota hoặc timeout | Hiển thị nút "Thử lại" (Retry) cho từng ảnh lỗi |

---

## 4. Dữ Liệu Mock Chuẩn (Mock JSON Payloads)

```json
{
  "mock_media_item": {
    "id": "9c8a14b5-6548-433b-871d-5c68b7e21a88",
    "filename": "hyundai-creta-2025-white.webp",
    "url": "https://res.cloudinary.com/ddozajlqu/image/upload/v1727572900/cardealer/hyundai-creta-2025-white.webp",
    "publicId": "cardealer/hyundai-creta-2025-white_xyz789",
    "format": "webp",
    "mimeType": "image/webp",
    "fileSize": 182400,
    "altText": "Hyundai Creta 2025 Màu Trắng Ngoại Thất",
    "width": 1600,
    "height": 900,
    "folder": "cardealer",
    "createdAt": "2026-09-29T01:32:00.000Z"
  }
}
```
