# 📡 API SPECIFICATION: Technical SEO & Cache Revalidation Contracts

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Tài liệu tham chiếu:** [FLOW.md](./FLOW.md) | [SCHEMA.md](./SCHEMA.md)

---

## 1. POST `/api/revalidate` — On-Demand Cache Invalidation Webhook

API cho phép Admin Portal hoặc CI/CD bắn tín hiệu xóa cache tức thì khi có biến động về giá, bài viết hoặc cấu hình đại lý.

* **Endpoint:** `POST /api/revalidate`
* **Môi trường:** Storefront (`apps/web`)
* **Bảo mật:** Bearer Token hoặc Query Secret Header `x-revalidate-secret` hoặc query `?secret=...`.
* **Headers:**
  ```http
  Content-Type: application/json
  x-revalidate-secret: <REVALIDATE_SECRET_TOKEN>
  ```

### Request Payload:
```json
{
  "path": "/tin-tuc",
  "tag": "catalog-cars"
}
```
*(Cả 2 trường đều là optional, nhưng phải có ít nhất 1 trường `path` hoặc `tag`).*

### Response Contracts:

#### 🟢 200 OK — Xóa Cache Thành Công
```json
{
  "success": true,
  "revalidated": true,
  "path": "/tin-tuc",
  "tag": "catalog-cars",
  "timestamp": "2026-11-05T16:15:00.000Z"
}
```

#### 🔴 401 Unauthorized — Sai hoặc Thiếu Secret Token
```json
{
  "success": false,
  "message": "Invalid or missing revalidation secret token."
}
```

#### 🔴 400 Bad Request — Thiếu cả `path` lẫn `tag`
```json
{
  "success": false,
  "message": "At least one of 'path' or 'tag' must be provided for revalidation."
}
```

---

## 2. GET `/feed.xml` — RSS 2.0 Feed Generator

Cung cấp nguồn cấp tin bài viết tự động theo chuẩn RSS 2.0 phục vụ Google News và các nền tảng đọc tin tự động.

* **Endpoint:** `GET /feed.xml`
* **Headers phản hồi:**
  ```http
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400
  ```

### XML Schema Response:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tin Tức &amp; Bảng Giá Xe Hyundai Vinh</title>
    <link>https://xehyundaivinh.com</link>
    <description>Cập nhật tin tức thị trường ô tô Hyundai, ưu đãi giảm giá và khuyến mãi mới nhất tại Nghệ An &amp; Hà Tĩnh.</description>
    <language>vi-VN</language>
    <lastBuildDate>Thu, 05 Nov 2026 16:15:00 GMT</lastBuildDate>
    <atom:link href="https://xehyundaivinh.com/feed.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>Bảng Giá Xe Hyundai Tháng 11/2026 Mới Nhất Tại Nghệ An</title>
      <link>https://xehyundaivinh.com/tin-tuc/bang-gia-xe-hyundai-thang-11-2026</link>
      <guid isPermaLink="true">https://xehyundaivinh.com/tin-tuc/bang-gia-xe-hyundai-thang-11-2026</guid>
      <pubDate>Thu, 05 Nov 2026 08:00:00 GMT</pubDate>
      <description><![CDATA[Tổng hợp giá niêm yết và ưu đãi giảm thuế trước bạ cho các dòng xe Accent, Creta, Tucson, Santa Fe.]]></description>
    </item>
  </channel>
</rss>
```

---

## 3. GET `/gia-lan-banh/[carSlug]` — Dynamic Route Contract

* **URL Pattern:** `/gia-lan-banh/:carSlug` (Ví dụ: `/gia-lan-banh/tucson`, `/gia-lan-banh/accent`)
* **Behavior:**
  1. Kiểm tra `:carSlug` qua `carsService.getCarBySlug(carSlug)`.
  2. Nếu không tìm thấy xe hoặc xe chưa xuất bản (`car.status !== 'published'`): Gọi `notFound()` trả về HTTP 404 thực thể.
  3. Nếu tìm thấy: Trả về trang HTML Server Component hoàn chỉnh với HTTP 200 OK, chèn sẵn các tham số phiên bản và bảng chiết tính chi phí lăn bánh của mẫu xe đó.
