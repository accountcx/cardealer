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


