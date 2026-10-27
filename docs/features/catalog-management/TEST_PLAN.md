# 🧪 TEST PLAN: Catalog & Vehicle Specification Engine

> **Module:** `catalog-management`  
> **Căn cứ:** [`BACKLOG.md`](./BACKLOG.md), [`RISK_AUDIT.md`](./RISK_AUDIT.md)  

---

## 1. Ma Trận Kiểm Thử Tự Động (Automated Test Cases)

| Mã Test | Loại Kiểm Thử | Tệp Kiểm Thử / Vị Trí | Kịch Bản & Kỳ Vọng Kiểm Thử | Trạng Thái |
| :---: | :---: | :--- | :--- | :---: |
| **TC-01** | Unit Test | `packages/core/src/__tests__/car-detail-schema.test.ts` | Xác thực Zod Schema chi tiết xe, đảm bảo bắt buộc các trường `tenXe`, `slug`, `segment` | ✅ PASSED |
| **TC-02** | Unit Test | `packages/core/src/__tests__/catalog-jsonld.test.ts` | Kiểm tra bộ sinh dữ liệu có cấu trúc `Product` Schema cho Google Rich Results | ✅ PASSED |
| **TC-03** | Unit Test | `packages/core/src/__tests__/redirects.test.ts` | Xác thực cơ chế điều hướng 301 tự động khi slug xe hoặc chuyên mục thay đổi | ✅ PASSED |
| **TC-04** | Integration | `apps/api/src/routes/catalog.ts` | Gọi `GET /api/catalog/cars` kiểm tra trả về danh sách xe có status `published` | ✅ PASSED |
| **TC-05** | Integration | `apps/api/src/routes/catalog.ts` | Gọi `GET /api/catalog/cars/:slug` với slug không tồn tại $\rightarrow$ trả về HTTP 404 | ✅ PASSED |
| **TC-06** | E2E Browser | `apps/web/app/xe/[slug]/page.tsx` | Khách click chọn từng nút swatch màu $\rightarrow$ ảnh đổi mượt mà, query param cập nhật | ✅ PASSED |
| **TC-07** | Unit Test | `packages/core/src/__tests__/catalog-jsonld.test.ts` | Kiểm tra `generateCatalogJsonLd` sinh ItemList có `@id` và `url` cấp cao nhất cho từng item | ⏳ TO IMPLEMENT |
| **TC-08** | Unit Test | `packages/core/src/__tests__/catalog-jsonld.test.ts` | Kiểm tra hàm `sanitizePromotionSummary` lọc sạch 100% prompt nhắc việc trong ngoặc đơn | ⏳ TO IMPLEMENT |
| **TC-09** | Unit Test | `packages/core/src/__tests__/breadcrumb-schema.test.ts` | Kiểm tra Breadcrumbs JSON-LD sinh 100% Absolute URL (`https://...`), position 1 có trailing slash | ⏳ TO IMPLEMENT |
| **TC-10** | Database Verification | `packages/database/src/scripts/clean-promotion-summaries.ts` | Quét sạch 100% ghi chú prompt ngoặc đơn trong trường `cars.promotion_summary` trên PostgreSQL | ⏳ TO RUN |

---

## 2. Lệnh Kiểm Chứng Bằng Máy (Deterministic Verification)

```bash
# 1. Chạy toàn bộ Unit Tests liên quan đến Catalog
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
pnpm --filter @cardealer/core test

# 2. Kiểm tra tính đúng đắn của kiểu dữ liệu TypeScript
pnpm check-types
```
