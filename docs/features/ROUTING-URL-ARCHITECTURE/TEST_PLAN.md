# 🧪 Quality Assurance & Test Strategy: ROUTING-URL-ARCHITECTURE

## 1. Tổng Quan Chiến Lược Kiểm Thử (QA Strategy Overview)
* **Phạm vi Nền tảng:** Frontend Web (Next.js 15 App Router Server Component, Client Navigation) & Shared Packages (`packages/types`, `packages/database`).
* **Phương thức Chứng thực Máy (Machine Verification Mode):**
  1. **Static Analysis & Type Integrity Gate:** TypeScript Compiler (`tsc --noEmit`) kiểm tra tính hợp lệ của Next.js 15 async `PageProps`, `generateMetadata` và data contract types.
  2. **Automated Unit & Contract Test Suite:** Vitest / Node test runner kiểm tra:
     - Segment Whitelist Registry validation.
     - In-memory car filtering logic.
     - Breadcrumb & ItemList JSON-LD structure serializer.
     - Navigation/Footer settings URL consistency.
  3. **Integration & Route Status Code Verification:** HTTP / Headless curl validation kiểm tra Status Code (200 OK vs 404 Not Found) và thẻ HTML SEO cơ bản.
* **Mục tiêu Nghiệm thu:** 100% Test cases tự động pass, 0 hydration warnings, không sinh ra soft-404, đáp ứng tiêu chuẩn SEO On-page (H1 duy nhất + bài viết >= 200 từ).

---

## 2. Ma Trận Kịch Bản Kiểm Thử (Test Scenarios Matrix)

| ID | Lát Cắt | Phân Loại | Kịch Bản Kiểm Thử | Dữ Liệu Đầu Vào (Payload / URL / State) | Kết Quả Kỳ Vọng (Expected Outcome) | Trạng Thái |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **TS-01** | US-01 | Contract | Kiểm tra Type Contract Navigation & Footer | `DEFAULT_NAVIGATION_SETTINGS`, `DEFAULT_FOOTER_SETTINGS` | URL menu trỏ về `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv`; Type-check PASS | PENDING |
| **TS-02** | US-01 | Seed QA | Khởi tạo dữ liệu mẫu Settings trong DB | Chạy script seed `seed-settings.ts` | Bản ghi `navigation_settings` và `footer_settings` trong DB chứa đúng URL mới, không lỗi cú pháp JSON | PENDING |
| **TS-03** | US-01 | UI Active | Đánh dấu menu item khi người dùng truy cập trang phân khúc | Người dùng ở URL `/dong-xe/suv` | Menu item "SUV" trên Navbar & MobileDrawer nhận class active (text-red-600 / font-semibold) | PENDING |
| **TS-04** | US-02 | Positive (Happy Path) | Truy cập phân khúc Sedan hợp lệ | URL: `/dong-xe/sedan` | HTTP 200; Title: `Xe Sedan Toyota Chính Hãng...`; H1 duy nhất; Bài viết SEO >= 200 từ; Lưới xe hiển thị các xe có `kieuDang === 'Sedan'` | PENDING |
| **TS-05** | US-02 | Positive (Happy Path) | Truy cập phân khúc SUV hợp lệ | URL: `/dong-xe/suv` | HTTP 200; Title: `Xe SUV & Crossover Toyota...`; H1 đúng phân khúc; Hiển thị danh sách xe SUV | PENDING |
| **TS-06** | US-02 | Positive (Happy Path) | Truy cập phân khúc MPV hợp lệ | URL: `/dong-xe/mpv` | HTTP 200; Title: `Xe Đa Dụng MPV Toyota...`; H1 đúng phân khúc; Hiển thị danh sách xe MPV | PENDING |
| **TS-07** | US-02 | Security / 404 (R4) | Truy cập slug phân khúc không nằm trong Whitelist | URL: `/dong-xe/hatchback`, `/dong-xe/coupe` | Trả về HTTP 404 (Next.js `notFound()`); Hiển thị trang Not Found của hệ thống | PENDING |
| **TS-08** | US-02 | Security / XSS (R4) | Thử nghiệm tấn công XSS & Path Traversal qua URL slug | URL: `/dong-xe/<script>alert(1)</script>`, `/dong-xe/../../etc` | Trả về HTTP 404 ngay lập tức; Không render payload độc hại vào HTML / JSON-LD | PENDING |
| **TS-09** | US-02 | SEO Schema | Kiểm tra cấu trúc dữ liệu Structured Data JSON-LD | Xem mã nguồn HTML tại `/dong-xe/sedan` | Tồn tại thẻ `<script type="application/ld+json">` chứa schema hợp lệ `BreadcrumbList` và `ItemList` | PENDING |
| **TS-10** | US-02 | Boundary / State | Phân khúc hợp lệ nhưng chưa có xe nào trong kho dữ liệu | URL: `/dong-xe/mpv` khi `getCatalogCars()` không có xe nào thuộc kiểu dáng `MPV` | HTTP 200; Render Empty State ("Hiện chưa có dòng xe nào thuộc phân khúc này...") kèm nút CTA "Xem tất cả xe" trỏ về `/xe` | PENDING |
| **TS-11** | US-02 | Resilience (R14) | Upstream API `getCatalogCars()` bị timeout / reject | Giả lập service ném lỗi Network Error | Không crash sập trang (500 White Screen); Render Fallback State / Error Boundary an toàn, layout Header/Footer vẫn hiển thị nguyên vẹn | PENDING |
| **TS-12** | US-02 | Next.js 15 (R12) | Xử lý async `params` theo chuẩn Next.js 15 App Router | Build Next.js (`pnpm --filter web build`) | Build biên dịch thành công; 0 warnings về việc truy cập `params.slug` đồng bộ; `generateStaticParams` sinh đủ 3 static pages | PENDING |
| **TS-13** | US-02 | Performance (R2) | In-memory filter hiệu năng với tập dữ liệu lớn | Chạy hàm filter với danh mục 200 xe | Thời gian filter CPU < 5ms; Không phát sinh circular reference hay leak memory | PENDING |

---

## 3. Tiêu Chuẩn Máy Chứng Thực Tự Động (Machine Verification)

### A. Lệnh Type-check & Lint (Bắt buộc chạy đầu tiên ở Phase 4)
* **Mục tiêu:** Kiểm chứng tĩnh toàn bộ type contract và đảm bảo Next.js 15 không bị vi phạm type signature.
* **Lệnh chạy:**
```bash
# Type check toàn bộ monorepo hoặc packages liên quan
pnpm --filter @cardealer/types build
pnpm --filter web type-check # hoặc pnpm --filter web build
```
* **Điều kiện Pass:** Mã thoát `exit code 0`, 0 lỗi TypeScript.

---

### B. Unit & Validation Test Runner (`packages/web/tests` hoặc test script)
* **Đường dẫn Script:** `packages/web/src/config/__tests__/segments.test.ts` (hoặc script test độc lập `scripts/verify_routing_architecture.ts`)
* **Logic kiểm chứng tự động:**
```typescript
import { describe, it, expect } from 'vitest';
import { VALID_SEGMENT_SLUGS, getSegmentConfig } from '@/config/segments';
import { filterCarsBySegment } from '@/lib/car-segment-filter';

describe('Segment Registry & Filter Verification', () => {
  it('TS-01: Should contain exactly 3 valid segments', () => {
    expect(VALID_SEGMENT_SLUGS).toEqual(['sedan', 'suv', 'mpv']);
  });

  it('TS-07 & TS-08: Should return null/undefined for unknown or malicious slugs', () => {
    expect(getSegmentConfig('hatchback')).toBeUndefined();
    expect(getSegmentConfig('<script>')).toBeUndefined();
    expect(getSegmentConfig('../etc/passwd')).toBeUndefined();
  });

  it('TS-04: Should correctly map slug to Vietnamese DB kieuDang', () => {
    const sedan = getSegmentConfig('sedan');
    expect(sedan?.title).toContain('Sedan');
    expect(sedan?.kieuDangMapping).toEqual(['Sedan']);
    
    const suv = getSegmentConfig('suv');
    expect(suv?.kieuDangMapping).toContain('SUV');
    expect(suv?.kieuDangMapping).toContain('Crossover');
  });

  it('TS-13: Should filter cars safely in-memory without mutating original array', () => {
    const mockCars = [
      { id: '1', tenXe: 'Vios', kieuDang: 'Sedan' },
      { id: '2', tenXe: 'Corolla Cross', kieuDang: 'SUV' },
      { id: '3', tenXe: 'Innova Cross', kieuDang: 'MPV' },
    ];
    const filtered = filterCarsBySegment(mockCars as any, 'sedan');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].tenXe).toBe('Vios');
  });
});
```
* **Lệnh chạy:**
```bash
pnpm --filter web test
```
* **Điều kiện Pass:** 100% unit tests pass (`exit code 0`).

---

### C. Build & Route Generation Verification
* **Lệnh chạy:**
```bash
pnpm --filter web build
```
* **Điều kiện Pass:**
  - Route tree xuất hiện:
    ```text
    ● /dong-xe/[slug]          (SSG: Prerendered as static HTML)
      ├ /dong-xe/sedan
      ├ /dong-xe/suv
      └ /dong-xe/mpv
    ```
  - Exit code: `0`.

---

## 4. Danh Sách Tiêu Chí Nghiệm Thu Cho Developer (Phase 4 Checklist)
Trước khi bàn giao sang Phase 5 (Code Review), Developer phải tự kiểm chứng:
- [ ] 1. **TS-01 & TS-02:** Navigation & Footer URL cập nhật chính xác sang `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv`.
- [ ] 2. **TS-04, TS-05, TS-06:** Cả 3 trang phân khúc render đúng H1, nội dung SEO >= 200 chữ và lưới xe tương ứng.
- [ ] 3. **TS-07 & TS-08:** Slug không thuộc whitelist kích hoạt `notFound()` trả về HTTP 404 thực thụ.
- [ ] 4. **TS-09:** Có thẻ BreadcrumbList và ItemList schema JSON-LD.
- [ ] 5. **TS-10:** Xử lý hiển thị UI Empty State nhẹ nhàng khi không có xe.
- [ ] 6. **TS-11:** Có khối try-catch an toàn khi gọi `getCatalogCars()`.
- [ ] 7. **TS-12:** Build Next.js 15 pass sạch sẽ, không có bất kỳ warning về `params.slug` hay hydration mismatch.

---

### 🧭 TRẠNG THÁI TIẾN ĐỘ: HOÀN TẤT GIAI ĐOẠN 3 (RISK AUDIT & TEST PLAN)
* **Giai đoạn Vừa Hoàn Thành:** Phase 3: Kiểm soát Rủi ro và Thiết kế Ma trận Kiểm thử
* **Tài liệu Bàn giao Toàn Phase 3:**
  1. [`RISK_AUDIT.md`](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/RISK_AUDIT.md) (Step 3.1 — Dependency & Risk Analyzer)
  2. [`TEST_PLAN.md`](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/TEST_PLAN.md) (Step 3.2 — QA Test Engineer)
* **Trạng thái Chốt chặn:** 🟢 SẴN SÀNG CHUYỂN PHA (PHASE TRANSITION READY).
* **Quyết định Mở khóa:** 🔓 CHUẨN BỊ MỞ KHÓA MÃ NGUỒN (Tool-Lock chuẩn bị gỡ cho Phase 4).
