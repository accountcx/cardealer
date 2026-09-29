# 🏛️ SOLUTION OPTIONS: TÍCH HỢP CHỌN & TẢI ẢNH CHO QUẢN TRỊ DÒNG XE

> **Tuân thủ:** `universal-agentic-workflow.xml` - **Phase 2.1: Solution Options**  
> **Role / Active Skills:** `system-analyst-architect`  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`SYSTEM_MAP.md`](../../SYSTEM_MAP.md)

---

## 1. Đặt Vấn Đề Kỹ Thuật

Hiện tại, việc quản lý ảnh trong phân hệ Catalog Xe (`apps/admin/app/cars`) gặp các thách thức:
1. Trường ảnh xe đại diện (`anhDaiDienUrl`) và ảnh xe theo màu sắc (`anhXeTheoMauUrl`) yêu cầu nhập URL thủ công dạng text.
2. Quản trị viên khi cần tải ảnh mới cho xe thường phải rời khỏi trang đang chỉnh sửa, chuyển sang trang `/media` để upload, copy URL rồi quay lại dán vào ô nhập.
3. Không có thumbnail xem trước ngay cạnh ô nhập cấu hình màu xe (`TabColors.tsx`), dẫn đến khó kiểm tra xem ảnh đã đúng góc chụp hoặc đúng phiên bản mâm xe hay chưa.

---

## 2. So Sánh Các Phương Án Kiến Trúc

### 🔹 Phương án A (Ad-hoc Component / File Input Cục Bộ)
- **Mô tả:** Tự viết thẻ `<input type="file">` riêng và hàm upload cục bộ trong từng component `TabGeneralInfo.tsx` và `TabColors.tsx`.
- **Ưu điểm:** Viết nhanh trong phạm vi 1 component đơn lẻ.
- **Nhược điểm:**
  - ❌ Vi phạm DRY (Don't Repeat Yourself).
  - ❌ Không tái sử dụng được 192+ ảnh đã có sẵn trên Cloudinary và bảng `media`.
  - ❌ Gây phình to kích thước bundle và khó bảo trì khi logic upload thay đổi.
  - ❌ Phá vỡ chuẩn Design System `@cardealer/ui`.

### 🔹 Phương án B (Centralized Reusable MediaPickerModal Integration) - **LỰA CHỌN KHUYẾN NGHỊ ⭐️**
- **Mô tả:** Tái sử dụng component [`MediaPickerModal.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/components/MediaPickerModal.tsx) đã được đóng gói chuẩn mực ở Lát cắt US-03.
  - Sử dụng chung 1 instance modal ở cấp Tab hoặc Form.
  - Hỗ trợ đầy đủ **2 tab: Thư Viện Ảnh (192+ ảnh) và Tải Ảnh Mới (kéo thả upload trực tiếp lên Cloudinary)**.
  - Hỗ trợ chế độ chọn đơn `mode="single"` với tính năng nhấp đúp chọn nhanh.
  - Bổ sung Thumbnail Preview bo góc viền kính mờ và nút xóa nhanh `X`.
- **Ưu điểm:**
  - ✅ Tận dụng 100% tài nguyên và hạ tầng sẵn có (Cloudinary streaming, Presigned signatures, Database media table).
  - ✅ Trải nghiệm người dùng đồng nhất 100% với Post Editor và Profile Admin.
  - ✅ 100% tuân thủ `@cardealer/ui` (Zero raw HTML controls).
  - ✅ Tiết kiệm thời gian thao tác cho người quản trị: vừa có thể tìm ảnh trong kho, vừa có thể tải ảnh mới ngay tại chỗ mà không cần rời màn hình.
- **Nhược điểm:**
  - Cần quản lý state modal linh hoạt trong `TabColors.tsx` khi có nhiều màu và nhiều phiên bản khác nhau (giải quyết bằng state lưu `targetColorId` và `targetVersionId`).

---

## 3. Quyết Định Thiết Kế & Trade-offs

* **Lựa chọn:** **Phương án B**.
* **Xử lý State trong `TabColors.tsx`:**
  - Trong `TabColors.tsx`, người dùng cấu hình ảnh cho cặp `(versionId, colorId)`.
  - Khai báo state:
    ```tsx
    const [colorPickerTarget, setColorPickerTarget] = useState<{
      versionId: string;
      colorId: string;
      colorName: string;
      currentUrl: string;
    } | null>(null);
    ```
  - Khi người dùng click "Chọn từ Thư Viện / Tải Mới" ở bất kỳ màu nào, modal sẽ mở với title tương ứng: `"Chọn ảnh xe thật cho màu [Tên màu]"`.
  - Khi chọn ảnh xong, gọi `updateColorImage(target.versionId, target.colorId, selectedUrl)` và đóng modal.
