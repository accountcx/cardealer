# 📐 Solution Options: Lead Management & Notification Engine

> **Module Slug:** `lead-management`  
> **Status:** Living Document  
> **Author:** System Analyst Architect

---

## 1. Bài Toán Kỹ Thuật (Engineering Challenges)

1. **Xóa Lead an toàn (Delete Lead Safety):**
   - Cần đảm bảo quyền hạn RBAC nghiêm ngặt: chỉ `admin` và `manager` được phép xóa; `sales` và `editor` bị chặn tuyệt đối.
   - Khi xóa Lead, cần ghi nhận nhật ký kiểm toán (Audit Trail) để đối soát nếu xảy ra tranh chấp dữ liệu kinh doanh.
2. **Gửi Email Thông Báo Không Làm Nghẽn Trải Nghiệm Khách Hàng (Non-blocking & Resilient Email Dispatching):**
   - Tốc độ phản hồi của API `POST /api/leads` cho khách hàng trên website phải luôn dưới 200ms.
   - Quá trình gửi email qua SMTP (có thể mất 1 - 3 giây hoặc timeout nếu mạng chập chờn) TUYỆT ĐỐI KHÔNG được làm treo hoặc làm sập request của khách.
   - Khi chưa cấu hình SMTP hoặc cấu hình sai, hệ thống vẫn phải lưu Lead vào DB an toàn và ghi log cảnh báo rõ ràng.

---

## 2. Ma Trận Đánh Giá Phương Án (Trade-Off Matrix)

### Vấn Đề 1: Cơ Chế Xóa Lead (Hard Delete vs Soft Delete)

| Tiêu chí | Phương án A: Hard Delete + Audit Trail (Khuyên dùng) | Phương án B: Soft Delete (`is_deleted` column) |
| :--- | :--- | :--- |
| **Tính tương thích Schema hiện hữu** | ✅ **Cao nhất**: Bảng `leads` hiện tại không có cột `is_deleted`. Sử dụng `DELETE FROM leads` khớp 100% với schema và toàn bộ query thống kê hiện hữu. | ❌ Thấp hơn: Cần migration thêm cột `is_deleted`, cập nhật lại 100% các query `count()` và Datatable filter. |
| **Tuân thủ Quyền Riêng Tư (GDPR/Data Privacy)** | ✅ Xóa sạch PII (Tên, SĐT, Ghi chú) của khách khỏi DB khi được yêu cầu. | ⚠️ Dữ liệu cá nhân vẫn lưu trữ vô thời hạn trong DB. |
| **Khả năng Đối Soát** | ✅ Bản ghi xóa được lưu vắn tắt vào `audit_logs` (ai xóa, lúc nào, lead ID nào). | ✅ Có thể khôi phục nếu xóa nhầm. |
| **Quyết định** | 🎯 **Chọn Phương án A** để triển khai gọn gàng, tương thích tuyệt đối với schema hiện tại. |

---

### Vấn Đề 2: Cơ Chế Gửi Email (Nodemailer Direct vs Worker Queue)

| Tiêu chí | Phương án A: In-Process Asynchronous Dispatch (Khuyên dùng) | Phương án B: Distributed Redis / BullMQ Queue |
| :--- | :--- | :--- |
| **Độ phức tạp hạ tầng** | ✅ **Cực kỳ tinh gọn**: Tận dụng `nodemailer` đã có trong `package.json`, không cần cài thêm Redis container. | ❌ Phức tạp: Phải vận hành thêm Redis Server, quản lý worker process riêng. |
| **Hiệu năng & Tốc độ** | ✅ Trả lời ngay cho client sau khi `db.insert()`, hàm gửi email chạy ngầm qua `setImmediate` / unawaited Promise có catch lỗi riêng. | ✅ Rất cao khi lưu lượng hàng nghìn email/giây. |
| **Mức độ phù hợp với Showroom** | 🎯 **Rất hoàn hảo**: Tần suất lead đại lý ô tô khoảng 50 - 200 leads/ngày, cơ chế bất đồng bộ in-process xử lý mượt mà 0% độ trễ. | ⚠️ Quá thừa tải (Over-engineering). |
| **Quyết định** | 🎯 **Chọn Phương án A**. |
