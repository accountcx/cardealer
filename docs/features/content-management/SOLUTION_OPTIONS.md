# 💡 SOLUTION OPTIONS: Paragraph Internal Links Engine

> **Module:** `content-management`  
> **Phiên bản:** `v1.2.0`  
> **Căn cứ:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md)  

---

## 1. Bối Cảnh & Bài Toán Nghiệp Vụ
Trong trình biên tập bài viết của CarDealer CMS (`/posts/[id]`), khối **"Đoạn văn bản" (`ParagraphBlock`)** là khối xuất hiện nhiều nhất và chứa nội dung cốt lõi của bài viết.
- **Vấn đề:** Hiện tại `ParagraphBlock` chỉ là một `Textarea` nhập văn bản thô, chưa có cơ chế gắn liên kết nội bộ (Internal Links) tới các dòng xe trong showroom, bảng giá, dự toán chi phí hoặc các bài viết liên quan.
- **Hệ quả:** Biên tập viên không thể xây dựng cấu trúc Internal Linking chuẩn SEO trên từng đoạn văn, làm giảm chỉ số SEO On-page và giảm tỷ lệ điều hướng khách hàng tới trang sản phẩm xe cụ thể.
- **Yêu cầu:** Cho phép gắn liên kết nội bộ tự nhiên, mượt mà trong khối Đoạn văn bản, tương thích hoàn toàn với Tiptap JSON AST Tree và bộ kết xuất HTML của Storefront.

---

## 2. So Sánh Các Phương Án Kỹ Thuật

| Tiêu chí | Phương Án A: Nhúng Trình Soạn Thảo WYSIWYG Nặng Vào Từng Block | Phương Án B: Cú Pháp Markdown Chuẩn Kèm Thanh Công Cụ & Quick Chips (Đề Xuất) | Phương Án C: Mảng Đối Tượng Link Riêng Biệt Ngoài Văn Bản |
| :--- | :--- | :--- | :--- |
| **Cơ chế hoạt động** | Tích hợp full Tiptap/Quill instance vào bên trong Textarea của từng khối Paragraph. | Lưu văn bản dạng Markdown linh hoạt `[anchor](url)`. Cung cấp Toolbar chèn link 🔗, Quick Chips dòng xe/tiện ích và Modal trực quan. | Khối có trường `content` riêng và trường `links: [{ text, url }]` riêng biệt. |
| **Hiệu năng & Bundle Size** | 🔴 Rất nặng: Gây đơ giao diện khi bài viết có 20-30 khối (khởi tạo hàng chục editor instance). | 🟢 Siêu nhẹ: Giữ nguyên Textarea tối ưu, bundle size thêm < 5KB. | 🟢 Nhẹ. |
| **Tự nhiên trong câu văn** | 🟢 Tự nhiên. | 🟢 Tự nhiên: Link nằm đúng vị trí từ khóa trong câu văn. | 🔴 Rất gượng gạo: Các link bị đùn xuống cuối khối. |
| **Chuyển đổi AST & Bảo toàn dữ liệu** | 🟡 Dễ lỗi hydration và xung đột schema giữa các editor con. | 🟢 Hoàn hảo: `serializeTiptapDoc` tự động tách thành text node có `marks: [link]`, `deserializeTiptapDoc` tái tạo lại nguyên vẹn. | 🟡 Cần custom AST node phức tạp. |
| **Trải nghiệm biên tập viên** | 🟡 Phức tạp, dễ vỡ format khi copy paste. | 🟢 Cực kỳ tiện lợi: Có thể gõ tay markdown, click chip nhanh hoặc bôi đen bấm chèn link. | 🔴 Bất tiện. |

---

## 3. Quyết Định Kiến Trúc (Architecture Decision)
- **Lựa chọn:** **Phương Án B (Cú pháp Markdown Chuẩn `[anchor](url)` kết hợp Thanh Công Cụ Chèn Link & Quick Chips)**.
- **Lý do lựa chọn:**
  - Vừa trực quan, vừa siêu nhẹ, không làm giảm tốc độ render của trang biên tập.
  - Tự động serialize thành cấu trúc Tiptap Mark Link `{ type: "text", text: "...", marks: [{ type: "link", attrs: { href: "..." } }] }` mà `render-html.ts` của Storefront đã hỗ trợ sẵn.
  - Phân loại rõ ràng liên kết nội bộ (bắt đầu bằng `/`) để không gắn `rel="nofollow"` hay thuộc tính bất lợi cho SEO On-Page.
