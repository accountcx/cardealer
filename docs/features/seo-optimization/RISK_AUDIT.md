# 🛡️ RISK AUDIT: Technical SEO & Blast Radius Assessment

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Tài liệu tham chiếu:** [FLOW.md](./FLOW.md) | [SCHEMA.md](./SCHEMA.md) | [API_SPEC.md](./API_SPEC.md)

---

## 1. Phân Tích Phạm Vi Ảnh Hưởng (Blast Radius Analysis)

| Vùng ảnh hưởng | Mức độ rủi ro | Chi tiết tác động tiềm ẩn | Chiến lược kiểm soát & Cô lập |
| :--- | :---: | :--- | :--- |
| **Sitemap & Indexing** | **Cao** | Nếu xuất bản sitemap lỗi hoặc canonical sai, Googlebot có thể de-index các trang quan trọng. | Kiểm tra mã phản hồi HTTP 200 trước khi ghi URL vào `sitemap.ts`; kiểm tra bằng lệnh `curl` tự động trong pre-commit. |
| **Core Web Vitals** | **Trung bình** | Chuyển đổi sang `next/image` nếu cấu hình sai `sizes` hoặc `priority` có thể làm tăng LCP hoặc gây CLS. | Đặt tỷ lệ khung hình cố định `aspect-video` kèm `bg-slate-100` giữ chỗ; chỉ bật `priority` cho duy nhất ảnh Hero đầu tiên. |
| **Storefront Routing** | **Thấp** | Thêm dynamic route `/gia-lan-banh/[carSlug]` và landing `/tra-gop` có thể xung đột với các static route hiện có. | Cấu hình router phân cấp rõ ràng; chặn các slug không tồn tại bằng `notFound()` chuẩn 404. |
| **Cache & Performance** | **Thấp** | API `/api/revalidate` nếu bị tấn công DoS có thể làm tăng tải máy chủ do purge cache liên tục. | Bảo vệ bằng Secret Token header bí mật; giới hạn rate-limit và chỉ chấp nhận phương thức POST. |

---

## 2. Bốn Bất Biến Hệ Thống (Property-Based Invariants)

1. **Bất biến 1 — Bounded Execution & ReDoS Defense:**
   * Mọi hàm regex chuẩn hóa slug hoặc bóc tách URL (ví dụ trong `sanitizePromotionSummary` hoặc `cleanAuthorFullName`) phải là Bounded Regex đơn giản $O(n)$, tuyệt đối không có lồng lặp đa thức (`(a+)+`) gây treo CPU Edge/Node Server.
2. **Bất biến 2 — Canonical Immutability (Bảo Toàn Canonical Tuyệt Đối):**
   * Mọi trang Storefront bắt buộc phải có thẻ Canonical tự thân (Self-Referencing Canonical) trỏ về URL sạch nguyên bản, loại bỏ 100% query parameters tiếp thị (`?utm_...`, `?fbclid=...`, `?tab=...`, `?xe=...`).
3. **Bất biến 3 — Zero Soft-404 Invariant:**
   * Mọi yêu cầu truy cập slug không tồn tại (xe đã xóa, chuyên mục không có) bắt buộc phải trả về mã trạng thái HTTP 404 thực thể thông qua `notFound()`, kèm thẻ `robots: { index: false, follow: true }`. Tuyệt đối cấm trả về HTTP 200 cho trang báo lỗi.
4. **Bất biến 4 — Fail-Closed Secret Validation:**
   * Endpoint `POST /api/revalidate` bắt buộc từ chối ngay lập tức (HTTP 401) nếu thiếu Secret Token hoặc Secret Token rỗng/không khớp chuỗi cấu hình bí mật trong biến môi trường.

---

## 3. Kế Hoạch Rollback Dự Phòng (Safe Rollback Strategy)

Nếu sau khi triển khai phát hiện lỗi nghiêm trọng trên Production:
1. **Rollback Git Commit:** Revert commit nhánh tính năng, quay về phiên bản ổn định trước đó.
2. **Purge Toàn Diện Cache:** Khởi động lại service PM2 (`pnpm run start:prod`) để làm mới bộ đệm Next.js.
3. **Bảo toàn Dữ liệu:** Không có bất kỳ thay đổi nào làm phá hủy dữ liệu trong cơ sở dữ liệu PostgreSQL / Drizzle ORM.
