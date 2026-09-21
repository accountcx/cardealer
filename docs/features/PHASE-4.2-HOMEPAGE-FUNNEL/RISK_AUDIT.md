# 🛡️ Báo Cáo Ma Trận Kiểm Toán Rủi Ro & An Ninh (Security & Risk Audit Matrix)
## PHASE 4.2 - HOMEPAGE CONVERSION FUNNEL (`EPIC-PHASE-4.2-HOMEPAGE-FUNNEL`)

> **Chuyên gia thực hiện:** `dependency-graph-analyzer` & `qa-test-engineer`  
> **Trạng thái:** Hoàn tất kiểm toán toàn diện 17 điểm rủi ro (R1–R17)  
> **Áp dụng cho:** Trang chủ Storefront (`/`), Phễu 6 phân khu, Admin Homepage Configurator, Homepage Settings API.

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

### 🔴 NHÓM CRITICAL (Rủi ro Tối Khẩn - Đe dọa An Ninh & Trải Nghiệm Cốt Lõi)

#### R1: Tấn Công Stored XSS Qua Trường Media URL & Liên Kết CTA
* **Kịch bản:** Kẻ tấn công chèn mã độc (`javascript:alert(1)` hoặc URL chứa script) vào trường `mediaUrl` của Hero Banner hoặc URL nút CTA.
* **Hậu quả:** Trình duyệt khách hàng tự động thực thi script khi click hoặc nạp ảnh, có nguy cơ đánh cắp token hoặc điều hướng trang lừa đảo.
* **Giải pháp:**
  1. Zod Schema xác thực nghiêm ngặt bằng Regex: Chỉ chấp nhận URL bắt đầu bằng `http://`, `https://` hoặc đường dẫn nội bộ hợp lệ `/...`.
  2. Tuyệt đối không dùng `dangerouslySetInnerHTML` với dữ liệu cấu hình từ CMS.
* **Kiểm thử:** Gửi payload XSS vào `mediaUrl` và `ctaButton.href`; Zod Schema bắt buộc từ chối `400 INVALID_PAYLOAD`.

#### R2: Lỗi Hydration Mismatch & Timezone Drift ở Countdown Timer
* **Kịch bản:** Server Render (RSC) tính toán thời gian đếm ngược theo múi giờ máy chủ (UTC), trong khi máy khách ở Việt Nam (GMT+7) tính theo giờ địa phương, gây ra sự sai lệch text giữa Server HTML và Client DOM (`Hydration Error`).
* **Hậu quả:** Next.js ném cảnh báo đỏ, giật giao diện và có thể làm crash vùng Hero trên trình duyệt khách hàng.
* **Giải pháp:**
  1. Đóng gói Countdown Timer thành Client Island (`CountdownTimer.tsx`) với cờ kiểm tra `isMounted = false` khi SSR.
  2. Chỉ kích hoạt đếm ngược và hiển thị số động sau khi Component đã mount thành công trên Client.
  3. Chuẩn hóa thời gian mục tiêu theo định dạng chuẩn ISO có Timezone rõ ràng: `YYYY-MM-DDTHH:mm:ss+07:00`.
* **Kiểm thử:** Render SSR với múi giờ UTC và hydrate tại Client với múi giờ GMT+7; không xuất hiện bất kỳ cảnh báo Hydration Mismatch nào.

#### R3: Sập Toàn Bộ Trang Chủ Khi Database Rỗng Hoặc Thiếu Field (Zero-Crash Failure)
* **Kịch bản:** Bảng `system_settings` chưa có bản ghi `homepage_settings` hoặc trường JSONB bị thiếu các key phân khu con.
* **Hậu quả:** `apps/web/app/page.tsx` gặp lỗi `TypeError: Cannot read properties of undefined`, trang web hiển thị màn hình trắng HTTP 500.
* **Giải pháp:**
  1. Triển khai phương thức `safeParse()` với `DEFAULT_HOMEPAGE_SETTINGS` dự phòng 100% thuộc tính.
  2. Bọc từng phân khu trong các hàm xử lý phòng vệ dữ liệu rỗng.
* **Kiểm thử:** Xóa trắng key `homepage_settings` trong DB; trang chủ vẫn render mượt mà với bộ giao diện mặc định.

#### R4: Phá Vỡ Chỉ Số Core Web Vitals (LCP > 2.5s & CLS > 0.1) Do Banner Media Nặng
* **Kịch bản:** Admin tải lên ảnh banner chất lượng cao dung lượng 5MB - 10MB chưa qua nén hoặc không định kích thước khung.
* **Hậu quả:** Tốc độ tải trang bị chậm nghiêm trọng, điểm SEO của Google bị tụt hạng.
* **Giải pháp:**
  1. Sử dụng thẻ `next/image` với thuộc tính `priority={true}` và `fetchPriority="high"` cho Hero Banner.
  2. Đặt tỷ lệ khung hình cố định (`aspect-[16/9]` hoặc `aspect-[21/9]`) để giữ chỗ trước khi ảnh tải xong, triệt tiêu hoàn toàn hiện tượng nhảy khung hình (CLS = 0).
* **Kiểm thử:** Giả lập mạng chậm 3G; khung Hero Banner giữ nguyên kích thước ổn định, CLS ghi nhận = 0.

---

### 🟠 NHÓM HIGH (Rủi ro Mức Độ Cao - Ảnh Hưởng Trực Tiếp Tới Tỷ Lệ Chuyển Đổi)

#### R5: Lỗ Hổng Broken Access Control Trên API Cập Nhật Trang Chủ
* **Kịch bản:** Endpoint `PUT /api/admin/settings/homepage_settings` không kiểm tra token hoặc quyền hạn của tài khoản.
* **Giải pháp:** Bắt buộc áp dụng middleware xác thực JWT và kiểm tra role `admin` trước khi cho phép ghi dữ liệu.
* **Kiểm thử:** Gửi request PUT không kèm header Authorization ➡️ Trả về `401 UNAUTHORIZED`.

#### R6: Thất Bại Graceful Degradation Gây Vỡ Giao Diện Hoặc Khoảng Trống Xấu Xí
* **Kịch bản:** Admin tắt một phân khu hoặc hệ thống chưa có bài viết khuyến mãi / ảnh bàn giao xe, nhưng giao diện vẫn render thẻ bao ngoài rỗng (`<section className="py-16"></div>`).
* **Giải pháp:** Áp dụng nguyên tắc: `if (!config.enabled || !items || items.length === 0) return null;` — trả về `null` hoàn toàn, không sinh bất kỳ thẻ HTML thừa nào.
* **Kiểm thử:** Cấu hình mảng bài viết rỗng và tắt Khu 5; kiểm tra DOM hoàn toàn sạch sẽ, không có khoảng cách thừa.

#### R7: Lỗi NaN / Tính Sai Mức Trả Trước Tối Thiểu Của Dòng Xe
* **Kịch bản:** Dữ liệu xe có giá niêm yết bằng 0 hoặc trường `traTruocTu` bị undefined khiến giao diện hiển thị "Trả trước từ NaN triệu".
* **Giải pháp:** Hàm `formatVNDShort` và công thức tính toán kiểm tra giá trị hợp lệ (> 0); nếu không hợp lệ thì hiển thị "Liên hệ đại lý".
* **Kiểm thử:** Truyền xe có giá null/0; thẻ xe hiển thị "Giá: Liên hệ", không xuất hiện chữ "NaN".

#### R8: Nút CTA Hero & Thẻ Xe Mất Context Nguồn Lead (`source`)
* **Kịch bản:** Người dùng bấm nút "Nhận Báo Giá" từ Hero hoặc xe Tucson, nhưng khi mở `LeadQuoteModal` lại không truyền thông tin dòng xe và nguồn tiếp cận.
* **Giải pháp:** Nút CTA truyền đúng payload: `{ source: 'homepage_hero' | 'featured_cars', carSlug: 'tucson' }` vào state của modal toàn cục.
* **Kiểm thử:** Click nút nhận báo giá trên xe Creta ➡️ Modal mở ra đã tự động điền sẵn dòng xe quan tâm là Hyundai Creta.

#### R9: Xung Đột Chồng Chéo Widget Trên Màn Hình Điện Thoại
* **Kịch bản:** Trên mobile, thanh điều hướng kéo dài, bộ lọc nhanh và các nút CTA chân trang chiếm trọn diện tích màn hình.
* **Giải pháp:** Giữ nguyên quy tắc `FloatingSeller` ẩn hoàn toàn trên mobile (`hidden md:block`), các nút CTA trên mobile có padding và margin tách bạch.
* **Kiểm thử:** Chạy giả lập màn hình iPhone 13 (390x844px); kiểm tra không có phần tử nào bị đè lên nhau.

#### R10: Race Condition Khi Admin Lưu Cấu Hình Đồng Thời
* **Kịch bản:** Hai người dùng admin cùng mở tab Trang Chủ và bấm lưu dữ liệu lệch nhau vài giây dẫn đến ghi đè cấu hình.
* **Giải pháp:** API thực hiện merge đệ quy an toàn (Deep Merge) hoặc cập nhật nguyên tử (Atomic Upsert) cho từng trường.
* **Kiểm thử:** Gửi 2 request ghi liên tiếp cách nhau 10ms; dữ liệu cuối cùng được hợp nhất toàn vẹn.

---

### 🟡 NHÓM MEDIUM & 🟢 LOW (R11 – R17)

* **R11: Memory Leak Trong `setInterval` Của Countdown Timer:** Xử lý triệt để hàm cleanup `clearInterval(timer)` trong `useEffect`.
* **R12: Số Suất Ưu Đãi Bị Âm:** Zod Schema chặn giá trị số suất tối thiểu là 0 (`min(0)`).
* **R13: Query Params Bị Lỗi Khi Bấm Lọc Xe:** Chuẩn hóa query string an toàn qua `URLSearchParams`.
* **R14: Thiếu Thẻ ALT và Kích Thước Ảnh Chuẩn SEO:** 100% hình ảnh có đầy đủ thuộc tính `alt`, `width`, `height`.
* **R15: Cache Stale Lockout Trên Storefront:** Kích hoạt xóa cache tự động bằng Next.js `revalidatePath('/')` ngay khi admin bấm lưu.
* **R16: Ảnh Chết Link Hiển Thị Icon Vỡ:** Thêm `onError` fallback về ảnh placeholder mặc định của showroom.
* **R17: Touch Target Nhỏ Hơn 44px Trên Mobile:** Đảm bảo tất cả các nút bấm trên giao diện mobile đều có `min-height: 44px`.
