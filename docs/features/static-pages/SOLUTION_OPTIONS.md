# 📐 SOLUTION OPTIONS: Core Web Vitals & PageSpeed Performance (US-03)

> **Module:** `static-pages`  
> **Lát cắt:** `US-03: Performance Optimization & Core Web Vitals`  

---

## 1. Bối Cảnh & Vấn Đề Kỹ Thuật

Báo cáo Google PageSpeed Insights ghi nhận 4 điểm nghẽn hiệu suất trên Storefront:
1. **Cloudinary Images:** Tải trọng hình ảnh lớn 2.73 MB (chiếm 66% toàn trang), tải các file nguyên bản 400–500 KiB không nén và không lazy-load.
2. **Google Maps iframe:** Ngốn 417 KiB JS và 292ms CPU ở tận đáy Footer, kéo theo toàn bộ engine bản đồ khi trang vừa tải.
3. **Third-Party Scripts (GTM, GA4, Clarity, Pixels):** Tốn 533ms CPU, gây 3 Long Tasks (186ms, 144ms, 91ms) do nhúng inline `<script>` trong `<head>` SSR.
4. **CLS = 0.516:** Layout bị xô lệch trên di động do thiếu aspect-ratio và skeleton giữ chỗ.

---

## 2. So Sánh Các Phương Án Kỹ Thuật

### 🔹 Vấn đề 1: Tối ưu tải trọng ảnh Cloudinary
| Tiêu chí | Phương án A (Nén thủ công trên Cloudinary Dashboard) | Phương án B (Tự động hóa qua URL Transformation + `next/image`) - LỰA CHỌN |
| :--- | :--- | :--- |
| **Cơ chế** | Tải từng ảnh về nén rồi upload đè | Helper `optimizeCloudinaryUrl(url, { width, quality, format })` chèn tham số `f_auto,q_auto,w_...,c_fill` và kết hợp `<Image sizes="..." loading="lazy" />` |
| **Bảo trì** | Thủ công, dễ quên khi khách hàng/admin upload ảnh mới | Tự động hóa 100% cho mọi ảnh cũ và ảnh mới tải lên |
| **Hiệu quả** | Dung lượng giảm một phần | Giảm từ 2.73 MB xuống < 250 KiB (tiết kiệm hơn 90% dung lượng) |
| **Đánh giá** | ❌ Reject | ✅ **CHỌN PHƯƠNG ÁN B** |

---

### 🔹 Vấn đề 2: Xử lý Google Maps trong Footer
| Tiêu chí | Phương án A (Bỏ iframe, chỉ để link text) | Phương án B (Bản đồ Facade Pattern) - LỰA CHỌN |
| :--- | :--- | :--- |
| **Cơ chế** | Xóa hẳn iframe, chỉ để liên kết ra ngoài | Hiển thị thumbnail bản đồ tĩnh sắc nét kèm nút "Xem bản đồ tương tác". Chỉ nhúng iframe thật khi người dùng click hoặc cuộn tới gần |
| **Trải nghiệm** | Mất đi tính trực quan của showroom | Giữ trọn trải nghiệm bản đồ showroom, người dùng vẫn xem được vị trí ngay |
| **Hiệu năng** | Cắt giảm 417 KiB | Cắt giảm 100% 417 KiB JS & 292ms CPU lúc tải trang ban đầu |
| **Đánh giá** | ❌ Trải nghiệm kém | ✅ **CHỌN PHƯƠNG ÁN B** |

---

### 🔹 Vấn đề 3: Tối ưu Third-Party Scripts (GTM, GA4, Clarity)
| Tiêu chí | Phương án A (Giữ inline script trong `<head>`) | Phương án B (Chuyển sang `next/script` `strategy="lazyOnload"`) - LỰA CHỌN |
| :--- | :--- | :--- |
| **Cơ chế** | Chạy ngay khi parse HTML | Nạp qua `next/script` lúc browser rảnh (requestIdleCallback) |
| **Ảnh hưởng SEO** | GTM/GA4 tải sớm nhưng nghẽn CPU | Bot Google vẫn crawl HTML/Schema bình thường (Schema đã nhúng sẵn SSR) |
| **Main Thread** | Long tasks 186ms, 144ms | 0 Long Tasks chặn FCP/Hydration |
| **Đánh giá** | ❌ Tranh chấp CPU | ✅ **CHỌN PHƯƠNG ÁN B** |

---

## 3. Quyết Định Kiến Trúc (Architecture Decision Record - ADR)
- **ADR-01:** Áp dụng Phương án B cho toàn bộ 3 bài toán.
- **ADR-02:** Xây dựng hàm `optimizeCloudinaryUrl` trong `@cardealer/core/src/media/cloudinary.ts` và export ra public interface.
- **ADR-03:** Component `Footer.tsx` triển khai component `MapFacade` có state `isInteractive`, mặc định hiển thị preview tối ưu dung lượng siêu nhẹ (< 10 KiB) và nút tương tác.
- **ADR-04:** Chuyển đổi toàn bộ tracking scripts trong `apps/web/app/layout.tsx` sang `next/script` với `strategy="lazyOnload"`.
