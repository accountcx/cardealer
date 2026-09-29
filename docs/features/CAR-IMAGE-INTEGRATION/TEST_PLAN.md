# 🧪 TEST PLAN: KỊCH BẢN KIỂM THỬ TÍCH HỢP CHỌN & TẢI ẢNH XE

> **Tuân thủ:** `universal-agentic-workflow.xml` - **Phase 3.2: Test Specification**  
> **Role / Active Skills:** `qa-test-engineer`  
> **Tài liệu tham chiếu:** [`FLOW.md`](./FLOW.md), [`RISK_AUDIT.md`](./RISK_AUDIT.md)

---

## 1. Ma Trận Kịch Bản Kiểm Thử (Test Cases Matrix)

| Test ID | Hạng Mục Kiểm Thử | Dữ Liệu / Thao Tác Đầu Vào | Kết Quả Kỳ Vọng | Mức Độ |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | Mở Modal Chọn Ảnh từ Tab General Info | Nhấp "Chọn Từ Thư Viện" tại `TabGeneralInfo.tsx` | `MediaPickerModal` mở lên hiển thị tab Thư Viện với danh sách ảnh xe | P0 |
| **TC-02** | Chọn ảnh từ thư viện cho Xe Đại Diện | Chọn 1 ảnh xe Hyundai và click "Xác nhận chọn" | URL được điền vào ô nhập, khung preview 16:9 xuất hiện và hiển thị ảnh sắc nét | P0 |
| **TC-03** | Tải ảnh mới từ máy tính trong Tab General Info | Mở modal, chuyển tab "Tải Ảnh Mới", thả ảnh vào dropzone | Ảnh được upload lên Cloudinary, chuyển về Tab thư viện và tự động chọn ảnh đó | P0 |
| **TC-04** | Xóa nhanh ảnh đại diện | Nhấp nút `X` cạnh ô nhập URL | Ô nhập được xóa trống, khung thumbnail biến mất | P1 |
| **TC-05** | Mở Modal Chọn Ảnh theo Màu Xe (`TabColors`) | Nhấp "Chọn / Tải Ảnh" tại màu Đỏ của bản Tiêu Chuẩn | Tiêu đề modal hiển thị: "Chọn ảnh xe thật cho màu Đỏ" | P0 |
| **TC-06** | Chọn ảnh cho từng màu xe riêng biệt | Chọn ảnh cho màu Trắng và màu Đen của cùng 1 phiên bản | Mỗi màu lưu trữ đúng URL ảnh tương ứng, không bị ghi đè chéo | P0 |
| **TC-07** | Nhập thủ công hoặc dán URL bên ngoài | Dán trực tiếp 1 đường link ảnh vào ô nhập | Ô nhập nhận giá trị, preview hiển thị bình thường | P1 |
| **TC-08** | Audit Design System & Zero Raw Controls | Chạy kiểm tra tĩnh mã nguồn | 100% sử dụng `Button`, `Input` từ `@cardealer/ui`, 0 raw HTML controls | P0 |

---

## 2. Kịch Bản Kiểm Chứng Tự Động (Automated Verification)

Kịch bản tự động [`scripts/verify_car_image_integration.sh`](file:///Users/nhatphan/Code/CarDealer/cardealer/scripts/verify_car_image_integration.sh) sẽ kiểm tra:
1. TypeScript compilation sạch sẽ (`pnpm check-types` 8/8 packages).
2. Kiểm tra tĩnh sự hiện diện của `MediaPickerModal` trong `TabGeneralInfo.tsx`, `TabColors.tsx` và `CarFormModal.tsx`.
3. Kiểm tra Zero raw HTML controls trong các components liên quan.
