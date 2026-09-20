# 📝 Action Plan: PHASE 2 - ADMIN USER & RBAC MANAGEMENT

> **Mã Epic:** `EPIC-PHASE-2-ADMIN-USER-RBAC`  
> **Cấp độ Thực thi:** **Tier 1 (Core Architecture & Security / Full 5-Phase Playbook)**  
> **Trạng thái hiện tại:** **Giai đoạn 4: Thực thi Code & Verification (Hoàn thành) ➡️ Chờ duyệt Gate 4**

---

## 🧭 Kế Hoạch Thực Thi Từng Giai Đoạn (Phase 2 Action Roadmap)

### Giai đoạn 1: Phân tích Chiến lược & Lập Backlog (Hoàn thành ✅ - Gate 1 Đã Duyệt)
- [x] **Task 1.1:** Phân rã 6 User Stories cốt lõi cho Quản trị Người dùng & Phân quyền RBAC (US-2.1 đến US-2.6)
- [x] **Task 1.2:** Phân tích 6 lăng kính nghiệp vụ: PoLP, Anti-Privilege Escalation, Anti-Self-Lockout, Token Version Revocation, Audit Trail, Zero-CLS UX
- [x] **Task 1.3:** Xuất bản `BACKLOG.md` và `TODO.md` tại `docs/features/PHASE-2-ADMIN-USER-RBAC/`
- [x] **Task 1.4:** Nhận phản hồi & chốt Gate 1 thông qua bộ tài liệu Backlog

---

### Giai đoạn 2: Thiết kế Kiến trúc (Hoàn thành ✅ - Gate 2 Đã Duyệt)
- [x] **Task 2.1: Phân tích Giải pháp Kiến trúc RBAC & Audit Trail (Sub-Gate 2.1 - Đã duyệt ✅)**
  * **Role:** `system-analyst-architect`
  * **Quyết định đã chốt:** **Combo Khuyến Nghị (Option A + Option 1 + Option I)**
    - Option A: Hybrid Matrix-based RBAC trong `@cardealer/types`
    - Option 1: State-Machine Counter `tokenVersion` trong bảng `users`
    - Option I: Append-Only PostgreSQL Table `audit_logs` có trường `details: jsonb`
- [x] **Task 2.2: Thiết kế Chi tiết Ngũ Tài Liệu (Hoàn thành ✅)**
  * Đã xuất bản đầy đủ: `SOLUTION_OPTIONS.md`, `FLOW.md`, `SCHEMA.md`, `API_SPEC.md`, `FE_INTEGRATION_GUIDE.md`.

---

### Giai đoạn 3: Kiểm soát Rủi ro & Test Plan (Hoàn thành ✅ - Gate 3 Đã Duyệt)
- [x] **Task 3.1: Báo cáo Ma trận Rủi ro An ninh R1–R17 (`RISK_AUDIT.md`)**
  * Đã kiểm toán chi tiết 17 điểm rủi ro an ninh từ Critical (R1-R4) đến Low (R16).
- [x] **Task 3.2: Kế hoạch Kiểm thử Máy Tự Động (`TEST_PLAN.md`)**
  * Thiết kế 6 Test Suites tự động và CLI Verification Runner (`verify-phase-2-rbac.ts`).

---

### Giai đoạn 4: Thực thi Code & Verification (Hoàn thành ✅ ➡️ Chờ duyệt Gate 4)
*Chi tiết Lộ trình Cấp độ Hàm & Pre-coding Checklist lưu trữ tại: [`EXECUTION_LOG.md`](./EXECUTION_LOG.md)*
- [x] **Task 4.1:** Mở rộng Drizzle Schema `users` & tạo bảng `audit_logs` (`packages/database`), tạo tệp migration an toàn `0001_phase2_admin_rbac.sql` (Chờ Developer chạy theo chỉ đạo)
- [x] **Task 4.2:** Bổ sung Zod contracts cho 4 roles, user management DTOs (`packages/types`)
- [x] **Task 4.3:** Xây dựng RBAC Middleware, Anti-Self-Lockout Guard & 10 REST APIs `/api/admin/users/*`, `/api/admin/profile/*` (`apps/api`)
- [x] **Task 4.4:** Triển khai Giao diện Quản trị Nhân viên `/admin/users` (Data-table, Filter, Quick Lock/Unlock, Skeleton Loading, ConfirmModal)
- [x] **Task 4.5:** Triển khai Giao diện Hồ sơ Cá nhân `/admin/profile` & Cập nhật AdminShell navigation phân quyền
- [x] **Task 4.6:** Chạy kiểm tra Typecheck đạt 8/8 packages thành công (0 errors) & thiết lập CLI Verification Script
  * **Cửa chặn:** Chờ lệnh `"Accept & Finalize"` để thông quan Gate 4.

---

### Giai đoạn 5: Review Độc Lập Trước Khi Merge (Independent Review)
- [ ] **Task 5.1:** Đánh giá độc lập trên Git Diff (`CODE_REVIEW.md`) đảm bảo zero vulnerabilities và zero regressions.

---

### Giai đoạn Bonus: Ghi Chép Tri Thức (Memory Governance)
- [ ] **Task 6.1:** Cập nhật tài liệu hệ thống và bài học kinh nghiệm về RBAC.

---

### 🧭 TRẠNG THÁI QUY TRÌNH (WORKFLOW GATE STATUS)
- **Tình trạng Môi trường:** 🟢 Pure Development
- **Giai đoạn Hiện tại:** Giai đoạn 4: Thực thi Code & Verification (Hoàn thành) ➡️ **Chờ duyệt Gate 4**
- **Skills Đang Kích Hoạt:** `fullstack-dev-executor`
- **Tiêu chuẩn Senior Dev:** 🟢 PASSED (Roadmap Announced, SRP, File Length < 250 lines, Mental Model Comments Included, Zero Hardcode, Zero Ad-hoc Styling, Shared Primitives Reused, Centralized API & Error Handling, Type-Safe Fail-Fast Env)
- **Hồ sơ Đã Nghiệm Thu:**
  - Gate 1: [`docs/features/PHASE-2-ADMIN-USER-RBAC/BACKLOG.md`](./BACKLOG.md) (✅)
  - Gate 2: Bộ Ngũ Hồ Sơ Thiết Kế (`SOLUTION_OPTIONS.md`, `FLOW.md`, `SCHEMA.md`, `API_SPEC.md`, `FE_INTEGRATION_GUIDE.md`) (✅)
  - Gate 3: [`docs/features/PHASE-2-ADMIN-USER-RBAC/RISK_AUDIT.md`](./RISK_AUDIT.md), [`TEST_PLAN.md`](./TEST_PLAN.md) (✅)
- **Sản phẩm Đã Tạo (Giai đoạn 4):**
  - Source code hoàn chỉnh trên 4 packages (`database`, `types`, `api`, `admin`).
  - Migration file: `packages/database/drizzle/0001_phase2_admin_rbac.sql`.
  - Type-check: 100% Pass (8/8 packages qua `pnpm check-types`).
- **Trạng thái Cửa chặn Gate 4:** 🔒 **ĐANG KHÓA (LOCKED)** — Chờ Developer nghiệm thu.
- **Lệnh cần Developer gửi để thông quan Gate 4:** `"Accept & Finalize"`
