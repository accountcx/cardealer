# 🔄 Đặc Tả Luồng Xử Lý Nghiệp Vụ (Logic Flow & State Machine)

> **Feature:** Cấu Trúc Routing Tĩnh & Kiến Trúc Menu (URL Architecture) — `ROUTING-URL-ARCHITECTURE`  
> **Skill Phụ Trách:** `@logic-flow-ba`  
> **Căn cứ:** [BACKLOG.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/BACKLOG.md), [SOLUTION_OPTIONS.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/SOLUTION_OPTIONS.md)  
> **Phạm vi đã chốt:** Nạp dữ liệu qua `getCatalogCars()` + In-Memory Filter; Bỏ qua 301 Redirect ở môi trường Dev Sandbox.

---

## 1. Sequence Diagram: Luồng Tải Trang Dynamic Route `/dong-xe/[slug]`

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng / Googlebot
    participant NextRouter as Next.js App Router (RSC)
    participant Validator as Segment Validator (Registry)
    participant CarsService as cars.service.ts (getCatalogCars)
    participant Cache as Next.js Data Cache ('catalog-cars')
    participant Settings as settings.service.ts
    participant UI as Dynamic Route View (/dong-xe/[slug])

    User->>NextRouter: GET /dong-xe/[slug]
    NextRouter->>Validator: validateSegmentSlug(slug)
    
    alt Slug KHÔNG HỢP LỆ (Không thuộc whitelist: sedan, suv, mpv)
        Validator-->>NextRouter: false
        NextRouter->>NextRouter: Kích hoạt notFound()
        NextRouter-->>User: HTTP 404 Not Found (SEO Clean 404)
    else Slug HỢP LỆ (Thuộc whitelist)
        Validator-->>NextRouter: true (Phân khúc chuẩn hóa: sedan/suv/mpv)
        
        par Nạp Dữ Liệu Đồng Thời
            NextRouter->>CarsService: getCatalogCars()
            CarsService->>Cache: Fetch với ISR revalidate 60s
            Cache-->>CarsService: CarCatalogItem[] (Toàn bộ xe Published)
            CarsService-->>NextRouter: Toàn bộ danh mục xe
        and Nạp Cấu Hình Showroom
            NextRouter->>Settings: getStorefrontSettings()
            Settings-->>NextRouter: SiteSettings & ContactSettings (Hotline)
        end

        NextRouter->>NextRouter: Lọc xe in-memory (car.segment === normalizedSegment)
        NextRouter->>NextRouter: Khởi tạo Metadata, Breadcrumbs, JSON-LD Schema
        
        alt Phân khúc CÓ xe published
            NextRouter->>UI: Render H1, Mô tả SEO ~200 chữ, Lưới CarCard
            UI-->>User: HTTP 200 OK (Full SSR HTML)
        else Phân khúc TẠM HẾT xe (Empty State)
            NextRouter->>UI: Render H1, Mô tả SEO, Khung Empty State & Nút Gọi Hotline
            UI-->>User: HTTP 200 OK (Graceful Degradation)
        end
    end
```

---

## 2. State Machine: Vòng Đời Phân Giải Slug & Trạng Thái Giao Diện

```mermaid
stateDiagram-v2
    [*] --> Idle: Khởi tạo yêu cầu URL
    
    Idle --> SlugParsing: Nhận [slug] từ params
    
    state SlugParsing {
        [*] --> Normalize: Chuẩn hóa chữ thường (slug.toLowerCase().trim())
        Normalize --> CheckRegistry: Đối chiếu Whitelist ['sedan', 'suv', 'mpv']
    }
    
    CheckRegistry --> Trigger404: Không khớp Whitelist
    Trigger404 --> [*]: HTTP 404 Not Found
    
    CheckRegistry --> FetchingData: Khớp Whitelist
    
    state FetchingData {
        [*] --> FetchCars: Gọi getCatalogCars()
        FetchCars --> FilterCars: Lọc car.segment hoặc car.kieuDang
        FilterCars --> CheckCount: Đếm số lượng xe kết quả
    }
    
    CheckCount --> HasCarsState: Count > 0
    CheckCount --> ZeroCarsState: Count === 0
    
    state HasCarsState {
        [*] --> RenderMetadata: Sinh canonical & OpenGraph
        RenderMetadata --> RenderContent: Khối H1 + 200 chữ giới thiệu
        RenderContent --> RenderGrid: Lưới CarCard responsive
    }
    
    state ZeroCarsState {
        [*] --> RenderZeroMetadata: Sinh canonical
        RenderZeroMetadata --> RenderZeroContent: Khối H1 + 200 chữ giới thiệu
        RenderZeroContent --> RenderEmptyBox: Banner thông báo + Hotline Showroom
    }
    
    HasCarsState --> [*]: HTTP 200 OK (Success)
    ZeroCarsState --> [*]: HTTP 200 OK (Empty Handled)
```

---

## 3. Sequence Diagram: Đồng Bộ Dữ Liệu Navigation & Footer Settings

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / Setup
    participant Seed as seedSystemSettings()
    participant DB as Postgres (Bảng system_settings)
    participant Web as Apps/Web Storefront (Navbar & MobileDrawer)
    actor Client as Người Dùng Duyệt Web

    Dev->>Seed: Thực thi nạp seed dữ liệu mới
    Seed->>DB: INSERT / UPDATE system_settings<br/>key: 'navigation_settings' & 'footer_settings'
    Note over DB: Lưu link tĩnh: /dong-xe/sedan, /dong-xe/suv, /dong-xe/mpv
    
    Client->>Web: Truy cập bất kỳ trang nào (Trang chủ / Xe / ...)
    Web->>DB: getStorefrontSettings() (Cached 60s)
    DB-->>Web: NavigationSettings (Header links & Footer links)
    Web->>Web: Render Menu cấp 2 "Dòng Xe":
    Note over Web: 1. Sedan -> /dong-xe/sedan<br/>2. SUV -> /dong-xe/suv<br/>3. MPV -> /dong-xe/mpv
    Web-->>Client: Menu trỏ link tĩnh chuẩn SEO, click chuyển trang tức thì
```

---

## 4. Ma Trận Xử Lý Các Tình Huống Biên (Edge Cases & Resilience Matrix)

| STT | Tình huống biên (Edge Case) | Hành vi mong muốn (Expected Behavior) | Cơ chế kỹ thuật phòng vệ |
| :---: | :--- | :--- | :--- |
| **E-01** | Slug có ký tự hoa/thường: `/dong-xe/SUV` hoặc `/dong-xe/Sedan` | Tự động chuyển về chữ thường và nạp đúng dữ liệu phân khúc tương ứng. | Sử dụng `slug.toLowerCase()` trước khi validate và render canonical lowercase. |
| **E-02** | Slug rác hoặc injection: `/dong-xe/xe-dua`, `/dong-xe/123`, `/dong-xe/' OR 1=1` | Không truy vấn bừa bãi, ngắt luồng ngay và trả về trang 404 chuẩn SEO. | Whitelist cứng: `['sedan', 'suv', 'mpv']`. Nếu không khớp ➡️ gọi `notFound()` từ `next/navigation`. |
| **E-03** | Phân khúc chưa có xe published (ví dụ phân khúc MPV tạm hết xe) | Trang vẫn hiển thị tiêu đề `<h1>` và đoạn văn SEO E-E-A-T đầy đủ, hiển thị Empty State sang trọng kèm hotline tư vấn. | Không để trang bị trắng layout hay crash 500. Render Component `CatalogEmptyState`. |
| **E-04** | API Backend (`apps/api`) tạm thời timeout hoặc chập chờn | Server Component bắt lỗi bằng `try/catch`, render giao diện thông báo nhẹ nhàng với nút "Thử lại", không vỡ toàn bộ layout chính. | Bọc logic fetch trong block `try/catch` với fallback state an toàn. |
| **E-05** | Cache Settings cũ trong DB chưa được cập nhật | Settings mặc định trong code (`packages/types/src/settings.ts`) tự động làm fallback nếu DB trả về link cũ. | Schema Zod có `default()` chuẩn link tĩnh mới. |
