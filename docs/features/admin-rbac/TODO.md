# 📝 TODO: Admin User & Role-Based Access Control (RBAC)

- [x] **US-01: Authentication & Token Revocation**
  - [x] Thiết kế bảng `users` với `role`, `status`, `token_version` trong `packages/database`.
  - [x] Triển khai mã hóa mật khẩu Bcrypt với salt rounds 10.
  - [x] Viết route `POST /api/auth/login` và middleware xác thực JWT Bearer trong `apps/api/src/routes/auth.ts`.
  - [x] Xây dựng trang đăng nhập Admin trong `apps/admin/app/login/page.tsx`.

- [x] **US-02: User Management & RBAC Permissions**
  - [x] Khai báo ma trận `ROLE_PERMISSIONS` cố định trong `packages/types/src/permission.ts`.
  - [x] Xây dựng các routes CRUD quản lý nhân viên trong `apps/api/src/routes/admin/users.ts`.
  - [x] Bổ sung chức năng `force-logout` tăng `token_version` lập tức.
  - [x] Bảng `audit_logs` lưu vết Append-only mọi hành động quản trị viên.
  - [x] Giao diện quản lý nhân viên & đổi vai trò trong `apps/admin/app/users/page.tsx`.
