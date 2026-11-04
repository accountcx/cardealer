# 🗄️ SCHEMA: Content Management & Tiptap Editorial Engine

> **Module:** `content-management`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), `packages/database/src/schema/posts.ts`, `media.ts`  

---

## 1. Mô Hình Thực Thể Thực Tế (Database Tables)

### 🔹 Bảng `categories` (Chuyên Mục Tin Tức)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_chuyen_muc VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    mo_ta TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX categories_slug_idx ON categories (slug);
CREATE INDEX categories_sort_idx ON categories (sort_order);
```

### 🔹 Bảng `posts` (Bài Viết & Khối Nội Dung Tiptap)
```sql
CREATE TYPE post_status AS ENUM ('draft', 'published', 'scheduled', 'archived');

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tieu_de VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    anh_dai_dien_url VARCHAR(500) NOT NULL,
    anh_dai_dien_alt VARCHAR(255) NOT NULL,
    tom_tat TEXT,
    noi_dung JSONB NOT NULL, -- Tiptap JSON AST Tree
    status post_status DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    expired_promo_date TIMESTAMPTZ,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    featured_order INTEGER DEFAULT 0 NOT NULL,
    reading_time INTEGER DEFAULT 1 NOT NULL,
    word_count INTEGER DEFAULT 0 NOT NULL,
    focus_keyword VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    canonical_url VARCHAR(500),
    no_index BOOLEAN DEFAULT FALSE NOT NULL,
    preview_token VARCHAR(64),
    view_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX posts_slug_idx ON posts (slug);
CREATE INDEX posts_status_scheduled_idx ON posts (status, scheduled_at);
CREATE INDEX posts_category_status_idx ON posts (category_id, status);
CREATE INDEX posts_featured_idx ON posts (is_featured, featured_order);
```

### 🔹 Bảng `media` (Thư Viện Ảnh Đám Mây Cloudinary)
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(255) NOT NULL UNIQUE,
    url VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    alt VARCHAR(255) NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

## 2. Ma Trận Chuyển Trạng Thái Bài Viết (State Transition Matrix)

| Trạng Thái Ban Đầu | Hành Động Kích Hoạt | Trạng Thái Đích | Điều Kiện Hợp Lệ |
| :--- | :--- | :--- | :--- |
| `draft` | Bấm xuất bản | `published` | Bắt buộc có tiêu đề, chuyên mục, ảnh đại diện và nội dung Tiptap hợp lệ |
| `draft` | Hẹn giờ đăng | `scheduled` | Thời gian `scheduledAt` phải lớn hơn thời điểm hiện tại |
| `scheduled` | Tự động kích hoạt | `published` | Thời điểm hiện tại $\ge$ `scheduledAt` |
| `published` | Hạ bài | `draft` | Biên tập viên có quyền `posts:write` |
| `published` | Khuyến mãi hết hạn | `archived` | Quá thời hạn `expiredPromoDate` |

---

## 3. Cấu Trúc Tiptap Link Mark AST trong JSONB `noi_dung` (US-04)

Các đoạn văn bản chứa liên kết nội bộ được lưu trữ chuẩn mực theo Tiptap Spec bên trong trường `posts.noi_dung`:

```json
{
  "type": "paragraph",
  "content": [
    {
      "type": "text",
      "text": "Khám phá chi tiết dòng xe "
    },
    {
      "type": "text",
      "text": "Hyundai Santa Fe 2026",
      "marks": [
        {
          "type": "link",
          "attrs": {
            "href": "/dong-xe/santa-fe"
          }
        }
      ]
    },
    {
      "type": "text",
      "text": " cùng chính sách ưu đãi lăn bánh mới nhất."
    }
  ]
}
```

---

## 4. Đặc Tả Cấu Trúc Dữ Liệu Ý Tưởng Bài Viết (`TopicIdeaItem`)

```typescript
export const TopicIdeaItemSchema = z.object({
  title: z.string().min(5, 'Tiêu đề ý tưởng phải có ít nhất 5 ký tự'),
  slug: z.string().min(3),
  focusKeyword: z.string().min(2, 'Từ khóa chính không được để trống'),
  angle: z.string().min(3, 'Góc tiếp cận độc bản'),
  contentGap: z.string().min(5, 'Mô tả khoảng trống nội dung'),
  summary: z.string().min(10, 'Tóm tắt nội dung ý tưởng'),
  targetCar: z.string().optional(),
  suggestedCategory: z.string().optional(),
  outlinePreview: z.array(z.string()).optional(),
  searchIntent: z.enum(['informational', 'commercial', 'transactional', 'navigational']).optional(),
});

export type TopicIdeaItem = z.infer<typeof TopicIdeaItemSchema>;
```

---

## 5. Bảng Dữ Liệu Lập Lịch & Hàng Đợi Kế Hoạch Đăng Bài (US-06 / v1.4.0)

### 🔹 Bảng `auto_post_settings` (Cấu Hình Toàn Cục Tự Động Viết Bài)
```sql
CREATE TABLE auto_post_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    cron_expression VARCHAR(50) DEFAULT '0 8 * * *' NOT NULL, -- Mặc định 8:00 sáng mỗi ngày
    default_status VARCHAR(20) DEFAULT 'draft' NOT NULL,      -- 'draft' hoặc 'published'
    default_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    default_author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 🔹 Bảng `content_plan_items` (Hàng Đợi Kế Hoạch Biên Tập Nội Dung 30 Ngày)
```sql
CREATE TYPE content_plan_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE content_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    focus_keyword VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    target_car VARCHAR(100),
    angle TEXT,
    summary TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status content_plan_status DEFAULT 'pending' NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX content_plan_status_scheduled_idx ON content_plan_items (status, scheduled_at);
CREATE INDEX content_plan_category_idx ON content_plan_items (category_id);
```

### 🔹 Bảng `auto_post_logs` (Nhật Ký Thực Thi Tác Vụ Tự Động)
```sql
CREATE TABLE auto_post_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type VARCHAR(30) NOT NULL, -- 'cron' | 'manual_run_now'
    plan_item_id UUID REFERENCES content_plan_items(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    post_title VARCHAR(255),
    status VARCHAR(20) NOT NULL,       -- 'success' | 'failed'
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX auto_post_logs_created_idx ON auto_post_logs (created_at DESC);
CREATE INDEX auto_post_logs_status_idx ON auto_post_logs (status);
```

---

## 6. Ma Trận Trạng Thái Hàng Đợi Kế Hoạch (`content_plan_items`)

| Trạng Thái Ban Đầu | Hành Động | Trạng Thái Đích | Điều Kiện Hợp Lệ |
| :--- | :--- | :--- | :--- |
| `[Khởi tạo]` | AI nạp kế hoạch hoặc Admin thêm | `pending` | Tiêu đề, từ khóa và ngày hẹn hợp lệ |
| `pending` | Scheduler nhận xử lý / Run-now | `processing` | Đạt lịch hẹn hoặc kích hoạt thủ công, chưa bị khóa |
| `processing` | AI sinh bài & lưu DB thành công | `completed` | `post_id` được ghi nhận, bài viết hợp lệ |
| `processing` | Lỗi API / Timeout / Exception | `failed` | `error_message` được lưu vết, không crash hệ thống |
| `failed` | Admin bấm "Thử lại" (Retry) | `pending` | Chuyển lại hàng đợi chờ lượt chạy tiếp theo |
| `pending` | Admin bấm xóa | `[Đã Xóa]` | Xóa vĩnh viễn khỏi hàng đợi |

---

## 7. Cấu Trúc Dữ Liệu Zod Schemas Kế Hoạch Nội Dung (Types)

```typescript
export const AutoPostSettingsSchema = z.object({
  id: z.string().default('default'),
  isEnabled: z.boolean().default(false),
  cronExpression: z.string().default('0 8 * * *'),
  defaultStatus: z.enum(['draft', 'published']).default('draft'),
  defaultCategoryId: z.string().uuid().nullable().optional(),
  defaultAuthorId: z.string().uuid().nullable().optional(),
});

export const ContentPlanItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5),
  slug: z.string().optional().nullable(),
  focusKeyword: z.string().min(2),
  categoryId: z.string().uuid().nullable().optional(),
  targetCar: z.string().nullable().optional(),
  angle: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  scheduledAt: z.coerce.date(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  postId: z.string().uuid().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
```


