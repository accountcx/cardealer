# 🎨 FRONTEND INTEGRATION GUIDE: Admin User & Role-Based Access Control (RBAC)

> **Module:** `admin-rbac`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`API_SPEC.md`](./API_SPEC.md)  

---

## 1. Cấu Trúc Thành Phần Giao Diện (Component Hierarchy)

```
apps/admin/app/users/
├── page.tsx                     # Quản lý danh sách nhân viên & bộ lọc vai trò
├── components/
│   ├── UserTable.tsx            # Bảng danh sách nhân viên (Tên, Email, Role Badge, Trạng thái)
│   ├── UserFormModal.tsx        # Modal thêm mới / sửa thông tin nhân viên
│   ├── RoleBadge.tsx            # Huy hiệu vai trò có màu nhận diện riêng biệt
│   └── ForceLogoutButton.tsx    # Nút thu hồi phiên từ xa với xác nhận bảo mật
```

---

## 2. Hệ Thống Biểu Tượng & Design Tokens

- **Icon Set (lucide-react):**
  - Quản trị viên: `<ShieldCheck className="w-4 h-4 text-emerald-600" />`
  - Quản lý kho / nội dung: `<UserCheck className="w-4 h-4 text-sky-600" />`
  - Đăng xuất từ xa: `<LogOut className="w-4 h-4 text-amber-600" />`
  - Khóa tài khoản: `<Lock className="w-4 h-4 text-red-600" />`
  - Nhật ký kiểm toán: `<History className="w-4 h-4 text-slate-500" />`
- **Tailwind Role Badges:**
  - `admin`: `bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-1 rounded`
  - `manager`: `bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-semibold px-2 py-1 rounded`
  - `editor`: `bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold px-2 py-1 rounded`
  - `sales`: `bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold px-2 py-1 rounded`

---

## 3. Ma Trận 4 Trạng Thái Giao Diện (4-State UI Matrix)

| Trạng Thái | Điều Kiện Kích Hoạt | Hành Vi Giao Diện | Thiết Kế Fallback |
| :--- | :--- | :--- | :--- |
| **Loading** | Đang tải danh sách nhân viên từ API | Hiển thị 5 hàng Skeleton Shimmer mô phỏng bảng | `<div className="animate-pulse h-12 bg-slate-100 dark:bg-slate-800 rounded mb-2" />` |
| **Empty** | Không tìm thấy nhân viên nào theo bộ lọc | Thông báo không có kết quả phù hợp | `<div className="py-12 text-center text-slate-500"><p>Chưa có tài khoản nào trong nhóm vai trò này.</p></div>` |
| **Error** | Phiên hết hạn hoặc không đủ quyền (403) | Hiển thị cảnh báo từ chối truy cập | `<div className="p-4 bg-red-50 text-red-700 rounded-lg"><AlertCircle className="inline mr-2" />Bạn không có quyền truy cập khu vực này</div>` |
| **Success** | Tải danh sách nhân viên thành công | Hiển thị bảng dữ liệu phân trang đầy đủ | Render `UserTable` với đầy đủ các nút hành động theo quyền hạn của tài khoản đang đăng nhập |

---

## 4. Chuẩn Mực Triển Khai Mã Nguồn
- Bắt buộc sử dụng **Named Export** (ví dụ: `export function UserTable(...)`).
- 100% tuân thủ **Tailwind Spacing Scale** tiêu chuẩn (tránh các arbitrary values tự do).
