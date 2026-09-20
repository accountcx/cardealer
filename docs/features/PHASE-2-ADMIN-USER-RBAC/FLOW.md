# 🔄 Sơ Đồ Luồng Nghiệp Vụ & Tương Tác Kỹ Thuật (FLOW.md)
## PHASE 2 - ADMIN USER & RBAC MANAGEMENT

> **Role:** `logic-flow-ba`  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`SOLUTION_OPTIONS.md`](./SOLUTION_OPTIONS.md)  
> **Phạm vi tác động:** `apps/admin` (Next.js 16), `apps/api` (REST Backend), `packages/database` (PostgreSQL), `packages/types`

---

## 1. Luồng 1: Phân Quyền Đa Tầng & Chặn Tuyến Đường (RBAC Guard Pipeline)

Sơ đồ tuần tự xử lý khi nhân viên có vai trò khác nhau truy cập vào các phân hệ quản trị nhạy cảm:

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân Viên (Sales / Editor / Manager / Admin)
    participant Browser as Browser (apps/admin)
    participant Middleware as Next.js 16 Middleware Guard
    participant API as Backend REST API (apps/api)
    participant DB as PostgreSQL (users table)

    User->>Browser: Nhấp vào menu Quản Lý Nhân Viên (/users) hoặc Cấu Hình (/settings)
    Browser->>Middleware: Request GET /users (kèm Cookie admin_token)
    Middleware->>Middleware: Verify JWT & Đọc payload (role, tokenVersion, userId)
    
    alt Role là 'sales' hoặc 'editor'
        Note over Middleware,Browser: Vi phạm ma trận phân quyền (PoLP)
        Middleware-->>Browser: Redirect 307 về /cars?error=unauthorized
        Browser-->>User: Hiển thị cảnh báo "Bạn không có quyền truy cập trang Quản Trị Nhân Viên"
    else Role là 'admin' (hoặc 'manager' đối với trang được phân quyền)
        Middleware-->>Browser: NextResponse.next() (Cho phép render trang)
        Browser->>API: GET /api/admin/users (kèm JWT Header/Cookie)
        API->>API: requireRole(['admin']) kiểm tra payload.role
        API->>DB: SELECT id, token_version, status, role FROM users WHERE id = $1
        DB-->>API: Trả về record user hiện tại
        
        alt User bị khóa (status === 'suspended') HOẶC tokenVersion lệch
            API-->>Browser: 401 Unauthorized / 403 Forbidden { code: "SESSION_REVOKED" }
            Browser->>Browser: Xóa cookie admin_token & Chuyển hướng về /login
        else User hoạt động hợp lệ
            API->>DB: Query danh sách users (phân trang, lọc role, status)
            DB-->>API: Danh sách users
            API-->>Browser: 200 OK { success: true, data: usersList }
            Browser-->>User: Render Bảng Quản Trị Nhân Viên
        end
    end
```

---

## 2. Luồng 2: Tạo Mới Nhân Viên & Phòng Ngừa Leo Quyền (Create User & Anti-Privilege Escalation)

Quy trình quản trị viên cấp cao khởi tạo tài khoản nhân viên mới:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    participant AdminUI as apps/admin (/users)
    participant API as apps/api (/api/admin/users)
    participant DB as PostgreSQL (users, audit_logs)

    Admin->>AdminUI: Bấm "Thêm Nhân Viên Mới" -> Mở Modal
    Admin->>AdminUI: Điền Họ tên, Email, SĐT, Chọn Role ('sales' / 'editor' / 'manager')
    AdminUI->>AdminUI: Client Validation (Zod UserCreateSchema)
    AdminUI->>API: POST /api/admin/users (Payload JSON)
    
    API->>API: requireRole(['admin'])
    API->>DB: SELECT id FROM users WHERE email = $1
    alt Email đã tồn tại
        DB-->>API: Tìm thấy user trùng
        API-->>AdminUI: 409 Conflict { code: "EMAIL_ALREADY_EXISTS" }
        AdminUI-->>Admin: Hiển thị thông báo "Email này đã được sử dụng"
    else Email chưa tồn tại
        API->>API: Hash mật khẩu mặc định/tạm thời (bcrypt hash, rounds=10)
        API->>DB: INSERT INTO users (email, password_hash, role, status='active', token_version=1)
        DB-->>API: Return new user record
        API->>DB: INSERT INTO audit_logs (action='CREATE_USER', targetType='user', targetId=newId, details=...)
        DB-->>API: Log saved
        API-->>AdminUI: 201 Created { success: true, data: newUser }
        AdminUI->>AdminUI: Đóng modal, Optimistic refresh danh sách
        AdminUI-->>Admin: Hiển thị Toast "Thêm nhân viên thành công"
    end
```

---

## 3. Luồng 3: Khóa Tài Khoản & Thu Hồi Phiên Tức Thì (Instant Session Revocation)

Cơ chế State-Machine `tokenVersion` vô hiệu hóa phiên làm việc ngay khi nhân viên bị đình chỉ công tác:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    actor Staff as Nhân Viên Vi Phạm
    participant AdminUI as apps/admin (Admin Session)
    participant StaffUI as apps/admin (Staff Session)
    participant API as apps/api
    participant DB as PostgreSQL

    Admin->>AdminUI: Bấm nút Toggle "Khóa Tài Khoản" của Nhân Viên
    AdminUI->>API: PUT /api/admin/users/:id/status { status: 'suspended' }
    
    API->>API: Kiểm tra Anti-Self-Lockout (id !== currentAdminId)
    API->>DB: UPDATE users SET status = 'suspended', token_version = token_version + 1 WHERE id = $1
    API->>DB: INSERT INTO audit_logs (action='SUSPEND_USER', details={ prevStatus: 'active', newStatus: 'suspended' })
    DB-->>API: Success
    API-->>AdminUI: 200 OK { success: true }
    AdminUI-->>Admin: Badge chuyển sang "Đã Khóa" tức thì (Optimistic UI)

    Note over Staff,API: Trong khi đó, nhân viên bị khóa đang thao tác trên trình duyệt khác
    Staff->>StaffUI: Bấm chuyển trang hoặc gọi action
    StaffUI->>API: GET /api/admin/cars (kèm JWT tokenVersion cũ = 1)
    API->>DB: SELECT status, token_version FROM users WHERE id = staffId
    DB-->>API: Trả về status = 'suspended', token_version = 2
    API-->>StaffUI: 403 Forbidden { code: "ACCOUNT_SUSPENDED", message: "Tài khoản của bạn đã bị tạm khóa bởi quản trị viên" }
    StaffUI->>StaffUI: Xóa cookie admin_token & Force Logout
    StaffUI-->>Staff: Chuyển hướng về /login với thông báo tài khoản bị khóa
```

---

## 4. Luồng 4: Đổi Mật Khẩu Cá Nhân & Tự Động Làm Mới Phiên (Profile Password Change)

Nhân viên tự đổi mật khẩu an toàn trong trang `/admin/profile`:

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân Viên / Admin
    participant ProfileUI as apps/admin (/profile)
    participant API as apps/api (/api/admin/profile)
    participant DB as PostgreSQL

    User->>ProfileUI: Nhập Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới
    ProfileUI->>ProfileUI: Zod Validation (Mật khẩu mới >= 6 ký tự, không trùng mật khẩu cũ)
    ProfileUI->>API: PUT /api/admin/profile/change-password { currentPassword, newPassword }
    
    API->>DB: SELECT password_hash, token_version FROM users WHERE id = currentUserId
    DB-->>API: User record
    API->>API: bcrypt.compare(currentPassword, password_hash)
    alt Mật khẩu hiện tại không đúng
        API-->>ProfileUI: 400 Bad Request { code: "INVALID_CURRENT_PASSWORD" }
        ProfileUI-->>User: Báo lỗi "Mật khẩu hiện tại không chính xác"
    else Mật khẩu hiện tại đúng
        API->>API: Hash mật khẩu mới (bcrypt hash)
        API->>DB: UPDATE users SET password_hash = $newHash, token_version = token_version + 1
        API->>DB: INSERT INTO audit_logs (action='CHANGE_PASSWORD_SELF')
        API->>API: Ký JWT mới (chứa token_version mới)
        API-->>ProfileUI: 200 OK + Set-Cookie: admin_token=<newJwt>
        ProfileUI-->>User: Toast "Đổi mật khẩu thành công! Phiên làm việc đã được gia hạn an toàn."
    end
```

---

## 5. Luồng 5: Cơ Chế Ghi Nhận Kiểm Toán Tự Động (Audit Trail Interceptor)

Pipeline tự động ghi log mọi biến động dữ liệu nhạy cảm mà không làm chậm API:

```mermaid
flowchart TD
    REQ["API Request (POST/PUT/DELETE)"] --> AUTH{"Xác thực JWT & User"}
    AUTH -- "Không hợp lệ" --> LOG_FAIL["Ghi Audit Log: LOGIN_FAILED / UNAUTHORIZED (kèm IP, UA)"] --> RESP_FAIL["Trả lỗi 401/403"]
    AUTH -- "Hợp lệ" --> HANDLER["Thực thi Controller Nghiệp Vụ"]
    HANDLER --> DB_MUTATION["Thực hiện CSDL (Tạo/Sửa/Xóa)"]
    DB_MUTATION --> AUDIT_RECORD["Append Record vào bảng audit_logs<br/>- userId, action, targetType, targetId<br/>- details: { oldState, newState }<br/>- ipAddress, userAgent, createdAt"]
    AUDIT_RECORD --> RESP_SUCCESS["Trả về 200/201 Success Response"]
```
