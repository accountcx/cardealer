# 🔄 Technical Flow Specification: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (`/xe`)

## 1. Sequence Diagram Đa Tầng (End-to-End Sequence)

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Khách Hàng / Googlebot
    participant Browser as 🌐 Trình Duyệt / URL
    participant Page as 📄 Next.js Server (RSC app/xe/page.tsx)
    participant ClientIsland as ⚡ CatalogView (Client Island)
    participant API as ⚙️ Backend API (/api/cars)
    participant DB as 🗄️ Database PostgreSQL

    %% Luồng 1: Tải trang ban đầu (Initial Load / Deep Link)
    User->>Browser: 1. Truy cập /xe?segment=suv&price=700-1000
    Browser->>Page: HTTP GET /xe?segment=suv&price=700-1000
    Page->>API: GET /api/cars (ISR Cache Tag: catalog-cars, revalidate 60s)
    API->>DB: Query Published Cars with Versions
    DB-->>API: Trả về danh sách xe (kèm minPrice, maxPrice, fuelType)
    API-->>Page: 200 OK (Mảng xe đầy đủ)
    Page->>Page: Sinh JSON-LD Schema ItemList + AggregateOffer
    Page-->>Browser: Trả về HTML hoàn chỉnh (Server Rendered) + Schema SEO
    Browser-->>User: Hiển thị giao diện tức thì (FCP < 1.0s, CLS = 0)

    %% Luồng 2: Client Hydration & Khởi tạo Bộ lọc
    Browser->>ClientIsland: Hydrate với initialCars & parse URL searchParams
    ClientIsland->>ClientIsland: Đặt segment='suv', price='700-1000'
    ClientIsland->>ClientIsland: Chạy bộ lọc in-memory (< 5ms)
    ClientIsland-->>User: Active Tab "SUV", Nút "700tr - 1 tỷ", hiển thị các xe SUV phù hợp

    %% Luồng 3: Tương tác bộ lọc (< 50ms, Zero Network Request)
    User->>ClientIsland: Click chọn Tab "Sedan"
    ClientIsland->>ClientIsland: Cập nhật State: segment='sedan'
    ClientIsland->>ClientIsland: Lọc lại mảng initialCars tức thì (< 3ms)
    ClientIsland->>Browser: window.history.replaceState('/xe?segment=sedan&price=700-1000')
    ClientIsland-->>User: Render mượt mà danh sách xe Sedan (Không reload trang, giữ nguyên vị trí cuộn)

    %% Luồng 4: Kịch bản không tìm thấy xe (Zero-State)
    alt Không có xe thỏa mãn bộ lọc
        ClientIsland-->>User: Hiển thị CatalogEmptyState ("Không tìm thấy dòng xe phù hợp")
        User->>ClientIsland: Bấm "Xóa bộ lọc & Xem tất cả xe"
        ClientIsland->>ClientIsland: Reset segment='all', price='all'
        ClientIsland->>Browser: window.history.replaceState('/xe')
        ClientIsland-->>User: Hiển thị toàn bộ danh mục xe
    end

    %% Luồng 5: Điều hướng Call To Action
    alt Khách bấm "Dự Toán Lăn Bánh"
        User->>Browser: Click nút "Dự Toán Lăn Bánh" trên SmartCarCard
        Browser->>User: Chuyển hướng sang /gia-lan-banh?xe=[slug]
    else Khách bấm "Xem Chi Tiết"
        User->>Browser: Click nút "Xem Chi Tiết" trên SmartCarCard
        Browser->>User: Chuyển hướng sang /xe/[slug]
    end
```

---

## 2. Sơ Đồ Trạng Thái Thực Thể Bộ Lọc (State Machine Diagram)

```mermaid
stateDiagram-v2
    [*] --> INITIALIZING: Khách truy cập URL (/xe hoặc /xe?...)
    INITIALIZING --> FILTERED: Đọc params URL & lọc in-memory lần đầu
    
    FILTERED --> FILTERING: Khách click chọn Tab phân khúc hoặc Mốc giá
    FILTERING --> FILTERED: Có xe phù hợp (Count > 0) -> Render Grid xe & Sync URL
    FILTERING --> ZERO_STATE: Không có xe (Count == 0) -> Render Empty State & Sync URL
    
    ZERO_STATE --> RESETTING: Khách click "Xóa bộ lọc"
    RESETTING --> FILTERED: Đặt segment='all', price='all' -> Sync URL /xe
    
    FILTERED --> NAVIGATING: Khách click "Xem Chi Tiết" hoặc "Dự Toán Lăn Bánh"
    NAVIGATING --> [*]: Chuyển trang thành công
```

---

## 3. Bảng Giải Phẫu Từng Bước (Step Anatomy Table)

| Bước # | Tác nhân | Hành động | Dữ liệu Đầu Vào | Logic Xử Lý & Quy Tắc Nghiệp Vụ | Kết Quả Đầu Ra | Xử Lý Ngoại Lệ & Phục Hồi |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | User / Crawler | Truy cập `/xe` | URL string + search params | Next.js Server nhận request, kích hoạt hàm nạp dữ liệu `getCarsList()` với ISR Cache 60 giây. | HTML Server Shell + JSON-LD Schema `ItemList` | Nếu Backend API lỗi, trả về mảng `[]`, hiển thị khung thông báo thân thiện. |
| **2** | ClientIsland | Khởi tạo State | `initialCars`, `useSearchParams()` | Đọc query params: map `kieuDang` (nếu có) sang `segment`, validate mốc giá hợp lệ. Chạy hàm lọc `filterCars()`. | State khởi tạo: `segment`, `priceRange`, `filteredCars` | Nếu query param chứa giá trị rác, fallback về giá trị `'all'`. |
| **3** | User | Chọn Phân Khúc | Click Tab Segment (`sedan`, `suv`, `mpv`, `ev`, `all`) | Kiểm tra nếu tab đang chọn trùng với tab hiện tại thì giữ nguyên; nếu khác thì cập nhật state `selectedSegment`. | Lưới xe cập nhật tức thì `< 5ms`. Cập nhật URL qua `replaceState`. | Animation fade/slide mượt mà, không giật màn hình. |
| **4** | User | Chọn Mốc Giá | Click Mốc Giá (`under-500`, `500-700`, `700-1000`, `over-1000`, `all`) | So sánh khoảng giá của xe (`minPrice <= max` VÀ `maxPrice >= min`) để đảm bảo không bỏ sót dòng xe có phiên bản nằm trong khoảng. | Lưới xe cập nhật tức thì `< 5ms`. Cập nhật URL qua `replaceState`. | Nếu không có xe nào, chuyển sang Bước 5. |
| **5** | ClientIsland | Hiển thị Zero-State | Mảng lọc rỗng `filteredCars.length === 0` | Hiển thị hình minh họa, thông điệp nhắc nhở và nút hành động nhanh: *"Xóa bộ lọc"*. | Render component `CatalogEmptyState` | Người dùng bấm xóa bộ lọc ➡️ phục hồi danh mục xe 100%. |
| **6** | User | Bấm "Dự Toán Lăn Bánh" | Click CTA button | Lấy `car.slug`, kích hoạt chuyển trang tới `/gia-lan-banh?xe=${car.slug}` | Trình duyệt chuyển sang bộ tính lăn bánh với xe đã chọn sẵn | Mở tab mới hoặc điều hướng cùng tab mượt mà. |
| **7** | User | Bấm "Xem Chi Tiết" | Click CTA button / Card Link | Lấy `car.slug`, chuyển hướng tới `/xe/${car.slug}` | Trình duyệt chuyển tới trang thông số chi tiết dòng xe | Lưu lại vị trí scroll khi quay lại qua browser cache. |
