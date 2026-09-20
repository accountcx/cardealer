# 🧪 Kế Hoạch Kiểm Thử Máy Tự Động (Automated Verification Test Plan)

> **Mã Epic:** `EPIC-PHASE-2-ADMIN-USER-RBAC`  
> **Chuyên gia thực hiện:** `qa-test-engineer`  
> **Trạng thái:** Sẵn sàng thực thi (Ready for Execution in Phase 4)  
> **Mục tiêu:** Đảm bảo 100% các rủi ro R1–R17 được kiểm thử tự động, không phụ thuộc vào thao tác thủ công.

---

## 1. Kim Tự Tháp Kiểm Thử (Testing Pyramid Strategy)

```
              ▲
             / \     [E2E / CLI Verification Runner] (10 scenarios, exit 0)
            /   \
           /     \   [API Integration Test Suites] (24 test cases)
          /       \
         /         \ [Unit & Schema Tests] (35 test cases: Zod, Matrix, Crypto)
        ─────────────
```

---

## 2. Chi Tiết Các Test Suites Tự Động

### Suite 1: RBAC Permission Matrix & Zod Contract Unit Tests
* **Mục tiêu:** Kiểm tra độ chính xác của ma trận phân quyền và xác thực dữ liệu đầu vào.
* **Vị trí file kiểm thử:** `packages/types/src/__tests__/permission.test.ts`
* **Các ca kiểm thử (Test Cases):**
  - `TC-1.1`: Role `admin` sở hữu 100% các quyền trong danh mục (`hasPermission('admin', action) === true` với mọi action).
  - `TC-1.2`: Role `manager` có quyền `users:read`, `users:update`, `cars:write` nhưng KHÔNG có quyền `users:delete` hoặc `users:role`.
  - `TC-1.3`: Role `editor` chỉ có quyền thao tác catalog xe (`cars:read`, `cars:write`), từ chối toàn bộ quyền quản trị user (`users:*`).
  - `TC-1.4`: Role `sales` chỉ có quyền đọc (`cars:read`, `leads:read`, `leads:write`), từ chối mọi quyền chỉnh sửa cấu hình hệ thống.
  - `TC-1.5`: `createUserSchema` bắt buộc email chuẩn RFC, họ tên tối thiểu 2 ký tự, mật khẩu thỏa mãn 4 tiêu chí phức tạp.
  - `TC-1.6`: `updateProfileSchema` từ chối nếu có các trường cấm: `role`, `status`, `tokenVersion`, `passwordHash`.

---

### Suite 2: API RBAC Guard & Anti-Privilege Escalation (Kiểm toán R1, R6)
* **Mục tiêu:** Đảm bảo Middleware RBAC chặn đứng mọi nỗ lực truy cập hoặc leo thang quyền trái phép.
* **Vị trí file kiểm thử:** `apps/api/src/__tests__/rbac-guard.test.ts`
* **Các ca kiểm thử:**
  - `TC-2.1`: Gửi request không có Header `Authorization` tới `/api/admin/users` ➡️ Phản hồi `401 UNAUTHORIZED`.
  - `TC-2.2`: Sử dụng token của user role `sales` gọi `GET /api/admin/users` ➡️ Phản hồi `403 FORBIDDEN` với mã `INSUFFICIENT_PERMISSIONS`.
  - `TC-2.3`: Sử dụng token của user role `editor` gọi `POST /api/admin/users` ➡️ Phản hồi `403 FORBIDDEN`.
  - `TC-2.4`: Sử dụng token của user role `manager` gọi `PATCH /api/admin/users/:id/role` ➡️ Phản hồi `403 FORBIDDEN`.
  - `TC-2.5`: Sử dụng token của user role `admin` gọi các endpoints trên ➡️ Phản hồi `200 OK` / `201 CREATED`.

---

### Suite 3: Bảo Vệ An Toàn Tài Khoản Admin & Anti-Self-Lockout (Kiểm toán R2)
* **Mục tiêu:** Chặn tuyệt đối hành vi tự hủy hoại hoặc xóa mất admin cuối cùng của hệ thống.
* **Vị trí file kiểm thử:** `apps/api/src/__tests__/admin-protection.test.ts`
* **Các ca kiểm thử:**
  - `TC-3.1`: Admin A gửi request `DELETE /api/admin/users/:id` với `id == Admin A.id` ➡️ Phản hồi `400 ACTION_NOT_ALLOWED` (`CANNOT_DELETE_SELF`).
  - `TC-3.2`: Admin A gửi request `PATCH /api/admin/users/:id/status` tự chuyển chính mình sang `suspended` ➡️ Phản hồi `400 ACTION_NOT_ALLOWED` (`CANNOT_SUSPEND_SELF`).
  - `TC-3.3`: Admin A gửi request tự hạ quyền của chính mình thành `editor` ➡️ Phản hồi `400 ACTION_NOT_ALLOWED` (`CANNOT_DEMOTE_SELF`).
  - `TC-3.4`: Hệ thống chỉ có duy nhất 1 tài khoản admin hoạt động. Admin đó tạo 1 admin B tạm thời, sau đó xóa admin B thành công (`200 OK`). Khi cố xóa tiếp admin còn lại duy nhất ➡️ Phản hồi `400 BAD_REQUEST` (`LAST_ADMIN_CANNOT_BE_DELETED`).

---

### Suite 4: Kiểm Soát Rò Rỉ Mật Khẩu (Password Hash Sanitization - Kiểm toán R3)
* **Mục tiêu:** Đảm bảo không một byte nào của password hash bị lọt ra response API.
* **Vị trí file kiểm thử:** `apps/api/src/__tests__/security-sanitization.test.ts`
* **Các ca kiểm thử:**
  - `TC-4.1`: Kiểm tra response `GET /api/admin/users` (danh sách) ➡️ Không có bất kỳ key nào tên `passwordHash`, `password`, `hash`.
  - `TC-4.2`: Kiểm tra response `GET /api/admin/users/:id` (chi tiết) ➡️ Chỉ chứa safe fields (`id`, `email`, `fullName`, `role`, `status`, `avatarUrl`, `lastLoginAt`, `createdAt`, `updatedAt`).
  - `TC-4.3`: Kiểm tra response `GET /api/admin/profile` và `PUT /api/admin/profile` ➡️ 100% sạch mã hash.
  - `TC-4.4`: Kiểm tra response `POST /api/admin/users` (tạo mới) ➡️ Trả về user info an toàn.

---

### Suite 5: Thu Hồi Phiên Đăng Nhập Tức Thì Bằng TokenVersion (Kiểm toán R4)
* **Mục tiêu:** Đảm bảo token cũ bị vô hiệu hóa ngay khi tài khoản bị khóa hoặc ép đăng xuất.
* **Vị trí file kiểm thử:** `apps/api/src/__tests__/token-revocation.test.ts`
* **Các ca kiểm thử:**
  - `TC-5.1`: Đăng nhập User X, nhận Token v1 (`tokenVersion: 1`).
  - `TC-5.2`: Dùng Token v1 gọi `GET /api/admin/profile` ➡️ Thành công (`200 OK`).
  - `TC-5.3`: Admin gọi `POST /api/admin/users/:id/force-logout` cho User X ➡️ DB tăng `tokenVersion` lên 2.
  - `TC-5.4`: Dùng lại Token v1 gửi request ➡️ Bị từ chối ngay lập tức với `401 UNAUTHORIZED` (`TOKEN_REVOKED`).
  - `TC-5.5`: User X đổi mật khẩu qua `POST /api/admin/profile/change-password` ➡️ Token v1 bị vô hiệu hóa, chỉ Token mới sinh mới hợp lệ.
  - `TC-5.6`: Chuyển User X sang trạng thái `suspended` ➡️ Mọi token hiện hành đều bị từ chối với `403 ACCOUNT_SUSPENDED`.

---

### Suite 6: Tính Toàn Vẹn Của Nhật Ký Kiểm Toán (Audit Trail - Kiểm toán R8, R9)
* **Mục tiêu:** Mọi hành vi nhạy cảm phải được ghi nhận bất biến vào bảng `audit_logs`.
* **Vị trí file kiểm thử:** `apps/api/src/__tests__/audit-trail.test.ts`
* **Các ca kiểm thử:**
  - `TC-6.1`: Tạo user mới ➡️ Bảng `audit_logs` tự động thêm bản ghi `action: 'USER_CREATED'`, ghi nhận `targetId`, `ipAddress`, `userAgent`.
  - `TC-6.2`: Đổi vai trò user ➡️ `audit_logs` ghi nhận `action: 'USER_ROLE_CHANGED'` cùng `details: { oldRole, newRole }`.
  - `TC-6.3`: Đình chỉ tài khoản ➡️ `audit_logs` ghi nhận `action: 'USER_SUSPENDED'`.
  - `TC-6.4`: Cưỡng chế đăng xuất ➡️ `audit_logs` ghi nhận `action: 'USER_FORCE_LOGOUT'`.
  - `TC-6.5`: Thử gọi API cập nhật hoặc xóa bảng audit log ➡️ Hệ thống không có route nào hỗ trợ (`404 NOT_FOUND`).

---

## 3. Kịch Bản CLI Verification Runner Toàn Diện (End-to-End CLI Script)

Để phục vụ Giai đoạn 4 nghiệm thu tự động, một CLI script độc lập sẽ được biên tập tại `scripts/verify-phase-2-rbac.ts`.

### Quy trình chạy tự động của Script:
```bash
# Lệnh thực thi nghiệm thu:
pnpm --filter @cardealer/api exec tsx scripts/verify-phase-2-rbac.ts
```

### Các bước tự động thực hiện trong script:
1. **Kiểm tra Schema & Database Migration:**
   - Kết nối DB, kiểm tra bảng `users` có đủ các cột: `role`, `status`, `token_version`, `last_login_at`, `last_login_ip`.
   - Kiểm tra bảng `audit_logs` đã tồn tại và có các index yêu cầu.
2. **Kiểm tra Seed Admin Account:**
   - Kiểm tra có ít nhất 1 tài khoản `admin` đang ở trạng thái `active`.
3. **Chạy Mô Phỏng 8 Kịch Bản Nghiệp Vụ (Simulated Flows):**
   - Flow 1: Phân quyền ma trận thành công và chặn trái phép (403).
   - Flow 2: Chặn tự xóa tài khoản của chính mình (400).
   - Flow 3: Chặn xóa admin cuối cùng (400).
   - Flow 4: Tạo tài khoản nhân viên mới (`sales`) thành công (201).
   - Flow 5: Thử nghiệm Instant Revocation qua `tokenVersion` (401).
   - Flow 6: Kiểm tra không rò rỉ mã hash trong các API responses.
   - Flow 7: Kiểm tra bản ghi `audit_logs` được ghi nhận đầy đủ sau các thao tác.
   - Flow 8: Cập nhật hồ sơ cá nhân và đổi mật khẩu thành công.
4. **Đầu ra mong muốn:**
   - In ra danh sách 8/8 bài test xanh (`PASS [✓]`).
   - Kết thúc với mã thoát `process.exit(0)`.

---

## 4. Bảng Tiêu Chuẩn Nghiệm Thu Gate 4 (Gate 4 Verification Checklist)

| Tiêu chuẩn | Điều kiện đạt | Phương pháp kiểm tra |
| :--- | :--- | :--- |
| **Type-Safety** | `0 errors` trên toàn bộ 11 package | `pnpm check-types` |
| **CLI Verification** | 100% các ca kiểm thử đạt `PASS` | `pnpm verify:rbac` (`exit 0`) |
| **Security Audit** | R1–R17 được kiểm soát chặt chẽ | Đối chiếu `RISK_AUDIT.md` |
| **UI SOP (v2.2.4)** | Zero arbitrary values, 100% Named Export, Reduced Motion, Zero-CLS | Review giao diện `/admin/users` |

---

*Tài liệu được soạn thảo và kiểm định bởi `qa-test-engineer` phục vụ nghiệm thu tự động Phase 2.*
