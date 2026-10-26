# 📝 TODO: Content Management & Tiptap Editorial Engine

- [x] **US-01: Posts & Categories Management**
  - [x] Thiết kế schema `posts`, `categories`, `post_tags` trong `packages/database`.
  - [x] Xây dựng REST API routes trong `apps/api/src/routes/posts.ts`.
  - [x] Trang danh sách và form soạn thảo bài viết trong `apps/admin/app/posts/`.
  - [x] Quản trị danh mục tin tức trong `apps/admin/app/categories/`.
  - [x] Trợ lý tính điểm SEO `calculateSeoScore` trong `packages/core/src/seo/score.ts`.

- [x] **US-02: Tiptap Content Blocks & Cloudinary Media Library**
  - [x] Bảng `media` và API upload ảnh Cloudinary trong `apps/api/src/routes/admin/media.ts`.
  - [x] Bộ bóc tách Tiptap AST `tiptap-extractor` trong `packages/core/src/tiptap/`.
  - [x] Trình phát video TikTok tối ưu không thanh cuộn `TikTokBlock`.
  - [x] Giao diện hiển thị tin tức Storefront `/tin-tuc` và `/tin-tuc/[slug]` kèm mục lục TOC động.

- [x] **US-03: In-Editor Single Block AI Generation Engine**
  - [x] U-03.1: Nâng cấp và hoàn thiện `buildSingleBlockPrompt` và `response-transformer` trong `apps/api/src/services/ai/` đảm bảo bao phủ đầy đủ 14 loại Content Blocks (`paragraph`, `heading`, `callout`, `faq`, `prosCons`, `specTable`, `priceTable`, `ctaButton`, `leadForm`, `singleImage`).
  - [x] U-03.2: Mở rộng `usePostEditor` hook trong `apps/admin/app/posts/[id]/hooks/usePostEditor.ts`: thêm state `generatingBlockId` và hàm `handleGenerateSingleBlock(blockId: string, customInstruction?: string)`.
  - [x] U-03.3: Kết nối nút `AI Điền Khối Này` và trạng thái loading trong `BlockItemWrapper.tsx` và `apps/admin/app/posts/[id]/page.tsx`, hỗ trợ cả 1-Click Auto Fill và popover nhập chỉ đạo tùy biến.
  - [x] U-03.4: Tự động kích hoạt tính lại điểm SEO tức thì (`calculateSeoScore`) và lưu vết trạng thái bài viết sau khi khối được sinh.
  - [x] U-03.5: Kiểm thử và xác minh tính toàn vẹn (Zero Data Loss, Immutability of Block IDs, Graceful Error Handling).

- [x] **US-04: Paragraph Internal Links Engine**
  - [x] U-04.1: Nâng cấp `serializeTiptapDoc` và `deserializeTiptapDoc` trong `apps/admin/app/posts/[id]/ast.ts` hỗ trợ phân tích và tái tạo Markdown links `[anchor](url)` thành Tiptap mark `link`.
  - [x] U-04.2: Tối ưu `convertTiptapToHtml` trong `packages/core/src/tiptap/render-html.ts` để phân biệt link nội bộ (bắt đầu bằng `/`), không thêm `rel="nofollow"` và styling thẻ `<a>` chuẩn SEO.
  - [x] U-04.3: Nâng cấp `ParagraphBlock.tsx` trong `apps/admin`: tích hợp thanh công cụ gắn link 🔗, Quick Internal Link Chips (các dòng xe trong showroom & trang tiện ích) và modal/popover chọn link trực quan.
  - [x] U-04.4: Truyền `availableCars` vào `ParagraphBlock` trong `apps/admin/app/posts/[id]/page.tsx`.
  - [x] U-04.5: Viết Unit tests trong `packages/core/src/__tests__/tiptap-internal-links.test.ts` kiểm thử roundtrip serialization/deserialization và HTML rendering của internal links.

