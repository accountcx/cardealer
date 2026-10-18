# 🔄 FLOW: Financial & Pricing Engine

> **Module:** `pricing-calculator`  
> **Tài liệu tham chiếu:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md)  

---

## 1. Sơ Đồ Trạng Thái Luồng Tính Toán (Calculator Flow State Machine)

```mermaid
stateDiagram-v2
    [*] --> InitCalculator : Chọn dòng xe & phiên bản
    InitCalculator --> Calculating : Thay đổi tỉnh thành / % Trả trước
    Calculating --> ResultReady : Hoàn tất tính toán
    ResultReady --> Calculating : Điều chỉnh tham số mới
    ResultReady --> LeadGateModal : Bấm "Nhận Báo Giá Ưu Đãi"
    LeadGateModal --> [*] : Chuyển thông tin sang lead-management
```

---

## 2. Sequence Diagram: Luồng Tính Phí Lăn Bánh Client-Side (Zero Latency)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Storefront)
    participant CalculatorUI as SmartCalculator.tsx
    participant CoreEngine as @cardealer/core (Pure Function)

    Customer->>CalculatorUI: Chọn dòng xe "Hyundai Tucson" & phiên bản "2.0 Xăng Đặc Biệt"
    Customer->>CalculatorUI: Chọn địa phương: "Nghệ An - TP. Vinh"
    Customer->>CalculatorUI: Bật tùy chọn "Bảo hiểm thân vỏ 2 chiều"
    CalculatorUI->>CoreEngine: calculateRollingCost({ giaXe: 839000000, tinhThanhCode: 'nghe-an-vinh', soChoNgoi: 5, hasBaoHiemThanVo: true })
    CoreEngine->>CoreEngine: Áp dụng Math.round triệt tiêu sai số float
    CoreEngine-->>CalculatorUI: Trả về RollingCostBreakdown { lePhiTruocBa, phiBienSo, phiDangKiem, tongChiPhi... }
    CalculatorUI-->>Customer: Hiển thị bảng bóc tách chi phí & tổng số tiền lăn bánh
```

---

## 3. Sequence Diagram: Tính Lịch Trả Góp Ngân Hàng Hàng Tháng

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Storefront)
    participant TraGopUI as TraGopCalculator.tsx
    participant CoreEngine as @cardealer/core (calculateInstallment)

    Customer->>TraGopUI: Kéo thanh trượt: Trả trước 20% (168 triệu), Vay 5 năm (60 tháng), Lãi suất 8.5%
    TraGopUI->>CoreEngine: calculateInstallment({ giaXe: 839000000, tyLeTraTruoc: 0.2, soNamVay: 5, laiSuatNam: 8.5 })
    CoreEngine->>CoreEngine: Tính tiền vay gốc = 671.200.000đ
    CoreEngine->>CoreEngine: Tính tiền gốc hàng tháng = 671.200.000 / 60 = 11.186.667đ
    CoreEngine->>CoreEngine: Tính lãi tháng 1 = 671.200.000 * (8.5% / 12) = 4.754.333đ
    CoreEngine-->>TraGopUI: Trả về InstallmentResult { gocThangDau, laiThangDau, tongThangDau, lichTraNoChiTiet }
    TraGopUI-->>Customer: Hiển thị số tiền trả tháng đầu & bảng chi tiết 60 tháng
```
