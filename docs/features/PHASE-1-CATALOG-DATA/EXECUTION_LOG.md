# 📜 EXECUTION LOG & ROADMAP TRACEABILITY
## PHASE 1: CORE DATA LAYER & CAR CATALOG ENGINE (`EPIC-PHASE-1-CATALOG-DATA`)

> **Tuân thủ:** SOP Fullstack Dev Executor v2.1.2 (Senior Dev, Scalability & Execution Roadmap Edition)  
> **Thời gian khởi tạo:** 19/09/2026  
> **Trạng thái:** Active Tracking

---

## 🗺️ I. EXECUTION ROADMAP & FILE DEPENDENCY SEQUENCE
- **Tác vụ thực thi:** `EPIC-PHASE-1-CATALOG-DATA` (US-1.1 đến US-1.6)
- **Tóm tắt Mục tiêu:** Xây dựng Core Data Layer, Drizzle ORM Database Engine, REST API Backend, Hệ thống Quản trị Admin CMS (Next.js 16) và cơ chế xác thực JWT HttpOnly Cookie, bảo đảm không có trường `availability` (luôn sẵn xe tư vấn), Zero Hardcode, Zero `any`, SRP, và kiểm chứng máy tự động đạt `exit 0`.

### 🔗 Thứ tự Thực thi Các Files (Dependency Chain & Rationale)

1. **`packages/database/src/schema/*.ts`** (Tạo mới)
   - 💡 *Lý do làm trước:* Định nghĩa Database DDL cốt lõi (7 bảng Phase 1), quan hệ 1-N (Cars -> Versions), N-N (Versions <-> Colors), cấu hình hệ thống. Đây là "Single Source of Truth" cho toàn bộ nền tảng.
2. **`packages/types/src/*.ts`** (Tạo mới)
   - 💡 *Lý do làm thứ hai:* Suy diễn TypeScript Types và Zod Contracts từ Schemas để bảo đảm Type Safety xuyên suốt Monorepo (`@cardealer/types`).
3. **`packages/database/drizzle.config.ts` & `packages/database/drizzle/`** (Tạo mới)
   - 💡 *Lý do làm thứ ba:* Thiết lập Drizzle Kit và sinh Migration SQL Non-Destructive (`0000_kind_jackpot.sql`) tuân thủ chuẩn 4-Step DB Sync Zero-Downtime.
4. **`packages/database/src/seeds/`** (Tạo mới & Tách Module)
   - 💡 *Lý do làm thứ tư:* Nạp dữ liệu hạt giống (Seed Data) chuẩn nghiệp vụ đại lý Hyundai Vinh: Admin user, 5 màu xe ngoại thất, 4 dòng xe chủ lực (Santa Fe, Tucson, Creta, Grand i10) có phiên bản và liên kết màu sắc. Bọc trong DB Transaction để đảm bảo tính nguyên tử (ACID).
5. **`apps/api/src/`** (Tạo mới & Tách Route Modules)
   - 💡 *Lý do làm thứ năm:* Xây dựng REST API Backend (Express/Node) cung cấp API Auth (`/api/auth/*`), Catalog (`/api/cars/*`), và Admin CRUD (`/api/admin/*`).
6. **`apps/admin/`** (Tạo mới & Tách Component con)
   - 💡 *Lý do làm thứ sáu:* Giao diện Admin CMS (Next.js 16) phục vụ Quản trị viên Showroom đăng nhập, quản lý danh mục xe, form 4 tabs và swatch màu sắc.
7. **`packages/database/src/scripts/verify-phase-1.ts`** (Tạo mới)
   - 💡 *Lý do làm cuối cùng:* Machine Verification Script tự động thực thi 6 Test Suites kiểm tra toàn diện Database, Seed Data, Auth Security, Query Performance, Cascade Rules và TypeScript Compiler.

---

## 🛠 II. BẢN KIỂM DUYỆT TIỀN THỰC THI (SENIOR PRE-CODING CHECKLIST)

- [x] **1. Quét Codebase Convention:** Tuân thủ naming conventions (camelCase cho variables/functions, PascalCase cho components/types, kebab-case cho filenames) và cấu trúc Monorepo Turborepo.
- [x] **2. Roadmap Announcement Check:** Đã xuất bản bảng 🗺️ EXECUTION ROADMAP & FILE DEPENDENCY SEQUENCE và lưu vết tại tài liệu này.
- [x] **3. Tái sử dụng & Scalability Check:** Bóc tách các route handlers và UI sub-components thành modules độc lập.
- [x] **4. SRP & File Length Guard (< 300 lines):** Toàn bộ file code được bóc tách dưới 200–300 dòng, không để file quá dài gây nguy cơ truncation.
- [x] **5. Anti-Reward Hacking Cam kết:** Giữ nguyên 100% test assertions theo `TEST_PLAN.md`.
- [x] **6. Self-Correction Guardrail:** Bộ đếm 3-Strike tự động sửa lỗi và pass thành công sau 2 lần chạy.
- [x] **7. Zero Hardcode & Strict Typing:** Không hardcode URLs/secrets, dùng biến môi trường `.env`, chính sách Zero `any` (thay thế bằng `unknown` hoặc type cụ thể).
- [x] **8. Mental Model Comment Rule:** Chèn inline comments `// 🧠 Mental Model: <Lý do kiến trúc>` phía trên các khối xử lý quan trọng.
- [x] **9. Logging & Security Sanitization:** Khử ký tự `\r\n` (CWE-117) và không log PII/Tokens (CWE-200).

---

## 📋 III. NHẬT KÝ CHI TIẾT TỪNG BƯỚC THỰC THI (CHRONOLOGICAL EXECUTION LOG)

### 2026-09-19 - Phiên Triển Khai & Chuẩn Hóa v2.1.2:
1. **Schema & Types:** Đã thiết kế 7 bảng không chứa trường `availability` theo đúng tôn chỉ đại lý xe. Đã nâng cấp `taxRate` dùng `z.coerce.number()`.
2. **Nâng cấp Runtime & Packages:** Cập nhật `node: >=24` (Node 24.21.0), nâng cấp `typescript@7.0.2`, `turbo@2.11.0`, `next@16.3.5`, `react@19.3.0`, `drizzle-orm@0.45.2`, `zod@4.6.5`.
3. **Loại bỏ Hardcode:** Chuyển toàn bộ các API call trong `apps/admin` sang sử dụng `process.env.NEXT_PUBLIC_API_URL`. Đường dẫn `cwd` trong verify script chuyển sang dùng dynamic `process.cwd()`.
4. **4-Step DB Sync:** Khởi tạo `drizzle.config.ts`, chạy `drizzle-kit generate` sinh migration `0000_kind_jackpot.sql`.
5. **Zero `any`:** Rà soát và loại bỏ 100% từ khóa `any` trong toàn bộ Monorepo.
6. **Bóc tách Modules & Mental Model Comments:** Bóc tách các file vượt quá 300 dòng thành sub-components và route modules chuyên biệt.

---

## 🗺️ IV. DETAILED REMEDIATION ROADMAP (CHUẨN HÓA TOÀN DIỆN FRONTEND & DESIGN SYSTEM)

### 🔗 1. Tầng Cấu Hình & Mạng Tập Trung (Env & API Client Layer)
1. **`packages/env/src/index.ts`** (Sửa đổi)
   - 💡 *Lý do làm trước:* Xuất instance `clientEnv` đã validate từ Zod để làm Single Source of Truth cho toàn bộ các ứng dụng Client/Admin, loại bỏ 100% việc đọc `process.env.*` trực tiếp (Invariant 13).
2. **`apps/admin/lib/api-client.ts`** (Tạo mới)
   - 💡 *Lý do làm thứ hai:* Tạo Centralized HTTP Client bọc quanh `fetch`, tự động gắn `baseURL` từ `clientEnv`, credentials và tích hợp Global Error Interceptor (HTTP 401 tự động redirect sang `/login`, HTTP 500 ném `AppError` chuẩn hóa) (Invariant 12).
3. **`apps/admin/services/*.service.ts`** (Tạo mới)
   - 💡 *Lý do làm thứ ba:* Tách biệt các hàm gọi API theo domain (`auth.service.ts`, `catalog.service.ts`, `settings.service.ts`) trả về Type-Safe DTOs, giải phóng hoàn toàn tầng UI khỏi việc bắt lỗi mạng rải rác (Invariant 12).

### 🔗 2. Tầng Thư Viện UI Dùng Chung & Design Tokens (Shared UI & Primitives Layer)
4. **`packages/ui/src/theme.css` & `tokens.ts`** (Tạo mới)
   - 💡 *Lý do làm trước:* Khai báo hệ thống Design Tokens chuẩn [UI_SPEC.md](file:///Users/nhatphan/Code/CarDealer/cardealer/docs/features/PHASE-1-CATALOG-DATA/UI_SPEC.md) (Hyundai Deep Blue `#002C6C`, Accent `#0072CE`, Light Mode `#F8FAFC`, Dark Mode `#0B0F17`) và CSS Variables phục vụ chế độ Dark/Light mode (Invariant 11).
5. **`packages/ui/src/primitives/*.tsx`** (Tạo mới/Nâng cấp)
   - 💡 *Lý do làm tiếp theo:* Xây dựng trọn bộ các UI Primitives dùng chung chuẩn Component-Driven: `Button`, `Input`, `Badge`, `Card`, `Modal/Dialog`, `Table`, `Tabs` với đầy đủ ma trận trạng thái tương tác (`hover`, `loading`, `disabled`, `empty`, `error`) (Invariant 11).
6. **`packages/ui/src/index.ts`** (Cập nhật)
   - 💡 *Lý do làm tiếp theo:* Barrel export toàn bộ Design Tokens và Primitives để các ứng dụng monorepo tiêu thụ.

### 🔗 3. Tầng Tái Cấu Trúc Giao Diện Admin (Presentation Layer Refactor)
7. **`apps/admin/app/components/AdminShell.tsx`** (Cập nhật)
   - 💡 *Lý do làm tiếp:* Bổ sung Theme Toggle (Sáng / Tối) và Collapsible Sidebar trên Topbar theo đúng đặc tả Shell trong `UI_SPEC.md`.
8. **`apps/admin/app/login/page.tsx`** (Refactor)
   - 💡 *Lý do làm tiếp:* Tiêu thụ `Button`, `Input`, `Card` từ `@cardealer/ui` và gọi `authService.login()`.
9. **`apps/admin/app/cars/`** (Refactor)
   - 💡 *Lý do làm tiếp:* Tiêu thụ `Table`, `Badge`, `Button`, `Input` từ `@cardealer/ui`, áp dụng debounce 300ms ô tìm kiếm, gọi `catalogService`.
10. **`apps/admin/app/colors/` & `apps/admin/app/settings/`** (Refactor)
    - 💡 *Lý do làm tiếp:* Chuyển đổi toàn bộ form modal và input sang sử dụng component dùng chung, xóa sạch 100% inline CSS thô.

### 🔗 4. Kiểm Chứng Máy (Verification)
11. **`pnpm check-types` & `pnpm verify:phase-1`** (Kiểm tra)
    - 💡 *Mục tiêu:* Đảm bảo 8/8 packages pass type check, 18/18 test cases pass, và UI khớp 100% đặc tả `UI_SPEC.md`.

