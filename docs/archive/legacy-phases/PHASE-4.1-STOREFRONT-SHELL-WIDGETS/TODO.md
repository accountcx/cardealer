# 📝 Action Plan: Khung Nền Tảng Storefront & Tiện Ích Chuyển Đổi Toàn Cục (Global Shell & Conversion Widgets)

## 1. Thông Tin Tổng Quan (Metadata)
* **Tên Tính Năng:** Khung Nền Tảng Storefront & Tiện Ích Chuyển Đổi Toàn Cục (Global Shell & Conversion Widgets)
* **Mã Epic:** `EPIC-PHASE-4.1-STOREFRONT-SHELL-WIDGETS`
* **Cấp độ Thực thi:** Tier 1 (Full 5 Phase Lifecycle & Strict Gates 1–5)
* **Phân rã Lát cắt (Macro Slicing):** 4 Slices (`US-01`, `US-02`, `US-03`, `US-04`)
* **Tài liệu tham chiếu:** [`docs/features/PHASE-4.1-STOREFRONT-SHELL-WIDGETS/BACKLOG.md`](./BACKLOG.md), `fe-cardealer/app/layout.tsx`, `Navbar.tsx`, `Footer.tsx`, `FloatingSeller.tsx`, `ProductStickyBar.tsx`

---

### 🎯 GIAI ĐOẠN 2 & 3: ARCHITECTURE & RISK AUDIT

- [x] **Task 1: Phân tích Solution Options (Sub-Gate 2.1)**
  - Vị trí tác động: [`docs/features/PHASE-4.1-STOREFRONT-SHELL-WIDGETS/SOLUTION_OPTIONS.md`](./SOLUTION_OPTIONS.md)
  - Role phụ trách: `system-analyst-architect`
  - Kết quả: Đã phân tích 3 phương án kiến trúc. Developer đã chính thức thông quan: **Chốt Option 2 (Modular Domain Keys, Hybrid SSR + On-Demand Tag Revalidation & Viewport Coordination)**.

- [x] **Task 2: Thiết kế Chi tiết Ngũ Tài Liệu (Bước 2.2)**
  - Vị trí tác động: `docs/features/PHASE-4.1-STOREFRONT-SHELL-WIDGETS/`
    - [`FLOW.md`](./FLOW.md): Luồng tương tác Client Storefront, Mobile Drawer State Machine, FloatingSeller Popup Toggle, StickyBar Scroll Trigger & Admin Sync Flow.
    - [`SCHEMA.md`](./SCHEMA.md): Cấu trúc chi tiết các Keys trong `system_settings`, Zod Schemas (`NavigationSchema`, `ContactSettingsSchema`, `StickyBarSchema`, `SiteSettingsSchema`, `BulkSettingsSchema`).
    - [`API_SPEC.md`](./API_SPEC.md): Đặc tả REST endpoints: `GET /api/settings`, `GET /api/settings/:key`, `GET /api/admin/settings`, `PUT /api/admin/settings/:key`.
    - [`UI_SPEC.md`](./UI_SPEC.md): Wireframes ASCII, Ma trận trạng thái (Normal/Hover/Active/Open), Layout Hierarchy, Dark/Navy Theme Tokens, Responsive Breakpoints.
    - [`FE_INTEGRATION_GUIDE.md`](./FE_INTEGRATION_GUIDE.md): Cấu trúc Component Tree, Props contracts, Client vs Server Component Boundaries, Framer Motion transitions, Local Business SEO Schema.
  - Cửa chặn: **Gate 2** (Lệnh: `"Confirm Step 2: Duyệt Thiết kế"`).

- [x] **Task 3: Risk Audit & Test Plan (Giai đoạn 3)**
  - Vị trí tác động:
    - [`RISK_AUDIT.md`](./RISK_AUDIT.md): Kiểm toán toàn diện 17 điểm rủi ro R1–R17 (Layout Shift CLS, Widget che khuất nhau trên Mobile, Stored XSS từ bản đồ, Stale Cache Lockout, Lỗi vỡ giao diện khi CMS null...).
    - [`TEST_PLAN.md`](./TEST_PLAN.md): Ma trận 5 suites kiểm thử tự động, End-to-End browser validation, Viewport Coordinator tests và kịch bản CLI Verification Runner (`verify-phase-4-1.ts`, `exit 0`).
  - Cửa chặn: **Gate 3** (Lệnh: `"Confirm Step 3: Duyệt Rủi ro & Câu hỏi Khách hàng"`).

---

### 🚀 GIAI ĐOẠN 4: EXECUTION ROADMAP BY VERTICAL SLICES (THỰC THI CUỐN CHIẾU)

#### 🔹 SLICE 1: US-01 — Contracts, System Settings Schemas & Public APIs
- [x] **Step 1.1:** Bổ sung `NavigationSchema`, `StickyBarSchema`, hoàn thiện `ContactSettingsSchema` & `SiteSettingsSchema` tại `packages/types/src/settings.ts`.
- [x] **Step 1.2:** Mở rộng seed dữ liệu mặc định hệ thống cho các keys mới trong `packages/database`.
- [x] **Step 1.3:** Cập nhật endpoint `GET /api/settings` (Bulk query tất cả settings đang active) và `GET /api/settings/:key` tại `apps/api/src/routes/catalog.ts`.
- [x] **Step 1.4:** Viết Integration Test kiểm tra API settings trả về đúng Zod schema và chạy verification script `exit 0`.

#### 🔹 SLICE 2: US-02 — Admin CMS Management Portal for Shell & Widgets
- [x] **Step 2.1:** Cập nhật `settingsService` tại `apps/admin/services/settings.service.ts` để hỗ trợ đa key cấu hình.
- [x] **Step 2.2:** Tái cấu trúc trang `/admin/settings` thành các Tabs chuyên biệt:
  - Tab 1: Thông tin Showroom & Liên Hệ (`ContactSettings`).
  - Tab 2: Menu Điều Hướng (`NavigationSettings` - Thêm/sửa/xóa liên kết, sắp xếp thứ tự).
  - Tab 3: Chuyên Viên Tư Vấn Nổi (`FloatingSellerSettings` - Avatar, tên, hotline, link Zalo, bật/tắt).
  - Tab 4: Thanh Chốt Đơn Chân Trang (`StickyBarSettings` - Bật/tắt, nhãn nút CTA, hotline).
- [x] **Step 2.3:** Tích hợp React Hook Form + Zod validation cho từng section, xử lý lưu thành công và hiển thị Toast thông báo.

#### 🔹 SLICE 3: US-03 — Storefront Layout Shell, Dynamic Navbar & Mobile Drawer
- [x] **Step 3.1:** Xây dựng Client UI Components trong `@cardealer/ui` hoặc `apps/web/components/layout/`:
  - `Navbar.tsx`: Sticky Header, Logo thương hiệu, Dynamic Navigation Links, Hotline 24/7, CTA "Nhận Báo Giá".
  - `MobileDrawer.tsx`: Trượt êm ái, Accordion danh mục xe, 2 nút liên hệ một chạm to bản ở đáy.
  - `Footer.tsx`: Cột thông tin showroom, Google Maps iframe an toàn, menu liên kết chân trang, giờ mở cửa, icon BCT và social media.
- [x] **Step 3.2:** Cập nhật `apps/web/app/layout.tsx` (RSC) nạp dữ liệu song song từ API settings và tích hợp Navbar, Footer, Mobile Drawer.
- [x] **Step 3.3:** Bổ sung SEO JSON-LD `AutoDealer` schema cho toàn trang.

#### 🔹 SLICE 4: US-04 — High-Conversion Global Widgets: FloatingSeller & ProductStickyBar
- [x] **Step 4.1:** Xây dựng component `FloatingSeller.tsx`:
  - Avatar chuyên viên kèm hiệu ứng pulse sóng xanh online.
  - Click mở Card thông tin chuyên viên với 2 nút: Gọi Hotline (`tel:`) và Chat Zalo.
  - Đảm bảo an toàn không bị che khuất trên mobile.
- [x] **Step 4.2:** Xây dựng component `ProductStickyBar.tsx`:
  - Lắng nghe sự kiện scroll (trượt lên khi cuộn qua 300px).
  - Hiển thị tên xe/thông điệp, giá, nút "GỌI NGAY" và nút "NHẬN BÁO GIÁ" mở Modal Lead.
  - Hỗ trợ safe-area-inset cho iPhone.
- [x] **Step 4.3:** Tích hợp `FloatingSeller` và `ProductStickyBar` vào `apps/web/app/layout.tsx`.
- [x] **Step 4.4:** Kiểm thử trực quan và xác nhận CLS = 0, hoạt động hoàn hảo trên Android & iOS.

---

### 🛡️ GIAI ĐOẠN 5: REVIEW ĐỘC LẬP & DUYỆT MERGE
- [x] **Task 5.1:** Review độc lập 1:1 theo `independent-code-reviewer.md` (Tạo `CODE_REVIEW.md` đạt 🟢 PASS).
- [x] **Task 5.2:** Chạy `pnpm check-types` trên toàn bộ monorepo (8/8 packages passed, 0 errors).
- [x] **Task 5.3:** Chạy verification script toàn diện cho Phase 4.1 (`exit 0`).
- [ ] **Task 5.4:** Mở khóa Gate 5 thông quan và bàn giao hoàn thiện Phase 4.1.

