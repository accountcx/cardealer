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

---

## 4. Sequence Diagram: Tải Trang Tối Ưu Hiệu Năng & Bản Đồ Facade (US-03)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách Hàng / Googlebot
    participant Browser as Trình Duyệt Web
    participant Storefront as Next.js SSR (apps/web)
    participant CoreMedia as Core Media Optimizer (@cardealer/core)
    participant Cloudinary as Cloudinary CDN
    participant GoogleMaps as Google Maps Engine

    User->>Browser: Truy cập trang chủ /xehyundaivinh.com
    Browser->>Storefront: GET /
    Storefront->>CoreMedia: optimizeCloudinaryUrl(rawUrl, { width: 600, quality: 'auto' })
    CoreMedia-->>Storefront: URL biến đổi f_auto,q_auto,w_600,c_fill
    Storefront-->>Browser: HTML kết xuất SSR + Footer Map Facade (0 Google Maps JS)
    
    Note over Browser: FCP & Hydration hoàn tất siêu tốc (< 1s, 0 Long Tasks)
    Browser->>Cloudinary: Tải ảnh đã nén (~20 KiB thay vì 500 KiB)
    
    Note over Browser: Trình duyệt chuyển sang trạng thái Rảnh (Idle)
    Browser->>Browser: Kích hoạt next/script strategy="lazyOnload" (GTM, GA4, Clarity)
    
    opt Khách hàng tương tác với bản đồ ở Footer
        User->>Browser: Bấm "Xem bản đồ tương tác" trên Map Facade
        Browser->>GoogleMaps: Kích hoạt tải iframe embed & thư viện bản đồ
        GoogleMaps-->>Browser: Render bản đồ tương tác mượt mà
    end
```
