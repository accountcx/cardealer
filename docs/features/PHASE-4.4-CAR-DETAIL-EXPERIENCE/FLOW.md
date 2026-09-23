# 🔄 Technical Flow Specification: Trang Chi Tiết Dòng Xe Chuẩn Hóa & Đổi Màu Động (`/xe/[carSlug]`)

> **Mã Epic:** `EPIC-PHASE-4.4-CAR-DETAIL-EXPERIENCE`  
> **Giai đoạn:** Giai đoạn 2 — Bước 2.2: Thiết Kế Chi Tiết (Detailed Design Specification)  
> **Role phụ trách:** `logic-flow-ba`  
> **Phương án kiến trúc đã chốt:** **Option B (Modular Clean Architecture & Memory Preloader)**  
> **Định vị dự án:** Website Bán Hàng Cá Nhân Của Chuyên Viên Tư Vấn Ô Tô (Automotive Sales Consultant)

---

## 1. Sequence Diagram Đa Tầng (End-to-End Interaction Flow)

Sơ đồ tuần tự mô hình hóa toàn diện tương tác dữ liệu từ lúc người dùng mở trang xe (trực tiếp hoặc qua link chia sẻ Zalo của Saler), thực hiện tương tác đổi màu, chuyển phiên bản, đồng bộ URL 2 chiều, kích hoạt Lightbox ảnh, cho đến khi gửi yêu cầu báo giá hoặc chat Zalo với Saler:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Khách Hàng / Saler
    participant Browser as 🌐 Trình Duyệt (Next.js Client)
    participant Hook as 🪝 useCarDetailUrlSync & Preloader
    participant ServerRSC as ⚡ Next.js Server Component (RSC)
    participant API as ⚙️ Backend REST API (/api/cars/:slug)
    participant DB as 🗄️ PostgreSQL (Drizzle ORM)
    participant ZaloApp as 💬 Ứng Dụng Zalo (Saler Chat)

    %% GIAI ĐOẠN 1: NẠP DỮ LIỆU BAN ĐẦU & SEO
    Note over Customer, ServerRSC: Giai đoạn 1: Nạp Trang Đầu Tiên & SEO Schema (FCP < 1.0s, CLS = 0)
    Customer->>Browser: Truy cập /xe/[carSlug]?phien-ban=dac-biet&mau=do-do
    Browser->>ServerRSC: HTTP GET /xe/[carSlug] (URL Params)
    ServerRSC->>API: carsService.getCarBySlug(slug) (ISR cache 60s)
    API->>DB: Query cars + versions + versionColors + colors
    alt Xe Không Tồn Tại hoặc status != 'published'
        DB-->>API: Null Record
        API-->>ServerRSC: 404 NOT_FOUND
        ServerRSC-->>Browser: Render 404 Friendly Page (Gợi ý xe khác + Hotline Saler)
    else Dòng Xe Tồn Tại & Đã Xuất Bản
        DB-->>API: Car Row with Versions & Colors
        API-->>ServerRSC: 200 OK (Formatted Car JSON)
        ServerRSC->>ServerRSC: Sinh Meta Tags + Canonical (/xe/[slug]) + Schema JSON-LD đa tầng
        ServerRSC-->>Browser: Trả về HTML tĩnh + Hydration Data
    end

    %% GIAI ĐOẠN 2: KHỞI TẠO STATE & IMAGE PRELOADING
    Note over Browser, Hook: Giai đoạn 2: Khởi Tạo State & Background Image Preloading
    Browser->>Hook: Initialize with URL query params
    Hook->>Hook: Trích xuất ?phien-ban và ?mau từ URL
    alt URL có params hợp lệ
        Hook->>Hook: Active đúng bản "Đặc biệt" và màu "Đỏ Đô"
    else URL không có params hoặc params sai
        Hook->>Hook: Fallback bản thấp nhất (minPrice) + màu sơn mặc định
    end
    Hook->>Browser: Render Hero Car Stage với ảnh màu đã active
    opt Background Image Preloading (useImagePreloader)
        Hook-)Browser: new Image().src = [toàn bộ URL ảnh màu của phiên bản]
        Note over Hook, Browser: Âm thầm nạp trước toàn bộ ảnh màu vào RAM Cache
    end

    %% GIAI ĐOẠN 3: TƯƠNG TÁC ĐỔI MÀU (COLOR SWATCH CLICK)
    Note over Customer, Browser: Giai đoạn 3: Bấm Chọn Màu Xe (< 50ms, không reload)
    Customer->>Browser: Click vào Color Swatch "Trắng Ngọc Trai"
    Browser->>Hook: handleColorChange("trang-ngoc-trai")
    Hook->>Browser: Lấy ảnh từ Memory Cache -> Cross-fade opacity trong 100ms
    Hook->>Browser: window.history.replaceState("/xe/[slug]?phien-ban=...&mau=trang-ngoc-trai")
    Note over Browser: URL cập nhật tức thì, vị trí cuộn trang giữ nguyên 100%

    %% GIAI ĐOẠN 4: CHUYỂN PHIÊN BẢN (VERSION SWITCHING)
    Note over Customer, Browser: Giai đoạn 4: Chọn Phiên Bản Khác (Tiêu chuẩn -> Cao cấp)
    Customer->>Browser: Click chọn bản "Cao Cấp"
    Browser->>Hook: handleVersionChange("cao-cap")
    Hook->>Browser: Cập nhật giá niêm yết, khoản trả trước, thông số kỹ thuật động
    Hook->>Hook: Lọc lại bảng màu khả dụng của bản "Cao Cấp"
    alt Màu hiện tại có trong bản mới
        Hook->>Browser: Giữ nguyên màu
    else Màu hiện tại không có trong bản mới
        Hook->>Browser: Chuyển về màu mặc định của bản mới
    end
    Hook->>Browser: window.history.replaceState("/xe/[slug]?phien-ban=cao-cap&mau=...")
    Hook-)Browser: Preload bộ ảnh màu của bản "Cao Cấp" vào Memory Cache

    %% GIAI ĐOẠN 5: BỘ CÔNG CỤ CHỐT DEAL CỦA SALER
    Note over Customer, ZaloApp: Giai đoạn 5: Hành Động Chốt Deal & Tương Tác Với Saler
    alt Khách/Saler bấm "Sao Chép Liên Kết Cấu Hình"
        Customer->>Browser: Bấm nút "Copy Link Cấu Hình"
        Browser->>Browser: navigator.clipboard.writeText(currentURL)
        Browser-->>Customer: Hiển thị Toast "Đã sao chép liên kết cấu hình xe!"
    else Khách bấm "Chat Zalo Báo Giá Nhanh"
        Customer->>Browser: Click nút "Chat Zalo Báo Giá Nhanh"
        Browser->>Browser: Encode URI tin nhắn: "Chào em [Tên Saler], anh/chị đang xem dòng [Xe] bản [Bản] màu [Màu]..."
        Browser->>ZaloApp: Mở https://zalo.me/[hotline]?text=[encodedMessage]
        ZaloApp-->>Customer: Hiển thị khung chat Zalo có sẵn nội dung chi tiết
    else Khách bấm "Tính Giá Lăn Bánh Xe Này"
        Customer->>Browser: Click nút "Dự Toán Lăn Bánh Xe Này"
        Browser-->>Customer: Điều hướng mượt mà sang /gia-lan-banh?xe=[carSlug]&phien-ban=[versionSlug]
    end
```

---

## 2. Sơ Đồ Trạng Thái Thực Thể (State Machine Diagram)

Mô hình hóa toàn bộ vòng đời trạng thái của cỗ máy tương tác `CarDetailEngine` tại màn hình chi tiết xe:

```mermaid
stateDiagram-v2
    [*] --> SERVER_FETCHING: User Request /xe/[carSlug]

    SERVER_FETCHING --> NOT_FOUND_404: API trả về 404 / Car status != published
    SERVER_FETCHING --> CLIENT_INITIALIZING: Nhận Car Data + Render HTML

    state CLIENT_INITIALIZING {
        [*] --> PARSE_URL_PARAMS
        PARSE_URL_PARAMS --> MATCH_VERSION_COLOR: URL có ?phien-ban & ?mau hợp lệ
        PARSE_URL_PARAMS --> FALLBACK_DEFAULTS: URL thiếu params hoặc params sai
        MATCH_VERSION_COLOR --> READY_IDLE
        FALLBACK_DEFAULTS --> READY_IDLE
    }

    state READY_IDLE {
        [*] --> VIEWING_ACTIVE_CONFIG
        VIEWING_ACTIVE_CONFIG --> PREFETCHING_BACKGROUND_IMAGES: useImagePreloader Triggered
        PREFETCHING_BACKGROUND_IMAGES --> MEMORY_CACHED: Hoàn tất nạp ảnh màu vào RAM
    }

    READY_IDLE --> COLOR_SWITCHING: User Click Color Swatch
    state COLOR_SWITCHING {
        [*] --> SWAP_IMAGE_FROM_CACHE
        SWAP_IMAGE_FROM_CACHE --> UPDATE_URL_STATE: window.history.replaceState
        UPDATE_URL_STATE --> [*]
    }
    COLOR_SWITCHING --> READY_IDLE: Fade animation hoàn tất (< 100ms)

    READY_IDLE --> VERSION_SWITCHING: User Click Version Tab
    state VERSION_SWITCHING {
        [*] --> UPDATE_PRICE_AND_SPECS
        UPDATE_PRICE_AND_SPECS --> FILTER_AVAILABLE_COLORS
        FILTER_AVAILABLE_COLORS --> TRIGGER_NEW_PRELOAD
        TRIGGER_NEW_PRELOAD --> UPDATE_URL_STATE_V: window.history.replaceState
        UPDATE_URL_STATE_V --> [*]
    }
    VERSION_SWITCHING --> READY_IDLE: State đồng bộ xong

    READY_IDLE --> LIGHTBOX_ACTIVE: User Click View Large Gallery Photo
    LIGHTBOX_ACTIVE --> READY_IDLE: User bấm Esc / Nút Đóng / Touch Swipe Down

    READY_IDLE --> LEAD_MODAL_ACTIVE: User Click "Nhận Báo Giá" / "Lái Thử Tận Nhà"
    LEAD_MODAL_ACTIVE --> READY_IDLE: Submit Thành Công / Đóng Modal

    READY_IDLE --> POPSTATE_SYNC: User bấm nút Back / Forward trên trình duyệt
    POPSTATE_SYNC --> READY_IDLE: Khôi phục cấu hình tương ứng trong History

    NOT_FOUND_404 --> [*]
```

---

## 3. Bảng Giải Phẫu Từng Bước (Step Anatomy Table)

Bảng giải phẫu chi tiết 8 bước tương tác cốt lõi trên trang xe chi tiết theo chuẩn 7 cột:

| Bước # | Tác nhân | Hành động | Payload Input | Logic Xử lý & Rules | Output & DB State | Failure Mode & Recovery |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Web Crawler / Khách | Request Route `/xe/[carSlug]` | `carSlug: string`, `searchParams: URLSearchParams` | 1. Gọi `carsService.getCarBySlug(carSlug)` với ISR revalidate 60s.<br>2. Kiểm tra `car.status === 'published'`.<br>3. Sinh Canonical URL sạch không query params.<br>4. Sinh JSON-LD đa tầng. | HTML tĩnh chứa SEO Tags + Dữ liệu xe đầy đủ. Không ghi DB. | 404 Not Found nếu slug sai hoặc xe chưa xuất bản ➡️ Render Error State thân thiện gợi ý xe khác + Hotline. |
| **2** | Client Hook | Khởi tạo State ban đầu | Query Params: `phien-ban`, `mau` | 1. Duyệt tìm phiên bản khớp slug trong `car.versions`.<br>2. Nếu không có: chọn bản có `minPrice`.<br>3. Duyệt tìm màu khớp slug trong `version.colors`.<br>4. Nếu không có: chọn màu `isDefault = true` hoặc màu đầu tiên. | State ban đầu chuẩn xác được nạp vào View; không kích hoạt reload. | Params rác (`?mau=123xyz`) ➡️ Tự động fallback về cấu hình an toàn, không báo lỗi người dùng. |
| **3** | Background Engine | Preload ảnh các màu | `colors: VersionColor[]` | Duyệt mảng `colors`, với mỗi `anhXeTheoMauUrl` hợp lệ, khởi tạo `const img = new Image(); img.src = url;`. | Toàn bộ ảnh màu của phiên bản lưu trong Browser Memory Buffer. | Ảnh lỗi URL 404 ➡️ Bỏ qua ảnh hỏng, khi click màu sẽ fallback ảnh đại diện chính của xe. |
| **4** | Khách / Saler | Click chọn Color Swatch | `colorId: string` hoặc `colorSlug: string` | 1. Tìm thông tin màu trong `currentVersion.colors`.<br>2. Đặt `selectedColor = color`.<br>3. Chuyển ảnh góc lớn sang `anhXeTheoMauUrl` với hiệu ứng fade.<br>4. Gọi `window.history.replaceState` cập nhật `mau=[slug]`. | URL thanh địa chỉ cập nhật tức thì; Ảnh xe hiển thị đúng màu sơn thực tế. | Trình duyệt không hỗ trợ history API ➡️ Cập nhật state UI bình thường mà không ghi URL. |
| **5** | Khách / Saler | Click chọn Phiên Bản | `versionSlug: string` | 1. Tìm `newVersion` theo slug.<br>2. Cập nhật `selectedVersion = newVersion`.<br>3. Kiểm tra xem màu hiện tại có nằm trong bảng màu của `newVersion` không. Nếu không, chuyển sang màu mặc định của bản mới.<br>4. Cập nhật URL: `phien-ban=[slug]&mau=[colorSlug]`.<br>5. Kích hoạt preload ảnh của bản mới. | Bảng giá, số tiền trả trước, bảng thông số kỹ thuật tự động đổi theo phiên bản mới. | Phiên bản không có màu nào ➡️ Fallback hiển thị ảnh đại diện `anhDaiDienUrl` của phiên bản/xe. |
| **6** | Saler | Bấm "Sao chép liên kết cấu hình" | `window.location.href` | 1. Lấy full URL hiện tại.<br>2. Gọi `navigator.clipboard.writeText(url)`.<br>3. Kích hoạt thông báo Toast thành công: *"Đã sao chép liên kết xe [Tên Xe] bản [Tên Bản] màu [Màu]!"*. | URL trong clipboard sẵn sàng để Saler paste vào Zalo gửi cho khách. | Trình duyệt chặn clipboard API ➡️ Hiển thị prompt dialog chứa text URL để người dùng Ctrl+C thủ công. |
| **7** | Khách Hàng | Bấm "Chat Zalo Báo Giá Nhanh" | `hotline`, `carName`, `versionName`, `colorName` | 1. Soạn template tin nhắn tiếng Việt có dấu rõ ràng.<br>2. `encodeURIComponent(message)`.<br>3. Mở tab mới: `https://zalo.me/[hotline]?text=[encoded]`. | Ứng dụng Zalo được kích hoạt trên điện thoại/máy tính với tin nhắn soạn sẵn. | Thiết bị chưa cài Zalo ➡️ Mở Zalo Web hoặc hiển thị dialog số điện thoại trực tiếp để gọi. |
| **8** | Khách Hàng | Bấm "Dự Toán Lăn Bánh Xe Này" | `carSlug`, `versionSlug` | Chuyển hướng người dùng sang route: `/gia-lan-banh?xe=${carSlug}&phien-ban=${versionSlug}`. | Trang Dự toán mở ra với dropdown Dòng xe và Phiên bản được chọn sẵn 100%. | Không tìm thấy route ➡️ Fallback mở `LeadQuoteModal` nhận báo giá ngay tại chỗ. |

---

## 4. Cơ Chế Xử Lý Lỗi Biên (Edge Scenarios & Fail-Safe Protocol)

1. **Khách bấm nút Back/Forward của trình duyệt (Popstate Event):**
   * Hook `useCarDetailUrlSync` đăng ký listener `window.addEventListener('popstate', onPopState)`.
   * Khi người dùng bấm Quay lại, hàm tự động bóc tách URL hiện hành và khôi phục đúng phiên bản + màu sơn đã duyệt trước đó mà không gây gián đoạn luồng duyệt.
2. **Kịch bản mất mạng khi đang xem trang:**
   * Do toàn bộ dữ liệu xe và thông số đã được Server nạp sẵn (RSC Hydration) và ảnh màu đã được preload vào RAM, khách hàng vẫn có thể chuyển đổi phiên bản và đổi màu xe mượt mà ngay cả khi thiết bị mất kết nối internet tạm thời.
3. **Màn hình cực nhỏ (iPhone SE / 320px–375px):**
   * Thanh selector phiên bản và swatches màu tự động co giãn và cho phép vuốt ngang (horizontal touch scrollable) với chỉ thị thanh trượt mảnh, đảm bảo không bao giờ vỡ giao diện.
