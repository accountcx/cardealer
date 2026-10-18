# 🌐 Frontend Integration & Modern UI Specification: Quản Trị Chuyên Mục (Admin Categories Management)

## 1. Cấu Trúc Thành Phần Giao Diện (Component Hierarchy)

Được tích hợp trực tiếp vào cấu trúc Monorepo `apps/admin` và tận dụng Design System `@cardealer/ui`:

```text
apps/admin/
├── app/
│   ├── categories/
│   │   ├── page.tsx               # CategoriesPage: Controller, Data Table, 4-State Matrix
│   │   ├── CategoryModal.tsx      # Modal Tạo & Chỉnh sửa Chuyên mục (Auto-slug + Manual Edit)
│   │   └── DeleteCategoryModal.tsx # Modal Xác nhận Xóa Chuyên mục (Dual-Layer Restrict Guard)
│   └── components/
│       └── AdminShell.tsx         # Bổ sung menu "Chuyên Mục Tin Tức" (Folder icon, posts:read)
├── services/
│   └── category.service.ts        # Typed API Service tương tác /api/admin/categories
└── utils/
    └── slugify.ts                 # Tiện ích chuyển đổi tiếng Việt có dấu sang slug ASCII chuẩn SEO
```

---

## 2. Tiêu Chuẩn Kỹ Thuật UI/UX & Design Tokens

1. **100% Named Export Policy:**
   - Toàn bộ Component (`CategoriesPage`, `CategoryModal`, `DeleteCategoryModal`) và hàm tiện ích đều sử dụng **Named Export** (song hành cùng `default` cho file `page.tsx` Next.js App Router).
2. **Icon System Đồng Nhất:**
   - Sử dụng độc quyền thư viện `lucide-react`: `FolderTree`, `Plus`, `Search`, `Edit`, `Trash2`, `AlertTriangle`, `CheckCircle2`, `Clock`, `FileText`, `RefreshCw`.
3. **Tailwind Spacing & Design System Tokens:**
   - Background chuẩn Dark Portal: `bg-[#0B0F17]`, card bề mặt `bg-slate-900/60 backdrop-blur-xl border border-white/10`.
   - Màu nhấn thương hiệu Hyundai: `#0072CE` (Hyundai Active Blue) và `#002C6C` (Navy Heritage).
   - Tuyệt đối tuân thủ bội số 4px của Tailwind: `h-11`, `px-4`, `py-2.5`, `rounded-xl`.
4. **Khả Năng Tiếp Cận & Reduced Motion (WCAG AAA):**
   - Mọi hiệu ứng chuyển cảnh: `transition-all duration-200 motion-reduce:transition-none motion-reduce:transform-none`.
   - Focus rings rõ nét: `focus:ring-2 focus:ring-[#0072CE] focus:outline-none`.

---

## 3. Ma Trận 4 Trạng Thái UI (4-State UI Matrix)

| Trạng Thái | Điều Kiện Kích Hoạt | Biểu Hiện Giao Diện & Micro-Interactions |
| :--- | :--- | :--- |
| **1. Loading State** | Đang gọi API lấy danh mục (`loading = true`) | Bảng Skeleton Shimmer gồm 5 hàng mô phỏng cấu trúc cột (Tên, Slug, Số bài, Thứ tự, Ngày tạo, Nút bấm) triệt tiêu hoàn toàn Layout Shift (CLS = 0). |
| **2. Empty State** | Dữ liệu trả về mảng rỗng `[]` | Khung bo tròn kính mờ với icon `FolderTree` xám nhạt, thông điệp: *"Chưa có chuyên mục nào được tạo"*, kèm nút bấm CTA xanh dương: `+ Thêm Chuyên Mục Đầu Tiên`. |
| **3. Error State** | Lỗi mạng, 401 hoặc 500 từ API server | Banner cảnh báo viền đỏ (`border-red-500/20 bg-red-500/10`), hiển thị chi tiết mã lỗi và thông báo tiếng Việt kèm nút bấm `Thử Lại` (`onRetry`). |
| **4. Data State** | Nhận dữ liệu thành công (`data.length > 0`) | Bảng dữ liệu hoàn chỉnh, badge số bài viết màu lam nhạt, hover làm sáng hàng `hover:bg-white/[0.02]`, nút Sửa & Xóa sẵn sàng thao tác. |

---

## 4. Chi Tiết Các Component Cốt Lõi

### 🔹 Component 1: `CategoryModal.tsx` (Auto-slug & Manual Edit)
* **Giao diện:** Modal kính mờ mở ra giữa màn hình.
* **Các trường dữ liệu:**
  1. **Tên Chuyên Mục (`tenChuyenMuc`):** Input text bắt buộc, autofocus.
  2. **Đường Dẫn Slug (`slug`):**
     - Mặc định: Tự động cập nhật theo tên chuyên mục khi gõ (sử dụng hàm `slugifyVN`).
     - Tùy biến: Có nút icon cây bút hoặc click thẳng vào ô để sửa thủ công. Khi Admin sửa thủ công, cờ `isManualSlug = true` được kích hoạt để ngừng ghi đè tự động.
     - Validation vi mô: Hiển thị preview URL dạng: `https://xehyundaivinh.com/tin-tuc?category=slug-preview`.
  3. **Thứ Tự Hiển Thị (`sortOrder`):** Input number, mặc định 0.
  4. **Mô Tả SEO (`moTa`):** Textarea hỗ trợ mô tả chuyên mục phục vụ Google Bot.
* **Xử lý phản hồi lỗi từ API:**
  - Nếu API trả về `409 SLUG_CONFLICT`: Viền ô Slug lập tức đổi sang màu đỏ kèm thông báo lỗi rõ ràng bên dưới: *"Slug này đã tồn tại trên hệ thống, vui lòng chọn một slug khác."*

---

### 🔹 Component 2: `DeleteCategoryModal.tsx` (Chặn Xóa An Toàn)
* **Giao diện:** Modal cảnh báo với icon tam giác vàng `AlertTriangle`.
* **Logic phân nhánh theo `postCount`:**
  - **Trường hợp `postCount > 0` (Bị chặn):**
    - Tiêu đề: `Không Thể Xóa Chuyên Mục Này`
    - Nội dung: `Chuyên mục "${category.tenChuyenMuc}" hiện đang có ${category.postCount} bài viết liên kết. Quy định an toàn dữ liệu không cho phép xóa chuyên mục đang chứa nội dung. Vui lòng chuyển các bài viết sang chuyên mục khác trước khi thực hiện xóa.`
    - Nút bấm: Chỉ có duy nhất 1 nút `Đã Hiểu (Đóng)` — **Không có nút Xác nhận xóa**.
  - **Trường hợp `postCount === 0` (Cho phép xóa):**
    - Tiêu đề: `Xác Nhận Xóa Chuyên Mục`
    - Nội dung: `Bạn có chắc chắn muốn xóa chuyên mục "${category.tenChuyenMuc}"? Thao tác này không thể khôi phục.`
    - Nút bấm: Nút `Hủy` (xám) và nút `Xóa Vĩnh Viễn` (đỏ với hiệu ứng xoay spinner khi đang xóa).

---

### 🔹 Component 3: Cập Nhật Sidebar Điều Hướng ([`AdminShell.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/components/AdminShell.tsx))
Bổ sung một mục menu độc lập ngay bên dưới hoặc cùng nhóm với Bài viết:
```typescript
{
  label: 'Chuyên Mục Tin Tức',
  href: '/categories',
  icon: <FolderTree size={18} />,
  permission: 'posts:read',
  active: pathname.startsWith('/categories'),
}
```

---

## 5. Mock Data Test Client Khởi Tạo

```typescript
export const MOCK_CATEGORIES_DATA: CategoryItemWithCount[] = [
  {
    id: 'cat-1',
    tenChuyenMuc: 'Đánh Giá Xe',
    slug: 'danh-gia-xe',
    moTa: 'Đánh giá chi tiết ngoại thất, nội thất và vận hành xe Hyundai',
    sortOrder: 1,
    postCount: 12,
    createdAt: '2026-08-15T08:30:00.000Z',
    updatedAt: '2026-09-20T10:15:00.000Z',
  },
  {
    id: 'cat-2',
    tenChuyenMuc: 'Tin Khuyến Mãi',
    slug: 'tin-khuyen-mai',
    moTa: 'Ưu đãi lệ phí trước bạ và khuyến mãi tiền mặt hàng tháng',
    sortOrder: 2,
    postCount: 0, // Danh mục này được phép xóa
    createdAt: '2026-08-16T09:00:00.000Z',
    updatedAt: '2026-09-22T14:20:00.000Z',
  },
];
```
