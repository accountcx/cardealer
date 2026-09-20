# 📋 Báo Cáo Đánh Giá Chất Lượng & An Ninh Độc Lập (CODE_REVIEW.md)
## PHASE 3 - PRICING & LEAD ENGINE (`EPIC-PHASE-3-PRICING-LEAD`)

> **Reviewer Role:** `independent-code-reviewer` (Adversarial / Fresh Eyes Mindset)  
> **Phiên bản SOP:** 2.2.0 (Dynamic Intelligence & Layered Audit)  
> **Trạng thái Gate 5:** 🟢 **PASS (ĐỦ ĐIỀU KIỆN MERGE & BÀN GIAO)**  
> **Target Scope:** 20 files thay đổi qua 4 Slices (US-01 ➡️ US-04)

---

## 1. Kết Quả Rà Soát Đa Tầng (Layered Review Summary)

### 🗄️ Tầng 1: Data & DB Migration Audit
* **Tệp Migration:** `packages/database/drizzle/0002_gray_marvel_apes.sql`
* **Đánh giá An toàn CSDL:**
  - 100% Additive: Chỉ tạo enum mới `lead_status_enum` và bảng mới `leads`. Không có bất kỳ lệnh phá hủy dữ liệu nào (`DROP`, `ALTER`, `RENAME`).
  - Khóa ngoại `car_version_id` tham chiếu `car_versions(id)` có chính sách `ON DELETE SET NULL`, đảm bảo tính toàn vẹn dữ liệu nếu dòng xe bị lưu trữ/xóa.
  - Đã đánh 2 Composite Indexes: `idx_leads_phone_created` (tối ưu chống spam/deduplication trong 10 phút) và `idx_leads_status_created` (tối ưu bộ lọc CRM Datatable).
* **Kết luận Tầng 1:** 🟢 **PASSED (Zero Table Lock / Non-Destructive)**.

---

### ⚙️ Tầng 2: Core Domain Logic, Arithmetic & Concurrency
* **Lõi Tính Giá Lăn Bánh & Trả Góp:**
  - Áp dụng Integer Arithmetic (`Math.round`) triệt tiêu hoàn toàn sai số dấu phẩy động (R5).
  - Có boundary guard ném `RangeError` khi giá xe <= 0, tỷ lệ vay vượt 100% hoặc kỳ hạn vay <= 0 (R6).
  - Tra cứu tập trung biểu phí tại `packages/core/src/pricing/config.ts` (R7), tự động chuyển đổi giữa TP. Vinh (biển số 1M) và Huyện khác (200k).
* **Chống Gửi Đúp & Race Condition (R3):**
  - Khung thời gian Deduplication 10 phút trên cùng số điện thoại và phiên bản xe giúp ngăn chặn nhân viên Sales bị trùng thông tin tư vấn.
* **Kết luận Tầng 2:** 🟢 **PASSED (0đ sai số tiền tệ, xử lý biên an toàn)**.

---

### 🛡️ Tầng 3: Security, RBAC & Logging Sanitization
* **Zero-Cost Phone Validation (R2, R15):**
  - Regex `/^(03|05|07|08|09)\d{8}$/` bao phủ 100% 5 nhà mạng lớn (Viettel, VinaPhone, MobiFone, Vietnamobile, Wintel, FPT).
  - Blacklist dải số ảo kinh điển (`0900000000`, `0912345678`,...) lọc sạch lead rác trước khi lưu vào DB.
* **Chống Spam Bot (R1):**
  - Bẫy Honeypot `websiteUrl` ẩn: Âm thầm bỏ qua bot cào dữ liệu (`silent discard`), không lưu rác vào DB.
  - Rate Limiter in-memory: 5 requests / 60 giây / IP trả về HTTP 429.
* **Kiểm Soát Quyền Truy Cập CRM (R4 - BOLA):**
  - Tuyến `/api/admin/leads/*` được bảo vệ bằng JWT Bearer Auth + ma trận quyền RBAC (`checkPermission`).
  - Quyền `leads:read`: Dành cho `admin`, `manager`, `sales`, `editor`.
  - Quyền `leads:write`: Chỉ dành cho `admin`, `manager`, `sales`. Role `editor` bị từ chối `403 FORBIDDEN` khi cố đổi trạng thái lead.
* **An toàn Logging (CWE-117 / CWE-200):**
  - Lọc sạch ký tự `\r\n` trước khi in log IP/Endpoint trong `leads.ts` và `server.ts`. Không in thông tin nhạy cảm.
* **Kết luận Tầng 3:** 🟢 **PASSED (Chuẩn an toàn OWASP & RBAC Guard)**.

---

### 📐 Tầng 4: SemVer, Contracts & UX Fidelity
* **Độ Chuẩn Xác Giao Diện (UI Spec Alignment):**
  - Storefront `SmartCalculator`: 3 trạng thái `input` ➡️ `gate [blur-sm]` ➡️ `success [unblur]` chuyển đổi mượt mà.
  - Nút CTA Mobile: Ghim cố định `sticky bottom-4 md:static z-40` tối ưu tỷ lệ chuyển đổi.
  - Phục hồi F5: Lưu trữ và khôi phục snapshot qua `sessionStorage` (R11).
  - Sub-tab Trả Góp: Áp dụng cùng cơ chế Soft-Gate mờ chi tiết gốc lãi và mở khóa kèm thông báo gọi lại ngay.
  - Admin CRM Datatable: Tìm kiếm SĐT/Tên, lọc trạng thái, inline status update và drawer chi tiết.
* **Kiểm Thử Tự Động (Machine Verification):**
  - `pnpm check-types`: 8/8 packages passed (0 errors).
  - `pnpm verify:phase-3`: 38/38 tests passed (`exit 0`).
* **Kết luận Tầng 4:** 🟢 **PASSED (100% Spec Fidelity)**.

---

## 2. Danh Sách Findings & Đánh Giá Khuyết Tật

| ID | Mức độ | Trạng thái | Vị trí (File:Line) | Nguồn Chuẩn | Bản chất Kỹ thuật & Bằng chứng | Đánh giá |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **F-01** | 🟢 Nit | RESOLVED | `SmartCalculator.tsx` | UX Best Practice | Thêm `inputMode="numeric"` trên ô SĐT | Đã tối ưu bật bàn phím số trên điện thoại |
| **F-02** | 🟢 Nit | RESOLVED | `InstallmentEstimatorTab.tsx` | UX Consistency | Đồng bộ Soft-Gate mờ bảng gốc lãi trả góp | Đã hoàn thiện theo phản hồi của Developer |

*Không phát hiện bất kỳ khuyết tật nghiêm trọng (🔴 Major/Blocker) nào.*

---

## 3. Bảng Kiểm Tra Chốt Chặn Toàn Vẹn (Integrity Checklist)

- [x] **Spec Fidelity:** Khớp 1:1 với `FLOW.md`, `SCHEMA.md`, `API_SPEC.md`, `UI_SPEC.md`.
- [x] **Zero-Cost Compliance:** Không phát sinh bất kỳ chi phí SMS OTP / viễn thông bên thứ 3 nào.
- [x] **Untrusted Logging (CWE-117):** Khử `\r\n` trên mọi log console.
- [x] **DB Migration Safety:** Non-destructive migration, không gây khóa bảng.
- [x] **Fail-Closed Defaults:** Lỗi dữ liệu/mạng trả về mã lỗi HTTP an toàn, không lộ stack trace.
- [x] **Type-Safety:** 100% Strict Type Checking toàn Monorepo (`0 errors`).
- [x] **Machine Verification:** CLI Verification Script chạy đạt 38/38 ca kiểm thử (`exit 0`).

---

### 🏁 KẾT LUẬN CUỐI CÙNG: 🟢 ĐỦ TIÊU CHUẨN THÔNG QUAN GATE 5
