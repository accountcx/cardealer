# 🎯 Feature Backlog: Cấu Trúc Routing Tĩnh & Kiến Trúc Menu (URL Architecture)

## 1. Thông tin Bối cảnh và Phạm vi
* **Mục tiêu Nghiệp vụ:** Xóa bỏ hoàn toàn query parameters ở các danh mục phân khúc xe cốt lõi (`/xe?kieuDang=...`), chuẩn hóa đường dẫn tĩnh thân thiện với Googlebot (`/dong-xe/[slug]`), nâng cao thứ hạng SEO danh mục dòng xe và trải nghiệm điều hướng người dùng.
* **Trạng thái Môi trường:** 🟢 Pure Development (Sandbox) — Cho phép cập nhật cấu hình mặc định (Defaults), chạy re-seed hoặc migration DB nội bộ an toàn.
* **Phạm vi Nền tảng:** `Full-stack` (Storefront Web Client + Shared Data Types + DB System Settings + Next.js Server Components / Routing Engine).
* **Tọa độ Module Tác động:**
  - `apps/web/app/(main)/dong-xe/[slug]/page.tsx` (Tạo mới Dynamic Route Server Component)
  - `apps/web/components/layout/Navbar.tsx` & `MobileDrawer.tsx` (Đảm bảo render link cấp 2 mượt mà)
  - `packages/types/src/settings.ts` (Chuẩn hóa URL mặc định trong `NavigationSettingsSchema` và `FooterSettingsSchema`)
  - `packages/database/src/seed-settings.ts` (Cập nhật seed cấu hình menu & footer)
  - `apps/web/next.config.mjs` hoặc `middleware.ts` (Cấu hình 301 Redirects từ query cũ sang static route mới)
  - `apps/web/services/cars.service.ts` / `@cardealer/database` (Truy vấn danh sách xe theo phân khúc)
* **Locale và Timezone:** `vi-VN` / `Asia/Ho_Chi_Minh`

---

## 2. Ma trận Lát cắt Tính năng Dọc (Vertical Slices Matrix)

| ID | User Story / Luồng Nghiệp Vụ | Phạm vi Tầng | Tiêu chí Hoàn thành (Definition of Done) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **US-01** | **Chuẩn Hóa Dữ Liệu Menu & Navigation Data Contract** | Packages (Types & DB) | - `packages/types/src/settings.ts` cập nhật toàn bộ link submenu từ `/xe?kieuDang=Sedan/SUV/MPV` thành `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv`.<br/>- `seed-settings.ts` cập nhật dữ liệu seed navigation và footer tương ứng.<br/>- Đảm bảo Navbar & MobileDrawer hydrate đúng link tĩnh mới. | 🔄 IN PROGRESS |
| **US-02** | **Xây Dựng Dynamic Route Tĩnh `/dong-xe/[slug]` (RSC)** | Web (App Router & RSC) | - Tiếp nhận các slug chuẩn: `sedan`, `suv`, `mpv`.<br/>- Xử lý slug không hợp lệ bằng `notFound()` (404 chuẩn SEO).<br/>- Server Component nạp danh mục xe qua service `getCatalogCars()` và lọc in-memory theo phân khúc.<br/>- Render khối tiêu đề `<h1>` ngữ cảnh (VD: "Các Dòng Xe SUV Hyundai Chính Hãng") kèm đoạn mô tả phân khúc chuẩn SEO ~200 chữ.<br/>- Render lưới sản phẩm xe tái sử dụng Component CarCard/Catalog view. | ⏸️ QUEUED |
| **US-03** | **Cơ Chế 301 Redirects & Bảo Vệ PageRank** | Web (Next.js Config / Middleware) | - Bỏ qua ở giai đoạn Development (Sandbox) theo quyết định của Architect / Developer tại Step 2.1. | ⏭️ SKIPPED (Dev Env) |

---

## 3. Điểm Chốt Biên và Rủi ro Nghiệp vụ (Edge Cases)

* **Kịch bản Biên (Edge Cases):**
  - **Slug không hợp lệ:** Người dùng truy cập `/dong-xe/xe-dua` hoặc `/dong-xe/abc` ➡️ Kích hoạt `notFound()` trả mã HTTP 404 để Googlebot không index nội dung rác (Soft 404).
  - **Phân khúc chưa có xe trong DB:** Render Empty State sang trọng, nút liên hệ tư vấn Hotline showroom thay vì trang trắng hoặc vỡ layout.
  - **Case-Insensitive Slugs:** Người dùng truy cập `/dong-xe/SUV` hoặc `/dong-xe/Sedan` ➡️ Chuẩn hóa chữ thường (lowercase) tránh trùng lặp nội dung.
  - **DB Settings Persistence:** Dữ liệu settings đã lưu trong database `system_settings` từ trước cần được đồng bộ cập nhật để không bị override bởi cache settings cũ.
* **Ràng buộc An toàn:**
  - Vì môi trường đang là **Sandbox**, việc re-seed hoặc cập nhật DB settings có thể thực hiện an toàn mà không sợ mất mát dữ liệu khách hàng.
  - Không phá vỡ chức năng lọc linh hoạt tại trang `/xe` (trang `/xe` vẫn giữ bộ lọc filter tags client-side nếu người dùng muốn tìm kiếm nâng cao).

---

## 4. Định hướng Kích hoạt Skills cho Phase Kế tiếp

* **Phase 2 (Adaptive Architecture Design):**
  - `@system-analyst-architect`: So sánh phương án truy vấn dữ liệu Server Component (Direct Drizzle DB client vs Service HTTP API) kèm bảng trade-offs trong `SOLUTION_OPTIONS.md`.
  - `@logic-flow-ba`: Thiết kế State Machine & Sequence Diagram cho luồng phân giải slug, fallback 404 và 301 Redirect trong `FLOW.md`.
  - `@db-schema-architect`: Rà soát schema mapping giữa `car.segment` / `car.kieuDang` và slug tĩnh trong `SCHEMA.md`.
  - `@feature-spec-generator`: Đặc tả DTO, Metadata Schema và JSON-LD BreadcrumbsList / CollectionPage trong `API_SPEC.md`.
  - `@tailwind-ui-designer`: Thiết kế Layout khối Header 200 chữ SEO, Component Hierarchy và 4 trạng thái (Loading, Empty, Error, Success) trong `FE_INTEGRATION_GUIDE.md`.
