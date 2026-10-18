# 📐 TECHNICAL SPECIFICATION: PHASE 3 - HOMEPAGE SEMANTICS & 7 BLOCKS OPTIMIZATION

> **Mã Epic**: `EPIC-PHASE-3-HOMEPAGE-SEMANTICS-OPTIMIZATION`  
> **Dự án**: CarDealer Storefront Web Client  
> **Trạng thái**: Kế hoạch chuẩn bị cho Bước 3  
> **Tiêu chuẩn**: Universal Agentic Workflow v2.2  

---

## 1. Mục Tiêu Kỹ Thuật
Tối ưu hóa toàn diện trang chủ `apps/web/app/page.tsx` thành một cỗ máy SEO On-page và cỗ máy tạo chuyển đổi khách hàng hoàn hảo:
1. Chuẩn hóa kiến trúc Heading H1 duy nhất và phân cấp H2 rõ ràng cho 7 phân khu chức năng.
2. 100% liên kết nội bộ trực tiếp dẫn về các trang sản phẩm xe `/xe/[carSlug]` dưới dạng thẻ `<Link>` chuẩn để Google bot cào được.
3. Đạt điểm Core Web Vitals xuất sắc: LCP < 1.8s (ảnh WebP/AVIF priority), CLS = 0 (khung layout cố định).
4. Khai thác sức mạnh Local SEO với thuộc tính alt hình ảnh cụ thể tại thị trường Nghệ An & Hà Tĩnh.

---

## 2. Đặc Tả Chi Tiết 7 Phân Khu Trang Chủ

### 2.1 Khu 1: Hero Event Banner & Countdown
* **Heading**: Duy nhất 1 thẻ `<h1>`: `"Đại Lý Ô Tô Hyundai Chính Hãng Tại Nghệ An - Bảng Giá & Ưu Đãi Mới Nhất"`.
* **Media**: Banner ảnh WebP tối ưu tỷ lệ 16:9, thuộc tính `priority={true}` và `fetchPriority="high"`.
* **Countdown Timer**: Render SSR-friendly, không gây lệch layout (Zero-CLS).

### 2.2 Khu 2: Lead Magnet Hub - Bộ Lọc Nhanh Ô Tô
* **Cơ chế**: Thanh chọn ngân sách (<500tr, 500-800tr, >800tr) và kiểu dáng xe (Sedan, SUV, MPV).
* **SEO Internal Linking**: Các thẻ kết quả lọc bọc thẻ `<Link href="/xe/[carSlug]">` trỏ thẳng về từng mẫu xe cụ thể thay vì chỉ gọi hàm JavaScript.

### 2.3 Khu 3: Dòng Xe Bán Chạy (Bestsellers Showcase)
* **Heading**: Thẻ `<h2>`: `"Các Dòng Xe Hyundai Bán Chạy Nhất Tại Nghệ An"`.
* **Cấu trúc Semantic**: Dùng thẻ `<article>` cho từng card xe, liên kết thẻ `<a>` trỏ trực tiếp đến `/xe/[carSlug]`.
* **Hiển thị**: Giá niêm yết chuẩn, mức trả trước gợi ý, thông số cơ bản (Động cơ, hộp số, số chỗ ngồi).

### 2.4 Khu 4: Banner Mồi Câu Tính Giá (Lead CTA Banner)
* **Heading**: Thẻ `<h2>`: `"Dự Toán Lăn Bánh & Nhận Ưu Đãi Đại Lý Tốt Nhất"`.
* **Hành động**: Nút CTA chính dẫn trực tiếp vào `/gia-lan-banh` kèm tham số xe gợi ý.

### 2.5 Khu 5: VIP Showroom / Hồ Sơ Saler Uy Tín
* **Heading**: Thẻ `<h2>`: `"Showroom Chuẩn 3S & Cam Kết Chất Lượng Đại Lý"`.
* **Nội dung**: Địa chỉ showroom chi tiết tại Nghệ An, hotline bán hàng 24/7, nhúng bản đồ Google Maps tương tác và huy hiệu đại lý ủy quyền 3S chính hãng.

### 2.6 Khu 6: Bàn Giao Xe Thực Tế (Social Proof)
* **Heading**: Thẻ `<h2>`: `"Khoảnh Khắc Bàn Giao Xe Thực Tế Cho Khách Hàng"`.
* **Local SEO**: 100% hình ảnh bàn giao xe thật có thuộc tính `alt` chuẩn địa phương:
  * Ví dụ: `"Bàn giao xe Hyundai Creta cho anh Tuấn tại TP Vinh, Nghệ An"`.
* **Lazy loading**: Thuộc tính `loading="lazy"` cho toàn bộ ảnh trong phân khu này.

### 2.7 Khu 7: Tin Tức Khuyến Mại & Sự Kiện (Freshness Hub)
* **Heading**: Thẻ `<h2>`: `"Tin Tức Ưu Đãi Mới Nhất & Cẩm Nang Lái Xe"`.
* **Động**: Truy vấn 3-4 bài viết mới nhất từ bảng `posts` có `isPublished === true` để giữ trang chủ luôn "tươi mới" đối với Google Crawler.
