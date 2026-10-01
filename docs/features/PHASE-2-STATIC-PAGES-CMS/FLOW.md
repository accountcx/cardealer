# 🔄 Technical Flow Specification: PHASE 2 - STATIC-PAGES-CMS

> **Mã Epic**: `EPIC-PHASE-2-STATIC-PAGES-CMS`  
> **Dự án**: CarDealer CMS & Storefront  
> **Giai đoạn**: Phase 2 - Step 2.2: Logic Flow  
> **Lead Role**: `logic-flow-ba`  
> **Tiêu chuẩn quy trình**: Universal Agentic Workflow v2.2  

---

## 1. Sequence Diagram Đa Tầng (End-to-End Sequence)

### 1.1 Luồng Quản Trị: Tạo Mới & Xuất Bản Trang Tĩnh (Admin Flow - US-02, US-03)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👨‍💼 Biên Tập Viên (Admin)
    participant FE as 🖥️ Admin UI (PageForm)
    participant API as ⚙️ API Controller (/api/admin/pages)
    participant SVC as 🧠 StaticPagesService
    participant DB as 🗄️ PostgreSQL (Drizzle ORM)
    participant WEB as 🌐 Web Storefront Cache (Next.js)

    Admin->>FE: Nhập Tiêu đề, Nội dung Tiptap, Cấu hình SEO
    Note over FE: Auto-slugify tiêu đề thành slug (vd: gioi-thieu)<br/>SERP Preview cập nhật thời gian thực
    FE->>FE: Client-side Validation (Kiểm tra RESERVED_SLUGS)
    alt Slug nằm trong danh sách cấm (RESERVED_SLUGS)
        FE-->>Admin: Hiển thị lỗi đỏ: "Slug này trùng với route hệ thống!"
    else Slug hợp lệ
        FE->>API: POST /api/admin/pages (Payload JSON + Bearer JWT)
        API->>API: Xác thực JWT & Quyền RBAC (admin/manager/editor)
        API->>SVC: createPage(validatedInput)
        SVC->>DB: Query kiểm tra trùng slug: SELECT id FROM static_pages WHERE slug = ?
        alt Slug đã tồn tại trong DB
            DB-->>SVC: Trả về bản ghi trùng
            SVC-->>API: Ném lỗi ConflictException (SLUG_ALREADY_EXISTS)
            API-->>FE: HTTP 409 Conflict + Error Envelope
            FE-->>Admin: Báo lỗi "Slug đã được sử dụng bởi trang khác"
        else Slug duy nhất
            SVC->>DB: INSERT INTO static_pages (...) VALUES (...) RETURNING *
            DB-->>SVC: Trả về bản ghi mới tạo
            opt isPublished === true
                SVC->>WEB: Gọi webhook revalidateTag('static-pages') & revalidatePath('/[slug]')
                WEB-->>SVC: Cache purged OK
            end
            SVC-->>API: Trả về StaticPage entity
            API-->>FE: HTTP 201 Created + StaticPage JSON
            FE-->>Admin: Toast thành công, điều hướng về /pages hoặc /pages/[id]
        end
    end
```

---

### 1.2 Luồng Khách Truy Cập Ngoài Storefront (Public Catch-all Route - US-04)

```mermaid
sequenceDiagram
    autonumber
    actor Guest as 👤 Khách Truy Cập / Google Bot
    participant Route as 🌐 apps/web/app/[slug]/page.tsx
    participant Meta as 🏷️ generateMetadata()
    participant SVC as 🧠 StaticPagesService
    participant DB as 🗄️ PostgreSQL (Drizzle ORM)
    participant UI as 🎨 Template Dispatcher

    Guest->>Route: Truy cập URL https://xehyundaivinh.com/:slug
    par 1. Khởi tạo Metadata SSR
        Route->>Meta: Kích hoạt generateMetadata({ params })
        Meta->>SVC: getPublishedPageBySlug(slug)
        SVC->>DB: SELECT * FROM static_pages WHERE slug = ? AND is_published = true
        alt Bản ghi không tồn tại hoặc isPublished = false
            DB-->>SVC: Null
            SVC-->>Meta: Null
            Meta-->>Route: Fallback generic metadata (hoặc noIndex)
        else Tìm thấy trang hợp lệ
            DB-->>SVC: StaticPage row
            SVC-->>Meta: StaticPage data
            Meta-->>Route: Inject Head: title, description, canonical, ogImage, robots
        end
    and 2. Render Giao Diện Page Component
        Route->>SVC: getPublishedPageBySlug(slug)
        SVC->>DB: SELECT * FROM static_pages WHERE slug = ? AND is_published = true (ISR cached)
        alt Trang không tồn tại HOẶC isPublished = false
            DB-->>SVC: Null
            SVC-->>Route: Null
            Route->>Route: Gọi Next.js notFound()
            Route-->>Guest: Render HTTP 404 Not Found Page
        else Trang hợp lệ và đã xuất bản
            DB-->>SVC: StaticPage row
            SVC-->>Route: StaticPage data
            Route->>UI: Dispatcher(page.templateType)
            alt templateType === 'PROFILE_SHOWROOM'
                UI-->>Guest: Render ProfileShowroomTemplate (Hồ sơ saler, bản đồ 3S)
            else templateType === 'TIMELINE'
                UI-->>Guest: Render TimelineProcessTemplate (5 bước mua xe)
            else templateType === 'FINANCE'
                UI-->>Guest: Render FinanceCalcTemplate (Bảng vay vốn & lãi suất)
            else templateType === 'DEFAULT' (hoặc fallback)
                UI-->>Guest: Render DefaultLegalTemplate (Typography pháp lý, TOC)
            end
        end
    end
```

---

## 2. Entity State Machine Diagram (Vòng Đời Trang Tĩnh)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Tạo mới trang tĩnh (Mặc định isPublished = false)
    
    DRAFT --> PUBLISHED : Admin bật switch "Xuất bản" & Lưu (isPublished = true)
    DRAFT --> DELETED : Admin bấm Xóa vĩnh viễn
    
    PUBLISHED --> DRAFT : Admin tắt switch "Xuất bản" (Gỡ bài về nháp)
    PUBLISHED --> PUBLISHED : Cập nhật nội dung / Cấu hình SEO (Kích hoạt on-demand cache revalidation)
    PUBLISHED --> DELETED : Admin bấm Xóa vĩnh viễn (Kích hoạt cache purge)
    
    DELETED --> [*] : Bản ghi bị xóa khỏi PostgreSQL
```

* **Trạng thái DRAFT (Bản nháp)**:
  * Hiển thị trong Admin với badge màu vàng `"Bản nháp"`.
  * Tuyệt đối không xuất hiện trên Storefront (khách truy cập nhận mã HTTP 404).
  * Không xuất hiện trong sitemap.xml.
* **Trạng thái PUBLISHED (Đã xuất bản)**:
  * Hiển thị trong Admin với badge màu xanh lá `"Đã xuất bản"`.
  * Render công khai tại URL `https://xehyundaivinh.com/[slug]`.
  * Tự động đưa vào sitemap.xml (nếu `noIndex === false`).
* **Trạng thái DELETED (Đã xóa)**:
  * Xóa vĩnh viễn khỏi DB, xóa sạch cache liên quan.

---

## 3. Bảng Giải Phẫu Từng Bước (Step Anatomy Table)

| Bước # | Lát Cắt | Tác Nhân | Hành Động & Payload | Logic Xử Lý & Ràng Buộc Nghiệp Vụ | Output & State Thay Đổi | Cơ Chế Xử Lý Lỗi / Rollback |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **01** | `US-01` | System | Drizzle Migration Script | Chạy lệnh DDL tạo bảng `static_pages` kèm unique index trên cột `slug` và composite index `(slug, is_published)`. | Bảng `static_pages` sẵn sàng trong DB. | Rollback migration nếu database lỗi kết nối hoặc cú pháp. |
| **02** | `US-03` | Admin | Nhập tiêu đề trang | Giao diện tự động sinh slug dạng kebab-case không dấu (vd: "Giới thiệu Hyundai" ➡️ `gioi-thieu`). | Input slug được điền giá trị. | Cho phép Admin chỉnh sửa thủ công slug nếu cần tùy biến. |
| **03** | `US-03` | Admin | Chỉnh sửa SEO fields | Gõ `metaTitle` và `metaDescription`. SERP Preview cập nhật text, URL, favicon thời gian thực; thanh đếm ký tự đổi màu: Xanh (50-60/150-160), Vàng, Đỏ. | State form Admin cập nhật. | Giới hạn max-length cứng ngăn chặn nhập tràn bộ nhớ. |
| **04** | `US-02` | Admin | Bấm "Lưu thay đổi" (Submit form) | Validate Zod schema: kiểm tra title không rỗng, slug chuẩn định dạng regex `^[a-z0-9-]+$`, slug không thuộc `RESERVED_SLUGS`. | Gửi request `POST` hoặc `PUT` lên API. | Báo lỗi inline ngay tại input nếu validation client không thỏa mãn. |
| **05** | `US-02` | API | Nhận request từ Admin | Xác thực Bearer JWT token, kiểm tra role `ADMIN` hoặc `MANAGER`. Kiểm tra trùng lặp slug trong DB. | Tạo mới / cập nhật row trong `static_pages`. | Trả HTTP 401 nếu hết hạn phiên đăng nhập; HTTP 409 nếu trùng slug. |
| **06** | `US-02` | Service | Cache Invalidation Hook | Nếu `isPublished === true`, kích hoạt webhook xóa cache Next.js cho tag `static-pages` và path `/[slug]`. | Cache Storefront bị vô hiệu hóa. | Ghi log cảnh báo nếu webhook revalidate thất bại, không làm hỏng transaction DB. |
| **07** | `US-04` | Guest | Truy cập `/[slug]` ngoài Web | Server Component nhận `params.slug`. Query DB tìm kiếm bản ghi với điều kiện `slug = :slug AND is_published = true`. | Render template tương ứng hoặc gọi `notFound()`. | Nếu DB timeout ➡️ Render màn hình Error boundary thân thiện; nếu không có bản ghi ➡️ 404. |
| **08** | `US-04` | Client | Render Template | Template Dispatcher kiểm tra `page.templateType` để render 1 trong 4 giao diện (`PROFILE_SHOWROOM`, `DEFAULT`, `TIMELINE`, `FINANCE`). | Giao diện người dùng hoàn chỉnh. | Fallback về `DefaultLegalTemplate` nếu `templateType` không hợp lệ. |

---

## 4. Kịch Bản Biên & Cơ Chế Khôi Phục (Edge Cases & Resilience)

1. **Trùng lặp Slug với Tĩnh Tuyến Cấp 1 (Reserved Slugs Collision)**:
   * *Rủi ro*: Người dùng đặt slug là `xe`, `dong-xe`, `tin-tuc`, `gia-lan-banh`, `tra-gop`, `admin`, `api`, `login`, `preview`.
   * *Xử lý*: Khai báo danh sách bất biến `RESERVED_SLUGS` trong `@cardealer/core`. API ném lỗi `422 Unprocessable Entity` kèm thông điệp: `"Slug '[slug]' được dành riêng cho hệ thống, vui lòng chọn đường dẫn khác"`.
2. **Khách vãng lai cố tình truy cập trang Bản Nháp (Draft Access Attempt)**:
   * *Rủi ro*: Khách mò ra URL của trang đang soạn thảo chưa công bố.
   * *Xử lý*: Câu lệnh query bắt buộc có mệnh đề `is_published = true`. Nếu bản ghi có `is_published = false`, hàm trả về `null` và kích hoạt `notFound()` ngay lập tức.
3. **Nội dung Tiptap JSON rỗng hoặc sai cấu trúc AST**:
   * *Rủi ro*: Trang mới tạo chưa có nội dung hoặc JSON hỏng.
   * *Xử lý*: Trình Renderer AST kiểm tra: Nếu `!page.content || !page.content.content || page.content.content.length === 0` ➡️ hiển thị fallback empty state nhẹ nhàng thay vì làm crash toàn bộ Server Component.
4. **Trang được đánh dấu `noIndex: true`**:
   * *Rủi ro*: Google bot cào vào trang chính sách nội bộ.
   * *Xử lý*: `generateMetadata()` tự động gán `robots: { index: false, follow: false }`, đồng thời loại bỏ trang khỏi danh sách URL của `sitemap.xml`.
