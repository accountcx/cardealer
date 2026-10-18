# 🔄 FLOW: Static Pages CMS & Showroom System Settings

> **Module:** `static-pages`  
> **Tài liệu tham chiếu:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md)  

---

## 1. Sơ Đồ Trạng Thái Xuất Bản Trang Tĩnh (Publishing State Machine)

```mermaid
stateDiagram-v2
    [*] --> Draft : Tạo mới trang tĩnh
    Draft --> Published : Bật is_published = true
    Published --> Draft : Chuyển về nháp (Ẩn khỏi Storefront)
    Published --> [*] : Xóa trang
    Draft --> [*] : Xóa trang
```

---

## 2. Sequence Diagram: Hiển Thị Trang Tĩnh Động Trên Storefront

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Browser)
    participant Storefront as Next.js Storefront (apps/web)
    participant Backend as Backend API (apps/api)
    participant DB as PostgreSQL Database

    Customer->>Storefront: Truy cập URL /[slug] (VD: /gioi-thieu)
    Storefront->>Backend: GET /api/pages/gioi-thieu
    Backend->>DB: SELECT * FROM static_pages WHERE slug = 'gioi-thieu' AND is_published = true
    
    alt Không tìm thấy trang hoặc is_published = false
        DB-->>Backend: Empty row
        Backend-->>Storefront: HTTP 404 Not Found
        Storefront-->>Customer: Hiển thị trang 404 chuẩn Hyundai
    else Trang tồn tại và đã xuất bản
        DB-->>Backend: StaticPage Row
        Backend-->>Storefront: HTTP 200 OK (Data + Technical SEO)
        Storefront->>Storefront: Render Tiptap Content an toàn & nhúng Schema JSON-LD
        Storefront-->>Customer: Trả về trang HTML E-E-A-T hoàn chỉnh
    end
```

---

## 3. Sequence Diagram: Quản Trị Viên Cập Nhật Cấu Hình Showroom

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên (CMS)
    participant AdminApp as Admin Portal (apps/admin)
    participant Backend as Backend API (apps/api)
    participant DB as PostgreSQL Database

    Admin->>AdminApp: Sửa số hotline mới & bấm "Lưu Thay Đổi"
    AdminApp->>Backend: PUT /api/admin/settings/contact_settings (Bearer JWT, Payload)
    Backend->>Backend: Verify Token & check quyền 'system:write'
    Backend->>Backend: Validate payload bằng ContactSettingsSchema
    Backend->>DB: UPSERT INTO system_settings (key = 'contact_settings', data = ...)
    DB-->>Backend: Row updated
    Backend-->>AdminApp: HTTP 200 OK { success: true }
    AdminApp-->>Admin: Hiển thị thông báo lưu thành công
```
