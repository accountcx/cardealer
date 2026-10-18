# 🎨 Frontend Integration & UI Specification: PHASE 2 - STATIC-PAGES-CMS

> **Mã Epic**: `EPIC-PHASE-2-STATIC-PAGES-CMS`  
> **Dự án**: CarDealer UI/UX Design System  
> **Giai đoạn**: Phase 2 - Step 2.5: UI Integration Spec  
> **Lead Role**: `tailwind-ui-designer`  
> **Tiêu chuẩn quy trình**: Universal Agentic Workflow v2.2  

---

## 1. Cấu Trúc Phân Cấp Giao Diện (Component Hierarchy)

### 1.1 Phân Hệ CMS Admin (`apps/admin`)
```
apps/admin/
├── app/(dashboard)/pages/
│   ├── page.tsx                     # Route: Danh sách trang tĩnh (Table, Filter, Search)
│   ├── new/page.tsx                 # Route: Tạo trang tĩnh mới
│   └── [id]/page.tsx                # Route: Chỉnh sửa trang tĩnh 2 cột
└── components/pages/
    ├── pages-table.tsx              # Component: Bảng dữ liệu danh sách + Action Buttons
    ├── pages-filter-bar.tsx         # Component: Ô tìm kiếm và lọc theo template, status
    ├── page-form.tsx                # Container Component 2 cột (Content + Sidebar)
    ├── tiptap-content-editor.tsx    # Presentational: Bộ soạn thảo Tiptap Rich-Text AST
    ├── serp-preview.tsx             # Presentational: Card xem trước Google SERP Desktop/Mobile
    └── seo-character-counter.tsx    # Presentational: Bộ đếm ký tự Title/Desc đổi màu thông minh
```

### 1.2 Phân Hệ Web Storefront (`apps/web`)
```
apps/web/
├── app/[slug]/
│   └── page.tsx                     # Server Component: Catch-all route & Metadata Generator
└── components/pages/
    ├── template-dispatcher.tsx      # Dispatcher chọn mẫu giao diện dựa theo templateType
    └── templates/
        ├── profile-showroom.tsx     # Template: /gioi-thieu (Hồ sơ saler E-E-A-T, Showroom 3S, Maps)
        ├── default-legal.tsx        # Template: /chinh-sach-bao-mat (Văn bản pháp lý, TOC, Typography)
        ├── timeline-process.tsx     # Template: /quy-trinh-mua-xe (Sơ đồ 5 bước mua xe tương tác)
        └── finance-calc.tsx         # Template: /tra-gop (Bảng điều kiện vay, lãi suất, CTA tính giá)
```

---

## 2. Quy Chuẩn Kỹ Thuật UI & Design Tokens

* **Quy tắc Xuất Bản:** **100% Named Export** (Tuyệt đối không dùng `export default` cho components nội bộ để tối ưu Tree-shaking và refactoring an toàn).
* **Hệ Thống Biểu Tượng (Icon System):** Sử dụng duy nhất thư viện `lucide-react` (`Search`, `FileText`, `Globe`, `Eye`, `Edit`, `Trash2`, `CheckCircle2`, `AlertCircle`, `ExternalLink`, `ChevronRight`).
* **Tailwind Spacing Scale:** 100% sử dụng spacing tiêu chuẩn (`h-10`, `px-4`, `py-3`, `gap-6`, `rounded-xl`), tuyệt đối không dùng giá trị tùy tiện (arbitrary values).
* **Accessibility (WCAG AAA):**
  * Tương phản Dark/Light mode tối thiểu 4.5:1.
  * Đường bao Focus bàn phím rõ nét: `focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900`.
  * Hỗ trợ thiết bị giảm chuyển động: `motion-reduce:transition-none motion-reduce:transform-none`.

---

## 3. Chi Tiết Giao Diện Soạn Thảo 2 Cột (`PageForm` - Admin CMS)

### 3.1 Bố Cục Không Gian (Grid Layout 70% / 30%)
* **Cột Trái (Content Main - 70%):**
  * **Tiêu đề trang (`title`)**: Input font-size lớn (`text-2xl font-bold tracking-tight`), tự động kích hoạt tạo slug mượt mà.
  * **Đường dẫn URL (`slug`)**: Input kèm tiền tố cố định `xehyundaivinh.com/`, có nút "Khóa/Mở khóa chỉnh sửa thủ công" để chống vô tình gõ sai.
  * **Trình soạn thảo Tiptap Editor**: Khung viền tinh tế, thanh toolbar dính (sticky top-0) với các nút định dạng Header, List, Table, Callout Box, FAQ Accordion.
* **Cột Phải (SEO & Settings Sidebar - 30%):**
  * **SERP Preview Card**:
    * Thanh chuyển đổi chế độ: `Desktop` / `Mobile`.
    * Hiển thị mô phỏng kết quả Google: Favicon + Breadcrumb (`xehyundaivinh.com › [slug]`) + Title màu tím Google + Description xám chuẩn typography.
  * **Ô nhập `Meta Title`**: Thanh đo đếm ký tự đổi màu:
    * `0-49`: Màu vàng (Hơi ngắn).
    * `50-60`: Màu xanh lá (Tối ưu cho Google SERP).
    * `>60`: Màu đỏ cảnh báo (Bị Google cắt dấu `...`).
  * **Ô nhập `Meta Description`**: Thanh đo 150-160 ký tự.
  * **Cấu hình Template**: Dropdown chọn 1 trong 4 mẫu (`Mặc định pháp lý`, `Hồ sơ Showroom E-E-A-T`, `Quy trình mua xe`, `Vay vốn trả góp`).
  * **Tùy chọn kỹ thuật**: Toggle `noIndex` (Ngăn bot Google) và Toggle `isPublished` (Xuất bản công khai).

---

## 4. Ma Trận 4 Trạng Thái Giao Diện (4-State Pattern)

| Trạng Thái | Mô Tả Hành Vi Giao Diện | Tailwind Classes & Components |
| :--- | :--- | :--- |
| **1. Loading State** | Shimmer Skeleton tải dữ liệu Zero-CLS cho cả bảng danh sách và form 2 cột. | `animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg` |
| **2. Empty State** | Hiển thị khi chưa có trang tĩnh nào được tạo trong hệ thống. | Icon `FileText` mờ + Tiêu đề "Chưa có trang tĩnh nào" + Nút CTA "Tạo trang đầu tiên". |
| **3. Error State** | Banner cảnh báo khi API trả mã lỗi (409 trùng slug, 422 reserved slug, 500 lỗi mạng). | `bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 rounded-xl` kèm nút "Thử lại". |
| **4. Success State** | Dữ liệu nạp thành công, form sẵn sàng tương tác mượt mà, lưu tự động hoặc lưu thủ công kèm Toast. | Toast `Sonner` thông báo: "Đã cập nhật trang tĩnh thành công". |

---

## 5. Mã Nguồn Mẫu Các Component Cốt Lõi

### 5.1 Component Google SERP Preview (`serp-preview.tsx`)
```tsx
import React, { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface SerpPreviewProps {
  title: string;
  slug: string;
  description: string;
  baseUrl?: string;
}

export const SerpPreview: React.FC<SerpPreviewProps> = ({
  title,
  slug,
  description,
  baseUrl = 'https://xehyundaivinh.com',
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const displayTitle = title || 'Tiêu đề trang sẽ hiển thị ở đây trên kết quả tìm kiếm';
  const displayDesc = description || 'Mô tả tóm tắt chuẩn SEO sẽ xuất hiện tại đây dưới dạng đoạn trích dẫn ngắn gọn trên Google...';
  const displayUrl = `${baseUrl}/${slug || 'duong-dan-trang'}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Xem trước kết quả Google (SERP)
        </span>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`rounded-md p-1 transition-all ${
              device === 'desktop' ? 'bg-white shadow-sm dark:bg-slate-700 text-blue-600' : 'text-slate-400'
            }`}
            title="Giao diện máy tính"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`rounded-md p-1 transition-all ${
              device === 'mobile' ? 'bg-white shadow-sm dark:bg-slate-700 text-blue-600' : 'text-slate-400'
            }`}
            title="Giao diện điện thoại"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={device === 'mobile' ? 'max-w-[375px]' : 'w-full'}>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800">
            H
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
              Hyundai Vinh
            </span>
            <span className="text-[11px] text-slate-500 truncate">{displayUrl}</span>
          </div>
        </div>

        <h3 className="line-clamp-2 text-base font-medium text-[#1a0dab] hover:underline cursor-pointer dark:text-[#8ab4f8] leading-snug">
          {displayTitle}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed">
          {displayDesc}
        </p>
      </div>
    </div>
  );
};
```

---

### 5.2 Component Template Dispatcher Ngoài Web Client (`template-dispatcher.tsx`)
```tsx
import React from 'react';
import type { StaticPage } from '@cardealer/types';
import { ProfileShowroomTemplate } from './templates/profile-showroom';
import { DefaultLegalTemplate } from './templates/default-legal';
import { TimelineProcessTemplate } from './templates/timeline-process';
import { FinanceCalcTemplate } from './templates/finance-calc';

interface TemplateDispatcherProps {
  page: StaticPage;
}

export const TemplateDispatcher: React.FC<TemplateDispatcherProps> = ({ page }) => {
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
};
```
