# 🧪 Test Plan: Lead Management & Notification Engine

> **Module Slug:** `lead-management`  
> **Status:** Living Document  
> **Author:** QA Test Engineer  
> **Version:** 1.1.0

---

## 1. Ma Trận Kiểm Thử Tự Động (Automated Test Matrix)

| Mã Test | Loại kiểm thử | Đối tượng kiểm tra | Kết quả kỳ vọng |
| :---: | :---: | :--- | :--- |
| **TC-LEAD-01** | Unit Test | `hasPermission('admin', 'leads:delete')` | Trả về `true` |
| **TC-LEAD-02** | Unit Test | `hasPermission('manager', 'leads:delete')` | Trả về `true` |
| **TC-LEAD-03** | Unit Test | `hasPermission('sales', 'leads:delete')` | Trả về `false` (Không được xóa) |
| **TC-LEAD-04** | Unit Test | `hasPermission('editor', 'leads:delete')` | Trả về `false` (Không được xóa) |
| **TC-LEAD-05** | Unit Test | `generateLeadNotificationHtml(lead)` | Tạo HTML hoàn chỉnh chứa tên khách hàng, số điện thoại, dòng xe |
| **TC-LEAD-06** | Unit Test | `buildLeadNotificationSubject(lead)` | Tạo tiêu đề email chuẩn CRM có emoji và thông tin khách |
| **TC-LEAD-07** | Unit Test | `EmailService.sendLeadNotification(lead)` khi chưa có SMTP/Resend | Không ném ngoại lệ (Graceful degradation / No crash) |
| **TC-LEAD-08** | Unit Test | `EmailService` mode selection khi có `RESEND_API_KEY` | Kích hoạt chế độ `resend` ưu tiên hàng đầu |
| **TC-LEAD-09** | Unit Test | `EmailService` mode selection khi chỉ có SMTP config | Fallback kích hoạt chế độ `smtp` an toàn |
| **TC-LEAD-10** | Integration | `DELETE /api/admin/leads/:id` không có token | Trả về HTTP 401 Unauthorized |
| **TC-LEAD-11** | Integration | `DELETE /api/admin/leads/:id` với role sales | Trả về HTTP 403 Forbidden |
| **TC-LEAD-12** | Integration | `DELETE /api/admin/leads/:id` với role admin | Xóa thành công, trả về HTTP 200 |
| **TC-LEAD-13** | Integration | `POST /api/leads` gửi thông tin hợp lệ | Lưu DB thành công, trả về HTTP 201 và trigger email ngầm |
| **TC-LEAD-14** | E2E Dispatch | Live Resend API Dispatch với key hợp lệ | Trả về ID email từ Resend (`01a14fea-...`), HTTP status 200 |

---

## 2. Kịch Bản Kiểm Thử Hồi Quy (Regression Tests)
- Đảm bảo toàn bộ test suites hiện hữu trong `packages/core` và monorepo tiếp tục đạt 100% Pass (0 errors).
- Đảm bảo chức năng tiếp nhận Lead từ các form Storefront (`POST /api/leads`) vẫn giữ nguyên Rate Limit (5 req/min) và Honeypot bot trap.
- Đảm bảo API latency phản hồi cho khách hàng nộp form duy trì mức $\le 150\text{ms}$.
