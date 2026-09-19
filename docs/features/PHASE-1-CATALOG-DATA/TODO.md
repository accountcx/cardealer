# 📝 Action Plan: PHASE 1 - CORE DATA LAYER & CAR CATALOG ENGINE

> **Mã Epic:** `EPIC-PHASE-1-CATALOG-DATA`  
> **Cấp độ Thực thi:** **Tier 1 (Core Architecture / Greenfield / Full 5-Phase Playbook)**

---

## 🧭 Kế Hoạch Thực Thi Từng Giai Đoạn (Phase 1 Roadmap)

### Giai đoạn 1: Phân tích Chiến lược & Lập Backlog (Hoàn thành)
- [x] **Task 1.1:** Phân rã 6 User Stories cho Core Data Layer, Catalog & Admin Auth (US-1.1 đến US-1.6)
- [x] **Task 1.2:** Brainstorming 6 lăng kính (Uniqueness, Indexing, Lifecycle, Boundary, Auth Security)
- [x] **Task 1.3:** Xuất bản `BACKLOG.md` và `TODO.md` tại `docs/features/PHASE-1-CATALOG-DATA/`
- [x] **Task 1.4:** Nhận lệnh `"Confirm Step 1: Duyệt Backlog"` từ Developer để thông quan Gate 1 (Đã thông quan ✅)

---

### Giai đoạn 2: Thiết kế Kiến trúc (Two-Phase Option Gate - Hoàn thành)
- [x] **Task 2.1: Phân tích Giải pháp ORM, Database Layer & Cơ chế Auth (Sub-Gate 2.1)** (Đã chốt: Drizzle ORM + JWT Cookie + Next.js 16 Tailwind Shadcn ✅)
- [x] **Task 2.2: Thiết kế Chi tiết Ngũ Tài Liệu (Bước 2.2)** (Đã xuất bản đầy đủ & thông quan Gate 2 ✅)
  * **File:** `docs/features/PHASE-1-CATALOG-DATA/`
  * **DoD:**
    * `SCHEMA.md` (`db-schema-architect`): Sơ đồ ERD 7 bảng Phase 1, kiểu dữ liệu PostgreSQL, Unique constraints, Drizzle ORM relations.
    * `API_SPEC.md` (`feature-spec-generator`): Đặc tả API Auth, Catalog & Admin CRUD, chuẩn Envelope response.
    * `FLOW.md` (`logic-flow-ba`): Sequence Diagram luồng đăng nhập Admin, bảo vệ tuyến đường, nạp dữ liệu xe và truy vấn danh mục.
    * `UI_SPEC.md` (`ui-ux-designer`): Đặc tả Giao diện Admin CMS: Layout Shell, Màn hình Login (`/admin/login`), Data-table Danh sách xe và Form 4 Tabs Xe & Swatch Màu sắc.

---

### Giai đoạn 3: Kiểm soát Rủi ro & Test Plan (Risk Audit & Test Plan - Hoàn thành)
- [x] **Task 3.1: Báo cáo Ma trận Rủi ro R1–R17 (`RISK_AUDIT.md`)** (Đã kiểm toán 17 rủi ro & giải pháp phòng vệ ✅)
  * **Role:** `dependency-graph-analyzer`
  * **DoD:** Rà soát N+1 queries, Race condition trùng slug, bảo mật mật khẩu bcrypt, CSRF/XSS cookie security, BigInt serialization, DB connection pooling.
- [x] **Task 3.2: Kế hoạch Kiểm thử Máy Tự Động (`TEST_PLAN.md`)** (Đã lập 6 Test Suites tự động ✅)
  * **Role:** `qa-test-engineer`
  * **DoD:** Kịch bản CLI Verification Script tự động kiểm tra kết nối DB, kiểm tra đăng nhập Admin, query dữ liệu xe và validate schema (`exit 0`).
  * **Cửa Chặn:** Chờ lệnh `"Confirm Step 3: Duyệt Rủi ro & Câu hỏi Khách hàng"` để thông quan Gate 3.

---

### Giai đoạn 4: Thực thi Code & Verification (Implementation - Hoàn thành)
- [x] **Task 4.1: Triển khai Database Schemas & Migrations (`packages/database`)** (Bao gồm bảng `users`, `cars`, `car_versions`, `colors`...)
- [x] **Task 4.2: Cập nhật Type Definitions & Contracts (`packages/types`)** (Auth types, User roles, Car DTOs)
- [x] **Task 4.3: Viết Script Seed Dữ liệu mẫu (`packages/database/src/seeds/`)** (Tài khoản Admin mặc định `admin@xehyundaivinh.com` + 4 dòng xe chủ lực)
- [x] **Task 4.4: Xây dựng REST APIs Auth & Catalog (`apps/api/src/routes/`)** (`/api/auth/*` và `/api/cars/*`)
- [x] **Task 4.5: Xây dựng Admin Auth & Login Screen (`apps/admin/app/login/`)** (Form đăng nhập, session cookie, middleware chuyển hướng nếu chưa đăng nhập)
- [x] **Task 4.6: Xây dựng Giao diện Admin quản lý xe (`apps/admin/app/cars/`, `colors`, `settings`)** (Danh sách dòng xe, form thêm/sửa 4 tabs, swatch màu sắc, cấu hình showroom)
- [x] **Task 4.7: Chạy CLI Machine Verification Script đạt mã `exit 0`** (18/18 test cases 100% PASS)
  * Chờ lệnh `"Confirm Step 4: Duyệt Triển khai Code & Verification"` để thông quan Gate 4.

---

### Giai đoạn 5: Review Độc Lập Trước Khi Merge (Independent Review)
- [ ] **Task 5.1: Review Độc Lập Toàn Diện trên Git Diff (`CODE_REVIEW.md`)**
  * **Role:** `independent-code-reviewer`
  * **DoD:** Không còn khuyết tật 🔴 Major. Nhận lệnh `"Confirm Step 5: Duyệt Review Độc lập"`.

---

### Giai đoạn Bonus: Ghi Chép Tri Thức (Memory Governance)
- [ ] **Task 6.1: Cập nhật `MEMORY.md` và `docs/LESSONS_LEARNED.md`**
  * **Role:** `knowledge-base-scribe`
