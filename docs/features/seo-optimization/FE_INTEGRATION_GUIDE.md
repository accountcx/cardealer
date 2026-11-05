# 🎨 FRONTEND INTEGRATION GUIDE: SEO & UI Architecture

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Tài liệu tham chiếu:** [FLOW.md](./FLOW.md) | [SCHEMA.md](./SCHEMA.md) | [API_SPEC.md](./API_SPEC.md)

---

## 1. Kiến Trúc Điều Hướng & Cây Giao Diện (Navigation Topology)

```
Storefront Header & Footer
  ├── / (Trang chủ có Fallback H1)
  ├── /xe (Danh mục xe cố định Canonical)
  │     └── /xe/[carSlug] (Chi tiết xe + Breadcrumbs + Related Cars)
  ├── /dong-xe/[slug] (Phân khúc: sedan, suv, mpv, hatchback, xe-dien)
  ├── /gia-lan-banh (Dự toán chung)
  │     └── /gia-lan-banh/[carSlug] (Landing Page dự toán theo từng mẫu xe)
  ├── /tra-gop (Landing Page tư vấn ngân hàng & ước tính trả trước)
  └── /tin-tuc (Hub tin tức có ảnh next/image đạt chuẩn LCP < 1.8s)
        └── /tin-tuc/[slug] (Chi tiết bài viết + StickyToc + EeatAuthorBox)
```

---

## 2. Quy Tắc Tối Ưu Hóa Hình Ảnh Chuẩn Core Web Vitals (Zero CLS & Fast LCP)

### 2.1. Chuyển Đổi Triệt Để Sang `<Image>` Của Next.js:
Tuyệt đối không dùng thẻ `<img>` thô trong các trang bài viết. Mọi ảnh bài viết và ảnh thumbnail phải tuân thủ chuẩn:

```tsx
import Image from 'next/image';

// Với ảnh Hero đinh của trang Tin Tức (LCP Target)
<Image
  src={post.anhDaiDienUrl}
  alt={post.anhDaiDienAlt || post.tieuDe}
  fill
  priority
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
  className="object-cover transition-transform duration-300 group-hover:scale-105"
/>

// Với ảnh trong lưới 3 cột bài viết (Grid Cards)
<Image
  src={post.anhDaiDienUrl}
  alt={post.anhDaiDienAlt || post.tieuDe}
  fill
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover transition-transform duration-300 group-hover:scale-105"
/>
```

### 2.2. Khung Tỷ Lệ Cố Định (Fixed Aspect Ratio):
* Ảnh thumbnail bài viết: Cố định `aspect-video` (16:9).
* Ảnh đại diện xe: Cố định `aspect-[16/10]` hoặc `aspect-[4/3]`.
* Bắt buộc có khung `relative overflow-hidden bg-slate-100` để giữ chỗ khi ảnh chưa tải, triệt tiêu 100% hiện tượng giật màn hình (CLS = 0).

---

## 3. Ma Trận 4-State UI Chuẩn Mực Cho Landing Page Dự Toán Theo Mẫu Xe (`/gia-lan-banh/[carSlug]`)

| Trạng thái | Hành vi Giao diện | Thành phần tương tác |
| :--- | :--- | :--- |
| **1. Loading State** | Server Component render sẵn bộ khung với Suspense fallback | `CalculatorSkeleton`: Giả lập tiêu đề H1, bộ chọn phiên bản và bảng tính giá để không giật layout. |
| **2. Empty State** | Khi dòng xe không có phiên bản nào khả dụng | Hiển thị khung thông báo thân thiện: *"Dòng xe đang cập nhật bảng giá chính thức từ nhà máy"* kèm nút gọi Hotline nhận báo giá trực tiếp. |
| **3. Error State** | Khi API/Database timeout hoặc slug không hợp lệ | Trả về `notFound()` chuyển sang trang 404 thân thiện, gợi ý các mẫu xe cùng phân khúc đang có sẵn. |
| **4. Success / Data State** | Hiển thị đầy đủ công cụ tính đã chọn sẵn mẫu xe thành công | H1 nổi bật, bảng chiết tính chi phí trước bạ từng phiên bản, form nhận báo giá ưu đãi độc quyền kèm nút mở Lead Modal. |

---

## 4. Bộ Nhận Diện SERP & Favicon Specification

Đặt tại thư mục `apps/web/public/`:

* `favicon.ico`: 32x32 và 16x16 icon nhị phân hiển thị trên tab trình duyệt và kết quả tìm kiếm Google.
* `apple-touch-icon.png`: 180x180 PNG hiển thị khi lưu trang ra màn hình chính iOS.
* `manifest.webmanifest`: Khai báo PWA Metadata cho trình duyệt Chrome/Android:
  ```json
  {
    "name": "Xe Hyundai Vinh - Đại Lý Chính Hãng",
    "short_name": "Hyundai Vinh",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#002C6C",
    "icons": [
      {
        "src": "/apple-touch-icon.png",
        "sizes": "180x180",
        "type": "image/png"
      }
    ]
  }
  ```
