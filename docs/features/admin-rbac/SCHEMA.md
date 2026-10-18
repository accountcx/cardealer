# 🗄️ SCHEMA: Admin User & Role-Based Access Control (RBAC)

> **Module:** `admin-rbac`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), `packages/database/src/schema/users.ts`, `audit_logs.ts`, `packages/types/src/permission.ts`  

---

## 1. Mô Hình Thực Thể Thực Tế (Database Tables)

### 🔹 Bảng `users` (Tài Khoản Nhân Viên Quản Trị)
```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'editor', 'sales');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role user_role DEFAULT 'admin' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    token_version INTEGER DEFAULT 1 NOT NULL,
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_role_status_idx ON users (role, status);
```

### 🔹 Bảng `audit_logs` (Nhật Ký Kiểm Toán An Ninh Bất Biến)
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX audit_logs_user_id_idx ON audit_logs (user_id);
CREATE INDEX audit_logs_action_idx ON audit_logs (action);
CREATE INDEX audit_logs_resource_idx ON audit_logs (resource);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at);
```

---

## 2. Ma Trận Quyền Hạn Chi Tiết (Role Permissions Matrix)

| Quyền Hạn (Permission Action) | admin | manager | editor | sales |
| :--- | :---: | :---: | :---: | :---: |
| `users:read`, `users:update` | ✅ | ✅ (Xem & đổi tên) | ❌ | ❌ |
| `users:create`, `users:delete`, `users:role` | ✅ | ❌ | ❌ | ❌ |
| `users:force_logout` | ✅ | ❌ | ❌ | ❌ |
| `cars:read`, `cars:write` | ✅ | ✅ | ✅ | Xem: ✅ / Ghi: ❌ |
| `posts:read`, `posts:write` | ✅ | ✅ | ✅ | Xem: ✅ / Ghi: ❌ |
| `leads:read`, `leads:write` | ✅ | ✅ | ❌ | ✅ |
| `leads:delete` | ✅ | ✅ | ❌ | ❌ |
| `system:read`, `system:write` | ✅ | Xem: ✅ / Ghi: ❌ | ❌ | ❌ |
| `media:read`, `media:write`, `media:delete` | ✅ | ✅ | Đọc/Ghi: ✅ / Xóa: ❌ | Đọc: ✅ |
| `pages:read`, `pages:write`, `pages:delete` | ✅ | ✅ | Đọc/Ghi: ✅ / Xóa: ❌ | ❌ |

---

## 3. Ma Trận Chuyển Trạng Thái Tài Khoản (State Transition Matrix)

| Trạng Thái Ban Đầu | Hành Động Kích Hoạt | Trạng Thái Đích | Điều Kiện Hợp Lệ |
| :--- | :--- | :--- | :--- |
| `active` | Khóa tài khoản (Suspend) | `suspended` | Thực hiện bởi Admin; tăng `token_version` để thu hồi phiên |
| `suspended` | Mở khóa tài khoản (Activate) | `active` | Thực hiện bởi Admin; ghi nhận Audit Trail |
| `pending` | Đổi mật khẩu lần đầu | `active` | Mật khẩu mới thỏa mãn độ dài tối thiểu 8 ký tự |
| `active` | Yêu cầu đổi mật khẩu | `pending` | Tự kích hoạt hoặc do Admin yêu cầu reset |
