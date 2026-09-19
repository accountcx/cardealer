# 🗺️ SYSTEM MAP: CARDEALER PLATFORM ARCHITECTURE

Bản đồ kiến trúc tổng thể toàn hệ thống phân vùng các module của nền tảng CarDealer (Monorepo):

```mermaid
graph TD
    subgraph "APPS LAYER"
        Web["apps/web (Storefront Client)<br/>- Trang chủ 6 phân khu<br/>- Chi tiết xe /xe/[slug]<br/>- Bộ tính lăn bánh & trả góp<br/>- Widget tư vấn viên"]
        Api["apps/api (Backend REST API)<br/>- Quản lý Lead & CRM Hook<br/>- API tính giá lăn bánh<br/>- Quản lý Catalog Xe & Màu<br/>- Google Indexing Service"]
        Admin["apps/admin (Admin Portal)<br/>- Quản trị Dòng xe & Phiên bản<br/>- Soạn thảo Lexical 15 Blocks<br/>- Phân luồng Leads khách hàng<br/>- Cấu hình Site & Contact"]
    end

    subgraph "PACKAGES LAYER"
        Core["packages/core<br/>- Pricing Engine (Lăn bánh & Trả góp)<br/>- Currency Formatters<br/>- SEO Schema JSON-LD Generators"]
        Types["packages/types<br/>- Data Models: Car, Lead, Quote, Settings<br/>- Zod Validation Schemas"]
        DB["packages/database<br/>- PostgreSQL Client & Schemas<br/>- Migration Scripts & Seeds"]
        Env["packages/env<br/>- Zod Environment Validation"]
        UI["packages/ui<br/>- Shared React Components"]
    end

    Web --> Core
    Web --> Types
    Web --> Env
    Web --> UI

    Admin --> Core
    Admin --> Types
    Admin --> Env
    Admin --> UI

    Api --> Core
    Api --> Types
    Api --> Env
    Api --> DB
```

## 📍 Tọa Độ Phân Vùng Module

| Phân Vùng | Đường Dẫn Codebase | Trách Nhiệm & Nghiệp Vụ |
| :--- | :--- | :--- |
| **Catalog & Product** | `packages/database`, `packages/types/src/car.ts`, `apps/api` | Quản lý 10 Core Entities (`Cars`, `CarVersions`, `Colors`, `VersionColors`...) |
| **Financial Engine** | `packages/core/src/pricing/`, `apps/api/src/routes/quote.ts` | Thuật toán tính thuế trước bạ, biển số, bảo hiểm, lãi suất trả góp ngân hàng |
| **Lead & CRM Funnel** | `packages/types/src/lead.ts`, `apps/api`, `apps/web` | Thu thập form, gắn tag Lead (`Event Lead`, `Báo Giá`), gửi thông báo |
| **Content & Lexical** | `apps/admin`, `apps/web`, `packages/ui` | Trình soạn thảo 15 Content Blocks, nhúng TikTok không cuộn, FAQ accordion |
| **SEO & Indexing** | `packages/core/src/seo/`, `apps/web`, `apps/api` | 7 Schema JSON-LD, Dynamic Sitemap, Google Indexing API v3 |
| **Global Settings** | `packages/database`, `apps/admin`, `apps/api` | 7 Globals (`SiteSettings`, `Navigation`, `ContactSettings`, `EventBanner`...) |

---

## 🗺️ Lộ Trình Triển Khai Chi Tiết
Xem toàn bộ chiến lược phân rã 6 giai đoạn phát triển tại:
👉 [06. Lộ Trình Triển Khai Phân Tầng 6 Giai Đoạn](./06-PHASED-IMPLEMENTATION-ROADMAP.md)
