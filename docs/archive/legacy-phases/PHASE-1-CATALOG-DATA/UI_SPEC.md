# 🎨 Đặc Tả Thiết Kế Giao Diện Quản Trị Admin CMS (UI_SPEC.md)
## PHASE 1 - CORE DATA LAYER, CAR CATALOG & ADMIN AUTHENTICATION

> **Role:** `ui-ux-designer`  
> **Host App:** `apps/admin` (Next.js 16 App Router)  
> **UI Architecture:** Tailwind CSS v4 + Lucide Icons + Shadcn UI Primitives

---

## 1. Hệ Thống Nhận Diện & Design Tokens (Design System)

Admin Dashboard được thiết kế theo phong cách tối giản, hiện đại và sang trọng, chuẩn nhận diện các thương hiệu ô tô cao cấp:

* **Bảng màu chủ đạo (Color Palette):**
  * `Primary (Hyundai Deep Blue):` `#002C6C` — Dùng cho nút bấm chính, active states của menu sidebar.
  * `Accent (Electric Blue):` `#0072CE` — Dùng cho hover states, links, badge nổi bật.
  * `Neutral / Surface (Light Mode):` Background `#F8FAFC` (Slate-50), Card `#FFFFFF`, Border `#E2E8F0` (Slate-200).
  * `Neutral / Surface (Dark Mode):` Background `#0B0F17`, Card `#151D2A`, Border `#222F3E`.
  * `Semantic Badges:`
    * Published / Hoạt động: Nền xanh lá `#ECFDF5`, chữ `#047857`.
    * Draft / Nháp: Nền xám `#F1F5F9`, chữ `#475569`.
    * Danger / Cảnh báo: Nền đỏ `#FEF2F2`, chữ `#B91C1C`.
* **Typography:** Phông chữ chuẩn `Inter` hoặc `Plus Jakarta Sans` tối ưu hiển thị số liệu và bảng biểu.

---

## 2. Cấu Trúc Khung Layout Quản Trị (`Admin Dashboard Shell`)

```
+-----------------------------------------------------------------------------------------+
|                                    TOPBAR / HEADER                                      |
|  [Logo CarDealer]    Breadcrumb: Quản lý xe > Tucson 2025       [Theme Toggle] [Avatar] v|
+---------------------+-------------------------------------------------------------------+
|                     |                                                                   |
|  SIDEBAR            |  MAIN CONTENT AREA                                                |
|                     |                                                                   |
|  - Tổng quan        |  Tiêu đề trang: QUẢN LÝ DÒNG XE                                   |
|  - Dòng xe (Active) |  +-------------------------------------------------------------+  |
|  - Bảng màu         |  | [🔍 Tìm kiếm xe...]   [Bộ lọc Trạng thái v]   [+ Thêm Xe Mới] |  |
|  - Báo giá (Phase 2)|  +-------------------------------------------------------------+  |
|  - Tin tức (Phase 4)|  |  Ảnh  |  Tên Xe        | Số Bản | Khoảng Giá       | Trạng thái|  |
|  - Cài đặt hệ thống |  | [IMG] | Hyundai Tucson | 4 bản  | 769tr - 899tr    | Published |  |
|                     |  | [IMG] | Hyundai Creta  | 3 bản  | 599tr - 699tr    | Published |  |
|  -----------------  |  +-------------------------------------------------------------+  |
|  [ Đăng Xuất ]      |                                                                   |
+---------------------+-------------------------------------------------------------------+
```

### Các thành phần chính của Shell:
1. **Sidebar Menu:**
   * Tự động thu gọn (Collapsible) trên màn hình Tablet/Mobile.
   * Danh mục điều hướng:
     * 📊 *Dashboard* (Tổng quan)
     * 🚗 *Dòng xe* (`/admin/cars` — Trọng tâm Phase 1)
     * 🎨 *Bảng màu ngoại thất* (`/admin/colors` — Trọng tâm Phase 1)
     * 💰 *Khách hàng & Báo giá* (`/admin/leads` — Sẵn sàng cho Phase 2)
     * 📝 *Bài viết & Tin tức* (`/admin/posts` — Sẵn sàng cho Phase 4)
     * ⚙️ *Cài đặt Showroom* (`/admin/settings`)
2. **Topbar:**
   * Breadcrumb động theo từng cấp trang.
   * Nút đổi giao diện Sáng / Tối (Dark / Light Mode).
   * Avatar người dùng + Dropdown Menu (Xem thông tin tài khoản, Đăng xuất).

---

## 3. Đặc Tả Màn Hình 1: Đăng Nhập Quản Trị Viên (`/admin/login`)

```
+---------------------------------------------------------+
|                                                         |
|                     [LOGO HYUNDAI]                      |
|                   CARDEALER ADMIN CMS                   |
|         Hệ thống quản trị showroom xe chính hãng        |
|                                                         |
|  +---------------------------------------------------+  |
|  | [!] Sai tài khoản hoặc mật khẩu (Alert nếu lỗi)   |  |
|  +---------------------------------------------------+  |
|                                                         |
|  Email Đăng Nhập                                        |
|  [ ✉️  admin@xehyundaivinh.com                       ]  |
|                                                         |
|  Mật Khẩu                                               |
|  [ 🔒  ••••••••••••••••••••                    👁️ ]  |
|                                                         |
|  [x] Ghi nhớ đăng nhập trên thiết bị này                |
|                                                         |
|  +---------------------------------------------------+  |
|  |                 ĐĂNG NHẬP (Button)                |  |
|  +---------------------------------------------------+  |
|                                                         |
+---------------------------------------------------------+
```

* **Trạng thái tương tác (States):**
  * *Default:* Form sạch sẽ, con trỏ tự động focus vào ô Email.
  * *Submitting:* Nút Đăng nhập chuyển sang trạng thái disabled kèm icon quay loading spinner.
  * *Error:* Hiển thị banner đỏ với nội dung thông báo rõ ràng (không làm mất dữ liệu đã gõ).
  * *Success:* Hiệu ứng chuyển cảnh mượt sang trang `/admin/cars`.

---

## 4. Đặc Tả Màn Hình 2: Danh Sách Dòng Xe (`/admin/cars`)

* **Thanh công cụ phía trên:**
  * Ô tìm kiếm tức thì theo tên xe hoặc slug (`debounce 300ms`).
  * Dropdown lọc theo Trạng thái: `Tất cả` | `Đang xuất bản` | `Bản nháp`.
  * Nút CTA chính: `+ Thêm Dòng Xe Mới` (Điều hướng tới `/admin/cars/new`).
* **Bảng Dữ Liệu (Data-Table):**
  * **Cột 1: Ảnh đại diện xe** (Thumbnail 64x40px, bo góc).
  * **Cột 2: Tên Dòng Xe & Slug** (Tên in đậm, slug in mờ phía dưới).
  * **Cột 3: Số Phiên Bản** (Badge đếm số phiên bản, VD: `4 phiên bản`).
  * **Cột 4: Khoảng Giá** (Tự động tính min/max giá niêm yết, định dạng VNĐ có phân cách hàng nghìn).
  * **Cột 5: Trạng thái** (Badge xanh: `Đang xuất bản`, Badge xám: `Bản nháp`).
  * **Cột 6: Thứ tự (Sort Order)** (Số thứ tự hiển thị ngoài trang chủ).
  * **Cột 7: Thao tác** (Menu 3 chấm hoặc cụm icon: Chỉnh sửa, Xem trước Storefront, Xóa).

---

## 5. Đặc Tả Màn Hình 3: Thêm / Chỉnh Sửa Chi Tiết Dòng Xe (`/admin/cars/[id]`)

Form chỉnh sửa xe được chia thành **4 Tabs chuyên biệt** để quản trị viên nhập liệu không bị rối mắt:

```
+-----------------------------------------------------------------------------------------+
| <- Quay lại danh sách xe              Hyundai Tucson 2025             [Lưu Thay Đổi]    |
+-----------------------------------------------------------------------------------------+
| [ Tab 1: Thông Tin Chung ] [ Tab 2: Tính Năng Nổi Bật ] [ Tab 3: Phiên Bản ] [ Tab 4: Bảng Màu ] |
+-----------------------------------------------------------------------------------------+
```

### Chi tiết từng Tab:
* **Tab 1: Thông Tin Chung:**
  * Tên dòng xe (Bắt buộc).
  * Slug SEO (Tự động sinh từ tên xe, cho phép sửa tay).
  * Tỷ lệ lệ phí trước bạ (Mặc định `0.10` tương đương 10%).
  * Upload ảnh đại diện góc 3/4 chính của xe (hỗ trợ kéo thả ảnh WebP/PNG).
  * Upload file Catalog PDF thông số kỹ thuật.
  * Mô tả khái quát dòng xe.
* **Tab 2: 6 Tính Năng Nổi Bật (`highlightFeatures`):**
  * Hiển thị lưới 6 ô: Cho phép chọn Icon (Động cơ, Hộp số, Chỗ ngồi, An toàn, Nhiên liệu, Công suất), nhập Tiêu đề và Giá trị ngắn gọn.
* **Tab 3: Quản Lý Phiên Bản Xe (`CarVersions`):**
  * Danh sách các phiên bản đã tạo.
  * Nút `+ Thêm Phiên Bản`: Modal nhập Tên phiên bản ("1.6 Turbo"), Giá niêm yết (VNĐ), Số chỗ ngồi (5/7).
  * Bảng nhập nhóm Thông số kỹ thuật (Kích thước, Động cơ, Tiện nghi).
* **Tab 4: Bảng Phối Màu Ngoại Thất (`VersionColors`):**
  * Hiển thị danh sách các phiên bản.
  * Với mỗi phiên bản: Chọn danh sách màu ngoại thất áp dụng (từ bảng `Colors`).
  * Upload ảnh xe chụp thực tế đúng theo từng màu sơn (phục vụ tính năng bấm swatch đổi màu ở Storefront).
