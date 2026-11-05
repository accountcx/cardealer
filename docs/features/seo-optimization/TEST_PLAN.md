# 🧪 TEST PLAN: Machine-Verifiable SEO Quality Assurance

> **Module:** `seo-optimization`  
> **Phiên bản:** `v1.0.0`  
> **Tài liệu tham chiếu:** [RISK_AUDIT.md](./RISK_AUDIT.md) | [BACKLOG.md](./BACKLOG.md)

---

## 1. Ma Trận Kiểm Thử Tự Động Hóa (Automated Test Matrix)

| Test ID | Hạng mục kiểm tra | Lệnh máy xác minh (Machine Verification Command) | Tiêu chí đạt chuẩn (Pass Criteria) |
| :--- | :--- | :--- | :--- |
| **TC-01** | Canonical `/gia-lan-banh` | `curl -s http://localhost:3002/gia-lan-banh \| grep -i 'rel="canonical"'` | Thẻ canonical trỏ chính xác về `https://xehyundaivinh.com/gia-lan-banh`, không dính query params. |
| **TC-02** | HTTP 200 cho `/tra-gop` | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/tra-gop` | Trả về chính xác mã `200` (Không còn mã 307 redirect). |
| **TC-03** | Sitemap Zero Redirects | `curl -s http://localhost:3002/sitemap.xml \| grep -c '<loc>'` | 100% URL trong sitemap trả về HTTP 200 khi curl kiểm tra, không có URL chuyển hướng. |
| **TC-04** | True Binary OG Images | `file apps/web/public/images/og-image.jpg` | Báo cáo là file JPEG/PNG Image (Không phải SVG hay XML text). |
| **TC-05** | No Missing OG Files | `test -f apps/web/public/images/og-sedan.webp && test -f apps/web/public/images/og-suv.webp` | Exit code 0 (Toàn bộ các file ảnh OG tồn tại vật lý trên đĩa). |
| **TC-06** | SERP Favicon & Manifest | `test -f apps/web/public/favicon.ico && test -f apps/web/public/manifest.webmanifest` | Exit code 0 (Có đầy đủ file favicon và webmanifest). |
| **TC-07** | Always Exactly 1 H1 Tag | `curl -s http://localhost:3002 \| grep -c '<h1'` | Trả về chính xác giá trị `1` (cả khi Hero Banner bật lẫn khi tắt). |
| **TC-08** | Zero Raw `<img>` In News | `grep -rn "<img" apps/web/app/tin-tuc/ \| grep -v "noscript"` | Trả về 0 kết quả (100% chuyển đổi thành component `<Image>` Next.js). |
| **TC-09** | Revalidate API Auth | `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3002/api/revalidate` | Trả về `401` khi không có secret token; trả về `200` khi truyền đúng token bí mật. |
| **TC-10** | RSS Feed XML Validity | `curl -s http://localhost:3002/feed.xml \| grep -q '<rss version="2.0">'` | Exit code 0 (XML hợp lệ, Content-Type `application/xml`). |
| **TC-11** | Segment Hatchback & EV | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/dong-xe/hatchback` | Trả về `200` cho cả `/dong-xe/hatchback` và `/dong-xe/xe-dien`. |
| **TC-12** | Dynamic Lăn Bánh Route | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/gia-lan-banh/tucson` | Trả về `200` khi có xe Tucson; trả về `404` khi truy cập slug không tồn tại `/gia-lan-banh/invalid-slug`. |
| **TC-13** | JSON-LD Schema Validity | `node -e "JSON.parse(require('fs').readFileSync('...'))"` | Toàn bộ script `application/ld+json` parse JSON thành công, không có cú pháp lỗi hay ký tự chưa escape. |

---

## 2. Kịch Bản Kiểm Thử Đối Kháng & Tiêm Lỗi (Adversarial Testing)

1. **Adversarial Query Flooding:**
   * Gửi request với chuỗi query cực dài: `/xe?foo=bar&segment=sedan&price=under-500&malicious=<script>`.
   * *Kỳ vọng:* Trang vẫn hiển thị danh sách xe, mã hóa XSS an toàn, và thẻ `<link rel="canonical">` vẫn chỉ là `https://xehyundaivinh.com/xe`.
2. **Revalidate Secret Brute-Force Defense:**
   * Gửi request POST tới `/api/revalidate` với token ngẫu nhiên không đúng.
   * *Kỳ vọng:* Trả về ngay lập tức HTTP 401 Unauthorized, không thực hiện purge cache dưới mọi hình thức.
3. **Invalid Slug Soft-404 Attack:**
   * Gửi request tới `/gia-lan-banh/hack-slug-xyz` và `/dong-xe/non-existent-segment`.
   * *Kỳ vọng:* Máy chủ trả về HTTP 404 thực thể với giao diện Not-Found thân thiện, tuyệt đối không trả về 200 trang trắng.
