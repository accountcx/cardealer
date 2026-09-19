# 🛡️ Báo Cáo Kiểm Toán Ma Trận Rủi Ro (RISK_AUDIT.md)
## PHASE 1 - CORE DATA LAYER, CAR CATALOG & ADMIN AUTHENTICATION

> **Role:** `dependency-graph-analyzer`  
> **Mã Epic:** `EPIC-PHASE-1-CATALOG-DATA`  
> **Cấp độ Thực thi:** Tier 1 (Core Architecture)  
> **Trạng thái:** 🟢 PASS AUDIT (Đã xác định 17 rủi ro kỹ thuật & có giải pháp phòng vệ tương ứng)

---

## 1. Ma Trận Kiểm Toán 17 Rủi Ro Kỹ Thuật (R1 – R17)

| Mã | Hạng Mục Rủi Ro | Mức Độ | Nguy Cơ Tiềm Ẩn | Giải Pháp Phòng Vệ Kỹ Thuật (Mitigation Strategy) |
| :---: | :--- | :---: | :--- | :--- |
| **R1** | **Database Connection Pool Exhaustion** | 🔴 High | Monorepo có nhiều process (`apps/api`, `apps/admin`) cùng mở kết nối tới PostgreSQL dẫn đến cạn kiệt pool kết nối. | Cấu hình connection pool tập trung tại `@cardealer/database` bằng thư viện `postgres`, giới hạn `max: 10` kết nối/tiến trình, tự động giải phóng idle connections sau 20s. |
| **R2** | **N+1 Query Cascade** | 🔴 High | Khi truy vấn Dòng xe -> Phiên bản -> Màu ngoại thất -> Swatch sinh ra hàng chục câu query con làm nghẽn DB. | Sử dụng **Drizzle Relational Queries API** (`db.query.cars.findMany({ with: { versions: { with: { versionColors: { with: { color: true } } } } } })`) được compile thành 1 câu SQL duy nhất có parameterized joins. |
| **R3** | **Slug Collision & Unicode Race Condition** | 🟡 Med | Tên xe tiếng Việt ("Hyundai Tucson 2025" vs "Hyundai Tucson") có thể sinh slug trùng nhau hoặc bị lỗi ký tự Unicode. | Tạo hàm `slugify()` chuẩn hóa tiếng Việt không dấu, loại bỏ ký tự lạ. Khai báo `uniqueIndex('cars_slug_idx')` ở DB. Nếu trùng, tự động thêm hậu tố số tăng dần (`-2`, `-3`). |
| **R4** | **BigInt JSON Serialization Crash** | 🔴 High | Giá xe ô tô lên tới hàng tỷ VNĐ (`giaNiemYet`), kiểu `BigInt` của JS không thể `JSON.stringify()` tự nhiên, gây crash Next.js RSC & API. | Khai báo Drizzle schema dùng `bigint('gia_niem_yet', { mode: 'number' })`. Phạm vi an toàn của JS Number là 9 triệu tỷ (> 9.007.199.254.740.991), trong khi giá xe tối đa chỉ 2-5 tỷ VNĐ. |
| **R5** | **Admin Password Hash & Timing Attacks** | 🔴 High | Lưu mật khẩu dạng thô hoặc thuật toán yếu (MD5/SHA) bị rò rỉ dữ liệu hoặc bị tấn công đo thời gian (timing attacks). | Dùng `bcryptjs` với hệ số làm tròn Salt Rounds = 10. Sử dụng `bcrypt.compare()` để so sánh mật khẩu với thời gian hằng số (constant-time comparison). |
| **R6** | **JWT Secret Leakage & Session Hijacking** | 🔴 High | Token admin bị đọc trộm qua mã độc XSS hoặc không thể thu hồi khi nhân viên nghỉ việc. | Lưu JWT trong Cookie có cờ `HttpOnly; Secure; SameSite=Lax`. Payload JWT chứa `tokenVersion`. Khi đổi mật khẩu, DB tăng `tokenVersion` ➡️ vô hiệu hóa toàn bộ token cũ ngay lập tức. |
| **R7** | **Next.js 16 Middleware Bypass** | 🟡 Med | Người dùng vãng lai đoán được URL con `/admin/cars/new` hoặc `/admin/colors` và truy cập thẳng không qua đăng nhập. | Khai báo `matcher: ['/admin/:path*']` trong `middleware.ts`. Kiểm tra chữ ký JWT trước khi cho request đi tiếp, chỉ ngoại trừ duy nhất trang `/admin/login`. |
| **R8** | **Foreign Key Cascade Deletion Safety** | 🟡 Med | Khi xóa một Dòng xe, dữ liệu Phiên bản và Màu bị mồ côi (orphan records) hoặc vô tình xóa nhầm danh mục màu chung. | Cấu hình khóa ngoại: `cars -> car_versions` đặt `onDelete: 'cascade'`; `version_colors` đặt `onDelete: 'cascade'`; nhưng `colors` (bảng màu dùng chung) giữ nguyên không xóa. |
| **R9** | **Unsanitized JSONB Data Injection** | 🟡 Med | Dữ liệu `highlightFeatures` hoặc `specGroups` bị truyền dữ liệu rác làm vỡ giao diện render Storefront. | Sử dụng **Zod Schema** validate chặt chẽ cấu trúc JSON trước khi ghi vào database (`highlightFeaturesSchema = z.array(z.object({ icon, title, value }))`). |
| **R10**| **Seeder Idempotency & Repeatability** | 🟡 Med | Khi chạy script nạp dữ liệu mẫu (`pnpm db:seed`) nhiều lần bị lỗi duplicate key hoặc nhân bản dữ liệu xe. | Script Seeder dùng cơ chế Upsert (`onConflictDoUpdate` hoặc kiểm tra theo `slug`) trước khi nạp dữ liệu 4 dòng xe chủ lực (*Santa Fe, Tucson, Creta, Grand i10*). |
| **R11**| **Monorepo Package Circular Dependency** | 🟡 Med | Các package `@cardealer/*` import chéo lẫn nhau gây lỗi build Turborepo. | Thiết lập đồ thị phụ thuộc một chiều (DAG): `@cardealer/types` ⬅️ `@cardealer/database` ⬅️ `apps/api` & `apps/admin`. Không có chiều ngược lại. |
| **R12**| **Next.js 16 Turbopack & React 19 RSC Errors** | 🟡 Med | Dùng hooks (`useState`, `useEffect`) bên trong Server Component gây lỗi biên dịch Turbopack. | Phân định rõ ràng: Toàn bộ Layout Shell, Server Data Fetching nằm ở Server Component (mặc định); chỉ các widget tương tác (Modal, Dropdown, Color Picker) mới có chỉ thị `'use client'`. |
| **R13**| **SQL Injection qua Bộ Lọc & Tìm Kiếm** | 🔴 High | Hacker chèn chuỗi độc hại qua query param `?segment=` hoặc `?search=`. | Drizzle ORM 100% sử dụng Parameterized Queries (`$1`, `$2`), triệt tiêu hoàn toàn nguy cơ SQL Injection. |
| **R14**| **Cross-Site Request Forgery (CSRF)** | 🟡 Med | Tấn công giả mạo yêu cầu từ trang web độc hại để xóa xe hoặc sửa giá. | Cookie `admin_token` có `SameSite=Lax`. Backend API yêu cầu Header `Content-Type: application/json` và kiểm tra Origin header. |
| **R15**| **Asset Path Traversal & Malicious Files** | 🟡 Med | Tải lên file PHP/HTML giả dạng file ảnh hoặc catalog PDF. | Validate MIME Type (`image/webp`, `image/jpeg`, `image/png`, `application/pdf`), kích thước tối đa 10MB, lưu tên file ngẫu nhiên dạng UUID. |
| **R16**| **Timezone Discrepancies** | 🟢 Low | Ngày tạo và cập nhật hiển thị sai lệch giữa máy chủ và giờ Việt Nam. | PostgreSQL lưu trữ dưới dạng `TIMESTAMPTZ` (UTC). Khi hiển thị trên giao diện định dạng theo múi giờ `Asia/Ho_Chi_Minh` (`vi-VN`). |
| **R17**| **Scope Creep & Out-of-Scope Leakage** | 🟡 Med | Vô tình viết mã xử lý thanh toán, giỏ hàng hoặc quản lý kho trong Phase 1. | Khóa chặt phạm vi: Phase 1 chỉ bao gồm Catalog Xe, Bảng màu và Admin Authentication. Không triển khai tính năng ngoài phạm vi. |

---

## 2. Bảng Câu Hỏi Làm Rõ (Clarification & Unblocking)

* **Hiện trạng:** Đã làm rõ và thống nhất toàn bộ các điểm cốt lõi với Developer:
  * ✅ *Đã loại bỏ trường `availability: out_of_stock`* để phục vụ tối ưu cho phễu thu thập khách hàng của Sale.
  * ✅ *Đã khóa phạm vi Phase 1 vào đúng 7 bảng* (`users`, `cars`, `car_versions`, `colors`, `version_colors`, `media`, `system_settings`), chuyển các bảng `leads`, `posts`, `testimonials` sang đúng phase tương ứng.
* **Kết luận:** **Không có điểm nghẽn (Zero Blockers)**. Đủ điều kiện kỹ thuật để lập Test Plan tự động.
