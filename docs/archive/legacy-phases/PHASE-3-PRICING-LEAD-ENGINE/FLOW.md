# 🔄 Thiết Kế Luồng Nghiệp Vụ & State Machine (Business Flow & State Transitions)

> **Mã Tính Năng:** `EPIC-PHASE-3-PRICING-LEAD`  
> **Tên Tính Năng:** Bộ Công Cụ Tài Chính & Phễu Thu Thập Khách Hàng (Pricing & Lead Engine)  
> **Phương Án Kiến Trúc Đã Chốt:** Option 1 (Client-First Soft-Gate Funnel + Light Ingestion Pipeline)  
> **Role Phụ Trách:** Logic Flow BA  
> **Tài liệu tham chiếu:** [`BACKLOG.md`](./BACKLOG.md), [`SOLUTION_OPTIONS.md`](./SOLUTION_OPTIONS.md), [`fe-cardealer/app/components/calculator/SmartCalculator.tsx`](file:///Users/nhatphan/Code/CarDealer/fe-cardealer/app/components/calculator/SmartCalculator.tsx)

---

## I. Tổng Quan Kiến Trúc State Machine Của SmartCalculator

Công cụ `SmartCalculator` hoạt động như một **Finite State Machine (FSM)** có trạng thái bền vững (State Persistence qua `sessionStorage`), điều phối trải nghiệm qua 3 giai đoạn:

```mermaid
stateDiagram-v2
    [*] --> INPUT : Khởi tạo trang /gia-lan-banh
    
    state INPUT {
        [*] --> ChonXe
        ChonXe --> LoadVersions : API / State filter
        LoadVersions --> ChonPhienBan
        ChonPhienBan --> ChonTinhThanh
        ChonTinhThanh --> ReadyToCalculate : Đã chọn đủ xe, bản, tỉnh
    }
    
    INPUT --> GATE : Bấm "TÍNH GIÁ LĂN BÁNH"<br/>(Tính nháp 0ms tại @cardealer/core)
    
    state GATE {
        [*] --> HienThiTongTienLon
        HienThiTongTienLon --> LamMoBangChiTiet : CSS blur-sm
        LamMoBangChiTiet --> DienFormThuLead : Nhập Tên + Số điện thoại (10 số)
        DienFormThuLead --> SubmitLeadAPI : Bấm "XEM GIÁ LĂN BÁNH THỰC TẾ"
    }
    
    GATE --> INPUT : Bấm "Chọn lại xe" / Quay lại
    GATE --> SUCCESS : POST /api/leads thành công (201 Created)
    
    state SUCCESS {
        [*] --> ThongBaoThanhCongZalo
        ThongBaoThanhCongZalo --> GoMoBangChiTiet : unblur (Hiển thị rõ 100% từng khoản phí)
        GoMoBangChiTiet --> HienThiNutGoiHotlineZalo
    }
    
    SUCCESS --> INPUT : Bấm "Tính giá xe khác"
```

---

## II. Bảng Ma Trận Chuyển Đổi Trạng Thái (State Transition Matrix)

| Trạng Thái Hiện Tại | Tác Vụ Người Dùng / Sự Kiện | Điều Kiện Kích Hoạt | Trạng Thái Đích | Hành Động Kèm Theo (Side Effects) |
| :--- | :--- | :--- | :--- | :--- |
| `input` | Thay đổi Dòng xe | Dropdown `dongXe` đổi giá trị | `input` | Lọc lại danh sách `availableVersions`, reset `phienBan = ''`, reset giá xe = 0. |
| `input` | Thay đổi Phiên bản | Dropdown `phienBan` đổi giá trị | `input` | Cập nhật `selectedVersionGia = giaNiemYet`. |
| `input` | Bấm nút "TÍNH GIÁ LĂN BÁNH" | `dongXe != ''` && `phienBan != ''` && `gia > 0` | **`gate`** | 1. Gọi `calculateRollingCost()` tính toán tức thì.<br>2. Lưu snapshot vào `sessionStorage`.<br>3. Cuộn mượt đến bảng tổng tiền. |
| `gate` | Nhập Họ tên & SĐT | Cú pháp SĐT bắt đầu `03/05/07/08/09` đủ 10 số | `gate` | Kích hoạt nút bấm đỏ "XEM GIÁ LĂN BÁNH THỰC TẾ". |
| `gate` | Bấm "XEM GIÁ LĂN BÁNH THỰC TẾ" | Form validate thành công | Đang gửi (`isLoading`) | Gọi `POST /api/leads` kèm snapshot dự toán. |
| `gate` | Gửi Lead Thành Công | Server trả HTTP 201 Created | **`success`** | 1. Chuyển state sang `success`.<br>2. Gỡ bỏ class `blur-sm` trên bảng chi tiết.<br>3. Hiển thị thông báo xanh lá + Hotline/Zalo. |
| `gate` | Gửi Lead Thất Bại (Spam / Lỗi mạng) | Server trả HTTP 429 hoặc lỗi mạng | `gate` | Hiển thị Toast thông báo lỗi, giữ nguyên form cho khách thử lại. |
| `success` | Bấm "Tính giá xe khác" | Click nút "Chọn Dòng Xe Khác" | **`input`** | Xóa snapshot trong `sessionStorage`, reset form về ban đầu. |
| `installment_input` | Kéo Slider % trả trước hoặc đổi kỳ hạn vay | User thay đổi giá trị slider/button | `installment_input` | Gọi `calculateInstallment()`, cập nhật số tiền vay và gốc + lãi (bảng chi tiết vẫn bị mờ `blur-sm`). |
| `installment_input` | Nhập Họ tên & SĐT (10 số) -> Bấm "XEM CHI TIẾT LỊCH TRẢ NỢ" | Form validate thành công | Đang gửi (`isLoading`) | Gọi `POST /api/leads` với `hinhThuc: 'Dự Toán Trả Góp'` kèm snapshot gói vay. |
| `installment_input` | Gửi Lead Trả Góp Thành Công | Server trả HTTP 201 Created | **`installment_success`** | 1. Mở khóa chi tiết bảng trả góp (`blur-none`).<br>2. Hiển thị banner xanh: "Chuyên viên tài chính sẽ liên lạc lại ngay trong ít phút!"<br>3. Mở nút gọi Hotline & chat Zalo tín dụng. |

---

## III. Sequence Diagram 1: Luồng Người Dùng Tính Giá & Nạp Lead (Storefront)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách Hàng (Browser)
    participant UI as SmartCalculator (apps/web)
    participant Core as Engine (@cardealer/core)
    participant API as Backend Server (apps/api)
    participant DB as PostgreSQL Database
    
    User->>UI: Truy cập /gia-lan-banh
    UI->>UI: Load danh sách xe đang bán (cars list)
    User->>UI: Chọn "Hyundai Accent" -> Bản "1.5 AT Đặc Biệt" -> Tỉnh "TP. Vinh"
    User->>UI: Bấm nút "TÍNH GIÁ LĂN BÁNH"
    
    rect rgb(240, 248, 255)
        Note over UI,Core: BƯỚC 1 -> BƯỚC 2 (TÍNH TOÁN 0MS & MỞ SOFT-GATE)
        UI->>Core: calculateRollingCost(giaXe: 569tr, tinh: 'nghe_an', choNgoi: 5)
        Core-->>UI: Trả về RollingCostBreakdown (Tổng: 628tr, Trước bạ: 56.9tr, Biển số: 1tr...)
        UI->>UI: Chuyển state = 'gate'
        UI->>UI: Lưu session_storage (xe, bản, tỉnh, kết quả dự toán)
        UI-->>User: Hiển thị: Tổng 628.000.000đ (Bảng bóc tách bị LÀM MỜ blur-sm)
    end
    
    rect rgb(255, 250, 240)
        Note over User,UI: BƯỚC 2: ĐIỀN THÔNG TIN THU LEAD
        User->>UI: Điền Họ tên ("Nguyễn Văn A"), SĐT ("0912345678"), Khung giờ ("Sáng")
        User->>UI: Bấm "XEM GIÁ LĂN BÁNH THỰC TẾ"
        UI->>UI: Validate Zod Regex (Phone 10 digits)
    end
    
    rect rgb(240, 255, 240)
        Note over UI,DB: BƯỚC 2 -> BƯỚC 3: INGESTION & UNBLUR
        UI->>API: POST /api/leads (hoTen, soDienThoai, dongXe, duToanSnapshot)
        API->>API: Kiểm tra Idempotency MD5(phone + versionId + minute)
        alt Bị trùng lặp trong 60s (Double Click)
            API-->>UI: Trả về HTTP 200 (Existing Lead - Coi như thành công, chống crash UI)
        else Hợp lệ
            API->>DB: INSERT INTO leads (status: 'new', tags: ['Giá Lăn Bánh', 'Vinh'])
            DB-->>API: Lead Created (id: UUID)
            API-->>UI: HTTP 201 Created { success: true, leadId }
        end
        UI->>UI: Chuyển state = 'success'
        UI->>UI: Gỡ bỏ class blur-sm (Hiển thị chi tiết rõ 100%)
        UI-->>User: Bảng bóc tách chi phí rõ ràng + Nút gọi Hotline / Zalo
    end
```

---

## IV. Sequence Diagram 2: Luồng Phân Phối & Quản Trị Lead Tại Showroom (Admin CRM)

```mermaid
sequenceDiagram
    autonumber
    actor Sales as Nhân Viên Sales / Quản Lý
    participant AdminUI as Admin Portal (/leads)
    participant API as Backend Admin Route
    participant DB as PostgreSQL Database
    
    Sales->>AdminUI: Truy cập menu "Khách Hàng & Báo Giá" (/leads)
    AdminUI->>API: GET /api/admin/leads?status=all&page=1
    Note over API: Kiểm tra JWT Token & Quyền leads:read
    API->>DB: SELECT * FROM leads ORDER BY created_at DESC
    DB-->>API: Trả về danh sách Leads
    API-->>AdminUI: HTTP 200 { data: LeadItem[] }
    AdminUI-->>Sales: Render bảng Lead có huy hiệu trạng thái: 'Mới' (new)
    
    rect rgb(255, 248, 240)
        Note over Sales,DB: XỬ LÝ & CẬP NHẬT TRẠNG THÁI LEAD
        Sales->>AdminUI: Nhấp xem chi tiết Lead "Nguyễn Văn A - 0912345678"
        AdminUI-->>Sales: Mở Drawer hiển thị Snapshot: Xem xe Accent, Dự toán 628tr, Cần gọi buổi sáng
        Sales->>Sales: Bốc máy gọi điện tư vấn báo giá thực tế
        Sales->>AdminUI: Đổi trạng thái sang "Đã liên hệ" (contacted) + Ghi chú "Khách hẹn chiều qua lái thử"
        AdminUI->>API: PATCH /api/admin/leads/:id/status { status: 'contacted', notes: '...' }
        Note over API: Kiểm tra Quyền leads:write
        API->>DB: UPDATE leads SET status = 'contacted', notes = '...', updated_at = NOW()
        DB-->>API: Updated
        API-->>AdminUI: HTTP 200 OK
        AdminUI-->>Sales: Cập nhật huy hiệu thành công
    end
```

---

## V. Cơ Chế Chống Mất Trạng Thái (F5 Page Reload Recovery)

Để bảo đảm **trải nghiệm 10/10 hoàn hảo** như đã thống nhất tại Sub-Gate 2.1:
1. **Lưu phiên nhẹ qua `sessionStorage`:**
   * Key: `cardealer_calculator_session`
   * Dữ liệu lưu: `{ dongXe, phienBan, tinhThanh, state, calculatedResult }`
2. **Khôi phục khi F5 (Mount Phase):**
   * Khi component `SmartCalculator` mount lần đầu, nó kiểm tra `sessionStorage`:
     * Nếu tìm thấy dữ liệu hợp lệ và `state === 'gate'`, nó tự động khôi phục giao diện màn hình Gate làm mờ ngay lập tức, không bắt khách phải chọn lại từ Dòng xe!
     * Khi khách submit xong sang `state === 'success'`, lưu trạng thái hoàn thành để khách refresh trang vẫn xem được bảng giá đã mở khóa.
     * Khi khách bấm "Tính giá xe khác", xóa sạch `sessionStorage`.
