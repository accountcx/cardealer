# 🧪 Kế Hoạch Kiểm Thử Tự Động (Automated Verification Test Plan)
## PHASE 4.1 - STOREFRONT SHELL & CONVERSION WIDGETS (`EPIC-PHASE-4.1-STOREFRONT-SHELL-WIDGETS`)

> **Chuyên gia thực hiện:** `qa-test-engineer`  
> **Trạng thái:** Sẵn sàng thực thi (Ready for Execution in Phase 4)  
> **Mục tiêu:** Kiểm chứng tự động 100% các kịch bản rủi ro R1–R17, đảm bảo tính ổn định của hệ thống cấu hình động từ Admin, triệt tiêu CLS = 0 trên Storefront và ngăn chặn hoàn toàn xung đột giao diện trên Mobile.

---

## 1. Chiến Lược Kim Tự Tháp Kiểm Thử (Testing Pyramid Strategy)

```text
              ▲
             / \     [CLI Verification Runner] (verify-phase-4-1.ts, exit 0)
            /   \
           /     \   [E2E / Browser & Component Tests] (Playwright / Vitest Testing Library)
          /       \
         /         \ [API Integration & RBAC Tests] (Bulk settings, Key update, Sanitization)
        /           \
       /             \ [Unit & Schema Fallback Tests] (Zod Validation, Phone Sanitizer, Zero Crash)
      ─────────────────
```

---

## 2. Chi Tiết Các Test Suites Tự Động

### Suite 1: Zod Schemas & Zero-Crash Fallback Default Tests (Kiểm toán R3, R7, R14)
* **Mục tiêu:** Xác minh các Zod Schema (`SiteSettings`, `Navigation`, `ContactSettings`, `FloatingSeller`, `StickyBar`) luôn parse thành công, tự động bù đắp dữ liệu mặc định khi đầu vào rỗng/lỗi, không bao giờ ném lỗi runtime.
* **Vị trí file kiểm thử:** `packages/types/src/__tests__/settings-schemas.test.ts`
* **Các ca kiểm thử (Test Cases):**
  - `TC-1.1`: Parse payload rỗng `{}` cho từng schema ➡️ Trả về Object đầy đủ 100% thuộc tính mặc định (`siteTitle`, `headerLinks`, `hotline`, `sellerName`, `ctaText`).
  - `TC-1.2`: `BulkSettingsSchema.safeParse(null)` hoặc `safeParse({})` ➡️ Luôn trả về `success: true` với dữ liệu default chuẩn mực.
  - `TC-1.3`: Phone Sanitizer: Kiểm tra lọc chuỗi số điện thoại (`"0981.234.567"`, `"0981 234 567"`, `"+84 981 234 567"`) ➡️ Kết quả luôn là chuỗi số sạch `0981234567`.
  - `TC-1.4`: Zalo URL Normalizer: Nhập chuỗi số điện thoại hoặc link Zalo thiếu tiền tố ➡️ Tự động chuẩn hóa về `https://zalo.me/0981234567`.
  - `TC-1.5`: Navigation Hierarchy Guard: Từ chối các menu có cấp con sâu hơn 2 cấp hoặc link URL rỗng.

---

### Suite 2: System Settings REST APIs & Security RBAC Tests (Kiểm toán R1, R2, R4, R8, R15)
* **Mục tiêu:** Kiểm tra endpoint công khai `GET /api/settings` nạp gộp bulk data, endpoint `PUT /api/admin/settings/:key` bảo vệ bằng RBAC và chống tấn công Stored XSS.
* **Vị trí file kiểm thử:** `apps/api/src/__tests__/settings-api.test.ts`
* **Các ca kiểm thử:**
  - `TC-2.1`: `GET /api/settings` công khai không cần token ➡️ Phản hồi `200 OK` chứa đầy đủ 5 keys (`site`, `navigation`, `contact`, `floatingSeller`, `stickyBar`).
  - `TC-2.2`: `GET /api/settings/:key` với key hợp lệ ➡️ Phản hồi `200 OK` dữ liệu key đó; với key không tồn tại ➡️ Phản hồi `404 SETTING_NOT_FOUND`.
  - `TC-2.3`: RBAC Guard: Gọi `PUT /api/admin/settings/contact_settings` không có token ➡️ `401 UNAUTHORIZED`.
  - `TC-2.4`: RBAC Guard: Gọi `PUT /api/admin/settings/contact_settings` với token role `sales` hoặc `editor` ➡️ `403 FORBIDDEN`.
  - `TC-2.5`: Admin Update: Gọi `PUT /api/admin/settings/floating_seller_settings` với token role `admin` ➡️ Phản hồi `200 OK`, bản ghi trong database được cập nhật.
  - `TC-2.6`: Stored XSS Prevention: Gửi payload chứa script độc hại `<script>alert('xss')</script>` vào `googleMapEmbed` hoặc `sellerName` ➡️ API từ chối `400 INVALID_PAYLOAD` hoặc sanitize sạch sẽ.
  - `TC-2.7`: Concurrent Update: Gửi đồng thời 2 request cập nhật `navigation_settings` và `contact_settings` ➡️ Cả 2 đều cập nhật thành công độc lập, không bị ghi đè chéo.

---

### Suite 3: Storefront Server Component Layout & Zero CLS Tests (Kiểm toán R3, R5, R10)
* **Mục tiêu:** Đảm bảo `RootLayout` render hoàn chỉnh Server HTML (Header, TopBar, Footer, JSON-LD Schema) ngay từ lần tải đầu tiên, chỉ số CLS = 0.
* **Vị trí file kiểm thử:** `apps/web/__tests__/storefront-layout.test.tsx`
* **Các ca kiểm thử:**
  - `TC-3.1`: Render `RootLayout` khi API settings hoạt động bình thường ➡️ Có thẻ `<header>`, `<nav>`, `<footer>` và script `application/ld+json` chứa đúng tên showroom và hotline.
  - `TC-3.2`: Render `RootLayout` khi database rỗng hoặc API timeout ➡️ Layout vẫn hiển thị bình thường với thông số mặc định (Fallback Graceful Degradation), không ném lỗi 500.
  - `TC-3.3`: Kiểm tra kích thước khung Header có class chiều cao cố định (`min-h-[72px]`), đảm bảo không có layout shift.
  - `TC-3.4`: Thẻ meta `<title>` và `<meta name="description">` được sinh tự động đồng bộ từ `site_settings`.

---

### Suite 4: Mobile Viewport Coordinator & Widget Clashing Tests (Kiểm toán R6, R11, R13)
* **Mục tiêu:** Xác minh `FloatingSeller` và `ProductStickyBar` tự động phối hợp vị trí thông minh trên màn hình điện thoại hẹp, không che khuất nhau.
* **Vị trí file kiểm thử:** `apps/web/__tests__/viewport-coordinator.test.tsx`
* **Các ca kiểm thử:**
  - `TC-4.1`: Khi `scrollY = 0` (đầu trang): `ProductStickyBar` không hiển thị trong DOM; `FloatingSeller` ở vị trí `bottom-4 right-4`.
  - `TC-4.2`: Khi `scrollY = 400` (đã cuộn qua Hero): `ProductStickyBar` xuất hiện ở `bottom-0`; `FloatingSeller` tự động chuyển class lên `bottom-20` (hoặc tương đương > 72px so với đáy).
  - `TC-4.3`: Khoảng cách an toàn: Đo tọa độ bounding box; mép dưới FloatingSeller luôn cách mép trên ProductStickyBar tối thiểu 16px.
  - `TC-4.4`: Nút bấm trên StickyBar và FloatingSeller đều có `h-11` hoặc `h-12` (>= 44px touch target) và padding safe-area cho iPhone.
  - `TC-4.5`: Click vào Avatar của FloatingSeller ➡️ Mở Popup Card chuyên viên hiển thị đủ nút "Gọi Ngay" (`tel:`) và "Chat Zalo".

---

### Suite 5: Admin CMS Settings Tabs Management Tests (Kiểm toán R8, R9)
* **Mục tiêu:** Kiểm tra giao diện 4 Tabs tại `/admin/settings` thao tác trơn tru, validate form qua React Hook Form + Zod, lưu độc lập từng tab.
* **Vị trí file kiểm thử:** `apps/admin/__tests__/settings-tabs.test.tsx`
* **Các ca kiểm thử:**
  - `TC-5.1`: Chuyển đổi giữa 4 Tabs (*Showroom & Pháp lý*, *Menu Điều Hướng*, *Chuyên Viên Nổi*, *Thanh Chốt Đơn*) mà không làm mất dữ liệu đang nhập dở ở tab khác.
  - `TC-5.2`: Thêm, xóa, sửa mục menu cấp 1 và cấp 2 trong Navigation Builder; kiểm tra thứ tự sắp xếp được cập nhật đúng.
  - `TC-5.3`: Bật / Tắt checkbox `enabled` của FloatingSeller hoặc StickyBar ➡️ Trạng thái lưu chính xác vào DB.
  - `TC-5.4`: Nhập thiếu trường bắt buộc (ví dụ: để trống hotline) ➡️ Hiển thị thông báo lỗi màu đỏ tại ô input và chặn không cho submit.

---

## 3. Kịch Bản CLI Verification Runner Toàn Diện (`verify-phase-4-1.ts`)

Kịch bản này là cổng kiểm chứng tự động cấp máy trước khi bàn giao Gate 4:
```bash
# Chạy kịch bản kiểm thử tự động độc lập cho Phase 4.1
pnpm verify:phase-4-1
```
* **Các bước tự động thực thi:**
  1. Kiểm tra Type-check toàn bộ monorepo: `pnpm check-types` (`exit 0`).
  2. Chạy Vitest cho Unit Tests của `packages/types`: `pnpm test:types` (100% pass).
  3. Khởi tạo Mock Server và kiểm thử API Settings Ingestion & RBAC: `pnpm test:api` (100% pass).
  4. Chạy Component Tests cho Storefront Shell & Widgets: `pnpm test:web` (100% pass).
  5. Xuất báo cáo tổng kết với mã thoát duy nhất: `Process exited with code 0`.
