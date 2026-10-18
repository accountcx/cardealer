# 🌐 API SPECIFICATION: Financial & Pricing Engine

> **Module:** `pricing-calculator`  
> **Căn cứ:** [`FLOW.md`](./FLOW.md), [`SCHEMA.md`](./SCHEMA.md)  

---

## 1. Engine Architecture Note
> Thuật toán tính lăn bánh và trả góp được đóng gói dưới dạng **Pure TypeScript Functions** trong `@cardealer/core`, cho phép chạy trực tiếp trên trình duyệt Client-side (Zero latency, không cần mạng) cũng như trên Server API (Server-side rendering).

---

## 2. Server Endpoints (Optional Quote Helper)

### 🔹 `POST /api/quote/calculate-rolling`
- **Mục đích:** Hỗ trợ tính toán chi phí lăn bánh từ phía Server cho các client không có thư viện JavaScript hoặc gọi qua API bên thứ ba.
- **Request Body:**
  ```json
  {
    "giaXe": 839000000,
    "tinhThanhCode": "nghe-an-vinh",
    "soChoNgoi": 5,
    "hasBaoHiemThanVo": true,
    "hasPhiDichVu": false
  }
  ```
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "giaXe": 839000000,
        "tinhThanhCode": "nghe-an-vinh",
        "tinhThanhName": "Nghệ An (TP. Vinh)",
        "lePhiTruocBa": 83900000,
        "phiBienSo": 1000000,
        "phiDangKiem": 90000,
        "phiBaoTriDuongBo": 1560000,
        "baoHiemTNDS": 480700,
        "baoHiemThanVo": 10907000,
        "phiDichVuDangKy": 0,
        "tongChiPhiLanBanh": 936937700
      }
    }
    ```
  - **`400 Bad Request`**:
    ```json
    {
      "success": false,
      "error": { "code": "INVALID_PRICE", "message": "Giá xe tính toán lăn bánh phải là số dương lớn hơn 0" }
    }
    ```
