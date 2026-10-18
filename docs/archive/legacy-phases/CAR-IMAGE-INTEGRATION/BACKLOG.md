# 📋 BACKLOG: TÍCH HỢP CHỌN & TẢI ẢNH CHO QUẢN TRỊ DÒNG XE (CAR IMAGE INTEGRATION)

> **Tuân thủ:** `universal-agentic-workflow.xml` - **Phase 1: Strategic Analysis**  
> **Role / Active Skills:** `task-planner-pm`, `logic-intent-explorer`, `logic-intent-extractor`  
> **Trạng thái:** 🎯 In Progress (Zero Mutation Phase)  
> **Ngày khởi tạo:** 2026-09-29T23:50:00+07:00

---

## 1. Bối Cảnh & Mục Tiêu Nghiệp Vụ (Business Intent)

Hệ thống Showroom Hyundai đã hoàn thiện nền tảng **Admin Image Library** với 192+ hình ảnh chuẩn hóa trên Cloudinary và component dùng chung [`MediaPickerModal.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/components/MediaPickerModal.tsx) (hỗ trợ cả 2 tab: Chọn từ thư viện có sẵn & Kéo thả tải ảnh mới trực tiếp).

Tuy nhiên, trong phân hệ Quản trị Xe ([`apps/admin/app/cars`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/cars)), quy trình thiết lập hình ảnh cho dòng xe và các biến thể màu sắc còn phân mảnh:
1. **Khi tạo mới dòng xe ([`CarFormModal.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/cars/components/CarFormModal.tsx)):** Cần bảo đảm trải nghiệm 1-click mở modal chọn ảnh hoặc upload ảnh mới, hiển thị thumbnail tức thì và xóa nhanh URL.
2. **Khi chỉnh sửa thông tin xe ([`TabGeneralInfo.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/cars/%5Bslug%5D/components/TabGeneralInfo.tsx)):** Hiện tại trường `Ảnh Đại Diện Xe (URL)` là text input thủ công, chưa có nút bấm kết nối với Thư Viện Ảnh hoặc Tải Ảnh Mới.
3. **Khi cấu hình màu sắc xe & mâm ([`TabColors.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/cars/%5Bslug%5D/components/TabColors.tsx)):** Trường `Đường Dẫn Ảnh Xe Thật Theo Màu & Mâm Bản Này (ảnh mặc định theo màu xe)` bắt buộc người quản trị phải nhớ hoặc copy URL thủ công từ bên ngoài, làm chậm quá trình thiết lập bộ sưu tập màu sắc xe Hyundai.

🎯 **Mục tiêu tính năng:** Tích hợp trực tiếp [`MediaPickerModal.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/components/MediaPickerModal.tsx) vào tất cả các điểm chạm quản lý ảnh xe, cho phép quản trị viên **chọn ảnh từ thư viện có sẵn hoặc upload ảnh mới trực tiếp từ máy tính**, xem trước thumbnail sắc nét và thao tác nhanh chóng với 100% component `@cardealer/ui`.

---

## 2. Phạm Vi Tác Động & Phân Tích Kỹ Thuật (Blast Radius)

### 📍 Các tệp tác động chính:
1. [`apps/admin/app/cars/components/CarFormModal.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/cars/components/CarFormModal.tsx):
   - Rà soát nút "Chọn Từ Thư Viện / Tải Mới", thumbnail preview và tính tương thích với `MediaPickerModal`.
2. [`apps/admin/app/cars/[slug]/components/TabGeneralInfo.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/cars/%5Bslug%5D/components/TabGeneralInfo.tsx):
   - Bổ sung nút bấm `Button` "Chọn Từ Thư Viện" cạnh nhãn trường `Ảnh Đại Diện Xe (URL)`.
   - Bổ sung nút xóa nhanh `X` khi đã có ảnh.
   - Bổ sung khung preview thumbnail trực quan bo góc có viền kính mờ.
   - Nhúng `MediaPickerModal` (`mode="single"`, tab Library + Upload).
3. [`apps/admin/app/cars/[slug]/components/TabColors.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/cars/%5Bslug%5D/components/TabColors.tsx):
   - Bổ sung nút bấm `Button` "Chọn Từ Thư Viện" tại trường `Đường Dẫn Ảnh Xe Thật Theo Màu & Mâm Bản Này`.
   - Hiển thị preview thumbnail ảnh xe theo màu sắc ngay trong card cấu hình màu.
   - Hỗ trợ chọn ảnh từ kho hoặc tải ngay ảnh xe thật lên Cloudinary.
   - Tự động cập nhật vào cấu hình màu của phiên bản thông qua `updateColorImage(activeVersionId, color.id, url)`.
4. [`scripts/verify_car_image_integration.sh`](file:///Users/nhatphan/Code/CarDealer/cardealer/scripts/verify_car_image_integration.sh) *(Tạo mới)*:
   - Kịch bản kiểm chứng tự động toàn diện kiểm tra type-check, cấu trúc code, zero raw HTML controls và các điểm kết nối tích hợp.

---

## 3. Phân Rã User Stories (Vertical Slices)

| User Story ID | Tiêu Đề Lát Cắt | Trọng Tâm Nghiệp Vụ & Kỹ Thuật | Trạng Thái |
| :---: | :--- | :--- | :---: |
| **US-01** | **Chỉnh Sửa Xe: Tích Hợp Media Picker Vào Tab Thông Tin Chung** | Tích hợp `MediaPickerModal` vào `TabGeneralInfo.tsx`, hỗ trợ preview thumbnail, nút xóa nhanh, chọn từ thư viện hoặc kéo thả tải ảnh mới. | ⏳ PENDING |
| **US-02** | **Màu Sắc Xe: Tích Hợp Media Picker Vào Tab Màu Sắc & Mâm Xe** | Tích hợp `MediaPickerModal` vào `TabColors.tsx` tại trường `Đường Dẫn Ảnh Xe Thật Theo Màu & Mâm Bản Này`, hiển thị thumbnail và cập nhật reactive state. | ⏳ PENDING |
| **US-03** | **Đồng Bộ & Hoàn Thiện Modal Tạo Xe Mới (`CarFormModal`)** | Rà soát và hoàn thiện trải nghiệm chọn/tải ảnh đại diện xe khi tạo mới, bảo đảm tính nhất quán 100% về giao diện và hành vi với màn hình sửa. | ⏳ PENDING |
| **US-04** | **Kiểm Chứng Tự Động & Đảm Bảo Chất Lượng Toàn Trình** | Xây dựng script kiểm chứng `verify_car_image_integration.sh`, chạy type-check Turborepo (8/8 packages) và audit zero raw HTML controls. | ⏳ PENDING |

---

## 4. Nguyên Tắc Thiết Kế Bắt Buộc (Invariants & Constraints)

1. **Zero Raw HTML Controls:** 100% controls tiếp tục sử dụng primitive từ `@cardealer/ui` (`Button`, `Input`, `Modal`). Tuyệt đối không dùng thẻ trần `<button>`, `<input>`.
2. **Kế Thừa Sức Mạnh 2 Tabs:** Cả 3 điểm chạm đều tận dụng trọn vẹn 2 Tab của `MediaPickerModal` (Tab Thư Viện 192+ ảnh có sẵn & Tab Tải Mới trực tiếp lên Cloudinary qua luồng streaming).
3. **Responsive & Luxury Dark Theme:** Giao diện bo góc mượt mà, màu sắc chuẩn Hyundai (#002C6C Primary, #0072CE Accent, Dark Slate background).
4. **Không Dùng `--amend`:** Mọi commit là commit mới độc lập, tuyến tính và minh bạch.
5. **Zero Mutation Trong Phase 1:** Không can thiệp mã nguồn khi chưa hoàn tất phê duyệt tài liệu thiết kế.

---

## 5. Tiêu Chí Hoàn Thành Giai Đoạn 1 (Handshake 1)
- [x] Định vị chính xác tọa độ các file tác động trong codebase.
- [x] Xác định rõ ràng các use case chọn ảnh từ thư viện hoặc upload ảnh mới.
- [x] Phân rã 4 User Stories độc lập có thể kiểm chứng được.
- [ ] Trình báo cáo Checkpoint Phase 1 cho Nhà phát triển phê duyệt để chuyển sang Phase 2 (Architecture & Design).
