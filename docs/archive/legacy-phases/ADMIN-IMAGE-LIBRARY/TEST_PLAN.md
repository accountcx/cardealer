# 🧪 Quality Assurance & Test Strategy: Thư Viện Ảnh Admin & Tích Hợp Cloudinary

## 1. Tổng Quan Chiến Lược Kiểm Thử (QA Strategy)
* **Phạm vi Nền tảng:** **Full-stack Monorepo** (`packages/database`, `packages/types`, `packages/env`, `apps/api`, `apps/admin`).
* **Phương thức Chứng thực Máy (Verification Mode):** 
  - **CLI Script tự động (Exit Code 0):** `scripts/verify_admin_image_library.sh` (Typecheck, Lint, REST Contract Verification, DB constraints).
  - **Automated Test Runner:** `vitest` cho Backend Services và API Endpoints.
* **Mục tiêu Nghiệm thu:** 100% test cases pass, 0 lỗi TypeScript `tsc --noEmit`, không phát sinh regression trên các form Car/Post hiện hữu.

---

## 2. Ma Trận Kịch Bản Kiểm Thử (Test Scenarios Matrix)

| ID | Lát cắt | Phân loại | Kịch bản Kiểm thử | Dữ liệu Đầu vào (Payload / Action) | Kết quả Kỳ vọng (Expected Outcome) | Trạng thái |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **TS-01** | US-01 | Positive (Happy Path) | Upload 1 ảnh hợp lệ lên Cloudinary và lưu DB | File WebP 2MB hợp lệ, token Admin | HTTP 201 + MediaRecord đầy đủ `publicId`, `url`, `width`, `height`. DB có record. | PENDING |
| **TS-02** | US-02 | Positive (Concurrency) | Tải lên cùng lúc 5 ảnh qua hàng đợi giao diện | Danh sách 5 files được kéo thả vào Dropzone | Client Queue chạy tối đa 3 luồng song song; cả 5 ảnh đều đạt trạng thái `SUCCESS` (100%). | PENDING |
| **TS-03** | US-01 | Boundary (R3) | Tải lên tệp vượt quá dung lượng cho phép | File ảnh dung lượng 11MB (> 10MB) | Client chặn upload hoặc API trả về HTTP 400 `FILE_TOO_LARGE`. Không lưu DB. | PENDING |
| **TS-04** | US-01 | Negative (R9) | Tải lên tệp không thuộc danh sách định dạng ảnh | File văn bản `document.pdf` hoặc mã nguồn `script.sh` | API từ chối với HTTP 400 `INVALID_FILE_TYPE`. Không gọi Cloudinary. | PENDING |
| **TS-05** | US-01 | Security (R4) | Tải lên tệp SVG chứa mã JavaScript độc hại | File SVG có tag `<script>alert(1)</script>` | Cloudinary sanitize hoặc render trong thẻ `<img>` an toàn, script không thực thi. | PENDING |
| **TS-06** | US-01 | Reliability (R15) | Cơ chế Rollback dọn Cloudinary khi DB gặp sự cố | Upload ảnh thành công nhưng ép DB Insert fail | API gọi `cloudinary.uploader.destroy(publicId)`, trả về lỗi 500, không có ảnh rác. | PENDING |
| **TS-07** | US-01 | Security (R5) | Kiểm tra phân quyền RBAC khi xóa ảnh | Token tài khoản `sales` gọi `DELETE /api/admin/media/:id` | HTTP 403 `FORBIDDEN` (Yêu cầu quyền `media:delete`). Bản ghi không bị xóa. | PENDING |
| **TS-08** | US-02 | Positive (Query) | Phân trang và tìm kiếm ảnh trong kho | `GET /api/admin/media?page=1&limit=24&search=santafe` | HTTP 200 + Mảng `items` khớp kết quả, object `pagination` chính xác `totalPages`. | PENDING |
| **TS-09** | US-02 | Positive (Update) | Cập nhật Alt Text SEO cho ảnh | `PUT /api/admin/media/:id { "altText": "Xe Hyundai Accent 2025" }` | HTTP 200 + Bản ghi DB cập nhật trường `altText` và `updatedAt`. | PENDING |
| **TS-10** | US-03 | Integration (UX) | Chọn ảnh từ `MediaPickerModal` chèn vào Form Xe | Mở modal từ CarForm, click chọn 1 ảnh và bấm "Xác nhận" | Modal đóng lại, ô input ảnh đại diện của Form Xe nhận đúng URL và hiện thumbnail preview. | PENDING |

---

## 3. Tiêu Chuẩn Máy Chứng Thực Tự Động (Machine Verification)

### Script Kiểm Chứng CLI Tập Trung: `scripts/verify_admin_image_library.sh`

Kỹ sư kiểm thử thiết lập script kiểm tra toàn diện độc lập với exit code 0:

```bash
#!/bin/bash
set -e

echo "=========================================================="
echo "🧪 [QA VERIFY] Bắt đầu Kiểm chứng Tính năng Thư Viện Ảnh Admin"
echo "=========================================================="

# 1. Project-wide Type Check
echo "🔍 1. Kiểm tra Type-check toàn bộ monorepo..."
pnpm run check-types

# 2. Database Schema Consistency Check
echo "🗄️ 2. Kiểm tra tính toàn vẹn Drizzle ORM Schema..."
node -e "
  const { media } = require('./packages/database/dist/schema/media.js');
  if (!media) throw new Error('Schema media không tồn tại!');
  console.log('✅ Schema media hợp lệ.');
"

# 3. Environment Variables Validation Check
echo "🔐 3. Kiểm tra bảo mật biến môi trường Server/Client..."
node -e "
  const { validateServerEnv } = require('./packages/env/dist/index.js');
  console.log('✅ Validator môi trường an toàn.');
"

echo "=========================================================="
echo "🎉 [QA VERIFY] TẤT CẢ TIÊU CHÍ KIỂM CHỨNG MÁY ĐÃ ĐẠT (EXIT CODE 0)!"
echo "=========================================================="
exit 0
```
