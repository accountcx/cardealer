# 🏛️ Architectural Solution Options: Khung Nền Tảng Storefront & Tiện Ích Chuyển Đổi Toàn Cục (Global Shell & Conversion Widgets)

## 1. Bối cảnh & Ràng buộc Kỹ thuật (Technical Constraints)
* **Mã Tính Năng (Epic ID):** `EPIC-PHASE-4.1-STOREFRONT-SHELL-WIDGETS`
* **Phạm vi Nền tảng:** Full-stack (`packages/types`, `packages/database`, `apps/api`, `apps/admin`, `apps/web`, `packages/ui`)
* **Hiện trạng Hệ thống (Tham chiếu `docs/SYSTEM_MAP.md`):**
  * `packages/database`: Đã có bảng `system_settings` (Key-JSONB). Hiện chỉ có 1 key đơn giản `showroom_settings`.
  * `packages/types`: Đã có `SiteSettingsSchema`, `ContactSettingsSchema`, `EventBannerSchema`, `QuoteSettingsSchema` trong `settings.ts`. Chưa có `NavigationSchema` và `StickyBarSchema`.
  * `apps/api`: Đã có `GET /api/settings/:key` và `GET/PUT /api/admin/settings`. Chưa có route bulk `GET /api/settings` tổng hợp.
  * `apps/admin`: Đã có trang `/admin/settings` nhưng chỉ là form phẳng 9 trường đơn giản của showroom.
  * `apps/web`: `RootLayout` hiện tại chưa tích hợp Navbar, Footer, Mobile Drawer, FloatingSeller, hay ProductStickyBar.
* **Ràng buộc Môi trường:** 🟢 **Pure Development** (Local/Staging Monorepo - Tự do tái cấu trúc và mở rộng).
* **Mục tiêu Trọng yếu:** Toàn bộ thành phần Header, Mobile Drawer, Footer, FloatingSeller và ProductStickyBar **phải cấu hình và chỉnh sửa linh hoạt 100% từ Admin CMS**, tải trang đạt CLS = 0, chuẩn SEO và không bị va chạm che khuất lẫn nhau trên màn hình điện thoại.

---

## 2. Ma trận So sánh 3 Phương án Kiến trúc (Trade-off Matrix)

| Tiêu chí So sánh | Option 1 (MVP: Monolithic JSON & Client Fetch) | Option 2 (Production-Ready: Modular Domain Keys, SSR + Revalidation & Viewport Coordination) ⭐ | Option 3 (High-Scale: Fully Normalized RDBMS Tables & WebSocket Push) |
| :--- | :--- | :--- | :--- |
| **Mô hình Dữ liệu** | 1 JSON blob duy nhất trong `system_settings` (`key = 'global_shell'`). | Phân vùng theo Domain Keys (`site_settings`, `navigation_settings`, `contact_settings`, `sticky_bar_settings`). | Tách 4-5 bảng quan hệ PostgreSQL (`menus`, `menu_items`, `dealers`, `widgets`). |
| **Cơ chế Storefront Data Fetching** | Client-side Component (`useEffect` / React Query) gọi API sau khi trang render. | **Server-Side Rendering (RSC) trong `RootLayout`** nạp qua Next.js Cache Tag (`system-settings`) + Fallback defaults an toàn. | gRPC / GraphQL Server Components nạp từ cụm Redis Cache. |
| **Độ trễ & Layout Shift (CLS)** | ❌ **CLS cao:** Header/Footer bị nháy hoặc xuất hiện trễ sau khi trang tải. | ✅ **CLS = 0:** HTML hoàn chỉnh sinh sẵn từ server, trang không bị nhảy vị trí. | ✅ **CLS = 0:** SSR tối ưu. |
| **Khả năng SEO & Local Schema** | ⚠️ Kém (Googlebot có thể không render kịp link menu trong dynamic JSON). | ✅ **Tối ưu SEO:** HTML có sẵn thẻ ngữ nghĩa `<header>`, `<nav>`, `<footer>` và JSON-LD `AutoDealer`. | ✅ Tối ưu SEO tương đương Option 2. |
| **Trải nghiệm Admin Portal** | 1 trang form dài dằng dặc, dễ lưu đè dữ liệu của nhau. | **Tabs chuyên biệt:** 1. Thông tin Showroom, 2. Menu Navigation Builder, 3. Chuyên viên nổi, 4. Thanh chốt đơn. | Quản trị đa chi nhánh phức tạp với nhiều tầng quan hệ cha-con. |
| **Điều phối Widget Mobile** | Dùng CSS z-index tĩnh, dễ đè lên nhau trên màn hình hẹp. | **Dynamic Viewport Coordinator:** FloatingSeller tự động đẩy lên cách đáy 80px khi StickyBar xuất hiện. | Context Event Bus điều phối hiển thị qua React Context / Zustand. |
| **Độ phức tạp & Chi phí Vận hành** | Thấp (1-2 ngày), nhưng nợ kỹ thuật (Tech Debt) lớn. | **Cân bằng hoàn hảo:** Type-safe 100%, linh hoạt, zero hạ tầng phát sinh. | Rất cao: Cần migration nhiều bảng, quản lý transaction phức tạp, over-engineering cho 1 đại lý. |

---

## 3. Phân tích Chi tiết Từng Phương án

### 🔹 Option 1: MVP — Monolithic JSON & Client-Side Fetching
* **Cơ chế hoạt động:**
  * Toàn bộ cấu hình của Navbar, Footer, FloatingSeller và StickyBar được gom thành 1 cục JSON lớn lưu dưới 1 key duy nhất trong DB.
  * Storefront dùng `'use client'` ở Root Component để fetch dữ liệu từ client-side sau khi trình duyệt mount.
* **Ưu điểm:**
  * Viết nhanh, ít file, chỉ cần 1 endpoint API duy nhất.
* **Nhược điểm & Rủi ro nghiêm trọng:**
  * **Layout Shift (CLS > 0.15):** Khi người dùng vào trang web, lúc đầu không có Header/Footer, 200ms sau dữ liệu API về mới render ra, khiến toàn bộ nội dung trang bị giật nhảy mạnh (trải nghiệm người dùng kém, điểm Google Core Web Vitals bị tụt).
  * **Mất giá trị SEO:** Googlebot cào trang không đọc được cấu trúc menu liên kết nội bộ ngay lập tức.
  * **Rủi ro ghi đè dữ liệu Admin:** Nếu 2 nhân viên cùng sửa form, người sửa sau sẽ ghi đè toàn bộ dữ liệu của người sửa trước.

---

### 🔹 Option 2: Production-Ready — Modular Domain Keys, SSR + Revalidation & Viewport Coordination ⭐ *(Đề xuất)*
* **Cơ chế hoạt động:**
  * **Tổ chức Dữ liệu Domain-Driven:** Bảng `system_settings` phân tách thành các Domain Keys rõ ràng:
    1. `site_settings`: Tên đại lý, logo, SEO metadata, favicon, mã nhúng Google Maps.
    2. `navigation_settings`: Mảng menu đa cấp (`headerLinks`) có nhãn, đường dẫn, thứ tự sắp xếp và menu con (subLinks).
    3. `contact_settings`: Thông tin người bán, hotline 24/7, link Zalo OA/cá nhân, thông tin pháp lý & bản quyền footer.
    4. `floating_seller_settings`: Bật/tắt widget, họ tên, avatar chuyên viên, trạng thái online, số hotline và link Zalo trực tiếp.
    5. `sticky_bar_settings`: Bật/tắt toàn cục, nhãn CTA, hotline liên kết, tiêu đề phụ kích cầu.
  * **Hợp đồng Dữ liệu Type-Safe (Zod):** Mỗi Domain Key có Schema Zod độc lập với giá trị Default Fallback chuẩn xác trong `packages/types/src/settings.ts`. Nếu DB chưa có bản ghi, hệ thống tự động sử dụng Fallback mà không bao giờ bị crash.
  * **Hiệu năng Server-Side Rendering (RSC) & Zero CLS:**
    * `apps/web/app/layout.tsx` là Server Component gọi API bulk `GET /api/settings` có cache tag `system-settings`.
    * Render ra HTML hoàn chỉnh ngay trên server: Header, Navigation, Footer chuẩn SEO.
    * Khi Admin lưu cấu hình tại Admin Portal (`PUT /api/admin/settings/:key`), hệ thống kích hoạt on-demand revalidation để cập nhật Storefront ngay lập tức.
  * **Giao diện Admin Trực quan theo Tabs:**
    * Tách `/admin/settings` thành 4 Tabs độc lập: *Showroom & Pháp lý*, *Menu Điều Hướng (Navigation Builder)*, *Chuyên Viên Nổi*, *Thanh Chốt Đơn*.
    * Lưu độc lập từng tab qua React Hook Form + Zod, không sợ xung đột ghi đè.
  * **Điều phối Tránh Va chạm Widget trên Mobile (Viewport Coordinator):**
    * Khi người dùng cuộn trang kích hoạt `ProductStickyBar` (cố định ở đáy màn hình `bottom-0`), `FloatingSeller` sẽ tự động chuyển vị trí từ `bottom-4` lên `bottom-20` (hoặc `calc(env(safe-area-inset-bottom) + 72px)`). Đảm bảo 2 tiện ích không bao giờ che khuất nhau và luôn vừa vặn trong tầm ngón tay cái.

---

### 🔹 Option 3: High-Scale — RDBMS Normalized Tables & WebSocket Realtime Push
* **Cơ chế hoạt động:**
  * Tạo các bảng quan hệ vật lý trong PostgreSQL: `menus`, `menu_items`, `showrooms`, `floating_widgets`, `sticky_bars` kèm khóa ngoại.
  * Thiết lập cụm Redis Cache và kết nối WebSocket / Server-Sent Events (SSE) để khi Admin đổi hotline, mọi trình duyệt của khách hàng đang xem web đều nhảy số ngay trên màn hình.
* **Ưu điểm:**
  * Cực kỳ linh hoạt cho hệ thống chuỗi nhiều showroom (Multi-tenancy).
* **Nhược điểm:**
  * **Over-engineering:** Nền tảng hiện tại là Showroom Ô tô Hyundai Vinh (đại lý đơn lẻ), việc tạo 5 bảng quan hệ mới và duy trì socket server làm tăng chi phí hạ tầng, tăng rủi ro lỗi kết nối mạng không cần thiết.

---

## 4. Chi tiết Phương án Đề xuất (Recommended Option)

* **Phương án Lựa chọn:** **Option 2 (Production-Ready: Modular Domain Keys, Hybrid SSR + On-Demand Revalidation & Viewport Coordination)**.
* **Lý do Lựa chọn:**
  1. **Tuân thủ Tuyệt đối Yêu cầu Người Dùng:** Cho phép Admin cấu hình và biên tập 100% nội dung (Header, Menu, Footer, Widget tư vấn, Sticky Bar) một cách trực quan qua giao diện tab chuyên nghiệp.
  2. **Trải nghiệm Khách Hàng Tuyệt Hảo:** Layout SSR tĩnh tải nhanh tức thì, **CLS = 0**, không bị nhấp nháy giao diện.
  3. **Tối ưu Mobile First:** Xử lý triệt để bài toán va chạm giao diện giữa 2 widget chuyển đổi đáy màn hình trên thiết bị di động.
  4. **Zero Hạ Tầng Mới:** Tận dụng tối đa bảng `system_settings` hiện có của PostgreSQL và cơ chế Cache Tag của Next.js App Router, tiết kiệm 100% chi phí vận hành.

---

## ⚠️ IV. THÔNG BÁO CỬA CHẶN (SUB-GATE 2.1 STATUS BLOCK)

---
### 🧭 TRẠNG THÁI QUY TRÌNH (WORKFLOW GATE STATUS)
- **Tình trạng Môi trường:** 🟢 Pure Development (Local/Staging Monorepo)
- **Cấp độ Luồng (Execution Tier):** Tier 1 (Core Feature / Full 5 Phase Lifecycle & Strict Gates 1–5)
- **Selective Context Tagging:** `@docs/SYSTEM_MAP.md`, `@docs/features/PHASE-4.1-STOREFRONT-SHELL-WIDGETS/BACKLOG.md`, `@docs/features/PHASE-4.1-STOREFRONT-SHELL-WIDGETS/SOLUTION_OPTIONS.md`
- **Giai đoạn Hiện tại:** Giai đoạn 2: Thiết kế Kiến trúc (Bước 2.1: Phân tích Solution Options)
- **Skills Đang Kích Hoạt:** `system-analyst-architect`
- **Sản phẩm Bắt buộc của Giai đoạn:** [`docs/features/PHASE-4.1-STOREFRONT-SHELL-WIDGETS/SOLUTION_OPTIONS.md`](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-4.1-STOREFRONT-SHELL-WIDGETS/SOLUTION_OPTIONS.md)
- **Trạng thái Cửa chặn (Sub-Gate 2.1):** 🔒 **ĐANG KHÓA (LOCKED)** — Chờ Developer xem xét và phê duyệt Option kiến trúc.
- **Lệnh cần Developer gửi để thông quan:** `"Chốt Option 2"` (hoặc `"Chốt Option [1/2/3]"`)
- **Kế hoạch Giai đoạn Kế tiếp:** Bước 2.2: Kích hoạt đồng loạt `logic-flow-ba`, `db-schema-architect`, `feature-spec-generator`, `tailwind-ui-designer` để hoàn thiện trọn bộ Ngũ Tài Liệu Thiết Kế (`FLOW.md`, `SCHEMA.md`, `API_SPEC.md`, `UI_SPEC.md`, `FE_INTEGRATION_GUIDE.md`).
- ⚠️ *Nhắc nhở Kỷ luật: CẤM tự ý vẽ chi tiết các tài liệu của Bước 2.2 hoặc viết code sản phẩm khi chưa nhận được lệnh chốt Option từ Developer.*
---
