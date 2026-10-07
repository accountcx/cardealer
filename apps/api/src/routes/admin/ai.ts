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
  type CarFullContentResult,
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

// 🛠️ Fallback sinh nội dung xe chất lượng cao khi chưa có OpenAI API Key hoặc khi OpenAI gặp sự cố
function generateFallbackCarContent(
  carName: string,
  location: string = 'Nghệ An & Hà Tĩnh',
  note: string = ''
): CarFullContentResult {
  const normalized = carName.toLowerCase();

  let segmentName = 'SUV Đô Thị';
  let traTruocTu = 120000000;
  let features = [
    { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream G1.5 Mới' },
    { icon: 'transmission', title: 'HỘP SỐ', value: 'Vô Cấp IVT Tự Động' },
    { icon: 'power', title: 'CÔNG SUẤT', value: '115 Mã Lực Cực Đại' },
    { icon: 'seat', title: 'CHỖ NGỒI', value: '5 Chỗ Ngồi Rộng Rãi' },
    { icon: 'fuel', title: 'TIẾT KIỆM', value: '6.1L / 100km Hỗn Hợp' },
    { icon: 'safety', title: 'AN TOÀN', value: 'Hyundai SmartSense' },
  ];
  let moTa = `Bảng giá xe ${carName} lăn bánh mới nhất tại Đại lý 3S chính hãng khu vực ${location}. Thiết kế thể thao thời thượng, trang bị công nghệ an toàn SmartSense tiên tiến cùng khả năng vận hành êm ái, bền bỉ và tiết kiệm nhiên liệu tối ưu.`;
  let promo = `Ưu đãi 50% lệ phí trước bạ, tặng gói phụ kiện chính hãng cao cấp và bảo hành chính hãng 5 năm hoặc 100.000 km. Hỗ trợ mua xe trả góp lãi suất ưu đãi chỉ từ 6.9%/năm, giao xe ngay tận nhà.`;

  if (normalized.includes('creta')) {
    segmentName = 'B-SUV Đô Thị';
    traTruocTu = 119000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream G1.5 Mới' },
      { icon: 'transmission', title: 'HỘP SỐ', value: 'Vô Cấp Thông Minh iVT' },
      { icon: 'power', title: 'CÔNG SUẤT', value: '115 Mã Lực & 144 Nm' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '5 Chỗ Rộng Nhất Phân Khúc' },
      { icon: 'fuel', title: 'NHIÊN LIỆU', value: '6.1L / 100km Hỗn Hợp' },
      { icon: 'safety', title: 'AN TOÀN', value: 'Gói Hyundai SmartSense' },
    ];
    moTa = `Hyundai Creta là mẫu SUV đô thị cỡ B ăn khách hàng đầu tại Việt Nam, ghi điểm với ngôn ngữ thiết kế Sensuous Sportiness cá tính, không gian nội thất rộng rãi cùng gói an toàn chủ động Hyundai SmartSense tiên tiến. Mẫu xe mang đến sự cân bằng hoàn hảo giữa khả năng di chuyển linh hoạt trong phố và độ bền bỉ, tiết kiệm trên đường dài.`;
    promo = `Ưu đãi 50% lệ phí trước bạ, tặng camera hành trình cao cấp, dán phim cách nhiệt chính hãng và bảo hành 5 năm hoặc 100.000 km. Hỗ trợ vay trả góp 85% giá trị xe, nhận xe ngay trong ngày.`;
  } else if (normalized.includes('accent')) {
    segmentName = 'Sedan Hạng B';
    traTruocTu = 89000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream G1.5 Mới' },
      { icon: 'transmission', title: 'HỘP SỐ', value: '6 MT / iVT Tự Động' },
      { icon: 'power', title: 'CÔNG SUẤT', value: '115 Mã Lực Cực Đại' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '5 Chỗ Rộng & Cốp Mở Điện' },
      { icon: 'fuel', title: 'NHIÊN LIỆU', value: '5.4L / 100km Tiết Kiệm' },
      { icon: 'safety', title: 'AN TOÀN', value: 'Hyundai SmartSense & 6 Túi Khí' },
    ];
    moTa = `Hyundai Accent thế hệ hoàn toàn mới định hình lại phân khúc sedan hạng B với diện mạo thể thao lai coupe ấn tượng, dải đèn LED Horizon tương lai, khoang nội thất công nghệ cao và động cơ Smartstream 1.5L bền bỉ, tiết kiệm nhiên liệu tối ưu.`;
    promo = `Giảm giá tiền mặt trực tiếp, tặng bảo hiểm thân vỏ và gói phụ kiện cao cấp chính hãng. Hỗ trợ duyệt hồ sơ trả góp cấp tốc trong 15 phút, giải ngân nhận xe ngay.`;
  } else if (normalized.includes('tucson')) {
    segmentName = 'C-SUV Thể Thao';
    traTruocTu = 155000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream 2.0 / 1.6T / 2.0D' },
      { icon: 'transmission', title: 'HỘP SỐ', value: '8 AT / 7 DCT Ly Hợp Kép' },
      { icon: 'power', title: 'CÔNG SUẤT', value: 'Lên Đến 180 Mã Lực' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '5 Chỗ Rộng & Cốp Điện 539L' },
      { icon: 'safety', title: 'DẪN ĐỘNG', value: 'Dẫn Động 4 Bánh HTRAC' },
      { icon: 'screen', title: 'TIỆN NGHI', value: 'Màn Hình Đôi 10.25 Inch & Loa Bose' },
    ];
    moTa = `Hyundai Tucson sở hữu phong cách SUV tiên phong với đèn định vị ẩn Parametric Jewel độc bản, khung gầm thế hệ thứ 3 N3 Platform gia cường và hàng loạt công nghệ lái xe thông minh bậc nhất phân khúc C-SUV tại Việt Nam.`;
    promo = `Hỗ trợ lệ phí trước bạ, tặng gói phụ kiện cao cấp chính hãng và thẻ dịch vụ bảo dưỡng định kỳ. Showroom sẵn xe giao ngay đủ màu, hỗ trợ lái thử tận nhà.`;
  } else if (normalized.includes('santa fe') || normalized.includes('santafe')) {
    segmentName = 'D-SUV Đẳng Cấp';
    traTruocTu = 210000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream G2.5 / 2.5 Turbo' },
      { icon: 'transmission', title: 'HỘP SỐ', value: 'Tự Động 8 Cấp Mượt Mà' },
      { icon: 'power', title: 'CÔNG SUẤT', value: 'Lên Đến 194 - 281 Mã Lực' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '7 Chỗ Đẳng Cấp / Ghế Cơ Trưởng' },
      { icon: 'safety', title: 'DẪN ĐỘNG', value: 'HTRAC Đa Địa Hình (Snow, Sand, Mud)' },
      { icon: 'screen', title: 'CÔNG NGHỆ', value: 'Màn Hình Cong Panoramic Siêu Lớn' },
    ];
    moTa = `Hyundai Santa Fe thế hệ hoàn toàn mới lột xác với ngôn ngữ thiết kế khối hộp Boxy việt dã sang trọng, không gian 7 chỗ đẳng cấp thương gia và hệ truyền động Smartstream mạnh mẽ, xứng danh biểu tượng SUV đỉnh cao.`;
    promo = `Ưu đãi đặc quyền cho khách hàng đặt cọc: Tặng gói phủ Ceramic bảo vệ sơn cao cấp, phim cách nhiệt Mỹ và bảo dưỡng miễn phí. Hỗ trợ giao xe tận nhà.`;
  } else if (normalized.includes('elantra')) {
    segmentName = 'Sedan Hạng C';
    traTruocTu = 110000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream 1.6 / 2.0 / 1.6 Turbo' },
      { icon: 'transmission', title: 'HỘP SỐ', value: '6 AT / 7 DCT Thể Thao' },
      { icon: 'power', title: 'CÔNG SUẤT', value: 'Lên Đến 204 Mã Lực (N Line)' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '5 Chỗ Thiết Kế Buồng Lái Phi Cơ' },
      { icon: 'design', title: 'THIẾT KẾ', value: 'Sensuous Sportiness 4-Door Coupe' },
      { icon: 'safety', title: 'AN TOÀN', value: 'Hyundai SmartSense Thế Hệ Mới' },
    ];
    moTa = `Hyundai Elantra mang đậm phong cách thiết kế 4-door Coupe thể thao quyến rũ, buồng lái hướng về người lái như buồng lái máy bay phản lực cùng khối động cơ Smartstream Turbo đầy phấn khích trên mọi cung đường.`;
    promo = `Giảm giá tiền mặt trực tiếp, tặng bảo hiểm vật chất và gói độ thể thao chính hãng. Lãi suất vay trả góp cố định ưu đãi.`;
  } else if (normalized.includes('custin')) {
    segmentName = 'MPV Cỡ Trung';
    traTruocTu = 160000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream 1.5T / 2.0T-GDi' },
      { icon: 'transmission', title: 'HỘP SỐ', value: 'Tự Động 8 Cấp (8AT)' },
      { icon: 'power', title: 'CÔNG SUẤT', value: 'Lên Đến 236 Mã Lực' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '7 Chỗ (Hàng Ghế Captain Hạng Nhất)' },
      { icon: 'design', title: 'CỬA LÙA', value: 'Cửa Trượt Điện Tự Động 2 Bên' },
      { icon: 'safety', title: 'AN TOÀN', value: 'Hyundai SmartSense Chủ Động' },
    ];
    moTa = `Hyundai Custin là dòng MPV cỡ trung cao cấp hàng đầu dành cho gia đình và doanh nghiệp, sở hữu hàng ghế thương gia Captain thư giãn chuẩn không trọng lực, cửa trượt điện thông minh 2 bên và không gian nội thất rộng rãi tột bậc.`;
    promo = `Tặng gói bảo dưỡng miễn phí 2 năm, phủ gầm chống rỉ sét và phim cách nhiệt chính hãng. Hỗ trợ làm thủ tục biển số nhanh chóng.`;
  } else if (normalized.includes('stargazer')) {
    segmentName = 'MPV Gia Đình';
    traTruocTu = 95000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream G1.5 Mới' },
      { icon: 'transmission', title: 'HỘP SỐ', value: 'Vô Cấp Thông Minh iVT' },
      { icon: 'power', title: 'CÔNG SUẤT', value: '115 Mã Lực Bền Bỉ' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '6/7 Chỗ Linh Hoạt Tiện Dụng' },
      { icon: 'fuel', title: 'NHIÊN LIỆU', value: '5.9L / 100km Tiết Kiệm' },
      { icon: 'safety', title: 'AN TOÀN', value: 'Hệ Thống SmartSense Đầy Đủ' },
    ];
    moTa = `Hyundai Stargazer mang thiết kế tương lai One Curve phi thuyền, khoang cabin thực dụng với 31 vị trí để đồ thông minh, đáp ứng hoàn hảo nhu cầu di chuyển của gia đình đông thành viên cũng như kinh doanh dịch vụ.`;
    promo = `Ưu đãi giá sốc lên đến hàng chục triệu đồng, tặng phụ kiện bọc da cao cấp và thảm lót sàn chính hãng. Nhận xe chỉ với từ 95 triệu trả trước.`;
  } else if (normalized.includes('i10') || normalized.includes('grand')) {
    segmentName = 'Hatchback / Sedan Hạng A';
    traTruocTu = 65000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Kappa 1.2L Bền Bỉ' },
      { icon: 'transmission', title: 'HỘP SỐ', value: '4 AT / 5 MT Tiết Kiệm' },
      { icon: 'power', title: 'CÔNG SUẤT', value: '83 Mã Lực Linh Hoạt' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '5 Chỗ Rộng Nhất Phân Khúc A' },
      { icon: 'fuel', title: 'NHIÊN LIỆU', value: '5.2L / 100km Tiết Kiệm Xăng' },
      { icon: 'sensor', title: 'TIỆN ÍCH', value: 'Màn Hình 8 Inch & Cảm Biến Áp Suất Lốp' },
    ];
    moTa = `Hyundai Grand i10 tiếp tục khẳng định vị thế ông vua phân khúc xe đô thị cỡ nhỏ hạng A với kích thước vượt trội, khung gầm đầm chắc, chi phí vận hành siêu tiết kiệm và dịch vụ phụ tùng chính hãng phổ biến toàn quốc.`;
    promo = `Giảm giá đặc biệt cho khách hàng mua xe chạy dịch vụ hoặc gia đình, tặng bảo hiểm thân vỏ và hỗ trợ đăng ký biển số trong ngày.`;
  } else if (normalized.includes('venue')) {
    segmentName = 'A-SUV Đô Thị';
    traTruocTu = 98000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: '1.0 Turbo GDi Khỏe Khoắn' },
      { icon: 'transmission', title: 'HỘP SỐ', value: 'Ly Hợp Kép 7 Cấp (7DCT)' },
      { icon: 'power', title: 'CÔNG SUẤT', value: '120 Mã Lực Vượt Trội' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '5 Chỗ Trẻ Trung Cá Tính' },
      { icon: 'fuel', title: 'NHIÊN LIỆU', value: '5.6L / 100km Linh Hoạt' },
      { icon: 'safety', title: 'AN TOÀN', value: 'Phanh Đĩa 4 Bánh & 6 Túi Khí' },
    ];
    moTa = `Hyundai Venue là tân binh A-SUV đậm chất thể thao, nổi bật với mặt ca-lăng thác nước mạ crom cỡ lớn, động cơ 1.0L Turbo mạnh mẽ hàng đầu phân khúc kết hợp hộp số 7DCT mượt mà, sẵn sàng chinh phục mọi cung phố hiện đại.`;
    promo = `Hỗ trợ phí trước bạ, tặng camera 360 độ và dán phim cách nhiệt cao cấp. Hỗ trợ vay mua xe không cần chứng minh thu nhập.`;
  } else if (normalized.includes('palisade')) {
    segmentName = 'E-SUV Flagship';
    traTruocTu = 280000000;
    features = [
      { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Dầu R 2.2L CRDi Mạnh Mẽ' },
      { icon: 'transmission', title: 'HỘP SỐ', value: 'Tự Động 8 Cấp Núm Xoay' },
      { icon: 'power', title: 'CÔNG SUẤT', value: '200 Mã Lực & 440 Nm Mô-men' },
      { icon: 'seat', title: 'CHỖ NGỒI', value: '6/7 Chỗ Da Nappa Thương Gia' },
      { icon: 'safety', title: 'DẪN ĐỘNG', value: 'HTRAC Đa Địa Hình Thông Minh' },
      { icon: 'screen', title: 'TIỆN NGHI', value: '12 Loa Infinity & Cửa Sổ Trời Đôi' },
    ];
    moTa = `Hyundai Palisade là mẫu SUV đầu bảng cao cấp nhất của Hyundai, biểu tượng quyền uy và vị thế lãnh đạo với thiết kế đồ sộ, nội thất bọc da Nappa xa hoa cùng hệ thống âm thanh vòm Infinity đỉnh cao.`;
    promo = `Gói quà tặng VIP dành riêng cho chủ nhân Palisade: Thẻ thành viên VIP bảo dưỡng trọn đời, phủ Ceramic toàn xe và bảo hiểm vật chất cao cấp 2 năm.`;
  }

  if (note && note.trim().length > 3) {
    promo = `${promo} (${note.trim()})`;
  }

  const focusKeyword = `giá xe ${carName.toLowerCase()}`;
  const articleTitle = `Đánh Giá Xe ${carName}: Bảng Giá Lăn Bánh, Thông Số & Ưu Đãi Mới Nhất Tại ${location}`;
  const articleSummary = `Tổng hợp chi tiết đánh giá xe ${carName} mới nhất tại ${location}. Cập nhật bảng giá niêm yết, dự toán lăn bánh từng phiên bản, ưu đãi tiền mặt và tư vấn mua xe trả góp lãi suất tốt nhất.`;

  const articleBlocks: FullArticleBlock[] = [
    {
      type: 'paragraph',
      content: `Dòng xe ${carName} tại thị trường ${location} hiện đang là tâm điểm chú ý của đông đảo khách hàng nhờ sự kết hợp lý tưởng giữa giá bán cạnh tranh, thiết kế trẻ trung hiện đại và hàng loạt công nghệ an toàn cao cấp trong phân khúc ${segmentName}.`,
    },
    {
      type: 'heading',
      level: 2,
      content: `1. Giá Xe ${carName} Và Dự Toán Chi Phí Lăn Bánh Tại ${location}`,
    },
    {
      type: 'paragraph',
      content: `Để khách hàng dễ dàng cân đối ngân sách sở hữu mẫu xe ${carName}, Đại lý xin gửi tới quý khách bảng giá niêm yết chính hãng và dự toán chi phí lăn bánh sơ bộ tại khu vực ${location}:`,
    },
    {
      type: 'priceTable',
      title: `Bảng Giá Xe ${carName} & Chi Phí Lăn Bánh Tham Khảo`,
      prices: [
        { version: `${carName} Bản Tiêu Chuẩn`, listedPrice: traTruocTu * 4, discount: 20000000, rollingPrice: Math.round(traTruocTu * 4 * 1.08) },
        { version: `${carName} Bản Đặc Biệt`, listedPrice: Math.round(traTruocTu * 4.6), discount: 25000000, rollingPrice: Math.round(traTruocTu * 4.6 * 1.08) },
        { version: `${carName} Bản Cao Cấp`, listedPrice: Math.round(traTruocTu * 5.2), discount: 30000000, rollingPrice: Math.round(traTruocTu * 5.2 * 1.08) },
      ],
    },
    {
      type: 'callout',
      calloutType: 'info',
      title: 'Chính sách ưu đãi và hỗ trợ trả góp đặc quyền',
      content: `${promo} Showroom cam kết mang đến mức giá lăn bánh cạnh tranh nhất khu vực ${location} cùng thủ tục bàn giao xe nhanh chóng.`,
    },
    {
      type: 'heading',
      level: 2,
      content: `2. Thiết Kế Ngoại Thất Và Không Gian Nội Thất Xe ${carName}`,
    },
    {
      type: 'paragraph',
      content: `${moTa} Bước vào bên trong khoang cabin, người lái và hành khách sẽ ngay lập tức cảm nhận được sự tinh tế với ghế ngồi bọc da cao cấp, hệ thống điều hòa tự động làm mát sâu và màn hình giải trí đa phương tiện kích thước lớn hỗ trợ kết nối thông minh.`,
    },
    {
      type: 'heading',
      level: 2,
      content: `3. Thông Số Kỹ Thuật Nổi Bật Của Dòng Xe ${carName}`,
    },
    {
      type: 'specTable',
      title: `Bảng Thông Số Kỹ Thuật Xe ${carName}`,
      specVersions: ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt', 'Bản Cao Cấp'],
      specRows: [
        { specName: 'Động cơ', values: [features[0].value, features[0].value, features[0].value] },
        { specName: 'Hộp số', values: [features[1].value, features[1].value, features[1].value] },
        { specName: 'Công suất tối đa', values: [features[2].value, features[2].value, features[2].value] },
        { specName: 'Số chỗ ngồi', values: [features[3].value, features[3].value, features[3].value] },
        { specName: 'Mức tiêu hao nhiên liệu', values: [features[4].value, features[4].value, features[4].value] },
        { specName: 'Gói an toàn chủ động', values: ['Tiêu chuẩn', 'Nâng cao', features[5].value] },
      ],
    },
    {
      type: 'heading',
      level: 2,
      content: `4. Đánh Giá Ưu Điểm Và Nhược Điểm Thực Tế Của ${carName}`,
    },
    {
      type: 'prosCons',
      title: `Ưu & Nhược Điểm Xe ${carName}`,
      pros: [
        'Thiết kế bắt mắt, phong cách thể thao hiện đại dẫn đầu xu hướng',
        'Trang bị tiện nghi và màn hình giải trí vượt trội trong tầm giá',
        'Hệ thống an toàn chủ động thông minh mang lại sự an tâm tối đa',
        'Chi phí bảo dưỡng hợp lý, phụ tùng chính hãng dễ dàng thay thế',
      ],
      cons: [
        'Các phiên bản màu ngoại thất hot có thể phải chờ đợi theo đợt giao xe từ nhà máy',
      ],
    },
    {
      type: 'faq',
      title: `Câu Hỏi Thường Gặp Về Xe ${carName}`,
      faqs: [
        {
          question: `Mua xe ${carName} trả góp cần trả trước bao nhiêu tại ${location}?`,
          answer: `Quý khách chỉ cần chuẩn bị số tiền trả trước từ ${traTruocTu.toLocaleString('vi-VN')} VNĐ (tương đương 15-20% giá trị xe), ngân hàng đối tác hỗ trợ vay tới 80-85% với thủ tục đơn giản, giải ngân nhanh.`,
        },
        {
          question: `Thời gian bảo hành chính hãng xe ${carName} là bao lâu?`,
          answer: `Mọi dòng xe Hyundai được bảo hành chính hãng 5 năm hoặc 100.000 km tùy điều kiện nào đến trước tại tất cả các Đại lý ủy quyền trên toàn quốc.`,
        },
        {
          question: `Showroom tại ${location} có sẵn xe ${carName} giao ngay không?`,
          answer: `Đại lý luôn có sẵn xe đủ màu sắc và các phiên bản trong kho, hỗ trợ hoàn tất thủ tục đăng ký, đăng kiểm và bàn giao xe tận nơi cho khách hàng.`,
        },
      ],
    },
    {
      type: 'leadForm',
      formHeadline: `Đăng Ký Nhận Báo Giá Lăn Bánh & Lái Thử ${carName}`,
      formSubheadline: `Điền thông tin bên dưới để chuyên viên tư vấn gửi bảng tính chi tiết các khoản phí và ưu đãi đặc quyền trong 5 phút.`,
      formButtonText: 'Gửi Yêu Cầu Báo Giá',
      carName,
    },
    {
      type: 'ctaButton',
      ctaButtonText: `Hotline Tư Vấn Báo Giá Xe ${carName}`,
      ctaActionType: 'hotline',
      ctaVariant: 'red',
      ctaSubtext: `Hỗ trợ 24/7 - Lái thử tận nhà miễn phí tại ${location}`,
    },
  ];

  return {
    moTaChung: moTa,
    promotionSummary: promo,
    traTruocTu,
    highlightFeatures: features,
    article: {
      title: articleTitle,
      summary: articleSummary,
      focusKeyword,
      metaTitle: `${articleTitle.slice(0, 55)} | Giá Tốt Nhất`,
      metaDescription: articleSummary.slice(0, 155),
      suggestedKeywords: [
        focusKeyword,
        `dự toán lăn bánh ${carName.toLowerCase()}`,
        `thông số kỹ thuật ${carName.toLowerCase()}`,
        `ưu đãi ${carName.toLowerCase()}`,
      ],
      blocks: articleBlocks,
    },
  };
}

// 🛠️ Fallback sinh nội dung chuẩn cho 1 block đơn lẻ
function generateFallbackSingleBlock(
  blockType: string,
  carName: string,
  location: string = 'Nghệ An & Hà Tĩnh',
  context?: string
): FullArticleBlock {
  const carContent = generateFallbackCarContent(carName, location);

  switch (blockType) {
    case 'heading':
      return {
        type: 'heading',
        level: 2,
        content: `Đánh Giá Chi Tiết Dòng Xe ${carName} Tại ${location}`,
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        content: `${carContent.moTaChung} Mẫu xe hiện đang được trưng bày đầy đủ các phiên bản tại showroom ủy quyền chính hãng tại ${location}, hỗ trợ đăng ký lái thử trải nghiệm thực tế và giao xe tận nhà.`,
      };

    case 'prosCons': {
      const prosConsBlock = carContent.article?.blocks.find((b) => b.type === 'prosCons');
      return (
        prosConsBlock || {
          type: 'prosCons',
          title: `Ưu Điểm & Nhược Điểm Xe ${carName}`,
          pros: [
            'Thiết kế thể thao, hiện đại và cuốn hút',
            'Trang bị tiện nghi và an toàn thông minh hàng đầu phân khúc',
            'Tiết kiệm nhiên liệu, vận hành êm ái bền bỉ',
            'Chi phí bảo dưỡng hợp lý, sẵn phụ tùng thay thế',
          ],
          cons: ['Các màu sắc đặc biệt có thể cần đặt trước theo đợt xe từ nhà máy'],
        }
      );
    }

    case 'specTable': {
      const specBlock = carContent.article?.blocks.find((b) => b.type === 'specTable');
      return (
        specBlock || {
          type: 'specTable',
          title: `Bảng Thông Số Kỹ Thuật Xe ${carName}`,
          specVersions: ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt', 'Bản Cao Cấp'],
          specRows: [
            { specName: 'Động cơ', values: [carContent.highlightFeatures[0]?.value || 'Smartstream 1.5L', carContent.highlightFeatures[0]?.value || 'Smartstream 1.5L', carContent.highlightFeatures[0]?.value || 'Smartstream 1.5L'] },
            { specName: 'Hộp số', values: [carContent.highlightFeatures[1]?.value || 'IVT Tự Động', carContent.highlightFeatures[1]?.value || 'IVT Tự Động', carContent.highlightFeatures[1]?.value || 'IVT Tự Động'] },
            { specName: 'Công suất', values: [carContent.highlightFeatures[2]?.value || '115 Mã Lực', carContent.highlightFeatures[2]?.value || '115 Mã Lực', carContent.highlightFeatures[2]?.value || '115 Mã Lực'] },
            { specName: 'Số chỗ ngồi', values: [carContent.highlightFeatures[3]?.value || '5 Chỗ', carContent.highlightFeatures[3]?.value || '5 Chỗ', carContent.highlightFeatures[3]?.value || '5 Chỗ'] },
            { specName: 'Tiêu hao nhiên liệu', values: [carContent.highlightFeatures[4]?.value || '6.1L/100km', carContent.highlightFeatures[4]?.value || '6.1L/100km', carContent.highlightFeatures[4]?.value || '6.1L/100km'] },
            { specName: 'Gói an toàn SmartSense', values: ['Cơ bản', 'Nâng cao', 'Đầy đủ tính năng'] },
          ],
        }
      );
    }

    case 'priceTable': {
      const priceBlock = carContent.article?.blocks.find((b) => b.type === 'priceTable');
      return (
        priceBlock || {
          type: 'priceTable',
          title: `Bảng Giá Xe ${carName} & Dự Toán Lăn Bánh Tham Khảo`,
          prices: [
            { version: `${carName} Tiêu Chuẩn`, listedPrice: (carContent.traTruocTu || 120000000) * 4, discount: 20000000, rollingPrice: Math.round((carContent.traTruocTu || 120000000) * 4 * 1.08) },
            { version: `${carName} Đặc Biệt`, listedPrice: Math.round((carContent.traTruocTu || 120000000) * 4.6), discount: 25000000, rollingPrice: Math.round((carContent.traTruocTu || 120000000) * 4.6 * 1.08) },
            { version: `${carName} Cao Cấp`, listedPrice: Math.round((carContent.traTruocTu || 120000000) * 5.2), discount: 30000000, rollingPrice: Math.round((carContent.traTruocTu || 120000000) * 5.2 * 1.08) },
          ],
        }
      );
    }

    case 'faq': {
      const faqBlock = carContent.article?.blocks.find((b) => b.type === 'faq');
      return (
        faqBlock || {
          type: 'faq',
          title: `Câu Hỏi Thường Gặp Về Xe ${carName}`,
          faqs: [
            { question: `Mua xe ${carName} trả góp cần chuẩn bị số tiền bao nhiêu?`, answer: `Chỉ cần trả trước từ ${(carContent.traTruocTu || 120000000).toLocaleString('vi-VN')} VNĐ, ngân hàng hỗ trợ duyệt vay tới 85% giá trị xe.` },
            { question: `Chế độ bảo hành xe ${carName} tại ${location} như thế nào?`, answer: `Xe được bảo hành chính hãng 5 năm hoặc 100.000 km trên toàn hệ thống đại lý Hyundai.` },
            { question: `Showroom có hỗ trợ lái thử tận nhà không?`, answer: `Đại lý hỗ trợ lái thử xe tận nơi hoàn toàn miễn phí tại ${location}, đăng ký nhanh qua hotline.` },
          ],
        }
      );
    }

    case 'callout':
      return {
        type: 'callout',
        calloutType: 'info',
        title: `Chính Sách Ưu Đãi Độc Quyền Cho Xe ${carName}`,
        content: `${carContent.promotionSummary} Quý khách vui lòng liên hệ sớm để nhận quà tặng phụ kiện chính hãng và hỗ trợ hồ sơ bấm biển lấy xe ngay.`,
      };

    case 'ctaButton':
      return {
        type: 'ctaButton',
        ctaButtonText: `Nhận Báo Giá Lăn Bánh & Ưu Đãi Xe ${carName}`,
        ctaActionType: 'hotline',
        ctaVariant: 'red',
        ctaSubtext: `Tư vấn 24/7 - Hỗ trợ đăng ký lái thử tận nhà tại ${location}`,
      };

    case 'leadForm':
      return {
        type: 'leadForm',
        formHeadline: `Đăng Ký Nhận Báo Giá Chi Tiết Xe ${carName}`,
        formSubheadline: `Chuyên viên tư vấn chính hãng sẽ liên hệ gửi bảng tính chi phí lăn bánh chính xác và quà tặng trong 5 phút.`,
        formButtonText: 'Gửi Yêu Cầu Báo Giá',
        carName,
      };

    case 'singleImage':
      return {
        type: 'singleImage',
        imageUrl: '',
        imageAlt: `Hình ảnh xe ${carName} chính hãng tại showroom ${location}`,
        caption: `Thiết kế thể thao thời thượng và nổi bật của dòng xe ${carName}`,
      };

    default:
      return {
        type: blockType,
        content: `${carContent.moTaChung}`,
      };
  }
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

    const targetLocation = location || 'Nghệ An & Hà Tĩnh';
    const targetCar = carModel || 'Xe ô tô Hyundai';
    const targetKeyword = keyword || (prompt.length > 5 && prompt.length < 50 ? prompt : `Đánh giá ${targetCar} tại ${targetLocation}`);

    // Nạp API Key và Model từ database site_settings
    const siteSettingsRow = await db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, 'site_settings'),
    });

    const siteSettings = siteSettingsRow ? SiteSettingsSchema.parse(siteSettingsRow.data) : SiteSettingsSchema.parse({});
    const apiKey = siteSettings.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
    const model = siteSettings.openaiModel?.trim() || 'gpt-4o-mini';

    if (!apiKey) {
      if (action === 'generate_car_content') {
        const fallbackCarContent = generateFallbackCarContent(targetCar, targetLocation, prompt);
        sendJson(200, {
          success: true,
          data: {
            action: 'generate_car_content',
            model: 'local-automotive-ai',
            carContent: fallbackCarContent,
          },
        });
        return true;
      }

      if (action === 'generate_single_block') {
        const fallbackBlock = generateFallbackSingleBlock(prompt, targetCar, targetLocation, context);
        sendJson(200, {
          success: true,
          data: {
            action: 'generate_single_block',
            model: 'local-automotive-ai',
            blocks: [fallbackBlock],
          },
        });
        return true;
      }

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

      case 'generate_car_content':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 4000;
        userPrompt = `Bạn là Giám đốc Sản phẩm kiêm Chuyên gia Marketing Ô tô Hyundai tại Việt Nam.
Hãy sáng tạo TOÀN BỘ NỘI DUNG TIẾP THỊ & BÀI VIẾT ĐÁNH GIÁ ĐẦY ĐỦ cho dòng xe sau:
- Tên dòng xe: ${targetCar}
- Khu vực / Đại lý: ${targetLocation}
- Từ khóa chính: ${targetKeyword}
${prompt ? `- Ghi chú bổ sung / ưu đãi đặc thù: "${prompt}"\n` : ''}
${availableCarsListText}

YÊU CẦU ĐẦU RA (BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON):
1. "moTaChung": Đoạn văn 2-4 câu (khoảng 60-120 từ) mô tả tổng quan dòng xe: ngôn ngữ thiết kế Sensuous Sportiness, vị thế phân khúc, công nghệ, trải nghiệm lái và bảo hành chính hãng.
2. "promotionSummary": Đoạn văn 1-2 câu tóm tắt chương trình khuyến mãi hấp dẫn nhất (giảm thuế trước bạ, quà tặng phụ kiện, hỗ trợ trả góp lãi suất tốt, giao xe ngay).
3. "traTruocTu": Số tiền ước tính trả trước tối thiểu (số nguyên dạng number, đơn vị VNĐ, ví dụ: 120000000).
4. "highlightFeatures": Mảng đúng 6 đối tượng điểm nhấn công nghệ & vận hành ăn khách nhất. Mỗi đối tượng gồm:
   - "icon": một trong các giá trị ['engine', 'transmission', 'power', 'seat', 'fuel', 'safety', 'dimension', 'screen', 'sensor', 'design']
   - "title": Tiêu đề viết hoa ngắn gọn (ví dụ: 'ĐỘNG CƠ', 'HỘP SỐ', 'CÔNG SUẤT', 'CHỖ NGỒI', 'NHIÊN LIỆU', 'AN TOÀN')
   - "value": Giá trị chi tiết và chính xác (ví dụ: 'Smartstream G1.5 Mới', 'Vô Cấp IVT Êm Ái', '115 Mã Lực Cực Đại', '5 Chỗ Rộng Nhất Phân Khúc', '6.1L/100km', 'Hyundai SmartSense 2.0')
5. "article": Toàn bộ bài viết đánh giá chuyên sâu chuẩn SEO 100/100 điểm với các trường:
   - "title": Tiêu đề bài viết 40-65 ký tự chứa từ khóa chính ở nửa đầu
   - "summary": Đoạn tóm tắt mở đầu 2-3 câu chứa từ khóa chính
   - "focusKeyword": Từ khóa SEO chính ("${targetKeyword}")
   - "metaTitle": Tiêu đề SEO 45-58 ký tự
   - "metaDescription": Mô tả SEO 125-155 ký tự chứa từ khóa chính và CTA
   - "suggestedKeywords": Mảng 4-6 từ khóa LSI
   - "blocks": Mảng các khối Content Block phong phú kết hợp (paragraph, heading level 2, priceTable, specTable, prosCons, callout, faq, leadForm, ctaButton).

ĐỊNH DẠNG JSON:
{
  "moTaChung": "...",
  "promotionSummary": "...",
  "traTruocTu": 120000000,
  "highlightFeatures": [
    { "icon": "engine", "title": "ĐỘNG CƠ", "value": "..." },
    { "icon": "transmission", "title": "HỘP SỐ", "value": "..." },
    { "icon": "power", "title": "CÔNG SUẤT", "value": "..." },
    { "icon": "seat", "title": "CHỖ NGỒI", "value": "..." },
    { "icon": "fuel", "title": "NHIÊN LIỆU", "value": "..." },
    { "icon": "safety", "title": "AN TOÀN", "value": "..." }
  ],
  "article": {
    "title": "...",
    "summary": "...",
    "focusKeyword": "${targetKeyword}",
    "metaTitle": "...",
    "metaDescription": "...",
    "suggestedKeywords": ["..."],
    "blocks": [
      { "type": "paragraph", "content": "..." },
      { "type": "heading", "level": 2, "content": "1. Giá Xe ${targetCar} Và Dự Toán Lăn Bánh Tại ${targetLocation}" },
      { "type": "paragraph", "content": "..." },
      { "type": "priceTable", "title": "Bảng Giá Xe ${targetCar}", "prices": [...] },
      { "type": "heading", "level": 2, "content": "2. Đánh Giá Ngoại Thất & Nội Thất ${targetCar}" },
      { "type": "paragraph", "content": "..." },
      { "type": "heading", "level": 2, "content": "3. Thông Số Kỹ Thuật Chi Tiết" },
      { "type": "specTable", "title": "Bảng Thông Số Kỹ Thuật", "specVersions": [...], "specRows": [...] },
      { "type": "prosCons", "title": "Ưu Điểm & Nhược Điểm Xe ${targetCar}", "pros": [...], "cons": [...] },
      { "type": "callout", "calloutType": "info", "title": "Chính Sách Hậu Mãi & Bảo Hành", "content": "..." },
      { "type": "faq", "title": "Câu Hỏi Thường Gặp Về ${targetCar}", "faqs": [...] },
      { "type": "leadForm", "formHeadline": "Nhận Báo Giá Lăn Bánh ${targetCar}", "formButtonText": "Đăng Ký Ngay", "carName": "${targetCar}" },
      { "type": "ctaButton", "ctaButtonText": "Gọi Hotline Báo Giá Tốt Nhất", "ctaActionType": "hotline", "ctaVariant": "red" }
    ]
  }
}`;
        break;

      case 'generate_single_block':
        responseFormat = { type: 'json_object' };
        defaultTokenLimit = 2500;
        userPrompt = `Bạn là Giám đốc Sáng tạo Nội dung kiêm Chuyên gia Kỹ thuật Ô tô tại Việt Nam.
Hãy sáng tạo nội dung chi tiết, chuẩn SEO chuyên sâu cho DUY NHẤT 1 KHỐI NỘI DUNG (Content Block) thuộc loại: "${prompt}" cho bài viết về dòng xe:
- Dòng xe: ${targetCar}
- Địa phương / Thị trường: ${targetLocation}
- Từ khóa chính: ${targetKeyword}
${context ? `- Ngữ cảnh / Tiêu đề hoặc nội dung liền kề:\n${context.slice(0, 1000)}\n` : ''}
${availableCarsListText}

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
        if (action === 'generate_car_content') {
          const fallbackCarContent = generateFallbackCarContent(targetCar, targetLocation, prompt);
          sendJson(200, {
            success: true,
            data: {
              action: 'generate_car_content',
              model: 'local-automotive-ai',
              carContent: fallbackCarContent,
            },
          });
          return true;
        }

        if (action === 'generate_single_block') {
          const fallbackBlock = generateFallbackSingleBlock(prompt, targetCar, targetLocation, context);
          sendJson(200, {
            success: true,
            data: {
              action: 'generate_single_block',
              model: 'local-automotive-ai',
              blocks: [fallbackBlock],
            },
          });
          return true;
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
      if (action === 'generate_car_content') {
        const fallbackCarContent = generateFallbackCarContent(targetCar, targetLocation, prompt);
        sendJson(200, {
          success: true,
          data: {
            action: 'generate_car_content',
            model: 'local-automotive-ai',
            carContent: fallbackCarContent,
          },
        });
        return true;
      }

      if (action === 'generate_single_block') {
        const fallbackBlock = generateFallbackSingleBlock(prompt, targetCar, targetLocation, context);
        sendJson(200, {
          success: true,
          data: {
            action: 'generate_single_block',
            model: 'local-automotive-ai',
            blocks: [fallbackBlock],
          },
        });
        return true;
      }

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
      if (action === 'generate_car_content') {
        const fallbackCarContent = generateFallbackCarContent(targetCar, targetLocation, prompt);
        sendJson(200, {
          success: true,
          data: {
            action: 'generate_car_content',
            model: 'local-automotive-ai',
            carContent: fallbackCarContent,
          },
        });
        return true;
      }

      if (action === 'generate_single_block') {
        const fallbackBlock = generateFallbackSingleBlock(prompt, targetCar, targetLocation, context);
        sendJson(200, {
          success: true,
          data: {
            action: 'generate_single_block',
            model: 'local-automotive-ai',
            blocks: [fallbackBlock],
          },
        });
        return true;
      }

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
      } else if (action === 'generate_car_content') {
        let carContentObj: CarFullContentResult;
        if (parsedJson && (parsedJson.moTaChung || parsedJson.highlightFeatures)) {
          let articleObj = parsedJson.article;
          if (articleObj && availableCars && availableCars.length > 0 && Array.isArray(articleObj.blocks)) {
            articleObj.blocks = articleObj.blocks.map((blk: any) => {
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

          carContentObj = {
            moTaChung: String(parsedJson.moTaChung || ''),
            promotionSummary: String(parsedJson.promotionSummary || ''),
            traTruocTu: typeof parsedJson.traTruocTu === 'number' ? parsedJson.traTruocTu : (parsedJson.traTruocTu ? parseInt(parsedJson.traTruocTu, 10) : undefined),
            highlightFeatures: Array.isArray(parsedJson.highlightFeatures) ? parsedJson.highlightFeatures : [],
            article: articleObj ? {
              title: String(articleObj.title || `Đánh giá xe ${targetCar}`),
              summary: String(articleObj.summary || ''),
              focusKeyword: String(articleObj.focusKeyword || targetKeyword),
              metaTitle: String(articleObj.metaTitle || articleObj.title || ''),
              metaDescription: String(articleObj.metaDescription || articleObj.summary || ''),
              suggestedKeywords: Array.isArray(articleObj.suggestedKeywords) ? articleObj.suggestedKeywords : [targetKeyword],
              blocks: Array.isArray(articleObj.blocks) ? articleObj.blocks : [],
            } : undefined,
          };
        } else {
          carContentObj = generateFallbackCarContent(targetCar, targetLocation, prompt);
        }
        resultData.carContent = carContentObj;
        resultData.text = carContentObj.moTaChung;
        resultData.rawText = aiContent;
      } else if (action === 'generate_single_block') {
        let blockObj: FullArticleBlock;
        if (parsedJson && (parsedJson.block || (Array.isArray(parsedJson.blocks) && parsedJson.blocks[0]))) {
          blockObj = (parsedJson.block || parsedJson.blocks[0]) as FullArticleBlock;
        } else {
          blockObj = generateFallbackSingleBlock(prompt, targetCar, targetLocation, context);
        }

        if (availableCars && availableCars.length > 0 && blockObj.type === 'relatedCar') {
          const matched = availableCars.find(
            (c) =>
              (blockObj.carSlug && c.slug === blockObj.carSlug) ||
              (blockObj.carName && c.tenXe.toLowerCase().includes(blockObj.carName.toLowerCase()))
          ) || availableCars[0];
          blockObj = {
            ...blockObj,
            carName: matched?.tenXe || blockObj.carName || 'Hyundai Accent',
            carSlug: matched?.slug || blockObj.carSlug || 'hyundai-accent',
            carPrice: matched?.minPrice || matched?.giaNiemYetTu || blockObj.carPrice || 439000000,
            carImage: matched?.anhDaiDienUrl || blockObj.carImage || '',
            seatCount: blockObj.seatCount || (matched?.seatRange ? parseInt(matched.seatRange) : 5) || 5,
            fuelType: matched?.fuelType || blockObj.fuelType || 'Xăng',
          };
        }

        resultData.blocks = [blockObj];
        resultData.text = blockObj.content || blockObj.title || '';
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
