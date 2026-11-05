# 💡 SOLUTION OPTIONS: SEO Optimization Architecture Design

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Mục tiêu:** Đánh giá trade-offs giữa các phương án kiến trúc kỹ thuật trước khi đặc tả chi tiết.

---

## 1. Bài Toán 1: Xử Lý URL `/tra-gop` & Sitemap Canonical Alignment

### Bối cảnh:
Hiện tại `apps/web/app/tra-gop/route.ts` trả về HTTP 307 Temporary Redirect sang `/gia-lan-banh?tab=tra-gop`, nhưng trong `sitemap.ts` lại khai báo `/tra-gop` là một URL tĩnh ưu tiên cao (priority 0.8). Điều này vi phạm nghiêm trọng chuẩn Google Search Central ("Redirect in sitemap").

### Các Phương Án:
| Tiêu chí | Option A: Giữ Route Handler 301 + Xóa Khỏi Sitemap | Option B (Đề xuất): Nâng Cấp Thành Dedicated Landing Page `/tra-gop` |
| :--- | :--- | :--- |
| **Kiến trúc** | Sửa 307 thành 301, gỡ URL `/tra-gop` khỏi `sitemap.ts`. | Xây dựng Server Component `apps/web/app/tra-gop/page.tsx` độc lập, tái sử dụng component tính lãi suất ngân hàng. |
| **Giá trị SEO** | Thấp. Không thể xếp hạng từ khóa *"mua xe trả góp"* vì URL chỉ là bước chuyển hướng. | Rất cao. Chiếm lĩnh chùm từ khóa *"Mua xe ô tô Hyundai trả góp Nghệ An"* với search volume lớn. |
| **Nỗ lực Dev** | Thấp (~15 phút). | Trung bình (~1-2 giờ). |
| **Khuyến nghị** | Không tối ưu cho tăng trưởng traffic. | **CHỌN OPTION B:** Tách thành Landing Page chuyên biệt, có metadata và Canonical độc lập, phục vụ chuyển đổi lead vay ngân hàng. |

---

## 2. Bài Toán 2: Chiến Lược Open Graph Images & Social SERP

### Bối cảnh:
`public/images/og-image.jpg` là file SVG giả mạo khiến Zalo/Facebook Crawler lỗi hiển thị. Các ảnh phân khúc `og-sedan.webp`, `og-suv.webp` không tồn tại (404).

### Các Phương Án:
| Tiêu chí | Option A: Chỉ cung cấp ảnh tĩnh nhị phân (Static True Binary) | Option B (Đề xuất): Kết hợp Ảnh Tĩnh Nhị Phân Chuẩn + Dynamic Fallback |
| :--- | :--- | :--- |
| **Kiến trúc** | Tạo các file JPG/WebP thật 1200x630px đặt vào `public/images/`. | Cung cấp bộ ảnh tĩnh chuẩn thương hiệu 1200x630px cho Brand/Segment/Catalog + tận dụng ảnh đại diện động của Xe/Bài viết khi chia sẻ link chi tiết. |
| **Độ tin cậy** | 100% không bị phụ thuộc tài nguyên CPU runtime. | Tối ưu tuyệt đối cho cả trang tĩnh lẫn bài viết/dòng xe động. |
| **Khuyến nghị** | Đạt yêu cầu. | **CHỌN OPTION B:** Tạo ngay bộ ảnh tĩnh nhị phân hợp lệ, đồng thời chuẩn hóa URL tuyệt đối `https://...` cho toàn bộ ảnh xe/bài viết. |

---

## 3. Bài Toán 3: Cache Invalidation & Real-Time Sync (ISR vs On-Demand)

### Bối cảnh:
Dự án dùng Time-based ISR 60s (`revalidate = 60`). Khi Admin cập nhật giá niêm yết hoặc đăng bài viết khuyến mãi flash-sale, Googlebot có thể cào phải cache cũ.

### Các Phương Án:
| Tiêu chí | Option A: Giữ nguyên Time-based ISR 60s | Option B (Đề xuất): Dual Mode (Time-based ISR 60s + On-Demand Webhook API) |
| :--- | :--- | :--- |
| **Cơ chế** | Phụ thuộc hoàn toàn vào chu kỳ 60 giây. | Giữ ISR 60s làm lưới an toàn, bổ sung route `POST /api/revalidate` có Secret Token để xóa cache tức thì khi Admin publish. |
| **Tác động Bot** | Chậm cập nhật khi có biến động giá. | Bot cào ngay dữ liệu mới nhất (Freshness Signal cao). |
| **Khuyến nghị** | Dễ triển khai nhưng thụ động. | **CHỌN OPTION B:** Bổ sung `/api/revalidate` và RSS Feed `/feed.xml` để Google News và bot lập tức nhận diện bài viết mới. |

---

## 4. Bài Toán 4: Programmatic SEO Cho Dự Toán Lăn Bánh

### Bối cảnh:
Ý định tìm kiếm lớn nhất của người mua xe là *"Giá lăn bánh [Tên Xe]"*. Hiện tại chỉ có URL chung `/gia-lan-banh?xe=tucson`.

### Các Phương Án:
| Tiêu chí | Option A: Dùng Query Params `/gia-lan-banh?xe=tucson` | Option B (Đề xuất): Dynamic Route `/gia-lan-banh/[carSlug]` |
| :--- | :--- | :--- |
| **Indexability** | Thấp. Dễ bị trùng lặp canonical hoặc bị bot coi là faceted query. | Tối ưu 100%. Mỗi xe có một URL tĩnh độc lập, Title & H1 cá nhân hóa, Schema Product riêng. |
| **Khuyến nghị** | Không thể lên Top từ khóa ngách. | **CHỌN OPTION B:** Xây dựng `/gia-lan-banh/[carSlug]`, tự động sinh sitemap và internal linking từ trang chi tiết xe `/xe/[carSlug]`. |
