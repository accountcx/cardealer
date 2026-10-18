# 📜 Execution Log: Trang Chủ Phễu Chuyển Đổi 6 Phân Khu (Homepage Conversion Funnel)

## 🗺️ DETAILED EXECUTION ROADMAP & FUNCTION-LEVEL DEPENDENCY SEQUENCE

- **Tác vụ đang thực thi:** `EPIC-PHASE-4.2-HOMEPAGE-FUNNEL` (4 Slices)
- **Tóm tắt Mục tiêu:** Chuyển đổi toàn bộ thiết kế 6 phân khu trang chủ thành mã nguồn type-safe, modular, không hardcode, cấu hình động 100% từ Admin với công tắc Bật/Tắt độc lập và cơ chế tự động ẩn an toàn (Graceful Degradation). Tuân thủ quy tắc Single-Step Execution (chỉ làm 1 file/lần rồi dừng chờ duyệt).

---

### 🔗 GIAI ĐOẠN 4.1: SLICE 1 (US-01) — CONTRACTS, SCHEMAS & API INTEGRATION

#### 📄 File 1: `packages/types/src/settings.ts` (Chỉnh sửa)
* 💡 **Lý do làm trước:** Định nghĩa bộ Contracts, Zod Schemas và TypeScript types cho 6 phân khu trang chủ, làm chuẩn cho Database, API, Admin và Storefront.
* 🛠 **Danh sách Schemas & Types cần viết:**
  * `HeroBannerSchema`: Cấu hình banner sự kiện, video/ảnh, countdown timer (múi giờ VN), số suất ưu đãi, CTA button.
  * `LeadFilterSchema`: Cấu hình mốc ngân sách gợi ý, kiểu dáng xe phân khúc.
  * `SalerShowroomSchema`: Cấu hình chế độ ('saler' | 'showroom'), hồ sơ chuyên viên, 4 cam kết vàng, gallery ảnh.
  * `FeaturedCarsZoneSchema`: Cấu hình hiển thị xe ghim nổi bật, số lượng xe tối đa.
  * `DeliveryStoriesZoneSchema`: Cấu hình album ảnh bàn giao xe thực tế cho khách hàng.
  * `LatestPromotionsZoneSchema`: Cấu hình khối bài viết tin tức khuyến mãi mới nhất.
  * `HomepageSettingsSchema`: Gom 6 zone schemas kèm giá trị mặc định an toàn.
  * `DEFAULT_HOMEPAGE_SETTINGS`: Hằng số fallback zero-crash.
  * Export Types: `HomepageSettings`, `HeroBannerConfig`, `LeadFilterConfig`, v.v.

#### 📄 File 2: `packages/core/src/__tests__/homepage-settings-schemas.test.ts` (Tạo mới)
* 💡 **Lý do làm thứ hai:** Kiểm thử đơn vị (Unit Test) xác nhận Schemas hoạt động 100% chính xác, tự bù đắp defaults khi payload rỗng, chặn URL XSS và chặn số âm trước khi chạm vào Database.
* 🛠 **Danh sách Test Cases:**
  * `TC-1.1`: Parse payload rỗng `{}` trả về đầy đủ 6 phân khu với `enabled: true`.
  * `TC-1.2`: `DEFAULT_HOMEPAGE_SETTINGS` hoạt động trơn tru không lỗi.
  * `TC-1.3`: Chặn URL chứa mã độc (`javascript:`).
  * `TC-1.4`: Chặn số suất ưu đãi âm.

#### 📄 File 3: `packages/database/src/seed-settings.ts` (Chỉnh sửa)
* 💡 **Lý do làm thứ ba:** Seed dữ liệu khởi tạo mẫu chuẩn thương hiệu Hyundai vào bảng `system_settings` với key `'homepage_settings'`.
* 🛠 **Danh sách Logic:**
  * Thêm record `homepage_settings` với value nạp từ `DEFAULT_HOMEPAGE_SETTINGS`.
  * Đảm bảo hàm `seedSettings()` upsert không làm mất dữ liệu hiện hữu.

#### 📄 File 4: `apps/api/src/routes/catalog.ts` (Chỉnh sửa)
* 💡 **Lý do làm thứ tư:** Mở rộng endpoint `GET /api/settings` bulk và `GET /api/settings/:key` để trả về `homepage_settings` cho Storefront.
* 🛠 **Danh sách Endpoints & Logic:**
  * Thêm `'homepage_settings'` vào danh sách keys được hỗ trợ trong query `system_settings`.
  * Trả về dữ liệu đã merge an toàn với fallback defaults.

#### 📄 File 5: `apps/api/src/routes/admin.ts` (Chỉnh sửa)
* 💡 **Lý do làm thứ năm:** Bảo vệ endpoint `PUT /api/admin/settings/:key` xác thực payload `homepage_settings` bằng Zod trước khi ghi vào CSDL.
* 🛠 **Danh sách Endpoints & Logic:**
  * Bổ sung nhánh xử lý validate `HomepageSettingsSchema` khi key là `'homepage_settings'`.
  * Ghi nhật ký log an toàn (khử `\r\n`).

---

### 🔗 GIAI ĐOẠN 4.2: SLICE 2 (US-02) — ADMIN PORTAL CONFIGURATOR
* File 6: `apps/admin/app/settings/components/HeroBannerForm.tsx` (Form cấu hình Khu 1)
* File 7: `apps/admin/app/settings/components/LeadFilterForm.tsx` (Form cấu hình Khu 2)
* File 8: `apps/admin/app/settings/components/SalerShowroomForm.tsx` (Form cấu hình Khu 3)
* File 9: `apps/admin/app/settings/components/DeliveryStoriesForm.tsx` (Form quản lý album giao xe Khu 5)
* File 10: `apps/admin/app/settings/components/HomepageFunnelSection.tsx` (Quản trị 6 phân khu với 6 Switch Bật/Tắt)
* File 11: `apps/admin/app/settings/page.tsx` (Tích hợp tab Trang Chủ vào settings page)

---

### 🔗 GIAI ĐOẠN 4.3: SLICE 3 & 4 (US-03 & US-04) — STOREFRONT COMPONENTS & VERIFICATION
* File 12: `apps/web/components/home/CountdownTimer.tsx` (Client Island đếm ngược múi giờ VN)
* File 13: `apps/web/components/home/HeroEventBanner.tsx` (Khu 1 RSC)
* File 14: `apps/web/components/home/LeadMagnetFilter.tsx` (Khu 2 Client Island)
* File 15: `apps/web/components/home/SalerProfileSection.tsx` (Khu 3 RSC)
* File 16: `apps/web/components/home/CarShowcaseCard.tsx` (Thẻ xe nổi bật + Lead Modal context)
* File 17: `apps/web/components/home/FeaturedCarsSection.tsx` (Khu 4 RSC)
* File 18: `apps/web/components/home/DeliveryStoriesSection.tsx` (Khu 5 Client Slider)
* File 19: `apps/web/components/home/LatestNewsSection.tsx` (Khu 6 RSC)
* File 20: `apps/web/app/page.tsx` (RSC Root Trang Chủ - Nạp song song Promise.all & Graceful Degradation)
* File 21: `scripts/verify-phase-4-2.ts` (CLI Verification Runner - kiểm tra toàn diện, trả về exit 0)

---

## 🛠 SENIOR PRE-CODING CHECKLIST (10 TIÊU CHÍ)

- [x] **1. Quét Codebase Convention:** Tuân thủ 100% naming convention (PascalCase cho components/schemas, camelCase cho biến/hàm, kebab-case cho test/file).
- [x] **2. Function-Level Roadmap Announcement:** Đã bóc tách chi tiết 21 files từ Backend tới Frontend.
- [x] **3. Step-Gate Commitment:** Cam kết CHỈ viết **1 file/lượt**, sau đó DỪNG LẠI CHỜ LỆNH của Developer.
- [x] **4. Tái sử dụng & Scalability Check:** Tái sử dụng `system_settings` key-value model, `calculateRollingCost`, `formatVNDShort` từ `@cardealer/core`.
- [x] **5. SRP & File Length Guard (< 300 lines):** Bóc tách mỗi phân khu thành component độc lập dưới 200 dòng.
- [x] **6. Anti-Reward Hacking Cam kết:** Giữ nguyên 100% assertions từ Test Plan.
- [x] **7. Self-Correction Guardrail:** Thiết lập bộ đếm 3-Strike khi chạy lệnh kiểm thử.
- [x] **8. Zero Hardcode & Strict Typing:** Zero `any` policy, 100% có Zod validation và types.
- [x] **9. Mental Model Comment Rule:** Chèn inline comment `// 🧠 Mental Model: <Lý do>` phía trên các khối xử lý phức tạp.
- [x] **10. Logging & Security Sanitization:** Khử `\r\n` log injection, không log PII.

---

## 🏁 KẾT QUẢ TRIỂN KHAI & VERIFICATION (GATE 4)

- **21/21 Files Đã Hoàn Thành:**
  1. `packages/types/src/settings.ts`: Toàn bộ Zod schemas, defaults và TypeScript interfaces cho 6 phân khu.
  2. `packages/core/src/__tests__/homepage-settings-schemas.test.ts`: 9/9 tests pass.
  3. `packages/database/src/seed-settings.ts`: Seed key `homepage_settings` mặc định.
  4. `apps/api/src/routes/catalog.ts`: Endpoint `GET /api/settings` trả về dữ liệu homepage an toàn.
  5. `apps/api/src/routes/admin.ts`: Endpoint `PUT /api/admin/settings/:key` xác thực `HomepageSettingsSchema`.
  6. `apps/admin/app/settings/components/HeroBannerForm.tsx`: Form cấu hình Khu 1.
  7. `apps/admin/app/settings/components/LeadFilterForm.tsx`: Form cấu hình Khu 2.
  8. `apps/admin/app/settings/components/SalerShowroomForm.tsx`: Form cấu hình Khu 3.
  9. `apps/admin/app/settings/components/DeliveryStoriesForm.tsx`: Form cấu hình Khu 5.
  10. `apps/admin/app/settings/components/HomepageFunnelSection.tsx`: Form điều phối 6 Accordions & 6 Switches.
  11. `apps/admin/app/settings/components/SettingsTabNav.tsx` & `page.tsx`: Tab Trang Chủ (Phễu 6 Khu).
  12. `apps/web/components/home/CountdownTimer.tsx`: Client Island an toàn múi giờ GMT+7, chống SSR hydration mismatch.
  13. `apps/web/components/home/HeroEventBanner.tsx`: Khu 1 RSC + CTA trigger.
  14. `apps/web/components/home/LeadMagnetFilter.tsx`: Khu 2 Client Island lọc nhanh `/xe?price=...&segment=...`.
  15. `apps/web/components/home/SalerProfileSection.tsx`: Khu 3 RSC với hồ sơ cá nhân/showroom và 4 cam kết vàng.
  16. `apps/web/components/home/CarShowcaseCard.tsx`: Thẻ xe nổi bật + dispatch event lead modal.
  17. `apps/web/components/home/FeaturedCarsSection.tsx`: Khu 4 RSC xe nổi bật.
  18. `apps/web/components/home/DeliveryStoriesSection.tsx`: Khu 5 Gallery khách hàng bàn giao xe.
  19. `apps/web/components/home/LatestNewsSection.tsx`: Khu 6 Khối tin tức khuyến mãi tự động ẩn an toàn.
  20. `apps/web/components/layout/ViewportCoordinator.tsx`, `apps/web/services/`, `apps/web/app/page.tsx`: Server Component gốc nạp song song `Promise.all` và lắng nghe sự kiện lead modal.
  21. `packages/core/src/__tests__/verify-phase-4-2.test.ts` & `scripts/verify-phase-4-2.ts`: Machine verification suites đạt 100% PASS.

- **Kết quả Kiểm tra Tự động:**
  - `pnpm run check-types`: ✅ 8/8 packages passed (0 TypeScript errors)
  - `pnpm run verify:phase-4-2`: ✅ 10/10 tests passed (Exit code 0)
  - `pnpm --filter @cardealer/core test`: ✅ 38/38 unit tests passed (Exit code 0)

