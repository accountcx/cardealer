# 🎯 Feature Backlog: Hệ Thống Tin Tức, Content Blocks & Inbound Marketing (Tiptap Engine)

> **Mã Epic:** `EPIC-PHASE-5-CONTENT-TIPTAP-INBOUND`  
> **Tài liệu đặc tả nguồn:** Đặc tả nghiệp vụ Hệ Thống Tin Tức & Inbound Marketing (09/2026), [`docs/06-PHASED-IMPLEMENTATION-ROADMAP.md`](../../06-PHASED-IMPLEMENTATION-ROADMAP.md) (Dòng 254–277), [`docs/05-TECHNICAL-SEO-VA-SCHEMA-JSONLD.md`](../../05-TECHNICAL-SEO-VA-SCHEMA-JSONLD.md)  
> **Quy chuẩn thực thi:** **Universal Agentic Workflow (v2.2.0)** — Giai đoạn 2: Thiết kế Kiến trúc Chi Tiết  

---

## 1. Thông Tin Tổng Quan (Metadata)

* **Mã Tính Năng (Epic ID):** `EPIC-PHASE-5-CONTENT-TIPTAP-INBOUND`
* **Mục Tiêu Cốt Lõi:**
  1. **Thu thập tối đa số lượng khách hàng tiềm năng (Lead):** Thông qua hệ thống điểm chạm Inbound Marketing chuyển đổi cao (tối đa 3 điểm chạm/bài: `Inline Quick Form`, `Mobile Bottom Bar`, `Slide-in Banner`) với trải nghiệm điền nhanh mượt mà, không rào cản. Toàn bộ lead phát sinh được lưu trữ an toàn trong Database với đầy đủ nguồn bài viết, UTM tracking và thông tin tư vấn viên phụ trách.
  2. **Tối ưu hóa SEO thực chiến theo địa phương:** Xếp hạng Top 10 các từ khóa dài tại Nghệ An, Hà Tĩnh, TP. Vinh; bứt phá lưu lượng truy cập tự nhiên (Organic Traffic) và đo lường chuyển đổi Lead/Bài viết.
  3. **Trao quyền xuất bản & Cá nhân hóa thương hiệu (Personal Branding cho Saler):** Hỗ trợ biên tập bài viết trực quan qua trình soạn thảo **Tiptap Editor (`@tiptap/react`)**, gắn khối E-E-A-T tác giả ở chân bài viết.
  4. **Kiến trúc tinh gọn (Lean Architecture):**
     - *Editor Engine:* Sử dụng **Tiptap Editor (`@tiptap/react`)** 100% Free & Open Source (MIT), hỗ trợ React Component NodeViews trực quan trong Admin và render HTML thuần cực nhanh tại Next.js Server Components (RSC) ở Frontend.
     - *Phân quyền:* Tạm thời chưa triển khai phân quyền đa tầng phức tạp (RBAC) giữa Saler và BTV. Mọi nhân viên Admin đều có quyền tạo, sửa, xuất bản (`published`), hẹn giờ (`scheduled`), ghim bài hoặc lưu nháp (`draft`).
     - *Danh mục Content Blocks:* Tinh giản còn **8 Blocks Tinh Hoa + 3 Điểm Chạm Inbound Lead**. Loại bỏ các khối thừa thãi (`TextBlock`, `SpacerBlock`, `TwoColumnBlock`, `TabHeroBlock`) và gộp bảng nâng cao vào `TableBlock` thông minh.
     - *Lead Funnel:* Tập trung tối đa hóa tỉ lệ chuyển đổi (Fast Lead Conversion). Khách chỉ cần nhập Số điện thoại / Zalo, chọn dòng xe là gửi ngay, không tạo rào cản phức tạp.
* **Phạm Vi Nền Tảng (Target Platform & Scope):** Full-stack Monorepo
  * `packages/database`: Mở rộng schema `posts`, `categories`, `post_tags`, `leads` (bổ sung nguồn bài viết, UTM, authorId), bảng `redirects` 301.
  * `packages/types`: Định nghĩa Zod Schemas cho Posts, Post Status, 8 Content Blocks + Inbound Forms, SEO Score criteria.
  * `packages/core`: Bộ tiện ích bóc tách AST Tiptap/ProseMirror, chấm điểm SEO 10 tiêu chí, sinh mã Schema JSON-LD đa tầng (`NewsArticle`, `AutoDealer`, `BreadcrumbList`, Paywall `isAccessibleForFree: false`, `FAQPage`, `VideoObject`).
  * `apps/api`: REST APIs quản lý bài viết CRUD, API tiếp nhận lead từ bài viết, API redirect 301.
  * `apps/admin`: Trình soạn thảo Tiptap Blocks tinh gọn, Trình chấm điểm SEO real-time, Quản lý trạng thái xuất bản/hẹn giờ, Ghim bài, Watermark uploader.
  * `apps/web`: Trang danh sách tin tức (`/tin-tuc`), trang chuyên mục (`/tin-tuc/chuyen-muc/[slug]`), trang chi tiết bài viết (`/tin-tuc/[slug]`), Mobile Bottom Bar thông minh, Slide-in Banner exit-intent, Gated Content, Mini-Calculator.
* **Cấp Độ Thực Thi (Execution Tier):** **Tier 1 (Core Architecture & High Impact / Full 5-Phase Playbook)**.
* **Trạng Thái Môi Trường:** 🟢 **Pure Development** (Monorepo Drizzle ORM + Next.js App Router).
* **Múi Giờ & Định Dạng Chuẩn:**
  * Locale: `vi-VN`.
  * Tiền tệ: `VND` (triệu/tỷ đồng).
  * Múi giờ: `Asia/Ho_Chi_Minh` (`UTC+7`).

---

## 2. Quy Trình Biên Tập & Quản Trị Bài Viết (Editorial Workflow)

### 2.1. Quản Trị Bài Viết Tinh Giản
* **Phạm vi quản trị:** Mọi nhân viên có quyền truy cập Admin đều có thể:
  - Tạo mới bài viết, lưu nháp (`draft`).
  - Xem trước bài viết qua link riêng có mã bảo mật bí mật (`previewToken`).
  - Xuất bản trực tiếp (`published`) hoặc hẹn giờ lên bài tự động (`scheduled`).
  - Ghim tối đa 3 bài nổi bật lên đầu trang danh sách tin tức.
  - Chọn Tác giả bài viết (`authorId`) từ danh sách nhân viên tư vấn để hiển thị Khối E-E-A-T chân trang và gắn kèm vào dữ liệu lead.
* **Không áp đặt phân quyền chặn:** Không giới hạn quyền sửa bài theo người tạo, không chặn quyền xuất bản trực tiếp; tập trung tối đa nguồn lực vào độ mượt mà của trải nghiệm soạn thảo, hiệu quả bắt Lead và động cơ SEO.

### 2.2. Vòng Đời & Trạng Thái Bài Viết (Post State Machine)
```text
  [Tạo mới bài viết] 
        │
        ▼
   ┌─────────┐   Xuất bản ngay (Đạt chuẩn kiểm duyệt)   ┌───────────────┐
   │  Draft  │ ───────────────────────────────────────> │   Published   │
   └─────────┘                                          └───────────────┘
        │                                                       ▲
        │ Hẹn giờ tự động                                       │ Đến thời điểm hẹn
        ▼                                                       │
   ┌─────────┐                                                  │
   │Scheduled│ ─────────────────────────────────────────────────┘
   └─────────┘                                                  
        │                                                       │
        │ Hết hạn khuyến mãi hoặc lưu trữ                       │ Hết hạn khuyến mãi
        ▼                                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │                 Archived / Expired                         │
   └────────────────────────────────────────────────────────────┘
```

### 2.3. Điều Kiện Kiểm Soát Chất Lượng Nội Dung & Bản Quyền
Trước khi chuyển sang trạng thái `published` hoặc `scheduled`, hệ thống kiểm tra các tiêu chuẩn:
1. Có tiêu đề (`title` ≥ 20 ký tự), chuyên mục (`categoryId`), ảnh đại diện (`featuredImage` có `alt` text) và `metaDescription` (120–160 ký tự).
2. **Khử dữ liệu mẫu:** Tuyệt đối không còn tồn tại ký tự trong ngoặc vuông mẫu (Ví dụ: `[Tên xe]`, `[Giá lăn bánh]`, `[Hotline]`).
3. **Bản quyền ảnh giao xe:** Với chuyên mục *"Giao xe khách hàng"*, bắt buộc tích xác nhận pháp lý: *"Đã được khách hàng đồng ý đăng ảnh bàn giao xe"*.
4. **Cảnh báo SEO:** Điểm SEO < 70/100 sẽ hiển thị cảnh báo gợi ý tối ưu, không chặn cứng thao tác xuất bản.

---

## 3. Kiến Trúc Khối Nội Dung & Điểm Chạm Thu Thập Lead

### 3.1. Giới Hạn Tối Đa 3 Điểm Chạm Chuyển Đổi Trên Mỗi Bài Viết
Để đảm bảo trải nghiệm đọc mượt mà và không gây ức chế cho khách hàng, hệ thống thực thi quy tắc **Strict 3-Touchpoints Cap**:
1. **Điểm chạm 1:** `Inline Quick Form` chèn giữa bài viết (hoặc `Gated Content` / `Mini-Calculator`).
2. **Điểm chạm 2:** Thanh `Mobile Bottom Bar` thông minh (Gọi, Zalo, Nhận ưu đãi) neo đáy màn hình.
3. **Điểm chạm 3:** `Slide-in Banner` trượt góc nhỏ gọn khi cuộn sâu (Scroll-depth > 60%) hoặc có ý định thoát trang (Exit-intent).

### 3.2. Danh Mục Khối Thu Thập Lead Inbound (Tối Đa Chuyển Đổi)
* **`Inline Quick Form` (Form Điền Nhanh Giữa Bài):**
  - Đặt xen kẽ sau phân đoạn phân tích giá hoặc khuyến mãi.
  - Trường nhập siêu tốc: Số điện thoại / Zalo, chọn dòng xe quan tâm.
  - Nhãn nút CTA linh hoạt: *"Nhận Báo Giá Lăn Bánh Ngay"*, *"Tải Bảng Ước Tính Trả Góp"*.
* **`Gated Content` (Khóa Nội Dung Một Phần Có Trách Nhiệm):**
  - **Quy tắc vàng:** Chỉ áp dụng làm mờ các "Phần thưởng thêm" (Bonus Value) như: *Bảng chiết khấu nội bộ tháng này*, *Dự toán chi phí lăn bánh chi tiết từng huyện*.
  - **Tuyệt đối không khóa nội dung SEO chính:** Không làm mờ bài viết chính để bảo vệ chỉ số đọc hiểu và xếp hạng Google.
  - **Paywall Schema Chuẩn Google:** Tự động gắn thuộc tính `isAccessibleForFree: false` và `cssSelector` trong Schema `NewsArticle` để tránh thuật toán Google phạt lỗi gian lận nội dung (Cloaking).
  - Mở khóa tức thì không reload trang sau khi nhập SĐT hợp lệ.
* **`Mini-Calculator` (Công Cụ Tính Giá Thu Nhỏ):**
  - Khách chọn phiên bản xe, mức trả trước (20%, 30%), thời hạn vay (3, 5, 8 năm).
  - Trả về kết quả ước tính sơ bộ (Số tiền trả góp hàng tháng).
  - Nhập SĐT để nhận bảng lịch trình trả nợ chi tiết file PDF qua Zalo.

---

## 4. Danh Mục 8 Content Blocks Tinh Hoa (Tiptap React NodeViews)

Hệ thống tập trung vào **8 Blocks Tinh Hoa** được xây dựng bằng Tiptap Custom Extensions với React Component NodeViews:

```
8 Content Blocks Tinh Hoa:
├── 1. Khối Ghi Chú & Cảnh Báo:
│   └── CalloutBlock: Hộp ghi chú & cảnh báo nổi bật (info, warning, success, note)
├── 2. Khối Chuyên Ngành Xe & Trình Diễn:
│   ├── FeatureGridBlock: Lưới trang bị ngoại/nội thất & Hyundai SmartSense (2, 3, 4 cột, hover zoom)
│   ├── RelatedCarBlock: Card dòng xe liên quan (ảnh 3/4, giá từ, số phiên bản, nút xem chi tiết)
│   └── GalleryBlock: Thư viện album ảnh xe (slider vuốt ngang trên mobile + Lightbox phóng to)
├── 3. Khối Dữ Liệu Bảng Biểu:
│   ├── TableBlock: Bảng dữ liệu thông minh (mặc định responsive cuộn ngang, có toggle Search tức thì & Export CSV)
│   └── PriceTableBlock: Bảng giá xe tự động cập nhật từ Database (có nút "Nhận Ưu Đãi")
├── 4. Khối Media Truyền Thông:
│   ├── YoutubeBlock: Nhúng video trải nghiệm lái thử (tỉ lệ chuẩn 16:9, tự trích xuất ID)
│   └── TikTokBlock: Video ngắn dọc 9:16 độc quyền (Facade poster, autoplay v1, triệt tiêu scrollbar)
└── 5. Khối FAQ & Điều Hướng:
    └── FAQBlock: Accordion hỏi đáp mượt mà (phục vụ UX đọc lướt + tự động sinh Schema FAQPage)
```

| STT | Tên Block | Phân Nhóm | Chức Năng Cốt Lõi | Cơ Chế Nổi Bật |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `CalloutBlock` | Ghi chú & Cảnh báo | Hộp lưu ý ưu đãi, cảnh báo thủ tục bấm biển | 4 màu pastel (`info`, `warning`, `success`, `note`), icon theo ngữ cảnh |
| 2 | `FeatureGridBlock` | Trang bị & An toàn | Lưới tính năng xe / SmartSense | Cột linh hoạt (`2`, `3`, `4`), ảnh hover zoom, tự co 1 cột trên mobile |
| 3 | `TableBlock` | Dữ liệu thông minh | Bảng thông số kỹ thuật & so sánh | Hỗ trợ header, cuộn ngang, tùy chọn bật Live Search và xuất CSV UTF-8 BOM |
| 4 | `RelatedCarBlock` | Phễu chuyển đổi | Nhúng thẻ xe đang bán vào bài | Tự động lấy ảnh 3/4, giá khởi điểm từ, số phiên bản và nút nhận ưu đãi |
| 5 | `PriceTableBlock` | Bảng giá tự động | Bảng giá dòng xe cập nhật tự động | Đồng bộ phiên bản từ DB, tính dự toán lăn bánh, nút nhận ưu đãi |
| 6 | `YoutubeBlock` | Media truyền thông | Nhúng video trải nghiệm lái thử | Tự bóc tách Video ID (YouTube/Vimeo), khung hình tỉ lệ chuẩn 16:9 |
| 7 | `TikTokBlock` | Media ngắn độc quyền | Video ngắn đánh giá & giao xe | Facade poster + play pulse, autoplay v1 API, khử triệt để scrollbar, Schema `VideoObject` |
| 8 | `GalleryBlock` | Thư viện hình ảnh | Album ảnh ngoại thất/nội thất | Slider vuốt ngang mượt mà trên mobile, tích hợp Lightbox phóng to ảnh |
| * | `FAQBlock` | Chuyển đổi & SEO | Hỏi đáp thường gặp | Accordion mượt mà, hỗ trợ RichText, tự động sinh mã JSON-LD `FAQPage` cho Google |

---

## 5. Động Cơ Tối Ưu SEO Thực Chiến (SEO Engine)

### 5.1. Bộ Chấm Điểm SEO Real-Time 10 Tiêu Chí
1. **Độ dài tiêu đề:** 40–65 ký tự, chứa từ khóa chính ở nửa đầu.
2. **Từ khóa trong Slug:** Slug ngắn gọn, chứa từ khóa chính không dấu, nối bằng gạch ngang.
3. **Từ khóa trong Đoạn mở đầu (Introduction):** Xuất hiện trong 100 từ đầu tiên.
4. **Mật độ từ khóa (Keyword Density):** Đạt ngưỡng tối ưu 1.0% – 2.5% tổng số từ.
5. **Độ dài bài viết:** Tối thiểu 600 từ (bài tin nhanh) hoặc 1.200 từ (bài đánh giá chuyên sâu).
6. **Cấu trúc thẻ tiêu đề:** Có ít nhất 2 thẻ H2; thẻ H2 chứa từ khóa chính hoặc biến thể địa phương (Vinh, Nghệ An, Hà Tĩnh).
7. **Thẻ Alt của hình ảnh:** 100% ảnh có thuộc tính `alt`, có ít nhất 1 ảnh chứa từ khóa chính.
8. **Liên kết nội bộ (Internal Links):** Có ít nhất 2 link trỏ đến các dòng xe hoặc bài viết liên quan.
9. **Độ dài Meta Description:** 120–160 ký tự, hấp dẫn và chứa từ khóa chính kèm lời kêu gọi hành động.
10. **Cảnh báo trùng lặp từ khóa (Cannibalization Guard):** Tự động kiểm tra đối chiếu từ khóa chính với toàn bộ bài viết đã xuất bản trong cơ sở dữ liệu.

### 5.2. Tự Động Hóa Schema JSON-LD Toàn Diện
* **`NewsArticle`:** Tự động khai báo tiêu đề, ảnh đại diện, ngày xuất bản, ngày cập nhật (`lastmod`), tên tác giả Saler (`Person`), nhà xuất bản (`AutoDealer`).
* **Paywall Schema (`isAccessibleForFree`):** Với bài viết có `Gated Content`, sinh khai báo:
  ```json
  "isAccessibleForFree": false,
  "hasPart": {
    "@type": "WebPageElement",
    "isAccessibleForFree": false,
    "cssSelector": ".gated-content-section"
  }
  ```
* **`BreadcrumbList`:** Khai báo cấu trúc điều hướng phân cấp (Trang chủ ➔ Tin tức ➔ Chuyên mục ➔ Tên bài viết).
* **`AutoDealer`:** Khai báo đại lý Hyundai Dũng Lạc (TP. Vinh, Nghệ An) kèm địa chỉ và hotline.
* **`FAQPage` & `VideoObject`:** Tự động sinh khi bài viết có chứa `FAQBlock`, `TikTokBlock` hoặc `YoutubeBlock`.

### 5.3. URL, 301 Redirect Engine & Canonical
* Tạo Slug tĩnh tự động từ tiêu đề tiếng Việt chuẩn SEO.
* **Hệ thống Redirect 301 tự động:** Khi Admin/BTV chỉnh sửa Slug của một bài đã xuất bản (`published`), hệ thống tự động ghi bản ghi vào bảng `redirects` (`oldPath` ➔ `newPath`, `code: 301`) nhằm giữ trọn vẹn sức mạnh liên kết (Link Equity) và không bao giờ gây lỗi 404 cho người dùng cũ.
* Tùy chọn gạt `Noindex` thủ công cho các bài viết nháp nội bộ hoặc trang thẻ mỏng (< 3 bài viết).

---

## 6. Trải Nghiệm & Hiển Thị Phía Frontend (Storefront Experience)

### 6.1. Trang Danh Sách & Chuyên Mục (`/tin-tuc`)
* **Khu vực Ghim nổi bật (Sticky Top 3):** Hiển thị tối đa 3 bài viết quan trọng nhất với layout hero lớn, nhãn "Nổi bật".
* **Card bài viết tối ưu:** Hiển thị rõ chuyên mục (badge màu), ảnh đại diện tỉ lệ 16:9, tiêu đề font đậm, ngày đăng, thời gian đọc ước tính (Reading time).
* **SEO Trang Chuyên Mục:** Mỗi chuyên mục có đoạn văn bản mô tả giàu từ khóa ở đầu trang.
* **Phân trang chuẩn SEO:** Sử dụng URL tham số thân thiện (`/tin-tuc?trang=2`), tuyệt đối **không** dùng Infinite Scroll JS để Googlebot thu thập dữ liệu dễ dàng.

### 6.2. Trang Chi Tiết Bài Viết (`/tin-tuc/[slug]`)
* **Thanh Bottom Bar Thông Minh (Mobile):** Neo cố định đáy màn hình với 3 nút bấm tác vụ:
  1. Nút **[Gọi điện]**: `tel:09...` (Hotline của Saler tác giả).
  2. Nút **[Zalo]**: Mở app Zalo kèm tin nhắn soạn sẵn theo tiêu đề bài viết.
  3. Nút **[Nhận Ưu Đãi (Form)]**: Mở popup form điền nhanh. Nhãn nút được **tự động cá nhân hóa** theo Chuyên mục + Dòng xe:
     - Chuyên mục Khuyến mãi ➔ *"Nhận ưu đãi [Tên xe]"*
     - Chuyên mục Đánh giá ➔ *"Đăng ký lái thử [Tên xe]"*
     - Chuyên mục So sánh ➔ *"Tư vấn chọn xe"*
     - Chuyên mục Giao xe ➔ *"Nhận báo giá lăn bánh"*
* **Slide-in Banner (Popup Trượt Góc Tinh Tế):**
  - Kích hoạt thông minh: Trên Mobile kích hoạt khi cuộn qua 60% bài viết; trên Desktop kích hoạt khi con trỏ chuột di chuyển lên thanh địa chỉ (Exit-intent).
  - Thiết kế trượt góc nhỏ gọn, có nút `[X]` đóng rõ ràng, lưu `sessionStorage` để không hiển thị lại quá 1 lần/phiên.
* **Khối Tác Giả E-E-A-T (Author Box):** Đặt ở cuối bài viết: Ảnh chân dung Saler, tên thật, chức danh, kinh nghiệm tư vấn xe và nút kết nối Zalo trực tiếp.
* **Quản Lý Bài Khuyến Mãi Hết Hạn:** Với bài viết có "Ngày hết hạn ưu đãi", khi qua ngày hệ thống tự động đổi badge sang *"Đã kết thúc ưu đãi"* kèm banner cảnh báo và nút dẫn sang *"Xem ưu đãi mới nhất tháng này"*.

---

## 7. Xử Lý Đa Phương Tiện & Lưu Trữ Lead

### 7.1. Xử Lý Media & Bản Quyền
* **Tự động chuyển đổi ảnh:** Upload ảnh tự động nén sang định dạng `WebP`, sinh 3 kích cỡ (thumbnail, medium, large) và bắt buộc nhập trường `alt`.
* **Watermark Logo Showroom:** Cấu hình tùy chọn tự động đóng dấu chìm logo Hyundai Vinh vào góc phải dưới của hình ảnh trước khi lưu trữ.

### 7.2. Lưu Trữ & Quản Lý Lead
* Khi khách hàng gửi Form (từ `Inline Quick Form`, `Mobile Bottom Bar`, `Slide-in Banner`, `Gated Content` hoặc `Mini-Calculator`):
  1. Lưu trữ Lead an toàn vào Database kèm `postId`, `salerId`, `utmSource`, `utmCampaign`.
  2. Lead được hiển thị trực tiếp và quản lý tập trung trong phân hệ Quản trị Leads của Admin Portal.

---

## 8. Ma Trận Lát Cắt Tính Năng Thực Thi (Vertical Slices Matrix)

| ID | Lát Cắt Tính Năng | Nền Tảng / Layer | Target Files Dự Kiến | Phương Pháp Kiểm Chứng (DoD) | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **US-01** | **Database Schema, Post States & 8 Blocks Tiptap Data Contracts**<br>- Schema `posts`, `categories`, `post_tags`, `redirects`, mở rộng `leads` (UTM, postId, authorId).<br>- Zod Schemas & Types cho 8 Content Blocks + Inbound Forms, Post Status enum (`draft`, `published`, `scheduled`, `archived`).<br>- Tiện ích bóc tách AST Tiptap (`extractHeadingsFromTiptap`, `extractFaqsFromTiptap`, `extractVideosFromTiptap`) tại `packages/core`. | Database / Shared Types / Core | `packages/database/src/schema/posts.ts`, `categories.ts`, `redirects.ts`; `packages/types/src/content-blocks.ts`, `post.ts`; `packages/core/src/lexical/` (Tiptap AST parser) | Schema migration thành công; `pnpm check-types` pass 100%; Unit tests kiểm tra state transitions và AST parsers đạt kết quả chuẩn xác. | 🔄 SẴN SÀNG |
| **US-02** | **8 Content Blocks Library & Inbound Lead Components (Tiptap + UI)**<br>- Xây dựng 8 Content Blocks tinh hoa chuẩn UI tokens tại `packages/ui` / `apps/web`.<br>- Triển khai `TikTokBlock` tỉ lệ dọc 9:16, Facade poster, autoplay v1, triệt tiêu scrollbar.<br>- Xây dựng các khối Inbound: `Inline Quick Form`, `Gated Content` (hiệu ứng blur mở khóa), `Mini-Calculator`.<br>- Xây dựng `TableBlock` thông minh (search tức thì, sort cột, CSV export tiếng Việt UTF-8 BOM). | UI Components / Forms | `packages/ui/src/blocks/` (8 blocks components), `apps/web/components/blocks/` | Render hoàn hảo 8 blocks; Khử sạch thanh cuộn TikTok trên mobile; Table search/sort trơn tru. | ⏸️ CHỜ |
| **US-03** | **SEO Engine, 10-Criteria Checker, Schemas & 301 Redirect Engine**<br>- Hàm chấm điểm SEO 10 tiêu chí real-time tại `packages/core/src/seo/score.ts`.<br>- Sinh mã JSON-LD đa tầng: `NewsArticle`, Paywall `isAccessibleForFree: false`, `BreadcrumbList`, `AutoDealer`, `FAQPage`, `VideoObject`.<br>- Middleware xử lý 301 Redirects tự động từ bảng `redirects` khi đổi slug. | Core SEO / API Middleware | `packages/core/src/seo/score.ts`, `json-ld.ts`, `apps/api/src/middleware/redirect.ts` | Điểm SEO tính toán chính xác; Rich Results Test pass 100% các schemas; Thử nghiệm đổi slug nhận mã 301 chuyển hướng URL an toàn. | ⏸️ CHỜ |
| **US-04** | **Admin Editorial Management với Tiptap Editor & Preview Link**<br>- Giao diện soạn thảo bài viết Admin với Tiptap Editor (`@tiptap/react`) tích hợp React Component NodeViews cho 8 Blocks.<br>- Quản lý xuất bản: Tạo nháp, xuất bản trực tiếp, hẹn giờ tự động, ghim bài; Link Preview bí mật.<br>- Kiểm duyệt điều kiện xuất bản (loại bỏ `[...]`, xác nhận bản quyền ảnh giao xe).<br>- Tiếp nhận Lead từ các form bài viết và lưu vết đầy đủ trong Database. | Apps Admin / API Backend | `apps/admin/app/posts/`, `apps/api/src/routes/posts.ts` | Thao tác soạn thảo Tiptap mượt mà; Xuất bản chặn nếu còn `[...]`; Lead submit từ web lưu trữ chuẩn xác vào DB. | ⏸️ CHỜ |
| **US-05** | **Storefront News Experience, Sticky Mobile Bottom Bar, Slide-in Banner & Verification**<br>- Trang danh sách `/tin-tuc` (Top 3 bài ghim, phân trang `?trang=2`, SEO chuyên mục).<br>- Trang chi tiết `/tin-tuc/[slug]` tích hợp Server-rendered Tiptap HTML, Sticky TOC Scrollspy, E-E-A-T Box, Quản lý ưu đãi hết hạn.<br>- Mobile Bottom Bar thông minh cá nhân hóa nhãn theo chuyên mục + Dòng xe.<br>- Slide-in Banner trượt góc exit-intent / scroll-depth.<br>- Kiểm thử toàn diện Monorepo (`check-types`, `build`). | Apps Web | `apps/web/app/tin-tuc/`, `apps/web/components/PostBottomBar.tsx`, `apps/web/components/SlideInBanner.tsx` | Core Web Vitals LCP ≤ 2.5s, CLS ≤ 0.1; Mobile bar click gọi/Zalo/Form mượt mà; Slide-in banner không che màn hình và không lặp lại; `pnpm build` pass 100%. | ⏸️ CHỜ |

---

## 9. Danh Sách Design Stack Kích Hoạt Cho Giai Đoạn 2

* `system-analyst-architect` (Bắt buộc ở Bước 2.1: Phân tích kiến trúc Post Management, Cơ chế 301 Redirect Engine, Paywall Schema và giải pháp Quét AST Tiptap tại `SOLUTION_OPTIONS.md`).
* `logic-flow-ba` (Bước 2.2: Lập sơ đồ tuần tự luồng xuất bản/hẹn giờ bài viết, luồng lưu trữ Lead, luồng Mở khóa Gated Content và luồng Exit-intent Slide-in Banner tại `FLOW.md`).
* `feature-spec-generator` (Bước 2.2: Đặc tả dữ liệu Zod Schemas cho Posts, 8 Blocks, SEO Score criteria và API Contracts tại `SCHEMA.md` & `API_SPEC.md`).
* `tailwind-ui-designer` (Bước 2.2: Đặc tả Design System, Tiptap React NodeViews, Mobile Bottom Bar cá nhân hóa, Slide-in Banner trượt góc, Khối E-E-A-T Saler tại `FE_INTEGRATION_GUIDE.md`).

---

## 10. Kế Hoạch Chuyển Tiếp Gate 2

* **Lệnh thông quan:** `"Confirm Step 2: Duyệt Thiết kế"`
* **Hành động tiếp theo sau khi thông quan:** Bước vào **Giai đoạn 3: Kiểm soát Rủi ro & Test Plan (`RISK_AUDIT.md`, `TEST_PLAN.md`)**.
