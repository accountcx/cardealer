# 🎯 Feature Backlog: Bộ Công Cụ Tài Chính & Phễu Thu Thập Khách Hàng (Pricing & Lead Engine)

## 1. Thông Tin Tổng Quan (Metadata)
* **Mã Tính Năng (Epic ID):** `EPIC-PHASE-3-PRICING-LEAD`
* **Phạm vi Nền tảng (Target Platform):** Full-stack (`packages/core`, `packages/types`, `packages/database`, `apps/api`, `apps/web`, `apps/admin`)
* **Cấp độ Thực thi (Execution Tier):** Tier 1 (Core Feature / Greenfield / Full 5 Phase Lifecycle)
* **Trạng thái Môi trường:** 🟢 Pure Development (Local/Staging Monorepo)
* **Số lượng Lát cắt (Vertical Slices):** 4 Slices (`US-01`, `US-02`, `US-03`, `US-04`)

---

## 2. Ma trận Trạng thái Lát cắt Tính năng (Vertical Feature Slices Matrix)

| ID | User Story / Phạm Vi Lát Cắt | Nền Tảng / Layer | Target Files | Phương Pháp Kiểm Chứng (DoD) | Trạng Thái |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **US-01** | **Pricing & Financial Core Engine + Test Suite**<br>Thuật toán tính giá lăn bánh & trả góp dư nợ giảm dần, bảng phí theo vùng. | Shared / `packages/core` & `packages/types` | ~4 files | Vitest Unit Tests pass 100% với sai số 0 đồng. | 🔄 IN PROGRESS |
| **US-02** | **Lead Entity, DB Migration & Public Ingestion API**<br>Bảng `leads` PostgreSQL, Zod validation, API `POST /api/leads` chống spam & idempotency. | BE / `packages/database` & `apps/api` | ~5 files | DB Migration thành công + API Integration Test exit 0. | ⏸️ QUEUED |
| **US-03** | **Storefront SmartCalculator & 2-Step Gated Lead Funnel**<br>Trang `/gia-lan-banh`, tương tác chọn xe, popup thu lead Name+Phone, mở khóa bảng chi phí. | FE Web / `apps/web` | ~6 files | Visual QA + E2E Submit Lead flow + SEO JSON-LD. | ⏸️ QUEUED |
| **US-04** | **Admin Lead Management & CRM Table**<br>Trang `/leads` cho Sales & Quản lý xem, tìm kiếm, lọc trạng thái, mở khóa nav `/leads` trong Admin. | FE Admin / `apps/admin` | ~5 files | RBAC check (`leads:read`, `leads:write`) + Type-check exit 0. | ⏸️ QUEUED |

---

## 3. Phân tích Khảo cổ & Ý đồ Nghiệp vụ (Codebase Archeology)
* **Tọa độ Module liên quan:**
  * Thuật toán tài chính: `packages/core/src/pricing/`
  * Khế ước kiểu dữ liệu: `packages/types/src/pricing.ts`, `packages/types/src/lead.ts`
  * Cơ sở dữ liệu: `packages/database/src/schema/leads.ts`
  * API Ingestion & Management: `apps/api/src/routes/leads.ts`, `apps/api/src/routes/admin/leads.ts`
  * Storefront Public Web: `apps/web/app/gia-lan-banh/page.tsx`, `apps/web/app/components/calculator/`
  * Admin CRM: `apps/admin/app/leads/page.tsx`, `apps/admin/app/components/AdminShell.tsx`
* **Tham chiếu mã nguồn cũ (`fe-cardealer`):**
  * Trang `app/gia-lan-banh/page.tsx`: Gồm Metadata SEO, FAQ Accordion 5 câu hỏi, bài viết hướng dẫn biểu phí Nghệ An và nhúng `SmartCalculator`.
  * Component `SmartCalculator.tsx`: Cơ chế State Machine 3 trạng thái (`input` ➡️ `gate` ➡️ `success`).
* **Kế thừa và cải tiến chuẩn Monorepo:**
  * Chuyển các hằng số thuế phí cứng (`0.1`, `200000`, `140000`) thành Engine thuần túy trong `packages/core` có cấu hình tỉnh thành (Vinh 1tr biển số, Hà Nội 20tr biển số & 12% trước bạ).
  * Tách biệt logic tính trả góp thành thuật toán riêng biệt với dư nợ giảm dần, tính rõ gốc hàng tháng, lãi tháng đầu và tổng trả trước.
  * Backend API bảo mật với Idempotency key, kiểm tra regex số điện thoại Việt Nam 10 số đầu chuẩn `(03|05|07|08|09)`.

---

## 4. Đặc tả Yêu cầu Chức năng (Functional Requirements - FR)
* **FR-01 (Dự toán lăn bánh chuẩn xác):**
  * Tiếp nhận: Giá xe niêm yết, mã tỉnh thành (Nghệ An / Hà Tĩnh / Hà Nội / TP.HCM), số chỗ ngồi (<= 5 chỗ hoặc > 5 chỗ), tùy chọn bảo hiểm thân vỏ (1.3%), tùy chọn phí dịch vụ trọn gói (2.000.000đ).
  * Đầu ra: Bóc tách từng khoản: Trước bạ, Biển số, Đăng kiểm, Đường bộ (12 tháng), Bảo hiểm TNDS bắt buộc, Bảo hiểm thân vỏ, Phí dịch vụ, và Tổng chi phí lăn bánh.
* **FR-02 (Dự toán trả góp ngân hàng):**
  * Tiếp nhận: Giá xe niêm yết, tỷ lệ vay (10% - 85%), thời hạn vay (12 - 96 tháng), lãi suất ưu đãi năm (mặc định 7.9%/năm hoặc tùy chỉnh).
  * Đầu ra: Số tiền trả trước (vốn tự có), số tiền vay giải ngân, tiền gốc hàng tháng, tiền lãi tháng đầu, tổng đóng tháng đầu.
* **FR-03 (Phễu chuyển đổi 2 bước - 2-Step Gated Lead Funnel):**
  * Bước 1: Khách hàng chọn Dòng xe, Phiên bản, Tỉnh thành. Hệ thống tính toán sẵn dưới nền nhưng che mờ/khóa bảng chi tiết.
  * Bước 2: Kích hoạt Modal Cổng chặn: Yêu cầu nhập Họ tên, Số điện thoại (10 chữ số), Khung giờ liên hệ thuận tiện (Sáng / Chiều / Tối).
  * Bước 3: Sau khi gửi thành công, chuyển sang `state = 'success'`, lưu lead vào DB và mở khóa toàn bộ bảng bóc tách chi phí.
* **FR-04 (Thu thập & Chống spam Lead - 100% Không Phát Sinh Phí):**
  * Kiểm tra định dạng cơ bản: Chỉ kiểm tra cú pháp số điện thoại bằng Regex nội bộ miễn phí (chuỗi 10 chữ số bắt đầu bằng đầu số VN `03, 05, 07, 08, 09`). **Tuyệt đối KHÔNG tích hợp dịch vụ gửi tin nhắn SMS OTP hay Brandname tính phí**.
  * Chống spam miễn phí bằng phần mềm: Rate-limiting theo IP và Idempotency (chặn click liên tục trùng lặp trong 60 giây).
  * Tự động gán tag phân loại: `Giá Lăn Bánh`, `Trả Góp`, `Báo Giá Nhanh`.
* **FR-05 (Giao diện Quản trị Khách Hàng - Admin Leads CRM):**
  * Hiển thị bảng khách hàng mới nhận được theo thời gian thực (giảm dần).
  * Lọc theo trạng thái: `Mới tiếp nhận` (`new`), `Đã liên hệ` (`contacted`), `Đã chốt cọc` (`converted`), `Hủy / Sai số` (`cancelled`).
  * Phân quyền RBAC: `sales` và `manager` được xem và cập nhật trạng thái tư vấn lead (`leads:write`).

---

## 5. Đặc tả Yêu cầu Phi Chức năng (Non-Functional Requirements - NFR)
* **NFR-01 (Hiệu năng tính toán):** Thuật toán tính lăn bánh và trả góp chạy ở client-side trong `packages/core` với độ trễ phản hồi < 5ms, phản ứng tức thì với slider / select.
* **NFR-02 (SEO & Rich Snippets):** Tích hợp đầy đủ JSON-LD Schema `SoftwareApplication` & `FAQPage` cho trang `/gia-lan-banh`.
* **NFR-03 (Bảo mật thông tin khách hàng):** Khách vãng lai không xem được số điện thoại của người khác; số điện thoại trong Admin chỉ hiển thị đầy đủ cho tài khoản có quyền `leads:read`.
* **NFR-04 (Zero Arbitrary Styling & Design Tokens):** Toàn bộ giao diện storefront và admin tuân thủ bảng màu Hyundai `#002C6C` / `#0072CE`, Tailwind tokens, không dùng pixel cứng tùy tiện.

---

## 6. Ma trận 6 Lăng Kính Phản Biện (6 Strategic Lenses)
1. **Lăng kính Phân vùng Nền tảng (Platform Boundary):**
   * Tầng Tính toán (`packages/core`): Pure Functions không phụ thuộc React hay DOM, dễ dàng tái sử dụng cho cả Web, Mobile App sau này.
   * Tầng Khế ước (`packages/types`): Định nghĩa Zod Schema cho Lead Input và Type cho Calculation.
   * Tầng Lưu trữ (`packages/database`): Bảng `leads` có liên kết ngoại `car_id`, `version_id`.
   * Tầng Giao diện (`apps/web` & `apps/admin`): Tiêu thụ Primitives từ `@cardealer/ui`.
2. **Lăng kính Người dùng Cuối (End-User Value):**
   * Khách hàng nhận được bảng dự toán minh bạch từng đồng, không mập mờ chi phí ẩn.
   * Nhân viên Showroom nhận được lead nóng kèm thông tin xe cụ thể và khung giờ tiện gọi.
3. **Lăng kính Kiến trúc Hệ thống (Architectural Integrity):**
   * Không duplicate công thức lăn bánh giữa Web và Admin; dùng chung 1 engine từ `@cardealer/core`.
4. **Lăng kính Vận hành & Mở rộng (Operational & Scale):**
   * Biểu phí địa phương được tổ chức thành cấu hình theo mã vùng (`nghe_an`, `ha_tinh`, `ha_noi`, `ho_chi_minh`), dễ dàng bổ sung thêm các tỉnh thành khác mà không cần sửa code giao diện.
5. **Lăng kính An toàn & Bảo mật (Security & Anti-Abuse):**
   * Chống spam bot bằng Idempotency hash `MD5(phone + car_id + date_minute)`.
   * Khử XSS trong trường họ tên và ghi chú.
6. **Lăng kính Rủi ro & Góc khuất (Edge Cases & Fallbacks):**
   * Nếu phiên bản xe chưa có giá niêm yết (`giaNiemYet = 0` hoặc `null`), hiển thị nhãn "Liên hệ hotline" thay vì tính ra số 0đ.
