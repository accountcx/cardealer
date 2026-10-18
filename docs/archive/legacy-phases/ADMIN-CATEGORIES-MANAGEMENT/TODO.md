# 📝 Action Plan: Quản Trị Chuyên Mục Bài Viết (Admin Categories Management)

## Execution Tier: Tier 2 (Medium-Risk / Sub-feature & Admin Portal Extension)
* **Dự án:** CarDealer Monorepo (`/Users/nhatphan/Code/CarDealer/cardealer`)
* **Môi trường:** 🟢 Pure Development (Sandbox)
* **Epic ID:** `ADMIN-CATEGORIES-MANAGEMENT`
* **Mô hình Dữ liệu:** Danh mục 1 tầng (Flat Taxonomy) — Mỗi bài viết gắn 1 chuyên mục duy nhất
* **Tiêu chuẩn Kỹ thuật:** Universal Agentic Workflow v2.2.0 & Fullstack Dev Executor v2.3.0

---

### 🎯 GIAI ĐOẠN 2 & 3: ARCHITECTURE & RISK AUDIT

- [x] **Task 1: Phân tích Giải pháp Kiến trúc (Sub-Gate 2.1)** (`system-analyst-architect`)
  - [x] So sánh các Option đếm `postCount` (Drizzle SQL Group By Left Join vs Subquery vs Denormalized Column).
  - [x] Lập file `docs/features/ADMIN-CATEGORIES-MANAGEMENT/SOLUTION_OPTIONS.md`.
  - [x] **Chốt Option A:** Drizzle SQL Aggregate Query (`leftJoin` + `count` + `groupBy`).

- [x] **Task 2: Thiết kế Chi tiết Ngũ Tài Liệu (Bước 2.2)** (`logic-flow-ba`, `db-schema-architect`, `feature-spec-generator`, `tailwind-ui-designer`)
  - [x] Lập `FLOW.md`: Sequence diagram luồng tạo danh mục, tự sinh slug tiếng Việt, gán chuyên mục cho bài viết, kiểm tra chặn xóa an toàn.
  - [x] Lập `SCHEMA.md`: Drizzle ORM Schema, Types contracts, Indexing & Constraints.
  - [x] Lập `API_SPEC.md`: Contract REST API endpoints (`/api/admin/categories/*`).
  - [x] Lập `FE_INTEGRATION_GUIDE.md`: Cấu hình UI Table, Modal Tạo/Sửa, Confirm Delete Modal, Form Validation.
  - [x] Đồng bộ hóa bản đồ hệ thống `docs/SYSTEM_MAP.md`.
  - [x] **Đã duyệt Thiết kế tại Gate 2.**

- [ ] **Task 3: Kiểm soát Rủi ro & Test Plan (Giai đoạn 3)** (`dependency-graph-analyzer`, `qa-test-engineer`)
  - [x] Lập `RISK_AUDIT.md`: Đánh giá các chỉ số rủi ro (R1-R17: Orphan posts, Restrict delete violation, Duplicate slug collision, SQL injection...).
  - [x] Lập `TEST_PLAN.md`: Ma trận trạng thái (State Exhaustiveness), kịch bản test CLI verification script tự động (`exit 0`).
  - [ ] **Chờ lệnh:** `Confirm Step 3: Duyệt Rủi ro & Câu hỏi Khách hàng`

---

### 🚀 GIAI ĐOẠN 4: EXECUTION ROADMAP BY VERTICAL SLICES (Step-Gate v2.3.0)

#### 🔹 SLICE 1: US-01 — Backend API & Data Contracts Enhancement
- [x] **Step 4.0: Turn 0 Pre-coding Roadmap & Tool-Lock (HARD STOP)**
- [x] **Step 1.1:** Zod Validation Schemas & Types cho Category (`packages/types/src/category.ts`) `[risk_tier: LOW]`
- [x] **Step 1.2:** Helper tự sinh slug tiếng Việt chuẩn SEO (`@cardealer/core` đã có sẵn `slugifyVietnamese`) `[risk_tier: LOW]`
- [x] **Step 1.3:** Nâng cấp API Routes `/api/admin/categories` (GET kèm count, POST, PUT, DELETE có guard) (`apps/api/src/routes/posts.ts`) `[risk_tier: HIGH]`
- [x] **Step 1.4:** Slice 1 Machine Verification (Project-wide Type Check PASS -> exit 0)

#### 🔹 SLICE 2: US-02 — Admin Categories Management Portal
- [x] **Step 2.1:** Category Typed Client Service (`apps/admin/services/category.service.ts`) `[risk_tier: LOW]`
- [x] **Step 2.2:** Modal Tạo & Chỉnh sửa Chuyên mục với Auto-slug (`apps/admin/app/categories/CategoryModal.tsx`) `[risk_tier: MEDIUM]`
- [x] **Step 2.3:** Trang Quản trị Chuyên mục với 4-State UI Table (`apps/admin/app/categories/page.tsx`) `[risk_tier: MEDIUM]`
- [x] **Step 2.4:** Thêm Menu "Chuyên Mục Tin Tức" vào Sidebar (`apps/admin/app/components/AdminShell.tsx`) `[risk_tier: LOW]`
- [x] **Step 2.5:** Slice 2 Machine Verification (`pnpm --filter @cardealer/admin check-types` -> exit 0)

#### 🔹 SLICE 3: US-03 — Post Editor & Storefront Query Sync
- [x] **Step 3.1:** Rà soát và kiểm tra dropdown Category trong trang soạn thảo bài viết (`apps/admin/app/posts/`) `[risk_tier: LOW]`
- [x] **Step 3.2:** Đồng bộ query param `?category={slug}` trên Storefront (`apps/web/app/tin-tuc/page.tsx`) `[risk_tier: LOW]`
- [x] **Step 3.3:** Slice 3 & Project-wide Final Machine Verification (`scripts/verify_admin_categories.sh` -> exit 0)
- [x] **Nghiệm thu Gate 4:** `Accept & Finalize (Đã hoàn tất 100% 7 Units)`

---

### 🛡️ GIAI ĐOẠN 5: REVIEW ĐỘC LẬP TRƯỚC KHI MERGE
- [ ] **Task 5.1:** Audit Git Diff độc lập (`independent-code-reviewer`).
- [ ] **Task 5.2:** Kiểm tra Live CVEs & Taint Sink (CWE-117/200).
- [ ] **Task 5.3:** Xuất `CODE_REVIEW.md` và giải quyết 100% lỗi Major/Blocker.
- [ ] **Nghiệm thu Gate 5:** `Confirm Step 5: Duyệt Review Độc lập`
