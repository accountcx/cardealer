# 🧪 TEST PLAN: Static Pages CMS & Showroom System Settings

> **Module:** `static-pages`  
> **Căn cứ:** [`BACKLOG.md`](./BACKLOG.md), [`RISK_AUDIT.md`](./RISK_AUDIT.md)  

---

## 1. Ma Trận Kiểm Thử Tự Động (Automated Test Cases)

| Mã Test | Loại Kiểm Thử | Tệp Kiểm Thử / Vị Trí | Kịch Bản & Kỳ Vọng Kiểm Thử | Trạng Thái |
| :---: | :---: | :--- | :--- | :---: |
| **TC-01** | Unit Test | `packages/core/src/__tests__/static-pages-schema.test.ts` | Xác thực Zod Schema tạo trang tĩnh, chặn slug vi phạm danh sách cấm | ✅ PASSED |
| **TC-02** | Unit Test | `packages/core/src/__tests__/static-pages-validation.test.ts` | Kiểm tra tính hợp lệ của AST Content Tiptap và SchemaType | ✅ PASSED |
| **TC-03** | Unit Test | `packages/core/src/__tests__/static-page-json-ld.test.ts` | Sinh dữ liệu cấu trúc Schema `AboutPage`, `HowTo` cho Google | ✅ PASSED |
| **TC-04** | Unit Test | `packages/core/src/__tests__/settings-schemas.test.ts` | Xác thực cấu hình `ContactSettingsSchema` (hotline, email, địa chỉ) | ✅ PASSED |
| **TC-05** | Integration | `apps/api/src/routes/pages.ts` | Truy vấn trang có `is_published: false` $\rightarrow$ API trả về HTTP 404 | ✅ PASSED |
| **TC-06** | E2E Browser | `apps/web/app/(main)/[slug]/page.tsx` | Truy cập `/gioi-thieu` $\rightarrow$ trang tải đầy đủ nội dung, breadcrumb và thẻ meta | ✅ PASSED |

---

## 2. Lệnh Kiểm Chứng Bằng Máy (Deterministic Verification)

```bash
# 1. Chạy toàn bộ Unit Tests liên quan đến Static Pages & Settings
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
pnpm --filter @cardealer/core test

# 2. Kiểm tra tính đúng đắn của kiểu dữ liệu TypeScript
pnpm check-types
```
