# 📝 ROADMAP & TODO: REFACTOR POST EDITOR STUDIO (`POST-EDITOR-REFACTOR`)

> **Tuân thủ:** `universal-agentic-workflow.xml` & `fullstack-dev-executor.xml` (v3.2.0)  
> **Nguyên tắc trọng tâm:** `unit_size_limit` (Diff < 300 dòng mỗi Unit), SRP (Single Responsibility Principle), Zero Any, 100% `@cardealer/ui`.  
> **Mục tiêu:** Tinh gọn file nguyên khối `apps/admin/app/posts/[id]/page.tsx` (3,440 dòng) thành kiến trúc module hóa hướng components sạch sẽ, dễ bảo trì, hiệu năng cao.

---

## 📌 Danh Sách Các Đơn Vị Nguyên Tử (Micro-Roadmap)

| Unit ID | File(s) Tác Động | Risk Tier | Coupled Unit? | Trạng Thái | Mô Tả & Tiêu Chí Nghiệm Thu |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **U-01** | `apps/admin/app/posts/[id]/types.ts`<br>`apps/admin/app/posts/[id]/constants.ts`<br>`apps/admin/app/posts/[id]/utils.ts` | 🟡 LOW | **Có** (Core contracts) | ✅ COMPLETED | Trích xuất toàn bộ interfaces (`BlockType`, `EditorBlock`, `PriceVersionItem`), themes (`CALLOUT_THEMES`) và helpers tiền tệ/slug. |
| **U-02** | `apps/admin/app/posts/[id]/components/PostEditorHeader.tsx`<br>`apps/admin/app/posts/[id]/components/AddBlockMenu.tsx` | 🟡 LOW | **Không** | ✅ COMPLETED | Trích xuất Header Toolbar (Quay lại, Trạng thái bài viết, Nút Xem trước, Lưu nháp, Xuất bản) và Menu thêm 14 loại block nội dung. |
| **U-03** | `apps/admin/app/posts/[id]/components/BlockItemWrapper.tsx` | 🟡 LOW | **Không** | ✅ COMPLETED | Trích xuất khung bao bọc Card Block chuẩn Glassmorphism kèm thanh điều hướng (di chuyển lên/xuống, badge loại khối, nút xóa). |
| **U-04** | `apps/admin/app/posts/[id]/components/blocks/HeadingBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/ParagraphBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/CalloutBlock.tsx` | 🟠 MEDIUM | **Có** (Text Blocks) | ✅ COMPLETED | Trích xuất nhóm các khối soạn thảo văn bản cơ bản (Tiêu đề H2/H3, Đoạn văn, Hộp thông báo Callout đa chủ đề). |
| **U-05** | `apps/admin/app/posts/[id]/components/blocks/SingleImageBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/ImageGalleryBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/GalleryImageItemCard.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/VideoBlocks.tsx` | 🟠 MEDIUM | **Có** (Media Blocks) | ✅ COMPLETED | Trích xuất nhóm khối media có tích hợp upload Cloudinary CDN trực tiếp (Ảnh đơn, Thư viện ảnh lướt Carousel/Grid, Video YouTube & TikTok). |
| **U-06** | `apps/admin/app/posts/[id]/components/blocks/FaqBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/ProsConsBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/CtaButtonBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/LeadFormBlock.tsx` | 🟠 MEDIUM | **Có** (Interactive Blocks) | ✅ COMPLETED | Trích xuất nhóm khối tăng tỷ lệ chuyển đổi và tương tác (Hỏi đáp FAQ chuẩn Schema, Đánh giá Ưu/Nhược điểm, Nút kêu gọi hành động CTA, Form nhận báo giá). |
| **U-07** | `apps/admin/app/posts/[id]/components/blocks/RelatedCarBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/PriceTableBlock.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/PriceTableRow.tsx`<br>`apps/admin/app/posts/[id]/components/blocks/SpecTableBlock.tsx` | 🟠 MEDIUM | **Có** (Car Data Blocks) | ✅ COMPLETED | Trích xuất nhóm khối gắn liền với Catalog xe (Dòng xe liên quan, Bảng giá lăn bánh kèm lọc dòng xe, Bảng so sánh thông số kỹ thuật). |
| **U-08** | `apps/admin/app/posts/[id]/components/PostEditorSidebar.tsx` | 🟠 MEDIUM | **Không** | ⏳ PENDING | Trích xuất Cột Phải Sidebar: Động cơ chấm điểm SEO Real-Time (`calculateSeoScore`), Danh mục, Ảnh đại diện, Trạng thái và Cài đặt Meta SEO nâng cao. |
| **U-09** | `apps/admin/app/posts/[id]/page.tsx` | 🟠 MEDIUM | **Không** | ⏳ PENDING | Tái cấu trúc file chính `page.tsx`, liên kết các components đã tách, giảm số dòng từ 3,440 xuống < 400 dòng sạch sẽ. |
| **U-10** | `scripts/verify_post_editor_refactor.sh` | 🟡 LOW | **Không** | ⏳ PENDING | Xây dựng kịch bản kiểm chứng tự động toàn diện kiểm tra typecheck, design system và tính toàn vẹn của tất cả các components đã refactor. |

---

## 🔒 Quy Định Bắt Buộc Khi Thực Thi
1. **Tuân thủ `unit_size_limit`**: Mỗi Unit diff không vượt quá 300 dòng code.
2. **Tuân thủ `single_step`**: Mỗi turn chỉ làm đúng 1 Unit, verify, commit rồi DỪNG chờ Developer phê duyệt lệnh tiếp tục.
3. **Commit độc lập, tuyến tính**: Không dùng `--amend`, mỗi Unit = 1 commit rõ ràng.
4. **Machine Verification**: Mọi xác nhận pass phải đi kèm lệnh terminal và exit code 0 thực tế.
