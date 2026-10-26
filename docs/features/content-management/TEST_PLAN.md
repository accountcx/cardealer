# 🧪 TEST PLAN: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Căn cứ:** [`BACKLOG.md`](./BACKLOG.md), [`RISK_AUDIT.md`](./RISK_AUDIT.md)  

---

## 1. Ma Trận Kiểm Thử Tự Động (Automated Test Cases)

| Mã Test | Loại Kiểm Thử | Tệp Kiểm Thử / Vị Trí | Kịch Bản & Kỳ Vọng Kiểm Thử | Trạng Thái |
| :---: | :---: | :--- | :--- | :---: |
| **TC-01** | Unit Test | `packages/core/src/__tests__/post-jsonld.test.ts` | Sinh Schema JSON-LD `NewsArticle` cho Google đầy đủ ảnh và tác giả | ✅ PASSED |
| **TC-02** | Unit Test | `packages/core/src/__tests__/seo-score.test.ts` | Tính toán điểm SEO chính xác dựa trên độ dài tiêu đề và mật độ từ khóa | ✅ PASSED |
| **TC-03** | Unit Test | `packages/core/src/__tests__/tiptap-extractor.test.ts` | Bóc tách tiêu đề H2, H3 từ Tiptap AST sinh Table of Contents (TOC) | ✅ PASSED |
| **TC-04** | Unit Test | `packages/core/src/__tests__/render-html-security.test.ts` | Khử sạch thẻ nguy hiểm `<script>`, `onerror` chống XSS khi render bài viết | ✅ PASSED |
| **TC-05** | Integration | `apps/api/src/routes/posts.ts` | Gọi `GET /api/posts` trả về danh sách bài viết phân trang chuẩn | ✅ PASSED |
| **TC-06** | E2E Browser | `apps/web/app/tin-tuc/[slug]/page.tsx` | Cuộn chuột trong bài viết $\rightarrow$ TOC tự động highlight đúng mục đang đọc | ✅ PASSED |
| **TC-07** | Unit Test | `apps/api/src/services/ai/__tests__/single-block.test.ts` | Prompt builder & response transformer sinh đúng cấu trúc block cho 10 loại blocks | 🟡 Sẵn sàng chạy |
| **TC-08** | Integration | `apps/api/src/routes/admin/ai.ts` | POST `/api/admin/ai/generate` với `generate_single_block` trả về HTTP 200 kèm block data | 🟡 Sẵn sàng chạy |
| **TC-09** | Hook Test | `apps/admin/app/posts/[id]/hooks/__tests__/usePostEditor.test.ts` | `handleGenerateSingleBlock` cập nhật đúng khối $k$, bảo toàn ID & thứ tự mảng blocks | 🟡 Sẵn sàng chạy |
| **TC-10** | E2E UI Test | `apps/admin/app/posts/[id]/page.tsx` | Nút "AI Điền Khối Này" có spinner cô lập, gọi API thành công và tính lại SEO score | 🟡 Sẵn sàng chạy |
| **TC-11** | Unit Test | `packages/core/src/__tests__/tiptap-internal-links.test.ts` | `serializeTiptapDoc` parse chính xác `[anchor](url)` thành text nodes có mark link | ✅ PASSED |
| **TC-12** | Unit Test | `packages/core/src/__tests__/tiptap-internal-links.test.ts` | `deserializeTiptapDoc` tái tạo lại cú pháp `[anchor](url)` nguyên vẹn từ Tiptap AST | ✅ PASSED |
| **TC-13** | Unit Test | `packages/core/src/__tests__/tiptap-internal-links.test.ts` | `convertTiptapToHtml` kết xuất `<a href="/...">` chuẩn SEO, bảo toàn PageRank nội bộ | ✅ PASSED |
| **TC-14** | Unit Test | `packages/core/src/__tests__/tiptap-internal-links.test.ts` | Xử lý an toàn khi anchor hoặc url chứa ký tự đặc biệt XSS hoặc protocol nguy hại (`javascript:`) | ✅ PASSED |
| **TC-15** | Unit Test | `apps/api/src/services/ai/__tests__/topic-ideas.test.ts` | Prompt Builder `buildTopicIdeasPrompt` nạp Negative Grounding cấm trùng lặp với danh sách bài viết hiện có | 🟡 Sẵn sàng chạy |
| **TC-16** | Unit Test | `apps/api/src/services/ai/__tests__/topic-ideas.test.ts` | Thuật toán Deduplication Check loại bỏ ý tưởng trùng lặp từ khóa / tiêu đề với database | 🟡 Sẵn sàng chạy |
| **TC-17** | Unit Test | `apps/api/src/services/ai/__tests__/topic-ideas.test.ts` | Response Transformer chuẩn hóa danh sách `TopicIdeaItem[]` đầy đủ thuộc tính và search intent | 🟡 Sẵn sàng chạy |
| **TC-18** | Integration / UI | `apps/admin/app/posts/` | `AiTopicIdeatorModal` hiển thị Idea Cards sinh động và 1-Click chuyển tiếp sang form `/posts/new` | 🟡 Sẵn sàng chạy |

---

## 2. Lệnh Kiểm Chứng Bằng Máy (Deterministic Verification)

```bash
# 1. Chạy toàn bộ Unit Tests liên quan đến Posts & Tiptap Blocks
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
pnpm --filter @cardealer/core test

# 2. Kiểm tra tính đúng đắn của kiểu dữ liệu TypeScript
pnpm check-types
```
