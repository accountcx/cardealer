# 🔌 REST API Specification: Hệ Thống Tin Tức, Content Blocks & Inbound Marketing (Tiptap Engine)

> **Mã Epic:** `EPIC-PHASE-5-CONTENT-TIPTAP-INBOUND`  
> **Giai đoạn:** Giai đoạn 2 — Bước 2.2 (Gate 2: Thiết Kế Kiến Trúc Chi Tiết)  
> **Role phụ trách:** `feature-spec-generator`  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`SCHEMA.md`](./SCHEMA.md)  
> **Trạng thái Môi trường:** 🟢 Pure Development  

---

## 1. Danh Mục REST Endpoints Phân Tầng

### 1.1. Public Storefront Endpoints (`apps/web` tiêu thụ)
| Phương Thức | Endpoint URL | Mục Đích Nghiệp Vụ | Caching / ISR |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/posts` | Danh sách bài viết xuất bản (phân trang, lọc chuyên mục, ghim top 3) | Cache tag: `posts-list`, ISR 3600s |
| `GET` | `/api/posts/:slug` | Chi tiết bài viết theo Slug (kèm E-E-A-T Saler, chuyên mục) | Cache tag: `post-[slug]`, ISR 3600s |
| `GET` | `/api/posts/preview/:token` | Xem trước bài nháp qua mã bảo mật bí mật (không cần đăng nhập) | No-cache |
| `GET` | `/api/categories` | Danh sách chuyên mục tin tức | Cache tag: `categories`, ISR 86400s |
| `POST` | `/api/leads` | Tiếp nhận đăng ký nhận báo giá / mở khóa Gated Content | No-cache, Rate-limit 5 req/min/IP |
| `GET` | `/api/redirects/lookup` | Tra cứu đường dẫn chuyển hướng 301 cho Next.js Middleware | In-memory cache < 2ms |

### 1.2. Admin Portal Endpoints (`apps/admin` tiêu thụ)
| Phương Thức | Endpoint URL | Mục Đích Nghiệp Vụ | Quyền Hạn |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/admin/posts` | Danh sách bài viết toàn bộ trạng thái (Lọc: status, category, author) | Admin Staff |
| `POST` | `/api/admin/posts` | Tạo mới bài viết (Hỗ trợ nháp hoặc xuất bản ngay) | Admin Staff |
| `GET` | `/api/admin/posts/:id` | Lấy chi tiết bài viết phục vụ nạp vào Tiptap Editor | Admin Staff |
| `PUT` | `/api/admin/posts/:id` | Cập nhật bài viết (Tự động ghi nhận 301 Redirect nếu đổi Slug) | Admin Staff |
| `DELETE` | `/api/admin/posts/:id` | Chuyển trạng thái sang `archived` hoặc xóa bài | Admin Staff |
| `POST` | `/api/admin/posts/:id/preview-token` | Sinh mới Preview Token bí mật để gửi link xem trước | Admin Staff |
| `POST` | `/api/admin/seo/analyze` | Phân tích và chấm điểm SEO 10 tiêu chí real-time cho bài viết | Admin Staff |

---

## 2. Đặc Tả Chi Tiết Từng Endpoint

### 2.1. `GET /api/posts` — Danh Sách Bài Viết Phía Khách Hàng
* **Query Parameters:**
  * `page` (number, default: `1`): Số trang (URL tham số `?trang=...`).
  * `limit` (number, default: `10`): Số bài trên 1 trang.
  * `category` (string, optional): Lọc theo slug chuyên mục.
  * `tag` (string, optional): Lọc theo thẻ.
* **Quy tắc Nghiệp vụ:**
  - Chỉ trả về các bài viết có `status = 'published'` VÀ (`scheduledAt IS NULL` HOẶC `scheduledAt <= NOW()`).
  - Trang đầu tiên (`page=1`): Các bài có `isFeatured = true` được ưu tiên xếp lên đầu theo `featuredOrder ASC` (tối đa 3 bài).
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "e2b0c340-9a2d-4567-b89c-0123456789ab",
        "tieuDe": "Bảng Giá Xe Hyundai Mới Nhất Tháng 09/2026 Tại TP. Vinh, Nghệ An",
        "slug": "bang-gia-xe-hyundai-thang-09-2026-vinh",
        "anhDaiDienUrl": "https://img.xehyundaivinh.com/posts/bang-gia-xe-hyundai-2026.webp",
        "anhDaiDienAlt": "Bảng giá xe Hyundai 2026 tại Nghệ An",
        "tomTat": "Tổng hợp giá niêm yết, ưu đãi tiền mặt và chi phí lăn bánh các dòng xe Accent, Creta, Tucson, Santa Fe...",
        "chuyenMuc": {
          "id": "c1a2b3c4-0000-0000-0000-000000000001",
          "tenChuyenMuc": "Bảng Giá & Khuyến Mãi",
          "slug": "bang-gia-khuyen-mai"
        },
        "tacGia": {
          "id": "u1a2b3c4-0000-0000-0000-000000000002",
          "name": "Nguyễn Văn Tuấn",
          "avatarUrl": "https://img.xehyundaivinh.com/authors/tuan-hyundai.webp",
          "phone": "0912345678"
        },
        "isFeatured": true,
        "featuredOrder": 1,
        "readingTime": 4,
        "isExpired": false,
        "publishedAt": "2026-09-20T08:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2.2. `GET /api/posts/:slug` — Chi Tiết Bài Viết Chuẩn SEO
* **URL Params:** `slug` (string, required): Slug bài viết.
* **Quy tắc Nghiệp vụ:**
  - Tự động kiểm tra `expiredPromoDate`: Nếu `expiredPromoDate < NOW()`, trả về cờ `isExpired: true`.
  - Tự động tăng `viewCount` trong DB theo cơ chế background update.
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "e2b0c340-9a2d-4567-b89c-0123456789ab",
    "tieuDe": "Đánh Giá Chi Tiết Hyundai Tucson 2025: Đột Phá Thiết Kế & Công Nghệ",
    "slug": "danh-gia-chi-tiet-hyundai-tucson-2025",
    "anhDaiDienUrl": "https://img.xehyundaivinh.com/posts/tucson-2025-review.webp",
    "anhDaiDienAlt": "Đánh giá chi tiết Hyundai Tucson 2025 tại showroom TP Vinh",
    "tomTat": "Phân tích ưu nhược điểm phiên bản Xăng Tiêu Chuẩn và Dầu Đặc Biệt...",
    "noiDung": {
      "type": "doc",
      "content": [
        { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "1. Thiết kế Ngoại thất Sensuous Sportiness" }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "Hyundai Tucson 2025 tiếp tục gây ấn tượng mạnh với lưới tản nhiệt..." }] },
        { "type": "tiktokBlock", "attrs": { "videoId": "71234567890", "title": "Trải nghiệm ngoại thất Tucson ngoài trời", "posterImageUrl": "https://img.xehyundaivinh.com/tiktok-poster.webp" } }
      ]
    },
    "chuyenMuc": {
      "id": "c1a2b3c4-0000-0000-0000-000000000002",
      "tenChuyenMuc": "Đánh Giá Xe",
      "slug": "danh-gia-xe"
    },
    "tacGia": {
      "id": "u1a2b3c4-0000-0000-0000-000000000002",
      "name": "Nguyễn Văn Tuấn",
      "title": "Chuyên viên tư vấn ô tô Hyundai",
      "avatarUrl": "https://img.xehyundaivinh.com/authors/tuan-hyundai.webp",
      "phone": "0912345678",
      "zalo": "https://zalo.me/0912345678"
    },
    "seo": {
      "metaTitle": "Đánh Giá Xe Hyundai Tucson 2025 Giá Lăn Bánh Tại Nghệ An",
      "metaDescription": "Bài đánh giá chi tiết Hyundai Tucson 2025 từ chuyên viên bán hàng. Xem giá lăn bánh, thông số động cơ Smartstream và video thực tế.",
      "canonicalUrl": "https://xehyundaivinh.com/tin-tuc/danh-gia-chi-tiet-hyundai-tucson-2025",
      "noIndex": false
    },
    "isExpired": false,
    "readingTime": 6,
    "publishedAt": "2026-09-22T02:00:00.000Z",
    "updatedAt": "2026-09-24T10:00:00.000Z"
  }
}
```

---

### 2.3. `POST /api/leads` — Thu Thập Lead Từ Bài Viết
* **Request Body:**
```json
{
  "soDienThoai": "0987654321",
  "hoTen": "Anh Hoàng",
  "dongXeQuanTam": "Hyundai Tucson 2025",
  "postId": "e2b0c340-9a2d-4567-b89c-0123456789ab",
  "salerId": "u1a2b3c4-0000-0000-0000-000000000002",
  "formType": "inline",
  "utmSource": "facebook_ads",
  "utmCampaign": "tucson_khuyen_mai_thang_9"
}
```
* **Response 201 Created (< 200ms):**
```json
{
  "success": true,
  "message": "Đăng ký thành công! Chuyên viên tư vấn sẽ liên hệ lại sớm nhất.",
  "data": {
    "leadId": "l1a2b3c4-5555-6666-7777-888888888888"
  }
}
```

---

### 2.4. `GET /api/redirects/lookup` — Kiểm Tra URL Cũ Cho Middleware
* **Query Parameters:** `path=/tin-tuc/slug-cu`
* **Response 200 OK (Có Redirect):**
```json
{
  "found": true,
  "oldPath": "/tin-tuc/slug-cu",
  "newPath": "/tin-tuc/slug-moi-nhat",
  "statusCode": 301
}
```
* **Response 200 OK (Không có Redirect):**
```json
{
  "found": false
}
```

---

### 2.5. `POST /api/admin/seo/analyze` — Chấm Điểm SEO 10 Tiêu Chí Real-Time
* **Request Body:**
```json
{
  "tieuDe": "Giá Xe Hyundai Tucson 2025 Lăn Bánh Tại Vinh Nghệ An Mới Nhất",
  "slug": "gia-xe-hyundai-tucson-2025-vinh",
  "focusKeyword": "Hyundai Tucson 2025",
  "noiDung": { "type": "doc", "content": [...] },
  "metaDescription": "Cập nhật bảng giá xe Hyundai Tucson 2025 lăn bánh tại TP. Vinh, Nghệ An tháng 9/2026 kèm ưu đãi..."
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "score": 85,
  "maxScore": 100,
  "status": "good",
  "criteria": [
    { "id": "title_length", "label": "Độ dài tiêu đề (40-65 ký tự)", "passed": true, "score": 10, "current": 58 },
    { "id": "slug_keyword", "label": "Từ khóa trong URL Slug", "passed": true, "score": 10, "current": "chứa 'hyundai-tucson-2025'" },
    { "id": "intro_keyword", "label": "Từ khóa trong 100 từ đầu tiên", "passed": true, "score": 10 },
    { "id": "keyword_density", "label": "Mật độ từ khóa (1.0% - 2.5%)", "passed": true, "score": 10, "current": "1.8%" },
    { "id": "word_count", "label": "Độ dài bài viết (>= 600 từ)", "passed": true, "score": 10, "current": 1250 },
    { "id": "h2_structure", "label": "Có ít nhất 2 thẻ H2 chứa từ khóa", "passed": true, "score": 10, "current": 3 },
    { "id": "image_alts", "label": "100% hình ảnh có thẻ Alt", "passed": true, "score": 10, "current": "5/5 ảnh có alt" },
    { "id": "internal_links", "label": "Có ít nhất 2 liên kết nội bộ", "passed": false, "score": 0, "message": "Chưa có liên kết trỏ tới dòng xe hoặc bài viết khác" },
    { "id": "meta_desc", "label": "Meta Description chuẩn (120-160 ký tự)", "passed": true, "score": 10, "current": 142 },
    { "id": "cannibalization", "label": "Chống trùng lặp từ khóa chính", "passed": true, "score": 5, "message": "Không trùng lặp với bài viết nào đã xuất bản" }
  ]
}
```

---

## 3. Ma Trận Mã Lỗi (Error Matrix)

| HTTP Status | Mã Lỗi (Code) | Ngữ Cảnh Xảy Ra | Giải Pháp Khắc Phục |
| :---: | :--- | :--- | :--- |
| `400` | `INVALID_PHONE_NUMBER` | Số điện thoại không đúng 10 số VN | Báo đỏ trực tiếp ô nhập SĐT trên Form |
| `400` | `VALIDATION_FAILED` | Tiêu đề quá ngắn (< 20 ký tự) hoặc còn ký tự `[...]` | Thông báo chi tiết các trường chưa đạt chuẩn trước khi xuất bản |
| `404` | `POST_NOT_FOUND` | Không tìm thấy bài viết theo Slug | Render trang 404 thân thiện gợi ý xe và tin tức khác |
| `409` | `SLUG_ALREADY_EXISTS` | Slug bị trùng lặp với một bài viết khác | Tự động thêm đuôi định danh `-1`, `-2` hoặc yêu cầu sửa slug |
| `429` | `TOO_MANY_REQUESTS` | Khách gửi form spam quá 5 lần/phút | Khóa tạm thời IP trong 5 phút |
| `500` | `INTERNAL_SERVER_ERROR` | Lỗi kết nối Database | Log lỗi chi tiết với Sentry/Server Logger |
