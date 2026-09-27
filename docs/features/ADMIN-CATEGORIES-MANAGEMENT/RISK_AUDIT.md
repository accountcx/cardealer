# 🛡️ Risk Audit & Threat Analysis Report: Quản Trị Chuyên Mục Bài Viết (Admin Categories Management)

## 1. Bảng Ma Trận Rủi Ro Tổng Quan (R1 - R17)

| Mã | Nhóm Rủi Ro | Phân Loại & CWE / OWASP | Cấp Độ | Trạng Thái | Vùng Ảnh Hưởng (Target Components) |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **R1** | **N+1 Queries & DB Locking** | CWE-400 (Resource Exhaustion) | 🟠 MEDIUM | Mitigated | `apps/api/src/routes/posts.ts` (API List Endpoint) |
| **R2** | **Memory Leak & Unbounded Collections** | CWE-770 (Allocation without Limits) | 🟡 LOW | Mitigated | `apps/api/src/routes/posts.ts` (Category query) |
| **R3** | **Payload Size & IO Bottleneck** | CWE-400 | 🟡 LOW | Mitigated | Zod Schemas (`packages/types`) |
| **R4** | **Injection & Sanitization (XSS / SQLi)** | OWASP A03 / CWE-79, CWE-89 | 🔴 HIGH | Mitigated | Drizzle ORM Parameterized Query & Regex Slug |
| **R5** | **Broken Object-Level Auth & RBAC** | OWASP A01 / CWE-862, CWE-639 | 🔴 HIGH | Mitigated | Middleware `hasPermission(role, 'posts:write')` |
| **R6** | **Data Leak & Secret Exposure** | OWASP A01/A02 / CWE-200 | 🟡 LOW | Mitigated | Safe Entity Serializer (loại bỏ internal details) |
| **R7** | **Mass Assignment & DTO Pollution** | OWASP A08 / CWE-915 | 🟠 MEDIUM | Mitigated | Zod Schema `.strict()` hoặc pick explicit fields |
| **R8** | **SSRF & Token Leakage** | OWASP A10 / CWE-918 | 🟡 LOW | Mitigated | Không có tính năng fetch URL ngoài trong Category |
| **R9** | **Unsafe Archive & Zip Bomb** | OWASP A05 / CWE-409 | 🟡 LOW | N/A | Không có file upload trong module Category |
| **R10**| **GenAI / Prompt Injection** | OWASP LLM01 | 🟡 LOW | N/A | Không tích hợp LLM trong module này |
| **R11**| **Hardcode & Magic Values** | Maintainability Risk | 🟡 LOW | Mitigated | Dùng Hằng số / Enum trong `@cardealer/types` |
| **R12**| **Convention & Architectural Drift** | Monorepo Quality | 🟡 LOW | Mitigated | Tuân thủ 100% Named Export, `@cardealer/ui` |
| **R13**| **Race Condition & Concurrency Idempotency**| CWE-362 (Concurrent Collision) | 🔴 HIGH | Mitigated | DB Unique Constraint `categories.slug` + Catch 23505 |
| **R14**| **Unhandled Exceptions & Silent Failures** | Error Handling / CWE-209 | 🔴 HIGH | Mitigated | Try/Catch bọc tường minh, bắt lỗi Foreign Key |
| **R15**| **Transactional Atomicity & Side-Effects**| Data Integrity | 🟠 MEDIUM | Mitigated | Restrict Delete Guard trước khi xóa record |
| **R16**| **Breaking API Contract & Slug Encoding** | Compatibility Risk | 🟠 MEDIUM | Mitigated | `slugifyVN` xử lý triệt để ký tự đặc biệt tiếng Việt |
| **R17**| **Supply Chain & Outdated Dependencies** | OWASP A06 | 🟡 LOW | Clean | Không thêm dependencies bên ngoài |

---

## 2. Chi Tiết Các Mục Rủi Ro Trọng Yếu & Phương Án Phòng Vệ

### 🔴 [R4] Injection & Sanitization (XSS & Slug Exploits)
* **Kịch bản Nguy hại:** Admin nhập tên hoặc mô tả chứa mã HTML/JavaScript độc hại (`<script>alert(1)</script>`) hoặc slug chứa ký tự path traversal (`../../`).
* **Bản chất Kỹ thuật:** Thiếu cơ chế validate chuỗi đầu vào hoặc render HTML không an toàn.
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  1. Trường `slug` bắt buộc validate bằng Regular Expression: `^[a-z0-9]+(?:-[a-z0-9]+)*$` (chỉ cho phép chữ thường, số, gạch ngang đơn).
  2. Drizzle ORM tự động parameterize 100% câu lệnh SQL, chống SQL Injection tuyệt đối.
  3. React tự động escape HTML khi render text; không dùng `dangerouslySetInnerHTML` cho tên chuyên mục.
* **Chỉ Dẫn Kiểm Thử (QA Input):** Gửi payload chứa HTML tags và ký tự lạ trong `slug` ➡️ Bắt buộc nhận `400 INVALID_INPUT`.

---

### 🔴 [R5] Broken Object-Level Auth & RBAC (Quyền Thao Tác)
* **Kịch bản Nguy hại:** Tài khoản nhân viên có vai trò `saler` (chỉ có quyền xem bài viết) gửi request `POST /api/admin/categories` hoặc `DELETE` để thay đổi chuyên mục.
* **Bản chất Kỹ thuật:** Bỏ quên middleware kiểm tra quyền hạn chi tiết trên từng endpoint.
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  - Kiểm tra `hasPermission(userRole, 'posts:write')` ở đầu mỗi handler `POST`, `PUT`, `DELETE`.
  - Nếu không có quyền: Trả về ngay lập tức `403 FORBIDDEN` kèm message: `"Bạn không có quyền quản lý chuyên mục bài viết"`.
* **Chỉ Dẫn Kiểm Thử (QA Input):** Gửi request với token của user có role `saler` ➡️ Phải nhận `403 FORBIDDEN`.

---

### 🔴 [R13] Race Condition & Concurrency Idempotency (Trùng Slug Đồng Thời)
* **Kịch bản Nguy hại:** 2 Admin cùng lúc tạo 2 chuyên mục khác nhau nhưng đặt cùng slug `"danh-gia-xe"`, cả 2 request đến API trong cùng một mili giây.
* **Bản chất Kỹ thuật:** Kiểm tra `SELECT` trước `INSERT` có khoảng hở thời gian (Check-then-act race condition).
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  - Database PostgreSQL đã có ràng buộc `uniqueIndex` trên `categories.slug`.
  - Trong backend API: Bọc câu lệnh insert trong try/catch; nếu nhận mã lỗi PostgreSQL `23505` (unique_violation), API chuyển đổi thành response `409 Conflict` thân thiện: `"Slug này đã tồn tại trên hệ thống, vui lòng chọn một slug khác"`.
* **Chỉ Dẫn Kiểm Thử (QA Input):** Chạy 2 request POST song song với cùng một slug ➡️ 1 request nhận `201 Created`, 1 request nhận `409 Conflict`.

---

### 🔴 [R14 & R15] Unhandled Exceptions & Restrict Delete Guard
* **Kịch bản Nguy hại:** Admin bấm xóa một chuyên mục đang có 10 bài viết liên kết. Nếu API không kiểm tra mà chạy thẳng lệnh `DELETE FROM categories`, PostgreSQL sẽ ném lỗi Foreign Key Violation (`23503`), làm crash request hoặc trả về `500 Internal Server Error` không rõ lý do.
* **Bản chất Kỹ thuật:** Xử lý lỗi phụ thuộc vào exception của database thay vì kiểm tra nghiệp vụ chủ động (Defense-in-depth).
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  1. Kiểm tra chủ động: `SELECT count(*) FROM posts WHERE category_id = :id`.
  2. Nếu `count > 0`: Trả về `400 BAD_REQUEST` với mã lỗi `CATEGORY_IN_USE` và thông báo tiếng Việt cụ thể số bài viết đang liên kết.
  3. Bọc fallback bắt mã lỗi `23503` nếu có race condition bài viết vừa được gán vào ngay trước khi xóa.
* **Chỉ Dẫn Kiểm Thử (QA Input):** Xóa chuyên mục đang có bài viết ➡️ Nhận `400 BAD_REQUEST` kèm thông điệp rõ ràng, không xuất hiện lỗi 500.

---

### 🟠 [R16] Breaking API Contract & Vietnamese Diacritics Shift
* **Kịch bản Nguy hại:** Tên chuyên mục tiếng Việt có các ký tự đặc biệt (`Đ`, `đ`, dấu ngã, hỏi, nặng...) nếu hàm slugify xử lý lỗi sẽ tạo ra ký tự rỗng, hoặc chuyển `Đ` thành `%C4%90` làm hỏng URL trên Storefront.
* **Bản chất Kỹ thuật:** Hàm slugify không hỗ trợ chuẩn bảng mã tiếng Việt Unicode.
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  - Viết hàm `slugifyVN` chuẩn hóa NFD, thay thế `đ/Đ` bằng `d`, loại bỏ dấu thanh tổ hợp, thay khoảng trắng bằng gạch ngang, và chuyển toàn bộ về lowercase.
* **Chỉ Dẫn Kiểm Thử (QA Input):** Test chuỗi `"Đánh Giá Xe & Ưu Đãi Đột Phá 2026!"` ➡️ Bắt buộc ra kết quả `"danh-gia-xe-uu-dai-dot-pha-2026"`.
