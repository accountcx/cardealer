# 🧪 Kế Hoạch Kiểm Thử Máy Tự Động (Automated Verification Test Plan)
## PHASE 3 - PRICING & LEAD ENGINE (`EPIC-PHASE-3-PRICING-LEAD`)

> **Chuyên gia thực hiện:** `qa-test-engineer`  
> **Trạng thái:** Sẵn sàng thực thi (Ready for Execution in Phase 4)  
> **Mục tiêu:** Đảm bảo 100% các rủi ro R1–R17 được kiểm thử tự động, không phụ thuộc vào thao tác thủ công, xác minh công thức tính tiền chuẩn xác 0 đồng sai số.

---

## 1. Kim Tự Tháp Kiểm Thử (Testing Pyramid Strategy)

```
              ▲
             / \     [E2E / CLI Verification Runner] (8 simulated business flows, exit 0)
            /   \
           /     \   [API Integration Test Suites] (22 test cases: Ingestion, CRM, RBAC)
          /       \
         /         \ [Unit & Core Engine Tests] (38 test cases: Rolling, Installment, Regex)
        ─────────────
```

---

## 2. Chi Tiết Các Test Suites Tự Động

### Suite 1: Core Financial Calculation Engine Tests (Kiểm toán R5, R6, R7)
* **Mục tiêu:** Kiểm tra độ chính xác tuyệt đối của công cụ tính giá lăn bánh và trả góp ngân hàng, không có sai số dấu phẩy động.
* **Vị trí file kiểm thử:** `packages/core/src/pricing/__tests__/pricing-engine.test.ts`
* **Các ca kiểm thử (Test Cases):**
  - `TC-1.1`: Tính giá lăn bánh xe tại TP. Vinh: Phí trước bạ = 10% giá niêm yết, biển số = 1.000.000 VNĐ, đăng kiểm = 140.000 VNĐ, đường bộ = 1.560.000 VNĐ, bảo hiểm TNDS = 480.000 VNĐ. Tổng khớp 100%.
  - `TC-1.2`: Tính giá lăn bánh tại Huyện khác (Nghệ An): Biển số = 200.000 VNĐ (chênh lệch đúng 800.000 VNĐ so với TP. Vinh).
  - `TC-1.3`: Kết quả tính toán trên 50 dòng giá khác nhau (300tr đến 3 tỷ VNĐ) luôn là số nguyên VNĐ (`Number.isInteger(result.total) === true`).
  - `TC-1.4`: Ước tính trả góp ngân hàng: Gốc hàng tháng = Số tiền vay / Số tháng; Lãi tháng đầu = Số tiền vay * (Lãi suất năm / 12).
  - `TC-1.5`: Biên độ tham số âm hoặc tràn biên (`price <= 0`, `downPayment < 10%`, `loanTerm > 96 tháng`) tự động ném `RangeError` hoặc trả về fallback an toàn mà không làm crash ứng dụng.

---

### Suite 2: Client Phone Validation & Zero-Cost Regex Tests (Kiểm toán R2, R15)
* **Mục tiêu:** Xác thực số điện thoại 10 số di động Việt Nam chuẩn xác bằng mã nguồn thuần (zero-cost), bao quát mọi nhà mạng và chặn dải số rác.
* **Vị trí file kiểm thử:** `packages/types/src/__tests__/lead-validation.test.ts`
* **Các ca kiểm thử:**
  - `TC-2.1`: Hợp lệ với các đầu số Viettel: `098xxxxxxx`, `097xxxxxxx`, `086xxxxxxx`, `032xxxxxxx` - `039xxxxxxx`.
  - `TC-2.2`: Hợp lệ với các đầu số VinaPhone: `091xxxxxxx`, `094xxxxxxx`, `088xxxxxxx`, `083xxxxxxx` - `085xxxxxxx`.
  - `TC-2.3`: Hợp lệ với các đầu số MobiFone: `090xxxxxxx`, `093xxxxxxx`, `089xxxxxxx`, `070xxxxxxx` - `079xxxxxxx`.
  - `TC-2.4`: Hợp lệ với các đầu số Vietnamobile (`092`, `056`, `058`) và Wintel/FPT (`055`, `0775`).
  - `TC-2.5`: Từ chối số điện thoại ít hơn hoặc nhiều hơn 10 chữ số (ví dụ: `091234567` hoặc `09123456789`).
  - `TC-2.6`: Từ chối chuỗi có chứa chữ cái hoặc ký tự đặc biệt (`0912abc345`, `+84912345678`).
  - `TC-2.7`: Từ chối các dải số rác kinh điển nằm trong blacklist: `0900000000`, `0912345678`, `0999999999`, `0988888888`.

---

### Suite 3: Public Lead Ingestion API & Anti-Spam (Kiểm toán R1, R3, R8)
* **Mục tiêu:** Kiểm tra endpoint tiếp nhận Lead công khai `POST /api/leads` có cơ chế bảo vệ trước bot, trùng lặp và XSS.
* **Vị trí file kiểm thử:** `apps/api/src/__tests__/leads-ingestion.test.ts`
* **Các ca kiểm thử:**
  - `TC-3.1`: Gửi lead hợp lệ đầy đủ Họ Tên, SĐT, Dòng xe, Tỉnh thành ➡️ Phản hồi `201 CREATED` và lưu thành công vào cơ sở dữ liệu với trạng thái `new`.
  - `TC-3.2`: Honeypot Trap: Gửi request có điền trường ẩn `website_url` ➡️ Server phản hồi `200 OK` giả lập nhưng KHÔNG lưu vào DB.
  - `TC-3.3`: Rate Limiter: Gửi 6 request liên tiếp trong 10 giây từ cùng một IP ➡️ Request thứ 6 nhận `429 TOO_MANY_REQUESTS`.
  - `TC-3.4`: Anti-Duplicate Idempotency: Gửi 2 request có cùng số điện thoại và cùng phiên bản xe trong vòng 5 phút ➡️ Request 2 trả về thành công kèm cờ `isDuplicate: true`, không sinh thêm bản ghi rác trong DB.
  - `TC-3.5`: Anti-XSS Sanitization: Gửi payload `<script>alert('xss')</script>` trong `fullName` và `notes` ➡️ Dữ liệu lưu trong DB được làm sạch, không chứa thẻ script nguy hiểm.

---

### Suite 4: Admin CRM Leads Management & RBAC Guard (Kiểm toán R4, R12, R13)
* **Mục tiêu:** Đảm bảo chỉ nhân viên có thẩm quyền mới xem và xử lý được danh sách khách hàng, phân trang và cập nhật trạng thái hoạt động chính xác.
* **Vị trí file kiểm thử:** `apps/api/src/__tests__/admin-leads.test.ts`
* **Các ca kiểm thử:**
  - `TC-4.1`: Truy cập `GET /api/admin/leads` không có token ➡️ Phản hồi `401 UNAUTHORIZED`.
  - `TC-4.2`: Truy cập bằng tài khoản role `editor` ➡️ Phản hồi `403 FORBIDDEN` (`INSUFFICIENT_PERMISSIONS`).
  - `TC-4.3`: Truy cập bằng tài khoản role `sales` hoặc `admin` ➡️ Phản hồi `200 OK` danh sách leads.
  - `TC-4.4`: Phân trang dữ liệu: Gọi `GET /api/admin/leads?page=1&limit=10` ➡️ Trả về đúng 10 bản ghi kèm metadata phân trang (`total`, `page`, `totalPages`).
  - `TC-4.5`: Lọc theo trạng thái: `GET /api/admin/leads?status=new` ➡️ Chỉ trả về các lead có trạng thái `new`.
  - `TC-4.6`: Cập nhật trạng thái `PATCH /api/admin/leads/:id/status` từ `new` sang `contacted` ➡️ Cập nhật thành công, `updatedAt` thay đổi và ghi nhận lịch sử xử lý.

---

### Suite 5: Storefront UI State Transition & F5 Persistence (Kiểm toán R10, R11, R16)
* **Mục tiêu:** Kiểm tra hành vi chuyển đổi 3 trạng thái của `SmartCalculator` và khả năng lưu trữ khôi phục sau khi F5.
* **Vị trí file kiểm thử:** `apps/storefront/src/__tests__/smart-calculator.test.tsx`
* **Các ca kiểm thử:**
  - `TC-5.1`: Khởi tạo trang: State mặc định là `input`, progress bar đạt 50%, nút CTA hiển thị "TÍNH GIÁ LĂN BÁNH".
  - `TC-5.2`: Bấm CTA hợp lệ ➡️ Chuyển sang State `gate`, bảng chi phí có class `blur-sm select-none`, hiển thị khung cảnh báo ưu đãi tiền mặt và form nhập SĐT.
  - `TC-5.3`: Bấm Submit Form với số điện thoại 9 số ➡️ Hiển thị thông báo lỗi validation trực tiếp, không chuyển state.
  - `TC-5.4`: Gửi Form thành công ➡️ Chuyển sang State `success`, bảng chi phí chuyển sang `blur-none`, hiển thị 2 nút gọi Hotline và Chat Zalo.
  - `TC-5.5`: F5 Refresh: Khi ở State `success`, reload trình duyệt ➡️ Component tự động khôi phục dữ liệu từ `sessionStorage`, người dùng không phải nhập lại từ đầu.

---

## 3. Kịch Bản CLI Verification Runner Toàn Diện (End-to-End CLI Script)

Để phục vụ Giai đoạn 4 nghiệm thu tự động bằng một câu lệnh duy nhất, script độc lập `scripts/verify-phase-3-pricing-lead.ts` sẽ được thiết lập:

### Lệnh thực thi nghiệm thu:
```bash
pnpm --filter @cardealer/api exec tsx scripts/verify-phase-3-pricing-lead.ts
```

### Các bước tự động thực hiện trong script:
1. **Kiểm tra Schema & Database Migration:**
   - Kết nối DB, xác minh bảng `leads` tồn tại với các trường: `id`, `full_name`, `phone`, `car_version_id`, `province`, `estimated_total`, `status`, `notes`, `metadata`, `created_at`, `updated_at`.
   - Kiểm tra các indexes: `idx_leads_phone_created` và `idx_leads_status_created`.
2. **Chạy Mô Phỏng 8 Kịch Bản Nghiệp Vụ (Simulated Flows):**
   - **Flow 1:** Chạy bộ tính toán tài chính (Rolling Cost & Installment) với 10 xe thực tế, sai số = 0đ.
   - **Flow 2:** Kiểm tra bộ lọc Regex SĐT Việt Nam với 30 trường hợp (hợp lệ, rác, blacklist, sai độ dài).
   - **Flow 3:** Gửi lead công khai qua `POST /api/leads` thành công (201 Created).
   - **Flow 4:** Kích hoạt bẫy Honeypot bot và kiểm tra cơ chế âm thầm loại bỏ rác.
   - **Flow 5:** Thử nghiệm chống trùng lặp (Anti-Duplicate Idempotency) trong 10 phút.
   - **Flow 6:** Chặn truy cập trái phép vào CRM bằng role `editor` (403 Forbidden).
   - **Flow 7:** Nhân viên Sales lấy danh sách leads có phân trang và bộ lọc trạng thái (200 OK).
   - **Flow 8:** Cập nhật trạng thái lead từ `new` sang `contacted` và `converted` (200 OK).
3. **Đầu ra mong muốn:**
   - In ra kết quả 8/8 bài test xanh (`PASS [✓]`).
   - Kết thúc với mã thoát `process.exit(0)`.

---

## 4. Bảng Tiêu Chuẩn Nghiệm Thu Gate 4 (Gate 4 Verification Checklist)

| Tiêu chuẩn | Điều kiện đạt | Phương pháp kiểm tra |
| :--- | :--- | :--- |
| **Type-Safety** | `0 errors` trên toàn bộ 11 packages | `pnpm check-types` |
| **CLI Verification** | 100% các ca kiểm thử đạt `PASS` | `pnpm verify:pricing-lead` (`exit 0`) |
| **Zero-Cost Integrity** | Không phát sinh bất kỳ chi phí SMS / OTP bên thứ 3 nào | Kiểm toán code & dependency tree |
| **Security Audit** | R1–R17 được kiểm soát chặt chẽ | Đối chiếu `RISK_AUDIT.md` |
| **Conversion UX** | Đủ 3 trạng thái: `input` ➡️ `gate (blur-sm)` ➡️ `success (unblur)` | Trải nghiệm trực quan trên Storefront |
| **Admin CRM** | Quản lý, đổi trạng thái tại chỗ và xem chi tiết lead trong drawer | Trải nghiệm trực quan trên `/admin/leads` |
