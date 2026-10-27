# 📝 TODO: Catalog & Vehicle Specification Engine

- [x] **US-01: Admin Car Catalog Management**
  - [x] Thiết kế Drizzle schemas `cars`, `car_versions`, `colors`, `version_colors` trong `packages/database`.
  - [x] Định nghĩa DTOs và Zod schemas trong `packages/types/src/car.ts`.
  - [x] Xây dựng REST API CRUD trong `apps/api/src/routes/admin.ts` và `apps/api/src/routes/catalog.ts`.
  - [x] Giao diện Admin quản lý danh sách xe, thêm/sửa phiên bản trong `apps/admin/app/cars/`.
  - [x] Quản trị bảng màu xe trong `apps/admin/app/colors/`.

- [x] **US-02: Storefront Interactive Color Switcher**
  - [x] Trang danh mục xe `/xe` với bộ lọc phân khúc (Sedan, SUV, MPV, Hatchback, EV) trong `apps/web/app/xe/page.tsx`.
  - [x] Trang chi tiết dòng xe `/xe/[slug]` trong `apps/web/app/xe/[slug]/page.tsx`.
  - [x] Component đổi màu ngoại thất `ProductHero.tsx` đồng bộ URL query `?phien-ban=...&mau=...`.
  - [x] Tối ưu tải ảnh Next.js Image với priority và placeholder shimmer.

- [x] **US-03: Dynamic Technical Spec Matrix**
  - [x] Cấu trúc dữ liệu JSONB `specGroups` linh hoạt cho phiên bản xe.
  - [x] Giao diện hiển thị thông số kỹ thuật dạng bảng tabbed view trên Storefront.
  - [x] Bộ kiểm thử xác minh dữ liệu catalog trong `packages/core/src/__tests__/car-detail-schema.test.ts`.

- [x] **US-04: Google Schema Optimization (BreadcrumbList & ItemList) & Promotion Data Hygiene**
  - [x] **U-01:** Cập nhật `apps/web/components/layout/Breadcrumbs.tsx` chuẩn hóa tất cả `item` thành Absolute URL (`https://...`), loại bỏ relative path `/`, bổ sung `@id` cho BreadcrumbList.
  - [x] **U-02:** Cập nhật `packages/core/src/seo/json-ld.ts` (`generateCatalogJsonLd`) và `apps/web/app/dong-xe/[slug]/page.tsx` bổ sung top-level `@id` và `url` cho từng `Product`/`Car` trong `ItemList`.
  - [x] **U-03:** Viết hàm tiện ích làm sạch nội dung ghi chú/prompt trong ngoặc đơn (`cleanPromotionSummary` / `sanitizePromptNotes`) và áp dụng tại `packages/core/src/seo/json-ld.ts`, `apps/api/src/services/ai/response-transformer.ts`.
  - [x] **U-04:** Xây dựng script dọn dẹp cơ sở dữ liệu `packages/database/src/scripts/clean-promotion-summaries.ts` và thực thi làm sạch toàn bộ các dòng xe đang bị dính prompt notes trong PostgreSQL.
  - [x] **U-05:** Viết bộ test cases xác minh cấu trúc BreadcrumbList, ItemList và hàm làm sạch text trong `packages/core/src/__tests__/catalog-jsonld.test.ts`.
  - [x] **U-06:** Chạy kiểm thử toàn bộ `packages/core`, check types toàn monorepo và kiểm tra build production.
