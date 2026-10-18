# 📜 Technical API Specification: Trang Danh Mục Dòng Xe & Bộ Lọc Đa Chiều (`/xe`)

## 1. Endpoint Công Khai: Lấy Danh Sách Dòng Xe Xuất Bản

### 1.1. Thông Tin Tuyến (Route Metadata)
* **Tên Endpoint:** Public Catalog Cars List
* **Đường dẫn (Path):** `GET /api/cars`
* **Xác thực (Auth):** Không yêu cầu (Public Endpoint)
* **Mục đích:** Cung cấp dữ liệu danh sách các dòng xe đang ở trạng thái `published` phục vụ trang chủ, trang danh mục `/xe` và các bộ tính giá.
* **Bộ nhớ đệm (Caching):** Next.js ISR Tag `catalog-cars`, revalidate: 60s.

### 1.2. Tham Số Truy Vấn (Query Parameters)
| Tham số | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `segment` | `string` | Không | - | Lọc theo phân khúc (`sedan`, `suv`, `mpv`, `hatchback`, `ev`) |
| `isFeatured` | `boolean` | Không | - | Nếu `true`, chỉ lấy các dòng xe ghim nổi bật |
| `limit` | `number` | Không | - | Giới hạn số lượng dòng xe trả về |

### 1.3. Cấu Trúc Phản Hồi Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "7b7a6344-9843-4dc7-b50a-313d3129486c",
      "tenXe": "Hyundai Tucson",
      "slug": "tucson",
      "anhDaiDienUrl": "/images/cars/tucson.webp",
      "segment": "suv",
      "fuelType": "Xăng / Dầu",
      "seatRange": "5 chỗ",
      "traTruocTu": 150000000,
      "promotionSummary": "Giảm 50% trước bạ + Tặng bảo hiểm thân vỏ",
      "minPrice": 769000000,
      "maxPrice": 919000000,
      "versionCount": 4,
      "isFeatured": true,
      "status": "published",
      "versions": [
        {
          "id": "v-1",
          "tenPhienBan": "Tucson 2.0 Xăng Tiêu chuẩn",
          "slug": "tucson-2-0-xang-tieu-chuan",
          "giaNiemYet": 769000000,
          "giaKhuyenMai": null,
          "seatCount": 5,
          "dongCo": "SmartStream G2.0",
          "hopSo": "6AT",
          "danDong": "FWD",
          "anhDaiDienUrl": "/images/cars/tucson-base.webp",
          "sortOrder": 1
        }
      ]
    }
  ]
}
```

### 1.4. Cấu Trúc Phản Hồi Khi Gặp Sự Cố (HTTP 500 Internal Server Error)
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_QUERY_ERROR",
    "message": "Lỗi truy vấn danh sách dòng xe từ cơ sở dữ liệu"
  }
}
```

---

## 2. Hợp Đồng Hàm Sinh SEO Schema JSON-LD (`packages/core/src/seo`)

### 2.1. Signature Hàm
```typescript
/**
 * Trình sinh dữ liệu có cấu trúc Google Schema (ItemList & AggregateOffer)
 * @param cars Danh sách dòng xe đã xuất bản
 * @param siteUrl Địa chỉ website showroom (ví dụ: https://xehyundaivinh.com)
 */
export function generateCatalogJsonLd(cars: CarCatalogItem[], siteUrl: string): object;
```

### 2.2. Dữ Liệu Đầu Ra Chuẩn (Output Format)
Hàm trả về đối tượng JSON-LD Schema.org dạng `ItemList`, trong đó mỗi phần tử `itemListElement` là một `ListItem` chứa đối tượng `Product` / `Car` với `AggregateOffer` hợp lệ gồm `priceCurrency: 'VND'`, `lowPrice: car.minPrice`, `highPrice: car.maxPrice`, `offerCount: car.versionCount`.

---

## 3. Ma Trận Xử Lý Lỗi (Error Matrix)

| Tình Huống Ngoại Lệ | HTTP Status | Code Lỗi | Hành Vi Phục Hồi Tại Client Storefront |
| :--- | :---: | :--- | :--- |
| Database PostgreSQL mất kết nối tạm thời | 500 | `DATABASE_QUERY_ERROR` | `getCarsList()` bắt lỗi, log cảnh báo và trả về mảng rỗng `[]`; giao diện hiển thị thông báo lỗi thân thiện + hotline, không làm sập trang. |
| URL chứa tham số phân khúc không tồn tại (vd: `?segment=xe-tai`) | 200 | - | Bộ lọc tự động bỏ qua giá trị lạ và fallback về trạng thái `'all'`. |
| Bộ lọc không tìm thấy xe nào thỏa mãn | 200 | - | Trả về mảng rỗng `[]`; Client Island chuyển sang giao diện `CatalogEmptyState` kèm nút xóa bộ lọc. |
