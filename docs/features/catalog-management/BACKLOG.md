# 📋 BACKLOG: Catalog & Vehicle Specification Engine

> **Module:** `catalog-management`  
> **Phiên bản:** `v1.0.0`  

---

## 1. Danh Sách Lát Cắt Dọc Nghiệp Vụ (Vertical Slices)

### 🔹 US-01: Quản Trị Danh Mục Dòng Xe & Phiên Bản (Admin Car Catalog Management)
- **Actor:** Quản trị viên (Admin / Manager) trên Admin Portal.
- **Mô tả:** Thêm mới, chỉnh sửa thông tin dòng xe, giá niêm yết các phiên bản, phân khúc và cập nhật trạng thái `draft` hoặc `published`.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 1.1: Tạo mới dòng xe thành công**
    - *Given:* Quản trị viên đã đăng nhập và có quyền `cars:write`.
    - *When:* Gửi yêu cầu tạo dòng xe với tên hợp lệ, ảnh đại diện và phân khúc `suv`.
    - *Then:* Hệ thống sinh slug duy nhất, lưu cơ sở dữ liệu và trả về HTTP 201 Created.
  - **Scenario 1.2: Ngăn chặn tạo trùng slug xe**
    - *Given:* Đã tồn tại xe có slug `hyundai-santa-fe`.
    - *When:* Quản trị viên cố tình tạo dòng xe mới với slug `hyundai-santa-fe`.
    - *Then:* Hệ thống từ chối với lỗi HTTP 409 Conflict hoặc 400 Bad Request.

---

### 🔹 US-02: Bộ Đổi Màu Ngoại Thất Xe Trực Quan Trên Storefront (Interactive Color Switcher)
- **Actor:** Khách hàng duyệt xe trên Storefront (`/xe/[slug]`).
- **Mô tả:** Khách hàng bấm chọn từng mẫu màu sắc ngoại thất (Color Swatch), hình ảnh xe lập tức chuyển sang ảnh xe tương ứng với màu sơn và phiên bản được chọn.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 2.1: Hiển thị đúng màu sắc mặc định**
    - *Given:* Khách hàng truy cập `/xe/hyundai-tucson`.
    - *When:* Trang tải xong dữ liệu xe.
    - *Then:* Hiển thị phiên bản đầu tiên và ảnh xe ứng với màu sắc có cờ `isDefault = true`.
  - **Scenario 2.2: Thay đổi màu sơn xe qua URL Query**
    - *Given:* Khách hàng đang ở trang `/xe/hyundai-tucson`.
    - *When:* Khách click vào màu "Đỏ Đô" (mã hex `#8B0000`).
    - *Then:* Ảnh xe đổi sang góc chụp màu Đỏ Đô và URL cập nhật query param `?mau=do-do` mà không tải lại toàn trang.

---

### 🔹 US-03: Bảng So Sánh Thông Số Kỹ Thuật Đa Tầng (Dynamic Spec Matrix)
- **Actor:** Người mua xe cần so sánh động cơ, kích thước, công nghệ an toàn.
- **Mô tả:** Hiển thị các nhóm thông số `specGroups` dạng bảng có khả năng gập/mở hoặc lọc theo phiên bản.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 3.1: Kết xuất đầy đủ các nhóm thông số**
    - *Given:* Phiên bản xe có cấu hình 4 nhóm thông số (Động cơ, Khung gầm, An toàn, Tiện nghi).
    - *When:* Người dùng mở tab "Thông số kỹ thuật".
    - *Then:* Tất cả các hàng thuộc tính và giá trị được hiển thị đầy đủ, không bị lỗi font hoặc tràn bảng trên mobile.

---

### 🔹 US-04: Chuẩn Hóa Schema Google (BreadcrumbList & ItemList) & Khử Nhiễu Prompt Khuyến Mãi
- **Actor:** Google Search Console crawler, SEO Specialist, Khách hàng duyệt web.
- **Mô tả:** Chuẩn hóa toàn bộ schema BreadcrumbList bằng URL tuyệt đối (loại bỏ relative URL "/" gây cảnh báo "URL trong trường id không hợp lệ"), tối ưu ItemList với top-level `@id` và `url`, đồng thời làm sạch toàn bộ các đoạn prompt nhắc việc / ghi chú nội bộ nằm trong ngoặc đơn rò rỉ tại trường `promotionSummary`.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 4.1: BreadcrumbList Schema 100% Absolute URLs**
    - *Given:* Trang danh mục `/xe` hoặc phân khúc `/dong-xe/:slug` sử dụng component `Breadcrumbs`.
    - *When:* Googlebot hoặc validator phân tích JSON-LD `<script type="application/ld+json">`.
    - *Then:* Trường `item` tại `position: 1` là absolute URL `https://xehyundaivinh.com/` (hoặc baseUrl cấu hình), và vị trí cuối cùng cũng có `item` là absolute URL trang hiện tại (e.g. `https://xehyundaivinh.com/xe`), không chứa relative path đơn thuần `/`.
  - **Scenario 4.2: Top-level @id và url trong ItemList danh sách xe**
    - *Given:* Danh mục xe tại `/xe` hoặc `/dong-xe/:slug` sinh schema `@type: ItemList`.
    - *When:* Trích xuất từng phần tử `itemListElement[i].item`.
    - *Then:* Mỗi đối tượng `item` (kiểu `['Product', 'Car']` hoặc `Product`) BẮT BUỘC chứa các thuộc tính `@id` và `url` trỏ chính xác về URL chi tiết xe tuyệt đối (e.g. `https://xehyundaivinh.com/xe/:slug`).
  - **Scenario 4.3: Làm sạch triệt để prompt nội bộ trong promotionSummary**
    - *Given:* Dữ liệu dòng xe trong cơ sở dữ liệu hoặc phản hồi từ AI Assistant có dính ghi chú trong ngoặc đơn (e.g. `(Tạo nội dung tiếp thị cho dòng xe Hyundai Tucson)`, `(Đánh giá về dòng xe Custin)`...).
    - *When:* Script migration dọn dẹp DB thực thi và hệ thống sinh dữ liệu SEO / hiển thị UI.
    - *Then:* Các đoạn text trong ngoặc đơn dạng ghi chú/nhắc việc prompt bị xóa bỏ hoàn toàn, trả về văn bản khuyến mãi tự nhiên, sạch sẽ, không hiển thị ngoặc đơn nhắc việc ra UI hay Schema description.
