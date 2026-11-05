# 📝 TODO: SEO Optimization & Organic Growth Engine

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Bản đặc tả:** [BACKLOG.md](./BACKLOG.md)  
> **Hướng dẫn:** Đánh dấu `[x]` khi hoàn thành một đầu việc. Mỗi lát cắt dọc cần được kiểm tra kỹ lưỡng trước khi chuyển sang lát cắt tiếp theo.

---

## 🎯 Giai Đoạn 1: Sửa Lỗi Kỹ Thuật Nền Tảng (P0 - Quick Wins)

### [x] US-01: Chuẩn Hóa Canonical & Khắc Phục Sitemap Redirects
- [x] Bổ sung `alternates: { canonical: '/gia-lan-banh' }` trong `apps/web/app/gia-lan-banh/page.tsx`.
- [x] Tái cấu trúc `apps/web/app/tra-gop`:
  - [x] Hoặc chuyển thành Server Component Page độc lập có Canonical riêng `/tra-gop`.
  - [x] Hoặc đổi `apps/web/app/tra-gop/route.ts` sang 301 Permanent Redirect và loại bỏ `${baseUrl}/tra-gop` khỏi `apps/web/app/sitemap.ts`.
- [x] Kiểm tra lại `sitemap.xml` đảm bảo 100% link trả về HTTP 200.

### [x] US-02: Khắc Phục Tài Nguyên Social Image & SERP Mobile Icons
- [x] Tạo file ảnh thật nhị phân `apps/web/public/images/og-image.jpg` (1200x630 JPEG/PNG, không dùng SVG giả đuôi jpg).
- [x] Bổ sung các file ảnh OG còn thiếu trong `apps/web/public/images/`:
  - [x] `og-sedan.webp`
  - [x] `og-suv.webp`
  - [x] `og-mpv.webp`
  - [x] `og-catalog.webp`
- [x] Bổ sung bộ nhận diện SERP trong `apps/web/public/`:
  - [x] `favicon.ico`
  - [x] `apple-touch-icon.png`
  - [x] `manifest.webmanifest`

### [x] US-03: Bảo Vệ Cấu Trúc Heading H1 Toàn Cục
- [x] Cập nhật `apps/web/app/page.tsx` hoặc `apps/web/components/home/HeroEventBanner.tsx`:
  - [x] Thêm thẻ fallback `<h1>` chuẩn SEO đại diện cho Showroom khi `config.enabled = false`.
  - [x] Kiểm tra đảm bảo không bao giờ xảy ra tình trạng trang chủ thiếu thẻ H1.

---

## ⚡ Giai Đoạn 2: Tối Ưu Core Web Vitals & Cơ Chế Revalidation (P1)

### [x] US-04: Tối Ưu Core Web Vitals Trang Tin Tức (LCP & CLS)
- [x] Rà soát và thay thế toàn bộ thẻ `<img>` trong `apps/web/app/tin-tuc/page.tsx` sang `<Image>` Next.js.
- [x] Rà soát và thay thế toàn bộ thẻ `<img>` trong `apps/web/app/tin-tuc/[slug]/page.tsx` sang `<Image>` Next.js.
- [x] Cấu hình thuộc tính `sizes`, `priority` cho bài viết Hero đầu tiên và ảnh đại diện bài viết.
- [x] Chạy đo kiểm tra điểm PageSpeed trên môi trường local/staging.

### [x] US-05: On-Demand Cache Revalidation & RSS Feed
- [x] Tạo route `apps/web/app/api/revalidate/route.ts` hỗ trợ revalidate theo tag/path kèm secret token.
- [x] Tạo route `apps/web/app/feed.xml/route.ts` xuất bản RSS Feed 20 bài viết mới nhất.
- [x] Kiểm tra cấu hình `robots.ts` cho phép bot đọc file `feed.xml`.

---

## 📈 Giai Đoạn 3: Mở Rộng Phân Khúc & Programmatic SEO (P2)

### [x] US-06: Mở Rộng Landing Page Phân Khúc (Hatchback & Xe Điện)
- [x] Cập nhật `apps/web/config/segments.ts`:
  - [x] Thêm phân khúc `hatchback` (ánh xạ dòng xe Grand i10).
  - [x] Thêm phân khúc `xe-dien` (ánh xạ dòng xe Ioniq 5).
  - [x] Viết đoạn văn giới thiệu E-E-A-T chuẩn SEO cho 2 phân khúc này.
- [x] Kiểm tra render tại `/dong-xe/hatchback` và `/dong-xe/xe-dien`.
- [x] Kiểm tra sự xuất hiện tự động trong `sitemap.xml`.

### [x] US-07: Programmatic Landing Pages Dự Toán Lăn Bánh Theo Mẫu Xe
- [x] Tạo dynamic route `apps/web/app/gia-lan-banh/[carSlug]/page.tsx`.
- [x] Tự động chiết tính giá lăn bánh theo dòng xe và hiển thị bảng phiên bản chi tiết.
- [x] Tích hợp Schema `WebApplication` + `Product` + `FAQPage` cho từng mẫu xe.
- [x] Thêm các link dẫn vào Sitemap và liên kết nội bộ từ trang chi tiết xe `/xe/[carSlug]`.

---

## 📍 Giai Đoạn 4: Local Authority & Đánh Giá Khách Hàng (P2)

### [x] US-08: Thống Trị Local SEO, Đánh Giá Thực Tế & Schema E-E-A-T
- [x] Tích hợp `Review` và `AggregateRating` Schema vào phân khu Bàn giao xe `DeliveryStoriesSection.tsx`.
- [x] Kiểm tra và đồng bộ bộ ba NAP (Name - Address - Phone) trên Footer và Schema `AutoDealerJsonLd.tsx`.
- [x] Kiểm tra tính hợp lệ qua công cụ Google Rich Results Test.
