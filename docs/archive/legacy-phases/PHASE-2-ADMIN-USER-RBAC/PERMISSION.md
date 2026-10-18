Hệ thống phân quyền **RBAC (Role-Based Access Control)** của dự án được thiết kế theo ma trận 4 vai trò cố định tại [`packages/types/src/permission.ts`](file:///Users/nhatphan/Code/CarDealer/cardealer/packages/types/src/permission.ts), tuân thủ nghiêm ngặt **Nguyên tắc Đặc Quyền Tối Thiểu (PoLP - Principle of Least Privilege)**:

---

### 📊 Bảng Ma Trận Phân Quyền Chi Tiết (Role-Permission Matrix)

| Nhóm Tính Năng / Quyền Hạn | Mã Quyền (`Action`) | 👑 `admin`<br>(Quản trị viên) | 👔 `manager`<br>(Quản lý) | ✍️ `editor`<br>(Biên tập) | 💼 `sales`<br>(Kinh doanh) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **QUẢN TRỊ NHÂN SỰ** | | | | | |
| Xem danh sách & thông tin nhân sự | `users:read` | ✅ Có | ✅ Có | ❌ Chặn | ❌ Chặn |
| Tạo mới nhân viên | `users:create` | ✅ Có | ❌ Chặn | ❌ Chặn | ❌ Chặn |
| Sửa thông tin nhân viên | `users:update` | ✅ Có | ✅ Có | ❌ Chặn | ❌ Chặn |
| Khóa / Mở khóa tài khoản | `users:update` | ✅ Có | ✅ Có *(trừ admin)* | ❌ Chặn | ❌ Chặn |
| Đổi vai trò (Thăng/Hạ quyền) | `users:role` | ✅ Có | ❌ Chặn | ❌ Chặn | ❌ Chặn |
| Cưỡng chế đăng xuất (Force Logout) | `users:force_logout` | ✅ Có | ❌ Chặn | ❌ Chặn | ❌ Chặn |
| Xóa vĩnh viễn tài khoản | `users:delete` | ✅ Có | ❌ Chặn | ❌ Chặn | ❌ Chặn |
| **CATALOG XE & BẢNG MÀU** | | | | | |
| Xem danh sách dòng xe & màu sơn | `cars:read` | ✅ Có | ✅ Có | ✅ Có | ✅ Có *(chỉ xem)* |
| Thêm / Sửa / Xóa dòng xe & màu sơn | `cars:write` | ✅ Có | ✅ Có | ✅ Có | ❌ Chặn |
| **KHÁCH HÀNG & BÁO GIÁ (LEADS)** | | | | | |
| Xem danh sách khách hàng & yêu cầu báo giá | `leads:read` | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Tiếp nhận, cập nhật trạng thái tư vấn lead | `leads:write` | ✅ Có | ✅ Có | ❌ Chặn | ✅ Có |
| **CÀI ĐẶT SHOWROOM & AUDIT LOGS** | | | | | |
| Xem cấu hình Showroom & Lịch sử kiểm toán | `system:read` | ✅ Có | ✅ Có | ❌ Chặn | ❌ Chặn |
| Cập nhật hotline, địa chỉ, mạng xã hội | `system:write` | ✅ Có | ❌ Chặn | ❌ Chặn | ❌ Chặn |

---

### 🛡️ Ý Nghĩa & Vai Trò Cụ Thể Trong Showroom Xe:

1. 👑 **`admin` (Quản Trị Viên Tối Cao / Ban Giám Đốc / IT Lead):**
   - Nắm giữ toàn bộ 100% quyền hạn trong hệ thống.
   - Là vai trò duy nhất có quyền **tạo nhân viên mới, gán vai trò, xóa nhân viên** và **xem nhật ký kiểm toán hệ thống (Audit Logs)**.
   - *Bảo vệ an toàn:* Hệ thống luôn bảo đảm còn tối thiểu 1 `admin` hoạt động (không thể tự xóa hoặc tự hạ quyền của chính mình).

2. 👔 **`manager` (Trưởng Phòng Kinh Doanh / Giám Sát Showroom):**
   - Quản lý vận hành hàng ngày: Xem danh sách nhân viên, hỗ trợ sửa thông tin số điện thoại/họ tên, tạm khóa tài khoản nhân viên vi phạm.
   - Thêm/sửa catalog xe, bảng màu, xem cấu hình showroom và toàn bộ danh sách khách hàng gửi yêu cầu tư vấn.
   - **Bị giới hạn (Anti-Privilege Escalation):** Không thể tự ý nâng quyền ai đó lên `admin`, không thể xóa tài khoản và không thể buộc đăng xuất người khác.

3. ✍️ **`editor` (Chuyên Viên Nội Dung / Marketing / Media):**
   - Chỉ tập trung vào sản phẩm và truyền thông: Thêm xe mới, cập nhật bảng giá niêm yết, cấu hình ảnh xe theo màu sơn ngoại thất, quản lý bài viết đánh giá xe.
   - Hoàn toàn **không nhìn thấy mục Tài khoản nhân sự** và không can thiệp vào dữ liệu khách hàng.

4. 💼 **`sales` (Nhân Viên Tư Vấn Bán Hàng / Sale Showroom):**
   - Tập trung vào khách hàng: Xem thông số xe để tư vấn, xem danh sách khách hàng tiềm năng gửi yêu cầu báo giá và cập nhật tiến độ tư vấn.
   - Giao diện được tối giản tối đa: Không có quyền sửa giá xe, không sửa màu sơn, không truy cập tài khoản hay cài đặt showroom.

---

### 🔒 Cơ Chế Bảo Vệ Thực Tế Trên Giao Diện & Backend:
- **Phía Giao diện (AdminShell):** Menu Sidebar và các nút thao tác (Thêm, Sửa, Khóa, Xóa) sẽ **tự động ẩn đi** nếu người dùng đăng nhập không đủ quyền tương ứng.
- **Phía Backend API (Zero-Trust):** Dù kẻ gian có cố tình sửa mã nguồn frontend để bấm nút, request gửi lên API vẫn bị chặn đứng ngay lập tức tại Middleware với mã lỗi **`403 FORBIDDEN (INSUFFICIENT_PERMISSIONS)`**.