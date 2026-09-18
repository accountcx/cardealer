# PHẦN 5: CHIẾN LƯỢC TECHNICAL SEO & HỆ THỐNG SCHEMA JSON-LD TỰ ĐỘNG

Website `xehyundaivinh.com` sở hữu một trong những hệ thống Technical SEO và Rich Snippet Schema hoàn chỉnh và tự động hóa cao nhất trong ngành phân phối ô tô tại Việt Nam. Toàn bộ logic này cần được bảo lưu và đưa vào package `@cardealer/utils` trong kiến trúc Monorepo mới.

---

## 1. Tối Ưu Hóa Thẻ Meta & Trình Thu Thập Dữ Liệu (Meta Tags & Crawlers)

### 1.1. Cấu Trúc Title & Description Động
* **Title Template**: Cấu hình tại `SiteSettings`, định dạng chuẩn: `%s | Hyundai Vinh` hoặc `%s - Đại lý ủy quyền chính hãng`.
* **Canonical URL Chuẩn Hóa**:
  * Luôn trỏ về URL gốc duy nhất của tài nguyên, tự động loại bỏ mọi query parameters (Ví dụ: Dù khách truy cập `https://xehyundaivinh.com/xe/custin?phien-ban=cao-cap&source=facebook`, thẻ Canonical vẫn là `https://xehyundaivinh.com/xe/custin`).
  * Tránh hoàn toàn lỗi trùng lặp nội dung (Duplicate Content Penalty) theo khuyến nghị của Google Webmaster.
* **Thẻ Robots Tối Ưu Cho Công Cụ Tìm Kiếm**:
  ```typescript
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
  ```

---

## 2. Hệ Thống 7 Cấu Trúc Schema JSON-LD Tự Động Hóa Cao Cấp

### 2.1. Schema Dòng Xe & Danh Sách Xe (`Product` & `ItemList`)
Áp dụng tại `/xe` và `/xe/[carSlug]`, đáp ứng 100% tiêu chuẩn Google Merchant Center:

1. **Chiến Thuật Tạo Sự Khan Hiếm (FOMO `priceValidUntil`)**:
   * Giá xe niêm yết không cố định vĩnh viễn mà được tự động tính hạn chót là **ngày cuối cùng của tháng hiện tại**:
     ```typescript
     const now = new Date()
     const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
     const priceValidUntil = lastDayOfMonth.toISOString().split('T')[0]
     ```
   * Khi hiển thị trên Google Search, thông tin giá sẽ hiển thị kèm dòng chữ khuyến mãi chỉ áp dụng trong tháng, thúc đẩy khách hàng gọi điện ngay.
2. **Ưu Tiên Mô Tả Chuẩn Local SEO (Description Priority Cascade)**:
   * Thứ tự ưu tiên: `meta.description` (Nhập tay) > `moTaNgan` > `moTaChung` > Template từ khóa Local:
     `"Thông số kỹ thuật, bảng giá xe Hyundai [Tên Xe] 2025 lăn bánh tốt nhất tại Vinh, Nghệ An. Hỗ trợ trả góp 80%, Bảo hành 5 năm chính hãng."`
3. **Chính Sách Đổi Trả Minh Bạch (`hasMerchantReturnPolicy`)**:
   * Khai báo chính sách kiểm tra và đổi trả trong vòng 7 - 30 ngày tại showroom:
     ```json
     "hasMerchantReturnPolicy": {
       "@type": "MerchantReturnPolicy",
       "merchantReturnLink": "https://xehyundaivinh.com/chinh-sach",
       "merchantReturnDays": 7,
       "returnPolicyCategory": "https://schema.org/MerchantReturnInStore"
     }
     ```
4. **Miễn Phí Giao Xe Toàn Quốc (`shippingDetails`)**:
   * Khai báo miễn phí vận chuyển (0 VNĐ), thời gian xử lý thủ tục giao nhận 0-1 ngày, thời gian vận chuyển xe 0-3 ngày.
5. **Gói Bảo Hành Chính Hãng (`warranty`)**:
   * Khai báo bảo hành 5 năm hoặc 100.000 km (`WarrantyPromise`, `durationOfWarranty: 5 ANN`).

---

### 2.2. Schema Doanh Nghiệp Địa Phương (`AutoDealer` - Local SEO)
Render tại trang chủ (`app/page.tsx`), giúp Google Maps và Google Search nhận diện showroom là đại lý ô tô chính thức tại địa phương:
* `@type`: `AutoDealer`
* `name`: Tên đại lý ("Hyundai Vinh").
* `address`: Địa chỉ chi tiết (Thành phố Vinh, Tỉnh Nghệ An, Việt Nam).
* `geo`: Tọa độ vệ tinh chính xác (`latitude`, `longitude`) liên kết với Google Maps.
* `telephone`: Hotline bán hàng.
* `priceRange`: `$$$` (Phân khúc giá trị cao).

---

### 2.3. Schema Bài Viết (`NewsArticle`)
Render tại `/tin-tuc/[slug]`:
* `headline`: Tiêu đề bài viết.
* `datePublished` & `dateModified`: Thời gian đăng và cập nhật mới nhất.
* `author`: Tác giả ("Ban Biên Tập" hoặc người viết cụ thể).
* `publisher`: Thông tin đại lý kèm logo hình ảnh chuẩn.

---

### 2.4. Schema Hỏi Đáp (`FAQPage`)
* Bóc tách tự động từ tất cả các khối `faqBlock` có trong bài viết hoặc trang sản phẩm.
* Giúp bài viết mở rộng diện tích hiển thị trên Google với các câu hỏi Accordion bấm mở trực tiếp trên SERP.

---

### 2.5. Schema Ứng Dụng Tài Chính (`SoftwareApplication`)
* Render tại trang `/gia-lan-banh`.
* Khai báo trang là một công cụ phần mềm tài chính miễn phí (`applicationCategory: "FinanceApplication"`), gia tăng uy tín cho trang công cụ tính phí.

---

### 2.6. Schema Video (`VideoObject`)
* Tự động sinh ra khi bài viết sử dụng khối `TikTokBlock` hoặc `YouTubeBlock`.
* Khai báo tiêu đề video, ảnh thumbnail poster, ngày tải lên và đường dẫn nội dung.

---

### 2.7. Schema Đường Dẫn Phân Cấp (`BreadcrumbList`)
* Xuất hiện trên tất cả các trang con (Dòng xe, Tin tức, Trang đơn), giúp Google hiển thị cấu trúc URL dạng phân cấp đẹp mắt thay vì link trần dài.

---

## 3. Dynamic Sitemap (`sitemap.ts`) & Phân Cấp Mức Ưu Tiên

Hệ thống sinh sitemap tự động theo cơ chế bất đồng bộ song song (`Promise.allSettled`):
* **Trang chủ (`/`)**: `priority: 1.0`, `changeFrequency: 'daily'`.
* **Trang danh sách xe (`/xe`) & Chi tiết xe (`/xe/[carSlug]`)**: `priority: 0.9`, `changeFrequency: 'daily' / 'weekly'` (Trọng tâm bán hàng).
* **Bài viết tin tức có từ khóa bán hàng (Sales Content)**:
  * Hệ thống tự động kiểm tra slug nếu chứa: `gia-lan-banh`, `khuyen-mai`, `uu-dai` -> Tự động nâng `priority` lên **`0.9`** và tần suất quét `daily`.
  * Các bài tin tức thông thường: `priority: 0.7`, `changeFrequency: 'weekly'`.
* **Trang danh mục & Trang tĩnh CMS (`/tin-tuc`, `/chinh-sach`...)**: `priority: 0.8`.

---

## 4. Tích Hợp Google Indexing API v3

Thay vì chờ Google Bot tự thu thập sau vài ngày hoặc vài tuần, hệ thống có giải pháp index tức thì:
1. **Hook Tự Động (`indexOnPublish.ts`)**:
   * Khi Admin tạo mới hoặc cập nhật bài viết/dòng xe và ấn **Publish**, hook phía sau hậu trường sử dụng Google Service Account (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_PROJECT_ID`) để gửi thông báo `URL_UPDATED` trực tiếp tới Google Indexing API.
   * Bài viết thường được Google lập chỉ mục chỉ sau **vài phút**.
2. **Công Cụ Gửi Hàng Loạt Trong Admin Panel (`BulkIndexingTool.tsx`)**:
   * Giao diện quản trị chuyên biệt tại menu `/admin/google-indexing`.
   * Cho phép dán danh sách hàng chục URL hoặc bấm nút quét tự động toàn bộ sản phẩm/bài viết để submit lên Google đồng loạt, có báo cáo thành công/thất bại chi tiết.
