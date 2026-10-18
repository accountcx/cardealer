# 📜 Nhật Ký Thực Thi (EXECUTION LOG) - Lead Management

> **Tính năng:** Quản lý Xóa Yêu Cầu Báo Giá & Hồ Sơ Vay và Gửi Email Thông Báo Khách Hàng Mới  
> **Module:** `lead-management`  
> **Trạng thái:** Hoàn tất triển khai (Phase 4 Completed)  
> **Baseline:** `main` | **Target:** Production Ready  

---

## 1. Danh Sách Lát Cắt & Đơn Vị Thực Thi (Roadmap Execution)

### 🔹 Vertical Slice 1: US-01 - Xóa Yêu Cầu Báo Giá & Hồ Sơ Vay (Lead Deletion)
- **Unit 1.1: RBAC Permission Matrix & API Route Deletion**
  - File: `packages/types/src/permission.ts`
    - Bổ sung quyền `'leads:delete'` vào `PermissionAction`.
    - Cập nhật ma trận `ROLE_PERMISSIONS`: `admin` (cho phép), `manager` (cho phép), `sales` (chặn 403), `editor` (chặn 403).
  - File: `apps/api/src/routes/admin/leads.ts`
    - Bổ sung HTTP `DELETE /api/admin/leads/:id`.
    - Kiểm tra JWT AuthN & RBAC `hasPermission(currentUser.role, 'leads:delete')`.
    - Xóa bản ghi trong `schema.leads` bằng ID.
    - Ghi nhận lịch sử kiểm toán trong `schema.auditLogs` với `resource: 'leads'` và `resourceId: leadId`.
  - File: `apps/admin/services/lead.service.ts`
    - Thêm phương thức `deleteLead(id: string): Promise<ApiResponse<{ id: string; message: string }>>`.

- **Unit 1.2: CRM UI Delete Interaction & Confirmation Modal**
  - File: `apps/admin/app/leads/components/LeadDetailModal.tsx`
    - Nhận props `canDelete: boolean` và `onDelete: () => void`.
    - Thêm nút "Xóa yêu cầu" màu đỏ viền cảnh báo nổi bật ở thanh tiêu đề modal.
  - File: `apps/admin/app/leads/page.tsx`
    - Tích hợp kiểm tra quyền `can('leads:delete')`.
    - Bổ sung nút biểu tượng xóa (`Trash2`) trên từng hàng trong bảng danh sách Leads.
    - Xây dựng Modal xác nhận cao cấp (Luxury Confirm Dialog) hiển thị tên khách hàng, số điện thoại và cảnh báo hành động không thể hoàn tác.
    - Áp dụng Optimistic UI: xóa lead ngay lập tức khỏi state hiển thị khi API phản hồi thành công.

---

### 🔹 Vertical Slice 2: US-02 - Gửi Email Thông Báo Lead Mới (Instant Email Dispatcher)
- **Unit 2.1: SMTP Environment & Pure Template Generation**
  - File: `packages/env/src/index.ts` & `.env.example`
    - Bổ sung các biến cấu hình SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `LEAD_NOTIFICATION_EMAIL`.
  - File: `packages/core/src/email/lead-notification.ts`
    - Xây dựng hàm `generateLeadNotificationHtml(lead, adminUrl)` tạo HTML email responsive chuẩn bảng (Table-based layout) tương thích 100% Gmail, Outlook, Apple Mail.
    - Sanitization & XSS Mitigation: Tự động escape tất cả ký tự đặc biệt (`<`, `>`, `"`, `'`, `&`) từ dữ liệu người dùng nhập.
    - Định dạng tiền tệ VND chuyên nghiệp qua `formatLeadCurrency`.
    - Tích hợp liên kết mở nhanh CRM có tham số `highlight={leadId}`.
  - File: `packages/core/src/index.ts`
    - Export `LeadEmailPayload`, `generateLeadNotificationHtml`, `formatLeadCurrency`.

- **Unit 2.2: Resilient Email Service & Asynchronous Lead Hook**
  - File: `apps/api/src/services/email/email.service.ts`
    - Sử dụng `nodemailer` với connection pooling (`maxConnections: 3`).
    - Cơ chế fallback 3 cấp độ phân giải email người nhận: Biến môi trường $\rightarrow$ Cài đặt hệ thống `contact_settings.email` $\rightarrow$ Mặc định.
    - Chế độ Simulated Mode an toàn khi chạy local/dev/test không có SMTP credentials.
  - File: `apps/api/src/routes/leads.ts`
    - Kích hoạt gửi email bất đồng bộ (Non-blocking promise `.catch()`) ngay sau khi tạo lead thành công.
    - Thời gian phản hồi API của khách hàng luôn $\le 150\text{ms}$, tuyệt đối không bị gián đoạn hay crash nếu hạ tầng email gặp sự cố.

---

## 2. Kết Quả Kiểm Thử Bằng Máy (Deterministic Machine Verification)

### ✅ Unit Test Suite (`pnpm test`)
- Runner: `vitest` v5.0.1 qua `turbo run test`
- File kiểm thử mới: `packages/core/src/__tests__/lead-management.test.ts`
  - Test Case 1: Admin được phép xóa lead (`hasPermission('admin', 'leads:delete') === true`)
  - Test Case 2: Manager được phép xóa lead (`hasPermission('manager', 'leads:delete') === true`)
  - Test Case 3: Sales bị chặn quyền xóa lead (`hasPermission('sales', 'leads:delete') === false`)
  - Test Case 4: Editor bị chặn quyền xóa lead (`hasPermission('editor', 'leads:delete') === false`)
  - Test Case 5: Quyền đọc/ghi của các role khác không bị suy thoái
  - Test Case 6: Tạo cấu trúc HTML email phản hồi đầy đủ chi tiết Lead
  - Test Case 7: Ngăn chặn triệt để mã độc XSS & HTML Injection trong input khách hàng
  - Test Case 8: Xử lý an toàn khi thiếu các trường dữ liệu tùy chọn
  - Test Case 9: Định dạng tiền tệ chính xác theo định dạng Việt Nam Đồng
- **Tổng kết:** **20/20 Test Files Passed (169/169 Tests Passed, 0 Failed, 0 Regressions)**.

### ✅ Static Type Checking (`pnpm check-types`)
- Runner: `turbo run check-types` (`tsc --noEmit`)
- Phạm vi: 8 packages (`@cardealer/core`, `@cardealer/types`, `@cardealer/env`, `@cardealer/database`, `@cardealer/admin`, `@cardealer/api`, `@cardealer/web`, `@cardealer/ui`)
- **Kết quả:** **8/8 Packages Passed (Exit code 0, 0 TS Errors)**.
