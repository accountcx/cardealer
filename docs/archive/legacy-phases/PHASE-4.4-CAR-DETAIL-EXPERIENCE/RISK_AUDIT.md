# 🛡️ Risk Audit & Threat Intelligence Report: Trang Chi Tiết Dòng Xe (`/xe/[carSlug]`)

> **Mã Epic:** `EPIC-PHASE-4.4-CAR-DETAIL-EXPERIENCE`  
> **Giai đoạn:** Giai đoạn 3: Kiểm Soát Rủi Ro & Test Plan (Risk Audit & Threat Analysis)  
> **Role phụ trách:** `dependency-graph-analyzer`  
> **Phương án kiến trúc đã chốt:** **Option B (Modular Clean Architecture & Memory Preloader)**  
> **Định vị dự án:** Website Bán Hàng Cá Nhân Của Chuyên Viên Tư Vấn Ô Tô (Automotive Sales Consultant)  
> **Ràng buộc an ninh:** Strict Tool-Lock Protocol (Tuyệt đối KHÔNG viết mã nguồn sản phẩm khi Gate 3 chưa thông quan)

---

## 1. Bảng Ma Trận Rủi Ro Tổng Quan (R1 – R17 Risk Matrix)

| Nhóm Nguy Cơ | Mã Rủi Ro & Tên | Cấp Độ | Mức Độ Khả Thi | Tác Động Nghiệp Vụ | Trạng Thái Phòng Vệ |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **A. Hiệu Năng & Tài Nguyên** | **R1:** N+1 Queries & Database Overhead | 🟡 Low | Thấp | Chậm tải trang khi có nhiều phiên bản/màu | ✅ Đã phòng vệ qua Drizzle Relations |
| | **R2:** Memory Leak Khi Preload Ảnh (RAM Buffer) | 🟠 Medium | Trung bình | Tràn bộ nhớ trên thiết bị di động cũ nếu spam màu | ✅ Giới hạn cache theo phiên bản hiện tại |
| | **R3:** Payload Size & CLS Layout Shift | 🟠 Medium | Trung bình | Tụt điểm Google Core Web Vitals (CLS > 0.1) | ✅ Cố định aspect ratio 16:10 + Skeleton |
| **B. Bảo Mật & Toàn Vẹn** | **R4:** XSS & Query Parameter Injection | 🟠 Medium | Thấp | Tiêm mã độc qua query `?phien-ban=` hoặc `?mau=` | ✅ Regex Whitelist + Zod Sanitization |
| | **R5:** Broken Access Control / Data Exposure | 🟠 Medium | Thấp | Xem trộm dòng xe `draft` chưa công bố | ✅ Lọc cứng `status = 'published'` tại API |
| | **R6:** Sensitive Info Leak / Stack Trace | 🟡 Low | Rất thấp | Lộ đường dẫn nội bộ PostgreSQL khi có lỗi | ✅ Fail-closed JSON Error Envelope |
| | **R7:** Mass Assignment & DTO Pollution | 🟡 Low | Rất thấp | Lỗi kiểu dữ liệu khi parse JSON | ✅ Parse qua Zod Schemas tại Server/Client |
| | **R8:** SSRF & Unsafe Redirects | 🟡 Low | Rất thấp | Gọi API nội bộ qua URL giả mạo | ✅ Cố định Base URL nội bộ qua Env |
| | **R9:** Resource Exhaustion / Decompression Bomb | 🟡 Low | Không | Không xử lý file nén người dùng tải lên | ⚪ Không áp dụng |
| | **R10:** GenAI Prompt Injection | 🟡 Low | Không | Phase 4.4 chưa tích hợp LLM tương tác | ⚪ Không áp dụng |
| **C. Thực Thi & Vận Hành** | **R11:** Hardcode & Magic Credentials | 🟡 Low | Trung bình | Lỗi số hotline hoặc link Zalo khi thay đổi | ✅ Đọc từ `system_settings` qua API |
| | **R12:** Convention & Monorepo Drift | 🟡 Low | Thấp | Lệch chuẩn Turborepo / Named export | ✅ 100% Named Export + Lucide Icons |
| | **R13:** Race Condition & Spam Click Đổi Màu | 🟠 Medium | Cao | Nhấp nháy ảnh, tải đè ảnh sai màu | ✅ Debounce & Cancel token trong Hook |
| | **R14:** Unhandled Exceptions / White Screen | 🔴 High | Trung bình | Màn hình trắng xóa khi khách mở URL sai | ✅ Error Boundary + Fallback Default |
| | **R15:** Transactional Side-effects | 🟡 Low | Rất thấp | Chỉ là thao tác Read, không có Mutation CUD | ✅ Safe Read-only Operation |
| | **R16:** Duplicate Content SEO & Parameter Splitting | 🔴 High | Rất cao | Google phạt trùng lặp nội dung hàng chục URL | ✅ Cố định Canonical URL tuyệt đối |
| | **R17:** Supply Chain Vulnerabilities | 🟡 Low | Rất thấp | Lỗi bảo mật thư viện bên thứ ba | ✅ Pnpm audit sạch 100% |

---

## 2. Chi Tiết Các Rủi Ro Trọng Yếu & Phương Án Phòng Vệ Bắt Buộc

---

### 🔴 R16: Duplicate Content SEO Penalty & Parameter Fragmentation
* **Vùng ảnh hưởng:** `apps/web/app/xe/[carSlug]/page.tsx`, `packages/core/src/seo/json-ld.ts`.
* **Kịch bản nguy hại:**
  * Khách hàng hoặc Saler chia sẻ hàng trăm biến thể liên kết: `/xe/tucson-2025?phien-ban=dac-biet&mau=do-man`, `/xe/tucson-2025?phien-ban=tieu-chuan&mau=trang`, `/xe/tucson-2025?utm_source=facebook&utm_campaign=tet`.
  * Nếu Next.js tự động lấy URL hiện hành làm thẻ Canonical, Googlebot sẽ xem mỗi biến thể là một trang riêng biệt có nội dung trùng lặp 90% ➡️ Bị Google phạt **Duplicate Content**, chia nhỏ PageRank, từ khóa rớt khỏi Top tìm kiếm xe Hyundai tại địa phương.
* **Nguyên nhân gốc rễ:** Thiếu cơ chế Canonical Sanitation ép buộc cố định URL gốc trên Server Component.
* **Giải pháp phòng vệ bắt buộc (Mitigation Strategy):**
  ```typescript
  // apps/web/app/xe/[carSlug]/page.tsx
  export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { carSlug } = await params;
    return {
      alternates: {
        // Cố định Canonical URL trỏ về URL sạch, loại bỏ 100% query params
        canonical: `/xe/${carSlug}`,
      },
    };
  }
  ```
* **Chỉ dẫn kiểm thử (QA Requirements):** Kiểm tra mã nguồn HTML của trang với mọi query parameters phức tạp; thẻ `<link rel="canonical" href="https://.../xe/[slug]">` luôn giữ nguyên dạng sạch.

---

### 🔴 R14: Unhandled Exceptions & Crash Màn Hình Trắng Khi Query Sai
* **Vùng ảnh hưởng:** `apps/web/app/xe/[carSlug]/hooks/use-car-detail-url-sync.ts`.
* **Kịch bản nguy hại:**
  * Người dùng tò mò chỉnh sửa query params trên thanh địa chỉ thành giá trị không tồn tại: `?phien-ban=ban-sieu-cap-vip&mau=mau-hong-canh-sen`.
  * Hook không tìm thấy object trong mảng ➡️ `selectedVersion` hoặc `selectedColor` bị `undefined` ➡️ Lỗi `Cannot read property 'tenPhienBan' of undefined` ➡️ Gây vỡ giao diện (Crash màn hình trắng) trên thiết bị của khách.
* **Nguyên nhân gốc rễ:** Giả định ngây thơ rằng giá trị từ URL luôn luôn hợp lệ (Assumption Hunting).
* **Giải pháp phòng vệ bắt buộc (Mitigation Strategy):**
  ```typescript
  // use-car-detail-url-sync.ts: Triệt để sử dụng Safe Fallback Engine
  const matchedVersion = car.versions.find((v) => v.slug === urlVersionSlug)
    || car.versions.find((v) => v.sortOrder === 1)
    || car.versions[0];

  const matchedColor = matchedVersion.colors.find((c) => c.slug === urlColorSlug)
    || matchedVersion.colors.find((c) => c.isDefault)
    || matchedVersion.colors[0]
    || null;
  ```
* **Chỉ dẫn kiểm thử (QA Requirements):** Truy cập URL với chuỗi query bậy bạ, kiểm tra ứng dụng vẫn tự động chuyển về phiên bản hợp lệ an toàn, không báo lỗi runtime.

---

### 🟠 R13: Race Condition & Spam Click Đổi Màu Sơn (Flickering / Image Desync)
* **Vùng ảnh hưởng:** `apps/web/app/xe/[carSlug]/components/CarHeroExperience.tsx`, `use-image-preloader.ts`.
* **Kịch bản nguy hại:**
  * Người dùng bấm liên tiếp (spam click) qua 4–5 màu sơn trong vòng 1 giây trên kết nối mạng chập chờn.
  * Các request tải ảnh trả về không theo thứ tự (Out-of-order response) ➡️ Ảnh hiển thị cuối cùng bị lệch so với chấm màu đang được khoanh tròn active.
* **Nguyên nhân gốc rễ:** Thiếu cơ chế Image Preloading trong RAM và thiếu hủy bỏ trạng thái tải cũ.
* **Giải pháp phòng vệ bắt buộc (Mitigation Strategy):**
  1. `useImagePreloader`: Nạp trước toàn bộ ảnh các màu của phiên bản hiện tại vào RAM buffer (`HTMLImageElement.src`) ngay khi trang vừa mount.
  2. Bắt buộc cập nhật ảnh tức thì từ Memory Cache kết hợp với `transition-opacity duration-150` để đảm bảo chuyển ảnh mượt mà, không phụ thuộc vào độ trễ mạng lúc click.
* **Chỉ dẫn kiểm thử (QA Requirements):** Click liên tục các màu sơn với tốc độ 5 lần/giây, xác nhận ảnh luôn đồng bộ chính xác 100% với chấm màu đang được chọn.

---

### 🟠 R4: XSS & Ký Tự Đặc Biệt Trong Deep Link Zalo
* **Vùng ảnh hưởng:** `apps/web/lib/zalo.ts`, `apps/web/app/xe/[carSlug]/components/ConsultantTrustCard.tsx`.
* **Kịch bản nguy hại:**
  * Tên xe, tên phiên bản hoặc tên màu chứa các ký tự đặc biệt (`&`, `?`, `=`, `#`, `/`, `%`) hoặc ký tự tiếng Việt có dấu.
  * Nếu nối chuỗi thủ công không mã hóa ➡️ Link `https://zalo.me/[sdt]?text=...` bị cắt cụt, vỡ cấu trúc URI, ứng dụng Zalo không nhận diện được tin nhắn hoặc bị lỗi ký tự vô nghĩa (Mojibake).
* **Giải pháp phòng vệ bắt buộc (Mitigation Strategy):**
  * Toàn bộ chuỗi tin nhắn Zalo bắt buộc phải đi qua hàm `encodeURIComponent()` chuẩn của JavaScript, bọc trong hàm tiện ích type-safe `generateZaloDeepLink()`.
* **Chỉ dẫn kiểm thử (QA Requirements):** Kiểm thử mở link Zalo trên cả iOS, Android và Desktop, kiểm tra nội dung tiếng Việt hiển thị tròn vành rõ chữ.

---

### 🟠 R2: Memory Leak & Rò Rỉ Tài Nguyên Trình Duyệt Di Động
* **Vùng ảnh hưởng:** `apps/web/app/xe/[carSlug]/hooks/use-image-preloader.ts`.
* **Kịch bản nguy hại:**
  * Nếu nạp trước ảnh của tất cả các phiên bản và tất cả dòng xe cùng một lúc, thiết bị di động có RAM 2GB–3GB có thể bị tràn bộ nhớ hoặc làm chậm trình duyệt (Tab Crash).
* **Giải pháp phòng vệ bắt buộc (Mitigation Strategy):**
  * **Scoped Preload Policy:** Chỉ nạp trước ảnh màu của **duy nhất phiên bản đang chọn** (`currentVersion.colors`, thường chỉ 4–6 ảnh kích thước tối ưu WebP ~80KB). Khi khách chuyển phiên bản khác mới kích hoạt nạp bộ ảnh của phiên bản đó.
* **Chỉ dẫn kiểm thử (QA Requirements):** Đo lường Heap Memory của trình duyệt qua Chrome DevTools Performance Monitor, đảm bảo bộ nhớ ổn định dưới 50MB.

---

### 🟠 R5: Broken Object-Level Access Control (Xem Trộm Xe Bản Nháp)
* **Vùng ảnh hưởng:** `apps/api/src/routes/catalog.ts`.
* **Kịch bản nguy hại:**
  * Khách hàng hoặc đối thủ đoán được slug của dòng xe mới đang trong giai đoạn soạn thảo (`status = 'draft'`) và truy cập `/xe/santa-fe-2027-preview`.
  * Nếu API không kiểm tra trạng thái ➡️ Dòng xe chưa công bố bị lộ thông số và giá ra ngoài.
* **Giải pháp phòng vệ bắt buộc (Mitigation Strategy):**
  * Trong câu truy vấn Drizzle ORM của `GET /api/cars/:slug`, bắt buộc ràng buộc điều kiện kép:
    ```typescript
    where: and(
      eq(schema.cars.slug, slug),
      eq(schema.cars.status, 'published')
    )
    ```
* **Chỉ dẫn kiểm thử (QA Requirements):** Gọi API với slug của một xe có `status = 'draft'`, xác nhận hệ thống trả về chính xác `404 Not Found`.
