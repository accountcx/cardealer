# 🛡️ Báo Cáo Ma Trận Kiểm Toán Rủi Ro & An Ninh (Security & Risk Audit Matrix)

> **Mã Epic:** `EPIC-PHASE-2-ADMIN-USER-RBAC`  
> **Chuyên gia thực hiện:** `dependency-graph-analyzer` & `security-compliance-auditor`  
> **Trạng thái:** Hoàn thành kiểm toán 17 điểm rủi ro (R1–R17)  
> **Áp dụng cho:** Core Authentication, RBAC Guard, User Lifecycle, Audit Trail

---

## 1. Tổng Quan Ma Trận Rủi Ro (Risk Overview Heatmap)

| Mức Độ Nghiêm Trọng | Số Lượng | Mã Rủi Ro |
| :--- | :---: | :--- |
| 🔴 **CRITICAL** (Tối khẩn) | 4 | **R1, R2, R3, R4** |
| 🟠 **HIGH** (Cao) | 6 | **R5, R6, R7, R8, R14, R15** |
| 🟡 **MEDIUM** (Trung bình) | 5 | **R9, R10, R11, R12, R17** |
| 🟢 **LOW** (Thấp) | 2 | **R13, R16** |

---

## 2. Chi Tiết Ma Trận Kiểm Toán 17 Điểm Rủi Ro (R1 – R17)

---

### 🔴 NHÓM CRITICAL (Rủi ro Tối Khẩn - Uy hiếp Toàn bộ Hệ Thống)

#### R1: Leo Thang Đặc Quyền (Privilege Escalation)
* **Kịch bản tấn công:** Kẻ tấn công hoặc nhân viên có tài khoản `manager` / `editor` lợi dụng endpoint cập nhật hồ sơ cá nhân (`PUT /api/admin/profile`) hoặc gửi request can thiệp `PUT /api/admin/users/:id` với body payload `{ "role": "admin" }` để tự thăng quyền lên Super Admin.
* **Tác động:** Chiếm toàn quyền hệ thống showroom xe hơi, truy cập và xóa toàn bộ dữ liệu cấu hình, tài chính, đơn hàng.
* **Giải pháp phòng thủ (Defenses):**
  1. **Strict DTO Separation:** `updateProfileSchema` TUYỆT ĐỐI KHÔNG chứa trường `role` hay `status`.
  2. **Role-based Permission Guard:** Chỉ role `admin` mới có quyền gọi `PATCH /api/admin/users/:id/role`.
  3. **Anti-Escalation Check:** Không một user nào (kể cả admin cấp dưới nếu có) được phép gán role cao hơn role của chính mình.
* **Phương thức kiểm thử:** Test Suite tự động thử dùng token của `manager` gọi API thăng cấp lên `admin`, hệ thống phải từ chối `403 FORBIDDEN`.

---

#### R2: Tự Khóa Hoặc Xóa Tài Khoản Quản Trị Cuối Cùng (Anti-Self-Lockout & Last Admin Protection)
* **Kịch bản lỗi vận hành:** 
  1. Quản trị viên vô tình tự xóa tài khoản của chính mình (`DELETE /api/admin/users/:id` với `id == currentUser.id`).
  2. Quản trị viên vô tình tự chuyển trạng thái của mình sang `suspended` hoặc tự hạ quyền thành `editor`.
  3. Hệ thống chỉ còn 1 tài khoản `admin` duy nhất và tài khoản đó bị xóa, khiến toàn bộ hệ thống rơi vào trạng thái "vô chủ" (Orphaned System).
* **Tác động:** Không ai còn quyền truy cập bảng quản trị Admin để khôi phục hoặc cấu hình hệ thống.
* **Giải pháp phòng thủ (Defenses):**
  1. **Self-Action Guard:** API chặn tuyệt đối hành động tự xóa (`currentUser.id === targetUser.id => 400 ACTION_NOT_ALLOWED`).
  2. **Self-Demotion Guard:** Chặn tự đổi role hoặc tự suspend chính mình (`400 CANNOT_SUSPEND_SELF`).
  3. **Last Admin Guard:** Trong transaction xóa/hạ quyền user có role `admin`, thực hiện truy vấn `SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active'`. Nếu `count <= 1`, từ chối ngay lập tức với mã lỗi `400 LAST_ADMIN_CANNOT_BE_DELETED`.
* **Phương thức kiểm thử:** Unit Test & API Test cố tình gọi API tự xóa chính mình và xóa admin cuối cùng.

---

#### R3: Rò Rỉ Mã Hash Mật Khẩu (Password Hash Leakage in API Serialization)
* **Kịch bản rủi ro:** Lập trình viên sử dụng `SELECT * FROM users` và trả về trực tiếp đối tượng `user` cho phía Frontend trong các API `/api/admin/users`, `/api/admin/users/:id`, `/api/admin/profile`. Chuỗi bcrypt/argon2 hash bị lộ trong Network tab hoặc cache trình duyệt.
* **Tác động:** Tin tặc trích xuất hash mật khẩu từ response để thực hiện tấn công Offline Dictionary / Rainbow Table bẻ khóa mật khẩu admin.
* **Giải pháp phòng thủ (Defenses):**
  1. **Drizzle Query Select Whitelist:** Truy vấn Drizzle luôn chỉ định rõ các cột cần lấy, cố tình loại bỏ `passwordHash` (ví dụ: `db.select({ id: users.id, email: users.email, ... })`).
  2. **Zod Transform Sanitizer:** Mọi DTO trả về đều đi qua Zod schema `UserResponseSchema` (chỉ chứa public fields).
  3. **Object Omission:** Nếu lấy toàn bộ record để verify logic, luôn dùng `const { passwordHash: _, ...safeUser } = user` trước khi response.
* **Phương thức kiểm thử:** Test Suite tự động assert kiểm tra response body của toàn bộ 10 API endpoints, đảm bảo `passwordHash`, `password`, `hash` không bao giờ xuất hiện dưới mọi hình thức.

---

#### R4: Phiên Đăng Nhập Cũ Tồn Tại Dù Đã Đổi Pass / Đình Chỉ (Stale JWT & Delayed Revocation)
* **Kịch bản rủi ro:** Một nhân viên bị đình chỉ tài khoản (`status: 'suspended'`) hoặc bị sa thải, nhưng JWT Access Token của họ còn hạn 15 phút - 1 ngày. Kẻ này vẫn tiếp tục gửi request lên API để tải dữ liệu nhạy cảm hoặc xóa các xe trưng bày.
* **Tác động:** Rò rỉ dữ liệu hoặc phá hoại hệ thống trong khoảng thời gian cửa sổ hiệu lực của JWT (Token Expiry Window).
* **Giải pháp phòng thủ (Defenses):**
  1. **State-Machine Counter `tokenVersion`:** Mỗi JWT token đính kèm claim `tokenVersion: number`.
  2. **Token Version Verification in Middleware:** Mỗi request vào API Admin sẽ kiểm tra `jwt.tokenVersion === dbUser.tokenVersion` và `dbUser.status === 'active'`.
  3. **Instant Revocation:** Khi quản trị viên bấm "Force Logout", hoặc khi tài khoản bị khóa, hoặc khi người dùng đổi mật khẩu, hệ thống tăng `tokenVersion = tokenVersion + 1`. Ngay lập tức toàn bộ token đang lưu hành của người đó bị vô hiệu hóa trong mili-giây.
* **Phương thức kiểm thử:** Tạo 1 user, sinh token v1, gọi API thành công. Tăng `tokenVersion` lên 2, dùng token v1 gửi request tiếp theo => Bắt buộc trả về `401 UNAUTHORIZED / TOKEN_REVOKED`.

---

### 🟠 NHÓM HIGH (Rủi ro Nghiêm Trọng Về Bảo Mật & Toàn Vẹn)

#### R5: Tấn Công Brute-Force & Mật Khẩu Yếu (Brute-Force & Weak Password)
* **Mô tả:** Đặt mật khẩu đơn giản (123456) hoặc bị quét từ điển liên tục vào endpoint đăng nhập/đổi mật khẩu.
* **Giải pháp:**
  - Quy định độ phức tạp mật khẩu bằng Zod: Tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.
  - Mã hóa an toàn bằng `bcrypt` với cost factor = 10 hoặc 12.
  - Tích hợp Rate Limiter trên middleware API (tối đa 5 lần thử sai / 15 phút theo IP).

#### R6: Nhân Viên Truy Cập Trái Phép API Quản Trị Người Dùng (Horizontal / Vertical Access Control)
* **Mô tả:** User role `sales` hoặc `editor` tự ý gọi `GET /api/admin/users` để xem danh sách nhân sự showroom hoặc lương/thông tin liên hệ.
* **Giải pháp:**
  - `requirePermission('users:read')` được đặt trước mọi endpoint `/api/admin/users/*`.
  - Chỉ `admin` và `manager` mới có quyền đọc danh sách user.
  - Chỉ `admin` mới có quyền thêm/sửa/xóa/đổi quyền nhân sự.

#### R7: Xung Đột Dữ Liệu Đồng Thời (Race Conditions on User Status / Last Admin)
* **Mô tả:** Hai Super Admin cùng lúc thực hiện thao tác: Admin 1 hạ quyền Admin 2, Admin 2 hạ quyền Admin 1 ở cùng 1 giây. Cả hai request đều đọc được `count == 2` và cùng cho phép hạ quyền => Hệ thống mất sạch admin.
* **Giải pháp:**
  - Sử dụng Transaction với Lock Row: `SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active' FOR UPDATE` trong PostgreSQL để tuần tự hóa các thao tác thay đổi quyền admin.

#### R8: Chỉnh Sửa Hoặc Giả Mạo Nhật Ký Kiểm Toán (Audit Log Tampering)
* **Mô tả:** Kẻ xâm nhập hoặc quản trị viên có ý đồ xấu cố tình sửa dữ liệu trong bảng `audit_logs` để che giấu hành vi xóa dữ liệu xe hoặc đổi số dư.
* **Giải pháp:**
  - Thiết kế bảng `audit_logs` ở trạng thái **Append-Only**.
  - Không xây dựng bất kỳ API nào có phương thức `UPDATE` hoặc `DELETE` trên bảng `audit_logs`.
  - Phân quyền PostgreSQL user của ứng dụng (trong môi trường prod có thể thu hồi quyền UPDATE/DELETE trên bảng này).

#### R14: Khóa Bảng Database Gây Gián Đoạn Showroom Khi Migration (DDL Table Locking)
* **Mô tả:** Bảng `users` đã tồn tại từ Phase 1. Việc chạy migration thêm enum values và cột mới có thể khóa bảng gây nghẽn truy cập của các showroom đang bán xe.
* **Giải pháp:**
  - Sử dụng cú pháp DDL an toàn của PostgreSQL: `ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';`
  - Thêm cột mới với `DEFAULT` không khóa bảng trong PostgreSQL 11+: `ALTER TABLE users ADD COLUMN token_version integer DEFAULT 1;`
  - Chạy migration tự động qua script đã kiểm thử trên SQLite/PostgreSQL staging trước.

#### R15: Vượt Mặt Phân Quyền Phía Client (Client-Side RBAC Bypass)
* **Mô tả:** Kẻ tấn công sửa code Javascript hoặc LocalStorage trên trình duyệt để biến `role` hiển thị thành `admin`, từ đó hiển thị các menu ẩn và nút bấm nhạy cảm.
* **Giải pháp:**
  - Áp dụng nguyên tắc **Zero Trust**: Phía Client chỉ ẩn hiện UI để tối ưu trải nghiệm (UX optimization).
  - Toàn bộ bảo mật, phân quyền cốt lõi đều được thực thi tại Backend API qua RBAC Middleware. Dù client có can thiệp UI, request gửi lên API vẫn bị từ chối `403 Forbidden`.

---

### 🟡 NHÓM MEDIUM (Rủi ro Trung Bình Về Ổn Định & Dữ Liệu)

#### R9: Giả Mạo Địa Chỉ IP Trong Nhật Ký (IP Spoofing in Audit Logs)
* **Mô tả:** Kẻ tấn công can thiệp header `X-Forwarded-For` để ghi nhận IP giả mạo vào `audit_logs` hoặc `last_login_ip`.
* **Giải pháp:** Lấy IP từ `req.headers['x-forwarded-for']` qua reverse proxy đáng tin cậy (Nginx/Cloudflare) hoặc fallback về `req.socket.remoteAddress`.

#### R10: Tấn Công Giả Mạo Yêu Cầu (CSRF Vulnerability)
* **Mô tả:** Kẻ tấn công dụ admin bấm vào link độc hại từ email, kích hoạt request ngầm đổi email hoặc xóa nhân viên.
* **Giải pháp:** API sử dụng Bearer Token trong Header `Authorization: Bearer <token>` (không phụ thuộc vào implicit cookie) kết hợp CORS chặt chẽ chỉ cho phép origin của Admin Dashboard.

#### R11: Lỗ Hổng SQL Injection Qua Bộ Lọc & Tìm Kiếm Nhân Sự
* **Mô tả:** Tìm kiếm user theo từ khóa `search=abc' OR 1=1--` chèn mã độc SQL.
* **Giải pháp:** 100% truy vấn dữ liệu được thực thi thông qua **Drizzle ORM Parameterized Queries** (`ilike(users.fullName, \`%${search}%\`)`), triệt tiêu hoàn toàn nguy cơ SQL Injection.

#### R12: Thu Thập Danh Sách Email Qua Thông Báo Lỗi (User Enumeration Attack)
* **Mô tả:** Tin tặc thử tạo user hoặc đăng nhập để dò xem email nào đã tồn tại trong hệ thống showroom.
* **Giải pháp:** Trong luồng tạo user, thông báo lỗi trùng lặp `EMAIL_ALREADY_EXISTS` được kiểm soát; trong luồng đăng nhập, thông báo chung `INVALID_CREDENTIALS` (không phân biệt sai mật khẩu hay sai email).

#### R17: Trạng Thái UI Bị Lỗi Thời Sau Khi Bị Khóa Tài Khoản (Stale UI State)
* **Mô tả:** Admin đang thao tác trên giao diện, bỗng nhiên bị Admin cấp cao hơn thu hồi quyền, nhưng giao diện không thông báo gì cho đến khi nhấn F5.
* **Giải pháp:** Interceptor của API Client (Axios / Fetch Wrapper) bắt mã lỗi `401 TOKEN_REVOKED` hoặc `403 FORBIDDEN` để tự động hiển thị Toast thông báo và chuyển hướng tức thì về trang Login.

---

### 🟢 NHÓM LOW (Rủi ro Nhẹ & Tối Ưu Hóa Trải Nghiệm)

#### R13: Nghẽn Hiệu Năng Truy Vấn Audit Logs (Pagination Exhaustion)
* **Mô tả:** Showroom hoạt động nhiều năm, bảng `audit_logs` có hàng triệu bản ghi, truy vấn trang cuối gây quá tải DB.
* **Giải pháp:** Luôn bắt buộc giới hạn `limit` (mặc định 20, tối đa 100) và đánh chỉ mục B-Tree trên `created_at DESC` và `user_id`.

#### R16: Tấn Công XSS Qua Tên Nhân Viên (Stored XSS)
* **Mô tả:** Admin nhập tên nhân viên chứa `<script>alert(1)</script>`.
* **Giải pháp:** React mặc định escape các chuỗi ký tự render trong JSX. Tuyệt đối không sử dụng `dangerouslySetInnerHTML`. Zod schema kiểm tra sanitize chuỗi đầu vào.

---

## 3. Bảng Phân Công Xử Lý Rủi Ro Cho Giai Đoạn 4 (Mitigation Assignment)

| Mã Rủi Ro | Thành Phần Chịu Trách Nhiệm | Biện Pháp Kỹ Thuật Chính |
| :--- | :--- | :--- |
| **R1, R6** | `apps/api/src/middleware/rbac.ts` | RBAC Matrix Middleware & Type-safe permission checking |
| **R2** | `apps/api/src/routes/admin/users.ts` | Guard chặn tự xóa/tự hạ quyền và kiểm tra `count(admin) > 1` |
| **R3** | `apps/api` & `@cardealer/types` | Drizzle Select Whitelist + Zod Output Sanitization |
| **R4, R17** | `apps/api` & `packages/database` | State-machine `tokenVersion` check & Axios 401 Interceptor |
| **R5, R12** | `packages/types/src/user.ts` | Zod Password regex & Generic error messages |
| **R7** | `apps/api` (Database Transaction) | DB Transaction with row locking on critical admin changes |
| **R8** | `packages/database/src/schema/audit_logs.ts` | Append-only schema, no Update/Delete APIs |
| **R11, R16** | Drizzle ORM + React JSX | Parameterized queries + Automatic JSX string escaping |
| **R14** | `packages/database/drizzle` | Safe Non-blocking DDL Migrations |
| **R15** | `apps/admin/src/lib/permissions.ts` | Zero-Trust Backend Enforcement + UX-only Client Visibility |

---

*Báo cáo được biên soạn và phê chuẩn bởi `dependency-graph-analyzer` phục vụ Giai đoạn 3 của Universal Agentic Workflow.*
