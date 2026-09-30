# 📚 BÀI HỌC KINH NGHIỆM & TRI THỨC DỰ ÁN (LESSONS LEARNED)

Tài liệu này ghi lại các bài học kiến trúc, kinh nghiệm xử lý lỗi thực tế và các quy tắc thiết kế hệ thống quan trọng được đúc kết từ quá trình phát triển hệ thống CarDealer.

---

## 1. Cơ Sở Dữ Liệu & Toàn Vẹn Khóa Ngoại (PostgreSQL UUID & Foreign Keys)

### Vấn đề gặp phải
- Khi tạo mới phiên bản xe ở client trước khi lưu, việc gán ID tạm dạng `v_${Date.now()}` khiến câu lệnh chèn vào bảng `version_colors` bị lỗi `invalid input syntax for type uuid` hoặc `foreign key constraint violation` do cột `version_id` yêu cầu kiểu dữ liệu UUID và tham chiếu tới bảng `car_versions`.

### Giải pháp chuẩn mực
1. **Client-side UUID Generation:**
   - Sử dụng chuẩn `crypto.randomUUID()` cho các bản ghi tạo mới ở client thay vì chuỗi timestamp hay prefix tùy biến.
   - Khi submit form, luôn có hàm sanitize rà soát các ID để bảo đảm 100% tuân thủ định dạng UUID v4.
2. **Backend Defensive Validation & Sanitization:**
   - Trong endpoint xử lý batch insert (ví dụ `POST /api/admin/version-colors`), backend phải chủ động lọc danh sách `validVersionIds` dựa trên các phiên bản xe thực sự tồn tại trong cơ sở dữ liệu trước khi thực thi lệnh `insert`.
   - Nếu có version_id không hợp lệ hoặc chưa được lưu, bỏ qua hoặc xử lý tuần tự sau khi lưu version chính để tránh làm crash transaction.

---

## 2. Giao Diện & Thiết Kế CSS Flexbox (UI Squishing & Button Layouts)

### Vấn đề gặp phải
- Nút bấm hoặc nhãn `<label>` chứa input file nằm trong container Flexbox bị bóp méo (`squish`), dẫn đến nội dung chữ bị bẻ xuống nhiều dòng (ví dụ "Tải\nảnh\ntừ\nmáy") khi màn hình hoặc container bị giới hạn độ rộng.

### Giải pháp chuẩn mực
1. **Bảo Vệ Nút Trong Flexbox:**
   - Luôn áp dụng bộ class CSS:
     ```css
     inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 select-none
     ```
   - Container chứa nhóm các nút hành động cũng cần được gắn thuộc tính `shrink-0` để ngăn cha Flexbox ép co hẹp nhóm hành động.
2. **Tuân thủ Design System `@cardealer/ui`:**
   - Ưu tiên sử dụng component `<Button>` chuẩn hóa thay cho các thẻ HTML thô (`<button>`, `<input type="button">`) để đảm bảo padding, font size, hover effects và tính nhất quán đồng bộ toàn hệ thống.

---

## 3. Quản Lý Media & Hiệu Năng Lưu Trữ (Direct CDN Upload vs. Base64)

### Vấn đề gặp phải
- Việc đọc file ảnh trực tiếp qua `FileReader` thành Base64 DataURL để lưu trữ vào cơ sở dữ liệu làm kích thước JSON payload phình to hàng chục MB, gây chậm truy vấn cơ sở dữ liệu và làm nghẽn băng thông mạng.

### Giải pháp chuẩn mực
1. **Trực tiếp Stream Lên Cloudinary CDN:**
   - Mọi thao tác tải ảnh từ máy tính (dù là ảnh đơn lẻ hay tải hàng loạt) đều phải qua pipeline upload trực tiếp lên Cloudinary thông qua service tập trung:
     ```typescript
     const mediaItem = await mediaService.uploadSingleMedia(file, folder);
     const cdnUrl = mediaItem.url;
     ```
   - Chỉ lưu trữ đường link HTTPS CDN (`url`) vào cấu trúc dữ liệu của bài viết hoặc xe.
2. **UX Trạng Thái Tải Lên Phản Hồi Tức Thì:**
   - Trong quá trình stream ảnh lên CDN:
     - Khóa (disable) nút bấm hoặc input tương ứng để chống spam/double click.
     - Hiển thị spinner trạng thái loading: `<Loader2 className="animate-spin" />` và thông báo tiến trình rõ ràng ("Đang đẩy lên Cloudinary...").
     - Bắn Toast thông báo thành công hoặc báo lỗi cụ thể nếu upload gặp sự cố mạng.

---

## 4. Kiểm Thử & Kiểm Chứng Hệ Thống Tự Động (Verification Gate)

### Quy tắc bất biến
1. **Kiểm tra Type-Check toàn Monorepo:**
   - Luôn kích hoạt Node.js v24: `source "$HOME/.nvm/nvm.sh" && nvm use 24`.
   - Chạy `pnpm turbo run check-types` đảm bảo 100% 8/8 packages không có bất kỳ lỗi TypeScript nào.
2. **Kịch bản tự động khép kín (End-to-End Verification):**
   - Viết và duy trì các bash script tự động (như `scripts/verify_car_image_integration.sh`) để kiểm tra cú pháp, sự hiện diện của component và bảo đảm nguyên tắc Zero Raw HTML Controls.
