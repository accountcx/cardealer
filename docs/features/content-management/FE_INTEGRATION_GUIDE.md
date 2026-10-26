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

### 🔹 Ma Trận 4 Trạng Thái Cho AI Single Block Generation (`BlockItemWrapper`)
| Trạng Thái | Điều Kiện | Hành Vi Giao Diện | Thiết Kế Fallback |
| :--- | :--- | :--- | :--- |
| **Idle** | Khối bình thường chưa bấm sinh | Nút `AI Điền Khối Này` viền vàng hổ phách `border-amber-500/30 text-amber-400` sẵn sàng | Hiển thị icon Sparkles và nhãn |
| **Generating** | `generatingBlockId === block.id` | Nút chuyển sang Spinner xoay tròn, `disabled`, nhãn đổi thành `Đang sinh nội dung...` | Khối nội dung giữ nguyên trạng thái cũ cho tới khi hoàn tất |
| **Error** | API trả về lỗi hoặc timeout | Nút hồi phục trạng thái Idle, hiển thị Toast đỏ thông báo lỗi | Không làm mất dữ liệu hiện tại của khối |
| **Success** | API trả về cấu trúc block hợp lệ | Tự động điền dữ liệu vào form của khối, tính lại điểm SEO, Toast xanh báo thành công | Tự động highlight nhẹ viền khối trong 1 giây |

---

## 4. Admin Post Editor AI Block Generation Controls

- **Vị trí tích hợp:** Header của từng khối nội dung bên trong [`BlockItemWrapper.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/posts/[id]/components/BlockItemWrapper.tsx).
- **Hành vi người dùng:**
  1. **Quick 1-Click:** Nhấp trực tiếp nút "AI Điền Khối Này" $\rightarrow$ tự động thu thập `tieuDe`, `focusKeyword`, `carModel` và loại block để gọi `handleGenerateSingleBlock(block.id)`.
  2. **Tùy biến chỉ đạo (Optional Popover):** Có thể nhập thêm gợi ý ngắn (ví dụ: "Viết đoạn văn ngắn 3 câu tập trung vào mức tiêu hao nhiên liệu đường trường") trước khi gửi lệnh.
- **Hook điều phối:** [`usePostEditor.ts`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/posts/[id]/hooks/usePostEditor.ts) quản lý `generatingBlockId` và hàm `handleGenerateSingleBlock`.

---

## 5. Cấu Trúc Khối Đoạn Văn Bản Kèm Gắn Link Nội Bộ (ParagraphBlock & Internal Links)

- **Vị trí tích hợp:** [`ParagraphBlock.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/posts/[id]/components/blocks/ParagraphBlock.tsx) trong Studio Soạn thảo.
- **Thanh công cụ Toolbar phía trên Textarea:**
  - Nút **`🔗 Gắn link nội bộ`**: Mở Popover / Modal cho phép chọn trang đích từ danh mục Showroom (dòng xe, tiện ích hoặc đường dẫn tùy chỉnh).
  - Tự động lấy đoạn text đang được bôi đen (selection) trong Textarea để làm anchor text mặc định.
- **Thanh Quick Chips phía dưới Textarea:**
  - Hiển thị các nút tắt tiện lợi:
    - `+ [Bảng Giá Xe]` (`/bang-gia-xe`)
    - `+ [Dự Toán Trả Góp]` (`/du-toan-chi-phi`)
    - `+ [Liên Hệ Báo Giá]` (`/lien-he`)
    - Các chip dòng xe trong showroom: `+ [Santa Fe]`, `+ [Tucson]`, `+ [Creta]`, `+ [Accent]`...
  - Bấm vào chip $\rightarrow$ tự động chèn cú pháp Markdown `[Tên](/duong-dan)` vào ngay vị trí con trỏ trong Textarea.
- **Kết xuất trên Storefront:**
  - `convertTiptapToHtml` nhận diện link bắt đầu bằng `/` $\rightarrow$ render thẻ `<a href="/...">` có styling `text-blue-600 hover:text-blue-800 underline font-medium hover:underline`.
  - Không thêm `rel="nofollow"` cho internal links để bảo toàn luồng PageRank nội bộ.

---

## 6. Giao Diện Trợ Lý AI Gợi Ý Ý Tưởng Bài Viết (AiTopicIdeatorModal)

- **Vị trí tích hợp:**
  - Header trang Danh sách bài viết [`apps/admin/app/posts/page.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/posts/page.tsx) cạnh nút "Viết bài mới".
  - Trang tạo bài mới [`apps/admin/app/posts/[id]/page.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/posts/[id]/page.tsx).
- **Bộ điều khiển (Controls):**
  - Select Dòng xe: Lấy từ `availableCars` (hoặc "Tất cả dòng xe").
  - Select Chuyên mục: Lấy từ `categories`.
  - Input Định hướng / Góc nhìn tùy chọn.
- **Ma trận 4 Trạng Thái (4-State Matrix):**
  - **Loading:** Skeleton 3 thẻ ý tưởng nhấp nháy ánh vàng amber kèm thông điệp đối soát kho bài viết.
  - **Empty:** Khi chưa bấm sinh hoặc chưa có kết quả: Minh họa biểu tượng bóng đèn sáng tạo cùng hướng dẫn.
  - **Error:** Banner lỗi thân thiện kèm nút "Thử lại".
  - **Success:** Lưới các Idea Cards sắc nét, mỗi Card có Badge góc nhìn, Tiêu đề, Từ khóa chính, Khoảng trống nội dung giải quyết, Tóm tắt và nút 1-Click "Viết bài theo ý tưởng này".
- **Hành vi 1-Click "Viết bài theo ý tưởng này":**
  - Nếu ở trang `/posts`: Chuyển hướng sang `/posts/new?title=...&keyword=...&slug=...&summary=...&carSlug=...`.
  - Nếu ở trang `/posts/new`: Điền trực tiếp các trường trong form và mở Toast thông báo sẵn sàng.

---

## 7. Chuẩn Mực Triển Khai Mã Nguồn
- Bắt buộc sử dụng **Named Export** (ví dụ: `export function AiTopicIdeatorModal(...)`).
- 100% tuân thủ **Tailwind Spacing Scale** tiêu chuẩn (tránh các arbitrary values tự do).
