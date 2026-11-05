# 📋 BACKLOG: SEO Optimization & Organic Growth Engine

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Trạng thái:** `Planning / Ready for Phased Execution`  
> **Mục tiêu:** Khắc phục triệt để các lỗi Technical SEO, tối ưu Core Web Vitals, mở rộng độ phủ từ khóa qua Programmatic Landing Pages và thống trị Top Google Search cho đại lý ô tô tại khu vực miền Trung (Nghệ An - Hà Tĩnh).

---

## 🗺️ Ma Trận Phân Kỳ Thực Thi (4-Phase Execution Roadmap)

| Giai đoạn | Tên Lát Cắt (Vertical Slice) | Mục tiêu chính | Độ ưu tiên |
| :--- | :--- | :--- | :---: |
| **P1: Quick Wins** | **US-01:** Chuẩn hóa Canonical & Khắc phục Sitemap Redirects | Xóa bỏ cảnh báo đỏ trên Google Search Console | P0 (Khẩn cấp) |
| | **US-02:** Khắc phục Tài nguyên Social Image & SERP Mobile Icons | Sửa lỗi 404 Open Graph & hiện logo đại lý trên SERP | P0 (Khẩn cấp) |
| | **US-03:** Bảo vệ Cấu trúc Heading H1 Toàn Cục | Tránh mất thẻ H1 khi tắt banner trang chủ | P1 (Cao) |
| **P2: CWV & Sync** | **US-04:** Tối ưu Core Web Vitals Trang Tin Tức (LCP & CLS) | Chuyển `<img>` sang `next/image` có responsive sizes | P1 (Cao) |
| | **US-05:** On-Demand Cache Revalidation & RSS Feed | Đồng bộ dữ liệu tức thì khi CMS thay đổi giá/bài | P1 (Cao) |
| **P3: Scale Traffic**| **US-06:** Mở rộng Landing Page Phân Khúc (Hatchback & Xe Điện) | Phủ trọn dải sản phẩm i10 Hatchback & Ioniq 5 | P2 (Trung bình) |
| | **US-07:** Programmatic Landing Pages Dự Toán Lăn Bánh Theo Xe | Đón trúng ý định tìm kiếm *"Giá lăn bánh [xe] tại Nghệ An"* | P2 (Trung bình) |
| **P4: Local & Trust**| **US-08:** Thống trị Local SEO, Đánh Giá Thực Tế & Schema E-E-A-T | Tích hợp Review Schema & đồng bộ Google Maps | P2 (Trung bình) |

---

## 1. Danh Sách Lát Cắt Dọc Nghiệp Vụ (Vertical Slices)

---

### 🔹 US-01: Chuẩn Hóa Canonical & Khắc Phục Sitemap Redirects (P0)
- **Actor:** Googlebot, Bingbot, SEO Lead.
- **Vấn đề giải quyết:**
  - Trang `/gia-lan-banh` hiện thiếu thẻ `alternates.canonical`, có nguy cơ kế thừa `canonical: '/'` từ `RootLayout`, khiến công cụ tìm kiếm gộp chỉ mục về trang chủ.
  - Route `/tra-gop` đang trả về mã 307 Temporary Redirect nhưng lại được khai báo trong `sitemap.ts` với priority 0.8, dẫn đến lỗi *"Page with redirect in sitemap"* trên Google Search Console.
- **Mô tả:** 
  1. Bổ sung `canonical: '/gia-lan-banh'` vào metadata trang tính giá lăn bánh.
  2. Nâng cấp route `/tra-gop` thành Server Component Landing Page độc lập (tối ưu cho chùm từ khóa *"Mua xe ô tô trả góp ngân hàng lãi suất thấp"*), hoặc cấu hình chuyển hướng 301 Permanent Redirect và loại bỏ triệt để khỏi `sitemap.ts`.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 1.1: Truy cập trang Dự toán lăn bánh có Canonical chuẩn**
    - *Given:* Googlebot truy cập URL `https://xehyundaivinh.com/gia-lan-banh?xe=tucson&tab=tra-gop`.
    - *When:* Kiểm tra mã HTML render từ máy chủ (SSR).
    - *Then:* Thẻ `<link rel="canonical" href="https://xehyundaivinh.com/gia-lan-banh" />` xuất hiện chính xác, không dính query params và không bị trỏ về `/`.
  - **Scenario 1.2: Sitemap XML không chứa bất kỳ URL nào bị Redirect**
    - *Given:* Googlebot cào file `/sitemap.xml`.
    - *When:* Kiểm tra mã phản hồi HTTP của toàn bộ các URL trong sitemap.
    - *Then:* 100% URL trả về mã `HTTP 200 OK`, tuyệt đối không có URL trả về mã `301`, `302`, `307` hoặc `404`.
  - **Scenario 1.3: Trang Mua Xe Trả Góp hoạt động chuẩn SEO**
    - *Given:* Người dùng hoặc bot truy cập `/tra-gop`.
    - *When:* Trang tải xong.
    - *Then:* Trả về mã HTTP 200, tiêu đề chứa từ khóa trả góp, có công cụ tính lãi suất trực quan và thẻ Canonical riêng `/tra-gop`.

---

### 🔹 US-02: Khắc Phục Tài Nguyên Social Image & SERP Mobile Icons (P0)
- **Actor:** Khách hàng chia sẻ link trên Zalo/Facebook, Google Mobile Search.
- **Vấn đề giải quyết:**
  - File `apps/web/public/images/og-image.jpg` hiện tại là file text SVG đổi đuôi, khiến Zalo/Facebook Crawler từ chối render thumbnail xem trước.
  - Các đường dẫn `/images/og-sedan.webp`, `/images/og-suv.webp`, `/images/og-mpv.webp`, `/images/og-catalog.webp` được tham chiếu trong code nhưng không tồn tại trên đĩa (trả về 404).
  - Thiếu `favicon.ico` và `apple-touch-icon.png` khiến kết quả tìm kiếm trên điện thoại hiển thị quả địa cầu vô danh thay vì logo showroom.
- **Mô tả:**
  1. Cung cấp file `og-image.jpg` nhị phân thật (True Binary JPEG/PNG 1200x630px, < 300KB) thể hiện nhận diện thương hiệu đại lý 3S.
  2. Tạo đầy đủ các file OG Image cho từng phân khúc và trang danh mục catalog.
  3. Bổ sung `favicon.ico`, `apple-touch-icon.png` và cấu hình `manifest.webmanifest`.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 2.1: Chia sẻ liên kết website lên Zalo và Facebook**
    - *Given:* Người dùng dán link trang chủ hoặc link dòng xe vào khung chat Zalo / bài đăng Facebook.
    - *When:* Bộ cào Open Graph của mạng xã hội quét trang.
    - *Then:* Hiển thị thumbnail sắc nét, đúng tỷ lệ 1.91:1 (1200x630), tiêu đề và mô tả không bị cắt vụn.
  - **Scenario 2.2: Kiểm tra các liên kết ảnh Open Graph không trả về 404**
    - *Given:* Kiểm tra các URL ảnh OG khai báo trong `segments.ts` và `apps/web/app/xe/page.tsx`.
    - *When:* Gửi HTTP GET request tới `/images/og-sedan.webp`, `/images/og-suv.webp`, `/images/og-catalog.webp`.
    - *Then:* Máy chủ trả về mã HTTP 200 với Content-Type `image/webp` hợp lệ.
  - **Scenario 2.3: Hiển thị Logo Đại Lý trên Google Search Mobile**
    - *Given:* Googlebot truy cập trang chủ.
    - *When:* Kiểm tra thẻ `<link rel="icon">` và favicon chuẩn.
    - *Then:* Trả về file favicon 32x32 và apple-touch-icon 180x180 hợp lệ, không bị lỗi 404.

---

### 🔹 US-03: Bảo Vệ Cấu Trúc Heading H1 Toàn Cục (P1)
- **Actor:** Google Search Console, SEO Auditor.
- **Vấn đề giải quyết:**
  - Thẻ `<h1>` duy nhất của Trang chủ hiện nằm trong `HeroEventBanner.tsx`. Nếu Admin tắt Hero Banner trong cấu hình CMS (`config.enabled = false`), trang chủ sẽ hoàn toàn **không có thẻ H1 nào**, vi phạm cấu trúc On-page căn bản.
- **Mô tả:**
  - Xây dựng cơ chế fallback H1 thông minh: Nếu Hero Banner hiển thị, dùng H1 của Banner; nếu Hero Banner bị tắt, render thẻ H1 đại diện cho Showroom với text chuẩn SEO và bố cục thị giác hài hòa.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 3.1: Hero Banner đang bật**
    - *Given:* Cấu hình `homepage.heroBanner.enabled = true`.
    - *When:* Trang chủ render.
    - *Then:* Trang chủ có duy nhất 1 thẻ `<h1>` với nội dung từ tiêu đề banner sự kiện.
  - **Scenario 3.2: Hero Banner bị tắt trong Admin**
    - *Given:* Cấu hình `homepage.heroBanner.enabled = false`.
    - *When:* Trang chủ render.
    - *Then:* Trang chủ vẫn có đúng 1 thẻ `<h1>` chuẩn SEO (VD: *"Đại Lý Xe Hyundai Chính Hãng Tại TP. Vinh, Nghệ An"*), đảm bảo không bao giờ bị rỗng H1.

---

### 🔹 US-04: Tối Ưu Core Web Vitals Trang Tin Tức (P1)
- **Actor:** Người dùng di động (Mobile User), Google PageSpeed / Lighthouse.
- **Vấn đề giải quyết:**
  - Nhiều thẻ `<img>` thô trong [tin-tuc/page.tsx](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/web/app/tin-tuc/page.tsx) và [tin-tuc/[slug]/page.tsx](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/web/app/tin-tuc/[slug]/page.tsx) không được nén sang WebP/AVIF, thiếu thuộc tính `sizes` tự co giãn, gây ra Layout Shift (CLS) và tăng thời gian tải LCP.
- **Mô tả:**
  - Thay thế toàn bộ `<img>` bằng component `<Image>` từ `next/image`.
  - Thiết lập `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` và gán `priority` cho hình ảnh Hero LCP đầu tiên.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 4.1: Kiểm tra kết xuất ảnh trên trang Hub Tin Tức**
    - *Given:* Khách hàng truy cập `/tin-tuc`.
    - *When:* Trình duyệt tải các bài viết trong Bento Grid và bài viết dạng danh sách.
    - *Then:* 100% hình ảnh được phân phối dưới định dạng `image/webp` hoặc `image/avif` với tỷ lệ khung hình 16:9 ổn định, CLS = 0.
  - **Scenario 4.2: Tối ưu điểm LCP trang Chi Tiết Bài Viết**
    - *Given:* Khách hàng truy cập bài viết `/tin-tuc/[slug]`.
    - *When:* Đo thời gian render ảnh đại diện đầu bài (Featured Image).
    - *Then:* Ảnh có cờ `priority`, thời gian LCP đạt chuẩn xanh (< 1.8 giây trên mạng 4G di động).

---

### 🔹 US-05: On-Demand Cache Revalidation & RSS Feed (P1)
- **Actor:** Quản trị viên CMS, Google News / RSS Readers.
- **Vấn đề giải quyết:**
  - Hiện tại website phụ thuộc vào Time-based ISR 60 giây (`export const revalidate = 60`). Khi Admin sửa giá xe, đổi ưu đãi lăn bánh hoặc đăng bài mới, bot Google có thể quét phải dữ liệu cũ nếu trúng vào chu kỳ cache.
  - Thiếu RSS Feed khiến website không thể tự động syndication nội dung lên Google News hoặc các kênh mạng xã hội tự động.
- **Mô tả:**
  1. Xây dựng API route `/api/revalidate` nhận tham số `tag` hoặc `path` kèm Secret Token.
  2. Tích hợp webhook tự động từ `apps/admin` sang `apps/web` khi có thao tác xuất bản.
  3. Xây dựng route `/feed.xml` xuất dữ liệu bài viết mới nhất theo chuẩn RSS 2.0.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 5.1: Xóa cache tức thì khi xuất bản bài viết mới**
    - *Given:* Admin bấm xuất bản bài viết mới trong Admin Portal.
    - *When:* Backend gửi POST request tới `/api/revalidate?secret=...&path=/tin-tuc`.
    - *Then:* API trả về `{ revalidated: true }`, trang `/tin-tuc` trên Storefront hiển thị bài viết mới ngay trong lần request tiếp theo của bot.
  - **Scenario 5.2: Truy cập nguồn cấp tin RSS Feed**
    - *Given:* Google News hoặc người dùng truy cập `https://xehyundaivinh.com/feed.xml`.
    - *When:* Trình duyệt tải trang.
    - *Then:* Trả về chuẩn XML với Content-Type `application/xml`, chứa danh sách 20 bài viết mới nhất có đầy đủ `title`, `link`, `pubDate`, `description` và `author`.

---

### 🔹 US-06: Mở Rộng Landing Page Phân Khúc (Hatchback & Xe Điện) (P2)
- **Actor:** Khách hàng tìm kiếm theo phân khúc giá rẻ hoặc xu hướng xanh.
- **Vấn đề giải quyết:**
  - `segments.ts` hiện chỉ có 3 phân khúc: `sedan`, `suv`, `mpv`.
  - Thiếu hẳn phân khúc `hatchback` (nơi dòng xe bán chạy số 1 Grand i10 thuộc về) và `xe-dien` (mẫu xe tương lai Ioniq 5).
- **Mô tả:**
  - Bổ sung cấu hình `hatchback` và `xe-dien` vào `SEGMENT_REGISTRY`.
  - Khai báo meta title, meta description, đoạn văn giới thiệu E-E-A-T, và mapping kiểu dáng tương ứng từ CSDL.
  - Tự động sinh static params và sitemap cho `/dong-xe/hatchback` và `/dong-xe/xe-dien`.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 6.1: Truy cập Landing Page Dòng Xe Hatchback**
    - *Given:* Khách hàng truy cập `/dong-xe/hatchback`.
    - *When:* Trang tải xong.
    - *Then:* Hiển thị danh sách xe Grand i10 Hatchback, đoạn giới thiệu E-E-A-T về xe đô thị nhỏ gọn, JSON-LD ItemList và mã HTTP 200.
  - **Scenario 6.2: Đồng bộ trong Sitemap.xml**
    - *Given:* Kiểm tra file `/sitemap.xml`.
    - *When:* Tìm kiếm các URL phân khúc.
    - *Then:* Có sự xuất hiện của `${baseUrl}/dong-xe/hatchback` và `${baseUrl}/dong-xe/xe-dien` với priority 0.85.

---

### 🔹 US-07: Programmatic Landing Pages Dự Toán Lăn Bánh Theo Mẫu Xe (P2)
- **Actor:** Khách hàng có nhu cầu mua xe cụ thể (High-Intent Buyers).
- **Vấn đề giải quyết:**
  - Lượng tìm kiếm của từ khóa *"Giá lăn bánh Hyundai Tucson tại Nghệ An"*, *"Giá lăn bánh Accent"* rất lớn nhưng hiện tại website chỉ có 1 trang chung `/gia-lan-banh?xe=...` dẫn đến việc không tối ưu được Title/H1/Metadata riêng cho từng mẫu xe.
- **Mô tả:**
  - Xây dựng Dynamic Route `/gia-lan-banh/[carSlug]`:
    - Title động: *"Bảng Giá Lăn Bánh Xe [Tên Xe] 2026 Mới Nhất Tại Nghệ An & Hà Tĩnh"*.
    - Tự động điền trước mẫu xe tương ứng, hiển thị sẵn bảng chiết tính chi phí thuế trước bạ 10%, biển số, bảo hiểm cho tất cả phiên bản của dòng xe đó.
    - Nhúng Schema `WebApplication`, `Product` và `FAQPage` cho dòng xe đó.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 7.1: Truy cập trang Dự toán lăn bánh xe Tucson**
    - *Given:* Khách hàng tìm kiếm từ Google và bấm vào `/gia-lan-banh/tucson`.
    - *When:* Trang tải xong.
    - *Then:* Thẻ H1 hiển thị *"Dự Toán Giá Lăn Bánh Xe Hyundai Tucson Mới Nhất"*, công cụ tính tự động chọn sẵn xe Tucson, hiển thị bảng giá lăn bánh tạm tính của từng phiên bản (Xăng Tiêu Chuẩn, Xăng Đặc Biệt, Dầu, Turbo).
  - **Scenario 7.2: Dữ liệu có cấu trúc Rich Snippet**
    - *Given:* Googlebot cào trang `/gia-lan-banh/tucson`.
    - *When:* Kiểm tra Schema JSON-LD.
    - *Then:* Schema `Product` và `Offer` chứa mức giá lăn bánh khởi điểm chính xác, giúp hiển thị giá trực tiếp trên trang kết quả tìm kiếm Google.

---

### 🔹 US-08: Thống Trị Local SEO, Đánh Giá Thực Tế & Schema E-E-A-T (P2)
- **Actor:** Khách hàng địa phương tại Nghệ An - Hà Tĩnh, Google Local Pack (Maps).
- **Vấn đề giải quyết:**
  - Các câu chuyện bàn giao xe thực tế (`delivery-stories`) hiện chỉ là hình ảnh đơn thuần, chưa được chuyển đổi thành Schema `Review` / `AggregateRating` để kích hoạt số sao vàng trên Google SERP.
  - Cần trang tĩnh giới thiệu chi tiết thực thể Showroom & Đội ngũ cố vấn bán hàng để củng cố tín hiệu E-E-A-T.
- **Mô tả:**
  1. Gắn Schema `Review` (người mua thực tế, đánh giá chất lượng dịch vụ) vào phân khu Bàn giao xe.
  2. Tạo trang tĩnh `/gioi-thieu/showroom-hyundai-vinh` chứa ảnh Showroom 3S chuẩn nhận diện TC Motor, bản đồ Google Maps tương tác và mã số thuế pháp nhân.
  3. Chuẩn hóa bộ dữ liệu NAP (Name - Address - Phone) trên toàn bộ site khớp 100% với Google Business Profile.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 8.1: Schema Đánh giá hiển thị sao vàng trên SERP**
    - *Given:* Googlebot quét trang chi tiết xe `/xe/[carSlug]`.
    - *When:* Kiểm tra dữ liệu JSON-LD.
    - *Then:* Xuất hiện khối `aggregateRating` hợp lệ kèm `reviewCount` và `ratingValue` (ví dụ: 4.9/5 dựa trên các câu chuyện giao xe thực tế).
  - **Scenario 8.2: Nhất quán thực thể AutoDealer**
    - *Given:* Kiểm tra thông tin trên toàn bộ trang (Header, Footer, AutoDealerJsonLd, Trang Giới thiệu).
    - *When:* Đối chiếu Tên, Địa chỉ, Số điện thoại (NAP).
    - *Then:* 100% thông tin đồng nhất, hỗ trợ đắc lực việc đẩy Top Google Maps Showroom tại khu vực.

---

## 2. Kế Hoạch Triển Khai Kỹ Thuật (Mapping Sang TODO.md)

| Lát Cắt | File Mã Nguồn Chạm Tới | Lệnh Kiểm Tra / Verification |
| :--- | :--- | :--- |
| **US-01** | `apps/web/app/gia-lan-banh/page.tsx`<br>`apps/web/app/tra-gop/`<br>`apps/web/app/sitemap.ts` | `curl -I http://localhost:3002/gia-lan-banh`<br>`curl -s http://localhost:3002/sitemap.xml \| grep tra-gop` |
| **US-02** | `apps/web/public/images/`<br>`apps/web/public/favicon.ico`<br>`apps/web/config/segments.ts` | `file apps/web/public/images/og-image.jpg`<br>`curl -I http://localhost:3002/favicon.ico` |
| **US-03** | `apps/web/app/page.tsx`<br>`apps/web/components/home/HeroEventBanner.tsx` | `curl -s http://localhost:3002 \| grep "<h1"` |
| **US-04** | `apps/web/app/tin-tuc/page.tsx`<br>`apps/web/app/tin-tuc/[slug]/page.tsx` | `grep -rn "<img" apps/web/app/tin-tuc/` (Target: 0 matches) |
| **US-05** | `apps/web/app/api/revalidate/route.ts`<br>`apps/web/app/feed.xml/route.ts` | `curl -X POST http://localhost:3002/api/revalidate`<br>`curl -I http://localhost:3002/feed.xml` |
| **US-06** | `apps/web/config/segments.ts`<br>`apps/web/app/dong-xe/[slug]/page.tsx` | `curl -I http://localhost:3002/dong-xe/hatchback` |
| **US-07** | `apps/web/app/gia-lan-banh/[carSlug]/page.tsx`<br>`packages/core/src/seo/json-ld.ts` | `curl -I http://localhost:3002/gia-lan-banh/tucson` |
| **US-08** | `apps/web/components/home/DeliveryStoriesSection.tsx`<br>`apps/web/components/seo/AutoDealerJsonLd.tsx` | Google Rich Results Test JSON-LD Parser |

---

## 3. Điều Kiện Dừng & Giới Hạn Phạm Vi (Out of Scope)
* **Không làm:** Không can thiệp vào logic tính toán thuế trước bạ hay công thức lãi suất ngân hàng của `@cardealer/core` (giữ nguyên logic nghiệp vụ tài chính đã được kiểm thử).
* **Không làm:** Không thay đổi cơ sở dữ liệu Drizzle ORM gốc nếu không thật sự cần thiết (tận dụng trường dữ liệu hiện có).
* **Bảo toàn:** Giữ nguyên 100% cơ chế bảo vệ Middleware 301 Redirect và quy tắc chấm điểm SEO 10 tiêu chí trong Editor CMS.
