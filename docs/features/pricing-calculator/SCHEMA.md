# 🗄️ SCHEMA: Financial & Pricing Engine

> **Module:** `pricing-calculator`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), `packages/types/src/index.ts`, `packages/core/src/pricing/config.ts`  

---

## 1. Mô Hình Kiểu Dữ Liệu TypeScript & Schemas

### 🔹 Input & Output Chi Phí Lăn Bánh (Rolling Cost Contract)
```typescript
export interface RollingCostCalculationInput {
  giaXe: number;
  tinhThanhCode: string; // 'nghe-an-vinh' | 'nghe-an-huyen' | 'ha-tinh' | 'ha-noi' | 'tp-hcm'
  soChoNgoi?: number;
  hasBaoHiemThanVo?: boolean;
  hasPhiDichVu?: boolean;
}

export interface RollingCostBreakdown {
  giaXe: number;
  tinhThanhCode: string;
  tinhThanhName: string;
  lePhiTruocBa: number;       // 10% hoặc 12%
  phiBienSo: number;          // 200k - 20 triệu
  phiDangKiem: number;        // 90.000đ
  phiBaoTriDuongBo: number;   // 1.560.000đ (12 tháng)
  baoHiemTNDS: number;        // 480.700đ (<=5 chỗ) hoặc 873.400đ (>5 chỗ)
  baoHiemThanVo: number;      // 1.3% giá xe
  phiDichVuDangKy: number;    // Phí trọn gói
  tongChiPhiLanBanh: number;  // Tổng cộng toàn bộ các khoản
}
```

### 🔹 Bảng Cấu Hình Biểu Phí Nhà Nước (Government Rate Matrix)
```typescript
export const FIXED_GOVERNMENT_RATES = {
  phiDangKiem: 90_000,
  phiBaoTriDuongBo12Thang: 1_560_000,
  phiTNDS_duoi_6_cho: 480_700,
  phiTNDS_tren_6_cho: 873_400,
  tyLeBaoHiemThanVo: 0.013, // 1.3% giá niêm yết
  phiDichVuDangKyMacDinh: 2_500_000,
} as const;
```

---

## 2. Ma Trận Chuyển Đổi Trạng Thái Bộ Tính (State Transition Matrix)

| Trạng Thái Ban Đầu | Hành Động Kích Hoạt | Trạng Thái Đích | Điều Kiện Hợp Lệ |
| :--- | :--- | :--- | :--- |
| `uninitialized` | Tải dữ liệu dòng xe | `ready` | Xe có ít nhất 1 phiên bản với giá $> 0$ |
| `ready` | Thay đổi tỉnh thành / % trả trước | `calculating` | Input là số dương hợp lệ |
| `calculating` | Tính toán xong | `result_displayed` | Kết quả không chứa số âm hoặc NaN |
| `result_displayed` | Bấm "Nhận tư vấn" | `lead_modal_opened` | Chuyển dữ liệu dự toán sang `lead-management` |
