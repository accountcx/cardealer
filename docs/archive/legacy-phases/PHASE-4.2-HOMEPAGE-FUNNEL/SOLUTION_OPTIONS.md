# 🏛️ Architectural Solution Options: Trang Chủ Phễu Chuyển Đổi 6 Phân Khu (Homepage Conversion Funnel - `/`)

## 1. Bối cảnh & Ràng buộc Kỹ thuật (Technical Constraints)
* **Mã Tính Năng (Epic ID):** `EPIC-PHASE-4.2-HOMEPAGE-FUNNEL`
* **Phạm vi Nền tảng:** Full-stack (`packages/types`, `packages/database`, `apps/api`, `apps/admin`, `apps/web`, `packages/ui`)
* **Hiện trạng Hệ thống (Tham chiếu `docs/SYSTEM_MAP.md` & Phase 4.1):**
  * `packages/database`: Đã hoàn thành bảng `system_settings` (Key-JSONB) lưu trữ các domain keys: `site_settings`, `contact_settings`, `navigation_settings`, `floating_seller_settings`, `sticky_bar_settings`.
  * `packages/types`: Đã hoàn thiện hệ thống Zod schemas và type-safe fallback.
  * `apps/api`: Endpoint `GET /api/settings` đã hỗ trợ bulk fetch tất cả settings đang active.
  * `apps/admin`: Đã có `/admin/settings` phân chia tabs chuyên biệt, hoạt động mượt mà với React Hook Form + Zod.
  * `apps/web`: Đã có Shell toàn cục (`RootLayout`, `Navbar`, `Footer`, `FloatingSeller`, `ProductStickyBar`, `LeadQuoteModal`). Trang `apps/web/app/page.tsx` hiện là trang demo đơn sơ cần thay thế bằng Phễu 6 phân khu hoàn chỉnh.
* **Mục tiêu Trọng yếu:**
  1. 100% 6 phân khu có khả năng **cấu hình linh hoạt từ Admin Portal** và sở hữu **công tắc Bật/Tắt độc lập (`enabled: boolean`)**.
  2. Tự động ẩn mượt mà (**Graceful Degradation**) khi một khu bị tắt hoặc chưa có nội dung (chưa có bài viết hoặc chưa có ảnh bàn giao), không làm vỡ layout hay lỗi trắng trang.
  3. Đạt chuẩn **Core Web Vitals**: FCP < 1.0s, LCP < 2.0s, CLS = 0.
  4. Tránh lỗi lệch múi giờ (Timezone Hydration Mismatch) ở bộ đếm ngược Countdown.

---

## 2. Ma trận So sánh 3 Phương án Kiến trúc (Trade-off Matrix)

| Tiêu chí So sánh | Option 1 (MVP: Hardcoded Layout & Client-Side Fetch) | Option 2 (Production-Ready: Modular Domain Key `homepage_settings` + Hybrid SSR & Island Hydration) ⭐ | Option 3 (High-Scale: Headless Dynamic Page Builder & Drag-Drop Block Registry) |
| :--- | :--- | :--- | :--- |
| **Mô hình Dữ liệu** | Hardcode các khối trên Storefront, dữ liệu config fix cứng trong code. | **Domain Key `homepage_settings`** trong `system_settings` (PostgreSQL JSONB), type-safe 100% qua Zod Schema. | Tách bảng quan hệ `homepage_blocks`, `block_configs`, kéo thả vô hạn block tùy biến. |
| **Quản trị Admin** | Không có hoặc chỉ sửa được vài trường lẻ tẻ. | **Tab "Trang Chủ" trực quan** trong `/admin/settings` với 6 Accordions & 6 Switches Bật/Tắt độc lập. | Giao diện Page Builder kéo thả (Drag-and-Drop) phức tạp như Webflow/Gutenberg. |
| **Hiệu năng & CLS** | ❌ **CLS cao:** Client fetch gây giật trang, các khối xuất hiện chập chờn sau khi mount. | ✅ **CLS = 0 & FCP < 1.0s:** Server Component (RSC) nạp dữ liệu song song, render HTML chuẩn ngay từ Server. | ⚠️ CLS trung bình: Đòi hỏi dynamic resolver runtime phức tạp để parse dynamic blocks. |
| **Hydration & Timezone** | ❌ Dễ dính lỗi Hydration Mismatch giữa Client/Server do lệch múi giờ đếm ngược. | ✅ **Client Island Cách Ly:** Khối Countdown được đóng gói thành Client Island với cơ chế mounted-check an toàn. | ⚠️ Phức tạp: Cần custom hydration loader cho từng dynamic block. |
| **Cơ chế Ẩn An Toàn (Graceful Degradation)** | Thủ công bằng lệnh `if-else` rời rạc. | ✅ **Hệ Thống Hóa:** Component kiểm tra `if (!config.enabled) return null;`, trang chủ tự động co giãn bố cục mượt mà. | Phức tạp, dễ để lại khoảng trống DOM do render wrapper rỗng. |
| **Độ Phức Tạp & Chi Phí** | Thấp nhất (nhưng không đáp ứng yêu cầu quản trị). | **Tối ưu & Cân bằng hoàn hảo:** Đạt chuẩn Enterprise, dễ bảo trì, hoàn thành đúng tiến độ. | Rất cao: Cần từ 3-4 tuần, over-engineering cho một website đại lý bán xe ô tô. |

---

## 3. Phân tích Chi tiết Từng Phương án

### 🔹 Option 1: MVP — Hardcoded Layout & Client-Side Fetching
* **Cơ chế hoạt động:** Giao diện 6 phân khu được code cố định trong `apps/web/app/page.tsx`. Các hình ảnh banner, chữ khuyến mãi, cam kết bán hàng bị fix cứng trong code. Chỉ có danh sách xe là gọi `useEffect` từ API sau khi trang tải.
* **Nhược điểm & Rủi ro:**
  * Không thể cấu hình từ Admin: Mỗi lần saler đổi khuyến mãi tháng mới hoặc muốn tắt bớt khối tin tức thì phải mở code ra sửa và deploy lại web.
  * Trải nghiệm giật cục (CLS cao) do client-side data fetching.
  * Vi phạm trực tiếp yêu cầu nghiệp vụ của dự án.

---

### 🔹 Option 2: Production-Ready — Modular Domain Key `homepage_settings` + Hybrid SSR & Island Hydration ⭐ *(Đề xuất)*
* **Cơ chế hoạt động:**
  * **Cấu trúc Dữ liệu Độc lập & Type-Safe:**
    * Thêm domain key `homepage_settings` vào bảng `system_settings` của PostgreSQL.
    * Được định nghĩa và xác thực chặt chẽ bằng `HomepageSettingsSchema` trong `packages/types/src/settings.ts`, bao gồm 6 zone configs:
      1. `heroBanner`: Headline, slogan, media (ảnh/video), countdown timer (bật/tắt, target date, urgency text), số suất ưu đãi còn lại, CTA button text/modal.
      2. `leadFilter`: Bật/tắt, danh sách mốc giá gợi ý, các kiểu dáng xe (Sedan, SUV, MPV, Bán tải).
      3. `salerShowroom`: Bật/tắt, chế độ (`mode: 'saler' | 'showroom'`), hồ sơ giới thiệu, 4 cam kết vàng, gallery ảnh thực tế.
      4. `featuredCars`: Bật/tắt, tiêu đề khối, số lượng xe tối đa. (Dữ liệu xe được truy vấn động từ Catalog DB với điều kiện `isFeatured = true`).
      5. `deliveryStories`: Bật/tắt, album khách nhận xe (danh sách gồm: ảnh bàn giao, tên khách hàng, dòng xe, lời chia sẻ ngắn).
      6. `latestPromotions`: Bật/tắt, tiêu đề khối, số bài hiển thị. (Dữ liệu bài viết lấy từ module tin tức hoặc fallback rỗng an toàn).
  * **Kiến trúc Server-Side Rendering (RSC) & Island Architecture:**
    * Trang chủ `apps/web/app/page.tsx` là Server Component nạp đồng thời:
      ```typescript
      const [settings, featuredCars, latestNews] = await Promise.all([
        getHomepageSettings(),
        getFeaturedCars(),
        getLatestNews(),
      ]);
      ```
    * Dữ liệu HTML được render sẵn từ máy chủ, giúp tốc độ tải ban đầu cực nhanh (FCP < 1.0s, LCP < 2.0s), điểm SEO cao và CLS = 0.
    * Chỉ những thành phần tương tác cao mới chuyển thành Client Component ("Client Islands"):
      * `CountdownTimer.tsx`: Bộ đếm ngược thời gian thực, có mounted flag chống lỗi Hydration Mismatch.
      * `LeadMagnetFilter.tsx`: Tab lọc nhanh theo ngân sách/phân khúc, chuyển hướng sang `/xe?segment=...&price=...`.
      * `DeliveryCarousel.tsx`: Slider ảnh khách nhận xe mượt mà trên cả Mobile và Desktop.
  * **Cơ chế Graceful Degradation (Tự Động Ẩn An Toàn):**
    * Mỗi phân khu trước khi render đều kiểm tra điều kiện an toàn:
      * Nếu công tắc `enabled === false` ➡️ Trả về `null`.
      * Nếu là khối dữ liệu động (Khu 4, 5, 6) mà mảng dữ liệu rỗng (`items.length === 0`) ➡️ Tự động ẩn, không để lại khoảng trống thừa hay báo lỗi.
  * **Trải nghiệm Quản trị Admin Vượt Trội:**
    * Tab "Trang Chủ" trong `/admin/settings` chia thành 6 Accordions đại diện cho 6 phân khu.
    * Mỗi Accordion đều có Switch Bật/Tắt to rõ ràng ở phần Header. Saler chỉ cần 1 click là có thể giấu đi phân khu mình chưa sẵn sàng nội dung.

---

### 🔹 Option 3: High-Scale — Headless Dynamic Page Builder & Drag-Drop Block Registry
* **Cơ chế hoạt động:** Xây dựng hệ thống Block Registry hoàn chỉnh như Notion hoặc Webflow. Cho phép người dùng kéo thả, thêm bớt không giới hạn các khối, tùy biến màu sắc, padding, thứ tự từng khối tùy ý.
* **Đánh giá:**
  * Quá phức tạp và thừa thãi đối với một website đại lý bán xe ô tô.
  * Người dùng là nhân viên sale cần sự tinh gọn, nhanh chóng và chuẩn mực về tỷ lệ chuyển đổi, không cần phải trở thành một nhà thiết kế web kéo thả tự do.
  * Chi phí triển khai cao gấp 4 lần, dễ phát sinh lỗi vỡ giao diện do người dùng cấu hình sai.

---

## 4. Kết luận & Đề Xuất Khuyến Nghị

> 💡 **Khuyến nghị chính thức:** Lựa chọn **Option 2 (Production-Ready: Modular Domain Key `homepage_settings` + Hybrid SSR & Island Hydration)**.
>
> **Lý do:**
> 1. Đáp ứng trọn vẹn 100% yêu cầu: Cấu hình động từ Admin, công tắc Bật/Tắt độc lập cho từng khu, và tự động ẩn an toàn khi chưa có bài viết hay ảnh giao xe.
> 2. Đạt hiệu năng Core Web Vitals tối đa nhờ SSR kết hợp Client Islands.
> 3. Tận dụng tối đa kiến trúc Module Settings Type-Safe sẵn có từ Phase 4.1, đảm bảo tính kế thừa cao và hoàn thành nhanh gọn.

---

## 🔒 LỆNH THÔNG QUAN SUB-GATE 2.1
Vui lòng chọn và phát lệnh chốt phương án để chuyển sang **Bước 2.2 (Thiết kế chi tiết bộ ngũ tài liệu: FLOW, SCHEMA, API_SPEC, UI_SPEC, FE_INTEGRATION_GUIDE)**:
* 👉 **`Chốt Option 2`** *(Khuyến nghị - Production-Ready Hybrid SSR & Zone Toggles)*
* 👉 Hoặc `Chốt Option 1` / `Chốt Option 3`
