# 🎨 Bản Thiết Kế Giao Diện & Tích Hợp Frontend (FE Integration Guide)

> **Feature:** Cấu Trúc Routing Tĩnh & Kiến Trúc Menu (URL Architecture) — `ROUTING-URL-ARCHITECTURE`  
> **Skill Phụ Trách:** `@tailwind-ui-designer`  
> **Căn cứ:** [FLOW.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/FLOW.md), [API_SPEC.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/ROUTING-URL-ARCHITECTURE/API_SPEC.md)

---

## 1. Hệ Thống Design Tokens & Bảng Màu (Dark Theme #0b0f17)

Trang phân khúc dòng xe `/dong-xe/[slug]` tuân thủ nghiêm ngặt chuẩn giao diện Storefront Web của CarDealer:
* **Background chính:** `#0b0f17` (Deep dark slate background).
* **Card & Container:** `bg-slate-900/60 backdrop-blur-xl border border-white/10`.
* **Màu nhấn (Accent/Brand):**
  - Cyan / Neon Blue: `text-cyan-400`, `bg-cyan-500/10`, `border-cyan-500/20` (Badge phân khúc).
  - Emerald Green: `text-emerald-400` (Giá lăn bánh & Ưu đãi).
* **Typography:** Font chữ không chân hiện đại, phân cấp rõ ràng (`h1`: 28-36px font-black, body: 14-16px leading-relaxed text-slate-300).

---

## 2. Bố Cục Trang (Page Layout Hierarchy)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Breadcrumbs: Trang chủ > Dòng xe > Sedan (hoặc SUV, MPV)           │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Khối Hero SEO Header:                                               │
│    - Badge phân khúc (vd: 🚗 PHÂN KHÚC SEDAN HYUNDAI)                  │
│    - <h1> Tiêu đề H1 lớn chứa từ khóa chính chuẩn E-E-A-T             │
│    - Đoạn văn mô tả chuyên sâu (~200 chữ) tối ưu xếp hạng Googlebot     │
│    - Thống kê nhanh: "Hiển thị 3 mẫu xe chính hãng"                    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Lưới Sản Phẩm Xe (Car Grid):                                        │
│    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐               │
│    │ CarCard       │ │ CarCard       │ │ CarCard       │               │
│    │ Hyundai       │ │ Hyundai       │ │ ...           │               │
│    │ Accent        │ │ Elantra       │ │               │               │
│    └───────────────┘ └───────────────┘ └───────────────┘               │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Khối Kêu Gọi Hành Động (CTA Section):                               │
│    - Hotline tư vấn trả góp & lái thử tận nhà                          │
│    - Nút liên kết xem toàn bộ bảng giá (/gia-xe-hyundai)               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Thiết Kế 4 Trạng Thái Giao Diện (4-State UI Matrix)

### 3.1. Trạng Thái 1: Loading Skeleton (`loading.tsx`)
Khi người dùng chuyển trang hoặc SSR đang nạp dữ liệu:
* Breadcrumbs Skeleton: thanh ngang `h-5 w-48 bg-slate-800 animate-pulse rounded`.
* Hero Header Skeleton:
  - Badge Skeleton: `h-6 w-32 bg-slate-800 rounded-full`.
  - Title Skeleton: `h-10 w-3/4 bg-slate-800 rounded-xl`.
  - Body Text Skeleton: 3 dòng `h-4 w-full bg-slate-800/60 rounded`.
* Car Grid Skeleton: 3 thẻ card `h-[420px] bg-slate-900/60 border border-white/5 rounded-2xl animate-pulse`.

### 3.2. Trạng Thái 2: Success State (Có xe hiển thị)
* Render danh sách xe tái sử dụng Component `CarCard` hiện hữu từ trang `/xe` hoặc `@/components/cars/CarCard`.
* Mỗi card hiển thị:
  - Ảnh đại diện xe tỷ lệ 16:9 với badge phân khúc và badge ưu đãi (nếu có).
  - Tên xe `h3` in đậm (vd: Hyundai Accent 2026).
  - Giá niêm yết khởi điểm (`minPrice`) định dạng VNĐ có phân cách hàng nghìn.
  - Số lượng phiên bản (`X phiên bản`).
  - Nút bấm: "Xem Chi Tiết" (trỏ tới `/xe/[slug]`) và "Dự Toán Lăn Bánh" (trỏ tới `/gia-lan-banh?carId=...`).

### 3.3. Trạng Thái 3: Empty State (Phân khúc tạm hết xe published)
Nếu trong database chưa có xe nào thuộc phân khúc này:
* Khung container bo góc `rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center`.
* Icon: `Car` hoặc `SearchX` kích thước 48px màu `text-slate-500`.
* Tiêu đề: "Hiện tại chưa có mẫu xe nào trong phân khúc này".
* Mô tả: "Chúng tôi đang cập nhật các dòng xe mới nhất về showroom. Quý khách vui lòng liên hệ hotline để nhận thông tin đặt cọc sớm nhất."
* Hành động:
  - Nút chính (Button Accent): `Gọi Hotline [Số Hotline]` (icon Phone).
  - Nút phụ (Button Secondary): `Xem Tất Cả Dòng Xe` (trỏ về `/xe`).

### 3.4. Trạng Thái 4: Error State (`error.tsx`)
Nếu API hoặc server gặp sự cố ngoại lệ:
* Next.js Error Boundary bắt lỗi tự động.
* Khung thông báo lỗi thân thiện, không làm crash toàn bộ giao diện layout chung (Header & Footer vẫn hoạt động bình thường).
* Nút bấm "Tải lại trang" (`reset()`).

---

## 4. Đặc Tả Tích Hợp Component Navbar & MobileDrawer

### 4.1. Navbar Desktop Dropdown
* Menu cấp 1 "Dòng Xe" kích hoạt Dropdown khi hover hoặc click.
* Các items cấp 2 hiển thị icon tương ứng:
  - **Sedan (Accent, Elantra):** Link tới `/dong-xe/sedan`.
  - **SUV (Creta, Tucson, Santa Fe):** Link tới `/dong-xe/suv`.
  - **MPV (Custin, Stargazer):** Link tới `/dong-xe/mpv`.
  - Item chân dropdown: "Xem tất cả các dòng xe →" (trỏ về `/xe`).

### 4.2. MobileDrawer Menu Cấp 2
* Accordion "Dòng Xe" mở ra danh sách 3 links tĩnh mới.
* Hitbox tối thiểu 44px chiều cao để người dùng di động bấm chạm thoải mái không bị bấm nhầm.
