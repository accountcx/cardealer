# 🎨 FRONTEND INTEGRATION GUIDE: Financial & Pricing Engine

> **Module:** `pricing-calculator`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`API_SPEC.md`](./API_SPEC.md)  

---

## 1. Cấu Trúc Thành Phần Giao Diện (Component Hierarchy)

```
apps/web/app/
├── gia-lan-banh/
│   ├── page.tsx                     # Trang tính dự toán lăn bánh độc lập
│   └── components/
│       ├── SmartCalculator.tsx      # Bộ tính lăn bánh 3 bước (Chọn xe -> Chọn tỉnh -> Kết quả)
│       ├── FeeBreakdownTable.tsx    # Bảng bóc tách 6 loại thuế phí chi tiết
│       └── ProvinceDropdown.tsx     # Bộ chọn tỉnh thành (Nghệ An, Hà Tĩnh, Hà Nội...)
│
├── tra-gop/
│   ├── page.tsx                     # Trang bảng tính mua xe trả góp ngân hàng
│   └── components/
│       ├── TraGopCalculator.tsx     # Thanh trượt % trả trước & số năm vay
│       └── PaymentScheduleTable.tsx # Bảng chi tiết gốc lãi 12 - 96 tháng
```

---

## 2. Hệ Thống Biểu Tượng & Design Tokens

- **Icon Set (lucide-react):**
  - Máy tính / Dự toán: `<Calculator className="w-5 h-5 text-sky-600" />`
  - Tiền tệ / Tài chính: `<Banknote className="w-4 h-4 text-emerald-600" />`
  - Địa điểm / Tỉnh thành: `<MapPin className="w-4 h-4 text-slate-500" />`
  - Lịch trả nợ: `<Calendar className="w-4 h-4 text-slate-500" />`
  - Khiên bảo hiểm: `<ShieldCheck className="w-4 h-4 text-sky-500" />`
- **Tailwind Tokens:**
  - Highlighting Row: `bg-sky-50/50 dark:bg-sky-950/20 font-semibold text-sky-900 dark:text-sky-200`
  - Total Price Banner: `bg-gradient-to-r from-sky-900 to-slate-900 text-white p-6 rounded-2xl`
  - Currency Accent: `font-bold text-sky-600 tracking-tight`

---

## 3. Ma Trận 4 Trạng Thái Giao Diện (4-State UI Matrix)

| Trạng Thái | Điều Kiện Kích Hoạt | Hành Vi Giao Diện | Thiết Kế Fallback |
| :--- | :--- | :--- | :--- |
| **Loading** | Đang tải danh sách xe hoặc tỷ giá ngân hàng | Hiển thị Skeleton thanh trượt và bảng mô phỏng | `<div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl h-48 w-full" />` |
| **Empty** | Chưa chọn dòng xe để tính toán | Hiển thị lời nhắc thân thiện yêu cầu chọn xe | `<div className="py-10 text-center text-slate-500"><p>Vui lòng chọn dòng xe và phiên bản để xem dự toán lăn bánh.</p></div>` |
| **Error** | Nhập giá trị xe âm hoặc tham số không hợp lệ | Cảnh báo viền đỏ và hướng dẫn giá trị tối thiểu | `<div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">Vui lòng nhập giá trị xe hợp lệ (lớn hơn 0)</div>` |
| **Success** | Tính toán thành công | Cập nhật số tiền tức thì với hiệu ứng chuyển số mượt mà | Render bảng `FeeBreakdownTable` đầy đủ 6 khoản mục và tổng chi phí |

---

## 4. Chuẩn Mực Triển Khai Mã Nguồn
- Bắt buộc sử dụng **Named Export** (ví dụ: `export function SmartCalculator(...)`).
- 100% tuân thủ **Tailwind Spacing Scale** tiêu chuẩn (tránh các arbitrary values tự do).
