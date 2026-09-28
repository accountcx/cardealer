# 📜 EXECUTION LOG: Thư Viện Ảnh Admin & Tích Hợp Cloudinary (Admin Image Library)

* **Trạng thái:** 🚀 BẮT ĐẦU THỰC THI (PHASE 4)
* **Lát cắt Hiện tại:** **US-01: Cloudinary Backend Integration & Media Data Contracts**
* **Khởi tạo lúc:** 2026-09-29T01:45:00+07:00

---

## 1. Micro-Roadmap & Step-Gate Units (Lát cắt US-01)

| Unit ID | File(s) Tác Động | Risk Tier | Coupled Unit? | Trạng Thái | Commit Hash | Mục Tiêu & Mô Tả Đơn Vị |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **U-01** | • `packages/env/src/index.ts`<br>• `packages/types/src/media.ts`<br>• `packages/types/src/index.ts`<br>• `packages/types/src/permission.ts` | 🟡 LOW | **Có (Shared Types & Env)** | PENDING | - | Khai báo Zod Server Env cho Cloudinary (`CLOUDINARY_*`), DTOs `MediaItem`, query schemas và RBAC permissions (`media:read`, `media:write`, `media:delete`). |
| **U-02** | • `packages/database/src/schema/media.ts`<br>• `packages/database/src/schema/relations.ts`<br>• `packages/database/drizzle/...` | 🔴 HIGH | **Không** | PENDING | - | Mở rộng Drizzle Schema `media` (`publicId`, `format`, `folder`, `uploaderId`, `updatedAt` + 4 Indexes), cập nhật relations và sinh migration DB. |
| **U-03** | • `apps/api/package.json`<br>• `apps/api/src/services/cloudinary.service.ts` | 🔴 HIGH | **Không** | PENDING | - | Cài đặt `cloudinary` SDK & `busboy`, hiện thực service streaming upload vào Cloudinary (pipe stream) và destroy asset phục vụ rollback. |
| **U-04** | • `apps/api/src/routes/admin/media.ts`<br>• `apps/api/src/routes/admin.ts`<br>• `apps/api/src/server.ts` | 🔴 HIGH | **Có (Route & Server Wire)** | PENDING | - | Hiện thực cụm REST Endpoints: Upload streaming single file, List/Search phân trang, Update AltText, Delete đơn & Batch Delete kèm RBAC Guards. |
| **U-05** | • `scripts/verify_admin_image_library.sh` | 🟠 MEDIUM | **Không** | PENDING | - | Khởi tạo CLI Verification Runner, kiểm thử typecheck toàn repo, schema integrity, upload contract và trả về exit code 0. |

---

## 2. Nhật Ký Chi Tiết Từng Lượt (Execution Log)

*(Chưa có bản ghi thực thi. Đang ở Turn 0 - Chờ Developer duyệt Micro-Roadmap).*
