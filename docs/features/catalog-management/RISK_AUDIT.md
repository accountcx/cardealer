# ⚠️ RISK AUDIT: Catalog & Vehicle Specification Engine

> **Module:** `catalog-management`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Phân Tích Bán Kính Tác Động (Blast Radius Analysis)

- **Các phân hệ phụ thuộc:**
  - `pricing-calculator`: Sử dụng trực tiếp `giaNiemYet`, `giaKhuyenMai`, `taxRate` từ bảng `cars` và `car_versions` để tính phí lăn bánh và lịch trả góp ngân hàng.
  - `lead-management`: Liên kết dữ liệu `carModel`, `carVersion` khi khách hàng nộp đơn báo giá hoặc vay mua xe.
  - `seo-engine`: Đọc danh sách slug xe để tự động sinh `sitemap.xml`, thẻ Meta Canonical và dữ liệu có cấu trúc `Product` Schema JSON-LD.
  - `content-management`: Tích hợp các khối nội dung xe liên quan (`RelatedCarBlock`) trong bài viết đánh giá.

---

## 2. Rà Soát Điểm Yếu An Ninh & Rủi Ro Tiềm Ẩn

| Mã Rủi Ro | Phân Loại | Kịch Bản Rủi Ro | Biện Pháp Phòng Ngừa Đã Thực Thi |
| :---: | :--- | :--- | :--- |
| **R-01** | BOLA / IDOR | Kẻ xấu sửa ID xe trong request `PATCH /api/admin/cars/:id` để ghi đè dòng xe khác | Kiểm tra quyền `cars:write` qua JWT middleware trước khi thực hiện mutation |
| **R-02** | XSS / Content Injection | Tiêm mã HTML/JS vào trường `moTaChung` hoặc `promotionSummary` | Xử lý sanitization tự động khi render và sử dụng text node an toàn |
| **R-03** | Broken Link / 404 | Thay đổi slug xe đã index trên Google làm hỏng thứ hạng SEO | Bảng `redirects` tự động ghi nhận URL cũ và điều hướng HTTP 301 sang slug mới |
| **R-04** | N+1 Query ORM | Truy vấn danh sách xe kèm phiên bản và màu sắc gây chậm cơ sở dữ liệu | Đánh chỉ mục B-Tree `cars_slug_idx`, `car_versions_car_id_idx` và dùng eager join |

---

## 3. Kế Hoạch Phục Hồi & Rollback Khẩn Cấp (Rollback Strategy)

1. **Khôi phục dữ liệu xe:** Dữ liệu xe có thể rollback bằng backup PostgreSQL hoặc chạy lại script seed: `pnpm --filter @cardealer/database db:seed`.
2. **Rollback API:** Nếu bản build API có lỗi hồi quy, revert commit và deploy lại bản build ổn định trước đó qua PM2 (`pnpm pm2:reload`).
