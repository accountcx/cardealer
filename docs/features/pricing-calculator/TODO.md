# 📝 TODO: Financial & Pricing Engine

- [x] **US-01: Rolling Cost Calculation**
  - [x] Định nghĩa cấu hình thuế phí theo tỉnh thành trong `packages/core/src/pricing/config.ts`.
  - [x] Xây dựng thuật toán `calculateRollingCost` trong `packages/core/src/pricing/calculate-rolling-cost.ts`.
  - [x] Viết unit tests kiểm tra độ chính xác và biên âm trong `packages/core/src/__tests__/pricing.test.ts`.
  - [x] Xây dựng giao diện tính lăn bánh trên Storefront `/gia-lan-banh`.

- [x] **US-02: Installment Schedule Generator**
  - [x] Xây dựng thuật toán `calculateInstallment` dư nợ giảm dần trong `packages/core/src/pricing/calculate-installment.ts`.
  - [x] Bổ sung hàm format tiền tệ `formatVND` và `formatVNDShort` trong `packages/core/src/formatters/currency.ts`.
  - [x] Viết unit tests cho bảng tính trả góp trong `packages/core/src/pricing/__tests__/pricing-engine.test.ts`.
  - [x] Tích hợp thanh trượt và lịch trả nợ trên Storefront `/tra-gop`.
