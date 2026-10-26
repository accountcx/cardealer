# 🔄 FLOW: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Tài liệu tham chiếu:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md)  

---

## 1. Sơ Đồ Trạng Thái Bài Viết (Post Status State Machine)

```mermaid
stateDiagram-v2
    [*] --> Draft : Tạo mới bài viết
    Draft --> Published : Xuất bản ngay
    Draft --> Scheduled : Đặt lịch hẹn giờ đăng
    Scheduled --> Published : Đến thời điểm hẹn giờ
    Published --> Draft : Hạ bài xuống nháp
    Published --> Archived : Lưu trữ / Hết hạn
    Archived --> Published : Tái xuất bản
    Draft --> [*] : Xóa bài viết
```

---

## 2. Sequence Diagram: Tải Trang Chi Tiết Bài Viết & Bóc Tách Mục Lục TOC

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Browser)
    participant Storefront as Next.js Storefront (apps/web)
    participant Backend as Backend API (apps/api)
    participant DB as PostgreSQL Database

    Customer->>Storefront: Truy cập /tin-tuc/danh-gia-hyundai-santa-fe-2026
    Storefront->>Backend: GET /api/posts/danh-gia-hyundai-santa-fe-2026
    Backend->>DB: SELECT * FROM posts JOIN categories JOIN users WHERE slug = ?
    DB-->>Backend: Post Row đầy đủ
    Backend-->>Storefront: HTTP 200 OK (Post Data + AST Content)
    Storefront->>Storefront: Tiptap AST bóc tách Heading 2, Heading 3 sinh Table of Contents
    Storefront->>Storefront: Render bài viết kèm TOC cuộn Sticky và tác giả E-E-A-T
    Storefront-->>Customer: Trả về trang bài viết hoàn chỉnh với điểm SEO tối ưu
```

---

## 3. Sequence Diagram: Tải Ảnh Lên Cloudinary Media Library

```mermaid
sequenceDiagram
    autonumber
    actor Editor as Biên Tập Viên (Admin CMS)
    participant AdminApp as Admin Portal (apps/admin)
    participant Backend as Backend API (apps/api)
    participant Cloudinary as Cloudinary Media Cloud
    participant DB as PostgreSQL Database

    Editor->>AdminApp: Kéo thả file ảnh & nhập Alt Text chuẩn SEO
    AdminApp->>Backend: POST /api/admin/media/upload (Multipart/form-data)
    Backend->>Backend: Kiểm tra định dạng (JPEG, PNG, WebP) và dung lượng (< 10MB)
    Backend->>Cloudinary: Upload stream & tự động chuyển sang WebP
    Cloudinary-->>Backend: Upload Result { secure_url, public_id, width, height }
    Backend->>DB: INSERT INTO media (url, public_id, alt, width, height)
    DB-->>Backend: Media Row created
    Backend-->>AdminApp: HTTP 201 Created (Media Object)
    AdminApp-->>Editor: Chèn ảnh trực tiếp vào vị trí con trỏ của bài viết Tiptap
```

---

## 4. Sequence Diagram: Trợ Lý AI Điền Khối Nội Dung (In-Editor Single Block Generation)

```mermaid
sequenceDiagram
    autonumber
    actor Editor as Biên Tập Viên (Admin CMS)
    participant BlockUI as BlockItemWrapper (Khối k)
    participant PostEditor as usePostEditor Hook
    participant AdminRoute as Route Handler (/api/admin/ai/generate)
    participant BackendAPI as Backend API Server (apps/api)
    participant OpenAISvc as OpenAI Client & Prompt Builder
    participant OpenAI as OpenAI API (api.openai.com)

    Editor->>BlockUI: Nhấp "AI Điền Khối Này" (kèm prompt tùy chọn hoặc 1-Click)
    BlockUI->>PostEditor: handleGenerateSingleBlock(blockId, customInstruction)
    PostEditor->>PostEditor: Set generatingBlockId = blockId (Bật Spinner cô lập trên khối)
    PostEditor->>PostEditor: Trích xuất ngữ cảnh bài viết (tiêu đề, focusKeyword, dòng xe, khối lân cận)
    PostEditor->>AdminRoute: POST /api/admin/ai/generate (action: generate_single_block, prompt: block.type, context)
    AdminRoute->>BackendAPI: Forward request (Timeout 120s)
    BackendAPI->>BackendAPI: Kiểm tra quyền 'posts:write' & Validate Zod Schema
    BackendAPI->>OpenAISvc: buildSingleBlockPrompt(block.type, context, carData)
    OpenAISvc->>OpenAI: POST /v1/chat/completions (response_format: json_object)
    OpenAI-->>OpenAISvc: JSON Block Structure đầy đủ
    OpenAISvc->>BackendAPI: Chuẩn hóa & đối soát dữ liệu xe (normalizeAndEnrichBlocks)
    BackendAPI-->>AdminRoute: HTTP 200 OK ({ success: true, data: { blocks: [enrichedBlock] } })
    AdminRoute-->>PostEditor: Payload khối hoàn thiện
    PostEditor->>PostEditor: Cập nhật fields của khối k (giữ nguyên blockId và thứ tự bài viết)
    PostEditor->>PostEditor: calculateSeoScore() tính toán lại điểm SEO real-time
    PostEditor->>PostEditor: Set generatingBlockId = null (Tắt Spinner)
    PostEditor-->>BlockUI: Re-render khối k với nội dung giàu thông tin
    PostEditor-->>Editor: Toast thông báo "Đã sinh nội dung AI cho khối thành công!"
```

---

## 5. Sequence Diagram: Chèn & Bóc Tách Liên Kết Nội Bộ Trong Đoạn Văn Bản (Internal Links Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Editor as Biên Tập Viên
    participant UI as ParagraphBlock (Studio)
    participant AST as ast.ts (serialize/deserialize)
    participant Core as render-html.ts (@cardealer/core)
    participant Web as Storefront Article (/tin-tuc/[slug])

    Editor->>UI: Nhập văn bản hoặc bôi đen từ khóa "Hyundai Santa Fe 2026"
    Editor->>UI: Bấm Quick Chip hoặc nút Link 🔗 -> Chọn "/dong-xe/santa-fe"
    UI->>UI: Chèn cú pháp "[Hyundai Santa Fe 2026](/dong-xe/santa-fe)" vào Textarea
    Editor->>AST: Lưu bài viết (gọi serializeTiptapDoc)
    AST->>AST: Parse Regex Markdown Links -> Tách thành mảng Text Nodes kèm Link Marks
    AST-->>Core: Lưu JSON AST Tree vào PostgreSQL (noi_dung)
    Web->>Core: Khách truy cập bài viết -> convertTiptapToHtml(noiDung)
    Core->>Core: Nhận diện link bắt đầu bằng "/" -> Render <a href="/dong-xe/santa-fe"> chuẩn SEO (không nofollow)
    Core-->>Web: Kết xuất HTML mượt mà, gia tăng Internal Link Equity
```

---

## 6. Sequence Diagram: Trợ Lý AI Gợi Ý Ý Tưởng Chống Trùng Lặp (Topic Ideation Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Editor as Biên Tập Viên
    participant Modal as AiTopicIdeatorModal (Admin)
    participant API as /api/admin/ai/generate (Backend)
    participant DB as PostgreSQL (posts + cars)
    participant OpenAI as OpenAI LLM (gpt-4o-mini / gpt-4o)
    participant EditorPage as /posts/new (Post Editor)

    Editor->>Modal: Bấm "✨ AI Gợi Ý Ý Tưởng" -> Chọn Dòng xe, Chuyên mục, Góc nhìn
    Editor->>Modal: Bấm "Tạo Ý Tưởng Mới"
    Modal->>API: POST /api/admin/ai/generate { action: "generate_topic_ideas", carModel, category, angle }
    API->>DB: Query tất cả bài viết đã có (posts draft/published & car_articles)
    DB-->>API: Danh sách bài viết hiện có (tieuDe, focusKeyword, tomTat, dongXe)
    API->>API: Định dạng danh sách Blacklist / Negative Grounding chống trùng lặp
    API->>OpenAI: Gửi Prompt chuyên biệt SEO Content Gap & Yêu cầu sinh 3-5 ý tưởng độc bản
    OpenAI-->>API: Trả về JSON { topicIdeas: [...] }
    API->>API: Post-generation Deduplication Check (Đối soát token overlap với DB)
    API-->>Modal: Trả về HTTP 200 { success: true, data: { topicIdeas: [...] } }
    Modal-->>Editor: Hiển thị danh sách Idea Cards (Góc nhìn, Tiêu đề, Từ khóa, Dàn ý)
    Editor->>Modal: Bấm "Viết Bài Với Ý Tưởng Này" trên Card mong muốn
    Modal->>EditorPage: Điều hướng sang /posts/new với query params hoặc pre-filled state
    EditorPage-->>Editor: Form bài viết mới đã điền sẵn Tiêu đề, Focus Keyword, Tóm tắt, Dòng xe!
```
