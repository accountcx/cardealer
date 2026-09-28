# 🛡️ Risk Audit & Threat Analysis Report: Thư Viện Ảnh Admin & Tích Hợp Cloudinary

## 1. Bảng Ma Trận Rủi Ro Tổng Quan (R1 - R17 Taxonomy)

| Mã | Nhóm Rủi Ro | Phân Loại Chuẩn | Cấp Độ | Trạng Thái | Vùng Ảnh Hưởng (Components / Endpoints / Files) |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **R2** | Memory Leak & RAM Exhaustion | CWE-400 / CWE-770 | 🔴 HIGH | Mitigated by Design | `apps/api/src/services/cloudinary.service.ts`, `routes/admin/media.ts` |
| **R4** | Stored XSS via Malicious SVG Upload | OWASP A03 / CWE-79 | 🔴 HIGH | Mitigated by Design | `POST /api/admin/media/upload`, File Magic-Number Validator |
| **R6** | Secret Exposure (`CLOUDINARY_API_SECRET`) | OWASP A01 / CWE-522 | 🔴 HIGH | Mitigated by Design | `packages/env/src/index.ts`, `.env.example`, Next.js bundles |
| **R9** | Unrestricted File Upload / Web Shell | OWASP A01 / CWE-434 | 🔴 HIGH | Mitigated by Design | `POST /api/admin/media/upload`, MIME & Cloudinary inspection |
| **R15**| Orphaned Cloudinary Assets (DB Failure) | Reliability Invariant | 🔴 HIGH | Mitigated by Design | Stream Pipe Handler ➡️ DB Insert Exception Handler |
| **R1** | N+1 Queries & Table Locks | CWE-400 | 🟠 MEDIUM | Mitigated by Design | `GET /api/admin/media`, Drizzle ORM query & Indexes |
| **R3** | Payload Size & Network IO Bottleneck | CWE-400 | 🟠 MEDIUM | Mitigated by Design | Concurrency Queue (Max 3 luồng), Max 10MB chunk boundary |
| **R5** | Broken Object-Level Auth / IDOR | OWASP A01 / CWE-862 | 🟠 MEDIUM | Mitigated by Design | `DELETE /api/admin/media/:id`, RBAC `media:delete` |
| **R7** | Mass Assignment & DTO Pollution | OWASP A08 / CWE-915 | 🟠 MEDIUM | Mitigated by Design | `PUT /api/admin/media/:id` (Chỉ chấp nhận field `altText`) |
| **R13**| Race Condition & Batch Delete Conflict | CWE-362 | 🟡 LOW | Mitigated by Design | Unique Index trên `publicId`, atomic delete queries |
| **R16**| Timezone Shift on Media Timestamps | Logic Drift | 🟡 LOW | Mitigated by Design | PostgreSQL `timestamptz` chuẩn UTC, ISO8601 serializing |
| **R17**| Supply Chain & Outdated Cloudinary SDK | OWASP A06 | 🟡 LOW | Verified Clean | Thư viện `cloudinary` SDK phiên bản mới nhất, `busboy` v1.6+ |

---

## 2. Chi Tiết Rủi Ro Mức Độ Cao (High Risks) & Biện Pháp Phòng Vệ

### 🔴 [R2] Tràn Bộ Nhớ RAM do Buffer Tệp Lớn (Memory Leak & RAM Exhaustion)
* **Kịch bản Nguy hại:** Khi Admin tải lên nhiều ảnh lớn (5–10MB mỗi file), nếu server đọc toàn bộ file vào Node.js `Buffer` trong RAM trước khi gửi sang Cloudinary, server có thể bị cạn kiệt bộ nhớ (OOM Crash).
* **Bản chất Kỹ thuật:** Lưu trữ in-memory toàn bộ request payload bằng `fs.readFile` hoặc buffer tích lũy.
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  - Bắt buộc sử dụng cơ chế **Streaming Pipeline**: Dùng `busboy` để stream từng chunk dữ liệu trực tiếp vào `cloudinary.uploader.upload_stream`.
  - Giới hạn kích thước stream: Nếu tổng dung lượng chunk vượt quá 10MB (10,485,760 bytes), ngắt stream ngay lập tức và hủy upload sang Cloudinary.
* **Kế hoạch Rollback:** Khởi động lại service `apps/api`, khôi phục container và kiểm tra heap dump nếu phát hiện memory tăng bất thường.
* **Chỉ Dẫn Kiểm Thử (Input QA):** Bắn request upload file 9.9MB, giám sát biến động RAM của `apps/api` (không được tăng đột biến quá 30MB).

---

### 🔴 [R4] Tấn Công Stored XSS Thông Qua Tệp SVG Độc Hại (SVG Script Injection)
* **Kịch bản Nguy hại:** Kẻ xấu có quyền Editor tải lên tệp có đuôi `.svg` chứa mã script độc hại `<svg onload="alert(document.cookie)">`. Khi Admin hoặc khách xem mở ảnh trực tiếp trên trình duyệt, script kích hoạt chiếm quyền session.
* **Bản chất Kỹ thuật:** File SVG là XML có khả năng thực thi JavaScript nếu không được làm sạch hoặc serve với header thiếu an toàn.
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  - Khuyến nghị ưu tiên chuyển đổi SVG sang WebP/PNG hoặc cấu hình Cloudinary gắn flag `resource_type: 'image'`, tự động sanitize XML.
  - Khi render ảnh trên trình duyệt Admin, luôn dùng thẻ `<img src="..." />` (trình duyệt không thực thi script trong thẻ img) và tuyệt đối CẤM render inline SVG (`dangerouslySetInnerHTML`) từ tệp người dùng tải lên.
* **Chỉ Dẫn Kiểm Thử (Input QA):** Upload tệp SVG chứa payload XSS, mở ảnh trong giao diện Admin và khẳng định không có alert/script nào được kích hoạt.

---

### 🔴 [R6] Rò Rỉ Secret Key Cloudinary Ra Frontend (Secret Exposure)
* **Kịch bản Nguy hại:** `CLOUDINARY_API_SECRET` vô tình bị gắn tiền tố `NEXT_PUBLIC_` hoặc import vào Next.js Client Component, dẫn đến việc secret bị đóng gói vào file bundle JS công khai.
* **Bản chất Kỹ thuật:** Lẫn lộn giữa Server-side Environment và Client-side Environment.
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  - Định nghĩa `CLOUDINARY_API_SECRET` duy nhất tại `serverEnvSchema` trong `packages/env/src/index.ts`.
  - CẤM hoàn toàn việc đưa `CLOUDINARY_API_SECRET` vào `clientEnvSchema` hay bất kỳ component nào trong `apps/admin`.
  - Client chỉ giao tiếp với Backend qua REST endpoints có bảo vệ JWT.
* **Chỉ Dẫn Kiểm Thử (Input QA):** Quét bundle JS build của `apps/admin` khẳng định chuỗi API Secret không xuất hiện trong bất kỳ file build tĩnh nào.

---

### 🔴 [R9] Tải Lên Tệp Ngụy Trang Độc Hại (Unrestricted File Upload / Bypass Extension)
* **Kịch bản Nguy hại:** Người dùng đổi tên tệp thực thi `exploit.php` thành `exploit.jpg.webp` và tải lên nhằm tìm kiếm kẽ hở Remote Code Execution.
* **Bản chất Kỹ thuật:** Chỉ kiểm tra phần mở rộng file (Extension check) mà bỏ qua Content-Type header và File Magic Bytes.
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  - Kiểm tra 3 lớp:
    1. Lớp 1 (Client): Whitelist file extension và `file.type`.
    2. Lớp 2 (API Gateway): Validate Content-Type MIME header từ request multipart.
    3. Lớp 3 (Cloudinary Engine): Cloudinary inspect magic bytes thật của file, tự động từ chối nếu không phải định dạng ảnh hợp lệ.
* **Chỉ Dẫn Kiểm Thử (Input QA):** Đổi tên file text hoặc file bash script thành `.png` và gửi upload, khẳng định API trả về lỗi 400 hoặc 502 và không tạo bản ghi trong DB.

---

### 🔴 [R15] Rác Tài Nguyên Cloudinary Khi Database Thất Bại (Orphaned Assets Rollback)
* **Kịch bản Nguy hại:** Ảnh upload lên Cloudinary thành công và trả về URL, nhưng câu lệnh `db.insert(schema.media)` gặp lỗi (ví dụ DB connection pool timeout). Ảnh nằm vĩnh viễn trên Cloudinary gây lãng phí dung lượng và không quản lý được.
* **Bản chất Kỹ thuật:** Thiếu tính nguyên tử (Atomicity) giữa dịch vụ lưu trữ ngoài (Third-party Cloud Storage) và cơ sở dữ liệu nội bộ.
* **Giải Pháp Phòng Vệ Bắt Buộc:**
  - Bọc khối Insert DB trong khối `try/catch`.
  - Nếu DB ném lỗi, kích hoạt ngay lập tức cơ chế **Rollback đền bù (Compensating Rollback)**:
    ```typescript
    try {
      await db.insert(schema.media).values(mediaData);
    } catch (dbError) {
      // 🧠 Rollback: Xóa ngay file vừa tải lên Cloudinary để chống rác
      await cloudinary.uploader.destroy(uploadResult.public_id);
      throw new Error('DATABASE_INSERT_FAILED');
    }
    ```
* **Chỉ Dẫn Kiểm Thử (Input QA):** Mock lỗi DB insert khi upload ảnh, kiểm tra API Cloudinary khẳng định `public_id` đã bị hủy bỏ thành công.

---

## 3. Bản Đồ Bán Kính Tác Động (Blast Radius Containment)

* **Vùng Tác Động Trực Tiếp (Direct Impact):**
  - Bảng mới: `media` trong PostgreSQL.
  - Endpoints mới: `/api/admin/media/*`.
  - Trang mới: `/media` trong `apps/admin`.
* **Vùng Tác Động Gián Tiếp (Downstream Consumers):**
  - Form Quản trị Xe ([`CarFormModal.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/cars/components/CarFormModal.tsx)): Thay thế ô gõ text bằng `MediaPickerModal`.
  - Form Quản trị Bài Viết ([`posts/[id]/page.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/posts/%5Bid%5D/page.tsx)): Nhúng component chọn ảnh đại diện và khối ảnh.
  - Hồ sơ Cá nhân ([`profile/page.tsx`](file:///Users/nhatphan/Code/CarDealer/cardealer/apps/admin/app/profile/page.tsx)): Đổi avatar nhân viên.
* **Rào chắn Bảo Vệ An Toàn Dữ Liệu Cũ:**
  - Toàn bộ đường dẫn ảnh cũ dạng chuỗi `/images/cars/...` vẫn được giữ nguyên tính tương thích (Backward Compatibility), không ép buộc migrate dữ liệu cũ nếu chưa cần thiết.
