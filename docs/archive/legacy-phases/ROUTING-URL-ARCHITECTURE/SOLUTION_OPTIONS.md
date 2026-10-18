# 🏛️ Phân Tích & Chốt Phương Án Kiến Trúc (Architecture Decision Record)

> **Feature:** Cấu Trúc Routing Tĩnh & Kiến Trúc Menu (URL Architecture) — `ROUTING-URL-ARCHITECTURE`  
> **Mục tiêu:** Xóa bỏ query params `/xe?kieuDang=...`, chuẩn hóa dynamic route tĩnh `/dong-xe/[slug]`, tối ưu SEO Googlebot, cấu trúc menu điều hướng.  
> **Môi trường:** 🟢 Pure Development (Sandbox)  
> **Trạng thái:** ✅ **ĐÃ PHÊ DUYỆT BỞI ARCHITECT / DEVELOPER** (2026-10-01)

---

## 1. Bối Cảnh & Vấn Đề (Context & Problem Statement)
- Hệ thống menu điều hướng cấp 2 ("Dòng Xe") và Footer hiện tại đang trỏ về dạng query URL: `/xe?kieuDang=Sedan`, `/xe?kieuDang=SUV`, `/xe?kieuDang=MPV`.
- **Hạn chế:**
  - Query URL không được Googlebot đánh giá là trang danh mục chuyên biệt cấp cao.
  - Không thể cấu hình thẻ `<title>`, `<meta description>`, `<h1>` ngữ cảnh riêng và đoạn văn giới thiệu E-E-A-T cho từng phân khúc (Sedan, SUV, MPV).
  - Trải nghiệm điều hướng thiếu nhất quán so với các tiêu chuẩn SEO e-commerce hiện đại.

---

## 2. Quyết Định Kiến Trúc 1: Nguồn Dữ Liệu Cho Server Component `/dong-xe/[slug]`

### Các Phương Án Đã Đánh Giá:
- **Option 1 (Direct DB Query via Drizzle ORM):** Server Component query trực tiếp Postgres.
  - *Nhược điểm:* Phá vỡ ranh giới Service, đòi hỏi `DATABASE_URL` trong Web container, không tận dụng cache ISR tag `catalog-cars`.
- **Option 2 (Typed Service Layer `getCatalogCars()` + In-Memory Filter) ⭐ [CHỌN]:**
  - Server Component gọi `getCatalogCars()` từ `@/services/cars.service`.
  - Tận dụng Next.js ISR Cache (`tags: ['catalog-cars'], revalidate: 60s`), đồng bộ 100% dữ liệu với trang `/xe`.
  - Khi Admin cập nhật xe hoặc giá xe, lệnh `revalidateTag('catalog-cars')` tự động làm mới đồng bộ cả trang `/xe` lẫn các trang `/dong-xe/[slug]`.
  - Quy mô showroom ô tô (10–30 mẫu xe) giúp việc lọc in-memory diễn ra tức thì (< 1ms).
- **Option 3 (Tạo Endpoint Mới `GET /api/cars?segment=:slug`):**
  - *Nhược điểm:* Tăng phân mảnh cache tags và phức tạp hóa việc invalidate cache.

👉 **Quyết định chốt:** **Lựa chọn Option 2** — Dùng `getCatalogCars()` và lọc in-memory theo phân khúc.

---

## 3. Quyết Định Kiến Trúc 2: Cơ Chế 301 Redirects Cho Query Cũ

### Các Phương Án Đã Đánh Giá:
- **Option A:** Cấu hình tĩnh trong `next.config.mjs`.
- **Option B:** Cấu hình động trong `middleware.ts`.
- **Option Không Triển Khai (Bỏ qua 301 Redirect) ⭐ [CHỌN]:**
  - Vì hệ thống đang ở môi trường **Pure Development (Sandbox)**, chưa có link cũ bị index ngoài production thực tế.
  - Việc bỏ qua tầng redirect giúp codebase giữ được độ tinh gọn tối đa, tránh thêm middleware overhead không cần thiết.
  - Người dùng truy cập menu trực tiếp từ link tĩnh mới 100%.

👉 **Quyết định chốt:** **Không triển khai 301 Redirect** — Tập trung vào chuẩn hóa data contract và dynamic route tĩnh.

---

## 4. Tóm Tắt Phạm Vi Thực Thi Sau Khi Chốt (Final Scope)

| Hạng mục | Quyết định kỹ thuật | Vị trí tác động |
| :--- | :--- | :--- |
| **Menu & Footer Data** | Link tĩnh chuẩn SEO (`/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv`) | `packages/types/src/settings.ts`, `packages/database/src/seed-settings.ts` |
| **Route Dynamic** | Server Component (RSC) nạp dữ liệu qua `getCatalogCars()` | `apps/web/app/dong-xe/[slug]/page.tsx` |
| **Validation Slug** | Whitelist: `sedan`, `suv`, `mpv`. Bất kỳ slug khác kích hoạt `notFound()` | `apps/web/app/dong-xe/[slug]/page.tsx` |
| **SEO Content** | `<h1>` ngữ cảnh riêng + đoạn giới thiệu E-E-A-T ~200 chữ + Meta Title/Desc chuyên biệt + JSON-LD Breadcrumbs | `apps/web/app/dong-xe/[slug]/page.tsx` |
| **301 Redirects** | **Bỏ qua** theo yêu cầu Developer | Không can thiệp middleware/next.config |
