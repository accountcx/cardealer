# 🛡️ Living Documentation: Features Directory Guide

> **Chuẩn Quy Hoạch Tài Liệu Sống (Universal Agentic Workflow v5.1.0)**  
> **Nguyên Tắc Bất Biến:** `1 Module Domain = 1 Thư Mục Duy Nhất` tại `docs/features/[module-slug]/`.

---

## 🛑 Quy Tắc Chống Phân Mảnh Thư Mục (Anti-Fragmentation Invariant)

1. **Định danh Module Gốc:**
   - Tên thư mục bắt buộc đặt theo tên **Domain Module nghiệp vụ gốc** dạng `kebab-case` thường (ví dụ: `lead-management`, `catalog-management`, `pricing-calculator`...).
   - **TUYỆT ĐỐI CẤM:** Đặt tên thư mục theo tên Task hoặc chữ IN HOA (như `PHASE-2-ADMIN-USER-RBAC`, `TASK_LEAD_DELETE`).
2. **Bộ Hồ Sơ Final Bắt Buộc Trong Thư Mục Module:**
   - `OVERVIEW.md`: Mục tiêu nghiệp vụ, bản đồ kiến trúc & bảng Lịch sử Nâng cấp (Evolution History).
   - `BACKLOG.md`: Danh sách các lát cắt dọc nghiệp vụ (Vertical Slices: US-01, US-02...).
   - `TODO.md`: Danh sách đầu việc thực thi kỹ thuật.
   - `FLOW.md`: Sequence Diagram đa tầng & State Machine.
   - `SCHEMA.md`: Dữ liệu ORM Drizzle, quan hệ, indexes & ma trận trạng thái.
   - `API_SPEC.md`: Hợp đồng RESTful API chi tiết (Endpoints, Request/Response, Status Codes).
   - `FE_INTEGRATION_GUIDE.md`: Kiến trúc giao diện, Design Tokens & Ma trận 4-State UI.
   - `RISK_AUDIT.md`: Kiểm toán Blast Radius, an ninh bảo mật & kế hoạch Rollback.
   - `TEST_PLAN.md`: Ma trận kiểm thử tự động (Unit, Integration, E2E).
3. **Quy Trình Nâng Cấp Tính Năng (Upgrade / Evolution Mode):**
   - Khi hoàn thành hoặc bước vào đợt nâng cấp mới, lưu trữ các biên bản tạm (`AUDIT_GATE_*.md`, `SOLUTION_OPTIONS.md`, `CODE_REVIEW.md`, `EXECUTION_LOG.md`) vào thư mục con `history/`:
     ```bash
     bash "$HOME/.gemini/config/plugins/digital-software-agency/scripts/spec_guard.sh" docs/features/[module-slug] --archive [label]
     ```
   - Hợp nhất trực tiếp nội dung mới vào các file Final để đảm bảo thư mục module luôn là **Single Source of Truth** duy nhất của hệ thống.

---

## 📂 Danh Sách Modules Domain Chuẩn Mực Hiện Hành

1. **[`lead-management/`](./lead-management/)**: Phân hệ Quản trị Yêu Cầu Báo Giá & Hồ Sơ Vay, RBAC Xóa Lead, Dispatcher Email thông báo tự động tức thì (v1.0.0 Active).
2. **[`catalog-management/`](./catalog-management/)**: Phân hệ Danh mục Dòng Xe, Phiên Bản, Bảng Màu Ngoại Thất Trực Quan và Bảng Thông Số Kỹ Thuật (v1.0.0 Active).
3. **[`admin-rbac/`](./admin-rbac/)**: Phân hệ Quản trị Người Dùng, Xác Thực JWT, Ma Trận 4 Vai Trò RBAC, Thu Hồi Phiên Tức Thì & Nhật Ký Kiểm Toán (v1.0.0 Active).
4. **[`pricing-calculator/`](./pricing-calculator/)**: Phân hệ Tính Chi Phí Lăn Bánh Địa Phương, Bảng Tính Trả Góp Ngân Hàng Dư Nợ Giảm Dần & Format Tiền Tệ VNĐ (v1.0.0 Active).
5. **[`static-pages/`](./static-pages/)**: Phân hệ Trang Tĩnh E-E-A-T (Giới thiệu, Chính sách, Quy trình) & Cấu Hình Showroom Toàn Cục (v1.0.0 Active).
6. **[`content-management/`](./content-management/)**: Phân hệ Tin Tức, Bài Viết Soạn Thảo Tiptap 8 Content Blocks, Trình Phát TikTok 9:16 & Thư Viện Media Cloudinary (v1.0.0 Active).
