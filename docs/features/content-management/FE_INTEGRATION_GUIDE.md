# 🎨 FRONTEND INTEGRATION GUIDE: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`API_SPEC.md`](./API_SPEC.md)  

---

## 1. Cấu Trúc Thành Phần Giao Diện (Component Hierarchy)

```
apps/web/app/tin-tuc/
├── page.tsx                     # Lưới bài viết tin tức & Top 3 bài ghim nổi bật
├── components/
│   ├── FeaturedPostBanner.tsx   # Banner bài viết số 1 nổi bật nhất
│   ├── PostCardGrid.tsx         # Lưới các bài viết thông thường
│   └── CategoryPillNav.tsx      # Thanh chuyển đổi nhanh chuyên mục
│
├── [slug]/
│   ├── page.tsx                 # Chi tiết bài viết toàn văn (SSR + TOC)
│   └── components/
│       ├── TableOfContents.tsx  # Mục lục tự động cuộn Sticky & Scrollspy
│       ├── TiptapBlockRenderer.tsx # Bộ kết xuất 8 Content Blocks ngữ nghĩa
│       ├── TikTokEmbed.tsx      # Khung video 9:16 tối ưu không thanh cuộn
│       └── AuthorBioCard.tsx    # Danh thiếp tư vấn viên E-E-A-T
```

---

## 2. Hệ Thống Biểu Tượng & Design Tokens

- **Icon Set (lucide-react):**
  - Đồng hồ đọc: `<Clock className="w-4 h-4 text-slate-400" />`
  - Lịch đăng: `<Calendar className="w-4 h-4 text-slate-400" />`
  - Tác giả: `<UserCheck className="w-4 h-4 text-sky-600" />`
  - Thẻ / Chuyên mục: `<Tag className="w-4 h-4 text-slate-500" />`
  - Mục lục bài viết: `<ListTree className="w-5 h-5 text-sky-600" />`
- **Tailwind Tokens:**
  - TOC Sticky Box: `sticky top-24 max-h-screen overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 p-4`
  - Post Card Title: `font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-sky-600 transition-colors`
  - Reading Time Pill: `inline-flex items-center text-xs text-slate-500 font-medium`

---

## 3. Ma Trận 4 Trạng Thái Giao Diện (4-State UI Matrix)

| Trạng Thái | Điều Kiện Kích Hoạt | Hành Vi Giao Diện | Thiết Kế Fallback |
| :--- | :--- | :--- | :--- |
| **Loading** | Đang tải danh sách bài viết hoặc toàn văn | Hiển thị 6 Skeleton Cards mô phỏng bài viết | `<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl h-64" /></div>` |
| **Empty** | Chuyên mục chưa có bài viết nào | Thông báo chuyên mục đang được cập nhật | `<div className="py-16 text-center text-slate-500"><p>Chưa có bài viết nào trong chuyên mục này.</p></div>` |
| **Error** | Bài viết không tồn tại (404) hoặc lỗi API | Hiển thị thông báo 404 thân thiện | `<div className="py-16 text-center"><h1 className="text-3xl font-bold mb-4">Bài viết không tồn tại</h1></div>` |
| **Success** | Tải bài viết thành công | Render toàn bộ nội dung Tiptap, TOC và bài liên quan | Render `TiptapBlockRenderer` mượt mà, đầy đủ hình ảnh WebP |

---

## 4. Chuẩn Mực Triển Khai Mã Nguồn
- Bắt buộc sử dụng **Named Export** (ví dụ: `export function TableOfContents(...)`).
- 100% tuân thủ **Tailwind Spacing Scale** tiêu chuẩn (tránh các arbitrary values tự do).
