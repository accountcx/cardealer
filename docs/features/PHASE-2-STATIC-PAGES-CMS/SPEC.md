# 📐 TECHNICAL SPECIFICATION: PHASE 2 - STATIC-PAGES-CMS

> **Mã Epic**: `EPIC-PHASE-2-STATIC-PAGES-CMS`  
> **Dự án**: CarDealer CMS  
> **Phiên bản**: 1.0  
> **Tiêu chuẩn**: Universal Agentic Workflow v2.2  

---

## 1. Kiến Trúc Dữ Liệu (Database Schema)

### 1.1 Drizzle ORM Definition (`packages/database/src/schema/static-pages.ts`)
```typescript
import { pgTable, uuid, varchar, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';

export const staticPages = pgTable('static_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: jsonb('content').notNull().default({}),
  templateType: varchar('template_type', { length: 50 }).notNull().default('DEFAULT'), // 'DEFAULT' | 'PROFILE_SHOWROOM' | 'TIMELINE' | 'FINANCE'
  isPublished: boolean('is_published').notNull().default(false),
  
  // Custom Technical SEO Fields
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  ogImage: varchar('og_image', { length: 500 }),
  noIndex: boolean('no_index').notNull().default(false),
  schemaType: varchar('schema_type', { length: 50 }).default('WebPage'), // 'AboutPage' | 'HowTo' | 'WebPage'

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 1.2 TypeScript Contract (`packages/types/src/static-pages.ts`)
```typescript
export type StaticPageTemplate = 'DEFAULT' | 'PROFILE_SHOWROOM' | 'TIMELINE' | 'FINANCE';
export type StaticPageSchemaType = 'AboutPage' | 'HowTo' | 'WebPage';

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: Record<string, any>;
  templateType: StaticPageTemplate;
  isPublished: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  noIndex: boolean;
  schemaType?: StaticPageSchemaType | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaticPageInput {
  title: string;
  slug: string;
  content?: Record<string, any>;
  templateType?: StaticPageTemplate;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  schemaType?: StaticPageSchemaType;
}

export type UpdateStaticPageInput = Partial<CreateStaticPageInput>;
```

---

## 2. Thiết Kế Giao Diện CMS Admin (`apps/admin`)

### 2.1 Bố Cục 2 Cột (Two-Column Layout)
* **Cột chính (70% - Nội dung)**:
  * Ô nhập `Tiêu đề trang` (VD: "Giới thiệu Hyundai Vinh - Đại lý 3S Ủy Quyền").
  * Ô nhập `Slug` (Tự động sinh từ Tiêu đề qua hàm `slugify`, cho phép chỉnh sửa thủ công và kiểm tra trùng lặp).
  * Trình soạn thảo **Tiptap Rich-Text Editor**:
    * Thanh công cụ định dạng: Bold, Italic, H2, H3, Bullet list, Numbered list.
    * Tiện ích mở rộng chuyên dụng: Chèn ảnh từ Thư viện Media, Bảng dữ liệu (Table), Khối thông báo (Callout Box - Tip/Warning/Info), Khối câu hỏi thường gặp (FAQ Accordion).
* **Sidebar bên phải (30% - SEO & Cấu hình)**:
  * **Google SERP Preview Card**:
    * Hiển thị mô phỏng kết quả Google Search thực tế: Favicon, Breadcrumb URL (`xehyundaivinh.com › [slug]`), Title màu xanh tím chuẩn Google font, Description màu xám đậm.
    * Hỗ trợ nút chuyển đổi xem trước giao diện: Desktop / Mobile.
  * **Bộ đếm ký tự SEO**:
    * `Meta Title`: Đếm ký tự thực tế (Khuyến nghị 50-60 ký tự). Đổi màu thanh tiến trình: Xanh lá (tối ưu), Vàng (ngắn/dài), Đỏ (quá dài).
    * `Meta Description`: Đếm ký tự thực tế (Khuyến nghị 150-160 ký tự).
  * **Cấu hình Template & Schema**:
    * Chọn `Template`: Dropdown chọn 1 trong 4 mẫu giao diện.
    * Chọn `Schema Type`: Dropdown (`AboutPage`, `HowTo`, `WebPage`).
  * **Hình ảnh chia sẻ (OG:Image)**: Khung chọn ảnh từ Media Library hoặc dán URL ảnh đại diện.
  * **Chuyển đổi trạng thái**:
    * Toggle `noIndex`: Bật để gán `noindex, nofollow` cho bot Google.
    * Toggle `isPublished`: Chuyển đổi giữa Bản nháp (Draft) và Xuất bản (Published).

---

## 3. Kiến Trúc Web Client Dynamic Catch-All Route (`apps/web`)

### 3.1 Route Resolution & Fallback Pattern
File: `apps/web/app/[slug]/page.tsx` (hoặc `apps/web/app/(main)/[slug]/page.tsx`):
1. **Tránh xung đột route**:
   * Next.js App Router tự động ưu tiên các route tĩnh có tên cụ thể (`/xe`, `/tin-tuc`, `/gia-lan-banh`, `/dong-xe`).
   * Route `[slug]` chỉ bắt các đường dẫn 1 cấp không trùng với các route trên (ví dụ: `/gioi-thieu`, `/chinh-sach-bao-mat`, `/quy-trinh-mua-xe`, `/tra-gop`).
2. **Metadata Injection (`generateMetadata`)**:
   * Fetch trang từ cơ sở dữ liệu qua slug.
   * Nếu không tồn tại hoặc `isPublished === false` ➡️ trả về thẻ cơ bản hoặc gọi `notFound()`.
   * Tạo object `Metadata`:
     * `title`: `page.metaTitle || page.title`
     * `description`: `page.metaDescription`
     * `alternates.canonical`: `page.canonicalUrl || \`https://xehyundaivinh.com/\${page.slug}\``
     * `robots`: `{ index: !page.noIndex, follow: !page.noIndex }`
     * `openGraph`: `{ title, description, images: [page.ogImage] }`

### 3.2 Bộ 4 Mẫu Layout Templates (Template Dispatcher)
Dựa vào trường `templateType` của trang, Server Component sẽ render component template tương ứng:

```tsx
switch (page.templateType) {
  case 'PROFILE_SHOWROOM':
    return <ProfileShowroomTemplate page={page} />;
  case 'TIMELINE':
    return <TimelineProcessTemplate page={page} />;
  case 'FINANCE':
    return <FinanceCalcTemplate page={page} />;
  case 'DEFAULT':
  default:
    return <DefaultLegalTemplate page={page} />;
}
```

* **`PROFILE_SHOWROOM` (`/gioi-thieu`)**:
  * Hero Section: Ảnh Showroom 3S chuẩn Hyundai Thành Công, thông điệp cam kết phục vụ.
  * Hồ sơ Chuyên viên tư vấn: Ảnh chân dung tác phong chuyên nghiệp, số năm kinh nghiệm, chứng nhận hãng.
  * 4 Cam kết vàng: Xe chính hãng giao ngay, giá lăn bánh cạnh tranh, hỗ trợ thủ tục trả góp 100%, bảo hành 5 năm toàn quốc.
  * Bản đồ tương tác & Địa chỉ Showroom (Google Maps iframe).
* **`DEFAULT` (`/chinh-sach-bao-mat`)**:
  * Bố cục văn bản chuẩn tài liệu pháp lý: Typography dễ đọc, Mục lục bài viết tự động (TOC trượt bên trái).
  * Cam kết bảo mật thông tin khách hàng, số điện thoại, tài khoản định danh theo nghị định bảo vệ dữ liệu cá nhân.
* **`TIMELINE` (`/quy-trinh-mua-xe`)**:
  * Thiết kế sơ đồ 5 bước mua xe tương tác:
    1. Tư vấn chọn xe & Lái thử tận nhà.
    2. Ký hợp đồng & Đặt cọc niêm yết.
    3. Hỗ trợ thủ tục ngân hàng (nếu trả góp).
    4. Đăng ký biển số & Kiểm định PDI 100 hạng mục.
    5. Lễ bàn giao xe hoa trang trọng tại Showroom.
* **`FINANCE` (`/tra-gop`)**:
  * Bảng điều kiện vay vốn cho cá nhân & doanh nghiệp.
  * Lãi suất các ngân hàng liên kết (Vietcombank, BIDV, Techcombank, VIB...).
  * Nút dẫn trực tiếp vào công cụ tính dự toán chi tiết `/gia-lan-banh`.
