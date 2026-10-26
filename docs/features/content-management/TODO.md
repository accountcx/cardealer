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
