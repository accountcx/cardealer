# 📝 TODO: Content Management & Tiptap Editorial Engine (v1.4.0)

> **Feature Goal:** Tự động viết bài theo định kỳ (Auto Publishing Scheduler) & Trợ lý AI Lập kế hoạch nội dung 30 ngày (AI Content Editorial Planner)

---

## 📌 Phase 1: Strategic Analysis
- [x] Định vị Canonical Module Slug: `content-management`.
- [x] Lưu trữ snapshot lịch sử nâng cấp cũ sang `history/2026-11-04_1005_v1.3.0/`.
- [x] Xác nhận môi trường: Pure Development / Sandbox.
- [x] Cập nhật `OVERVIEW.md` với mục tiêu v1.4.0 và Lịch sử nâng cấp.
- [x] Phân rã nghiệp vụ thành các Vertical Slices (`US-06`, `US-07`, `US-08`, `US-09`) trong `BACKLOG.md`.
- [x] Hoàn thiện `TODO.md` và thông quan Gate 1 (`AUDIT_GATE_1.md`).

---

## 📌 Phase 2: Adaptive Architecture Design (Living Spec Merge)
- [x] **Step 2.1:** Xuất bản `SOLUTION_OPTIONS.md` so sánh các giải pháp Scheduler & AI Pipeline.
- [x] **Step 2.2:** Cập nhật `FLOW.md` với Sequence Diagram luồng lập lịch và sinh bài tự động.
- [x] **Step 2.3:** Cập nhật `SCHEMA.md` với bảng `auto_post_settings`, `content_plan_items`, `auto_post_logs`.
- [x] **Step 2.4:** Cập nhật `API_SPEC.md` với các REST endpoints quản lý scheduler, plan items, run-now và logs.
- [x] **Step 2.5:** Cập nhật `FE_INTEGRATION_GUIDE.md` với UI Wireframe/Tokens/4-State cho trang quản trị `/posts/auto-schedule`.

---

## 📌 Phase 3: Risk Control & Test Planning
- [x] **Step 3.1:** Cập nhật `RISK_AUDIT.md` (đánh giá rủi ro LLM token exhaustion, duplicate runs, schema drift, rollback plan).
- [x] **Step 3.2:** Cập nhật `TEST_PLAN.md` với ma trận kiểm thử chi tiết cho Scheduler, AI Planner và UI.
- [x] **Automated Gate 3 Check:** Chạy `spec_guard.sh` đạt `PASS (exit 0)`.

---

## 📌 Phase 4: Atomic Execution & Verification
- [x] **US-06: Schema, Types & Settings API**
  - [x] **U-06.1:** Tạo migration Drizzle cho `auto_post_settings`, `content_plan_items`, `auto_post_logs` trong `packages/database`.
  - [x] **U-06.2:** Khai báo Zod schemas và types cho AutoPostSettings, ContentPlanItem, AutoPostLog trong `packages/types`.
  - [x] **U-06.3:** Viết API route `GET /api/admin/auto-posts/settings` và `PUT /api/admin/auto-posts/settings`.
  - [x] **U-06.4:** Viết API route CRUD cho `content_plan_items` (`GET`, `POST`, `PATCH`, `DELETE`).
- [x] **US-07: AI 30-Day Content Editorial Planner Engine**
  - [x] **U-07.1:** Mở rộng `AiActionSchema` ('generate_editorial_plan') trong `packages/types/src/ai.ts`.
  - [x] **U-07.2:** Viết prompt generator `buildEditorialPlanPrompt` kết hợp negative grounding từ kho bài viết hiện có.
  - [x] **U-07.3:** Viết transformer `transformEditorialPlanResponse` trong `apps/api/src/services/ai/`.
  - [x] **U-07.4:** Viết API endpoint `POST /api/admin/auto-posts/generate-plan` và `POST /api/admin/auto-posts/ingest-plan`.
- [x] **US-08: In-Process Scheduler & Full Article Generation Pipeline**
  - [x] **U-08.1:** Cài đặt `node-cron` và xây dựng `AutoPostSchedulerService` trong `apps/api/src/services/`.
  - [x] **U-08.2:** Viết pipeline tự động sinh bài viết hoàn chỉnh `executeAutoPostGeneration` (tạo Tiptap AST, SEO score, lưu DB).
  - [x] **U-08.3:** Viết API endpoint `POST /api/admin/auto-posts/run-now` hỗ trợ kích hoạt tức thì.
  - [x] **U-08.4:** Ghi nhận nhật ký thực thi vào `auto_post_logs` và viết API `GET /api/admin/auto-posts/logs`.
  - [x] **U-08.5:** Khởi động Scheduler an toàn trong vòng đời server `apps/api/src/server.ts`.
- [x] **US-09: Admin UI Management Portal**
  - [x] **U-09.1:** Xây dựng service client `auto-post.service.ts` trong `apps/admin/services/`.
  - [x] **U-09.2:** Xây dựng trang `/posts/auto-schedule` với form cấu hình Scheduler, switch Bật/Tắt và nút "⚡ Viết Bài Ngay".
  - [x] **U-09.3:** Xây dựng modal "✨ AI Lập Kế Hoạch 30 Ngày" kèm bảng preview và nút nạp vào hàng đợi.
  - [x] **U-09.4:** Xây dựng bảng Hàng đợi kế hoạch bài viết (`ContentPlanQueueTable.tsx`) kèm phân trang và lọc trạng thái.
  - [x] **U-09.5:** Xây dựng bảng Nhật ký thực thi (`AutoPostLogsTable.tsx`) kèm trạng thái thành công/thất bại.
  - [x] **U-09.6:** Thêm nút điều hướng tiện ích tại Header trang `/posts`.
  - [x] **U-09.7:** Tự động đồng bộ khung giờ đăng và tái phân bổ lịch xuất bản cho các bài viết đang chờ trong hàng đợi khi thay đổi cấu hình lịch trình (Dynamic Queue Rescheduling & Sync Time).
- [x] **Machine Verification:** Chạy `pnpm check-types` toàn monorepo và `pnpm --filter @cardealer/core test` (25/25 suites passed).

---

## 📌 Phase 5: Independent Code Review & Self-Correction
- [x] Khởi tạo review loop với 9 layers audit và tạo file `CODE_REVIEW.md`.
- [x] Thẩm định 20 tệp mã nguồn và xác nhận 0 blocker finding.
- [x] Hoàn tất kiểm thử và đóng gói hồ sơ Gate 5 (`AUDIT_GATE_5.md`).

---

## 📌 Phase Bonus: Memory Governance
- [x] Cập nhật `OVERVIEW.md` trạng thái `🟢 Active / Production Ready`.
- [x] Đóng gói bài học kinh nghiệm và kiến trúc mẫu vào `MEMORY.md`.
