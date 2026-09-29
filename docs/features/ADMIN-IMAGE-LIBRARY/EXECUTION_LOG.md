# 📜 EXECUTION LOG: Thư Viện Ảnh Admin & Tích Hợp Cloudinary (Admin Image Library)

* **Trạng thái:** 🚀 BẮT ĐẦU THỰC THI (PHASE 4)
* **Lát cắt Hiện tại:** **US-01: Cloudinary Backend Integration & Media Data Contracts**
* **Khởi tạo lúc:** 2026-09-29T01:45:00+07:00

---

## 1. Micro-Roadmap & Step-Gate Units (Lát cắt US-01)

| Unit ID | File(s) Tác Động | Risk Tier | Coupled Unit? | Trạng Thái | Commit Hash | Mục Tiêu & Mô Tả Đơn Vị |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **U-01** | • `packages/env/src/index.ts`<br>• `packages/types/src/media.ts`<br>• `packages/types/src/index.ts`<br>• `packages/types/src/permission.ts` | 🟡 LOW | **Có (Shared Types & Env)** | ✅ COMPLETED | `de6cc16` | Khai báo Zod Server Env cho Cloudinary (`CLOUDINARY_*`), DTOs `MediaItem`, query schemas và RBAC permissions (`media:read`, `media:write`, `media:delete`). |
| **U-02** | • `packages/database/src/schema/media.ts`<br>• `packages/database/src/schema/relations.ts`<br>• `packages/database/drizzle/...` | 🔴 HIGH | **Không** | ✅ COMPLETED | `d846520` | Mở rộng Drizzle Schema `media` (`publicId`, `format`, `folder`, `uploaderId`, `updatedAt` + 4 Indexes), cập nhật relations và sinh migration DB. |
| **U-03** | • `apps/api/package.json`<br>• `apps/api/src/services/cloudinary.service.ts` | 🔴 HIGH | **Không** | ✅ COMPLETED | `22cc515` | Cài đặt `cloudinary` SDK & `busboy`, hiện thực service streaming upload vào Cloudinary (pipe stream) và destroy asset phục vụ rollback. |
| **U-04** | • `apps/api/src/routes/admin/media.ts`<br>• `apps/api/src/routes/admin.ts`<br>• `apps/api/src/server.ts` | 🔴 HIGH | **Có (Route & Server Wire)** | ✅ COMPLETED | `df1513d` | Hiện thực cụm REST Endpoints: Upload streaming single file, List/Search phân trang, Update AltText, Delete đơn & Batch Delete kèm RBAC Guards. |
| **U-05** | • `scripts/verify_admin_image_library.sh`<br>• `packages/core/src/__tests__/admin-media.test.ts` | 🟠 MEDIUM | **Không** | ✅ COMPLETED | `801cd5f` | Khởi tạo CLI Verification Runner, kiểm thử typecheck toàn repo, schema integrity, upload contract và trả về exit code 0. |

---

## 2. Nhật Ký Chi Tiết Từng Lượt (Execution Log)

### 🔹 [2026-09-29T01:47:00+07:00] - Unit U-01: Shared Types & Cloudinary Env Config
* **Thay đổi chính:**
  - Bổ sung cấu hình Server Env `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER` vào `packages/env/src/index.ts` (Bảo mật 100%, không expose Client).
  - Tạo mới `packages/types/src/media.ts` định nghĩa Zod Schemas (`MediaItemSchema`, `UpdateMediaSchema`, `MediaQuerySchema`, `BatchDeleteMediaSchema`) và TypeScript DTOs.
  - Bổ sung quyền RBAC `media:read`, `media:write`, `media:delete` vào `packages/types/src/permission.ts` và gán quyền cho Admin, Manager, Editor, Sales.
  - Cập nhật mẫu `.env.example` với các biến môi trường Cloudinary.
* **Kết quả Verify:**
  - Project-wide type-check (`pnpm check-types` qua Turbo): **8/8 packages successful (0 errors)**.
  - Secret scan: Đạt chuẩn, không hardcode secret.
* **Commit Hash:** `de6cc16`

### 🔹 [2026-09-29T01:50:00+07:00] - Unit U-02: Database Media Schema & Drizzle Migration
* **Thay đổi chính:**
  - Mở rộng bảng `media` trong `packages/database/src/schema/media.ts` bổ sung `publicId` (unique), `format`, `folder`, `uploaderId` (FK to `users.id`), `updatedAt` và 4 Composite Indexes.
  - Cập nhật quan hệ `mediaRelations` và `usersRelations` trong `packages/database/src/schema/relations.ts`.
  - Sinh file migration `drizzle/0004_late_bromley.sql` bằng `drizzle-kit generate`.
  - Chạy `drizzle-kit migrate` thành công vào cơ sở dữ liệu PostgreSQL thực tế (Kiểm chứng trực tiếp bảng `media` có đủ 14 columns).
* **Kết quả Verify:**
  - Project-wide type-check: **8/8 packages passed (0 errors)**.
  - DB Verification: `SELECT column_name FROM information_schema.columns WHERE table_name='media'` trả về chính xác 14 columns.
* **Commit Hash:** `d846520`

### 🔹 [2026-09-29T01:53:00+07:00] - Unit U-03: Cloudinary Streaming Service & Rollback Handler
* **Thay đổi chính:**
  - Cài đặt các dependencies cần thiết cho backend: `cloudinary` SDK, `busboy` và `@types/busboy`.
  - Tạo mới `apps/api/src/services/cloudinary.service.ts` kết nối Cloudinary SDK bảo mật bằng biến môi trường Server (`CLOUDINARY_*`).
  - Hiện thực `uploadStreamToCloudinary`: Sử dụng cơ chế Streaming Pipeline (`upload_stream`), tự động tối ưu hóa ảnh (`f_auto, q_auto:good`) mà không đọc file vào RAM Buffer (Triệt tiêu R2 Memory Leak).
  - Hiện thực `deleteCloudinaryAsset` (xóa ảnh và vô hiệu hóa cache CDN) và `rollbackCloudinaryUpload` (Tự động thu hồi ảnh rác nếu DB Insert thất bại - R15 Guard).
* **Kết quả Verify:**
  - Type-check `apps/api`: **Passed (0 errors)**.
  - Project-wide type-check: **8/8 packages passed (0 errors)**.
  - Code Cleanliness: Loại bỏ toàn bộ `|| process.env.*` fallback, bảo đảm `serverEnv` là Single Source of Truth duy nhất (chống phân mảnh logic).
* **Commit Hash:** `22cc515` (rebased from `163a2a4`)

### 🔹 [2026-09-29T01:56:00+07:00] - Unit U-04: Media REST API Endpoints & Server Integration
* **Thay đổi chính:**
  - Tạo mới `apps/api/src/routes/admin/media.ts` hiện thực trọn vẹn 5 REST endpoints:
    1. `POST /api/admin/media/upload`: Nhận multipart stream qua Busboy, validate MIME whitelist và max size 10MB, pipe sang Cloudinary và lưu DB kèm rollback đền bù.
    2. `GET /api/admin/media`: Phân trang, tìm kiếm gần đúng theo filename/altText, lọc format, sắp xếp (newest/oldest/size/name).
    3. `PUT /api/admin/media/:id`: Cập nhật altText SEO và tên ảnh.
    4. `DELETE /api/admin/media/:id`: Xóa asset Cloudinary và xóa PostgreSQL record, ghi audit log.
    5. `POST /api/admin/media/batch-delete`: Xóa hàng loạt danh sách ảnh theo mảng IDs.
  - Tích hợp `handleMediaRoutes` vào luồng phân giải Router chính tại `apps/api/src/routes/admin.ts`.
  - Bảo vệ đa tầng bằng middleware `authenticateAdmin` và `checkPermission('media:write' | 'media:delete' | 'media:read')`.
* **Kết quả Verify:**
  - Type-check `apps/api`: **Passed (0 errors)**.
  - Project-wide type-check: **8/8 packages passed (0 errors)**.
* **Commit Hash:** `df1513d`

### 🔹 [2026-09-29T01:57:00+07:00] - Unit U-05: Machine Verification Script & Core Tests
* **Thay đổi chính:**
  - Khởi tạo tệp kiểm thử tự động `packages/core/src/__tests__/admin-media.test.ts` kiểm thử 12 test cases về Zod schemas (`MediaItemSchema`, `MediaQuerySchema`, `UpdateMediaSchema`, `BatchDeleteMediaSchema`) và RBAC matrix.
  - Thiết lập script máy kiểm chứng tự động `scripts/verify_admin_image_library.sh` độc lập (kiểm tra Node 24, Turbo check-types, schema DB 14 columns, Vitest 12 tests).
  - Chạy thực tế `./scripts/verify_admin_image_library.sh` đạt kết quả **EXIT 0 (100% PASS)**.
* **Kết quả Verify:**
  - Machine Verification Script: **Passed with EXIT 0**.
  - Vitest: **12/12 tests passed (100%)**.
  - Project-wide Type Check: **8/8 packages passed (0 errors)**.
* **Commit Hash:** `801cd5f`

---
🎉 **KẾT THÚC LÁT CẮT US-01:** Hoàn thành 100% Backend Integration, Data Contracts & Machine Verification.

---

## 3. Micro-Roadmap & Step-Gate Units (Lát cắt US-02: Admin Media Library Portal)

| Unit ID | File(s) Tác Động | Risk Tier | Coupled Unit? | Trạng Thái | Commit Hash | Mục Tiêu & Mô Tả Đơn Vị |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **U-06** | • `apps/admin/services/media.service.ts`<br>• `apps/admin/hooks/use-media-uploader.ts`<br>• `apps/admin/hooks/use-media-library.ts` | 🟠 MEDIUM | **Có (Service & Hooks)** | ✅ COMPLETED | `ea19bcd` | Hiện thực Client API Service (XHR đo lường tiến trình %, CRUD media) và Custom Hooks điều phối Concurrency Queue (max 3 luồng tải song song). |
| **U-07** | • `apps/admin/app/media/components/MediaCard.tsx`<br>• `apps/admin/app/media/components/MediaDropzone.tsx`<br>• `apps/admin/app/media/components/MediaUploadQueue.tsx`<br>• `apps/admin/app/media/components/MediaDetailDrawer.tsx`<br>• `apps/admin/app/media/components/MediaFilterBar.tsx`<br>• `apps/admin/app/media/components/MediaBatchActions.tsx` | 🟡 LOW | **Có (Presentation Primitives)** | ✅ COMPLETED | `9e36807` | Xây dựng bộ Presentational Components chuẩn 4-State UI (Loading Shimmer, Empty, Error, Data), Drag & Drop upload zone, và Drawer xem chi tiết/sửa Alt Text/copy URL. |
| **U-08** | • `apps/admin/app/media/page.tsx`<br>• `apps/admin/app/components/AdminShell.tsx` | 🟠 MEDIUM | **Có (Page & Nav Wire)** | ✅ COMPLETED | `b131eab` | Ghép nối trang quản lý ảnh `/media` hoàn chỉnh và bổ sung mục "Thư Viện Ảnh" vào Sidebar Navigation với quyền `media:read`. |
| **U-09** | • `scripts/verify_admin_image_library.sh` | 🟠 MEDIUM | **Không** | PENDING | - | Cập nhật script kiểm chứng tự động kiểm tra Next.js Admin page, typecheck và xác nhận exit code 0 cho toàn bộ US-02. |

---

## 4. Nhật Ký Chi Tiết Thực Thi US-02

### 🔹 [2026-09-29T02:02:00+07:00] - Unit U-06: Client Media Service & Concurrency Queue Hooks
* **Thay đổi chính:**
  - `apps/admin/lib/api-client.ts`: Nâng cấp `HttpClient.request` tự động nhận diện `body instanceof FormData` (không ép `application/json` và không `JSON.stringify`), hỗ trợ upload 100% bằng native `fetch()`. Loại bỏ hoàn toàn `XMLHttpRequest` khỏi toàn bộ codebase, đảm bảo an toàn tuyệt đối cho SSR (Server Components) và zero external dependencies (không cần axios).
  - `apps/admin/services/media.service.ts`: Khởi tạo Typed Media Service kết nối REST API `/api/admin/media/*` qua `apiClient.post` thuần túy, CRUD media và batch delete.
  - `apps/admin/hooks/use-media-uploader.ts`: Custom hook điều phối Concurrency Queue (giới hạn tối đa 3 file upload song song), quản lý tiến trình indeterminate loading mượt mà (`pending` ➡️ `uploading` ➡️ `success`/`error`), hỗ trợ retry và cleanup.
  - `apps/admin/hooks/use-media-library.ts`: Custom hook quản lý kho ảnh, bao gồm debounce search (350ms), lọc định dạng, sắp xếp, phân trang, selection set (chọn nhiều ảnh) và xóa ảnh (đơn lẻ / batch).
* **Kết quả Verify:**
  - Type-check `@cardealer/admin`: **Passed (0 errors)**.
  - Project-wide type-check: **8/8 packages passed (0 errors)**.
  - Verification Script `./scripts/verify_admin_image_library.sh`: **EXIT 0 (100% PASS)**.
  - Code Quality: 100% Named Exports, không nuốt lỗi `try/catch`, 100% fetch đồng nhất.

### 🔹 [2026-09-29T07:37:00+07:00] - Unit U-07: Media Library Presentation Primitives
* **Thay đổi chính:**
  - `apps/admin/app/media/components/MediaCard.tsx`: Thẻ hiển thị ảnh bo góc sắc nét, badge định dạng, checkbox chọn nhiều ảnh, fallback khi ảnh hỏng và component `MediaCardSkeleton`.
  - `apps/admin/app/media/components/MediaDropzone.tsx`: Vùng kéo thả tệp tải lên mượt mà với visual cues, kiểm tra MIME type whitelist và dung lượng tối đa 10MB/ảnh.
  - `apps/admin/app/media/components/MediaUploadQueue.tsx`: Widget khay hàng đợi tải lên đa luồng (tối đa 3 task), indeterminate loading spinner, hỗ trợ retry từng file lỗi và dọn dẹp task hoàn tất.
  - `apps/admin/app/media/components/MediaDetailDrawer.tsx`: Drawer trượt hiển thị ảnh to, thông số kỹ thuật (kích thước px, dung lượng, format, ngày tải), nút copy CDN URL 1-click, chỉnh sửa Alt Text SEO và xóa ảnh có bước xác nhận.
  - `apps/admin/app/media/components/MediaFilterBar.tsx`: Thanh công cụ tìm kiếm debounce, lọc format (WEBP, PNG, JPG, SVG, GIF), sắp xếp (mới/cũ/size/tên) và nút làm mới dữ liệu.
  - `apps/admin/app/media/components/MediaBatchActions.tsx`: Thanh tác vụ nổi glassmorphism khi chọn nhiều ảnh (Chọn tất cả trang, Bỏ chọn, Xóa hàng loạt bảo vệ).
  - `apps/admin/app/media/components/index.ts`: Barrel export 100% Named Exports.
  - **Zero Raw Controls:** Toàn bộ button, input, select trong `media/components` đã được chuẩn hóa sang `@cardealer/ui` (`Button`, `Input`, `Select`).
* **Kết quả Verify:**
  - Type-check `@cardealer/admin`: **Passed (0 errors)**.
  - Project-wide type-check: **8/8 packages passed (0 errors)**.
  - Verification Script `./scripts/verify_admin_image_library.sh`: **EXIT 0 (100% PASS)**.

### 🔹 [2026-09-29T10:45:00+07:00] - Unit U-08: Media Page Controller & AdminShell Navigation
* **Thay đổi chính:**
  - `apps/admin/app/media/page.tsx`: Xây dựng Page Controller hoàn chỉnh kết nối `useMediaLibrary`, `useMediaUploader` với toàn bộ Presentation Components. Triển khai chuẩn 4-State UI (Loading 24 Shimmer Skeletons, Empty State thông minh, Error State không nuốt lỗi, Responsive Media Grid 2-6 cột). Tích hợp RBAC Permissions (`media:read`, `media:write`, `media:delete`), thanh phân trang (Pagination controls), Floating Batch Actions bar, và Concurrency Queue widget. 100% UI controls sử dụng `@cardealer/ui` (Zero raw HTML `<button>`, `<input>`).
  - `apps/admin/app/components/AdminShell.tsx`: Bổ sung mục navigation "Thư Viện Ảnh" (`/media`, icon `Image`, quyền RBAC `media:read`).
* **Kết quả Verify:**
  - Type-check `@cardealer/admin`: **Passed (0 errors)**.
  - Project-wide type-check: **8/8 packages passed (0 errors)**.
  - Verification Script `./scripts/verify_admin_image_library.sh`: **EXIT 0 (100% PASS)**.










