# 🏛️ Architectural Solution Options: Thư Viện Ảnh Admin & Tích Hợp Cloudinary (Admin Image Library)

## 1. Bối cảnh và Ràng buộc Kỹ thuật (Technical Constraints)
* **Phạm vi Nền tảng:** **Full-stack Monorepo** (`packages/database`, `packages/types`, `packages/env`, `packages/ui`, `apps/api`, `apps/admin`).
* **Hiện trạng Hệ thống:** 
  - Backend `apps/api` vận hành bằng Node.js HTTP Server (`server.ts` kết hợp Router Delegation Pattern).
  - PostgreSQL 16 quản lý bằng Drizzle ORM (`packages/database`). Đã có file schema sơ khai `schema/media.ts` nhưng chưa có migration và thiếu các trường đặc thù của Cloudinary (`publicId`, `format`, `folder`, `uploaderId`).
  - Toàn bộ giao diện Admin hiện tại (`apps/admin`) đang sử dụng ô `Input` gõ link URL thủ công hoặc đường dẫn tĩnh `/images/cars/...`, chưa có giao diện Thư viện Ảnh và chưa có bộ chọn ảnh tập trung.
* **Trạng thái Môi trường:** 🟢 **Pure Development (Sandbox)** — Cho phép tối ưu hóa schema và tích hợp trọn vẹn từ kiến trúc gốc.
* **Phạm vi Bao quát:** Giải pháp thiết kế cho toàn bộ các lát cắt `US-01` (Backend & Cloudinary), `US-02` (Admin Media Portal `/media`), và `US-03` (Reusable MediaPickerModal & Tích hợp liên module).

---

## 2. Các Quyết định Kiến trúc Trọng yếu (Architecture Decisions)

### 📌 Quyết định 1: Kiến trúc Luồng Dữ liệu Tải Lên (Upload Pipeline Architecture)
* **Bối cảnh bài toán:** Cần quyết định phương thức trung chuyển tệp ảnh từ trình duyệt Admin lên Cloudinary và lưu vết vào cơ sở dữ liệu PostgreSQL sao cho an toàn, bảo vệ bí mật API Secret và không làm rò rỉ tài nguyên.

| Tiêu chí So sánh | Option 1.A: Direct Client Upload (Signed / Unsigned Preset) | Option 1.B: Server Streaming Proxy (Khuyên dùng) | Option 1.C: Background Job Queue (Redis + BullMQ) |
| :--- | :--- | :--- | :--- |
| **Mô hình Kỹ thuật** | Trình duyệt gọi API lấy signature, sau đó POST trực tiếp lên Cloudinary API. Nhận URL xong gọi tiếp API backend để lưu DB. | Trình duyệt gửi multipart tới `apps/api`. Server validate MIME/Size trên Stream và pipe trực tiếp vào `cloudinary.uploader.upload_stream`. Lưu DB ngay khi xong. | Trình duyệt upload lên storage tạm của server, đẩy task vào Redis BullMQ worker để upload Cloudinary và socket notify. |
| **Ưu điểm** | Giảm tải băng thông cho server backend; tận dụng CDN upload trực tiếp của Cloudinary. | **Bảo mật tối đa:** Cloudinary Secret chỉ nằm ở server; kiểm soát 100% MIME type, dung lượng; **Zero Orphaned Assets** (tự động rollback xóa ảnh Cloudinary nếu DB lỗi); không ghi file tạm vào đĩa cứng (Zero disk I/O). | Chịu tải hàng ngàn file lớn đồng thời; cô lập crash worker hoàn toàn khỏi API server chính. |
| **Nhược điểm / Đánh đổi** | Rủi ro client upload ảnh rác lên Cloudinary nhưng bỏ ngang không lưu DB; logic client phức tạp (phải xử lý 2 chặng request); khó kiểm soát RBAC phân quyền. | Chiếm một lượng băng thông nhỏ của server Node.js khi upload (tuy nhiên đối với hệ thống CMS nội bộ Showroom thì tải này hoàn toàn không đáng kể). | Cực kỳ cồng kềnh, đòi hỏi thêm Redis, Worker process, WebSocket; gây lãng phí tài nguyên và chi phí vận hành cho CarDealer. |
| **Tác động Hệ thống** | Cần expose cấu hình upload preset ra client. | Bổ sung module `cloudinary.service.ts` và router `routes/admin/media.ts` nhẹ nhàng, độc lập trong `apps/api`. | Cần cài đặt và duy trì Redis container, worker process mới. |

👉 **Khuyến nghị cho Quyết định 1:** Chọn **Option 1.B (Server Streaming Proxy)** vì mang lại độ an toàn cao nhất, bảo mật tuyệt đối Cloudinary Credentials, chống rò rỉ file rác với cơ chế Transaction Rollback, và không tạo gánh nặng hạ tầng mới.

---

### 📌 Quyết định 2: Cơ chế Tải Lên Đa Tệp trên Giao Diện (Client-Side Batch Upload Strategy)
* **Bối cảnh bài toán:** Khi người dùng Admin kéo thả cùng lúc 5–20 ảnh vào khu vực Upload, client và server cần điều phối như thế nào để đảm bảo trải nghiệm mượt mà, phản hồi tiến độ (progress) và xử lý lỗi từng phần (partial failure).

| Tiêu chí So sánh | Option 2.A: Single-Request Multi-File Batch (Gộp 1 Request) | Option 2.B: Concurrent Multi-Requests with Queue (Khuyên dùng) |
| :--- | :--- | :--- |
| **Mô hình Kỹ thuật** | Gộp toàn bộ các file được chọn vào 1 request HTTP `multipart/form-data` duy nhất gửi lên API. | Client bóc tách từng file thành các request độc lập, điều phối qua hàng đợi Concurrency Queue (giới hạn 3–4 request upload chạy song song). |
| **Ưu điểm** | Chỉ tạo 1 kết nối HTTP duy nhất. | **Trải nghiệm đỉnh cao:** Hiển thị thanh tiến trình (%) và trạng thái (Đang tải / Hoàn tất / Lỗi) độc lập cho từng ảnh; **Phục hồi thông minh:** Nếu 1 file lỗi (quá dung lượng, sai định dạng), các file khác vẫn upload thành công; hỗ trợ nút "Thử lại" (Retry) từng file. |
| **Nhược điểm / Đánh đổi** | Nếu mạng chập chờn hoặc 1 file lỗi dung lượng, toàn bộ cả batch bị hủy bỏ; khó đo lường tiến trình chính xác từng file. | Sinh ra nhiều request HTTP hơn (nhưng được kiểm soát chặt qua hàng đợi Concurrency Limit 3-4 luồng). |
| **Tác động Hệ thống** | Server phải parse mảng file lớn trong 1 lần. | Server xử lý các stream nhỏ độc lập, tận dụng tốt Non-blocking I/O của Node.js. |

👉 **Khuyến nghị cho Quyết định 2:** Chọn **Option 2.B (Concurrent Multi-Requests with Queue)** nhằm đạt chuẩn UX cao cấp cho Admin, cho phép theo dõi tiến trình upload từng ảnh và không bị hủy toàn bộ mẻ tải lên nếu một ảnh gặp sự cố.

---

### 📌 Quyết định 3: Kiến trúc Thành phần Giao diện & Tái sử dụng (Media Picker Architecture)
* **Bối cảnh bài toán:** Admin cần vừa có trang quản trị tập trung `/media` để duyệt, tìm kiếm, sửa Alt Text và dọn dẹp ảnh, vừa cần công cụ chọn ảnh ngay tại các form Car (`CarFormModal.tsx`), Post (`posts/[id]/page.tsx`) và Profile (`profile/page.tsx`).

| Tiêu chí So sánh | Option 3.A: Standalone Page Only (Chỉ làm trang /media) | Option 3.B: Unified Page + Headless Reusable MediaPickerModal (Khuyên dùng) |
| :--- | :--- | :--- |
| **Mô hình Kỹ thuật** | Chỉ xây dựng trang `/media`. Khi tạo xe hoặc bài viết, Admin phải mở tab `/media`, copy URL rồi quay lại paste tay vào ô text. | Xây dựng trang `/media` kết hợp bộ component tái sử dụng `MediaPickerModal`: hỗ trợ 2 Tabs ("Kho Ảnh Showroom" và "Tải Ảnh Mới"), 2 modes (`mode="single"` cho avatar/ảnh đại diện xe, `mode="multiple"` cho gallery bài viết). |
| **Ưu điểm** | Lập trình nhanh nhất. | **Trải nghiệm chuẩn mực CMS hàng đầu (tương tự Strapi / WordPress):** Admin bấm "Chọn ảnh", duyệt kho hoặc kéo thả upload ngay trong popup modal, xem preview tức thì; loại bỏ hoàn toàn việc gõ URL thủ công dễ sai sót. |
| **Nhược điểm / Đánh đổi** | Trải nghiệm rất tệ, thao tác thủ công, Admin dễ copy nhầm URL. | Đòi hỏi thiết kế component dạng module hóa cao (Props contract rõ ràng). |
| **Tác động Hệ thống** | Chỉ tạo 1 trang. | Tạo trang `/media` và component dùng chung `MediaPickerModal`, thay thế các ô input URL trên toàn bộ hệ thống Admin. |

👉 **Khuyến nghị cho Quyết định 3:** Chọn **Option 3.B (Unified Page + Reusable MediaPickerModal)** để chuẩn hóa toàn diện trải nghiệm quản trị nội dung của hệ thống CarDealer.

---

## 3. Tổng kết Đề xuất Kiến trúc
* **Gói giải pháp Tối ưu đề xuất:** **Option 1.B + Option 2.B + Option 3.B**
  1. **Backend:** Server Streaming Proxy qua Node.js native stream đến Cloudinary SDK (`upload_stream`), bảo vệ credentials an toàn và tự động dọn rác Cloudinary nếu DB lỗi.
  2. **Client Upload:** Kéo thả đa tệp điều phối qua Concurrency Queue (3–4 luồng), đo lường tiến trình (%) độc lập, hỗ trợ retry từng file.
  3. **Frontend Component:** Xây dựng trang quản trị `/media` kèm component `MediaPickerModal` tái sử dụng đa năng (single/multiple mode), thay thế ô nhập tay URL trên toàn hệ thống.
* **Định hướng triển khai:** Bộ giải pháp này mở đường trực tiếp cho Step 2.2 thiết kế chi tiết:
  - `FLOW.md` (Sequence diagrams cho luồng upload stream, queue và rollback).
  - `SCHEMA.md` (Drizzle model mở rộng cho `media` kèm indexes).
  - `API_SPEC.md` (Giao ước endpoints `/api/admin/media/*`).
  - `FE_INTEGRATION_GUIDE.md` (Component hierarchy, Design Tokens, 4-state UI).
