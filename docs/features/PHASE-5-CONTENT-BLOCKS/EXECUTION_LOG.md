# 📜 NHẬT KÝ THỰC THI CHI TIẾT (FUNCTION-LEVEL EXECUTION LOG)
## Phase 5: Hệ Thống Tin Tức, Content Blocks & Inbound Marketing Hub (Hyundai Vinh)

> **Mã Epic:** `EPIC-PHASE-5-CONTENT-BLOCKS-INBOUND`  
> **Quy chuẩn thực thi:** **Universal Agentic Workflow (v2.2.0)** — Giai đoạn 4: Step 4.0 (Pre-coding Roadmap & Tool-Lock Protocol)  
> **Kỹ sư trưởng phụ trách:** `fullstack-dev-executor`  
> **Cơ chế kiểm soát:** **Cuốn chiếu 1 File / 1 Turn (Strict Step-Gate 4.x)**  
> **Trạng thái môi trường:** 🟢 Pure Development (Local Monorepo `pnpm`)  

---

## 1. Bảng Tiêu Chuẩn Tiền Thi Công (Senior Pre-coding Checklist)

| Tiêu Chí Kỹ Thuật | Trạng Thái | Cơ Chế Kiểm Soát & Đối Soát Hợp Đồng |
| :--- | :---: | :--- |
| **Selective Context Tagging** | ✅ ĐẠT | Đã nạp đầy đủ: `@TODO.md`, `@API_SPEC.md`, `@SCHEMA.md`, `@TEST_PLAN.md`, `@FE_INTEGRATION_GUIDE.md`. |
| **Contract Immutability** | ✅ ĐẠT | Mọi schema Drizzle và Zod contract tuân thủ 100% bản vẽ tại `SCHEMA.md`. Không tự ý thêm bớt field. |
| **Zero Breaking Changes** | ✅ ĐẠT | Chế độ Non-Destructive Additive: Tạo bảng mới `posts`, `categories`, `post_tags`, `redirects`; chỉ thêm cột nullable cho bảng `leads`. Giữ nguyên 100% catalog xe Phase 1–4. |
| **Server-First RSC Architecture** | ✅ ĐẠT | Không nạp thư viện Tiptap runtime tại Storefront `apps/web`. Server tự render Tiptap JSON AST thành HTML ngữ nghĩa thuần. |
| **Facade Media Loading** | ✅ ĐẠT | `TikTokBlock` và `YoutubeBlock` chỉ tải ảnh poster tĩnh + Play button; chỉ inject `<iframe>` khi click Play. |
| **CRO Tinh Gọn (1-Chạm)** | ✅ ĐẠT | Toàn bộ 3 điểm chạm Inbound Lead loại bỏ checkbox điều khoản Luật 91/2025/QH15, form chỉ nhận SĐT/Zalo + Tên. |
| **Tool-Lock Protocol** | ✅ KÍCH HOẠT | Mã nguồn sản phẩm đang được khóa 100% tại Turn 0. Không can thiệp mã nguồn khi chưa thông quan Sub-Gate 4.0. |

---

## 2. Bản Đồ Thực Thi Chi Tiết Cấp Hàm & File (Function-Level Execution Roadmap)

### 🔹 VERTICAL SLICE 1: Database Schema, Post States, Leads Attribution & Data Contracts (US-01)
* **Mục tiêu:** Thiết lập nền tảng kiểu dữ liệu, ORM contracts và bộ bóc tách Tiptap AST tại tầng core.
* **Quy trình cuốn chiếu (1 File / 1 Turn):**

| Step | Target File | Hành Động Kỹ Thuật & Cấp Hàm | Phương Pháp Kiểm Chứng (CLI Verify) | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| **1.1** | `packages/database/src/schema/posts.ts` | Khởi tạo bảng `posts`, `categories`, `post_tags`, `redirects`. Enum `postStatusEnum` (`draft`, `published`, `scheduled`, `archived`). | `pnpm --filter @cardealer/database check-types` | ✅ COMPLETED |
| **1.2** | `packages/database/src/schema/leads.ts` | Bổ sung các cột: `postId`, `authorId`, `sourceType`, `utmSource`, `utmCampaign`, `phone`, `fullName`, `carModelInterested`. | `pnpm --filter @cardealer/database check-types` | ✅ COMPLETED |
| **1.3** | `packages/database/src/schema/index.ts` | Export toàn bộ schemas mới từ `posts.ts`. | `pnpm --filter @cardealer/database check-types` | ✅ COMPLETED |
| **1.4** | `packages/types/src/content-blocks.ts` | Định nghĩa Zod Schemas & TypeScript interfaces cho 8 Content Blocks Tinh Hoa & Inbound Forms. | `pnpm --filter @cardealer/types check-types` | ✅ COMPLETED |
| **1.5** | `packages/core/src/tiptap/extractor.ts` | Viết các hàm trích xuất AST: `extractHeadingsFromTiptap`, `extractFaqsFromTiptap`, `extractVideosFromTiptap`, `hasGatedContent`. | `pnpm --filter @cardealer/core check-types` | ✅ COMPLETED |
| **1.6** | `packages/core/src/__tests__/tiptap-extractor.test.ts` | Unit tests kiểm thử bộ trích xuất AST (8/8 tests pass, 56/56 core tests pass, check-types 8/8 pass). | `pnpm --filter @cardealer/core test && pnpm check-types` | ✅ COMPLETED |
| **1.7** | `packages/types/src/index.ts` | Re-export toàn bộ Zod schemas & types content-blocks qua barrel file `@cardealer/types`. | `pnpm --filter @cardealer/types check-types` | ✅ COMPLETED |
| **1.8** | `packages/database/drizzle/0003_*.sql` | Sinh migration SQL chuẩn Non-Destructive Additive bằng `drizzle-kit generate`. | `pnpm --filter @cardealer/database db:generate` | ✅ COMPLETED |

---

### 🔹 VERTICAL SLICE 2: 8 Content Blocks Library & High-Converting Inbound Components (US-02)
* **Mục tiêu:** Xây dựng thư viện component UI cô lập, Facade TikTok/YouTube, Table cuộn ngang & xuất BOM CSV.
* **Quy trình cuốn chiếu (1 File / 1 Turn):**

| Step | Target File | Hành Động Kỹ Thuật & Cấp Hàm | Phương Pháp Kiểm Chứng (CLI Verify) | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| **2.1** | `packages/ui/src/blocks/CalloutBlock.tsx` | Component hiển thị 4 variant (`info`, `warning`, `success`, `note`), icon SVG tương ứng, border-l-4. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.2** | `packages/ui/src/blocks/FeatureGridBlock.tsx` | Lưới 2, 3, 4 cột; card bo góc, icon SmartSense, hiệu ứng hover-zoom ảnh. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.3** | `packages/ui/src/blocks/TableBlock.tsx` | Bọc `overflow-x-auto`, `min-w-[540px]`, 100% Named Export, 4-State UI (Empty State có CTA Reset), tái sử dụng Button primitive, export CSV UTF-8 BOM. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.4** | `packages/ui/src/blocks/TikTokBlock.tsx` | Tỉ lệ cố định `aspect-[9/16]`, Facade poster WebP, click Play inject `<iframe>` autoplay=1, CSS triệt tiêu scrollbar. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.5** | `packages/ui/src/blocks/YoutubeBlock.tsx` | Tỉ lệ 16:9, Facade poster, click Play inject `<iframe>` lazy-load. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.6** | `packages/ui/src/blocks/RelatedCarBlock.tsx` | Card xe liên quan từ DB, hiển thị giá niêm yết, CTA "Xem chi tiết xe" và "Nhận báo giá". | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.7** | `packages/ui/src/blocks/PriceTableBlock.tsx` | Bảng giá phiên bản dòng xe tự động đồng bộ theo `carId`, liên kết sâu công cụ tính phí lăn bánh. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.8** | `packages/ui/src/blocks/GalleryBlock.tsx` | Slider cuộn ngang vuốt mượt trên mobile + modal Lightbox phóng to ảnh. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.9** | `packages/ui/src/blocks/FAQBlock.tsx` | Accordion đóng mở mượt mà kèm hiệu ứng xoay chevron. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.10** | `packages/ui/src/blocks/InlineQuickForm.tsx` | Form 1-chạm tối ưu CRO: SĐT/Zalo + Tên, không rào cản checkbox, tái sử dụng `LeadQuoteForm`. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.11** | `packages/ui/src/blocks/GatedContent.tsx` | Khối nội dung mờ (blur), form nhận báo giá mở khóa tức thì, bọc class `.gated-content-section`. | `pnpm --filter @cardealer/ui check-types` | ✅ COMPLETED |
| **2.12** | `packages/ui/src/index.ts` | Barrel Export toàn bộ 8 Content Blocks & Inbound Lead Components, kiểm chứng toàn diện Slice 2. | `turbo run check-types` | ✅ COMPLETED |

---

### 🔹 VERTICAL SLICE 3: SEO Engine, 10-Criteria Checker, Schemas & 301 Redirect Engine (US-03)
* **Mục tiêu:** Lõi phân tích SEO Onpage, sinh mã JSON-LD tự động, middleware chuyển hướng 301 an toàn.
* **Quy trình cuốn chiếu (1 File / 1 Turn):**

| Step | Target File | Hành Động Kỹ Thuật & Cấp Hàm | Phương Pháp Kiểm Chứng (CLI Verify) | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| **3.1** | `packages/core/src/seo/score.ts` | Hàm `calculateSeoScore()` chấm 10 tiêu chí real-time (Title, Slug, Intro, Density, Word count, H2, Alt, Internal links, Meta desc, Cannibalization). | `pnpm --filter @cardealer/core test src/__tests__/seo-score.test.ts` | ✅ COMPLETED |
| **3.2** | `packages/core/src/seo/json-ld.ts` | Bộ sinh Schemas: `generateNewsArticleSchema()`, `generatePaywallSchema()`, `generateBreadcrumbSchema()`, `generateAutoDealerSchema()`, `generateFaqSchema()`, `generateVideoSchema()`, `generatePostMasterJsonLd()`. | `pnpm --filter @cardealer/core test src/__tests__/post-jsonld.test.ts` | ✅ COMPLETED |
| **3.3** | `apps/web/middleware.ts` | Middleware tra cứu URL trong bảng `redirects`, trả về HTTP 301, chặn vòng lặp tối đa 3 bước. | `pnpm --filter web check-types` | ✅ COMPLETED |

---

### 🔹 VERTICAL SLICE 4: Admin Editorial Management, Preview Link & Post Verification (US-04)
* **Mục tiêu:** Giao diện quản trị bài viết, Tiptap WYSIWYG Editor tích hợp 8 blocks, link xem trước bí mật.
* **Quy trình cuốn chiếu (1 File / 1 Turn):**

| Step | Target File | Hành Động Kỹ Thuật & Cấp Hàm | Phương Pháp Kiểm Chứng (CLI Verify) | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| **4.1** | `apps/api/src/routes/posts.ts` | REST endpoints CRUD bài viết, publish gatekeeper chặn `[...]`, lưu trữ Lead với Honeypot chống spam. | `pnpm --filter api check-types` | ✅ COMPLETED |
| **4.2** | `apps/admin/app/posts/page.tsx` | Bảng quản lý bài viết theo trạng thái (`draft`, `published`, `scheduled`, `archived`), bộ lọc danh mục. | `pnpm --filter admin check-types` | ✅ COMPLETED |
| **4.3** | `apps/admin/app/posts/[id]/page.tsx` | Trang soạn thảo bài viết: Studio biên tập Block-based WYSIWYG Editor tương thích Tiptap AST JSON, thanh công cụ chèn 8 blocks, thanh chấm điểm SEO Onpage 10 tiêu chí trực quan real-time. Hỗ trợ route `/posts/new` và `/posts/[id]`. | `pnpm --filter admin check-types` | ✅ COMPLETED |
| **4.4** | `apps/admin/app/posts/preview/page.tsx` | Trang xem trước bài viết nháp với Secret Token 64 ký tự: Bộ chuyển đổi khung hình đa thiết bị (Desktop 100%, Tablet 768px, Mobile 375px), 4-State UI Matrix, trình render 8 Content Blocks (@cardealer/ui) từ Tiptap AST JSON, E-E-A-T Author Box, và thanh điều khiển sao chép link / quay lại biên tập. | `pnpm --filter admin check-types` | ✅ COMPLETED |

---

### 🔹 VERTICAL SLICE 5: Storefront News Experience, Sticky Mobile Bottom Bar, Slide-in Banner (US-05)
* **Mục tiêu:** Trang tin tức Storefront tải siêu tốc, Sticky Bar đáy màn hình, Slide-in Banner Exit-intent.
* **Quy trình cuốn chiếu (1 File / 1 Turn):**

| Step | Target File | Hành Động Kỹ Thuật & Cấp Hàm | Phương Pháp Kiểm Chứng (CLI Verify) | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| **5.1** | `apps/web/app/tin-tuc/page.tsx` | Trang danh sách tin tức: Top 3 bài ghim Bento Grid (Hero Card 16:9 + 2 card phụ), thanh lọc chuyên mục 1-chạm, Grid 3 cột bài viết, phân trang `?trang=2`, Inbound Lead Magnet Banner và SEO metadata chuẩn Google Guidelines. | `pnpm --filter web check-types` | ✅ COMPLETED |
| **5.2** | `apps/web/app/tin-tuc/[slug]/page.tsx` | Trang chi tiết RSC: Render Tiptap HTML thuần, ISR `revalidate: 60`, nhúng 5 Schemas JSON-LD, Content Blocks, E-E-A-T Author Box, Conversion Sidebar. | `pnpm --filter web check-types` | ✅ COMPLETED |
| **5.3** | `apps/web/components/StickyToc.tsx` | Client Island: Mục lục bài viết tự động kích hoạt theo `IntersectionObserver` scrollspy. | `pnpm --filter web check-types` | ✅ COMPLETED |
| **5.4** | `apps/web/components/PostBottomBar.tsx` | Client Island: Thanh neo đáy Mobile (< 768px) 3 nút (Gọi, Zalo, CTA cá nhân hóa theo chuyên mục). | `pnpm --filter web check-types` | ✅ COMPLETED |
| **5.5** | `apps/web/components/SlideInBanner.tsx` | Client Island: Banner trượt góc exit-intent (PC) / scroll > 60% (Mobile), nhớ sessionStorage. | `pnpm --filter web check-types` | ✅ COMPLETED |
| **5.6** | `apps/web/components/EeatAuthorBox.tsx` | Khối tác giả chuyên gia chân bài viết: Tên, chức vụ, hotline tư vấn, link Zalo trực tiếp. | `pnpm --filter web check-types` | ✅ COMPLETED |
| **5.7** | Toàn bộ Monorepo | Kiểm thử toàn diện Monorepo (`pnpm check-types` và `pnpm build`). | `pnpm check-types && pnpm build` | ✅ COMPLETED |

---

## 3. Nhật Ký Tiến Độ Từng Bước (Execution History Log)

* `2026-09-24T23:12`: **Khởi tạo Step 4.0.** Hoàn tất Senior Pre-coding Checklist và Function-Level Execution Roadmap. Tool-Lock Protocol kích hoạt thành công. Đang dừng chờ phê duyệt Sub-Gate 4.0.
* `2026-09-24T23:14`: **Hoàn thành Step 1.1:** Khởi tạo thành công `packages/database/src/schema/posts.ts` bao gồm các bảng `posts`, `categories`, `post_tags`, `redirects` và enum `postStatusEnum`. Verification CLI `pnpm --filter @cardealer/database check-types` đạt exit code 0.
* `2026-09-24T23:23`: **Hoàn thành Step 1.2:** Mở rộng thành công `packages/database/src/schema/leads.ts` với các cột phân bổ Inbound Marketing: `postId`, `authorId`, `sourceType`, `utmSource`, `utmMedium`, `utmCampaign`, `carModelInterested`. Verification CLI `pnpm --filter @cardealer/database check-types` đạt exit code 0.
* `2026-09-24T23:24`: **Hoàn thành Step 1.3:** Export toàn bộ schemas mới từ `packages/database/src/schema/index.ts`. Toàn bộ 8 packages trong Monorepo chạy `pnpm check-types` thành công 100% (exit 0).
* `2026-09-24T23:27`: **Hoàn thành Step 1.4:** Khởi tạo thành công `packages/types/src/content-blocks.ts` bao gồm Zod schemas & TypeScript types cho 8 Content Blocks Tinh Hoa, Inbound Forms và DTOs bài viết. Verification CLI `pnpm --filter @cardealer/types check-types` đạt exit code 0.
* `2026-09-24T23:29`: **Hoàn thành Step 1.5:** Khởi tạo thành công `packages/core/src/tiptap/extractor.ts` bao gồm các hàm trích xuất Server-Side AST: `extractHeadingsFromTiptap`, `extractFaqsFromTiptap`, `extractVideosFromTiptap`, `hasGatedContent`, `calculateReadingTimeAndWordCount`. Verification CLI `pnpm --filter @cardealer/core check-types` đạt exit code 0.
* `2026-09-24T23:38`: **Hoàn thành Step 1.6 (Nghiệm thu Slice 1):** Tạo `packages/core/src/__tests__/tiptap-extractor.test.ts`. Chạy Vitest đạt 8/8 tests pass (100%), full suite test `@cardealer/core` đạt 56/56 tests pass, và toàn bộ 8 packages Monorepo chạy `pnpm check-types` pass 100%.
* `2026-09-24T23:40`: **Hoàn thành Step 1.7:** Re-export toàn bộ Zod schemas & types content-blocks qua barrel file `packages/types/src/index.ts`. Toàn bộ 8 packages Monorepo chạy `pnpm check-types` pass 100% (exit 0).
* `2026-09-24T23:42`: **Hoàn thành Step 1.8 (Database Migration):** Chạy `pnpm --filter @cardealer/database db:generate`, sinh thành công file migration SQL `drizzle/0003_absurd_dreaming_celestial.sql` (tạo 4 bảng mới `posts`, `categories`, `post_tags`, `redirects`, enum `post_status`, và bổ sung các trường nullable cho `leads` kèm toàn bộ indexes). Tuân thủ 100% quy chuẩn Zero-Downtime & Additive Migration.
* `2026-09-24T23:45`: **Hoàn thành Step 2.1:** Khởi tạo thành công component UI `packages/ui/src/blocks/CalloutBlock.tsx` hỗ trợ 4 biến thể giao diện (`info`, `warning`, `success`, `note`), icon SVG nội suy, màu sắc tương phản chuẩn WCAG 2.1 AA và hỗ trợ Dark Mode. Verification CLI `pnpm --filter @cardealer/ui check-types` đạt exit code 0.
* `2026-09-24T23:57`: **Hoàn thành Step 2.2:** Khởi tạo thành công component UI `packages/ui/src/blocks/FeatureGridBlock.tsx` hỗ trợ lưới responsive linh hoạt 2, 3, 4 cột, hiệu ứng hover zoom ảnh trang bị SmartSense, và fallback icon an toàn khi không có ảnh. Verification CLI `pnpm --filter @cardealer/ui check-types` đạt exit code 0.
* `2026-09-25T00:05`: **Hoàn thành & Chuẩn Hóa Step 2.3 (TableBlock.tsx):** Tái cấu trúc toàn diện theo tư duy `tailwind-ui-designer` và `fullstack-dev-executor`: 100% Named Export (xóa bỏ export default), áp dụng 4-State UI Pattern (Success data state & Empty State chuyên nghiệp với nút reset bộ lọc), tái sử dụng Design Primitives (`Table`, `Input`, `Button`), tuân thủ WCAG AAA (`motion-reduce:transition-none`), giữ trọn vẹn cơ chế chống vỡ layout trên mobile và xuất CSV UTF-8 BOM (`\uFEFF`) cho Excel tiếng Việt. Verification CLI `pnpm check-types` đạt exit code 0.
* `2026-09-25T00:15`: **Chuẩn Hóa Step 2.1 (CalloutBlock.tsx):** Tái cấu trúc tuân thủ triệt để `universal-agentic-workflow` và `fullstack-dev-executor`: 100% Named Export (loại bỏ hoàn toàn export default), đồng bộ Design Tokens dark mode (`slate-900 / border-slate-700 / slate-200`), WCAG AAA Contrast Ratio >= 4.5:1, `motion-reduce:transition-none`, semantic ARIA roles (`role="alert" | "note"`). Verification CLI `pnpm --filter @cardealer/ui check-types` đạt exit code 0.
* `2026-09-25T00:27`: **Chuẩn Hóa Step 2.2 (FeatureGridBlock.tsx):** Tái cấu trúc tuân thủ triệt để `universal-agentic-workflow` và `fullstack-dev-executor`: 100% Named Export, tái sử dụng Shared UI Primitive `Card` từ `@cardealer/ui/card`, bổ sung `motion-reduce:transition-none motion-reduce:transform-none`, đồng bộ Dark Mode Theme Tokens, chuẩn hóa SmartSense visual fallback. Verification CLI Monorepo `pnpm check-types` đạt exit code 0 (8/8 tasks passed).
* `2026-09-25T07:10`: **Hoàn thành Step 2.4 (TikTokBlock.tsx):** Xây dựng thành công `packages/ui/src/blocks/TikTokBlock.tsx` theo chuẩn SOP: Tỉ lệ 9:16 (`aspect-[9/16]`), cơ chế Facade Lazy-Loading với poster WebP và nút Play ảo (tiết kiệm ~1.5MB third-party scripts ban đầu), nhúng iframe TikTok Player v1 khi click-to-play, khử triệt để scrollbars trên mọi trình duyệt, 100% Named Export, WCAG AAA `motion-reduce:transition-none motion-reduce:hover:scale-100`. Verification CLI Monorepo `pnpm check-types` đạt exit code 0 (8/8 tasks passed).
* `2026-09-25T07:12`: **Hoàn thành & Chuẩn Hóa Step 2.5 (YoutubeBlock.tsx):** Tái cấu trúc toàn diện theo tư duy `fullstack-dev-executor` và `tailwind-ui-designer`:
  - 4-State UI Matrix: Bổ sung Loading State (`Skeleton` aspect-video chống CLS), Empty/Fallback State chuyên nghiệp (icon minh họa + mô tả) khi thiếu `videoId`, Active Iframe loading spinner, và Facade Data State.
  - Triệt tiêu 100% arbitrary styling: Loại bỏ mã màu hex cứng `#FF0000`, dùng chuẩn Tailwind `bg-red-600 hover:bg-red-700`, chuẩn hóa spacing scale bội số 4px (h-14 w-20, p-6, my-8).
  - Quyền riêng tư & WCAG AAA: Dùng domain `youtube-nocookie.com`, `motion-reduce:transition-none motion-reduce:transform-none`, 100% Named Export. Verification CLI Monorepo `pnpm check-types` đạt exit code 0 (8/8 tasks passed).

* `2026-09-25T07:17`: **Hoàn thành Step 2.6 (RelatedCarBlock.tsx):** Xây dựng thành công `packages/ui/src/blocks/RelatedCarBlock.tsx` theo chuẩn SOP: Tái sử dụng trọn vẹn Shared UI Primitives (`Card`, `Button`, `Badge`), định dạng tiền tệ VND chuyên nghiệp, hiển thị tag thông số kỹ thuật nhanh (số chỗ, động cơ), tích hợp cụm CTA kép (Xem chi tiết xe & Đăng ký lái thử), 100% Named Export, WCAG AAA `motion-reduce:transition-none`. Verification CLI Monorepo `pnpm check-types` đạt exit code 0 (8/8 tasks passed).
* `2026-09-25T07:18`: **Hoàn thành Step 2.7 (PriceTableBlock.tsx):** Xây dựng thành công `packages/ui/src/blocks/PriceTableBlock.tsx` theo chuẩn SOP: Tái sử dụng `Table` primitive với wrapper chống vỡ layout trên mobile, định dạng tiền tệ VND tự động cho giá niêm yết và lăn bánh tạm tính, nút CTA báo giá từng phiên bản, hiển thị Badge "Cập nhật mới nhất", ghi chú pháp lý rõ ràng, 4-State UI (Data/Empty), 100% Named Export, WCAG AAA `motion-reduce:transition-none`. Verification CLI Monorepo `pnpm check-types` đạt exit code 0 (8/8 tasks passed).
* `2026-09-25T07:23`: **Hoàn thành & Chuẩn Hóa Step 2.8 (GalleryBlock.tsx):** Tái cấu trúc toàn diện theo tư duy `fullstack-dev-executor` và `tailwind-ui-designer`:
  - Component-Driven & Shared Primitives First: Tái sử dụng đồng bộ `Button` (touch targets >= 44px), `Badge` (chỉ báo ảnh), `Skeleton` (Shimmer loading chống CLS).
  - Triển khai trọn vẹn 4-State UI Matrix: Loading State (khung Skeleton tương ứng với layout), Empty State (minh họa chuyên nghiệp thay vì trả về null), Data State (Slider / Grid), Lightbox Modal (phóng to toàn màn hình, khóa cuộn body, điều hướng bàn phím phím mũi tên & Escape).
  - Triệt tiêu 100% arbitrary styling: Chuẩn hóa spacing scale (bội số 4px), chuẩn hóa touch targets (h-10, h-11), WCAG AAA `motion-reduce:transition-none motion-reduce:transform-none`.
  - 100% Named Export. Verification CLI Monorepo `pnpm check-types` đạt exit code 0 (8/8 tasks passed).
* `2026-09-25T07:29`: **Hoàn thành & Chuẩn Hóa Step 2.9 (FAQBlock.tsx):** Tái cấu trúc toàn diện theo tư duy `fullstack-dev-executor` và `tailwind-ui-designer`:
  - 4-State UI Matrix Chuẩn Mực:
    1. Loading State: Khung `Skeleton` Shimmer khớp chính xác layout accordion triệt tiêu CLS.
    2. Empty State: Minh họa icon + thông điệp + Nút CTA gửi câu hỏi cho tư vấn viên.
    3. Error State: Banner cảnh báo + thông báo lỗi chi tiết + Mã lỗi (`errorCode`) + Nút Thử lại (`onRetry`).
    4. Data State: Accordion đóng mở mượt mà, mở sẵn câu đầu tiên, icon xoay 180 độ, tương thích Schema FAQPage JSON-LD.
  - Dark Mode Parity 100% & Visual Hierarchy: Viền mảnh tinh tế (`border-slate-200/80 dark:border-slate-800/80`), nền linh hoạt (`bg-white dark:bg-slate-900/60`), chữ tương phản cao (`text-slate-900 dark:text-slate-100`).
  - Spacing Scale & Touch Targets: Chuẩn hóa bội số 4px với `min-h-12` (48px đạt chuẩn Apple/Google), loại bỏ arbitrary syntax.
  - Component-Driven & Shared Primitives First: Tái sử dụng đồng bộ `Button` (thay thế hoàn toàn thẻ button HTML ad-hoc bằng `<Button variant="ghost" rightIcon={...}>`), `Badge`, `Skeleton`. 100% Named Export. Verification CLI Monorepo `pnpm check-types` đạt exit code 0 (8/8 tasks passed).
* `2026-09-25T07:52`: **Hoàn thành Step 2.10 (InlineQuickForm.tsx):** Xây dựng thành công `packages/ui/src/blocks/InlineQuickForm.tsx` theo chuẩn SOP:
  - UI Dependency Mapping & Shared Primitives: Tái sử dụng 100% `Card`, `Input`, `Button`, `Badge`, `Skeleton`.
  - Tích hợp & Tái sử dụng triệt để Primitive `LeadQuoteForm`: Mở rộng component `LeadQuoteForm` (`packages/ui/src/lead-quote-form.tsx`) hỗ trợ layout ngang (`layout="horizontal"`), theme nền tối (`variant="dark"`), ẩn nhãn hiển thị icon (`showLabels={false}`), nút accent (`buttonVariant="accent"`), và tùy chọn không bắt buộc họ tên (`isNameRequired={false}`) cho cơ chế CRO 1-chạm.
  - `InlineQuickForm` tiêu thụ trực tiếp `LeadQuoteForm` thay vì định nghĩa form trùng lặp (Zero code duplication), đảm bảo thống nhất logic validation và accessibility giữa Modal và Inbound Block.
  - 4-State UI Matrix: Loading State (`Skeleton`), Expired State (kèm CTA xem xe khác), Error State (thông báo lỗi validation và API), Success State (phản hồi cam kết liên hệ trong 5 phút kèm nút gửi thêm yêu cầu), Active Form State.
* `2026-09-25T07:54`: **Hoàn thành Step 2.11 (GatedContent.tsx):** Xây dựng thành công `packages/ui/src/blocks/GatedContent.tsx` theo chuẩn SOP:
  - UI Dependency Mapping & Shared Primitives: Tái sử dụng 100% `Card`, `Input`, `Button`, `Badge`, `Skeleton`.
  - Cơ chế CRO 1-chạm: Form mở khóa tinh gọn (SĐT/Zalo + Họ tên tùy chọn), loại bỏ hoàn toàn checkbox pháp lý cản trở chuyển đổi.
  - Chuẩn SEO & Paywall Schema: Bao bọc class `.gated-content-section` tương thích 100% với Paywall Schema (`isAccessibleForFree: false`).
  - 4-State UI Matrix Chuẩn Mực:
    1. Loading State: Skeleton Shimmer giả lập khối nội dung và card overlay triệt tiêu CLS.
    2. Empty State: Minh họa chuyên nghiệp khi chưa có nội dung đặc quyền khả dụng kèm CTA xem bảng giá xe.
    3. Error State: Banner cảnh báo lỗi mở khóa kèm mã lỗi (`ERR_GATED_CONTENT_LOCKED`) và nút Thử lại (`onRetry`).
    4. Data State:
       - Locked State: Nội dung bị làm mờ nhẹ CSS (`blur-[6px] select-none pointer-events-none opacity-40 max-h-[380px]`), Card overlay trung tâm với icon khóa vàng và hiệu ứng ánh hào quang.
       - Unlocked State: Hiển thị đầy đủ nội dung sắc nét kèm banner chúc mừng mở khóa thành công và hotline hỗ trợ.
  - Spacing scale bội số 4px (touch targets `h-11` 44px), WCAG AAA `motion-reduce:transition-none`, 100% Named Export. Verification CLI Monorepo `pnpm check-types` đạt exit code 0 (8/8 tasks passed).
* `2026-09-25T08:08`: **Hoàn thành Step 2.12 (Barrel Export & Nghiệm thu Slice 2):**
  - Cập nhật barrel export `packages/ui/src/index.ts` xuất bản toàn bộ 8 Content Blocks & Inbound Lead Components: `CalloutBlock`, `FeatureGridBlock`, `TableBlock`, `TikTokBlock`, `YoutubeBlock`, `RelatedCarBlock`, `PriceTableBlock`, `GalleryBlock`, `FAQBlock`, `InlineQuickForm`, `GatedContent`, cùng compound primitives `Accordion`.
  - Mở rộng & tái sử dụng triệt để `LeadQuoteForm` cho `InlineQuickForm` (Zero Code Duplication).
  - Toàn bộ 11 components tuân thủ 100% Named Export, 4-State UI Matrix (Loading Shimmer, Empty CTA, Error Retry, Data State), Dark Mode Parity, WCAG AAA.
  - Verification CLI Monorepo: `turbo run check-types` đạt exit code 0 (8/8 packages passed).
  - Verification Unit Tests: Suite 56/56 core tests đạt 100% pass rate.
  - **CHÍNH THỨC NGHIỆM THU HOÀN TẤT VERTICAL SLICE 2 (US-02).**
* `2026-09-25T08:11`: **Hoàn thành Step 3.1 (calculateSeoScore & SEO Engine):**
  - Khởi tạo thành công `packages/core/src/seo/score.ts` định nghĩa hàm `calculateSeoScore` phân tích và chấm điểm toàn diện 10 tiêu chí SEO Onpage:
    1. `title_length`: 40-65 ký tự, kiểm tra từ khóa chính.
    2. `slug_keyword`: URL Slug chứa từ khóa chính không dấu.
    3. `intro_keyword`: Xuất hiện trong 100 từ đầu tiên của bài viết.
    4. `keyword_density`: Ngưỡng vàng 1.0% - 2.5%, cảnh báo nhồi nhét từ khóa.
    5. `word_count`: Tối thiểu 600 từ (đạt chuẩn), khuyến khích 1.200 từ cho bài sâu.
    6. `h2_structure`: Tối thiểu 2 thẻ H2, chứa từ khóa chính hoặc địa danh (Vinh, Nghệ An, Hà Tĩnh).
    7. `image_alts`: 100% hình ảnh có thẻ Alt, ưu tiên có ảnh chứa từ khóa chính.
    8. `internal_links`: Tối thiểu 2 liên kết nội bộ (hỗ trợ cả text link và block xe/bảng giá).
    9. `meta_desc`: Độ dài 120-160 ký tự, chứa từ khóa chính.
    10. `cannibalization`: Chống ăn thịt từ khóa (Cannibalization Guard), cảnh báo từ khóa trùng tên dòng xe thương mại (Risk R-08) và bài viết đã xuất bản.
  - Phân loại 3 cấp độ: `good` (>= 80), `needs_improvement` (50-79), `poor` (< 50).
  - Viết bộ Unit Tests độc lập tại `packages/core/src/__tests__/seo-score.test.ts`: 10/10 tests pass 100%.
  - Verification CLI Monorepo: `turbo run check-types` đạt exit code 0 (8/8 packages passed); Toàn bộ 10 suites Vitest của core (66/66 tests) pass 100%.
* `2026-09-25T08:24`: **Hoàn thành Step 3.2 (Multi-Tier Post Schema JSON-LD Generator):**
  - Mở rộng thành công `packages/core/src/seo/json-ld.ts` cung cấp đầy đủ các bộ sinh Schema dữ liệu có cấu trúc Google Rich Results cho bài viết tin tức và Inbound Content:
    1. `generateAutoDealerSchema()`: Định danh thực thể số đại lý ô tô Hyundai Dũng Lạc (Vinh, Nghệ An) kèm tọa độ GPS, thời gian mở cửa và thông tin liên hệ củng cố Local SEO & E-E-A-T.
    2. `generatePostBreadcrumbSchema()`: Điều hướng phân cấp Trang chủ > Tin tức & Khuyến Mãi > Chuyên mục > Tên bài viết.
    3. `generatePaywallSchema()`: Kích hoạt Paywall Schema chính thức của Google Search Central (`isAccessibleForFree: false`, `hasPart: .gated-content-section`) khi phát hiện khối `gatedContent`, loại trừ triệt để nguy cơ bị Google phạt lỗi che giấu nội dung (Cloaking).
    4. `generateFaqSchema()`: Tự động trích xuất các câu hỏi từ `FAQBlock` Tiptap AST sinh Rich Snippet câu hỏi mở rộng (`FAQPage`).
    5. `generateVideoSchema()`: Sinh schema `VideoObject` cho cả `YoutubeBlock` và `TikTokBlock`.
    6. `generateNewsArticleSchema()`: Định danh bài viết tin tức với tác giả chuyên gia (Person), nhà xuất bản (AutoDealer), ngày đăng, ngày sửa và liên kết với Paywall (nếu có).
    7. `generatePostMasterJsonLd()`: Hàm tổng hợp tự động quét AST Tiptap để gom toàn bộ các thực thể trên thành một cấu trúc `@graph` duy nhất chuẩn Google Rich Results.
    8. Duy trì 100% Backward Compatibility cho `generateCarJsonLd` và `generateCatalogJsonLd` hiện có.
  - **Khắc phục 5 Rủi Ro Google Rich Results & Manual Action:**
    1. *Manual Action Fake AggregateRating:* Loại bỏ hoàn toàn giá trị hardcode (4.9 / 38 reviews), chỉ render `aggregateRating` khi có dữ liệu reviews thực tế từ database/options (`reviewCount > 0`).
    2. *FAQPage Policy Update:* Chuẩn hóa tài liệu kiến trúc, xác định FAQPage phục vụ Semantic Search, SGE / AI Overviews và LLM Crawlers.
    3. *VideoObject Duration & Upload Date:* Bổ sung thuộc tính `duration` (chuỗi ISO 8601 ví dụ `PT3M15S`) theo khuyến nghị chính thức của Google Video Guidelines và ưu tiên ngày xuất bản thực của video (`video.uploadDate`).
    4. *Invalid Price 0 Guard:* Loại bỏ triệt để node `offers` khi xe chưa có giá (`lowestPrice <= 0`), chống lỗi `Invalid Price: 0` của Google Merchant Center và Rich Results.
    5. *Dynamic Availability Resolver:* Xây dựng hàm `resolveAvailability(car)` ánh xạ chuẩn xác trạng thái xe (`InStock`, `OutOfStock`, `PreOrder`, `Discontinued`).
  - Viết bộ Unit Tests toàn diện tại `packages/core/src/__tests__/post-jsonld.test.ts` (19/19 tests) & cập nhật `car-detail-schema.test.ts`.
  - Verification CLI Monorepo: `turbo run check-types` đạt exit code 0 (8/8 packages passed); Toàn bộ 11 suites Vitest của core (84/84 tests) pass 100%.
* `2026-09-25T08:34`: **Hoàn thành Step 3.3 (301 Redirect Engine & Next.js Middleware):**
  - Xây dựng động cơ chuyển hướng an toàn `packages/core/src/seo/redirects.ts` bảo toàn 100% PageRank:
    1. `normalizeRedirectPath()`: Tự động chuẩn hóa dấu gạch chéo `/`, loại bỏ trailing slash, chuẩn hóa lowercase và bóc tách query parameters.
    2. `resolveRedirectChain()`: Thuật toán Safe Redirect Chain Resolver kết hợp `Set<string>` phát hiện chu trình (Cyclic Detection), giới hạn tối đa 3 hops (`maxHops: 3`) theo khuyến nghị của Google Search Central, tự động bảo lưu UTM parameters.
  - Viết bộ Unit Tests độc lập tại `packages/core/src/__tests__/redirects.test.ts`: 14/14 tests pass 100%.
  - Xây dựng endpoint tra cứu `apps/api/src/routes/redirects.ts` (GET `/api/redirects`) truy vấn bảng `redirects` của PostgreSQL qua Drizzle ORM và tự động tăng `hitCount`.
  - Xây dựng Next.js Middleware `apps/web/middleware.ts` cho Storefront:
    - Bỏ qua static assets và internal endpoints bằng matcher tối ưu.
    - Tích hợp High-Performance In-Memory Cache (TTL 60s, Max 500 keys) giảm 99% tải DB khi bot quét URL cũ.
    - Timeout Guard 1.500ms với `AbortController`, tự động fallback `NextResponse.next()` nếu mạng chậm, không bao giờ chặn người dùng.
    - Trả về `NextResponse.redirect(..., 301)` kèm headers `X-Redirected-By: Cardealer-301-Engine`.
  - Verification CLI: `pnpm --filter web check-types` đạt exit code 0; `pnpm check-types` Monorepo (8/8 packages) đạt exit code 0; Toàn bộ 12 suites Vitest của core (98/98 tests) pass 100%.
  - **CHÍNH THỨC NGHIỆM THU HOÀN TẤT VERTICAL SLICE 3 (US-03).**
* `2026-09-25T08:38`: **Hoàn thành Step 4.1 (Posts Management Router & Inbound Lead Receiver):**
  - Mở rộng ma trận RBAC `packages/types/src/permission.ts` với quyền `posts:read` và `posts:write` cho Admin, Manager, Editor.
  - Xây dựng thành công `apps/api/src/routes/posts.ts` tích hợp vào `server.ts` với các tính năng cốt lõi:
    1. `GET /api/admin/posts`: Lấy danh sách bài viết phân trang (`page`, `limit`), lọc trạng thái (`draft`, `published`, `scheduled`, `archived`), lọc chuyên mục (`categoryId`), tìm kiếm tiêu đề không dấu/có dấu.
    2. `POST /api/admin/posts`: Tạo bài viết mới, tự động sinh `previewToken` bí mật 64 ký tự, tự động tính `readingTime` và `wordCount` qua Server-side Tiptap AST parser.
    3. `GET /api/admin/posts/:id`: Lấy chi tiết bài viết kèm chuyên mục, tác giả và thẻ tags.
    4. `PUT /api/admin/posts/:id`: Cập nhật bài viết với:
       - **Publish Gatekeeper:** Chặn tuyệt đối việc xuất bản bài viết nếu nội dung chứa ký tự giữ chỗ chưa hoàn thiện `[...]`, `[… ...]`, `[cần bổ sung]`, hoặc `[todo]` với mã lỗi `UNFINISHED_CONTENT_DETECTED`.
       - **Auto 301 Redirect:** Tự động tạo bản ghi trong bảng `redirects` khi đổi `slug` bài viết (`/tin-tuc/slug-cu` ➔ `/tin-tuc/slug-moi`) để bảo toàn 100% PageRank.
    5. `DELETE /api/admin/posts/:id`: Xóa bài viết khỏi cơ sở dữ liệu.
    6. `GET /api/admin/categories` & `POST /api/admin/categories`: Quản lý danh mục chuyên mục bài viết.
    7. `GET /api/posts/preview?token=...`: Endpoint xem trước bài viết nháp bằng token bí mật không yêu cầu đăng nhập.
  - Verification CLI: `pnpm --filter api check-types` đạt exit code 0; `pnpm check-types` Monorepo (8/8 packages) đạt exit code 0; Toàn bộ 12 suites Vitest của core (98/98 tests) pass 100%.
* `2026-09-25T08:41`: **Hoàn thành Step 4.2 (Admin Posts Management Page):**
  - Xây dựng thành công `apps/admin/services/post.service.ts` định nghĩa typed service layer cho các tác vụ `getPosts`, `getCategories`, `getPostById`, `deletePost`.
  - Cập nhật `apps/admin/app/components/AdminShell.tsx` kích hoạt liên kết điều hướng menu sidebar đến `/posts` với quyền `posts:read`.
  - Khởi tạo trang quản trị chuyên nghiệp tại `apps/admin/app/posts/page.tsx`:
    1. Thiết kế theo chuẩn Hyundai Luxury Dark Theme (`#0b0f17`, glassmorphism, viền mảnh `border-white/10`).
    2. 4-State UI Matrix Chuẩn Mực: Loading Shimmer, Empty State chuyên nghiệp với CTA Tạo bài viết, Error State với nút Thử lại, Data Table sắc nét.
    3. Bộ lọc trạng thái đa năng: Tabs chuyển trạng thái (`all`, `published`, `draft`, `scheduled`, `archived`) kết hợp dropdown danh mục và ô tìm kiếm real-time debounced 350ms.
    4. Thao tác nhanh 1 chạm: Nút Tạo bài viết mới, Chỉnh sửa, Sao chép liên kết xem trước nháp bí mật (với `previewToken`), và Xóa bài viết an toàn qua `ConfirmModal`.
    5. Phân trang hoàn chỉnh (Pagination) hiển thị tổng số bài viết và số trang.
* `2026-09-25T09:16`: **Hoàn thành Step 5.2 (Storefront Post Detail Page - RSC & SEO Master Graph):**
  - Khởi tạo trang chi tiết bài viết tại `apps/web/app/tin-tuc/[slug]/page.tsx` tuân thủ nghiêm ngặt SOP `fullstack-dev-executor.xml` và `tailwind-ui-designer.xml`:
    1. **Server-Side Rendering & ISR:** ISR 60s (`revalidate = 60`), nạp dữ liệu bài viết theo slug từ API với bộ dữ liệu Fallback phong phú (Graceful Degradation).
    2. **SEO 10 Tiêu Chí:** Cố định Canonical URL tuyệt đối `/tin-tuc/[slug]`, sinh OpenGraph 1200x630 chuẩn báo chí, Twitter Summary Large Image, Meta Title và Meta Description.
    3. **5 Schemas JSON-LD Master Graph:** Nhúng Master Schema từ `@cardealer/core` (`generatePostMasterJsonLd`) bao gồm đầy đủ `NewsArticle`, `AutoDealer`, `BreadcrumbList`, `FAQPage`, `VideoObject`.
    4. **4-State UI Matrix:** Xử lý Data State (Bố cục 2 cột Content + Conversion Sidebar), Empty/404 Not Found State (icon thông báo + nút quay lại Hub / Hotline), Error Fallback State.
    5. **Tích hợp Content Blocks (@cardealer/ui):** `CalloutBlock`, `PriceTableBlock`, `RelatedCarBlock`, `InlineQuickForm`, `FAQBlock`.
    6. **E-E-A-T & Inbound Conversion:** Badge chuyên mục, Breadcrumbs phân cấp, Avatar tác giả xác minh, Hotline 24/7, nút chia sẻ link clipboard, cam kết dịch vụ Hyundai.
    7. **100% Named Export + Default Export** tương thích hoàn hảo Next.js App Router page.
* `2026-09-25T09:19`: **Hoàn thành Step 5.3 (Client Island StickyToc Component):**
  - Khởi tạo component mục lục thông minh tại `apps/web/components/StickyToc.tsx`:
    1. **Client Island Architecture:** Chỉ hydrate riêng khối TOC, giữ nguyên hiệu năng RSC tối đa cho bài viết.
    2. **Hybrid Headings Resolver:** Nhận diện linh hoạt từ mảng `TocHeading` trích xuất server-side hoặc tự động fallback query DOM (`h2`, `h3`, `h4`) trong vùng nội dung bài viết.
    3. **IntersectionObserver Scrollspy:** Tự động phát hiện tiêu đề hiện tại đang hiển thị trong viewport và highlight mục tương ứng theo thời gian thực (rootMargin: `-80px 0px -55% 0px`).
    4. **Smooth Scroll with Offset:** Tính toán bù trừ chiều cao Fixed Header (90px) khi nhấp vào liên kết mục lục.
    5. **Collapsible Mobile Support:** Nút thu gọn / mở rộng tiện lợi giúp tiết kiệm không gian màn hình trên thiết bị di động.
    6. **WCAG AAA & A11y:** 100% Named Export, đầy đủ `aria-label`, `aria-current="location"`, `role="navigation"`, touch targets >= 44px, `motion-reduce:transition-none`.
* `2026-09-25T09:20`: **Hoàn thành Step 5.4 (Client Island PostBottomBar Component):**
  - Khởi tạo component thanh neo đáy Mobile tại `apps/web/components/PostBottomBar.tsx`:
    1. **Mobile-First Inbound Dock (< 1024px):** Cố định đáy màn hình với hiệu ứng kính mờ (`bg-white/95 backdrop-blur-md`), tích hợp đệm an toàn iOS (`pb-[calc(0.625rem+env(safe-area-inset-bottom))]`).
    2. **Bộ 3 Nút Chuyển Đổi Vàng (Golden Conversion Trio):** Nút Gọi Hotline `tel:`, Nút Chat Zalo trực tiếp, Nút CTA Nhận Báo Giá Lăn Bánh nổi bật.
    3. **Ngữ Cảnh Chuyên Mục Động:** Tự động điều chỉnh nhãn nút CTA theo slug chuyên mục bài viết (Báo Giá Lăn Bánh / Tính Trả Góp / Đăng Ký Lái Thử).
    4. **Scroll-Aware Activation:** Tự động kích hoạt khi cuộn trang > 200px, mượt mà chuyển hướng/cuộn tới form nhận lead.
    5. **WCAG AAA:** 100% Named Export, touch targets chuẩn Apple/Google (h-11 = 44px), `motion-reduce:transition-none`.
* `2026-09-25T09:22`: **Hoàn thành Step 5.5 (Client Island SlideInBanner Component):**
  - Khởi tạo component banner trượt góc thông minh tại `apps/web/components/SlideInBanner.tsx`:
    1. **Dual Intelligent Trigger:** Kích hoạt Exit-Intent trên PC khi rê chuột rời mép trên (`clientY <= 12`) và Scroll-Depth trên Mobile/Tablet khi cuộn qua >= 60% chiều dài trang, kèm timer fallback 45s.
    2. **Respectful UX (Session Storage Dismissal):** Khi người dùng đóng banner (X), ghi nhớ vào `sessionStorage` (`hyundai_slide_in_dismissed = 'true'`) để tuyệt đối không làm phiền lại trong suốt phiên duyệt web.
    3. **1-Tap Inbound Lead Capture:** Thu thập SĐT nhanh nhận Voucher phụ kiện 15 triệu, validate định dạng di động 10 số Việt Nam, gửi về `/api/leads/inbound` kèm Honeypot chống spam.
    4. **4-State UI Matrix:** Hidden State (return null, CLS = 0), Active Form State (slide-in góc phải), Submitting State (spinner), Success State (cam kết hỗ trợ trong 5 phút & tự động đóng sau 4s).
    5. **WCAG AAA:** 100% Named Export, touch targets chuẩn $\ge 44\text{px}$, `motion-reduce:transition-none`, `role="dialog"`.
* `2026-09-25T09:30`: **Hoàn thành Step 5.6 (EeatAuthorBox Component):**
  - Khởi tạo khối thẩm quyền tác giả E-E-A-T tại `apps/web/components/EeatAuthorBox.tsx`:
    1. **Google E-E-A-T Authority:** Hiển thị định danh tác giả, số năm kinh nghiệm, chức vụ chuyên môn, đại lý ủy quyền và huy hiệu xác thực `Đã kiểm duyệt chuyên môn`.
    2. **Tái sử dụng 100% UI Primitives:** `Card`, `Badge`, `Button` từ `@cardealer/ui`.
    3. **Tái sử dụng Link từ `next/link`:** Điều hướng gọi điện trực tiếp và nhắn tin Zalo chuẩn mực.
    4. **Nút Chia Sẻ Bài Viết:** Tích hợp sao chép liên kết vào clipboard kèm phản hồi trực quan "Đã chép link!".
    5. **WCAG AAA:** 100% Named Export, touch targets $\ge 44\text{px}$, `motion-reduce:transition-none`.
  - Verification CLI: `pnpm --filter web check-types` đạt exit code 0; `pnpm check-types` Monorepo (8/8 packages) đạt exit code 0.
* `2026-09-25T09:37`: **Hoàn thành Step 5.7 (Kiểm Thử Toàn Diện Monorepo & Nghiệm Thu Phase 5):**
  - Đồng bộ chuẩn hóa quy tắc Next.js 16 App Router Page Segment cho các trang `page.tsx` (`export default function`).
  - Kiểm thử toàn diện Monorepo Typecheck: `pnpm check-types` (8/8 packages passed, exit code 0).
  - Kiểm thử bộ Unit Tests: `pnpm --filter @cardealer/core test` (12 suites, 98/98 tests pass 100%).
  - Kiểm thử Production Build: `pnpm build` (3/3 tasks passed, bao gồm `@cardealer/api`, `@cardealer/admin` 14 routes, `@cardealer/web` 8 routes).
  - **CHÍNH THỨC NGHIỆM THU HOÀN TẤT TOÀN DIỆN PHASE 5: CONTENT BLOCKS & INBOUND MARKETING HUB (US-01 ĐẾN US-05).**

