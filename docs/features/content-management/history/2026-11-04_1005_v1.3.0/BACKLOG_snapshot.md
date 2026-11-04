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

---

### 🔹 US-04: Gắn Link Nội Bộ Cho Khối Đoạn Văn Bản (Paragraph Internal Links Engine)
- **Actor:** Biên tập viên nội dung & Quản trị viên SEO (Editor / SEO Specialist).
- **Mô tả:** Trong các khối "Đoạn văn bản" (`ParagraphBlock`), biên tập viên có thể gắn các liên kết nội bộ (Internal Links) tới các dòng xe trong showroom, các trang tiện ích (Bảng giá, Dự toán chi phí, Khuyến mãi, Liên hệ) hoặc các bài viết liên quan. Hệ thống hỗ trợ cả cú pháp trực tiếp dạng Markdown `[Tên hiển thị](/duong-dan)`, thanh gợi ý nhanh (Quick Chips) và hộp thoại lựa chọn trực quan.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 4.1: Chèn liên kết nội bộ nhanh từ Quick Chips**
    - *Given:* Biên tập viên đang soạn thảo nội dung trong khối ParagraphBlock.
    - *When:* Bấm vào chip gợi ý (ví dụ: `+ [Hyundai Santa Fe]`).
    - *Then:* Cú pháp `[Hyundai Santa Fe](/dong-xe/santa-fe)` được tự động chèn vào vị trí con trỏ hoặc cuối đoạn văn bản.
  - **Scenario 4.2: Chèn liên kết qua hộp thoại chọn liên kết nội bộ (Internal Link Modal / Popover)**
    - *Given:* Biên tập viên bôi đen một cụm từ (ví dụ "bảng giá xe lăn bánh") hoặc bấm nút biểu tượng Link 🔗.
    - *When:* Chọn trang mục tiêu từ danh mục Dòng xe hoặc Trang tiện ích và bấm "Chèn liên kết".
    - *Then:* Cụm từ được chuyển thành cú pháp `[bảng giá xe lăn bánh](/bang-gia-xe)` một cách liền mạch.
  - **Scenario 4.3: Serialize Tiptap AST thành text nodes có marks link & Deserialize bảo toàn**
    - *Given:* Đoạn văn bản chứa các liên kết Markdown `[anchor](url)`.
    - *When:* Lưu bài viết (gọi `serializeTiptapDoc`) và tải lại bài viết (gọi `deserializeTiptapDoc`).
    - *Then:* AST sinh ra các text node có `marks: [{ type: "link", attrs: { href: url } }]` chuẩn Tiptap, và khi tải lại editor thì các liên kết Markdown được bảo toàn 100% nguyên vẹn.
  - **Scenario 4.4: Storefront kết xuất Semantic HTML chuẩn SEO cho Internal Links**
    - *Given:* Khách hàng truy cập trang bài viết `/tin-tuc/[slug]` trên Storefront.
    - *When:* Bài viết có các đoạn văn bản chứa liên kết nội bộ.
    - *Then:* `convertTiptapToHtml` kết xuất thẻ `<a href="/...">` có styling nổi bật, tự động mở cùng tab (hoặc tab mới theo chuẩn) và tuyệt đối không gán `rel="nofollow"` cho các link nội bộ để bảo toàn PageRank và Internal Link Equity.

---

### US-05: AI Topic Ideation & Deduplication Engine (Trợ Lý AI Đề Xuất Ý Tưởng Bài Viết Chống Trùng Lặp)
- **Actor:** Quản trị viên SEO & Biên tập viên nội dung (Content Strategist / Editor).
- **Mô tả:** Khi biên tập viên cần lập kế hoạch bài viết mới, trợ lý AI sẽ tự động phân tích toàn bộ kho bài viết đã có trong cơ sở dữ liệu (cả bản nháp `draft` lẫn bài đã xuất bản `published`), xác định các góc nhìn chưa được khai thác (Content Gaps), và đề xuất 3 - 5 ý tưởng bài viết độc bản kèm từ khóa mục tiêu, góc tiếp cận độc nhất và dàn ý sơ bộ mà không bao giờ bị trùng lặp hay ăn thịt từ khóa (Keyword Cannibalization).
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 5.1: Mở Trợ lý AI Gợi ý Ý tưởng từ Danh sách bài viết hoặc Trang tạo mới**
    - *Given:* Biên tập viên ở trang Quản lý bài viết (`/posts`) hoặc trang Viết bài mới (`/posts/new`).
    - *When:* Nhấp vào nút "✨ AI Gợi Ý Ý Tưởng".
    - *Then:* Modal/Drawer Trợ lý AI hiển thị với các bộ lọc: Dòng xe mục tiêu, Chuyên mục, Định hướng/Góc nhìn và số lượng bài viết hiện có trong cơ sở dữ liệu đã được nạp làm căn cứ đối soát.
  - **Scenario 5.2: Tự động đối soát cơ sở dữ liệu và cấm tuyệt đối trùng lặp từ khóa/tiêu đề**
    - *Given:* Hệ thống đã có các bài viết về Hyundai Santa Fe (ví dụ: "Đánh giá Hyundai Santa Fe 2026", từ khóa "đánh giá santa fe 2026").
    - *When:* Yêu cầu AI đề xuất ý tưởng mới cho dòng xe này.
    - *Then:* Backend AI Service tự động gửi danh sách các bài viết hiện có vào Prompt Negative Grounding, chỉ thị AI tuyệt đối không lặp lại tiêu đề, từ khóa hay góc tiếp cận cũ; AI trả về các góc nhìn mới mẻ (ví dụ: "Chi phí bảo dưỡng Santa Fe sau 50.000km", "So sánh thực tế Santa Fe máy dầu và hybrid cho gia đình 3 thế hệ").
  - **Scenario 5.3: Cấu trúc chi tiết của từng ý tưởng trả về**
    - *Given:* AI hoàn tất phân tích và sinh danh sách ý tưởng.
    - *When:* Giao diện hiển thị danh sách các Idea Cards.
    - *Then:* Mỗi ý tưởng hiển thị đầy đủ: Tiêu đề đề xuất (Title), Slug đề xuất, Từ khóa chính (Focus Keyword), Góc tiếp cận độc bản (Unique Angle), Khoảng trống nội dung giải quyết (Content Gap), Tóm tắt nội dung (Summary) và Dàn ý sơ bộ (Outline Preview).
  - **Scenario 5.4: 1-Click chuyển tiếp sang viết bài mới từ ý tưởng đã chọn**
    - *Given:* Biên tập viên duyệt qua các ý tưởng và chọn 1 ý tưởng ưng ý.
    - *When:* Nhấp nút "Viết Bài Với Ý Tưởng Này".
    - *Then:* Hệ thống điều hướng ngay tới trang soạn thảo `/posts/new` và tự động điền sẵn các trường: Tiêu đề, Slug, Focus Keyword, Tóm tắt ngắn, Dòng xe và Chuyên mục tương ứng.
  - **Scenario 5.5: Kiểm tra trùng lặp hậu xử lý an toàn (Post-generation Deduplication Check)**
    - *Given:* Kết quả trả về từ mô hình ngôn ngữ lớn (LLM).
    - *When:* Backend nhận kết quả trước khi gửi về client.
    - *Then:* Bộ lọc deduplication tự động đối soát lại với database; nếu bất kỳ ý tưởng nào có độ tương đồng từ khóa > 60% với bài cũ sẽ bị loại bỏ hoặc cảnh báo, đảm bảo độ mới 100%.

