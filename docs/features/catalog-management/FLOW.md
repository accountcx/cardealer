# 🔄 FLOW: Catalog & Vehicle Specification Engine

> **Module:** `catalog-management`  
> **Tài liệu tham chiếu:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md)  

---

## 1. Sơ Đồ Trạng Thái Vòng Đời Dòng Xe (Car Status State Machine)

```mermaid
stateDiagram-v2
    [*] --> Draft : Tạo mới dòng xe
    Draft --> Published : Xuất bản lên Storefront
    Published --> Draft : Hạ xuống sửa đổi nội bộ
    Published --> Archived : Ngừng kinh doanh
    Archived --> Published : Khôi phục kinh doanh
    Archived --> [*] : Xóa vĩnh viễn
```

---

## 2. Sequence Diagram: Tải Trang Chi Tiết & Chuyển Đổi Màu Sơn Ngoại Thất

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Browser)
    participant Storefront as Next.js Storefront (apps/web)
    participant Backend as Backend API (apps/api)
    participant DB as PostgreSQL Database

    Customer->>Storefront: Truy cập /xe/hyundai-santa-fe?mau=trang
    Storefront->>Backend: GET /api/catalog/cars/hyundai-santa-fe
    Backend->>DB: Query cars join car_versions, colors, version_colors
    DB-->>Backend: Trả về CarDetail payload đầy đủ
    Backend-->>Storefront: HTTP 200 OK (JSON)
    Storefront->>Storefront: Xác định activeVersion & activeColor ('trang')
    Storefront-->>Customer: Render giao diện xe với ảnh màu Trắng
    
    Customer->>Storefront: Click chọn nút màu 'Đen'
    Storefront->>Storefront: Tìm version_color có colorSlug = 'den'
    Storefront->>Storefront: Cập nhật state ảnh chính & URL query ?mau=den
    Storefront-->>Customer: Hiển thị mượt mà ảnh màu Đen (Zero Reload)
```

---

## 3. Sequence Diagram: Quản Trị Viên Tạo Dòng Xe Mới

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên (CMS)
    participant AdminApp as Admin Portal (apps/admin)
    participant Backend as Backend API (apps/api)
    participant DB as PostgreSQL Database

    Admin->>AdminApp: Điền thông tin xe mới & bấm "Lưu Dòng Xe"
    AdminApp->>Backend: POST /api/admin/cars (Bearer JWT, CarPayload)
    Backend->>Backend: Xác thực JWT & kiểm tra quyền 'cars:write'
    Backend->>DB: Kiểm tra trùng lặp slug (SELECT id FROM cars WHERE slug = ?)
    alt Trùng slug
        DB-->>Backend: Trả về record trùng
        Backend-->>AdminApp: HTTP 409 Conflict (Mã slug đã tồn tại)
        AdminApp-->>Admin: Hiển thị thông báo lỗi trùng slug
    else Slug hợp lệ
        Backend->>DB: INSERT INTO cars VALUES (...)
        DB-->>Backend: Car Row created
        Backend-->>AdminApp: HTTP 201 Created (Car Object)
        AdminApp-->>Admin: Thông báo tạo xe thành công & chuyển tới trang chỉnh sửa phiên bản
    end
```
