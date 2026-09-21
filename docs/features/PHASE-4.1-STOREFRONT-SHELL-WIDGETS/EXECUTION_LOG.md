# 📜 Detailed Execution Log: Khung Nền Tảng Storefront & Tiện Ích Chuyển Đổi Toàn Cục
## PHASE 4.1 - STOREFRONT SHELL & CONVERSION WIDGETS (`EPIC-PHASE-4.1-STOREFRONT-SHELL-WIDGETS`)

### 🗺️ DETAILED EXECUTION ROADMAP & FUNCTION-LEVEL DEPENDENCY SEQUENCE

- **Tác vụ đang thực thi:** `US-01`: Contracts, System Settings Schemas & Public APIs
- **Tóm tắt Mục tiêu:** Định nghĩa contracts dữ liệu Type-Safe Zod Schemas cho 5 Domain Keys, mở rộng seed dữ liệu hệ thống, và xây dựng các API endpoints công khai (`GET /api/settings`) cùng API quản trị bảo mật (`PUT /api/admin/settings/:key`).

---

#### 🔗 1. BACKEND & SHARED CONTRACTS DEPENDENCY CHAIN (SLICE 1: US-01)

##### 📄 File 1: `packages/types/src/settings.ts` (Sửa đổi)
* 💡 **Lý do làm trước:** Định nghĩa toàn bộ Contracts, Zod Schemas (`NavigationSettingsSchema`, `FloatingSellerSettingsSchema`, `StickyBarSettingsSchema`, `ContactSettingsSchema`, `SiteSettingsSchema`, `BulkSettingsSchema`) và helper functions chuẩn hóa số điện thoại/link Zalo làm nền tảng cho cả API, Admin và Storefront.
* 🛠 **Danh sách Schemas & Functions cần viết:**
  * `NavSubLinkSchema`, `NavLinkSchema`, `NavigationSettingsSchema`: Menu điều hướng đa cấp.
  * `FloatingSellerSettingsSchema`: Cấu hình chuyên viên nổi (avatar, tên, hotline, link zalo, trạng thái trực tuyến).
  * `StickyBarSettingsSchema`: Cấu hình thanh chốt đơn chân trang (CTA nhãn, hotline, bật/tắt).
  * `BulkSettingsSchema`: Schema nạp gộp 5 domain keys.
  * Helper `sanitizePhoneNumber(phone: string)`: Khử ký tự lạ cho thẻ `tel:`.
  * Helper `normalizeZaloUrl(zalo: string)`: Chuẩn hóa link Zalo OA/cá nhân.

##### 📄 File 2: `packages/types/src/__tests__/settings-schemas.test.ts` (Tạo mới)
* 💡 **Lý do làm thứ hai:** Kiểm thử tự động tính trọn vẹn của các Zod Schemas, xác minh cơ chế Zero-Crash Default Fallback hoạt động 100% khi đầu vào rỗng `{}` hoặc thiếu trường.
* 🛠 **Danh sách Unit Tests cần viết:**
  * `TC-1.1`: Fallback defaults khi parse rỗng.
  * `TC-1.2`: `BulkSettingsSchema.safeParse({})` trả về `success: true`.
  * `TC-1.3`: Phone sanitizer loại bỏ dấu chấm, dấu cách và mã quốc tế.

##### 📄 File 3: `packages/database/src/seed.ts` (Sửa đổi)
* 💡 **Lý do làm thứ ba:** Nạp dữ liệu hạt giống (Seed Data) chuẩn cho 5 domain keys vào bảng `system_settings` trong cơ sở dữ liệu PostgreSQL.
* 🛠 **Danh sách Keys cần nạp:**
  * `site_settings`, `navigation_settings`, `contact_settings`, `floating_seller_settings`, `sticky_bar_settings`.

##### 📄 File 4: `apps/api/src/routes/catalog.ts` (Sửa đổi)
* 💡 **Lý do làm thứ tư:** Mở endpoint công khai `GET /api/settings` (Bulk Ingestion) và `GET /api/settings/:key` có cache header phục vụ Storefront `RootLayout`.
* 🛠 **Danh sách Endpoints:**
  * `GET /api/settings`: Query song song 5 keys trong `system_settings` và trả về JSON chuẩn `BulkSettingsSchema`.
  * `GET /api/settings/:key`: Trả về dữ liệu của 1 key cụ thể kèm fallback defaults nếu chưa có bản ghi.

##### 📄 File 5: `apps/api/src/routes/admin.ts` (Sửa đổi)
* 💡 **Lý do làm thứ năm:** Mở endpoint bảo mật `PUT /api/admin/settings/:key` cho Admin Portal lưu cấu hình từng tab độc lập kèm RBAC middleware kiểm tra quyền `system:write`.
* 🛠 **Danh sách Endpoints:**
  * `PUT /api/admin/settings/:key`: Validate payload qua Zod schema tương ứng, upsert vào DB và trả về 200 OK.

##### 📄 File 6: `apps/api/src/__tests__/settings-api.test.ts` (Tạo mới)
* 💡 **Lý do làm thứ sáu:** Kịch bản kiểm thử Integration Test cho API endpoints, xác minh RBAC và chống Stored XSS.
* 🛠 **Danh sách Tests:**
  * Bulk Ingestion trả về 200 OK.
  * Chặn role không có quyền `system:write`.
  * Upsert thành công bản ghi vào PostgreSQL.

---

#### 🌐 2. ADMIN PORTAL DEPENDENCY CHAIN (SLICE 2: US-02)
* File 7: `apps/admin/services/settings.service.ts` (Sửa đổi - Mở rộng đa key API client)
* File 8: `apps/admin/app/settings/components/SettingsTabNav.tsx` (Tạo mới - 4 Tabs switcher)
* File 9: `apps/admin/app/settings/components/NavigationSection.tsx` (Tạo mới - Menu Builder)
* File 10: `apps/admin/app/settings/components/FloatingSellerSection.tsx` (Tạo mới - Widget chuyên viên)
* File 11: `apps/admin/app/settings/components/StickyBarSection.tsx` (Tạo mới - Thanh chốt đơn)
* File 12: `apps/admin/app/settings/page.tsx` (Tái cấu trúc - Form 4 Tabs tích hợp)

---

#### 🚗 3. STOREFRONT SHELL & CONVERSION WIDGETS (SLICE 3 & 4: US-03, US-04)
* File 13: `apps/web/services/settings.service.ts` (Tạo mới - Fetch settings SSR có Cache Tag)
* File 14: `apps/web/components/layout/Navbar.tsx` (Tạo mới - Sticky Header & Mega Menu)
* File 15: `apps/web/components/layout/MobileDrawer.tsx` (Tạo mới - Accordion & 1-touch CTA)
* File 16: `apps/web/components/layout/Footer.tsx` (Tạo mới - Footer 3S & Maps)
* File 17: `apps/web/components/layout/FloatingSeller.tsx` (Tạo mới - Widget tư vấn online)
* File 18: `apps/web/components/layout/ProductStickyBar.tsx` (Tạo mới - Thanh chốt đơn)
* File 19: `apps/web/components/layout/ViewportCoordinator.tsx` (Tạo mới - Phối hợp vị trí mobile)
* File 20: `apps/web/app/layout.tsx` (Tích hợp Server Component nạp cấu hình và hiển thị toàn bộ Shell)

---

### 📋 NHẬT KÝ THỰC THI TỪNG BƯỚC (STEP EXECUTION LOG)
- [x] **Step 1/20:** `packages/types/src/settings.ts` — Đã hoàn thành mở rộng Zod Schemas (`NavigationSettingsSchema`, `FloatingSellerSettingsSchema`, `StickyBarSettingsSchema`, `BulkSettingsSchema`) & Helpers (`sanitizePhoneNumber`, `normalizeZaloUrl`). Verification: Passed Type-check (`tsc --noEmit`, exit 0).
- [x] **Step 2/20:** `packages/core/src/__tests__/settings-schemas.test.ts` — Đã hoàn thành 8 unit test cases xác minh Zero-Crash fallback, schema validation & helpers. Verification: Passed 8/8 tests với Vitest (`exit 0`).
- [x] **Step 3/20:** `packages/database/src/seed-settings.ts` & `index.ts` — Đã hoàn thành seed 5 domain keys chuẩn Hyundai Dealer vào PostgreSQL qua Drizzle ORM. Verification: Passed monorepo type-check (`exit 0`).
- [x] **Step 4/20:** `apps/api/src/routes/catalog.ts` — Đã triển khai endpoints công khai `GET /api/settings` (Bulk Ingestion) & `GET /api/settings/:key`. Verification: Passed type-check (`exit 0`).
- [x] **Step 5/20:** `apps/api/src/routes/admin.ts` — Đã triển khai endpoint bảo mật `PUT /api/admin/settings/:key` có Zod validation đa key và RBAC middleware `system:write`. Verification: Passed type-check (`exit 0`).
- [x] **Step 6/20:** `scripts/verify-phase-4-1.ts` & `package.json` — Đã hoàn thành bộ test tích hợp và script `pnpm verify:phase-4-1`. Verification: 18/18 tests passed (`exit 0`).
- [x] **Step 7/20:** `apps/admin/services/settings.service.ts` — Đã mở rộng API client hỗ trợ 5 domain keys, bulk fetch và update độc lập từng key. Verification: Passed type-check (`exit 0`).
- [x] **Step 8/20:** `apps/admin/app/settings/components/SettingsTabNav.tsx` — Đã tạo thanh tab điều hướng 4 phân hệ (Chung, Menu, Widget Nổi, Sticky Bar). Verification: Passed type-check (`exit 0`).
- [x] **Step 9/20:** `apps/admin/app/settings/components/NavigationSection.tsx` — Đã tạo bộ quản lý Navigation Tree đa cấp (thêm, sửa, xoá link/sublink, live preview). Verification: Passed type-check (`exit 0`).
- [x] **Step 10/20:** `apps/admin/app/settings/components/FloatingSellerSection.tsx` — Đã tạo form cấu hình Chuyên viên tư vấn nổi kèm Avatar & Live Preview mô phỏng màn hình thực. Verification: Passed type-check (`exit 0`).
- [x] **Step 11/20:** `apps/admin/app/settings/components/StickyBarSection.tsx` — Đã tạo form cấu hình Thanh chốt đơn chân trang kèm Live Preview. Verification: Passed type-check (`exit 0`).
- [x] **Step 12/20:** `apps/admin/app/settings/page.tsx` — Đã tái cấu trúc toàn diện trang Quản trị Cấu hình Hệ thống, hỗ trợ lưu độc lập từng tab, Toast phản hồi và Zero CLS. Verification: `apps/admin` check-types passed (`exit 0`).
- [x] **Step 13/20:** `apps/web/services/settings.service.ts` — Đã hoàn thành SSR fetcher với Next.js Cache Tag `system-settings` và Zero-Crash Schema fallback an toàn tuyệt đối. Verification: Passed type-check (`exit 0`).
- [x] **Step 14/20:** `apps/web/components/layout/Navbar.tsx` — Đã tạo Header chuẩn Hyundai (#002C6C), TopBar, Logo, Mega Menu dropdown, Hotline 24/7 và CTA Báo Giá. Verification: Passed type-check (`exit 0`).
- [x] **Step 15/20:** `apps/web/components/layout/MobileDrawer.tsx` — Đã tạo Drawer trượt mượt mà, Accordion đa cấp, nút gọi và Zalo cố định đáy chuẩn thumb-zone. Verification: Passed type-check (`exit 0`).
- [x] **Step 16/20:** `apps/web/components/layout/Footer.tsx` — Đã tạo Footer Đại lý 3S chuẩn nhận diện, Google Maps, thông tin pháp lý, dynamic year. Verification: Passed type-check (`exit 0`).
- [x] **Step 17/20:** `apps/web/components/layout/FloatingSeller.tsx` — Đã tạo Widget chuyên viên nổi góc phải, pulse xanh trực tuyến, Popup Card 1-click Gọi & Zalo. Verification: Passed type-check (`exit 0`).
- [x] **Step 18/20:** `apps/web/components/layout/ProductStickyBar.tsx` — Đã tạo Thanh chốt đơn đáy trang, scroll detector > 300px, iPhone Safe Area padding. Verification: Passed type-check (`exit 0`).
- [x] **Step 19/20:** `apps/web/components/layout/ViewportCoordinator.tsx`, `LeadQuoteModal.tsx` & `AutoDealerJsonLd.tsx` — Đã phối hợp cao độ Z-index, điều phối Sticky Bar vs Floating Seller trên mobile, Schema.org SEO Structured Data. Verification: Passed type-check (`exit 0`).
- [x] **Step 20/20:** `apps/web/app/layout.tsx` — Đã tích hợp Server Component RootLayout nạp Bulk Settings SSR, truyền dữ liệu vào toàn bộ Shell Components. Verification: Toàn bộ Monorepo 8/8 packages passed `pnpm check-types` (`exit 0`).

