# 🔄 Sơ Đồ Luồng Nghiệp Vụ & Tương Tác Kỹ Thuật (FLOW.md)
## PHASE 1 - CORE DATA LAYER, CAR CATALOG & ADMIN AUTHENTICATION

> **Role:** `logic-flow-ba`  
> **Phạm vi tác động:** `apps/admin` (Next.js 16), `apps/api` (REST Backend), `packages/database` (PostgreSQL)

---

## 1. Luồng 1: Xác Thực Admin & Bảo Vệ Tuyến Đường (Authentication & Route Guard)

Sơ đồ tuần tự xử lý khi người dùng truy cập trang Quản trị viên:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên
    participant Browser as Browser (apps/admin)
    participant Middleware as Next.js 16 Middleware
    participant API as REST API (apps/api)
    participant DB as PostgreSQL (packages/database)

    Admin->>Browser: Truy cập /admin/cars
    Browser->>Middleware: Request GET /admin/cars (kèm Cookies)
    alt Không có Cookie admin_token hoặc Token Hết hạn
        Middleware-->>Browser: Redirect 307 tới /admin/login?redirect=/admin/cars
        Browser-->>Admin: Hiển thị Màn hình Đăng nhập Admin
        Admin->>Browser: Nhập email & mật khẩu -> Bấm "Đăng nhập"
        Browser->>API: POST /api/auth/login { email, password }
        API->>DB: Query users WHERE email = $1
        DB-->>API: Trả về record user (gồm password_hash, token_version)
        API->>API: bcrypt.compare(password, password_hash)
        alt Mật khẩu không khớp
            API-->>Browser: 401 Unauthorized { code: "INVALID_CREDENTIALS" }
            Browser-->>Admin: Hiển thị thông báo "Sai tài khoản hoặc mật khẩu"
        else Mật khẩu hợp lệ
            API->>API: Ký JWT (chứa userId, email, role, token_version)
            API-->>Browser: 200 OK + Set-Cookie: admin_token=<jwt>; HttpOnly; SameSite=Lax
            Browser->>Browser: Chuyển hướng về /admin/cars
        end
    else Có Cookie admin_token hợp lệ
        Middleware->>Middleware: Verify JWT Signature với JWT_SECRET
        Middleware-->>Browser: Cho phép đi tiếp (NextResponse.next())
        Browser->>API: GET /api/cars?status=all (kèm cookie)
        API->>DB: Query danh sách xe
        DB-->>API: Trả về dữ liệu
        API-->>Browser: 200 OK
        Browser-->>Admin: Render Giao diện Bảng Quản trị Dòng xe
    end
```

---

## 2. Luồng 2: Quản Trị Viên Tạo Dòng Xe, Phiên Bản & Gán Màu Ngoại Thất

Quy trình nhập liệu chuẩn xác một dòng xe ô tô theo đúng thứ tự ràng buộc khóa ngoại:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên
    participant AdminUI as apps/admin (Next.js 16)
    participant API as apps/api (Node.js)
    participant DB as PostgreSQL (Drizzle ORM)

    Note over Admin,DB: Bước 1: Khởi tạo Bảng Màu Ngoại Thất dùng chung
    Admin->>AdminUI: Vào /admin/colors -> Nhập "Trắng Ngọc Trai", Hex: #F5F5F5
    AdminUI->>API: POST /api/admin/colors
    API->>DB: INSERT INTO colors (ten_mau, hex_code)
    DB-->>API: Trả về color_id

    Note over Admin,DB: Bước 2: Tạo Dòng Xe Mới (Mẫu xe cha)
    Admin->>AdminUI: Tạo xe "Hyundai Tucson 2025" -> Tự sinh slug "tucson-2025"
    AdminUI->>API: POST /api/admin/cars { tenXe, slug, taxRate: 0.10, highlightFeatures }
    API->>DB: INSERT INTO cars
    DB-->>API: Trả về car_id

    Note over Admin,DB: Bước 3: Thêm các Phiên Bản Xe
    Admin->>AdminUI: Thêm phiên bản "2.0 Xăng Tiêu Chuẩn", giá: 769.000.000 VNĐ
    AdminUI->>API: POST /api/admin/cars/{car_id}/versions
    API->>DB: INSERT INTO car_versions (car_id, ten_phien_ban, gia_niem_yet)
    DB-->>API: Trả về version_id

    Note over Admin,DB: Bước 4: Ghép Màu Sơn & Ảnh Chi Tiết theo Màu vào Phiên Bản
    Admin->>AdminUI: Chọn màu "Trắng Ngọc Trai" cho bản Tiêu chuẩn + Upload ảnh xe màu trắng
    AdminUI->>API: POST /api/admin/versions/{version_id}/colors { colorId, anhXeTheoMauId }
    API->>DB: INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_id)
    DB-->>API: 201 Created (Bảo đảm Unique Composite Index)
    API-->>AdminUI: Cập nhật giao diện xe thành công
    AdminUI-->>Admin: Hiển thị xe với đầy đủ phiên bản & màu sắc
```

---

## 3. Luồng 3: Khách Hàng Truy Vấn Danh Mục Xe (Storefront Catalog Query)

Quy trình truy vấn dữ liệu tối ưu với 1 câu lệnh Eager Loading:

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách Hàng
    participant Web as apps/web (Next.js 16 Storefront)
    participant API as apps/api
    participant DB as PostgreSQL

    User->>Web: Truy cập /xe/tucson-2025
    Web->>API: GET /api/cars/tucson-2025
    API->>DB: Drizzle query.cars.findFirst({ where: eq(slug, 'tucson-2025'), with: { versions: { with: { versionColors: { with: { color: true } } } } } })
    Note over DB: Chạy 1 câu truy vấn JOIN có index tối ưu (< 3ms)
    DB-->>API: Trả về cây dữ liệu đầy đủ (Car + Versions + Swatches)
    API-->>Web: Trả về JSON Data
    Web->>Web: Render Giao diện xe: Mặc định chọn phiên bản đầu tiên và màu chủ đạo
    Web-->>User: Khách hàng nhìn thấy xe và có thể click đổi màu tức thì
```
