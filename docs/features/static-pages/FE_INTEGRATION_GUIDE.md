# 🎨 FRONTEND INTEGRATION GUIDE: Static Pages CMS & Showroom System Settings

> **Module:** `static-pages`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`API_SPEC.md`](./API_SPEC.md)  

---

## 1. Cấu Trúc Thành Phần Giao Diện (Component Hierarchy)

```
apps/web/app/(main)/[slug]/
├── page.tsx                     # Dynamic catch-all SSR page cho trang tĩnh
└── components/
    ├── StaticPageRenderer.tsx   # Renderer AST Tiptap ra HTML ngữ nghĩa chuẩn
    ├── Breadcrumbs.tsx          # Thanh điều hướng Breadcrumbs E-E-A-T
    └── ContactSidebar.tsx       # Cột danh thiếp showroom & tư vấn viên nhanh

apps/admin/app/pages/
├── page.tsx                     # Bảng danh sách trang tĩnh
└── [id]/page.tsx                # Trình soạn thảo trang tĩnh & Technical SEO Form
```

---

## 2. Hệ Thống Biểu Tượng & Design Tokens

- **Icon Set (lucide-react):**
  - Tài liệu / Trang: `<FileText className="w-4 h-4 text-sky-600" />`
  - Khóa bảo mật / Chính sách: `<ShieldCheck className="w-4 h-4 text-emerald-600" />`
  - Đang xuất bản: `<Eye className="w-4 h-4 text-emerald-600" />`
  - Bản nháp: `<EyeOff className="w-4 h-4 text-slate-400" />`
  - Cài đặt hệ thống: `<Settings className="w-4 h-4 text-slate-600" />`
- **Tailwind Tokens:**
  - Prose Typography: `prose prose-slate max-w-none dark:prose-invert`
  - Heading 1: `text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-6`
  - Section Container: `max-w-4xl mx-auto px-4 py-12`

---

## 3. Ma Trận 4 Trạng Thái Giao Diện (4-State UI Matrix)

| Trạng Thái | Điều Kiện Kích Hoạt | Hành Vi Giao Diện | Thiết Kế Fallback |
| :--- | :--- | :--- | :--- |
| **Loading** | Đang tải nội dung trang tĩnh từ Server | Hiển thị Skeleton bài viết với tiêu đề và các dòng đoạn văn | `<div className="animate-pulse space-y-4 max-w-4xl mx-auto"><div className="h-8 bg-slate-200 rounded w-2/3" /><div className="h-4 bg-slate-200 rounded w-full" /></div>` |
| **Empty** | Nội dung trang rỗng | Hiển thị thông báo bài viết đang được biên tập | `<div className="py-16 text-center text-slate-500"><p>Nội dung trang này đang được cập nhật.</p></div>` |
| **Error** | Trang không tồn tại (404) hoặc lỗi 500 | Hiển thị trang 404 thân thiện kèm nút về Trang Chủ | `<div className="py-16 text-center"><h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1><p className="text-slate-600 mb-6">Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển dời.</p></div>` |
| **Success** | Tải trang thành công | Render toàn bộ nội dung HTML có định dạng và nhúng Schema JSON-LD | Render `StaticPageRenderer` mượt mà, hỗ trợ cả Dark mode và Responsive |

---

## 4. Chuẩn Mực Triển Khai Mã Nguồn
- Bắt buộc sử dụng **Named Export** (ví dụ: `export function StaticPageRenderer(...)`).
- 100% tuân thủ **Tailwind Spacing Scale** tiêu chuẩn (tránh các arbitrary values tự do).
