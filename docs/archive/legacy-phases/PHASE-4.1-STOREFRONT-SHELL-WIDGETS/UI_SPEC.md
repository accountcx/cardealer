# 🎨 UI/UX Specification: Khung Nền Tảng Storefront & Tiện Ích Chuyển Đổi Toàn Cục

## 1. Hệ Thống Design Tokens Chuẩn Thương Hiệu Hyundai

```css
/* Core Hyundai Brand Tokens */
--color-hyundai-navy: #002C6C;    /* Màu xanh đậm đặc trưng thương hiệu */
--color-hyundai-blue: #0072CE;    /* Màu xanh dương tươi điểm nhấn CTA */
--color-hyundai-hover: #005BA4;   /* Trạng thái Hover / Active nút bấm */
--color-online-green: #10B981;    /* Màu xanh lá cây cho trạng thái Đang trực tuyến */
--color-slate-surface: #F8FAFC;   /* Nền trang và card phụ */
--color-slate-border: #E2E8F0;    /* Viền mảnh tinh tế */
```

---

## 2. Bản Vẽ Khung Sườn Giao Diện (ASCII Wireframes)

### 2.1. Desktop Showroom Header & Navbar (`apps/web`)
```text
+--------------------------------------------------------------------------------------------------+
| [TOPBAR] 📍 Km 3+500 Đại lộ Lê Nin, TP. Vinh | ⏰ 08:00 - 18:00 | 📞 Bán Hàng: 0981.234.567      |
+--------------------------------------------------------------------------------------------------+
| [LOGO HYUNDAI VINH]   Dòng Xe [v]   Bảng Giá   Tính Lăn Bánh   Mua Trả Góp   Tin Tức   Liên Hệ   |
|                       (Mega Dropdown)                                [📞 GỌI HOTLINE] [NHẬN BÁO GIÁ] |
+--------------------------------------------------------------------------------------------------+
```

### 2.2. Mega Menu Dropdown khi Hover vào "Dòng Xe" (Desktop)
```text
+--------------------------------------------------------------------------------------------------+
| SEDAN               SUV / CROSSOVER       MPV GIA ĐÌNH          XE THƯƠNG MẠI / ĐIỆN             |
| - Hyundai Grand i10 - Hyundai Venue       - Hyundai Stargazer X - Hyundai IONIQ 5 (Điện)         |
| - Hyundai Accent    - Hyundai Creta       - Hyundai Custin      - Hyundai Porter H150            |
| - Hyundai Elantra   - Hyundai Tucson                                                             |
|                     - Hyundai Santa Fe                                                           |
|                     - Hyundai Palisade                                                           |
| ------------------------------------------------------------------------------------------------ |
| [ 🔥 Tải Trọn Bộ Bảng Giá & Ưu Đãi Lăn Bánh Mới Nhất ] -------------------------> [TẢI BẢNG GIÁ] |
+--------------------------------------------------------------------------------------------------+
```

### 2.3. Mobile Navigation Drawer (`apps/web`)
```text
+-------------------------------------+
| [LOGO HYUNDAI]                  [X] |
+-------------------------------------+
| 🏠 Trang Chủ                        |
| 🚗 Dòng Xe                      [^] |
|    • Sedan (Accent, Elantra)        |
|    • SUV (Creta, Tucson, Santa Fe)  |
|    • MPV (Custin, Stargazer)        |
| 💰 Bảng Giá Xe Chi Tiết             |
| 🧮 Dự Toán Chi Phí Lăn Bánh        |
| 💳 Tính Lãi Vay Trả Góp Ngân Hàng   |
| 📰 Tin Tức & Khuyến Mãi             |
| 📍 Giới Thiệu Showroom & Liên Hệ    |
+-------------------------------------+
| 📞 Hotline: 0981.234.567            |
| 🏢 Km 3+500 Đại lộ Lê Nin, TP. Vinh |
+-------------------------------------+
| [📞 GỌI HOTLINE]     [💬 CHAT ZALO] | <- 2 nút cố định ở đáy Drawer (h-12)
+-------------------------------------+
```

### 2.4. Widget Chuyên Viên Nổi (`FloatingSeller`)
```text
[TRẠNG THÁI THU GỌN - BUBBLE]              [TRẠNG THÁI MỞ RỘNG - CARD]
                                           +------------------------------------+
                                           | Tư Vấn Trực Tuyến              [X] |
                                           | +-------+ Nguyễn Văn Tuấn          |
                                           | | [IMG] | 🟢 Đang trực tuyến 24/7   |
                                           | +-------+ Hotline: 0981.234.567    |
                                           | ---------------------------------- |
    +-------+                              | "Chào anh/chị! Em Tuấn sẵn sàng tư |
    | [IMG] | (Chấm xanh online pulse)     | vấn gói vay 85% và ưu đãi tháng."  |
    +-------+                              | [📞 GỌI TRỰC TIẾP]  [💬 CHAT ZALO] |
                                           +------------------------------------+
```

### 2.5. Thanh Chốt Đơn Đáy Màn Hình (`ProductStickyBar`)
```text
+--------------------------------------------------------------------------------------------------+
| [IMG] Hyundai Tucson 2025               |  Ưu Đãi: Tặng 50% Trước Bạ  |  [📞 0981.234.567]       |
| Giá từ: 769.000.000 đ (Trả trước 150tr) |  (Hỗ trợ trả góp 85%)       |  [ NHẬN BÁO GIÁ NGAY ]   |
+--------------------------------------------------------------------------------------------------+
```

### 2.6. Admin Portal: Quản Trị Cấu Hình 4 Tabs (`/admin/settings`)
```text
+--------------------------------------------------------------------------------------------------+
| ⚙️ CÀI ĐẶT HỆ THỐNG & SHOWROOM                                       [💾 LƯU CẤU HÌNH] (Framer)   |
+--------------------------------------------------------------------------------------------------+
| [ 🏢 Showroom & Pháp Lý ]  [ 🧭 Menu Điều Hướng ]  [ 👤 Chuyên Viên Nổi ]  [ 📌 Thanh Chốt Đơn ] |
+--------------------------------------------------------------------------------------------------+
| (TAB 2: MENU ĐIỀU HƯỚNG ĐA CẤP)                                                                  |
| + THÊM MENU CẤP 1                                                                                |
| 1. [::] Dòng Xe         | URL: /xe            | Menu con: 3 mục | [Sửa] [Xóa]                     |
| 2. [::] Bảng Giá Xe     | URL: /gia-xe        | Menu con: 0     | [Sửa] [Xóa]                     |
| 3. [::] Tính Lăn Bánh   | URL: /gia-lan-banh  | Menu con: 0     | [Sửa] [Xóa]                     |
| 4. [::] Mua Trả Góp     | URL: /tra-gop       | Menu con: 0     | [Sửa] [Xóa]                     |
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Ma Trận Trạng Thái Tương Tác (State Matrix)

| Thành Phần UI | Normal | Hover | Active / Focus | Disabled | Loading Skeleton |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nút Báo Giá (Header)** | Nền Navy `#002C6C`, chữ trắng, bo góc `rounded-xl` | Chuyển màu Navy đậm, đổ bóng `shadow-md` | Co nhẹ `scale-95`, focus ring xanh | Mờ `opacity-50`, cursor not-allowed | Pulse xám `bg-slate-200` |
| **Nút Gọi Hotline (StickyBar)** | Nền Đỏ/Cam hoặc Blue nổi bật | Tăng độ sáng 10% | Co nhẹ `active:scale-95` | Mờ `opacity-50` | Pulse xám |
| **Avatar FloatingSeller** | Tròn 56px, border trắng 2px, shadow | Scale nhẹ 1.05, vòng pulse xanh nhấp nháy | Mở Card tư vấn | Không hiển thị nếu `enabled = false`| Khối tròn pulse 56px |
| **Mobile Drawer Menu** | Trượt ẩn ngoài màn hình (`-translate-x-full`) | - | Hiển thị backdrop mờ `bg-black/50`, trượt vào `translate-x-0` | - | Skeleton dọc |

---

## 4. Điều Phối Vị Trí Tránh Va Chạm Trên Mobile (Viewport Coordinate Rules)

1. **Khi chưa cuộn (`ScrollY < 300px`):**
   * `ProductStickyBar`: Ẩn hoàn toàn (`translate-y-full opacity-0 pointer-events-none`).
   * `FloatingSeller`: Nằm ở góc dưới bên phải: `bottom-4 right-4` (`z-40`).
2. **Khi đã cuộn (`ScrollY >= 300px`):**
   * `ProductStickyBar`: Trượt lên đáy màn hình: `bottom-0 left-0 right-0` (`z-40`), có chiều cao 64px + `safe-area-inset-bottom`.
   * `FloatingSeller`: Tự động nhận class điều phối đẩy lên: `bottom-20 right-4` (`z-50`), cách mép trên của StickyBar khoảng 16px, đảm bảo ngón tay cái có thể chạm cả 2 nút mà không bị bấm nhầm.
