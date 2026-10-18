# 🗄️ Database Schema & RBAC Permissions: Lead Management

> **Module Slug:** `lead-management`  
> **Status:** Living Document  
> **Author:** DB Schema Architect

---

## 1. Bảng Dữ Liệu Liên Quan (Entities)

### 1.1. Bảng `leads` (Hiện hữu)
Bảng lưu trữ thông tin khách hàng tiềm năng gửi từ website.

```sql
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    car_version_id UUID REFERENCES car_versions(id) ON DELETE SET NULL,
    car_model_interested VARCHAR(150),
    province VARCHAR(100) NOT NULL DEFAULT 'Vinh',
    estimated_total BIGINT,
    status lead_status_enum NOT NULL DEFAULT 'new',
    notes TEXT,
    metadata JSONB,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source_type VARCHAR(50) DEFAULT 'web_form',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_phone_created ON leads(phone, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at);
```

### 1.2. Bảng `audit_logs` (Hiện hữu)
Bảng lưu trữ nhật ký kiểm toán cho các hành động nhạy cảm (Xóa dữ liệu, Phân quyền, v.v.).

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'DELETE', 'UPDATE_STATUS'
    entity VARCHAR(50) NOT NULL, -- 'leads'
    entity_id VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 2. Ma Trận Phân Quyền RBAC Mở Rộng (`packages/types/src/permission.ts`)

Bổ sung quyền `'leads:delete'` vào ma trận phân quyền hệ thống:

| Vai Trò (Role) | `leads:read` | `leads:write` | `leads:delete` (Mới) | Ghi Chú Nghiệp Vụ |
| :--- | :---: | :---: | :---: | :--- |
| **`admin`** | ✅ Cho phép | ✅ Cho phép | ✅ **Cho phép** | Toàn quyền kiểm soát và dọn dẹp dữ liệu CRM |
| **`manager`** | ✅ Cho phép | ✅ Cho phép | ✅ **Cho phép** | Trưởng phòng được duyệt xóa lead trùng hoặc rác |
| **`sales`** | ✅ Cho phép | ✅ Cho phép | ❌ **Bị cấm** | Nhân viên kinh doanh chỉ được xem và cập nhật tiến độ tư vấn |
| **`editor`** | ✅ Cho phép | ❌ Bị cấm | ❌ **Bị cấm** | Biên tập viên chỉ xem lead liên quan đến bài viết của mình |
