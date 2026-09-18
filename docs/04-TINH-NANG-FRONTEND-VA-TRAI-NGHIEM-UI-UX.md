# PHẦN 4: ĐẶC TẢ TÍNH NĂNG FRONTEND, TRẢI NGHIỆM UI/UX & CÔNG THỨC NGHIỆP VỤ

> **Mục tiêu tài liệu**: 
> 1. Tổng hợp toàn diện tất cả các trang, giao diện thành phần (Components) và luồng tương tác người dùng (User Flow).
> 2. Cung cấp **hướng dẫn cách sử dụng chi tiết** cho từng tính năng.
> 3. Làm rõ các **công thức tính toán toán học và thuật toán nghiệp vụ** (Tính giá lăn bánh, tính khoản vay trả góp ngân hàng, thuật toán đổi màu xe, thuật toán Scrollspy Mục lục TOC) để phục vụ việc lập trình lại trên bất kỳ nền tảng nào.

---

## 1. Bản Đồ Điều Hướng & Các Trang Trên Hệ Thống (Site Map)

| Đường dẫn (Route) | Tên trang / Tính năng | Mô tả chức năng chính |
| :--- | :--- | :--- |
| `/` | **Trang Chủ (Home)** | Phễu chuyển đổi 6 phân khu: Hero/Countdown, Cỗ máy thu lead, Showroom VIP, Xe nổi bật, Tin tức, Đánh giá bàn giao. |
| `/xe` | **Danh Sách Dòng Xe** | Danh mục xe phân loại theo phân khúc, tính toán minPrice của từng xe, Schema ItemList. |
| `/xe/[carSlug]` | **Chi Tiết Dòng Xe & Phiên Bản** | Hợp nhất toàn bộ phiên bản và màu sắc trên một trang duy nhất. Sử dụng Query Parameters (`?phien-ban=...&mau=...`) để lưu trạng thái phiên bản và màu, tối ưu cho SEO và chia sẻ liên kết trực tiếp. |
| `/tin-tuc` | **Danh Sách Tin Tức** | Phân loại theo chuyên mục (Bảng giá, Khuyến mãi...), bài viết tiêu điểm, tìm kiếm. |
| `/tin-tuc/[slug]` | **Chi Tiết Bài Viết** | Bố cục 2 cột, Sticky TOC H2/H3, chia sẻ Facebook, Copy link, xe liên quan tại sidebar, tự động sinh Schema NewsArticle & FAQPage. |
| `/gia-lan-banh` | **Dự Toán Lăn Bánh** | Công cụ tính toán 2 bước có cổng chặn thu thập khách hàng (Gated Lead). |
| `/thu-tuc-tra-gop` | **Dự Toán Trả Góp** | Công cụ chọn tỷ lệ trả trước (20%-70%) và thời gian vay (3-8 năm) để tính góp tháng. |
| `/lien-he` | **Liên Hệ & Showroom** | Bản đồ Google Maps nhúng, thông tin giờ làm việc, hotline, Zalo, mạng xã hội. |
| `/[slug]` | **Trang Tĩnh CMS** | Hiển thị các trang nội dung dài (`/chinh-sach`, `/bao-hanh`, `/gioi-thieu`). |

---

## 2. Chi Tiết Tính Năng Đổi Phiên Bản & Màu Sắc Ngoại Thất Qua URL Parameters

Toàn bộ thông tin dòng xe, phiên bản và màu sắc được gom vào một trang duy nhất tại `/xe/[carSlug]` (Ví dụ: `/xe/grand-i10`). Trạng thái lựa chọn được lưu trữ và cập nhật đồng bộ trực tiếp lên URL thông qua **Query Parameters**:
$$\text{URL Chuẩn}: \text{/xe/[carSlug]?phien-ban=[version-slug]\&mau=[color-slug]}$$
*Ví dụ*: `/xe/grand-i10?phien-ban=grand-i10-hatchback-1-2-at-tieu-chuan&mau=trang`

### 2.1. Lợi ích vượt trội về SEO và Trải nghiệm người dùng:
1. **Chia sẻ liên kết trực tiếp (Deep Linking)**: Nhân viên tư vấn hoặc các chiến dịch quảng cáo (Google Ads, Facebook Ads) có thể gửi trực tiếp link đến đúng phiên bản và màu sắc cụ thể mà khách hàng quan tâm mà không cần khách phải thao tác chọn lại.
2. **Không phân mảnh chỉ mục (Tránh Duplicate Content)**: Thẻ `canonical` của trang luôn trỏ về URL gốc (`https://xehyundaivinh.com/xe/[carSlug]`), giúp tập trung toàn bộ sức mạnh PageRank vào trang dòng xe chính, trong khi Google vẫn có thể đọc và hiểu các biến thể phiên bản qua Schema `ItemList` / `AggregateOffer`.
3. **Trải nghiệm mượt mà không reload trang**: Khi khách bấm chọn phiên bản hoặc màu sắc khác, thanh địa chỉ trình duyệt được cập nhật bằng `window.history.replaceState` hoặc `router.replace(..., { scroll: false })` giúp giữ nguyên vị trí cuộn chuột, chuyển ảnh tức thì mà không phải tải lại toàn bộ trang.

### 2.2. Cách thức người dùng sử dụng:
1. Người dùng truy cập trang xe:
   * Nếu URL không có tham số: Hệ thống tự động chọn phiên bản có giá niêm yết thấp nhất (`minPrice`) và màu sơn mặc định.
   * Nếu URL có `?phien-ban=...`: Hệ thống tìm và hiển thị thông số, album ảnh và danh sách màu của đúng phiên bản đó.
   * Nếu URL có thêm `&mau=...`: Tự động kích hoạt màu tương ứng.
2. Dưới ảnh xe có danh sách các nút tròn màu (Color Swatches): Trắng, Đỏ, Đen, Xanh, Bạc...
3. Khi người dùng bấm vào một màu bất kỳ:
   * Ảnh xe lớn lập tức chuyển sang ảnh xe chụp đúng màu sơn ngoại thất đó.
   * Tham số `&mau=[ten-mau]` trên URL tự động cập nhật theo.
4. Khi người dùng chọn phiên bản khác (Tiêu chuẩn, Đặc biệt, Cao cấp):
   * Toàn bộ bảng thông số, album ảnh và danh sách các màu có sẵn của phiên bản đó được cập nhật lại tương ứng.
   * Tham số `?phien-ban=[slug-moi]` trên URL được cập nhật.

---

## 3. Công Cụ Dự Toán Lăn Bánh Thông Minh 2 Bước (`SmartCalculator`)

Nằm tại `/gia-lan-banh`, là công cụ chuyển đổi khách hàng tiềm năng mạnh mẽ nhất của đại lý.

### 3.1. Luồng 2 bước (2-Step Lead Gate Workflow):
1. **Bước 1 (Nhập thông số xe)**:
   * Khách hàng chọn Dòng xe từ dropdown (Dữ liệu lấy từ API/Database).
   * Dropdown Phiên bản tự động cập nhật danh sách các bản tương ứng của dòng xe đó.
   * Khách chọn Tỉnh/Thành phố đăng ký: "TP. Vinh (Nghệ An)" hoặc "Các Huyện Nghệ An / Hà Tĩnh".
   * Bấm nút **"Xem Chi Tiết Dự Toán"**.
2. **Bước 2 (Cổng chặn - Lead Capture Gate)**:
   * Thay vì hiện kết quả ngay, hệ thống hiển thị Form mời khách nhận dự toán chính thức và ưu đãi tiền mặt độc quyền:
     * Ô nhập Họ và tên (Ít nhất 2 ký tự).
     * Ô nhập Số điện thoại (Chính xác 10 chữ số).
     * Tùy chọn khung giờ tư vấn thuận tiện: Sáng / Chiều / Tối.
   * Khi khách bấm **"Nhận Báo Giá Đầy Đủ"**:
     * Hệ thống gửi thông tin về bảng `Leads`.
     * Mở khóa trạng thái `state = 'success'` và cuộn mượt xuống bảng bóc tách chi tiết.
3. **Bước 3 (Hiển thị bảng phân tích chi phí)**:
   * Khách hàng nhìn thấy rõ ràng từng khoản mục tiền cần đóng theo quy định pháp luật.

### 3.2. Công thức toán học tính giá lăn bánh (Vinh, Nghệ An):

$$\text{Tổng Lăn Bánh} = P_{\text{xe}} + T_{\text{trước bạ}} + F_{\text{biển số}} + F_{\text{đăng kiểm}} + F_{\text{đường bộ}} + F_{\text{TNDS}} + F_{\text{dịch vụ}} + F_{\text{thân vỏ}}$$

* $P_{\text{xe}}$: Giá niêm yết của phiên bản xe (VNĐ).
* $T_{\text{trước bạ}} = P_{\text{xe}} \times 10\%$ (Tỷ lệ quy định tại Nghệ An là 10%, Hà Nội/TP.HCM là 12%).
* $F_{\text{biển số}}$: 
  * Đăng ký tại **TP. Vinh**: 1.000.000 VNĐ.
  * Đăng ký tại **Các huyện Nghệ An / Hà Tĩnh**: 200.000 VNĐ.
* $F_{\text{đăng kiểm}}$: 140.000 VNĐ (Phí cấp giấy chứng nhận kiểm định an toàn kỹ thuật).
* $F_{\text{đường bộ}}$: 1.560.000 VNĐ (Phí sử dụng đường bộ 12 tháng đối với xe cá nhân dưới 10 chỗ).
* $F_{\text{TNDS}}$: Phí bảo hiểm trách nhiệm dân sự bắt buộc:
  * Xe dưới 6 chỗ ngồi (Accent, Creta, Grand i10, Elantra): **480.700 VNĐ** (đã gồm VAT).
  * Xe từ 6 đến 11 chỗ ngồi (Santa Fe, Custin, Stargazer): **873.400 VNĐ** (đã gồm VAT).
* $F_{\text{thân vỏ}}$ (Tùy chọn): $P_{\text{xe}} \times 1.3\%$ (Bảo hiểm vật chất 2 chiều).

---

## 4. Công Cụ Dự Toán Mua Xe Trả Góp (`TraGopCalculator`)

Nằm tại `/thu-tuc-tra-gop` hoặc trong tab `LeadMagnetTabs`.

### 4.1. Cách thức sử dụng:
1. Khách chọn Xe và Phiên bản mong muốn.
2. Khách chọn mức **Trả trước**: `20%` (Tối thiểu), `30%`, `50%` hoặc `70%`.
3. Khách chọn **Thời gian vay**: `3 năm`, `5 năm`, `7 năm` hoặc `8 năm` (Tối đa 96 tháng).
4. Khách điền thông tin liên hệ và bấm **"Gửi Dự Toán Trả Góp"**.

### 4.2. Công thức tài chính ngân hàng:

1. **Số tiền trả trước (Vốn tự có)**:
   $$\text{Vốn Tự Có} = P_{\text{xe}} \times \text{Tỷ Lệ Trả Trước (\%)} + \text{Chi Phí Lăn Bánh}$$
2. **Số tiền ngân hàng giải ngân (Khoản vay gốc)**:
   $$\text{Tiền Vay Gốc} = P_{\text{xe}} \times (1 - \text{Tỷ Lệ Trả Trước (\%)})$$
3. **Tiền gốc phải trả hàng tháng (Phương pháp dư nợ giảm dần)**:
   $$\text{Gốc Mỗi Tháng} = \frac{\text{Tiền Vay Gốc}}{\text{Số Năm Vay} \times 12}$$
4. **Tiền lãi tháng đầu tiên (Tạm tính theo lãi suất ưu đãi $r \approx 7.9\%/\text{năm}$)**:
   $$\text{Lãi Tháng Đầu} = \text{Tiền Vay Gốc} \times \frac{r}{12}$$
5. **Tổng số tiền phải đóng tháng đầu tiên**:
   $$\text{Số Tiền Tháng Đầu} = \text{Gốc Mỗi Tháng} + \text{Lãi Tháng Đầu}$$
   *(Các tháng tiếp theo tiền lãi sẽ giảm dần theo số dư nợ gốc thực tế).*

---

## 5. Mục Lục Động & Thuật Toán Cuộn Mượt (Sticky Table of Contents - TOC)

Nằm trong component `TableOfContents.tsx`, áp dụng cho cả bài viết Tin tức và bài đánh giá chi tiết của Dòng xe.

### 5.1. Trải nghiệm người dùng:
* **Trên Desktop (Màn hình lớn)**:
  * Nằm ở cột bên phải (chiếm 1/3 độ rộng), bám dính theo màn hình khi cuộn chuột (`position: sticky`, `top: 100px`).
  * Khi người dùng cuộn đến phần nào của bài viết, mục tương ứng trên Menu TOC sẽ tự động sáng đèn (Active Indicator) với đường viền xanh nổi bật.
  * Nhấp chuột vào bất kỳ mục nào trên TOC, trang sẽ cuộn mượt mà (Smooth Scroll) đưa người đọc đến đúng tiêu đề đó.
* **Trên Mobile (Điện thoại di động)**:
  * Co lại thành một hộp Accordion thả xuống nằm ở đầu bài viết ("Mục lục bài viết [Hiện/Ẩn]"), bấm vào để mở danh sách chương mục mà không chiếm diện tích màn hình.

### 5.2. Thuật toán bóc tách Heading và Scrollspy:

```typescript
// 1. Thuật toán bóc tách tiêu đề H2, H3 từ cây AST nội dung
function extractTOCItems(nodes: any[]): { id: string; text: string; level: number }[] {
  const items = [];
  for (const node of nodes) {
    if (node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3')) {
      const text = extractText(node.children);
      const id = slugifyVietnamese(text); // Chuyển tiếng Việt thành slug: "ngoai-that-co-bap"
      items.push({ id, text, level: node.tag === 'h2' ? 2 : 3 });
    }
  }
  return items;
}

// 2. Thuật toán Scrollspy (Bắt vị trí cuộn bằng IntersectionObserver)
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveHeadingId(entry.target.id);
        }
      });
    },
    { rootMargin: '-80px 0% -60% 0%' } // Offset bù trừ cho Header Sticky
  );

  tocItems.forEach((item) => {
    const el = document.getElementById(item.id);
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
}, [tocItems]);
```

---

## 6. Tiện Ích Chốt Đơn Đáy Màn Hình (`ProductStickyBar`)

* **Vị trí**: Ghim chặt ở đáy màn hình điện thoại và máy tính (`fixed bottom-0 left-0 right-0 z-50`), có bóng đổ ngược lên trên.
* **Thành phần**:
  * Logo nhỏ và Tên dòng xe đang xem ("Hyundai Accent").
  * Mức giá khởi điểm ("Chỉ từ 439.000.000 VNĐ").
  * Nút "GỌI NGAY" màu đỏ viền phát sáng (Bấm vào kích hoạt cuộc gọi `tel:...`).
  * Nút "NHẬN BÁO GIÁ" màu xanh dương mở nhanh Popup điền thông tin nhận ưu đãi chỉ trong 10 giây.
