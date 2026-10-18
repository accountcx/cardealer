# 🗄️ SCHEMA: Static Pages CMS & Showroom System Settings

> **Module:** `static-pages`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), `packages/database/src/schema/static-pages.ts`, `system_settings.ts`  

---

## 1. Mô Hình Thực Thể Thực Tế (Database Tables)

### 🔹 Bảng `static_pages` (Trang Tĩnh Động)
```sql
CREATE TABLE static_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    template_type VARCHAR(50) DEFAULT 'DEFAULT' NOT NULL,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    canonical_url VARCHAR(500),
    og_image VARCHAR(500),
    no_index BOOLEAN DEFAULT FALSE NOT NULL,
    schema_type VARCHAR(50) DEFAULT 'WebPage',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX static_pages_slug_uidx ON static_pages (slug);
CREATE INDEX static_pages_slug_published_idx ON static_pages (slug, is_published);
CREATE INDEX static_pages_admin_list_idx ON static_pages (is_published, template_type, updated_at);
```

### 🔹 Bảng `system_settings` (Cấu Hình Hệ Thống & Showroom)
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX system_settings_key_idx ON system_settings (key);
```

---

## 2. Ma Trận Chuyển Trạng Thái Trang Tĩnh (State Transition Matrix)

| Trạng Thái Ban Đầu | Hành Động Kích Hoạt | Trạng Thái Đích | Điều Kiện Hợp Lệ |
| :--- | :--- | :--- | :--- |
| `draft` | Bật xuất bản | `published` | Bắt buộc có tiêu đề, slug hợp lệ và nội dung không rỗng |
| `published` | Chuyển về nháp | `draft` | Người dùng có quyền `pages:write` |
| `draft` / `published` | Xóa trang | `deleted` | Người dùng có quyền `pages:delete` |
