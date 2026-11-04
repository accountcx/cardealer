# 💡 SOLUTION OPTIONS: AI Topic Ideation & Deduplication Engine
> **Module:** `content-management`  
> **Phiên bản:** `v1.3.0`  
> **Căn cứ:** [`OVERVIEW.md`](./OVERVIEW.md), [`BACKLOG.md`](./BACKLOG.md) (US-05)  

---

## 1. Bối Cảnh & Bài Toán Nghiệp Vụ
Trong hệ thống đại lý ô tô CarDealer (`content-management`), việc phát triển nội dung Inbound Marketing chuẩn SEO đòi hỏi:
- **Thách thức:** Khi showroom đã có hàng chục hoặc hàng trăm bài viết về các dòng xe (Santa Fe, Tucson, Creta, Accent...), biên tập viên rất dễ rơi vào bẫy **Trùng lặp chủ đề** hoặc **Ăn thịt từ khóa (Keyword Cannibalization)** — tức nhiều bài viết cùng nhắm tới 1 từ khóa giống nhau, khiến Google phân vân và làm tụt thứ hạng SEO toàn trang.
- **Yêu cầu:** Trợ lý AI cần tự động quét toàn bộ cơ sở dữ liệu các bài viết đã có (`posts` và `car_articles`), phát hiện các khoảng trống nội dung (Content Gaps) và đề xuất các ý tưởng bài viết hoàn toàn độc bản, có từ khóa và góc nhìn mới mẻ.

---

## 2. So Sánh Các Phương Án Kỹ Thuật

| Tiêu chí | Phương Án A: Client-side Filter Sau Khi LLM Sinh Tự Do | Phương Án B: Vector Database & Semantic Embeddings (Pinecone / PgVector) | Phương Án C: Two-Tier Deduplication Strategy (Đề Xuất) |
| :--- | :--- | :--- | :--- |
| **Cơ chế hoạt động** | Gửi prompt cho LLM sinh ý tưởng bất kỳ, sau đó frontend tự lọc bỏ các ý tưởng có tiêu đề giống bài cũ. | Bơm embeddings của toàn bộ bài viết vào vector database, chạy cosine similarity để tìm bài tương đồng. | **Tier 1 (Prompt Negative Grounding):** Backend tự query toàn bộ tiêu đề/từ khóa bài cũ bơm vào prompt ép LLM tìm Content Gap.<br/>**Tier 2 (Post-generation Token Overlap):** Thuật toán n-gram/keyword overlap kiểm tra chéo trước khi trả kết quả. |
| **Độ chính xác chống trùng** | 🔴 Kém: LLM không hề biết bài cũ đang có gì, dễ sinh ra các ý tưởng trùng lặp dẫn tới bị lọc hết. | 🟢 Cao. | 🟢 Rất cao: LLM chủ động tìm góc nhìn mới dựa trên danh sách blacklist bài cũ. |
| **Độ phức tạp & Chi phí** | 🟢 Đơn giản. | 🔴 Rất phức tạp: Cần setup vector store, tốn thêm chi phí embedding API và bảo trì hạ tầng. | 🟢 Tối ưu: Tận dụng trực tiếp PostgreSQL hiện có và OpenAI model, không tốn thêm hạ tầng ngoài. |
| **Thời gian phản hồi** | 🟢 Nhanh. | 🟡 Trung bình (2-3 lần gọi API). | 🟢 Rất nhanh: 1 lần gọi DB + 1 lần gọi LLM (2-4 giây). |
| **Trải nghiệm biên tập viên** | 🔴 Tỷ lệ sinh rỗng cao nếu bài bị lọc. | 🟢 Tốt. | 🟢 Xuất sắc: Mỗi ý tưởng giải thích rõ "Khoảng trống nội dung" và "Góc nhìn độc bản". |

---

## 3. Quyết Định Kiến Trúc (Architecture Decision)
- **Lựa chọn:** **Phương Án C (Two-Tier Deduplication Strategy)**.
- **Lý do lựa chọn:**
  1. **Hiệu quả triệt để:** Bằng cách cung cấp danh sách bài viết hiện có vào Prompt (Negative Grounding), mô hình AI đóng vai trò như một Senior SEO Content Strategist, nhận diện chính xác các góc tiếp cận còn trống.
  2. **An toàn kép:** Thuật toán kiểm tra chéo ở tầng Backend đảm bảo nếu có ý tưởng nào trùng từ khóa chính > 60% với database sẽ tự động được làm mới hoặc gắn cờ cảnh báo.
  3. **Zero Infrastructure Overhead:** Không phát sinh dependency bên ngoài, hoàn toàn tương thích với kiến trúc monorepo và stack PostgreSQL + Drizzle hiện tại.
