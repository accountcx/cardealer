# 📐 TECHNICAL SPECIFICATION: PHASE 5 - DYNAMIC ASYNC SITEMAP ENGINE

> **Mã Epic**: `EPIC-PHASE-5-DYNAMIC-SITEMAP`  
> **Dự án**: CarDealer Dynamic XML Sitemap  
> **Trạng thái**: Kế hoạch chuẩn bị cho Bước 4  
> **Tiêu chuẩn**: Universal Agentic Workflow v2.2  

---

## 1. Mục Tiêu Kỹ Thuật
Tự động hóa hoàn toàn file `apps/web/app/sitemap.ts` của Next.js:
1. Thu thập dữ liệu đa luồng bất đồng bộ qua `Promise.allSettled` từ 4 nguồn (Xe, Bài viết, Trang tĩnh StaticPage, Trang phân khúc cố định).
2. Thiết lập ma trận trọng số ưu tiên thông minh (`priority` và `changefreq`) dựa trên khả năng chuyển đổi đơn hàng và độ quan trọng của trang.
3. Chống gãy trang: Đảm bảo nếu một truy vấn database gặp sự cố, sitemap vẫn sinh bình thường cho các nguồn dữ liệu còn lại.
4. Loại trừ triệt để các URL có `noIndex: true`, trang quản trị nội bộ hoặc các query tracking rác.

---

## 2. Ma Trận Phân Cấp Priority & Changefreq

| Cụm URL | Đường Dẫn Mẫu | Priority | Changefreq | Lý Do Chiến Lược |
| :--- | :--- | :---: | :---: | :--- |
| **Trang Chủ** | `/` | `1.0` | `daily` | Cửa ngõ thương hiệu chính, cập nhật ưu đãi liên tục |
| **Trang Dòng Xe Lẻ** | `/xe/accent`, `/xe/creta`, `/xe/santa-fe` | `0.9` | `daily` | Trang bán hàng trực tiếp quan trọng nhất của đại lý |
| **Bài Viết Bán Hàng Cao** | `/tin-tuc/gia-lan-banh-custin-2026`, `/tin-tuc/uu-dai-accent` | `0.9` | `daily` | Chứa từ khóa giao dịch cao (`gia-lan-banh`, `khuyen-mai`, `uu-dai`) |
| **Trang Danh Mục Xe & Phân Khúc** | `/xe`, `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv` | `0.8` | `weekly` | Trang điều hướng trung gian và tổng hợp phân khúc |
| **Trang Công Cụ Bán Hàng** | `/gia-lan-banh`, `/tra-gop` | `0.8` | `weekly` | Công cụ dự toán giữ chân người dùng và tạo lead |
| **Trang Tĩnh Động (E-E-A-T)** | `/gioi-thieu`, `/quy-trinh-mua-xe` (từ `StaticPage`) | `0.8` | `weekly` | Trang chứng minh uy tín showroom và quy trình đại lý |
| **Bài Viết Tin Tức Chung** | `/tin-tuc/kinh-nghiem-bao-duong-xe` | `0.7` | `weekly` | Nội dung kiến thức phụ trợ |

---

## 3. Kiến Trúc Lập Trình (`apps/web/app/sitemap.ts`)
```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xehyundaivinh.com';

  const [carsResult, postsResult, pagesResult] = await Promise.allSettled([
    fetchActiveCars(),
    fetchPublishedPosts(),
    fetchPublishedStaticPages(),
  ]);

  // Handle results safely with fallback to empty array
  const cars = carsResult.status === 'fulfilled' ? carsResult.value : [];
  const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
  const pages = pagesResult.status === 'fulfilled' ? pagesResult.value : [];

  // Generate dynamic URL lists with intelligent priority assignment...
  return [...staticUrls, ...carUrls, ...postUrls, ...pageUrls];
}
```
