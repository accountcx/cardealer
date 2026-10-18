# 🌐 API SPECIFICATION: Admin User & Role-Based Access Control (RBAC)

> **Module:** `admin-rbac`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Authentication Endpoints

### 🔹 `POST /api/auth/login`
- **Mục đích:** Xác thực đăng nhập người dùng quản trị.
- **Request Body:**
  ```json
  {
    "email": "admin@xehyundaivinh.com",
    "password": "SecurePassword123!"
  }
  ```
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
          "id": "u1a2b3c4-...",
          "email": "admin@xehyundaivinh.com",
          "fullName": "Quản Trị Viên",
          "role": "admin",
          "avatarUrl": "https://..."
        }
      }
    }
    ```
  - **`401 Unauthorized`**: Sai thông tin tài khoản hoặc mật khẩu.
  - **`403 Forbidden`**: Tài khoản đang ở trạng thái `suspended`.

---

## 2. User Management Endpoints (Admin Protected)

### 🔹 `GET /api/admin/users`
- **Headers:** `Authorization: Bearer <token>` (Yêu cầu quyền `users:read`)
- **Query Parameters:** `page`, `limit`, `role`, `status`
- **Responses:**
  - **`200 OK`**: Danh sách tài khoản nhân viên (ẩn trường `passwordHash`).

---

### 🔹 `POST /api/admin/users`
- **Headers:** `Authorization: Bearer <token>` (Yêu cầu quyền `users:create`)
- **Request Body:**
  ```json
  {
    "email": "sales1@xehyundaivinh.com",
    "password": "Password123!",
    "fullName": "Nguyễn Văn B",
    "phone": "0981234567",
    "role": "sales"
  }
  ```
- **Responses:**
  - **`201 Created`**: Tạo nhân viên mới thành công.
  - **`409 Conflict`**: Email đã được sử dụng.

---

### 🔹 `POST /api/admin/users/:id/force-logout`
- **Headers:** `Authorization: Bearer <token>` (Yêu cầu quyền `users:force_logout`)
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "u1a2b3c4-...",
        "message": "Đã thu hồi phiên đăng nhập từ xa thành công"
      }
    }
    ```
