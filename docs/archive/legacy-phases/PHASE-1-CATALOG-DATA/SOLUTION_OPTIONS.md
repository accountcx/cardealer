# 🏗️ Phân Tích Giải Pháp Kỹ Thuật (Sub-Gate 2.1: Solution Options)
## PHASE 1 - CORE DATA LAYER, CAR CATALOG & ADMIN AUTHENTICATION

> **Role:** `system-analyst-architect`  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`TODO.md`](./TODO.md), [`docs/06-PHASED-IMPLEMENTATION-ROADMAP.md`](../../06-PHASED-IMPLEMENTATION-ROADMAP.md)  
> **Trạng thái:** 🟡 CHỜ REVIEW & CHỐT PHƯƠNG ÁN (Pending Architecture Decision)

---

## 1. Bối Cảnh Kỹ Thuật & Bài Toán Cần Giải

Hệ thống Monorepo mới bao gồm `packages/database`, `packages/types`, `apps/api` (Node.js REST) và `apps/admin` (Next.js 15 App Router). Ở Phase 1, chúng ta cần đưa ra 3 quyết định kiến trúc cốt lõi:
1. **Database ORM / Query Layer:** Công cụ mô hình hóa 10 bảng dữ liệu, chạy migration và truy vấn PostgreSQL hiệu năng cao trong Monorepo.
2. **Cơ Chế Xác Thực & Quản Lý Phiên (Admin Authentication & Session):** Phương án bảo mật màn hình quản trị `/admin` và API bảo vệ.
3. **Bộ Thư Viện Giao Diện Quản Trị (Admin UI Component Architecture):** Thư viện thiết kế UI cho `apps/admin` đảm bảo hiện đại, chuyên nghiệp, tốc độ dựng nhanh.

---

## 2. Phân Tích Chi Tiết Từng Khu Vực Quyết Định

### 🗄️ Vấn Đề 1: Lựa Chọn Database Layer / ORM cho PostgreSQL

| Tiêu Chí | Option A: Drizzle ORM (Khuyên Dùng ⭐) | Option B: Prisma ORM | Option C: Kysely + Migration CLI |
| :--- | :--- | :--- | :--- |
| **Bản chất** | TypeScript-first SQL-like ORM, zero runtime binary | Schema DSL (`.prisma`) sinh Client qua Rust Engine | Pure TypeScript SQL Query Builder |
| **Dung lượng & Startup** | Siêu nhẹ (~50 KB), khởi động < 5ms, cực nhanh | Nặng (~40-80 MB binaries), cold-start 100-300ms | Siêu nhẹ, zero overhead |
| **Mức độ tương thích Monorepo** | Tối ưu 100%: Schema viết bằng TS tại `packages/database`, export trực tiếp types sang `packages/types` và `apps/*` | Phải chạy `prisma generate` mỗi khi đổi schema; hay gặp lỗi đồng bộ types giữa các packages | Tốt, nhưng phải tự quản lý migration scripts |
| **Khả năng quan hệ (Relations)** | Hỗ trợ Relational Queries API (`db.query.cars.findMany({ with: { versions: true } })`) không N+1 | Eager loading rất mạnh mẽ (`include: { versions: true }`) | Phải viết tay câu `LEFT JOIN` hoặc subqueries |
| **Migrations** | `drizzle-kit generate` & `migrate` xuất file SQL thuần sạch sẽ, dễ audit | `prisma migrate dev` tự động nhưng migration lock phức tạp | Phải dùng công cụ ngoài (như `umzug` hoặc `node-pg-migrate`) |

👉 **Đánh giá của Kiến trúc sư:** **Option A (Drizzle ORM)** là lựa chọn lý tưởng nhất cho kiến trúc Monorepo hiện đại. Nó cho phép toàn bộ schema được định nghĩa bằng TypeScript thuần, tái sử dụng Zod schema qua `drizzle-zod`, không bị phụ thuộc vào binary native engine của Prisma và xuất ra câu SQL trong suốt.

---

### 🔐 Vấn Đề 2: Cơ Chế Xác Thực Admin (Authentication & Session)

| Tiêu Chí | Option 1: JWT trong HTTP-Only Cookie (Khuyên Dùng ⭐) | Option 2: Database Session Store (`sessions` table) | Option 3: NextAuth.js / Auth.js |
| :--- | :--- | :--- | :--- |
| **Cơ chế** | Server ký JWT (HMAC-SHA256), client lưu cookie `admin_token` có cờ `HttpOnly; Secure; SameSite=Lax` | Sinh `session_token` ngẫu nhiên lưu trong bảng `sessions` ở DB; cookie chỉ giữ token ID | Thư viện wrapper ngoài quản lý providers & callbacks |
| **Chi phí Truy vấn DB** | **0 DB Query** khi xác thực route thông thường (Next.js Middleware decode verify chữ ký là xong) | **1 DB Query** trên mỗi request để kiểm tra token có tồn tại/hết hạn trong bảng DB không | Tùy adapter, thường kèm 1-2 DB queries |
| **Khả năng Thu hồi (Revocation)** | Dùng cơ chế `token_version` trong bảng `users`: khi đổi pass hoặc bấm logout all, tăng version ➡️ token cũ bị từ chối ngay | Thu hồi tức thì bằng cách xóa dòng trong bảng `sessions` | Phụ thuộc cấu hình session strategy |
| **Độ phức tạp Monorepo** | Đơn giản, dùng chung hàm verify JWT giữa `apps/api` (Node) và `apps/admin` (Next.js Middleware) | Cần bảng DB riêng và tác vụ dọn dẹp (cleanup cron) các session rác đã hết hạn | Phức tạp khi chia sẻ auth giữa Next.js và Backend API riêng biệt |

👉 **Đánh giá của Kiến trúc sư:** **Option 1 (JWT trong HTTP-Only Cookie kèm `token_version`)** cân bằng hoàn hảo giữa hiệu năng (Next.js Middleware chặn/cho qua trong 1ms không làm nghẽn DB) và tính an toàn bảo mật.

---

### 🎨 Vấn Đề 3: Thư Viện Giao Diện Cho Admin CMS (`apps/admin`) Trên Nền Tảng Next.js 16

| Tiêu Chí | Option I: TailwindCSS v4 + Shadcn UI + Lucide Icons (Khuyên Dùng ⭐) | Option II: Ant Design (AntD) | Option III: Tự viết CSS thuần (Vanilla) |
| :--- | :--- | :--- | :--- |
| **Tương thích Next.js 16 & React 19** | **Hoàn hảo 100%:** Shadcn UI là mã nguồn mở (Primitives code sinh trực tiếp trong project), hỗ trợ cấu trúc CSS-first `@theme` của Tailwind v4, không bị lỗi peerDependencies của npm packages đóng gói. | Kém: Nhiều component AntD chưa tương thích tốt với React 19 Server Components và Turbopack mặc định của Next.js 16. | Tương thích tốt nhưng tốn hàng tuần để tự code accessible primitives (modal, popover, tabs). |
| **Tối ưu Turbopack (Next.js 16)** | Biên dịch và Fast Refresh tức thì (<20ms) nhờ Tailwind v4 Lightning CSS engine. | Chậm, bundle lớn, dễ cảnh báo SSR mismatch. | Tốt |
| **Thẩm mỹ & Độ tùy biến** | Giao diện chuẩn Vercel/Linear cao cấp, hỗ trợ Dark/Light mode, tự do chỉnh sửa 100% markup và styling qua thuộc tính `data-slot`. | Giao diện kiểu doanh nghiệp cũ, rất khó override CSS. | Tùy biến cao nhưng khó đạt độ trau chuốt hiện đại. |

👉 **Đánh giá của Kiến trúc sư:** **Option I (Next.js 16 + TailwindCSS v4 + Shadcn UI + Lucide Icons)** là lựa chọn **hoàn toàn phù hợp và tối ưu nhất hiện nay**. Do Shadcn UI không phải là một thư viện đóng gói npm (như AntD hay MUI) mà là code components sao chép trực tiếp vào mã nguồn kết hợp Radix Primitives và Tailwind v4, nó không bị vỡ khi nâng cấp phiên bản Next.js/React.

---

## 3. Ma Trận Đánh Giá Tổng Hợp (Decision Scoring Matrix)

| Tiêu Chí Đánh Giá (Trọng số) | Combo Khuyến Nghị: Drizzle + JWT Cookie + Tailwind/Shadcn | Combo Thay Thế: Prisma + Session DB + AntD |
| :--- | :---: | :---: |
| **Tốc độ thực thi & Runtime Performance (25%)** | 9.8 / 10 | 7.5 / 10 |
| **Tính tương thích Monorepo & Type-safety (25%)** | 9.9 / 10 | 8.0 / 10 |
| **Trải nghiệm Developer & Tốc độ phát triển (20%)** | 9.5 / 10 | 9.0 / 10 |
| **Bảo mật & Kiểm soát Phiên (15%)** | 9.2 / 10 | 9.5 / 10 |
| **Thẩm mỹ & Trải nghiệm Quản trị viên (15%)** | 9.6 / 10 | 8.0 / 10 |
| **TỔNG ĐIỂM CÓ TRỌNG SỐ** | **9.63 / 10** | **8.35 / 10** |

---

## 4. Đề Xuất Cấu Hình Kiến Trúc (Architectural Recommendation)

Kiến trúc sư đề xuất phương án tối ưu:
* 🛠️ **Database & Migration:** **Drizzle ORM (`drizzle-orm` + `postgres` driver)** kết hợp `drizzle-kit` quản lý migrations tại `packages/database`.
* 🔑 **Authentication:** **JWT lưu trong HTTP-Only Secure Cookie** + Password Hashing bằng `bcryptjs` + Middleware bảo vệ route trong `apps/admin`.
* 💻 **Admin UI:** **Next.js 16 + TailwindCSS v4 + Lucide Icons + Shadcn UI primitives** tại `apps/admin`.

---

```markdown
<!-- WORKFLOW GATE STATUS -->
* Phase: Giai đoạn 2 - Thiết kế Kiến trúc (Architecture Design)
* Sub-Gate: 2.1 - Solution Options Trade-off Analysis
* Status: PENDING_USER_DECISION
* Artifact: docs/features/PHASE-1-CATALOG-DATA/SOLUTION_OPTIONS.md
* Next Step: Chờ Developer chọn phương án để bắt đầu Bước 2.2 (Thiết kế chi tiết ngũ tài liệu: SCHEMA, API_SPEC, FLOW, UI_SPEC)
<!-- END WORKFLOW GATE STATUS -->
```

---

### ❓ Yêu Cầu Chốt Phương Án Từ Developer

Xin vui lòng phản hồi lựa chọn của bạn:
* **Lựa chọn khuyến nghị:** Bạn có đồng ý với combo tối ưu: **Drizzle ORM + JWT HTTP-Only Cookie + Tailwind/Shadcn UI** không?  
  *(Cú pháp xác nhận nhanh: `Chốt Option A: Drizzle + JWT Cookie + Tailwind/Shadcn`)*
* Hoặc nếu bạn muốn điều chỉnh theo phương án khác (ví dụ: Prisma ORM, hoặc Database Session table), vui lòng chỉ định rõ.
