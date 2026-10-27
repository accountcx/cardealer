# 🗄️ SCHEMA: Catalog & Vehicle Specification Engine

> **Module:** `catalog-management`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), `packages/database/src/schema/cars.ts`, `car_versions.ts`, `colors.ts`, `version_colors.ts`  

---

## 1. Mô Hình Thực Thể Thực Tế (Database Tables)

### 🔹 Bảng `cars` (Dòng Xe Cốt Lõi)
```sql
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_xe VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    anh_dai_dien_url VARCHAR(500) NOT NULL,
    catalog_file_url VARCHAR(500),
    segment car_segment DEFAULT 'suv' NOT NULL,
    tax_rate DECIMAL(4, 2) DEFAULT 0.10 NOT NULL,
    tra_truoc_tu BIGINT,
    promotion_summary TEXT,
    fuel_type VARCHAR(50),
    highlight_features JSONB,
    mo_ta_chung TEXT,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    status car_status DEFAULT 'draft' NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Chỉ mục B-Tree tối ưu truy vấn
CREATE INDEX cars_slug_idx ON cars (slug);
CREATE INDEX cars_segment_status_idx ON cars (segment, status);
CREATE INDEX cars_featured_sort_idx ON cars (is_featured, sort_order);
```

### 🔹 Bảng `car_versions` (Phiên Bản Trang Bị & Giá Niêm Yết)
```sql
CREATE TABLE car_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    ten_phien_ban VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    gia_niem_yet BIGINT NOT NULL,
    gia_khuyen_mai BIGINT,
    seat_count INTEGER DEFAULT 5 NOT NULL,
    dong_co VARCHAR(100),
    hop_so VARCHAR(100),
    dan_dong VARCHAR(100),
    anh_dai_dien_url VARCHAR(500),
    bo_suu_tap_anh JSONB DEFAULT '[]'::jsonb,
    spec_groups JSONB DEFAULT '[]'::jsonb,
    review_content JSONB,
    content_blocks JSONB,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT car_versions_car_slug_unique UNIQUE (car_id, slug)
);

CREATE INDEX car_versions_car_id_idx ON car_versions (car_id);
```

### 🔹 Bảng `colors` & `version_colors` (Bảng Màu & Ảnh Xe Tương Ứng)
```sql
CREATE TABLE colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_mau VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    hex_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE version_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES car_versions(id) ON DELETE CASCADE,
    color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
    anh_xe_url VARCHAR(500) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT version_colors_unique UNIQUE (version_id, color_id)
);
```

---

## 2. Ma Trận Chuyển Trạng Thái Dòng Xe (State Transition Matrix)

| Trạng Thái Ban Đầu | Hành Động Kích Hoạt | Trạng Thái Đích | Điều Kiện Hợp Lệ |
| :--- | :--- | :--- | :--- |
| `draft` | Xuất bản (Publish) | `published` | Bắt buộc có ít nhất 1 phiên bản với giá niêm yết $> 0$ và ảnh đại diện hợp lệ |
| `published` | Hạ bài (Unpublish) | `draft` | Người thực hiện có quyền `cars:write` |
| `published` | Ngừng bán (Archive) | `archived` | Không còn xe sẵn trong kho hoặc phiên bản cũ hết vòng đời |
| `archived` | Bán lại (Restore) | `published` | Khôi phục trạng thái bán công khai trên Storefront |

---

## 3. Hợp Đồng Dữ Liệu SEO Schema JSON-LD & Quy Chuẩn Làm Sạch

### 3.1 Cấu Trúc Thực Thể BreadcrumbList (Chuẩn Google Search Central)
- Mọi `item` trong `itemListElement` BẮT BUỘC là Absolute URL (`https://...`). Tuyệt đối cấm Relative URL (`/`, `/xe`).
- Vị trí `position: 1`: `"item": "https://xehyundaivinh.com/"`
- Vị trí cuối cùng (`position: N`): Khai báo tường minh `"item": "https://xehyundaivinh.com/[current-path]"` và tên hiển thị `name`.
- `@id` của BreadcrumbList: `https://xehyundaivinh.com/[current-path]#breadcrumb`.

### 3.2 Cấu Trúc Thực Thể ItemList Cho Danh Sách Xe (`/xe`, `/dong-xe/:slug`)
- Mỗi phần tử trong `itemListElement`:
  - `position`: Số nguyên tăng dần từ 1.
  - `item`: Đối tượng thực thể xe:
    - `@id`: `https://xehyundaivinh.com/xe/:slug` (Bắt buộc định danh Entity)
    - `url`: `https://xehyundaivinh.com/xe/:slug` (Bắt buộc)
    - `@type`: `["Product", "Car"]`
    - `name`: Tên dòng xe chính thức
    - `image`: URL ảnh đại diện xe
    - `description`: Đoạn mô tả xe đã được làm sạch, không chứa prompt note
    - `brand`: `{ "@type": "Brand", "name": "Hyundai" }`
    - `offers`: Đối tượng `AggregateOffer` (nếu `validMinPrice > 0`).

### 3.3 Ràng Buộc Dữ Liệu Trường `promotionSummary`
- Tuyệt đối không chứa các đoạn chỉ dẫn trong ngoặc đơn dạng: `\s*\([^)]*(tiếp thị|đánh giá|quyết định|lưu ý|yêu cầu|nội dung|prompt|hợp lý|thay vì|bảng giá|khối kêu gọi)[^)]*\)`.
- Hàm làm sạch chuẩn: `sanitizePromotionSummary(raw: string): string` loại bỏ mọi đoạn prompt trong ngoặc đơn rò rỉ trước khi lưu DB hoặc đưa vào JSON-LD Schema.
