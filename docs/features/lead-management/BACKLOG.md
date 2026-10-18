# 📋 Product Backlog: Lead Management & Notification Engine

> **Module Slug:** `lead-management`  
> **Status:** Living Document  
> **Standard:** Vertical Slices (End-to-End Delivery)

---

## 1. Danh Sách Lát Cắt Tính Năng (Vertical Slices)

### 🔹 US-01: Admin CRM - Xóa Yêu Cầu Báo Giá & Hồ Sơ Vay
- **Mô tả:** Là Quản trị viên (Admin/Manager), tôi muốn xóa một yêu cầu báo giá hoặc hồ sơ vay không hợp lệ/rác khỏi hệ thống CRM để giữ sạch danh sách khách hàng.
- **Tiêu chí nghiệm thu (Gherkin AC):**
  - **AC-01.1 (Phân quyền RBAC):**
    - Given Người dùng đăng nhập có vai trò `admin` hoặc `manager`.
    - When Gửi yêu cầu `DELETE /api/admin/leads/:id`.
    - Then Hệ thống cho phép xóa và trả về status 200 `{ success: true, message: "Đã xóa yêu cầu thành công" }`.
  - **AC-01.2 (Chặn quyền Sales / Editor):**
    - Given Người dùng đăng nhập có vai trò `sales` hoặc `editor`.
    - When Cố gắng gọi `DELETE /api/admin/leads/:id`.
    - Then Hệ thống trả về HTTP 403 Forbidden `{ error: { code: "FORBIDDEN", message: "Bạn không có quyền xóa yêu cầu này" } }`.
  - **AC-01.3 (Bảo toàn Audit Trail):**
    - Given Một yêu cầu báo giá bị xóa thành công bởi Admin.
    - When Kiểm tra bảng `audit_logs`.
    - Then Xuất hiện bản ghi hành động `DELETE` đối với entity `leads` ghi nhận `userId`, `entityId`, và chi tiết tên, số điện thoại khách hàng.
  - **AC-01.4 (Giao diện Admin Modal Xác Nhận):**
    - Given Admin xem bảng danh sách tại trang `/leads`.
    - When Bấm nút biểu tượng thùng rác trên một hàng hoặc trong Drawer Chi tiết.
    - Then Xuất hiện Modal xác nhận màu đỏ cảnh báo hành động không thể hoàn tác. Khi xác nhận, xóa tức thì (Optimistic UI) và cập nhật số đếm thống kê.

---

### 🔹 US-02: Storefront & Admin API - Gửi Email Thông Báo Khách Hàng Submit Form
- **Mô tả:** Là Trưởng phòng kinh doanh hoặc Chuyên viên tư vấn, tôi muốn nhận được email thông báo ngay khi khách hàng gửi form báo giá, hồ sơ vay, hoặc đăng ký lái thử trên website.
- **Tiêu chí nghiệm thu (Gherkin AC):**
  - **AC-02.1 (Gửi Email Đầy Đủ Thông Tin):**
    - Given Khách hàng gửi thành công một Lead qua `POST /api/leads`.
    - When Hệ thống lưu Lead vào cơ sở dữ liệu.
    - Then Một email HTML trang trọng mang thương hiệu Hyundai được gửi đến địa chỉ email nhận thông báo với đầy đủ: Họ tên, Số điện thoại (bấm gọi được), Dòng xe/Phiên bản, Tỉnh thành, Dự toán lăn bánh/Ghi chú, và đường dẫn truy cập trực tiếp CRM.
  - **AC-02.2 (Khả Năng Chống Nghẽn & Dự Phòng - Non-blocking Resilience):**
    - Given Hệ thống chưa cấu hình SMTP hoặc máy chủ SMTP gặp sự cố timeout.
    - When Khách hàng gửi yêu cầu tư vấn.
    - Then Lead VẪN ĐƯỢC LƯU THÀNH CÔNG vào DB và trả về HTTP 201 cho khách hàng (không bị crash, không bị 500), lỗi gửi email được ghi log cảnh báo an toàn.
  - **AC-02.3 (Cấu Hình Email Linh Hoạt):**
    - Given Cấu hình email nhận có thể lấy từ biến môi trường `LEAD_NOTIFICATION_EMAIL` hoặc từ cài đặt liên hệ trong cơ sở dữ liệu (`contact_settings.email`).
    - When Gửi thông báo.
    - Then Email được chuyển tiếp chính xác đến hòm thư được cấu hình.
