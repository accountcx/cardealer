# 📝 Action Plan: Thư Viện Ảnh Admin & Tích Hợp Cloudinary (Admin Image Library)

## 🎯 GIAI ĐOẠN 1: KHÁM PHÁ VÀ LẬP KẾ HOẠCH (STRATEGIC ANALYSIS)
- [x] **1.0 Environment Confirmation:** Xác nhận trạng thái môi trường 🟢 Pure Development (Sandbox) — **Completed**
- [x] **1.1 Platform Scope Confirmation:** Xác định phạm vi Full-stack (Database, Backend API, Shared Types/Env, Admin UI) — **Completed**
- [x] **1.2 Scope & Intent Discovery:** Khảo sát codebase hiện hữu, Drizzle schema `media`, router `apps/api` và các form Car/Post — **Completed**
- [x] **1.3 Vertical Feature Slicing:** Phân rã 3 lát cắt dọc độc lập US-01, US-02, US-03 — **Completed**
- [x] **1.4 Handover to Phase 2:** Xuất bản `BACKLOG.md` và `TODO.md` — **Completed**

## 🎯 GIAI ĐOẠN 2: THIẾT KẾ KIẾN TRÚC THÍCH ỨNG (ADAPTIVE ARCHITECTURE DESIGN)
- [x] **2.1 Solution Options:** So sánh kiến trúc Upload qua Backend Streaming Proxy vs Client Direct Upload Signed Preset kèm Trade-offs (`SOLUTION_OPTIONS.md`) — **Completed**
- [x] **2.2 Logic Flow:** Thiết kế Sequence Diagram luồng Upload đơn/đa ảnh, Xóa ảnh, Rollback và Chọn ảnh vào Form (`FLOW.md`) — **Completed**
- [x] **2.3 Database Schema Design:** Mở rộng bảng `media`, Drizzle ORM model, Composite Indexes và Migration script (`SCHEMA.md`) — **Completed**
- [x] **2.4 API Specification:** Chuẩn hóa giao ước REST API endpoints, DTO Typing, Error Code Matrix (`API_SPEC.md`) — **Completed**
- [x] **2.5 UI Integration Spec:** Thiết kế Cây Component Hierarchy, Design Tokens, 4-State UI Matrix cho Media Library & Reusable MediaPickerModal (`FE_INTEGRATION_GUIDE.md`) — **Completed**

## 🛡️ GIAI ĐOẠN 3: KIỂM SOÁT AN TOÀN VÀ KỊCH BẢN KIỂM THỬ (RISK & TEST PLANNING)
- [x] **3.1 Risk & Blast Radius Audit:** Rà soát an ninh OWASP (SSRF, Stored XSS via SVG, Concurrency limits, Orphan Assets Rollback) (`RISK_AUDIT.md`) — **Completed**
- [x] **3.2 Test Specification:** Thiết lập ma trận kiểm thử toàn diện Happy path, Edge cases, Quota failure, CLI Verification Script (`TEST_PLAN.md`) — **Completed**

## 🚀 GIAI ĐOẠN 4: THỰC THI CODE THEO LÁT CẮT DỌC (VERTICAL SLICES EXECUTION)
- [ ] **Step 4.0 (Turn 0):** Baseline Scaffolding & Lập lộ trình vi mô (`EXECUTION_LOG.md`) — **Skill:** `@boilerplate-scaffolder`
- [x] **Lát cắt 1 (US-01):** Cloudinary Backend Integration, Media Schema Migration & REST Endpoints — **Completed (exit code 0)**
- [ ] **Lát cắt 2 (US-02):** Admin Media Library Management Portal (`/media`), Drag & Drop, Media Grid, Details Drawer — **Skill:** `@fullstack-dev-executor`
- [ ] **Lát cắt 3 (US-03):** Reusable MediaPickerModal & Tích hợp vào Car Forms, Post Editors & Profile — **Skill:** `@fullstack-dev-executor`

## 🔍 GIAI ĐOẠN 5: ĐÁNH GIÁ ĐỘC LẬP VÀ ĐÓNG GÓI TRI THỨC (REVIEW & MEMORY)
- [ ] **5.1 Independent Code Review:** Thẩm định độc lập trên Git Diff (`CODE_REVIEW.md`) — **Skill:** `@independent-code-reviewer`
- [ ] **5.2 Memory Synthesis:** Đúc kết kinh nghiệm xử lý Cloudinary streaming upload và media picker vào bộ nhớ dài hạn (`MEMORY.md`) — **Skill:** `@knowledge-base-scribe`
