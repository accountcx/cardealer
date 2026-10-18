# FE Integration Guide: Pricing & Lead Engine (Phase 3)

> **Feature**: `EPIC-PHASE-3-PRICING-LEAD`  
> **Target Applications**: `apps/storefront` (Khách hàng) & `apps/admin` (Nhân viên kinh doanh / CRM)  
> **Status**: Ready for Implementation (Option 1 - 2-Step Soft-Gate Funnel)  
> **Reference Model**: `fe-cardealer/app/components/calculator/SmartCalculator.tsx`

---

## 1. UI/UX Kiến Trúc Thành Phần (Component Hierarchy)

### 1.1 Storefront (`apps/storefront`)
```
apps/storefront/
├── app/
│   ├── gia-lan-banh/
│   │   ├── page.tsx                     # SSR Page: SEO Metadata, JSON-LD Schema, fetch cars & contact settings
│   │   └── loading.tsx                  # Skeleton loader for SSR
│   └── tra-gop/
│       └── page.tsx                     # Installment Calculator Page (optional redirect/tab)
└── components/
    └── calculator/
        ├── SmartCalculator.tsx          # Master State Container ('input' | 'gate' | 'success')
        ├── CalculatorProgressBar.tsx    # Bước 1/2 (50%) -> Bước 2/2 (100%)
        ├── CarSelectorForm.tsx          # State 'input': Dropdowns Car, Version, Province + CTA Button
        ├── RollingCostBreakdown.tsx     # State 'gate' & 'success': Total price + Breakdown Table with conditional `blur-sm`
        ├── LeadCaptureGateCard.tsx      # State 'gate': Yellow warning notice, Name/Phone inputs, Submit CTA
        ├── LeadSuccessBanner.tsx        # State 'success': Green alert, Hotline & Zalo quick connect
        ├── InstallmentEstimatorTab.tsx  # Installment monthly payment simulation sub-card
        └── FAQAccordion.tsx             # SEO & User Education Accordion (Hỏi đáp giá lăn bánh)
```

### 1.2 Admin CRM (`apps/admin`)
```
apps/admin/
├── app/
│   └── (dashboard)/
│       └── leads/
│           ├── page.tsx                 # Leads CRM Datatable (Server/Client Hybrid)
│           └── loading.tsx              # Skeleton table
└── components/
    └── leads/
        ├── LeadFilterBar.tsx            # Search by phone/name, Filter by Status, Date Range
        ├── LeadTable.tsx                # Data table: ID, Customer, Phone, Car Version, Source, Status, CreatedAt
        ├── LeadStatusBadge.tsx          # Badges: new (blue-glow), contacted (indigo), converted (emerald), cancelled (zinc)
        ├── LeadDetailDrawer.tsx         # Sheet / Drawer: View customer details, edit notes, change status
        └── LeadQuickStatusSelect.tsx    # Direct inline status switcher with optimistic update
```

---

## 2. Storefront Smart Calculator UX Specification

### 2.1 Funnel State Flow & Framer Motion Specs
Hệ thống chuyển đổi qua 3 trạng thái mượt mà thông qua `framer-motion` `AnimatePresence`:

```typescript
type CalculatorState = 'input' | 'gate' | 'success';
```

| State | Giao diện hiển thị | Animation | Trigger chuyển tiếp |
| :--- | :--- | :--- | :--- |
| **`input`** | • Progress Bar 50%<br>• Dropdown Dòng Xe & Phiên Bản (dynamic)<br>• Dropdown Tỉnh/Thành<br>• CTA "TÍNH GIÁ LĂN BÁNH" | `initial={{ opacity: 0, x: -20 }}`<br>`animate={{ opacity: 1, x: 0 }}`<br>`exit={{ opacity: 0, x: 20 }}` | Click CTA sau khi form hợp lệ và đã chọn phiên bản có giá |
| **`gate`** | • Progress Bar 100%<br>• Tổng giá lăn bánh (Font size 4xl-5xl, Bold, Brand Navy)<br>• Bảng chi tiết 6 khoản phí bị **MỜ (`blur-sm select-none`)**<br>• Khung cảnh báo ưu đãi thực tế (Yellow warning card)<br>• Form Họ Tên + SĐT (10 số) + CTA "XEM GIÁ LĂN BÁNH THỰC TẾ" | `initial={{ opacity: 0, x: 20 }}`<br>`animate={{ opacity: 1, x: 0 }}`<br>`exit={{ opacity: 0, x: -20 }}` | Submit Lead thành công qua `POST /api/leads` |
| **`success`** | • Banner Xanh Lá: "Đã mở khóa toàn bộ bảng chi phí"<br>• Bảng chi tiết 6 khoản phí hiển thị **RÕ NÉT (`blur-none`)**<br>• 2 Nút liên hệ ưu đãi độc quyền: Gọi Hotline & Nhắn Zalo | `initial={{ opacity: 0, scale: 0.95 }}`<br>`animate={{ opacity: 1, scale: 1 }}` | User xem xong hoặc bấm tính xe khác |

---

### 2.2 Design Tokens & CSS Classes

```css
/* Core Brand Tokens */
:root {
  --color-brand-navy: #002C6C;     /* Hyundai Primary Navy */
  --color-brand-blue: #0072CE;     /* Hyundai Accent Blue */
  --color-brand-red: #E53935;      /* High Conversion Urgency Red */
  --color-accent-gold: #F59E0B;    /* Discount/Offer Alert */
  --color-success: #10B981;        /* Lead Unlocked Success */
}
```

#### Blur & Unblur Transitions:
```tsx
// Bảng chi phí khi ở State 'gate':
<span className={cn(
  "font-semibold text-gray-900 transition-all duration-500",
  state === 'gate' ? "blur-sm select-none" : "blur-none"
)}>
  {calculatedResult.phiTruocBa.toLocaleString('vi-VN')} VNĐ
</span>
```

#### Sticky Mobile Action Bar:
Trên màn hình nhỏ (`< 768px`), nút CTA luôn ghim cố định ở đáy màn hình để tối ưu tỷ lệ nhấn:
```tsx
<button
  type="submit"
  disabled={!selectedVersionGia}
  className="w-full py-4 px-6 rounded-lg font-bold text-white transition-all duration-300 shadow-lg sticky bottom-4 md:static z-40 bg-[#002C6C] hover:bg-[#001D47] disabled:opacity-50"
>
  TÍNH GIÁ LĂN BÁNH
</button>
```

#### Warning Box (Kích thích để lại SĐT):
```tsx
<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
  <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
  <div className="text-sm text-amber-800 leading-relaxed">
    <strong>Lưu ý quan trọng:</strong> Giá hiển thị là giá niêm yết tạm tính theo quy định nhà nước, 
    <span className="font-bold underline text-amber-900"> CHƯA BAO GỒM khuyến mại tiền mặt & quà tặng phụ kiện</span> trong tháng của đại lý. 
    Để lại thông tin để chuyên viên gửi báo giá lăn bánh thực tế ưu đãi nhất!
  </div>
</div>
```

---

### 2.3 Form Validation Specs (Zero-Cost Client Rule)
Khách hàng không phải chờ mã OTP SMS, nhưng Form kiểm tra nghiêm ngặt 10 số di động Việt Nam trước khi gửi:

```typescript
import { z } from 'zod';

export const leadCaptureFormSchema = z.object({
  hoTen: z
    .string()
    .trim()
    .min(2, 'Họ và tên tối thiểu 2 ký tự')
    .max(50, 'Họ tên không vượt quá 50 ký tự'),
  soDienThoai: z
    .string()
    .trim()
    .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không hợp lệ (Phải là 10 số đầu 03, 05, 07, 08, 09)')
    .refine((val) => {
      const invalidNumbers = ['0900000000', '0912345678', '0988888888', '0999999999', '0911111111'];
      return !invalidNumbers.includes(val);
    }, 'Vui lòng nhập số điện thoại đang hoạt động'),
  thoiGianLienHe: z.enum(['Sáng (8h - 12h)', 'Chiều (13h - 18h)', 'Bất kỳ']).optional().default('Bất kỳ'),
  note: z.string().max(200).optional(),
});
```

---

### 2.4 State Persistence (F5 Recovery Pattern)
Tránh mất dữ liệu khi người dùng vô tình tải lại trang (`F5`):
```typescript
const STORAGE_KEY = 'car_pricing_lead_session';

// Khi state thay đổi -> Lưu vào sessionStorage
useEffect(() => {
  if (state === 'success' && calculatedResult) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      state,
      dongXe: watchedDongXe,
      phienBan: watchedPhienBan,
      tinhThanh: watchedTinhThanh,
      calculatedResult,
    }));
  }
}, [state, calculatedResult]);

// Khởi tạo -> Đọc từ sessionStorage nếu có
useEffect(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.state === 'success') {
        setState('success');
        setCalculatedResult(data.calculatedResult);
      }
    } catch (e) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}, []);
```

---

## 3. Admin CRM Dashboard Specification (`apps/admin`)

### 3.1 Giao diện Bảng Quản trị Leads (`/admin/leads`)
Bảng quản lý Lead được tối ưu cho nhân viên tiếp nhận và xử lý nhanh trong 5 phút đầu tiên:

| Cột (Column) | Kiểu dữ liệu | Render Component & Hành vi |
| :--- | :--- | :--- |
| **Khách hàng** | `hoTen` | Chữ đậm, hiển thị kèm icon người dùng |
| **Số điện thoại** | `phone` | Link `tel:{phone}`, có nút bấm Copy nhanh và nút Mở Zalo chat (`https://zalo.me/{phone}`) |
| **Dòng xe quan tâm** | `metadata.carModel` & `carVersion` | Huy hiệu (Badge) xám nhạt kèm giá niêm yết |
| **Địa phương** | `metadata.province` | Huy hiệu tỉnh thành (Vinh / Huyện khác) |
| **Trạng thái** | `status` | Dropdown chuyển trạng thái nhanh (`new`, `contacted`, `converted`, `cancelled`) |
| **Thời gian tạo** | `createdAt` | Relative time (ví dụ: *5 phút trước*, *Hôm nay 08:30*) |
| **Thao tác** | Action buttons | Nút Xem chi tiết (Mở Drawer xem lịch sử ghi chú) |

### 3.2 Lead Status Badges
```tsx
export function LeadStatusBadge({ status }: { status: 'new' | 'contacted' | 'converted' | 'cancelled' }) {
  const configs = {
    new: {
      label: 'Mới nhận',
      className: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
      dot: 'bg-blue-500',
    },
    contacted: {
      label: 'Đã liên hệ',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
    },
    converted: {
      label: 'Thành công',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      label: 'Hủy / Sai số',
      className: 'bg-gray-100 text-gray-600 border-gray-200',
      dot: 'bg-gray-400',
    },
  };

  const config = configs[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', config.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
```

### 3.3 Lead Quick Status Switcher (Optimistic Update)
Cho phép Sales đổi trạng thái ngay trên bảng mà không cần tải lại trang:
```tsx
export function LeadQuickStatusSelect({ leadId, currentStatus, onStatusChange }: LeadQuickStatusProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (newStatus: LeadStatus) => {
    setStatus(newStatus); // Optimistic
    setIsUpdating(true);
    try {
      await updateLeadStatusAction(leadId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      onStatusChange?.(newStatus);
    } catch (error) {
      setStatus(currentStatus); // Revert on failure
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select value={status} onValueChange={handleChange} disabled={isUpdating}>
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">Mới nhận</SelectItem>
        <SelectItem value="contacted">Đã liên hệ</SelectItem>
        <SelectItem value="converted">Thành công</SelectItem>
        <SelectItem value="cancelled">Hủy / Sai số</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

---

## 4. Error States & Feedback UX

| Kịch bản lỗi | Phản hồi giao diện (Storefront) | Phản hồi giao diện (Admin) |
| :--- | :--- | :--- |
| **Số điện thoại không đúng chuẩn** | Hiển thị thông báo đỏ trực tiếp dưới ô nhập: *"Vui lòng nhập 10 chữ số hợp lệ bắt đầu bằng 03, 05, 07, 08, 09"*, rung nhẹ ô input (shake effect). | N/A |
| **Gửi form quá nhanh (Rate-limit 429)** | Modal nhẹ hoặc Toast thông báo: *"Bạn đã yêu cầu báo giá gần đây. Chuyên viên sẽ gọi điện cho bạn trong giây lát!"* | N/A |
| **Mất kết nối mạng (Offline)** | Toast cảnh báo màu cam: *"Mất kết nối Internet. Vui lòng kiểm tra lại đường truyền."* Không reset dữ liệu đã nhập. | Toast cảnh báo lỗi khi lưu ghi chú hoặc đổi trạng thái. |
| **Không tìm thấy xe / phiên bản** | Dropdown phiên bản tự động vô hiệu hóa (`disabled`) kèm chữ mờ: *"-- Vui lòng chọn xe trước --"*. | N/A |

---

## 5. SEO & Social Metadata Spec (`apps/storefront/app/gia-lan-banh/page.tsx`)

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bảng Giá Lăn Bánh Xe Hyundai Mới Nhất 2026 | Dự Toán Chi Phí',
  description: 'Công cụ tính giá lăn bánh xe ô tô Hyundai tự động: Grand i10, Accent, Creta, Tucson, Santa Fe. Chi tiết phí trước bạ 10%, biển số, đăng kiểm, bảo hiểm.',
  openGraph: {
    title: 'Tính Giá Lăn Bánh Xe Hyundai Nhanh Chóng & Chính Xác',
    description: 'Dự toán trọn gói các khoản phí lăn bánh tại Vinh và Nghệ An. Nhận bảng chi phí và ưu đãi đặc quyền từ đại lý!',
    type: 'website',
  },
};
```

JSON-LD Schema (`SoftwareApplication` / `FinanceApplication`) nhúng trực tiếp vào thẻ `<script>` ở server component để Google đánh chỉ mục rich snippets.
