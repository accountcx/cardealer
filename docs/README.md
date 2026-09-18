# TÀI LIỆU HỆ THỐNG CARDEALER (XEHYUNDAIVINH.COM)
## ĐẶC TẢ CHI TIẾT TÍNH NĂNG, DỮ LIỆU & NGHIỆP VỤ HỆ THỐNG

> **Mục tiêu tài liệu**: Tổng hợp toàn bộ các tính năng hiện có từ mã nguồn `be-cardealer` và `fe-cardealer`, làm rõ quy trình sử dụng, công thức nghiệp vụ, cấu trúc dữ liệu và các module giao diện phục vụ cho việc phát triển hệ thống mới.

---

## 📑 Danh Mục Hồ Sơ Kỹ Thuật

Hệ thống tài liệu bao gồm 4 chuyên đề chuyên sâu:

### 1. [02. Thiết Kế Cơ Sở Dữ Liệu & Mô Hình Thực Thể (ERD)](./02-DATABASE-SCHEMA-PAYLOAD-CMS.md)
* **Sơ đồ quan hệ thực thể (ERD)** chi tiết mối liên kết giữa các bảng.
* **Đặc tả 10 thực thể cốt lõi**: `Cars`, `CarVersions`, `Posts`, `Pages`, `Leads`, `Categories`, `Colors`, `VersionColors`, `Testimonials`, `Media`, `Users`.
* **7 Nhóm cấu hình toàn cục (Globals)**: `SiteSettings`, `Navigation`, `ContactSettings`, `EventBanner`, `QuoteSettings`, `QuoteTool`, `VipSection`.
* **Quy trình sử dụng thực tế (How-To-Use)**: Hướng dẫn quản trị viên thêm dòng xe mới, tạo phiên bản, gán màu sắc ngoại thất, xuất bản bài viết và quản lý phễu khách hàng tiềm năng (`Leads`).

### 2. [03. Hệ Thống Content Blocks & Soạn Thảo Bài Viết (Lexical)](./03-HE-THONG-CONTENT-BLOCKS-LEXICAL.md)
* **Cấu hình trình soạn thảo Lexical**: Hệ thống tiêu đề H1-H6, định dạng văn bản, danh sách, căn lề, trích dẫn, chèn liên kết và tải ảnh.
* **Đặc tả chi tiết 15 khối nội dung (Content Blocks)**:
  * Khối văn bản & ghi chú: `TextBlock`, `CalloutBlock`, `TwoColumnBlock`, `SpacerBlock`.
  * Khối trình diễn kỹ thuật & thông số: `TabHeroBlock`, `FeatureGridBlock`, `TableBlock`, `AdvancedTableBlock` (hỗ trợ Sort, Search, Export CSV).
  * Khối truyền thông & bán hàng: `YoutubeBlock`, `CallToActionBlock` (CTA), `RelatedCarBlock`, `GalleryBlock`, `PriceTableBlock`.
  * Khối chuyển đổi cao cấp: `FAQBlock` (tự động sinh Schema FAQPage) và `TikTokBlock` (trình phát video TikTok độc quyền khử thanh cuộn, autoplay và tự sinh VideoObject Schema).
* **Hướng dẫn biên tập viên**: Cách phối hợp các khối để tạo landing page và bài đánh giá chuyên sâu có mục lục tự động (TOC).

### 3. [04. Đặc Tả Tính Năng Frontend & Trải Nghiệm UI/UX](./04-TINH-NANG-FRONTEND-VA-TRAI-NGHIEM-UI-UX.md)
* **Bản đồ điều hướng toàn trang (Site Map)**: Chi tiết từ Trang chủ, Dòng xe, Phiên bản, Tin tức đến các trang công cụ.
* **Trang chủ phễu chuyển đổi 6 phân khu**: Hero Banner / Event Countdown, Lead Magnet Hub, VIP Showroom, Xe nổi bật, Tin tức, Bằng chứng xã hội bàn giao xe.
* **Trang Dòng xe & Phiên bản (`/xe/[carSlug]`)**: Hợp nhất toàn bộ phiên bản và màu sắc qua tham số URL (`?phien-ban=...&mau=...`) phục vụ deep-link và SEO, đổi màu ngoại thất trực quan, bảng so sánh thông số, bài review kèm mục lục cuộn động (Sticky TOC), thanh Sticky CTA chốt đơn đáy màn hình.
* **Công thức toán học & Nghiệp vụ chi tiết**:
  * Công thức tính giá lăn bánh theo quy định địa phương (TP. Vinh và các huyện).
  * Công thức tài chính tính trả góp ngân hàng (vốn tự có, tiền vay gốc, gốc & lãi hàng tháng theo dư nợ giảm dần).
  * Thuật toán bóc tách tiêu đề H2, H3 và thuật toán Scrollspy bắt vị trí cuộn chuột.
* **Tiện ích bán hàng**: Widget tư vấn viên nổi (`FloatingSeller`), popup dự toán lăn bánh, nút chia sẻ Facebook và sao chép link.

### 4. [05. Chiến Lược Technical SEO & Hệ Thống Schema JSON-LD Tự Động](./05-TECHNICAL-SEO-VA-SCHEMA-JSONLD.md)
* **Cấu trúc thẻ Meta động & Chuẩn hóa Canonical**: Cơ chế loại bỏ query parameters để chống lỗi phạt duplicate content.
* **Hệ thống 7 cấu trúc Schema JSON-LD tự động hóa**:
  * `Product` & `ItemList`: Chiến thuật FOMO giá xe có hạn chót cuối tháng (`priceValidUntil`), chính sách đổi trả 7 ngày tại showroom (`hasMerchantReturnPolicy`), miễn phí giao xe (`shippingDetails`), bảo hành chính hãng 5 năm (`warranty`).
  * `AutoDealer`: Khai báo doanh nghiệp ô tô địa phương kèm tọa độ Google Maps.
  * `NewsArticle`, `FAQPage`, `VideoObject`, `SoftwareApplication`, `BreadcrumbList`.
* **Dynamic Sitemap**: Phân cấp ưu tiên cao (`priority: 0.9`, `daily`) cho các bài viết chứa từ khóa bán hàng (`gia-lan-banh`, `khuyen-mai`).
* **Tích hợp Google Indexing API**: Hook tự động thông báo lập chỉ mục tức thì khi bấm Publish và công cụ gửi URL hàng loạt trong Admin Panel.

---

## 🎯 Bảng Đối Chiếu Tính Năng & Vị Trí Trong Mã Nguồn

| Nhóm tính năng | Nằm ở đâu trong source cũ | Cách vận hành / Điểm chạm người dùng |
| :--- | :--- | :--- |
| **Đổi màu xe ngoại thất** | `fe-cardealer/app/components/product/ProductHero.tsx` | Khách bấm nút swatch màu -> xe đổi ảnh đúng màu sắc ngoại thất đã chọn. |
| **Mục lục động (TOC)** | `fe-cardealer/app/components/TableOfContents.tsx` | Bóc tách H2, H3 từ RichText, cuộn mượt khi click, sáng đèn mục đang đọc (scrollspy). |
| **TikTok Player tối ưu** | `fe-cardealer/app/components/blocks/TikTokEmbed.tsx` | Hiện poster + play button -> click phát autoplay iframe v1 -> chặn scrollbar -> sinh Video Schema. |
| **Dự toán lăn bánh 2 bước** | `fe-cardealer/app/components/calculator/SmartCalculator.tsx` | Bước 1: Chọn xe & tỉnh -> Bước 2: Điền tên & SĐT (Gate) -> Bước 3: Xem bóc tách 6 khoản phí. |
| **Dự toán trả góp** | `fe-cardealer/app/components/TraGopCalculator.tsx` | Chọn xe, phiên bản, % trả trước, số năm vay -> Gửi lead -> Nhận lịch trả nợ. |
| **Tư vấn viên nổi** | `fe-cardealer/app/components/FloatingSeller.tsx` | Nút tròn nổi ở góc dưới -> mở ra danh thiếp tư vấn viên kèm nút Hotline & Zalo. |
| **Google Indexing tức thì**| `be-cardealer/src/lib/payload-hooks/indexOnPublish.ts` | Bấm Publish bài viết hoặc xe -> Server Account bắn link lên Google Indexing API. |
| **Schema Product & ItemList** | `fe-cardealer/app/xe/page.tsx` & `CarSchema.tsx` | Sinh JSON-LD với giá hạn chót cuối tháng, bảo hành 5 năm, đổi trả 7 ngày, ship toàn quốc. |
