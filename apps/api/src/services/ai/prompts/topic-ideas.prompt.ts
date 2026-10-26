// 🧠 Mental Model: Prompt Builder chuyên biệt cho AI Topic Ideation & Deduplication Engine (US-05).
// Đóng vai trò Senior SEO Content Strategist, phân tích toàn bộ kho bài viết đã có
// và đề xuất các ý tưởng bài viết mới lạ, phát hiện Content Gaps, loại trừ triệt để Keyword Cannibalization.

import type { PromptBuilderInput } from '../ai.types';
import { formatExistingArticlesBlacklist } from '@cardealer/core';

export { formatExistingArticlesBlacklist };

export function buildTopicIdeasPrompt(
  input: PromptBuilderInput,
  availableCarsListText: string,
  targetCar: string,
  targetLocation: string,
  targetKeyword: string
): string {
  const { prompt, angle, category, ideasCount = 4, existingArticles } = input;
  const blacklistText = formatExistingArticlesBlacklist(existingArticles, 40);

  return `Bạn là Giám Đốc Chiến Lược Nội Dung SEO (Senior SEO Content Strategist) hàng đầu trong ngành công nghiệp ô tô tại Việt Nam.

MỤC TIÊU CỐT LÕI:
Đề xuất chính xác ${ideasCount} Ý TƯỞNG BÀI VIẾT ĐỘC BẢN, SÁNG TẠO VÀ CHUẨN SEO 100%, nhắm trúng các khoảng trống nội dung (Content Gaps) mà người mua xe tại ${targetLocation} đang tìm kiếm nhưng website CHƯA HỀ CÓ BÀI VIẾT NÀO GIẢI ĐÁP.

THÔNG TIN BỐI CẢNH YÊU CẦU:
- Dòng xe trọng tâm: ${targetCar}
- Khu vực thị trường: ${targetLocation}
- Chuyên mục mong muốn: ${category || 'Tự động chọn chuyên mục phù hợp nhất (Đánh giá, Bảng giá, So sánh, Cẩm nang, Trả góp)'}
- Góc độ định hướng: ${angle || 'Tập trung vào tính thực tế, giải quyết nỗi đau khách hàng và chi phí sử dụng'}
- Yêu cầu bổ sung từ biên tập viên: "${prompt || 'Gợi ý các chủ đề có lượng tìm kiếm tiềm năng cao'}"
${availableCarsListText}
${blacklistText}

HƯỚNG DẪN TÌM KIẾM GÓC TIẾP CẬN MỚI LẠ (CONTENT ANGLE INSPIRATIONS):
1. Góc tiếp cận Đối chiếu & Đánh đổi: So sánh hai phiên bản trong cùng một dòng xe, hoặc so sánh với đối thủ trực tiếp về chi phí sử dụng 5 năm.
2. Góc tiếp cận Tình huống sử dụng thực tế tại ${targetLocation}: Đi đường đèo dốc, đi mùa mưa ngập lụt, xe chạy dịch vụ gia đình, kinh nghiệm chạy cao tốc Diễn Châu - Bãi Vọt.
3. Góc tiếp cận Tối ưu tài chính & Đòn bẩy trả góp: Bảng tính thu nhập bao nhiêu thì nên mua xe, phương án trả nợ trước hạn không bị phạt.
4. Góc tiếp cận Kỹ thuật & Mẹo vặt chuyên sâu: Hướng dẫn sử dụng các tính năng an toàn chủ động SmartSense, mẹo tiết kiệm nhiên liệu trong đô thị.

YÊU CẦU BẮT BUỘC VỀ ĐẦU RA JSON:
Bạn PHẢI trả về duy nhất một đối tượng JSON hợp lệ theo cấu trúc sau (không kèm giải thích markdown ngoài JSON):
{
  "topicIdeas": [
    {
      "title": "Tiêu đề bài viết hấp dẫn, tự nhiên, chứa từ khóa, dài 50-70 ký tự",
      "slug": "slug-url-khong-dau-ngan-gon-chuan-seo",
      "focusKeyword": "từ khóa chính độc nhất từ 2-5 từ",
      "angle": "Tên góc tiếp cận độc bản ngắn gọn (ví dụ: Chi phí nuôi xe 5 năm)",
      "contentGap": "Giải thích rõ khoảng trống nội dung website chưa có mà ý tưởng này giải quyết",
      "summary": "Tóm tắt 2-3 câu súc tích về giá trị bài viết đem lại cho người đọc",
      "targetCar": "${targetCar}",
      "suggestedCategory": "Tên chuyên mục phù hợp",
      "outlinePreview": [
        "1. Tiêu đề mục chính 1",
        "2. Tiêu đề mục chính 2",
        "3. Tiêu đề mục chính 3",
        "4. Tiêu đề mục chính 4"
      ],
      "searchIntent": "commercial" // hoặc informational | transactional | navigational
    }
  ]
}
`;
}
