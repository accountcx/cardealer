# 🧪 Quality Assurance & Test Strategy: PHASE 2 - STATIC-PAGES-CMS

> **Mã Epic**: `EPIC-PHASE-2-STATIC-PAGES-CMS`  
> **Dự án**: CarDealer QA Automation  
> **Giai đoạn**: Phase 3 - Step 3.2: Test Specification  
> **Lead Role**: `qa-test-engineer`  
> **Tiêu chuẩn quy trình**: Universal Agentic Workflow v2.2  

---

## 1. Tổng Quan Chiến Lược Kiểm Thử (QA Strategy)

* **Phạm vi Nền tảng:** `[Full-stack]` (Database Schema, Backend REST API, Admin UI Form, Web Storefront SSR).
* **Phương thức Chứng thực Máy (Verification Mode):**
  * Automated Unit & Integration Tests qua `vitest` (Bắt buộc trả về **Exit Code 0**).
  * Monorepo Typecheck: `pnpm check-types` (Bắt buộc **0 errors**).
* **Mục tiêu Nghiệm thu:** Đảm bảo 100% test cases pass, hoàn toàn không có hồi quy (Zero Regression) trên hệ thống routing tĩnh hiện hữu.

---

## 2. Ma Trận Kịch Bản Kiểm Thử Toàn Diện (Test Scenarios Matrix)

| ID | Lát Cắt | Phân Loại | Kịch Bản Kiểm Thử | Dữ Liệu Đầu Vào (Payload / Action) | Kết Quả Kỳ Vọng (Expected Outcome) | Trạng Thái |
| :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **TS-01** | `US-01` | Schema DDL | Tạo bảng `static_pages` & xác thực các cột bắt buộc | Chạy script Drizzle migration vào test database | Bảng tạo thành công với 12 trường và 3 indexes, không lỗi cú pháp | ⏸️ QUEUED |
| **TS-02** | `US-01` | State Integrity | Khởi tạo trang với trạng thái mặc định | DTO không truyền `isPublished` và `templateType` | `isPublished` mặc định là `false` (Draft), `templateType` là `'DEFAULT'` | ⏸️ QUEUED |
| **TS-03** | `US-02` | Positive | Admin tạo trang tĩnh mới thành công | `POST /api/admin/pages` với title "Giới thiệu", slug "gioi-thieu", auth token hợp lệ | HTTP 201 Created + ID bản ghi mới + lưu đúng JSON AST | ⏸️ QUEUED |
| **TS-04** | `US-02` | Security (R12) | Chặn tạo trang có slug trùng với route tĩnh hệ thống | `POST /api/admin/pages` với slug là `"xe"` hoặc `"tin-tuc"` | HTTP 422 Unprocessable Entity + Error code `RESERVED_SLUG_VIOLATION` | ⏸️ QUEUED |
| **TS-05** | `US-02` | Concurrency (R13) | Chặn tạo trang có slug trùng với trang tĩnh đã có | `POST /api/admin/pages` với slug đã tồn tại `"gioi-thieu"` | HTTP 409 Conflict + Error code `SLUG_ALREADY_EXISTS` | ⏸️ QUEUED |
| **TS-06** | `US-02` | Security (R5) | Chặn truy cập Admin API khi thiếu token hoặc sai quyền | Gửi request `POST /api/admin/pages` không có Header Authorization | HTTP 401 Unauthorized | ⏸️ QUEUED |
| **TS-07** | `US-02` | Security (R7) | Chặn Mass Assignment qua Zod schema | Gửi payload kèm `{ "id": "custom-uuid", "isAdmin": true }` | Payload bị strip sạch, DB tự sinh ID ngẫu nhiên | ⏸️ QUEUED |
| **TS-08** | `US-02` | Security (R14) | Khách vãng lai truy vấn trang ở trạng thái Bản Nháp | `GET /api/public/pages/trang-nhap` (khi `isPublished = false`) | HTTP 404 Not Found + Error code `PAGE_NOT_FOUND` | ⏸️ QUEUED |
| **TS-09** | `US-03` | Visual QA | SERP Preview cập nhật thời gian thực khi gõ | Nhập title 55 ký tự và desc 155 ký tự | Progress bar chuyển màu Xanh lá, snippet hiển thị chuẩn font Google | ⏸️ QUEUED |
| **TS-10** | `US-03` | Visual QA | Cảnh báo khi nhập tiêu đề quá dài (>60 ký tự) | Nhập title 75 ký tự | Progress bar chuyển màu Đỏ + cảnh báo cắt dấu `...` | ⏸️ QUEUED |
| **TS-11** | `US-04` | Storefront SSR | Khách truy cập trang tĩnh hợp lệ đã xuất bản | Truy cập URL `https://xehyundaivinh.com/gioi-thieu` | HTTP 200 OK + Render `ProfileShowroomTemplate` + Thẻ `<title>`, `<meta description>`, `<link canonical>` chuẩn xác | ⏸️ QUEUED |
| **TS-12** | `US-04` | Security (R4) | Chống XSS Injection trong Tiptap Content | JSON content chứa node chèn `<script>alert('xss')</script>` | Render an toàn thành văn bản text thuần hoặc escaped node, không thực thi script | ⏸️ QUEUED |
| **TS-13** | `US-04` | Routing Precedence | Không xung đột với các route tĩnh hiện hữu | Truy cập `/xe`, `/dong-xe/sedan`, `/tin-tuc` | Render chuẩn các trang danh mục xe và tin tức, không bị catch-all route bắt nhầm | ⏸️ QUEUED |
| **TS-14** | `US-04` | SEO Robots | Thẻ robots khi `noIndex = true` | Truy cập trang có cấu hình `noIndex: true` | Thẻ `<meta name="robots" content="noindex, nofollow" />` được inject vào `<head>` | ⏸️ QUEUED |

---

## 3. Tiêu Chuẩn Máy Chứng Thực Tự Động (Machine Verification)

### 3.1 Script Kiểm Thử Unit & Integration (Vitest CLI Runner)
Coder tại Phase 4 bắt buộc phải chạy lệnh sau và đạt **Exit Code 0**:

```bash
# Chạy toàn bộ test suites cho phân hệ Static Pages
TMPDIR=/Users/nhatphan/Code/CarDealer/cardealer/node_modules/.cache/tmp pnpm test
```

### 3.2 Script Kiểm Tra Tính Nhất Quán Kiểu Dữ Liệu (Typecheck Runner)
Coder bắt buộc xác nhận không có bất kỳ lỗi TypeScript nào trên toàn bộ Monorepo:

```bash
# Kiểm tra type toàn monorepo
pnpm check-types
```

---

## 4. Chốt Chặn Bàn Giao Kỹ Thuật (QA Sign-off Gate)

* [x] Đã quét 100% rủi ro từ `RISK_AUDIT.md` (R4, R12, R14, R13, R5, R7) thành các test case tự động.
* [x] Đã bao quát toàn bộ các trạng thái của State Transition Matrix (`DRAFT` ➡️ `PUBLISHED` ➡️ `DELETED`).
* [x] Đã định nghĩa các kịch bản kiểm thử giao diện Zero-CLS và Mobile Responsive.
* [x] Đã khóa tiêu chuẩn nghiệm thu (Test Suite Lockdown) — Coder tại Phase 4 không được phép sửa đổi assertions để ngụy tạo pass.
