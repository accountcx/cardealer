# 🌐 API SPECIFICATION: Catalog & Vehicle Specification Engine

> **Module:** `catalog-management`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Public Storefront Endpoints

### 🔹 `GET /api/catalog/cars`
- **Mục đích:** Lấy danh sách dòng xe phục vụ trang `/xe` và trang chủ.
- **Query Parameters:**
  - `segment` *(optional)*: `sedan` | `suv` | `mpv` | `hatchback` | `ev`
  - `isFeatured` *(optional)*: `true` | `false`
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "c1a2b3c4-...",
          "tenXe": "Hyundai Santa Fe All New",
          "slug": "hyundai-santa-fe",
          "anhDaiDienUrl": "https://res.cloudinary.com/.../santafe.png",
          "segment": "suv",
          "giaTu": 1069000000,
          "traTruocTu": 215000000,
          "promotionSummary": "Giảm 50% trước bạ + Tặng gói bảo hiểm thân vỏ",
          "fuelType": "Xăng / Hybrid"
        }
      ]
    }
    ```

---

### 🔹 `GET /api/catalog/cars/:slug`
- **Mục đích:** Lấy thông tin chi tiết đầy đủ của dòng xe kèm danh sách phiên bản, thông số kỹ thuật và các màu sắc ngoại thất tương ứng.
- **Parameters:** `slug: string` (ví dụ: `hyundai-santa-fe`)
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "id": "c1a2b3c4-...",
        "tenXe": "Hyundai Santa Fe All New",
        "slug": "hyundai-santa-fe",
        "anhDaiDienUrl": "https://...",
        "catalogFileUrl": "https://.../santafe-brochure.pdf",
        "segment": "suv",
        "versions": [
          {
            "id": "v1...",
            "tenPhienBan": "Santa Fe 2.5 Xăng Tiêu Chuẩn",
            "slug": "2-5-xang-tieu-chuan",
            "giaNiemYet": 1069000000,
            "colors": [
              {
                "colorId": "col1...",
                "tenMau": "Trắng Ngọc Trai",
                "colorSlug": "trang",
                "hexCode": "#FFFFFF",
                "anhXeUrl": "https://.../santafe-white.png",
                "isDefault": true
              }
            ]
          }
        ]
      }
    }
    ```
  - **`404 Not Found`**:
    ```json
    {
      "success": false,
      "error": { "code": "NOT_FOUND", "message": "Không tìm thấy dòng xe yêu cầu" }
    }
    ```

---

## 2. Admin Back-Office Endpoints (Protected by JWT)

### 🔹 `POST /api/admin/cars`
- **Headers:** `Authorization: Bearer <token>` (Yêu cầu quyền `cars:write`)
- **Request Body:**
  ```json
  {
    "tenXe": "Hyundai Custin",
    "slug": "hyundai-custin",
    "anhDaiDienUrl": "https://res.cloudinary.com/.../custin.png",
    "segment": "mpv",
    "taxRate": 0.10,
    "status": "draft"
  }
  ```
- **Responses:**
  - **`201 Created`**: Trả về thông tin dòng xe mới tạo.
  - **`401 Unauthorized`**: Token không hợp lệ hoặc đã hết hạn.
  - **`403 Forbidden`**: Tài khoản không có quyền `cars:write`.
  - **`409 Conflict`**: Slug xe đã tồn tại trong cơ sở dữ liệu.

---

## 3. SEO Schema & Data Sanitization Contracts

### 🔹 Helper: `generateCatalogJsonLd(cars, siteUrl)`
- **Đầu vào:** `cars: CarCatalogItem[]`, `siteUrl: string`
- **Đầu ra:** Cấu trúc Schema.org `ItemList` với:
  - `@context`: `"https://schema.org"`
  - `@type`: `"ItemList"`
  - `itemListElement`: Danh sách các xe với `@type: ["Product", "Car"]`, `@id: "${siteUrl}/xe/${car.slug}"`, `url: "${siteUrl}/xe/${car.slug}"` và `description` đã khử sạch prompt note.

### 🔹 Helper: `Breadcrumbs` Schema JSON-LD Generator
- **Đầu vào:** `items: BreadcrumbItem[]`, `pathname: string`, `siteUrl: string`
- **Đầu ra:** Cấu trúc Schema.org `BreadcrumbList`:
  - `@id`: `"${siteUrl}${pathname}#breadcrumb"`
  - Tất cả `itemListElement[i].item` là Absolute URL (Bắt đầu bằng `https://...`). Không cho phép relative URL dạng `/` hay `/xe`.
