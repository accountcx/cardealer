# 🔄 Technical Flow Specification: Thư Viện Ảnh Admin & Tích Hợp Cloudinary (Admin Image Library)

## 1. Sequence Diagram Đa Tầng (End-to-End Sequence Diagrams)

### 1.1. Luồng Tải Lên Ảnh Đơn & Đa Tệp (Concurrent Multi-Upload via Streaming Proxy - US-01 & US-02)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👤 Admin / Editor
    participant UI as 🌐 Admin UI (MediaPage / MediaPickerModal)
    participant Queue as ⚡ Client Concurrency Queue (Max 3 parallel)
    participant API as ⚙️ Backend API (/api/admin/media/upload)
    participant Cloudinary as ☁️ Cloudinary Upload Stream API
    participant DB as 🗄️ PostgreSQL (Drizzle ORM: media table)

    Admin->>UI: Kéo thả 1 hoặc nhiều ảnh (Drag & Drop files)
    UI->>UI: Validate Client-side (MIME: image/*, Size <= 10MB)
    alt Có file không hợp lệ (Sai định dạng / Quá 10MB)
        UI-->>Admin: Hiển thị cảnh báo đỏ và bỏ qua file lỗi
    end

    UI->>Queue: Đẩy danh sách file hợp lệ vào hàng đợi (State: QUEUED)
    loop Xử lý song song tối đa 3 luồng
        Queue->>API: POST /api/admin/media/upload (multipart/form-data: 1 file)
        Note over API: Kiểm tra JWT Token & RBAC (media:write)
        alt Chưa đăng nhập hoặc không đủ quyền
            API-->>Queue: 401 Unauthorized / 403 Forbidden
            Queue-->>UI: Cập nhật file state: ERROR ("Không có quyền")
        else Hợp lệ
            API->>API: Phân tích stream (MIME verification & Magic Bytes)
            API->>Cloudinary: Pipe upload_stream (folder: "cardealer", resource_type: "image")
            
            alt Cloudinary lỗi (Hết quota / Mạng ngắt quãng)
                Cloudinary-->>API: Cloudinary Error Response
                API-->>Queue: 502 Bad Gateway / 500 Internal Error
                Queue-->>UI: Cập nhật file state: ERROR, hiện nút "Thử lại"
            else Cloudinary thành công
                Cloudinary-->>API: { secure_url, public_id, width, height, format, bytes }
                API->>DB: INSERT INTO media (filename, url, public_id, mime_type, file_size, width, height, format, uploader_id)
                alt Ghi Database thất bại (DB Crash / Constraint violation)
                    DB-->>API: Error Exception
                    API->>Cloudinary: Rollback: cloudinary.uploader.destroy(public_id)
                    API-->>Queue: 500 Database Error ("Ghi dữ liệu thất bại, đã dọn rác Cloudinary")
                    Queue-->>UI: Cập nhật file state: ERROR
                else Ghi Database thành công
                    DB-->>API: MediaRecord { id, url, ... }
                    API-->>Queue: 201 Created { success: true, data: MediaRecord }
                    Queue-->>UI: Cập nhật file state: SUCCESS, hiển thị thumbnail
                end
            end
        end
    end
    UI-->>Admin: Toàn bộ queue hoàn tất, làm mới danh sách ảnh
```

---

### 1.2. Luồng Xóa Ảnh An Toàn & Đồng Bộ (Synchronous Delete & Cloudinary Purge - US-01 & US-02)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👤 Admin / Editor
    participant UI as 🌐 Admin UI (/media)
    participant API as ⚙️ Backend API (DELETE /api/admin/media/:id)
    participant Cloudinary as ☁️ Cloudinary Destroy API
    participant DB as 🗄️ PostgreSQL (Drizzle ORM)

    Admin->>UI: Bấm nút "Xóa ảnh" (Hoặc chọn xóa hàng loạt)
    UI->>Admin: Hiển thị Modal xác nhận xóa an toàn
    Admin->>UI: Xác nhận "Đồng ý xóa"
    UI->>API: DELETE /api/admin/media/:id (Authorization Header)
    Note over API: Xác thực JWT & Quyền RBAC (media:delete)
    
    API->>DB: SELECT * FROM media WHERE id = :id
    alt Không tìm thấy ảnh
        DB-->>API: null
        API-->>UI: 404 Not Found ("Không tìm thấy ảnh trên hệ thống")
    else Tìm thấy ảnh
        DB-->>API: MediaRecord { publicId, url }
        opt Có publicId trên Cloudinary
            API->>Cloudinary: cloudinary.uploader.destroy(publicId)
            Cloudinary-->>API: { result: "ok" | "not found" }
        end
        API->>DB: DELETE FROM media WHERE id = :id
        DB-->>API: Delete Result (1 row affected)
        API-->>UI: 200 OK { success: true, message: "Đã xóa ảnh thành công" }
        UI-->>Admin: Xóa card khỏi giao diện tức thì, Toast thông báo thành công
    end
```

---

### 1.3. Luồng Chèn Ảnh Vào Form Car / Post Qua MediaPickerModal (US-03)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👤 Admin / Editor
    participant Form as 📝 Car / Post Form (Parent Component)
    participant Modal as 🖼️ MediaPickerModal (Child Component)
    participant API as ⚙️ Backend API (/api/admin/media)

    Admin->>Form: Bấm "Chọn ảnh từ thư viện" (Ảnh đại diện xe hoặc Featured Image)
    Form->>Modal: Mở Modal (mode: "single" | "multiple", currentSelection: url[])
    Modal->>API: GET /api/admin/media?page=1&limit=24
    API-->>Modal: { items: MediaRecord[], total, totalPages }
    Modal-->>Admin: Hiển thị thư viện ảnh dạng Grid (Loading -> Data)
    
    alt Admin chọn ảnh có sẵn trong thư viện
        Admin->>Modal: Click chọn 1 hoặc nhiều ảnh (Tick checkbox / viền xanh)
    else Admin muốn upload ảnh mới ngay tại Modal
        Admin->>Modal: Chuyển Tab "Tải ảnh mới" -> Kéo thả ảnh vào Dropzone
        Modal->>API: Upload qua luồng Concurrency Queue (1.1)
        API-->>Modal: 201 Created (Trả về MediaRecord vừa tạo)
        Modal->>Modal: Tự động highlight chọn ảnh mới vừa upload
    end

    Admin->>Modal: Bấm nút "Xác nhận chọn"
    Modal->>Form: onSelect(selectedMediaItems)
    Modal->>Modal: Đóng Modal
    Form->>Form: Cập nhật Form State (React Hook Form / Local State)
    Form-->>Admin: Hiển thị ảnh xem trước (Thumbnail Preview) ngay trong form
```

---

## 2. Sơ đồ Trạng thái Thực thể (State Machine Diagram)

```mermaid
stateDiagram-v2
    [*] --> QUEUED: Chọn tệp từ máy tính (Client Queue)
    QUEUED --> UPLOADING: Lấy slot từ Concurrency Pool (<= 3 luồng)
    
    UPLOADING --> FAILED_CLIENT_VALIDATION: Sai MIME Type hoặc > 10MB
    FAILED_CLIENT_VALIDATION --> [*]

    UPLOADING --> STREAMING_TO_CLOUDINARY: Đang pipe stream lên Cloudinary
    STREAMING_TO_CLOUDINARY --> FAILED_CLOUDINARY: Lỗi mạng / Quota Cloudinary
    
    FAILED_CLOUDINARY --> RETRYING: Người dùng bấm "Thử lại"
    RETRYING --> UPLOADING
    FAILED_CLOUDINARY --> TERMINATED: Hủy bỏ tải lên
    
    STREAMING_TO_CLOUDINARY --> PERSISTING_DB: Cloudinary trả về URL & Public ID
    PERSISTING_DB --> ROLLBACK_ORPHAN: Lỗi DB Insert / Timeout
    ROLLBACK_ORPHAN --> TERMINATED: Đã hủy ảnh trên Cloudinary

    PERSISTING_DB --> ACTIVE_MEDIA: Lưu DB PostgreSQL thành công
    
    ACTIVE_MEDIA --> EDITING_METADATA: Admin cập nhật Alt Text / Filename
    EDITING_METADATA --> ACTIVE_MEDIA: Lưu thay đổi thành công
    
    ACTIVE_MEDIA --> DELETING: Admin kích hoạt xóa ảnh
    DELETING --> PURGED_CLOUDINARY: Xóa Cloudinary asset
    PURGED_CLOUDINARY --> DELETED_DB: Xóa record khỏi PostgreSQL
    DELETED_DB --> [*]
```

---

## 3. Bảng Giải Phẫu Từng Bước (Step Anatomy Table)

| Bước # | Lát cắt | Tác nhân | Hành động | Payload Input | Logic Xử lý & Quy tắc Nghiệp vụ | Output & State | Cơ chế Xử lý Lỗi & Phục hồi |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | US-02 | Admin | Kéo thả hoặc chọn tệp từ máy | `FileList` (1 hoặc nhiều file) | Kiểm tra `file.size <= 10MB`, MIME type thuộc `['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']`. Sinh UUID tạm cho client queue. | Queue State: `QUEUED`. Hiển thị danh sách card hàng đợi kèm thanh progress 0%. | Báo lỗi ngay trên từng card nếu vi phạm; loại khỏi hàng đợi tải lên. |
| **2** | US-01 | Client Queue | Dispatch request upload | `FormData { file }` | Concurrency Controller giới hạn tối đa 3 request chạy đồng thời. Khởi tạo XMLHttpRequest / Fetch để lắng nghe tiến trình upload chunk. | Client State: `UPLOADING` (% progress tăng dần 0% ➡️ 100%). | Nếu mạng rớt: Chuyển state `FAILED_NETWORK`, hiển thị icon Retry. |
| **3** | US-01 | API Gateway | Nhận multipart stream | HTTP Request + JWT Cookie/Bearer | Xác thực Auth JWT. Kiểm tra RBAC `checkPermission('media:write')`. Parse multipart stream không ghi đĩa. | Chuyển stream vào Service | Trả về `401 UNAUTHORIZED` hoặc `403 FORBIDDEN` nếu không đủ quyền. |
| **4** | US-01 | Cloudinary Service | Streaming pipe sang Cloudinary | Stream data + folder config | Dùng `cloudinary.v2.uploader.upload_stream({ folder: 'cardealer', resource_type: 'image' })`. Tự động tối ưu định dạng WebP/AVIF. | Cloudinary Response `{ secure_url, public_id, width, height, format, bytes }` | Nếu Cloudinary timeout / fail: Ném lỗi `CLOUDINARY_UPLOAD_FAILED`, trả về HTTP 502. |
| **5** | US-01 | Database Handler | Lưu thông tin media | DTO `{ filename, url, publicId, mimeType, fileSize, width, height, format, uploaderId }` | Thực thi Drizzle `db.insert(schema.media).values(...)`. Ghi log audit hành động của Admin. | Media Entity hoàn chỉnh. State DB: `ACTIVE_MEDIA`. Trả về `201 CREATED`. | **Rollback Guarantee:** Nếu DB lỗi, gọi ngay `cloudinary.uploader.destroy(publicId)` trước khi trả về lỗi 500 cho client. |
| **6** | US-02 | Admin UI | Hiển thị kho ảnh `/media` | Query Params `{ page, limit, search, sortBy }` | Gọi `GET /api/admin/media`. Đọc dữ liệu từ DB, phân trang 24 ảnh/trang. Áp dụng debounce 300ms khi tìm kiếm tên ảnh. | 4-State UI: Shimmer Loading ➡️ Grid Media Cards. | Nếu API sập: Hiển thị Error State kèm nút "Tải lại trang". |
| **7** | US-02 | Admin | Sửa Alt Text SEO | `PUT /api/admin/media/:id { altText }` | Validate độ dài altText <= 255 ký tự. Update trường `altText` và `updatedAt`. | Trả về bản ghi cập nhật. Cập nhật cache UI. | Báo lỗi inline trong Drawer nếu validate thất bại. |
| **8** | US-02 | Admin | Xóa ảnh đơn lẻ hoặc hàng loạt | `DELETE /api/admin/media/:id` | Kiểm tra quyền `media:delete`. Tìm `public_id`, gọi Cloudinary xóa file vật lý, xóa row DB. | Trả về `200 OK`. Xóa card ảnh khỏi giao diện với animation fade-out. | Nếu Cloudinary báo not_found thì vẫn tiếp tục xóa DB để làm sạch dữ liệu. |
| **9** | US-03 | Admin | Nhúng ảnh vào Car/Post form | Click "Chọn ảnh" từ Form | Mở `MediaPickerModal`, chọn ảnh đơn hoặc nhiều ảnh. Bấm "Chèn ảnh". | Form component nhận mảng object `{ id, url, altText, width, height }`. Form state cập nhật. | Đóng modal không lưu nếu Admin bấm Cancel / phím Esc. |
