# 📋 BACKLOG: Admin User & Role-Based Access Control (RBAC)

> **Module:** `admin-rbac`  
> **Phiên bản:** `v1.0.0`  

---

## 1. Danh Sách Lát Cắt Dọc Nghiệp Vụ (Vertical Slices)

### 🔹 US-01: Xác Thực JWT & Thu Hồi Phiên Tức Thì (Authentication & Instant Revocation)
- **Actor:** Mọi nhân viên showroom đăng nhập vào hệ thống quản trị.
- **Mô tả:** Đăng nhập an toàn bằng Email & Mật khẩu mã hóa Bcrypt, cấp JWT token có chứa `tokenVersion`. Nếu `tokenVersion` trên DB bị tăng, token lập tức bị từ chối.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 1.1: Đăng nhập thành công với mật khẩu đúng**
    - *Given:* Tài khoản có trạng thái `active` và mật khẩu khớp hash Bcrypt.
    - *When:* Gửi yêu cầu đăng nhập tại `POST /api/auth/login`.
    - *Then:* Trả về HTTP 200 kèm JWT token, ghi nhận `lastLoginAt`, `lastLoginIp` và ghi nhật ký `LOGIN_SUCCESS` vào `audit_logs`.
  - **Scenario 1.2: Từ chối tài khoản bị đình chỉ (Suspended)**
    - *Given:* Tài khoản có trạng thái `suspended`.
    - *When:* Người dùng nhập đúng email và mật khẩu.
    - *Then:* Hệ thống từ chối đăng nhập với HTTP 403 Forbidden (Tài khoản đang bị tạm khóa).

---

### 🔹 US-02: Quản Trị Nhân Viên & Phân Quyền Đa Tầng (Admin User CRUD & RBAC)
- **Actor:** Quản trị viên tối cao (`admin`).
- **Mô tả:** Tạo tài khoản nhân viên mới, gán vai trò (`manager`, `editor`, `sales`), cập nhật thông tin và thực hiện khóa tài khoản hoặc thu hồi phiên từ xa.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 2.1: Phân quyền vai trò mới**
    - *Given:* Admin thực hiện đổi vai trò của user từ `sales` lên `manager`.
    - *When:* Gửi `PATCH /api/admin/users/:id/role`.
    - *Then:* Cập nhật vai trò, ghi Audit Trail và tăng `tokenVersion` để buộc user đăng nhập lại với quyền mới.
  - **Scenario 2.2: Chặn tài khoản không có quyền thực hiện**
    - *Given:* Nhân viên có vai trò `sales`.
    - *When:* Gửi yêu cầu xóa hoặc đổi vai trò của nhân viên khác.
    - *Then:* Middleware chặn lại với mã lỗi HTTP 403 Forbidden.
