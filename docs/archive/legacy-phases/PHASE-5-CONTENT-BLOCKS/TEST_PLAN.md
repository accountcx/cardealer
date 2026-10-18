# 🧪 KẾ HOẠCH KIỂM THỬ TOÀN DIỆN (TEST PLAN & AUTOMATION SUITE)
## Phase 5: Hệ Thống Tin Tức, Content Blocks & Inbound Marketing Hub (Hyundai Vinh)

> **Mã Epic:** `EPIC-PHASE-5-CONTENT-BLOCKS-INBOUND`  
> **Quy chuẩn thực thi:** **Universal Agentic Workflow (v2.2.0)** — Giai đoạn 3 (Test Plan)  
> **Chuyên gia phụ trách:** `qa-test-engineer`, `dependency-graph-analyzer`  
> **Phiên bản:** v1.0.0 (Áp dụng cho Option B + Tiptap Editor + CRO Tinh Gọn)

---

## 1. Mục Tiêu & Chiến Lược Kiểm Thử (Testing Strategy)

Chiến lược kiểm thử tuân thủ nguyên tắc **Shift-Left Testing** và **Automation-First** trong Monorepo:
1. **Lớp 1: Static Type & Contract Verification:** Sử dụng `pnpm check-types` kiểm tra tính tương thích 100% của TypeScript và Zod schemas giữa các packages.
2. **Lớp 2: Isolated Unit Tests (Vitest):** Kiểm thử độc lập bộ bóc tách Tiptap AST, bộ tính điểm SEO 10 tiêu chí, và bộ sinh Schema JSON-LD đa tầng.
3. **Lớp 3: Integration & Edge-Case Tests:** Kiểm thử Middleware 301 Redirect (chống vòng lặp), luồng thu thập Lead Inbound (chống spam Honeypot), và cơ chế Paywall Schema chống phạt Cloaking.
4. **Lớp 4: Monorepo Production Build Verification:** Kiểm thử lệnh build sản phẩm `pnpm build` để đảm bảo Next.js RSC và SSR không phát sinh lỗi biên dịch.

---

## 2. Kịch Bản Kiểm Thử Chi Tiết Theo Từng Vertical Slice

### 🔹 SLICE 1: Database Schema, Post States, Leads Attribution & 8 Blocks Data Contracts
* **Mục tiêu:** Đảm bảo toàn vẹn dữ liệu, các quan hệ Foreign Keys, và Zod schemas bọc dữ liệu an toàn.
* **Lệnh CLI kiểm thử:**
  ```bash
  pnpm check-types
  pnpm --filter @cardealer/core test
  ```
* **Kịch bản kiểm thử (Test Cases):**
  - `TC-01.1 (Drizzle Migration)`: Khởi tạo schema migration cho các bảng `posts`, `categories`, `post_tags`, `redirects` và các cột mở rộng của `leads`. Xác nhận migration chạy mượt mà, không xung đột với bảng `cars` hiện có.
  - `TC-01.2 (Post State Enum)`: Kiểm tra các trạng thái bài viết (`draft`, `published`, `scheduled`, `archived`). Chặn các chuyển đổi trạng thái phi lý.
  - `TC-01.3 (Zod Schema 8 Blocks)`: Kiểm thử Zod validation cho từng block trong số 8 blocks tinh hoa. Cung cấp payload thiếu trường bắt buộc ➔ Đảm bảo trả về ZodError chi tiết.
  - `TC-01.4 (Tiptap AST Extractor)`: Truyền Tiptap JSON AST mẫu vào `extractHeadingsFromTiptap`, `extractFaqsFromTiptap`, `extractVideosFromTiptap` ➔ Kiểm tra mảng kết quả trả về đúng định dạng mong đợi.

---

### 🔹 SLICE 2: 8 Content Blocks Library & High-Converting Inbound Components
* **Mục tiêu:** Render trực quan 8 blocks tinh hoa và 3 điểm chạm Inbound Lead chuẩn xác, không vỡ layout trên mobile.
* **Lệnh CLI kiểm thử:**
  ```bash
  pnpm --filter @cardealer/ui test
  pnpm --filter web test
  ```
* **Kịch bản kiểm thử (Test Cases):**
  - `TC-02.1 (CalloutBlock)`: Render 4 biến thể (`info`, `warning`, `success`, `note`). Kiểm tra màu sắc và icon hiển thị tương ứng.
  - `TC-02.2 (TableBlock Mobile & CSV)`:
    - Kiểm tra thẻ bọc `overflow-x-auto` và kích thước tối thiểu `min-w-[540px]`.
    - Kiểm tra tính năng lọc Live Search (debounced 200ms) trả về đúng hàng khớp từ khóa.
    - Kiểm tra hàm xuất CSV: File tải về có tiền tố BOM `\uFEFF` và nội dung tiếng Việt có dấu chuẩn xác.
  - `TC-02.3 (TikTokBlock Facade Pattern)`:
    - Trạng thái ban đầu: Thẻ `<iframe>` KHÔNG tồn tại trong DOM; chỉ có ảnh poster WebP và nút Play SVG.
    - Sau khi click nút Play: `<iframe>` xuất hiện với thuộc tính `src` chứa `autoplay=1`.
    - Xác nhận các class CSS khử scrollbar được gắn đầy đủ.
  - `TC-02.4 (InlineQuickForm & GatedContent CRO)`:
    - Form chỉ chứa 2 trường nhập: Họ tên + Số điện thoại (không có checkbox điều khoản).
    - Validation số điện thoại Việt Nam hợp lệ (10 chữ số).
    - Mở khóa nội dung mờ (Gated Content) ngay lập tức sau khi form báo submit thành công (`isUnlocked = true`).

---

### 🔹 SLICE 3: SEO Engine, 10-Criteria Checker, Schemas & 301 Redirect Engine
* **Mục tiêu:** Bộ chấm điểm SEO tính toán chuẩn xác, Schema JSON-LD hợp lệ 100%, Middleware 301 chuyển hướng an toàn.
* **Lệnh CLI kiểm thử:**
  ```bash
  pnpm --filter @cardealer/core test packages/core/src/seo/
  ```
* **Kịch bản kiểm thử (Test Cases):**
  - `TC-03.1 (10 SEO Criteria Scoring)`:
    - Tiêu đề < 40 ký tự hoặc > 65 ký tự ➔ Trừ điểm tiêu chí Title Length.
    - Thiếu từ khóa chính trong đoạn mở đầu ➔ Cảnh báo Intro Keyword.
    - Mật độ từ khóa > 2.5% ➔ Cảnh báo Keyword Stuffing.
    - Đếm chính xác số thẻ H2 và từ khóa phụ trong H2.
  - `TC-03.2 (Paywall Schema Validation)`:
    - Bài viết có khối `GatedContent` ➔ Schema `NewsArticle` tự động bổ sung `isAccessibleForFree: false` và `hasPart.cssSelector: ".gated-content-section"`.
    - Bài viết thường ➔ Thuộc tính `isAccessibleForFree` là `true`.
  - `TC-03.3 (301 Redirect Loop Prevention)`:
    - Thử tạo redirect A ➔ B, sau đó tạo B ➔ A ➔ Hệ thống chặn và ném lỗi `RedirectLoopDetectedException`.
    - Thử chuỗi redirect A ➔ B ➔ C ➔ Hệ thống tự động nắn thẳng thành A ➔ C và B ➔ C.
    - Truy cập URL cũ ➔ Trả về HTTP Status `301 Moved Permanently` với header `Location` đúng đường dẫn mới.

---

### 🔹 SLICE 4: Admin Editorial Management, Preview Link & Post Verification
* **Mục tiêu:** Thao tác biên tập mượt mà với Tiptap Editor, link preview bí mật an toàn, bảo vệ dữ liệu Lead.
* **Lệnh CLI kiểm thử:**
  ```bash
  pnpm --filter api test
  pnpm --filter admin test
  ```
* **Kịch bản kiểm thử (Test Cases):**
  - `TC-04.1 (Admin Posts CRUD)`: Tạo bài mới ở trạng thái `draft`, cập nhật nội dung Tiptap AST, lưu thành công vào PostgreSQL.
  - `TC-04.2 (Publish Gatekeeper)`:
    - Bài viết còn chứa chuỗi ký tự giữ chỗ `[...]` ➔ Nút xuất bản bị chặn, hiển thị thông báo lỗi cụ thể vị trí còn sót.
    - Bài viết chưa chọn ảnh đại diện hoặc thiếu Alt text ➔ Chặn xuất bản.
  - `TC-04.3 (Secure Preview Token)`:
    - Bài viết nháp có thể xem trước qua đường dẫn `/tin-tuc/preview?token=XYZ`.
    - Token sai hoặc hết hạn (> 24h) ➔ Trả về lỗi 403 Forbidden.
  - `TC-04.4 (Lead Ingestion & Attribution)`:
    - Submit lead từ bài viết ➔ Bảng `leads` lưu đúng `postId`, `authorId`, `sourceType` và UTM tags.
    - Honeypot chống spam: Điền dữ liệu vào hidden field ➔ API âm thầm bỏ qua, trả về HTTP 200 giả định để đánh lừa bot.

---

### 🔹 SLICE 5: Storefront News Experience, Sticky Mobile Bottom Bar, Slide-in Banner & Verification
* **Mục tiêu:** Trải nghiệm người dùng mượt mà, chuẩn Core Web Vitals, tương thích hoàn hảo thiết bị di động.
* **Lệnh CLI kiểm thử:**
  ```bash
  pnpm check-types
  pnpm build
  ```
* **Kịch bản kiểm thử (Test Cases):**
  - `TC-05.1 (Storefront Listing & Pagination)`: Truy cập `/tin-tuc`, top 3 bài ghim hiển thị đầu tiên, phân trang URL `?trang=2` hoạt động mượt mà.
  - `TC-05.2 (Article Detail RSC)`: Truy cập `/tin-tuc/[slug]`, bài viết render đầy đủ nội dung từ Tiptap AST mà không tải thư viện Tiptap client runtime. TTFB < 100ms.
  - `TC-05.3 (Sticky Mobile Bottom Bar)`:
    - Trên màn hình Mobile (< 768px): Thanh neo cố định ở đáy màn hình với 3 nút (Gọi, Zalo, Nhận ưu đãi).
    - Nhãn CTA tự động cá nhân hóa theo chuyên mục (ví dụ chuyên mục "Bảng Giá Xe" ➔ CTA hiển thị "Báo Giá Lăn Bánh").
  - `TC-05.4 (Slide-in Banner Behavior)`:
    - Desktop: Kích hoạt khi chuột rời khỏi vùng nhìn phía trên trình duyệt (Exit-intent).
    - Mobile: Kích hoạt khi cuộn vượt quá 60% chiều dài bài viết.
    - Bấm nút Đóng ➔ Ghi nhận `sessionStorage`, không xuất hiện lại trong cùng phiên.
  - `TC-05.5 (Monorepo Build Verification)`: Chạy `pnpm build` toàn hệ thống, xác nhận 0 lỗi TypeScript, 0 lỗi cú pháp JSX/CSS.

---

## 3. Tiêu Chí Nghiệm Thu Chung (Definition of Done - DoD)

Một Vertical Slice chỉ được coi là hoàn tất khi thỏa mãn đầy đủ các điều kiện sau:
1. `pnpm check-types` đạt 100% pass (không có lỗi kiểu dữ liệu).
2. Toàn bộ Unit Tests và Integration Tests liên quan đến slice đó đều pass màu xanh.
3. Không làm suy giảm điểm Google Lighthouse (Mobile Performance ≥ 90, SEO = 100).
4. Code tuân thủ nghiêm ngặt quy tắc: Không dư thừa dependencies, không nạp Tiptap runtime ở Storefront RSC, và không có rào cản checkbox làm giảm tỷ lệ chuyển đổi Lead.
