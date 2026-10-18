# ⚠️ RISK AUDIT: Static Pages CMS & Showroom System Settings

> **Module:** `static-pages`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Phân Tích Bán Kính Tác Động (Blast Radius Analysis)

- **Các phân hệ phụ thuộc:**
  - `apps/web`: Route động `/[slug]` bắt mọi đường dẫn không thuộc danh mục xe hay tin tức. Nếu truy vấn chậm hoặc không cache sẽ ảnh hưởng đến TTFB của các trang tĩnh.
  - `seo-engine`: Đọc danh sách trang `isPublished = true` để đưa vào `sitemap.xml`.
  - `apps/web/layout`: Đọc `contact_settings` để hiển thị Hotline, Zalo và địa chỉ ở Header và Footer.

---

## 2. Rà Soát Điểm Yếu An Ninh & Rủi Ro Tiềm Ẩn

| Mã Rủi Ro | Phân Loại | Kịch Bản Rủi Ro | Biện Pháp Phòng Ngừa Đã Thực Thi |
| :---: | :--- | :--- | :--- |
| **R-01** | XSS / Stored HTML | Kẻ xấu chèn script độc hại vào trình soạn thảo bài viết | Lưu trữ AST JSON thay vì HTML thô; hàm render server-side sanitize tự động mọi thẻ nguy hiểm |
| **R-02** | Slug Collision | Đặt slug trùng với các route cố định hệ thống (như `/xe`, `/tin-tuc`, `/api`) | Danh sách Blacklist Slug chặn các từ khóa hệ thống trong Zod Validation |
| **R-03** | Unpublished Leak | Khách hàng vãng lai đoán được slug trang nháp và đọc nội dung trước thời hạn | Truy vấn Fail-Closed bắt buộc điều kiện `is_published = true` |
| **R-04** | Setting Data Corruption | Ghi đè cấu hình với payload sai định dạng làm sập Footer/Header | Kiểm tra chặt chẽ bằng `ContactSettingsSchema` trước khi lưu vào `system_settings` |

---

## 3. Kế Hoạch Phục Hồi & Rollback Khẩn Cấp (Rollback Strategy)

1. **Khôi phục trang tĩnh mặc định:** Chạy script nạp lại các trang tĩnh mặc định: `pnpm db:seed-static-pages`.
2. **Khôi phục cấu hình hệ thống:** Tái tạo lại record `contact_settings` mặc định từ file `.env`.
