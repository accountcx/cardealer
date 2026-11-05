# 🌊 FLOW: Technical SEO & Organic Traffic Flow Specification

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Tài liệu tham chiếu:** [BACKLOG.md](./BACKLOG.md) | [SOLUTION_OPTIONS.md](./SOLUTION_OPTIONS.md)

---

## 1. Sequence Diagram: Luồng Thu Thập Dữ Liệu Của Googlebot & Canonical Resolution

```mermaid
sequenceDiagram
    autonumber
    actor Bot as Googlebot / Social Crawler
    participant Router as Next.js App Router (SSR)
    participant Meta as generateMetadata()
    participant Core as Structured Data Engine (@cardealer/core)
    participant Page as Server Component Page (RSC)
    participant Cache as Next.js ISR Data Cache

    Bot->>Router: GET /gia-lan-banh/tucson
    Router->>Meta: Khởi tạo Metadata Context
    Meta->>Cache: Nạp thông tin xe slug='tucson'
    Cache-->>Meta: Dữ liệu xe Tucson & bảng giá các phiên bản
    Meta-->>Router: Title, Description, Canonical='/gia-lan-banh/tucson', OG Image
    
    Router->>Page: Render Component với props { carSlug: 'tucson' }
    Page->>Core: generateCarJsonLd() + generateWebApplicationJsonLd()
    Core-->>Page: JSON-LD Script (@graph: WebApplication, Product, Offer, FAQPage)
    Page-->>Router: Trả về Full HTML có sẵn Content, Headings & Schema (CLS=0)
    Router-->>Bot: HTTP 200 OK (Full SSR Body)
```

---

## 2. Sequence Diagram: Luồng On-Demand Cache Revalidation & Sync

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên (Admin Portal)
    participant CMS as Admin Backend API
    participant Revalidate as /api/revalidate (Storefront)
    participant ISR as Next.js Tag/Path Cache
    actor Bot as Googlebot

    Admin->>CMS: Xuất bản bài viết mới / Cập nhật giá niêm yết xe
    CMS->>CMS: Lưu CSDL thành công
    CMS->>Revalidate: POST /api/revalidate?secret=SECURE_TOKEN { path: '/tin-tuc' }
    Revalidate->>Revalidate: Kiểm tra Secret Token hợp lệ
    alt Token Hợp Lệ
        Revalidate->>ISR: revalidatePath('/tin-tuc') & revalidateTag('catalog-cars')
        ISR-->>Revalidate: Cache purged
        Revalidate-->>CMS: HTTP 200 { revalidated: true }
    else Token Không Hợp Lệ
        Revalidate-->>CMS: HTTP 401 Unauthorized
    end

    Bot->>Revalidate: GET /tin-tuc (Lần crawl tiếp theo)
    Revalidate-->>Bot: Phục vụ HTML mới tinh ngay lập tức (Không chờ 60s)
```

---

## 3. State Machine: Vòng Đời URL & Canonical Resolution State Machine

```mermaid
stateDiagram-v2
    [*] --> RequestReceived: Nhận Request từ Client/Bot

    state RequestReceived {
        [*] --> CheckExactMatch
        CheckExactMatch --> RedirectLookup: Không khớp route tĩnh
        CheckExactMatch --> RouteHandler: Khớp route hợp lệ
    }

    RedirectLookup --> Middleware301: Tìm thấy bản ghi Redirect trong CSDL
    RedirectLookup --> NotFound404: Không tìm thấy tài nguyên (notFound())

    Middleware301 --> [*]: Trả HTTP 301 Permanent Redirect kèm Link Equity
    NotFound404 --> [*]: Trả HTTP 404 Entity (robots noindex, follow)

    RouteHandler --> CheckCanonical: Khởi tạo Metadata
    CheckCanonical --> CleanCanonical: Có query params (?xe=...&tab=...)
    CleanCanonical --> StripQuery: Cắt bỏ query params rác
    StripQuery --> InjectCanonical: Gắn link rel="canonical" chuẩn
    CheckCanonical --> InjectCanonical: URL sạch nguyên bản

    InjectCanonical --> Serve200: Trả về HTTP 200 OK với đầy đủ Schema JSON-LD
    Serve200 --> [*]
```

---

## 4. Ma Trận Thất Bại Tương Tác (Interaction Failure Matrix / FMEA)

| Cặp tương tác | Kịch bản thất bại tiềm ẩn (Failure Mode) | Tác động SEO | Cơ chế phòng vệ & Phục hồi |
| :--- | :--- | :--- | :--- |
| **Googlebot ↔ Sitemap** | URL bị redirect hoặc 404 lọt vào `sitemap.xml` | GSC cảnh báo đỏ, giảm uy tín crawl budget của toàn site | Bộ lọc kiểm tra trạng thái HTTP 200 trước khi xuất bản; loại bỏ triệt để các URL redirect tạm thời (như `/tra-gop` cũ). |
| **Admin ↔ Revalidate Webhook** | Webhook revalidate timeout hoặc secret sai lệch | Cache storefront bị chậm cập nhật so với CMS | Thiết kế Fail-Open: Ghi log cảnh báo, không chặn luồng publish của Admin; hệ thống tự động fallback về Time-based ISR 60 giây. |
| **Social Crawler ↔ OG Image** | Ảnh OG không tồn tại (404) hoặc sai định dạng MIME | Mạng xã hội từ chối preview snippet hoặc hiển thị khoảng trắng | Cung cấp file ảnh tĩnh nhị phân thật (True Binary 1200x630 JPG/PNG); URL ảnh tuyệt đối có `metadataBase` bảo vệ. |
| **Người Dùng ↔ Bộ Lọc Danh Mục** | Query param rác hoặc tham số lọc quá sâu | Nguy cơ Duplicate Content hoặc lãng phí Crawl Budget | Cố định thẻ `canonical: '/xe'` trên trang danh mục bất kể query params; bộ lọc chạy in-memory client island. |
| **Client ↔ Slug Dòng Xe** | Khách truy cập slug xe đã xóa hoặc chưa xuất bản | Nguy cơ Soft-404 nếu trả về trang trắng 200 | Kích hoạt `notFound()` trả về mã trạng thái HTTP 404 thực thể với `robots: { index: false, follow: true }`. |
| **Hero Banner ↔ Thẻ H1** | Admin tắt Hero Banner sự kiện trên trang chủ | Trang chủ hoàn toàn mất thẻ `<h1>` | Cơ chế Fallback H1 tự động: Render thẻ H1 dự phòng chứa nhận diện thương hiệu Showroom khi banner tắt. |
| **Crawler ↔ Thẻ Ảnh Tin Tức** | Dùng thẻ `<img>` thô tải ảnh kích thước lớn | Tụt điểm Core Web Vitals (LCP > 2.5s, CLS > 0.1) | Chuẩn hóa 100% sang `<Image>` Next.js có định dạng WebP/AVIF, responsive `sizes` và placeholder chống layout shift. |
