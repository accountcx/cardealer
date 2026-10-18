# 🔄 Logic Flow: Lead Management & Notification Engine

> **Module Slug:** `lead-management`  
> **Status:** Living Document  
> **Author:** Logic Flow BA

---

## 1. Sequence Diagram: Tiếp Nhận Lead & Gửi Email Tức Thì (US-02)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Storefront)
    participant Ingest as Lead Router (POST /api/leads)
    participant RateLimit as Rate Limiter & Honeypot
    participant DB as PostgreSQL (Drizzle ORM)
    participant MailService as Email Dispatcher (Resend / SMTP)
    participant Resend as Resend API (HTTPS REST)
    participant SMTP as SMTP Mail Server (Fallback)
    actor Saler as Email Showroom / Saler

    Customer->>Ingest: Gửi thông tin (Họ tên, SĐT, Dòng xe, Tỉnh thành, Ghi chú)
    Ingest->>RateLimit: Kiểm tra IP Rate limit & Honeypot field
    alt Vượt rate limit hoặc bot spam
        RateLimit-->>Customer: Trả lời 429 hoặc giả lập 200 (discard bot)
    else Hợp lệ
        RateLimit->>DB: Kiểm tra deduplication trong 10 phút
        alt Trùng lặp SĐT + Xe gần đây
            DB-->>Customer: Trả về 200 (isDuplicate: true)
        else Yêu cầu mới
            Ingest->>DB: INSERT INTO leads (...) VALUES (...) RETURNING *
            DB-->>Ingest: LeadRecord mới tạo (ID, status: new)
            
            Ingest-->>Customer: HTTP 201 Created { success: true, data: LeadRecord }
            Note over Ingest,Customer: Phản hồi siêu tốc < 150ms cho khách hàng!
            
            critical Bất đồng bộ gửi Email Thông báo (Non-blocking)
                Ingest-)MailService: triggerLeadNotificationEmail(LeadRecord)
                MailService->>MailService: Đọc cấu hình Resend / SMTP & Template HTML Hyundai
                alt Có RESEND_API_KEY hợp lệ
                    MailService->>Resend: resend.emails.send({ from, to, subject, html })
                    Resend-->>Saler: Gửi email thông báo tức thì (Inbox 99.9%)
                else Có cấu hình SMTP cũ
                    MailService->>SMTP: transporter.sendMail(to, subject, htmlContent)
                    SMTP-->>Saler: Gửi email qua SMTP fallback
                else Chưa cấu hình dịch vụ mail
                    MailService->>MailService: Ghi log [Email Service] Simulated dispatch (no-op)
                end
            end
        end
    end
```

---

## 2. Sequence Diagram: Quản Trị Viên Xóa Lead (US-01)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên (Admin / Manager)
    participant UI as Admin Datatable (/leads)
    participant Modal as Confirm Delete Modal
    participant API as Admin Lead Route (DELETE /api/admin/leads/:id)
    participant RBAC as RBAC Guard (leads:delete)
    participant DB as PostgreSQL (Drizzle ORM)

    Admin->>UI: Nhấp biểu tượng Thùng rác trên hàng Lead
    UI->>Modal: Mở Modal cảnh báo xóa (Tên khách hàng, SĐT)
    Admin->>Modal: Bấm nút "Xác Nhận Xóa"
    Modal->>API: DELETE /api/admin/leads/:id (kèm Bearer Token)
    API->>RBAC: checkPermission(currentUser.role, 'leads:delete')
    alt Vai trò không đủ quyền (sales / editor)
        RBAC-->>Modal: HTTP 403 Forbidden
        Modal-->>Admin: Hiển thị lỗi từ chối quyền
    else Có quyền (admin / manager)
        RBAC->>DB: findFirst(leads.id == :id)
        alt Không tìm thấy
            DB-->>Modal: HTTP 404 Not Found
        else Tìm thấy Lead
            DB->>DB: DELETE FROM leads WHERE id = :id
            DB->>DB: INSERT INTO audit_logs (userId, action: 'DELETE', entity: 'leads', ...)
            DB-->>API: Thành công
            API-->>Modal: HTTP 200 { success: true, message: "Đã xóa lead thành công" }
            Modal->>UI: Đóng modal, xóa dòng khỏi UI (Optimistic/State Update), hiện Toast thành công
        end
    end
```
