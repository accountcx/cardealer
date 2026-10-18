# 🛡️ Risk & Blast Radius Audit: Lead Management & Notification Engine

> **Module Slug:** `lead-management`  
> **Status:** Living Document  
> **Author:** Dependency Graph Analyzer  
> **Version:** 1.1.0

---

## 1. Bán Kính Tác Động (Blast Radius Analysis)

| Hạng mục thay đổi | Bán kính tác động | Rủi ro tiềm ẩn | Biện pháp giảm thiểu |
| :--- | :--- | :--- | :--- |
| **RBAC `leads:delete`** | `packages/types/src/permission.ts` | Gây lỗi type check nếu enum `PermissionAction` hoặc `ROLE_PERMISSIONS` thiếu định nghĩa. | Khai báo đồng nhất ở cả type và Record `ROLE_PERMISSIONS`, chạy `turbo run check-types` kiểm chứng. |
| **Route `DELETE /api/admin/leads/:id`** | `apps/api/src/routes/admin/leads.ts` | Lỗi BOLA/IDOR hoặc xóa nhầm dữ liệu khách hàng. | Bắt buộc xác thực JWT Token, kiểm tra quyền `checkPermission(role, 'leads:delete')`, xác nhận ID tồn tại trước khi xóa và ghi Audit Log. |
| **Email Service Ingestion Hook** | `apps/api/src/routes/leads.ts` | Làm chậm hoặc gián đoạn API tiếp nhận Lead nếu máy chủ email bên ngoài gặp sự cố hoặc timeout mạng. | Bọc toàn bộ lời gọi gửi mail trong `try/catch` bất đồng bộ tách biệt, không `await` làm block response của khách hàng. Phản hồi HTTP 201 cho khách hàng trong $\le 150\text{ms}$. |
| **Dịch vụ Resend REST API** | `apps/api/src/services/email/email.service.ts` | Quota limit từ Resend hoặc sự cố key không hợp lệ. | Bắt try/catch độc lập, kiểm tra `result.error` và ghi log có cấu trúc. Tự động fallback sang SMTP nếu không có key Resend. |
| **Cấu hình Môi Trường Resend & SMTP** | `packages/env`, `.env.example` | Rò rỉ thông tin mật khẩu email hoặc crash server nếu thiếu biến môi trường. | Đặt toàn bộ biến môi trường Resend và SMTP ở dạng `.optional()`, có cơ chế mô phỏng an toàn (Simulated Mode) khi chưa cấu hình key. |

---

## 2. Tiêu Chuẩn An Toàn & Bảo Mật Dữ Liệu (Security & Compliance)

1. **Chống XSS / HTML Injection:** Toàn bộ dữ liệu khách hàng nhập vào (Họ tên, SĐT, Ghi chú...) đều được mã hóa qua hàm `escapeHtml()` trong `@cardealer/core` trước khi render vào email HTML, triệt tiêu hoàn toàn nguy cơ tấn công Script Injection vào email client của nhân viên tư vấn.
2. **Bảo Mật API Key:** `RESEND_API_KEY` chỉ được load và sử dụng ở phía Server-side Backend API (`apps/api`), tuyệt đối không gán tiền tố `NEXT_PUBLIC_` và không bao giờ bundle vào client-side JavaScript.
3. **Giới Hạn Tần Suất Gửi Mail (Rate Limiting & Anti-Spam):** API Ingestion áp dụng Rate Limiting tối đa 5 requests / phút theo IP và cửa sổ Deduplication 10 phút chống gửi đúp, ngăn chặn việc làm cạn kiệt hạn ngạch gửi mail của tài khoản Resend.

---

## 3. Kế Hoạch Dự Phòng & Phục Hồi (Rollback Plan)

1. **Rollback Resend về SMTP:** Nếu tài khoản Resend hết quota hoặc gặp sự cố, chỉ cần xóa hoặc comment biến `RESEND_API_KEY` trong file `.env` và cung cấp thông tin SMTP truyền thống. Hệ thống sẽ tự động chuyển sang luồng gửi SMTP Nodemailer mà không cần sửa code.
2. **Chế độ Fallback Mô Phỏng An Toàn (Simulated Mode):** Nếu cả Resend và SMTP đều chưa sẵn sàng (môi trường dev/test hoặc bảo trì mạng), hệ thống tự động ghi log mô phỏng (Simulated Mode) vào console backend PM2 mà không bao giờ gián đoạn hay crash server.
3. **Traceability Quản Trị:** Mọi thao tác xóa lead đều được kiểm soát nghiêm ngặt qua RBAC và lưu vết đầy đủ trong bảng `audit_logs` để dễ dàng đối soát và khôi phục khi cần thiết.
