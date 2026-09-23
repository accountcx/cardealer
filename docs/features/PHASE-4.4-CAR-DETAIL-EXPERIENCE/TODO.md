# 📝 Action Plan: Trang Chi Tiết Dòng Xe Chuẩn Hóa & Đổi Màu Động (`/xe/[carSlug]`)

## Mã Epic: `EPIC-PHASE-4.4-CAR-DETAIL-EXPERIENCE`
## Định Vị: Website Bán Hàng Cá Nhân Của Chuyên Viên Tư Vấn Ô Tô (Automotive Sales Consultant)
## Execution Tier: Tier 1 (Core Architecture / High-Risk / Full 5 Phase Lifecycle & Strict Gates 1–5)

---

### 🎯 GIAI ĐOẠN 2 & 3: ARCHITECTURE & RISK AUDIT

- [x] **Task 1: Phân tích Solution Options (Sub-Gate 2.1)**
  - Vị trí tác động: `docs/features/PHASE-4.4-CAR-DETAIL-EXPERIENCE/SOLUTION_OPTIONS.md`
  - Role phụ trách: `system-analyst-architect`
  - DoD: Xuất bản 2–3 phương án kiến trúc:
    - Quản lý State URL 2 chiều & Popstate Listener.
    - Cơ chế Smart Zalo Deep Link tự soạn tin nhắn ngữ cảnh xe + màu sơn.
    - Chiến lược Image Preloading chống giật lag màu sơn.
    - Cấu trúc Component RSC vs Client Island, Schema JSON-LD đa tầng (`Product`, `Car`, `Person` Consultant).
    - Ma trận Trade-off và dừng chờ lệnh chốt Option.

- [x] **Task 2: Thiết kế Chi tiết Ngũ Tài Liệu (Bước 2.2)**
  - Vị trí tác động: `docs/features/PHASE-4.4-CAR-DETAIL-EXPERIENCE/` (`FLOW.md`, `SCHEMA.md`, `API_SPEC.md`, `FE_INTEGRATION_GUIDE.md`)
  - DoD: Hoàn thiện 100% bản vẽ chi tiết cho Option đã được chốt:
    - `FLOW.md`: Sơ đồ tuần tự tương tác đổi màu, chuyển phiên bản, đồng bộ URL không reload trang, luồng mở app Zalo tự soạn tin nhắn xe.
    - `SCHEMA.md`: Data contracts giữa API và Client components, Zod schemas cho Car Detail.
    - `API_SPEC.md`: Đặc tả chi tiết response của `GET /api/cars/:slug` và hàm SEO JSON-LD mở rộng.
    - `FE_INTEGRATION_GUIDE.md`: Đặc tả UI tokens, Luxury Studio Car Stage, Tactile Color Swatches, Consultant Trust Card, Quick Share link button, Lightbox modal, Dynamic Specs table có nút gạt khác biệt, Quick Loan Teaser và Dual Sticky Bar.

- [x] **Task 3: Risk Audit & Test Plan (Giai đoạn 3)**
  - Vị trí tác động: `docs/features/PHASE-4.4-CAR-DETAIL-EXPERIENCE/RISK_AUDIT.md` & `TEST_PLAN.md`
  - DoD: Báo cáo ma trận rủi ro R1–R17 (Duplicate Content SEO, Zalo deep link encoding tiếng Việt trên iOS/Android, Lệch ảnh theo phiên bản, CLS Layout Shift, Crash khi query sai) và kịch bản kiểm thử tự động CLI.

---

### 🚀 GIAI ĐOẠN 4: EXECUTION ROADMAP BY VERTICAL SLICES (THỰC THI CUỐN CHIẾU)

#### 🔹 SLICE 1: US-01 — Core Data Contract, API Endpoint & Comprehensive SEO Schema Engine
* **Role phụ trách:** `fullstack-dev-executor` (Layer: Shared / BE / Core)
* **Target Files:** `packages/types/src/car.ts`, `packages/core/src/seo/json-ld.ts`, `apps/api/src/routes/catalog.ts`, `apps/web/services/cars.service.ts`
* **Phương pháp kiểm chứng (DoD):** `pnpm check-types` pass 100%, API `/api/cars/:slug` trả về 200 OK với đúng schema, Zod validation pass.
- [x] **Step 1.1:** Chuẩn hóa response `GET /api/cars/:slug` tại `apps/api/src/routes/catalog.ts` (format phẳng mảng colors, sắp xếp versions và versionColors).
- [x] **Step 1.2:** Mở rộng `generateCarJsonLd` tại `packages/core/src/seo/json-ld.ts` đáp ứng 100% tiêu chuẩn Google Merchant Center (`Product`, `Car`, `AggregateOffer`, `WarrantyPromise`, `MerchantReturnPolicy`, `Person` Consultant).
- [x] **Step 1.3:** Bổ sung phương thức `getCarBySlug(slug)` tại `apps/web/services/cars.service.ts` với cache tag `car-detail-[slug]` và `revalidate: 60s`.
- [x] **Step 1.4:** Hoàn thành kiểm chứng Slice 1 (`pnpm check-types` + API route test + Schema validation).

#### 🔹 SLICE 2: US-02 — Interactive Car Hero, Tactile Color Swatches & 2-Way Deep Linking Engine
* **Role phụ trách:** `fullstack-dev-executor` (kết hợp `tailwind-ui-designer`) (Layer: FE Web / Client Islands)
* **Target Files:** `apps/web/app/xe/[carSlug]/hooks/use-car-detail-url-sync.ts`, `use-image-preloader.ts`, `components/CarHeroExperience.tsx`, `components/ColorSwatches.tsx`, `components/VersionSelector.tsx`, `components/SalerQuickShareBar.tsx`
* **Phương pháp kiểm chứng (DoD):** Thao tác click đổi màu/bản đổi URL tức thì (< 50ms, CLS = 0), copy link cấu hình mở tab mới hiển thị chuẩn xác, nút Back/Forward khôi phục state.
- [x] **Step 2.1:** Xây dựng Custom Hook `useCarDetailUrlSync` đồng bộ 2 chiều state phiên bản và màu sắc lên URL (`?phien-ban=...&mau=...`) qua `window.history.replaceState` kèm xử lý `popstate`.
- [x] **Step 2.2:** Xây dựng cơ chế Background Image Preloading nạp trước bộ ảnh màu vào memory cache trình duyệt.
- [x] **Step 2.3:** Xây dựng component `ColorSwatches` với các nút chấm tròn màu thực tế (two-tone, metallic finish), tooltip tên màu tiếng Việt, active ring và hiệu ứng chọn mượt mà.
- [x] **Step 2.4:** Xây dựng component `VersionSelector` chuyển đổi linh hoạt giữa các phiên bản xe kèm giá niêm yết, số tiền trả trước và lọc danh sách màu khả dụng.
- [x] **Step 2.5:** Xây dựng nút *"Sao chép liên kết cấu hình"* (Quick Share Link) cho Saler gửi nhanh cho khách qua Zalo/Facebook (kèm thông báo toast copy thành công).
- [x] **Step 2.6:** Xây dựng component `CarHeroExperience` tích hợp Luxury Studio Car Stage, ảnh xe lớn với LCP priority (`fetchPriority="high"`), chuyển ảnh fade mượt mà (< 100ms, CLS = 0).
- [x] **Step 2.7:** Hoàn thành kiểm chứng Slice 2 (Click đổi màu/bản đổi URL tức thì, copy link dán sang tab mới mở đúng cấu hình đã chọn).

#### 🔹 SLICE 3: US-03 — Dynamic Specs Table with Highlight Differences, Media Gallery Lightbox & Sticky TOC
* **Role phụ trách:** `fullstack-dev-executor` (kết hợp `tailwind-ui-designer`) (Layer: FE Web / Interactive UI)
* **Target Files:** `apps/web/app/xe/[carSlug]/components/DynamicSpecsTable.tsx`, `CarGalleryLightbox.tsx`, `CarReviewWithTOC.tsx`
* **Phương pháp kiểm chứng (DoD):** Chuyển phiên bản thông số cập nhật tương ứng, công tắc gạt khác biệt hoạt động chính xác, click ảnh mở Lightbox toàn màn hình, scrollspy TOC sáng đèn đúng vị trí.
- [x] **Step 3.1:** Xây dựng component `DynamicSpecsTable` hiển thị bảng thông số theo 5 nhóm kỹ thuật kèm nút công tắc "Chỉ xem điểm khác biệt" (Highlight Differences Toggle).
- [x] **Step 3.2:** Xây dựng component `CarGalleryLightbox` hiển thị thư viện ảnh phân loại (Ngoại thất, Nội thất, Động cơ) kèm modal phóng to toàn màn hình (Next/Prev, Touch swipe, phím Esc).
- [x] **Step 3.3:** Xây dựng component `CarReviewSection` và `TableOfContents` (Sticky TOC trên Desktop bám dính theo scroll, Accordion trên Mobile) với scrollspy bằng `IntersectionObserver`.
- [x] **Step 3.4:** Hoàn thành kiểm chứng Slice 3 (Thao tác zoom ảnh lightbox mượt mà, gạt xem khác biệt hoạt động chính xác, scrollspy TOC sáng đèn đúng vị trí).

#### 🔹 SLICE 4: US-04 — Personal Consultant Hero Badge, Smart Zalo Deep Link, Sticky Bar & Verification
* **Role phụ trách:** `fullstack-dev-executor` (Layer: Full-stack Web / Integration)
* **Target Files:** `apps/web/app/xe/[carSlug]/components/ConsultantTrustCard.tsx`, `ProductStickyBar.tsx`, `QuickLoanTeaser.tsx`, `CarDetailView.tsx`, `apps/web/app/xe/[carSlug]/page.tsx`
* **Phương pháp kiểm chứng (DoD):** `pnpm check-types` pass 100%, `pnpm build` pass, SEO Canonical hợp lệ không dính query params, click Zalo mở app đúng nội dung xe/màu, kiểm tra luồng từ chi tiết xe sang tính giá lăn bánh hoạt động chuẩn xác.
- [x] **Step 4.1:** Xây dựng component `ConsultantTrustCard`: Chân dung Saler, hotline trực tiếp, cam kết dịch vụ (lái thử tận nhà, bao hồ sơ trả góp 85%, giao xe tận nơi) và nút Đăng ký lái thử tận nhà.
- [x] **Step 4.2:** Xây dựng Smart Zalo CTA: Click mở app Zalo kèm tin nhắn tự soạn sẵn theo xe, phiên bản và màu đang xem (ví dụ: *"Chào em, anh/chị đang xem Tucson Đặc Biệt màu Đỏ..."*).
- [x] **Step 4.3:** Xây dựng component `ProductStickyBar` bám dính đáy màn hình mobile và Sticky Sub-Header trên Desktop khi cuộn qua Hero (gồm Hotline Saler, nút Chat Zalo và nút Nhận Báo Giá mở `LeadQuoteModal`).
- [x] **Step 4.4:** Xây dựng widget tính trả góp nhanh trực quan (Quick Loan Teaser) và nút `"Tính Giá Lăn Bánh Xe Này"` điều hướng sang `/gia-lan-banh?xe=[carSlug]&phien-ban=[versionSlug]`.
- [x] **Step 4.5:** Lắp ráp hoàn chỉnh Server Page `apps/web/app/xe/[carSlug]/page.tsx` (RSC + ISR, dynamic metadata, canonical url cố định, schema JSON-LD, Breadcrumbs, Error/404 handling, disclaimer cá nhân minh bạch).
- [x] **Step 4.6:** Chạy kiểm thử tự động toàn diện Monorepo (`pnpm check-types`, `pnpm build`), kiểm tra rich results test và bàn giao Gate 4.

---

### 🛡️ GIAI ĐOẠN 5: INDEPENDENT CODE REVIEW
- [ ] Rà soát độc lập trên Git Diff (`git diff main`).
- [ ] Kiểm tra triệt tiêu Duplicate Content SEO (Canonical Tag tuyệt đối không dính query params).
- [ ] Kiểm tra hiệu năng chuyển màu (< 100ms) và tính an toàn khi mở link với query sai.
- [ ] Kiểm tra chuẩn WCAG 2.1 AA (Keyboard navigation & ARIA labels).
- [ ] Kiểm tra định dạng liên kết Zalo Deep Link tương thích trên cả iOS, Android và Desktop.
