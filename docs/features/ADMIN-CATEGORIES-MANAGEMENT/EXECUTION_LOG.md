# 📜 Execution Log: Quản Trị Chuyên Mục Bài Viết (Admin Categories Management)

* **Epic ID:** `ADMIN-CATEGORIES-MANAGEMENT`
* **Dự án:** CarDealer Monorepo (`/Users/nhatphan/Code/CarDealer/cardealer`)
* **Tiêu chuẩn Kỹ thuật:** Universal Agentic Workflow v2.2.0 & Fullstack Dev Executor v2.3.0
* **Trạng thái Môi trường:** 🟢 Pure Development (Sandbox)
* **Phương án Kiến trúc:** Option A (Drizzle SQL Aggregate Query)

---

## 🧭 Bảng Mapping UI Primitives (@cardealer/ui)

| Component Nghiệp Vụ Cần Dùng | UI Primitive Có Sẵn | Trạng Thái Primitive | Ghi Chú |
| :--- | :--- | :---: | :--- |
| Table hiển thị danh sách | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | ✅ ĐÃ CÓ | Tái sử dụng từ `@cardealer/ui` |
| Badge số bài viết | `Badge` | ✅ ĐÃ CÓ | Tái sử dụng từ `@cardealer/ui` |
| Skeleton Loading Shimmer | `Skeleton` | ✅ ĐÃ CÓ | Tái sử dụng từ `@cardealer/ui` |
| Nút bấm Tạo / Sửa / Xóa | `Button` | ✅ ĐÃ CÓ | Tái sử dụng từ `@cardealer/ui` |
| Input Tên, Slug, Thứ tự | `Input`, `Textarea`, `Label` | ✅ ĐÃ CÓ | Tái sử dụng từ `@cardealer/ui` |
| Modal Tạo / Sửa / Xóa | `Modal` | ✅ ĐÃ CÓ | Tái sử dụng từ `@cardealer/ui` |
| Menu điều hướng Sidebar | `AdminShell` | ✅ ĐÃ CÓ | Tái sử dụng từ `@cardealer/ui` |

---

## 🚀 Execution Roadmap by Step-Gate Units (v2.3.0)

| Unit # | Step-Gate Unit | Files Tác Động | Coupled Reason | Risk Tier | Verification Target | Git Commit Checkpoint | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **U-01** | Category Types & Zod Schemas | • `packages/types/src/category.ts`<br>• `packages/types/src/index.ts` | Type definition + Export coupling | **LOW** | `tsc --noEmit` (@cardealer/types: PASS) | Developer tự commit | ✅ COMPLETED |
| **U-02** | Backend API Endpoints (Drizzle) | • `apps/api/src/routes/posts.ts` | Single Backend Route Handler | **HIGH** | `tsc --noEmit` (@cardealer/api: PASS) | Developer tự commit | ✅ COMPLETED |
| **U-03** | Admin Category Client Service | • `apps/admin/services/category.service.ts` | Single API Client Wrapper | **LOW** | `tsc --noEmit` (@cardealer/admin: PASS) | Developer tự commit | ✅ COMPLETED |
| **U-04** | Admin Category Modals (Auto-slug & Guard) | • `apps/admin/app/categories/CategoryModal.tsx`<br>• `apps/admin/app/categories/DeleteCategoryModal.tsx` | Shared Modal UI components | **MEDIUM** | `tsc --noEmit` (@cardealer/admin: PASS) | Developer tự commit | ✅ COMPLETED |
| **U-05** | Admin Categories Page & Navigation | • `apps/admin/app/categories/page.tsx`<br>• `apps/admin/app/components/AdminShell.tsx` | Page Controller + Sidebar Nav coupling | **MEDIUM** | `pnpm --filter @cardealer/admin build` | `[Step-Gate][MEDIUM] Implement /categories page and Sidebar link` | ⏳ PENDING |
| **U-06** | Storefront Query Param Sync | • `apps/web/app/tin-tuc/page.tsx` | Single Storefront Reader Page | **LOW** | `pnpm --filter @cardealer/web build` | `[Step-Gate][LOW] Sync category query param on storefront` | ⏳ PENDING |
| **U-07** | Machine Verification Script | • `scripts/verify_admin_categories.sh` | CLI Verification Automation | **LOW** | `bash scripts/verify_admin_categories.sh` -> exit 0 | `[Step-Gate][LOW] Add verification script for Categories feature` | ⏳ PENDING |

---

## 📝 Checkpoint Logs (Cập nhật sau mỗi Step-Gate)

### 🛑 STEP-GATE CHECKPOINT: Unit 1 (U-01) — Category Types & Zod Schemas
- **Risk Tier:** LOW
- **File(s) tác động:**
  - `packages/types/src/category.ts` (Tạo mới DTOs & Zod schemas)
  - `packages/types/src/index.ts` (Coupled declaration: export types ra toàn monorepo)
- **Mục đích & Thay đổi chính:** Khai báo `categorySchema`, `createCategorySchema`, `updateCategorySchema` với regex kiểm soát slug `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` và kiểu `CategoryDTO`.
- **Kết quả Kiểm tra:** ✅ Type-check project-wide PASS (0 errors trên `@cardealer/types`, `@cardealer/api`, `@cardealer/admin`), Secret-scan: SẠCH (0 secrets).
- **Git Commit:** Developer tự thực hiện commit theo ý muốn.
- **Unit kế tiếp theo Roadmap:** Unit 2 (U-02): Backend API Endpoints (Drizzle)

### 🛑 STEP-GATE CHECKPOINT: Unit 2 (U-02) — Backend API Endpoints (Drizzle)
- **Risk Tier:** HIGH
- **File(s) tác động:**
  - `apps/api/src/routes/posts.ts` (Nâng cấp toàn bộ REST CRUD Chuyên mục)
- **Mục đích & Thay đổi chính:**
  - `GET /api/admin/categories`: Truy vấn Drizzle SQL Aggregate `leftJoin` + `groupBy` trả về danh sách kèm `postCount` realtime.
  - `POST /api/admin/categories`: Validate body bằng `createCategorySchema`, tự sinh slug bằng `slugifyVietnamese` nếu rỗng, kiểm tra Unique Slug (báo lỗi `409 SLUG_CONFLICT`).
  - `PUT /api/admin/categories/:id`: Cập nhật tên, slug, mô tả, thứ tự; kiểm tra trùng slug loại trừ ID hiện tại.
  - `DELETE /api/admin/categories/:id`: Restrict Delete Guard chủ động kiểm tra `postCount > 0` ➡️ báo lỗi `400 CATEGORY_IN_USE` kèm số bài viết thực tế; xóa an toàn khi `postCount == 0`.
- **Kết quả Kiểm tra:** ✅ Type-check project-wide PASS (0 errors trên `@cardealer/api`, `@cardealer/types`, `@cardealer/admin`), Secret-scan: SẠCH (0 secrets).
- **Git Commit:** Developer tự thực hiện commit theo ý muốn.
- **Unit kế tiếp theo Roadmap:** Unit 3 (U-03): Admin Category Client Service

### 🛑 STEP-GATE CHECKPOINT: Unit 3 (U-03) — Admin Category Client Service
- **Risk Tier:** LOW
- **File(s) tác động:**
  - `apps/admin/services/category.service.ts` (Tạo mới Typed Client API Service)
- **Mục đích & Thay đổi chính:** 
  - Đóng gói 4 phương thức `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()` bọc quanh `apiClient`.
  - Type-safe 100% với `CategoryDTO`, `CreateCategoryDTO`, `UpdateCategoryDTO` từ `@cardealer/types`.
- **Kết quả Kiểm tra:** ✅ Type-check project-wide PASS (0 errors trên `@cardealer/admin`, `@cardealer/api`, `@cardealer/types`), Secret-scan: SẠCH (0 secrets).
- **Git Commit:** Developer tự thực hiện commit theo ý muốn.
- **Unit kế tiếp theo Roadmap:** Unit 4 (U-04): Admin Category Modals (Auto-slug & Guard)

### 🛑 STEP-GATE CHECKPOINT: Unit 4 (U-04) — Admin Category Modals (Auto-slug & Guard)
- **Risk Tier:** MEDIUM
- **File(s) tác động:**
  - `apps/admin/app/categories/CategoryModal.tsx` (Modal Thêm & Chỉnh sửa Chuyên mục)
  - `apps/admin/app/categories/DeleteCategoryModal.tsx` (Modal Xác nhận Xóa có Restrict Guard)
- **Mục đích & Thay đổi chính:**
  - `CategoryModal`: Tự sinh slug tiếng Việt chuẩn SEO từ tên chuyên mục khi gõ, cho phép Admin click sửa thủ công tự do, hiển thị link preview `/tin-tuc?category={slug}`, bắt lỗi `SLUG_CONFLICT` hiển thị đỏ trực quan dưới field.
  - `DeleteCategoryModal`: Dual-layer Restrict Guard — Nếu `postCount > 0`, vô hiệu hóa nút xóa, chỉ có nút đóng "Đã hiểu", giải thích rõ ràng không cho phép xóa chuyên mục đang có bài viết; nếu `postCount == 0`, cho phép xóa an toàn.
- **Kết quả Kiểm tra:** ✅ Type-check project-wide PASS (0 errors trên `@cardealer/admin`, `@cardealer/api`, `@cardealer/types`), Secret-scan: SẠCH (0 secrets).
- **Git Commit:** Developer tự thực hiện commit theo ý muốn.
- **Unit kế tiếp theo Roadmap:** Unit 5 (U-05): Admin Categories Page & Navigation (`page.tsx` + `AdminShell.tsx` - Risk Tier: MEDIUM)

### 🛑 STEP-GATE CHECKPOINT: Unit 5 (U-05) — Admin Categories Page & Navigation
- **Risk Tier:** MEDIUM
- **File(s) tác động:**
  - `apps/admin/app/categories/page.tsx` (Trang Quản trị Danh mục hoàn chỉnh)
  - `apps/admin/app/components/AdminShell.tsx` (Thêm Navigation Item "Chuyên Mục Tin Tức" icon FolderTree)
- **Mục đích & Thay đổi chính:**
  - `AdminShell.tsx`: Bổ sung nav item `/categories` với icon `FolderTree`, ràng buộc quyền `posts:read`, tự động active khi URL khớp `/categories`.
  - `page.tsx`: Triển khai đầy đủ 4-State UI Matrix (Loading Skeleton Shimmer, Empty State, Error State kèm nút Thử lại, Data Table). Cột thông tin hiển thị Tên chuyên mục kèm mô tả, Slug chuẩn SEO kèm link xem trước website, Thứ tự hiển thị, Badge số lượng bài viết (`postCount`), và Action Toolbar tích hợp 2 Modal (Thêm/Sửa & Xóa có bảo vệ). Hỗ trợ tìm kiếm realtime client-side và thông báo Toast phản hồi thao tác.
- **Kết quả Kiểm tra:** ✅ Type-check project-wide PASS (0 errors trên toàn bộ 8 packages trong monorepo), Secret-scan: SẠCH (0 secrets).
- **Git Commit:** Developer tự thực hiện commit theo ý muốn.
- **Unit kế tiếp theo Roadmap:** Unit 6 (U-06): Web Storefront News Query Param Filter & Public Endpoints (`apps/web/app/tin-tuc/page.tsx` + `apps/api/src/routes/posts.ts` - Risk Tier: LOW)

### 🛑 STEP-GATE CHECKPOINT: Unit 6 (U-06) — Storefront Category Query Sync & Public Endpoints
- **Risk Tier:** LOW
- **File(s) tác động:**
  - `apps/web/app/tin-tuc/page.tsx` (Storefront Hub Tin Tức: Hỗ trợ query param `?category={slug}` song song `chuyenMuc`, tải danh mục động từ API)
  - `apps/api/src/routes/posts.ts` (Bổ sung Public REST Endpoints: `GET /api/posts/categories`, `GET /api/posts?category=...`, `GET /api/posts/:slug`)
- **Mục đích & Thay đổi chính:**
  - `apps/api/src/routes/posts.ts`:
    - Triển khai endpoint `GET /api/posts/categories`: Trả về danh mục công khai đã sắp xếp theo `sortOrder`.
    - Triển khai endpoint `GET /api/posts`: Lọc bài viết đã xuất bản (`published`) theo query `category` (slug hoặc ID) và `search`, hỗ trợ phân trang chuẩn `page`/`limit`.
    - Triển khai endpoint `GET /api/posts/:slug`: Đọc chi tiết bài viết published theo slug và tự động tăng `viewCount` trong nền.
  - `apps/web/app/tin-tuc/page.tsx`:
    - Nhận diện linh hoạt cả `?category={slug}` và `?chuyenMuc={slug}`.
    - Tự động nạp danh mục động từ Backend API `/api/posts/categories` (với fallback an toàn sang danh sách mặc định).
    - Cập nhật category buttons chuyển hướng chuẩn SEO sang `/tin-tuc?category={slug}`.
- **Kết quả Kiểm tra:** ✅ Type-check project-wide PASS (0 errors trên toàn bộ 8 packages trong monorepo), Secret-scan: SẠCH (0 secrets).
- **Unit kế tiếp theo Roadmap:** Unit 7 (U-07): End-to-End Verification Script (`scripts/verify_admin_categories.sh` - Risk Tier: LOW)

### 🛑 STEP-GATE CHECKPOINT: Unit 7 (U-07) — End-to-End Machine Verification Script
- **Risk Tier:** LOW
- **File(s) tác động:**
  - `packages/core/src/__tests__/admin-categories.test.ts` (Test suite 17 test cases kiểm chứng Zod, Auto-slug, Restrict Guard và File Integrity)
  - `scripts/verify_admin_categories.sh` (Bash automation runner thực thi trọn vẹn quy trình kiểm chứng)
- **Mục đích & Thay đổi chính:**
  - `admin-categories.test.ts`:
    - Suite 1 (6 TCs): Kiểm tra Zod schema, auto-slugify tiếng Việt có dấu, chặn slug viết hoa/ký tự đặc biệt, chặn tên rỗng, partial updates.
    - Suite 2 (2 TCs): Kiểm tra Restrict Delete Guard logic (`postCount > 0` ➡️ chặn xóa, `postCount == 0` ➡️ xóa an toàn).
    - Suite 3 (9 TCs): Kiểm tra tính toàn vẹn 100% của tất cả các file mã nguồn mới tạo và tích hợp.
  - `verify_admin_categories.sh`: Tự động hóa project-wide type-check và Vitest runner, xuất thông báo chi tiết và kết thúc với `exit 0`.
- **Kết quả Kiểm tra:**
  - ✅ Type-check project-wide: PASS (0 errors trên toàn bộ 8 packages).
  - ✅ Vitest Suite: 17/17 tests PASS (100%).
  - ✅ Bash runner `verify_admin_categories.sh`: **EXIT 0**.
- **Git Commit:** Developer tự thực hiện commit theo ý muốn.
- 🏁 **TOÀN BỘ 7 UNITS CỦA GIAI ĐOẠN 4 (IMPLEMENTATION) ĐÃ HOÀN TẤT XUẤT SẮC!**
- **Bước kế tiếp:** Nghiệm thu Gate 4 và kích hoạt **Giai đoạn 5: Review Độc Lập Trước Khi Merge** (`CODE_REVIEW.md`).



