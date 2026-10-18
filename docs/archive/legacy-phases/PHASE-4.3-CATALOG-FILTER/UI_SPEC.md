# 🎨 UI & Design System Specification: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (`/xe`)

## 1. Design Tokens & Bộ Nhận Diện Thương Hiệu Showroom

### 1.1. Bảng Màu Chuẩn (Color Palette Tokens)
* **Primary Brand Navy:** `#002C6C` (`text-[#002C6C]`, `bg-[#002C6C]`) — Màu xanh thương hiệu Hyundai toàn cầu, biểu trưng cho sự uy tín, vững chãi và cao cấp.
* **Electric Accent Blue:** `#0072CE` (`text-[#0072CE]`, `bg-[#0072CE]`, `border-[#0072CE]`) — Màu xanh năng động, dùng cho các điểm nhấn tương tác, nút bấm chính, tab active.
* **Hover Accent Blue:** `#005BA4` — Trạng thái hover của các nút bấm và liên kết.
* **Neutral Backgrounds & Borders:**
  * Background trang: `bg-slate-50` (sáng sủa, tôn dáng xe).
  * Filter Bar container: `bg-slate-900/95 backdrop-blur-xl border-slate-800` (đồng bộ phễu lọc tại trang chủ).
  * Card xe: `bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-2xl hover:shadow-slate-200/80`.
* **Khuyến mãi & Điểm nhấn:**
  * Promotion Ribbon: `bg-gradient-to-r from-rose-600 to-red-600 text-white` kèm icon `Tag text-amber-300`.
  * Trả trước ưu đãi: `bg-sky-50/90 border-sky-100 text-[#002C6C]`.

### 1.2. Thang Đo Kích Thước & Spacing (Tailwind Standard Scale)
* **Touch Targets:** Chuẩn hóa `h-11` (44px) cho toàn bộ các nút bấm và tab lọc nhằm thỏa mãn chuẩn tiếp cận di động Google/Apple.
* **Bo góc (Border Radius):** `rounded-xl` (12px) cho nút bấm/tab, `rounded-2xl` (16px) cho container nhỏ, `rounded-3xl` (24px) cho Card xe và Filter Bar.
* **Hạn chế Arbitrary Values:** 100% khoảng cách và font size tuân thủ thang đo Tailwind tiêu chuẩn (`p-4`, `p-6`, `gap-2.5`, `gap-6`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`).

---

## 2. Đặc Tả Chi Tiết Từng Component

### 2.1. Khối Header Danh Mục (`CatalogHeaderSection`)
* **Breadcrumbs:** `Trang chủ > Danh mục dòng xe` (Kế thừa từ `apps/web/components/layout/Breadcrumbs.tsx`).
* **Tiêu đề chính (`h1`):** Font chữ đậm, kích thước `text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900`.
* **Huy hiệu số lượng:** Huy hiệu bo tròn góc phải: `px-3.5 py-1.5 rounded-full bg-[#0072CE]/10 text-[#0072CE] text-xs font-bold border border-[#0072CE]/20`.

### 2.2. Bộ Lọc Đa Chiều (`CatalogFilterBar`)
* **Bao bọc (Container):** Card nền đen bóng kính `bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl`.
* **Phần 1 - Tabs Phân Khúc Xe:**
  * Danh sách: `Tất Cả`, `Sedan`, `SUV`, `MPV`, `Hatchback`, `Xe Điện (EV)`.
  * Trạng thái Active: `bg-[#0072CE] text-white border-[#0072CE] shadow-lg shadow-[#0072CE]/30 font-bold`.
  * Trạng thái Inactive: `bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-800`.
  * Responsive: Trên Mobile hiển thị thanh cuộn ngang `overflow-x-auto snap-x scrollbar-none`, trên Desktop xếp dạng Flexwrap/Grid.
* **Phần 2 - Mốc Ngân Sách Đầu Tư:**
  * Danh sách: `Tất Cả Mức Giá`, `Dưới 500 triệu`, `500 - 700 triệu`, `700 triệu - 1 tỷ`, `Trên 1 tỷ`.
  * Nút bấm có icon `DollarSign` và dấu tích `Check` khi active.

### 2.3. Thẻ Xe Thông Minh (`SmartCarCard`)
* **Khung thẻ:** `flex flex-col justify-between rounded-3xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`.
* **Khu vực Ảnh xe:**
  * Tỷ lệ vàng `aspect-[16/10]` với nền gradient nhẹ `bg-gradient-to-b from-slate-50 to-slate-100/90`.
  * Ảnh nền chuẩn `bg-contain bg-center bg-no-repeat` có hiệu ứng zoom nhẹ `group-hover:scale-105 motion-reduce:transform-none`.
  * Huy hiệu phân khúc: Góc trên bên phải, nền kính `bg-white/95 text-slate-700 text-[11px] font-bold uppercase tracking-wider`.
* **Ruy-băng Khuyến mãi:** Nằm đè nhẹ ở mép dưới ảnh (`-mt-3.5`), gradient đỏ `from-rose-600 to-red-600`, icon `Tag`, chữ trắng nổi bật.
* **Thông số then chốt (Quick Specs Pills):**
  * Hàng 3 icon nhỏ tinh tế phía dưới tên xe:
    * Số chỗ ngồi: Icon `Users w-3.5 h-3.5` + text (vd: `5 chỗ`)
    * Nhiên liệu: Icon `Fuel w-3.5 h-3.5` + text (vd: `Xăng / Dầu`)
    * Phiên bản: Icon `Layers w-3.5 h-3.5` + text (vd: `4 phiên bản`)
* **Khối giá niêm yết:**
  * `minPrice === maxPrice`: Hiển thị 1 giá (vd: `569 Triệu`).
  * `minPrice < maxPrice`: Hiển thị khoảng giá (vd: `769 Tr - 919 Tr`).
* **Huy hiệu trả trước tối thiểu:** Khung nền xanh nhạt `bg-sky-50/90 border border-sky-100 p-3 rounded-2xl` hiển thị: `"Trả trước từ: [X] triệu"`.
* **Hành động kép (Dual CTA Buttons):**
  * Nút 1: `"Dự Toán Lăn Bánh"` ➡️ `Button variant="default"` màu xanh gradient `#0072CE` to `#005BA4`, chuyển tới `/gia-lan-banh?xe=[slug]`.
  * Nút 2: `"Chi Tiết"` ➡️ Link viền nhẹ `bg-slate-100 hover:bg-slate-200 text-slate-700`, chuyển tới `/xe/[slug]`.

### 2.4. Trạng Thái Rỗng Khi Không Khớp Xe (`CatalogEmptyState`)
* Icon minh họa: `SearchX` hoặc `Car` kích thước lớn `w-14 h-14 text-slate-400`.
* Tiêu đề: `"Không tìm thấy dòng xe phù hợp với tiêu chí lọc"`.
* Phụ đề: `"Vui lòng điều chỉnh lại mức ngân sách hoặc chuyển sang phân khúc xe khác để khám phá."`.
* Nút CTA: `"Xóa Bộ Lọc & Xem Tất Cả Xe"` (Click vào sẽ reset `segment='all'` và `price='all'`).

---

## 3. Quy Chuẩn 4 Trạng Thái UI (Mandatory 4-State UI Pattern)

| Trạng thái | Biểu hiện Giao diện | Cách Thức Triển Khai |
| :--- | :--- | :--- |
| ⏳ **Loading State** | Hiển thị 6-8 khung thẻ xe Skeleton bóng mờ | Dùng `@cardealer/ui` Skeleton với kích thước đúng tỷ lệ `aspect-[16/10]` và các thanh placeholders. |
| 📭 **Empty State** | Không có xe nào sau khi lọc | Render `CatalogEmptyState` với thông điệp rõ ràng và nút phục hồi. |
| ⚠️ **Error State** | Mất kết nối Backend hoặc API 500 | Card cảnh báo màu vàng/đỏ nhẹ nhàng kèm hotline tư vấn trực tiếp và nút tải lại trang. |
| ✅ **Data State** | Hiển thị lưới xe từ 1 đến N phần tử | Grid responsive: 1 cột (Mobile), 2 cột (Tablet), 3 hoặc 4 cột (Desktop lớn). |

---

## 4. Tiêu Chuẩn Tiếp Cận WCAG AAA & Animation Safety

* **Reduced Motion:** Tất cả chuyển động hover scale của ảnh xe, hiệu ứng click nút đều gắn `motion-reduce:transition-none motion-reduce:transform-none`.
* **Focus Visible:** Mọi nút bấm và tab lọc đều có viền nét khi điều hướng bằng bàn phím (`focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none`).
* **Tương phản Màu sắc (Contrast Ratio):** Tỷ lệ tương phản chữ trên nền tối thiểu đạt `4.5:1` cho văn bản thông thường và `3:1` cho tiêu đề lớn.
