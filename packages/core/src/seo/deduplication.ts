// 🧠 Mental Model: Thuật toán đối soát và chống trùng lặp từ khóa & tiêu đề (Anti-Cannibalization Engine).
// 1. Kiểm tra Exact Match & Substring Match trên Tiêu đề và Từ khóa chính.
// 2. Tính toán Jaccard Similarity trên tập hợp token/từ khóa có nghĩa (> 2 ký tự).
// 3. Định dạng Negative Grounding Blacklist cho Prompt của Trợ lý AI.

export interface ExistingArticleRef {
  carName?: string;
  carSlug?: string;
  title: string;
  focusKeyword?: string;
  summary?: string;
}

/**
 * Tính toán độ tương đồng Jaccard giữa hai chuỗi từ khóa (dựa trên tập hợp các từ)
 */
export function calculateKeywordSimilarity(kw1: string, kw2: string): number {
  if (!kw1 || !kw2) return 0;
  const norm1 = kw1.toLowerCase().trim();
  const norm2 = kw2.toLowerCase().trim();
  if (norm1 === norm2) return 1;

  const words1 = new Set(norm1.split(/\s+/).filter((w) => w.length > 1));
  const words2 = new Set(norm2.split(/\s+/).filter((w) => w.length > 1));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Kiểm tra xem tiêu đề hoặc từ khóa của một ý tưởng mới có bị trùng lặp với danh sách bài viết đã có hay không.
 * Ngưỡng mặc định threshold = 0.6 (60% từ khóa trùng nhau) sẽ bị coi là trùng lặp (Keyword Cannibalization).
 */
export function checkTitleOrKeywordOverlap(
  candidateTitle: string,
  candidateKeyword: string,
  existingArticles: ExistingArticleRef[] = [],
  threshold = 0.6
): boolean {
  if (!existingArticles || existingArticles.length === 0) return false;

  const normCandidateTitle = candidateTitle.toLowerCase().trim();
  const normCandidateKeyword = candidateKeyword.toLowerCase().trim();

  for (const existing of existingArticles) {
    const existingTitle = (existing.title || '').toLowerCase().trim();
    const existingKeyword = (existing.focusKeyword || '').toLowerCase().trim();

    // 1. Trùng lặp chính xác hoặc chứa toàn bộ tiêu đề
    if (existingTitle) {
      if (
        existingTitle === normCandidateTitle ||
        (existingTitle.length >= 10 && normCandidateTitle.includes(existingTitle)) ||
        (normCandidateTitle.length >= 10 && existingTitle.includes(normCandidateTitle))
      ) {
        return true;
      }
    }

    // 2. Trùng lặp chính xác từ khóa chính
    if (existingKeyword) {
      if (
        existingKeyword === normCandidateKeyword ||
        (existingKeyword.length >= 5 && normCandidateKeyword.includes(existingKeyword)) ||
        (normCandidateKeyword.length >= 5 && existingKeyword.includes(normCandidateKeyword))
      ) {
        return true;
      }

      // 3. Kiểm tra độ tương đồng Jaccard giữa hai từ khóa chính
      const sim = calculateKeywordSimilarity(normCandidateKeyword, existingKeyword);
      if (sim >= threshold) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Định dạng danh sách bài viết đã có thành chuỗi Negative Grounding cấm trùng lặp trong Prompt
 */
export function formatExistingArticlesBlacklist(
  existingArticles?: ExistingArticleRef[],
  limit = 40
): string {
  if (!existingArticles || existingArticles.length === 0) {
    return 'Hệ thống hiện chưa có bài viết nào được lưu. Bạn có thể tự do đề xuất các chủ đề nền tảng và chuyên sâu.';
  }

  const items = existingArticles.slice(0, limit).map((a, idx) => {
    const parts = [`${idx + 1}. [${a.carName || 'Chung'}]`];
    if (a.title) parts.push(`Tiêu đề: "${a.title}"`);
    if (a.focusKeyword) parts.push(`Từ khóa: "${a.focusKeyword}"`);
    return parts.join(' | ');
  });

  return `DANH SÁCH ${items.length} BÀI VIẾT ĐÃ TỒN TẠI TRONG CƠ SỞ DỮ LIỆU (CẤM TRÙNG LẶP DƯỚI MỌI HÌNH THỨC):
${items.join('\n')}

🛑 QUY TẮC BẤT BIẾN VỀ CHỐNG TRÙNG LẶP & CANNIBALIZATION:
1. TUYỆT ĐỐI KHÔNG chọn từ khóa chính (focusKeyword) hoặc tiêu đề (title) trùng lặp, tương đương ngữ nghĩa hoặc na ná với danh sách trên.
2. KHÔNG lặp lại cùng một góc tiếp cận đã có. Hãy chủ động khai thác các khoảng trống nội dung (Content Gaps) mà khách hàng quan tâm nhưng chưa có bài giải đáp.
3. MỖI Ý TƯỞNG BẮT BUỘC PHẢI CHỈ RÕ "contentGap" và "angle" độc nhất.`;
}
