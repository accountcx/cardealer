# 📝 Action Plan: Hệ Thống Tin Tức, Content Blocks & Inbound Marketing (Hyundai Vinh)

## Mã Epic: `EPIC-PHASE-5-CONTENT-BLOCKS-INBOUND`
## Định Vị: Hệ Thống Xuất Bản Nội Dung & Inbound Lead Engine Chuyển Đổi Cao (Automotive Content Hub & High-Converting Inbound Lead Funnel)
## Execution Tier: Tier 1 (Core Architecture / High-Impact / Full 5 Phase Lifecycle & Strict Gates 1–5)

---

### 🎯 GIAI ĐOẠN 1: PHÂN TÍCH CHIẾN LƯỢC & LẬP BACKLOG
- [x] **Khảo cổ codebase & Tổng hợp tài liệu đặc tả nguồn**
  - Tài liệu đặc tả Hệ thống Tin tức & Inbound Marketing (09/2026)
  - `docs/03-HE-THONG-CONTENT-BLOCKS-LEXICAL.md`, `docs/05-TECHNICAL-SEO-VA-SCHEMA-JSONLD.md`
- [x] **Xác lập Metadata, Bán kính ảnh hưởng & 3 Góc nhìn chuyên môn**
  - Saler cá nhân (Inbound Lead Gen), Chuyên gia SEO (10 tiêu chí chấm điểm, Schemas đa tầng, 301 Redirect), Chuyên gia UX/UI (3 điểm chạm, Mobile Bottom Bar, Slide-in Banner).
- [x] **Tinh giản phân quyền & Chuẩn hóa 8 Content Blocks Tinh Hoa:**
  - Tạm thời chưa triển khai phân quyền đa tầng phức tạp (RBAC) giữa Saler và BTV.
  - Tinh giản từ 15 blocks cồng kềnh xuống còn **8 Blocks Tinh Hoa** (`CalloutBlock`, `FeatureGridBlock`, `TableBlock` thông minh, `RelatedCarBlock`, `PriceTableBlock`, `YoutubeBlock`, `TikTokBlock`, `GalleryBlock`) + `FAQBlock` + Inbound Lead Points (`Inline Quick Form`, `Gated Content`, `Mini-Calculator`).
  - Tạm thời **bỏ qua** tính năng bắn thông báo bên thứ ba qua Telegram Bot / Email SMTP (lưu trữ lead an toàn vào Database và quản lý tại Admin Portal).
  - Lựa chọn Editor: **Tiptap Editor (`@tiptap/react`)** 100% Free MIT, tương thích Next.js 16 + React 19.
  - Loại bỏ các rào cản checkbox điều khoản Luật 91/2025/QH15, tối ưu form thu thập Lead tinh gọn 1-chạm (SĐT/Zalo + Tên).
- [x] **Lập ma trận Lát cắt tính năng (Vertical Slices US-01 -> US-05)**
- [x] **Xuất bản `docs/features/PHASE-5-CONTENT-BLOCKS/BACKLOG.md` & `TODO.md`**
- [x] 🛑 **GATE 1 APPROVAL:** Đã duyệt thành công bởi Developer qua lệnh `"Confirm Step 1: Duyệt Backlog"`. ✅

---

### 📐 GIAI ĐOẠN 2 & 3: ARCHITECTURE & RISK AUDIT

- [x] **Task 1: Phân tích Solution Options (Sub-Gate 2.1)**
  - Vị trí tác động: `docs/features/PHASE-5-CONTENT-BLOCKS/SOLUTION_OPTIONS.md`
  - Role phụ trách: `system-analyst-architect`
  - DoD: Đã xuất bản 3 phương án kiến trúc. Developer đã chốt: **Option B (Modular Server-First RSC Architecture, Lean Blocks & Tiptap Editor)**. ✅

- [x] **Task 2: Thiết kế Chi tiết Ngũ Tài Liệu (Bước 2.2)**
  - Vị trí tác động: `docs/features/PHASE-5-CONTENT-BLOCKS/` (`FLOW.md`, `SCHEMA.md`, `API_SPEC.md`, `FE_INTEGRATION_GUIDE.md`, `docs/SYSTEM_MAP.md`)
  - Role phụ trách: `logic-flow-ba`, `db-schema-architect`, `feature-spec-generator`, `tailwind-ui-designer`
  - DoD: Hoàn thiện 100% bản vẽ chi tiết cho Option B:
    - [x] `FLOW.md`: Sơ đồ tuần tự xuất bản/hẹn giờ Tiptap, luồng lưu trữ Lead, luồng mở khóa Gated Content, luồng 301 Redirect và luồng Exit-intent Slide-in Banner.
    - [x] `SCHEMA.md`: Data contracts Drizzle ORM (`posts`, `categories`, `post_tags`, `redirects`, `leads`), Zod schemas cho 8 Blocks Tinh Hoa & Inbound Forms.
    - [x] `API_SPEC.md`: Đặc tả endpoints bài viết, tiếp nhận lead, và bộ chấm điểm SEO 10 tiêu chí.
    - [x] `FE_INTEGRATION_GUIDE.md`: Đặc tả UI tokens, Tiptap React NodeViews, Mobile Bottom Bar cá nhân hóa, Slide-in Banner exit-intent, Khối E-E-A-T Saler, Sticky TOC.
    - [x] Đồng bộ `docs/SYSTEM_MAP.md`.
- [x] 🛑 **GATE 2 APPROVAL:** Đã duyệt thành công bởi Developer qua lệnh `"Confirm Step 2: Duyệt Thiết kế"`. ✅

- [x] **Task 3: Risk Audit & Test Plan (Giai đoạn 3)**
  - Vị trí tác động: `docs/features/PHASE-5-CONTENT-BLOCKS/` (`RISK_AUDIT.md` & `TEST_PLAN.md`)
  - Role phụ trách: `dependency-graph-analyzer`, `qa-test-engineer`
  - DoD: Đã xuất bản báo cáo ma trận rủi ro toàn diện (R-01 -> R-14) và kế hoạch kiểm thử tự động CLI chi tiết cho 5 Vertical Slices.
- [x] 🛑 **GATE 3 APPROVAL:** Đã duyệt thành công bởi Developer qua lệnh `"Confirm Step 3: Duyệt Rủi ro & Kế hoạch Kiểm thử"`. ✅

---

### 🚀 GIAI ĐOẠN 4: EXECUTION ROADMAP BY VERTICAL SLICES (THỰC THI CUỐN CHIẾU 1 FILE / 1 TURN)

- [x] **Sub-Gate 4.0:** Pre-coding Roadmap & Tool-Lock Protocol (Đã xuất bản bảng tiêu chuẩn và lộ trình chi tiết tại `EXECUTION_LOG.md`). ✅
- [x] **Step 1.1:** Định nghĩa Drizzle schema: Bảng `posts` (`packages/database/src/schema/posts.ts` đã xong ✅).
- [x] **Step 1.2:** Mở rộng Drizzle schema: Bảng `leads` (`packages/database/src/schema/leads.ts` đã xong ✅).
- [x] **Step 1.3:** Export toàn bộ schemas mới từ `packages/database/src/schema/index.ts` (đã xong ✅).
- [x] **Step 1.4:** Định nghĩa Zod Schemas và TypeScript interfaces cho 8 Content Blocks Tinh Hoa tại `packages/types/src/content-blocks.ts` (đã xong ✅).
- [x] **Step 1.5:** Xây dựng bộ tiện ích bóc tách AST tại `packages/core/src/tiptap/` (`extractHeadingsFromTiptap`, `extractFaqsFromTiptap`, `extractVideosFromTiptap`, `hasGatedContent`) (đã xong ✅).
- [x] **Step 1.6:** Hoàn thành kiểm chứng Slice 1 (`pnpm check-types` 8/8 packages + 56/56 unit tests pass 100%) (đã xong ✅).
- [x] **Step 1.7:** Re-export toàn bộ types & schemas content-blocks qua barrel file `packages/types/src/index.ts` (đã xong ✅).
- [x] **Step 1.8:** Sinh file migration SQL `drizzle/0003_absurd_dreaming_celestial.sql` qua `drizzle-kit generate` (đã xong ✅).

#### 🔹 SLICE 2: US-02 — 8 Content Blocks Library & High-Converting Inbound Components
* **Role phụ trách:** `fullstack-dev-executor` (kết hợp `tailwind-ui-designer`) (Layer: UI Components & Forms)
* **Target Files:** `packages/ui/src/blocks/` (8 blocks components), `apps/web/components/blocks/`
* **Phương pháp kiểm chứng (DoD):** Render hoàn hảo 8 blocks; Form nhận Lead tinh gọn 1-chạm không rào cản; Khử sạch thanh cuộn TikTok trên mobile; Table search/sort trơn tru.
- [x] **Step 2.1:** Xây dựng `CalloutBlock` (4 màu: info, warning, success, note kèm icon) (đã xong ✅).
- [x] **Step 2.2:** Xây dựng `FeatureGridBlock` (2, 3, 4 cột, hover zoom) (đã xong ✅).
- [x] **Step 2.3:** Xây dựng `TableBlock` thông minh (cuộn ngang, toggle Live Search & Export CSV UTF-8 BOM) (đã xong ✅).
- [x] **Step 2.4:** Xây dựng `TikTokBlock` (tỉ lệ 9:16, Facade poster, autoplay v1, triệt tiêu scrollbar) (đã xong ✅).
- [x] **Step 2.5:** Xây dựng `YoutubeBlock` (16:9 Facade lazy-load) (đã xong ✅).
- [x] **Step 2.6:** Xây dựng `RelatedCarBlock` (card xe liên quan, giá niêm yết, CTA) (đã xong ✅).
- [x] **Step 2.7:** Xây dựng `PriceTableBlock` (bảng giá tự động từ DB) (đã xong ✅).
- [x] **Step 2.8:** Xây dựng `GalleryBlock` (slider vuốt ngang + Lightbox phóng to) (đã xong ✅).
- [x] **Step 2.9:** Xây dựng `FAQBlock` (Accordion hỏi đáp mượt mà) (đã xong ✅).
- [x] **Step 2.10:** Xây dựng `InlineQuickForm` (nhập SĐT/Zalo + Họ tên 1-chạm nhận ưu đãi) (đã xong ✅).
- [x] **Step 2.11:** Xây dựng `GatedContent` (Làm mờ phần quà tặng/bảng tính đặc quyền, mở khóa tức thì) (đã xong ✅).
- [x] **Step 2.12:** Hoàn thành kiểm chứng Slice 2 (Render, responsive, types pass 100%) (đã xong ✅).

#### 🔹 SLICE 3: US-03 — SEO Engine, 10-Criteria Checker, Schemas & 301 Redirect Engine
* **Role phụ trách:** `fullstack-dev-executor` (Layer: Core SEO / API Middleware)
* **Target Files:** `packages/core/src/seo/score.ts`, `packages/core/src/seo/json-ld.ts`, `apps/api/src/middleware/redirect.ts`
* **Phương pháp kiểm chứng (DoD):** Điểm SEO tính toán chính xác 10 tiêu chí; Rich Results Test pass 100% schemas; Thử nghiệm đổi slug nhận mã 301 chuyển hướng URL an toàn.
- [x] **Step 3.1:** Xây dựng hàm chấm điểm SEO 10 tiêu chí real-time tại `packages/core/src/seo/score.ts` (Title length, Slug, Intro keyword, Density, Word count, H2 count/keyword, Alt tags, Internal links, Meta desc, Cannibalization check) (đã xong ✅).
- [ ] **Step 3.2:** Mở rộng bộ sinh mã Schema JSON-LD đa tầng: `NewsArticle`, Paywall Schema `isAccessibleForFree: false`, `BreadcrumbList`, `AutoDealer`, `FAQPage`, `VideoObject`.
- [ ] **Step 3.3:** Xây dựng Middleware xử lý 301 Redirects tự động từ bảng `redirects` khi sửa Slug bài viết.
- [ ] **Step 3.4:** Hoàn thành kiểm chứng Slice 3 (Unit tests chấm điểm SEO, schema validation, test redirect 301).

#### 🔹 SLICE 4: US-04 — Admin Editorial Management, Preview Link & Post Verification
* **Role phụ trách:** `fullstack-dev-executor` (Layer: Apps Admin & Backend APIs)
* **Target Files:** `apps/admin/app/posts/`, `apps/api/src/routes/posts.ts`
* **Phương pháp kiểm chứng (DoD):** Thao tác CRUD bài viết mượt mà với Tiptap Editor; Xuất bản chặn nếu còn `[...]`; Lead submit từ web lưu trữ chuẩn xác vào DB.
- [ ] **Step 4.1:** Xây dựng REST APIs quản lý bài viết tại `apps/api/src/routes/posts.ts` (CRUD, Publish, Schedule, Archive).
- [ ] **Step 4.2:** Xây dựng giao diện Admin Posts: Bảng danh sách bài viết theo trạng thái, Bộ soạn thảo Tiptap Blocks với 8 Blocks tinh hoa, Trình chấm điểm SEO 10 tiêu chí trực quan.
- [ ] **Step 4.3:** Xây dựng tính năng xuất bản & Link Preview bí mật:
  - Tạo nháp ➔ Kiểm tra điều kiện (tiêu đề, chuyên mục, ảnh + alt, meta desc, không còn `[...]`, xác nhận bản quyền ảnh giao xe) ➔ Xuất bản hoặc hẹn giờ tự động.
  - Link Preview xem trước bài viết với token bảo mật.
- [ ] **Step 4.4:** Xây dựng API tiếp nhận lead từ bài viết, lưu vết `postId`, `salerId`, `utmSource`.
- [ ] **Step 4.5:** Hoàn thành kiểm chứng Slice 4 (CRUD bài viết, link preview, test lưu lead vào DB).

#### 🔹 SLICE 5: US-05 — Storefront News Experience, Sticky Mobile Bottom Bar, Slide-in Banner & Verification
* **Role phụ trách:** `fullstack-dev-executor` (Layer: Apps Web / Client Islands)
* **Target Files:** `apps/web/app/tin-tuc/`, `apps/web/components/PostBottomBar.tsx`, `apps/web/components/SlideInBanner.tsx`, `apps/web/components/EeatAuthorBox.tsx`
* **Phương pháp kiểm chứng (DoD):** Core Web Vitals LCP ≤ 2.5s, CLS ≤ 0.1; Mobile bar click gọi/Zalo/Form mượt mà; Slide-in banner không che màn hình và không lặp lại; `pnpm build` pass 100%.
- [ ] **Step 5.1:** Xây dựng trang danh sách tin tức `/tin-tuc` (Top 3 bài ghim nổi bật, Card bài viết hiển thị thời gian đọc, Phân trang URL `?trang=2`, SEO mô tả chuyên mục).
- [ ] **Step 5.2:** Xây dựng trang chi tiết `/tin-tuc/[slug]` (Next.js RSC + ISR, `TiptapRenderer`, Sticky TOC Scrollspy, E-E-A-T Box, Quản lý ưu đãi hết hạn).
- [ ] **Step 5.3:** Xây dựng component `PostBottomBar` (Mobile Sticky Bar neo đáy màn hình 3 nút: Gọi điện, Zalo, Nhận ưu đãi với nhãn CTA tự động cá nhân hóa theo Chuyên mục + Dòng xe).
- [ ] **Step 5.4:** Xây dựng component `SlideInBanner` (Popup trượt góc nhỏ gọn kích hoạt theo exit-intent trên PC hoặc scroll-depth > 60% trên mobile, có nút đóng và giới hạn 1 lần/phiên).
- [ ] **Step 5.5:** Xây dựng component `EeatAuthorBox` gắn ở chân bài viết (Ảnh Saler, tên, hotline, Zalo).
- [ ] **Step 5.6:** Tracking sự kiện click gọi điện (`tel:`) và Zalo đẩy về Analytics.
- [ ] **Step 5.7:** Kiểm thử toàn diện Monorepo (`pnpm check-types`, `pnpm build`).

---

### 🛡️ GIAI ĐOẠN 5: REVIEW ĐỘC LẬP & BÀN GIAO TOÀN DIỆN
- [ ] Thực hiện Independent Code Review & Audit chuẩn bảo mật, SEO, responsive, performance.
- [ ] Xuất bản `docs/features/PHASE-5-CONTENT-BLOCKS/CODE_REVIEW.md` & `EXECUTION_LOG.md`.
- [ ] Bàn giao và nghiệm thu sản phẩm hoàn chỉnh.
