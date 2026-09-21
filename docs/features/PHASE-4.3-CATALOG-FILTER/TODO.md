# 📝 Action Plan: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (Catalog & Filter Grid - `/xe`)

## 1. Thông Tin Điều Phối
* **Mã Epic:** `EPIC-PHASE-4.3-CATALOG-FILTER`
* **Cấp độ Thực thi (Execution Tier):** Tier 1 (Core Architecture / High-Risk / Full 5 Phase Lifecycle & Strict Gates 1–5)
* **Trạng thái Môi trường:** 🟢 Pure Development
* **Thư mục Tính Năng:** `docs/features/PHASE-4.3-CATALOG-FILTER/`

---

## 2. Kế Hoạch Thực Thi Từng Giai Đoạn

### 🎯 GIAI ĐOẠN 1: PHÂN TÍCH & CHẨN ĐOÁN
- [x] Thám mã khảo cổ codebase hiện tại (`apps/api/src/routes/catalog.ts`, `packages/core/src/seo/json-ld.ts`, `apps/web/components/home/LeadMagnetFilter.tsx`)
- [x] Lập bản phân tích nghiệp vụ chuyên sâu qua 6 lăng kính (URL sync, buyer psychology, dual pricing, card components, SEO Merchant, zero-state)
- [x] Phân rã 4 Vertical Slices độc lập (`US-01` đến `US-04`)
- [x] Xuất bản `BACKLOG.md` và `TODO.md`
- [x] 🛑 **GATE 1: Đã thông quan bằng lệnh `"Confirm Step 1: Duyệt Backlog"`**

---

### 🏛️ GIAI ĐOẠN 2: THIẾT KẾ KIẾN TRÚC & GIẢI PHÁP (CURRENT)
- [x] **Bước 2.1 (Sub-Gate 2.1):** `system-analyst-architect` xuất bản `SOLUTION_OPTIONS.md` so sánh 3 phương án kiến trúc.
- [x] 🛑 **SUB-GATE 2.1: Đã thông quan bằng lệnh `"Chốt Option B"` (Hybrid RSC + Client Island Instant Filter)**
- [x] **Bước 2.2:** Xuất bản bộ tài liệu thiết kế chi tiết:
  - [x] `FLOW.md`: Sơ đồ tuần tự và ma trận chuyển đổi trạng thái URL/Bộ lọc
  - [x] `SCHEMA.md`: Đặc tả cấu trúc dữ liệu, state matrix và JSON-LD Schema
  - [x] `API_SPEC.md`: Đặc tả hợp đồng API và JSON-LD Schema contract
  - [x] `UI_SPEC.md`: Đặc tả UI tokens, typography, SmartCarCard responsive, FilterBar tabs và Zero-state
  - [x] `FE_INTEGRATION_GUIDE.md`: Hướng dẫn tích hợp Client Islands và URL Sync hook
- [x] 🛑 **GATE 2: Đã thông quan bằng lệnh `"Confirm Step 2: Duyệt Thiết kế Kiến trúc"`**

---

### 🛡️ GIAI ĐOẠN 3: KIỂM SOÁT RỦI RO & TEST PLAN
- [x] **Bước 3.1:** `dependency-graph-analyzer` rà soát quan hệ phụ thuộc và lập `RISK_AUDIT.md` (Ma trận R1-R17, đồ thị Blast Radius)
- [x] **Bước 3.2:** `qa-test-engineer` xây dựng kịch bản kiểm thử toàn diện tại `TEST_PLAN.md` (Ma trận TS-01 -> TS-12, CLI Verification Script)
- [x] 🛑 **GATE 3: Đã thông quan bằng lệnh `"Confirm Step 3: Duyệt Kế hoạch Test"`**

---

### 💻 GIAI ĐOẠN 4: THỰC THI CODE & KIỂM CHỨNG (CURRENT)
- [x] **Slice 1 (`US-01`):** Triển khai Shared Core Data Contract & SEO Schemas Engine (`packages/core/src/seo/json-ld.ts`, `apps/api/src/routes/catalog.ts`, `packages/types/src/car.ts`)
- [x] **Slice 2 (`US-02`):** Xây dựng Multi-Dimensional Filter Bar & Bidirectional URL State Engine (`apps/web/app/xe/components/CatalogFilterBar.tsx`, `useCatalogFilters.ts`)
- [x] **Slice 3 (`US-03`):** Xây dựng Smart Car Card Component & Responsive Catalog Grid (`apps/web/app/xe/components/SmartCarCard.tsx`, `CatalogGrid.tsx`, `CatalogEmptyState.tsx`)
- [x] **Slice 4 (`US-04`):** Xây dựng Server Page Shell `/xe`, SEO Metadata & tích hợp toàn hệ thống (`apps/web/app/xe/page.tsx`, `cars.service.ts`, `settings.service.ts`)
- [x] Chạy CLI Verification Script xác thực toàn bộ codebase (`exit 0` - Typecheck & Vitest tests pass 100%)
- [ ] 🛑 **GATE 4: Chờ Developer xác nhận lệnh `"Accept & Finalize"` (hoặc `"Confirm Step 4: Duyệt Kết quả Test CLI"`)**

---

### 🔍 GIAI ĐOẠN 5: REVIEW ĐỘC LẬP & BÀN GIAO
- [ ] `independent-code-reviewer` rà soát toàn bộ Git Diff (`git diff main`)
- [ ] Kiểm tra tuân thủ Design System `@cardealer/ui`, bảo mật, hiệu năng FCP/CLS
- [ ] Cập nhật `docs/SYSTEM_MAP.md` và biên bản bàn giao
- [ ] 🛑 **GATE 5: Hoàn tất bàn giao và Merge**
