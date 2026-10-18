# ⚠️ RISK AUDIT: Admin User & Role-Based Access Control (RBAC)

> **Module:** `admin-rbac`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Phân Tích Bán Kính Tác Động (Blast Radius Analysis)

- **Các phân hệ phụ thuộc:**
  - `apps/api`: Toàn bộ các route `/api/admin/*` đều phụ thuộc vào JWT Middleware và `hasPermission(role, action)`.
  - `lead-management`: Phân quyền `leads:delete` chặn `sales` và chỉ cho phép `admin`/`manager`.
  - `catalog-management`: Phân quyền `cars:write` chỉ cho phép `admin`/`manager`/`editor`.
  - `content-management`: Phân quyền `posts:write` bảo vệ các bài viết SEO.

---

## 2. Rà Soát Điểm Yếu An Ninh & Rủi Ro Tiềm Ẩn

| Mã Rủi Ro | Phân Loại | Kịch Bản Rủi Ro | Biện Pháp Phòng Ngừa Đã Thực Thi |
| :---: | :--- | :--- | :--- |
| **R-01** | Privilege Escalation | Nhân viên tự sửa role của mình thành `admin` qua API | Endpoint `PATCH /api/admin/users/:id/role` bắt buộc kiểm tra quyền `users:role` (chỉ Admin tối cao có quyền) |
| **R-02** | Stale Token / BOLA | Nhân viên bị sa thải hoặc bị đổi vai trò nhưng token cũ vẫn còn hiệu lực | Cơ chế `tokenVersion` trên bảng `users` tự động tăng khi đổi role hoặc khóa tài khoản |
| **R-03** | Brute Force Login | Tấn công dò quét mật khẩu quản trị viên | Hạn chế tần suất đăng nhập (Rate limiting) và ghi log kiểm toán IP bất thường |
| **R-04** | Password Leak | Lộ mật khẩu thô trong response hoặc log | Hash Bcrypt salt 10, loại bỏ hoàn toàn trường `passwordHash` khỏi các DTO trả về client |

---

## 3. Kế Hoạch Phục Hồi & Rollback Khẩn Cấp (Rollback Strategy)

1. **Khôi phục tài khoản Admin tối cao:** Nếu mất quyền truy cập Admin, chạy script nạp lại tài khoản mặc định: `pnpm --filter @cardealer/database db:seed`.
2. **Khóa khẩn cấp toàn bộ phiên:** Tăng `tokenVersion` của toàn bộ nhân viên qua câu lệnh SQL: `UPDATE users SET token_version = token_version + 1`.
