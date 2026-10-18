# 🔄 Logic & Interaction Flows: Trang Chủ Phễu Chuyển Đổi 6 Phân Khu (Homepage Conversion Funnel)

## 1. Tổng Quan Kiến Trúc Luồng (System Flow Architecture)
Tài liệu này đặc tả toàn bộ luồng tương tác, luồng dữ liệu hai chiều giữa Storefront và Admin Portal, cũng như State Machine điều phối 6 phân khu chuyển đổi trên trang chủ (`HeroBanner`, `LeadMagnetFilter`, `SalerProfileSection`, `FeaturedCarsSection`, `DeliveryStoriesSection`, `LatestNewsSection`) dựa trên **Option 2** đã được phê duyệt.

```mermaid
graph TD
    subgraph "ADMIN CMS CONFIGURATION LAYER"
        Admin["Quản Trị Viên / Saler"] -->|"1. Biên tập 6 Phân Khu & Công tắc Bật/Tắt"| AdminUI["apps/admin (/settings - Tab Trang Chủ)"]
        AdminUI -->|"2. PUT /api/admin/settings/homepage_settings"| ApiAdmin["apps/api (Admin Settings Route)"]
        ApiAdmin -->|"3. Upsert JSONB Key 'homepage_settings'"| DB[("PostgreSQL (system_settings)")]
    end

    subgraph "STOREFRONT SSR & DATA COMPOSITION"
        Visitor["Khách Hàng Mua Xe"] -->|"4. Truy cập Trang Chủ (/)"| PageRSC["apps/web/app/page.tsx (RSC)"]
        PageRSC -->|"5. Promise.all Parallel Fetch"| FetchPool["Fetch Pool"]
        FetchPool -->|"GET /api/settings"| SettingsAPI["API Settings"]
        FetchPool -->|"GET /api/cars (isFeatured=true)"| CarsAPI["API Catalog Xe"]
        FetchPool -->|"GET /api/posts?limit=4"| PostsAPI["API Tin Tức / Promos"]
        
        SettingsAPI --> DB
        CarsAPI --> DB
        PostsAPI --> DB
        
        PageRSC --> GracefulResolver{"Bộ Điều Phối Ẩn An Toàn<br/>(Graceful Degradation)"}
    end

    subgraph "6-ZONE CONVERSION FUNNEL RENDERING"
        GracefulResolver -->|"Zone 1 enabled?"| Z1["Khu 1: Hero Event Banner & Countdown"]
        GracefulResolver -->|"Zone 2 enabled?"| Z2["Khu 2: Lead Magnet Hub (Bộ Lọc Nhanh)"]
        GracefulResolver -->|"Zone 3 enabled?"| Z3["Khu 3: VIP Showroom / Saler Profile"]
        GracefulResolver -->|"Zone 4 enabled & has cars?"| Z4["Khu 4: Featured Cars Showcase"]
        GracefulResolver -->|"Zone 5 enabled & has stories?"| Z5["Khu 5: Testimonials & Delivery Stories"]
        GracefulResolver -->|"Zone 6 enabled & has posts?"| Z6["Khu 6: Latest News & Special Promos"]
    end

    subgraph "LEAD CONVERSION ACTIONS"
        Z1 -.->|"Click Nhận Báo Giá / Ưu Đãi"| LeadModal["LeadQuoteModal (source: 'hero_event')"]
        Z2 -.->|"Click Tìm Xe Nhanh"| CatalogRedirect["Chuyển hướng /xe?segment=...&price=..."]
        Z3 -.->|"Click Gọi / Zalo"| DirectContact["Hotline / Zalo 1-1"]
        Z4 -.->|"Click Báo Giá / Xem Xe"| CarDetail["LeadQuoteModal / Chuyển /xe/[slug]"]
        LeadModal -->|"Submit Lead Form"| LeadEngine["Lead Engine (Lưu CRM & Báo Saler)"]
    end
```

---

## 2. Các Sơ Đồ Trình Tự Nghiệp Vụ (Sequence Diagrams)

### 2.1. Luồng 1: Trang Chủ SSR Khởi Tạo & Nạp Dữ Liệu Song Song (Zero CLS)
Khách hàng truy cập `/`, Server Component `apps/web/app/page.tsx` nạp song song dữ liệu cấu hình và danh mục xe, render HTML hoàn chỉnh:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Browser)
    participant Page as Next.js Server Component (app/page.tsx)
    participant API as apps/api (REST Endpoints)
    participant DB as PostgreSQL (Neon DB)

    Customer->>Page: GET https://xehyundaivinh.com/
    activate Page
    Page->>API: Promise.all([getHomepageSettings(), getFeaturedCars(), getLatestPromotions()])
    activate API
    API->>DB: Query system_settings (homepage_settings)
    API->>DB: Query cars WHERE is_featured = true ORDER BY sort_order ASC
    API->>DB: Query posts / articles (hoặc fallback rỗng an toàn)
    DB-->>API: Trả về kết quả
    API-->>Page: JSON Response (Settings, Cars[], Posts[])
    deactivate API

    Note over Page: Kiểm tra Graceful Degradation cho từng phân khu
    Page-->>Customer: Trả về Full HTML 6 phân khu (FCP < 1.0s, CLS = 0)
    deactivate Page
```

---

### 2.2. Luồng 2: Countdown Timer Lifecycle & Timezone-Safe Hydration (Khu 1)
Để ngăn chặn lỗi Hydration Mismatch (`Text content does not match server-rendered HTML`) do đồng hồ máy khách khác với server:

```mermaid
sequenceDiagram
    autonumber
    actor Browser as Trình Duyệt Khách Hàng
    participant TimerIsland as Client Island (CountdownTimer.tsx)

    Browser->>TimerIsland: Render với trạng thái ban đầu (Static SSR Placeholder)
    TimerIsland->>TimerIsland: useEffect() Mount trên Client
    TimerIsland->>TimerIsland: Chuyển state isMounted = true
    loop Mỗi 1000ms (1 giây)
        TimerIsland->>TimerIsland: Tính khoảng cách: targetDate (GMT+7) - Date.now()
        alt Khoảng cách > 0
            TimerIsland->>Browser: Re-render Ngày : Giờ : Phút : Giây
        else Khoảng cách <= 0 (Đã hết hạn)
            TimerIsland->>Browser: Hiển thị badge: "Ưu đãi đặc biệt trong tháng đang tiếp diễn"
        end
    end
```

---

### 2.3. Luồng 3: Lead Magnet Hub - Tìm Kiếm Nhanh Theo Ngân Sách & Phân Khúc (Khu 2)
Giúp khách tìm xe phù hợp chỉ với 2 lần chạm:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng
    participant FilterUI as LeadMagnetFilter (Client Island)
    participant Router as Next.js App Router

    Customer->>FilterUI: Chọn mức ngân sách (vd: "500tr - 800tr")
    Customer->>FilterUI: Chọn kiểu dáng xe (vd: "SUV")
    Customer->>FilterUI: Bấm nút "Tìm Kiếm Dòng Xe Phù Hợp"
    FilterUI->>Router: router.push('/xe?price=500-800&segment=suv')
    Router-->>Customer: Chuyển hướng mượt mà sang trang Catalog /xe kèm bộ lọc đã chọn sẵn
```

---

### 2.4. Luồng 4: State Machine Điều Phối Ẩn An Toàn (Graceful Degradation Decision Tree)

```mermaid
stateDiagram-v2
    [*] --> CheckZoneEnabled: Duyệt từng phân khu (Zone 1 -> 6)
    
    CheckZoneEnabled --> ZoneDisabled: config.enabled === false
    ZoneDisabled --> HideZone: return null (Không sinh DOM thừa)
    
    CheckZoneEnabled --> ZoneEnabled: config.enabled === true
    
    state ZoneEnabled {
        [*] --> CheckDataType: Phân loại kiểu dữ liệu
        CheckDataType --> StaticZone: Khu tĩnh (Zone 1, 2, 3)
        CheckDataType --> DynamicZone: Khu dữ liệu động (Zone 4, 5, 6)
        
        StaticZone --> RenderZone: Render bình thường
        
        DynamicZone --> CheckDataCount: Kiểm tra mảng dữ liệu
        CheckDataCount --> EmptyData: items.length === 0
        CheckDataCount --> HasData: items.length > 0
        
        EmptyData --> HideZone: return null (Tự động ẩn thanh lịch)
        HasData --> RenderZone: Render kèm animation xuất hiện
    }
    
    HideZone --> [*]
    RenderZone --> [*]
```

---

### 2.5. Luồng 5: Kích Hoạt Lead Conversion Modal Từ Các Phân Khu
Mọi nút kêu gọi hành động trên trang chủ đều tích hợp mở `LeadQuoteModal` và truyền ngữ cảnh nguồn lead:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng
    participant Button as Nút CTA ("Nhận Ưu Đãi" / "Báo Giá Nhanh")
    participant Modal as LeadQuoteModal (Toàn cục)
    participant CRM as Backend Lead Engine (/api/leads)

    Customer->>Button: Click nút tại Khu 1 (Hero) hoặc Khu 4 (Xe nổi bật)
    Button->>Modal: openLeadModal({ source: 'homepage_hero', carSlug: 'tucson' })
    Modal-->>Customer: Hiển thị Dialog nhận ưu đãi
    Customer->>Modal: Điền Họ Tên + Số Điện Thoại + Chọn Phiên Bản
    Customer->>Modal: Bấm "Gửi Yêu Cầu Báo Giá"
    Modal->>CRM: POST /api/leads
    CRM-->>Modal: 201 Created (Gắn tag nguồn: homepage_hero)
    Modal-->>Customer: Toast thông báo: "Đã tiếp nhận yêu cầu! Saler sẽ gọi lại trong 5 phút"
```
