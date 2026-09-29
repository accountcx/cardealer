# 📝 ROADMAP & TODO: TÍCH HỢP CHỌN & TẢI ẢNH CHO QUẢN TRỊ XE

> **Tuân thủ:** `universal-agentic-workflow.xml` - **Phase 4: Atomic Execution & Verification**  
> **Role / Active Skills:** `boilerplate-scaffolder`, `fullstack-dev-executor`  
> **Trạng thái:** 🚀 Ready for Execution

---

## 📌 Danh Sách Các Đơn Vị Nguyên Tử (Micro-Units)

| Unit ID | File(s) Tác Động | Risk Tier | Coupled Unit? | Trạng Thái | Mô Tả & Tiêu Chí Nghiệm Thu |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **U-01** | `apps/admin/app/cars/[slug]/components/TabGeneralInfo.tsx` | 🟡 LOW | **Không** | ✅ COMPLETED | Tích hợp `MediaPickerModal` vào màn hình sửa xe (Tab Thông tin chung), nút "Chọn Từ Thư Viện / Tải Mới", nút xóa nhanh `X`, và thumbnail preview. |
| **U-02** | `apps/admin/app/cars/[slug]/components/TabColors.tsx` | 🟠 MEDIUM | **Không** | ⏳ PENDING | Tích hợp `MediaPickerModal` vào màn hình cấu hình màu sắc xe & mâm, lưu đúng ngữ cảnh `(versionId, colorId)`, thumbnail preview ảnh màu xe. |
| **U-03** | `apps/admin/app/cars/components/CarFormModal.tsx` | 🟡 LOW | **Không** | ⏳ PENDING | Rà soát và hoàn thiện trải nghiệm chọn & tải ảnh đại diện trong modal tạo xe mới, đảm bảo tính nhất quán UI/UX với màn hình sửa. |
| **U-04** | `scripts/verify_car_image_integration.sh` | 🟡 LOW | **Không** | ⏳ PENDING | Xây dựng kịch bản kiểm chứng tự động toàn diện kiểm tra typecheck, design system và tích hợp của cả 3 điểm chạm. |

---

## 🔒 Quy Định Thực Thi Bắt Buộc
1. Thực thi theo từng Unit độc lập, không gộp bước.
2. Kiểm tra type-check (`pnpm check-types`) ngay sau mỗi Unit.
3. Commit Git độc lập, tuyến tính cho từng Unit (không dùng `--amend`).
4. Ghi nhận nhật ký chi tiết vào `EXECUTION_LOG.md`.
