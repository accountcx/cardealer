# 📜 Nhật Ký Thực Thi (EXECUTION LOG) — SEO Optimization Engine

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Trạng thái:** Phase 4 Execution (Tự Động Triển Khai)  
> **Mục tiêu:** Thực thi lần lượt từng Lát cắt Dọc (Vertical Slice) theo quy chuẩn Micro-Roadmap của `guard_unit.sh`.

---

## 1. Bảng Micro-Roadmap Chi Tiết

| Unit | File(s) | Risk | Mô tả thay đổi kỹ thuật |
| :--- | :--- | :---: | :--- |
| `U-01` | `apps/web/app/gia-lan-banh/page.tsx,apps/web/app/tra-gop/route.ts,apps/web/app/sitemap.ts` | `LOW` | Thêm thẻ canonical cho `/gia-lan-banh`, nâng cấp 301 Permanent Redirect cho `/tra-gop` và dọn sạch URL redirect khỏi `sitemap.ts`. |
| `U-02` | `apps/web/public/images/og-image.jpg,apps/web/public/images/og-sedan.webp,apps/web/public/images/og-suv.webp` | `LOW` | Cung cấp file OG Image JPEG/PNG nhị phân thật 1200x630px và bổ sung ảnh OG phân khúc còn thiếu. |
| `U-03` | `apps/web/public/favicon.ico,apps/web/public/apple-touch-icon.png,apps/web/public/manifest.webmanifest` | `LOW` | Bổ sung bộ nhận diện SERP favicon 32x32, apple-touch-icon 180x180 và manifest.webmanifest. |
| `U-04` | `apps/web/app/page.tsx,apps/web/components/home/HeroEventBanner.tsx` | `LOW` | Bổ sung fallback thẻ H1 chuẩn SEO đại diện cho Showroom khi Hero Banner bị tắt trong cấu hình CMS. |
| `U-05` | `apps/web/app/tin-tuc/page.tsx,apps/web/app/tin-tuc/[slug]/page.tsx` | `LOW` | Thay thế toàn bộ thẻ `<img>` thô sang component `<Image>` Next.js có responsive `sizes` và `priority` cho Hero LCP. |
| `U-06` | `apps/web/app/api/revalidate/route.ts,apps/web/app/feed.xml/route.ts` | `LOW` | Xây dựng API Webhook `POST /api/revalidate` bảo vệ bằng secret token và xuất bản RSS Feed `GET /feed.xml`. |
| `U-07` | `apps/web/config/segments.ts` | `LOW` | Mở rộng phân khúc `hatchback` (Grand i10) và `xe-dien` (Ioniq 5) kèm metadata SEO và đoạn giới thiệu E-E-A-T. |
| `U-08` | `apps/web/app/gia-lan-banh/[carSlug]/page.tsx` | `LOW` | Xây dựng dynamic landing page dự toán lăn bánh theo từng mẫu xe, tích hợp đa tầng Schema WebApplication + Product. |
| `U-09` | `apps/web/components/home/DeliveryStoriesSection.tsx` | `LOW` | Tích hợp Schema Review & AggregateRating từ các câu chuyện giao xe thực tế kích hoạt sao vàng SERP. |

---

## 2. Nhật Ký Tiến Độ Từng Đơn Vị (Progress Tracking)

* [x] `U-01`: Chuẩn hóa Canonical & Khắc phục Sitemap Redirects (Commit: `fc9da35`)
* [x] `U-02`: Tài nguyên Social Open Graph Images (Commit: `15cc99f`)
* [x] `U-03`: SERP Mobile Icons & Web Manifest (Commit: `21e4bf3`)
* [x] `U-04`: Bảo vệ cấu trúc Heading H1 Toàn Cục (Commit: `7eb1db2`)
* [x] `U-05`: Tối ưu Core Web Vitals Trang Tin Tức (LCP & CLS) (Commit: `7b66e44`)
* [x] `U-06`: On-Demand Cache Revalidation & RSS Feed (Commit: `13e4e3f`)
* [x] `U-07`: Mở rộng Phân khúc Xe (Hatchback & Xe Điện) (Commit: `8884b18`)
* [x] `U-08`: Programmatic Landing Page Dự toán lăn bánh theo mẫu xe (Commit: `b308557`)
* [x] `U-09`: Review Schema & Local SEO Showroom (Commit: `963344c`)
