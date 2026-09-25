# 🎨 Frontend & Design System Integration Guide: Hệ Thống Tin Tức, Content Blocks & Inbound Marketing (Tiptap Engine)

> **Mã Epic:** `EPIC-PHASE-5-CONTENT-TIPTAP-INBOUND`  
> **Giai đoạn:** Giai đoạn 2 — Bước 2.2 (Gate 2: Thiết Kế Kiến Trúc Chi Tiết)  
> **Role phụ trách:** `tailwind-ui-designer`  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`SCHEMA.md`](./SCHEMA.md)  
> **Trạng thái Môi trường:** 🟢 Pure Development  

---

## 1. Hệ Thống Design Tokens & Typography Chuẩn Báo Chí

Trang chi tiết bài viết `/tin-tuc/[slug]` được thiết kế theo tiêu chuẩn báo chí điện tử hiện đại, mang lại trải nghiệm đọc dịu mắt, trang nhã và giữ chân người đọc:

```css
/* Typography Tokens cho Bài Viết */
.article-prose {
  font-family: var(--font-inter, sans-serif);
  color: #1f2937; /* neutral-800 */
  line-height: 1.8;
  font-size: 1.0625rem; /* 17px tối ưu đọc văn bản dài */
}

.article-prose h2 {
  font-size: 1.625rem; /* 26px */
  font-weight: 700;
  color: #0f172a; /* slate-900 */
  margin-top: 2.25rem;
  margin-bottom: 1rem;
  scroll-margin-top: 90px; /* Offset cho Header cố định */
}

.article-prose h3 {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  color: #1e293b;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  scroll-margin-top: 90px;
}

.article-prose p {
  margin-bottom: 1.25rem;
}

.article-prose blockquote {
  border-left: 4px solid #002c6c; /* Hyundai Blue */
  background-color: #f8fafc;
  padding: 1rem 1.25rem;
  font-style: italic;
  border-radius: 0 0.5rem 0.5rem 0;
  margin: 1.5rem 0;
}
```

---

## 2. Đặc Tả Giao Diện 8 Content Blocks Tinh Hoa (Tiptap React NodeViews)

### 2.1. `CalloutBlock` — Hộp Ghi Chú & Cảnh Báo Nổi Bật
* **Biến thể màu sắc:**
  - `info`: Nền `bg-blue-50`, viền trái `border-blue-500`, icon `Info` màu xanh dương.
  - `warning`: Nền `bg-amber-50`, viền trái `border-amber-500`, icon `AlertTriangle` màu vàng cam.
  - `success`: Nền `bg-emerald-50`, viền trái `border-emerald-500`, icon `CheckCircle` màu xanh lá.
  - `note`: Nền `bg-slate-50`, viền trái `border-slate-400`, icon `Bookmark` màu xám.
* **Layout:** Bo góc `rounded-r-xl border-l-4 p-4 my-5 flex gap-3`.

---

### 2.2. `FeatureGridBlock` — Lưới Trang Bị & Hyundai SmartSense
* **Bố cục:** Lưới linh hoạt `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4 my-6`.
* **Card item:**
  - Ảnh trang bị góc bo tròn `rounded-lg overflow-hidden aspect-[4/3] bg-neutral-100`.
  - Hiệu ứng rê chuột: `group-hover:scale-105 transition-transform duration-300`.
  - Tiêu đề tính năng in đậm `font-semibold text-neutral-900 mt-2`.
  - Mô tả ngắn gọn `text-sm text-neutral-600 line-clamp-2`.

---

### 2.3. `TableBlock` — Bảng Dữ Liệu Thông Minh (Responsive & Search/Export)
* **Khung chứa chống vỡ layout:** `overflow-x-auto rounded-xl border border-neutral-200 shadow-sm my-6`.
* **Thanh công cụ tương tác (Interactive Toolbar):**
  - Hiển thị nếu bật `enableSearch` hoặc `enableExport`.
  - Ô tìm kiếm: `Input` có icon `Search`, debounce 200ms lọc tức thì các hàng.
  - Nút xuất CSV: `Button` có icon `Download`, xuất file định dạng UTF-8 có BOM (`\uFEFF`) hỗ trợ tiếng Việt trên Excel.
* **Bảng:** `w-full text-left text-sm divide-y divide-neutral-200`. Hàng chẵn/lẻ so le `even:bg-neutral-50/50`.

---

### 2.4. `RelatedCarBlock` — Thẻ Xe Liên Quan Nhúng Giữa Bài
* **Thiết kế:** Card xe sang trọng viền mỏng `rounded-2xl border border-neutral-200 p-4 md:p-5 my-6 bg-gradient-to-br from-white to-neutral-50 flex flex-col sm:flex-row items-center gap-5 shadow-sm hover:shadow-md transition-shadow`.
* **Thành phần:**
  - Ảnh xe góc 3/4 chất lượng cao `w-full sm:w-48 h-32 object-contain`.
  - Thông tin: Tên xe (`font-bold text-lg text-neutral-900`), số chỗ, loại nhiên liệu.
  - Giá khởi điểm: *"Giá từ: 599.000.000 VNĐ"* màu đỏ thương hiệu.
  - Nút hành động: `Button` *"Xem Chi Tiết & Báo Giá"* dẫn trực tiếp sang `/xe/[carSlug]`.

---

### 2.5. `PriceTableBlock` — Bảng Giá Xe Tự Động Từ Database
* **Thiết kế:** Bảng danh sách tất cả các phiên bản của dòng xe:
  - Cột 1: Tên phiên bản (`tenPhienBan`).
  - Cột 2: Giá niêm yết (`giaNiemYet`) định dạng triệu/tỷ đồng.
  - Cột 3: Dự toán lăn bánh tại TP. Vinh (tính toán tự động từ Pricing Engine).
  - Cột 4: Nút *"Nhận Ưu Đãi"* mở popup báo giá nhanh.
* **Ghi chú chân bảng:** Dòng thông báo *"Giá trên đã bao gồm thuế VAT, chưa trừ giảm giá tiền mặt tại Showroom"*.

---

### 2.6. `YoutubeBlock` — Nhúng Video Trải Nghiệm Lái Thử 16:9
* **Khung tỉ lệ vàng:** `relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg my-6 bg-neutral-900`.
* **Iframe:** `w-full h-full border-0` kèm tham số `loading="lazy"` và `allowfullscreen`.

---

### 2.7. `TikTokBlock` — Video Dọc 9:16 Độc Quyền (Khử Scrollbar Tuyệt Đối)
* **Khung chứa dọc:** `mx-auto w-full max-w-[325px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl my-6 bg-black relative`.
* **Cơ chế Facade:**
  - Ban đầu hiển thị ảnh poster WebP chất lượng cao và nút Play lớn tròn đỏ ở giữa kèm hiệu ứng lan tỏa `animate-ping`.
  - Khi click: Nạp iframe TikTok Player v1 API (`https://www.tiktok.com/player/v1/${videoId}?autoplay=1`).
* **CSS Khử thanh cuộn triệt để:**
  ```css
  .tiktok-container iframe {
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* IE/Edge */
  }
  .tiktok-container iframe::-webkit-scrollbar {
    display: none !important; /* Chrome/Safari */
  }
  ```

---

### 2.8. `GalleryBlock` — Thư Viện Album Ảnh Vuốt Ngang
* **Mobile:** Slider vuốt chạm mượt mà (Touch-swipe), hiển thị chỉ báo số ảnh `1/8`.
* **Desktop:** Lưới ảnh `grid grid-cols-2 md:grid-cols-3 gap-3`.
* **Lightbox Modal:** Bấm vào bất kỳ ảnh nào mở modal phóng to toàn màn hình, hỗ trợ phím mũi tên `ArrowLeft`, `ArrowRight` và `Esc`.

---

### 2.9. `FAQBlock` — Accordion Hỏi Đáp Mượt Mà
* **Thiết kế:** Danh sách các câu hỏi bo góc `rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-200 my-6`.
* **Item:** Bấm vào tiêu đề câu hỏi xổ nội dung câu trả lời êm ái với icon `ChevronDown` xoay 180 độ.

---

## 3. Đặc Tả Điểm Chạm Inbound Lead & Chuyển Đổi

### 3.1. `InlineQuickForm` (Form Điền Nhanh Giữa Bài)
* **Khung Form:** `rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 p-6 md:p-8 text-white my-8 shadow-xl text-center`.
* **Thành phần:**
  - Tiêu đề: *"Nhận Báo Giá Lăn Bánh & Khuyến Mãi Mới Nhất"*.
  - Ô nhập: `Input` SĐT/Zalo (`placeholder="Nhập số điện thoại của bạn..."`, bo tròn lớn `rounded-full`).
  - Nút bấm: `Button` màu đỏ nổi bật *"Gửi Yêu Cầu Nhanh"*.
  - Cam kết: *"Thông tin được bảo mật tuyệt đối. Tư vấn viên liên hệ trong 5 phút"*.

---

### 3.2. `GatedContent` (Khóa Nội Dung Mở Khóa Tức Thì)
* **Khung làm mờ:** Khối nội dung bên trong được làm mờ nhẹ bằng CSS `filter: blur(5px) select-none pointer-events-none`.
* **Lớp phủ mở khóa (Overlay Card):** Đặt nổi ở giữa với biểu tượng chiếc khóa vàng `Lock`:
  - Thông điệp: *"Nội dung độc quyền: Bảng chiết khấu tiền mặt & dự toán lăn bánh chi tiết"*.
  - Form nhập SĐT nhanh: Chỉ cần nhập số điện thoại là mở khóa tức thì, không cần tải lại trang.

---

### 3.3. `PostBottomBar` (Mobile Sticky Bottom Bar)
* **Vị trí:** Cố định đáy màn hình điện thoại `fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-2.5 flex items-center gap-2 md:hidden`.
* **3 Nút chuyển đổi:**
  1. Nút **[Gọi Điện]**: Nút vuông nhỏ bo tròn, nền xanh lá `bg-emerald-600`, icon `PhoneCall`.
  2. Nút **[Zalo]**: Nút vuông nhỏ bo tròn, nền xanh Zalo `bg-blue-600`, icon `MessageCircle`.
  3. Nút **[Nhận Ưu Đãi (Form)]**: Nút dài chiếm toàn bộ không gian còn lại, nền đỏ nổi bật, nhãn tự động cá nhân hóa theo chuyên mục (Ví dụ: *"Đăng ký lái thử Creta"*).

---

### 3.4. `SlideInBanner` (Popup Trượt Góc Exit-Intent)
* **Vị trí:** `fixed bottom-6 right-6 z-50 max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-100 p-4 animate-slide-in`.
* **Thiết kế:** Nút đóng `[X]` ở góc trên. Hình ảnh xe thu nhỏ + thông điệp ưu đãi sốt dẻo + nút xem ngay.

---

### 3.5. `StickyTableOfContents` (Mục Lục Tự Động Bám Cột Phải)
* **Desktop:** Cột bên phải bài viết `sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto`.
* **Scrollspy:** Tự động highlight sáng mục đang đọc bằng `IntersectionObserver`. Bấm vào mục nào thì cuộn mượt (`scroll-smooth`) với offset bù trừ thanh Header.

---

### 3.6. `EeatAuthorBox` (Khối Tác Giả Uy Tín E-E-A-T)
* **Vị trí:** Chân bài viết, trước phần bài viết liên quan.
* **Thiết kế:** `rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5 flex flex-col sm:flex-row items-center gap-4`.
* **Thành phần:**
  - Ảnh đại diện Saler hình tròn có viền xanh `w-16 h-16 rounded-full object-cover ring-2 ring-blue-500`.
  - Thông tin: Tên thật (`font-bold text-neutral-900`), chức danh (*"Chuyên viên tư vấn ô tô Hyundai Dũng Lạc TP. Vinh"*).
  - Nút bấm: Nút kết nối Zalo trực tiếp và nút gọi Hotline cá nhân.
