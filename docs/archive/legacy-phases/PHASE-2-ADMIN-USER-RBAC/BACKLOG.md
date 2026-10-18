# 🎯 Feature Backlog: PHASE 2 - ADMIN USER & RBAC MANAGEMENT

> **Mã Epic:** `EPIC-PHASE-2-ADMIN-USER-RBAC`  
> **Tài liệu nguồn tham chiếu:** [`docs/02-DATABASE-SCHEMA-PAYLOAD-CMS.md`](../../02-DATABASE-SCHEMA-PAYLOAD-CMS.md), [`docs/06-PHASED-IMPLEMENTATION-ROADMAP.md`](../../06-PHASED-IMPLEMENTATION-ROADMAP.md), [`docs/SYSTEM_MAP.md`](../../SYSTEM_MAP.md)  
> **Quy chuẩn thực thi:** **Universal Agentic Workflow (v2.1)** — Giai đoạn 1: Phân tích Chiến lược & Lập Backlog

---

## 1. Thông Tin Tổng Quan & Phân Vùng Chiến Lược

* **Mục tiêu Chiến lược:** Xây dựng phân hệ Quản trị Tài khoản Nhân viên nội bộ (`Admin User Management`), Phân quyền Đa tầng (RBAC - Role-Based Access Control) 4 vai trò (`admin`, `manager`, `editor`, `sales`), Nhật ký Kiểm toán An ninh (`audit_logs`), Trang Hồ sơ cá nhân (`/admin/profile`) và Cơ chế Thu hồi Phiên đăng nhập tức thì (`Revoke Session / Force Logout`).
* **Phạm vi Nền tảng (Target Platform & Scope):** ⚙️ **Full-stack Monorepo**
  * `packages/database`: Mở rộng bảng `users`, tạo bảng mới `audit_logs`, migrations Drizzle ORM.
  * `packages/types`: Bổ sung Zod Schemas & DTOs cho User CRUD, Role Permissions, Profile Update, Audit Logs.
  * `apps/api`: REST APIs quản trị nhân viên (`/api/admin/users/*`), RBAC Middleware guards, API đổi mật khẩu và ghi nhận Audit Trail.
  * `apps/admin`: Giao diện Quản lý nhân viên (`/users`), Form modal thêm/sửa, Hồ sơ cá nhân (`/profile`), Nhật ký an ninh (`/audit-logs`), bảo vệ giao diện theo vai trò (Role-based Navigation & Actions).
* **Cấp độ Thực thi (Execution Tier):** **Tier 1 (Core Architecture & Security / Full 5-Phase Playbook)** do tác động trực tiếp đến an ninh xác thực, phân quyền và dữ liệu người dùng.
* **Trạng thái Môi trường:** 🟢 **Pure Development** (Tự do thiết kế và migration schema tối ưu nhất trên PostgreSQL).
* **Múi giờ & Định dạng Chuẩn:**
  * Locale: `vi-VN`.
  * Múi giờ: `Asia/Ho_Chi_Minh` (`TIMESTAMPTZ` UTC trong DB).

---

## 2. Danh Sách User Stories Chi Tiết (Lifecycle Status Matrix)

| ID | User Story / Nhiệm Vụ Kỹ Thuật | Nền Tảng (Layer) | Vai Trò Hưởng Lợi | Trạng Thái | Cửa Chặn Hiện Tại | File / Package Tác Động Dự Kiến |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **US-2.1** | **User Entity & Audit Schema Expansion:** Mở rộng bảng `users` (thêm `role` 4 cấp, `status`, `lastLoginAt`, `lastLoginIp`) và tạo bảng `audit_logs` ghi nhận lịch sử hành vi nhạy cảm | Database | System / DBA | 🔄 IN PROGRESS | Gate 1 | `packages/database/src/schema/users.ts`, `audit_logs.ts` |
| **US-2.2** | **RBAC Contracts & Zod Schemas:** Định nghĩa Zod schemas cho 4 vai trò (`admin`, `manager`, `editor`, `sales`), DTOs danh sách nhân viên, tạo mới, cập nhật, đổi mật khẩu và permission matrix | Types | Full-stack | ⏸️ QUEUED | Pending Step 2.1 | `packages/types/src/auth.ts`, `user.ts` |
| **US-2.3** | **REST APIs Quản Trị User & RBAC Middleware:** Xây dựng bộ REST endpoints `/api/admin/users/*`, route guard `requireRole(['admin'])`, middleware ghi nhận audit logs | Backend API | Admin / SecOps | ⏸️ QUEUED | Pending Step 2.2 | `apps/api/src/routes/admin/users.ts`, `apps/api/src/auth.ts` |
| **US-2.4** | **API Profile Cá Nhân & Cơ Chế Thu Hồi Phiên (Revoke Session):** API `/api/admin/profile`, đổi mật khẩu cá nhân, tăng `tokenVersion` để vô hiệu hóa toàn bộ token cũ khi bị khóa hoặc đổi mật khẩu | Auth + Security | All Staff | ⏸️ QUEUED | Pending Gate 3 | `apps/api/src/routes/admin/profile.ts` |
| **US-2.5** | **Giao Diện Quản Lý Nhân Viên (`/admin/users`):** Bảng danh sách nhân viên, lọc vai trò, lọc trạng thái, modal thêm/sửa, nút khóa/mở khóa tức thì (Optimistic UI), Zero-CLS Skeleton loader | Admin Portal | Super Admin | ⏸️ QUEUED | Pending Gate 4 | `apps/admin/app/users/` |
| **US-2.6** | **Giao Diện Hồ Sơ Cá Nhân (`/admin/profile`) & Phân Quyền Navigation Shell:** Trang đổi mật khẩu cá nhân, cập nhật avatar/SĐT, ẩn các menu không thuộc thẩm quyền của vai trò hiện tại | Admin Portal | All Staff | ⏸️ QUEUED | Pending Gate 4 | `apps/admin/app/profile/`, `apps/admin/app/components/AdminShell.tsx` |

---

## 3. Phân Tích 6 Lăng Kính Phản Biện Nghiệp Vụ (Brainstorming Session)

### 0. Lăng kính Phân vùng & Bảo mật (Platform Boundary & Security Guard)
* **Nguyên tắc Đặc quyền Tối thiểu (Principle of Least Privilege - PoLP):**
  * Chỉ tài khoản có `role: 'admin'` mới có quyền truy cập module Quản trị người dùng (`/admin/users`) và Cấu hình Showroom (`/admin/settings`).
  * Nhân viên vai trò `sales` hoặc `editor` nếu cố tình gọi API `/api/admin/users` hoặc `/api/admin/settings` sẽ bị chặn ở cả 2 tầng: Next.js Client Redirect và Express/API Middleware trả mã `403 Forbidden`.
* **Phòng Chống Leo Quyền (Anti-Privilege Escalation):**
  * Nhân viên không thể tự nâng role của mình thông qua API update profile.
  * Chỉ `admin` mới được phân quyền role cho người khác trong payload update user.
* **Chống Tự Khóa / Tự Xóa (Anti-Self-Lockout & Anti-Self-Deletion):**
  * Admin đang đăng nhập **TUYỆT ĐỐI KHÔNG** được phép tự xóa tài khoản của chính mình hoặc tự hạ quyền của chính mình thành vai trò thấp hơn.
  * Hệ thống luôn bảo đảm còn **ít nhất 1 tài khoản Admin đang hoạt động** (`status = active`).

### 1. Lăng kính Vòng đời & Máy trạng thái Người Dùng (User Lifecycle & State Machine)
* **Vòng đời tài khoản:**
  ```text
  [Tạo mới] ➡️ 'pending' (Chờ kích hoạt / đổi pass lần đầu) 
           ➡️ 'active' (Đang hoạt động) 
           ➡️ 'suspended' (Bị khóa tạm thời do vi phạm hoặc nghỉ việc)
  ```
* **Cơ chế Thu hồi Phiên (Instant Session Revocation):**
  * Khi Admin bấm "Khóa tài khoản" hoặc "Reset mật khẩu" của một nhân viên, hệ thống lập tức tăng trường `tokenVersion = tokenVersion + 1` trong DB.
  * Khi JWT của nhân viên đó gửi lên ở request kế tiếp, middleware phát hiện `payload.tokenVersion < db.tokenVersion` ➡️ Ngắt phiên làm việc ngay lập tức, bắt buộc đăng xuất (Force Logout).

### 2. Lăng kính Ma Trận Phân Quyền 4 Vai Trò (RBAC Matrix)

| Quyền Hạn / Tính Năng | Admin (Toàn quyền) | Manager (Quản lý Showroom) | Editor (Biên tập viên) | Sales (Tư vấn viên) |
| :--- | :---: | :---: | :---: | :---: |
| **Quản lý Dòng xe & Bảng màu (`/cars`, `/colors`)** | Toàn quyền (CRUD) | Toàn quyền (CRUD) | Chỉ Xem & Sửa nội dung | Chỉ Xem |
| **Cấu hình Showroom (`/settings`)** | Toàn quyền | Chỉ Xem | ❌ Không có quyền | ❌ Không có quyền |
| **Quản lý Nhân viên & Phân quyền (`/users`)** | Toàn quyền | Chỉ Xem | ❌ Không có quyền | ❌ Không có quyền |
| **Quản trị Lead & Khách hàng (Phase 3)** | Toàn quyền | Phân công Lead | ❌ Không có quyền | Xử lý Lead được giao |
| **Bài viết & Content Blocks (Phase 5)** | Toàn quyền | Duyệt xuất bản | Soạn thảo (CRUD) | ❌ Không có quyền |
| **Hồ sơ cá nhân & Đổi mật khẩu (`/profile`)** | ✅ Có | ✅ Có | ✅ Có | ✅ Có |

### 3. Lăng kính Xung đột & Trùng lặp (Collision & Uniqueness)
* `users.email`: Bắt buộc Unique Index, chuẩn hóa chữ thường (`lowercase`) và cắt bỏ khoảng trắng (`trim`).
* `users.phone`: Format chuẩn số điện thoại Việt Nam (10 chữ số), kiểm tra không trùng lặp giữa các nhân viên để tiện gán hotline tư vấn viên.

### 4. Lăng kính Kiểm toán & Truy vết An ninh (Audit Trail)
* Mọi hành động nhạy cảm trong hệ thống bắt buộc ghi nhận vào bảng `audit_logs`:
  * `LOGIN_SUCCESS`, `LOGIN_FAILED` (kèm IP, User-Agent để phát hiện Brute-force).
  * `CREATE_USER`, `UPDATE_USER_ROLE`, `SUSPEND_USER`, `RESET_PASSWORD`.
  * `DELETE_CAR`, `UPDATE_PRICE`, `CHANGE_CAR_STATUS`.
* Bảng `audit_logs` là bảng Append-only (chỉ ghi thêm, không cho phép API nào sửa hay xóa log để đảm bảo tính khách quan pháp lý).

### 5. Lăng kính Trải nghiệm Người dùng (UX & Zero-CLS)
* Sử dụng Design System `@cardealer/ui` (chuẩn luxury dark theme đồng bộ với `/cars` và `/colors`).
* Trang `/admin/users` trang bị **Skeleton Shimmer Loading** đồng dạng với Table và Card stats, triệt tiêu hoàn toàn hiện tượng giật trang (Zero CLS).
* Cơ chế **Optimistic UI**: Khi Admin nhấn nút gạt Khóa / Mở khóa nhân viên, giao diện badge đổi trạng thái tức thì và rollback tự động nếu API gặp sự cố.

---

## 4. Tiêu Chuẩn Nghiệm Thu Sơ Bộ (Preliminary Acceptance Criteria)

- [ ] **AC-1:** Admin có thể tạo mới nhân viên với đầy đủ họ tên, email, SĐT và vai trò (`admin`, `manager`, `editor`, `sales`).
- [ ] **AC-2:** Nhân viên bị khóa (`status = 'suspended'`) không thể đăng nhập vào hệ thống (thông báo lỗi rõ ràng: *"Tài khoản của bạn đã bị tạm khóa bởi quản trị viên"*).
- [ ] **AC-3:** Nếu nhân viên đang thao tác mà bị Admin khóa tài khoản, request tiếp theo sẽ tự động bị từ chối và đẩy về trang login.
- [ ] **AC-4:** Nhân viên có thể truy cập `/admin/profile` để đổi mật khẩu (yêu cầu nhập đúng mật khẩu hiện tại) và cập nhật thông tin cá nhân.
- [ ] **AC-5:** Hệ thống ngăn chặn việc Admin cuối cùng tự xóa hoặc tự hạ quyền của chính mình.
- [ ] **AC-6:** 100% Type-Safe qua Zod, không có any types, vượt qua `pnpm check-types` trên toàn bộ monorepo.
