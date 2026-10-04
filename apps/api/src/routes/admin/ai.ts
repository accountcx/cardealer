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
} from '@cardealer/types';

// 🧠 Mental Model: Router API Trợ Lý AI Viết Bài (@cardealer/api)
// Hỗ trợ Admin sinh dàn ý, viết tiếp nội dung, tối ưu SEO On-Page và tự động tạo khối FAQ.
// API Key và Model được nạp động từ database `site_settings` (hoặc fallback biến môi trường OPENAI_API_KEY).
// Sử dụng `max_completion_tokens` chuẩn OpenAI API mới nhất cho toàn bộ các model (GPT-4o, GPT-5, GPT-6, o1, o3-mini...).

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
    const systemPrompt = `Bạn là một chuyên gia nội dung & Technical SEO hàng đầu trong ngành kinh doanh xe ô tô tại Việt Nam (đặc biệt là xe Hyundai).
Nguyên tắc làm việc của bạn tuân thủ chiến lược "Cyborg Content (Người lai Máy)":
- Đảm bảo tính chính xác cao về thông số kỹ thuật xe, tính năng an toàn, vận hành, giá lăn bánh, thủ tục trả góp.
- Nội dung viết tự nhiên, chuẩn văn phong tư vấn chuyên nghiệp, am hiểu thị trường địa phương (${location || 'Việt Nam'}).
- Luôn ưu tiên cấu trúc chuẩn SEO On-page: thẻ heading rõ ràng, từ khóa LSI tự nhiên, thân thiện với thuật toán Google E-E-A-T và YMYL.
- Khi được yêu cầu trả về JSON, PHẢI trả về JSON hợp lệ theo đúng định dạng được chỉ định.`;

    let userPrompt = '';
    let responseFormat: { type: 'json_object' } | undefined = undefined;

    switch (action) {
      case 'generate_outline':
        responseFormat = { type: 'json_object' };
        userPrompt = `Hãy tạo một dàn ý bài viết chuẩn SEO chi tiết cho chủ đề sau: "${prompt}".
Dòng xe: ${carModel || 'Xe ô tô Hyundai'}
Địa phương / Tỉnh thành: ${location || 'Nghệ An'}
Từ khóa chính: ${keyword || 'giá xe, đánh giá xe'}

${context ? `Nội dung ngữ cảnh hiện có:\n${context}\n` : ''}

Yêu cầu trả về JSON có cấu trúc:
{
  "outline": [
    { "level": 2, "title": "Tiêu đề H2", "description": "Tóm tắt ngắn những ý cần triển khai trong mục này" },
    { "level": 3, "title": "Tiêu đề H3", "description": "Chi tiết nhỏ hơn nếu có" }
  ]
}
Số lượng mục: khoảng 5-8 mục chính (H2/H3) bao gồm giới thiệu, giá bán & khuyến mãi, ngoại thất, nội thất, động cơ - an toàn, bảng thông số và câu hỏi thường gặp.`;
        break;

      case 'continue_writing':
      case 'expand_section':
        userPrompt = `Hãy viết tiếp hoặc mở rộng phần nội dung cho bài viết về xe ô tô theo yêu cầu sau:
Yêu cầu cụ thể: ${prompt}
Dòng xe: ${carModel || 'Xe Hyundai'}
Địa phương: ${location || 'Nghệ An'}
${keyword ? `Từ khóa SEO cần lồng ghép tự nhiên: ${keyword}` : ''}
${context ? `Đoạn văn liền trước:\n${context}` : ''}

Viết khoảng 2-4 đoạn văn súc tích, văn phong chuyên nghiệp của chuyên viên tư vấn bán xe, nêu bật các ưu điểm vượt trội và thông số kỹ thuật thực tế. Trả về định dạng text thuần túy (plain text với xuống dòng).`;
        break;

      case 'optimize_seo':
        responseFormat = { type: 'json_object' };
        userPrompt = `Hãy phân tích và viết lại thông tin SEO tối ưu nhất cho bài viết:
Chủ đề / Tiêu đề hiện tại: "${prompt}"
${carModel ? `Dòng xe: ${carModel}` : ''}
${location ? `Khu vực: ${location}` : ''}
${keyword ? `Từ khóa trọng tâm: ${keyword}` : ''}
${context ? `Tóm tắt nội dung bài viết:\n${context.slice(0, 1000)}` : ''}

Yêu cầu trả về JSON:
{
  "metaTitle": "Tiêu đề SEO cuốn hút, chứa từ khóa, dài dưới 60 ký tự, có tên đại lý hoặc địa phương",
  "metaDescription": "Mô tả SEO chuẩn kích thước 120-155 ký tự, có lời kêu gọi hành động (CTA) và chứa từ khóa chính",
  "suggestedKeywords": ["từ khóa lsi 1", "từ khóa liên quan 2", "từ khóa dài 3", "từ khóa 4", "từ khóa 5"]
}`;
        break;

      case 'generate_faqs':
        responseFormat = { type: 'json_object' };
        userPrompt = `Hãy tạo 3 đến 5 câu hỏi và câu trả lời thường gặp (FAQ) khách hàng hay hỏi nhất về chủ đề sau để phục vụ SEO Schema FAQPage:
Chủ đề: "${prompt}"
${carModel ? `Dòng xe: ${carModel}` : ''}
${location ? `Địa phương: ${location}` : ''}

Yêu cầu trả về JSON:
{
  "faqs": [
    {
      "question": "Câu hỏi thực tế mà người mua xe hay tìm kiếm?",
      "answer": "Câu trả lời chi tiết, súc tích, chính xác (khoảng 2-3 câu)."
    }
  ]
}`;
        break;

      default:
        sendJson(400, {
          success: false,
          error: { code: 'UNSUPPORTED_ACTION', message: `Hành động AI '${action}' không được hỗ trợ.` },
        });
        return true;
    }

    // 3. Chuẩn hóa tham số gọi OpenAI API
    // Dùng `max_completion_tokens` cho TẤT CẢ các model thay vì `max_tokens` đã bị deprecate
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
        max_completion_tokens: maxTokens || 2000,
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
        if (action === 'generate_outline' && Array.isArray(parsedJson.outline)) {
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
