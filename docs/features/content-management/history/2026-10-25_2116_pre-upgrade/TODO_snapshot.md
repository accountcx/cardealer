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
