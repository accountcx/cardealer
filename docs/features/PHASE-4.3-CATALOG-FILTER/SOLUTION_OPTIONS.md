# 🏛️ Architectural Solution Options: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (`/xe`)

## 1. Bối Cảnh & Ràng Buộc Kỹ Thuật (Technical Constraints)

* **Mã Epic:** `EPIC-PHASE-4.3-CATALOG-FILTER`
* **Phạm vi Nền tảng:** Full-stack (`packages/core`, `packages/types`, `packages/ui`, `apps/api`, `apps/web`)
* **Hiện trạng Hệ thống (Tham chiếu `docs/SYSTEM_MAP.md`):**
  * Backend API (`apps/api/src/routes/catalog.ts`) đã có sẵn endpoint `GET /api/cars` truy vấn các xe `published` từ PostgreSQL qua Drizzle ORM.
  * Storefront (`apps/web`) vận hành trên Next.js 15 App Router với Tailwind CSS và hệ thống component `@cardealer/ui`.
  * Bộ lọc nhanh ở Phân khu 2 Trang chủ (`LeadMagnetFilter.tsx`) và Menu Navbar đã được cấu hình điều hướng tới `/xe?segment=...&price=...`.
* **Ràng buộc Môi trường:** 🟢 Pure Development (Local/Staging Monorepo).
* **Ràng buộc Nghiệp vụ Cốt lõi (DoD Constraints):**
  1. Tốc độ lọc phản hồi tức thì **`< 50ms`** không cần tải lại trang.
  2. Đồng bộ 2 chiều với URL Query Parameters để hỗ trợ chia sẻ link và lưu lịch sử duyệt xe.
  3. SEO Google thân thiện 100%: Googlebot phải đọc được toàn bộ danh mục sản phẩm và JSON-LD Schema `ItemList` + `AggregateOffer` ngay trong lượt crawl đầu tiên (Server-Rendered).

---

## 2. Ma Trận So Sánh Phương Án Kiến Trúc (Trade-off Matrix)

| Tiêu chí So sánh | Option A: Pure Server-Side Filtering (SSR Params) | Option B: Hybrid RSC Preload + Client Island Instant Filter (Khuyến Nghị) | Option C: Client-Side SWR / TanStack Query Filtering |
| :--- | :--- | :--- | :--- |
| **Mô hình Kiến trúc** | Server Component đọc `searchParams`, gọi API backend mỗi lần URL thay đổi. | **Server Component nạp toàn bộ xe qua ISR cache + Client Island lọc tức thì in-memory & sync URL.** | Client Component fetch API `/api/cars?...` qua SWR/React Query mỗi khi bấm filter. |
| **Độ trễ phản hồi Lọc (Latency)** | ❌ **200ms – 500ms** (Mỗi lần click tab/giá phải gửi HTTP request tới server). | ⚡ **< 5ms** (Thuật toán lọc mảng Javascript tức thì, đạt tiêu chuẩn < 50ms). | ⚠️ **50ms – 200ms** (Phụ thuộc vào network request và cache hit của thư viện). |
| **Trải nghiệm Người Dùng (UX)** | Có độ khựng/giật nhẹ khi chuyển tab; phát sinh loading skeleton giữa chừng. | **Siêu mượt mà (Showroom-grade)**; hiệu ứng chuyển thẻ xe tức thì, không giật màn hình. | Mượt mà nếu đã cache, khựng nhẹ ở các tổ hợp filter bấm lần đầu. |
| **Khả năng Tối ưu SEO & Schema** | ✅ Tốt (HTML chứa đúng tập xe của query). | ✅ **Xuất sắc nhất**: HTML ban đầu chứa trọn vẹn danh mục xe & Schema `ItemList` đầy đủ. | ⚠️ Kém nhất: Cần cấu hình SSR Hydration phức tạp để Googlebot đọc được Schema. |
| **Bảo toàn URL & Deep Link** | Tự động đồng bộ do dựa hoàn toàn vào URL. | **Đồng bộ 2 chiều hoàn hảo**: Đọc query khi vào trang, cập nhật `history.replaceState` khi lọc. | Phải tự viết logic sync giữa URL và React Query keys. |
| **Tải trọng Backend Database** | ❌ Cao: Mỗi cú click của khách hàng đều tạo query xuống database. | 🟢 **Gần như bằng 0**: Server dùng ISR Cache 60s, client lọc in-memory. | ⚠️ Trung bình: Phát sinh nhiều API call với các tổ hợp query khác nhau. |
| **Độ phức tạp Mã nguồn** | Thấp, ít code client. | **Vừa phải, kiến trúc rõ ràng, chuẩn Next.js 15 App Router.** | Cao: Cần cài thêm thư viện quản lý cache server-state. |

---

## 3. Phân Tích Sâu Các Phương Án

### 🔴 Option A: Pure Server-Side Filtering (SSR qua searchParams)
* **Cơ chế hoạt động:**
  ```mermaid
  graph LR
      User["Khách click Tab SUV"] --> Router["router.push('/xe?segment=suv')"]
      Router --> Server["Next.js Server SSR"]
      Server --> API["Backend GET /api/cars?segment=suv"]
      API --> Render["Re-render toàn bộ HTML"]
      Render --> User
  ```
* **Đánh giá:** Phương án này đơn giản nhất nhưng **vi phạm trực tiếp Tiêu chí nghiệm thu (DoD)** của đề bài ("Bộ lọc lọc tức thì < 50ms không cần tải lại trang"). Độ trễ mạng tại Việt Nam trên thiết bị 4G/5G sẽ làm mất đi cảm giác cao cấp của website ô tô.

---

### 🟢 Option B: Hybrid RSC Preload + Client Island Instant Filter (ĐỀ XUẤT CHỌN)
* **Cơ chế hoạt động:**
  ```mermaid
  graph TD
      subgraph "TẦNG 1: SERVER COMPONENT (app/xe/page.tsx)"
          RSC["Server Component RSC"] -->|"Fetch ISR 60s"| BackendAPI["GET /api/cars (Published Cars)"]
          RSC -->|"Sinh JSON-LD"| SchemaSEO["Schema ItemList + AggregateOffer"]
          RSC -->|"Render Shell + Breadcrumbs"| HTMLShell["HTML tĩnh chuẩn SEO Google"]
      end

      subgraph "TẦNG 2: CLIENT ISLAND (CatalogView.tsx)"
          HTMLShell -->|"Hydrate initialCars"| ClientIsland["CatalogView Client Island"]
          ClientIsland -->|"Đọc URL params ban đầu"| InitFilter["Init: segment, price"]
          UserClick["Khách bấm Tab Phân khúc / Mốc giá"] --> FilterEngine["Bộ Lọc In-Memory duoi 5ms"]
          FilterEngine --> UpdateUI["Cập nhật ngay Grid Thẻ Xe"]
          FilterEngine --> SyncURL["window.history.replaceState - Giữ scroll, sync URL"]
      end
  ```
* **Lý do đề xuất chọn Option B:**
  1. **Tốc độ tuyệt đối (< 5ms):** Showroom ô tô thường có khoảng 10 đến 30 dòng xe (Accent, Elantra, Tucson, Santa Fe, Custin, Stargazer, Ioniq 5...). Mảng dữ liệu này chỉ nặng khoảng 15–25 KB. Việc lọc in-memory trên trình duyệt diễn ra ngay trong 1 frame hình (16ms), mang lại cảm giác phản hồi tức thì cho khách hàng.
  2. **Chuẩn SEO Quốc tế:** Server Component render sẵn toàn bộ thẻ xe và Schema `ItemList` trong mã nguồn HTML ban đầu. Bất kể Googlebot crawl bằng URL gốc `/xe` hay URL có query, dữ liệu luôn đầy đủ.
  3. **Zero Backend Overload:** Với ISR cache 60s, dù có 10.000 khách hàng cùng lúc bấm lọc xe, Backend PostgreSQL chỉ phải chịu tải 1 query mỗi phút.
  4. **Deep-linking mượt mà:** Khách hàng chia sẻ link `/xe?segment=suv&price=700-1000` cho bạn bè, người nhận mở ra sẽ thấy ngay các dòng xe SUV từ 700tr đến 1 tỷ mà không cần bấm lại bộ lọc.

---

### 🟡 Option C: Client-Side SWR / TanStack Query
* **Cơ chế hoạt động:**
  Trang chỉ render khung sườn, sau đó dùng `useQuery(['cars', segment, price])` để gọi backend API với từng tổ hợp tham số.
* **Đánh giá:**
  Phương án này chỉ phù hợp với các sàn thương mại điện tử có hàng chục nghìn sản phẩm (như Shopee, Tiki). Đối với danh mục dòng xe của một đại lý ô tô (10–30 dòng xe), phương án này làm tăng chi phí hạ tầng không cần thiết, làm chậm lần lọc đầu tiên và làm phức tạp hóa bài toán SEO Schema.

---

## 4. Kiến Trúc Chi Tiết Của Option B Được Đề Xuất

### 4.1. Phân Tầng Component (Component Tree)
```
apps/web/app/xe/
├── page.tsx                           (Server Component: Fetch cars, Metadata, SEO JSON-LD)
└── components/
    ├── CatalogView.tsx                (Client Island: Quản lý filter state & render layout)
    ├── CatalogFilterBar.tsx           (Client Component: Tabs phân khúc & Mốc giá bấm nhanh)
    ├── CatalogGrid.tsx                (Client Component: Lưới hiển thị danh sách SmartCarCard)
    ├── SmartCarCard.tsx               (Client Component: Thẻ xe showroom, specs, giá & 2 nút CTA)
    └── CatalogEmptyState.tsx          (Client Component: Giao diện khi 0 xe thỏa mãn bộ lọc)
```

### 4.2. Hợp Đồng Đồng Bộ URL Query Parameters (URL Contract)
| Tham Số URL | Kiểu Dữ Liệu | Giá Trị Hợp Lệ | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `segment` | `string` | `all`, `sedan`, `suv`, `mpv`, `hatchback`, `ev` | Lọc theo kiểu dáng / phân khúc xe |
| `price` | `string` | `all`, `under-500`, `500-700`, `700-1000`, `over-1000` | Lọc theo khoảng ngân sách đầu tư |
| `kieuDang` | `string` | (Tự động map sang `segment` để tương thích ngược) | Hỗ trợ menu điều hướng cũ từ Header/Trang chủ |

---

## 5. Kết Luận & Đề Xuất Chấm Chọn

* **Phương án Đề Xuất:** **Option B (Hybrid RSC Preload + Client Island Instant Filter & History State Sync)**.
* **Độ Phức Tạp:** Mức độ vừa phải, an toàn tuyệt đối, tuân thủ nguyên tắc *Non-Destructive Additive Mode*, không làm gián đoạn bất kỳ chức năng nào đang hoạt động.

---

### 🧭 TRẠNG THÁI QUY TRÌNH (WORKFLOW GATE STATUS)
- **Tình trạng Môi trường:** 🟢 Pure Development (Local Monorepo)
- **Cấp độ Luồng (Execution Tier):** Tier 1 (Core Architecture / Full 5 Phase Lifecycle & Strict Gates 1–5)
- **Selective Context Tagging:** `@BACKLOG.md`, `@docs/SYSTEM_MAP.md`
- **Giai đoạn Hiện tại:** Giai đoạn 2: Thiết kế Kiến trúc (Bước 2.1: Phân tích Solution Options)
- **Skills Đang Kích Hoạt:** `system-analyst-architect`
- **Sản phẩm Bắt buộc của Giai đoạn:** [`docs/features/PHASE-4.3-CATALOG-FILTER/SOLUTION_OPTIONS.md`](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-4.3-CATALOG-FILTER/SOLUTION_OPTIONS.md)
- **Trạng thái Cửa chặn (Sub-Gate 2.1):** 🔒 **ĐANG KHÓA (LOCKED)** — Chờ Developer chốt Option kiến trúc.
- **Lệnh cần Developer gửi để thông quan:** `"Chốt Option B"` (hoặc `"Chốt Option A"` / `"Chốt Option C"`)
- **Kế hoạch Giai đoạn Kế tiếp:** Bước 2.2: Kích hoạt `logic-flow-ba`, `feature-spec-generator`, `tailwind-ui-designer` để lập trọn bộ tài liệu thiết kế chi tiết (`FLOW.md`, `API_SPEC.md`, `UI_SPEC.md`, `FE_INTEGRATION_GUIDE.md`).
