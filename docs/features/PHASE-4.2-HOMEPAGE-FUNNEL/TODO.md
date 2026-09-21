# 📝 Action Plan: Trang Chủ Phễu Chuyển Đổi 6 Phân Khu (Homepage Conversion Funnel - `/`)

## 1. Thông Tin Tổng Quan (Metadata)
* **Tên Tính Năng:** Trang Chủ Phễu Chuyển Đổi 6 Phân Khu (Homepage Conversion Funnel)
* **Mã Epic:** `EPIC-PHASE-4.2-HOMEPAGE-FUNNEL`
* **Cấp độ Thực thi:** Tier 1 (Full 5 Phase Lifecycle & Strict Gates 1–5)
* **Phân rã Lát cắt (Macro Slicing):** 4 Slices (`US-01`, `US-02`, `US-03`, `US-04`)
* **Tài liệu tham chiếu:** [`docs/features/PHASE-4.2-HOMEPAGE-FUNNEL/BACKLOG.md`](./BACKLOG.md), [`docs/06-PHASED-IMPLEMENTATION-ROADMAP.md`](../../06-PHASED-IMPLEMENTATION-ROADMAP.md)

---

### 🎯 GIAI ĐOẠN 2 & 3: ARCHITECTURE & RISK AUDIT

- [x] **Task 1: Phân tích Solution Options (Sub-Gate 2.1)**
  - Vị trí tác động: [`docs/features/PHASE-4.2-HOMEPAGE-FUNNEL/SOLUTION_OPTIONS.md`](./SOLUTION_OPTIONS.md)
  - Role phụ trách: `system-analyst-architect`
  - Kết quả: Đã phân tích 3 phương án kiến trúc. Developer đã chính thức thông quan: **Chốt Option 2 (Modular Domain Key `homepage_settings` + Hybrid SSR & Island Hydration)**.

- [x] **Task 2: Thiết kế Chi tiết Ngũ Tài Liệu (Bước 2.2)**
  - Vị trí tác động: `docs/features/PHASE-4.2-HOMEPAGE-FUNNEL/`
    - [`FLOW.md`](./FLOW.md): Luồng tương tác Client Storefront, Countdown Timer Lifecycle, Filter Interaction, Graceful Degradation State Machine.
    - [`SCHEMA.md`](./SCHEMA.md): Cấu trúc chi tiết Zod `HomepageSettingsSchema`, Zone Toggles, Defaults, Seeder Data.
    - [`API_SPEC.md`](./API_SPEC.md): Đặc tả REST endpoints: `GET /api/settings`, `GET /api/settings/homepage_settings`, `PUT /api/admin/settings/homepage_settings`.
    - [`UI_SPEC.md`](./UI_SPEC.md): Wireframes ASCII 6 phân khu, Design Tokens, Responsive Breakpoints, Typography & Brand Colors.
    - [`FE_INTEGRATION_GUIDE.md`](./FE_INTEGRATION_GUIDE.md): Cấu trúc Component Tree, Server/Client boundaries, Animations & Transitions.
  - Cửa chặn: **Gate 2** (Đã thông quan ✅).

- [x] **Task 3: Risk Audit & Test Plan (Giai đoạn 3)**
  - Vị trí tác động:
    - [`RISK_AUDIT.md`](./RISK_AUDIT.md): Kiểm toán toàn diện 17 điểm rủi ro R1–R17 (Layout Shift CLS, Lệch múi giờ Countdown, Dữ liệu rỗng vỡ layout, Stored XSS trong URL banner, Hiệu năng tải trang LCP...).
    - [`TEST_PLAN.md`](./TEST_PLAN.md): Ma trận 4 suites kiểm thử tự động, State Coverage, kịch bản CLI Verification Runner (`verify-phase-4-2.ts`, `exit 0`).
  - Cửa chặn: **Gate 3** (Chờ lệnh: `"Confirm Step 3: Duyệt Rủi ro & Câu hỏi Khách hàng"`).

---

### 🚀 GIAI ĐOẠN 4: EXECUTION ROADMAP BY VERTICAL SLICES (THỰC THI CUỐN CHIẾU)

#### 🔹 SLICE 1: US-01 — Contracts, Homepage Settings Schemas & API Integration
- [x] **Step 1.1:** Định nghĩa `HomepageSettingsSchema` và 6 Zone sub-schemas tại `packages/types/src/settings.ts`.
- [x] **Step 1.2:** Viết Unit/Integration Tests xác thực Schema & Fallback Defaults.
- [x] **Step 1.3:** Thêm seed data mặc định cho key `homepage_settings` trong `packages/database`.
- [x] **Step 1.4:** Cập nhật endpoint `GET /api/settings` và `PUT /api/admin/settings/homepage_settings` tại `apps/api`.

#### 🔹 SLICE 2: US-02 — Admin Portal Homepage Funnel Configurator
- [x] **Step 2.1:** Bổ sung Tab "Trang Chủ (Homepage)" trong `/admin/settings` và `SettingsTabNav.tsx`.
- [x] **Step 2.2:** Xây dựng 6 Accordion / Section Form cho 6 phân khu với công tắc Bật/Tắt độc lập (`HeroBannerForm`, `LeadFilterForm`, `SalerShowroomForm`, `DeliveryStoriesForm`, `HomepageFunnelSection`).
- [x] **Step 2.3:** Tích hợp form validation React Hook Form + Zod, xử lý lưu dữ liệu vào PostgreSQL và hiển thị phản hồi.

#### 🔹 SLICE 3: US-03 — Storefront Zones 1, 2, 3: Hero Banner, Lead Filter & Saler Profile
- [x] **Step 3.1:** Xây dựng `HeroBanner.tsx` (Countdown Timer, số suất ưu đãi, CTA Modal).
- [x] **Step 3.2:** Xây dựng `LeadMagnetFilter.tsx` (Bộ lọc nhanh theo giá & kiểu dáng xe).
- [x] **Step 3.3:** Xây dựng `SalerProfileSection.tsx` (Chuyển đổi Showroom 3S hoặc Hồ sơ cá nhân + 4 Cam kết vàng).

#### 🔹 SLICE 4: US-04 — Storefront Zones 4, 5, 6: Featured Showcase, Stories & News
- [x] **Step 4.1:** Xây dựng `FeaturedCarsSection.tsx` (Lấy xe `isFeatured = true`, giá niêm yết, trả trước từ X triệu).
- [x] **Step 4.2:** Xây dựng `DeliveryStoriesSection.tsx` (Gallery/Slider bàn giao xe cho khách hàng).
- [x] **Step 4.3:** Xây dựng `LatestNewsSection.tsx` (Khối bài viết khuyến mãi, tự động ẩn khi rỗng).
- [x] **Step 4.4:** Ghép toàn bộ vào `apps/web/app/page.tsx` (RSC nạp dữ liệu song song) và kiểm thử Core Web Vitals.

---

### 🛡️ GIAI ĐOẠN 5: VERIFICATION & REVIEW ĐỘC LẬP
- [x] **Task 5.1:** Chạy toàn bộ test suites (`check-types`, Vitest, CLI Verification Runner `exit 0`).
- [ ] **Task 5.2:** Kiểm tra UI Conformance & Design Tokens 1:1 với đặc tả.
- [ ] **Task 5.3:** Xuất bản `CODE_REVIEW.md` và `EXECUTION_LOG.md`.
