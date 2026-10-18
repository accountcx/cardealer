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

---

## 2. Lệnh Kiểm Chứng Bằng Máy (Deterministic Verification)

```bash
# 1. Chạy toàn bộ Unit Tests liên quan đến Posts & Tiptap Blocks
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
pnpm --filter @cardealer/core test

# 2. Kiểm tra tính đúng đắn của kiểu dữ liệu TypeScript
pnpm check-types
```
