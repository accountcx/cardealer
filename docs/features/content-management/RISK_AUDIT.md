# ⚠️ RISK AUDIT: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Phân Tích Bán Kính Tác Động (Blast Radius Analysis)

- **Các phân hệ phụ thuộc:**
  - `seo-engine`: Đọc bài viết `published` để sinh Schema `NewsArticle`, thẻ OpenGraph và đưa vào `sitemap.xml`.
  - `apps/web`: Trang chủ hiển thị khu vực Top 3 bài viết nổi bật (`isFeatured = true`).
  - `catalog-management`: Các bài viết đánh giá xe gắn liên kết tới trang chi tiết dòng xe `/xe/[slug]`.

---

## 2. Rà Soát Điểm Yếu An Ninh & Rủi Ro Tiềm Ẩn

| Mã Rủi Ro | Phân Loại | Kịch Bản Rủi Ro | Biện Pháp Phòng Ngừa Đã Thực Thi |
| :---: | :--- | :--- | :--- |
| **R-01** | XSS / HTML Injection | Tiêm mã JavaScript vào nội dung bài viết qua Rich-text | Lưu trữ và render từ Tiptap AST thuần túy; thư viện `render-html` lọc sạch các thẻ nguy hiểm |
| **R-02** | Large File Upload DOS | Tải lên file dung lượng lớn làm nghẽn băng thông hoặc tràn bộ nhớ | Giới hạn file $\le 10\text{MB}$, chỉ chấp nhận MIME types ảnh hợp lệ và upload stream lên Cloudinary |
| **R-03** | Scheduled Leak | Bài viết hẹn giờ bị xem trước khi chưa đến hạn xuất bản | Lọc `WHERE status = 'published' AND (publishedAt <= NOW() OR scheduledAt <= NOW())` |
| **R-04** | Broken Media / 404 | Ảnh bị xóa trên Cloudinary làm bài viết bị lỗi hình ảnh | Lưu trữ metadata chi tiết và sử dụng placeholder ảnh fallback |

---

## 3. Kế Hoạch Phục Hồi & Rollback Khẩn Cấp (Rollback Strategy)

1. **Khôi phục bài viết:** Dữ liệu bài viết có thể hoàn tác qua bản sao lưu PostgreSQL hoặc sửa trạng thái về `draft`.
2. **Khôi phục hình ảnh:** Cloudinary lưu trữ phiên bản ảnh trước đó và thùng rác 30 ngày để khôi phục khi cần.
