# 📋 BACKLOG: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Phiên bản:** `v1.1.0`  

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

---

### 🔹 US-03: Trợ Lý AI Sinh Dữ Liệu Từng Khối Nội Dung (In-Editor Single Block AI Generation Engine)
- **Actor:** Biên tập viên nội dung (Editor / Marketer / Admin).
- **Mô tả:** Trong giao diện soạn thảo bài viết, biên tập viên có thể kích hoạt trợ lý AI để sinh hoặc điền dữ liệu tự động cho từng khối nội dung riêng biệt (Block) dựa trên loại khối và ngữ cảnh bài viết (tiêu đề, từ khóa, dòng xe, thông tin khối lân cận), hoặc kèm theo chỉ đạo riêng biệt của người dùng.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 3.1: Sinh nội dung tự động cho khối Paragraph / Heading / Callout (Text Blocks)**
    - *Given:* Bài viết đã có tiêu đề hoặc từ khóa và một khối kiểu `paragraph` / `heading` / `callout`.
    - *When:* Biên tập viên bấm "AI Điền Khối Này" trên header của khối đó.
    - *Then:* Hệ thống gửi yêu cầu AI với action `generate_single_block`, hiển thị spinner loading cô lập trên khối đó; sau khi có kết quả, nội dung đoạn văn/tiêu đề/hộp ghi chú được cập nhật mượt mà và thanh điểm SEO được tính toán lại.
  - **Scenario 3.2: Sinh dữ liệu chuyên sâu cho khối có cấu trúc phức tạp (SpecTable / ProsCons / PriceTable / FAQ)**
    - *Given:* Bài viết đang biên tập cho một dòng xe cụ thể và có khối `specTable` hoặc `prosCons` hoặc `priceTable` hoặc `faq`.
    - *When:* Biên tập viên kích hoạt AI sinh cho khối này.
    - *Then:* AI trả về cấu trúc JSON giàu dữ liệu ô/hàng/thông số kỹ thuật chuẩn hóa, tự động điền vào các bảng và danh sách con của khối mà không làm hỏng cấu trúc DOM.
  - **Scenario 3.3: Bảo toàn tính toàn vẹn của danh sách khối (Immutability of Block IDs & Positions)**
    - *Given:* Bài viết đang có $N$ khối nội dung với thứ tự sắp xếp cố định.
    - *When:* Một khối ở vị trí bất kỳ $k$ được AI điền nội dung.
    - *Then:* ID khối và thứ tự vị trí của tất cả các khối khác trong bài được giữ nguyên 100%, không xảy ra tình trạng xáo trộn vị trí hoặc mất dữ liệu của các khối chưa lưu.
  - **Scenario 3.4: Xử lý lỗi và Timeout an toàn (Isolated Failure & Feedback)**
    - *Given:* Yêu cầu AI gặp sự cố mạng hoặc OpenAI trả về lỗi.
    - *When:* Quá trình sinh thất bại.
    - *Then:* Chỉ hiển thị thông báo lỗi Toast thân thiện, tắt loading của khối đó, giữ nguyên nội dung hiện tại của khối và không làm ảnh hưởng tới việc lưu bài viết.
