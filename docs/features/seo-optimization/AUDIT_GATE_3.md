# 🛡️ BIÊN BẢN KIỂM ĐỊNH GATE 3: RISK AUDIT & TEST PLAN

- **Module:** `seo-optimization`
- **Phiên bản:** `v1.0.0`
- **Ngày thực hiện:** 05/11/2026
- **Trọng tài kiểm định:** Independent Multi-Gate Adversarial Auditor (Fresh Eyes Context)
- **Chế độ kiểm tra:** AUTO-PILOT MODE (/goal)
- **Trạng thái:** 🟢 PASSED

---

## 1. Kết Quả Chạy Trọng Tài Máy (Deterministic Machine Guard)
- **Lệnh thực thi:** `bash scripts/spec_guard.sh docs/features/seo-optimization`
- **Exit Code:** `0` (SUCCESS)
- **Kết quả chi tiết:**
  - `[0/5] Module Identity & Anti-Fragmentation`: Đạt chuẩn `kebab-case` (`seo-optimization`), không phân mảnh thư mục cha.
  - `[1/5] Zero-Mutation Invariant`: Bảo đảm 100% không có file mã nguồn/cấu hình/test nào bị can thiệp trong Phase 3.
  - `[2/5] Required Final Documents`: Hiện diện đầy đủ 8/8 tài liệu bắt buộc (`OVERVIEW.md`, `BACKLOG.md`, `FLOW.md`, `SCHEMA.md`, `API_SPEC.md`, `FE_INTEGRATION_GUIDE.md`, `RISK_AUDIT.md`, `TEST_PLAN.md`).
  - `[3/5] Anti-Placeholder Audit`: 0 placeholder trốn việc (`TODO:`, `TBD`, `Cập nhật sau`, `Will implement`).
  - `[4/5] Technical Structure`: `TEST_PLAN.md` có đầy đủ danh sách 13 kịch bản kiểm thử tự động hóa máy đọc (`TC-01` -> `TC-13`).

---

## 2. Thẩm Định Chi Tiết RISK_AUDIT.md

### 2.1. Phân Tích Bán Kính Tác Động (Blast Radius Analysis)
- **Sitemap & Indexing (Nguy cơ Cao):** Ngăn chặn de-indexing diện rộng do URL sitemap lỗi hoặc canonical sai bằng cơ chế kiểm tra HTTP 200 tự động trước khi xuất bản `sitemap.ts`.
- **Core Web Vitals (Nguy cơ Trung bình):** Loại trừ nguy cơ tăng LCP hoặc phát sinh CLS khi tích hợp `next/image` bằng tỷ lệ khung hình cố định `aspect-video`, khung nền placeholder `bg-slate-100` và giới hạn cờ `priority` cho duy nhất ảnh Hero đầu tiên.
- **Storefront Routing (Nguy cơ Thấp):** Loại trừ nguy cơ xung đột giữa dynamic route `/gia-lan-banh/[carSlug]`, landing `/tra-gop` và static routes hiện có bằng cơ chế phân cấp router tường minh và kích hoạt `notFound()` chuẩn 404.
- **Cache & Performance (Nguy cơ Thấp):** Ngăn chặn tấn công DoS làm quá tải server thông qua API `/api/revalidate` bằng Secret Token Header xác thực bắt buộc và chỉ chấp nhận phương thức POST.

### 2.2. Bốn Bất Biến Hệ Thống (Property-Based Invariants)
1. **Bounded Execution & ReDoS Defense:** Mọi biểu thức chính quy (Regex) dùng để chuẩn hóa slug hoặc bóc tách chuỗi URL đều đạt độ phức tạp $O(n)$, cấm lồng lặp đa thức `(a+)+` gây treo CPU máy chủ.
2. **Canonical Immutability (Bảo Toàn Canonical):** 100% trang Storefront có thẻ Canonical tự thân loại bỏ hoàn toàn các tham số URL tiếp thị (`utm_*`, `fbclid`, `tab`, `xe`).
3. **Zero Soft-404 Invariant:** Slug không tồn tại trả về đúng HTTP status 404 thực thể qua `notFound()`, kèm thẻ `robots: { index: false, follow: true }`, cấm trả về HTTP 200 cho trang lỗi.
4. **Fail-Closed Secret Validation:** Endpoint `POST /api/revalidate` trả về HTTP 401 Unauthorized ngay lập tức nếu thiếu token hoặc token không khớp secret trong môi trường.

### 2.3. Kế Hoạch Rollback Dự Phòng (Safe Rollback Strategy)
- Revert Git commit nhanh chóng, không ảnh hưởng đến các module khác.
- Khởi động lại service PM2 (`pnpm run start:prod`) để giải phóng toàn bộ in-memory/disk cache của Next.js.
- Không gây mất mát hay biến đổi schema cơ sở dữ liệu PostgreSQL / Drizzle ORM.

---

## 3. Thẩm Định Chi Tiết TEST_PLAN.md

### 3.1. Ma Trận Kiểm Thử Tự Động Hóa (13 Test Cases)
- **TC-01 (Canonical `/gia-lan-banh`):** Xác thực canonical tag trỏ về URL sạch qua `curl`.
- **TC-02 (HTTP 200 `/tra-gop`):** Kiểm tra loại bỏ mã chuyển hướng 307 redirect.
- **TC-03 (Sitemap Zero Redirects):** 100% URL trong `sitemap.xml` trả về HTTP 200.
- **TC-04 (True Binary OG Images):** Lệnh `file apps/web/public/images/og-image.jpg` xác nhận file nhị phân JPEG/PNG hợp lệ.
- **TC-05 (No Missing OG Files):** Kiểm tra sự tồn tại vật lý của `og-sedan.webp` và `og-suv.webp`.
- **TC-06 (SERP Favicon & Manifest):** Kiểm tra vật lý `favicon.ico` và `manifest.webmanifest`.
- **TC-07 (Always Exactly 1 H1 Tag):** Trang chủ duy trì duy nhất 1 thẻ H1 kể cả khi Hero Banner ẩn.
- **TC-08 (Zero Raw `<img>` In News):** Xác minh 100% thẻ ảnh tin tức dùng component `<Image>` của Next.js.
- **TC-09 (Revalidate API Auth):** Kiểm tra mã 401 khi không có secret và mã 200 khi secret hợp lệ.
- **TC-10 (RSS Feed XML Validity):** Xác thực định dạng RSS 2.0 XML tại `/feed.xml`.
- **TC-11 (Segment Hatchback & EV):** Xác thực HTTP 200 cho `/dong-xe/hatchback` và `/dong-xe/xe-dien`.
- **TC-12 (Dynamic Lăn Bánh Route):** Kiểm tra HTTP 200 với slug xe hợp lệ và 404 với slug không tồn tại.
- **TC-13 (JSON-LD Schema Validity):** Script Node.js parse thành công 100% các khối script `application/ld+json`.

### 3.2. Kịch Bản Kiểm Thử Đối Kháng & Tiêm Lỗi (Adversarial Testing)
- **Adversarial Query Flooding:** Chống ô nhiễm tham số truy vấn và tấn công XSS trên thanh lọc xe.
- **Revalidate Secret Brute-Force Defense:** Chặn tấn công dò mã token bí mật của webhook xóa cache.
- **Invalid Slug Soft-404 Attack:** Phòng thủ việc cào URL rác gây loãng index trên công cụ tìm kiếm.

---

## 4. Kiểm Tra Zero-Mutation & Zero Mock Leaks
- **Zero-Mutation:** Không có bất kỳ thay đổi nào trong thư mục mã nguồn (`apps/web/`, `packages/core/`) hay file kiểm thử trong suốt Phase 3.
- **Zero Mock Leaks:** Toàn bộ test case được thiết kế hướng tới môi trường runtime thực, không nhúng mock hay fixture vào mã nguồn sản xuất.

---

## 5. Quyết Định Thông Quan Gate 3
Hồ sơ Phase 3 (`RISK_AUDIT.md` và `TEST_PLAN.md`) của module `seo-optimization` đạt chất lượng cao, định lượng rõ ràng, đối ứng chặt chẽ với bản vẽ kiến trúc Phase 2 và sẵn sàng 100% cho việc thi công lát cắt dọc tại Phase 4.
