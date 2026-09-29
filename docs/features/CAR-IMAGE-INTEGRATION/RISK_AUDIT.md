# 🛡️ RISK AUDIT & IMPACT ANALYSIS: CHỌN & TẢI ẢNH CHO QUẢN TRỊ XE

> **Tuân thủ:** `universal-agentic-workflow.xml` - **Phase 3.1: Risk & Impact Analysis**  
> **Role / Active Skills:** `dependency-graph-analyzer`  
> **Tài liệu tham chiếu:** [`FLOW.md`](./FLOW.md), [`FE_INTEGRATION_GUIDE.md`](./FE_INTEGRATION_GUIDE.md)

---

## 1. Bản Đồ Vùng Ảnh Hưởng (Blast Radius)

```
[TabGeneralInfo.tsx] ──> [MediaPickerModal.tsx] ──> [Cloudinary & Postgres]
        │
[TabColors.tsx]      ──> [MediaPickerModal.tsx] ──> [Cloudinary & Postgres]
        │
[CarFormModal.tsx]   ──> [MediaPickerModal.tsx] ──> [Cloudinary & Postgres]
```

- **Mức độ ảnh hưởng:** 🟡 LOW / MEDIUM.
- **Rủi ro hồi quy (Regression Risk):** Cực kỳ thấp do chỉ bổ sung phương thức chọn/tải ảnh qua modal, vẫn giữ nguyên cơ chế state setter (`setAnhDaiDienUrl`, `updateColorImage`) và cho phép dán URL thủ công như trước.

---

## 2. Ma Trận Đánh Giá Rủi Ro & Biện Pháp Kiểm Soát (Mitigation Matrix)

| Mã Rủi Ro | Phân Loại Rủi Ro | Mức Độ | Tác Động Tiềm Ẩn | Biện Pháp Kiểm Soát & Phòng Ngừa |
| :---: | :--- | :---: | :--- | :--- |
| **R-01** | Trùng lặp hoặc gán nhầm màu/phiên bản | 🟡 Medium | Gán nhầm ảnh màu đỏ sang màu trắng hoặc từ bản Tiêu chuẩn sang Đặc biệt | Đóng gói context state rõ ràng (`versionId`, `colorId`, `colorName`) khi mở modal trong `TabColors.tsx`. |
| **R-02** | Vỡ layout khi ảnh có tỉ lệ dị thường | 🟡 Low | Ảnh xe quá dài hoặc méo mó làm biến dạng Card màu | Dùng container cố định `aspect-16/9` kèm `object-contain` và padding nhẹ. |
| **R-03** | Vi phạm Zero Raw HTML Controls | 🔴 High | Sử dụng nhầm `<button>` hoặc `<input>` trần | Rà soát nghiêm ngặt bằng công cụ tự động `grep -rnE '^\s*<(button|input|select)[ >]'` trong script kiểm chứng. |
| **R-04** | Lỗi render khi URL ảnh không tồn tại | 🟡 Low | Trình duyệt hiển thị icon ảnh gãy | Bổ sung handler `onError` ẩn ảnh lỗi và fallback sạch sẽ. |

---

## 3. Kế Hoạch Quay Lui (Rollback Strategy)

Nếu phát hiện bất kỳ lỗi hồi quy nghiêm trọng nào:
- Mọi thay đổi đều được phân rã thành các commit độc lập theo từng Unit.
- Có thể hoàn tác (revert) từng commit cục bộ mà không ảnh hưởng đến database hay các phân hệ khác.
