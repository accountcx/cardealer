# 📝 Action Plan: PHASE 2 - STATIC-PAGES-CMS

> **Mã Epic**: `EPIC-PHASE-2-STATIC-PAGES-CMS`  
> **Dự án**: CarDealer CMS & Storefront  
> **Trạng thái**: Gate 1 - Strategic Analysis Completed (Awaiting Approval)  
> **Quy trình**: Universal Agentic Workflow v2.2 (5 Gates)  

---

## 🎯 GIAI ĐOẠN 1: KHÁM PHÁ & LẬP KẾ HOẠCH (DISCOVERY & PLANNING)
- [x] **1.1 Scope & Intent Discovery**: Khảo sát tọa độ hệ thống, bóc tách hợp đồng dữ liệu, lập `BACKLOG.md` và `TODO.md` — **Completed**
- [x] **1.2 Gate 1 Checkpoint**: Trình báo cáo chẩn đoán và Developer đã duyệt Backlog — **Completed**

---

## 🎯 GIAI ĐOẠN 2: THIẾT KẾ KIẾN TRÚC (ADAPTIVE ARCHITECTURE DESIGN)
- [x] **2.1 Solution Options**: Lập `SOLUTION_OPTIONS.md` (So sánh 4 quyết định kiến trúc trọng yếu) — **Completed**
- [x] **2.1 Checkpoint**: Developer đã phê duyệt chốt kiến trúc khuyến nghị — **Completed**
- [x] **2.2 Logic Flow**: Thiết kế luồng phân giải URL, quy tắc Blacklist Slugs và Lifecycle trong `FLOW.md` — **Completed**
- [x] **2.3 Database Schema**: Thiết kế chi tiết cấu trúc bảng `static_pages` và indexes vào `SCHEMA.md` — **Completed**
- [x] **2.4 API Specification**: Chuẩn hóa DTO, validation Zod và endpoints vào `API_SPEC.md` — **Completed**
- [x] **2.5 UI Integration Spec**: Thiết kế Layout 2 cột Admin & 4 Templates vào `FE_INTEGRATION_GUIDE.md` — **Completed**

---

## 🛡️ GIAI ĐOẠN 3: KIỂM SOÁT AN TOÀN & KỊCH BẢN TEST (RISK CONTROL & TEST PLAN)
- [x] **3.1 Risk & Impact Analysis**: Đánh giá Blast Radius, xung đột routing, XSS rich-text và cơ chế Rollback vào `RISK_AUDIT.md` — **Completed**
- [x] **3.2 Test Plan**: Thiết lập ma trận kiểm thử tự động (Edge cases, Slug Collisions, SERP preview, SSR Metadata) vào `TEST_PLAN.md` — **Completed**

---

## 🚀 GIAI ĐOẠN 4: THỰC THI CODE THEO LÁT CẮT (ATOMIC EXECUTION & VERIFICATION)
*(Thực hiện cuốn chiếu theo từng Atomic Slice — Skill: `@fullstack-dev-executor`, `@boilerplate-scaffolder`)*
- [ ] **Lát cắt 1 (US-01)**: Drizzle Schema `static_pages`, Migration & TypeScript Contracts (`@cardealer/types`)
- [ ] **Lát cắt 2 (US-02)**: REST API Endpoints Admin CRUD & Public Query
- [ ] **Lát cắt 3 (US-03)**: CMS Admin UI (Danh sách `/pages` & Soạn thảo 2 cột: Tiptap + SERP Sidebar)
- [ ] **Lát cắt 4 (US-04)**: Web Client Dynamic Route `apps/web/app/[slug]/page.tsx` & 4 Layout Templates

---

## 🔍 GIAI ĐOẠN 5 & HOÀN THIỆN: REVIEW ĐỘC LẬP & LƯU TRỮ KIẾN THỨC
- [ ] **Phase 5**: Review độc lập 100% dựa trên Git Diff — **Skill**: `@independent-code-reviewer`
- [ ] **Bonus**: Cập nhật bài học kiến trúc vào `LESSONS_LEARNED.md` — **Skill**: `@knowledge-base-scribe`
