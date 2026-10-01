# EXECUTION LOG: ROUTING-URL-ARCHITECTURE

## 0. CURRENT STATE
- **Trạng thái:** HOÀN THÀNH LÁT CẮT US-01 — SẴN SÀNG CHUYỂN SANG US-02
- **Slice hiện tại:** [US-02] Dynamic Route Tĩnh `/dong-xe/[slug]` (RSC, `getCatalogCars()`, `<h1>`, Mô tả SEO 200 chữ, Lưới xe)
- **Unit kế tiếp:** [U-04 / Turn 0 của US-02]
- **last_green:** `c96b3de`
- **gate_mode:** strict
- **verify_commands:**
  - Type-check types: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm --filter @cardealer/types check-types`
  - Type-check database: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm --filter @cardealer/database check-types`
  - Type-check web: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm --filter @cardealer/web check-types`
  - Core test suite: `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" && TMPDIR=/Users/nhatphan/Code/CarDealer/cardealer/node_modules/.cache/tmp pnpm --filter @cardealer/core test`
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
