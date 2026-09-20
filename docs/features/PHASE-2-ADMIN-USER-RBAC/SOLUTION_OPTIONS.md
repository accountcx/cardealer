# 🏗️ Phân Tích Giải Pháp Kỹ Thuật (Sub-Gate 2.1: Solution Options)
## PHASE 2 - ADMIN USER & RBAC MANAGEMENT

> **Role:** `system-analyst-architect`  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`TODO.md`](./TODO.md), [`docs/06-PHASED-IMPLEMENTATION-ROADMAP.md`](../../06-PHASED-IMPLEMENTATION-ROADMAP.md)  
> **Trạng thái:** 🟡 CHỜ REVIEW & CHỐT PHƯƠNG ÁN (Sub-Gate 2.1 Decision)

---

## 1. Bối Cảnh Kỹ Thuật & Bài Toán Cần Giải

Sau khi hoàn thành Phase 1 (Data Layer & Catalog với tài khoản Admin đơn lẻ), Phase 2 cần xây dựng hệ thống quản trị người dùng nội bộ cho Showroom Hyundai Vinh, bảo đảm 3 trụ cột kỹ thuật:
1. **Kiến trúc Phân quyền (RBAC Architecture):** Cơ chế định nghĩa và kiểm tra quyền hạn của 4 vai trò (`admin`, `manager`, `editor`, `sales`) trên cả Backend API và Frontend Admin UI.
2. **Kiến trúc Kiểm soát Phiên & Thu hồi Token (Session Lifecycle & Instant Revocation):** Giải pháp vô hiệu hóa phiên làm việc ngay lập tức khi nhân viên bị Admin khóa tài khoản hoặc khi nhân viên đổi mật khẩu.
3. **Kiến trúc Lưu trữ Nhật ký Kiểm toán (Security Audit Trail):** Phương án ghi nhận và hiển thị lịch sử các thao tác nhạy cảm (thêm/sửa/xóa xe, đổi giá, phân quyền, đăng nhập thất bại) để truy vết trách nhiệm.

---

## 2. Phân Tích Chi Tiết 3 Khu Vực Quyết Định

### 🛡️ Quyết Định 1: Mô Hình Phân Quyền (RBAC Architecture)

| Tiêu Chí | Option A: Hybrid Matrix-based RBAC (Khuyên Dùng ⭐) | Option B: Dynamic DB-backed RBAC (4 Bảng DB) | Option C: Simple Hardcoded String Role Check |
| :--- | :--- | :--- | :--- |
| **Bản chất** | Roles lưu ở bảng `users` (`role enum`). Quyền hạn (Permissions) được định nghĩa tập trung dạng Ma trận TypeScript trong `@cardealer/types`. | Quản lý động hoàn toàn bằng 4 bảng DB: `roles`, `permissions`, `role_permissions`, `user_roles`. | Kiểm tra cứng chuỗi `user.role === 'admin'` rải rác trực tiếp trong từng route controller. |
| **Type-Safety & Autocomplete** | **Hoàn hảo 100%:** Biên dịch kiểm tra lỗi tĩnh, IDE tự gợi ý `requirePermission('cars:edit')` hoặc `hasPermission(user, 'users:manage')`. | Kém: Quyền hạn là chuỗi string tải từ DB lúc runtime, dễ gõ sai chính tả, không bắt được lỗi lúc build. | Kém: Dễ nhầm lẫn giữa các role khi quy mô tính năng phình to. |
| **Hiệu năng Truy vấn** | **Siêu nhanh (0 DB Join):** Middleware chỉ đọc `payload.role` từ JWT/User Row và tra cứu nhanh trên Ma trận bộ nhớ (Hash Map O(1)). | **Chậm (Nhiều JOINs):** Mỗi request kiểm tra quyền phải JOIN qua 3-4 bảng hoặc phải dựng lớp Cache Redis phức tạp. | Nhanh, nhưng mã nguồn bị phân mảnh. |
| **Độ phức tạp & Bảo trì** | Cực kỳ gọn gàng, phù hợp hoàn hảo với quy mô showroom ô tô (10–50 nhân sự, 4 vai trò rõ ràng, ít khi đổi cấu trúc quyền). | Rất cồng kềnh (Over-engineering), tốn nhiều công sức dựng màn hình quản lý ma trận quyền hạn động cho DBA. | Dễ drift logic, khi thêm role mới phải lội qua hàng chục file sửa câu lệnh `if (role === ...)`. |

👉 **Khuyến nghị của Kiến trúc sư:** **Option A (Hybrid Matrix-based RBAC)** là phương án tối ưu nhất. Nó đảm bảo tính minh bạch, 100% type-safe trong monorepo, không gây suy giảm hiệu năng cơ sở dữ liệu và cực kỳ dễ kiểm toán (code review).

---

### 🔑 Quyết Định 2: Kiểm Soát Phiên & Thu Hồi Token Tức Thì (Session Revocation)

| Tiêu Chí | Option 1: State-Machine Counter `tokenVersion` (Khuyên Dùng ⭐) | Option 2: Distributed Redis Token Blacklist | Option 3: Short-lived Token (5m) Không Thu Hồi |
| :--- | :--- | :--- | :--- |
| **Cơ chế** | Bổ sung `tokenVersion: integer` trong bảng `users`. Khi bị khóa hoặc đổi pass: `UPDATE users SET token_version = token_version + 1`. JWT mang theo `tokenVersion`. | Khi thu hồi, ghi JWT hash vào Redis với thời gian sống TTL = thời gian hết hạn của token. Mỗi request query Redis kiểm tra. | Token hết hạn sau 5 phút. Khi bị khóa, user vẫn thao tác được trong tối đa 5 phút còn lại. |
| **Hạ tầng bổ sung** | **Zero hạ tầng mới:** Dùng trực tiếp PostgreSQL hiện có, không phụ thuộc bên thứ 3. | Phải cài đặt, vận hành và giám sát một cụm Redis riêng biệt. | Zero hạ tầng. |
| **Độ trễ Thu hồi (Revocation Latency)** | **Tức thì (0 giây):** Ngay ở request tiếp theo, API middleware đối chiếu `payload.tokenVersion !== db.tokenVersion` hoặc `status === 'suspended'` ➡️ Chặn ngay lập tức. | Tức thì (0 giây). | Chậm (độ trễ lên tới 5 phút, không đáp ứng tiêu chuẩn an ninh nghiêm ngặt). |
| **Độ tin cậy (Resilience)** | Cực cao: Nếu DB sống thì hệ thống bảo mật sống, không có rủi ro nghẽn network giữa API và Redis. | Nếu Redis gặp sự cố đứt kết nối, toàn bộ API bị treo hoặc fallback bỏ qua kiểm tra token. | Cao nhưng rủi ro rò rỉ bảo mật. |

👉 **Khuyến nghị của Kiến trúc sư:** **Option 1 (State-Machine `tokenVersion`)** là giải pháp thanh lịch, tin cậy tuyệt đối, đã được tích hợp sẵn cột `token_version` trong schema Phase 1 và sẵn sàng kích hoạt triệt để ở Phase 2.

---

### 📜 Quyết Định 3: Lưu Trữ & Truy Vết Nhật Ký An Ninh (Audit Trail)

| Tiêu Chí | Option I: Append-Only PostgreSQL Table `audit_logs` (Khuyên Dùng ⭐) | Option II: File-based Log (Winston/Pino xuất file `.log`) | Option III: Dịch Vụ SaaS Ngoài (Datadog / Logtail) |
| :--- | :--- | :--- | :--- |
| **Cấu trúc dữ liệu** | Bảng quan hệ PostgreSQL: `userId`, `action`, `targetType`, `targetId`, `details (jsonb)`, `ipAddress`, `userAgent`, `createdAt`. | Dòng text log phi cấu trúc hoặc JSON lines lưu trong thư mục `logs/`. | Đẩy log qua HTTPS tới dịch vụ cloud bên thứ ba. |
| **Tích hợp Admin UI** | **Xuất sắc:** Quản trị viên dễ dàng mở trang `/admin/audit-logs`, lọc theo nhân viên, theo ngày hoặc loại hành động trực tiếp từ Database. | Rất khó: Phải dựng parser đọc file log hoặc cài thêm công cụ đọc file trên server. | Phải mở dashboard bên ngoài của nhà cung cấp để xem, nhân viên showroom không truy cập được. |
| **Chi phí & Vận hành** | **0 đồng:** Nằm trong Database PostgreSQL sẵn có. Tạo partition hoặc index trên `created_at` đảm bảo query dưới 10ms. | Miễn phí, nhưng tốn dung lượng đĩa và phải viết script log rotation (`logrotate`). | Tốn phí hàng tháng, phụ thuộc internet quốc tế. |
| **Tính toàn vẹn** | Nguyên tắc Append-only: Chỉ cung cấp hàm `INSERT`, không viết bất kỳ API hay logic nào cho phép `UPDATE` / `DELETE` bảng này. | Dễ bị chỉnh sửa nếu hacker chiếm được quyền truy cập máy chủ filesystem. | Rất cao. |

👉 **Khuyến nghị của Kiến trúc sư:** **Option I (Bảng PostgreSQL `audit_logs` có trường `details: jsonb`)** là giải pháp toàn diện nhất, cho phép hiển thị trực quan lịch sử hành vi ngay trong Admin Portal của Showroom mà không tốn chi phí hạ tầng.

---

## 3. Ma Trận Đánh Giá Tổng Hợp (Decision Scoring Matrix)

| Tiêu Chí Đánh Giá (Trọng số) | Combo Khuyến Nghị ⭐<br/>(Matrix RBAC + `tokenVersion` + DB `audit_logs`) | Combo Doanh Nghiệp Lớn<br/>(Dynamic DB RBAC + Redis + SaaS Logs) |
| :--- | :---: | :---: |
| **Tính Đúng Đắn & An Ninh Bảo Mật (30%)** | 9.8 / 10 | 9.5 / 10 |
| **Hiệu Năng & Tốc Độ Phản Hồi (25%)** | 9.9 / 10 | 8.0 / 10 |
| **Chi Phí Hạ Tầng & Tối Ưu Vận Hành (20%)** | 10.0 / 10 | 6.5 / 10 |
| **Trải Nghiệm Developer & Type-Safety (15%)** | 9.7 / 10 | 7.5 / 10 |
| **Tính Khả Thi Triển Khai Trong Monorepo (10%)** | 9.8 / 10 | 7.0 / 10 |
| **TỔNG ĐIỂM CÓ TRỌNG SỐ** | **9.84 / 10 (Xuất Sắc)** | **7.85 / 10** |

---

## 4. Đề Xuất Chốt Phương Án (Architecture Recommendations)

Kiến trúc sư đề xuất phê duyệt **Combo Khuyến Nghị (Option A + Option 1 + Option I)**:
1. **Phân quyền:** Sử dụng **Hybrid Matrix-based RBAC** với 4 vai trò chuẩn (`admin`, `manager`, `editor`, `sales`) và ma trận Permission Type-Safe trong `@cardealer/types`.
2. **Kiểm soát phiên:** Sử dụng **State-Machine Counter `tokenVersion`** kết hợp kiểm tra trạng thái `status === 'active'` tại JWT Middleware để thực thi Force Logout / Thu hồi phiên tức thì.
3. **Audit Trail:** Sử dụng bảng **Append-only `audit_logs` trong PostgreSQL** với cột `details: jsonb` để ghi nhận toàn bộ biến động dữ liệu nhạy cảm.
