# 📡 API Specification: Lead Management & Notification Engine

> **Module Slug:** `lead-management`  
> **Status:** Living Document  
> **Author:** Feature Spec Generator

---

## 1. Public Lead Ingestion & Email Trigger

### `POST /api/leads`
Tiếp nhận thông tin khách hàng từ bất kỳ form nào trên Storefront và kích hoạt gửi email thông báo ngầm.

- **Authentication:** Không yêu cầu (Public endpoint, bảo vệ bằng Rate Limiting 5 req/min/IP + Honeypot trap).
- **Request Headers:**
  ```http
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "fullName": "Nguyễn Văn An",
    "phone": "0981234567",
    "carModel": "Hyundai Tucson",
    "carVersionId": "d3b07384-d113-40f4-86a0-5c6ffc6d4822",
    "carVersion": "2.0 Xăng Đặc Biệt",
    "province": "Nghệ An",
    "estimatedTotal": 959000000,
    "leadType": "Báo giá lăn bánh",
    "preferredTime": "Trong giờ hành chính",
    "notes": "Cần tư vấn gói trả góp ngân hàng 80%",
    "websiteUrl": "" 
  }
  ```
- **Response 201 Created:**
  ```json
  {
    "success": true,
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "fullName": "Nguyễn Văn An",
      "phone": "0981234567",
      "province": "Nghệ An",
      "status": "new",
      "createdAt": "2026-10-18T10:30:00.000Z"
    }
  }
  ```

---

## 2. Admin Lead Deletion

### `DELETE /api/admin/leads/:id`
Xóa vĩnh viễn một Lead khỏi hệ thống CRM kèm ghi nhận nhật ký kiểm toán.

- **Authentication:** Bắt buộc JWT Bearer Token (hoặc Cookie `admin_token`).
- **Authorization:** Yêu cầu quyền `'leads:delete'` (`admin`, `manager`).
- **Request Parameters:**
  - `id` (Path param): UUID của Lead cần xóa.
- **Response 200 OK:**
  ```json
  {
    "success": true,
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "message": "Đã xóa yêu cầu báo giá thành công"
    }
  }
  ```
- **Response 403 Forbidden:**
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "Bạn không có quyền xóa yêu cầu này"
    }
  }
  ```
- **Response 404 Not Found:**
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Không tìm thấy yêu cầu báo giá cần xóa"
    }
  }
  ```
