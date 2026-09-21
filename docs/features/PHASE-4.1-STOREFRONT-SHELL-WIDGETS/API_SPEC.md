# 🔌 REST API Specification: Khung Nền Tảng Storefront & Tiện Ích Chuyển Đổi Toàn Cục

## 1. Tổng Quan Phân Vùng API (API Architecture)
Đặc tả các REST Endpoints phục vụ việc nạp cấu hình hiển thị toàn cục trên Storefront (`apps/web`) và các API quản trị, cập nhật cấu hình bảo mật từ Admin Portal (`apps/admin`).

---

## 2. Danh Sách Endpoints Chi Tiết

### 2.1. `GET /api/settings` — Public Bulk Settings Ingestion
* **Mục đích:** Cung cấp toàn bộ 5 nhóm cấu hình (`site`, `navigation`, `contact`, `floatingSeller`, `stickyBar`) trong **1 HTTP Request duy nhất** cho Storefront `RootLayout`, giúp tối ưu thời gian tải trang và tránh Waterfall Requests.
* **Quyền truy cập (Auth):** Public (Không yêu cầu Token).
* **Caching Header:** `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`
* **Phản hồi Thành công (200 OK):**
```json
{
  "success": true,
  "data": {
    "site": {
      "siteTitle": "Hyundai Vinh - Đại Lý Ô Tô Ủy Quyền Chính Hãng",
      "titleSuffix": "| Hotline: 0981.234.567",
      "defaultDescription": "Đại lý phân phối xe Hyundai chính hãng tại Nghệ An, Hà Tĩnh...",
      "defaultImage": "/images/og-image.jpg",
      "favicon": "/favicon.ico",
      "businessName": "Công ty Cổ phần Ô tô Hyundai Vinh",
      "address": "Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An",
      "phone": "0981.234.567",
      "mapLatitude": 18.6796,
      "mapLongitude": 105.6813
    },
    "navigation": {
      "headerLinks": [
        {
          "id": "nav-cars",
          "label": "Dòng Xe",
          "url": "/xe",
          "newTab": false,
          "order": 1,
          "subLinks": [
            { "id": "sub-sedan", "label": "Sedan (Accent, Elantra)", "url": "/xe?kieuDang=Sedan", "newTab": false },
            { "id": "sub-suv", "label": "SUV (Creta, Tucson, Santa Fe)", "url": "/xe?kieuDang=SUV", "newTab": false }
          ]
        },
        { "id": "nav-price", "label": "Bảng Giá Xe", "url": "/gia-xe-hyundai", "newTab": false, "order": 2, "subLinks": [] },
        { "id": "nav-calc", "label": "Tính Lăn Bánh", "url": "/gia-lan-banh", "newTab": false, "order": 3, "subLinks": [] },
        { "id": "nav-install", "label": "Mua Trả Góp", "url": "/tra-gop", "newTab": false, "order": 4, "subLinks": [] }
      ]
    },
    "contact": {
      "showroomName": "Hyundai Vinh - Đại Lý Ủy Quyền Chính Hãng TC Motor",
      "diaChi": "Km 3+500 Đại lộ Lê Nin, TP. Vinh, Tỉnh Nghệ An",
      "hotlineKinhDoanh": "0981.234.567",
      "hotlineDichVu": "0981.890.123",
      "zaloNumber": "0981.234.567",
      "email": "kinhdoanh@xehyundaivinh.com",
      "workingHours": "08:00 - 18:00 (Thứ 2 - Chủ Nhật)",
      "googleMapsUrl": "https://maps.google.com/?cid=123456789",
      "googleMapEmbed": "https://www.google.com/maps/embed?...",
      "socialMedia": {
        "facebookUrl": "https://facebook.com/hyundaivinh.official",
        "youtubeUrl": "https://youtube.com/@hyundaivinh",
        "tiktokUrl": "https://tiktok.com/@hyundaivinh",
        "zaloUrl": "https://zalo.me/0981234567"
      },
      "legal": {
        "businessName": "Công ty Cổ phần Ô tô Hyundai Vinh",
        "businessLicense": "GPKD số: 2901234567",
        "copyrightText": "© 2025 XeHyundaiVinh. All rights reserved.",
        "bctCertificateUrl": "http://online.gov.vn/Home/WebDetails/12345"
      }
    },
    "floatingSeller": {
      "enabled": true,
      "sellerName": "Tuấn Hyundai",
      "sellerPhone": "0981.234.567",
      "sellerZalo": "https://zalo.me/0981234567",
      "sellerMessenger": "https://m.me/xehyundaivinh",
      "sellerAvatar": "/images/avatars/sale-tuan.webp",
      "statusText": "Đang trực tuyến - Hỗ trợ 24/7",
      "isOnline": true,
      "greetingMessage": "Xin chào! Tôi có thể hỗ trợ báo giá lăn bánh hoặc tư vấn trả góp cho bạn ngay bây giờ."
    },
    "stickyBar": {
      "enabled": true,
      "ctaText": "NHẬN BÁO GIÁ",
      "callText": "GỌI NGAY",
      "hotline": "0981.234.567",
      "subtitle": "Hỗ trợ trả góp 85% • Giao xe tận nhà",
      "showOnDesktop": true,
      "showOnMobile": true
    }
  }
}
```

---

### 2.2. `GET /api/settings/:key` — Public Single Key Query
* **Mục đích:** Lấy riêng 1 cấu hình cụ thể theo key (ví dụ: `navigation_settings`).
* **Path Parameters:** `key` (string: `site_settings`, `navigation_settings`, `contact_settings`, `floating_seller_settings`, `sticky_bar_settings`).
* **Phản hồi Thành công (200 OK):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 2.3. `GET /api/admin/settings` — Admin Fetch All Settings
* **Mục đích:** Cung cấp đầy đủ toàn bộ cấu hình kèm metadata thời gian cập nhật cho trang `/admin/settings`.
* **Quyền truy cập (Auth):** Bắt buộc Bearer JWT Token, Role có quyền `system:read` (Admin, Manager).
* **Phản hồi Thành công (200 OK):**
```json
{
  "success": true,
  "data": {
    "showroom_settings": { ... },
    "navigation_settings": { ... },
    "floating_seller_settings": { ... },
    "sticky_bar_settings": { ... }
  }
}
```

---

### 2.4. `PUT /api/admin/settings/:key` — Admin Update Specific Domain Key
* **Mục đích:** Cập nhật nội dung của 1 Domain Key cấu hình từ Admin Portal.
* **Quyền truy cập (Auth):** Bắt buộc Bearer JWT Token, Role có quyền `system:write` (Admin, Manager).
* **Request Headers:**
  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`
* **Request Body (Ví dụ cho `floating_seller_settings`):**
```json
{
  "enabled": true,
  "sellerName": "Nguyễn Văn Tuấn",
  "sellerPhone": "0981.234.567",
  "sellerZalo": "https://zalo.me/0981234567",
  "sellerMessenger": "https://m.me/xehyundaivinh",
  "sellerAvatar": "/images/avatars/sale-tuan-2025.webp",
  "statusText": "Đang trực tuyến - Phụ trách Báo Giá Lăn Bánh",
  "isOnline": true,
  "greetingMessage": "Dạ em chào anh/chị, em Tuấn phụ trách kinh doanh Hyundai Vinh sẵn sàng tư vấn gói vay 85% ạ!"
}
```
* **Phản hồi Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật cấu hình \"floating_seller_settings\" thành công",
  "data": {
    "key": "floating_seller_settings",
    "updatedAt": "2026-09-21T10:00:00.000Z"
  }
}
```

---

## 3. Ma Trận Mã Lỗi Hệ Thống (Error Matrix)

| HTTP Status | Error Code | Nguyên Nhân Gây Lỗi | Xử Lý & Khắc Phục Phía Client |
| :---: | :--- | :--- | :--- |
| **400** | `INVALID_PAYLOAD` | Dữ liệu gửi lên không thỏa mãn Zod Schema (VD: thiếu hotline, sai định dạng url). | Form Admin hiển thị thông báo lỗi đỏ dưới từng field tương ứng. |
| **401** | `UNAUTHORIZED` | Token JWT hết hạn hoặc chưa đăng nhập. | Điều hướng về màn hình `/admin/login`. |
| **403** | `FORBIDDEN` | Tài khoản không có quyền `system:write` (VD: tài khoản role `sales`). | Hiển thị Banner "Bạn không có quyền chỉnh sửa cài đặt hệ thống". |
| **404** | `SETTING_NOT_FOUND` | Truy vấn key không tồn tại trong danh mục hợp lệ. | Sử dụng Zod default fallback object. |
| **500** | `DATABASE_ERROR` | Lỗi kết nối cơ sở dữ liệu PostgreSQL. | Hiển thị Toast lỗi "Không thể lưu cấu hình lên máy chủ, vui lòng thử lại". |
