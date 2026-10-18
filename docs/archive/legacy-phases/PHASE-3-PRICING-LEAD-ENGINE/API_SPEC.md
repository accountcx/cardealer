# 📡 Đặc Tả Giao Diện Lập Trình Ứng Dụng (REST API Specification)

> **Mã Tính Năng:** `EPIC-PHASE-3-PRICING-LEAD`  
> **Tên Tính Năng:** Bộ Công Cụ Tài Chính & Phễu Thu Thập Khách Hàng (Pricing & Lead Engine)  
> **Role Phụ Trách:** Feature Spec Generator  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)

---

## I. Bảng Tổng Hợp Tuyến Đường API (Endpoints Overview)

| Phương Thức | Đường Dẫn (Endpoint) | Quyền Hạn (Auth / RBAC) | Mục Đích Nghiệp Vụ |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/leads` | 🌐 Public (Không cần token) | Khách hàng gửi thông tin nhận báo giá lăn bánh từ Storefront. |
| `GET` | `/api/admin/leads` | 🔒 `leads:read` (Admin, Manager, Sales) | Lấy danh sách khách hàng tiềm năng kèm bộ lọc trạng thái và tìm kiếm. |
| `GET` | `/api/admin/leads/:id` | 🔒 `leads:read` (Admin, Manager, Sales) | Xem chi tiết thông tin lead và snapshot dự toán tài chính của khách. |
| `PATCH` | `/api/admin/leads/:id/status` | 🔒 `leads:write` (Admin, Manager, Sales) | Cập nhật tiến độ tư vấn (`contacted`, `converted`, `cancelled`) và ghi chú. |
| `DELETE` | `/api/admin/leads/:id` | 🔒 `leads:write` (Chỉ Admin) | Xóa lead rác hoặc dữ liệu thử nghiệm. |

---

## II. Chi Tiết Từng Endpoint

### 1. `POST /api/leads` (Public Lead Ingestion)

* **Mục đích:** Tiếp nhận thông tin khách hàng từ phễu SmartCalculator, kiểm tra cú pháp SĐT bằng Regex (0 đồng), kích hoạt cơ chế Idempotency chống spam và lưu vào cơ sở dữ liệu.
* **Headers:**
  ```http
  Content-Type: application/json
  X-Idempotency-Key: <optional-client-uuid>
  ```
* **Request Body:**
  ```json
  {
    "hoTen": "Nguyễn Văn Tuấn",
    "soDienThoai": "0912345678",
    "thoiGianLienHe": "sang",
    "tinhThanh": "Vinh",
    "carId": "550e8400-e29b-41d4-a716-446655440000",
    "versionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "dongXeTen": "Hyundai Accent",
    "phienBanTen": "1.5 AT Đặc Biệt",
    "hinhThuc": "Giá Lăn Bánh - Smart Calculator",
    "duToanSnapshot": {
      "giaXe": 569000000,
      "lePhiTruocBa": 56900000,
      "phiBienSo": 1000000,
      "phiDangKiem": 140000,
      "phiBaoTriDuongBo": 1560000,
      "baoHiemTNDS": 480700,
      "tongGiaLanBanh": 629080700
    }
  }
  ```
* **Response 201 Created (Tạo mới thành công):**
  ```json
  {
    "success": true,
    "message": "Đăng ký nhận báo giá thành công! Bảng giá chi tiết đang được gửi cho bạn.",
    "data": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "hoTen": "Nguyễn Văn Tuấn",
      "createdAt": "2026-09-20T10:00:00.000Z"
    }
  }
  ```
* **Response 200 OK (Trùng lặp Idempotency trong 60 giây - Coi như thành công):**
  ```json
  {
    "success": true,
    "message": "Yêu cầu của bạn đã được ghi nhận trước đó. Tư vấn viên sẽ liên hệ sớm nhất!",
    "data": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
    }
  }
  ```
* **Response 400 Bad Request (Lỗi cú pháp SĐT):**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Số điện thoại không đúng định dạng nhà mạng Việt Nam (cần 10 chữ số)"
    }
  }
  ```

---

### 2. `GET /api/admin/leads` (Danh Sách Leads Trong Admin)

* **Quyền hạn:** Yêu cầu đăng nhập + vai trò có quyền `leads:read` (`admin`, `manager`, `sales`).
* **Query Parameters:**
  * `status`: Lọc theo trạng thái (`all` | `new` | `contacted` | `converted` | `cancelled`). Mặc định: `all`.
  * `search`: Tìm kiếm theo Họ tên hoặc Số điện thoại.
  * `page`: Trang hiện tại (Mặc định: `1`).
  * `limit`: Số bản ghi mỗi trang (Mặc định: `20`, tối đa `100`).
* **Response 200 OK:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "hoTen": "Nguyễn Văn Tuấn",
        "soDienThoai": "0912345678",
        "thoiGianLienHe": "sang",
        "tinhThanh": "Vinh",
        "dongXeTen": "Hyundai Accent",
        "phienBanTen": "1.5 AT Đặc Biệt",
        "hinhThuc": "Giá Lăn Bánh - Smart Calculator",
        "status": "new",
        "ghiChuSale": null,
        "createdAt": "2026-09-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
  ```

---

### 3. `PATCH /api/admin/leads/:id/status` (Cập Nhật Tiến Độ Tư Vấn)

* **Quyền hạn:** Yêu cầu quyền `leads:write` (`admin`, `manager`, `sales`).
* **Request Body:**
  ```json
  {
    "status": "contacted",
    "ghiChuSale": "Đã gọi điện tư vấn, khách hẹn sáng mai đến showroom lái thử bản AT Đặc Biệt.",
    "assignedUserId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```
* **Response 200 OK:**
  ```json
  {
    "success": true,
    "message": "Cập nhật trạng thái khách hàng thành công",
    "data": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "status": "contacted",
      "ghiChuSale": "Đã gọi điện tư vấn, khách hẹn sáng mai đến showroom lái thử bản AT Đặc Biệt.",
      "updatedAt": "2026-09-20T10:15:00.000Z"
    }
  }
  ```

---

## III. Ma Trận Mã Lỗi Hệ Thống (Unified Error Matrix)

| HTTP Code | Error Code | Ý Nghĩa Nghiệp Vụ | Giải Pháp Khắc Phục Ở Frontend |
| :---: | :--- | :--- | :--- |
| **400** | `VALIDATION_ERROR` | Dữ liệu form sai định dạng (tên ngắn, SĐT sai cú pháp). | Hiển thị thông báo lỗi dưới chân input vi phạm. |
| **400** | `DUMMY_PHONE_REJECTED` | Khách nhập số điện thoại rác/spam (`0900000000`). | Yêu cầu khách nhập số điện thoại thực tế. |
| **401** | `UNAUTHORIZED` | Phiên đăng nhập Admin hết hạn. | `apiClient` tự động xóa cookie và điều hướng về `/login`. |
| **403** | `FORBIDDEN` | Tài khoản không có quyền thao tác trên Lead. | Hiển thị màn hình 403 `AccessDenied`. |
| **404** | `LEAD_NOT_FOUND` | Bản ghi lead không tồn tại hoặc đã bị xóa. | Thông báo dữ liệu không còn tồn tại, tải lại danh sách. |
| **429** | `RATE_LIMIT_EXCEEDED` | Gửi quá 5 lead từ cùng 1 IP trong vòng 1 phút. | Hiển thị cảnh báo: "Bạn gửi quá nhanh, vui lòng chờ 1 phút". |
| **500** | `DATABASE_ERROR` | Lỗi kết nối cơ sở dữ liệu khi lưu lead. | Hiển thị thông báo lỗi thân thiện kèm Hotline gọi trực tiếp. |
