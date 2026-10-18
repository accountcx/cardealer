# 📋 BACKLOG: Financial & Pricing Engine

> **Module:** `pricing-calculator`  
> **Phiên bản:** `v1.0.0`  

---

## 1. Danh Sách Lát Cắt Dọc Nghiệp Vụ (Vertical Slices)

### 🔹 US-01: Bóc Tách Chi Phí Lăn Bánh Địa Phương (Rolling Cost Breakdown)
- **Actor:** Khách hàng tham khảo chi phí thực tế nhận xe.
- **Mô tả:** Người dùng chọn xe và chọn tỉnh thành, hệ thống tự động bóc tách 6 khoản chi phí bắt buộc và tùy chọn.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 1.1: Tính toán chi phí lăn bánh tại Nghệ An (TP. Vinh)**
    - *Given:* Xe có giá niêm yết 1.000.000.000đ, 5 chỗ ngồi, chọn địa phương `nghe-an-vinh`.
    - *When:* Hệ thống thực hiện tính toán lăn bánh.
    - *Then:* Lệ phí trước bạ là 100.000.000đ (10%), tiền biển số là 1.000.000đ, phí đăng kiểm 90.000đ, bảo trì đường bộ 1.560.000đ, bảo hiểm TNDS 480.700đ.
  - **Scenario 1.2: Chặn giá xe âm hoặc bằng 0**
    - *Given:* Giá trị xe nhập vào $\le 0$.
    - *When:* Hàm `calculateRollingCost` được gọi.
    - *Then:* Ném ngoại lệ `RangeError` với thông điệp rõ ràng, không sinh số âm.

---

### 🔹 US-02: Bảng Tính Lãi Suất Vay Trả Góp Ngân Hàng (Installment Schedule Generator)
- **Actor:** Khách hàng cần phương án tài chính mua xe trả góp.
- **Mô tả:** Khách hàng điều chỉnh thanh trượt % trả trước và số năm vay, hệ thống tính toán số tiền trả trước, số tiền vay và số tiền trả hàng tháng đầu tiên.
- **Kịch bản Chấp Nhận (Acceptance Criteria - Gherkin):**
  - **Scenario 2.1: Tính toán theo dư nợ giảm dần**
    - *Given:* Xe 800.000.000đ, trả trước 20% (160 triệu), vay 640 triệu trong 5 năm (60 tháng), lãi suất 8.5%/năm.
    - *When:* Người dùng bấm "Xem lịch trả nợ".
    - *Then:* Tiền gốc hàng tháng cố định là 10.666.667đ, tiền lãi tháng đầu là 4.533.333đ, tổng tháng đầu là 15.200.000đ, các tháng sau giảm dần.
