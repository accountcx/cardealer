# 🔄 FLOW: Admin User & Role-Based Access Control (RBAC)

> **Module:** `admin-rbac`  
> **Tài liệu tham chiếu:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md)  

---

## 1. Sơ Đồ Trạng Thái Tài Khoản (User Status State Machine)

```mermaid
stateDiagram-v2
    [*] --> Active : Tạo tài khoản & kích hoạt
    Active --> Suspended : Admin khóa tài khoản (Force Logout)
    Suspended --> Active : Admin mở khóa tài khoản
    Active --> Pending : Yêu cầu đổi mật khẩu lần đầu
    Pending --> Active : Đổi mật khẩu thành công
    Suspended --> [*] : Xóa tài khoản
```

---

## 2. Sequence Diagram: Đăng Nhập & Thu Hồi Phiên Đăng Nhập

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Nhân Viên Quản Trị
    participant AdminApp as Admin Portal (apps/admin)
    participant Backend as Backend API (apps/api)
    participant DB as PostgreSQL Database

    Staff->>AdminApp: Nhập Email & Mật khẩu
    AdminApp->>Backend: POST /api/auth/login { email, password }
    Backend->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Backend: User Row (passwordHash, status, tokenVersion)
    
    alt Tài khoản bị khóa (status = 'suspended')
        Backend-->>AdminApp: HTTP 403 Forbidden (Tài khoản đang bị tạm khóa)
    else Mật khẩu không đúng
        Backend-->>AdminApp: HTTP 401 Unauthorized (Sai email hoặc mật khẩu)
    else Hợp lệ
        Backend->>Backend: Sinh JWT Token chứa { id, role, tokenVersion }
        Backend->>DB: UPDATE users SET lastLoginAt = NOW(), lastLoginIp = ?
        Backend->>DB: INSERT INTO audit_logs (LOGIN_SUCCESS)
        Backend-->>AdminApp: HTTP 200 OK { token, user: { id, email, role } }
        AdminApp-->>Staff: Chuyển hướng vào Admin Dashboard
    end
```

---

## 3. Sequence Diagram: Kiểm Tra RBAC & Thu Hồi Phiên (Force Logout)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên (Admin)
    participant AdminApp as Admin Portal (apps/admin)
    participant Backend as Backend API (apps/api)
    participant DB as PostgreSQL Database

    Admin->>AdminApp: Bấm nút "Đăng Xuất Từ Xa" tài khoản nhân viên
    AdminApp->>Backend: POST /api/admin/users/:id/force-logout
    Backend->>Backend: Verify Admin Token & check 'users:force_logout'
    Backend->>DB: UPDATE users SET tokenVersion = tokenVersion + 1 WHERE id = ?
    Backend->>DB: INSERT INTO audit_logs (FORCE_LOGOUT)
    Backend-->>AdminApp: HTTP 200 OK { message: "Đã thu hồi phiên thành công" }

    Note over Backend,DB: Khi nhân viên bị force-logout gửi request tiếp theo:
    Backend->>DB: Query user.tokenVersion
    Backend->>Backend: So sánh token.tokenVersion (cũ) < db.tokenVersion (mới)
    Backend-->>AdminApp: HTTP 401 Unauthorized (Token invalidated)
```
