# 🧪 TEST PLAN: Financial & Pricing Engine

> **Module:** `pricing-calculator`  
> **Căn cứ:** [`BACKLOG.md`](./BACKLOG.md), [`RISK_AUDIT.md`](./RISK_AUDIT.md)  

---

## 1. Ma Trận Kiểm Thử Tự Động (Automated Test Cases)

| Mã Test | Loại Kiểm Thử | Tệp Kiểm Thử / Vị Trí | Kịch Bản & Kỳ Vọng Kiểm Thử | Trạng Thái |
| :---: | :---: | :--- | :--- | :---: |
| **TC-01** | Unit Test | `packages/core/src/__tests__/pricing.test.ts` | Tính lăn bánh TP. Vinh chính xác theo 6 khoản mục, kết quả khớp 100% | ✅ PASSED |
| **TC-02** | Unit Test | `packages/core/src/__tests__/pricing.test.ts` | Chặn `giaXe <= 0` ném ngoại lệ `RangeError` | ✅ PASSED |
| **TC-03** | Unit Test | `packages/core/src/pricing/__tests__/pricing-engine.test.ts` | Bảng tính trả góp dư nợ giảm dần: Gốc cố định, lãi giảm dần từng tháng | ✅ PASSED |
| **TC-04** | Unit Test | `packages/core/src/formatters/currency.ts` | Format tiền tệ `formatVND`: `1250000000` $\rightarrow$ `"1.250.000.000 ₫"` | ✅ PASSED |
| **TC-05** | Unit Test | `packages/core/src/formatters/currency.ts` | Format rút gọn `formatVNDShort`: `1250000000` $\rightarrow$ `"1 tỷ 250 triệu"` | ✅ PASSED |
| **TC-06** | E2E Browser | `apps/web/app/gia-lan-banh/page.tsx` | Khách chọn xe và đổi tỉnh thành $\rightarrow$ tổng số tiền lăn bánh tự cập nhật tức thì | ✅ PASSED |

---

## 2. Lệnh Kiểm Chứng Bằng Máy (Deterministic Verification)

```bash
# 1. Chạy toàn bộ Unit Tests của Financial Engine
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
pnpm --filter @cardealer/core test

# 2. Kiểm tra tính đúng đắn của kiểu dữ liệu TypeScript
pnpm check-types
```
