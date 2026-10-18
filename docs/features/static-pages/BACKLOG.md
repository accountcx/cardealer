# 📋 BACKLOG: Static Pages CMS & Showroom System Settings

> **Module:** `static-pages`  
> **Phiên bản:** `v1.0.0`  

---

## 1. Danh Sách Lát Cắt Dọc Nghiệp Vụ (Vertical Slices)

### 🔹 US-01: Quản Trị Bài Viết Trang Tĩnh (Static Pages Authoring)
- **Actor:** Ban biên tập nội dung (Editor / Manager / Admin).
- **Mô tả:** Soạn thảo trang giới thiệu, chính sách, quy trình bằng trình soạn thảo Tiptap AST, cấu hình thẻ Meta SEO và xuất bản công khai.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 1.1: Xuất bản trang tĩnh thành công**
    - *Given:* Người dùng có quyền `pages:write`.
    - *When:* Gửi yêu cầu tạo trang `/gioi-thieu` kèm nội dung Tiptap và `isPublished: true`.
    - *Then:* Lưu cơ sở dữ liệu và Storefront có thể truy cập ngay lập tức tại `/gioi-thieu`.
  - **Scenario 1.2: Ẩn trang chưa xuất bản (Fail-Closed)**
    - *Given:* Trang có cờ `isPublished: false`.
    - *When:* Khách hàng vãng lai truy cập `/chinh-sach-chua-duyet`.
    - *Then:* API từ chối với HTTP 404 Not Found, không làm lộ nội dung nháp ra ngoài.

---

### 🔹 US-02: Cấu Hình Thông Tin Showroom Toàn Cục (Global Showroom Settings)
- **Actor:** Quản trị viên (`admin`).
- **Mô tả:** Cập nhật số điện thoại Hotline, Zalo, địa chỉ showroom, tọa độ Google Maps để đồng bộ tức thì trên toàn website.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 2.1: Cập nhật thông tin liên hệ**
    - *Given:* Admin gửi `PUT /api/admin/settings/contact_settings` với hotline mới.
    - *When:* Dữ liệu hợp lệ theo Zod schema.
    - *Then:* Cập nhật bảng `system_settings` và các widget trên Storefront hiển thị số hotline mới.
