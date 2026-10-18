# 📜 Nhật Ký Thực Thi Kỹ Thuật (EXECUTION_LOG.md)
## PHASE 3 - PRICING & LEAD ENGINE (`EPIC-PHASE-3-PRICING-LEAD`)

> **Role:** `fullstack-dev-executor`  
> **Quy chuẩn:** Universal Agentic Workflow (v2.1) & `fullstack-dev-executor.md` (v2.1.3)  
> **Kỷ luật:** Step-Gate Policy (Thực thi cuốn chiếu đúng 1 file/lượt ➔ Verify ➔ Dừng lại chờ duyệt)

---

### 🗺️ DETAILED EXECUTION ROADMAP & FUNCTION-LEVEL DEPENDENCY SEQUENCE

- **Tác vụ đang thực thi:** `EPIC-PHASE-3-PRICING-LEAD` (Slices US-01 ➡️ US-04)
- **Tóm tắt Mục tiêu:** Xây dựng lõi tính giá lăn bánh & trả góp chuẩn xác (0đ sai số), bảng dữ liệu Leads CRM với Drizzle ORM, API tiếp nhận Lead có Rate-limit & Deduplication, giao diện Storefront phễu 2 bước Soft-Gate (`blur-sm` ➡️ `unblur`), và bảng quản lý Leads Admin CRM.

---

#### 🔹 SLICE 1: US-01 — Pricing & Financial Core Engine + Contracts
* **File 1 (Mới):** `packages/types/src/pricing.ts`
  * 💡 *Lý do:* Định nghĩa Type contracts chuẩn cho biểu phí, đầu vào/ra của Rolling Cost và Installment.
  * 🛠 *Functions / Schemas / Types:* `LocationRateSchema`, `RollingCostCalculationInputSchema`, `RollingCostBreakdownSchema`, `InstallmentCalculationInputSchema`, `InstallmentCalculationResultSchema`.
* **File 2 (Sửa):** `packages/types/src/lead.ts`
  * 💡 *Lý do:* Cập nhật enum chuẩn `new | contacted | converted | cancelled`, regex 10 số di động VN, schema DTO cho Ingestion và CRM.
  * 🛠 *Functions / Schemas / Types:* `LeadStatusEnum`, `CreateLeadSchema`, `UpdateLeadStatusSchema`, `LeadResponseSchema`.
* **File 3 (Sửa):** `packages/types/src/index.ts`
  * 💡 *Lý do:* Re-export các types từ `pricing.ts` và `lead.ts`.
* **File 4 (Mới):** `packages/core/src/pricing/config.ts`
  * 💡 *Lý do:* Tập trung hóa toàn bộ biểu phí nhà nước (Vinh 1M, Huyện 200k, trước bạ 10%, đăng kiểm 140k, đường bộ 1.56M, TNDS 480k/873k).
  * 🛠 *Constants:* `PROVINCE_FEE_CONFIGS`, `FIXED_GOVERNMENT_RATES`.
* **File 5 (Sửa):** `packages/core/src/pricing/calculate-rolling-cost.ts`
  * 💡 *Lý do:* Sử dụng `config.ts`, đảm bảo tính toán số nguyên VNĐ, sai số 0 đồng.
  * 🛠 *Functions:* `calculateRollingCost(input)`.
* **File 6 (Sửa):** `packages/core/src/pricing/calculate-installment.ts`
  * 💡 *Lý do:* Hoàn thiện thuật toán tính trả góp dư nợ giảm dần, an toàn trước giá trị âm hoặc chia cho 0.
  * 🛠 *Functions:* `calculateInstallment(input)`.
* **File 7 (Mới):** `packages/core/src/pricing/__tests__/pricing-engine.test.ts`
  * 💡 *Lý do:* Unit test suite kiểm thử toàn diện độ chính xác và biên tham số.
  * 🛠 *Tests:* 5 ca test tính giá lăn bánh và trả góp.

---

#### 🔹 SLICE 2: US-02 — Lead Entity, DB Migration & Ingestion API
* **File 8 (Mới):** `packages/database/src/schema/leads.ts`
  * 💡 *Lý do:* Định nghĩa bảng `leads` trong PostgreSQL với Drizzle ORM, index `(phone, created_at)` và enum `lead_status_enum`.
  * 🛠 *Schema:* `leadsTable`, `leadStatusEnum`, `leadsRelations`.
* **File 9 (Sửa):** `packages/database/src/schema/index.ts`
  * 💡 *Lý do:* Re-export schema `leads`.
* **File 10 (Mới):** `apps/api/src/routes/leads.ts`
  * 💡 *Lý do:* Endpoint công khai `POST /api/leads` tiếp nhận lead, rate-limit 5 req/phút, bẫy honeypot `website_url`, chống duplicate trong 10 phút.
  * 🛠 *Endpoints:* `POST /api/leads`.
* **File 11 (Mới):** `apps/api/src/routes/admin/leads.ts`
  * 💡 *Lý do:* API Admin quản lý CRM Leads có bảo vệ RBAC (`admin`, `sales`, `manager`), phân trang và cập nhật trạng thái tại chỗ.
  * 🛠 *Endpoints:* `GET /api/admin/leads`, `GET /api/admin/leads/:id`, `PATCH /api/admin/leads/:id/status`.
* **File 12 (Sửa):** `apps/api/src/routes/index.ts`
  * 💡 *Lý do:* Mount routes `/api/leads` và `/api/admin/leads`.

---

#### 🔹 SLICE 3: US-03 — Storefront SmartCalculator & 2-Step Gated Lead Funnel
* **File 13 (Mới):** `apps/storefront/components/calculator/SmartCalculator.tsx`
  * 💡 *Lý do:* Master container 3 trạng thái (`input` ➡️ `gate [blur-sm]` ➡️ `success [unblur]`), hiệu ứng Framer Motion, session storage persistence.
* **File 14 (Mới):** `apps/storefront/components/calculator/InstallmentEstimatorTab.tsx`
  * 💡 *Lý do:* Sub-card tính trả góp áp dụng cùng cơ chế Soft-Gate mờ chi tiết và mở khóa sau khi điền SĐT.
* **File 15 (Mới):** `apps/storefront/app/gia-lan-banh/page.tsx`
  * 💡 *Lý do:* Trang tính giá lăn bánh chính thức kèm JSON-LD Schema `SoftwareApplication` và FAQ Accordion.

---

#### 🔹 SLICE 4: US-04 — Admin Lead Management & CRM Table
* **File 16 (Mới):** `apps/admin/services/lead.service.ts`
  * 💡 *Lý do:* Typed Client Service gọi API `/api/admin/leads` từ giao diện Admin.
* **File 17 (Mới):** `apps/admin/app/(dashboard)/leads/page.tsx`
  * 💡 *Lý do:* Datatable CRM Leads hiển thị khách hàng, SĐT link Zalo/Tel, dropdown đổi trạng thái tại chỗ.
* **File 18 (Mới):** `apps/admin/components/leads/LeadDetailDrawer.tsx`
  * 💡 *Lý do:* Sheet / Drawer xem chi tiết lead, lịch sử tư vấn và thêm ghi chú Sales.
* **File 19 (Sửa):** `apps/admin/components/admin-shell.tsx`
  * 💡 *Lý do:* Mở khóa mục menu "Khách Hàng & Báo Giá" (`/leads`) cho roles `sales`, `manager`, `admin`.

---

#### 🔹 VERIFICATION RUNNER
* **File 20 (Mới):** `scripts/verify-phase-3-pricing-lead.ts`
  * 💡 *Lý do:* CLI Script tự động chạy 8 kịch bản nghiệp vụ và thoát `exit 0`.

---
