# 📜 Nhật Ký Thực Thi Kỹ Thuật (Phase 4: Execution Log)

> **Mã Epic:** `EPIC-PHASE-2-ADMIN-USER-RBAC`  
> **Chuyên gia thực hiện:** `fullstack-dev-executor`  
> **Trạng thái:** Bước 4.2 - Bắt đầu thực thi theo Function-Level Roadmap  
> **Mục tiêu:** Hiện thực hóa kiến trúc RBAC, quản trị người dùng, session revocation và audit trail theo chuẩn Senior Dev.

---

## 🗺️ DETAILED EXECUTION ROADMAP & FUNCTION-LEVEL DEPENDENCY SEQUENCE

- **Tác vụ đang thực thi:** `EPIC-PHASE-2-ADMIN-USER-RBAC` (Các User Stories US-2.1 đến US-2.6)
- **Tóm tắt Mục tiêu:** Mở rộng hệ thống quản lý tài khoản nhân viên Admin, phân quyền ma trận 4 vai trò (`admin`, `manager`, `editor`, `sales`), cơ chế thu hồi phiên tức thì qua `tokenVersion` trong PostgreSQL, bảng nhật ký kiểm toán Append-Only `audit_logs`, giao diện bảng quản trị nhân sự `/admin/users` và hồ sơ `/admin/profile`.

---

### 🔗 1. BACKEND DEPENDENCY CHAIN & FUNCTION BREAKDOWN

#### 📄 File 1: `packages/database/src/schema/users.ts` & `audit_logs.ts` (Sửa & Tạo mới)
* 💡 **Lý do làm trước:** Định nghĩa cấu trúc lưu trữ và quan hệ ORM nền tảng trong PostgreSQL.
* 🛠 **Danh sách Schemas & Enums cần viết:**
  * `userRoleEnum`: Mở rộng thêm `'manager'`, `'sales'` thành `['admin', 'manager', 'editor', 'sales']`.
  * `userStatusEnum`: Enum mới `['active', 'suspended', 'pending']`.
  * `users` table: Thêm các cột `status`, `lastLoginAt`, `lastLoginIp`.
  * `auditLogs` table: Bảng lưu vết Append-only gồm `id`, `userId`, `action`, `resource`, `resourceId`, `ipAddress`, `userAgent`, `details: jsonb`, `createdAt`.
  * B-Tree Indexes: `audit_logs_user_id_idx`, `audit_logs_action_idx`, `audit_logs_resource_idx`, `audit_logs_created_at_idx`.
  * 4-Step DB Sync: Migration DDL an toàn không khóa bảng (`ALTER TYPE`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).

#### 📄 File 2: `packages/types/src/permission.ts` & `user.ts` (Tạo mới & Mở rộng)
* 💡 **Lý do làm thứ hai:** Cung cấp Type-Safe Contracts, Zod Schemas và Permission Matrix dùng chung cho cả API và Frontend.
* 🛠 **Danh sách Functions / Types / Schemas cần viết:**
  * `Role`: Type `'admin' | 'manager' | 'editor' | 'sales'`.
  * `PermissionAction`: Type `'users:read' | 'users:create' | 'users:update' | 'users:delete' | 'users:role' | 'users:force_logout' | 'cars:*' | 'leads:*' | 'system:*'`.
  * `ROLE_PERMISSIONS`: Bản đồ ma trận ánh xạ từng Role ra danh sách quyền cố định.
  * `hasPermission(role: Role, action: PermissionAction): boolean`: Pure function kiểm tra quyền hạn tốc độ O(1).
  * `createUserSchema`: Validate payload tạo nhân sự mới (email chuẩn RFC, fullName, mật khẩu thỏa mãn 4 tiêu chí phức tạp, role).
  * `updateUserSchema`: Validate payload cập nhật nhân sự (fullName, phone, avatarUrl, role, status).
  * `changePasswordSchema`: Validate currentPassword, newPassword, confirmNewPassword.
  * `userResponseSchema`: DTO an toàn trả về client (**chặn 100% rò rỉ `passwordHash` - R3 Mitigation**).

#### 📄 File 3: `apps/api/src/middleware/rbac.ts` (Tạo mới)
* 💡 **Lý do làm thứ ba:** Lớp bảo vệ an ninh Gateway chặn đứng Privilege Escalation và Stale Sessions.
* 🛠 **Danh sách Middleware Functions cần viết:**
  * `requirePermission(action: PermissionAction)`:
    * 🧠 *Mental Model:* Trích xuất user từ `req.user` ➡️ Kiểm tra `hasPermission(user.role, action)` ➡️ Nếu false, ném lỗi `403 FORBIDDEN` (`INSUFFICIENT_PERMISSIONS`) ➡️ Chặn đứng nguy cơ nhân viên cấp dưới can thiệp cấu hình hoặc API quản trị.
  * `verifyTokenVersion`:
    * 🧠 *Mental Model:* So khớp claim `tokenVersion` trong JWT với giá trị hiện tại trong PostgreSQL ➡️ Đồng thời kiểm tra `status === 'active'` ➡️ Nếu lệch hoặc user bị suspended, lập tức trả về `401 TOKEN_REVOKED` / `403 ACCOUNT_SUSPENDED` ➡️ Đảm bảo vô hiệu hóa phiên ngay lập tức khi bị khóa tài khoản hoặc ép đăng xuất.

#### 📄 File 4: `apps/api/src/services/audit.service.ts` (Tạo mới)
* 💡 **Lý do làm thứ tư:** Cung cấp dịch vụ ghi nhận kiểm toán tự động, bất biến cho các endpoints.
* 🛠 **Danh sách Functions cần viết:**
  * `recordAuditLog(db, { userId, action, resource, resourceId, ipAddress, userAgent, details })`: Ghi một dòng mới vào bảng `audit_logs`, khử ký tự xuống dòng log injection.

#### 📄 File 5: `apps/api/src/routes/admin/users.ts` & `profile.ts` (Tạo mới)
* 💡 **Lý do làm thứ năm:** Tiếp nhận HTTP requests, điều phối nghiệp vụ CRUD nhân viên và thông tin cá nhân.
* 🛠 **Danh sách Endpoints & Logic bảo vệ cần viết:**
  * `GET /api/admin/users`: Lấy danh sách nhân viên có phân trang, lọc theo role, status, tìm kiếm theo email/tên.
  * `POST /api/admin/users`: Tạo nhân viên mới, băm mật khẩu bcrypt cost 12, ghi log `USER_CREATED`.
  * `GET /api/admin/users/:id`: Lấy chi tiết nhân viên (loại bỏ passwordHash).
  * `PUT /api/admin/users/:id`: Cập nhật thông tin nhân viên, ghi log `USER_UPDATED`.
  * `PATCH /api/admin/users/:id/status`: Khóa/mở khóa tài khoản.
    * 🧠 *Mental Model (R2 Protection):* Kiểm tra `currentUser.id === targetUser.id` ➡️ Nếu trùng thì từ chối `400 CANNOT_SUSPEND_SELF`.
  * `PATCH /api/admin/users/:id/role`: Cập nhật vai trò.
    * 🧠 *Mental Model (R2 & R7 Protection):* Kiểm tra không cho tự hạ quyền chính mình; dùng Transaction kiểm tra `SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active'` đảm bảo luôn còn tối thiểu 1 active admin.
  * `POST /api/admin/users/:id/force-logout`: Tăng `tokenVersion = tokenVersion + 1`, ghi log `USER_FORCE_LOGOUT`.
  * `DELETE /api/admin/users/:id`: Xóa tài khoản; chặn tự xóa chính mình và chặn xóa admin cuối cùng.
  * `GET /api/admin/profile`: Lấy profile của user đang đăng nhập.
  * `PUT /api/admin/profile`: Cập nhật profile (fullName, phone, avatarUrl - cấm sửa role/status).
  * `POST /api/admin/profile/change-password`: Xác thực mật khẩu cũ, cập nhật mật khẩu mới, tăng `tokenVersion` để hủy các phiên đăng nhập khác.

---

### 🎨 2. FRONTEND DEPENDENCY CHAIN & COMPONENT BREAKDOWN

#### 📄 File 6: `apps/admin/lib/permissions.ts` (Tạo mới)
* 💡 **Lý do làm trước ở FE:** Cung cấp hàm kiểm tra quyền cho toàn bộ client components.
* 🛠 **Hàm cần viết:**
  * `canUser(user, action)`: Đọc `user.role` từ auth context và gọi `hasPermission`.

#### 📄 File 7: `apps/admin/services/user.service.ts` (Tạo mới)
* 💡 **Lý do làm thứ hai ở FE:** Centralized Typed API Client tuân thủ nguyên tắc không gọi fetch/axios trực tiếp trong UI components.
* 🛠 **Danh sách API Methods:**
  * `getUsers(params)`, `getUserById(id)`, `createUser(data)`, `updateUser(id, data)`, `updateUserStatus(id, status)`, `updateUserRole(id, role)`, `forceLogoutUser(id)`, `deleteUser(id)`, `getProfile()`, `updateProfile(data)`, `changePassword(data)`.

#### 📄 File 8: `apps/admin/app/users/components/UserTableSkeleton.tsx` (Tạo mới)
* 💡 **Lý do làm thứ ba ở FE:** Xây dựng trạng thái Loading chuẩn Zero-CLS Shimmer theo SOP UI (v2.2.4).
* 🛠 **Component:** `<UserTableSkeleton />` render 5 dòng skeleton đồng nhất kích thước với bảng thật (`h-11`, `px-4`, `py-2.5`).

#### 📄 File 9: `apps/admin/app/users/components/UserFormModal.tsx` (Tạo mới)
* 💡 **Lý do làm thứ tư ở FE:** Modal Form thêm mới / chỉnh sửa nhân sự.
* 🛠 **Component:** `<UserFormModal />` hỗ trợ 2 chế độ `create` và `edit`, validate form bằng Zod, 100% Named Export, Lucide icons, WCAG AAA Reduced Motion.

#### 📄 File 10: `apps/admin/app/users/page.tsx` (Tạo mới)
* 💡 **Lý do làm thứ năm ở FE:** Lắp ráp màn hình quản trị người dùng hoàn chỉnh.
* 🛠 **View & Interaction States:**
  * Search Bar (debounce), Role Filter Tabs, Status Dropdown.
  * Bảng Data-table hiển thị đầy đủ avatar, tên, email, role badge, status badge, last login time.
  * Action Menu: Quick Status Toggle, Force Logout, Edit, Delete (sử dụng `ConfirmModal` dùng chung).
  * Đầy đủ 4 trạng thái: Loading (Skeleton), Empty, Error, Normal.

#### 📄 File 11: `apps/admin/app/profile/page.tsx` (Tạo mới)
* 💡 **Lý do làm thứ sáu ở FE:** Màn hình quản lý hồ sơ cá nhân và tab đổi mật khẩu.
* 🛠 **View:** Form thông tin cá nhân (họ tên, email read-only, số điện thoại, avatar) và Form đổi mật khẩu bảo mật (kiểm tra 3 trường, toggle hiện/ẩn mật khẩu).

#### 📄 File 12: `apps/admin/app/components/AdminShell.tsx` (Cập nhật)
* 💡 **Lý do làm cuối cùng ở FE:** Cập nhật menu navigation Sidebar.
* 🛠 **Cập nhật:** Bổ sung mục "Tài khoản nhân sự" (`/users`) với icon `Users`, ẩn mục này nếu user không có quyền `users:read`.

---

### 📋 3. DANH MỤC KIỂM THỬ TỪNG HÀM (FUNCTION-LEVEL TEST CASES)

- [ ] **Matrix Test:** `hasPermission('admin', 'users:delete') === true` & `hasPermission('sales', 'users:delete') === false`.
- [ ] **DTO Test:** `createUserSchema` báo lỗi khi thiếu ký tự đặc biệt trong mật khẩu hoặc sai định dạng email.
- [ ] **DTO Test:** `updateProfileSchema` từ chối nếu có trường `role` hoặc `status`.
- [ ] **Sanitization Test:** Response từ `GET /api/admin/users` không chứa cột `passwordHash`.
- [ ] **RBAC Guard Test:** User role `sales` gọi `GET /api/admin/users` trả về HTTP `403 FORBIDDEN`.
- [ ] **Anti-Self-Lockout Test:** Admin tự xóa chính mình trả về HTTP `400 CANNOT_DELETE_SELF`.
- [ ] **Last Admin Test:** Xóa admin duy nhất còn lại trả về HTTP `400 LAST_ADMIN_CANNOT_BE_DELETED`.
- [ ] **Token Revocation Test:** Tăng `tokenVersion` khiến token cũ bị từ chối với HTTP `401 TOKEN_REVOKED`.
- [ ] **Audit Trail Test:** Tạo user mới sinh bản ghi `USER_CREATED` tương ứng trong bảng `audit_logs`.
- [ ] **CLI Verification Script:** Chạy `pnpm --filter @cardealer/api exec tsx scripts/verify-phase-2-rbac.ts` kết thúc với `exit 0`.

---

## 🛠 SENIOR PRE-CODING CHECKLIST (12 TIÊU CHÍ CHẤT LƯỢNG)

- [x] **1. Quét Codebase Convention:** Đã kiểm tra convention của `packages/database`, `packages/types`, `apps/api`, `apps/admin`.
- [x] **2. Roadmap Announcement Check:** Đã xuất bản chi tiết bảng Function-Level Roadmap phía trên.
- [x] **3. Tái sử dụng & Scalability Check:** Tái sử dụng `ConfirmModal`, `AdminShell`; áp dụng Shared Primitives.
- [x] **4. SRP & File Length Guard (< 300 lines):** Toàn bộ file tách nhỏ theo từng chức năng độc lập dưới 250 dòng.
- [x] **5. Anti-Reward Hacking Cam kết:** Giữ nguyên 100% test cases R1–R17 từ `TEST_PLAN.md`.
- [x] **6. Self-Correction Guardrail:** Thiết lập bộ đếm 3-Strike cho verification script.
- [x] **7. Zero Hardcode & Strict Typing:** Zero `any`, Zod DTO validation, DB Transactions có row lock.
- [x] **8. Mental Model Comment Rule:** Cam kết chèn comment `// 🧠 Mental Model: <Lý do>` phía trên các khối logic phức tạp.
- [x] **9. Logging & Security Sanitization:** Khử `\r\n` log injection, không log mật khẩu/token.
- [x] **10. UI & Design System Conformance:** Tuân thủ triệt để SOP UI (v2.2.4): 100% Named Export, Lucide icons, Reduced Motion, Zero Arbitrary Values, 4-State UI.
- [x] **11. Centralized API Client & Error Handling:** Không gọi fetch trực tiếp trong component; toàn bộ đi qua `user.service.ts` và HTTP client tập trung.
- [x] **12. Type-Safe Environment Check:** Không đọc `process.env` bừa bãi trong logic code.

---

*Biên bản được khởi tạo và lưu trữ lâu dài phục vụ kiểm soát chất lượng Giai đoạn 4.*
