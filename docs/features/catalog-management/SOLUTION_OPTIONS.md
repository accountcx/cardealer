# 📐 SOLUTION OPTIONS: Schema Optimization & Data Sanitization (US-04)

> **Module:** `catalog-management`  
> **Feature:** US-04 - Sửa Cảnh Báo Search Console & Làm Sạch Dữ Liệu Khuyến Mãi  

---

## 1. Bối Cảnh & Vấn Đề Kỹ Thuật

Google Search Console đã cảnh báo lỗi:
> **"URL trong trường 'id' không hợp lệ (nằm trong 'itemListElement.item')"**

### Nguyên nhân:
1. **BreadcrumbList:**
   - Tại `position: 1`: Trường `item` nhận giá trị `"/"` (relative URL). Google Search Console mapping `item` vào `@id` của thực thể, bắt buộc `@id` phải là Absolute URL (`https://...`).
   - Tại vị trí cuối cùng: Bị thiếu trường `item` hoặc thiếu `@id` tường minh cho `BreadcrumbList`.
2. **ItemList (Danh sách xe):**
   - Mỗi phần tử xe trong `itemListElement.item` chỉ có `@type: ["Product", "Car"]` và `offers.url`, nhưng thiếu `@id` và `url` cấp cao nhất của `item`. Google khuyến nghị phải có `@id` và `url` trực tiếp tại `item` để định danh Entity cho Rich Snippets và Carousels.
3. **Rò rỉ Prompt nội bộ trong `promotionSummary`:**
   - Trường `promotionSummary` của một số dòng xe (Tucson, Palisade, Grand i10, Elantra, Custin, Stargazer X, Santa Fe, Venue) bị dính text chỉ dẫn prompt trong ngoặc đơn như `(Tạo nội dung tiếp thị cho dòng xe Hyundai Tucson)`. Dữ liệu này rò rỉ lên UI và trường `description` của Schema.

---

## 2. So Sánh Các Phương Án Kỹ Thuật

### 🔹 Vấn đề 1: Chuẩn hóa URL cho BreadcrumbList
| Tiêu chí | Phương án A (Hardcode URL trong từng Page) | Phương án B (Tập trung hóa trong Component `<Breadcrumbs />`) - LỰA CHỌN |
| :--- | :--- | :--- |
| **Cơ chế** | Sửa thủ công từng trang truyền Absolute URL vào `items` | Component `<Breadcrumbs />` tự động chuyển đổi mọi `item.href` thành Absolute URL dựa trên `getSiteUrl()`, đồng thời tự gán URL trang hiện tại cho item cuối |
| **Tái sử dụng** | Kém. Mỗi trang mới đều có nguy cơ dính lại relative URL | Tối ưu 100%. Mọi trang dùng `<Breadcrumbs />` đều tự động xuất ra Schema đạt chuẩn Google |
| **Khả năng bảo trì** | Dễ phân mảnh khi đổi domain | Đổi qua `NEXT_PUBLIC_SITE_URL` hoặc settings đồng bộ tự động |
| **Đánh giá** | ❌ Reject | ✅ **CHỌN PHƯƠNG ÁN B** |

---

### 🔹 Vấn đề 2: Tối ưu ItemList Schema (@id & url)
| Tiêu chí | Phương án A (Cập nhật tại @cardealer/core) - LỰA CHỌN | Phương án B (Sửa cục bộ trong page.tsx của apps/web) |
| :--- | :--- | :--- |
| **Cơ chế** | Bổ sung `@id` và `url` vào `generateCatalogJsonLd` trong `@cardealer/core/src/seo/json-ld.ts` | Tự dựng object JSON-LD trong `apps/web/app/xe/page.tsx` |
| **Toàn vẹn** | Bảo đảm quy tắc Single Source of Truth cho toàn bộ nền tảng | Gây duplicate code và vi phạm kiến trúc monorepo |
| **Đánh giá** | ✅ **CHỌN PHƯƠNG ÁN A** | ❌ Reject |

---

### 🔹 Vấn đề 3: Xử lý rò rỉ prompt trong `promotionSummary`
| Tiêu chí | Phương án A (Chỉ sửa tay trong Database) | Phương án B (3 Lớp Phòng Thủ: Script DB + Core Helper + AI Transformer) - LỰA CHỌN |
| :--- | :--- | :--- |
| **Cơ chế** | Dùng SQL UPDATE thủ công 6 dòng xe | 1. Script dọn dẹp DB vĩnh viễn.<br/>2. Helper `sanitizePromotionSummary` tại `@cardealer/core` bọc tầng hiển thị Schema.<br/>3. Transformer lọc đầu ra AI Assistant ngăn tái phát |
| **Độ tin cậy** | Tạm thời. Lần generate AI tiếp theo có thể tái diễn | Triệt để, bền vững, ngăn ngừa hoàn toàn lỗi tái phát |
| **Đánh giá** | ❌ Nguy cơ cao | ✅ **CHỌN PHƯƠNG ÁN B** |

---

## 3. Quyết Định Kỹ Thuật (Architecture Decision Record - ADR)
- **ADR-01:** Áp dụng Phương án B cho cả 3 bài toán.
- **ADR-02:** Tạo hàm `sanitizePromotionSummary` trong `@cardealer/core/src/seo/` để loại bỏ regex `/\s*\([^)]*(tiếp thị|đánh giá|quyết định|lưu ý|yêu cầu|nội dung|prompt|hợp lý|thay vì|bảng giá|khối kêu gọi|hỗ trợ 50%)[^)]*\)/gi` và các đoạn chỉ dẫn trong ngoặc đơn rò rỉ ở cuối chuỗi.
- **ADR-03:** Viết script `packages/database/src/scripts/clean-promotion-summaries.ts` và chạy trực tiếp để dọn sạch toàn bộ database hiện hữu.
