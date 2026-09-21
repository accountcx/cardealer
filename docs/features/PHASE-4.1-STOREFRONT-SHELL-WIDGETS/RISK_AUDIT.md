# 🛡️ Báo Cáo Ma Trận Kiểm Toán Rủi Ro & An Ninh (Security & Risk Audit Matrix)
## PHASE 4.1 - STOREFRONT SHELL & CONVERSION WIDGETS (`EPIC-PHASE-4.1-STOREFRONT-SHELL-WIDGETS`)

> **Chuyên gia thực hiện:** `dependency-graph-analyzer` & `qa-test-engineer`  
> **Trạng thái:** Hoàn tất kiểm toán toàn diện 17 điểm rủi ro (R1–R17)  
> **Áp dụng cho:** Storefront Shell (Navbar, Drawer, Footer), Conversion Widgets (FloatingSeller, StickyBar), Admin Settings Portal, System Settings API

---

## 1. Tổng Quan Ma Trận Rủi Ro (Risk Heatmap Overview)

| Mức Độ Nghiêm Trọng | Số Lượng | Mã Rủi Ro |
| :--- | :---: | :--- |
| 🔴 **CRITICAL** (Tối khẩn) | 4 | **R1, R2, R3, R4** |
| 🟠 **HIGH** (Cao) | 6 | **R5, R6, R7, R8, R9, R10** |
| 🟡 **MEDIUM** (Trung bình) | 5 | **R11, R12, R13, R14, R15** |
| 🟢 **LOW** (Thấp) | 2 | **R16, R17** |

---

## 2. Chi Tiết Ma Trận Kiểm Toán 17 Điểm Rủi Ro (R1 – R17)

---

### 🔴 NHÓM CRITICAL (Rủi ro Tối Khẩn - Đe dọa An Ninh & Tính Toàn Vẹn Hệ Thống)

#### R1: Tấn Công Stored XSS Qua Mã Nhúng Google Maps Hoặc Trường Nhập Liệu Tự Do
* **Kịch bản rủi ro:** Kẻ xấu chiếm tài khoản quản trị hoặc người dùng vô tình dán đoạn mã chứa script độc hại (`<script>alert(1)</script>` hoặc `javascript:void(0)`) vào trường `googleMapEmbed` hoặc URL liên kết.
* **Hậu quả:** Khi khách hàng truy cập chân trang Storefront, mã độc tự động thực thi trên trình duyệt người dùng, có nguy cơ đánh cắp cookie hoặc điều hướng sang trang giả mạo.
* **Giải pháp phòng thủ (Defenses):**
  1. **Strict URL / Iframe Whitelist:** Chỉ chấp nhận `src` bắt đầu bằng `https://www.google.com/maps/embed...` hoặc trích xuất thuộc tính `src` từ chuỗi iframe thô.
  2. **Iframe Sandboxing:** Thêm thuộc tính `sandbox="allow-scripts allow-same-origin allow-popups"` và `loading="lazy"`.
  3. **Zod Regex Validation:** Chặn mọi chuỗi chứa từ khóa nguy hiểm (`<script`, `javascript:`, `data:`, `onload=`) ở tầng validation của Zod schema.
* **Phương thức kiểm thử:** Test Suite gửi chuỗi XSS vào trường `googleMapEmbed`; API phải từ chối `400 INVALID_PAYLOAD` hoặc sanitize an toàn.

---

#### R2: Lỗ Hổng Phân Quyền Sửa Đổi Hotline & Cấu Hình Trái Phép (Broken Access Control)
* **Kịch bản rủi ro:** Kẻ tấn công đoán endpoint `PUT /api/admin/settings/:key` hoặc dùng tài khoản role thấp (ví dụ: `sales` hoặc tài khoản bị vô hiệu hóa) để thay đổi số hotline kinh doanh sang số điện thoại lừa đảo.
* **Hậu quả:** Thiệt hại tài chính nghiêm trọng cho khách hàng và phá hủy uy tín của đại lý ô tô.
* **Giải pháp phòng thủ (Defenses):**
  1. **Strict RBAC Guard:** Chỉ tài khoản có role `admin` hoặc quyền `system:write` mới được phép thực thi `PUT /api/admin/settings/*`.
  2. **Audit Logging:** Ghi nhận toàn bộ thao tác cập nhật cấu hình kèm `user_id`, `ip_address`, `timestamp` và `payload_diff` vào bảng `audit_logs`.
* **Phương thức kiểm thử:** Gọi API cập nhật cấu hình bằng token của role `sales`; hệ thống bắt buộc phản hồi `403 FORBIDDEN`.

---

#### R3: Lỗi Phân Tích JSONB Gây Sập Layout Storefront Toàn Trang (Zero-Crash Failure)
* **Kịch bản rủi ro:** Dữ liệu trong bảng `system_settings` bị xóa nhầm, chưa chạy seed dữ liệu ban đầu, hoặc trường JSONB bị thiếu key.
* **Hậu quả:** Server Component `RootLayout` ném lỗi không bắt được (`TypeError: Cannot read properties of undefined`), khiến toàn bộ trang web Storefront hiển thị màn hình trắng (White Screen of Death / HTTP 500).
* **Giải pháp phòng thủ (Defenses):**
  1. **Zero-Crash Fallback Protocol:** Hàm nạp cấu hình `getBulkSettings()` áp dụng cơ chế `Schema.safeParse()`. Nếu có lỗi hoặc dữ liệu rỗng, tự động fallback 100% về `DefaultSettings` được định nghĩa sẵn.
  2. **Resilient Error Boundary:** Bao bọc các Client Widget bằng React `ErrorBoundary` để nếu 1 widget gặp sự cố, phần còn lại của website vẫn hoạt động bình thường.
* **Phương thức kiểm thử:** Xóa sạch dữ liệu bảng `system_settings` trong test database; Storefront vẫn phải render đầy đủ Header, Footer với thông số mặc định mà không ném lỗi 500.

---

#### R4: Lỗi Khóa Dữ Liệu Cache Làm Sai Lệch Hotline Khẩn Cấp (Stale Cache Lockout)
* **Kịch bản rủi ro:** Sau khi Admin cập nhật số hotline mới tại Admin Portal, cơ chế caching tĩnh của Next.js không được giải phóng, khiến khách hàng trên Storefront vẫn liên tục gọi vào số hotline cũ đã nghỉ việc.
* **Hậu quả:** Bỏ lỡ khách hàng mua xe tiềm năng, phát sinh xung đột nội bộ giữa các nhân viên kinh doanh.
* **Giải pháp phòng thủ (Defenses):**
  1. **On-Demand Tag Revalidation:** Khi API `PUT /api/admin/settings/:key` thành công, tự động gửi tín hiệu làm mới tag cache `revalidateTag('system-settings')`.
  2. **Time-To-Live Fallback:** Thiết lập `stale-while-revalidate` tối đa 60 giây để đảm bảo dù mất tín hiệu webhook revalidate thì cache cũng tự động làm tươi sau 1 phút.
* **Phương thức kiểm thử:** Thực hiện cập nhật hotline qua API, sau đó gọi `GET /api/settings`; phản hồi trả về phải mang số hotline mới ngay lập tức.

---

### 🟠 NHÓM HIGH (Rủi ro Trải Nghiệm Giao Diện, Hiệu Năng & Đồng Bộ)

#### R5: Nhảy Layout Gây Tụt Điểm Google Core Web Vitals (Cumulative Layout Shift - CLS > 0.1)
* **Kịch bản rủi ro:** Header hoặc Footer được render ở client-side (`use client`) sau khi fetch dữ liệu, làm toàn bộ nội dung thân trang bị đẩy xuống đột ngột sau 200–500ms.
* **Hậu quả:** Điểm Google PageSpeed tụt dốc, ảnh hưởng thứ hạng SEO trên trang kết quả tìm kiếm của Google.
* **Giải pháp phòng thủ (Defenses):**
  1. **Server Component Shell:** Header, TopBar và Footer bắt buộc render trực tiếp ở Server Component (`RootLayout`), truyền sẵn kích thước cố định (`min-h-[72px]`).
  2. **CSS Layout Reservation:** Định nghĩa chiều cao khung cố định cho navbar để layout trình duyệt không bị thay đổi tọa độ khi mount.
* **Phương thức kiểm thử:** Đo kiểm bằng Lighthouse CI hoặc Chrome DevTools; chỉ số CLS của trang chủ và trang xe phải đạt chính xác **CLS = 0**.

---

#### R6: Xung Đột & Che Khuất Nút Bấm Chuyển Đổi Trên Màn Hình Điện Thoại (Mobile Clashing)
* **Kịch bản rủi ro:** Khách hàng cuộn trang trên điện thoại, `ProductStickyBar` hiện lên ở đáy màn hình trùng đúng tọa độ với avatar của `FloatingSeller`, khiến người dùng không thể bấm vào nút "NHẬN BÁO GIÁ" hoặc bấm nhầm vào Zalo.
* **Hậu quả:** Tỷ lệ bỏ giỏ / thoát trang tăng cao, mất khách hàng ở điểm chạm chốt đơn quan trọng nhất.
* **Giải pháp phòng thủ (Defenses):**
  1. **Dynamic Viewport Coordinator:** Sử dụng Context hoặc Scroll Hook để phát hiện trạng thái hiển thị của StickyBar.
  2. **Dynamic Offset Positioning:** Khi StickyBar xuất hiện, FloatingSeller tự động nhận class chuyển từ `bottom-4` lên `bottom-20` (nâng cao ~80px).
* **Phương thức kiểm thử:** Mô phỏng màn hình iPhone 13 (375x812), cuộn trang qua 300px; xác nhận khoảng cách giữa mép dưới FloatingSeller và mép trên StickyBar >= 16px.

---

#### R7: Số Điện Thoại & Đường Dẫn Zalo Không Hợp Lệ Gây Lỗi Giao Thức (URI Scheme Failure)
* **Kịch bản rủi ro:** Quản trị viên nhập số điện thoại có dấu cách (`0981 234 567`) hoặc số cố định sai chuẩn, khiến liên kết `tel:...` trên điện thoại không kích hoạt được cuộc gọi.
* **Hậu quả:** Khách hàng bấm gọi không được, chuyển sang đại lý đối thủ.
* **Giải pháp phòng thủ (Defenses):**
  1. **Regex Phone Sanitizer:** Hàm tiện ích tự động loại bỏ toàn bộ ký tự không phải số trước khi gán vào thuộc tính href: `tel:${phone.replace(/[^0-9]/g, '')}`.
  2. **Zalo Link Normalizer:** Đảm bảo link Zalo luôn ở dạng chuẩn `https://zalo.me/[phone_number]`.
* **Phương thức kiểm thử:** Test suite kiểm tra với chuỗi đầu vào `0981.234.567`, `0981 234 567`, `+84981234567`; thẻ `<a>` sinh ra phải luôn có href hợp lệ `tel:0981234567`.

---

#### R8: Xung Đột Ghi Đè Dữ Liệu Đồng Thời Trong Admin Portal (Concurrent Mutation Overwrite)
* **Kịch bản rủi ro:** Hai nhân viên quản trị cùng mở trang cài đặt: Nhân viên A sửa Menu điều hướng, Nhân viên B sửa hotline và lưu sau. Nếu hệ thống lưu chung 1 JSON blob lớn, thao tác của B sẽ đè mất các menu của A.
* **Hậu quả:** Mất mát dữ liệu cấu hình ngoài ý muốn.
* **Giải pháp phòng thủ (Defenses):**
  1. **Modular Domain Key Isolation:** Phân chia thành 5 keys độc lập trong database. Thao tác của tab Menu chỉ gửi `PUT /api/admin/settings/navigation_settings`, hoàn toàn không chạm vào `contact_settings`.
* **Phương thức kiểm thử:** Chạy song song 2 request cập nhật `navigation_settings` và `contact_settings`; xác nhận cả 2 đều lưu thành công độc lập mà không bị mất dữ liệu.

---

#### R9: Menu Điều Hướng Vòng Lặp Hoặc Tràn Màn Hình Mobile (Menu Sprawl & Broken Links)
* **Kịch bản rủi ro:** Quản trị viên tạo quá nhiều menu con (hơn 10 mục) khiến Mobile Drawer bị tràn màn hình và không cuộn được đến nút liên hệ ở đáy.
* **Hậu quả:** Khách hàng trên điện thoại bị kẹt giao diện, không thể đóng menu hoặc tìm thấy số điện thoại.
* **Giải pháp phòng thủ (Defenses):**
  1. **Max-Level Guard:** Giới hạn tối đa 2 cấp menu (Menu cha ➡️ Menu con).
  2. **Independent Drawer Scrolling:** Danh sách menu nằm trong vùng `overflow-y-auto`, trong khi 2 nút liên hệ (Gọi & Zalo) được ghim cố định ở chân Drawer (`sticky bottom-0`).
* **Phương thức kiểm thử:** Thêm 15 mục menu con trong Navigation Settings; mở Drawer trên Mobile và xác nhận vẫn nhìn thấy 2 nút liên hệ và cuộn mượt mà.

---

#### R10: Ảnh Đại Diện Chuyên Viên Quá Lớn Làm Chậm Tốc Độ Tải Trang (Unoptimized Shell Assets)
* **Kịch bản rủi ro:** Quản trị viên upload ảnh chụp từ máy cơ 8MB làm avatar chuyên viên tư vấn nổi trên toàn trang web.
* **Hậu quả:** Làm tăng thời gian FCP/LCP trên mạng 3G/4G, tốn dung lượng băng thông của khách hàng.
* **Giải pháp phòng thủ (Defenses):**
  1. **Next.js Image Optimization:** Luôn sử dụng `<Image />` component của Next.js với kích thước hiển thị cố định (`width={48}`, `height={48}`) và tự động nén sang WebP.
* **Phương thức kiểm thử:** Kiểm tra Network Tab; dung lượng tải của avatar chuyên viên trên Storefront phải `< 50KB`.

---

### 🟡 NHÓM MEDIUM (Rủi ro Khả Năng Tiếp Cận, Màn Hình & Trải Nghiệm Biên)

#### R11: Nút Bấm Trên Mobile Không Đạt Chuẩn Kích Thước Chạm (WCAG Touch Target Size)
* **Kịch bản rủi ro:** Nút đóng Drawer (X) hoặc các link liên hệ có chiều cao quá nhỏ (< 32px), khiến khách hàng ngón tay to bấm trượt nhiều lần.
* **Giải pháp:** Áp dụng chiều cao tối thiểu `min-h-[44px]` (`h-11` hoặc `h-12`) cho tất cả các nút bấm tương tác trên Mobile.

#### R12: Hiệu Ứng Sóng Nhấp Nháy (Pulse Animation) Gây Khó Chịu Thị Giác
* **Kịch bản rủi ro:** Hiệu ứng pulse sóng xanh chạy liên tục 24/7 gây mỏi mắt cho người dùng.
* **Giải pháp:** Bắt buộc gắn modifier `motion-reduce:animate-none` để tôn trọng cài đặt Reduced Motion của hệ điều hành.

#### R13: Thanh Vạch Trắng Home Indicator Trên iPhone Che Khuất Nút Bấm Đáy
* **Kịch bản rủi ro:** Trên iPhone X trở lên, `ProductStickyBar` sát đáy màn hình bị vạch Home Indicator che mất một phần chữ của nút "NHẬN BÁO GIÁ".
* **Giải pháp:** Thêm padding dynamic an toàn: `pb-[max(0.75rem,env(safe-area-inset-bottom))]`.

#### R14: Dữ Liệu SEO JSON-LD Bị Lỗi Cú Pháp Khi Quản Trị Viên Nhập Dấu Ngoặc Kép
* **Kịch bản rủi ro:** Tên showroom chứa ký tự đặc biệt làm hỏng chuỗi JSON-LD script trong thẻ `<head>`.
* **Giải pháp:** Sử dụng `JSON.stringify()` chuẩn hóa và parse an toàn qua Zod trước khi nhúng.

#### R15: Nghẽn Mạng Do Gọi Nhiều API Lẻ Tẻ (Waterfall Network Request)
* **Kịch bản rủi ro:** Trang chủ gọi 5 API settings riêng biệt khiến kết nối mạng di động bị chậm.
* **Giải pháp:** Cung cấp endpoint tổng hợp `GET /api/settings` nạp toàn bộ cấu hình chỉ trong 1 request.

---

### 🟢 NHÓM LOW (Rủi ro Nhãn Hiển Thị & Định Dạng Nhẹ)

#### R16: Năm Bản Quyền Ở Chân Trang Bị Cũ (Stale Copyright Year)
* **Giải pháp:** Hỗ trợ biến động `{year}` tự động sinh năm hiện tại trong footer text.

#### R17: Lệch Múi Giờ Hiển Thị Giờ Mở Cửa Showroom
* **Giải pháp:** Cố định nhãn hiển thị theo giờ hành chính Việt Nam (`GMT+7`).
