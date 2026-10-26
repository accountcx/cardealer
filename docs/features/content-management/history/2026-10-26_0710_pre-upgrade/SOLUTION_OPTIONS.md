# 💡 SOLUTION OPTIONS: In-Editor Single Block AI Generation

> **Module:** `content-management`  
> **Phiên bản:** `v1.1.0`  
> **Căn cứ:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md)  

---

## 1. Bối Cảnh & Bài Toán Nghiệp Vụ
Trong trình biên tập bài viết của CarDealer CMS (`/posts/[id]`), người dùng hiện đã có modal AI tổng thể để sinh toàn bộ dàn ý hoặc cả bài viết (`AiWritingAssistantModal.tsx`). Tuy nhiên, trong thực tế biên tập chuyên sâu:
1. Biên tập viên thường muốn tinh chỉnh hoặc điền dữ liệu cho **từng khối cụ thể** (như bảng thông số kỹ thuật `specTable`, bảng giá lăn bánh `priceTable`, ưu nhược điểm `prosCons`, câu hỏi thường gặp `faq`, hoặc đoạn văn kết bài `paragraph`).
2. Việc phải mở modal sinh lại toàn bộ bài viết sẽ phá vỡ các khối đã kỳ công chỉnh sửa thủ công trước đó.
3. Yêu cầu đặt ra: Bổ sung khả năng **kích hoạt AI ngay trên từng khối nội dung** (In-Editor Single Block Generation) mà không làm ảnh hưởng đến các khối khác.

---

## 2. So Sánh Các Phương Án Kiến Trúc

| Tiêu chí | Phương Án 1: 1-Click Auto-Fill Trực Tiếp | Phương Án 2: Kết Hợp 1-Click & Popover Chỉ Đạo Nhanh (Đề Xuất) | Phương Án 3: Mở Sub-Modal Riêng Cho Mỗi Khối |
| :--- | :--- | :--- | :--- |
| **Cơ chế hoạt động** | Bấm nút "AI Điền Khối", hệ thống tự lấy tiêu đề + từ khóa + ngữ cảnh xung quanh để gọi AI và điền ngay lập tức. | Mặc định 1-Click tự động lấy ngữ cảnh bài viết; đồng thời có nút mở rộng Popover nhỏ cho phép nhập chỉ đạo bổ sung (ví dụ: "so sánh bản Turbo với bản Xăng"). | Mỗi khi bấm AI khối sẽ mở ra một popup modal to che toàn màn hình để chọn thông số và preview. |
| **Trải nghiệm UX (Speed & Flow)** | 🟢 Cực nhanh, 1 thao tác duy nhất. | 🟢 Linh hoạt tối đa: nhanh khi muốn tự động, chính xác khi cần can thiệp prompt riêng. | 🔴 Chậm, cồng kềnh, che khuất bài viết đang soạn. |
| **Mức độ kiểm soát nội dung** | 🟡 Trung bình (phụ thuộc 100% vào ngữ cảnh chung của bài viết). | 🟢 Rất cao (biên tập viên có thể gợi ý chi tiết cho khối mà không mất ngữ cảnh). | 🟢 Cao. |
| **Tác động tới cấu trúc DOM & State** | 🟢 Cập nhật tại chỗ khối $k$, giữ nguyên ID và thứ tự các khối khác. | 🟢 Cập nhật tại chỗ khối $k$, giữ nguyên ID và thứ tự các khối khác. | 🟡 Phức tạp hơn do phải đồng bộ state qua lại modal. |
| **Độ phức tạp triển khai** | Thấp ($\approx 100$ dòng code). | Vừa phải ($\approx 160$ dòng code). | Cao ($\approx 350$ dòng code). |

---

## 3. Quyết Định Kiến Trúc (Architecture Decision)
- **Lựa chọn:** **Phương Án 2 (Kết hợp 1-Click Quick Fill & Popover Chỉ Đạo Tùy Chọn)**.
- **Lý do lựa chọn:**
  - Vừa thỏa mãn nhu cầu sinh siêu tốc 1-click cho các khối chuẩn mực (như FAQ, Ưu nhược điểm, Thông số xe), vừa cho phép biên tập viên tinh chỉnh hướng viết cho các khối đoạn văn/tiêu đề khi cần.
  - Sử dụng chung endpoint backend chuẩn hóa `POST /api/admin/ai/generate` với action `generate_single_block` đã có sẵn trong schema, không cần tạo endpoint mới gây phân mảnh API.
  - Không che khuất giao diện soạn thảo, trạng thái loading chỉ diễn ra cô lập trên đúng khối được chọn (`generatingBlockId`).
