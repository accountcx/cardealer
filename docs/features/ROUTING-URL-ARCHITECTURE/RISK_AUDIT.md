# 🛡️ Risk Audit & Threat Analysis Report: ROUTING-URL-ARCHITECTURE

## 1. Bảng Ma Trận Rủi Ro Tổng Quan (R1 - R17)

| Mã | Nhóm Rủi Ro | Phân Loại Chuẩn | Cấp Độ | Trạng Thái | Vùng Ảnh Hưởng (Files / Routes / Entities) |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **R1** | N+1 Queries & Database Locking | CWE-400 | 🟡 LOW | Mitigated | `apps/web/src/app/dong-xe/[slug]/page.tsx` & `getCatalogCars()` |
| **R2** | Memory Leak & Unbounded Collections | CWE-401, CWE-770 | 🟠 MEDIUM | Mitigated | In-memory filtering logic trên catalog array tại server component |
| **R3** | Payload Size & Network IO Bottleneck | CWE-400 | 🟡 LOW | Mitigated | Server Component response payload, Next.js Image Optimization |
| **R4** | Injection & Sanitization Failures (XSS/Path Traversal) | OWASP A03 / CWE-79 | 🔴 HIGH | Mitigated | Route param `slug`, JSON-LD Schema generation (`BreadcrumbList`, `ItemList`) |
| **R5** | Broken Object-Level Auth / IDOR | OWASP A01 / CWE-862 | 🟢 NONE | N/A | Trang catalog là trang public, không chứa dữ liệu phân quyền người dùng |
| **R6** | Data Leak, Secret Exposure & PII | OWASP A01 / CWE-200 | 🟢 NONE | N/A | Không có thông tin PII khách hàng, chỉ hiển thị thông số công khai của xe |
| **R7** | Mass Assignment & DTO Pollution | OWASP A08 / CWE-915 | 🟢 NONE | N/A | Read-only route, không tiếp nhận mutation hay body payload từ client |
| **R8** | SSRF, DNS Rebinding & Token Interception | OWASP A10 / CWE-918 | 🟢 NONE | N/A | Không gọi external webhook hoặc fetch URL tùy biến do client cung cấp |
| **R9** | Unsafe Archive & Decompression DoS | OWASP A05 / CWE-409 | 🟢 NONE | N/A | Không xử lý file nén hay upload |
| **R10**| GenAI & Prompt Injection | OWASP LLM01 | 🟢 NONE | N/A | Không tương tác trực tiếp với LLM runtime trên route này |
| **R11**| Hardcoded Secrets & Magic Values | Clean Code | 🟠 MEDIUM | Mitigated | Các giá trị slug chuỗi phân khúc (`sedan`, `suv`, `mpv`) và mapping `kieuDang` |
| **R12**| Convention & Architectural Drift | Next.js 15 Arch | 🔴 HIGH | Mitigated | Next.js 15 Async Dynamic Route Params (`await params`) & Hydration Mismatch |
| **R13**| Race Condition & Concurrency Idempotency | CWE-362 | 🟢 NONE | N/A | Static generation & read-only caching, không có concurrent write |
| **R14**| Unhandled Exceptions & Silent Failures | Reliability | 🔴 HIGH | Mitigated | Lỗi khi API upstream `getCatalogCars()` fail / timeout làm sập trang Server Component |
| **R15**| Transactional Atomicity & Partial Mutations | Integrity | 🟢 NONE | N/A | Không thực hiện database transaction ghi |
| **R16**| Breaking API Contract & Timezone Shifts | Interface Contract | 🟠 MEDIUM | Mitigated | `packages/types` settings contract thay đổi link `/xe?kieuDang=...` sang `/dong-xe/...` |
| **R17**| Supply Chain & Outdated Dependencies | OWASP A06 | 🟡 LOW | Audited | Không bổ sung thư viện bên ngoài mới; chỉ sử dụng Next.js, Lucide-React sẵn có |

---

## 2. Bản Đồ Truy Vết Đồ Thị Phụ Thuộc (Dependency Tracing & Blast Radius)

```mermaid
graph TD
  subgraph Core Types & Database Layer
    T[packages/types/src/settings.ts] -->|Cung cấp Contract| DB[packages/database/src/seed-settings.ts]
    T -->|Type Definition| NAV[Navbar & MobileDrawer Components]
  end

  subgraph Web Application Layer (apps/web)
    SR[Segment Registry: config/segments.ts] -->|Whitelist & Metadata| PAGE[apps/web/src/app/dong-xe/[slug]/page.tsx]
    SR -->|Static Paths| GSP[generateStaticParams]
    SR -->|SEO Metadata| GM[generateMetadata]
    
    API[services/cars.service: getCatalogCars] -->|Fetch Cars| PAGE
    NAV -->|Menu Links: /dong-xe/sedan...| PAGE
    FOOTER[apps/web/src/components/navigation/footer.tsx] -->|Quick Links| PAGE
  end
```

### Bán Kính Tác Động (Blast Radius) Chi Tiết:
1. **`packages/types/src/settings.ts`**:
   - Chỉnh sửa: Cập nhật URL trong `DEFAULT_NAVIGATION_SETTINGS` và `DEFAULT_FOOTER_SETTINGS`.
   - Bán kính ảnh hưởng: `apps/web` và `apps/admin` (nếu admin có preview settings).
   - Mức độ rủi ro: 🟠 MEDIUM. Nếu type hoặc cấu trúc mảng bị sai, Next.js build sẽ thất bại tại bước Type-check (`tsc -b`).
2. **`packages/database/src/seed-settings.ts`**:
   - Chỉnh sửa: Cập nhật URL ban đầu của hạt giống dữ liệu.
   - Bán kính ảnh hưởng: Chỉ kích hoạt khi chạy lệnh `pnpm db:seed` ở môi trường Dev/Staging.
   - Mức độ rủi ro: 🟡 LOW. Không làm sập database hiện hữu nếu seed là upsert.
3. **`apps/web/src/app/dong-xe/[slug]/page.tsx`**:
   - Tạo mới hoàn toàn: Dynamic route Server Component.
   - Bán kính ảnh hưởng: Route con độc lập `/dong-xe/*`. Không ảnh hưởng đến route `/xe` (Danh mục xe đầy đủ) hay trang chủ `/`.
   - Mức độ rủi ro: 🔴 HIGH (Do liên quan trực tiếp đến trải nghiệm người dùng, SEO indexation và 404 handling).
4. **`apps/web/src/components/navigation/navbar.tsx` & `mobile-drawer.tsx`**:
   - Chỉnh sửa: Đảm bảo active state matcher nhận diện chính xác path prefix `/dong-xe/`.
   - Mức độ rủi ro: 🟠 MEDIUM (Nguy cơ Hydration Mismatch nếu đọc URL từ `window.location` thay vì Next.js hook `usePathname()`).

---

## 3. Chi Tiết Từng Rủi Ro Trọng Yếu & Phương Án Phòng Vệ

### [R4] Injection & Sanitization Failures (XSS & Soft-404 Traversal)
* **Kịch bản Nguy hại:**
  1. Kẻ tấn công truy cập URL dạng `/dong-xe/<script>alert(1)</script>` hoặc `/dong-xe/../../etc/passwd` hoặc các slug rác ngẫu nhiên `/dong-xe/random-slug-123`.
  2. Nếu Server Component render thẳng slug này vào thẻ `<h1>`, thẻ `<title>`, hoặc nhúng nguyên văn vào JSON-LD `<script type="application/ld+json">`, trang sẽ bị lỗi XSS hoặc sinh ra hàng triệu URL "soft-404" gây hủy hoại điểm số SEO trên Googlebot.
* **Bản chất Kỹ thuật:** Thiếu khâu Whitelist Validation trước khi phân giải dữ liệu và render.
* **Giải Pháp Phòng Vệ Bắt Buộc (Code Defense Invariant):**
  - Khai báo một `SEGMENT_REGISTRY` bất biến (Strict Object Key Map).
  - Ngay đầu Server Component `Page` và hàm `generateMetadata`:
    ```typescript
    const segment = getSegmentConfig(slug);
    if (!segment) {
      notFound(); // Gọi hàm notFound() chuẩn của Next.js để trả về HTTP status 404 thực thụ
    }
    ```
  - Trong JSON-LD, dữ liệu được serialize an toàn bằng `JSON.stringify()` và sanitize chuỗi đầu vào.
* **Kế hoạch Rollback:** Nếu route bị lỗi, xóa file `apps/web/src/app/dong-xe/[slug]` và revert menu links về `/xe`.
* **Chỉ Dẫn Kiểm Thử (Input cho QA Step 3.2):**
  - Gửi request đến `/dong-xe/hatchback`, `/dong-xe/invalid-segment`, `/dong-xe/%3Cscript%3E`: Bắt buộc nhận HTTP 404 (Không render HTML 200).
  - Kiểm tra DOM inspection của JSON-LD schema không chứa unescaped tags.

---

### [R12] Convention & Architectural Drift (Next.js 15 Async Params & Hydration Mismatch)
* **Kịch bản Nguy hại:**
  1. Next.js 15 quy định `params` trong `PageProps` là một `Promise<{ slug: string }>`. Nếu coder viết theo phong cách Next.js 14 đồng bộ `({ params }: { params: { slug: string } })` và truy cập trực tiếp `params.slug`, Next.js 15 sẽ ném runtime warning hoặc lỗi build crash: `Error: Route "/dong-xe/[slug]" used "params.slug". "params" should be awaited before using its properties.`
  2. Tại Navbar / MobileDrawer, nếu kiểm tra active state bằng logic client-only hoặc chênh lệch giữa server-rendered DOM và client DOM sẽ gây lỗi React Hydration Error.
* **Bản chất Kỹ thuật:** Không tuân thủ breaking changes của Next.js 15 App Router và vi phạm SSR Hydration rules.
* **Giải Pháp Phòng Vệ Bắt Buộc (Code Defense Invariant):**
  - Luôn khai báo `params: Promise<{ slug: string }>` và sử dụng `const { slug } = await params;`.
  - Sử dụng hook chính thức `usePathname()` trong các Client Components liên quan đến Navigation menu để đánh dấu trạng thái Active.
* **Kế hoạch Rollback:** Giữ git commit nguyên tử; nếu xảy ra lỗi hydration, revert các thay đổi tại component Navigation.
* **Chỉ Dẫn Kiểm Thử (Input cho QA Step 3.2):**
  - Chạy `pnpm build` hoặc `pnpm type-check` để bảo đảm `tsc` xác nhận signature của `PageProps` và `generateMetadata`.
  - Kiểm tra Console trình duyệt ở chế độ dev/production, khẳng định 0 hydration warnings.

---

### [R14] Unhandled Exceptions & Silent Failures (Upstream API Failure Resilience)
* **Kịch bản Nguy hại:**
  - `getCatalogCars()` gặp sự cố mạng, API backend timeout hoặc database query bị disconnect. Nếu không có Error Boundary hoặc try-catch hợp lý, toàn bộ trang sẽ sập trả về 500 Unhandled Server Exception màu trắng hoặc vỡ layout chung.
* **Bản chất Kỹ thuật:** Phụ thuộc cứng vào lời gọi async không có fallback.
* **Giải Pháp Phòng Vệ Bắt Buộc (Code Defense Invariant):**
  - Bọc lời gọi `getCatalogCars()` trong khối try-catch an toàn.
  - Khi API bị lỗi: Fallback sang mảng rỗng `cars = []` và hiển thị Error Banner / Empty State với nút "Thử lại", tuyệt đối không để crash toàn bộ Server Component.
  - Tận dụng `error.tsx` cục bộ trong thư mục `apps/web/src/app/dong-xe/[slug]/` để bắt lỗi biên (Error Boundary).
* **Kế hoạch Rollback:** Kiểm tra logs server; nếu service sập, error boundary sẽ giữ nguyên giao diện Header/Footer giúp người dùng vẫn duyệt được các trang khác.
* **Chỉ Dẫn Kiểm Thử (Input cho QA Step 3.2):**
  - Giả lập (mock) `getCatalogCars()` trả về Promise rejected hoặc throw Error.
  - Khẳng định trang hiển thị UI Error State thân thiện, không văng stack trace kỹ thuật ra màn hình người dùng.

---

### [R2] Memory Leak & Unbounded Collections (In-Memory Filter Memory Footprint)
* **Kịch bản Nguy hại:**
  - Toàn bộ danh mục xe được load vào bộ nhớ server Node.js qua `getCatalogCars()` rồi lọc in-memory `cars.filter(...)`. Nếu catalog xe tăng trưởng lên hàng nghìn xe hoặc filter tạo ra các object reference giữ trong closures, có thể gây áp lực garbage collection (GC pressure) hoặc nghẽn Event Loop.
* **Bản chất Kỹ thuật:** Lọc in-memory trên tập dữ liệu chưa phân trang.
* **Giải Pháp Phòng Vệ Bắt Buộc (Code Defense Invariant):**
  - Hàm filter phải là pure function, chỉ thao tác trên shallow properties (`car.kieuDang?.toLowerCase() === target`).
  - Hàm `getCatalogCars()` sử dụng cơ chế Next.js `unstable_cache` với tag `'catalog-cars'`, do đó kết quả được lưu đệm trong Data Cache, không re-query DB liên tục.
* **Chỉ Dẫn Kiểm Thử (Input cho QA Step 3.2):**
  - Kiểm tra performance khi catalog chứa 200 xe, thời gian phản hồi (TTFB) trang `/dong-xe/[slug]` phải dưới 100ms khi cache hit.

---

### [R11] Hardcoded Secrets & Magic Values (Segment Slug Registry Governance)
* **Kịch bản Nguy hại:**
  - Rải rác các chuỗi `"sedan"`, `"suv"`, `"mpv"` khắp các file `page.tsx`, `navbar.tsx`, `settings.ts`. Khi cần thêm phân khúc mới (ví dụ: `ban-tai`, `coupe`), dev phải sửa hàng chục file và rất dễ sót gây ra inconsistency.
* **Bản chất Kỹ thuật:** Vi phạm nguyên lý Single Source of Truth (SSOT).
* **Giải Pháp Phòng Vệ Bắt Buộc (Code Defense Invariant):**
  - Tạo file cấu hình tập trung `apps/web/src/config/segments.ts` (hoặc trong package types): Định nghĩa hằng số `VALID_SEGMENT_SLUGS`, type `SegmentSlug`, và cấu hình SEO (Title, Description, H1, kieuDang mapping).
* **Chỉ Dẫn Kiểm Thử (Input cho QA Step 3.2):**
  - Kiểm tra `VALID_SEGMENT_SLUGS` chứa chính xác `['sedan', 'suv', 'mpv']`.

---

## 4. Kế Hoạch Rollback Toàn Diện (Zero-Loss Sandbox Rollback Plan)

Trong môi trường Sandbox Development:
1. **Trường hợp lỗi Build / Type-check:**
   - Hoàn tác file `apps/web/src/app/dong-xe/[slug]/page.tsx` và `apps/web/src/config/segments.ts`.
   - Revert commit trên `packages/types/src/settings.ts` và `packages/database/src/seed-settings.ts`.
2. **Trường hợp lỗi Runtime / Cache Invalidation:**
   - Xóa bộ nhớ đệm Next.js: `rm -rf apps/web/.next`.
   - Khởi động lại dev server: `pnpm dev`.
3. **Mức độ an toàn dữ liệu:**
   - 100% không làm mất dữ liệu database người dùng hoặc danh sách xe, vì tính năng chỉ thao tác đọc (read-only) và cập nhật URL menu mặc định.

---

## 5. Chỉ Dẫn Đầu Vào Cho Kỹ Sư QA (Handoff to Step 3.2)
- Tập trung kiểm thử 5 vùng trọng điểm:
  1. **Status Code Verification:** 200 cho `/dong-xe/sedan`, `/dong-xe/suv`, `/dong-xe/mpv`; 404 cho bất kỳ slug lạ nào khác.
  2. **Metadata & JSON-LD:** Canonical link, Title, OpenGraph và Structured Data đúng cấu trúc.
  3. **SEO On-Page Copy:** Tối thiểu 200 từ nội dung chuyên sâu về phân khúc phía trên hoặc dưới lưới xe.
  4. **Resilience & Fallback:** Thử nghiệm kịch bản `getCatalogCars()` trả về mảng rỗng hoặc lỗi.
  5. **Navigation Consistency:** Click từ menu chính và menu footer chuyển đúng URL mới.

---

### 🧭 TRẠNG THÁI TIẾN ĐỘ: BƯỚC 3.1 HOÀN TẤT (RISK & IMPACT AUDIT)
- **Giai đoạn Hiện tại:** Phase 3: Kiểm soát Rủi ro & Thiết kế Ma trận Kiểm thử
- **Vừa Hoàn Thành:** Step 3.1 — Xuất bản `docs/features/ROUTING-URL-ARCHITECTURE/RISK_AUDIT.md` bởi `@dependency-graph-analyzer`.
- **Trạng thái Chốt chặn:** 🟢 SẴN SÀNG CHUYỂN BƯỚC (TRANSITION READY).
- **Rào chắn An toàn (Tool-Lock):** 🔒 TIẾP TỤC KHÓA CODE — Chưa được tạo file mã nguồn sản phẩm.
