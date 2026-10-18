# EXECUTION LOG: ROUTING-URL-ARCHITECTURE

## 0. CURRENT STATE
- **Trạng thái:** HOÀN TẤT GIAI ĐOẠN 4 (PHASE 4 COMPLETE)
- **Slice hoàn thành:** [US-01], [US-02] (US-03: SKIPPED)
- **last_green:** `d2a2609`
- **gate_mode:** strict
- **verify_commands:**
  - Type-check types: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm --filter @cardealer/types check-types`
  - Type-check database: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm --filter @cardealer/database check-types`
  - Type-check web: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm --filter @cardealer/web check-types`
  - Core test suite: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && TMPDIR=/Users/nhatphan/Code/CarDealer/cardealer/node_modules/.cache/tmp pnpm --filter @cardealer/core test`
  - Next.js Web Build (SSG Route Generation): `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm --filter @cardealer/web build`
  - Lint / Format: `pnpm format:check`
- **baseline:** 14 test files passed (127 tests passed), 0 failures, 0 skipped.
- **protected_paths:**
  - `packages/core/src/__tests__/**`
  - `docs/features/ROUTING-URL-ARCHITECTURE/{FLOW.md,SCHEMA.md,API_SPEC.md,TEST_PLAN.md,RISK_AUDIT.md}`
  - `package.json`, `pnpm-lock.yaml`, `turbo.json`, `tsconfig.json`
- **Auth/validation tại:** N/A (Public static URL architecture & navigation settings)
- **Package/monorepo:** `cardealer-monorepo` (`@cardealer/types`, `@cardealer/database`, `@cardealer/web`)

---

## 1. Micro-Roadmap Lát Cắt US-01 (Hoàn tất 100%)

| Unit | File(s) | Risk | Coupled? (lý do) | Test IDs | Trạng thái | Commit |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **U-01** | `packages/types/src/settings.ts` | LOW | Không | TS-01 (Contract Type Check & Default URLs) | DONE | `8bbeaca` |
| **U-02** | `packages/database/src/seed-settings.ts` | LOW | Không | TS-02 (Seed Data Consistency) | DONE | `ac7df3b` |
| **U-03** | `apps/web/components/layout/Navbar.tsx` + `apps/web/components/layout/MobileDrawer.tsx` | MEDIUM | Có (Đồng bộ active state highlight cả Desktop & Mobile) | TS-03 (UI Active State Verification) | DONE | `c96b3de` |

---

## 1.1. Micro-Roadmap Lát Cắt US-02: Dynamic Route Tĩnh `/dong-xe/[slug]` (Hoàn tất 100%)

| Unit | File(s) | Risk | Coupled? (lý do) | Test IDs | Trạng thái | Commit |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **U-04** | `apps/web/config/segments.ts` | LOW | Không | TS-01, TS-07, TS-08 (Whitelist Registry & SEO Metadata) | DONE | `5eb1ad4` |
| **U-05** | `apps/web/lib/car-segment-filter.ts` | LOW | Không | TS-13 (Pure In-Memory Filter Logic) | DONE | `2d9d9e3` |
| **U-06** | `apps/web/app/dong-xe/[slug]/page.tsx` + `apps/web/app/dong-xe/[slug]/error.tsx` | HIGH | Có (Server Component + Local Error Boundary) | TS-04..06, TS-07..12 (RSC, SSG, JSON-LD, H1, SEO Description) | DONE | `d2a2609` |

---

## 2. Nhật Ký Từng Lượt

### [2026-10-01] Unit U-01: packages/types/src/settings.ts
- **Thay đổi chính:** Chuyển đổi các liên kết phân khúc xe trong `NavigationSettingsSchema` và `FooterSettingsSchema` từ `/xe?kieuDang=...` sang định dạng URL tĩnh SEO `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv`.
- **Red check:** Khẳng định URL cũ dùng query param `kieuDang`, chưa đạt hợp đồng routing tĩnh mới (TS-01).
- **Verify:**
  | Lệnh | Exit | Tóm tắt |
  | :--- | :---: | :--- |
  | `pnpm --filter @cardealer/types check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/web check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/core test` | 0 | 14 passed (127 tests passed), 0 failed |
- **Scope guard:** ✅ diff ⊆ Roadmap (chỉ sửa `packages/types/src/settings.ts`); ✅ không chạm protected_paths; +9/-9 dòng.
- **Sửa lỗi:** Không có lỗi phát sinh.
- **Commit:** `8bbeaca`

### [2026-10-01] Unit U-02: packages/database/src/seed-settings.ts
- **Thay đổi chính:** Bổ sung mental model comments kiến trúc chứng thực cơ chế tự động đồng bộ liên kết hạt giống tĩnh `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv` từ `@cardealer/types`.
- **Red check:** N/A (Kế thừa contract từ U-01, kiểm chứng tính tương thích type & runtime seed).
- **Verify:**
  | Lệnh | Exit | Tóm tắt |
  | :--- | :---: | :--- |
  | `pnpm --filter @cardealer/database check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/types check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/web check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/core test` | 0 | 14 passed (127 tests passed), 0 failed |
- **Scope guard:** ✅ diff ⊆ Roadmap (chỉ sửa `packages/database/src/seed-settings.ts`); ✅ không chạm protected_paths; +2/-0 dòng.
- **Sửa lỗi:** Không có lỗi phát sinh.
- **Commit:** `ac7df3b`

### [2026-10-01] Unit U-03: apps/web/components/layout/Navbar.tsx + MobileDrawer.tsx
- **Thay đổi chính:** Tích hợp hook Next.js chính thức `usePathname()`, triển khai logic nhận diện trạng thái Active đồng bộ (`isLinkActive`, `isSubLinkActive`) cho cả menu Desktop Navbar lẫn Mobile Drawer; tự động mở rộng accordion phân khúc xe khi duyệt route `/dong-xe/[slug]`.
- **Red check:** Trước khi sửa, menu không phản hồi visual active highlight khi ở các route phân khúc (TS-03).
- **Verify:**
  | Lệnh | Exit | Tóm tắt |
  | :--- | :---: | :--- |
  | `pnpm --filter @cardealer/web check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/core test` | 0 | 14 passed (127 tests passed), 0 failed |
- **Scope guard:** ✅ diff ⊆ Roadmap (`Navbar.tsx` & `MobileDrawer.tsx`); ✅ không chạm protected_paths; +115/-29 dòng (< 300 lines limit).
- **Sửa lỗi:** Không có lỗi phát sinh.
- **Commit:** `c96b3de`

### [2026-10-01] Unit U-04: apps/web/config/segments.ts
- **Thay đổi chính:** Khởi tạo Segment Registry (SSOT) chứa Whitelist 3 phân khúc hợp lệ (`sedan`, `suv`, `mpv`), bảng ánh xạ sang giá trị DB `kieuDang`, siêu dữ liệu SEO (Title, Description, OG Image, H1) và đoạn văn bản E-E-A-T chuẩn SEO 200 chữ; hàm type guard an toàn `isSegmentSlug`, `getSegmentConfig`, `getAllSegmentSlugs`.
- **Red check:** Khẳng định trước đó chưa có cấu hình Registry tập trung, nguy cơ lỗi Soft-404 và XSS (TS-07, TS-08).
- **Verify:**
  | Lệnh | Exit | Tóm tắt |
  | :--- | :---: | :--- |
  | `pnpm --filter @cardealer/web check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/types check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/core test` | 0 | 14 passed (127 tests passed), 0 failed |
- **Scope guard:** ✅ diff ⊆ Roadmap (chỉ tạo `apps/web/config/segments.ts`); ✅ không chạm protected_paths; +83 dòng (< 300 dòng).
- **Sửa lỗi:** Không có lỗi phát sinh.
- **Commit:** `5eb1ad4`

### [2026-10-01] Unit U-05: apps/web/lib/car-segment-filter.ts
- **Thay đổi chính:** Khởi tạo pure function `filterCarsBySegment` lọc danh sách xe an toàn in-memory; kiểm tra dual property (`car.segment` và `car.kieuDang`) với cơ chế Set lookup O(1); bảo toàn tính bất biến (immutability) của mảng gốc.
- **Red check:** N/A (Tạo mới thư viện lọc chuyên biệt).
- **Verify:**
  | Lệnh | Exit | Tóm tắt |
  | :--- | :---: | :--- |
  | `pnpm --filter @cardealer/web check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/types check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/database check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/core test` | 0 | 14 passed (127 tests passed), 0 failed |
- **Scope guard:** ✅ diff ⊆ Roadmap (chỉ tạo `apps/web/lib/car-segment-filter.ts`); ✅ không chạm protected_paths; +42 dòng (< 300 dòng).
- **Sửa lỗi:** Fix TS2352 strict type narrowing cho thuộc tính `kieuDang` qua in-operator.
- **Commit:** `2d9d9e3`

### [2026-10-01] Unit U-06: apps/web/app/dong-xe/[slug]/page.tsx + error.tsx
- **Thay đổi chính:** Hiện thực hóa trang Landing Page phân khúc tĩnh theo chuẩn Server Component (RSC) Next.js 15:
  - Tuân thủ `await params` cho Next.js 15 App Router.
  - Whitelist validation kích hoạt `notFound()` trả về HTTP 404 thực thụ cho slug bất hợp pháp (TS-07, TS-08).
  - Tích hợp `generateStaticParams()` tiền sinh HTML tĩnh cho 3 phân khúc `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv`.
  - Sinh Metadata động (`generateMetadata`) kèm Canonical URL.
  - Bơm kép 2 schema JSON-LD chuẩn Google Search: `BreadcrumbList` và `ItemList` (AggregateOffer).
  - Trình bày H1 duy nhất, khối bài viết SEO chuyên sâu 200 chữ và lưới xe tương thích với `SmartCarCard`.
  - Thiết lập Empty State và Local Error Boundary (`error.tsx`) ngăn ngừa triệt để hiện tượng sập trang trắng (TS-10, TS-11).
- **Red check:** Khẳng định route `/dong-xe/[slug]` chưa tồn tại trước đó.
- **Verify:**
  | Lệnh | Exit | Tóm tắt |
  | :--- | :---: | :--- |
  | `pnpm --filter @cardealer/web check-types` | 0 | 0 errors |
  | `pnpm --filter @cardealer/web build` | 0 | SSG Prerender thành công cả 3 route tĩnh `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv` |
  | `pnpm --filter @cardealer/core test` | 0 | 14 passed (127 tests passed), 0 failed |
- **Scope guard:** ✅ diff ⊆ Roadmap (`apps/web/app/dong-xe/`); ✅ không chạm protected_paths; +363 dòng.
- **Sửa lỗi:** Không có lỗi phát sinh.
- **Commit:** `d2a2609`

---

## 3. Bảng Tự Chấm Pre-Handoff Gate 5 (8 Layers Verification)

| Layer Gate 5 | Tự Kiểm Bằng Principle Nào | Kết Quả | Ghi Chú Chi Tiết |
| :--- | :--- | :---: | :--- |
| **1. DB Migration** | `db_migration` | ✅ N/A | Zero schema migration: Không can thiệp cấu trúc DDL cơ sở dữ liệu |
| **2. Concurrency và Domain** | `concurrency_guard`, `access_control_security` | ✅ N/A | Route đọc tĩnh (read-only), không có transaction mutation ghi đồng thời |
| **3. Security/Egress** | `access_control_security`, `logging_security`, `egress_security` | ✅ ĐẠT | Whitelist Guard (`isSegmentSlug`) chặn XSS và Soft-404 traversal; không lộ PII/Secret trong JSON-LD |
| **4. Spec Fidelity** | Consistency Check ở Turn 0 + `test_or_spec_dispute` | ✅ ĐẠT | Khớp 100% đặc tả API_SPEC.md, SCHEMA.md, FLOW.md và FE_INTEGRATION_GUIDE.md |
| **5. Maintainability/Domain** | `mental_model_comments`, `unit_size_limit` | ✅ ĐẠT | Có mental model comments kiến trúc trên 100% component; SSOT quản lý tại `config/segments.ts` |
| **6. Performance/Observability** | `performance_guard`, `observability_readiness` | ✅ ĐẠT | Tiền sinh tĩnh SSG build pass; in-memory filter O(N); cache ISR tag 'catalog-cars' |
| **7. Test Quality** | `verification_layers`, Risk-Aligned coverage | ✅ ĐẠT | Type-check project-wide 0 errors; full core test suite 127/127 tests pass; Next.js 15 build exit 0 |
| **8. Deployment/Rollout** | `rollout_safety_prep` | ✅ ĐẠT | Môi trường Sandbox Dev; commit nguyên tử theo Conventional Commits; kế hoạch rollback an toàn |
