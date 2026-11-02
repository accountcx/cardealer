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

- [x] **US-03: Performance Optimization & Core Web Vitals**
  - [x] **U-01:** Xây dựng helper `optimizeCloudinaryUrl` trong `@cardealer/core/src/media/cloudinary.ts` hỗ trợ biến đổi tự động `f_auto,q_auto,w_...,c_fill`.
  - [x] **U-02:** Tối ưu hóa ảnh trong `DeliveryStoriesSection.tsx`, `CarShowcaseCard.tsx` và `HeroEventBanner.tsx` sử dụng `next/image` và Cloudinary optimized URL.
  - [x] **U-03:** Cài đặt Facade Pattern cho Google Maps trong `Footer.tsx` (hiển thị thẻ xem trước bản đồ + nút kích hoạt iframe theo yêu cầu hoặc IntersectionObserver).
  - [x] **U-04:** Chuyển đổi toàn bộ Third-Party Tracking Scripts trong `apps/web/app/layout.tsx` (GTM, GA4, Clarity, Pixels) sang chiến lược `strategy="lazyOnload"`.
  - [x] **U-05:** Cố định aspect ratio và min-height cho các phần tử trên trang chủ để triệt tiêu CLS < 0.05.
  - [x] **U-06:** Viết bộ Unit test cho helper `optimizeCloudinaryUrl`, kiểm tra types monorepo và build production.
