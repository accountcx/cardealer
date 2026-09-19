# 🏛️ Architectural Solution Options: Chuẩn Hoá Toàn Bộ Form Hệ Thống Sang `react-hook-form`

## 1. Bối cảnh & Ràng buộc Kỹ thuật (Technical Constraints)
* **Phạm vi Nền tảng:** Frontend Web (`apps/admin`, kết nối `@cardealer/ui`).
* **Hiện trạng Hệ thống:** Các form modal và trang quản trị đang dùng `useState` thủ công. Thư viện UI `packages/ui/src/input.tsx` đã được viết bằng `React.forwardRef` có sẵn `error` và `helperText`.
* **Ràng buộc Môi trường:** 🟢 Pure Development (Node 24, React 19).

---

## 2. Ma trận So sánh Phương án (Trade-off Matrix)

| Tiêu chí So sánh | Option A (RHF Native Register) | Option B (RHF + Zod Schema via Resolver) *(Khuyến nghị)* | Option C (Full Shadcn Form Context Layer) |
| :--- | :--- | :--- | :--- |
| **Mô hình Kiến trúc** | `useForm` với native register rules (`required`, `validate`) | `useForm` + `zodResolver(schema)` đồng bộ Schema Type | Thêm Form Context Provider (`<Form><FormField>`) |
| **Ưu điểm Kỹ thuật** | Cực kỳ nhẹ, chỉ cài `react-hook-form`, triển khai nhanh | **Chuẩn Enterprise, 100% Type-Safe**, Zod đã có sẵn trong monorepo, validate tập trung, thông báo lỗi tường minh | Tương thích 100% với kiến trúc Shadcn gốc |
| **Nhược điểm & Rủi ro** | Validation rules viết phân tán trong JSX, khó tái sử dụng | Cần cài thêm `@hookform/resolvers` | Tăng số lượng file boilerplate, thay đổi cấu trúc `@cardealer/ui` |
| **Tác động Codebase** | Chỉ sửa các file Form hiện hữu | Sửa các file Form + định nghĩa Zod Schema | Sửa cả `packages/ui` và toàn bộ Form |
| **Khuyến nghị Áp dụng** | Phù hợp dự án nhỏ / Tier 3 | **Đề xuất Chấm chọn cho Tier 2 / Production** | Dành cho hệ sinh thái lớn đa team |

---

## 3. Chi tiết Phương án Đề xuất (Recommended Option)

* **Option khuyến nghị:** **Option B (RHF + Zod Schema via `@hookform/resolvers/zod`)**
* **Lý do lựa chọn:**
  1. Monorepo đã tích hợp sẵn `zod` trong `@cardealer/types` và `@cardealer/env`.
  2. Định nghĩa Schema bằng Zod giúp tự động suy luận TypeScript Type (`z.infer<typeof schema>`), loại bỏ hoàn toàn tình trạng sai lệch giữa Type Interface và Form State.
  3. Bắt lỗi chặt chẽ (format email, độ dài mật khẩu, kiểu số VNĐ) và trả về thông báo lỗi tiếng Việt đồng bộ vào thuộc tính `error` của [Input.tsx](file:///Users/nhatphan/Code/CarDealer/cardealer/packages/ui/src/input.tsx).
  4. Lệnh cài đặt duy nhất:
     ```bash
     export PATH="/Users/nhatphan/.nvm/versions/node/v24.21.0/bin:$PATH" && pnpm add react-hook-form @hookform/resolvers --filter @cardealer/admin
     ```

---

## ⚠️ IV. THÔNG BÁO CỬA CHẶN (SUB-GATE 2.1 STATUS BLOCK)

---
### 🧭 TRẠNG THÁI QUY TRÌNH (WORKFLOW GATE STATUS)
- **Tình trạng Môi trường:** 🟢 Pure Development (Chưa lên Production, môi trường Dev Node 24).
- **Cấp độ Luồng (Execution Tier):** **Tier 2 (Medium-Risk / Sub-feature & Component Refactor)**
- **Giai đoạn Hiện tại:** **Giai đoạn 2: Thiết kế Kiến trúc (Bước 2.1: Phân tích Solution Options)**
- **Skills Đang Kích Hoạt:** `system-analyst-architect`
- **Sản phẩm Bắt buộc của Giai đoạn:** `SOLUTION_OPTIONS.md` tại `docs/features/STANDARDIZE-FORMS-REACT-HOOK-FORM/`
- **Trạng thái Cửa chặn (Sub-Gate 2.1):** 🔒 **ĐANG KHÓA (LOCKED)** — Chờ Developer chốt Option kiến trúc.
- **Lệnh cần Developer gửi để thông quan:** 
  > **`Chốt Option B`** (hoặc `Chốt Option A` / `Chốt Option C`)
- **Kế hoạch Giai đoạn Kế tiếp:** Với Tier 2, sau khi Developer chốt Option, hệ thống sẽ chuyển thẳng sang **Giai đoạn 4: Thực thi Code (Phase 4.1 ➡️ Phase 4.2 ➡️ Phase 4.3 Dual Verification)**.
---
