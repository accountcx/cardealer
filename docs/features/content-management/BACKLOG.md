# 📋 BACKLOG: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Phiên bản:** `v1.0.0`  

---

## 1. Danh Sách Lát Cắt Dọc Nghiệp Vụ (Vertical Slices)

### 🔹 US-01: Quản Trị Chuyên Mục & Bài Viết Tin Tức (Posts & Categories CRUD)
- **Actor:** Ban biên tập (Editor / Manager / Admin).
- **Mô tả:** Soạn thảo, chỉnh sửa, xếp thứ tự bài ghim `isFeatured` và xuất bản bài viết theo chuyên mục.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 1.1: Xuất bản bài viết thành công**
    - *Given:* Biên tập viên điền đầy đủ tiêu đề, chuyên mục, ảnh đại diện và nội dung.
    - *When:* Bấm nút "Xuất bản ngay" (`status = 'published'`).
    - *Then:* Lưu cơ sở dữ liệu, sinh slug tự động và bài viết xuất hiện trên Storefront `/tin-tuc`.
  - **Scenario 1.2: Hẹn giờ đăng bài (Scheduled Post)**
    - *Given:* Bài viết có trạng thái `scheduled` và thời gian đăng trong tương lai.
    - *When:* Khách hàng vãng lai truy cập bài viết trước giờ hẹn.
    - *Then:* Hệ thống trả về HTTP 404; bài viết chỉ hiển thị công khai khi thời gian hẹn giờ đã đến.

---

### 🔹 US-02: Khối Đa Phương Tiện & Trình Phát TikTok 9:16 (Rich Media & TikTok Embed)
- **Actor:** Khách đọc bài viết trên Storefront.
- **Mô tả:** Bài viết chứa khối nhúng video TikTok hiển thị đúng tỷ lệ khung hình 9:16 dọc không bị thanh cuộn ngang/dọc làm hỏng giao diện.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 2.1: Hiển thị video TikTok mượt mà**
    - *Given:* Biên tập viên chèn khối `TikTokBlock` với URL video hợp lệ.
    - *When:* Khách hàng cuộn tới vị trí video.
    - *Then:* Khung video hiển thị poster đại diện và phát video mượt mà, không bị thanh cuộn thừa trên mobile.
