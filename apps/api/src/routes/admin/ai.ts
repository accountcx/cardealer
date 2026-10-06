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
  type FullArticleBlock,
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
// Chiến lược "Cyborg Content Engine & Real-Time SEO Alignment":
// 1. Tuyệt đối đáp ứng 10 tiêu chí chấm điểm của ĐỘNG CƠ SEO REAL-TIME (@cardealer/core):
//    - Tiêu đề: 40-65 ký tự, chứa từ khóa chính ở nửa đầu.
//    - URL Slug: chuẩn hóa tiếng Việt không dấu, chứa từ khóa.
//    - Đoạn mở đầu: 100 từ đầu tiên bắt buộc chứa từ khóa chính.
//    - Mật độ từ khóa: Phân bổ tự nhiên 0.3% - 1.2% (long-tail) hoặc 1.0% - 2.5% (short).
//    - Độ dài: >= 600 - 1500 từ chuyên sâu.
//    - Thẻ H2: Ít nhất 2-4 thẻ H2 chứa từ khóa / địa danh (Vinh, Nghệ An, Hà Tĩnh). KHÔNG CÓ H1 trong body.
//    - Thẻ Alt hình ảnh: 100% ảnh có Alt, có ít nhất 1 ảnh chứa từ khóa chính.
//    - Liên kết nội bộ: >= 2 liên kết (relatedCar, priceTable với carSlug, hoặc /xe/slug).
//    - Meta Description: 120-155 ký tự, chứa từ khóa chính + CTA.
//    - Chống ăn thịt từ khóa (Cannibalization Guard): Dùng từ khóa dài (Long-tail) chuyên biệt.
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
    const targetKeyword = keyword || (prompt.length > 5 && prompt.length < 50 ? prompt : `Đánh giá ${targetCar} tại ${targetLocation}`);

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

BÀI VIẾT BẮT BUỘC PHẢI ĐẠT ĐIỂM TỐI ĐA (100/100 ĐIỂM) TRÊN "ĐỘNG CƠ SEO REAL-TIME" CỦA HỆ THỐNG VỚI 10 TIÊU CHÍ VÀNG:
1. TIÊU ĐỀ (Title): Độ dài chuẩn từ 40 đến 65 ký tự. BẮT BUỘC chứa trọn vẹn từ khóa chính (Focus Keyword) ở ngay nửa đầu tiêu đề để tối đa hóa tỷ lệ click CTR.
2. ĐOẠN MỞ ĐẦU (100 từ đầu tiên): Đoạn văn đầu tiên (paragraph mở đầu) BẮT BUỘC phải chứa chính xác từ khóa chính.
3. MẬT ĐỘ TỪ KHÓA (Keyword Density): Phân bổ từ khóa chính tự nhiên xuyên suốt bài viết:
   - Từ khóa dài (>= 3 từ): xuất hiện lặp lại 3 đến 6 lần trong bài viết (mật độ 0.3% - 1.2%).
   - Từ khóa ngắn (< 3 từ): xuất hiện với mật độ vàng 1.0% - 2.5%.
4. ĐỘ DÀI BÀI VIẾT (Word Count): Tổng độ dài bài viết phải đạt từ 800 đến 1500+ từ với phân tích chuyên sâu, giàu giá trị thực tế.
5. CẤU TRÚC HEADING (H2/H3):
   - Có ít nhất 2 đến 4 thẻ H2 (heading level: 2) chứa từ khóa chính hoặc địa danh mục tiêu (Vinh, Nghệ An, Hà Tĩnh).
   - TUYỆT ĐỐI KHÔNG xuất hiện thẻ H1 trong thân bài (vì Tiêu đề bài viết đã là H1 duy nhất).
6. THẺ ALT HÌNH ẢNH (Image Alts):
   - 100% các khối hình ảnh (singleImage, imageGallery) BẮT BUỘC có thuộc tính "imageAlt" mô tả rõ ràng.
   - Có ít nhất 1 hình ảnh có "imageAlt" chứa chính xác từ khóa chính.
7. LIÊN KẾT NỘI BỘ (Internal Links):
   - Chèn ít nhất 2 khối liên kết nội bộ hướng tới xe trong showroom (ví dụ: khối "relatedCar" có carSlug, khối "priceTable" có carSlug, hoặc liên kết nội bộ /xe/[slug]).
8. META DESCRIPTION: Độ dài chuẩn từ 120 đến 155 ký tự. BẮT BUỘC chứa chính xác từ khóa chính và có lời kêu gọi hành động CTA rõ ràng (ví dụ: "Xem ngay báo giá lăn bánh...", "Liên hệ hotline nhận ưu đãi...").
9. META TITLE: Độ dài từ 45 đến 60 ký tự, chứa từ khóa chính ở đầu, chuẩn hiển thị Google Search.
10. CHỐNG ĂN THỊT TỪ KHÓA (Cannibalization Guard): Dùng từ khóa dạng Long-Tail chuyên biệt (kèm địa danh hoặc ý định tìm kiếm cụ thể), tránh đặt từ khóa cộc lốc trùng với tên xe gốc.

PHÂN BỔ LINH HOẠT 14 CONTENT BLOCK TINH HOA:
- paragraph: Đoạn văn phân tích chuyên sâu, mạch lạc (2-4 câu/đoạn).
- heading: Thẻ tiêu đề H2, H3 chuẩn SEO phân cấp rõ ràng.
- singleImage: Khối hình ảnh trực quan kèm imageAlt chuẩn SEO và caption chú thích rõ ràng.
- specTable: Bảng so sánh thông số kỹ thuật chi tiết giữa các phiên bản gồm title, specVersions, specRows.
- priceTable: Bảng dự toán giá xe niêm yết và lăn bánh tạm tính gồm title, carSlug, prices.
- relatedCar: Khối gợi ý dòng xe liên quan trong showroom gồm carName, carSlug, carPrice, carImage, seatCount, fuelType.
- prosCons: Đánh giá khách quan 3-4 Ưu điểm nổi bật và 1-2 Điểm cần lưu ý thực tế.
- callout: Hộp thông tin tư vấn vay trả góp hoặc ưu đãi đại lý.
- youtube: Video trải nghiệm lái thử / đánh giá thực tế (videoId, title, caption).
- leadForm: Khối Form đăng ký nhận báo giá lăn bánh & lái thử tận nhà.
- faq: 3-5 câu hỏi thường gặp giải đáp cặn kẽ chuẩn Schema FAQPage.
- ctaButton: Nút bấm chuyển đổi cao Hotline/Zalo/Báo giá.

Ngôn từ: Chuyên gia ô tô tận tâm, am hiểu kỹ thuật (Smartstream, IVT, SmartSense), kích thích khách hàng lái thử và nhận dự toán lăn bánh.`;

    let userPrompt = '';
    let responseFormat: Record<string, unknown> | undefined = undefined;
    let defaultTokenLimit = 2000;

    switch (action) {
      case 'generate_full_article':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 6500;
        userPrompt = `Hãy viết một BÀI VIẾT HOÀN CHỈNH TỪ A-Z ĐẠT ĐIỂM TUYỆT ĐỐI ĐỘNG CƠ SEO REAL-TIME (100/100 ĐIỂM) về chủ đề: "${prompt}".

Thông tin trọng tâm:
- Dòng xe: ${targetCar}
- Khu vực / Tỉnh thành: ${targetLocation}
- Từ khóa chính mục tiêu (Focus Keyword): ${targetKeyword}
${context ? `- Ngữ cảnh bổ sung / Dàn ý biên tập viên cung cấp:\n${context}\n` : ''}
${availableCarsListText}

CÁC QUY TẮC BẮT BUỘC ĐỂ ĐẠT 100/100 ĐIỂM SEO ON-PAGE:
1. title: Độ dài 45-62 ký tự, chứa trọn vẹn từ khóa "${targetKeyword}" ở ngay nửa đầu tiêu đề.
2. summary: 2-3 câu mở đầu cuốn hút, chứa từ khóa chính.
3. focusKeyword: "${targetKeyword}".
4. metaTitle: Dưới 60 ký tự (45-58 ký tự), bắt đầu bằng từ khóa "${targetKeyword}".
5. metaDescription: Độ dài 125-155 ký tự, chứa chính xác "${targetKeyword}" và câu kêu gọi hành động CTA.
6. suggestedKeywords: 5-8 từ khóa LSI mở rộng.
7. blocks:
   - Khối đầu tiên (paragraph): Mở bài giàu cảm xúc, BẮT BUỘC chứa từ khóa "${targetKeyword}".
   - Thẻ H2 thứ 1 (heading level 2): Chứa từ khóa "${targetKeyword}" hoặc giá lăn bánh tại ${targetLocation}.
   - Khối Bảng giá (priceTable) hoặc Đoạn văn phân tích giá.
   - Thẻ H2 thứ 2 (heading level 2): Đánh giá ngoại thất & trang bị tại ${targetLocation}.
   - Khối Hình ảnh (singleImage) với imageAlt chứa từ khóa "${targetKeyword}".
   - Thẻ H2 thứ 3 (heading level 2): Không gian nội thất & tiện nghi thông minh.
   - Khối Hình ảnh nội thất (singleImage) với imageAlt mô tả chi tiết.
   - Thẻ H2 thứ 4 (heading level 2): Bảng thông số kỹ thuật chi tiết ${targetCar}.
   - Khối Bảng thông số (specTable).
   - Thẻ H2 thứ 5 (heading level 2): Vận hành, động cơ Smartstream & Cảm giác lái.
   - Thẻ H2 thứ 6 (heading level 2): Hệ thống an toàn chủ động Hyundai SmartSense.
   - Khối Video YouTube (youtube).
   - Khối Callout (callout) tùy biến thông tin quan trọng theo đúng chủ đề (VD: Bảo hành 5 năm, Ưu đãi phụ kiện, hoặc Thủ tục tài chính nếu chủ đề là trả góp). KHÔNG tự động chèn mục trả góp vào mọi bài viết.
   - Khối Xe liên quan (relatedCar) trỏ tới xe trong danh sách đại lý.
   - Khối Ưu nhược điểm (prosCons).
   - Khối Lead Form (leadForm) nhận báo giá lăn bánh.
   - Khối FAQ (faq) 3-4 câu hỏi đáp thực tế.
   - Khối CTA (ctaButton) gọi Hotline/Zalo.

TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU:
{
  "title": "Tiêu đề bài viết từ 40 đến 65 ký tự chứa từ khóa ở đầu",
  "summary": "Đoạn tóm tắt mở đầu 2-3 câu chứa từ khóa chính...",
  "focusKeyword": "${targetKeyword}",
  "metaTitle": "Tiêu đề SEO 45-58 ký tự chứa từ khóa chính",
  "metaDescription": "Mô tả SEO 125-155 ký tự chứa từ khóa chính và CTA xem báo giá chi tiết...",
  "suggestedKeywords": ["từ khóa lsi 1", "từ khóa lsi 2", "từ khóa lsi 3", "từ khóa lsi 4", "từ khóa lsi 5"],
  "blocks": [
    { "type": "paragraph", "content": "Nội dung đoạn mở đầu chứa chính xác từ khóa ${targetKeyword} ngay trong 100 từ đầu tiên..." },
    { "type": "heading", "level": 2, "content": "1. Giá xe ${targetCar} và Dự toán lăn bánh tại ${targetLocation}" },
    { "type": "paragraph", "content": "Phân tích giá bán chi tiết và các chính sách ưu đãi..." },
    {
      "type": "priceTable",
      "title": "Bảng Giá Xe ${targetCar} & Dự Toán Lăn Bánh",
      "prices": [
        { "version": "${targetCar} Bản Tiêu Chuẩn", "listedPrice": 489000000, "discount": 20000000, "rollingPrice": 519400000 },
        { "version": "${targetCar} Bản Đặc Biệt", "listedPrice": 539000000, "discount": 20000000, "rollingPrice": 574400000 },
        { "version": "${targetCar} Bản Cao Cấp", "listedPrice": 599000000, "discount": 25000000, "rollingPrice": 634900000 }
      ]
    },
    { "type": "heading", "level": 2, "content": "2. Đánh giá Ngoại thất ${targetCar}: Thiết kế thời thượng" },
    { "type": "singleImage", "imageUrl": "", "imageAlt": "Hình ảnh ngoại thất ${targetKeyword} chi tiết", "caption": "Chi tiết thiết kế ngoại thất..." },
    { "type": "paragraph", "content": "Phân tích thiết kế ngoại thất..." },
    { "type": "heading", "level": 2, "content": "3. Khoang Nội thất & Tiện nghi cao cấp hàng đầu phân khúc" },
    { "type": "singleImage", "imageUrl": "", "imageAlt": "Khoang lái nội thất xe ${targetCar} sang trọng", "caption": "Không gian khoang lái hiện đại..." },
    { "type": "paragraph", "content": "Phân tích nội thất..." },
    { "type": "heading", "level": 2, "content": "4. Bảng thông số kỹ thuật chi tiết các phiên bản" },
    {
      "type": "specTable",
      "title": "Bảng So Sánh Thông Số Kỹ Thuật Chi Tiết",
      "specVersions": ["Bản Tiêu Chuẩn", "Bản Đặc Biệt", "Bản Cao Cấp"],
      "specRows": [
        { "specName": "Kích thước DxRxC (mm)", "values": ["4.535 x 1.765 x 1.485", "4.535 x 1.765 x 1.485", "4.535 x 1.765 x 1.485"] },
        { "specName": "Động cơ & Hộp số", "values": ["Smartstream 1.5L - 6MT", "Smartstream 1.5L - IVT", "Smartstream 1.5L - IVT"] },
        { "specName": "Hyundai SmartSense", "values": ["Cơ bản", "Nâng cao", "Đầy đủ"] }
      ]
    },
    { "type": "heading", "level": 2, "content": "5. Khả năng vận hành và Cảm giác lái thực tế tại ${targetLocation}" },
    { "type": "paragraph", "content": "Nội dung đánh giá vận hành thực tế..." },
    { "type": "heading", "level": 2, "content": "6. Gói công nghệ an toàn chủ động Hyundai SmartSense" },
    { "type": "paragraph", "content": "Chi tiết các tính năng an toàn..." },
    {
      "type": "youtube",
      "videoId": "dQw4w9WgXcQ",
      "title": "Video đánh giá thực tế và trải nghiệm lái xe",
      "caption": "Trải nghiệm thực tế khả năng vận hành và tiện nghi trên cung đường lái thử"
    },
    {
      "type": "callout",
      "calloutType": "info",
      "title": "Chính sách bảo hành & Hậu mãi chính hãng tại ${targetLocation}",
      "content": "Cam kết bảo hành chính hãng 5 năm hoặc 100.000 km, cùng dịch vụ cứu hộ khẩn cấp 24/7 và hệ thống xưởng dịch vụ ủy quyền 3S hiện đại."
    },
    {
      "type": "relatedCar",
      "carName": "${targetCar}",
      "carSlug": "hyundai-accent",
      "carPrice": 489000000,
      "carImage": "",
      "seatCount": 5,
      "fuelType": "Xăng"
    },
    {
      "type": "prosCons",
      "title": "Đánh giá Ưu điểm & Nhược điểm thực tế",
      "pros": ["Thiết kế hiện đại, thể thao", "Nội thất rộng rãi, nhiều tiện nghi", "Tiết kiệm nhiên liệu vượt trội", "Gói an toàn SmartSense đầy đủ"],
      "cons": ["Bản tiêu chuẩn vẫn dùng phanh tay cơ", "Khả năng cách âm gầm ở dải tốc độ cao cần nâng cấp thêm"]
    },
    {
      "type": "leadForm",
      "formHeadline": "Đăng Ký Nhận Báo Giá Lăn Bánh & Lái Thử Tận Nhà",
      "formSubheadline": "Chuyên viên tư vấn sẽ liên hệ gửi bảng tính lăn bánh chi tiết và ưu đãi phụ kiện trong 5 phút.",
      "formButtonText": "Nhận Báo Giá Lăn Bánh Ngay",
      "carName": "${targetCar}"
    },
    {
      "type": "faq",
      "title": "Câu Hỏi Thường Gặp (FAQ)",
      "faqs": [
        { "question": "Giá lăn bánh ${targetCar} tại ${targetLocation} gồm những khoản phí nào?", "answer": "Bao gồm giá bán sau giảm giá, lệ phí trước bạ, phí cấp biển số, phí đăng kiểm, phí đường bộ và bảo hiểm trách nhiệm dân sự." },
        { "question": "Thời gian giao xe  tại đại lý là bao lâu?", "answer": "Showroom luôn sẵn xe giao ngay đủ màu sắc và phiên bản với thủ tục bấm biển bàn giao trong 1-2 ngày làm việc." },
        { "question": "Chính sách bảo hành chính hãng ${targetCar} là bao lâu?", "answer": "Xe được bảo hành chính hãng 5 năm hoặc 100.000 km trên toàn quốc." }
      ]
    },
    {
      "type": "ctaButton",
      "ctaButtonText": "Gọi Hotline Nhận Giá Lăn Bánh Tốt Nhất",
      "ctaActionType": "hotline",
      "ctaSubtext": "Tư vấn 24/7 - Hỗ trợ lái thử tận nhà tại ${targetLocation}",
      "ctaVariant": "red"
    }
  ]
}`;
        break;

      case 'generate_outline':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 2500;
        userPrompt = `Hãy tạo một dàn ý bài viết chuẩn SEO chi tiết, sâu sắc đáp ứng 10 tiêu chí Động cơ SEO Real-Time cho chủ đề: "${prompt}".
Dòng xe: ${targetCar}
Địa phương / Tỉnh thành: ${targetLocation}
Từ khóa chính: ${targetKeyword}
${availableCarsListText}
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
        break;

      case 'continue_writing':
      case 'expand_section':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 3500;
        userPrompt = `Hãy viết tiếp hoặc mở rộng một phần nội dung/chuyên đề hoàn chỉnh cho bài viết ô tô bằng cách sử dụng linh hoạt các khối CONTENT BLOCK TINH HOA phù hợp nhất theo yêu cầu sau:
Yêu cầu cụ thể / Đoạn cần viết tiếp: "${prompt}"
Dòng xe: ${targetCar}
Địa phương / Thị trường: ${targetLocation}
${targetKeyword ? `Từ khóa SEO cần lồng ghép tự nhiên: ${targetKeyword}` : ''}
${context ? `Ngữ cảnh / Nội dung các khối liền trước:\n${context.slice(0, 1500)}` : ''}
${availableCarsListText}

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
        break;

      case 'optimize_seo':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 1500;
        userPrompt = `Hãy phân tích và viết lại gói giải pháp SEO On-Page HOÀN HẢO ĐẠT 100/100 ĐIỂM ĐỘNG CƠ SEO REAL-TIME cho bài viết:
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
      } else if (action === 'continue_writing' || action === 'expand_section') {
        let generatedBlocks: FullArticleBlock[] = [];
        let summaryText = '';

        if (parsedJson && Array.isArray(parsedJson.blocks) && parsedJson.blocks.length > 0) {
          generatedBlocks = parsedJson.blocks as FullArticleBlock[];
          summaryText = parsedJson.summary || '';
        } else if (parsedJson && parsedJson.content) {
          generatedBlocks = [{ type: 'paragraph', content: String(parsedJson.content) }];
          summaryText = String(parsedJson.content);
        } else {
          const fallbackArticle = fallbackTextToFullArticle(aiContent, prompt, targetKeyword);
          generatedBlocks = fallbackArticle.blocks;
          summaryText = fallbackArticle.summary;
        }

        // Hybrid Composition Engine for continue_writing blocks
        if (availableCars && availableCars.length > 0 && Array.isArray(generatedBlocks)) {
          generatedBlocks = generatedBlocks.map((blk) => {
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

        resultData.blocks = generatedBlocks;
        resultData.text = summaryText || generatedBlocks.map((b) => b.content || b.title || '').filter(Boolean).join('\n\n');
        resultData.rawText = aiContent;
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
