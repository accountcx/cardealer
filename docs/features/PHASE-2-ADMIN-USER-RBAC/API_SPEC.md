# 📡 Đặc Tả Giao Diện Lập Trình REST API (API_SPEC.md)
## PHASE 2 - ADMIN USER & RBAC MANAGEMENT

> **Role:** `feature-spec-generator`  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`SCHEMA.md`](./SCHEMA.md), [`FLOW.md`](./FLOW.md)  
> **Chuẩn giao tiếp:** RESTful JSON Envelope (`{ success, data, error }`)

---

## 1. Quy Chuẩn Phản Hồi Dữ Liệu (Standard Response Envelope)

### 1.1. Phản Hồi Thành Công (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### 1.2. Phản Hồi Thất Bại (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE_UPPERCASE",
    "message": "Thông báo lỗi bằng tiếng Việt rõ ràng, dễ hiểu"
  }
}
```

---

## 2. Ma Trận Quyền Hạn Endpoints (Permission Matrix by Route)

| Phương thức | Endpoint | Thẩm Quyền Tối Thiểu (RBAC) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/admin/users` | `admin` | Lấy danh sách nhân viên có phân trang, lọc theo role & status |
| `POST` | `/api/admin/users` | `admin` | Tạo mới tài khoản nhân viên showroom |
| `GET` | `/api/admin/users/:id` | `admin` | Lấy thông tin chi tiết của 1 nhân viên |
| `PUT` | `/api/admin/users/:id` | `admin` | Cập nhật họ tên, SĐT, phân công vai trò (role), trạng thái |
| `PUT` | `/api/admin/users/:id/status` | `admin` | Nút gạt nhanh Khóa / Mở khóa tài khoản (Force Logout tức thì) |
| `POST` | `/api/admin/users/:id/reset-password` | `admin` | Đặt lại mật khẩu tạm thời cho nhân viên |
| `DELETE` | `/api/admin/users/:id` | `admin` | Xóa tài khoản nhân viên (chặn tự xóa tài khoản của chính mình) |
| `GET` | `/api/admin/profile` | `admin`, `manager`, `editor`, `sales` | Xem hồ sơ cá nhân của tài khoản đang đăng nhập |
| `PUT` | `/api/admin/profile` | `admin`, `manager`, `editor`, `sales` | Cập nhật họ tên, SĐT, avatar cá nhân |
| `PUT` | `/api/admin/profile/change-password` | `admin`, `manager`, `editor`, `sales` | Đổi mật khẩu cá nhân (yêu cầu mật khẩu hiện tại) |
| `GET` | `/api/admin/audit-logs` | `admin` | Xem lịch sử nhật ký kiểm toán an ninh |

---

## 3. Đặc Tả Chi Tiết Từng Endpoint

### 3.1. `GET /api/admin/users` - Danh Sách Nhân Viên
* **Headers:** `Cookie: admin_token=<jwt>`
* **Query Parameters:**
  * `page` (number, default: 1)
  * `limit` (number, default: 20)
  * `role` (string, optional: `admin` | `manager` | `editor` | `sales`)
  * `status` (string, optional: `active` | `suspended` | `pending`)
  * `search` (string, optional: tìm kiếm theo họ tên hoặc email)
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "c1f7b889-4e68-45e0-9426-17b2b8d0e512",
        "email": "loan.nguyen@xehyundaivinh.com",
        "fullName": "Loan Nguyễn",
        "phone": "0931367767",
        "avatarUrl": "https://res.cloudinary.com/.../profile.webp",
        "role": "sales",
        "status": "active",
        "lastLoginAt": "2026-09-19T14:30:00.000Z",
        "createdAt": "2026-08-26T06:25:57.052Z"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "error": null
}
```

### 3.2. `POST /api/admin/users` - Tạo Tài Khoản Nhân Viên Mới
* **Request Body (Zod Validated):**
```json
{
  "email": "van.an@xehyundaivinh.com",
  "password": "Password123@",
  "fullName": "Nguyễn Văn An",
  "phone": "0912345678",
  "role": "sales",
  "status": "active"
}
```
* **Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "d2f8b889-4e68-45e0-9426-17b2b8d0e513",
    "email": "van.an@xehyundaivinh.com",
    "fullName": "Nguyễn Văn An",
    "phone": "0912345678",
    "role": "sales",
    "status": "active",
    "createdAt": "2026-09-20T00:15:00.000Z"
  },
  "error": null
}
```

### 3.3. `PUT /api/admin/users/:id/status` - Khóa / Mở Khóa Tài Khoản (Force Logout)
* **Request Body:**
```json
{
  "status": "suspended"
}
```
* **Xử lý đặc biệt (Anti-Self-Lockout):** Nếu `params.id === currentAdmin.id`, trả lỗi `400 Bad Request` với mã `CANNOT_SUSPEND_SELF`.
* **Side-effect:** Tự động tăng `tokenVersion = tokenVersion + 1` và ghi log vào `audit_logs`.
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "d2f8b889-4e68-45e0-9426-17b2b8d0e513",
    "status": "suspended",
    "message": "Tài khoản đã được chuyển sang trạng thái Đã Khóa và thu hồi phiên làm việc tức thì."
  },
  "error": null
}
```

### 3.4. `PUT /api/admin/profile/change-password` - Đổi Mật Khẩu Cá Nhân
* **Request Body:**
```json
{
  "currentPassword": "OldPassword123@",
  "newPassword": "NewSecurePassword456@"
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "Đổi mật khẩu thành công. Phiên làm việc đã được gia hạn an toàn."
  },
  "error": null
}
```

---

## 4. Bảng Tra Cứu Mã Lỗi Nghiệp Vụ (Error Code Matrix)

| Mã Lỗi (`code`) | HTTP Status | Thông Báo Hiển Thị Cho Người Dùng (`message`) |
| :--- | :---: | :--- |
| `UNAUTHORIZED` | 401 | Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại. |
| `SESSION_REVOKED` | 401 | Phiên làm việc đã bị thu hồi do thay đổi mật khẩu hoặc trạng thái tài khoản. |
| `ACCOUNT_SUSPENDED` | 403 | Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. |
| `FORBIDDEN` | 403 | Bạn không có quyền truy cập hoặc thực hiện thao tác này. |
| `EMAIL_ALREADY_EXISTS` | 409 | Địa chỉ email này đã được sử dụng bởi một tài khoản khác trong hệ thống. |
| `USER_NOT_FOUND` | 404 | Không tìm thấy thông tin nhân viên được yêu cầu. |
| `CANNOT_DELETE_SELF` | 400 | Bạn không thể tự xóa tài khoản của chính mình. |
| `CANNOT_SUSPEND_SELF` | 400 | Bạn không thể tự khóa tài khoản của chính mình. |
| `CANNOT_DEMOTE_LAST_ADMIN` | 400 | Không thể hạ quyền tài khoản Admin duy nhất đang hoạt động trong hệ thống. |
| `INVALID_CURRENT_PASSWORD` | 400 | Mật khẩu hiện tại không chính xác. |
| `PASSWORD_TOO_WEAK` | 400 | Mật khẩu mới phải có ít nhất 6 ký tự. |
