# 🎨 Đặc Tả Thiết Kế Giao Diện UI/UX (UI_SPEC.md)
## PHASE 3 - PRICING & LEAD ENGINE (`EPIC-PHASE-3-PRICING-LEAD`)

> **Role:** `ui-ux-designer`  
> **Host Apps:**  
> • `apps/storefront` (Khách hàng tính giá lăn bánh & trả góp)  
> • `apps/admin` (Nhân viên Sales & Quản lý Showroom xử lý Lead CRM)  
> **UI Architecture:** Tailwind CSS v4 + Framer Motion + Lucide Icons + Shadcn Primitives  
> **Reference Model:** `fe-cardealer/app/components/calculator/SmartCalculator.tsx`

---

## 1. Hệ Thống Nhận Diện & Design Tokens

Thiết kế kết hợp sự sang trọng của thương hiệu ô tô cao cấp với nghệ thuật tối ưu chuyển đổi (Conversion Rate Optimization - CRO):

* **Màu sắc chủ đạo (Brand & Conversion Palette):**
  * `Primary (Hyundai Navy):` `#002C6C` — Nút CTA chính, tiêu đề nhận diện, đường viền thương hiệu.
  * `Accent (Hyundai Blue):` `#0072CE` — Thanh tiến trình (Progress Bar), Focus ring, Link tương tác.
  * `Conversion Red (Action Urgency):` `#E53935` — Nút mở khóa giá lăn bánh thực tế, tạo động lực bấm mạnh mẽ.
  * `Incentive Gold / Amber:` `#F59E0B` (Nền `#FEF3C7`, Viền `#FDE68A`, Chữ `#92400E`) — Khung cảnh báo ưu đãi tiền mặt độc quyền.
  * `Success Emerald:` `#10B981` (Nền `#ECFDF5`, Viền `#A7F3D0`, Chữ `#065F46`) — Trạng thái mở khóa chi tiết và thông báo gửi thành công.
* **Tokens Hiệu Ứng Mờ (Soft-Gate Blur Tokens):**
  * `Gate Blur Class:` `blur-sm select-none pointer-events-none transition-all duration-500` — Làm mờ số tiền từng khoản phí để kích thích tò mò mà vẫn thấy rõ cấu trúc bảng giá.
  * `Unlocked Class:` `blur-none select-auto pointer-events-auto transition-all duration-500` — Hiển thị sắc nét sau khi nhận lead.
* **Typography:** `Plus Jakarta Sans` hoặc `Inter` — Rõ nét, chữ số dễ đọc khi hiển thị đơn vị tiền tệ VNĐ.

---

## 2. Wireframe Màn Hình 1: Storefront SmartCalculator (`/gia-lan-banh`)

### 2.1 State 1: Input (`The Hook`) — Bước 1: Chọn Xe & Tỉnh Thành

```
+---------------------------------------------------------------------------------+
|                                                                                 |
|   Bước 1/2: Chọn xe để tính giá                                             50% |
|   [========================================---------------------------------]   |
|                                                                                 |
|                        TÍNH GIÁ LĂN BÁNH XE HYUNDAI                             |
|                                                                                 |
|   Chọn Dòng Xe *                                                                |
|   [ Hyundai Tucson 2025                                                   v ]   |
|                                                                                 |
|   Chọn Phiên Bản *                                                              |
|   [ 2.0 Xăng Tiêu Chuẩn - 769.000.000 VNĐ                                 v ]   |
|                                                                                 |
|   Chọn Tỉnh/Thành (Nơi đăng ký biển số) *                                       |
|   [ TP. Vinh (Nghệ An)                                                    v ]   |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   |                        TÍNH GIÁ LĂN BÁNH                                |   |
|   +-------------------------------------------------------------------------+   |
|   (Mobile: Nút này luôn dính cố định ở đáy màn hình: `sticky bottom-4 z-40`)    |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

* **Quy tắc tương tác:**
  * Dropdown Phiên bản tự động cập nhật khi đổi Dòng xe. Khi chưa chọn xe hoặc đang fetch, hiển thị text placeholder mờ `-- Vui lòng chọn xe trước --`.
  * Nút "TÍNH GIÁ LĂN BÁNH" chỉ kích hoạt khi đã chọn đủ Dòng xe + Phiên bản có giá niêm yết.

---

### 2.2 State 2: Gate (`The Soft-Gate`) — Bước 2: Hiển Thị Tổng Giá & Mờ Chi Tiết

```
+---------------------------------------------------------------------------------+
|                                                                                 |
|   Bước 2/2: Nhận bảng chi phí & ưu đãi thực tế                             100% |
|   [=========================================================================]   |
|                                                                                 |
|                              Tổng Giá Lăn Bánh Tạm Tính                         |
|                             858.740.000 VNĐ                                     |
|                                                                                 |
|   CHI TIẾT CÁC KHOẢN PHÍ (Bị làm mờ nhẹ - blur-sm):                             |
|   +-------------------------------------------------------------------------+   |
|   |  Giá niêm yết:                             [  769.000.000 VNĐ  (MỜ)  ]  |   |
|   |  Phí trước bạ (10%):                       [   76.900.000 VNĐ  (MỜ)  ]  |   |
|   |  Phí cấp biển số:                          [    1.000.000 VNĐ  (MỜ)  ]  |   |
|   |  Phí đăng kiểm cơ giới:                    [      140.000 VNĐ  (MỜ)  ]  |   |
|   |  Phí bảo trì đường bộ (1 năm):             [    1.560.000 VNĐ  (MỜ)  ]  |   |
|   |  Bảo hiểm TNDS bắt buộc:                   [      480.000 VNĐ  (MỜ)  ]  |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   | ⚠️ LƯU Ý: Giá dự toán trên là giá niêm yết, CHƯA TRỪ ƯU ĐÃI TIỀN MẶT   |   |
|   | và gói phụ kiện chính hãng trong tháng từ Đại lý Hyundai Vinh.          |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|   NHẬN BÁO GIÁ LĂN BÁNH THỰC TẾ (ĐÃ GIẢM TRỪ KHUYẾN MẠI):                       |
|   +-------------------------------------------------------------------------+   |
|   |  Họ và tên Quý khách *                                                  |   |
|   |  [ Nguyễn Văn A                                                      ]  |   |
|   |                                                                         |   |
|   |  Số điện thoại nhận báo giá (Zalo/SMS) *                                |   |
|   |  [ 0912 345 678                                                      ]  |   |
|   |                                                                         |   |
|   |  Thời gian liên hệ thuận tiện:                                          |   |
|   |  ( ) Sáng (8h-12h)      ( ) Chiều (13h-18h)      (*) Bất kỳ             |   |
|   |                                                                         |   |
|   |  +-------------------------------------------------------------------+  |   |
|   |  |        XEM GIÁ LĂN BÁNH THỰC TẾ & NHẬN ƯU ĐÃI (Nút đỏ nổi)        |  |   |
|   |  +-------------------------------------------------------------------+  |   |
|   |  🔒 Cam kết bảo mật thông tin - Không làm phiền ngoài nhu cầu xe        |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|   [< Quay lại chọn phiên bản khác]                                              |
+---------------------------------------------------------------------------------+
```

---

### 2.3 State 3: Success (`Unlocked & Direct Call`) — Mở Khóa Chi Tiết & Hotline

```
+---------------------------------------------------------------------------------+
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   | ✅ THÀNH CÔNG: ĐÃ MỞ KHÓA CHI TIẾT BẢNG GIÁ LĂN BÁNH                   |   |
|   | Chuyên viên tư vấn sẽ liên hệ gửi mã giảm giá tiền mặt trong 5 phút!    |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|                              Tổng Giá Lăn Bánh                                  |
|                             858.740.000 VNĐ                                     |
|                                                                                 |
|   CHI TIẾT CÁC KHOẢN PHÍ (ĐÃ MỞ KHÓA - SẮC NÉT blur-none):                      |
|   +-------------------------------------------------------------------------+   |
|   |  Giá niêm yết:                                          769.000.000 VNĐ |   |
|   |  Phí trước bạ (10%):                                     76.900.000 VNĐ |   |
|   |  Phí cấp biển số (Vinh):                                  1.000.000 VNĐ |   |
|   |  Phí đăng kiểm phương tiện:                                 140.000 VNĐ |   |
|   |  Phí bảo trì đường bộ (12 tháng):                         1.560.000 VNĐ |   |
|   |  Bảo hiểm TNDS xe 5 chỗ:                                    480.000 VNĐ |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|   KẾT NỐI TRỰC TIẾP VỚI SHOWROOM ĐỂ NHẬN ƯU ĐÃI TỐT HƠN:                        |
|   +-----------------------------------+   +---------------------------------+   |
|   | 📞 GỌI HOTLINE: 0941.xxx.xxx      |   | 💬 CHAT ZALO VỚI TRƯỞNG PHÒNG  |   |
|   +-----------------------------------+   +---------------------------------+   |
|                                                                                 |
|   [🔄 Tính thử cho dòng xe khác]                                                |
+---------------------------------------------------------------------------------+
```

---

### 2.4 Sub-Tab: Dự Toán Trả Góp (Installment Simulation with 2-Step Soft-Gate Funnel)

Áp dụng cùng triết lý **Soft-Gate Funnel (Mờ chi tiết -> Nhập thông tin để mở khóa -> Thông báo sẽ liên lạc lại ngay)**:

#### Giai đoạn A: Khi Khách Hàng Đang Kéo Tính Toán (Chi tiết gốc & lãi bị làm mờ):
```
+---------------------------------------------------------------------------------+
|   DỰ TOÁN TRẢ GÓP NGÂN HÀNG (Hỗ trợ vay đến 85% giá trị xe)                     |
|                                                                                 |
|   1. Số tiền trả trước: 20% (153.800.000 VNĐ)                                   |
|   [---|=============================================================] (Slider)  |
|   15%           20%           30%           50%           70%           85%     |
|                                                                                 |
|   2. Thời hạn vay: 5 năm (60 tháng)                                             |
|   [ (3 năm)  |  (4 năm)  |  *(5 năm)*  |  (6 năm)  |  (7 năm)  |  (8 năm) ]     |
|                                                                                 |
|   3. Lãi suất tạm tính: 7.9%/năm (Gói ưu đãi liên kết showroom)                 |
|                                                                                 |
|   BẢNG DỰ TOÁN TRẢ GÓP HÀNG THÁNG (Bị làm mờ nhẹ - blur-sm):                    |
|   +-------------------------------------------------------------------------+   |
|   |  • Tiền gốc hàng tháng:                    [  10.253.000 VNĐ  (MỜ)  ]   |   |
|   |  • Tiền lãi tháng đầu:                      [   4.067.000 VNĐ  (MỜ)  ]   |   |
|   |  • Tổng gốc + lãi tháng đầu:               [  14.320.000 VNĐ  (MỜ)  ]   |   |
|   |  • Tổng số tiền vay ngân hàng:             [ 615.200.000 VNĐ  (MỜ)  ]   |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|   NHẬP THÔNG TIN ĐỂ XEM CHI TIẾT BẢNG TRẢ GÓP & GÓI VAY TỐT NHẤT:               |
|   +-------------------------------------------------------------------------+   |
|   |  Họ và tên Quý khách *                                                  |   |
|   |  [ Nguyễn Văn A                                                      ]  |   |
|   |                                                                         |   |
|   |  Số điện thoại nhận bảng tính chi tiết & kết quả duyệt vay *            |   |
|   |  [ 0912 345 678                                                      ]  |   |
|   |                                                                         |   |
|   |  +-------------------------------------------------------------------+  |   |
|   |  |     XEM CHI TIẾT LỊCH TRẢ NỢ & GÓI LÃI SUẤT (Nút đỏ nổi bật)       |  |   |
|   |  +-------------------------------------------------------------------+  |   |
|   |  🔒 Cam kết bảo mật - Hỗ trợ liên kết các ngân hàng thủ tục nhanh gọn   |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------+
```

#### Giai đoạn B: Sau Khi Khách Hàng Nhập Thông Tin & Bấm Xem Chi Tiết:
```
+---------------------------------------------------------------------------------+
|   +-------------------------------------------------------------------------+   |
|   | ✅ ĐÃ MỞ KHÓA CHI TIẾT BẢNG TÍNH TRẢ GÓP!                               |   |
|   | Cảm ơn Quý khách. Chuyên viên tài chính sẽ LIÊN LẠC LẠI NGAY trong ít   |   |
|   | phút để hỗ trợ làm hồ sơ vay duyệt trong 24h!                           |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|   DỰ TOÁN TRẢ GÓP XE HYUNDAI TUCSON 2025 (2.0 XĂNG TIÊU CHUẨN)                  |
|   • Giá trị xe: 769.000.000 VNĐ | Trả trước 20%: 153.800.000 VNĐ                |
|   • Vay ngân hàng: 615.200.000 VNĐ | Thời gian: 5 năm (60 tháng)                |
|                                                                                 |
|   CHI TIẾT LỊCH THANH TOÁN (ĐÃ MỞ KHÓA - SẮC NÉT blur-none):                    |
|   +-------------------------------------------------------------------------+   |
|   |  • Tiền gốc hàng tháng:                                  10.253.000 VNĐ |   |
|   |  • Tiền lãi tháng đầu (7.9%/năm):                         4.067.000 VNĐ |   |
|   |  • Tổng số tiền thanh toán tháng đầu:                    14.320.000 VNĐ |   |
|   |  • Dư nợ giảm dần các tháng tiếp theo theo quy định ngân hàng.          |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|   KẾT NỐI TRỰC TIẾP HỖ TRỢ HỒ SƠ VAY NHANH:                                     |
|   +-----------------------------------+   +---------------------------------+   |
|   | 📞 GỌI CHUYÊN VIÊN TÍN DỤNG       |   | 💬 CHAT ZALO TƯ VẤN HỒ SƠ VAY   |   |
|   +-----------------------------------+   +---------------------------------+   |
+---------------------------------------------------------------------------------+
```

---

### 2.5 SEO FAQ Accordion Section (Cuối trang)

```
+---------------------------------------------------------------------------------+
|   HỎI ĐÁP PHỔ BIẾN VỀ GIÁ LĂN BÁNH HYUNDAI                                      |
|                                                                                 |
|   [+] Giá lăn bánh bao gồm những chi phí bắt buộc nào?                          |
|   [-] Phí trước bạ được tính như thế nào?                                       |
|       Phí trước bạ ô tô con tại Nghệ An là 10% giá tính lệ phí trước bạ do Bộ  |
|       Tài chính quy định.                                                       |
|   [+] Phí biển số tại TP. Vinh và các huyện trong tỉnh khác nhau ra sao?        |
|   [+] Thủ tục mua xe trả góp cần những giấy tờ gì?                              |
|   [+] Báo giá trên công cụ có phải là giá cuối cùng chưa?                       |
+---------------------------------------------------------------------------------+
```

---

## 3. Wireframe Màn Hình 2: Admin CRM Quản Lý Lead (`/admin/leads`)

### 3.1 Giao diện Bảng Lead Tổng Quan

```
+-------------------------------------------------------------------------------------------------------------+
|                                              HEADER & BREADCRUMB                                            |
|  Dashboard > Quản lý Khách hàng & Báo giá                                      [ Xuất Excel ] [ + Thêm Lead]|
+-------------------------------------------------------------------------------------------------------------+
|                                                                                                             |
|  METRIC SUMMARY CARDS:                                                                                      |
|  +---------------------+ +---------------------+ +---------------------+ +---------------------+           |
|  | TỔNG LEAD TRONG TUẦN| | CHỜ XỬ LÝ (MỚI)     | | ĐANG TƯ VẤN         | | TỶ LỆ CHỐN ĐƠN      |           |
|  |        48           | |        12 (Pulse)   | |        26           | |        21%          |           |
|  +---------------------+ +---------------------+ +---------------------+ +---------------------+           |
|                                                                                                             |
|  BỘ LỌC TÌM KIẾM & PHÂN LOẠI:                                                                               |
|  +-------------------------------------------------------------------------------------------------------+  |
|  | [🔍 Tìm tên, SĐT khách hàng...]  [Trạng thái: Tất cả v]  [Dòng xe: Tất cả v]  [Hôm nay v]  [Lọc lại]   |  |
|  +-------------------------------------------------------------------------------------------------------+  |
|                                                                                                             |
|  DANH SÁCH KHÁCH HÀNG TIỀM NĂNG (DATA TABLE):                                                               |
|  +----+------------------+---------------+-------------------------+---------+-------------+---------+----+  |
|  | ID | Khách hàng       | Số điện thoại | Xe & Phiên bản          | Địa bàn | Trạng thái  | Thời gian|Thao|  |
|  +----+------------------+---------------+-------------------------+---------+-------------+---------+----+  |
|  |#102| Nguyễn Văn A     | 0912 345 678  | Tucson 2025 (2.0 Xăng)  | Vinh    | [Mới nhận v]| 5p trước| 👁️ |  |
|  |    | (Ghi chú: Sáng)  | [📞 Tel][💬 Zl]| 769.000.000 VNĐ         |         | (Blue-glow) |         | ✏️ |  |
|  +----+------------------+---------------+-------------------------+---------+-------------+---------+----+  |
|  |#101| Trần Thị B       | 0988 123 456  | Santa Fe Calligraphy    | Diễn Châu| [Đã gọi  v]| 2h trước| 👁️ |  |
|  |    | (Vay 80% 5 năm)  | [📞 Tel][💬 Zl]| 1.365.000.000 VNĐ       |         | (Purple)    |         | ✏️ |  |
|  +----+------------------+---------------+-------------------------+---------+-------------+---------+----+  |
|  |#100| Lê Hoàng C       | 0903 789 012  | Creta Đặc Biệt          | Cửa Lò  | [Đã cọc  v]| Hôm qua | 👁️ |  |
|  |    | (Đã đặt cọc 20tr)| [📞 Tel][💬 Zl]| 650.000.000 VNĐ         |         | (Green)     |         | ✏️ |  |
|  +----+------------------+---------------+-------------------------+---------+-------------+---------+----+  |
|                                                                                                             |
|  Hiển thị 1-10 của 48 khách hàng                            [<< Trước]  [ 1 ]  [ 2 ]  [ 3 ]  [Sau >>]       |
+-------------------------------------------------------------------------------------------------------------+
```

---

### 3.2 Wireframe Lead Detail Drawer / Modal (Xem & Cập Nhật Lead)

Khi nhân viên click vào icon 👁️ hoặc dòng Lead trên bảng:

```
+----------------------------------------------------------------+
|  CHI TIẾT KHÁCH HÀNG TIỀM NĂNG (#102)                      [X] |
+----------------------------------------------------------------+
|                                                                |
|  👤 Nguyễn Văn A                                               |
|  📱 0912 345 678  [Sao chép]  [Gọi điện ngay]  [Nhắn tin Zalo] |
|  ⏰ Tiếp nhận: 09:15 - 20/09/2026 (5 phút trước)               |
|                                                                |
|  THÔNG TIN YÊU CẦU DỰ TOÁN:                                    |
|  • Dòng xe: Hyundai Tucson 2025                                |
|  • Phiên bản: 2.0 Xăng Tiêu Chuẩn (769.000.000 VNĐ)           |
|  • Nơi đăng ký: TP. Vinh (Nghệ An)                             |
|  • Tổng giá lăn bánh dự toán: 858.740.000 VNĐ                  |
|  • Nguồn tiếp nhận: Bảng tính giá lăn bánh (Smart Calculator)  |
|  • Khung giờ mong muốn liên hệ: Sáng (8h - 12h)                |
|                                                                |
|  CẬP NHẬT TRẠNG THÁI XỬ LÝ:                                    |
|  [ Trạng thái: Đã liên hệ (Contacted)                       v ]|
|                                                                |
|  NHẬT KÝ TƯ VẤN (SALES NOTES):                                 |
|  +----------------------------------------------------------+  |
|  | 20/09 09:18 - Admin: Đã gọi lần 1, khách hẹn chiều 14h   |  |
|  | gửi bảng giá lăn bánh và phụ kiện tặng kèm qua Zalo.     |  |
|  +----------------------------------------------------------+  |
|                                                                |
|  THÊM GHI CHÚ MỚI:                                             |
|  [ Nhập nội dung trao đổi với khách hàng...                  ] |
|  [                                                           ] |
|                                                                |
|  +----------------------------------------------------------+  |
|  |                   LƯU THÔNG TIN LEAD                     |  |
|  +----------------------------------------------------------+  |
+----------------------------------------------------------------+
```

---

## 4. Đặc Tả Trải Nghiệm Mobile & Responsive

1. **Sticky Call-To-Action (Mobile CRO):**
   * Nút `"TÍNH GIÁ LĂN BÁNH"` và `"XEM GIÁ LĂN BÁNH THỰC TẾ"` có thuộc tính `sticky bottom-4 md:static z-40` với hiệu ứng đổ bóng `shadow-2xl` nổi bật để người dùng ngón tay cái có thể chạm ngay mà không cần cuộn ngược trang.
2. **One-Tap Dial & Zalo Connect:**
   * Các số hotline trong trang Success hoặc Admin Table được bọc link dạng `tel:0941xxxxxx` và `https://zalo.me/0912xxxxxx` mở trực tiếp ứng dụng gọi thoại hoặc Zalo trên điện thoại chỉ với 1 chạm.
3. **Input Keypad Optimization:**
   * Trường Số điện thoại được khai báo `type="tel"` và `inputMode="numeric"` để bàn phím điện thoại tự động hiển thị bàn phím số to rõ ràng.

---

## 5. Micro-Interactions & State Transitions

* **Progress Bar Transition:** Thanh tiến trình chuyển từ 50% lên 100% với hiệu ứng ease mượt mà kéo dài `500ms`.
* **Soft-Gate Transition:** Toàn bộ khối State 1 trượt sang trái (`x: -20, opacity: 0`) và State 2 trượt vào từ phải (`x: 0, opacity: 1`) thông qua `framer-motion`.
* **Lead Unlock Reveal:** Bảng giá lăn bánh chuyển mờ sang rõ nét thông qua transition `backdrop-filter` và `filter` trong `400ms`.
* **Validation Shake Effect:** Nếu khách hàng nhập số điện thoại sai định dạng, ô input rung nhẹ (`animation: shake 0.3s`) và đổi viền sang màu đỏ cánh sen cảnh báo.
