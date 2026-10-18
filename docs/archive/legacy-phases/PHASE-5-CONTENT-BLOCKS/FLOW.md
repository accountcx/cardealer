# 🔄 Detailed Logic & Sequence Flows: Hệ Thống Tin Tức, Content Blocks & Inbound Marketing (Tiptap Engine)

> **Mã Epic:** `EPIC-PHASE-5-CONTENT-TIPTAP-INBOUND`  
> **Giai đoạn:** Giai đoạn 2 — Bước 2.2 (Gate 2: Thiết Kế Kiến Trúc Chi Tiết)  
> **Role phụ trách:** `logic-flow-ba`  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`SOLUTION_OPTIONS.md`](./SOLUTION_OPTIONS.md), [`docs/SYSTEM_MAP.md`](../../SYSTEM_MAP.md)  
> **Trạng thái Môi trường:** 🟢 Pure Development  

---

## 1. Sơ Đồ Tuần Tự Biên Tập & Xuất Bản Bài Viết (Admin Editorial Flow)

Quy trình biên tập nội dung trên Admin Portal sử dụng **Tiptap Editor (`@tiptap/react`)** với các React Component NodeViews:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Biên tập viên / Saler
    participant Editor as Tiptap Editor UI (Admin)
    participant Validator as Pre-Publish Quality Guard
    participant API as Backend API (apps/api)
    participant DB as PostgreSQL (Drizzle ORM)
    participant Cache as Next.js Cache Revalidation

    Admin->>Editor: 1. Soạn bài, chèn 8 Blocks (TikTok, Bảng giá, Callout, Table...)
    Admin->>Editor: 2. Nhập Tiêu đề, Chuyên mục, Ảnh bìa + Alt, Meta Description
    Admin->>Editor: 3. Bấm "Xuất bản" (hoặc "Hẹn giờ" / "Lưu nháp")

    Editor->>Validator: 4. Kiểm tra điều kiện chất lượng nội dung
    Note over Validator: - Tiêu đề >= 20 ký tự<br/>- Không còn ký tự mẫu [...]<br/>- Bài "Giao xe" phải tích xác nhận ảnh<br/>- Kiểm tra Alt ảnh đại diện
    
    alt Không đạt chuẩn
        Validator-->>Admin: Báo lỗi chi tiết & giữ nguyên trạng thái
    else Đạt chuẩn
        Validator->>API: 5. POST/PUT /api/admin/posts (Payload kèm Tiptap JSON AST)
        API->>DB: 6. Kiểm tra Slug trùng lặp
        alt Slug đã tồn tại của bài khác
            API->>API: Tự động thêm hậu tố (-1, -2) hoặc báo lỗi
        end
        
        alt Đổi Slug bài đã xuất bản
            API->>DB: 7a. Tự động ghi bản ghi Redirect 301 (oldSlug -> newSlug)
        end

        API->>DB: 8. Insert/Update bảng posts, post_tags
        API->>Cache: 9. Gọi revalidateTag('posts-list') & revalidateTag(`post-${slug}`)
        API-->>Editor: 10. Trả về HTTP 200 OK { success: true, post }
        Editor-->>Admin: 11. Toast thông báo thành công & Link xem trực tiếp
    end
```

---

## 2. Sơ Đồ Tuần Tự Server-First Storefront Rendering (RSC & SEO Engine)

Luồng kết xuất trang chi tiết bài viết `/tin-tuc/[slug]` trên `apps/web` bằng **Next.js Server Component (RSC)** kết hợp bộ bóc tách Tiptap AST tại `packages/core`:

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng / Googlebot
    participant NextServer as Next.js Server Component (RSC)
    participant Core as packages/core (AST Extractor)
    participant DB as PostgreSQL (Drizzle ORM)
    participant Browser as Browser Client (Islands)

    User->>NextServer: 1. GET /tin-tuc/[slug]
    NextServer->>DB: 2. Query post by slug (status = 'published')
    
    alt Bài viết không tồn tại
        NextServer-->>User: 3a. Trả về trang 404 thân thiện (gợi ý bài mới & xe hot)
    else Bài viết hợp lệ
        NextServer->>Core: 4. Nạp Tiptap JSON AST ngầm trên Server
        
        par Trích xuất Dữ liệu Kỹ thuật ngầm
            Core->>Core: 4a. extractHeadingsFromTiptap (H2, H3 -> Cây Mục Lục TOC)
            Core->>Core: 4b. extractFaqsFromTiptap (Câu hỏi & Trả lời)
            Core->>Core: 4c. extractVideosFromTiptap (TikTok & YouTube IDs)
            Core->>Core: 4d. checkGatedContent (Phát hiện khối nội dung khóa)
        end

        par Sinh Schema JSON-LD đa tầng
            Core->>NextServer: 5a. Schema NewsArticle (kèm Person Saler E-E-A-T)
            Core->>NextServer: 5b. Schema FAQPage (nếu có FAQBlock)
            Core->>NextServer: 5c. Schema VideoObject (nếu có TikTok/YouTube)
            Core->>NextServer: 5d. Paywall Schema isAccessibleForFree: false (nếu có Gated Content)
        end

        NextServer->>NextServer: 6. Render Server HTML sạch (100% SEO Text, H2/H3 có id anchor)
        NextServer-->>Browser: 7. Xuất HTML thuần + JSON-LD (TTFB < 50ms, LCP < 1.2s)
        
        Note over Browser: Googlebot đọc xong 100% nội dung ngay tại bước 7!

        Browser->>Browser: 8. Hydrate các Client Islands có ranh giới:
        Note over Browser: - TikTokBlock (Facade Poster -> Click Play nạp iframe)<br/>- TableBlock (Debounced Search & Sort client-side)<br/>- Sticky TOC (IntersectionObserver bắt scrollspy)<br/>- InlineQuickForm & GatedContent Unlocker<br/>- PostBottomBar (Mobile CTA)
    end
```

---

## 3. Sơ Đồ Tuần Tự Thu Thập Inbound Lead & Mở Khóa Gated Content

Luồng tiếp nhận khách hàng điền số điện thoại nhận báo giá hoặc mở khóa bảng tính ưu đãi lăn bánh:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách đọc bài viết
    participant Island as Client Island (Form / Gated Content)
    participant API as Backend API (apps/api)
    participant DB as PostgreSQL (Drizzle ORM)

    Customer->>Island: 1. Nhập Số điện thoại / Zalo (và chọn dòng xe quan tâm)
    Customer->>Island: 2. Bấm "Nhận Báo Giá Ngay" (hoặc "Mở Khóa Bảng Tính")
    
    Island->>Island: 3. Validate số điện thoại (10 chữ số VN: regex /^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    
    alt SĐT không hợp lệ
        Island-->>Customer: Hiển thị lỗi đỏ: "Số điện thoại không đúng định dạng"
    else SĐT hợp lệ
        Island->>API: 4. POST /api/leads { soDienThoai, hoTen, dongXeQuanTam, postId, salerId, utmSource, utmCampaign }
        API->>DB: 5. Ghi Lead vào bảng leads (gắn foreign key postId, salerId)
        API-->>Island: 6. Trả về HTTP 200 OK { success: true, leadId } (< 200ms)
        
        alt Nguồn từ Gated Content
            Island->>Island: 7a. Xóa lớp phủ mờ (blur), hiển thị dữ liệu thật tức thì
            Island-->>Customer: Thông báo: "Đã mở khóa bảng tính chi tiết!"
        else Nguồn từ Inline Form / Bottom Bar
            Island-->>Customer: 7b. Toast thành công: "Chuyên viên tư vấn sẽ liên hệ gửi ưu đãi sớm nhất!"
        end
    end
```

---

## 4. Sơ Đồ Tuần Tự Động Cơ 301 Redirect Engine (Bảo Toàn PageRank)

Quy trình tự động hóa chuyển hướng khi biên tập viên thay đổi đường dẫn URL bài viết:

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Khách truy cập link cũ / Googlebot
    participant MW as Next.js Middleware (apps/web)
    participant API as Backend API / Cache
    participant DB as PostgreSQL (redirects table)
    participant Target as Trang bài viết mới

    Visitor->>MW: 1. Yêu cầu GET /tin-tuc/gia-xe-tucson-cu
    MW->>API: 2. Kiểm tra path trong Bảng Redirects (In-memory lookup / DB query < 2ms)
    
    alt Không có trong bảng redirects
        API-->>MW: Không tìm thấy
        MW->>Target: Cho request đi tiếp vào App Router bình thường
    else Tìm thấy bản ghi Redirect
        API-->>MW: Trả về { oldPath: "/tin-tuc/gia-xe-tucson-cu", newPath: "/tin-tuc/gia-xe-tucson-moi-nhat", code: 301 }
        MW-->>Visitor: 3. Trả về HTTP 301 Moved Permanently<br/>Location: /tin-tuc/gia-xe-tucson-moi-nhat
        Note over Visitor: Trình duyệt & Googlebot cập nhật link mới ngay lập tức.<br/>PageRank và Backlink được bảo toàn 100%!
    end
```

---

## 5. Sơ Đồ Tuần Tự Kích Hoạt Slide-in Banner (Popup Trượt Góc Tinh Tế)

Cơ chế kích hoạt thông minh không làm phiền người đọc:

```mermaid
sequenceDiagram
    autonumber
    actor Reader as Người đọc bài viết
    participant Hook as useSlideInTrigger Hook
    participant Storage as Browser sessionStorage
    participant Banner as SlideInBanner Component

    Reader->>Hook: 1. Người dùng bắt đầu đọc bài viết
    Hook->>Storage: 2. Kiểm tra sessionStorage.getItem('slide_in_dismissed')
    
    alt Đã đóng trước đó trong phiên
        Storage-->>Hook: 'true' -> Hủy toàn bộ listener (Không kích hoạt nữa)
    else Chưa đóng
        Storage-->>Hook: null / 'false'
        
        par Lắng nghe trên Desktop
            Hook->>Hook: Theo dõi sự kiện mouseleave (con trỏ chuột rời mép trên màn hình - Exit Intent)
        and Lắng nghe trên Mobile
            Hook->>Hook: Theo dõi sự kiện scroll (Scroll Depth > 60% chiều dài bài viết)
        end

        Hook->>Banner: 3. Kích hoạt trigger hiển thị
        Banner->>Banner: 4. Hiệu ứng trượt êm ái từ góc phải dưới màn hình (Slide-in Spring animation)
        Banner-->>Reader: 5. Hiển thị banner ưu đãi nhỏ gọn (kèm nút [X] đóng rõ ràng)
        
        alt Người dùng bấm nút [X] đóng
            Reader->>Banner: Click [X]
            Banner->>Storage: 6a. Ghi sessionStorage.setItem('slide_in_dismissed', 'true')
            Banner->>Banner: Trượt thu lại và biến mất
        else Người dùng bấm nhận ưu đãi
            Reader->>Banner: Click "Xem Ưu Đãi"
            Banner->>Reader: 6b. Cuộn êm ái đến Form báo giá gần nhất
        end
    end
```
