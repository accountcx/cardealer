# 🎯 Feature Backlog: Thư Viện Ảnh Admin & Tích Hợp Cloudinary (Admin Image Library)

## 1. Thông tin Bối cảnh và Phạm vi
* **Mã Feature:** `ADMIN-IMAGE-LIBRARY`
* **Dự án:** CarDealer Monorepo (`/Users/nhatphan/Code/CarDealer/cardealer`)
* **Mục tiêu Nghiệp vụ:** 
  - Xây dựng Thư viện Quản lý Ảnh (Media Library) tập trung dành cho Admin Portal (`apps/admin`).
  - Hỗ trợ tải lên 1 hoặc nhiều ảnh đồng thời (Single & Batch Upload) với tính năng Drag & Drop, thanh tiến trình (progress indicator), preview ảnh và xác thực định dạng/dung lượng trước khi upload.
  - Tích hợp dịch vụ lưu trữ đám mây **Cloudinary** (Upload API, CDN URLs, responsive transformations, an toàn bảo mật API Key/Secret qua Server Proxy).
  - Cung cấp component **Media Picker Modal** tái sử dụng trên toàn hệ thống để chèn ảnh trực tiếp vào: Quản lý Dòng xe (Ảnh đại diện xe), Quản lý Bài viết (Featured Image, Single Image block, Gallery block), và Hồ sơ người dùng (Avatar).
* **Trạng thái Môi trường:** 🟢 **Pure Development (Sandbox)**
* **Phạm vi Nền tảng (Platform Scope):** **Full-stack**
  - **Database:** `packages/database` (Mở rộng schema `media`, drizzle migrations)
  - **Shared Types & Env:** `packages/types`, `packages/env` (Zod schemas, DTOs, Cloudinary env config)
  - **Shared UI:** `packages/ui` (Media card, upload dropzone, modal)
  - **Backend API:** `apps/api` (REST endpoints `/api/admin/media/*`, Cloudinary SDK service, streaming upload)
  - **Admin Portal:** `apps/admin` (Trang quản trị `/media`, Media Picker Modal, tích hợp vào các form Car & Post)
* **Tọa độ Module Tác động:**
  - `packages/database/src/schema/media.ts`
  - `packages/env/src/index.ts`
  - `packages/types/src/media.ts` (mới) & `index.ts`
  - `packages/types/src/permission.ts` (thêm `media:read`, `media:write`, `media:delete`)
  - `apps/api/src/services/cloudinary.service.ts` (mới)
  - `apps/api/src/routes/admin/media.ts` (mới)
  - `apps/api/src/server.ts` & `apps/api/src/routes/admin.ts`
  - `apps/admin/app/media/page.tsx` (mới)
  - `apps/admin/app/media/components/` (mới)
  - `apps/admin/app/components/AdminShell.tsx` (thêm mục Thư Viện Ảnh vào Sidebar)
  - `apps/admin/components/MediaPickerModal.tsx` (mới - dùng chung)
* **Locale và Timezone:** `vi-VN` / `Asia/Ho_Chi_Minh`

---

## 2. Ma trận Lát cắt Tính năng Dọc (Vertical Slices Matrix)

| ID | User Story / Luồng Nghiệp Vụ | Phạm vi Tầng | Tiêu chí Hoàn thành (Definition of Done) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | **Cloudinary Backend Integration & Media Data Contracts**<br>- Mở rộng Drizzle Schema `media`: bổ sung `publicId`, `format`, `folder`, `uploaderId`, `updatedAt`<br>- Cấu hình Zod Env cho Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`)<br>- Tích hợp Cloudinary SDK với cơ chế Stream Upload (Zero memory leak, không lưu file tạm ổ đĩa)<br>- API REST Endpoints:<br>  + `POST /api/admin/media/upload`: Upload 1 hoặc nhiều ảnh (Multipart/form-data), validate mime-type (image/jpeg, png, webp, gif, svg) và max size 10MB<br>  + `GET /api/admin/media`: Phân trang, tìm kiếm theo filename/altText<br>  + `PUT /api/admin/media/:id`: Cập nhật altText/filename<br>  + `DELETE /api/admin/media/:id`: Xóa ảnh đồng bộ trên Cloudinary và PostgreSQL | Backend (`packages/database`, `packages/env`, `packages/types`, `apps/api`) | • Drizzle schema migration hoàn tất<br>• Cloudinary Service upload & delete thành công<br>• Endpoints trả về JSON chuẩn, mã lỗi 400/401/403/404/500 rõ ràng<br>• Type-check `tsc --noEmit` đạt 0 lỗi | 🔄 IN PROGRESS |
| **US-02** | **Admin Media Library Management Portal (`/media`)**<br>- Xây dựng trang `/media` trong `apps/admin`<br>- Khu vực Upload kéo thả (Drag & Drop Zone): Hỗ trợ chọn/thả 1 hoặc nhiều ảnh cùng lúc, thanh hiển thị tiến trình từng file, trạng thái thành công/thất bại<br>- Lưới hiển thị Media Grid theo chuẩn 4-State UI (Loading Shimmer, Empty, Error, Data)<br>- Bộ lọc & Tìm kiếm: Thanh tìm kiếm theo tên/altText, bộ lọc ngày tháng, sắp xếp mới nhất/cũ nhất<br>- Drawer/Modal Xem Chi Tiết Ảnh: Hiển thị URL, kích thước (width x height), dung lượng (fileSize formatted KB/MB), định dạng, cho phép copy link nhanh vào clipboard và sửa Alt Text SEO<br>- Xóa ảnh an toàn: Modal xác nhận xóa đơn lẻ và xóa nhiều (Batch Delete)<br>- Bổ sung menu "Thư Viện Ảnh" vào Sidebar `AdminShell.tsx` | Admin (`apps/admin`) | • Giao diện hoàn chỉnh, chuẩn responsive, dark/light theme thống nhất<br>• Kéo thả multi-upload mượt mà, hiển thị tiến độ trực quan<br>• Copy link hoạt động tốt (Toast notification phản hồi)<br>• Xóa ảnh cập nhật real-time không cần reload trang | ⏸️ QUEUED |
| **US-03** | **Reusable Media Picker Component & System-Wide Integration**<br>- Xây dựng component dùng chung `MediaPickerModal`:<br>  + Tab 1: Chọn từ Thư viện có sẵn (Media Grid + Tìm kiếm + Phân trang + Hỗ trợ chọn 1 hoặc nhiều ảnh tùy mode `single` / `multiple`)<br>  + Tab 2: Upload trực tiếp ngay trong Modal (kéo thả hoặc chọn file, upload xong tự động select)<br>- Tích hợp vào Form Quản lý Dòng xe (`apps/admin/app/cars/components/CarFormModal.tsx`): Thay thế input gõ URL thủ công bằng nút "Chọn ảnh từ thư viện"<br>- Tích hợp vào Trình soạn thảo Bài viết (`apps/admin/app/posts/[id]/page.tsx`): Chọn ảnh bìa (Featured Image), chèn ảnh đơn (Single Image), chèn gallery ảnh lướt (Image Gallery) trực tiếp từ Media Library<br>- Tích hợp vào Hồ sơ cá nhân (`apps/admin/app/profile/page.tsx`): Đổi ảnh đại diện Avatar | Admin UI (`apps/admin/components`, `apps/admin/app`) | • MediaPickerModal tái sử dụng linh hoạt với prop `mode="single" | "multiple"`<br>• Form Xe và Bài viết chọn ảnh trực tiếp từ modal thành công, hiển thị thumbnail preview ngay lập tức<br>• Không làm ảnh hưởng đến dữ liệu ảnh cũ của các bài viết và xe hiện hữu | ⏸️ QUEUED |

---

## 3. Điểm Chốt Biên và Rủi ro Nghiệp vụ (Watch-outs & Edge Cases)
* **Bảo mật Thông tin Đám mây (Secret Leakage Defense):** Tuyệt đối KHÔNG cấu hình `CLOUDINARY_API_SECRET` dưới dạng `NEXT_PUBLIC_*` trên Frontend. Mọi thao tác Upload/Delete đều phải đi qua Backend Proxy (`apps/api`) có kiểm tra Authentication & RBAC (`media:write`, `media:delete`).
* **Kịch bản Tải Lên Đa Tệp (Batch Upload Concurrency):** Khi Admin chọn cùng lúc 10-20 ảnh dung lượng lớn, cần xử lý upload tuần tự hoặc giới hạn số luồng đồng thời (concurrency limit = 3–5) để tránh làm nghẽn CPU hoặc chạm Cloudinary Rate Limit.
* **Xử lý Tệp Rác / Mất Đồng Bộ (Orphaned Cloudinary Assets):** Nếu upload lên Cloudinary thành công nhưng lưu vào PostgreSQL bị lỗi (DB crash/timeout), hệ thống phải tự động kích hoạt Rollback xóa ảnh trên Cloudinary để tránh rác dung lượng.
* **Bẫy Định Dạng & An Toàn Tệp Tin (File Magic Number & MIME Validation):** Không chỉ dựa vào đuôi file (`.jpg`, `.png`), cần kiểm tra header MIME type hợp lệ, ngăn chặn tải lên file thực thi độc hại (`.exe`, `.sh`, `.php`).
* **Hỗ trợ SVG An Toàn:** Nếu cho phép SVG, Cloudinary tự động sanitize hoặc cần cấu hình cấm mã script độc hại (Stored XSS).
* **Tương thích Dữ liệu Ảnh Cũ:** Các ảnh xe cũ đang dùng đường dẫn nội bộ `/images/cars/...` vẫn phải hiển thị bình thường; thư viện ảnh mới lưu URL đầy đủ từ Cloudinary (`https://res.cloudinary.com/...`).

---

## 4. Định hướng Kích hoạt Skills cho Phase Kế tiếp
* **Phase 2 (Adaptive Architecture Design):**
  - **Step 2.1 (Solution Options):** `@system-analyst-architect` — So sánh phương án Upload qua Backend Streaming Proxy vs Direct Upload qua Signed Presets / Signature to Cloudinary.
  - **Step 2.2 (Logic Flow):** `@logic-flow-ba` — Vẽ Sequence Diagram luồng Upload đơn/đa ảnh, Xóa ảnh và Chọn ảnh vào Form (`FLOW.md`).
  - **Step 2.3 (Data Model):** `@db-schema-architect` — Hoàn thiện Schema `media`, Drizzle Migration, Indexes và Constraints (`SCHEMA.md`).
  - **Step 2.4 (API Spec):** `@feature-spec-generator` — Đặc tả chuẩn REST Endpoints cho Media API (`API_SPEC.md`).
  - **Step 2.5 (UI Integration):** `@tailwind-ui-designer` — Thiết kế Layout trang `/media`, Dropzone, Media Grid, Details Drawer và MediaPickerModal (`FE_INTEGRATION_GUIDE.md`).
