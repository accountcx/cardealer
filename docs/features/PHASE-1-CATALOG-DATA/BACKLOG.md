# 🎯 Feature Backlog: PHASE 1 - CORE DATA LAYER & CAR CATALOG ENGINE

> **Mã Epic:** `EPIC-PHASE-1-CATALOG-DATA`  
> **Tài liệu nguồn tham chiếu:** [`docs/02-DATABASE-SCHEMA-PAYLOAD-CMS.md`](../../02-DATABASE-SCHEMA-PAYLOAD-CMS.md), [`docs/06-PHASED-IMPLEMENTATION-ROADMAP.md`](../../06-PHASED-IMPLEMENTATION-ROADMAP.md), [`docs/SYSTEM_MAP.md`](../../SYSTEM_MAP.md)

---

## 1. Thông Tin Tổng Quan & Phân Vùng Chiến Lược

* **Mục tiêu Chiến lược:** Thiết kế và xây dựng toàn diện tầng Cơ sở dữ liệu (Database Layer), Entity Schemas, Dữ liệu mẫu (Seeders), và REST CRUD APIs phục vụ danh mục Dòng xe & Bảng màu ngoại thất trên hệ sinh thái Monorepo mới.
* **Phạm vi Nền tảng (Target Platform & Scope):** ⚙️ **Backend API + Data Layer + Admin Portal** (`packages/database`, `packages/types`, `apps/api`, `apps/admin`).
* **Cấp độ Thực thi (Execution Tier):** **Tier 1 (Core Architecture / Greenfield / Full 5-Phase Playbook)**.
* **Trạng thái Môi trường:** 🟢 **Pure Development** (Môi trường mới sạch sẽ, tự do thiết kế schema tối ưu nhất trên PostgreSQL).
* **Múi giờ & Định dạng Chuẩn:**
  * Locale: `vi-VN` (Hỗ trợ tiếng Việt có dấu và slug SEO không dấu).
  * Tiền tệ: VNĐ (`giaNiemYet`, `giaKhuyenMai` lưu trữ dạng số nguyên `BigInt`/`Integer`).
  * Múi giờ: `Asia/Ho_Chi_Minh`, lưu trữ DB dưới dạng `TIMESTAMPTZ` (UTC).

---

## 2. Danh Sách User Stories Chi Tiết (Lifecycle Status Matrix)

| ID | User Story / Nhiệm Vụ Kỹ Thuật | Nền Tảng (Layer) | Trạng Thái | Cửa Chặn Hiện Tại | File / Package Tác Động Dự Kiến |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **US-1.1** | **Entity Schemas & Data Contracts:** Định nghĩa Zod Schemas & TypeScript interfaces cho các Thực thể Phase 1 (`Cars`, `CarVersions`, `Colors`, `VersionColors`, `Users`, `Media`) và 7 Globals | Contracts | 🔄 IN PROGRESS | Gate 1 Approved | `packages/types/src/` |
| **US-1.2** | **Database Layer & PostgreSQL Setup:** Thiết kế mô hình quan hệ bảng trên PostgreSQL, migrations và connection pool client | Database | ⏸️ QUEUED | Pending Step 2.1 | `packages/database/src/` |
| **US-1.3** | **Database Seeding Engine:** Khởi tạo script nạp dữ liệu mẫu 4 dòng xe chủ lực (*Santa Fe, Tucson, Creta, Grand i10*) đầy đủ phiên bản & màu sắc | Database | ⏸️ QUEUED | Pending Step 2.2 | `packages/database/src/seeds/` |
| **US-1.4** | **Backend REST Catalog APIs:** Xây dựng các endpoints: `GET /api/cars`, `GET /api/cars/:slug`, `GET /api/colors`, `GET /api/settings` | Backend API | ⏸️ QUEUED | Pending Gate 3 | `apps/api/src/routes/` |
| **US-1.5** | **Admin Catalog Management:** Giao diện xem danh sách dòng xe, form thêm/sửa thông số kỹ thuật và gán bảng màu ngoại thất | Admin Portal | ⏸️ QUEUED | Pending Gate 4 | `apps/admin/app/cars/` |
| **US-1.6** | **Admin Authentication & RBAC:** Hệ thống đăng nhập Admin, bảo vệ tuyến đường (`/admin/login`, middleware), session cookie và mã hóa mật khẩu an toàn | Auth + Security | ⏸️ QUEUED | Pending Step 2.2 | `packages/database`, `apps/api/src/routes/auth`, `apps/admin` |

---

## 3. Phân Tích Khảo Cổ & 6 Lăng Kính Phản Biện (Brainstorming Session)

### 0. Lăng kính Phân vùng Nền tảng (Platform Boundary)
* `packages/types`: Khai báo Zod Schema làm Single Source of Truth cho cả Backend và Admin.
* `packages/database`: Quản lý các file migration và ORM models, đảm bảo không có circular dependencies.
* `apps/api`: Sử dụng RESTful conventions, chuẩn hóa định dạng JSON Response `{ success: true, data: ..., error: null }`.

### 1. Lăng kính Vòng đời & Lịch sử (Lifecycle & History)
* **Dòng xe (`Cars`):** Quản lý trạng thái bằng enum `status: draft | published | archived`.
* Tự động sinh timestamp `createdAt` và `updatedAt` trên toàn bộ các bảng.
* Hỗ trợ lưu trữ số lượt xem hoặc thứ tự hiển thị ưu tiên (`sortOrder`).

### 2. Lăng kính Xung đột & Trùng lặp (Collision & Uniqueness)
* `cars.slug`: Bắt buộc Unique Index. Tự động chuyển đổi tiếng Việt có dấu sang slug sạch (ví dụ: `"Hyundai Santa Fe 2025"` ➡️ `"santa-fe-2025"`).
* `cars.name`: Bắt buộc Unique để tránh nhân bản dòng xe.
* `colors.name`: Bắt buộc Unique.
* `version_colors`: Bắt buộc Unique Composite Index trên cặp `(version_id, color_id)`.

### 3. Lăng kính Luồng Bổ sung (Partial Flow)
* Cho phép Admin lưu nháp dòng xe mới (`status: draft`) khi chưa có đủ danh sách ảnh màu sắc hoặc thông số kỹ thuật.
* API lọc linh hoạt: `GET /api/cars?status=published` cho Client ngoài Storefront, và `GET /api/cars` cho Admin quản lý toàn bộ.

### 4. Lăng kính Tải & Hiệu năng (Performance & Scale)
* Thêm B-Tree Index cho `(slug, status)` và `(segment, status)` để phục vụ việc lọc xe theo phân khúc (Sedan, SUV, MPV) với độ trễ dưới 5ms.
* Hạn chế N+1 Query: Sử dụng Eager Loading khi truy vấn Dòng xe kèm toàn bộ Phiên bản và Màu sắc liên quan.

### 5. Lăng kính Trạng thái Rỗng & Biên (Empty & Zero-state)
* Dòng xe chưa có phiên bản nào: API trả về `versions: []` hợp lệ.
* Phiên bản chưa có màu riêng: Tự động fallback về ảnh đại diện chính của xe (`featuredImage`).

---

## 4. Design Stack Kích Hoạt Cho Giai Đoạn 2

* **Bước 2.1 (Sub-Gate 2.1):** `system-analyst-architect` xây dựng `SOLUTION_OPTIONS.md` so sánh các giải pháp ORM & Data Access cho PostgreSQL:
  * **Option A:** Drizzle ORM (Siêu nhẹ, hiệu năng cao, type-safe SQL, zero overhead).
  * **Option B:** Prisma ORM (Hệ sinh thái phong phú, schema trực quan, tooling mạnh mẽ).
  * **Option C:** Pure SQL Kysely / Pg Typed (Kiểm soát 100% câu truy vấn).
* **Bước 2.2:** Sau khi bạn chốt Option ORM & Auth tại Sub-Gate 2.1, kích hoạt:
  * `db-schema-architect` ➡️ Thiết kế ERD hoàn chỉnh, DDL Migrations & State Transition Matrix (`SCHEMA.md`).
  * `feature-spec-generator` ➡️ Đặc tả REST Endpoints cho Auth, Catalog & Settings (`API_SPEC.md`).
  * `logic-flow-ba` ➡️ Sơ đồ tuần tự đăng nhập Admin, bảo vệ route và nạp danh mục xe (`FLOW.md`).
  * `ui-ux-designer` ➡️ Đặc tả Giao diện Admin CMS (`UI_SPEC.md`): Layout Shell (Sidebar, Header), Màn hình Login (`/admin/login`), Data-table Danh sách xe và Form Thêm/Sửa Xe & Màu sắc (`/admin/cars`).
