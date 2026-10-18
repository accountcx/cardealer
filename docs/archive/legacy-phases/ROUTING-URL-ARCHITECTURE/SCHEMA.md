# 🗄️ Mô Hình Dữ Liệu & Rà Soát Schema (Database Schema & Mapping)

> **Feature:** Cấu Trúc Routing Tĩnh & Kiến Trúc Menu (URL Architecture) — `ROUTING-URL-ARCHITECTURE`  
> **Skill Phụ Trách:** `@db-schema-architect`  
> **Căn cứ:** [FLOW.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/FLOW.md)

---

## 1. Rà Soát Các Bảng Cơ Sở Dữ Liệu Liên Quan

### 1.1. Bảng `cars` (Quản lý dòng xe & phân khúc)
* **Vị trí Schema:** `packages/database/src/schema/cars.ts`
* **Các trường cốt lõi phục vụ lọc phân khúc:**
  - `id`: UUID (Khóa chính)
  - `tenXe`: String (Ví dụ: "Hyundai Accent", "Hyundai Creta", "Hyundai Santa Fe")
  - `slug`: String (Unique index, ví dụ: "hyundai-accent", "hyundai-santa-fe")
  - `kieuDang`: Varchar/Text — Định nghĩa kiểu dáng/phân khúc xe. Các giá trị hiện hành trong database:
    - `'Sedan'`
    - `'SUV'`
    - `'MPV'`
    - `'Hatchback'`
  - `status`: Varchar (`'published'`, `'draft'`, `'archived'`) — Chỉ xe có `status = 'published'` mới được nạp vào Storefront Catalog.
  - `minPrice`: BigInt/Integer — Giá bán khởi điểm hiển thị trên Card xe.
  - `anhDaiDienUrl`: Text — Ảnh đại diện ngoại thất dòng xe.

### 1.2. Bảng `system_settings` (Quản lý menu & cấu hình giao diện)
* **Vị trí Schema:** `packages/database/src/schema/settings.ts`
* **Cấu trúc:**
  - `key`: Varchar (Primary Key) — Ví dụ: `'navigation_settings'`, `'footer_settings'`.
  - `data`: JSONB — Lưu trữ đối tượng cấu hình validated theo Zod Schema từ `@cardealer/types`.
  - `updatedAt`: Timestamp with timezone.

---

## 2. Bảng Ánh Xạ Phân Khúc: URL Slug ⟷ Database Values (Segment Mapping Registry)

Để đảm bảo tính toàn vẹn giữa URL thân thiện SEO (toàn chữ thường không dấu) và giá trị lưu trữ trong Database (chuẩn hóa viết hoa), hệ thống thiết lập bảng ánh xạ:

| URL Slug (`[slug]`) | Nhãn Hiển Thị (Display Name) | Giá Trị DB (`kieuDang` / `segment`) | Tiêu Đề Trang `<h1>` Ngữ Cảnh | Đoạn Mô Tả SEO E-E-A-T Mặc Định (~200 Chữ) |
| :--- | :--- | :--- | :--- | :--- |
| `sedan` | **Sedan** | `['Sedan', 'sedan']` | **Các Dòng Xe Sedan Hyundai Chính Hãng & Bảng Giá Mới Nhất** | Dòng xe Sedan Hyundai luôn là lựa chọn hàng đầu cho khách hàng cá nhân và gia đình trẻ nhờ thiết kế Sensuous Sportiness thể thao thời thượng, khả năng tiết kiệm nhiên liệu vượt trội và không gian nội thất tiện nghi. Nổi bật với các mẫu xe ăn khách như Hyundai Accent và Hyundai Elantra thế hệ mới, phân khúc Sedan đáp ứng hoàn hảo nhu cầu di chuyển đô thị linh hoạt cũng như những chuyến hành trình dài. Showroom hỗ trợ lái thử tận nơi, trả góp lên đến 85% và ưu đãi giá lăn bánh tốt nhất khu vực. |
| `suv` | **SUV / Crossover** | `['SUV', 'suv', 'Crossover']` | **Các Dòng Xe SUV & Crossover Hyundai Gầm Cao Đa Dụng** | Phân khúc SUV Hyundai gầm cao khẳng định vị thế dẫn đầu với dải sản phẩm toàn diện từ đô thị cỡ B đến cỡ D cao cấp: Hyundai Venue cá tính, Hyundai Creta năng động, Hyundai Tucson lịch lãm và Hyundai Santa Fe sang trọng. Trang bị gói an toàn chủ động Hyundai SmartSense độc quyền, dẫn động 4 bánh toàn thời gian HTRAC và động cơ Smartstream mạnh mẽ, các dòng xe SUV Hyundai sẵn sàng chinh phục mọi địa hình và bảo vệ tối đa cho cả gia đình. |
| `mpv` | **MPV Đa Dụng** | `['MPV', 'mpv']` | **Các Dòng Xe MPV Đa Dụng Hyundai Cho Doanh Nghiệp & Gia Đình** | Dòng xe đa dụng MPV Hyundai (Hyundai Stargazer X và Hyundai Custin) định nghĩa lại tiêu chuẩn di chuyển cho gia đình đông thành viên và doanh nghiệp dịch vụ cao cấp. Thiết kế phi thuyền tương lai, cửa trượt tự động thông minh, hàng ghế cơ trưởng thương gia cùng không gian 7 chỗ ngồi rộng rãi đem lại sự thư thái tối đa trên mọi chặng đường. Động cơ bền bỉ, chi phí bảo dưỡng tối ưu và chính sách bảo hành chính hãng 5 năm là điểm tựa vững chắc cho mọi chủ xe. |

---

## 3. Data Contract Cập Nhật: `NavigationSettings` & `FooterSettings`

### 3.1. Cập nhật `headerLinks` trong `NavigationSettingsSchema`:
```json
{
  "id": "nav-cars",
  "label": "Dòng Xe",
  "url": "/xe",
  "newTab": false,
  "order": 1,
  "subLinks": [
    { "id": "sub-sedan", "label": "Sedan (Accent, Elantra)", "url": "/dong-xe/sedan", "newTab": false },
    { "id": "sub-suv", "label": "SUV (Creta, Tucson, Santa Fe)", "url": "/dong-xe/suv", "newTab": false },
    { "id": "sub-mpv", "label": "MPV (Custin, Stargazer)", "url": "/dong-xe/mpv", "newTab": false }
  ]
}
```

### 3.2. Cập nhật `quickLinks` trong `FooterSettingsSchema`:
```json
[
  { "id": "f-accent", "label": "Hyundai Accent (Sedan)", "url": "/dong-xe/sedan", "newTab": false },
  { "id": "f-creta", "label": "Hyundai Creta (SUV đô thị)", "url": "/dong-xe/suv", "newTab": false },
  { "id": "f-tucson", "label": "Hyundai Tucson (SUV 5 chỗ)", "url": "/dong-xe/suv", "newTab": false },
  { "id": "f-santafe", "label": "Hyundai Santa Fe (SUV 7 chỗ)", "url": "/dong-xe/suv", "newTab": false },
  { "id": "f-custin", "label": "Hyundai Custin (MPV cao cấp)", "url": "/dong-xe/mpv", "newTab": false },
  { "id": "f-stargazer", "label": "Hyundai Stargazer X (MPV 7 chỗ)", "url": "/dong-xe/mpv", "newTab": false }
]
```

---

## 4. State Matrix & Database Invariant Rules

1. **Tính Bất Biến (Invariant):** Không thay đổi schema DDL vật lý của bảng `cars` hay `system_settings` (Zero Schema Migration) để giảm thiểu tối đa rủi ro cho môi trường DB.
2. **Khả năng tương thích ngược (Backward Compatibility):**
   - Bộ lọc tại trang `/xe` vẫn giữ nguyên khả năng lọc query param `?kieuDang=...` nếu có liên kết bên ngoài hoặc người dùng dùng bộ lọc checkbox.
   - Trang `/dong-xe/[slug]` độc lập hoàn toàn, đóng vai trò là Landing Page phân khúc tĩnh chuẩn SEO.
