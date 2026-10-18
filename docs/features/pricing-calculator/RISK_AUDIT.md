# ⚠️ RISK AUDIT: Financial & Pricing Engine

> **Module:** `pricing-calculator`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Phân Tích Bán Kính Tác Động (Blast Radius Analysis)

- **Các phân hệ phụ thuộc:**
  - `lead-management`: Tiếp nhận trường `estimatedTotal` từ kết quả tính lăn bánh hoặc trả góp khi khách hàng gửi Form báo giá.
  - `apps/web`: Tích hợp các widget tính toán trên trang chủ, trang chi tiết `/xe/[slug]`, trang `/gia-lan-banh` và `/tra-gop`.

---

## 2. Rà Soát Điểm Yếu An Ninh & Rủi Ro Tiềm Ẩn

| Mã Rủi Ro | Phân Loại | Kịch Bản Rủi Ro | Biện Pháp Phòng Ngừa Đã Thực Thi |
| :---: | :--- | :--- | :--- |
| **R-01** | Floating Point Drift | Sai số phép chia dấu phẩy động JavaScript làm sai lệch 1 đồng | Sử dụng `Math.round` trên từng bước nhân chia tỷ lệ trong `calculateRollingCost` và `calculateInstallment` |
| **R-02** | Negative / Zero Input | Khách nhập số âm hoặc số 0 làm hỏng bảng tính hoặc sinh số âm | Ném `RangeError` khi `giaXe <= 0` và fallback an toàn trên UI |
| **R-03** | Regulatory Tax Change | Nhà nước thay đổi mức lệ phí trước bạ (ví dụ: giảm 50%) | Bảng `PROVINCE_FEE_CONFIGS` tập trung tại một nơi duy nhất (`config.ts`), dễ dàng cập nhật mà không phải sửa logic |
| **R-04** | Division by Zero | Số năm vay bằng 0 gây chia cho 0 | Giới hạn `soNamVay` từ 1 đến 8 năm trong Zod Schema |

---

## 3. Kế Hoạch Phục Hồi & Rollback Khẩn Cấp (Rollback Strategy)

1. **Rollback thuật toán:** Thuật toán là hàm thuần túy (Pure Function) không trạng thái trong `@cardealer/core`, có thể rollback bằng git commit mà không ảnh hưởng cơ sở dữ liệu.
2. **Cập nhật biểu phí khẩn cấp:** Sửa đổi tỷ lệ thuế trong `packages/core/src/pricing/config.ts` và deploy lại hệ thống.
