import type { PromptBuilderInput, PromptBuilderResult, ExistingCarArticleSummary } from './ai.types';
import { SYSTEM_PROMPT } from './prompts/system.prompt';
import { buildCarContentPrompt } from './prompts/car-content.prompt';
import {
  buildFullArticlePrompt,
  buildOutlinePrompt,
  buildContinueWritingPrompt,
  buildSeoOptimizationPrompt,
  buildFaqPrompt,
  buildSingleBlockPrompt,
} from './prompts/article.prompt';

export { SYSTEM_PROMPT };

// WHY: Định dạng danh sách bài viết đã có của các dòng xe để AI phân hóa nội dung và chống trùng lặp (Anti-Cannibalization & Duplicate Content).
export function formatExistingArticlesContext(
  existingArticles?: ExistingCarArticleSummary[],
  targetCar = ''
): string {
  if (!existingArticles || existingArticles.length === 0) return '';

  const listItems = existingArticles
    .slice(0, 10)
    .map((item, idx) => {
      const parts = [`${idx + 1}. [${item.carName}]`];
      if (item.segment) parts.push(`Phân khúc: ${item.segment.toUpperCase()}`);
      if (item.title) parts.push(`Tiêu đề đã viết: "${item.title}"`);
      if (item.focusKeyword) parts.push(`Từ khóa chính đã dùng: "${item.focusKeyword}"`);
      if (item.summary) parts.push(`Tóm tắt/Góc nhìn: "${item.summary.slice(0, 140)}..."`);
      return parts.join(' | ');
    })
    .join('\n');

  return `\nDANH SÁCH BÀI VIẾT ĐÃ CÓ CỦA CÁC DÒNG XE TRONG SHOWROOM (DÙNG ĐỂ CHỐNG TRÙNG LẶP NỘI DUNG & SEO):
Hệ thống đã có các bài viết sau cho các dòng xe khác. Hãy đọc kỹ danh sách này để thực hiện TRIỆT ĐỂ 3 QUY TẮC PHÂN HÓA NỘI DUNG:
${listItems}

🛑 NGUYÊN TẮC BẮT BUỘC CHỐNG TRÙNG LẶP SEO (ANTI-DUPLICATE CONTENT & KEYWORD CANNIBALIZATION):
1. TỪ KHÓA & TIÊU ĐỀ ĐỘC NHẤT: Tuyệt đối KHÔNG chọn từ khóa chính (focusKeyword) hoặc tiêu đề trùng lặp hay quá giống với các bài viết đã có ở trên. Mỗi dòng xe phải có từ khóa mục tiêu riêng biệt.
2. KHÁC BIỆT HOÁ ĐỊNH VỊ CHO DÒNG XE "${targetCar}": Mỗi dòng xe có sứ mệnh và khách hàng riêng biệt. Bài viết phải xoay quanh đặc tính, cá tính và mục đích sử dụng độc nhất của ${targetCar}. TUYỆT ĐỐI KHÔNG sao chép câu mở bài, câu khẩu hiệu, hay dàn ý từ các dòng xe trên.
3. KHÔNG DÙNG VĂN MẪU RẬP KHUÔN: Các phân tích về trang bị, vận hành, nội thất phải mang tính cá biệt hóa 100% dựa trên thực tế xe ${targetCar}. Không dùng lại các câu văn chung chung có thể áp dụng cho mọi xe.
`;
}

// WHY: Dispatcher xây dựng prompt theo từng hành động cụ thể, tách biệt logic các loại prompt theo nguyên tắc SRP và giới hạn kích thước unit (< 300 dòng).
export function buildPrompt(input: PromptBuilderInput): PromptBuilderResult {
  const { action, prompt, keyword, carModel, location, availableCars, existingArticles } = input;

  const targetLocation = location || 'Nghệ An & Hà Tĩnh';
  const targetCar = carModel || 'Xe ô tô Hyundai';
  const targetKeyword =
    keyword || (prompt.length > 5 && prompt.length < 50 ? prompt : `Đánh giá ${targetCar} tại ${targetLocation}`);

  const availableCarsListText =
    availableCars && availableCars.length > 0
      ? `\nDANH SÁCH XE CÓ SẴN TẠI ĐẠI LÝ (Hãy ưu tiên chọn đúng dòng xe từ danh sách này khi chèn khối relatedCar hoặc priceTable):\n${availableCars
          .map(
            (c) =>
              `- Tên xe: "${c.tenXe}" | Slug: "${c.slug}" | Giá niêm yết từ: ${
                c.minPrice || c.giaNiemYetTu ? (c.minPrice || c.giaNiemYetTu)!.toLocaleString('vi-VN') + ' VNĐ' : 'Liên hệ'
              } | Ảnh đại diện: "${c.anhDaiDienUrl || ''}" | Số chỗ: ${c.seatRange || c.soChoNgoi || 5} | Nhiên liệu: ${
                c.fuelType || c.loaiNhienLieu || 'Xăng'
              }`
          )
          .join('\n')}\n`
      : '';

  const existingArticlesText = formatExistingArticlesContext(existingArticles, targetCar);

  let userPrompt = '';
  let responseFormat: { type: 'json_object' } | undefined = undefined;
  let defaultTokenLimit = 2000;

  switch (action) {
    case 'generate_full_article':
      responseFormat = { type: 'json_object' };
      defaultTokenLimit = 6500;
      userPrompt = buildFullArticlePrompt(input, availableCarsListText, existingArticlesText, targetCar, targetLocation, targetKeyword);
      break;

    case 'generate_outline':
      responseFormat = { type: 'json_object' };
      defaultTokenLimit = 2500;
      userPrompt = buildOutlinePrompt(input, availableCarsListText, existingArticlesText, targetCar, targetLocation, targetKeyword);
      break;

    case 'continue_writing':
    case 'expand_section':
      responseFormat = { type: 'json_object' };
      defaultTokenLimit = 3500;
      userPrompt = buildContinueWritingPrompt(input, availableCarsListText, existingArticlesText, targetCar, targetLocation, targetKeyword);
      break;

    case 'optimize_seo':
      responseFormat = { type: 'json_object' };
      defaultTokenLimit = 1500;
      userPrompt = buildSeoOptimizationPrompt(input, targetCar, targetLocation, targetKeyword);
      break;

    case 'generate_faqs':
      responseFormat = { type: 'json_object' };
      defaultTokenLimit = 2000;
      userPrompt = buildFaqPrompt(prompt, targetCar, targetLocation, targetKeyword);
      break;

    case 'generate_car_content': {
      responseFormat = { type: 'json_object' };
      const carContent = buildCarContentPrompt(input, availableCarsListText, existingArticlesText);
      userPrompt = carContent.userPrompt;
      defaultTokenLimit = carContent.defaultTokenLimit;
      break;
    }

    case 'generate_single_block':
      responseFormat = { type: 'json_object' };
      defaultTokenLimit = 2500;
      userPrompt = buildSingleBlockPrompt(input, availableCarsListText, existingArticlesText, targetCar, targetLocation, targetKeyword);
      break;

    default:
      throw new Error(`Hành động AI '${action}' không được hỗ trợ.`);
  }

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    responseFormat,
    defaultTokenLimit,
  };
}
