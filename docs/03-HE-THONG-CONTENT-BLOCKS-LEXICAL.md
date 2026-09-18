# PHẦN 3: HỆ THỐNG CONTENT BLOCKS & TRÌNH SOẠN THẢO BÀI VIẾT (LEXICAL)

> **Mục đích tài liệu**: Cung cấp tài liệu chi tiết, đầy đủ về toàn bộ các tính năng soạn thảo nội dung hiện có trên website `xehyundaivinh.com`, bao gồm cấu hình của trình soạn thảo Rich Text Lexical và danh mục chi tiết 15 khối nội dung (Content Blocks), cấu trúc dữ liệu đầu vào, cách biên tập viên sử dụng và cách hiển thị ra giao diện người dùng.

---

## 1. Tổng Quan Trình Soạn Thảo Lexical Editor

Hệ thống sử dụng trình soạn thảo **Lexical** (`@payloadcms/richtext-lexical`) được cấu hình tích hợp sẵn cho 3 khu vực nội dung lớn:
1. **Bài viết / Tin tức (`Posts`)**: Soạn thảo các bài tin khuyến mãi, bảng giá xe, sự kiện đại lý, hướng dẫn kỹ thuật.
2. **Bài đánh giá chi tiết phiên bản (`CarVersions.reviewContent`)**: Soạn thảo bài đánh giá dài chuyên sâu về từng phiên bản xe, có phân cấp H2, H3 để sinh mục lục động (TOC).
3. **Trang tĩnh CMS (`Pages.content`)**: Soạn thảo các trang nội dung độc lập như `/chinh-sach`, `/thu-tuc-tra-gop`, `/gioi-thieu`.

### Các tính năng định dạng văn bản có sẵn trong Editor:
* **Thanh công cụ cố định & thanh công cụ nổi (Fixed Toolbar & Inline Toolbar)**: Tiện lợi khi bôi đen văn bản để định dạng nhanh.
* **Hệ thống Tiêu đề (Headings)**: Hỗ trợ từ H1 đến H6. Các thẻ H2, H3 được hệ thống Frontend tự động bóc tách để sinh Mục lục (Table of Contents).
* **Định dạng ký tự**: In đậm (Bold), in nghiêng (Italic), gạch chân (Underline), gạch ngang (Strikethrough), chỉ số trên/dưới (Superscript/Subscript), khối mã (Inline Code).
* **Căn chỉnh lề (Alignment)**: Căn trái, căn giữa, căn phải, căn đều 2 bên.
* **Danh sách (Lists)**: Danh sách chấm tròn (Unordered List), danh sách số (Ordered List), danh sách kiểm tra công việc (Checklist).
* **Trích dẫn (Blockquote)** & **Đường kẻ phân cách (Horizontal Rule)**.
* **Chèn liên kết (Link Feature)**: Hỗ trợ link nội bộ và link ngoài (tự động thêm `rel="noopener noreferrer"`, tùy chọn mở tab mới).
* **Chèn ảnh trực tiếp (Upload Feature)**: Tải ảnh từ máy tính hoặc chọn từ thư viện `Media`.
* **Khối nâng cao (`BlocksFeature`)**: Cho phép chèn 15 khối chuyên dụng vào bất kỳ vị trí nào trong bài viết.

---

## 2. Đặc Tả Chi Tiết 15 Khối Nội Dung (Content Blocks)

### 2.1. `TextBlock` (Khối Văn Bản Đoạn)
* **Mục đích**: Chèn các đoạn văn bản Rich Text độc lập xen kẽ giữa các khối hình ảnh, bảng biểu.
* **Các trường dữ liệu (Fields)**:
  * `content` (`richText`): Khung soạn thảo văn bản con.
* **Cách hiển thị Frontend**: Render thẻ đoạn văn chuẩn typography, font chữ Inter sắc nét, giãn dòng chuẩn đọc sách báo.

---

### 2.2. `CalloutBlock` (Hộp Ghi Chú & Cảnh Báo Nổi Bật)
* **Mục đích**: Nhấn mạnh thông tin quan trọng như: Ưu đãi thuế trước bạ, lưu ý giấy tờ bấm biển, cảnh báo số lượng xe có hạn.
* **Các trường dữ liệu**:
  * `type` (`select`): Phân loại màu sắc gồm:
    * `info`: Màu xanh dương (Thông tin chung, hướng dẫn).
    * `warning`: Màu vàng cam (Cảnh báo, lưu ý quan trọng).
    * `success`: Màu xanh lá (Khuyến mãi thành công, ưu đãi đặc biệt).
    * `note`: Màu xám (Ghi chú tham khảo).
  * `title` (`text`): Tiêu đề hộp ghi chú (Ví dụ: "LƯU Ý VỀ THỦ TỤC TRẢ GÓP").
  * `content` (`richText`): Nội dung chi tiết của ghi chú.
* **Cách hiển thị Frontend**: Khung viền bo tròn bo góc, có dải màu đậm ở mép trái, nền màu pastel nhạt, kèm biểu tượng Icon tương ứng ở đầu tiêu đề.

---

### 2.3. `TabHeroBlock` (Khối Giới Thiệu Động Cơ & Thông Số Lớn)
* **Mục đích**: Trình diễn thông số động lực học ấn tượng của xe (Công suất, Mô-men xoắn, Hộp số).
* **Các trường dữ liệu**:
  * `image` (`upload -> media`): Ảnh động cơ cắt lớp, khung gầm hoặc xe nhìn ngang.
  * `imagePosition` (`radio`): Vị trí ảnh (`left` - bên trái, hoặc `right` - bên phải).
  * `title` (`text`): Tiêu đề chính 1 (Ví dụ: "CÔNG SUẤT CỰC ĐẠI").
  * `subtitle` (`text`): Chỉ số 1 (Ví dụ: "156 mã lực / 6.200 rpm").
  * `secondaryTitle` (`text`): Tiêu đề chính 2 (Ví dụ: "MÔ-MEN XOẮN CỰC ĐẠI").
  * `secondarySubtitle` (`text`): Chỉ số 2 (Ví dụ: "192 Nm / 4.500 rpm").
* **Cách hiển thị Frontend**: Layout 2 cột sang trọng. Một bên là ảnh chất lượng cao, một bên là 2 khối số to nổi bật (Typography kích thước lớn) tạo cảm giác uy lực.

---

### 2.4. `FeatureGridBlock` (Lưới Tính Năng & Trang Bị)
* **Mục đích**: Trình bày danh sách các trang bị ngoại thất, tiện nghi nội thất hoặc hệ thống an toàn Hyundai SmartSense.
* **Các trường dữ liệu**:
  * `columns` (`radio`): Số lượng cột trên desktop (`2`, `3` hoặc `4` cột).
  * `features` (`array`): Danh sách tính năng, mỗi mục gồm:
    * `image` (`upload -> media`): Ảnh chụp cận cảnh chi tiết trang bị.
    * `title` (`text`): Tên tính năng (Ví dụ: "Hệ thống hỗ trợ giữ làn LFA").
    * `description` (`richText`): Mô tả cơ chế hoạt động và lợi ích an toàn cho hành khách.
* **Cách hiển thị Frontend**: Lưới thẻ card bo góc viền xám nhẹ. Rê chuột vào ảnh sẽ phóng to nhẹ (Hover zoom animation). Tự động co lại thành 1 cột trên điện thoại.

---

### 2.5. `YoutubeBlock` (Nhúng Video YouTube / Vimeo)
* **Mục đích**: Nhúng video trải nghiệm lái thử thực tế, lễ ra mắt xe, hướng dẫn sử dụng tính năng.
* **Các trường dữ liệu**:
  * `videoUrl` (`text`, required): Đường dẫn đầy đủ của video (hỗ trợ `youtube.com/watch?v=...`, `youtu.be/...`, hoặc Vimeo).
* **Cách hiển thị Frontend**: Hệ thống tự động phân tích lấy video ID và dựng iframe với tỷ lệ khung hình chuẩn 16:9 (`aspect-video`), tự động tương thích 100% kích thước mọi màn hình.

---

### 2.6. `CallToActionBlock` (Nút Kêu Gọi Hành Động - CTA)
* **Mục đích**: Đặt các nút điều hướng bấm gọi hoặc dẫn đến form đăng ký nhận ưu đãi ở giữa các đoạn bài viết.
* **Các trường dữ liệu**:
  * `text` (`text`, required): Lời kêu gọi (Ví dụ: "Đăng ký lái thử Tucson 2025 ngay hôm nay").
  * `url` (`text`, required): Link đích (Ví dụ: `/gia-lan-banh`, `/lien-he` hoặc link ngoài).
  * `style` (`select`): 
    * `primary`: Màu đỏ nổi bật, kích thích hành động.
    * `secondary`: Màu xanh Hyundai đặc trưng, trang nhã.
* **Cách hiển thị Frontend**: Nút bấm kích thước lớn căn giữa trang, hiệu ứng đổ bóng mềm và đổi màu mượt mà khi di chuột.

---

### 2.7. `RelatedCarBlock` (Khối Nhúng Thẻ Xe Liên Quan)
* **Mục đích**: Khi bài viết nhắc đến một dòng xe cụ thể, biên tập viên có thể nhúng ngay một thẻ Card của dòng xe đó vào bài viết để khách xem giá và bấm xem chi tiết.
* **Các trường dữ liệu**:
  * `car` (`relationship -> cars`, required): Chọn dòng xe liên kết từ danh mục `Cars`.
* **Cách hiển thị Frontend**: Hiển thị thẻ card xe thu nhỏ nằm ngay giữa bài viết: gồm ảnh xe góc 3/4, tên xe, giá khởi điểm "Từ xxx.000.000 VNĐ", số lượng phiên bản và nút "Xem chi tiết & Báo giá".

---

### 2.8. `TwoColumnBlock` (Bố Cục 2 Cột Linh Hoạt)
* **Mục đích**: Trình bày thông tin so sánh đối chiếu hoặc văn bản một bên, hình ảnh một bên.
* **Các trường dữ liệu**:
  * `layout` (`select`): Tỷ lệ phân chia cột:
    * `50-50`: Hai cột cân bằng đều nhau.
    * `33-67`: Cột trái nhỏ (1/3), cột phải lớn (2/3).
    * `67-33`: Cột trái lớn (2/3), cột phải nhỏ (1/3).
  * `columnOne` (`richText`, required): Nội dung cột 1.
  * `columnTwo` (`richText`, required): Nội dung cột 2.
  * `backgroundColor` (`select`): `white` (nền trắng) hoặc `gray` (nền xám nhạt phân tách đoạn).
* **Cách hiển thị Frontend**: Hai cột nằm song song trên desktop và tablet ngang; tự động chuyển thành dạng xếp chồng trên điện thoại di động.

---

### 2.9. `GalleryBlock` (Thư Viện Ảnh Ngoại Thất / Nội Thất)
* **Mục đích**: Trưng bày album ảnh sắc nét nhiều góc chụp của xe.
* **Các trường dữ liệu**:
  * `images` (`array`, required): Danh sách tải lên nhiều hình ảnh.
  * `style` (`select`):
    * `grid`: Hiển thị dạng lưới ảnh nhiều ô.
    * `slider`: Hiển thị dạng băng chuyền có nút bấm trượt trái/phải.
* **Cách hiển thị Frontend**: Bố cục album chuyên nghiệp, hỗ trợ bấm vào ảnh để xem kích thước lớn.

---

### 2.10. `SpacerBlock` (Khoảng Cách Đệm)
* **Mục đích**: Tạo khoảng trống trắng giữa các khối nội dung lớn giúp bài viết thoáng đãng, dễ đọc.
* **Các trường dữ liệu**:
  * `size` (`select`):
    * `small`: 24px.
    * `medium`: 48px.
    * `large`: 96px.
* **Cách hiển thị Frontend**: Thẻ `div` trống với chiều cao tương ứng.

---

### 2.11. `TableBlock` (Bảng Dữ Liệu Tiêu Chuẩn)
* **Mục đích**: Trình bày các bảng số liệu kỹ thuật, bảng giá tóm tắt đơn giản.
* **Các trường dữ liệu**:
  * `headline` (`text`): Tiêu đề phía trên bảng.
  * `rows` (`array`): Danh sách các hàng dữ liệu.
  * Mỗi hàng chứa `cells`: Mảng các ô dữ liệu, có cờ `isHeader` để đánh dấu ô in đậm tiêu đề cột.
* **Cách hiển thị Frontend**: Bảng viền xám tiêu chuẩn, có thanh cuộn ngang tự động trên thiết bị màn hình nhỏ.

---

### 2.12. `AdvancedTableBlock` (Bảng Tương Tác Dữ Liệu Nâng Cao)
* **Mục đích**: Dành cho các bảng so sánh nhiều thông số kỹ thuật phức tạp hoặc bảng phân tích chi phí cần người dùng thao tác lọc/sắp xếp.
* **Các trường dữ liệu**:
  * `caption` (`text`): Tiêu đề bảng hiển thị trên cùng.
  * `enableFeatures` (`group`): Bật/Tắt tính năng tương tác:
    * `sorting` (`checkbox`): Cho phép click vào tiêu đề cột để sắp xếp tăng/giảm.
    * `search` (`checkbox`): Hiển thị ô tìm kiếm tức thì nội dung trong bảng.
    * `export` (`checkbox`): Hiển thị nút bấm tải dữ liệu bảng về máy dưới dạng file CSV/Excel.
  * `columns` (`array`): Định nghĩa tiêu đề các cột.
  * `rows` (`array`): Các dòng dữ liệu tương ứng.
* **Cách hiển thị Frontend**: Client Component tương tác cao, lọc kết quả theo từ khóa người dùng gõ ngay lập tức mà không cần tải lại trang.

---

### 2.13. `FAQBlock` (Hỏi Đáp Thường Gặp & Tự Động Sinh Schema FAQ)
* **Mục đích**: Giải đáp các thắc mắc phổ biến về giá lăn bánh, màu sắc, ưu đãi, thời hạn giao xe; đồng thời là **vũ khí tối thượng cho SEO**.
* **Các trường dữ liệu**:
  * `title` (`text`): Tiêu đề mục hỏi đáp (Ví dụ: "Câu hỏi thường gặp về Hyundai Creta 2025").
  * `questions` (`array`): Danh sách các câu hỏi:
    * `question` (`text`, required): Câu hỏi của khách (Ví dụ: "Mua xe Creta trả góp cần trả trước bao nhiêu?").
    * `answer` (`richText`, required): Câu trả lời chi tiết (hỗ trợ định dạng văn bản, link).
* **Cách hiển thị Frontend**: Dạng Accordion bấm xổ xuống mượt mà.
* **Cơ chế SEO tự động hóa**: Hệ thống quét AST của khối này để sinh mã JSON-LD `FAQPage` cho Google, giúp bài viết hiển thị Accordion trực tiếp trên trang nhất tìm kiếm Google.

---

### 2.14. `PriceTableBlock` (Bảng Giá Xe Tự Động)
* **Mục đích**: Chèn bảng giá cập nhật mới nhất của một dòng xe vào giữa bài viết tin tức mà không cần gõ lại giá thủ công.
* **Các trường dữ liệu**:
  * `car` (`relationship -> cars`, required): Chọn dòng xe cần lấy bảng giá.
  * `headline` (`text`): Tiêu đề tùy biến (để trống sẽ lấy mặc định: "Bảng giá xe [Tên Xe] mới nhất").
  * `showNote` (`checkbox`): Bật/Tắt dòng ghi chú về giá tạm tính và khuyến mãi ở chân bảng.
* **Cách hiển thị Frontend**: Tự động truy vấn tất cả các phiên bản của dòng xe đó trong cơ sở dữ liệu, hiển thị danh sách phiên bản, giá niêm yết và dự toán lăn bánh tại Nghệ An kèm nút "Nhận Ưu Đãi".

---

### 2.15. `TikTokBlock` (Trình Phát Video TikTok Độc Quyền)
* **Mục đích**: Nhúng các video ngắn đánh giá xe, bàn giao xe từ kênh TikTok của đại lý vào bài viết.
* **Các trường dữ liệu**:
  * `videoUrl` (`text`, required): Link video TikTok (Ví dụ: `https://www.tiktok.com/@hyundaivinh/video/7123456789012345678`).
  * `title` (`text`, required): Tiêu đề video (Dùng cho SEO và người khiếm thị).
  * `posterImage` (`upload -> media`, required): Ảnh bìa video chất lượng cao hiển thị trước khi xem.
* **Logic kỹ thuật độc quyền đã hoàn thiện**:
  1. **Cơ chế Facade tải lười (Lazy Loading)**: Ban đầu không tải script TikTok (tránh tụt điểm tốc độ LCP/TBT trên Google PageSpeed). Chỉ hiển thị ảnh bìa poster và nút Play lớn có hiệu ứng lan tỏa (Pulse animation).
  2. **Tự phát khi bấm xem (Autoplay)**: Khi khách bấm vào nút Play, trạng thái chuyển sang nạp iframe TikTok Player v1 API kèm tham số `autoplay=1` giúp video phát ngay lập tức.
  3. **Khử thanh cuộn triệt để**: Sử dụng CSS chuyên biệt `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]` và `WebkitOverflowScrolling: 'touch'` trên khung hình chuẩn dọc 9:16 (`max-w-[325px]`), loại bỏ hoàn toàn thanh cuộn khó chịu trên cả iPhone và điện thoại Android.
  4. **Tự động gắn Schema `VideoObject`**: Tự động sinh dữ liệu cấu trúc video chuẩn Google giúp video xuất hiện trên tab Google Video Search.

---

## 3. Cách Biên Tập Viên Sử Dụng Hệ Thống Blocks Trong Thực Tế

1. **Soạn bài Tin tức / Khuyến mãi thông thường**:
   * Viết đoạn mở đầu giới thiệu chương trình (`TextBlock`).
   * Chèn hộp lưu ý thời hạn áp dụng (`CalloutBlock` - màu `warning`).
   * Chèn bảng giá các dòng xe áp dụng (`PriceTableBlock`).
   * Chèn video TikTok giới thiệu xe tại showroom (`TikTokBlock`).
   * Đặt nút "Đăng Ký Nhận Báo Giá Ưu Đãi" ở cuối (`CallToActionBlock`).
2. **Soạn bài Đánh giá chi tiết Dòng xe (Ví dụ: Đánh giá Creta)**:
   * Phân cấp tiêu đề rõ ràng bằng H2: `## Ngoại thất xe`, `## Không gian nội thất`, `## Vận hành & An toàn`.
   * Trong mục Ngoại thất: Chèn lưới 3 ảnh các góc xe (`GalleryBlock`).
   * Trong mục Vận hành: Chèn khối thông số động cơ SmartStream (`TabHeroBlock`).
   * Trong mục An toàn: Chèn lưới 6 tính năng SmartSense (`FeatureGridBlock`).
   * Cuối bài: Thêm mục hỏi đáp 4 câu hỏi thường gặp (`FAQBlock`).
   * *Kết quả*: Hệ thống tự động tạo ra một trang đánh giá đẳng cấp với Mục Lục cuộn động (Sticky TOC) ở cột phải và xuất hiện đầy đủ các Rich Snippets trên Google.
