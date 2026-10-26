# 🌐 API SPECIFICATION: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Public Storefront Endpoints

### 🔹 `GET /api/posts`
- **Mục đích:** Lấy danh sách bài viết phân trang phục vụ trang `/tin-tuc`.
- **Query Parameters:** `page`, `limit`, `categorySlug`, `isFeatured`
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "post-1...",
          "tieuDe": "Đánh giá chi tiết Hyundai Santa Fe 2026",
          "slug": "danh-gia-hyundai-santa-fe-2026",
          "anhDaiDienUrl": "https://res.cloudinary.com/.../santafe.jpg",
          "anhDaiDienAlt": "Đầu xe Hyundai Santa Fe 2026",
          "tomTat": "Tổng quan thiết kế hình khối hộp và công nghệ an toàn SmartSense.",
          "category": { "name": "Đánh giá xe", "slug": "danh-gia-xe" },
          "readingTime": 5,
          "publishedAt": "2026-10-18T10:00:00Z"
        }
      ],
      "pagination": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
    }
    ```

---

### 🔹 `GET /api/posts/:slug`
- **Mục đích:** Lấy chi tiết toàn văn bài viết kèm cấu trúc Tiptap AST để hiển thị trên Storefront.
- **Responses:**
  - **`200 OK`**: Trả về dữ liệu bài viết kèm `noiDung` dạng JSON AST.
  - **`404 Not Found`**: Bài viết không tồn tại hoặc chưa xuất bản.

---

## 2. Admin Editorial Endpoints (Protected by JWT)

### 🔹 `POST /api/admin/posts`
- **Headers:** `Authorization: Bearer <token>` (Yêu cầu quyền `posts:write`)
- **Request Body:**
  ```json
  {
    "tieuDe": "Bảng Giá Xe Hyundai Mới Nhất Tháng 11",
    "slug": "bang-gia-xe-hyundai-thang-11",
    "categoryId": "c1...",
    "anhDaiDienUrl": "https://...",
    "anhDaiDienAlt": "Bảng giá xe",
    "noiDung": { "type": "doc", "content": [...] },
    "focusKeyword": "bảng giá xe hyundai",
    "status": "published"
  }
  ```
- **Responses:**
  - **`201 Created`**: Tạo và xuất bản bài viết thành công.

---

### 🔹 `POST /api/admin/media/upload`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Responses:**
  - **`201 Created`**: Trả về `secure_url`, `public_id`, `width`, `height`.

---

## 3. AI Editorial Assistant Endpoints

### 🔹 `POST /api/admin/ai/generate` (Single Block Mode)
- **Headers:** `Authorization: Bearer <token>` hoặc HttpOnly `admin_token` Cookie
- **Yêu cầu quyền RBAC:** `posts:write`
- **Request Body (`AiGenerateRequest`):**
  ```json
  {
    "action": "generate_single_block",
    "prompt": "prosCons",
    "context": "Tiêu đề: Đánh giá chi tiết Hyundai Santa Fe 2026. Từ khóa: hyundai santa fe 2026. Chỉ đạo: tập trung vào khả năng cách âm và hàng ghế 3.",
    "keyword": "hyundai santa fe 2026",
    "carModel": "Hyundai Santa Fe",
    "carSlug": "santa-fe",
    "location": "Nghệ An & Hà Tĩnh"
  }
  ```
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "action": "generate_single_block",
        "model": "gpt-4o-mini",
        "blocks": [
          {
            "type": "prosCons",
            "title": "Ưu Điểm & Nhược Điểm Xe Hyundai Santa Fe 2026",
            "pros": [
              "Thiết kế hình hộp vuông vức độc đáo, khoang hành lý mở rộng vượt trội",
              "Hệ thống an toàn chủ động Hyundai SmartSense thế hệ mới",
              "Động cơ Smartstream vận hành êm ái, cách âm khung gầm tốt",
              "Khoang nội thất sang trọng với 2 màn hình cong liền khối 12.3 inch"
            ],
            "cons": [
              "Thiết kế dải đèn hậu đặt thấp gây nhiều ý kiến trái chiều",
              "Giá niêm yết các phiên bản cao cấp có sự chênh lệch đáng kể"
            ]
          }
        ],
        "usage": {
          "promptTokens": 1450,
          "completionTokens": 320,
          "totalTokens": 1770
        }
      }
    }
    ```
  - **`400 Bad Request`**: Thiếu tham số hoặc action không hợp lệ (`INVALID_AI_REQUEST`).
  - **`403 Forbidden`**: Tài khoản không có quyền biên tập bài viết (`FORBIDDEN`).
  - **`504 Gateway Timeout`**: OpenAI phản hồi quá thời hạn tối đa 120s (`PROXY_FORWARD_TIMEOUT`).

