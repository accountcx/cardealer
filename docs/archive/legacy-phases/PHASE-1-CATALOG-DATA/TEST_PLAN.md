# 🧪 Kế Hoạch Kiểm Thử Tự Động (TEST_PLAN.md)
## PHASE 1 - CORE DATA LAYER, CAR CATALOG & ADMIN AUTHENTICATION

> **Role:** `qa-test-engineer`  
> **Cơ chế nghiệm thu:** CLI Machine Verification Script (Tự động kiểm tra không cần can thiệp thủ công)  
> **Tiêu chuẩn vượt qua (Pass Criteria):** Script chạy toàn bộ 6 Test Suites và trả về mã thoát `exit 0`.

---

## 1. Danh Sách 6 Bộ Kiểm Thử Tự Động (Test Suites)

```
[CLI Verification Script: verify-phase-1.ts]
├── Suite 1: Database Connection & Migration Integrity
├── Suite 2: Seed Data Validation (Admin User + 4 Flagship Cars)
├── Suite 3: Authentication & Security Integrity (Login, Password Hash, JWT)
├── Suite 4: Catalog Query API & Eager Loading Performance (< 10ms)
├── Suite 5: Admin CRUD & Cascade Deletion Safety
└── Suite 6: Static Type Safety & Build Verification (TypeScript tsc --noEmit)
```

---

## 2. Chi Tiết Từng Kịch Bản Kiểm Thử (Detailed Test Cases)

### 🧪 Suite 1: Kiểm Tra Kết Nối DB & Cấu Trúc Bảng
* **Mục tiêu:** Xác minh PostgreSQL đang hoạt động và Drizzle migrations đã tạo đủ 7 bảng dữ liệu.
* **Các bước kiểm tra:**
  1. Mở kết nối tới PostgreSQL qua biến môi trường `DATABASE_URL`.
  2. Truy vấn `information_schema.tables` để kiểm tra sự tồn tại của 7 bảng:
     * `users`, `cars`, `car_versions`, `colors`, `version_colors`, `media`, `system_settings`.
  3. Kiểm tra các chỉ mục quan trọng: `cars_slug_idx`, `unique_version_color_idx`.
* **Kỳ vọng:** Cả 7 bảng và indexes đều tồn tại hợp lệ trong schema `public`.

---

### 🧪 Suite 2: Kiểm Tra Dữ Liệu Mẫu (Seed Data Validation)
* **Mục tiêu:** Đảm bảo script seeder đã nạp đủ dữ liệu mẫu chuẩn nghiệp vụ.
* **Các bước kiểm tra:**
  1. Kiểm tra tài khoản Quản trị viên mặc định:
     * Email: `admin@xehyundaivinh.com`, `role = 'admin'`.
  2. Kiểm tra danh mục 4 dòng xe chủ lực của Hyundai:
     * *Hyundai Santa Fe, Hyundai Tucson, Hyundai Creta, Hyundai Grand i10*.
  3. Kiểm tra tính toàn vẹn của quan hệ:
     * Mỗi dòng xe có ít nhất 2 phiên bản trang bị.
     * Mỗi phiên bản có ít nhất 2 màu sắc ngoại thất liên kết trong `version_colors`.
     * Bảng `system_settings` có đủ 7 keys cấu hình toàn cục.
* **Kỳ vọng:** Dữ liệu mẫu đầy đủ, không có dòng xe hoặc phiên bản bị thiếu thông số.

---

### 🧪 Suite 3: Kiểm Tra Cơ Chế Xác Thực Admin (Auth & Security)
* **Mục tiêu:** Đảm bảo mã hóa mật khẩu và cơ chế cấp JWT hoạt động an toàn.
* **Các bước kiểm tra:**
  1. **Test Login thành công:**
     * Gửi request `POST /api/auth/login` với email `admin@xehyundaivinh.com` và mật khẩu đúng.
     * Xác minh HTTP status `200`, nhận được cookie `admin_token` có cờ `HttpOnly`.
  2. **Test Login thất bại (Mật khẩu sai):**
     * Gửi mật khẩu sai -> Xác minh HTTP status `401 Unauthorized`.
  3. **Test Mật khẩu Hash:**
     * Kiểm tra chuỗi lưu trong `users.password_hash` bắt đầu bằng `$2a$` hoặc `$2b$` (chuẩn bcrypt).
  4. **Test Thu hồi phiên:**
     * Tăng `token_version` trong DB -> Xác minh token cũ bị từ chối truy cập.

---

### 🧪 Suite 4: Kiểm Tra API Truy Vấn Danh Mục Xe & Hiệu Năng (< 10ms)
* **Mục tiêu:** Kiểm tra REST API trả về đúng dữ liệu cây xe và không bị lỗi N+1 Query.
* **Các bước kiểm tra:**
  1. Gọi `GET /api/cars`:
     * Kiểm tra danh sách xe trả về định dạng `{ success: true, data: [...] }`.
     * Kiểm tra có đủ các trường: `tenXe`, `slug`, `segment`, `traTruocTu`, `promotionSummary`.
  2. Gọi `GET /api/cars/tucson-2025`:
     * Đo thời gian phản hồi: Bắt buộc **< 10ms**.
     * Kiểm tra dữ liệu lồng nhau: Dòng xe -> Danh sách Phiên bản -> Màu sắc và ảnh góc xe.
* **Kỳ vọng:** Dữ liệu trả về chuẩn Envelope, thời gian thực thi siêu tốc.

---

### 🧪 Suite 5: Kiểm Tra Admin CRUD & Ràng Buộc Khóa Ngoại
* **Mục tiêu:** Đảm bảo thêm/sửa/xóa hoạt động trơn tru và an toàn toàn vẹn dữ liệu.
* **Các bước kiểm tra:**
  1. Tạo thử một xe tạm: `"Hyundai Test 2026"` với slug `"test-2026"`.
  2. Tạo 1 phiên bản con và gán màu sắc.
  3. Kiểm tra câu lệnh xóa xe:
     * Xóa dòng xe `test-2026` ➡️ Kiểm tra phiên bản con và `version_colors` tự động bị xóa theo (Cascade).
     * Kiểm tra bảng `colors` chung **vẫn còn nguyên vẹn** (không bị xóa nhầm).
* **Kỳ vọng:** Ràng buộc cascade deletion hoạt động chuẩn xác 100%.

---

### 🧪 Suite 6: Kiểm Tra Compile TypeScript Toàn Bộ Monorepo
* **Mục tiêu:** Không có lỗi lệch kiểu (Type mismatch) giữa các packages.
* **Lệnh thực thi:**
  ```bash
  pnpm turbo run check-types
  ```
* **Kỳ vọng:** Toàn bộ packages `@cardealer/*` và apps `admin`, `api`, `web` đều vượt qua với mã `exit 0`.

---

## 3. Lệnh Thực Thi Machine Verification Script Tại Gate 4

Khi bước vào Giai đoạn 4 (Implementation), toàn bộ kịch bản kiểm thử trên sẽ được thực thi tự động qua một lệnh duy nhất:

```bash
pnpm verify:phase-1
```

* Script sẽ in ra kết quả từng Test Case bằng màu sắc trực quan (🟢 PASS / 🔴 FAIL).
* Khi toàn bộ 6 Suites đạt 🟢 PASS, script kết thúc với mã `process.exit(0)`, thông quan Gate 4 để chuyển sang Giai đoạn 5 (Review Độc Lập).
