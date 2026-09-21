# 🧪 Quality Assurance & Test Strategy: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (`/xe`)

## 1. Tổng Quan Chiến Lược Kiểm Thử (Test Strategy Overview)

* **Mã Epic:** `EPIC-PHASE-4.3-CATALOG-FILTER`
* **Phạm vi Nền tảng:** Full-stack (`packages/core`, `packages/types`, `packages/ui`, `apps/api`, `apps/web`)
* **Chế độ Nghiệm thu Máy (Machine Verification):**
  * ✅ CLI Verification Script: `pnpm check-types` và `pnpm test` chạy trong Workspace trả về `exit 0`.
  * ✅ Visual QA & Component Verification: Kiểm tra tương tác thực tế trên trình duyệt ở 3 độ phân giải (Mobile 375px, Tablet 768px, Desktop 1280px).
* **Target Execution Tier:** Tier 1 (Core Architecture / High-Risk / Strict Gates 1–5).

---

## 2. Ma Trận Kịch Bản Kiểm Thử Chi Tiết (Test Scenarios Matrix)

| ID | Phân Loại | Mô Tả Kịch Bản | Dữ Liệu / Thao Tác Đầu Vào | Kết Quả Mong Đợi (Expected Outcome) | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TS-01** | Positive | Tải trang danh mục `/xe` mặc định | Truy cập trực tiếp URL `/xe` | Hiển thị Breadcrumbs (`Trang chủ > Danh mục dòng xe`), Tab "Tất Cả" active, Mốc "Tất Cả Mức Giá" active, toàn bộ xe hiển thị đầy đủ, FCP < 1.0s, CLS = 0. | ⏸️ PENDING |
| **TS-02** | Positive | Lọc theo Phân khúc xe (Tabs) | Khách click chọn Tab "SUV" | Chỉ hiển thị các dòng xe có `segment === 'suv'`. Tốc độ lọc tức thì `< 50ms`. URL cập nhật ngầm `/xe?segment=suv` không reload trang. | ⏸️ PENDING |
| **TS-03** | Positive | Lọc theo Mốc ngân sách đầu tư | Khách click chọn mốc "500 - 700 triệu" | Chỉ hiển thị các dòng xe có khoảng giá giao thoa với [500tr, 700tr]. Tốc độ `< 50ms`. URL cập nhật `/xe?price=500-700`. | ⏸️ PENDING |
| **TS-04** | Positive | Kết hợp đồng thời 2 tiêu chí lọc | Chọn Tab "Sedan" VÀ mốc "Dưới 500 triệu" | Lưới xe hiển thị chính xác tập giao (Sedan VÀ giá < 500tr). URL cập nhật `/xe?segment=sedan&price=under-500`. | ⏸️ PENDING |
| **TS-05** | Deep Link | Khởi tạo từ liên kết chia sẻ (Deep Link) | Truy cập URL `/xe?segment=mpv&price=700-1000` | Ngay khi mở trang: Tab "MPV" và nút "700 triệu - 1 tỷ" được active sẵn, chỉ hiển thị xe MPV trong tầm giá mà không cần bấm thêm. | ⏸️ PENDING |
| **TS-06** | Backward | Tương thích ngược tham số menu cũ | Truy cập URL `/xe?kieuDang=SUV` | Hệ thống tự động map `kieuDang` ➡️ `segment`, active Tab "SUV", hiển thị xe SUV bình thường. | ⏸️ PENDING |
| **TS-07** | Security | Phòng vệ XSS & Tham số không hợp lệ | Truy cập `/xe?segment=invalid_hack&price=<script>` | Bộ lọc tự động sanitize, bỏ qua các giá trị lạ và fallback về mặc định `'all'`. Không gây lỗi crash hay XSS. | ⏸️ PENDING |
| **TS-08** | Edge Case | Kịch bản không có xe phù hợp (Zero-State) | Chọn tổ hợp bộ lọc không có xe nào | Hiển thị component `CatalogEmptyState`. Khi bấm nút "Xóa bộ lọc & Xem tất cả xe" ➡️ State reset về `'all'`, URL quay về `/xe`, lưới xe phục hồi 100%. | ⏸️ PENDING |
| **TS-09** | CTA Flow | Điều hướng Nút Hành Động Kép | 1. Bấm nút "Xem Chi Tiết"<br>2. Bấm nút "Dự Toán Lăn Bánh" | 1. Chuyển hướng tới `/xe/[slug]`<br>2. Chuyển hướng tới `/gia-lan-banh?xe=[slug]` với xe được chọn sẵn trong bộ tính giá. | ⏸️ PENDING |
| **TS-10** | SEO Check | Kiểm tra JSON-LD Schema & Canonical | Xem mã nguồn HTML trang `/xe` | Thẻ `<link rel="canonical" href=".../xe">` cố định; thẻ `<script type="application/ld+json">` chứa cấu trúc `ItemList` hợp lệ theo chuẩn Google Search Central. | ⏸️ PENDING |
| **TS-11** | Responsive | Hiển thị đa thiết bị (Mobile/Tablet/Desktop) | Kiểm thử tại 375px, 768px, 1280px | Mobile: Tabs cuộn ngang mượt, nút touch target đạt `h-11` (44px), card full-width. Desktop: Grid 3-4 cột cân đối, không vỡ khung. | ⏸️ PENDING |
| **TS-12** | Quality | Kiểm tra Type-Safety Monorepo | Chạy `pnpm check-types` | Toàn bộ các workspace (`@cardealer/web`, `@cardealer/core`, `@cardealer/types`, `@cardealer/api`) biên dịch TypeScript 100% không lỗi (`exit 0`). | ⏸️ PENDING |

---

## 3. Lệnh Kiểm Chứng Tự Động (CLI Verification Script)

Kịch bản xác thực tự động sẽ được thực thi tại Giai đoạn 4 trước khi bàn giao sang Giai đoạn 5:

```bash
# 1. Kiểm tra toàn vẹn Type-check toàn monorepo
PATH="/opt/homebrew/bin:$PATH" pnpm --engine-strict=false check-types

# 2. Chạy bộ unit test SEO Schema và Pricing Engine
PATH="/opt/homebrew/bin:$PATH" pnpm --engine-strict=false test

# 3. Build thử nghiệm gói web để xác nhận Server Components và Static Generation
PATH="/opt/homebrew/bin:$PATH" pnpm --engine-strict=false --filter @cardealer/web build
```

---

## 4. Tiêu Chuẩn Nghiệm Thu Bắt Buộc (Definition of Done - DoD)
- [ ] 1. Tốc độ chuyển đổi bộ lọc phản hồi tức thì **`< 50ms`** trên trình duyệt.
- [ ] 2. Trạng thái bộ lọc được đồng bộ 2 chiều với URL query parameters (`segment`, `price`).
- [ ] 3. Thẻ xe hiển thị đầy đủ: Ảnh showroom, tên xe, phân khúc, số chỗ ngồi, loại nhiên liệu, khoảng giá `minPrice` - `maxPrice`, mức trả trước tối thiểu và 2 nút CTA.
- [ ] 4. JSON-LD Schema `ItemList` và `AggregateOffer` nhúng trực tiếp trong mã nguồn HTML Server Rendered.
- [ ] 5. CLI Verification Script kết thúc với mã thành công (`exit 0`).
