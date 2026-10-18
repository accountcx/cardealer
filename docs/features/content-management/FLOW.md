# 🔄 FLOW: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Tài liệu tham chiếu:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md)  

---

## 1. Sơ Đồ Trạng Thái Bài Viết (Post Status State Machine)

```mermaid
stateDiagram-v2
    [*] --> Draft : Tạo mới bài viết
    Draft --> Published : Xuất bản ngay
    Draft --> Scheduled : Đặt lịch hẹn giờ đăng
    Scheduled --> Published : Đến thời điểm hẹn giờ
    Published --> Draft : Hạ bài xuống nháp
    Published --> Archived : Lưu trữ / Hết hạn
    Archived --> Published : Tái xuất bản
    Draft --> [*] : Xóa bài viết
```

---

## 2. Sequence Diagram: Tải Trang Chi Tiết Bài Viết & Bóc Tách Mục Lục TOC

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Browser)
    participant Storefront as Next.js Storefront (apps/web)
    participant Backend as Backend API (apps/api)
    participant DB as PostgreSQL Database

    Customer->>Storefront: Truy cập /tin-tuc/danh-gia-hyundai-santa-fe-2026
    Storefront->>Backend: GET /api/posts/danh-gia-hyundai-santa-fe-2026
    Backend->>DB: SELECT * FROM posts JOIN categories JOIN users WHERE slug = ?
    DB-->>Backend: Post Row đầy đủ
    Backend-->>Storefront: HTTP 200 OK (Post Data + AST Content)
    Storefront->>Storefront: Tiptap AST bóc tách Heading 2, Heading 3 sinh Table of Contents
    Storefront->>Storefront: Render bài viết kèm TOC cuộn Sticky và tác giả E-E-A-T
    Storefront-->>Customer: Trả về trang bài viết hoàn chỉnh với điểm SEO tối ưu
```

---

## 3. Sequence Diagram: Tải Ảnh Lên Cloudinary Media Library

```mermaid
sequenceDiagram
    autonumber
    actor Editor as Biên Tập Viên (Admin CMS)
    participant AdminApp as Admin Portal (apps/admin)
    participant Backend as Backend API (apps/api)
    participant Cloudinary as Cloudinary Media Cloud
    participant DB as PostgreSQL Database

    Editor->>AdminApp: Kéo thả file ảnh & nhập Alt Text chuẩn SEO
    AdminApp->>Backend: POST /api/admin/media/upload (Multipart/form-data)
    Backend->>Backend: Kiểm tra định dạng (JPEG, PNG, WebP) và dung lượng (< 10MB)
    Backend->>Cloudinary: Upload stream & tự động chuyển sang WebP
    Cloudinary-->>Backend: Upload Result { secure_url, public_id, width, height }
    Backend->>DB: INSERT INTO media (url, public_id, alt, width, height)
    DB-->>Backend: Media Row created
    Backend-->>AdminApp: HTTP 201 Created (Media Object)
    AdminApp-->>Editor: Chèn ảnh trực tiếp vào vị trí con trỏ của bài viết Tiptap
```
