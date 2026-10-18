# 🏛️ Architectural Solution Options: Quản Trị Chuyên Mục Bài Viết (Admin Categories Management)

## 1. Bối cảnh & Ràng buộc Kỹ thuật (Technical Constraints)
* **Dự án:** CarDealer Monorepo (`/Users/nhatphan/Code/CarDealer/cardealer`)
* **Phạm vi Nền tảng:** Full-stack Monorepo:
  - Database: PostgreSQL 16 + Drizzle ORM (`packages/database`)
  - Types: Zod schemas & TypeScript types (`packages/types`)
  - API: Node.js HTTP/REST Server (`apps/api`)
  - Admin: Next.js 15 App Router (`apps/admin`)
  - Web: Next.js 15 Storefront (`apps/web`)
* **Ràng buộc Môi trường:** 🟢 **Pure Development (Sandbox)**
* **Yêu cầu Cốt lõi:**
  1. Danh mục 1 tầng (Flat Taxonomy), mỗi bài viết (`posts`) thuộc đúng 1 chuyên mục (`categories`).
  2. Slug tự sinh chuẩn tiếng Việt không dấu, nhưng cho phép Admin sửa tay tự do.
  3. Bắt buộc Unique Slug: Báo lỗi nếu trùng, cấm tự ý thêm hậu tố `-1`, `-2`.
  4. Hiển thị số lượng bài viết (`postCount`) trên bảng danh sách của Admin.
  5. Chặn xóa danh mục (Restrict Delete Guard) nếu còn bài viết đang gán vào.

---

## 2. Ma trận So sánh Phương án Kỹ thuật (Trade-off Matrix)

Trong môi trường Drizzle ORM + REST API Node.js, điểm kiến trúc then chốt cần giải quyết là: **Cách thức tính toán và trả về `postCount` (số bài viết thuộc chuyên mục) cùng cơ chế Restrict Delete Guard.**

| Tiêu chí So sánh | Option A: Drizzle Aggregate Query (`leftJoin` + `count` + `groupBy`) | Option B: Denormalized Column (`post_count`) + DB Triggers | Option C: Two-step Query (Fetch Categories then Query In-Memory Map) |
| :--- | :--- | :--- | :--- |
| **Mô hình Dữ liệu** | Giữ nguyên schema hiện tại của `categories`, không thêm cột mới. | Thêm cột `post_count integer default 0` vào bảng `categories`, viết Trigger hoặc Transaction cập nhật. | Giữ nguyên schema, API thực hiện 2 câu SELECT riêng biệt và gom nhóm bằng JavaScript Map. |
| **Hiệu năng Truy vấn API** | **Cực nhanh (1 câu SQL duy nhất):** PostgreSQL xử lý `LEFT JOIN` với index trên `posts.category_id` trong ~2-5ms. | Nhanh nhất (O(1) đọc thẳng cột có sẵn). | Khá nhanh với lượng dữ liệu nhỏ (<10.000 bài viết), nhưng lãng phí RAM khi dữ liệu lớn. |
| **Tính Toàn vẹn Dữ liệu** | **100% Tuyệt đối:** Luôn phản ánh chính xác số lượng bài viết thực tế trong bảng `posts`, không bao giờ bị lệch số liệu. | Nguy cơ lệch số liệu (drift) nếu có bài viết bị xóa/sửa trực tiếp ngoài trigger. | 100% Tuyệt đối (tính toán realtime). |
| **Độ Phức Tạp Triển Khai** | **Rất thấp:** Chỉ viết 1 query trong Drizzle ORM (`db.select({ ... }).from(categories).leftJoin(...)`). | Cao: Phải viết migration Drizzle, tạo DB trigger hoặc quản lý transaction phức tạp. | Thấp: Logic ghép mảng trong Node.js. |
| **Cơ chế Chặn Xóa (Delete Guard)** | API kiểm tra: `SELECT count(*) FROM posts WHERE category_id = :id`. Nếu `> 0` ➡️ trả về `400 Bad Request` + message tiếng Việt; đồng thời Foreign Key `onDelete: 'restrict'` làm chốt chặn tầng DB. | Kiểm tra `category.postCount > 0` ➡️ chặn xóa. | Tương tự Option A. |
| **Khuyến nghị Áp dụng** | 🌟 **KHUYẾN NGHỊ CHỌN (Option A)** — Tối ưu nhất cho Drizzle ORM, zero schema change, data luôn chính xác 100%. | Phù hợp khi có hàng triệu bài viết và hàng nghìn categories. | Không tối ưu bằng Option A. |

---

## 3. Chi tiết Phương án Đề xuất: Option A (Drizzle SQL Aggregate)

### 3.1. Cú pháp Drizzle Query Tối ưu
```typescript
// apps/api/src/routes/posts.ts (hoặc routes/admin/categories.ts)
const categoriesWithCount = await db
  .select({
    id: schema.categories.id,
    tenChuyenMuc: schema.categories.tenChuyenMuc,
    slug: schema.categories.slug,
    moTa: schema.categories.moTa,
    sortOrder: schema.categories.sortOrder,
    createdAt: schema.categories.createdAt,
    updatedAt: schema.categories.updatedAt,
    postCount: sql<number>`cast(count(${schema.posts.id}) as integer)`,
  })
  .from(schema.categories)
  .leftJoin(schema.posts, eq(schema.posts.categoryId, schema.categories.id))
  .groupBy(schema.categories.id)
  .orderBy(asc(schema.categories.sortOrder), desc(schema.categories.createdAt));
```

### 3.2. Cơ chế Delete Guard 2 Lớp (Dual-Layer Guard)
1. **Lớp 1 (Nghiệp vụ API):**
   ```typescript
   const [result] = await db
     .select({ count: sql<number>`cast(count(*) as integer)` })
     .from(schema.posts)
     .where(eq(schema.posts.categoryId, id));

   if (result.count > 0) {
     return sendJson(400, {
       success: false,
       error: {
         code: 'CATEGORY_IN_USE',
         message: `Không thể xóa chuyên mục này vì đang có ${result.count} bài viết liên kết. Vui lòng chuyển bài viết sang chuyên mục khác trước khi xóa.`,
       },
     });
   }
   ```
2. **Lớp 2 (PostgreSQL Foreign Key Constraint):**
   - Đã được định nghĩa sẵn trong schema: `categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'restrict' })`.
   - Ngăn chặn mọi hành vi xóa rỗng từ bất kỳ nguồn nào.

### 3.3. Cơ chế Slug Tiếng Việt Chuẩn SEO
1. Tạo tiện ích `slugifyVN(text: string): string` chuyển đổi tiếng Việt chuẩn (xóa dấu, thay `đ/Đ` thành `d`, ký tự đặc biệt thành dấu `-`, loại bỏ `-` thừa).
2. Khi Admin gõ tên chuyên mục trên giao diện Form:
   - Nếu trường Slug chưa được sửa thủ công: Tự động cập nhật theo tên.
   - Nếu Admin click sửa Slug: Cho phép sửa tự do, validate regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
3. Kiểm tra Unique:
   ```typescript
   const existing = await db.query.categories.findFirst({
     where: and(eq(schema.categories.slug, slug), id ? ne(schema.categories.id, id) : undefined),
   });
   if (existing) {
     return sendJson(409, {
       success: false,
       error: {
         code: 'SLUG_CONFLICT',
         message: 'Slug này đã tồn tại trên hệ thống. Vui lòng chọn một slug khác.',
       },
     });
   }
   ```

---

## 4. Quyết định Đề xuất

> 🌟 **CHỌN OPTION A: Drizzle Aggregate Query (`leftJoin` + `count` + `groupBy`)**

* **Lý do:** Khai thác sức mạnh tự nhiên của PostgreSQL và Drizzle ORM, không cần can thiệp migration sửa bảng DB, loại bỏ hoàn toàn rủi ro lệch số liệu đếm, mang lại hiệu năng cao và code ngắn gọn, type-safe 100%.
