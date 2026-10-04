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

// 🧠 Mental Model: Router API Trợ Lý AI Viết Bài & Tối Ưu SEO (@cardealer/api)
// Chiến lược "Cyborg Content Engine": Kết hợp dữ liệu kỹ thuật chuẩn xác, văn phong tư vấn thực tế tại đại lý và tối ưu SEO On-Page hàng đầu.
// Hỗ trợ:
// 1. Viết toàn bộ bài viết hoàn chỉnh từ A-Z (Full Article + Blocks + SEO Meta + FAQs + Pros/Cons + CTA)
// 2. Tạo dàn ý chuẩn phân cấp H2/H3
// 3. Viết tiếp / mở rộng đoạn văn chuyên sâu
// 4. Tối ưu 1-Click SEO (Meta Title, Meta Description, từ khóa LSI)
// 5. Tự động sinh khối FAQ chuẩn Schema FAQPage cho Local SEO & YMYL
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

    const { action, prompt, context, keyword, carModel, location, maxTokens } = parseResult.data;

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

    const systemPrompt = `Bạn là Giám đốc Sáng tạo Nội dung kiêm Chuyên gia Technical SEO hàng đầu trong ngành ô tô tại Việt Nam, đặc biệt là hệ thống đại lý Hyundai ủy quyền chính hãng (như Hyundai Vinh, Hyundai Nghệ An).

Nguyên tắc cốt lõi của bạn tuân thủ triệt để chiến lược "Cyborg Content (Người lai Máy)" & Google E-E-A-T (Kinh nghiệm, Chuyên môn, Thẩm quyền, Tin cậy) trong ngành YMYL:
1. Độ chính xác kỹ thuật: Thông số kích thước (DxRxC, chiều dài cơ sở, khoảng sáng gầm), động cơ (Smartstream, MPI, T-GDi, dung tích xi lanh, mã lực, mô-men xoắn), hộp số (IVT, ly hợp kép DCT, số tự động), gói an toàn chủ động (Hyundai SmartSense: FCA, LKA, BCA, SCC...).
2. Bám sát thị trường địa phương (${targetLocation}): Dự toán giá bán niêm yết, chi phí lăn bánh (thuế trước bạ, phí cấp biển, đăng kiểm), các cung đường thực tế (đô thị, ngập nước mùa mưa, cao tốc Bắc Nam, đường đồi núi), tư vấn thủ tục trả góp ngân hàng địa phương và bấm biển số.
3. Cấu trúc chuẩn SEO On-Page:
   - Phân cấp thẻ Heading (H2, H3) mạch lạc, giải quyết triệt để Search Intent của người mua xe.
   - Lồng ghép từ khóa chính và từ khóa ngữ nghĩa LSI tự nhiên, tránh hoàn toàn lỗi nhồi nhét từ khóa (Keyword Stuffing).
   - Đoạn văn cô đọng (2-4 câu/đoạn), sử dụng gạch đầu dòng và nhấn mạnh bằng chữ in đậm các thông số cốt lõi.
4. Ngôn từ & Văn phong: Văn phong của chuyên viên tư vấn bán hàng tận tâm, trung thực, truyền cảm hứng và thôi thúc người đọc liên hệ lái thử / nhận báo giá.
5. TUYỆT ĐỐI CẤM văn phong AI rập khuôn: Cấm dùng các cụm từ sáo rỗng như "Trong bối cảnh hiện nay", "Nhìn chung", "Không thể phủ nhận", "Tóm lại là", "Có thể nói rằng", "Đáng chú ý là", "Hãy cùng chúng tôi tìm hiểu", "Hy vọng bài viết này sẽ đem lại". Hãy viết trực diện, mở đầu ấn tượng, thông tin đắt giá.
6. Khi có yêu cầu JSON, BẮT BUỘC trả về đúng định dạng JSON hợp lệ, không thừa ký tự ngoài.`;

    let userPrompt = '';
    let responseFormat: { type: 'json_object' } | undefined = undefined;
    let defaultTokenLimit = 2000;

    switch (action) {
      case 'generate_full_article':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 4000;
        userPrompt = `Hãy viết một BÀI VIẾT HOÀN CHỈNH TỪ A-Z CHUẨN SEO CHUYÊN SÂU về chủ đề: "${prompt}".

Thông tin trọng tâm:
- Dòng xe: ${targetCar}
- Khu vực / Tỉnh thành: ${targetLocation}
- Từ khóa chính (Focus Keyword): ${targetKeyword}
${context ? `- Ngữ cảnh bổ sung / Ghi chú của biên tập viên:\n${context}\n` : ''}

YÊU CẦU BÀI VIẾT HOÀN CHỈNH BAO GỒM:
1. Title: Tiêu đề bài viết cuốn hút, chứa từ khóa chính + năm (2026) + địa danh (${targetLocation}).
2. Summary: Tóm tắt 2-3 câu ngắn gọn, kích thích người xem đọc tiếp.
3. SEO Meta:
   - metaTitle (≤ 60 ký tự, chuẩn Google Search)
   - metaDescription (120-155 ký tự, có lời kêu gọi hành động)
   - suggestedKeywords: 5-8 từ khóa LSI liên quan chặt chẽ đến giá lăn bánh, trả góp, thông số, so sánh.
4. Content Blocks (Cấu trúc bài viết gồm chuỗi các khối nội dung):
   - Mở bài (paragraph): Đặt vấn đề, vị thế của xe trong phân khúc, các nâng cấp đáng giá nhất.
   - Thẻ H2: Bảng giá niêm yết & Dự toán giá lăn bánh mới nhất tại ${targetLocation}.
   - Đoạn văn (paragraph): Phân tích giá bán từng phiên bản, ưu đãi tiền mặt và quà tặng phụ kiện chính hãng của đại lý.
   - Thẻ H2: Đánh giá Ngoại thất - Ngôn ngữ thiết kế đột phá & Kích thước vượt trội.
   - Đoạn văn (paragraph): Chi tiết đầu xe, cụm đèn LED, mâm xe, khoảng sáng gầm thích ứng đường xá địa phương.
   - Thẻ H2: Không gian Nội thất & Tiện nghi công nghệ cao cấp.
   - Đoạn văn (paragraph): Bố cục khoang lái, màn hình giải trí kép, điều hòa, độ ngả hàng ghế sau và thể tích cốp.
   - Thẻ H2: Động cơ Smartstream, Cảm giác lái & Khả năng tiết kiệm nhiên liệu.
   - Đoạn văn (paragraph): Trải nghiệm chân ga, độ êm ái khung gầm, mức tiêu thụ xăng thực tế (lít/100km).
   - Thẻ H2: Trang bị An toàn thông minh vượt trội (Hyundai SmartSense).
   - Đoạn văn (paragraph): Các tính năng an toàn chủ động bảo vệ gia đình.
   - Khối Callout (calloutType: "info"): Hướng dẫn thủ tục mua xe trả góp (trả trước từ 15-20%, lãi suất ưu đãi, duyệt hồ sơ nhanh tại ${targetLocation}).
   - Khối Pros & Cons (prosCons): 3-4 ưu điểm nổi bật nhất và 1-2 điểm cần lưu ý khách quan.
   - Khối FAQ (faq): 3-5 câu hỏi giải đáp thực tế (hồ sơ trả góp, thủ tục bấm biển tại ${targetLocation}, bảo hành 5 năm).
   - Khối CTA (ctaButton): Kêu gọi đăng ký lái thử tận nhà hoặc liên hệ hotline nhận giá lăn bánh tốt nhất hôm nay.

TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON:
{
  "title": "Tiêu đề bài viết đầy đủ",
  "summary": "Đoạn tóm tắt mở đầu 2-3 câu",
  "focusKeyword": "${targetKeyword}",
  "metaTitle": "Tiêu đề SEO ngắn gọn dưới 60 ký tự",
  "metaDescription": "Mô tả SEO chuẩn 120-155 ký tự",
  "suggestedKeywords": ["từ khóa lsi 1", "từ khóa lsi 2", "từ khóa lsi 3", "từ khóa lsi 4", "từ khóa lsi 5"],
  "blocks": [
    { "type": "paragraph", "content": "Nội dung mở bài..." },
    { "type": "heading", "level": 2, "content": "1. Giá xe... niêm yết và lăn bánh tại..." },
    { "type": "paragraph", "content": "Nội dung chi tiết giá bán..." },
    { "type": "heading", "level": 2, "content": "2. Đánh giá ngoại thất..." },
    { "type": "paragraph", "content": "Nội dung ngoại thất..." },
    { "type": "heading", "level": 2, "content": "3. Thiết kế nội thất & Tiện nghi..." },
    { "type": "paragraph", "content": "Nội dung nội thất..." },
    { "type": "heading", "level": 2, "content": "4. Khả năng vận hành & Động cơ..." },
    { "type": "paragraph", "content": "Nội dung động cơ vận hành..." },
    { "type": "heading", "level": 2, "content": "5. Công nghệ an toàn tiên tiến..." },
    { "type": "paragraph", "content": "Nội dung an toàn..." },
    {
      "type": "callout",
      "calloutType": "info",
      "title": "Chính sách hỗ trợ mua xe trả góp tại ${targetLocation}",
      "content": "Nội dung tư vấn vay vốn, hồ sơ, lãi suất..."
    },
    {
      "type": "prosCons",
      "title": "Đánh giá Ưu điểm & Nhược điểm thực tế",
      "pros": ["Ưu điểm 1", "Ưu điểm 2", "Ưu điểm 3"],
      "cons": ["Điểm lưu ý 1", "Điểm lưu ý 2"]
    },
    {
      "type": "faq",
      "title": "Câu Hỏi Thường Gặp (FAQ)",
      "faqs": [
        { "question": "Câu hỏi 1?", "answer": "Câu trả lời 1..." },
        { "question": "Câu hỏi 2?", "answer": "Câu trả lời 2..." },
        { "question": "Câu hỏi 3?", "answer": "Câu trả lời 3..." }
      ]
    },
    {
      "type": "ctaButton",
      "ctaButtonText": "Nhận Báo Giá Lăn Bánh & Lái Thử",
      "ctaActionType": "hotline",
      "ctaSubtext": "Hỗ trợ 24/7 - Giao xe tận nhà tại ${targetLocation}"
    }
  ]
}`;
        break;

      case 'generate_outline':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 2000;
        userPrompt = `Hãy tạo một dàn ý bài viết chuẩn SEO chi tiết, sâu sắc cho chủ đề: "${prompt}".
Dòng xe: ${targetCar}
Địa phương / Tỉnh thành: ${targetLocation}
Từ khóa chính: ${targetKeyword}

${context ? `Nội dung ngữ cảnh hiện có:\n${context}\n` : ''}

Yêu cầu trả về JSON có cấu trúc:
{
  "outline": [
    { "level": 2, "title": "Tiêu đề H2", "description": "Tóm tắt ngắn những ý đắt giá cần triển khai trong mục này", "points": ["Luận điểm 1", "Luận điểm 2"] },
    { "level": 3, "title": "Tiêu đề H3", "description": "Chi tiết nhỏ hơn nếu có", "points": ["Chi tiết 1"] }
  ]
}
Số lượng mục: 6-9 mục chuẩn cấu trúc E-E-A-T (Giá bán lăn bánh, Ngoại thất, Nội thất, Vận hành, An toàn SmartSense, So sánh / Trải nghiệm thực tế, FAQ và Lời kết CTA).`;
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
- TRẢ VỀ ĐỊNH DẠNG VĂN BẢN THUẦN HOẶC HTML ĐƠN GIẢN (dùng <p>, <strong> cho điểm nhấn, <ul><li> cho danh sách). KHÔNG bọc trong block code \`\`\`html. Viết trực diện, hấp dẫn.`;
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
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(buildPayload(true)),
    });

    // Nếu lỗi liên quan đến temperature không được hỗ trợ ở model tùy chỉnh, thử lại tự động không kèm temperature
    if (!openaiRes.ok) {
      const firstErrText = await openaiRes.text();
      if (firstErrText.includes('temperature') || firstErrText.includes('unsupported_parameter')) {
        openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(buildPayload(false)),
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

    if (responseFormat?.type === 'json_object') {
      try {
        const parsedJson = JSON.parse(aiContent);
        if (action === 'generate_full_article') {
          resultData.fullArticle = {
            title: String(parsedJson.title || ''),
            summary: String(parsedJson.summary || ''),
            focusKeyword: String(parsedJson.focusKeyword || targetKeyword),
            metaTitle: String(parsedJson.metaTitle || ''),
            metaDescription: String(parsedJson.metaDescription || ''),
            suggestedKeywords: Array.isArray(parsedJson.suggestedKeywords) ? parsedJson.suggestedKeywords : [],
            blocks: Array.isArray(parsedJson.blocks) ? parsedJson.blocks : [],
          };
          resultData.seo = {
            metaTitle: String(parsedJson.metaTitle || ''),
            metaDescription: String(parsedJson.metaDescription || ''),
            suggestedKeywords: Array.isArray(parsedJson.suggestedKeywords) ? parsedJson.suggestedKeywords : [],
          };
          resultData.text = parsedJson.summary || '';
          resultData.rawText = aiContent;
        } else if (action === 'generate_outline' && Array.isArray(parsedJson.outline)) {
          resultData.outline = parsedJson.outline as OutlineItem[];
        } else if (action === 'generate_faqs' && Array.isArray(parsedJson.faqs)) {
          resultData.faqs = parsedJson.faqs as FaqItem[];
        } else if (action === 'optimize_seo') {
          resultData.seo = {
            metaTitle: String(parsedJson.metaTitle || ''),
            metaDescription: String(parsedJson.metaDescription || ''),
            suggestedKeywords: Array.isArray(parsedJson.suggestedKeywords) ? parsedJson.suggestedKeywords : [],
          } as SeoOptimizationResult;
        } else {
          resultData.text = aiContent;
          resultData.rawText = aiContent;
        }
      } catch (jsonErr) {
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
