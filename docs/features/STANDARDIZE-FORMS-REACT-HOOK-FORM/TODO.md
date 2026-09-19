# 📝 Action Plan: Chuẩn Hoá Toàn Bộ Form Hệ Thống Sang `react-hook-form`

## Execution Tier: Tier 2 (Medium-Risk / Sub-feature & Component Refactor)

- [x] **Task 1: Phân tích Solution Options (Sub-Gate 2.1)**
  * **Vị trí tác động:** `docs/features/STANDARDIZE-FORMS-REACT-HOOK-FORM/SOLUTION_OPTIONS.md`
  * **Role phụ trách:** `system-analyst-architect`
  * **DoD:** So sánh các phương án và đã chốt Option C (Shadcn Form Context Layer).

- [x] **Task 2: Cài đặt Thư viện với Node 24 (Phase 4.1)**
  * **Vị trí tác động:** `packages/ui/package.json` & `apps/admin/package.json`
  * **Lệnh:** `export PATH="/Users/nhatphan/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm add react-hook-form @hookform/resolvers --filter @cardealer/ui --filter @cardealer/admin`
  * **DoD:** Cài đặt thành công phiên bản mới nhất tương thích Node 24 & React 19.

- [x] **Task 3: Triển khai Form Primitives trong packages/ui (Phase 4.1)**
  * **Vị trí tác động:** `packages/ui/src/form.tsx` & `packages/ui/src/index.ts`
  * **DoD:** Xuất bản `Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField`.

- [x] **Task 4: Refactor CarFormModal.tsx (Phase 4.2)**
  * **Vị trí tác động:** `apps/admin/app/cars/components/CarFormModal.tsx`
  * **DoD:** Sử dụng `Form, FormField`, Zod schema, auto-slug generator và live formatted currency preview.

- [x] **Task 5: Refactor ColorFormModal.tsx (Phase 4.2)**
  * **Vị trí tác động:** `apps/admin/app/colors/components/ColorFormModal.tsx`
  * **DoD:** Sử dụng `Form, FormField`, Zod schema, live color preview và Two-Tone roof selection.

- [x] **Task 6: Refactor Login & Settings Forms (Phase 4.2)**
  * **Vị trí tác động:** `apps/admin/app/login/page.tsx`, `apps/admin/app/settings/page.tsx` & các sub-sections
  * **DoD:** Gom toàn bộ state sang Shadcn Form Context, không còn useState phân tán.

- [x] **Task 7: Verification & UI Conformance (Phase 4.3)**
  * **DoD:** `pnpm check-types` đạt `exit 0` cho toàn bộ 11 packages của monorepo.

- [ ] **Task 7: Independent Security & Code Review (Phase 5 - Gate 5)**
  * **Vị trí tác động:** `docs/features/STANDARDIZE-FORMS-REACT-HOOK-FORM/CODE_REVIEW.md`
  * **Role phụ trách:** `independent-code-reviewer`
  * **DoD:** Xuất bản báo cáo review code độc lập và thông quan Gate 5.
