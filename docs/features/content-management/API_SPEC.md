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
