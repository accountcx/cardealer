# 🔄 Technical Flow Specification: Quản Trị Chuyên Mục Bài Viết (Admin Categories Management)

## 1. Sequence Diagram Đa Tầng (End-to-End Sequence)

### 1.1. Luồng Tạo / Chỉnh Sửa Chuyên Mục (Auto-slug & Strict Unique Guard)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👤 Admin Editor
    participant Form as 🖥️ CategoryModal (apps/admin)
    participant API as ⚙️ Categories Controller (apps/api)
    participant DB as 🗄️ PostgreSQL (Drizzle ORM)

    Admin->>Form: Nhập Tên chuyên mục (vd: "Đánh Giá Xe Hyundai")
    Form->>Form: Client Helper slugifyVN("Đánh Giá Xe Hyundai")
    Form-->>Admin: Tự động điền Slug: "danh-gia-xe-hyundai"
    
    opt Admin muốn tùy biến Slug
        Admin->>Form: Sửa trực tiếp Slug thành "danh-gia-xe"
        Form->>Form: Validate format slug /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    end

    Admin->>Form: Nhập Mô tả, Thứ tự hiển thị & Click "Lưu Chuyên Mục"
    Form->>API: POST /api/admin/categories (hoặc PUT /api/admin/categories/:id)
    Note over Form,API: Header: Authorization Bearer JWT (Role: posts:write)

    API->>API: Zod Validation (createCategorySchema / updateCategorySchema)
    alt Payload Không hợp lệ (Tên rỗng / Slug sai format)
        API-->>Form: 400 Bad Request (INVALID_INPUT)
        Form-->>Admin: Hiển thị lỗi đỏ dưới input field tương ứng
    else Payload Hợp lệ
        API->>DB: Query check trùng Slug (categories.slug == slug AND id != currentId)
        alt Trùng Slug đã tồn tại
            DB-->>API: Row Found (Slug conflict)
            API-->>Form: 409 Conflict ("Slug này đã tồn tại trên hệ thống, vui lòng chọn một slug khác")
            Form-->>Admin: Banner cảnh báo lỗi trùng Slug
        else Slug Hợp lệ & Duy nhất
            API->>DB: INSERT / UPDATE categories VALUES (...)
            DB-->>API: Commit Success (Returning CategoryRow)
            API-->>Form: 200/201 Success (JSON Entity)
            Form-->>Admin: Đóng Modal & Toast thông báo thành công & Tự làm mới bảng
        end
    end
```

---

### 1.2. Luồng Lấy Danh Sách Kèm Thống Kê Số Bài Viết (Post Count Aggregate)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👤 Admin Editor
    participant Page as 🖥️ /categories Page (apps/admin)
    participant API as ⚙️ GET /api/admin/categories (apps/api)
    participant DB as 🗄️ PostgreSQL (Drizzle ORM)

    Admin->>Page: Mở trang Quản trị Chuyên mục
    Page->>Page: Kích hoạt Loading State (Skeleton Shimmer Table)
    Page->>API: GET /api/admin/categories
    
    API->>API: RBAC Check (posts:read)
    API->>DB: SELECT c.*, COUNT(p.id) as post_count FROM categories c LEFT JOIN posts p ON p.category_id = c.id GROUP BY c.id ORDER BY c.sort_order ASC, c.created_at DESC
    DB-->>API: Categories List với postCount chính xác
    API-->>Page: 200 OK { success: true, data: CategoryItemWithCount[] }
    
    alt Dữ liệu Rỗng (0 chuyên mục)
        Page-->>Admin: Hiển thị Empty State + Nút CTA "Thêm chuyên mục đầu tiên"
    else Có dữ liệu
        Page-->>Admin: Render Data State (Table: Tên, Slug, Số bài viết, Thứ tự, Ngày tạo, Nút Sửa/Xóa)
    end
```

---

### 1.3. Luồng Chặn Xóa An Toàn 2 Lớp (Dual-Layer Restrict Delete Guard)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👤 Admin Editor
    participant UI as 🖥️ /categories Table (apps/admin)
    participant Modal as ⚠️ ConfirmModal (apps/admin)
    participant API as ⚙️ DELETE /api/admin/categories/:id (apps/api)
    participant DB as 🗄️ PostgreSQL (Drizzle ORM)

    Admin->>UI: Click icon Thùng rác (Xóa) tại một dòng chuyên mục
    
    alt Lớp 1 (UI Guard): postCount > 0
        UI->>Modal: Mở modal cảnh báo Chặn Xóa
        Modal-->>Admin: "Không thể xóa chuyên mục đang có 12 bài viết. Vui lòng chuyển bài viết sang chuyên mục khác trước khi xóa." (Nút Xác nhận bị vô hiệu hóa)
    else Lớp 1 (UI Guard): postCount == 0
        UI->>Modal: Mở modal xác nhận xóa thông thường
        Admin->>Modal: Click "Xác nhận xóa"
        Modal->>API: DELETE /api/admin/categories/:id
        
        API->>API: RBAC Check (posts:write)
        API->>DB: Query đếm lại bài viết: SELECT count(*) FROM posts WHERE category_id = :id
        
        alt Lớp 2 (API Guard): Phát hiện có bài viết mới gán đồng thời (Race Condition)
            DB-->>API: count > 0
            API-->>Modal: 400 Bad Request ("Chuyên mục đang chứa bài viết, không thể xóa")
            Modal-->>Admin: Toast thông báo lỗi đỏ
        else Không còn bài viết nào
            API->>DB: DELETE FROM categories WHERE id = :id
            alt Lớp 3 (DB Fallback): Ràng buộc FK onDelete: 'restrict' bảo vệ
                DB-->>API: Delete Success
                API-->>Modal: 200 OK { success: true, message: "Đã xóa chuyên mục thành công" }
                Modal-->>Admin: Toast xanh thành công & Reload danh sách
            end
        end
    end
```

---

### 1.4. Luồng Người Dùng Xem & Lọc Tin Tức Trên Storefront
```mermaid
sequenceDiagram
    autonumber
    actor User as 🌐 Khách hàng
    participant Web as 📱 apps/web (/tin-tuc)
    participant API as ⚙️ apps/api (/api/posts)
    participant DB as 🗄️ PostgreSQL

    User->>Web: Truy cập /tin-tuc?category=danh-gia-xe
    Web->>API: GET /api/posts?category=danh-gia-xe&status=published
    API->>DB: Query tìm category_id theo slug "danh-gia-xe"
    API->>DB: SELECT * FROM posts WHERE category_id = :catId AND status = 'published'
    DB-->>API: Danh sách bài viết
    API-->>Web: Trả về bài viết thuộc chuyên mục "Đánh Giá Xe"
    Web-->>User: Render H1 "Tin Tức: Đánh Giá Xe" + Active Tab "Đánh Giá Xe"
```

---

## 2. Sơ đồ Trạng thái Thực thể (State Machine Diagram)

```mermaid
stateDiagram-v2
    [*] --> FORM_INPUT: Admin mở Modal Tạo Chuyên mục
    FORM_INPUT --> SLUG_AUTO: Nhập Tên (Auto-slugify)
    FORM_INPUT --> SLUG_MANUAL: Click sửa Slug tùy biến
    SLUG_AUTO --> VALIDATING: Submit Form
    SLUG_MANUAL --> VALIDATING: Submit Form
    
    VALIDATING --> SLUG_CONFLICT: Slug đã tồn tại (409)
    SLUG_CONFLICT --> FORM_INPUT: Admin chọn Slug khác
    
    VALIDATING --> ACTIVE_EMPTY: Tạo thành công (postCount = 0)
    ACTIVE_EMPTY --> ACTIVE_LINKED: Bài viết được gán vào chuyên mục (postCount > 0)
    ACTIVE_LINKED --> ACTIVE_EMPTY: Bài viết bị xóa hoặc đổi sang chuyên mục khác (postCount = 0)
    
    ACTIVE_LINKED --> DELETE_BLOCKED: Admin cố gắng Xóa (Chặn xóa an toàn)
    DELETE_BLOCKED --> ACTIVE_LINKED: Giữ nguyên trạng thái
    
    ACTIVE_EMPTY --> DELETED: Admin Xác nhận Xóa (Xóa thành công)
    DELETED --> [*]
```

---

## 3. Bảng Giải Phẫu Từng Bước (Step Anatomy Table)

| Bước # | Tác nhân | Hành động | Payload Input | Logic Xử lý & Rules | Output & DB State | Failure Mode & Recovery |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Admin | Nhập tên chuyên mục | `tenChuyenMuc: "Tin Khuyến Mãi"` | Client helper tự sinh slug tiếng Việt không dấu | `slug: "tin-khuyen-mai"` | Ký tự lạ ➡️ Tự động khử ký tự đặc biệt |
| **2** | Admin | Submit Form | `{ tenChuyenMuc, slug, moTa, sortOrder }` | Client Zod validate format | Chuyển sang HTTP Request | Form hiển thị validation error vi mô |
| **3** | Backend | Xác thực Unique Slug | `slug: "tin-khuyen-mai"` | Query `categories.slug == slug` (loại trừ `id` nếu là update) | `existing: null` ➡️ Hợp lệ | Trùng slug ➡️ Trả về `409 Conflict`, không tạo |
| **4** | Backend | Lưu vào DB | DTO đã sanitize | Drizzle insert/update vào bảng `categories` | Row mới được tạo với UUID v4 | Lỗi DB ➡️ Trả về `500 DB_ERROR` |
| **5** | Admin | Xem bảng Chuyên mục | Truy cập `/categories` | Query Drizzle `LEFT JOIN posts GROUP BY categories.id` | Trả về mảng kèm `postCount: integer` | Lỗi mạng ➡️ Giao diện hiển thị Error State + Nút Retry |
| **6** | Admin | Thao tác Xóa | Click Xóa ID chuyên mục | Kiểm tra `postCount > 0` | Nếu `postCount > 0`: Chặn xóa ngay tại UI & API | Cố tình bypass API ➡️ DB FK `restrict` chặn |
