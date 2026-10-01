# 🧠 Antigravity Long-Term System Memory & Architectural Invariants

Tài liệu này lưu trữ các quy tắc bất biến (Invariants), quyết định kiến trúc nền tảng và các mẫu phòng thủ cốt lõi của Monorepo `CarDealer`. Các tác nhân AI và lập trình viên phải tuyệt đối tuân thủ khi phát triển tính năng mới.

---

## 1. Môi Trường & Công Cụ Runtime
- **Node.js:** Bắt buộc `>= v24` (Khuyến nghị `v24.21.0` qua `.nvmrc`).
- **Package Manager:** `pnpm@10.5.2` kết hợp `Turborepo`.
- **Lệnh kiểm tra kiểu toàn diện:** `turbo run check-types` (hoặc `pnpm --filter [pkg] check-types`).
- **Sandbox Test Cache:** Luôn set `TMPDIR` về thư mục cục bộ của workspace (`node_modules/.cache/tmp`) khi chạy Vitest trong môi trường sandbox macOS.

---

## 2. Next.js 15 App Router & Server Components (RSC)
- **Async Dynamic Route Params Invariant:**
  - `params` trong `PageProps` và `generateMetadata` là một `Promise<{ slug: string }>`.
  - Luôn khai báo kiểu `params: Promise<{ [key: string]: string }>` và bắt buộc `await params` trước khi truy cập properties.
- **Client Navigation Active Matching:**
  - Không bao giờ dùng `window.location` để lấy URL trên Client Component (nguy cơ Hydration Mismatch).
  - Luôn dùng hook chính thức `usePathname()` từ `next/navigation`.

---

## 3. Bảo Mật & Routing Kiến Trúc SEO (Zero Soft-404 & Anti-XSS)
- **Segment Whitelist Registry (SSOT):**
  - Mọi dynamic segment/landing page route (ví dụ `/dong-xe/[slug]`) bắt buộc quản lý whitelist tập trung qua `VALID_SEGMENT_SLUGS` trong `config/segments.ts`.
  - Nếu slug không nằm trong whitelist, bắt buộc gọi hàm `notFound()` của Next.js ngay đầu component/metadata để trả về HTTP status 404 thực thụ, loại bỏ nguy cơ Soft-404 làm tụt hạng SEO và ngăn chặn triệt để XSS qua route params.
- **Data Caching & In-Memory Filter:**
  - Tận dụng hàm `getCatalogCars()` vốn đã được lưu đệm trong Data Cache với tag `'catalog-cars'` (ISR 60s).
  - Lọc phân khúc in-memory bằng hàm thuần túy (pure function) với Set lookup O(1) và linear scan O(N), không mutate mảng gốc và không mở thêm connection query DB riêng lẻ.

---

## 4. Dữ Liệu Có Cấu Trúc (JSON-LD Schemas)
- Khi xây dựng Landing Page danh mục hoặc phân khúc xe, bắt buộc bơm đồng thời:
  1. `BreadcrumbList`: Định vị cây điều hướng phân cấp chuẩn Googlebot.
  2. `ItemList`: Danh sách sản phẩm xe chứa `AggregateOffer` (giá thấp nhất, giá cao nhất, số phiên bản) tối ưu hiển thị rich snippets trên Google Search và Google Merchant Center.

---

## 5. Dữ Liệu Hạt Giống Hệ Thống (Seed Settings)
- Bảng `system_settings` lưu trữ 7 Domain Keys cấu hình động theo Zod Schemas từ `@cardealer/types`.
- Hàm `seedSystemSettings()` trong `@cardealer/database` luôn gọi `parse({})` từ `@cardealer/types` và sử dụng `onConflictDoNothing()` để không ghi đè cấu hình đã được người dùng tùy chỉnh.
