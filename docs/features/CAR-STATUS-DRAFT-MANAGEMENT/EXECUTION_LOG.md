# 🗺️ DETAILED EXECUTION ROADMAP & FUNCTION-LEVEL DEPENDENCY SEQUENCE

- **Tác vụ đang thực thi:** US-DRAFT-STATUS-01
- **Tóm tắt Mục tiêu:** Bổ sung tính năng quản lý, phân loại và chuyển đổi xe 'Bản Nháp / Ẩn' (Draft Status) tại `http://localhost:3001/cars`.
- **Phân loại Rủi ro:** Tier 3 (Fast-Track / UI Polish & Component Enhancement / Non-Destructive Data Update)

---

## 🔗 1. DATA & SEED DEPENDENCY CHAIN

### 📄 File 1: `packages/database/drizzle/0000_seed_initial_data.sql` (Sửa)
* 💡 **Lý do làm trước:** Chuẩn hóa dữ liệu hạt giống (Seed Data) để các môi trường mới tự động có 2 xe ở trạng thái `draft` (`Hyundai Venue` & `Hyundai Ioniq 5`), phản ánh thực tế showroom có xe đang chuẩn bị ra mắt / bản nháp.
* 🛠 **Danh sách thay đổi:**
  * Cập nhật `status` của dòng xe `'venue'` thành `'draft'`.
  * Cập nhật `status` của dòng xe `'ioniq-5'` thành `'draft'`.

---

## 🌐 2. FRONTEND DEPENDENCY CHAIN & COMPONENT BREAKDOWN

### 📄 File 2: `apps/admin/app/cars/components/CarStats.tsx` (Sửa)
* 💡 **Lý do làm thứ hai:** Cung cấp giao diện tương tác KPI độc lập (Atoms/Widgets) trước khi gắn vào trang cha.
* 🛠 **Danh sách Props & Handlers:**
  * Thêm `activeFilter?: 'all' | 'published' | 'draft' | 'featured'`.
  * Thêm `onFilterChange?: (filter: 'all' | 'published' | 'draft' | 'featured') => void`.
  * Thêm hiệu ứng chọn thẻ (Active indicator: ring viền phát sáng, elevated shadow, cursor-pointer).
  * Hỗ trợ toggle: Click vào thẻ đang active sẽ reset về `'all'`.

### 📄 File 3: `apps/admin/app/cars/components/CarTable.tsx` (Sửa)
* 💡 **Lý do làm thứ ba:** Nâng cấp bảng dữ liệu xe hiển thị Badge tương tác và nút chuyển đổi nhanh trạng thái.
* 🛠 **Danh sách Props & Handlers:**
  * Thêm `onToggleStatus?: (car: CarItem) => Promise<void> | void`.
  * Nâng cấp cột "Trạng Thái": Badge hiển thị trạng thái `published` (Đang Bán) hoặc `draft` (Bản Nháp) có icon chỉ báo rõ ràng.
  * Thêm nút chuyển đổi nhanh (Quick Status Switch) trực tiếp trên từng hàng xe giúp Admin đổi trạng thái sang Bản Nháp / Công Khai chỉ với 1 click.

### 📄 File 4: `apps/admin/app/cars/page.tsx` (Sửa)
* 💡 **Lý do làm cuối cùng:** Trang điều phối chính (Container Pattern) tích hợp Filter Bar, CarStats, CarTable và API Service.
* 🛠 **Danh sách State & Handlers:**
  * State: `const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft' | 'featured'>('all');`
  * Dropdown chọn trạng thái trong Filter Bar (kế bên lọc Phân khúc).
  * Bộ lọc `filteredCars` phối hợp 3 điều kiện: `search`, `selectedSegment`, `selectedStatus`.
  * Handler `handleToggleStatus(car: CarItem)`: Gọi `catalogService.updateCar(car.id, { status: newStatus })` với cơ chế Optimistic UI và thông báo Banner kết quả.
  * Ghép `activeFilter` & `onFilterChange` vào `CarStats`.
  * Ghép `onToggleStatus` vào `CarTable`.

---

## 📋 3. DANH MỤC KIỂM THỬ TỪNG HÀM & COMPONENT
- [x] **Data Test:** Seed file `0000_seed_initial_data.sql` có `venue` và `ioniq-5` mang `status: 'draft'`.
- [x] **Type-Safety Test:** `pnpm check-types` toàn bộ monorepo (8/8 packages) không có lỗi TypeScript (exit code 0).
- [x] **Filter Test:** Dropdown chọn "Bản Nháp / Ẩn" lọc đúng các xe draft; Chọn "Đang Bán" lọc đúng các xe published; Chọn "Xe Hot" lọc đúng xe featured.
- [x] **CarStats Click Test:** Click thẻ KPI "Bản Nháp / Ẩn" chuyển filter sang 'draft'; Click lại chuyển về 'all'.
- [x] **Toggle Status Action Test:** Click nút toggle trạng thái xe (Badge hoặc icon mắt) -> UI cập nhật ngay tức thì (Optimistic UI) -> API PUT gọi cập nhật CSDL.
