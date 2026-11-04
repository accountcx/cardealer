// 🧠 Mental Model: Prompt Builder chuyên biệt cho AI 30-Day Editorial Planner (US-07).
// Lập kế hoạch biên tập bài viết định kỳ trong tháng (12 - 30 bài) với từ khóa độc nhất,
// phân bổ đều ngày xuất bản và loại bỏ triệt để Keyword Cannibalization.

import { formatExistingArticlesBlacklist } from '@cardealer/core';
import type { AiCarSummary } from '@cardealer/types';
import type { ExistingCarArticleSummary } from '../ai.types';

export interface BuildEditorialPlanPromptInput {
  targetMonthCount?: number;
  targetCar?: string;
  categoryName?: string;
  availableCars?: AiCarSummary[];
  existingArticles?: ExistingCarArticleSummary[];
  location?: string;
}

export function buildEditorialPlanPrompt(input: BuildEditorialPlanPromptInput): string {
  const {
    targetMonthCount = 12,
    targetCar = 'Đa dạng các dòng xe trong showroom',
    categoryName,
    availableCars = [],
    existingArticles = [],
    location = 'Nghệ An & Hà Tĩnh',
  } = input;

  const blacklistText = formatExistingArticlesBlacklist(existingArticles, 50);

  const carsListText =
    availableCars.length > 0
      ? `\nDANH SÁCH DÒNG XE TRONG SHOWROOM:\n` +
        availableCars.map((c, i) => `${i + 1}. ${c.tenXe} (slug: ${c.slug})`).join('\n')
      : '';

  return `Bạn là Giám Đốc Kế Hoạch Nội Dung SEO (Head of Content & SEO Strategy) cho showroom ô tô tại ${location}.

MỤC TIÊU CỐT LÕI:
Thiết kế một KẾ HOẠCH BIÊN TẬP NỘI DUNG 30 NGÀY gồm đúng ${targetMonthCount} BÀI VIẾT ĐỘC BẢN, phân bổ đều từ ngày 1 đến ngày 30 trong tháng.
Mỗi bài viết phải giải quyết một nhu cầu tìm kiếm cụ thể, đa dạng góc nhìn, tuyệt đối KHÔNG TRÙNG LẶP từ khóa hay nội dung với các bài đã có trên website.

THÔNG TIN BỐI CẢNH:
- Số lượng bài cần lập kế hoạch: ${targetMonthCount} bài
- Dòng xe trọng tâm: ${targetCar}
- Chuyên mục ưu tiên: ${categoryName || 'Tự động phân bổ đa dạng (Đánh giá xe, Bảng giá & Lăn bánh, Cẩm nang sử dụng, So sánh xe, Khuyến mãi)'}
- Địa bàn thị trường: ${location}
${carsListText}
${blacklistText}

NGUYÊN TẮC PHÂN BỔ KẾ HOẠCH 30 NGÀY:
1. Phân bổ ngày xuất bản: Thuộc tính "suggestedDay" là số nguyên từ 1 đến 30, dàn đều theo chu kỳ (ví dụ nếu 10 bài thì cách 3 ngày 1 bài: ngày 2, 5, 8, 11, 14, 17, 20, 23, 26, 29).
2. Tỷ lệ phân bổ nội dung (Content Pillar Ratio):
   - 40% Bài chuyên môn dòng xe (Đánh giá, so sánh, trải nghiệm thực tế).
   - 30% Bài tài chính & chi phí (Bảng giá lăn bánh tại ${location}, thủ tục trả góp, chi phí nuôi xe).
   - 30% Bài cẩm nang & kinh nghiệm (Mẹo lái xe mùa mưa bão, bảo dưỡng hè, tính năng SmartSense).
3. Tuyệt đối không trùng từ khóa chính (focusKeyword) giữa các bài trong kế hoạch và với các bài đã có trong danh sách đã có ở trên.

YÊU CẦU BẮT BUỘC ĐẦU RA JSON (Trả về đúng cấu trúc, không markdown thừa):
{
  "planItems": [
    {
      "title": "Tiêu đề bài viết hấp dẫn, tự nhiên, chứa từ khóa, dài 50-70 ký tự",
      "focusKeyword": "từ khóa chính độc nhất từ 2-5 từ",
      "targetCar": "Tên dòng xe cụ thể hoặc Tất cả dòng xe",
      "categorySlug": "danh-gia-xe | bang-gia-xe | cam-nang-lai-xe | tin-khuyen-mai",
      "angle": "Tên góc tiếp cận ngắn gọn (ví dụ: Chi phí lăn bánh thực tế)",
      "summary": "Tóm tắt 2-3 câu định hướng nội dung chi tiết cho bài viết này",
      "suggestedDay": 1
    }
  ]
}
`;
}
