# 📝 Action Plan: Bộ Công Cụ Tài Chính & Phễu Thu Thập Khách Hàng (Pricing & Lead Engine)

## 1. Thông Tin Tổng Quan (Metadata)
* **Tên Tính Năng:** Bộ Công Cụ Tài Chính & Phễu Thu Thập Khách Hàng (Pricing & Lead Engine)
* **Mã Epic:** `EPIC-PHASE-3-PRICING-LEAD`
* **Cấp độ Thực thi:** Tier 1 (Full 5 Phase Lifecycle & Strict Gates 1–5)
* **Phân rã Lát cắt (Macro Slicing):** 4 Slices (`US-01`, `US-02`, `US-03`, `US-04`)
* **Tài liệu tham chiếu:** `fe-cardealer/app/gia-lan-banh/page.tsx`, `04-TINH-NANG-FRONTEND-VA-TRAI-NGHIEM-UI-UX.md` (Mục 3 & 4)

---

### 🎯 GIAI ĐOẠN 2 & 3: ARCHITECTURE & RISK AUDIT

- [x] **Task 1: Phân tích Solution Options (Sub-Gate 2.1)**
  - Vị trí tác động: `docs/features/PHASE-3-PRICING-LEAD-ENGINE/SOLUTION_OPTIONS.md`
  - Role phụ trách: `system-analyst-architect`
  - Kết quả: Đã phân tích 3 phương án. Người dùng đã chốt **Option 1: 2-Step Soft-Gate Funnel (fe-cardealer reference) với Live Cost Breakdown & Zero-Cost Client Verification**.

- [x] **Task 2: Thiết kế Chi tiết Ngũ Tài Liệu (Bước 2.2)**
  - Vị trí tác động: `docs/features/PHASE-3-PRICING-LEAD-ENGINE/`
    - [FLOW.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-3-PRICING-LEAD-ENGINE/FLOW.md): Luồng tương tác 3 trạng thái SmartCalculator (`input` -> `gate [blur-sm]` -> `success [unblur]`), Lead capture, Idempotency & Admin triage flow.
    - [SCHEMA.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-3-PRICING-LEAD-ENGINE/SCHEMA.md): Cấu trúc bảng `leads`, indexes, enum `lead_status_enum` và Zod schemas.
    - [API_SPEC.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-3-PRICING-LEAD-ENGINE/API_SPEC.md): Đặc tả chi tiết `POST /api/leads`, `GET /api/admin/leads`, `PATCH /api/admin/leads/:id/status`.
    - [UI_SPEC.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-3-PRICING-LEAD-ENGINE/UI_SPEC.md): Wireframes ASCII, State 1/2/3, Slider trả góp, Sticky CTA mobile, Admin CRM Table & Lead Drawer.
    - [FE_INTEGRATION_GUIDE.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-3-PRICING-LEAD-ENGINE/FE_INTEGRATION_GUIDE.md): Kiến trúc Component, Framer Motion, Design Tokens, SEO JSON-LD và Optimistic updates.
  - DoD: Hoàn thiện 100% bản vẽ chi tiết cho phương án được duyệt.

- [x] **Task 3: Risk Audit & Test Plan (Giai đoạn 3)**
  - Vị trí tác động:
    - [RISK_AUDIT.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-3-PRICING-LEAD-ENGINE/RISK_AUDIT.md): Kiểm toán toàn diện 17 điểm rủi ro R1–R17 (DDoS spam bot, số ảo, duplicate race condition, BOLA dữ liệu khách hàng, sai số tiền tệ VNĐ, XSS CRM...).
    - [TEST_PLAN.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-3-PRICING-LEAD-ENGINE/TEST_PLAN.md): Kế hoạch kiểm thử tự động kim tự tháp (5 suites, 8 kịch bản CLI verification runner với mã thoát `exit 0`).
  - DoD: Rà soát ma trận rủi ro R1-R17 và sẵn sàng kịch bản kiểm thử tự động không phụ thuộc thao tác tay.

---

### 🚀 GIAI ĐOẠN 4: EXECUTION ROADMAP BY VERTICAL SLICES (THỰC THI CUỐN CHIẾU)

#### 🔹 SLICE 1: US-01 — Pricing & Financial Core Engine + Test Suites
- [x] **Step 1.1:** Mở rộng Contracts trong `packages/types/src/pricing.ts` & `lead.ts`.
- [x] **Step 1.2:** Hoàn thiện Engine `calculateRollingCost` và `calculateInstallment` trong `packages/core/src/pricing/`.
- [x] **Step 1.3:** Viết Unit Test Suite kiểm chứng 100% các ca tính tiền thực tế (sai số 0 đồng) và chạy verification script `exit 0`.

#### 🔹 SLICE 2: US-02 — Lead Entity, DB Migration & Ingestion API
- [x] **Step 2.1:** Khởi tạo Drizzle Schema `leads` tại `packages/database/src/schema/leads.ts`.
- [x] **Step 2.2:** Sinh file migration chuẩn Drizzle Kit (Non-destructive: `0002_gray_marvel_apes.sql`).
- [x] **Step 2.3:** Xây dựng route `POST /api/leads` có Idempotency 10 phút, Rate limit và kiểm tra cú pháp SĐT bằng Regex miễn phí (zero-cost) tại `apps/api/src/routes/leads.ts`.
- [x] **Step 2.4:** Xây dựng route Admin `GET /api/admin/leads` và `PATCH /api/admin/leads/:id/status` tại `apps/api/src/routes/admin/leads.ts`.
- [x] **Step 2.5:** Chạy kịch bản kiểm thử API `exit 0`.

#### 🔹 SLICE 3: US-03 — Storefront SmartCalculator & 2-Step Gated Lead Funnel
- [x] **Step 3.1:** Xây dựng `LeadGateModal` & Form thu thập thông tin khách hàng tại `apps/web`.
- [x] **Step 3.2:** Tái cấu trúc và nâng cấp `SmartCalculator` component với 3 state (`input` -> `gate [blur-sm]` -> `success [unblur]`).
- [x] **Step 3.3:** Xây dựng component `InstallmentEstimatorTab` với phễu Soft-Gate mờ chi tiết gốc lãi và mở khóa kèm thông báo gọi lại ngay.
- [x] **Step 3.4:** Xây dựng trang `apps/web/app/gia-lan-banh/page.tsx` với SEO JSON-LD Schema và FAQ Accordion.

#### 🔹 SLICE 4: US-04 — Admin Lead Management & CRM Table
- [x] **Step 4.1:** Xây dựng Typed Service `leadService` tại `apps/admin/services/lead.service.ts`.
- [x] **Step 4.2:** Xây dựng trang `apps/admin/app/(dashboard)/leads/page.tsx` hiển thị danh sách Lead, lọc trạng thái, cập nhật tại chỗ.
- [x] **Step 4.3:** Xây dựng `LeadDetailDrawer` xem chi tiết dự toán và nhật ký tư vấn.
- [x] **Step 4.4:** Mở khóa Menu điều hướng "Khách Hàng & Báo Giá" (`/leads`) trong `AdminShell.tsx`.
- [x] **Step 4.5:** Kiểm tra phân quyền RBAC: Sales & Manager thao tác lead, Editor bị chặn.

---

### 🛡️ GIAI ĐOẠN 5: REVIEW ĐỘC LẬP & DUYỆT MERGE
- [x] **Task 5.1:** Review độc lập 1:1 theo `independent-code-reviewer.md` (Tạo [CODE_REVIEW.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-3-PRICING-LEAD-ENGINE/CODE_REVIEW.md) đạt 🟢 PASS).
- [x] **Task 5.2:** Chạy `pnpm check-types` trên toàn bộ monorepo (đạt 8/8 packages passed, 0 errors).
- [x] **Task 5.3:** Chạy `pnpm verify:phase-3` đạt 38/38 tests pass (`exit 0`).
- [x] **Task 5.4:** Mở khóa Gate 5 thông quan và bàn giao hoàn thiện Phase 3.
