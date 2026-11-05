# 🧭 OVERVIEW: SEO Optimization & Organic Growth Engine

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Tài liệu tham chiếu:** [BACKLOG.md](./BACKLOG.md) | [TODO.md](./TODO.md) | [docs/05-TECHNICAL-SEO-VA-SCHEMA-JSONLD.md](../../05-TECHNICAL-SEO-VA-SCHEMA-JSONLD.md)

---

## 1. Mục Tiêu Nghiệp Vụ & Chỉ Số Đo Lường (KPIs)

Hệ thống SEO của dự án CarDealer được thiết kế nhằm phục vụ 3 mục tiêu chiến lược cốt lõi:
1. **Thống trị Kết Quả Tìm Kiếm Địa Phương (Local Dominance):** Đạt Top 1 - 3 cho các từ khóa mua xe Hyundai tại Nghệ An, Hà Tĩnh và khu vực Bắc Trung Bộ.
2. **Thu Hút Khách Hàng Ý Định Mua Cao (High-Intent Organic Traffic):** Đón đầu khách hàng tìm kiếm *"Bảng giá xe"*, *"Giá lăn bánh"*, *"Mua xe trả góp"* với tỷ lệ chuyển đổi form yêu cầu báo giá (Lead Conversion) đạt > 3.5%.
3. **Trải Nghiệm Kỹ Thuật Đạt Chuẩn Xanh (Core Web Vitals):** 100% URL vượt qua bài kiểm tra PageSpeed của Google trên thiết bị di động (LCP < 1.8s, CLS = 0, INP < 200ms).

---

## 2. Bản Đồ Kiến Trúc Hệ Thống SEO (Architecture Map)

```
                       ┌─────────────────────────┐
                       │     Google Search       │
                       │   & Social Crawlers     │
                       └────────────┬────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js App Router                            │
│                                                                        │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │     robots.ts         │         │        middleware.ts           │  │
│  │   Dynamic Directive   │         │  301 Redirect Engine (Max 3 H) │  │
│  └───────────────────────┘         └────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │     sitemap.ts        │         │        Server Components       │  │
│  │  Full Route Sync      │         │   SSR / ISR (Revalidate = 60s) │  │
│  └───────────────────────┘         └────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             Structured Data Engine (@cardealer/core)             │  │
│  │   AutoDealer • Product • Car • NewsArticle • FAQPage • Person    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Lịch Sử Nâng Cấp (Evolution History)

| Phiên bản | Ngày | Lát cắt thực hiện | Mô tả tóm tắt thay đổi |
| :--- | :--- | :--- | :--- |
| **v1.0.0** | 05/11/2026 | US-01 → US-08 | Khởi tạo hồ sơ quy hoạch cải thiện SEO toàn diện 4 giai đoạn theo chuẩn Digital Software Agency. |
