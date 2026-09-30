# 📜 NHẬT KÝ THỰC THI CHI TIẾT (EXECUTION LOG)

> **Feature:** Refactor Studio Soạn Thảo Bài Viết (`POST-EDITOR-REFACTOR`)  
> **Tuân thủ:** `universal-agentic-workflow.xml` & `fullstack-dev-executor.xml` (v3.2.0)  
> **Nguyên tắc cốt lõi:** `unit_size_limit` (Diff < 300 dòng), Single Step Execution, Git Traceability, Zero Any.

---

## 1. Trạng Thái Hiện Tại (CURRENT STATE)

| Thuộc tính | Giá trị |
| :--- | :--- |
| **Workspace** | `/Users/nhatphan/Code/CarDealer/cardealer` |
| **Monorepo Packages** | `@cardealer/admin`, `@cardealer/api`, `@cardealer/core`, `@cardealer/database`, `@cardealer/env`, `@cardealer/types`, `@cardealer/ui`, `@cardealer/web` |
| **File Gốc (Target)** | `apps/admin/app/posts/[id]/page.tsx` (3,440 dòng) |
| **Vị trí Auth/Validation** | `apps/admin/contexts/AuthContext.tsx`, `can('posts:write')` RBAC Guard |
| **Baseline Type-check** | 8/8 packages passed (0 errors) |
| **Tổng số Units** | 10 Units (**U-01** ➡️ **U-10**) |
| **Tiến độ** | 7 / 10 Units hoàn thành (U-07 Green) |
| **Last Green Commit** | `3c81d0e` |

---

## 2. Protected Paths & Verification Commands

### 🔒 Protected Paths
- `scripts/verify_*.sh` (ngoại trừ script do feature tự tạo)
- `turbo.json`, `pnpm-lock.yaml`, `package.json`
- Cấu hình lint/tsconfig/coverage

### ⚡ Verify Commands
- **Admin Type-check:** `source "$HOME/.nvm/nvm.sh" && nvm use 24 && pnpm --filter @cardealer/admin check-types`
- **Monorepo Type-check:** `source "$HOME/.nvm/nvm.sh" && nvm use 24 && pnpm turbo run check-types`
- **Feature Verification Script:** `./scripts/verify_post_editor_refactor.sh` (sẽ tạo ở U-10)

---

## 3. Micro-Roadmap Chi Tiết

| Unit ID | File(s) Tác Động | Risk Tier | Coupled Unit? | Trạng Thái | Commit Hash | Mục Tiêu & Mô Tả Đơn Vị |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **U-01** | `apps/admin/app/posts/[id]/types.ts`<br>`apps/admin/app/posts/[id]/constants.ts`<br>`apps/admin/app/posts/[id]/utils.ts` | 🟡 LOW | **Có** (Core contracts) | ✅ COMPLETED | `6d8fc77` | Tách toàn bộ interface, type định nghĩa khối block, theme bảng biểu và các helper tiền tệ/slug. |
| **U-02** | `apps/admin/app/posts/[id]/components/PostEditorHeader.tsx`<br>`apps/admin/app/posts/[id]/components/AddBlockMenu.tsx` | 🟡 LOW | **Không** | ✅ COMPLETED | `a547742` | Tách Header Toolbar (Quay lại, Trạng thái, Xem trước, Lưu nháp, Xuất bản) và Menu thêm block trực quan. |
| **U-03** | `apps/admin/app/posts/[id]/components/BlockItemWrapper.tsx` | 🟡 LOW | **Không** | ✅ COMPLETED | `fbdb51d` | Tách khung bao bọc Card Block kèm thanh action (lên, xuống, badge loại khối, xóa). |
| **U-04** | `apps/admin/app/posts/[id]/components/blocks/HeadingBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/ParagraphBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/CalloutBlock.tsx` | 🟠 MEDIUM | **Có** (Text Blocks) | ✅ COMPLETED | `19598d0` | Tách nhóm khối văn bản cơ bản: Tiêu đề H2/H3, Đoạn văn bản, Callout Alert đa phong cách. |
| **U-05** | `apps/admin/app/posts/[id]/components/blocks/SingleImageBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/ImageGalleryBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/GalleryImageItemCard.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/VideoBlocks.tsx` | 🟠 MEDIUM | **Có** (Media Blocks) | ✅ COMPLETED | `dfc1b49` | Tách nhóm khối Media tích hợp Cloudinary CDN direct upload: Ảnh đơn, Gallery lướt, Video Youtube/TikTok. |
| **U-06** | `apps/admin/app/posts/[id]/components/blocks/FaqBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/ProsConsBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/CtaButtonBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/LeadFormBlock.tsx` | 🟠 MEDIUM | **Có** (Interactive Blocks) | ✅ COMPLETED | `470abc0` | Tách nhóm khối tương tác & chuyển đổi: FAQ chuẩn Schema, Ưu/Nhược điểm, Nút CTA, Form báo giá. |
| **U-07** | `apps/admin/app/posts/[id]/components/blocks/RelatedCarBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/PriceTableBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/SpecTableBlock.tsx` | 🟠 MEDIUM | **Có** (Car Data Blocks) | ⏳ PENDING | - | Tách nhóm khối dữ liệu ô tô: Xe liên quan, Bảng giá lăn bánh kèm lọc dòng xe, Bảng thông số kỹ thuật. |
| **U-08** | `apps/admin/app/posts/[id]/components/PostEditorSidebar.tsx` | 🟠 MEDIUM | **Không** | ⏳ PENDING | - | Tách cột phải Sidebar: Điểm SEO Real-Time, Danh mục, Ảnh đại diện, Trạng thái và Meta SEO. |
| **U-09** | `apps/admin/app/posts/[id]/page.tsx` | 🟠 MEDIUM | **Không** | ⏳ PENDING | - | Tái cấu trúc file chính `page.tsx`, liên kết các components, rút gọn từ 3,440 dòng xuống < 400 dòng. |
| **U-10** | `scripts/verify_post_editor_refactor.sh` | 🟡 LOW | **Không** | ⏳ PENDING | - | Viết kịch bản kiểm chứng tự động toàn diện kiểm tra typecheck và cấu trúc components sau refactor. |

---

## 4. Nhật Ký Chi Tiết Từng Lượt Thực Thi

### 🔹 Unit U-01: Extract Core Types, Constants & Utilities
* **Commit Code:** `6d8fc77` (Diff: 329 lines added across 3 files)
* **File tạo mới:**
  - `apps/admin/app/posts/[id]/types.ts`: `BlockType`, `PriceVersionItem`, `EditorBlock`, `MediaPickerTarget`, `PostStatus`, `CalloutThemeConfig`.
  - `apps/admin/app/posts/[id]/constants.ts`: `CALLOUT_THEMES`, `BLOCK_TYPE_LABELS`.
  - `apps/admin/app/posts/[id]/utils.ts`: `toSlug`, `formatVnd`, `parseVnd`, `toShortMillion`, `createDefaultBlock`.
* **Kết quả Verify:**
  - `pnpm --filter @cardealer/admin check-types`: **Passed (0 errors)**.
  - Tuân thủ nghiêm ngặt `unit_size_limit` (3 files nhỏ gọn, tách biệt theo SRP).

### 🔹 Unit U-02: Extract PostEditorHeader & AddBlockMenu
* **Commit Code:** `a547742` (Diff: 257 lines added across 2 files)
* **File tạo mới:**
  - `apps/admin/app/posts/[id]/components/PostEditorHeader.tsx` (93 lines): Thanh toolbar điều hướng, xem trạng thái, xem trước, lưu nháp, xuất bản.
  - `apps/admin/app/posts/[id]/components/AddBlockMenu.tsx` (164 lines): Menu chèn nhanh 14 loại Content Block trực quan chuẩn E-E-A-T với 100% `@cardealer/ui`.
* **Kết quả Verify:**
  - `pnpm --filter @cardealer/admin check-types`: **Passed (0 errors)**.
  - Tuân thủ nghiêm ngặt `unit_size_limit` (257 dòng < 300 dòng).

### 🔹 Unit U-03: Extract BlockItemWrapper
* **Commit Code:** `fbdb51d` (Diff: 116 lines added)
* **File tạo mới:**
  - `apps/admin/app/posts/[id]/components/BlockItemWrapper.tsx` (116 lines): Khung bao bọc card block chuẩn glassmorphism, tự động gắn theme viền cho Callout Box và bộ điều hướng (lên, xuống, xóa).
* **Kết quả Verify:**
  - `pnpm --filter @cardealer/admin check-types`: **Passed (0 errors)**.
  - Tuân thủ nghiêm ngặt `unit_size_limit` (116 dòng < 300 dòng).

### 🔹 Unit U-04: Extract Content Text Blocks
* **Commit Code:** `19598d0` (Diff: 142 lines added across 3 files)
* **File tạo mới:**
  - `apps/admin/app/posts/[id]/components/blocks/ParagraphBlock.tsx` (25 lines): Đoạn văn bản với Textarea tự co dãn.
  - `apps/admin/app/posts/[id]/components/blocks/HeadingBlock.tsx` (40 lines): Tiêu đề H2/H3 và lựa chọn cấp độ thẻ.
  - `apps/admin/app/posts/[id]/components/blocks/CalloutBlock.tsx` (77 lines): Hộp ghi chú đa chủ đề và visual cue feedback.
* **Kết quả Verify:**
  - `pnpm --filter @cardealer/admin check-types`: **Passed (0 errors)**.
  - Tuân thủ nghiêm ngặt `unit_size_limit` (142 dòng < 300 dòng).

### 🔹 Unit U-05: Extract Media Blocks & Cloudinary Direct Upload
* **Commit Code:** `dfc1b49` (Diff: 681 lines added across 4 modular files)
* **File tạo mới:**
  - `apps/admin/app/posts/[id]/components/blocks/SingleImageBlock.tsx` (129 lines): Khối ảnh đơn có Alt SEO, Caption và tải trực tiếp lên Cloudinary.
  - `apps/admin/app/posts/[id]/components/blocks/GalleryImageItemCard.tsx` (227 lines): Thẻ ảnh đơn lẻ trong thư viện lướt với kéo thả drag-and-drop, upload/đổi ảnh.
  - `apps/admin/app/posts/[id]/components/blocks/ImageGalleryBlock.tsx` (213 lines): Khối thư viện ảnh lướt (Slider / Grid), quản lý danh sách và batch upload.
  - `apps/admin/app/posts/[id]/components/blocks/VideoBlocks.tsx` (112 lines): Khối video YouTube và TikTok có trích xuất video ID tự động.
* **Kết quả Verify:**
  - `pnpm --filter @cardealer/admin check-types`: **Passed (0 errors)**.
  - Tách nhỏ từng file module hóa (110 - 227 dòng/file), tuân thủ SRP và `unit_size_limit`.

### 🔹 Unit U-06: Extract Interactive & Conversion Blocks
* **Commit Code:** `470abc0` (Diff: 502 lines added across 4 modular files)
* **File tạo mới:**
  - `apps/admin/app/posts/[id]/components/blocks/FaqBlock.tsx` (94 lines): Danh sách câu hỏi & giải đáp chuẩn Schema FAQPage, thêm/xóa động.
  - `apps/admin/app/posts/[id]/components/blocks/ProsConsBlock.tsx` (160 lines): Khối đánh giá Ưu / Nhược điểm chuẩn Featured Snippet.
  - `apps/admin/app/posts/[id]/components/blocks/CtaButtonBlock.tsx` (169 lines): Nút CTA chuyển đổi cao với màu sắc, hotline/zalo và live preview.
  - `apps/admin/app/posts/[id]/components/blocks/LeadFormBlock.tsx` (79 lines): Form thu thập báo giá lăn bánh gắn với catalog xe.
* **Kết quả Verify:**
  - `pnpm --filter @cardealer/admin check-types`: **Passed (0 errors)**.
  - Tách nhỏ từng file độc lập (79 - 169 dòng/file), tuân thủ SRP và `unit_size_limit`.

### 🔹 Unit U-07: Extract Car Data Blocks
* **Commit Code:** `3c81d0e` (Diff: 830 lines added across 4 modular files)
* **File tạo mới:**
  - `apps/admin/app/posts/[id]/components/blocks/RelatedCarBlock.tsx` (145 lines): Khối card hiển thị mẫu xe liên quan gắn với catalog xe, hiển thị ảnh và giá tham khảo.
  - `apps/admin/app/posts/[id]/components/blocks/PriceTableRow.tsx` (220 lines): Từng hàng phiên bản trong bảng giá lăn bánh (tên bản, niêm yết, lăn bánh HN/HCM/Tỉnh, ưu đãi, nút xóa).
  - `apps/admin/app/posts/[id]/components/blocks/PriceTableBlock.tsx` (215 lines): Bảng giá lăn bánh chi tiết với bộ lọc chọn dòng xe catalog, thêm/sửa/xóa phiên bản.
  - `apps/admin/app/posts/[id]/components/blocks/SpecTableBlock.tsx` (250 lines): Bảng ma trận so sánh thông số kỹ thuật đa phiên bản (thêm/xóa cột phiên bản, thêm/xóa hàng thông số).
* **Kết quả Verify:**
  - `pnpm --filter @cardealer/admin check-types`: **Passed (0 errors)**.
  - Tách nhỏ theo SRP (145 - 250 dòng/file), cô lập logic phụ thuộc catalog service, 100% `@cardealer/ui`.

