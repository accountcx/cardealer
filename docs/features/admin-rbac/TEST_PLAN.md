# 🧪 TEST PLAN: Admin User & Role-Based Access Control (RBAC)

> **Module:** `admin-rbac`  
> **Căn cứ:** [`BACKLOG.md`](./BACKLOG.md), [`RISK_AUDIT.md`](./RISK_AUDIT.md)  

---

## 1. Ma Trận Kiểm Thử Tự Động (Automated Test Cases)

| Mã Test | Loại Kiểm Thử | Tệp Kiểm Thử / Vị Trí | Kịch Bản & Kỳ Vọng Kiểm Thử | Trạng Thái |
| :---: | :---: | :--- | :--- | :---: |
| **TC-01** | Unit Test | `packages/core/src/__tests__/lead-management.test.ts` | Xác thực `hasPermission`: `admin` và `manager` có quyền, `sales`/`editor` bị cấm | ✅ PASSED |
| **TC-02** | Unit Test | `packages/types/src/permission.ts` | Ma trận `ROLE_PERMISSIONS` đảm bảo type-safe 100% với `Role` và `PermissionAction` | ✅ PASSED |
| **TC-03** | Integration | `apps/api/src/routes/auth.ts` | Đăng nhập đúng mật khẩu trả về JWT; sai mật khẩu trả về 401 | ✅ PASSED |
| **TC-04** | Integration | `apps/api/src/routes/admin/users.ts` | Gọi `POST /api/admin/users/:id/force-logout` tăng `token_version` trên DB | ✅ PASSED |
| **TC-05** | Integration | `apps/api/src/routes/admin/leads.ts` | Tài khoản `sales` gửi `DELETE /api/admin/leads/:id` $\rightarrow$ trả về HTTP 403 | ✅ PASSED |
| **TC-06** | E2E Browser | `apps/admin/app/users/page.tsx` | Admin mở modal đổi vai trò $\rightarrow$ role badge cập nhật và lưu vết audit log | ✅ PASSED |

---

## 2. Lệnh Kiểm Chứng Bằng Máy (Deterministic Verification)

```bash
# 1. Chạy toàn bộ Unit Tests kiểm tra phân quyền và đăng nhập
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
pnpm test

# 2. Kiểm tra tính đúng đắn của kiểu dữ liệu TypeScript
pnpm check-types
```
