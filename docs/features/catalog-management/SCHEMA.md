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
