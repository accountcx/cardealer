# 🧪 Quality Assurance & Test Strategy: Trang Chi Tiết Dòng Xe (`/xe/[carSlug]`)

> **Mã Epic:** `EPIC-PHASE-4.4-CAR-DETAIL-EXPERIENCE`  
> **Giai đoạn:** Giai đoạn 3: Kiểm Soát Rủi Ro & Test Plan (Quality Assurance & Test Strategy)  
> **Role phụ trách:** `qa-test-engineer`  
> **Tiêu chuẩn kiểm thử:** Shift-Left Testing, Dual-Mode Machine Verification (`exit 0`), State Exhaustiveness, Adversarial Security Testing  
> **Định vị dự án:** Website Bán Hàng Cá Nhân Của Chuyên Viên Tư Vấn Ô Tô (Automotive Sales Consultant)

---

## 1. Tổng Quan Chiến Lược Kiểm Thử (Test Strategy Overview)

* **Phạm vi Kiểm thử:** Full-stack Monorepo (`packages/types`, `packages/core`, `apps/api`, `apps/web`).
* **Phương Thức Chứng Thực Máy (Machine Verification Protocol):**
  1. **Static Typecheck Verification:** Toàn bộ Monorepo chạy `pnpm check-types` đạt 0 lỗi type-check.
  2. **Automated Unit & Schema Verification:** Chạy bộ test kiểm tra Zod validation của `CarDetailSchema` và hàm sinh `generateCarJsonLd()`.
  3. **End-to-End User Flow & Edge Verification:** Kiểm chứng các luồng Deep Linking, Zalo messaging, URL state sync và xử lý lỗi 404.
* **Quy tắc Bất Biến (Test Suite Lockdown Authority):** Kịch bản kiểm thử này là bộ rào chắn bảo vệ chất lượng độc lập. Không được nới lỏng assertions trong quá trình code ở Giai đoạn 4.

---

## 2. Bảng Kịch Bản Kiểm Thử Chi Tiết (Test Scenarios Matrix)

| ID | Phân Loại | Tên Kịch Bản Kiểm Thử | Điều Kiện & Input Payload | Kết Quả Mong Đợi (Expected Outcome) | Rủi Ro Phòng Vệ | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **TS-01** | 🟢 Positive | Khách truy cập URL xe gốc không tham số | `GET /xe/tucson-2026` | 1. Trả về `200 OK`, render đầy đủ Studio Stage, Bảng giá, Swatches màu.<br>2. Tự động active phiên bản có giá thấp nhất (`minPrice`) và màu mặc định.<br>3. Thẻ `<link rel="canonical" href="https://domain/xe/tucson-2026">`. | Baseline | ⏸️ QUEUED |
| **TS-02** | 🟢 Positive | Khách/Saler mở link chia sẻ Deep Link 2 chiều | `GET /xe/tucson-2026?phien-ban=1-6-turbo-htrac-cao-cap&mau=xanh-reu` | 1. Màn hình khởi tạo ngay lập tức bản "1.6 Turbo" và màu "Xanh Rêu".<br>2. Ảnh góc lớn hiển thị đúng ảnh xe màu xanh rêu.<br>3. Thẻ canonical vẫn cố định `/xe/tucson-2026` (không dính query). | R16 | ⏸️ QUEUED |
| **TS-03** | 🔴 Boundary | Truy cập với Query Parameters không hợp lệ / Rác | `GET /xe/tucson-2026?phien-ban=fake-version&mau=fake-color-999` | 1. Ứng dụng tự động fallback an toàn về phiên bản thấp nhất và màu mặc định.<br>2. Không có lỗi runtime crash màn hình trắng (No unhandled exceptions). | R14 | ⏸️ QUEUED |
| **TS-04** | 🟢 Positive | Tương tác bấm chọn Color Swatches đổi màu xe | Click vào chấm tròn "Đỏ Mận" (`mau=do-man`) | 1. Ảnh xe chuyển mượt mà (< 100ms fade), CLS = 0.<br>2. URL đổi thành `&mau=do-man` bằng `replaceState` (không reload trang, giữ nguyên vị trí cuộn).<br>3. Chấm màu đỏ được khoanh tròn active ring. | R13 | ⏸️ QUEUED |
| **TS-05** | 🟢 Positive | Tương tác bấm chọn Phiên Bản xe khác | Click chọn bản "1.6 Turbo HTRAC Cao Cấp" | 1. Bảng giá, số tiền trả trước, bảng thông số kỹ thuật tự động đổi theo bản mới.<br>2. Danh sách chấm màu tự động lọc lại đúng những màu của bản mới.<br>3. URL đổi thành `?phien-ban=1-6-turbo-htrac-cao-cap&mau=...`. | Baseline | ⏸️ QUEUED |
| **TS-06** | 🟢 Saler Tool | Bấm nút "Sao chép liên kết cấu hình xe" | Khách/Saler click "Copy Link Cấu Hình" | 1. URL đầy đủ kèm phiên bản và màu hiện tại được copy vào clipboard.<br>2. Hiển thị Toast thông báo thành công: *"Đã sao chép liên kết cấu hình xe!"*. | Saler UX | ⏸️ QUEUED |
| **TS-07** | 🟢 Saler Tool | Bấm nút "Chat Zalo Báo Giá Nhanh" | Click nút Chat Zalo | 1. Trình duyệt mở đường dẫn `https://zalo.me/[sdt]?text=[encodedMessage]`.<br>2. Tin nhắn soạn sẵn đúng tên xe, phiên bản và màu đang xem bằng tiếng Việt có dấu hoàn chỉnh. | R4 | ⏸️ QUEUED |
| **TS-08** | 🟢 Positive | Xem thư viện ảnh Showroom & Zoom Lightbox | Click vào ảnh ngoại thất/nội thất trong Gallery | 1. Modal Lightbox mở toàn màn hình, nền mờ tối sang trọng.<br>2. Phím `ArrowRight`/`ArrowLeft` chuyển ảnh kế tiếp/trước đó.<br>3. Phím `Esc` hoặc nút Đóng đóng modal, khôi phục cuộn trang. | UI Spec | ⏸️ QUEUED |
| **TS-09** | 🟢 Funnel | Bấm nút "Tính Giá Lăn Bánh Xe Này" | Click CTA "Dự Toán Lăn Bánh Xe Này" | 1. Chuyển hướng sang `/gia-lan-banh?xe=tucson-2026&phien-ban=1-6-turbo-htrac-cao-cap`.<br>2. Dropdown dòng xe và phiên bản tại trang dự toán được chọn sẵn. | Funnel | ⏸️ QUEUED |
| **TS-10** | 🛡️ Security | Truy cập dòng xe chưa xuất bản (`status = 'draft'`) | `GET /xe/santa-fe-2027-draft` | 1. API và Server trả về chính xác `404 Not Found`.<br>2. Giao diện hiển thị trang 404 thân thiện gợi ý xe khác và Hotline Saler. | R5 | ⏸️ QUEUED |

---

## 3. Kiểm Thử Trạng Thái Toàn Vẹn (State Exhaustiveness Verification)

Đảm bảo 100% các trạng thái và điều kiện chuyển dịch của thực thể được kiểm thử:

| Thực Thể / Trạng Thái | Kịch Bản Chuyển Dịch Hợp Lệ | Kịch Bản Bị Chặn (Guardrail Assertions) | Trạng Thái Kiểm Thử |
| :--- | :--- | :--- | :---: |
| **Car Publishing** | `published` ➡️ Render 200 OK | Chặn xem xe `draft` hoặc `archived` trên Storefront ➡️ Trả về 404 | ⏸️ QUEUED |
| **Color Selection** | Chọn màu có trong phiên bản ➡️ Render ảnh màu | Chọn màu không có trong bản ➡️ Tự động reset về `isDefault` của bản đó | ⏸️ QUEUED |
| **Version Selection** | Đổi phiên bản ➡️ Lọc lại swatches màu | Chọn phiên bản không có màu ➡️ Fallback về ảnh đại diện chính của xe | ⏸️ QUEUED |
| **Browser History** | Bấm Back/Forward ➡️ Bắt sự kiện `popstate` khôi phục màu và bản cũ | Không làm treo trạng thái cuộn chuột, không phát sinh reload trang | ⏸️ QUEUED |

---

## 4. Kiểm Thử Bảo Mật Đối Kháng & Kịch Bản Cực Hạn (Adversarial Security)

* **R4 (XSS & Special Characters in Zalo Message):**
  * Thử nghiệm tên xe chứa dấu ngoặc kép, nháy đơn, ký tự `&`, `?`: Xác nhận hàm `generateZaloDeepLink()` encode an toàn, không làm đứt đoạn chuỗi query của Zalo.
* **R13 (Race Condition & Color Spamming):**
  * Kịch bản Stress Test: Sử dụng script mô phỏng click 10 lần liên tục vào các chấm màu khác nhau trong 500ms ➡️ Xác nhận ảnh hiển thị cuối cùng khớp 100% với `selectedColorId` và không bị nhấp nháy nền trắng nhờ cơ chế preloading.
* **R16 (Duplicate Content Verification):**
  * Quét DOM HTML của trang khi mở bằng 5 loại query khác nhau (`?phien-ban=...`, `?mau=...`, `?utm_source=...`, `?gclid=...`) ➡️ Thẻ `<link rel="canonical">` luôn luôn xuất ra giá trị cố định: `https://[domain]/xe/[carSlug]`.

---

## 5. Lệnh Thực Thi Kịch Bản Máy Chứng Thực (CLI Verification Script)

Tại Giai đoạn 4, `fullstack-dev-executor` sẽ chạy kịch bản kiểm thử tự động toàn diện bằng lệnh:

```bash
# 1. Kiểm tra 100% Type-safety toàn bộ Monorepo
pnpm check-types

# 2. Chạy kịch bản kiểm chứng tự động cho Phase 4.4
pnpm --filter @cardealer/core test
```
* **Tiêu chuẩn hoàn thành (DoD):** Terminal trả về mã trạng thái thành công (`exit 0`), không có cảnh báo TypeScript error nào.
