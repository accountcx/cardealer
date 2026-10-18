# 📜 Execution Log: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (`/xe`)

## 1. Thông Tin Điều Phối
* **Mã Epic:** `EPIC-PHASE-4.3-CATALOG-FILTER`
* **Giai đoạn:** Giai đoạn 4: Thực thi Code & Nghiệm thu Kép (Implementation & Verification)
* **Quy chuẩn Thực thi:** Step-Gate Protocol (Chỉ tạo/sửa 1 file mỗi lượt, chạy type-check xác thực và chờ Developer duyệt trước khi qua file tiếp theo).
* **Tuân thủ Design System:** 100% sử dụng UI Primitives từ `@cardealer/ui` (`Button`, `Badge`, `Skeleton`) và Design Tokens từ `UI_SPEC.md`.

---

## 2. Pre-Coding Checklist (Kỷ Luật Trước Khi Triển Khai)
- [x] Đã đọc và thông quan Gate 1 (`BACKLOG.md`), Sub-Gate 2.1 (`SOLUTION_OPTIONS.md`), Gate 2 (`FLOW.md`, `SCHEMA.md`, `API_SPEC.md`, `UI_SPEC.md`, `FE_INTEGRATION_GUIDE.md`), Gate 3 (`RISK_AUDIT.md`, `TEST_PLAN.md`).
- [x] Ràng buộc kiến trúc: Option B (Hybrid RSC Preload + Client Island Instant Filter & History State Sync).
- [x] Cam kết Zero Breaking Changes: Hoàn toàn không sửa đổi DB schema, không xóa hay đổi tên các thuộc tính API hiện hữu.
- [x] Kỷ luật 100% Named Exports cho toàn bộ components và hooks.
- [x] Bắt buộc có chú thích `// 🧠 Mental Model: ...` ở đầu mỗi hàm / component nghiệp vụ.

---

## 3. Lộ Trình Thực Thi Chi Tiết (Function-Level Execution Roadmap)

| File # | Đường Dẫn File | Thao Tác | Mục Tiêu Kỹ Thuật & Danh Sách Functions/Components | Trạng Thái |
| :---: | :--- | :---: | :--- | :---: |
| **File 1** | `packages/types/src/car.ts` | Sửa | Bổ sung `CatalogSegment`, `PriceRangeId`, `PriceRangeOption`, `CATALOG_PRICE_RANGES`, `CarCatalogItem`, `CatalogFilterState`. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 2** | `packages/core/src/seo/json-ld.ts` | Sửa | Thêm hàm `generateCatalogJsonLd(cars, siteUrl)` sinh cấu trúc `ItemList` + `AggregateOffer`. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 3** | `packages/core/src/index.ts` | Sửa | Re-export hàm `generateCatalogJsonLd` (đã có sẵn `export *`). Thêm unit test vitest. | ✅ HOÀN THÀNH (`exit 0`, 45/45 tests pass) |
| **File 4** | `apps/api/src/routes/catalog.ts` | Sửa | Bổ sung `fuelType` và `seatRange` vào response của `GET /api/cars`. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 5** | `apps/web/services/cars.service.ts` | Sửa | Thêm hàm `getCatalogCars()` trả về danh sách `CarCatalogItem[]` đầy đủ trường. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 6** | `apps/web/app/xe/components/useCatalogFilters.ts` | Tạo mới | Custom hook xử lý lọc in-memory `< 5ms`, đọc URL searchParams (hỗ trợ `segment`, `kieuDang`, `price`), đồng bộ ngầm `history.replaceState`. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 7** | `apps/web/app/xe/components/CatalogFilterBar.tsx` | Tạo mới | Component Bộ lọc: Đưa Mốc ngân sách lên đầu (tư duy người mua) và Tabs phân khúc theo sau, dùng `@cardealer/ui` `Button`. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 8** | `apps/web/app/xe/components/CatalogEmptyState.tsx` | Tạo mới | Component Empty State khi không có xe phù hợp kèm nút reset (dùng `@cardealer/ui` `Button`). | ✅ HOÀN THÀNH (`exit 0`) |
| **File 9** | `apps/web/app/xe/components/SmartCarCard.tsx` | Tạo mới | Component Thẻ xe showroom thông minh: tỷ lệ 16:10, specs pills, giá, trả trước, 2 nút CTA. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 10** | `apps/web/app/xe/components/CatalogGrid.tsx` | Tạo mới | Component Lưới xe responsive kết nối `SmartCarCard` và `CatalogEmptyState`. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 11** | `apps/web/app/xe/components/CatalogView.tsx` | Tạo mới | Client Island trung tâm điều phối `useCatalogFilters`, `CatalogFilterBar` và `CatalogGrid`. | ✅ HOÀN THÀNH (`exit 0`) |
| **File 12** | `apps/web/app/xe/page.tsx` | Tạo mới | Server Component RSC: Nạp data qua `carsService`, Breadcrumbs, SEO Metadata, Schema `ItemList`. | ✅ HOÀN THÀNH (`exit 0`) |

---

## 4. Nhật Ký Chi Tiết Từng Bước (Step-by-Step Execution Log)

### File 9: `apps/web/app/xe/components/SmartCarCard.tsx`
- **Thao tác:** Tạo mới & chuẩn hóa UI Design System theo `tailwind-ui-designer.md`.
- **Chi tiết kỹ thuật:**
  - Tỷ lệ ảnh xe showroom chuẩn 16:10 (`aspect-[16/10]`) với zoom nhẹ mượt mà khi hover (`group-hover:scale-105 motion-reduce:transform-none`).
  - Sử dụng UI Primitive `Badge` từ `@cardealer/ui` cho nhãn phân khúc xe (`car.segment`).
  - Khối Specs Pills gồm 3 thông số then chốt: Chỗ ngồi (`Users`), Loại nhiên liệu (`Fuel`), Số phiên bản (`Layers`).
  - Khối giá niêm yết linh hoạt (đơn giá hoặc khoảng min-max) và huy hiệu đòn bẩy trả trước tối thiểu (`traTruocTu`).
  - Hành động kép (Dual CTA) chuẩn hóa với `Button asChild` từ `@cardealer/ui`, chuẩn hóa Touch Target `h-11` (44px) và hiệu ứng phát sáng `glow` trên nút "Lăn Bánh".
  - Bổ sung `SmartCarCardSkeleton` bằng UI Primitive `Skeleton` từ `@cardealer/ui` đảm bảo nguyên tắc Loading State, triệt tiêu CLS.
  - Tuân thủ 100% Named Export, WCAG AAA Reduced Motion và focus ring bàn phím.
- **Xác thực:** `check-types` exit code 0.

### File 10: `apps/web/app/xe/components/CatalogGrid.tsx`
- **Thao tác:** Tạo mới & hoàn thiện 4-State UI pattern.
- **Chi tiết kỹ thuật:**
  - Layout Grid đáp ứng: 1 cột (Mobile), 2 cột (Tablet), 3 cột (Desktop lớn) với gap chuẩn `gap-6 sm:gap-8`.
  - Hỗ trợ prop `isLoading?: boolean` và xuất bản `CatalogGridSkeleton` render 6 khung thẻ xe `SmartCarCardSkeleton`.
  - Tự động chuyển đổi mượt mà sang `CatalogEmptyState` khi số xe lọc bằng 0.
  - 100% Named Export.
- **Xác thực:** `check-types` exit code 0.

### File 11: `apps/web/app/xe/components/CatalogView.tsx`
- **Thao tác:** Tạo mới & tích hợp Client Island.
- **Chi tiết kỹ thuật:**
  - Kết nối hook `useCatalogFilters` (lọc in-memory < 5ms + đồng bộ ngầm URL `window.history.replaceState`).
  - Điều phối trạng thái giữa `CatalogFilterBar` và `CatalogGrid`.
  - Tích hợp `CatalogErrorState` hoàn thiện quy chuẩn 4-State UI (`Loading`, `Empty`, `Error`, `Success/Data`) kèm nút Thử lại (`Button` từ `@cardealer/ui`) và gọi hotline.
  - 100% Named Export.
- **Xác thực:** `check-types` exit code 0.

### File 12: `apps/web/app/xe/page.tsx`
- **Thao tác:** Tạo mới Server Component (RSC).
- **Chi tiết kỹ thuật:**
  - Tích hợp Next.js ISR với `revalidate = 60` giây.
  - `generateMetadata()` sinh tiêu đề, mô tả phong phú và cố định thẻ canonical `/xe` chống phạt duplicate content SEO.
  - Nhúng Schema JSON-LD `ItemList` + `AggregateOffer` trực tiếp vào HTML cho Googlebot Merchant Indexing.
  - Sử dụng hàm tập trung `getSiteUrl()` từ `@cardealer/env`, loại bỏ 100% việc đọc `process.env.NEXT_PUBLIC_SITE_URL` trực tiếp (Invariant 13).
  - Nạp dữ liệu đồng thời qua `Promise.all([getCatalogCars(), getStorefrontSettings()])`.
  - Bọc try-catch phòng thủ để chuyển mượt sang Error State trên Client Island nếu có sự cố mạng.
  - Tích hợp thanh `Breadcrumbs` chuẩn cấu trúc `Trang chủ > Bảng giá dòng xe`.
- **Xác thực:** `check-types` exit code 0 across monorepo.

### 🌟 Refactor Tối Ưu Hóa Bổ Sung: Centralized Environment & URL Constants (`@cardealer/env`)
- **Tệp sửa đổi:** [`packages/env/src/index.ts`](file:///Users/nhatphan/Code/CarDealer/cardealer/packages/env/src/index.ts) & [`apps/web/lib/api-client.ts`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/web/lib/api-client.ts)
- **Chi tiết kỹ thuật:**
  - Bổ sung các hằng số dùng chung: `DEFAULT_SITE_URL`, `DEFAULT_DEV_SITE_URL`, `DEFAULT_API_URL`.
  - Thêm thuộc tính `INTERNAL_API_URL` vào schema xác thực server `serverEnvSchema`.
  - Xuất bản hàm `getServerApiUrl()` phục vụ Server-side (SSR / ISR / Docker internal network), tái cấu trúc `HttpClient.resolveBaseUrl()` trong `api-client.ts` để triệt tiêu việc gọi trực tiếp `process.env.INTERNAL_API_URL`.
  - Xuất bản hàm `getSiteUrl()` phục vụ SEO và JSON-LD Schema trong Storefront.
- **Xác thực:** Monorepo `check-types` exit 0, Core Vitest 45/45 tests pass.

### 📱 Nâng Cấp Trải Nghiệm Mobile: Adaptive Dual-Mode Filter & Bottom Sheet Drawer
- **Tệp sửa đổi:** [`apps/web/app/xe/components/CatalogFilterBar.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/web/app/xe/components/CatalogFilterBar.tsx)
- **Chi tiết kỹ thuật:**
  - **Mobile (< 768px):** Triệt tiêu khối hộp to che khuất tầm nhìn danh sách xe; thay bằng thanh Compact Bar siêu tinh gọn gồm nút *"Bộ lọc"* (`SlidersHorizontal`) và 1 hàng chip ngân sách cuộn ngang (`overflow-x-auto snap-x`).
  - **Bottom Sheet Drawer:** Khi bấm *"Bộ lọc"*, mở giao diện Bottom Sheet trượt từ dưới lên (`animate-in slide-in-from-bottom`), có grab handle, backdrop blur khóa cuộn trang nền, hiển thị đầy đủ ngân sách và kiểu dáng xe dạng grid 2 cột với touch target chuẩn `h-11`, kèm nút CTA dính dưới chân *"Xem X Dòng Xe Phù Hợp"*.
  - **Desktop (>= 768px):** Bảo toàn 100% giao diện kính showroom cao cấp rộng rãi.
- **Xác thực:** Monorepo `check-types` exit 0, Vitest 45/45 tests pass.

### 🐛 Bug Fix: `Button` Primitive `asChild` Slot React.Fragment Warning
- **Tệp sửa đổi:** [`packages/ui/src/button.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/packages/ui/src/button.tsx)
- **Nguyên nhân gốc:** Khi `asChild = true`, component `Button` trước đó bao bọc `children` trong `<> ... </>` (React.Fragment) bên trong `<Comp>` (`Slot`), khiến Radix Slot clone và truyền thuộc tính `className` vào `React.Fragment`, gây ra cảnh báo runtime `Invalid prop className supplied to React.Fragment`.
- **Giải pháp:** Tách nhánh điều kiện: Khi `asChild === true`, render trực tiếp `<Slot ...>{children}</Slot>` để Slot sao chép đúng thuộc tính vào phần tử con hợp lệ duy nhất (`Link`).
- **Xác thực:** Triệt tiêu hoàn toàn console error, `check-types` và unit tests đạt 100% `exit 0`.

### 🎨 Tối Ưu Hóa Thiết Kế Thẻ Xe Showroom (SmartCarCard v2.2)
- **Tệp sửa đổi:** [`apps/web/app/xe/components/SmartCarCard.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/web/app/xe/components/SmartCarCard.tsx)
- **Chi tiết kỹ thuật:**
  - **Tỷ lệ ảnh xe 16:9:** Thay đổi từ 16:10 sang tỷ lệ chuẩn 16:9 (`aspect-[16/9]`), giảm lãng phí diện tích nền, giúp xe to rõ chiếm 75% - 80% khung ảnh.
  - **Tag phân khúc cao cấp:** Đưa pill badge bán trong suốt góc tối (`bg-slate-900/80 backdrop-blur-md`) vào bên trong góc trên ảnh xe, sang trọng và gắn liền với ngữ cảnh xe.
  - **Xử lý ruy-băng ưu đãi:** Bỏ `truncate`, hỗ trợ hiển thị 2 dòng (`line-clamp-2 leading-snug`) giữ trọn vẹn thông điệp bán hàng giá trị.
  - **Tôn vinh Giá niêm yết:** Đẩy cỡ chữ Giá xe lên TO ĐẬM (`text-xl sm:text-2xl font-black text-[#002C6C]`), kèm nhãn phụ nhỏ phía trên, làm mờ hộp trả trước thành dạng phụ thanh mảnh (`bg-sky-50/70 border-sky-100/80`).
  - **Ranh giới CTA rõ nét:** Tách biệt rõ ràng: Nút phụ "Dự Toán Lăn Bánh" (viền outline lịch thiệp) & Nút chính "Xem Chi Tiết" (khối xanh đậm Hyundai `#002C6C` phát sáng `glow`), cả 2 đạt chuẩn Touch Target `h-11` (44px).
- **Xác thực:** Monorepo `check-types` exit 0, Core Vitest 45/45 tests pass.
