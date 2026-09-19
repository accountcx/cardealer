# 📋 Independent Security & Quality Review: Chuẩn Hoá Toàn Bộ Form Hệ Thống Sang `react-hook-form`

- **Target Ref / Git Diff:** Feature `STANDARDIZE-FORMS-REACT-HOOK-FORM`
- **Tra cứu Tri thức Động (Live Intelligence):**
  - Package CVEs Checked: `react-hook-form@^7.88.0`, `@hookform/resolvers@^5.9.1` (Zero known CVEs reported).
  - Standards Referenced: OWASP ASVS v4.0, CWE-20 (Improper Input Validation), CWE-79 (Cross-site Scripting).
- **Trạng thái Gate 5:** 🟢 **PASS**

---

### 🚨 Danh sách Findings (Khuyết tật Phát hiện)

| ID | Mức độ | Trạng thái | Vị trí (File:Line) | Nguồn Chuẩn (CVE/OWASP) | Bản chất Kỹ thuật & Bằng chứng | Giải pháp Khắc phục |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **F-01** | Nit | RESOLVED | `apps/admin/app/cars/[slug]/components/TabVersions.tsx:12` | Type-Safety | Thiếu trường `seatCount` trong interface `VersionItem` | Đã bổ sung `seatCount?: number` vào interface |
| **F-02** | Nit | RESOLVED | `apps/admin/app/settings/page.tsx:11` | Next.js App Router Invariant | Biến `settingsSchema` export từ `page.tsx` vi phạm kiểm tra export của Next.js | Đã chuyển thành internal constant `const settingsSchema` |

---

### 🔍 Bảng Kiểm tra Chốt chặn Toàn vẹn (Integrity Checklist)
- [x] **Spec Fidelity:** Toàn bộ form tuân thủ chuẩn Shadcn Form Context Layer (`Form, FormField, FormItem, FormLabel, FormControl, FormMessage`) từ `@cardealer/ui`.
- [x] **Zero Unapproved Mutation:** Không có schema breaking change hay DDL phá hủy dữ liệu.
- [x] **Type Safety:** 100% Zod schema schemas (`carFormSchema`, `colorFormSchema`, `loginSchema`, `settingsSchema`) đồng bộ input/output types.
- [x] **Fail-Safe Defaults:** Dữ liệu đầu vào form được kiểm tra chặt chẽ, hiển thị inline validation errors rõ ràng trước khi gửi network mutation.
- [x] **Machine Verification:** Toàn bộ monorepo (11 packages) chạy `pnpm check-types` (`turbo run check-types`) thành công với mã `exit 0`.
