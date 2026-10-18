# 📜 Execution Log & Function-Level Roadmap: Trang Chi Tiết Dòng Xe (`/xe/[carSlug]`)

> **Mã Epic:** `EPIC-PHASE-4.4-CAR-DETAIL-EXPERIENCE`  
> **Giai đoạn:** Giai đoạn 4: Thực Thi Code & Verification Cuốn Chiếu (Implementation & Verification)  
> **Role phụ trách:** `fullstack-dev-executor` (kết hợp `tailwind-ui-designer`, `qa-test-engineer`)  
> **Quy tắc thực thi:** Step-Gate Policy (Thực thi từng file ➔ Kiểm chứng ➔ Báo cáo tiến độ)

---

## 🗺️ DETAILED EXECUTION ROADMAP & FUNCTION-LEVEL DEPENDENCY SEQUENCE

### 🔹 SLICE 1 (US-01): Core Data Contract, API Endpoint & Comprehensive SEO Schema Engine
* **Tóm tắt Mục tiêu:** Thiết lập nền tảng kiểu dữ liệu type-safe `CarDetail`, chuẩn hóa API response phẳng `colors` cho `GET /api/cars/:slug`, mở rộng hàm sinh SEO JSON-LD đa tầng (`Product`, `Car`, `Person` Consultant, `Warranty`, `ReturnPolicy`) và Service Client `getCarBySlug(slug)` tại Web.

#### 🔗 Dependency Chain & Function Breakdown:

##### 📄 File 1: `packages/types/src/car.ts` (Sửa đổi)
* 💡 **Lý do làm trước:** Định nghĩa Source of Truth cho các DTOs và Zod Schemas để Backend và Frontend cùng sử dụng, đảm bảo type-safety 100%.
* 🛠 **Danh sách Functions / Schemas cần viết:**
  * Bổ sung `slug: z.string()` vào `VersionColorSchema` & `VersionColor`.
  * Khởi tạo `CarDetailVersionSchema` & `CarDetailVersion` (kế thừa đầy đủ `specGroups`, `boSuuTapAnh`, `colors`).
  * Khởi tạo `CarDetailSchema` & `CarDetail` (bổ sung `minPrice`, `maxPrice`, `versions`).

##### 📄 File 2: `apps/api/src/routes/catalog.ts` (Sửa đổi)
* 💡 **Lý do làm thứ hai:** Backend Endpoint cung cấp dữ liệu cho Web Client.
* 🛠 **Danh sách Logic & Endpoint cần viết:**
  * Tại route `GET /api/cars/:slug`:
    * Làm phẳng mảng `versionColors` thành `colors: VersionColor[]` có slug tiếng Việt không dấu.
    * Sắp xếp `versions` theo `sortOrder`, sắp xếp `colors` đưa `isDefault = true` lên đầu.
    * Tính toán `minPrice`, `maxPrice`.
    * Validate dữ liệu bằng `CarDetailSchema` trước khi `sendJson(200, ...)`.

##### 📄 File 3: `packages/core/src/seo/json-ld.ts` (Sửa đổi)
* 💡 **Lý do làm thứ ba:** Xây dựng cỗ máy sinh Structured Data Google Rich Results đáp ứng 100% tiêu chuẩn Google Merchant Center và Local SEO cho Saler.
* 🛠 **Danh sách Functions cần viết:**
  * Nâng cấp `generateCarJsonLd(car: CarDetail, siteUrl: string, consultant?: ConsultantInfo)`:
    * Nhúng `Product` & `Car` với `AggregateOffer` (`lowPrice`, `highPrice`, `offerCount`).
    * Nhúng `hasMerchantReturnPolicy` (Chính sách 7 ngày tại showroom).
    * Nhúng `warranty` (Bảo hành 5 năm / 100.000 km).
    * Nhúng `Person` Consultant (Chuyên viên tư vấn ô tô, hotline, showroom).
    * Nhúng `BreadcrumbList` (Trang chủ ➡️ Bảng giá xe ➡️ Tên dòng xe).

##### 📄 File 4: `apps/web/services/cars.service.ts` (Sửa đổi)
* 💡 **Lý do làm thứ tư:** Cầu nối dữ liệu giữa Web Client / RSC và Backend API.
* 🛠 **Danh sách Methods cần viết:**
  * `carsService.getCarBySlug(slug: string): Promise<CarDetail | null>`:
    * Gọi `apiClient.get<CarDetail>(`/api/cars/${slug}`, undefined, { next: { tags: ['car-detail', `car-${slug}`], revalidate: 60 } })`.
    * Xử lý try-catch an toàn, trả về `null` khi 404.

---

### 🔹 SLICE 2 (US-02): Interactive Car Hero, Tactile Color Swatches & 2-Way Deep Linking Engine
* **Tóm tắt Mục tiêu:** Xây dựng cỗ máy tương tác chọn màu sơn thực tế, đổi phiên bản, nạp trước ảnh vào RAM cache và đồng bộ 2 chiều URL Query không reload trang.
* **Danh sách Files:**
  * File 5: `apps/web/app/xe/[carSlug]/hooks/use-image-preloader.ts`
  * File 6: `apps/web/app/xe/[carSlug]/hooks/use-car-detail-url-sync.ts`
  * File 7: `apps/web/app/xe/[carSlug]/components/CarHeroExperience.tsx`
  * File 8: `apps/web/app/xe/[carSlug]/components/ColorSwatches.tsx`
  * File 9: `apps/web/app/xe/[carSlug]/components/VersionSelector.tsx`
  * File 10: `apps/web/app/xe/[carSlug]/components/SalerQuickShareBar.tsx`

---

### 🔹 SLICE 3 (US-03): Dynamic Specs Table with Highlight Differences, Media Gallery Lightbox & Sticky TOC
* **Tóm tắt Mục tiêu:** Xây dựng bảng thông số phân nhóm kèm công tắc "Chỉ xem điểm khác biệt", thư viện ảnh showroom kèm Lightbox modal toàn màn hình và TOC cuộn mượt.
* **Danh sách Files:**
  * File 11: `apps/web/app/xe/[carSlug]/components/DynamicSpecsTable.tsx`
  * File 12: `apps/web/app/xe/[carSlug]/components/CarGalleryLightbox.tsx`
  * File 13: `apps/web/app/xe/[carSlug]/components/CarReviewWithTOC.tsx`

---

### 🔹 SLICE 4 (US-04): Personal Consultant Hero Badge, Smart Zalo Deep Link, Sticky Bar & Verification
* **Tóm tắt Mục tiêu:** Tích hợp thương hiệu cá nhân của Saler, cỗ máy Smart Zalo Deep Link tự soạn tin nhắn, thanh chốt đơn dính đáy và lắp ráp hoàn chỉnh Server Page.
* **Danh sách Files:**
  * File 14: `apps/web/lib/zalo.ts`
  * File 15: `apps/web/app/xe/[carSlug]/components/ConsultantTrustCard.tsx`
  * File 16: `apps/web/app/xe/[carSlug]/components/QuickLoanTeaser.tsx`
  * File 17: `apps/web/app/xe/[carSlug]/components/ProductStickyBar.tsx`
  * File 18: `apps/web/app/xe/[carSlug]/components/CarDetailSkeleton.tsx`
  * File 19: `apps/web/app/xe/[carSlug]/components/CarDetailErrorState.tsx`
  * File 20: `apps/web/app/xe/[carSlug]/components/CarDetailView.tsx`
  * File 21: `apps/web/app/xe/[carSlug]/page.tsx`

---

## 🏁 KẾT QUẢ THỰC THI & KIỂM CHỨNG CUỐN CHIẾU (DOD VERIFICATION RESULTS)

| Slice | Phạm Vi & Mục Tiêu | Trạng Thái | Kết Quả Kiểm Thử (DoD) |
| :---: | :--- | :---: | :--- |
| **Slice 1 (US-01)** | Core Data Contract, API Endpoint & Multi-tier Schema Engine | ✅ HOÀN THÀNH | `pnpm --filter @cardealer/core test` pass 8/8 suites, 48/48 tests; `pnpm check-types` pass 0 error. |
| **Slice 2 (US-02)** | Interactive Car Hero, Tactile Swatches & 2-Way Deep Linking | ✅ HOÀN THÀNH | `useCarDetailUrlSync` & `useImagePreloader` đồng bộ URL không reload; `pnpm check-types` pass 100%. |
| **Slice 3 (US-03)** | Dynamic Specs Table, Media Gallery Lightbox & Sticky TOC | ✅ HOÀN THÀNH | Bảng specs lọc điểm khác biệt, Lightbox modal phím Esc/Next/Prev; `pnpm check-types` pass 100%. |
| **Slice 4 (US-04)** | Personal Consultant Badge, Smart Zalo, Sticky Bar & Page RSC | ✅ HOÀN THÀNH | `next build` xuất bản thành công route `/xe/[carSlug]` (Dynamic ISR 60s); `pnpm check-types` pass toàn bộ 11 packages monorepo. Đồng bộ trực tiếp 100% cấu hình Chuyên Viên Nổi (`settings.floatingSeller`) từ Admin `/settings` (Tên, SĐT, Zalo, Avatar, Trạng thái) loại bỏ triệt để mọi logic đoán mò hoặc fallback chuỗi tĩnh. |

