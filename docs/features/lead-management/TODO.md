# 📝 TODO: Lead Management & Notification Engine

- [x] **US-01: Admin CRM - Xóa Yêu Cầu Báo Giá & Hồ Sơ Vay**
  - [x] Thêm quyền `'leads:delete'` vào `packages/types/src/permission.ts` (admin, manager).
  - [x] Thêm endpoint `DELETE /api/admin/leads/:id` trong `apps/api/src/routes/admin/leads.ts`.
  - [x] Ghi nhận Audit Log vào bảng `audit_logs` khi xóa lead.
  - [x] Cập nhật `leadService.deleteLead(id)` trong `apps/admin/services/lead.service.ts`.
  - [x] Thêm nút Xóa và Confirm Modal trong `apps/admin/app/leads/page.tsx` và `LeadDetailModal.tsx`.

- [x] **US-02: Email Notification Engine khi Khách Hàng Submit Form**
  - [x] Bổ sung cấu hình biến môi trường SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `LEAD_NOTIFICATION_EMAIL`) trong `packages/env` và `.env.example`.
  - [x] Xây dựng dịch vụ `EmailService` với Nodemailer trong `apps/api/src/services/email/email.service.ts`.
  - [x] Tích hợp trigger gửi email bất đồng bộ không chặn trong `apps/api/src/routes/leads.ts`.
  - [x] Thiết kế mẫu Email HTML thương hiệu Hyundai sang trọng, đầy đủ thông tin khách hàng và nút bấm gọi điện/xem CRM.

- [x] **US-03: Refactor Email Dispatcher sang Resend REST API (v1.1.0)**
  - [x] Cài đặt `resend` package trong `apps/api`.
  - [x] Bổ sung biến môi trường `RESEND_API_KEY` và `RESEND_FROM` trong `packages/env`, `.env.example`, `.env`.
  - [x] Tái cấu trúc `EmailService` ưu tiên Resend SDK làm First-class Citizen với Fallback kép (SMTP & Simulated Mode).
  - [x] Tách biệt helper `buildLeadNotificationSubject` thuần túy trong `@cardealer/core`.
  - [x] Xác thực live delivery gửi email thành công qua Resend API (ID: `01a14fea-ee3d-7c47-af6c-46eb42de58e5`).
  - [x] Cập nhật tài liệu hướng dẫn vận hành Resend chi tiết trong `README.md`.

- [x] **Testing & Independent Review**
  - [x] Viết unit tests cho RBAC `leads:delete`, Email Template, Subject builder và `EmailService`.
  - [x] Kiểm chứng máy toàn diện (check-types, test suite exit code 0).
  - [x] Cập nhật living documentation theo chuẩn UAW v5.1.0.
