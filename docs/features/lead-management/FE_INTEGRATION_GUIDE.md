# 🎨 Frontend Integration Guide: Lead Management & Notification

> **Module Slug:** `lead-management`  
> **Status:** Living Document  
> **Author:** Tailwind UI Designer

---

## 1. Thành Phần Giao Diện Admin CRM (Admin Datatable & Delete Modal)

### 1.1. Nút Thao Tác Xóa Trên Bảng Dữ Liệu (`apps/admin/app/leads/page.tsx`)
- Vị trí: Cột **Thao tác** (`Actions`) cuối mỗi dòng trên Datatable.
- Icon: `Trash2` từ `lucide-react`.
- Trạng thái hiển thị:
  - Có quyền `leads:delete` (Admin/Manager): Nút màu đỏ mờ `text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-lg transition-colors`.
  - Không có quyền: Ẩn hoặc disable nút để bảo đảm UX an toàn.

### 1.2. Modal Xác Nhận Xóa Lead (`Confirm Delete Modal`)
- Biến thể giao diện: Modal cảnh báo màu đỏ (`variant="danger"`).
- Tiêu đề: **"Xóa Yêu Cầu Báo Giá & Hồ Sơ Vay"**.
- Nội dung: Hiển thị tên khách hàng và số điện thoại cần xóa:
  > *"Bạn có chắc chắn muốn xóa vĩnh viễn yêu cầu của khách hàng **[Tên khách]** (SĐT: **[SĐT]**)? Dữ liệu sau khi xóa sẽ không thể phục hồi và hành động này sẽ được lưu vào nhật ký kiểm toán hệ thống."*
- Nút bấm:
  - Nút Hủy: Nút thứ cấp nền xám `bg-slate-800 hover:bg-slate-700 text-slate-200`.
  - Nút Xác nhận: Nút cảnh báo đỏ `bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2`. Khi đang xóa hiển thị spinner `Đang xóa...`.

---

## 2. Thiết Kế Mẫu Email Thông Báo HTML (Email Template)

- Tiêu đề email (Subject): `[HYUNDAI VINH CRM] 🚗 Khách hàng mới gửi yêu cầu: [Họ tên] - [Dòng xe] ([SĐT])`
- Màu sắc chủ đạo: Xanh thương hiệu Hyundai `#002C6C`, Accent `#00AAD2`, Nền `#F8FAFC`.
- Cấu trúc email:
  1. **Header:** Logo Hyundai Vinh + Tiêu đề thông báo nổi bật.
  2. **Card Khách Hàng (Tâm điểm):**
     - Họ và tên khách hàng (In đậm cỡ lớn).
     - Nút Gọi điện thoại trực tiếp (`tel:...`) màu xanh nổi bật để saler bấm gọi ngay trên điện thoại.
     - Dòng xe / Phiên bản quan tâm.
     - Tỉnh thành / Dự toán lăn bánh.
     - Loại yêu cầu (Báo giá lăn bánh / Trả góp ngân hàng / Lái thử xe).
     - Thời gian mong muốn liên hệ & Ghi chú từ khách.
## 3. Ma Trận 4-State UI (Loading, Empty, Error, Success)

| Trạng thái (State) | Biểu hiện giao diện (UI Presentation) | Hành vi người dùng (Interaction) |
| :--- | :--- | :--- |
| **Loading State** | Nút "Xác Nhận Xóa" hiển thị icon Loader xoay tròn kèm text "Đang xóa...", vô hiệu hóa nút Hủy để chống double-click. | Không thể thao tác bấm lặp lại. |
| **Empty State** | Khi danh sách Lead rỗng sau khi xóa hết, bảng hiển thị hình minh họa hộp thư rỗng kèm thông điệp: "Chưa có yêu cầu báo giá nào". | Nút Làm mới danh sách để tải lại. |
| **Error State** | Nếu API trả về lỗi 403 (không đủ quyền) hoặc 500 (lỗi mạng/server), hiển thị Alert thông báo lỗi màu đỏ nổi bật ngay trên Modal: "Không thể xóa yêu cầu. Vui lòng kiểm tra quyền hạn của bạn." | Người dùng có thể thử lại hoặc bấm Đóng modal. |
| **Success State** | Xóa thành công, tự động đóng Modal, áp dụng Optimistic UI gỡ hàng khỏi bảng, hiển thị Toast xanh thông báo: "Đã xóa yêu cầu báo giá thành công!" và cập nhật lại bộ đếm KPI. | Bảng hiển thị danh sách mới cập nhật tức thì. |

