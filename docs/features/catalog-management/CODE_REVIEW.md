# 🔍 CODE REVIEW REPORT (9 LAYERS OF DEFENSE)

> **Module:** `catalog-management`  
> **Lát cắt:** `US-04: Google Schema Optimization (BreadcrumbList & ItemList) & Promotion Data Hygiene`  
> **Đánh giá viên:** Independent Adversarial Reviewer  
> **Trạng thái:** ✅ **APPROVED (TẤT CẢ 9 LAYER ĐẠT CHUẨN)**  

---

## 1. Chi Tiết Rà Soát Theo 9 Lớp Phòng Thủ (9 Layers of Defense)

### Layer 1: Data Contract & Persistence
- **Schema & Migration:** Không thêm cột mới gây migration lock. Trường `cars.promotionSummary` giữ nguyên kiểu `text`.
- **Dữ liệu hiện hữu:** 8 bản ghi có prompt note trong ngoặc đơn rò rỉ đã được dọn dẹp an toàn qua script idempotent `clean-promotion-summaries.ts`. Dữ liệu sạch sẽ, không ảnh hưởng quan hệ khóa ngoại hay versions.

### Layer 2: Concurrency & Idempotency
- **Chạy nhiều lần:** Script dọn dẹp kiểm tra `cleaned !== car.promotionSummary` trước khi update. Lần chạy thứ hai xác nhận 0/11 cập nhật (Idempotent 100%).
- **SSR/SSG:** Các component Breadcrumbs và JSON-LD generator đều là pure functions / deterministic transformations, không phát sinh race condition.

### Layer 3: Security & Injection Defense
- **XSS / HTML Sanitization:** Tất cả dữ liệu JSON-LD vẫn được bảo vệ nghiêm ngặt qua `sanitizeJsonLd(...)` trước khi truyền vào `dangerouslySetInnerHTML`.
- **Injection:** Không dùng raw SQL nối chuỗi; script dùng Drizzle ORM có tham số hóa truy vấn.

### Layer 4: API & Client Integration Contracts
- **Google Search Console Contract:**
  - `BreadcrumbList`: `@id` được khai báo rõ ràng. Vị trí 1 là URL tuyệt đối kết thúc bằng `/` (`https://xehyundaivinh.com/`). Vị trí cuối cùng có URL tuyệt đối trang hiện tại. Không còn relative URL `"/"` hay `"/xe"`. Cảnh báo "URL trong trường 'id' không hợp lệ" được giải quyết triệt để.
  - `ItemList`: Mỗi phần tử `item` (`Product`/`Car`) có `@id` và `url` cấp cao nhất.
- **Client Fallback:** Component `Breadcrumbs` hỗ trợ prop `baseUrl` tùy chọn, tự động fallback về `getSiteUrl()`.

### Layer 5: Code Quality & Architecture Hygiene
- **DRY & Single Responsibility:** Hàm `sanitizePromotionSummary` được tách biệt tại `@cardealer/core/src/seo/json-ld.ts` và tái sử dụng ở:
  1. `generateCatalogJsonLd`
  2. `generateCarJsonLd`
  3. `apps/api/src/services/ai/response-transformer.ts`
  4. `packages/database/src/scripts/clean-promotion-summaries.ts`
- **Typing:** Không dùng `any` bừa bãi. `BreadcrumbsProps` có type mở rộng an toàn.

### Layer 6: Performance & Resilience
- **Regex Performance:** Regex xử lý trên chuỗi ngắn (vài chục đến vài trăm ký tự) với độ phức tạp $O(N)$, không gặp hiện tượng Catastrophic Backtracking.
- **Network & Build:** Không thêm bất kỳ thư viện bên ngoài nặng nề nào. Build production Next.js và API giữ nguyên tốc độ tối ưu.

### Layer 7: Test Integrity & Machine Verification
- **Test Quality:** 196 tests vitest pass toàn diện trong `@cardealer/core`.
- **Test Mới:** Bổ sung test kiểm tra cụ thể các case prompt note của Tucson, Custin, Elantra, Stargazer X, Santa Fe, cũng như test absolute URLs của BreadcrumbList.

### Layer 8: Deployment & Rollback Strategy
- **Không có Breaking Change:** Tương thích ngược 100%. Các trang Storefront cũ vẫn hoạt động trơn tru.
- **PM2 / Server Deployment:** Không cần thay đổi env mới.

### Layer 9: Observability & Audit Trail
- **Logging:** Script dọn dẹp DB in rõ ràng từng dòng xe: tên xe, slug, giá trị gốc và giá trị sạch sau khi chuẩn hóa.
