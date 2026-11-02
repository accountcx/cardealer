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

---

### 🔹 US-03: Tối Ưu Hiệu Năng Core Web Vitals & Trải Nghiệm Khách Hàng (Performance Optimization)
- **Actor:** Khách hàng duyệt Storefront trên thiết bị di động / desktop và Googlebot Lighthouse crawler.
- **Mô tả:** Nén và giảm tải trọng ảnh Cloudinary tự động từ 2.7 MB xuống < 250 KiB, chuyển đổi Google Maps trong Footer sang Facade Pattern (loại bỏ 417 KiB JS & 292ms CPU), trì hoãn các Third-Party Tracking Scripts (GTM, GA4, Clarity, Pixels) giải phóng Main Thread lúc nạp trang, và giữ vững CLS < 0.05.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 3.1: Tối ưu tải trọng ảnh Cloudinary và lazy-loading**
    - *Given:* Các phân khu `DeliveryStoriesSection`, `CarShowcaseCard` hiển thị ảnh từ Cloudinary.
    - *When:* Trang Storefront được kết xuất và tải tài nguyên ảnh.
    - *Then:* URL ảnh tự động được bổ sung biến đổi tối ưu `f_auto,q_auto,w_...,c_fill`, các ảnh ngoài màn hình đầu tiên được nạp lazy qua `next/image`, tổng dung lượng tải trọng ảnh giảm trên 80%.
  - **Scenario 3.2: Google Maps Facade Pattern trong Footer**
    - *Given:* Người dùng tải trang bất kỳ có component `Footer`.
    - *When:* Vùng chân trang chưa được cuộn tới hoặc chưa có tương tác.
    - *Then:* Iframe Google Maps không được nhúng ngay lập tức (không kéo `places.js`, `main.js`, `init_embed.js`), thay vào đó hiển thị thẻ Facade xem trước tối ưu nhẹ; chỉ khi người dùng bấm xem bản đồ hoặc cuộn gần tới mới kích hoạt iframe tương tác.
  - **Scenario 3.3: Trì hoãn thực thi Third-Party Tracking Scripts**
    - *Given:* Trang web có cấu hình GTM, GA4, Microsoft Clarity, Facebook/TikTok/Zalo Pixel.
    - *When:* Trình duyệt thực hiện First Contentful Paint (FCP) và Hydration.
    - *Then:* Các tập lệnh theo dõi được nạp theo chiến lược `lazyOnload` sau khi CPU rảnh, không gây Long Tasks chặn chuỗi chính lúc khởi động.
  - **Scenario 3.4: Triệt tiêu dịch chuyển bố cục (CLS < 0.05)**
    - *Given:* Người dùng duyệt website trên mạng chậm hoặc thiết bị di động.
    - *When:* Các tài nguyên ảnh, banner, countdown timer và phông chữ tải về.
    - *Then:* Khung chứa đã có tỷ lệ cố định (`aspect-ratio` hoặc min-height skeleton), không làm xô lệch các phần tử xung quanh, đạt chỉ số CLS < 0.05.
