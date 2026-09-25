# 🛡️ BÁO CÁO ĐÁNH GIÁ MA TRẬN RỦI RO (RISK AUDIT & MITIGATION PLAN)
## Phase 5: Hệ Thống Tin Tức, Content Blocks & Inbound Marketing Hub (Hyundai Vinh)

> **Mã Epic:** `EPIC-PHASE-5-CONTENT-BLOCKS-INBOUND`  
> **Quy chuẩn thực thi:** **Universal Agentic Workflow (v2.2.0)** — Giai đoạn 3 (Risk Audit)  
> **Chuyên gia phụ trách:** `dependency-graph-analyzer`, `qa-test-engineer`, `technical-seo-auditor`  
> **Phiên bản:** v1.0.0 (Áp dụng cho Option B + Tiptap Editor + CRO Tinh Gọn)

---

## 1. Tổng Quan & Bán Kính Ảnh Hưởng (Blast Radius)

Hệ thống Tin tức & Inbound Marketing Phase 5 can thiệp vào nhiều lớp kiến trúc trong Monorepo:
1. **Lớp Dữ Liệu (`packages/database`):** Thêm 4 bảng mới (`posts`, `categories`, `post_tags`, `redirects`) và mở rộng bảng `leads`.
2. **Lớp Lõi Xử Lý AST (`packages/core`):** Phân tích cú pháp Tiptap JSON AST, tính điểm SEO 10 tiêu chí, sinh mã JSON-LD Schema.
3. **Lớp Giao Diện Storefront (`apps/web`):** Server Component kết hợp Client Islands, Middleware 301 Redirect, Mobile Sticky Bar, Exit-Intent Banner.
4. **Lớp Quản Trị Editorial (`apps/admin`):** Bộ soạn thảo WYSIWYG Tiptap Editor với React NodeViews, link preview bí mật.

Do đó, việc nhận diện trước các rủi ro kỹ thuật, thuật toán tìm kiếm và hành vi người dùng là điều kiện tiên quyết để đảm bảo hệ thống vận hành ổn định, không gây lỗi downtime và không bị phạt bởi thuật toán tìm kiếm.

---

## 2. Ma Trận Đánh Giá Rủi Ro Toàn Diện (Risk Matrix)

| Mã Rủi Ro | Hạng Mục | Rủi Ro Nhận Diện | Khả Năng (P) | Mức Độ (S) | Mức Rủi Ro | Biện Pháp Phòng Ngừa & Giảm Thiểu (Mitigation Strategy) |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **R-01** | **SEO & Thuật toán** | **Google Cloaking Penalty** do khối `GatedContent` ẩn nội dung với người dùng nhưng mở cho Googlebot. | Trung bình | Rất cao | 🔴 **CRITICAL** | Tự động chèn Paywall Schema chuẩn W3C/Google vào thẻ `<script type="application/ld+json">`: `isAccessibleForFree: false` và `cssSelector: ".gated-content-section"`. Googlebot nhận diện đây là cơ chế trả phí/đăng ký hợp lệ, không phạt lỗi Cloaking. |
| **R-02** | **SEO & Ranking** | **Vòng lặp chuyển hướng 301 (Redirect Loop) hoặc chuỗi vô tận** khi BTV đổi slug qua lại giữa bài viết cũ và mới. | Trung bình | Cao | 🟠 **HIGH** | 1. Middleware kiểm tra đệ quy tối đa 3 bước.<br>2. Hook cập nhật Slug trong Admin tự động quét bảng `redirects`: Nếu phát hiện `newPath` trùng với một `oldPath` đã có, tự động nắn thẳng đường dẫn (Flatten redirect chain: A ➔ B ➔ C thành A ➔ C và B ➔ C).<br>3. Chặn tuyệt đối việc tạo redirect trỏ về chính nó (`oldPath === newPath`). |
| **R-03** | **UX & Responsive** | **Bảng dữ liệu `TableBlock` vỡ khung ngang trên Mobile (375px/390px)** làm hỏng giao diện bài viết. | Cao | Trung bình | 🟠 **HIGH** | 1. Bọc thẻ `<table>` trong thẻ `<div>` có `overflow-x-auto` và `-webkit-overflow-scrolling: touch`.<br>2. Thêm hiệu ứng bóng mờ gradient (Shadow Fade) ở mép phải bảng để báo hiệu trực quan cho người dùng vuốt ngang.<br>3. Mặc định `min-w-[540px]` để các cột không bị ép chữ đến mức rách dòng. |
| **R-04** | **Hiệu Năng (CWV)** | **Video TikTok kéo tụt chỉ số Core Web Vitals (LCP, TBT)** do tải script nhúng nặng từ máy chủ ngoài. | Rất cao | Cao | 🔴 **CRITICAL** | Áp dụng **Facade Pattern**: Ban đầu chỉ tải ảnh poster tĩnh WebP (lấy từ coverUrl) kèm nút Play SVG. Chỉ khi người dùng click vào nút Play mới inject thẻ `<iframe>` thực tế với tham số `autoplay=1`. Giữ nguyên LCP < 1.5s và TBT = 0ms. |
| **R-05** | **UI/UX TikTok** | **Thanh cuộn dọc/ngang kép khó chịu bên trong khung nhúng TikTok trên Mobile.** | Cao | Trung bình | 🟡 **MEDIUM** | Áp dụng triệt để bộ CSS Utilities khử thanh cuộn độc quyền: `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]` và cố định tỉ lệ khung hình `aspect-[9/16]`. |
| **R-06** | **Tương Thích Editor** | **Hydration Mismatch giữa Server Component (RSC) và Tiptap React NodeViews.** | Trung bình | Cao | 🟠 **HIGH** | Phía Storefront (`apps/web`) **KHÔNG** nạp thư viện Tiptap Editor runtime. Server Component chạy hàm chuyển đổi thuần TypeScript `renderTiptapToHtml()` bóc tách trực tiếp cây JSON AST thành thẻ HTML ngữ nghĩa (`<p>`, `<h2>`, `<table>`). Tiptap Editor chỉ được nạp tại trang quản trị Admin (`apps/admin`). |
| **R-07** | **Dữ Liệu & Fallback** | **Bài viết cũ hoặc bài viết nháp thiếu Tiptap JSON AST gây sập trang chi tiết.** | Thấp | Cao | 🟡 **MEDIUM** | Hàm render bọc trong khối `try/catch` có cơ chế Graceful Fallback: Nếu JSON AST không hợp lệ, tự động render chuỗi `htmlContent` thuần túy dự phòng hoặc hiển thị thông báo an toàn, không bao giờ ném lỗi HTTP 500 ra Storefront. |
| **R-08** | **SEO Onpage** | **Trùng lặp từ khóa & Cannibalization** giữa bài viết tin tức và trang danh mục xe `/xe/[slug]`. | Trung bình | Trung bình | 🟡 **MEDIUM** | Bộ chấm điểm SEO 10 tiêu chí trong Admin có quy tắc quét từ khóa chính (Focus Keyword): Cảnh báo màu vàng nếu từ khóa chính trùng với tên thương mại của một dòng xe đang bán (đề xuất đổi sang từ khóa dài, ví dụ: thay vì "Hyundai Tucson" ➔ "Đánh giá Hyundai Tucson 2026 tại Nghệ An"). |
| **R-09** | **Inbound Leads** | **Thất thoát nguồn gốc bài viết (Attribution Loss) khi Lead gửi từ form.** | Trung bình | Cao | 🟠 **HIGH** | Mỗi form nhúng (`InlineQuickForm`, `MobileBottomBar`, `SlideInBanner`) bắt buộc truyền ngầm các hidden fields: `postId`, `postTitle`, `authorId`, `categorySlug`, kèm bộ trích xuất UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`) từ `sessionStorage`. |
| **R-10** | **Chống Spam Form** | **Bị Bot spam gửi form giả mạo làm tràn ngập dữ liệu Lead.** | Cao | Trung bình | 🟡 **MEDIUM** | 1. Tích hợp kỹ thuật **Honeypot field** (trường ẩn mà người thật không thấy, nếu bot tự điền sẽ bị âm thầm loại bỏ).<br>2. Rate Limiting trên API `/api/leads`: Tối đa 5 lần gửi / 10 phút từ cùng 1 địa chỉ IP.<br>3. Zod validation định dạng SĐT Việt Nam chuẩn (10 chữ số, đầu số hợp lệ 03, 05, 07, 08, 09). |
| **R-11** | **Xuất File CSV** | **File CSV xuất từ `TableBlock` bị lỗi font tiếng Việt khi mở bằng Microsoft Excel.** | Cao | Thấp | 🟡 **MEDIUM** | Khi tạo Blob CSV để người dùng tải về, bắt buộc chèn tiền tố Byte Order Mark (BOM) UTF-8 `\uFEFF`. Điều này chỉ dẫn cho Excel hiển thị đúng 100% tiếng Việt có dấu. |
| **R-12** | **Quản Trị Ưu Đãi** | **Bài viết khuyến mại đã hết hạn nhưng khách hàng vẫn click đăng ký, gây khiếu nại.** | Trung bình | Trung bình | 🟡 **MEDIUM** | Bổ sung trường `expiredPromoDate` trong bảng `posts`. Nếu ngày hiện tại vượt quá ngày này, Storefront tự động hiển thị dải thông báo màu xám nhạt: *"Lưu ý: Chương trình ưu đãi này đã kết thúc vào ngày DD/MM/YYYY. Vui lòng liên hệ Hotline để nhận báo giá mới nhất."* nhưng vẫn giữ bài để hưởng traffic SEO. |
| **R-13** | **TOC Scrollspy** | **Thanh Mục Lục Bài Viết (Sticky TOC) giật lag hoặc active sai tiêu đề khi cuộn nhanh.** | Trung bình | Thấp | 🟢 **LOW** | Sử dụng `IntersectionObserver` với `rootMargin: "-80px 0% -60% 0%"` thay vì lắng nghe sự kiện `window.onscroll` liên tục. Đảm bảo mượt mà 60fps trên mọi thiết bị. |
| **R-14** | **Exit-Intent Banner** | **Banner trượt góc làm phiền người dùng nhiều lần hoặc che mất nội dung đọc trên Mobile.** | Cao | Trung bình | 🟡 **MEDIUM** | 1. Khi người dùng đóng banner, ghi cờ `sessionStorage.setItem('dismiss_banner', '1')` — không bao giờ hiển thị lại trong cùng phiên duyệt web.<br>2. Trên Mobile: Không kích hoạt theo Exit-intent (vốn không có con trỏ chuột) mà chỉ kích hoạt khi lướt sâu qua 60% bài viết và có khoảng trễ 1.5s.<br>3. Kích thước nhỏ gọn ở góc phải dưới, không che mất `PostBottomBar`. |

---

## 3. Kế Hoạch Ứng Phó Khẩn Cấp (Rollback Strategy)

Nếu trong quá trình triển khai xảy ra sự cố nghiêm trọng ảnh hưởng đến hệ sinh thái Storefront:
1. **Sự cố Drizzle Schema / Migration:**
   - Các bảng mới (`posts`, `categories`, `post_tags`, `redirects`) hoàn toàn độc lập và không làm biến đổi cấu trúc bảng `cars` hay `settings` sẵn có.
   - Bảng `leads` chỉ bổ sung thêm các cột mới có giá trị `NULLABLE` (`postId`, `authorId`, `sourceType`, `utmSource`), đảm bảo các tính năng nhận lead của Phase 1–4 không bị gián đoạn dù schema chưa có dữ liệu.
2. **Sự cố Tiptap AST Rendering:**
   - Bộ bóc tách được thiết kế theo mô hình bọc cách ly (`Isolated Boundary`). Nếu một khối block tùy biến bị lỗi render, khối đó sẽ hiển thị một khối thông báo tĩnh hoặc fallback về văn bản thô mà không làm sập toàn bộ trang bài viết.
3. **Sự cố Middleware 301 Redirect:**
   - Bọc trong khối kiểm tra try/catch; nếu có lỗi kết nối cơ sở dữ liệu, middleware tự động gọi `NextResponse.next()` để tiếp tục chu trình xử lý mà không chặn người dùng truy cập.
