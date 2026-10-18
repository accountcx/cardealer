# 🔄 Logic & Interaction Flows: Khung Nền Tảng Storefront & Tiện Ích Chuyển Đổi Toàn Cục

## 1. Tổng Quan Kiến Trúc Luồng (System Flow Architecture)
Tài liệu này đặc tả toàn bộ luồng tương tác, luồng dữ liệu hai chiều giữa Storefront và Admin Portal, cũng như State Machine của các tiện ích chuyển đổi toàn cục (`Navbar`, `MobileDrawer`, `FloatingSeller`, `ProductStickyBar`) dựa trên **Option 2** đã được phê duyệt.

```mermaid
graph TD
    subgraph "ADMIN CMS SYNC LAYER"
        Admin["Quản Trị Viên"] -->|"1. Biên tập Menu / Hotline / Widgets"| AdminUI["apps/admin (/settings)"]
        AdminUI -->|"2. PUT /api/admin/settings/:key"| ApiAdmin["apps/api (Admin Routes)"]
        ApiAdmin -->|"3. Upsert JSONB"| DB[("PostgreSQL (system_settings)")]
        ApiAdmin -->|"4. Trigger Revalidate Tag"| CacheTag["Next.js Cache Tag: 'system-settings'"]
    end

    subgraph "STOREFRONT SSR & CLIENT HYDRATION"
        Visitor["Khách Hàng Mua Xe"] -->|"5. Truy cập Trang Web"| WebSSR["apps/web (RootLayout RSC)"]
        WebSSR -->|"6. GET /api/settings (Bulk Cached)"| CacheTag
        CacheTag -.->|"Cache HIT"| WebSSR
        CacheTag -.->|"Cache MISS / Revalidated"| DB
        WebSSR -->|"7. Hydrate Props & Render"| Shell["Storefront Global Shell"]
        
        Shell --> Navbar["Navbar & TopBar Hotline"]
        Shell --> MobileDrawer["Mobile Drawer Accordion"]
        Shell --> Footer["Footer Đại Lý 3S & Maps"]
        Shell --> FloatingSeller["Widget Chuyên Viên Nổi"]
        Shell --> StickyBar["ProductStickyBar Chân Trang"]
    end

    subgraph "MOBILE VIEWPORT COORDINATOR"
        ScrollEvent["Sự kiện Cuộn Trang (Scroll > 300px)"] --> StickyBarTrigger{"StickyBar Hiển thị?"}
        StickyBarTrigger -->|"True"| ElevateSeller["FloatingSeller tự động nâng lên bottom-20"]
        StickyBarTrigger -->|"False"| LowerSeller["FloatingSeller ở vị trí bottom-4"]
    end
```

---

## 2. Các Sơ Đồ Trình Tự Nghiệp Vụ (Sequence Diagrams)

### 2.1. Luồng 1: Storefront SSR Layout Khởi Tạo & Hydration (Zero CLS)
Khách hàng truy cập bất kỳ trang nào (`/`, `/xe/[slug]`, `/gia-lan-banh`), `RootLayout` nạp song song toàn bộ cấu hình từ server, loại bỏ hoàn toàn độ trễ hiển thị và triệt tiêu CLS:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Browser)
    participant Server as Next.js Server Component (RootLayout)
    participant API as apps/api (/api/settings)
    participant DB as PostgreSQL (system_settings)

    Customer->>Server: HTTP GET https://xehyundaivinh.com/
    activate Server
    Server->>API: GET /api/settings (Next.js revalidate tag: 'system-settings')
    activate API
    API->>DB: SELECT * FROM system_settings WHERE key IN ('site_settings', 'navigation_settings', 'contact_settings', 'floating_seller_settings', 'sticky_bar_settings')
    DB-->>API: Rows settings data
    API-->>Server: JSON Bulk Settings
    deactivate API
    
    Note over Server: Fallback về Zod Defaults nếu thiếu key hoặc DB rỗng
    Server->>Server: Render Server HTML (Header, Navigation Links, Footer 3S, JSON-LD Schema)
    Server-->>Customer: Trả về Full SSR HTML (CLS = 0)
    deactivate Server
    
    Note over Customer: Trình duyệt mount Client Components (FloatingSeller, StickyBar, MobileDrawer)
```

---

### 2.2. Luồng 2: Quản Trị Viên Cập Nhật Cấu Hình Từ Admin Portal & Revalidation Tức Thì
Khi Admin thay đổi số hotline, menu điều hướng hoặc đổi nhân viên trực tư vấn:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên Showroom
    participant AdminUI as apps/admin (/settings)
    participant API as apps/api (/api/admin/settings/:key)
    participant DB as PostgreSQL (system_settings)
    participant Storefront as apps/web (/api/revalidate)

    Admin->>AdminUI: Chỉnh sửa Menu / Hotline / Avatar chuyên viên
    Admin->>AdminUI: Bấm "Lưu Cấu Hình"
    AdminUI->>AdminUI: Validate client qua Zod Schema
    AdminUI->>API: PUT /api/admin/settings/:key (Authorization: Bearer JWT)
    activate API
    API->>API: Kiểm tra RBAC permission ('system:write')
    API->>API: Validate payload qua Zod Schema server-side
    API->>DB: INSERT INTO system_settings (key, data, updated_at) VALUES (...) ON CONFLICT (key) DO UPDATE SET data = ..., updated_at = NOW()
    DB-->>API: Success
    API->>Storefront: POST /api/revalidate?tag=system-settings (Secret Token)
    Storefront-->>API: Cache tag invalidated
    API-->>AdminUI: 200 OK ({ success: true })
    deactivate API
    AdminUI-->>Admin: Hiển thị Toast "Đã lưu cấu hình thành công!"
```

---

### 2.3. Luồng 3: Widget Chuyên Viên Nổi (`FloatingSeller`) & Phễu Chuyển Đổi Một Chạm
Tối ưu hóa hành vi click gọi điện thoại hoặc chat Zalo tức thì:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng
    participant Widget as FloatingSeller Component
    participant NativeApp as Trình duyệt / OS Native Phone / Zalo

    Note over Widget: Hiển thị avatar tròn với hiệu ứng Online Pulse sóng xanh nhấp nháy
    Customer->>Widget: Click hoặc Hover vào Avatar tư vấn
    Widget->>Widget: Chuyển State sang 'EXPANDED_CARD' (Popup mượt mà)
    Note over Widget: Hiển thị Tên nhân viên, Hotline, Badge "Đang trực tuyến"
    
    alt Khách hàng chọn "Gọi Hotline"
        Customer->>Widget: Click "GỌI TRỰC TIẾP"
        Widget->>NativeApp: Kích hoạt liên kết tel:0981234567
        NativeApp-->>Customer: Mở bàn phím cuộc gọi trên điện thoại
    else Khách hàng chọn "Chat Zalo"
        Customer->>Widget: Click "CHAT QUA ZALO"
        Widget->>NativeApp: Mở liên kết https://zalo.me/0981234567 (target="_blank")
        NativeApp-->>Customer: Mở ứng dụng Zalo trên Mobile hoặc Web Zalo trên Desktop
    end
```

---

### 2.4. Luồng 4: Điều Phối Tránh Va Chạm Giao Diện Mobile (Viewport Coordinator)
Ngăn chặn xung đột giữa `FloatingSeller` và `ProductStickyBar` trên màn hình điện thoại:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Mobile)
    participant Window as Browser Window (Scroll Event)
    participant StickyBar as ProductStickyBar
    participant FloatingSeller as FloatingSeller

    Customer->>Window: Cuộn trang xuống > 300px
    Window->>StickyBar: Scroll event kích hoạt ngưỡng hiển thị
    StickyBar->>StickyBar: State = 'VISIBLE' (Slide-up animation từ đáy)
    StickyBar->>FloatingSeller: Phát tín hiệu / Context: isStickyBarVisible = true
    FloatingSeller->>FloatingSeller: Dynamic class chuyển từ 'bottom-4' sang 'bottom-20' (Nâng cao 80px)
    Note over Customer: Cả 2 tiện ích hiển thị song song, hoàn toàn không che khuất nhau
    
    Customer->>Window: Cuộn ngược lên đầu trang (< 300px)
    StickyBar->>StickyBar: State = 'HIDDEN' (Slide-down ẩn đi)
    StickyBar->>FloatingSeller: isStickyBarVisible = false
    FloatingSeller->>FloatingSeller: Hạ vị trí mượt mà về lại 'bottom-4'
```

---

## 3. Máy Trạng Thái (State Machines)

### 3.1. State Machine: Mobile Navigation Drawer
```mermaid
stateDiagram-v2
    [*] --> Closed: Trang web khởi tạo
    
    Closed --> Opening: Khách chạm nút Hamburger Menu
    Opening --> Open: Transition trượt hoàn tất (300ms)
    
    state Open {
        [*] --> NavLinksList
        NavLinksList --> SubMenuExpanded: Chạm vào mục có Menu con (Dòng xe)
        SubMenuExpanded --> NavLinksList: Chạm thu gọn Menu con
    }
    
    Open --> Closing: Chạm nút X / Chạm Backdrop nền mờ / Chọn 1 liên kết
    Closing --> Closed: Transition đóng hoàn tất (300ms)
```

### 3.2. State Machine: FloatingSeller Widget
```mermaid
stateDiagram-v2
    [*] --> Collapsed: Mặc định hiển thị dạng avatar tròn
    
    Collapsed --> ExpandedCard: Khách chạm/click vào avatar
    ExpandedCard --> Collapsed: Khách chạm nút đóng X hoặc click ngoài vùng card
    ExpandedCard --> TriggerAction: Khách click "Gọi Ngay" (tel:) hoặc "Chat Zalo"
    TriggerAction --> Collapsed: Chuyển ứng dụng liên hệ thành công
```

### 3.3. State Machine: ProductStickyBar
```mermaid
stateDiagram-v2
    [*] --> Hidden: ScrollY <= 300px (Vùng Hero)
    
    Hidden --> Visible: ScrollY > 300px (Cuộn qua vùng Hero)
    Visible --> Hidden: ScrollY <= 300px (Cuộn ngược về đầu trang)
    
    state Visible {
        [*] --> Standby
        Standby --> OpenLeadModal: Khách click "NHẬN BÁO GIÁ"
        Standby --> TriggerCall: Khách click "GỌI NGAY" (tel:)
    }
```
