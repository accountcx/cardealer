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

---

### 3. Gợi Ý Ý Tưởng Bài Viết Chống Trùng Lặp (`POST /api/admin/ai/generate`)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body Payload:**
  ```json
  {
    "action": "generate_topic_ideas",
    "prompt": "Gợi ý các ý tưởng bài viết thực tế cho khách hàng mua xe lần đầu",
    "carModel": "Hyundai Santa Fe",
    "category": "Đánh giá xe",
    "angle": "So sánh chi phí nuôi xe & bảo dưỡng thực tế",
    "ideasCount": 4
  }
  ```
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "action": "generate_topic_ideas",
        "model": "gpt-4o-mini",
        "topicIdeas": [
          {
            "title": "Dự Toán Chi Phí Nuôi Xe Hyundai Santa Fe 2026 Sau 5 Năm: Chi Tiết Từng Hạng Mục",
            "slug": "chi-phi-nuoi-xe-hyundai-santa-fe-5-nam",
            "focusKeyword": "chi phí nuôi xe santa fe 5 năm",
            "angle": "Chi phí vận hành và khấu hao thực tế",
            "contentGap": "Website đã có bài giá bán lăn bánh nhưng chưa có bài tính tổng chi phí bảo dưỡng, nhiên liệu, bảo hiểm đường dài",
            "summary": "Phân tích cụ thể chi phí xăng, bảo dưỡng các cấp mốc 5.000km - 80.000km, phí đường bộ và khấu hao giúp người mua chuẩn bị tài chính vững vàng.",
            "targetCar": "Hyundai Santa Fe",
            "suggestedCategory": "Tư vấn & Kinh nghiệm",
            "outlinePreview": [
              "1. Tổng quan các khoản phí cố định hàng năm",
              "2. Chi phí nhiên liệu thực tế đường trường vs đô thị Vinh",
              "3. Bảng giá bảo dưỡng định kỳ chính hãng tại Hyundai",
              "4. Lời khuyên tối ưu chi phí sử dụng cho gia đình"
            ],
            "searchIntent": "commercial"
          }
        ],
        "usage": {
          "promptTokens": 1820,
          "completionTokens": 680,
          "totalTokens": 2500
        }
      }
    }
    ```
  - **`400 Bad Request`**: Thiếu thông tin hoặc tham số không hợp lệ.
  - **`403 Forbidden`**: Thiếu quyền `posts:write`.


