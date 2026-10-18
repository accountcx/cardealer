# 🌐 Frontend Integration & Modern UI Specification: ADMIN USER & RBAC MANAGEMENT

> **Role:** `tailwind-ui-designer` (SOP v2.2.4: Production-Grade Accessibility & Standardized Architecture Edition)  
> **Tài liệu tham chiếu:** [`FLOW.md`](./FLOW.md), [`API_SPEC.md`](./API_SPEC.md), [`docs/06-PHASED-IMPLEMENTATION-ROADMAP.md`](../../06-PHASED-IMPLEMENTATION-ROADMAP.md)  
> **Kiến trúc áp dụng:** Monorepo (`apps/admin` + `packages/ui`)  
> **Nguyên tắc kỹ thuật:** 100% Named Export, Unified `lucide-react` Icons, WCAG AAA Reduced Motion, Zero Arbitrary Values (`[...]`), Luxury Automotive Dark Theme.

---

## 1. Cấu Trúc Cây Component (Component Hierarchy - Monorepo Structure)

```text
packages/ui/src/                             # Shared Design System Primitives
├── button.tsx                               # Button (primary, secondary, danger, accent, glow)
├── card.tsx                                 # Card & Glass Card
├── badge.tsx                                # Role & Status Badges
├── input.tsx                                # Accessible Input with Label & Error
├── modal.tsx                                # Accessible Modal Primitive
├── table.tsx                                # Data-table (Table, Header, Body, Row, Cell)
├── skeleton.tsx                             # Skeleton Shimmer Loader (Zero-CLS)
└── form.tsx                                 # Form, FormItem, FormField (react-hook-form)

apps/admin/app/users/                        # Feature Directory: Quản Trị Nhân Viên
├── page.tsx                                 # Page Container (Data Fetching, Filter State, Shell)
├── components/
│   ├── UserStats.tsx                        # KPI Cards (Tổng nhân viên, Admin, Quản lý, Sales)
│   ├── UserTable.tsx                        # Main Data-table (Avatar, Role Pill, Status Switch, Actions)
│   ├── UserFormModal.tsx                    # Modal Thêm / Chỉnh Sửa Nhân Viên (react-hook-form + zod)
│   ├── UserResetPasswordModal.tsx           # Modal Cấp lại Mật khẩu tạm thời
│   ├── UserSkeleton.tsx                     # 4-State UI: Shimmer Loader (Zero-CLS)
│   ├── UserEmptyState.tsx                   # 4-State UI: Empty State + Nút Khởi tạo
│   └── UserErrorState.tsx                   # 4-State UI: Error State + Mã lỗi + Nút Thử lại
├── schemas/
│   └── user-management.schemas.ts           # Zod Validation Schemas (100% Named Export)
└── types/
    └── user-management.types.ts             # TypeScript Interfaces & DTOs (100% Named Export)

apps/admin/app/profile/                      # Feature Directory: Hồ Sơ Cá Nhân & Đổi Mật Khẩu
├── page.tsx                                 # Profile Page Container
└── components/
    ├── ProfileInfoForm.tsx                  # Form Cập Nhật Họ Tên, SĐT, Avatar
    └── ChangePasswordForm.tsx               # Form Đổi Mật Khẩu Cá Nhân (Xác thực 3 lớp)
```

---

## 2. Đặc Tả Đủ 4 Trạng Thái UI & Mã Nguồn Chuẩn (100% Named Export & Lucide Icons)

### ⏳ A. Trạng Thái Đang Tải (Loading State - Realistic Skeleton Zero-CLS)
Tái tạo chính xác cấu trúc hình học của bảng danh sách nhân viên để triệt tiêu hiện tượng giật trang (CLS):

```tsx
import { Skeleton } from "@cardealer/ui";

export const UserTableSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl animate-pulse motion-reduce:animate-none">
    {/* Table Header Placeholder */}
    <div className="grid grid-cols-6 gap-4 p-4 border-b border-white/10 bg-slate-900/80">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-4 w-16 justify-self-end rounded" />
    </div>
    {/* 6 Skeleton Rows */}
    <div className="divide-y divide-white/5">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div key={idx} className="grid grid-cols-6 gap-4 p-4 items-center">
          {/* Cột 1: Avatar + Tên */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          </div>
          {/* Cột 2: Số điện thoại */}
          <Skeleton className="h-4 w-24 rounded" />
          {/* Cột 3: Vai trò (Role Badge) */}
          <Skeleton className="h-6 w-20 rounded-full" />
          {/* Cột 4: Đăng nhập gần nhất */}
          <Skeleton className="h-3 w-28 rounded" />
          {/* Cột 5: Trạng thái (Pill Switch) */}
          <Skeleton className="h-6 w-24 rounded-full" />
          {/* Cột 6: Thao tác */}
          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-8 w-14 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

### 📭 B. Trạng Thái Rỗng (Empty State - Hướng Dẫn & CTA Khởi Tạo)
Hiển thị khi showroom chưa tạo nhân viên hoặc kết quả tìm kiếm không trùng khớp:

```tsx
import { UserX, Plus } from "lucide-react";
import { Button } from "@cardealer/ui";

interface UserEmptyStateProps {
  searchTerm?: string;
  onResetSearch?: () => void;
  onAddNewUser: () => void;
}

export const UserEmptyState = ({ searchTerm, onResetSearch, onAddNewUser }: UserEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40">
    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4 shadow-inner">
      <UserX className="w-7 h-7" />
    </div>
    <h3 className="text-base font-bold text-slate-100">
      {searchTerm ? "Không tìm thấy nhân viên phù hợp" : "Chưa có nhân viên nào trong hệ thống"}
    </h3>
    <p className="mt-1 text-xs text-slate-400 max-w-sm">
      {searchTerm
        ? `Không tìm thấy tài khoản nào khớp với từ khóa "${searchTerm}". Bạn có thể thử tìm kiếm từ khóa khác.`
        : "Hãy khởi tạo tài khoản nhân viên đầu tiên để phân công vai trò tư vấn bán hàng hoặc quản lý showroom."}
    </p>
    <div className="mt-6 flex items-center gap-3">
      {searchTerm && onResetSearch && (
        <Button variant="secondary" size="sm" onClick={onResetSearch} className="text-xs">
          Xóa bộ lọc
        </Button>
      )}
      <Button
        variant="accent"
        size="sm"
        glow
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={onAddNewUser}
        className="text-xs"
      >
        Thêm Nhân Viên Mới
      </Button>
    </div>
  </div>
);
```

### ⚠️ C. Trạng Thái Lỗi (Error State - Kèm Mã Lỗi & Nút Thử Lại)
Hiển thị khi API gặp sự cố kết nối hoặc phiên làm việc bị từ chối:

```tsx
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@cardealer/ui";

interface UserErrorStateProps {
  message?: string;
  errorCode?: string;
  onRetry: () => void;
}

export const UserErrorState = ({ message, errorCode, onRetry }: UserErrorStateProps) => (
  <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-red-500/30 bg-red-950/20 shadow-xl">
    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-3">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h3 className="text-base font-bold text-red-200">Không thể tải danh sách nhân viên</h3>
    <p className="mt-1 text-xs text-slate-300 max-w-md">
      {message || "Đã xảy ra lỗi khi kết nối tới máy chủ. Vui lòng kiểm tra đường truyền và thử lại."}
    </p>
    {errorCode && (
      <span className="mt-2 inline-block text-[11px] font-mono text-red-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/20">
        Mã lỗi: {errorCode}
      </span>
    )}
    <Button
      variant="secondary"
      size="sm"
      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
      onClick={onRetry}
      className="mt-5 text-xs font-semibold"
    >
      Thử lại ngay
    </Button>
  </div>
);
```

### ✅ D. Trạng Thái Dữ Liệu Chuẩn (Main Data View & Badges)
Đặc tả bảng nhân viên với Role Badge đổi màu và Quick Status Toggle:

```tsx
import { ShieldCheck, UserCheck, Edit3, KeyRound, Trash2 } from "lucide-react";
import { Badge, Button } from "@cardealer/ui";
import type { UserItem } from "../types/user-management.types";

interface UserTableRowProps {
  user: UserItem;
  currentUserId: string;
  onEdit: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onToggleStatus: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

export const UserTableRow = ({
  user,
  currentUserId,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: UserTableRowProps) => {
  const isSelf = user.id === currentUserId;

  const roleConfigs = {
    admin: { label: "Super Admin", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    manager: { label: "Quản Lý", color: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
    editor: { label: "Biên Tập", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    sales: { label: "Tư Vấn Viên", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  };

  return (
    <tr className="border-b border-white/5 hover:bg-slate-800/40 transition-colors group">
      {/* Cột 1: Thông tin nhân viên */}
      <td className="py-3 pl-5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-slate-300 font-bold shrink-0 shadow-inner">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              user.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-1.5">
              {user.fullName}
              {isSelf && (
                <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-1.5 py-0 rounded">
                  Bạn
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</div>
          </div>
        </div>
      </td>

      {/* Cột 2: Số điện thoại */}
      <td className="py-3 px-3.5 text-slate-300 text-xs font-mono whitespace-nowrap">
        {user.phone || "—"}
      </td>

      {/* Cột 3: Vai trò (RBAC Role) */}
      <td className="py-3 px-3.5 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleConfigs[user.role].color}`}>
          {roleConfigs[user.role].label}
        </span>
      </td>

      {/* Cột 4: Đăng nhập gần nhất */}
      <td className="py-3 px-3.5 text-slate-400 text-xs whitespace-nowrap">
        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("vi-VN") : "Chưa đăng nhập"}
      </td>

      {/* Cột 5: Trạng thái & Quick Toggle */}
      <td className="py-3 px-3.5 whitespace-nowrap">
        <button
          type="button"
          disabled={isSelf}
          onClick={() => onToggleStatus(user)}
          title={isSelf ? "Không thể tự khóa tài khoản của chính mình" : "Nhấn để Khóa / Mở khóa tài khoản tức thì"}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Badge
            variant={user.status === "active" ? "published" : "draft"}
            className="px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer select-none"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                user.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            {user.status === "active" ? "Hoạt Động" : "Đã Khóa"}
          </Badge>
        </button>
      </td>

      {/* Cột 6: Nút Hành Động */}
      <td className="py-3 pr-5 text-right whitespace-nowrap">
        <div className="inline-flex items-center justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(user)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            className="text-xs px-2.5 py-1"
          >
            Sửa
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onResetPassword(user)}
            aria-label="Đặt lại mật khẩu"
            className="text-xs px-2 py-1 text-amber-400 hover:text-amber-300"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </Button>
          {!isSelf && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(user)}
              aria-label="Xóa nhân viên"
              className="text-xs px-2 py-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};
```

---

## 3. Responsive Tokens & Touch Target Specs (Tuân Thủ WCAG AAA)

* **Mobile (375px):**
  * Layout 1 cột dọc (`grid-cols-1`).
  * Chiều cao nút bấm và input đạt chuẩn Apple/Google với class `h-11` (44px).
  * Ẩn các cột phụ trên mobile (*Số điện thoại*, *Đăng nhập gần nhất*), tập trung vào Avatar + Tên + Badge Vai trò + Nút hành động.
* **Tablet (768px):**
  * Layout 2 cột cho các thẻ KPI thống kê (`grid-cols-2`).
  * Padding chuẩn `p-4 sm:p-6`.
* **Desktop (1440px):**
  * Bảng dữ liệu 6 cột hiển thị đầy đủ, `table-layout: auto`, co giãn tự nhiên không scroll ngang không cần thiết.
  * Container độ rộng tối đa chuẩn Luxury Automotive `max-w-[1720px] mx-auto`.

---

## 4. Danh Mục Snapshot Spec Cho Visual QA (Phase 4 Verification)

- [ ] `SNAP-USER-01`: Viewport Mobile (375px) - Loading Skeleton Shimmer
- [ ] `SNAP-USER-02`: Viewport Mobile (375px) - Modal Thêm Mới Nhân Viên (Form Zod Validation)
- [ ] `SNAP-USER-03`: Viewport Desktop (1440px) - Bảng Danh Sách Nhân Viên (Đầy đủ 4 Role Badges & Status Pills)
- [ ] `SNAP-USER-04`: Viewport Desktop (1440px) - Màn Hình Hồ Sơ Cá Nhân (`/admin/profile` Đổi Mật Khẩu An Toàn)
- [ ] `SNAP-USER-05`: Viewport Desktop (1440px) - Giao diện Bị Chặn Quyền 403 Forbidden khi Sales truy cập `/users`
