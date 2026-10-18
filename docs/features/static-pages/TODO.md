# 📝 TODO: Static Pages CMS & Showroom System Settings

- [x] **US-01: Static Pages CMS**
  - [x] Thiết kế bảng `static_pages` trong `packages/database/src/schema/static-pages.ts`.
  - [x] Định nghĩa Zod schemas trong `packages/types/src/static-page.ts`.
  - [x] Viết REST API routes trong `apps/api/src/routes/pages.ts` và `apps/api/src/routes/admin/pages.ts`.
  - [x] Tích hợp bộ sinh Schema JSON-LD `generateStaticPageJsonLd` trong `packages/core/src/seo/static-page-json-ld.ts`.
  - [x] Xây dựng dynamic route `/[slug]` trên Storefront `apps/web/app/(main)/[slug]/page.tsx`.

- [x] **US-02: Showroom Settings**
  - [x] Thiết kế bảng `system_settings` trong `packages/database/src/schema/system_settings.ts`.
  - [x] Định nghĩa ContactSettings Zod schema trong `packages/types/src/settings.ts`.
  - [x] Xây dựng trang quản lý cài đặt Showroom trong `apps/admin/app/settings/page.tsx`.
  - [x] Tích hợp Hotline & Zalo vào `FloatingSeller.tsx` và Footer trên Storefront.
