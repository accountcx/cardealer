# 📝 Action Plan: Cấu Trúc Routing Tĩnh & Kiến Trúc Menu (URL Architecture)

## 🎯 GIAI ĐOẠN 1: KHÁM PHÁ VÀ LẬP KẾ HOẠCH (DISCOVERY & PLANNING)
- [x] **1.0 Environment & Scope Discovery:** Khảo sát tọa độ hệ thống, xác nhận Sandbox và lập `BACKLOG.md`, `TODO.md` — **Completed**

## 🎯 GIAI ĐOẠN 2: THIẾT KẾ KIẾN TRÚC (ARCHITECTURE DESIGN)
- [x] **2.1 Solution Options:** Lập `SOLUTION_OPTIONS.md` (Chốt Option 2: `getCatalogCars()` + In-Memory Filter, bỏ qua 301 Redirect trong Dev) — **Completed**
- [x] **2.2 Detailed Logic Flow:** Thiết kế `FLOW.md` (Luồng phân giải slug, Fallback 404 Guard, Hydrate menu) — **Completed**
- [x] **2.3 Database & Data Model:** Rà soát `SCHEMA.md` (Mapping segment, DB settings table) — **Completed**
- [x] **2.4 API & Contract Specification:** Thiết kế `API_SPEC.md` (Slug validation, Server Component Props, Metadata) — **Completed**
- [x] **2.5 UI Integration Guide:** Lập `FE_INTEGRATION_GUIDE.md` (Layout <h1>, đoạn văn SEO 200 chữ, 4-state UI) — **Completed**

## 🛡️ GIAI ĐOẠN 3: KIỂM SOÁT RỦI RO VÀ TEST MATRIX
- [x] **3.1 Risk & Blast Radius:** Đánh giá an toàn và vùng ảnh hưởng vào `RISK_AUDIT.md` — **Skill:** `@dependency-graph-analyzer` — **Completed**
- [x] **3.2 Test Plan:** Thiết lập ma trận kiểm thử máy chứng thực vào `TEST_PLAN.md` — **Skill:** `@qa-test-engineer` — **Completed**

## 🚀 GIAI ĐOẠN 4: THỰC THI CODE THEO LÁT CẮT (VERTICAL SLICES)
*(Lộ trình chi tiết từng file do Coder thiết lập tại Step 4.0)*
- [x] **Lát cắt 1 (US-01):** Chuẩn hóa Navigation & Footer Settings Data Contract (Types, Seeds & Layout Links) — **Skill:** `@fullstack-dev-executor` — **Completed**
- [x] **Lát cắt 2 (US-02):** Dynamic Route Tĩnh `/dong-xe/[slug]` (RSC, `getCatalogCars()`, <h1>, Mô tả SEO 200 chữ, Lưới xe) — **Skill:** `@fullstack-dev-executor` — **Completed**
- [-] **Lát cắt 3 (US-03):** Cơ chế 301 Redirects & Canonical URLs — **Skipped (Môi trường Dev không yêu cầu)**

## 🔍 GIAI ĐOẠN 5 VÀ HOÀN THIỆN: REVIEW VÀ MEMORY
- [ ] **Phase 5:** Review độc lập trên Git Diff — **Skill:** `@independent-code-reviewer`
- [ ] **Bonus:** Cập nhật kiến trúc bài học vào `MEMORY.md` — **Skill:** `@knowledge-base-scribe`
