# 🧪 Quality Assurance & Test Strategy: Quản Trị Chuyên Mục (Admin Categories Management)

## 1. Tổng Quan Chiến Lược Kiểm Thử (Test Strategy)
* **Dự án:** CarDealer Monorepo (`/Users/nhatphan/Code/CarDealer/cardealer`)
* **Phạm vi Kiểm thử:** Full-stack Monorepo (`packages/types`, `apps/api`, `apps/admin`, `apps/web`)
* **Chế độ Machine Verification:** CLI Verification Script tự động hóa (`scripts/verify_admin_categories.sh`) đạt mã thoát `exit 0`.
* **Quy chuẩn Thực thi:** Tuân thủ triệt để nguyên tắc **Anti-Reward Hacking**: Bộ test case và verification script này là chuẩn mực bất biến; trong Giai đoạn 4, `fullstack-dev-executor` không được phép sửa đổi/nới lỏng test assertions để né lỗi.

---

## 2. Ma Trận Kịch Bản Kiểm Thử Chi Tiết (Test Scenarios Matrix)

| ID | Phân Loại | Mô Tả Kịch Bản | Dữ Liệu Đầu Vào / Hành Động | Kết Quả Kỳ Vọng (Expected Outcome) | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TS-01** | **Positive (Happy Path)** | Tạo mới chuyên mục hợp lệ | `POST /api/admin/categories`<br>`{ tenChuyenMuc: "Đánh Giá Xe", slug: "danh-gia-xe", sortOrder: 1 }` | `201 Created` + JSON Entity có UUID, `sortOrder = 1` | ⏳ PENDING |
| **TS-02** | **Positive (Happy Path)** | Lấy danh sách chuyên mục kèm số bài viết | `GET /api/admin/categories` | `200 OK` + Mảng chuyên mục, mỗi item có trường `postCount >= 0` | ⏳ PENDING |
| **TS-03** | **Positive (Happy Path)** | Cập nhật thông tin chuyên mục | `PUT /api/admin/categories/:id`<br>`{ tenChuyenMuc: "Đánh Giá Xe Hyundai 2026" }` | `200 OK` + `tenChuyenMuc` được cập nhật, `updatedAt` mới hơn | ⏳ PENDING |
| **TS-04** | **Positive (Happy Path)** | Xóa chuyên mục an toàn khi `postCount = 0` | `DELETE /api/admin/categories/:id` (danh mục chưa có bài viết) | `200 OK` + Xóa thành công khỏi Database | ⏳ PENDING |
| **TS-05** | **Negative (Validation)** | Gửi payload thiếu tên chuyên mục | `POST /api/admin/categories`<br>`{ tenChuyenMuc: "", slug: "test" }` | `400 Bad Request` + Mã lỗi `INVALID_INPUT` | ⏳ PENDING |
| **TS-06** | **Negative (Validation)** | Slug chứa ký tự hoa hoặc ký tự đặc biệt | `POST /api/admin/categories`<br>`{ tenChuyenMuc: "Test", slug: "Test_Slug!@#" }` | `400 Bad Request` + Báo lỗi regex slug không hợp lệ | ⏳ PENDING |
| **TS-07** | **Security / R13 (Conflict)** | Tạo chuyên mục với slug đã tồn tại | `POST /api/admin/categories`<br>`{ tenChuyenMuc: "Trùng Lặp", slug: "danh-gia-xe" }` | `409 Conflict` + Mã lỗi `SLUG_CONFLICT`, cấm tự thêm hậu tố | ⏳ PENDING |
| **TS-08** | **Security / R14 (Guard)** | Cố gắng xóa chuyên mục đang có bài viết | `DELETE /api/admin/categories/:id` (danh mục có `postCount > 0`) | `400 Bad Request` + Mã `CATEGORY_IN_USE` kèm số bài liên kết | ⏳ PENDING |
| **TS-09** | **Security / R5 (RBAC)** | User vai trò `saler` cố gắng tạo/xóa chuyên mục | Header Authorization với token của `saler` | `403 Forbidden` + Không thực hiện mutation | ⏳ PENDING |
| **TS-10** | **Algorithm / R16 (Slugify)** | Kiểm thử hàm tự sinh slug tiếng Việt | Input: `"Đánh Giá Xe & Khuyến Mãi 100%!"` | Output chính xác: `"danh-gia-xe-khuyen-mai-100"` (loại bỏ dấu và ký tự lạ) | ⏳ PENDING |
| **TS-11** | **UI Conformance** | 4-State UI Matrix trên Admin Portal | Truy cập `/categories` | Render đủ 4 trạng thái: Loading Shimmer, Empty State, Error State, Data Table | ⏳ PENDING |

---

## 3. Kịch Bản Machine Verification Script (CLI Verification Protocol)

Tệp script kiểm chứng tự động toàn diện được khởi tạo tại:
👉 `scripts/verify_admin_categories.sh`

### Nội dung các bước kiểm tra trong Script:
1. **Bước 1: Type-Check Toàn Dự Án (Project-wide TypeScript Check):**
   - Chạy `pnpm --filter @cardealer/types exec tsc --noEmit`
   - Chạy `pnpm --filter @cardealer/api exec tsc --noEmit`
   - Chạy `pnpm --filter @cardealer/admin exec tsc --noEmit`
   - Bất kỳ lỗi type nào phát sinh đều tính là FAIL (`exit 1`).
2. **Bước 2: Linter & Format Conformance:**
   - Chạy `pnpm eslint apps/admin/app/categories/`
3. **Bước 3: Unit Tests Validation Logic & Slugify:**
   - Chạy `pnpm --filter @cardealer/core test` (test hàm `slugifyVN`)
   - Chạy test Zod validation schema cho category.
4. **Bước 4: Secret Scan:**
   - Quét không có API token / hardcoded credentials nào trong diff.

Khi toàn bộ 4 bước trên đều hoàn thành không có lỗi:
👉 **Script trả về mã thành công tuyệt đối: `exit 0`**.
