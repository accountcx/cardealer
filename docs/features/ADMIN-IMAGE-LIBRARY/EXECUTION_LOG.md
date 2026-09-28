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
| **U-03** | • `apps/api/package.json`<br>• `apps/api/src/services/cloudinary.service.ts` | 🔴 HIGH | **Không** | ✅ COMPLETED | `163a2a4` | Cài đặt `cloudinary` SDK & `busboy`, hiện thực service streaming upload vào Cloudinary (pipe stream) và destroy asset phục vụ rollback. |
| **U-04** | • `apps/api/src/routes/admin/media.ts`<br>• `apps/api/src/routes/admin.ts`<br>• `apps/api/src/server.ts` | 🔴 HIGH | **Có (Route & Server Wire)** | PENDING | - | Hiện thực cụm REST Endpoints: Upload streaming single file, List/Search phân trang, Update AltText, Delete đơn & Batch Delete kèm RBAC Guards. |
| **U-05** | • `scripts/verify_admin_image_library.sh` | 🟠 MEDIUM | **Không** | PENDING | - | Khởi tạo CLI Verification Runner, kiểm thử typecheck toàn repo, schema integrity, upload contract và trả về exit code 0. |

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
* **Commit Hash:** `163a2a4`



