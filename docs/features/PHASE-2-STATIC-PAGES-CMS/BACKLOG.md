# 🎯 Feature Backlog: PHASE 2 - QUẢN TRỊ TRANG TĨNH ĐỘNG (STATIC-PAGES-CMS)

> **Mã Epic**: `EPIC-PHASE-2-STATIC-PAGES-CMS`  
> **Dự án**: Nền Tảng Showroom Ô Tô & Đại Lý Ủy Quyền CarDealer  
> **Tiêu chuẩn quy trình**: Universal Agentic Workflow v2.2 (Phase 1: Strategic Analysis)  
> **Lead Orchestrator**: `task-planner-pm`  
> **Hỗ trợ khảo cổ & trích xuất**: `logic-intent-explorer`, `logic-intent-extractor`  

---

## 1. Thông Tin Bối Cảnh & Phạm Vi Hệ Thống

* **Mục tiêu Nghiệp vụ:**  
  Xây dựng module quản trị trang tĩnh động hoàn chỉnh trong CMS Admin và render động qua Server Component `apps/web/app/[slug]/page.tsx` tại Web Storefront. Module cho phép phòng Marketing & Ban biên tập tự do tạo, chỉnh sửa các trang uy tín E-E-A-T và cẩm nang giao dịch (`/gioi-thieu`, `/chinh-sach-bao-mat`, `/quy-trinh-mua-xe`, `/tra-gop`...) với bộ cấu hình Technical SEO chuyên biệt (Meta Title/Description, SERP Preview, OG:Image, Schema type, noIndex) và hiển thị qua 4 mẫu Templates chuyên nghiệp ngành xe hơi.
* **Trạng thái Môi trường:** 🟢 `case_a: SANDBOX_GREENFIELD` (Môi trường phát triển Sandbox, chưa Live Production In-Use).
* **Phạm vi Nền tảng:** `[Full-stack]` (Database Schema Drizzle ➡️ REST API ➡️ CMS Admin UI ➡️ Storefront Web Client).
* **Tọa độ Module Tác động (Codebase Landmarks):**
  * `packages/database/src/schema/static-pages.ts` *(Schema Drizzle mới)*
  * `packages/types/src/static-pages.ts` *(TypeScript Contracts mới)*
  * `apps/api/src/routes/admin/pages.ts` *(Admin CRUD API)*
  * `apps/api/src/routes/pages.ts` *(Public API fetch trang theo slug)*
  * `apps/admin/app/pages/` *(Giao diện CMS Admin danh sách và soạn thảo 2 cột)*
  * `apps/web/app/[slug]/page.tsx` *(Dynamic catch-all route Server Component phía Web Client)*
  * `apps/web/components/pages/templates/` *(4 Layout Templates chuyên biệt)*
* **Locale và Timezone:** `vi-VN` / `Asia/Ho_Chi_Minh` (GMT+7).

---

## 2. Ma Trận Lát Cắt Tính Năng Dọc (Vertical Slices Matrix)

| ID | User Story / Luồng Nghiệp Vụ | Phạm Vi Tầng | Tiêu Chí Hoàn Thành (Definition of Done) | Trạng Thái |
| :---: | :--- | :---: | :--- | :---: |
| **US-01** | **Khởi tạo Drizzle Schema & Type Contracts cho `static_pages`** | `[Database / Types]` | • Schema `static_pages` định nghĩa trong `packages/database/src/schema/static-pages.ts` gồm 12 trường nội dung & SEO.<br/>• Export đầy đủ interfaces trong `packages/types/src/static-pages.ts`.<br/>• Chạy migration/push Drizzle thành công vào PostgreSQL. | ⏸️ QUEUED |
| **US-02** | **Bộ REST API Service Admin CRUD & Public Query** | `[Backend API]` | • API Admin: `GET /api/admin/pages`, `POST /api/admin/pages`, `GET /api/admin/pages/:id`, `PUT /api/admin/pages/:id`, `DELETE /api/admin/pages/:id` có auth RBAC.<br/>• Public API: `GET /api/public/pages/:slug` có cache, trả về 404 nếu chưa xuất bản (`isPublished = false`). | ⏸️ QUEUED |
| **US-03** | **Giao diện CMS Admin Quản Trị & Soạn Thảo 2 Cột** | `[Admin Frontend]` | • Tuyến `/pages`: Bảng dữ liệu trang tĩnh, bộ lọc trạng thái, tìm kiếm tức thì, Zero-CLS Skeleton.<br/>• Tuyến `/pages/new` và `/pages/[id]`: Bố cục 2 cột gồm Cột trái (Title, auto-slug, Tiptap Rich-Text Editor) và Cột phải (Google SERP Preview thời gian thực, đếm ký tự Meta Title/Description, OG Image, chọn 4 Templates & Schema type, switch noIndex). | ⏸️ QUEUED |
| **US-04** | **Dynamic Catch-all Route `[slug]` & 4 Layout Templates Storefront** | `[Web Client]` | • Route `apps/web/app/[slug]/page.tsx` xử lý mượt mà, không xung đột với các route tĩnh (`/xe`, `/dong-xe`, `/tin-tuc`).<br/>• `generateMetadata({ params })` tự động inject Meta tags, Canonical và Robots chuẩn SEO.<br/>• Hoàn thiện 4 mẫu Templates: `PROFILE_SHOWROOM` (`/gioi-thieu`), `DEFAULT` (`/chinh-sach-bao-mat`), `TIMELINE` (`/quy-trinh-mua-xe`), `FINANCE` (`/tra-gop`).<br/>• Gọi `notFound()` hiển thị trang 404 nếu slug không tồn tại. | ⏸️ QUEUED |

---

## 3. Khảo Cổ Codebase, Kịch Bản Biên & Rủi Ro Nghiệp Vụ (Watch-outs)

### 3.1 Khảo Cổ Codebase Hiện Hữu (Từ `logic-intent-explorer` & `logic-intent-extractor`)
1. **Kiến trúc Routing của `apps/web`:**
   * Cấu trúc `apps/web/app/` là phẳng (không dùng route group `(main)`).
   * Các route tĩnh cố định cấp 1 gồm: `/xe`, `/dong-xe`, `/tin-tuc`, `/gia-lan-banh`, `/tra-gop`.
   * **Quy tắc biên**: Catch-all dynamic route `apps/web/app/[slug]/page.tsx` sẽ nhận tất cả các URL cấp 1 khác. Cần cơ chế fallback chặt chẽ: nếu slug không khớp với bất kỳ `static_pages` nào có `isPublished === true` ➡️ gọi `notFound()` ngay lập tức để tránh bắt nhầm các route hệ thống.
2. **Kiến trúc Tiptap JSON AST Tree:**
   * Hệ thống đã có sẵn thư viện `@cardealer/core` hỗ trợ `TiptapDoc`, `serializeTiptapDoc`, `deserializeTiptapDoc` (đã sử dụng trong module bài viết `posts`).
   * Phân hệ `static_pages` có thể tái sử dụng trực tiếp cấu trúc này, đảm bảo tính đồng nhất 100% trong toàn bộ monorepo.
3. **Quản trị Schema Drizzle:**
   * Bảng `static_pages` tuân thủ chuẩn naming conventions: `id` (uuid defaultRandom), `title`, `slug` (unique), `content` (jsonb), `template_type`, `is_published`, `meta_title`, `meta_description`, `canonical_url`, `og_image`, `no_index`, `schema_type`.

### 3.2 Kịch Bản Biên (Edge Cases) Cần Chặn
* **Slug Collisions**: Người dùng tạo trang có slug trùng với route tĩnh của hệ thống (ví dụ: đặt slug là `xe`, `admin`, `api`, `login`). ➡️ Cần blacklist validation các slug cấm trong API và Admin Form.
* **Draft Leakage**: Trang ở trạng thái `isPublished === false` tuyệt đối không được render ngoài storefront (phải trả về 404 cho khách truy cập vãng lai).
* **SEO SERP Preview Truncation**: Xử lý việc cắt ngắn chuỗi `...` khi tiêu đề vượt quá 60 ký tự hoặc mô tả vượt quá 160 ký tự trên giao diện xem trước.
* **XSS Sanitization**: Nội dung render từ Tiptap JSON AST phải qua cơ chế render an toàn của React, loại bỏ các thẻ script độc hại.

---

## 4. Định Hướng Kích Hoạt Skills Cho Phase 2 (Architecture Design)
* **2.1 Solution Options**: Kích hoạt `@system-analyst-architect` lập `SOLUTION_OPTIONS.md` (So sánh giải pháp CMS Dynamic Page vs Static Files).
* **2.2 Logic Flow**: Kích hoạt `@logic-flow-ba` lập `FLOW.md` (Luồng khởi tạo, duyệt xuất bản, phân giải URL và fallback 404).
* **2.3 Database Schema**: Kích hoạt `@db-schema-architect` lập `SCHEMA.md` (Thiết kế chi tiết bảng `static_pages`, indexes, enum templates).
* **2.4 API Specification**: Kích hoạt `@feature-spec-generator` lập `API_SPEC.md` (Chuẩn hóa request/response DTO).
* **2.5 UI Integration Spec**: Kích hoạt `@tailwind-ui-designer` lập `FE_INTEGRATION_GUIDE.md` (Layout 2 cột Admin + 4 Storefront Templates).
