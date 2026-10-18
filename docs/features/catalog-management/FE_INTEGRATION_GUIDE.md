# 🎨 FRONTEND INTEGRATION GUIDE: Catalog & Vehicle Specification Engine

> **Module:** `catalog-management`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`API_SPEC.md`](./API_SPEC.md)  

---

## 1. Cấu Trúc Thành Phần Giao Diện (Component Hierarchy)

```
apps/web/app/xe/
├── page.tsx                     # Server Component: Fetch danh sách xe & render filter
├── components/
│   ├── CatalogGrid.tsx          # Lưới danh sách xe (Responsive 1/2/3 cols)
│   ├── SegmentFilterBar.tsx     # Thanh lọc phân khúc (Sedan, SUV, MPV...)
│   └── CarCard.tsx              # Thẻ hiển thị dòng xe, giá từ, quà tặng, nút xem chi tiết

apps/web/app/xe/[slug]/
├── page.tsx                     # Server Component: Fetch chi tiết xe & SSR SEO JSON-LD
├── components/
│   ├── ProductHero.tsx          # Khu vực ảnh xe chính, đổi màu trực quan & chọn phiên bản
│   ├── ColorSwatchPicker.tsx    # Các nút tròn chọn màu xe (Border active, Tooltip tên màu)
│   ├── VersionSelector.tsx      # Dropdown / Segmented control chọn phiên bản
│   └── SpecGroupAccordion.tsx   # Danh sách thông số kỹ thuật đa tầng gập mở
```

---

## 2. Hệ Thống Biểu Tượng & Design Tokens

- **Icon Set (lucide-react):**
  - Phân khúc SUV / Sedan: `<Car className="w-5 h-5 text-sky-600" />`
  - Động cơ / Nhiên liệu: `<Fuel className="w-4 h-4 text-slate-500" />`
  - Số chỗ ngồi: `<Users className="w-4 h-4 text-slate-500" />`
  - Hộp số: `<Cog className="w-4 h-4 text-slate-500" />`
  - Tải brochure catalog: `<FileDown className="w-4 h-4 text-sky-600" />`
- **Tailwind Tokens:**
  - Active Color Swatch: `ring-2 ring-sky-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900`
  - Card Shadow: `shadow-sm hover:shadow-md transition-shadow duration-200`
  - Price Tag: `text-xl font-bold text-sky-600 tracking-tight`

---

## 3. Ma Trận 4 Trạng Thái Giao Diện (4-State UI Matrix)

| Trạng Thái | Điều Kiện Kích Hoạt | Hành Vi Giao Diện | Thiết Kế Fallback |
| :--- | :--- | :--- | :--- |
| **Loading** | Đang gọi API lấy danh mục xe hoặc chi tiết xe | Hiển thị Skeleton Shimmer theo đúng tỷ lệ thẻ xe 16:9 | `<div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl h-64 w-full" />` |
| **Empty** | Bộ lọc phân khúc không có dòng xe nào phù hợp | Thông báo không có dòng xe trong phân khúc đã chọn | `<div className="py-12 text-center text-slate-500"><p>Hiện chưa có dòng xe nào trong phân khúc này.</p></div>` |
| **Error** | API 500 hoặc mất kết nối mạng khi tải catalog | Hiển thị thông báo lỗi thân thiện kèm nút "Thử lại" | `<div className="py-8 text-center text-red-600"><AlertTriangle className="mx-auto w-8 h-8 mb-2" /><p>Không thể tải dữ liệu xe</p></div>` |
| **Success** | API 200 trả về danh sách đầy đủ | Render lưới xe chuẩn xác, kích hoạt animation hover | Render danh sách `CarCard` với hình ảnh sắc nét và giá ưu đãi |

---

## 4. Chuẩn Mực Triển Khai Mã Nguồn
- Bắt buộc sử dụng **Named Export** (ví dụ: `export function ProductHero(...)`).
- 100% tuân thủ **Tailwind Spacing Scale** tiêu chuẩn (tránh các arbitrary values tự do).
