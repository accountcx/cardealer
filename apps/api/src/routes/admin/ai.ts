import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq } from 'drizzle-orm';
import { authenticateAdmin, checkPermission } from '../../middleware/rbac';
import {
  AiGenerateRequestSchema,
  SiteSettingsSchema,
  type AiGenerateResponseData,
  type OutlineItem,
  type FaqItem,
  type SeoOptimizationResult,
  type FullArticleResult,
} from '@cardealer/types';

// 🛠️ Helper trích xuất và sửa lỗi JSON thông minh
function extractAndParseJson<T = any>(raw: string): T | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. Parse trực tiếp
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Bóc tách code block ```json ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  // 3. Tìm cặp ngoặc { ... } hoặc [ ... ] ngoài cùng
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  // 4. Tự động sửa chữa JSON bị cắt ngang do token limit
  if (firstBrace !== -1) {
    try {
      let candidate = trimmed.slice(firstBrace);
      const stack: string[] = [];
      let inString = false;
      let escaped = false;
      for (let i = 0; i < candidate.length; i++) {
        const char = candidate[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') stack.push('}');
          else if (char === '[') stack.push(']');
          else if (char === '}' || char === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === char) {
              stack.pop();
            }
          }
        }
      }
      if (inString) candidate += '"';
      while (stack.length > 0) {
        candidate += stack.pop();
      }
      return JSON.parse(candidate);
    } catch {}
  }

  return null;
}

// 🛠️ Fallback chuyển văn bản thường / Markdown sang cấu trúc FullArticleResult nếu AI không xuất JSON
function fallbackTextToFullArticle(text: string, titleHint: string, keywordHint: string): FullArticleResult {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const blocks: any[] = [];
  let currentParagraph = '';

  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (currentParagraph) {
        blocks.push({ type: 'paragraph', content: currentParagraph });
        currentParagraph = '';
      }
      const level = line.startsWith('### ') ? 3 : 2;
      const content = line.replace(/^#{2,3}\s*/, '');
      blocks.push({ type: 'heading', level, content });
    } else {
      currentParagraph = currentParagraph ? `${currentParagraph}\n${line}` : line;
    }
  }
  if (currentParagraph) {
    blocks.push({ type: 'paragraph', content: currentParagraph });
  }

  const finalBlocks = blocks.length > 0 ? blocks : [{ type: 'paragraph', content: text }];
  const firstP = finalBlocks.find((b) => b.type === 'paragraph')?.content || '';

  return {
    title: titleHint || (lines[0] ? lines[0].replace(/^#*\s*/, '') : 'Bài viết tư vấn mua xe Hyundai chính hãng'),
    summary: firstP.slice(0, 220),
    focusKeyword: keywordHint,
    metaTitle: (titleHint || 'Đánh giá xe Hyundai').slice(0, 60),
    metaDescription: firstP.slice(0, 155),
    suggestedKeywords: [keywordHint],
    blocks: finalBlocks,
  };
}

// 🧠 Mental Model: Router API Trợ Lý AI Viết Bài & Tối Ưu SEO (@cardealer/api)
// Chiến lược "Cyborg Content Engine & Hybrid Composition":
// Kết hợp:
// 1. OpenAI Structured Outputs (JSON Schema / json_object) với Token Limit mở rộng (6000-8000).
// 2. Hybrid Composition: Tự động bổ sung thông số, hình ảnh, giá xe thật từ database đại lý vào các Block AI.
// 3. Pipeline 2 bước: Hỗ trợ sinh từ Dàn ý chi tiết hoặc Viết trọn gói A-Z.
export async function handleAdminAiRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;

  // POST /api/admin/ai/generate
  if (pathname !== '/api/admin/ai/generate' || req.method !== 'POST') {
    return false;
  }

  // 1. Kiểm tra quyền hạn quản trị viên
  const auth = await authenticateAdmin(req);
  if (auth.error) {
    sendJson(auth.error.statusCode, { success: false, error: auth.error });
    return true;
  }
  if (!checkPermission(auth.user!.role, 'posts:write')) {
    sendJson(403, {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Bạn không có quyền sử dụng tính năng Trợ lý AI viết bài.',
      },
    });
    return true;
  }

  try {
    const rawBody = await readBody();
    const parseResult = AiGenerateRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues?.[0]?.message || 'Dữ liệu yêu cầu AI không hợp lệ';
      sendJson(400, {
        success: false,
        error: {
          code: 'INVALID_AI_REQUEST',
          message: firstIssue,
        },
      });
      return true;
    }

    const { action, prompt, context, keyword, carModel, location, availableCars, maxTokens } = parseResult.data;

    // Nạp API Key và Model từ database site_settings
    const siteSettingsRow = await db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, 'site_settings'),
    });

    const siteSettings = siteSettingsRow ? SiteSettingsSchema.parse(siteSettingsRow.data) : SiteSettingsSchema.parse({});
    const apiKey = siteSettings.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
    const model = siteSettings.openaiModel?.trim() || 'gpt-4o-mini';

    if (!apiKey) {
      sendJson(400, {
        success: false,
        error: {
          code: 'OPENAI_API_KEY_MISSING',
          message: 'Chưa cấu hình OpenAI API Key trong Cài đặt Hệ thống. Vui lòng vào Cài đặt -> SEO & Tracking -> OpenAI API Key để nhập key.',
        },
      });
      return true;
    }

    // 2. Chuẩn bị prompt theo từng hành động
    const targetLocation = location || 'Nghệ An & Hà Tĩnh';
    const targetCar = carModel || 'Xe ô tô Hyundai';
    const targetKeyword = keyword || prompt;

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

    const systemPrompt = `Bạn là Giám đốc Sáng tạo Nội dung kiêm Chuyên gia Technical SEO & CRO hàng đầu trong ngành ô tô tại Việt Nam, am hiểu sâu sắc hệ thống đại lý ô tô Hyundai ủy quyền chính hãng.

Nguyên tắc cốt lõi của bạn tuân thủ triệt để chiến lược "Cyborg Content" & Google E-E-A-T trong ngành YMYL:
1. Độ chính xác kỹ thuật: Kích thước, động cơ Smartstream, hộp số IVT/DCT, gói an toàn chủ động Hyundai SmartSense (FCA, LKA, BCA, SCC...).
2. Bám sát thị trường địa phương (${targetLocation}): Dự toán giá bán niêm yết, chi phí lăn bánh, thủ tục trả góp ngân hàng địa phương và bấm biển số.
3. QUYẾT ĐỊNH & PHÂN BỔ 14 CONTENT BLOCK TINH HOA:
   - paragraph: Đoạn văn phân tích chuyên sâu, cô đọng (2-4 câu/đoạn).
   - heading: Thẻ tiêu đề H2, H3 chuẩn SEO phân cấp rõ ràng.
   - singleImage: Vị trí chèn ảnh trực quan kèm imageAlt chuẩn SEO và caption chú thích rõ ràng.
   - specTable: Bảng so sánh thông số kỹ thuật chi tiết giữa các phiên bản gồm title, specVersions, specRows.
   - priceTable: Bảng dự toán giá xe niêm yết và lăn bánh tạm tính gồm title, carSlug, prices.
   - relatedCar: Khối gợi ý dòng xe liên quan trong showroom gồm carName, carSlug, carPrice, carImage, seatCount, fuelType.
   - prosCons: Đánh giá khách quan 3-4 Ưu điểm nổi bật và 1-2 Điểm cần lưu ý thực tế.
   - callout: Hộp thông tin tư vấn vay trả góp hoặc ưu đãi đại lý.
   - youtube: Video trải nghiệm lái thử / đánh giá thực tế (videoId mẫu hoặc ID thực tế, title, caption).
   - leadForm: Khối Form đăng ký nhận báo giá lăn bánh & lái thử tận nhà.
   - faq: 3-5 câu hỏi thường gặp giải đáp cặn kẽ chuẩn Schema FAQPage.
   - ctaButton: Nút bấm chuyển đổi cao Hotline/Zalo/Báo giá.
4. Ngôn từ: Chuyên nghiệp, tận tâm, trung thực, thôi thúc người đọc liên hệ lái thử và nhận báo giá.
5. TUYỆT ĐỐI CẤM văn phong AI sáo rỗng rập khuôn.
6. BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON HỢP LỆ THEO YÊU CẦU.`;

    let userPrompt = '';
    let responseFormat: Record<string, unknown> | undefined = undefined;
    let defaultTokenLimit = 2000;

    switch (action) {
      case 'generate_full_article':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 6000;
        userPrompt = `Hãy viết một BÀI VIẾT HOÀN CHỈNH TỪ A-Z CHUẨN SEO & CHUYÊN SÂU về chủ đề: "${prompt}".

Thông tin trọng tâm:
- Dòng xe: ${targetCar}
- Khu vực / Tỉnh thành: ${targetLocation}
- Từ khóa chính (Focus Keyword): ${targetKeyword}
${context ? `- Ngữ cảnh bổ sung / Dàn ý biên tập viên cung cấp:\n${context}\n` : ''}
${availableCarsListText}

YÊU CẦU BÀI VIẾT HOÀN CHỈNH TỰ ĐỘNG PHỐI HỢP CÁC CONTENT BLOCK TINH HOA:
1. Title: Tiêu đề bài viết cuốn hút, chứa từ khóa chính + năm (2026) + địa danh (${targetLocation}).
2. Summary: Tóm tắt 2-3 câu ngắn gọn, kích thích người xem đọc tiếp.
3. SEO Meta:
   - metaTitle (≤ 60 ký tự, chứa từ khóa chính ở đầu, chuẩn Google Search)
   - metaDescription (120-155 ký tự, có từ khóa + lời kêu gọi hành động CTA)
   - suggestedKeywords: 5-8 từ khóa LSI liên quan.
4. Content Blocks: Tự động sắp xếp các khối nội dung theo thứ tự logic:
   - Mở bài (paragraph)
   - Thẻ H2: Giá xe ${targetCar} niêm yết & Dự toán lăn bánh tại ${targetLocation}
   - Khối Đoạn văn phân tích giá hoặc Khối Bảng giá (priceTable)
   - Thẻ H2: Đánh giá Ngoại thất
   - Đoạn văn (paragraph) & Khối Hình ảnh (singleImage)
   - Thẻ H2: Không gian Nội thất & Tiện nghi
   - Đoạn văn (paragraph) & Khối Hình ảnh (singleImage)
   - Thẻ H2: Bảng thông số kỹ thuật chi tiết
   - Khối Bảng so sánh thông số (specTable)
   - Thẻ H2: Vận hành & Cảm giác lái
   - Đoạn văn (paragraph)
   - Thẻ H2: An toàn thông minh Hyundai SmartSense
   - Đoạn văn (paragraph)
   - Khối Video YouTube (youtube)
   - Khối Callout (callout): Hướng dẫn trả góp
   - Khối Xe liên quan (relatedCar): Chọn 1 xe tương đồng từ kho đại lý
   - Khối Ưu nhược điểm (prosCons)
   - Khối Lead Form (leadForm): Form đăng ký nhận giá lăn bánh
   - Khối FAQ (faq): 3-5 câu hỏi thường gặp
   - Khối CTA (ctaButton): Nút bấm Hotline/Zalo

TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON:
{
  "title": "Tiêu đề bài viết đầy đủ",
  "summary": "Đoạn tóm tắt mở đầu 2-3 câu",
  "focusKeyword": "${targetKeyword}",
  "metaTitle": "Tiêu đề SEO ngắn gọn dưới 60 ký tự",
  "metaDescription": "Mô tả SEO chuẩn 120-155 ký tự có CTA",
  "suggestedKeywords": ["từ khóa lsi 1", "từ khóa lsi 2", "từ khóa lsi 3", "từ khóa lsi 4", "từ khóa lsi 5"],
  "blocks": [
    { "type": "paragraph", "content": "Nội dung mở bài..." },
    { "type": "heading", "level": 2, "content": "1. Giá xe... niêm yết và lăn bánh tại ${targetLocation}" },
    { "type": "paragraph", "content": "Phân tích giá bán..." },
    { "type": "heading", "level": 2, "content": "2. Đánh giá Ngoại thất: Hiện đại và bề thế" },
    { "type": "singleImage", "imageUrl": "", "imageAlt": "Hình ảnh ngoại thất xe...", "caption": "Chi tiết thiết kế ngoại thất xe..." },
    { "type": "paragraph", "content": "Chi tiết ngoại thất..." },
    { "type": "heading", "level": 2, "content": "3. Không gian Nội thất & Tiện nghi hàng đầu" },
    { "type": "singleImage", "imageUrl": "", "imageAlt": "Hình ảnh khoang lái nội thất xe...", "caption": "Khoang lái hiện đại với màn hình kép..." },
    { "type": "paragraph", "content": "Chi tiết nội thất..." },
    { "type": "heading", "level": 2, "content": "4. Bảng thông số kỹ thuật chi tiết" },
    {
      "type": "specTable",
      "title": "Bảng so sánh thông số kỹ thuật chi tiết",
      "specVersions": ["Bản Tiêu Chuẩn", "Bản Đặc Biệt", "Bản Cao Cấp"],
      "specRows": [
        { "specName": "Kích thước DxRxC (mm)", "values": ["4.535 x 1.765 x 1.485", "4.535 x 1.765 x 1.485", "4.535 x 1.765 x 1.485"] },
        { "specName": "Động cơ", "values": ["Smartstream G1.5", "Smartstream G1.5", "Smartstream G1.5"] },
        { "specName": "Công suất cực đại", "values": ["115 PS", "115 PS", "115 PS"] },
        { "specName": "Hộp số", "values": ["6MT", "IVT", "IVT"] },
        { "specName": "Hyundai SmartSense", "values": ["Không", "Cơ bản", "Đầy đủ"] }
      ]
    },
    { "type": "heading", "level": 2, "content": "5. Khả năng vận hành & Cảm giác lái thực tế" },
    { "type": "paragraph", "content": "Nội dung vận hành..." },
    { "type": "heading", "level": 2, "content": "6. Trang bị An toàn thông minh" },
    { "type": "paragraph", "content": "Nội dung an toàn..." },
    {
      "type": "youtube",
      "videoId": "dQw4w9WgXcQ",
      "title": "Video đánh giá thực tế và trải nghiệm lái xe",
      "caption": "Trải nghiệm chi tiết cảm giác lái và tiện nghi trên đường thực tế"
    },
    {
      "type": "callout",
      "calloutType": "info",
      "title": "Chính sách hỗ trợ mua xe trả góp tại ${targetLocation}",
      "content": "Hỗ trợ vay đến 85% giá trị xe, duyệt hồ sơ trong 24h..."
    },
    {
      "type": "relatedCar",
      "carName": "Tên dòng xe cùng hãng",
      "carSlug": "slug-dong-xe",
      "carPrice": 500000000,
      "carImage": "",
      "seatCount": 5,
      "fuelType": "Xăng"
    },
    {
      "type": "prosCons",
      "title": "Đánh giá Ưu điểm & Nhược điểm thực tế",
      "pros": ["Ưu điểm 1", "Ưu điểm 2", "Ưu điểm 3"],
      "cons": ["Điểm lưu ý 1", "Điểm lưu ý 2"]
    },
    {
      "type": "leadForm",
      "formHeadline": "Đăng Ký Nhận Báo Giá Lăn Bánh & Lái Thử Tận Nhà",
      "formSubheadline": "Nhận ngay bảng dự toán chi phí lăn bánh chính xác và quà tặng phụ kiện độc quyền trong 5 phút.",
      "formButtonText": "Nhận Báo Giá & Ưu Đãi Ngay",
      "carName": "${targetCar}"
    },
    {
      "type": "faq",
      "title": "Câu Hỏi Thường Gặp (FAQ)",
      "faqs": [
        { "question": "Giá lăn bánh tại ${targetLocation} gồm những chi phí gì?", "answer": "Bao gồm giá bán sau ưu đãi, thuế trước bạ, phí đăng ký biển số, phí đăng kiểm, bảo hiểm..." },
        { "question": "Hồ sơ vay mua xe trả góp cần chuẩn bị những gì?", "answer": "Khách hàng cá nhân chỉ cần CCCD gắn chip, giấy xác nhận tình trạng hôn nhân và chứng minh thu nhập..." },
        { "question": "Chính sách bảo hành chính hãng là bao lâu?", "answer": "Xe được áp dụng chính sách bảo hành 5 năm hoặc 100.000 km tùy điều kiện nào đến trước..." }
      ]
    },
    {
      "type": "ctaButton",
      "ctaButtonText": "Gọi Hotline Nhận Giá Lăn Bánh & Lái Thử Ngay",
      "ctaActionType": "hotline",
      "ctaSubtext": "Tư vấn 24/7 - Hỗ trợ đăng ký lái thử tận nhà tại ${targetLocation}",
      "ctaVariant": "red"
    }
  ]
}`;
        break;

      case 'generate_outline':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 2500;
        userPrompt = `Hãy tạo một dàn ý bài viết chuẩn SEO chi tiết, sâu sắc cho chủ đề: "${prompt}".
Dòng xe: ${targetCar}
Địa phương / Tỉnh thành: ${targetLocation}
Từ khóa chính: ${targetKeyword}
${availableCarsListText}
${context ? `Nội dung ngữ cảnh hiện có:\n${context}\n` : ''}

Yêu cầu gợi ý từng mục bài viết kèm theo suggestedBlockType (heading, paragraph, specTable, priceTable, relatedCar, singleImage, youtube, callout, prosCons, leadForm, faq, ctaButton) để người viết dễ dàng chèn khối nội dung.

Yêu cầu trả về JSON có cấu trúc:
{
  "outline": [
    { "level": 2, "title": "Tiêu đề H2", "description": "Tóm tắt ngắn những ý đắt giá cần triển khai trong mục này", "points": ["Luận điểm 1", "Luận điểm 2"], "suggestedBlockType": "priceTable" },
    { "level": 3, "title": "Tiêu đề H3", "description": "Chi tiết nhỏ hơn nếu có", "points": ["Chi tiết 1"], "suggestedBlockType": "singleImage" }
  ]
}
Số lượng mục: 6-10 mục chuẩn cấu trúc E-E-A-T.`;
        break;

      case 'continue_writing':
      case 'expand_section':
        defaultTokenLimit = 2500;
        userPrompt = `Hãy viết tiếp hoặc mở rộng phần nội dung cho bài viết về xe ô tô theo yêu cầu sau:
Chủ đề / Yêu cầu cụ thể: ${prompt}
Dòng xe: ${targetCar}
Địa phương / Thị trường: ${targetLocation}
${targetKeyword ? `Từ khóa SEO cần lồng ghép tự nhiên: ${targetKeyword}` : ''}
${context ? `Đoạn văn hoặc bối cảnh liền trước:\n${context}` : ''}

Yêu cầu chất lượng:
- Viết 2-4 đoạn văn giàu chiều sâu chuyên môn, nêu bật các thông số kỹ thuật thực tế và trải nghiệm lái xe tại Việt Nam.
- Lồng ghép tự nhiên các điểm cộng về bảo hành, tiết kiệm nhiên liệu, độ bền bỉ.
- TRẢ VỀ ĐỊNH DẠNG VĂN BẢN THUẦN HOẶC HTML ĐƠN GIẢN (dùng <p>, <strong> cho điểm nhấn, <ul><li> cho danh sách). KHÔNG bọc trong block code \`\`\`html.`;
        break;

      case 'optimize_seo':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 1500;
        userPrompt = `Hãy phân tích và viết lại gói giải pháp SEO On-Page hoàn hảo nhất cho bài viết:
Chủ đề / Tiêu đề hiện tại: "${prompt}"
Dòng xe: ${targetCar}
Khu vực: ${targetLocation}
Từ khóa trọng tâm: ${targetKeyword}
${context ? `Tóm tắt nội dung bài viết:\n${context.slice(0, 1000)}` : ''}

Yêu cầu trả về JSON:
{
  "metaTitle": "Tiêu đề SEO cuốn hút, chứa từ khóa chính ở đầu, dưới 60 ký tự, có tên đại lý/địa phương",
  "metaDescription": "Mô tả SEO chuẩn kích thước 120-155 ký tự, chứa từ khóa chính + từ khóa phụ + lời kêu gọi hành động CTA rõ ràng",
  "suggestedSlug": "duong-dan-chuan-seo-viet-thuong-khong-dau-cach-nhau-bang-dau-gach-ngang",
  "suggestedKeywords": ["từ khóa lsi 1", "từ khóa liên quan 2", "từ khóa dài 3", "từ khóa hỏi đáp 4", "từ khóa địa phương 5"]
}`;
        break;

      case 'generate_faqs':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 2000;
        userPrompt = `Hãy tạo 3 đến 5 câu hỏi và câu trả lời thường gặp (FAQ) thực tế nhất mà người mua xe hay tìm kiếm về chủ đề: "${prompt}".
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
        break;

      default:
        sendJson(400, {
          success: false,
          error: {
            code: 'UNSUPPORTED_ACTION',
            message: `Hành động AI '${action}' không được hỗ trợ.`,
          },
        });
        return true;
    }

    // 3. Chuẩn hóa tham số gọi OpenAI API
    const isReasoningModel =
      model.startsWith('o1') ||
      model.startsWith('o3') ||
      model.startsWith('o4') ||
      model.includes('reasoning');

    const systemRole = isReasoningModel ? 'developer' : 'system';

    const buildPayload = (includeTemperature = true) => {
      const payload: Record<string, unknown> = {
        model: model || 'gpt-4o-mini',
        messages: [
          { role: systemRole, content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_completion_tokens: maxTokens || defaultTokenLimit,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      };

      if (!isReasoningModel && includeTemperature) {
        payload.temperature = 0.7;
      }
      return payload;
    };

    // Gửi request tới OpenAI API endpoint
    let openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}` as string,
      },
      body: JSON.stringify(buildPayload(true)),
    });

    // Nếu lỗi liên quan đến temperature hoặc response_format không được hỗ trợ, thử lại tự động
    if (!openaiRes.ok) {
      const firstErrText = await openaiRes.text();
      if (
        firstErrText.includes('temperature') ||
        firstErrText.includes('unsupported_parameter') ||
        firstErrText.includes('response_format')
      ) {
        openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}` as string,
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [
              { role: systemRole, content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_completion_tokens: maxTokens || defaultTokenLimit,
          }),
        });
      } else {
        let errJson: any;
        try {
          errJson = JSON.parse(firstErrText);
        } catch {
          errJson = null;
        }
        const openAiErrMsg = errJson?.error?.message || `OpenAI API Error (${openaiRes.status}): ${firstErrText.slice(0, 200)}`;
        sendJson(502, {
          success: false,
          error: {
            code: 'OPENAI_API_ERROR',
            message: openAiErrMsg,
          },
        });
        return true;
      }
    }

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      let errJson: any;
      try {
        errJson = JSON.parse(errText);
      } catch {
        errJson = null;
      }
      const openAiErrMsg = errJson?.error?.message || `OpenAI API Error (${openaiRes.status}): ${errText.slice(0, 200)}`;
      sendJson(502, {
        success: false,
        error: {
          code: 'OPENAI_API_ERROR',
          message: openAiErrMsg,
        },
      });
      return true;
    }

    const openaiData = (await openaiRes.json()) as any;
    const aiContent = openaiData.choices?.[0]?.message?.content || '';

    if (!aiContent.trim()) {
      sendJson(500, {
        success: false,
        error: {
          code: 'EMPTY_AI_RESPONSE',
          message: 'Mô hình AI không trả về nội dung. Vui lòng thử lại với từ khóa hoặc yêu cầu cụ thể hơn.',
        },
      });
      return true;
    }

    // 4. Xử lý phản hồi trả về
    const resultData: AiGenerateResponseData = {
      action,
      model,
      usage: openaiData.usage
        ? {
            promptTokens: openaiData.usage.prompt_tokens,
            completionTokens: openaiData.usage.completion_tokens,
            totalTokens: openaiData.usage.total_tokens,
          }
        : undefined,
    };

    if (responseFormat) {
      const parsedJson = extractAndParseJson(aiContent);

      if (action === 'generate_full_article') {
        let fullArticleObj: FullArticleResult;
        if (parsedJson && (parsedJson.title || parsedJson.blocks)) {
          fullArticleObj = {
            title: String(parsedJson.title || prompt || 'Bài viết tư vấn mua xe Hyundai'),
            summary: String(parsedJson.summary || ''),
            focusKeyword: String(parsedJson.focusKeyword || targetKeyword),
            metaTitle: String(parsedJson.metaTitle || parsedJson.title || ''),
            metaDescription: String(parsedJson.metaDescription || parsedJson.summary || ''),
            suggestedKeywords: Array.isArray(parsedJson.suggestedKeywords) ? parsedJson.suggestedKeywords : [targetKeyword],
            blocks: Array.isArray(parsedJson.blocks) && parsedJson.blocks.length > 0 ? parsedJson.blocks : [{ type: 'paragraph', content: aiContent }],
          };
        } else {
          fullArticleObj = fallbackTextToFullArticle(aiContent, prompt, targetKeyword);
        }

        // 🌟 Hybrid Composition Engine: Tự động ghép dữ liệu kho xe thật vào các khối AI nếu có
        if (availableCars && availableCars.length > 0 && Array.isArray(fullArticleObj.blocks)) {
          fullArticleObj.blocks = fullArticleObj.blocks.map((blk) => {
            // Tự động làm giàu khối relatedCar
            if (blk.type === 'relatedCar') {
              const matched = availableCars.find(
                (c) =>
                  (blk.carSlug && c.slug === blk.carSlug) ||
                  (blk.carName && c.tenXe.toLowerCase().includes(blk.carName.toLowerCase()))
              ) || availableCars[0];

              return {
                ...blk,
                carName: matched?.tenXe || blk.carName || 'Hyundai Accent',
                carSlug: matched?.slug || blk.carSlug || 'hyundai-accent',
                carPrice: matched?.minPrice || matched?.giaNiemYetTu || blk.carPrice || 439000000,
                carImage: matched?.anhDaiDienUrl || blk.carImage || '',
                seatCount: blk.seatCount || (matched?.seatRange ? parseInt(matched.seatRange) : 5) || 5,
                fuelType: matched?.fuelType || blk.fuelType || 'Xăng',
              };
            }

            // Tự động gán ảnh đại diện xe từ kho vào singleImage nếu trống
            if (blk.type === 'singleImage' && !blk.imageUrl) {
              const matchedCar = availableCars.find((c) =>
                targetCar.toLowerCase().includes(c.tenXe.toLowerCase()) || c.tenXe.toLowerCase().includes(targetCar.toLowerCase())
              );
              if (matchedCar?.anhDaiDienUrl) {
                return { ...blk, imageUrl: matchedCar.anhDaiDienUrl };
              }
            }

            return blk;
          });
        }

        resultData.fullArticle = fullArticleObj;
        resultData.seo = {
          metaTitle: fullArticleObj.metaTitle,
          metaDescription: fullArticleObj.metaDescription,
          suggestedKeywords: fullArticleObj.suggestedKeywords,
        };
        resultData.text = fullArticleObj.summary;
        resultData.rawText = aiContent;
      } else if (action === 'generate_outline') {
        if (parsedJson && Array.isArray(parsedJson.outline)) {
          resultData.outline = parsedJson.outline as OutlineItem[];
        } else {
          const lines = aiContent.split('\n').filter((l: string) => l.trim().startsWith('#') || l.trim().startsWith('-'));
          resultData.outline = lines.map((l: string) => ({
            level: l.startsWith('###') ? 3 : 2,
            title: l.replace(/^#+\s*/, '').replace(/^-\s*/, ''),
          }));
        }
      } else if (action === 'generate_faqs') {
        if (parsedJson && Array.isArray(parsedJson.faqs)) {
          resultData.faqs = parsedJson.faqs as FaqItem[];
        } else {
          resultData.faqs = [
            { question: `Giá lăn bánh ${targetCar} tại ${targetLocation} là bao nhiêu?`, answer: `Giá lăn bánh bao gồm giá niêm yết sau ưu đãi, thuế trước bạ, phí cấp biển số và các khoản bảo hiểm.` },
            { question: `Mua xe ${targetCar} trả góp cần chuẩn bị những gì?`, answer: `Chỉ cần CCCD gắn chip và chứng minh thu nhập cơ bản, ngân hàng liên kết hỗ trợ duyệt hồ sơ nhanh trong 24 giờ.` },
          ];
        }
      } else if (action === 'optimize_seo') {
        if (parsedJson) {
          resultData.seo = {
            metaTitle: String(parsedJson.metaTitle || ''),
            metaDescription: String(parsedJson.metaDescription || ''),
            suggestedKeywords: Array.isArray(parsedJson.suggestedKeywords) ? parsedJson.suggestedKeywords : [],
          } as SeoOptimizationResult;
        }
      } else {
        resultData.text = aiContent;
        resultData.rawText = aiContent;
      }
    } else {
      resultData.text = aiContent.trim();
      resultData.rawText = aiContent;
    }

    sendJson(200, {
      success: true,
      data: resultData,
    });
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định khi xử lý trợ lý AI';
    sendJson(500, {
      success: false,
      error: {
        code: 'INTERNAL_AI_ERROR',
        message: errorMsg,
      },
    });
    return true;
  }
}
