// 🧠 Mental Model: Prompt Builder chuyên biệt cho AI 30-Day Editorial Planner (US-07).
// Lập kế hoạch biên tập bài viết định kỳ trong tháng (12 - 30 bài) theo Chiến Lược 3 Cụm Chủ Đề (Topic Clusters):
// Cụm 1: So sánh xe (MOFU - Tucson vs CX-5, Accent vs Vios...)
// Cụm 2: Thủ tục & Tài chính (BOFU/Local E-E-A-T - Mua xe trả góp A-Z, đăng ký bấm biển Nghệ An/Hà Tĩnh, lăn bánh...)
// Cụm 3: Đánh giá chi tiết (Reviews & Ownership - Tiêu hao nhiên liệu, chi phí bảo dưỡng, SmartSense cao tốc Diễn Châu - Bãi Vọt...)

import { formatExistingArticlesBlacklist } from '@cardealer/core';
import type { AiCarSummary, TopicClusterType } from '@cardealer/types';
import type { ExistingCarArticleSummary } from '../ai.types';

export interface BuildEditorialPlanPromptInput {
  targetMonthCount?: number;
  targetCar?: string;
  categoryName?: string;
  availableCars?: AiCarSummary[];
  existingArticles?: ExistingCarArticleSummary[];
  location?: string;
  clusterStrategy?: TopicClusterType;
}

export function buildEditorialPlanPrompt(input: BuildEditorialPlanPromptInput): string {
  const {
    targetMonthCount = 12,
    targetCar = 'Đa dạng các dòng xe trong showroom',
    categoryName,
    availableCars = [],
    existingArticles = [],
    location = 'Nghệ An & Hà Tĩnh',
    clusterStrategy = 'all',
  } = input;

  const blacklistText = formatExistingArticlesBlacklist(existingArticles, 50);

  const carsListText =
    availableCars.length > 0
      ? `\nDANH SÁCH DÒNG XE TRONG SHOWROOM:\n` +
        availableCars.map((c, i) => `${i + 1}. ${c.tenXe} (slug: ${c.slug})`).join('\n')
      : '';

  let strategyInstruction = '';
  switch (clusterStrategy) {
    case 'comparison':
      strategyInstruction = `CHIẾN LƯỢC TRỌNG TÂM: CỤM 1 - SO SÁNH XE ĐỐI THỦ (100% BÀI VIẾT)
Toàn bộ ${targetMonthCount} bài viết phải thuộc Cụm 1 (cluster = "comparison"): So sánh trực diện các dòng xe trong showroom với đối thủ cùng phân khúc trên thị trường (Ví dụ: So sánh Tucson và CX-5, So sánh Accent và Vios, So sánh Creta và Seltos, So sánh Santa Fe và Everest/Sorento). Phân tích công tâm về không gian nội thất, vận hành, độ an toàn và giá lăn bánh, kèm lời mời lái thử trực tiếp.`;
      break;

    case 'finance_procedure':
      strategyInstruction = `CHIẾN LƯỢC TRỌNG TÂM: CỤM 2 - THỦ TỤC & TÀI CHÍNH ĐỊA PHƯƠNG (100% BÀI VIẾT)
Toàn bộ ${targetMonthCount} bài viết phải thuộc Cụm 2 (cluster = "finance_procedure"): Hướng dẫn thủ tục mua xe trả góp từ A-Z, điều kiện vay ngân hàng, hồ sơ chứng minh thu nhập, quy trình nộp thuế trước bạ và bấm biển số tại ${location}, cách tính chi phí lăn bánh trọn gói, giải pháp tài chính tối ưu cho doanh nghiệp và gia đình trẻ.`;
      break;

    case 'detailed_review':
      strategyInstruction = `CHIẾN LƯỢC TRỌNG TÂM: CỤM 3 - ĐÁNH GIÁ CHI TIẾT & CHI PHÍ NUÔI XE (100% BÀI VIẾT)
Toàn bộ ${targetMonthCount} bài viết phải thuộc Cụm 3 (cluster = "detailed_review"): Đánh giá thực tế mức tiêu hao nhiên liệu (đường hỗn hợp vs phố đông), bảng dự toán chi phí bảo dưỡng từng cấp độ (5.000km, 10.000km, 40.000km), đánh giá trải nghiệm gói công nghệ an toàn SmartSense khi chạy thực tế (ví dụ: trên cao tốc Diễn Châu - Bãi Vọt), mẹo bảo dưỡng và chăm sóc xe mùa hè miền Trung.`;
      break;

    case 'all':
    default:
      strategyInstruction = `CHIẾN LƯỢC TOÀN DIỆN: CÂN BẰNG 3 CỤM CHỦ ĐỀ (TOPIC CLUSTER RATIO):
Phân bổ đều ${targetMonthCount} bài viết theo tỷ lệ 3 cụm nội dung chính:
- 40% Cụm 1 - So sánh xe ("cluster": "comparison"): So sánh đối đầu Tucson vs CX-5, Accent vs Vios, Creta vs Seltos, Santa Fe vs Everest...
- 30% Cụm 2 - Thủ tục & Tài chính ("cluster": "finance_procedure"): Hướng dẫn mua xe trả góp A-Z, quy trình đăng ký bấm biển số tại ${location}, chi phí lăn bánh trọn gói...
- 30% Cụm 3 - Đánh giá chi tiết ("cluster": "detailed_review"): Đánh giá thực tế mức tiêu hao nhiên liệu, chi phí bảo dưỡng từng cấp độ km, Hyundai SmartSense trên cao tốc Diễn Châu - Bãi Vọt...`;
      break;
  }

  return `Bạn là Giám Đốc Kế Hoạch Nội Dung SEO (Head of Content & SEO Strategy) cho showroom ô tô tại ${location}.

MỤC TIÊU CỐT LÕI:
Thiết kế một KẾ HOẠCH BIÊN TẬP NỘI DUNG 30 NGÀY gồm đúng ${targetMonthCount} BÀI VIẾT ĐỘC BẢN THEO CHIẾN LƯỢC TOPIC CLUSTER, phân bổ đều từ ngày 1 đến ngày 30 trong tháng.
Mỗi bài viết phải giải quyết một nhu cầu tìm kiếm cụ thể, đa dạng góc nhìn, tuyệt đối KHÔNG TRÙNG LẶP từ khóa hay nội dung với các bài đã có trên website.

THÔNG TIN BỐI CẢNH:
- Số lượng bài cần lập kế hoạch: ${targetMonthCount} bài
- Dòng xe trọng tâm: ${targetCar}
- Chuyên mục ưu tiên: ${categoryName || 'Tự động phân bổ đa dạng (Đánh giá xe, Bảng giá & Lăn bánh, Cẩm nang sử dụng, So sánh xe, Khuyến mãi)'}
- Địa bàn thị trường: ${location}
- Chiến lược cụm chủ đề: ${clusterStrategy}
${strategyInstruction}
${carsListText}
${blacklistText}

NGUYÊN TẮC PHÂN BỔ KẾ HOẠCH 30 NGÀY:
1. Phân bổ ngày xuất bản: Thuộc tính "suggestedDay" là số nguyên từ 1 đến 30, dàn đều theo chu kỳ (ví dụ nếu 10 bài thì cách 3 ngày 1 bài: ngày 2, 5, 8, 11, 14, 17, 20, 23, 26, 29).
2. Phân loại Cụm chủ đề ("cluster"):
   - "comparison": Cụm 1 - So sánh xe đối thủ
   - "finance_procedure": Cụm 2 - Thủ tục & Tài chính mua xe
   - "detailed_review": Cụm 3 - Đánh giá chi tiết & Chi phí nuôi xe
3. Tuyệt đối không trùng từ khóa chính (focusKeyword) giữa các bài trong kế hoạch và với các bài đã có trong danh sách đã có ở trên.

YÊU CẦU BẮT BUỘC ĐẦU RA JSON (Trả về đúng cấu trúc, không markdown thừa):
{
  "planItems": [
    {
      "title": "Tiêu đề bài viết hấp dẫn, tự nhiên, chứa từ khóa, dài 50-70 ký tự",
      "focusKeyword": "từ khóa chính độc nhất từ 2-5 từ",
      "targetCar": "Tên dòng xe cụ thể hoặc Tất cả dòng xe",
      "categorySlug": "danh-gia-xe | bang-gia-xe | cam-nang-lai-xe | tin-khuyen-mai",
      "angle": "Tên góc tiếp cận ngắn gọn (ví dụ: So sánh Tucson Turbo và CX-5 2.5)",
      "summary": "Tóm tắt 2-3 câu định hướng nội dung chi tiết cho bài viết này",
      "cluster": "comparison | finance_procedure | detailed_review",
      "suggestedDay": 1
    }
  ]
}
`;
}
