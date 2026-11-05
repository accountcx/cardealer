# 🛡️ BIÊN BẢN KIỂM ĐỊNH GATE 2: TECHNICAL DESIGN PENTAGON - LIVING SPEC

- **Module:** `seo-optimization`
- **Phiên bản:** `v1.0.0`
- **Ngày thực hiện:** 05/11/2026
- **Trọng tài kiểm định:** Independent Multi-Gate Adversarial Auditor (Fresh Eyes Context)
- **Chế độ kiểm tra:** AUTO-PILOT MODE (/goal)
- **Trạng thái:** 🟢 PASSED

---

## 1. Kết Quả Chạy Trọng Tài Máy (Deterministic Machine Guard)
- **Lệnh thực thi:** `bash scripts/spec_guard.sh docs/features/seo-optimization --gate 2`
- **Exit Code:** `0` (SUCCESS)
- **Kết quả chi tiết:**
  - `[0/5] Module Identity & Anti-Fragmentation`: Đạt chuẩn `kebab-case`, không phân mảnh thư mục cha (`docs/features/seo-optimization`).
  - `[1/5] Zero-Mutation Invariant`: Bảo đảm 100% không có file mã nguồn/cấu hình/test nào bị can thiệp trong Phase 2.
  - `[Hard-Lock Gate Check]`: Đã tìm thấy biên bản hợp lệ của Gate 1 (`AUDIT_GATE_1.md`) với trạng thái `PASSED`.

---

## 2. Thẩm Định Chi Tiết Bộ Ngũ Thiết Kế Kỹ Thuật (Technical Design Pentagon)

### 2.1. SOLUTION_OPTIONS.md (Trade-offs & Kiến Trúc)
- Đánh giá toàn diện 4 bài toán kiến trúc cốt lõi:
  1. **URL `/tra-gop` & Sitemap Canonical Alignment:** Phân tích Option A (301 redirect gỡ khỏi sitemap) vs Option B (Server Component Landing Page `/tra-gop` độc lập). Chọn Option B để chiếm lĩnh chùm từ khóa mua xe trả góp có volume tìm kiếm cao tại Nghệ An - Hà Tĩnh.
  2. **Social Open Graph Images:** Phân tích Option A (ảnh tĩnh) vs Option B (Static True Binary 1200x630 + dynamic fallback). Chọn Option B để khắc phục triệt để lỗi file SVG giả mạo JPG và 404 OG images.
  3. **Cache Invalidation & Real-Time Sync:** Phân tích Option A (ISR 60s thụ động) vs Option B (Dual Mode: ISR 60s + Webhook `POST /api/revalidate` kèm RSS `feed.xml`). Chọn Option B đảm bảo bot cào dữ liệu mới nhất ngay khi CMS publish.
  4. **Programmatic SEO Cho Dự Toán Lăn Bánh:** Phân tích Option A (Query params `/gia-lan-banh?xe=...`) vs Option B (Dynamic Route `/gia-lan-banh/[carSlug]`). Chọn Option B tối ưu hóa 100% indexability cho từ khóa ngách từng dòng xe.

### 2.2. FLOW.md (Sequence Diagrams, State Machine & FMEA)
- **Sequence Diagram 1:** Mô hình hóa chính xác luồng thu thập dữ liệu của Googlebot, xử lý SSR Server Component, trích xuất dữ liệu xe từ cache và nhúng JSON-LD qua `@cardealer/core` (CLS = 0).
- **Sequence Diagram 2:** Mô hình hóa chi tiết cơ chế On-Demand Cache Invalidation giữa CMS Admin và Storefront thông qua `POST /api/revalidate` có Secret Token bảo mật.
- **State Machine Diagram:** Thiết kế máy trạng thái vòng đời URL và cơ chế Canonical Resolution (CheckExactMatch -> RedirectLookup -> RouteHandler -> CheckCanonical -> CleanCanonical -> StripQuery -> InjectCanonical -> Serve200).
- **Interaction Failure Matrix (FMEA):** Bao phủ 7 kịch bản thất bại tương tác quan trọng (Googlebot ↔ Sitemap, Admin ↔ Revalidate Webhook, Social Crawler ↔ OG Image, Người dùng ↔ Bộ lọc danh mục, Client ↔ Slug xe, Hero Banner ↔ H1, Crawler ↔ Thẻ ảnh tin tức) kèm cơ chế phòng vệ tự động.

### 2.3. SCHEMA.md (Segment Registry, JSON-LD & Canonical/Robots Matrix)
- **Mở rộng Segment Registry:** Đặc tả bổ sung chuẩn xác `hatchback` (Grand i10) và `xe-dien` (Ioniq 5) vào `SEGMENT_REGISTRY`, đầy đủ `kieuDangMapping`, `h1Title`, `metaTitle`, `metaDescription`, `ogImage` và đoạn giới thiệu chuẩn E-E-A-T.
- **Schema.org JSON-LD:** Đặc tả đồ thị đa tầng `@graph` cho dynamic route `/gia-lan-banh/[carSlug]` gồm `WebApplication`, `Product`, `AggregateOffer`, `AutoDealer` và `BreadcrumbList`.
- **Schema Review & AggregateRating:** Định nghĩa interface `DeliveryStoryReviewItem` và hàm sinh Schema `generateDeliveryStoriesJsonLd` tích hợp các câu chuyện giao xe thực tế thành sao vàng trên Google SERP.
- **Ma trận Canonical & Robots:** Khai báo tường minh cho toàn bộ 11 route patterns của Storefront, đảm bảo không có ngõ cụt index hoặc xung đột Canonical.

### 2.4. API_SPEC.md (Contracts, Status Codes & Payloads)
- **`POST /api/revalidate`:**
  - Headers xác thực `x-revalidate-secret` hoặc query parameter `?secret=...`.
  - Request body schema: `{ path?: string, tag?: string }`.
  - Contracts đầy đủ: 200 OK (xóa cache thành công), 401 Unauthorized (sai secret), 400 Bad Request (thiếu tham số).
- **`GET /feed.xml`:**
  - Chuẩn RSS 2.0 Feed XML với `application/xml; charset=utf-8` và Cache-Control header.
  - Cấu trúc đầy đủ các node `<channel>`, `<item>`, `<guid>`, `<atom:link>`.
- **`GET /gia-lan-banh/[carSlug]`:**
  - Dynamic Route contract với cơ chế kiểm tra `carsService.getCarBySlug()`, kích hoạt `notFound()` trả về HTTP 404 thực thể khi slug không tồn tại, và trả về SSR Server Component 200 OK khi hợp lệ.

### 2.5. FE_INTEGRATION_GUIDE.md (UI Architecture & Surface Safety)
- **Navigation Topology:** Cây điều hướng Storefront phân tầng từ Trang chủ, Danh mục xe, Chi tiết xe, Phân khúc, Dự toán lăn bánh, Trả góp, đến Hub tin tức.
- **Chuẩn hình ảnh Core Web Vitals:** Quy tắc 100% thay thế `<img>` bằng `<Image>` Next.js có `sizes`, `priority` cho LCP Hero, khung tỷ lệ cố định (`aspect-video`, `aspect-[16/10]`) và placeholder `bg-slate-100` triệt tiêu CLS layout shift.
- **Ma trận 4-State UI:** Đặc tả chi tiết 4 trạng thái giao diện (Loading, Empty, Error, Data) cho landing page `/gia-lan-banh/[carSlug]`.
- **SERP Identity & Favicons:** Đặc tả `favicon.ico`, `apple-touch-icon.png` và file `manifest.webmanifest`.
- **Chống lỗi giao diện:** 100% tuân thủ Named Export, không có class Tailwind hardcode arbitrary value sai spacing scale, không có class mồ côi `dark:text-*` gây lỗi tương phản nền.

---

## 3. Bằng Chứng Đối Soát Codebase Thực Tế (Grounding Audit)
- `apps/web/config/segments.ts`: Đã kiểm tra dòng 6 (`VALID_SEGMENT_SLUGS = ['sedan', 'suv', 'mpv'] as const`). Đặc tả mở rộng `hatchback` và `xe-dien` khớp 100% với cấu trúc hiện tại.
- `apps/web/app/sitemap.ts`: Dòng 49-53 khai báo `/tra-gop` với priority 0.8 trong khi `apps/web/app/tra-gop/route.ts` trả về mã 307 Redirect. Khẳng định phát hiện lỗi của thiết kế là chính xác tuyệt đối.
- `apps/web/app/gia-lan-banh/page.tsx`: Dòng 18-28 thiếu hoàn toàn `alternates.canonical`. Đặc tả bổ sung canonical độc lập là cần thiết và chính xác.
- `apps/web/public/images/og-image.jpg`: Là file text SVG kích thước 339 bytes, xác nhận cần tạo file ảnh nhị phân chuẩn JPEG/PNG.

---

## 4. Quét Chống Trốn Việc (Anti-Placeholder Audit)
- Không có bất kỳ placeholder nào (`TBD`, `TODO:`, `Updating later`, `Cập nhật sau`, `Coming soon`, `Will implement`) trong toàn bộ 5 tài liệu thiết kế của Phase 2.
- Toàn bộ payload, code snippet, interface TypeScript và sequence diagram đều ở trạng thái Final hoàn chỉnh.

---

## 5. Quyết Định Thông Quan
Hồ sơ Phase 2 (Technical Design Pentagon) của module `seo-optimization` hoàn toàn hợp lệ, nhất quán 100% với `BACKLOG.md` và `OVERVIEW.md`, thỏa mãn toàn bộ tiêu chí nghiêm ngặt của Gate 2. Đủ điều kiện để tiến hành Phase 3 (Risk Audit & Test Plan).
