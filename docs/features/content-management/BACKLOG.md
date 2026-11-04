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

---

### 🔹 US-06: Cấu Hình Lịch Tự Động & Hàng Đợi Kế Hoạch Đăng Bài (Auto Publishing Schedule & Content Queue Schema & API)
- **Actor:** Quản trị viên hệ thống & Trưởng ban nội dung (Admin / Content Lead).
- **Mô tả:** Lưu trữ và quản lý cấu hình lập lịch tự động viết bài (tần suất cron, bật/tắt, trạng thái bài viết mặc định `draft` hoặc `published`, chuyên mục ưu tiên, tác giả mặc định) cùng bảng hàng đợi kế hoạch bài viết (`content_plan_items`) và lịch sử chạy (`auto_post_logs`).
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 6.1: Đọc và cập nhật cấu hình lập lịch đăng bài tự động**
    - *Given:* Quản trị viên truy cập trang Cài đặt Lịch Tự Động Viết Bài.
    - *When:* Cập nhật cấu hình: bật scheduler (`isEnabled: true`), tần suất `cronExpression: "0 8 * * *"` (8:00 sáng hàng ngày), trạng thái bài viết `defaultStatus: "draft"`, chuyên mục mặc định.
    - *Then:* API `PUT /api/admin/auto-posts/settings` lưu trữ cài đặt hợp lệ, reload lại cron task trong memory của server ngay lập tức.
  - **Scenario 6.2: Quản lý hàng đợi các bài viết theo kế hoạch (Content Plan Queue)**
    - *Given:* Có danh sách các bài viết đã được lên lịch trong hàng đợi `content_plan_items`.
    - *When:* Quản trị viên thêm mới thủ công, chỉnh sửa tiêu đề/từ khóa, đổi ngày xuất bản hoặc xóa một mục trong hàng đợi.
    - *Then:* Hàng đợi được cập nhật chính xác với các trạng thái (`pending`, `processing`, `completed`, `failed`).
  - **Scenario 6.3: Truy xuất nhật ký thực thi tự động (Execution Logs)**
    - *Given:* Hệ thống đã từng chạy tự động hoặc chạy kích hoạt thủ công.
    - *When:* Quản trị viên xem tab "Nhật ký thực thi".
    - *Then:* API trả về danh sách lịch sử gồm: thời điểm chạy, kiểu kích hoạt (`cron` hoặc `manual_run_now`), bài viết đã tạo (`postId`, `title`), trạng thái (`success`/`failed`), mã lỗi (nếu có) và thời gian thực thi tính bằng milliseconds.

---

### 🔹 US-07: Trợ Lý AI Phân Tích & Lập Kế Hoạch Biên Tập Nội Dung 30 Ngày (AI 30-Day Content Editorial Planner Engine)
- **Actor:** Quản trị viên SEO & Trưởng phòng Marketing (Content Strategist / SEO Lead).
- **Mô tả:** Trợ lý AI tự động quét toàn bộ cơ sở dữ liệu các dòng xe, danh mục bài viết và bài viết hiện có để phân tích ma trận Content Gap, từ đó đề xuất một kế hoạch biên tập hoàn chỉnh trong 30 ngày (Editorial Calendar Plan) gồm danh sách các bài viết với tần suất hợp lý, đa dạng chuyên mục và góc nhìn, hoàn toàn không trùng lặp từ khóa.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 7.1: Khởi tạo yêu cầu sinh kế hoạch 30 ngày**
    - *Given:* Quản trị viên mở modal "Lập kế hoạch 30 ngày bằng AI" và chọn số lượng bài (ví dụ 8, 12 hoặc 30 bài trong tháng), chọn dòng xe ưu tiên hoặc tất cả dòng xe.
    - *When:* Bấm nút "Phân Tích & Lập Kế Hoạch".
    - *Then:* AI Service phân tích kho nội dung hiện tại, đối chiếu negative grounding, xây dựng prompt chuyên biệt `buildEditorialPlanPrompt` và sinh danh sách các mục kế hoạch tương ứng.
  - **Scenario 7.2: Dữ liệu chi tiết của từng bài trong kế hoạch 30 ngày**
    - *Given:* AI phản hồi kế hoạch biên tập 30 ngày thành công.
    - *When:* Giao diện hiển thị bảng kế hoạch dự kiến.
    - *Then:* Mỗi mục kế hoạch gồm có: Tiêu đề gợi ý, Từ khóa chính, Chuyên mục mục tiêu, Dòng xe liên quan (nếu có), Góc nhìn độc bản (Angle), Tóm tắt định hướng và Ngày/giờ dự kiến xuất bản (dàn đều theo chu kỳ 30 ngày).
  - **Scenario 7.3: Nạp kế hoạch vào Hàng đợi Đăng bài tự động (Batch Ingest to Queue)**
    - *Given:* Quản trị viên xem xét bảng kế hoạch 30 ngày, có thể bỏ chọn hoặc chỉnh sửa các bài chưa ưng ý.
    - *When:* Bấm nút "Lưu Kế Hoạch Vào Hàng Đợi".
    - *Then:* Toàn bộ các mục được chọn sẽ được nạp hàng loạt vào bảng `content_plan_items` với trạng thái `pending`, sẵn sàng để scheduler tự động lấy ra viết bài khi đến hẹn.

---

### 🔹 US-08: Bộ Lập Lịch Định Kỳ & Động Cơ Tự Động Viết Bài Hoàn Chỉnh (In-Process Scheduler & Automated Article Generation Pipeline)
- **Actor:** Hệ thống nền tự động (Background Scheduler Engine) & Quản trị viên kích hoạt.
- **Mô tả:** Bộ lập lịch in-process trong `apps/api` chạy theo cấu hình cron hoặc qua nút kích hoạt thủ công "Chạy ngay" (`POST /api/admin/auto-posts/run-now`). Khi đến kỳ hoặc khi trigger, hệ thống lấy mục kế hoạch tiếp theo trong hàng đợi (hoặc tự động dùng AI sinh ý tưởng độc bản nếu hàng đợi rỗng), sau đó gọi pipeline sinh bài viết đầy đủ (Full Article Generation Pipeline) để tạo bài viết chất lượng cao với các khối Tiptap AST phong phú, gán tác giả mặc định E-E-A-T và lưu bài với trạng thái `draft` hoặc `published`.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 8.1: Tự động chạy theo Cron Timer**
    - *Given:* Scheduler đang bật (`isEnabled: true`) và đồng hồ hệ thống khớp với `cronExpression`.
    - *When:* Tác vụ cron kích hoạt.
    - *Then:* Scheduler thực hiện lấy 1 mục kế hoạch `pending` gần nhất (hoặc sinh ý tưởng mới nếu không có hàng đợi), khóa trạng thái sang `processing` để chống race condition.
  - **Scenario 8.2: Sinh trọn vẹn cấu trúc bài viết Tiptap AST chuẩn SEO**
    - *Given:* Thông tin đề tài (tiêu đề, từ khóa, chuyên mục, góc nhìn).
    - *When:* Động cơ AI Article Generator thực thi với action `generate_full_article`.
    - *Then:* AI tạo ra bài viết hoàn chỉnh gồm: Tiêu đề, Slug duy nhất, Tóm tắt, Từ khóa SEO, Meta Title, Meta Description, và mảng nội dung AST với tối thiểu 4 khối (`paragraph`, `heading`, `callout`, `faq` hoặc `priceTable`), tính điểm SEO đạt chuẩn.
  - **Scenario 8.3: Tuân thủ cấu hình trạng thái bài viết (Draft vs Published)**
    - *Given:* Cấu hình `defaultStatus` là `draft` (hoặc `published`).
    - *When:* Bài viết được tạo thành công trong bảng `posts`.
    - *Then:* Bài viết được lưu với đúng trạng thái tương ứng, gán tác giả mặc định từ cấu hình hệ thống, và mục kế hoạch được cập nhật thành `completed` kèm `postId` liên kết.
  - **Scenario 8.4: Nút kích hoạt thủ công "Chạy ngay" (Manual Run Now)**
    - *Given:* Quản trị viên bấm nút "Viết & Đăng bài ngay" trên trang quản trị.
    - *When:* Gửi yêu cầu `POST /api/admin/auto-posts/run-now`.
    - *Then:* Tác vụ chạy ngay lập tức, trả về kết quả bài viết mới tạo mà không cần chờ đến khung giờ cron, đồng thời ghi log với `triggerType = 'manual_run_now'`.
  - **Scenario 8.5: Xử lý lỗi an toàn và ghi nhận log thất bại**
    - *Given:* OpenAI API bị timeout, hết hạn mức hoặc lỗi mạng.
    - *When:* Quá trình sinh bài thất bại.
    - *Then:* Hệ thống không crash server, mục kế hoạch chuyển trạng thái `failed` kèm thông điệp lỗi, ghi nhận vào `auto_post_logs` và gửi cảnh báo toast cho quản trị viên nếu là trigger thủ công.

---

### 🔹 US-09: Giao Diện Quản Trị Lịch Định Kỳ, Kế Hoạch Biên Tập & Nhật Ký Thực Thi trong Admin (Admin Editorial Calendar & Schedule Management UI)
- **Actor:** Quản trị viên nội dung (Admin / Content Editor).
- **Mô tả:** Trang quản trị chuyên biệt tại `apps/admin/app/posts/auto-schedule/` với giao diện trực quan gồm: Bảng điều khiển Bật/Tắt & Cấu hình Cron/Trạng thái xuất bản; Nút "⚡ Viết Bài Ngay"; Modal "✨ AI Lập Kế Hoạch 30 Ngày"; Bảng hàng đợi bài viết (Content Plan Queue) kèm bộ lọc trạng thái; và Bảng nhật ký thực thi (Execution Logs) chi tiết.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 9.1: Bật/Tắt lịch đăng bài và thay đổi cấu hình**
    - *Given:* Quản trị viên ở trang `/posts/auto-schedule`.
    - *When:* Bật Switch "Tự động đăng bài theo lịch", chọn tần suất (ví dụ: Mỗi ngày một lần lúc 08:00 sáng, Mỗi tuần 2 lần...), chọn Trạng thái xuất bản mặc định ("Lưu nháp (Draft)" hoặc "Xuất bản ngay (Published)") và bấm "Lưu cấu hình".
    - *Then:* Cấu hình được lưu thành công, hiển thị badge trạng thái Scheduler đang chạy, và hiển thị thời gian chạy dự kiến tiếp theo (Next Run Time).
  - **Scenario 9.2: Mở modal và tạo kế hoạch 30 ngày bằng AI**
    - *Given:* Quản trị viên bấm nút "✨ AI Lập Kế Hoạch 30 Ngày".
    - *When:* Modal xuất hiện, chọn các tiêu chí (Số lượng bài, chuyên mục, dòng xe) và bấm "Bắt đầu phân tích".
    - *Then:* Hiển thị danh sách đề xuất kế hoạch dạng thẻ/bảng, có thể tick chọn/bỏ chọn từng bài, bấm "Lưu vào Hàng Đợi", bảng Hàng đợi lập tức cập nhật dữ liệu mới.
  - **Scenario 9.3: Điều hướng và liên kết từ trang danh sách bài viết `/posts`**
    - *Given:* Quản trị viên đang ở trang quản lý bài viết `/posts`.
    - *When:* Nhìn lên thanh Header.
    - *Then:* Có nút điều hướng nổi bật "⏰ Lịch Tự Động & Kế Hoạch AI" dẫn trực tiếp đến `/posts/auto-schedule`.

