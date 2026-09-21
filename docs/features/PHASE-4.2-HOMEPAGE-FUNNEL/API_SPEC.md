# 🌐 API Specification: Trang Chủ Phễu Chuyển Đổi 6 Phân Khu (Homepage Conversion Funnel)

## 1. Danh Mục REST Endpoints Phục Vụ Trang Chủ

| Method | Endpoint Path | Quyền Truy Cập | Mục Đích & Trách Nhiệm |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/settings` | Public | Lấy toàn bộ cấu hình Storefront bao gồm key `homepage_settings`. |
| `GET` | `/api/settings/homepage_settings` | Public | Lấy riêng cấu hình phễu 6 phân khu trang chủ. |
| `GET` | `/api/cars` | Public | Lấy danh mục xe (hỗ trợ filter `isFeatured=true` cho Khu 4). |
| `PUT` | `/api/admin/settings/homepage_settings` | Admin / Saler | Cập nhật cấu hình 6 phân khu trang chủ và các công tắc Bật/Tắt. |

---

## 2. Chi Tiết Từng Endpoint

### 2.1. Public: `GET /api/settings/homepage_settings`
Lấy cấu hình chi tiết 6 phân khu phục vụ việc render trang chủ.

* **Headers:** `Content-Type: application/json`
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "heroBanner": {
      "enabled": true,
      "headline": "Đại Tiệc Ưu Đãi Ô Tô Hyundai Vinh",
      "subheadline": "Hỗ trợ 50% - 100% lệ phí trước bạ, tặng gói phụ kiện chính hãng 30 triệu",
      "mediaType": "image",
      "mediaUrl": "/images/hero-banner.webp",
      "countdown": {
        "enabled": true,
        "targetDate": "2026-10-31T23:59:59+07:00",
        "urgencyText": "Ưu đãi tháng vàng chỉ còn:"
      },
      "remainingSlots": {
        "enabled": true,
        "slotsCount": 5,
        "badgeText": "Chỉ còn 5 suất ưu đãi đặc biệt trong tháng"
      },
      "ctaButton": {
        "text": "Nhận Báo Giá Lăn Bánh Ngay",
        "action": "quote_modal",
        "href": ""
      }
    },
    "leadFilter": {
      "enabled": true,
      "headline": "Tìm Kiếm Nhanh Chiếc Xe Ưng Ý Của Bạn",
      "priceRanges": [
        { "id": "under_500", "label": "Dưới 500 triệu", "min": null, "max": 500000000 },
        { "id": "500_800", "label": "500 - 800 triệu", "min": 500000000, "max": 800000000 },
        { "id": "above_800", "label": "Trên 800 triệu", "min": 800000000, "max": null }
      ],
      "bodyStyles": [
        { "id": "sedan", "label": "Sedan Đô Thị", "segment": "sedan" },
        { "id": "suv", "label": "SUV / Crossover", "segment": "suv" },
        { "id": "mpv", "label": "MPV Đa Dụng", "segment": "mpv" }
      ]
    },
    "salerShowroom": {
      "enabled": true,
      "mode": "saler",
      "headline": "Cam Kết Vàng Từ Chuyên Viên Tư Vấn",
      "subheadline": "Đồng hành tận tâm cùng quý khách hàng trên mọi cung đường",
      "salerName": "Nguyễn Văn Tuấn",
      "salerTitle": "Tư Vấn Bán Hàng Cấp Cao - Hyundai Vinh",
      "avatarUrl": "/images/saler-avatar.webp",
      "introStory": "Với hơn 6 năm kinh nghiệm tư vấn xe ô tô...",
      "commitments": [
        { "id": "c1", "title": "Hỗ Trợ Trả Góp 85%", "description": "Bao đậu hồ sơ vay khó, duyệt trong 24h.", "icon": "bank" },
        { "id": "c2", "title": "Giao Xe Tận Nhà", "description": "Hỗ trợ giao xe tận nơi bằng xe chuyên dụng.", "icon": "truck" }
      ],
      "galleryImages": []
    },
    "featuredCars": {
      "enabled": true,
      "headline": "Các Dòng Xe Hyundai Bán Chạy Nhất",
      "subheadline": "Ưu đãi lớn trong tháng, sẵn xe đủ màu giao ngay",
      "maxDisplay": 6,
      "viewAllText": "Xem Toàn Bộ Bảng Giá Xe",
      "viewAllHref": "/xe"
    },
    "deliveryStories": {
      "enabled": true,
      "headline": "Khoảnh Khắc Bàn Giao Xe Thực Tế",
      "subheadline": "Hơn 500+ khách hàng đã tin tưởng lựa chọn",
      "stories": []
    },
    "latestPromotions": {
      "enabled": true,
      "headline": "Tin Tức Khuyến Mại & Sự Kiện",
      "subheadline": "Cập nhật chính sách giá và chương trình ưu đãi mới nhất",
      "maxPosts": 3,
      "featuredPostIds": []
    }
  }
}
```

---

### 2.2. Public: `GET /api/cars?isFeatured=true&limit=6`
Lấy danh sách các dòng xe được ghim nổi bật kèm khoảng giá và mức trả trước.

* **Query Parameters:**
  * `isFeatured`: `true` (chỉ lấy xe bật cờ ghim)
  * `status`: `published`
  * `limit`: `6`
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "accent-2025",
      "tenXe": "Hyundai Accent Hoàn Toàn Mới",
      "slug": "accent",
      "segment": "sedan",
      "anhDaiDienUrl": "/images/cars/accent.webp",
      "traTruocTu": 85000000,
      "minPrice": 439000000,
      "maxPrice": 569000000,
      "promotionSummary": "Tặng 50% trước bạ + Gói phụ kiện cao cấp"
    }
  ]
}
```

---

### 2.3. Admin: `PUT /api/admin/settings/homepage_settings`
Cập nhật toàn bộ hoặc từng phần cấu hình 6 phân khu trang chủ.

* **Headers:** `Content-Type: application/json`
* **Payload:** Khớp với `HomepageSettingsSchema`
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật cấu hình trang chủ thành công!",
  "data": { ... }
}
```

---

## 3. Ma Trận Lỗi & Xử Lý (Error Matrix)

| Status Code | Mã Lỗi | Nguyên Nhân | Hành Động Xử Lý Phía Client/Storefront |
| :---: | :---: | :--- | :--- |
| `400` | `INVALID_PAYLOAD` | Payload cập nhật từ Admin không khớp với Zod Schema (sai kiểu dữ liệu hoặc thiếu trường). | Admin Form hiển thị thông báo lỗi cụ thể tại từng input field tương ứng. |
| `401` | `UNAUTHORIZED` | Người dùng chưa đăng nhập hoặc hết phiên làm việc khi lưu cấu hình. | Chuyển hướng người dùng về trang `/admin/login` kèm thông báo đăng nhập lại. |
| `404` | `NOT_FOUND` | Key setting không tồn tại trong hệ thống. | Storefront tự động sử dụng bộ dữ liệu an toàn `DEFAULT_HOMEPAGE_SETTINGS`. |
| `500` | `INTERNAL_SERVER_ERROR` | Lỗi kết nối cơ sở dữ liệu PostgreSQL. | Storefront fallback về giá trị mặc định, hiển thị trang chủ không bị gián đoạn. |
