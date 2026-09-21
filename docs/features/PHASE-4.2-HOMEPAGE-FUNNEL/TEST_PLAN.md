# 🧪 Kế Hoạch Kiểm Thử Tự Động (Automated Verification Test Plan)
## PHASE 4.2 - HOMEPAGE CONVERSION FUNNEL (`EPIC-PHASE-4.2-HOMEPAGE-FUNNEL`)

> **Chuyên gia thực hiện:** `qa-test-engineer`  
> **Trạng thái:** Sẵn sàng thực thi (Ready for Execution in Phase 4)  
> **Mục tiêu:** Kiểm chứng tự động 100% các rủi ro R1–R17, đảm bảo độ bền vững của 6 phân khu chuyển đổi, cơ chế Bật/Tắt động từ Admin và triệt tiêu lỗi Hydration Mismatch.

---

## 1. Chiến Lược Kim Tự Tháp Kiểm Thử (Testing Pyramid Strategy)

```text
              ▲
             / \     [CLI Verification Runner] (scripts/verify-phase-4-2.ts, exit 0)
            /   \
           /     \   [Component & Graceful Degradation Tests] (Vitest Testing Library)
          /       \
         /         \ [API Integration & Security RBAC Tests] (GET /api/settings, PUT admin)
        /           \
       /             \ [Unit & Zod Schema Fallback Tests] (HomepageSettingsSchema, Countdown Logic)
      ─────────────────
```

---

## 2. Chi Tiết Các Test Suites Tự Động

### Suite 1: Zod Schemas & Zero-Crash Fallback Default Tests (Kiểm toán R1, R3, R12)
* **Mục tiêu:** Xác minh `HomepageSettingsSchema` tự động bù đắp 100% thuộc tính mặc định khi đầu vào rỗng, chặn URL độc hại và chặn số âm.
* **Vị trí file:** `packages/core/src/__tests__/homepage-settings-schemas.test.ts`
* **Các ca kiểm thử (Test Cases):**
  - `TC-1.1`: Parse payload rỗng `{}` ➡️ Trả về Object đầy đủ 6 phân khu với 6 cờ `enabled: true` và dữ liệu mẫu an toàn.
  - `TC-1.2`: Truyền `null` hoặc `undefined` ➡️ `DEFAULT_HOMEPAGE_SETTINGS` hoạt động trơn tru, không throw error.
  - `TC-1.3`: XSS Prevention: Nhập URL chứa `javascript:alert(1)` vào `mediaUrl` hoặc `ctaButton.href` ➡️ Zod schema từ chối với thông báo lỗi rõ ràng.
  - `TC-1.4`: Giới hạn số suất ưu đãi: Nhập số âm `-5` vào `remainingSlots.slotsCount` ➡️ Schema tự động chặn lỗi validation.

---

### Suite 2: API Integration & Admin Update Tests (Kiểm toán R5, R10, R15)
* **Mục tiêu:** Xác thực endpoint lưu cấu hình `PUT /api/admin/settings/homepage_settings` và lấy dữ liệu công khai `GET /api/settings`.
* **Vị trí file:** `apps/api/src/__tests__/homepage-api.test.ts`
* **Các ca kiểm thử:**
  - `TC-2.1`: `GET /api/settings` trả về đầy đủ key `homepage_settings` cùng các key toàn cục khác.
  - `TC-2.2`: `PUT /api/admin/settings/homepage_settings` thành công cập nhật cơ sở dữ liệu PostgreSQL.
  - `TC-2.3`: Security Guard: Gọi PUT không có quyền admin ➡️ Trả về `401 Unauthorized`.

---

### Suite 3: Graceful Degradation & State Machine Tests (Kiểm toán R2, R6, R7, R8)
* **Mục tiêu:** Kiểm tra cơ chế tự động ẩn phân khu khi tắt công tắc hoặc danh sách rỗng, và tính toán an toàn không bao giờ xuất hiện NaN.
* **Vị trí file:** `apps/web/__tests__/homepage-funnel.test.tsx`
* **Các ca kiểm thử:**
  - `TC-3.1`: Khi `heroBanner.enabled = false` ➡️ Component `HeroEventBanner` trả về `null`, không sinh thẻ DOM thừa.
  - `TC-3.2`: Khi `featuredCars.enabled = true` nhưng danh sách xe rỗng `cars = []` ➡️ Component `FeaturedCarsSection` tự động ẩn an toàn.
  - `TC-3.3`: Khi xe có giá chưa cập nhật (`giaNiemYet = 0`) ➡️ Thẻ xe hiển thị "Liên hệ đại lý", không xuất hiện lỗi `NaN`.
  - `TC-3.4`: Countdown Timer xử lý an toàn khi thời gian đã hết hạn (`targetDate` trong quá khứ) ➡️ Hiển thị thông điệp "Ưu đãi đang tiếp diễn", không báo số âm.

---

### Suite 4: CLI Verification Runner Script (`verify-phase-4-2.ts`)
* **Mục tiêu:** Kịch bản kiểm thử tích hợp đầu cuối độc lập, thực thi và trả về mã thành công `exit 0` để thông quan Gate 4.
* **Vị trí file:** `scripts/verify-phase-4-2.ts`
* **Quy trình chạy kiểm tra:**
  1. Kiểm tra tính toàn vẹn của Zod Schemas trong `@cardealer/types`.
  2. Kiểm tra seeder mặc định trong `@cardealer/database`.
  3. Kiểm tra endpoint REST API của `@cardealer/api`.
  4. Kiểm tra render các phân khu Storefront trong `@cardealer/web`.
  5. Xuất báo cáo tổng kết và kết thúc với `process.exit(0)`.
