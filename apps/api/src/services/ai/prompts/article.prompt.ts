import type { PromptBuilderInput } from '../ai.types';

// WHY: Tạo prompt viết bài hoàn chỉnh từ A-Z đạt 10 tiêu chí Động cơ SEO Real-time.
export function buildFullArticlePrompt(
  input: PromptBuilderInput,
  availableCarsListText: string,
  existingArticlesText: string,
  targetCar: string,
  targetLocation: string,
  targetKeyword: string
): string {
  const { prompt, context } = input;
  return `Hãy viết một BÀI VIẾT HOÀN CHỈNH TỪ A-Z ĐẠT ĐIỂM TUYỆT ĐỐI ĐỘNG CƠ SEO REAL-TIME (100/100 ĐIỂM) về chủ đề: "${prompt}".

Thông tin trọng tâm:
- Dòng xe: ${targetCar}
- Khu vực / Tỉnh thành: ${targetLocation}
- Từ khóa chính mục tiêu (Focus Keyword): ${targetKeyword}
${context ? `- Ngữ cảnh bổ sung / Dàn ý biên tập viên cung cấp:\n${context}\n` : ''}
${availableCarsListText}
${existingArticlesText ? `${existingArticlesText}\n` : ''}

CÁC QUY TẮC BẮT BUỘC ĐỂ ĐẠT 100/100 ĐIỂM SEO ON-PAGE:
1. title: Độ dài 45-62 ký tự, chứa trọn vẹn từ khóa "${targetKeyword}" ở ngay nửa đầu tiêu đề.
2. summary: 2-3 câu mở đầu cuốn hút, chứa từ khóa chính.
3. focusKeyword: "${targetKeyword}".
4. metaTitle: Dưới 60 ký tự (45-58 ký tự), bắt đầu bằng từ khóa "${targetKeyword}".
5. metaDescription: Độ dài 125-155 ký tự, chứa chính xác "${targetKeyword}" và câu kêu gọi hành động CTA.
6. suggestedKeywords: 4-6 từ khóa LSI mở rộng.
7. blocks: ĐIỀU PHỐI LINH HOẠT TỪ 8 ĐẾN 14 CONTENT BLOCKS (TUYỆT ĐỐI KHÔNG CỐ ĐỊNH 22 KHỐI RẬP KHUÔN):
   Tùy vào chủ đề bài viết và đối tượng người đọc, hãy phối hợp hài hòa các khối nội dung tinh hoa:
   - 1 paragraph mở đầu: Mở bài tự nhiên, chứa từ khóa "${targetKeyword}" trong 100 từ đầu tiên.
   - 2 đến 3 thẻ heading level 2: Dẫn dắt các luận điểm chính (chứa từ khóa hoặc địa danh một cách tự nhiên).
   - Các paragraph phân tích chuyên sâu (2-3 câu/đoạn).
   - 1 khối priceTable: Bảng giá niêm yết và dự toán lăn bánh (nếu bài viết có nội dung về giá xe).
   - 1 khối specTable: Bảng thông số kỹ thuật chi tiết (nếu bài viết so sánh hoặc phân tích trang bị).
   - 1 khối callout: Thông tin chính sách bảo hành, ưu đãi phụ kiện hoặc tư vấn tài chính.
   - 1 khối prosCons: 3-4 Ưu điểm nổi bật và 1-2 Điểm cần lưu ý khách quan.
   - 1 khối faq: 3-4 câu hỏi thường gặp thiết thực nhất.
   - 1 khối leadForm: Form đăng ký nhận báo giá lăn bánh & lái thử.
   - 1 khối ctaButton: Nút gọi hotline / Zalo chuyển đổi cao.

TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU (Số lượng blocks từ 8 đến 14 khối linh hoạt theo nội dung thực tế):
{
  "title": "Tiêu đề bài viết từ 40 đến 65 ký tự chứa từ khóa ở đầu",
  "summary": "Đoạn tóm tắt mở đầu 2-3 câu chứa từ khóa chính...",
  "focusKeyword": "${targetKeyword}",
  "metaTitle": "Tiêu đề SEO 45-58 ký tự chứa từ khóa chính",
  "metaDescription": "Mô tả SEO 125-155 ký tự chứa từ khóa chính và CTA xem báo giá chi tiết...",
  "suggestedKeywords": ["từ khóa lsi 1", "từ khóa lsi 2", "từ khóa lsi 3", "từ khóa lsi 4"],
  "blocks": [
    { "type": "paragraph", "content": "Nội dung đoạn mở đầu chứa từ khóa ${targetKeyword}..." },
    { "type": "heading", "level": 2, "content": "Tiêu đề H2 tự đặt tự nhiên hấp dẫn..." },
    { "type": "paragraph", "content": "Nội dung phân tích chuyên sâu..." },
    {
      "type": "priceTable",
      "title": "Bảng Giá Xe ${targetCar} & Dự Toán Lăn Bánh",
      "prices": [
        { "version": "${targetCar} Bản Tiêu Chuẩn", "listedPrice": 500000000, "discount": 0, "rollingPrice": 551000000 }
      ]
    },
    { "type": "heading", "level": 2, "content": "Tiêu đề H2 tiếp theo..." },
    { "type": "paragraph", "content": "Nội dung phân tích..." },
    {
      "type": "prosCons",
      "title": "Ưu Điểm & Điểm Cần Lưu Ý",
      "pros": ["Ưu điểm 1", "Ưu điểm 2", "Ưu điểm 3"],
      "cons": ["Điểm lưu ý 1", "Điểm lưu ý 2"]
    },
    {
      "type": "leadForm",
      "formHeadline": "Đăng Ký Báo Giá Lăn Bánh & Lái Thử ${targetCar}",
      "formButtonText": "Nhận Báo Giá Ngay",
      "carName": "${targetCar}"
    },
    {
      "type": "faq",
      "title": "Câu Hỏi Thường Gặp",
      "faqs": [
        { "question": "Câu hỏi thực tế 1?", "answer": "Câu trả lời chi tiết..." }
      ]
    },
    {
      "type": "ctaButton",
      "ctaButtonText": "Gọi Hotline Nhận Tư Vấn Chi Tiết",
      "ctaActionType": "hotline",
      "ctaVariant": "red"
    }
  ]
}`;
}

export function buildOutlinePrompt(
  input: PromptBuilderInput,
  availableCarsListText: string,
  existingArticlesText: string,
  targetCar: string,
  targetLocation: string,
  targetKeyword: string
): string {
  const { prompt, context } = input;
  return `Hãy tạo một dàn ý bài viết chuẩn SEO chi tiết, sâu sắc đáp ứng 10 tiêu chí Động cơ SEO Real-Time cho chủ đề: "${prompt}".
Dòng xe: ${targetCar}
Địa phương / Tỉnh thành: ${targetLocation}
Từ khóa chính: ${targetKeyword}
${availableCarsListText}
${existingArticlesText ? `${existingArticlesText}\n` : ''}
${context ? `Nội dung ngữ cảnh hiện có:\n${context}\n` : ''}

Yêu cầu:
1. Đảm bảo có ít nhất 3-5 thẻ H2 chứa từ khóa chính "${targetKeyword}" hoặc địa danh ${targetLocation}.
2. Gợi ý từng mục kèm suggestedBlockType tương ứng (heading, paragraph, specTable, priceTable, relatedCar, singleImage, youtube, callout, prosCons, leadForm, faq, ctaButton).
3. TUYỆT ĐỐI không dùng H1 trong dàn ý thân bài (chỉ dùng level 2 hoặc 3).
4. TÍNH ĐỘC BẢN & ĐA DẠNG: Cấu trúc dàn ý phải bám sát chính xác chủ đề "". TUYỆT ĐỐI KHÔNG lặp lại các mục rập khuôn như "Chính sách hỗ trợ trả góp lãi suất 6.9%" nếu bài viết là đánh giá xe, bảng giá hay quy trình bảo dưỡng.

Yêu cầu trả về JSON:
{
  "outline": [
    { "level": 2, "title": "Tiêu đề H2 chứa từ khóa...", "description": "Ý chính triển khai...", "points": ["Luận điểm 1", "Luận điểm 2"], "suggestedBlockType": "priceTable" },
    { "level": 3, "title": "Tiêu đề H3 chi tiết...", "description": "Chi tiết...", "points": ["Chi tiết 1"], "suggestedBlockType": "singleImage" }
  ]
}`;
}

export function buildContinueWritingPrompt(
  input: PromptBuilderInput,
  availableCarsListText: string,
  existingArticlesText: string,
  targetCar: string,
  targetLocation: string,
  targetKeyword: string
): string {
  const { prompt, context } = input;
  return `Hãy viết tiếp hoặc mở rộng một phần nội dung/chuyên đề hoàn chỉnh cho bài viết ô tô bằng cách sử dụng linh hoạt các khối CONTENT BLOCK TINH HOA phù hợp nhất theo yêu cầu sau:
Yêu cầu cụ thể / Đoạn cần viết tiếp: "${prompt}"
Dòng xe: ${targetCar}
Địa phương / Thị trường: ${targetLocation}
${targetKeyword ? `Từ khóa SEO cần lồng ghép tự nhiên: ${targetKeyword}` : ''}
${context ? `Ngữ cảnh / Nội dung các khối liền trước:\n${context.slice(0, 1500)}` : ''}
${availableCarsListText}
${existingArticlesText ? `${existingArticlesText}\n` : ''}

YÊU CẦU ĐIỀU PHỐI CÁC KHỐI CONTENT BLOCK TINH HOA:
- Tạo từ 2 đến 5 Content Blocks phong phú, chuyên sâu, kết hợp các loại block có sẵn trong hệ thống:
  + heading: Tiêu đề H2 hoặc H3 (level: 2 hoặc 3) dẫn dắt nội dung
  + paragraph: Đoạn văn phân tích kỹ thuật, trải nghiệm thực tế (2-4 câu/đoạn)
  + specTable: Bảng so sánh thông số kỹ thuật chi tiết
  + priceTable: Bảng giá niêm yết & dự toán lăn bánh
  + prosCons: Khối đánh giá ưu điểm & nhược điểm thực tế
  + callout: Hộp thông tin lưu ý quan trọng hoặc chính sách đặc quyền (calloutType: 'info' | 'warning' | 'success' | 'note')
  + singleImage: Khối hình ảnh trực quan (imageAlt chuẩn SEO, caption chú thích)
  + relatedCar: Khối xe liên quan (trỏ tới xe trong danh mục showroom)
  + ctaButton: Nút bấm chuyển đổi Hotline/Zalo/Báo giá
  + faq: Khối câu hỏi thường gặp
  + youtube: Video trải nghiệm lái thử

TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU:
{
  "summary": "Tóm tắt ngắn gọn 1-2 câu về phần nội dung vừa bổ sung...",
  "blocks": [
    { "type": "heading", "level": 2, "content": "Tiêu đề phần viết tiếp..." },
    { "type": "paragraph", "content": "Nội dung phân tích chi tiết..." },
    {
      "type": "callout",
      "calloutType": "info",
      "title": "Điểm nhấn đáng giá",
      "content": "Nội dung lưu ý hoặc thông tin đặc quyền..."
    }
  ]
}`;
}

export function buildSeoOptimizationPrompt(
  input: PromptBuilderInput,
  targetCar: string,
  targetLocation: string,
  targetKeyword: string
): string {
  const { prompt, context } = input;
  return `Hãy phân tích và viết lại gói giải pháp SEO On-Page HOÀN HẢO ĐẠT 100/100 ĐIỂM ĐỘNG CƠ SEO REAL-TIME cho bài viết:
Chủ đề / Tiêu đề hiện tại: "${prompt}"
Dòng xe: ${targetCar}
Khu vực: ${targetLocation}
Từ khóa trọng tâm: ${targetKeyword}
${context ? `Tóm tắt nội dung bài viết:\n${context.slice(0, 1000)}` : ''}

YÊU CẦU BẮT BUỘC:
1. metaTitle: Độ dài chuẩn 45 - 58 ký tự, bắt đầu bằng từ khóa chính "${targetKeyword}", hấp dẫn, chuẩn SERP.
2. metaDescription: Độ dài chuẩn 125 - 155 ký tự, chứa trọn vẹn từ khóa chính "${targetKeyword}" và lời kêu gọi hành động CTA rõ ràng.
3. suggestedSlug: URL slug không dấu chuẩn SEO (dưới 70 ký tự), chứa trọn vẹn từ khóa chính.
4. suggestedKeywords: 5-8 từ khóa LSI mở rộng.

Yêu cầu trả về JSON:
{
  "metaTitle": "Tiêu đề SEO 45-58 ký tự chứa từ khóa ở đầu",
  "metaDescription": "Mô tả SEO 125-155 ký tự chứa từ khóa chính + CTA rõ ràng...",
  "suggestedSlug": "duong-dan-chuan-seo-chua-tu-khoa-chinh",
  "suggestedKeywords": ["từ khóa lsi 1", "từ khóa liên quan 2", "từ khóa dài 3", "từ khóa hỏi đáp 4", "từ khóa địa phương 5"]
}`;
}

export function buildFaqPrompt(prompt: string, targetCar: string, targetLocation: string, targetKeyword: string): string {
  return `Hãy tạo 3 đến 5 câu hỏi và câu trả lời thường gặp (FAQ) thực tế nhất mà người mua xe hay tìm kiếm về chủ đề: "${prompt}".
Dòng xe: ${targetCar}
Địa phương: ${targetLocation}
Từ khóa: ${targetKeyword}

Yêu cầu: Câu hỏi đi thẳng vào thắc mắc thực tế (giá lăn bánh, điều kiện vay trả góp, hồ sơ bấm biển tại địa phương, thời gian giao xe, bảo dưỡng). Câu trả lời chính xác, 2-3 câu ngắn gọn.

Yêu cầu trả về JSON:
{
  "faqs": [
    {
      "question": "Câu hỏi thực tế mà khách hàng thường hỏi?",
      "answer": "Câu trả lời chi tiết, đáng tin cậy, súc tích."
    }
  ]
}`;
}

export function buildSingleBlockPrompt(
  input: PromptBuilderInput,
  availableCarsListText: string,
  existingArticlesText: string,
  targetCar: string,
  targetLocation: string,
  targetKeyword: string
): string {
  const { prompt, context } = input;
  return `Bạn là Giám đốc Sáng tạo Nội dung kiêm Chuyên gia Kỹ thuật Ô tô tại Việt Nam.
Hãy sáng tạo nội dung chi tiết, chuẩn SEO chuyên sâu cho DUY NHẤT 1 KHỐI NỘI DUNG (Content Block) thuộc loại: "${prompt}" cho bài viết về dòng xe:
- Dòng xe: ${targetCar}
- Địa phương / Thị trường: ${targetLocation}
- Từ khóa chính: ${targetKeyword}
${context ? `- Ngữ cảnh / Tiêu đề hoặc nội dung liền kề:\n${context.slice(0, 1000)}\n` : ''}
${availableCarsListText}
${existingArticlesText ? `${existingArticlesText}\n` : ''}

YÊU CẦU ĐẦU RA CHO LOẠI BLOCK "${prompt}":
- Nếu là "paragraph": Đoạn văn 2-3 câu sắc bén, chứa từ khóa tự nhiên, giàu thông tin thực tế.
- Nếu là "heading": Tiêu đề H2 hoặc H3 cuốn hút, chuẩn SEO (40-60 ký tự).
- Nếu là "prosCons": Gồm "title": "Ưu Điểm & Nhược Điểm Xe ${targetCar}", "pros": [4 ưu điểm thuyết phục], "cons": [2 nhược điểm thực tế].
- Nếu là "specTable": Gồm "title": "Bảng Thông Số Kỹ Thuật Xe ${targetCar}", "specVersions": [2-3 phiên bản], "specRows": [5-8 hàng thông số gồm specName và mảng values].
- Nếu là "priceTable": Gồm "title": "Bảng Giá Xe ${targetCar} & Lăn Bánh", "prices": [các phiên bản với version, listedPrice, discount, rollingPrice].
- Nếu là "faq": Gồm "title": "Câu Hỏi Thường Gặp", "faqs": [3-4 câu hỏi & câu trả lời thiết thực nhất].
- Nếu là "callout": Gồm "title", "calloutType": "info" | "warning" | "success" | "note", "content": đoạn văn lưu ý hoặc ưu đãi đặc quyền.
- Nếu là "ctaButton": Gồm "ctaButtonText": "Gọi Hotline Báo Giá Lăn Bánh", "ctaSubtext": "Tư vấn 24/7 - Giao xe tận nhà tại ${targetLocation}", "ctaActionType": "hotline", "ctaVariant": "red".
- Nếu là "leadForm": Gồm "formHeadline", "formSubheadline", "formButtonText", "carName": "${targetCar}".
- Nếu là "singleImage": Gồm "imageAlt": "Ảnh xe ${targetCar} chuẩn SEO", "caption": "Chú thích ảnh xe...".

TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON:
{
  "block": {
    "type": "${prompt}"
  }
}`;
}
