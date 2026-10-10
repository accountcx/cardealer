import type { PromptBuilderInput } from '../ai.types';

// WHY: Xây dựng Prompt sinh toàn bộ nội dung tiếp thị dòng xe (generate_car_content) với xoay vòng góc tiếp cận, dữ liệu lăn bánh thực tế và tri thức địa phương.
export function buildCarContentPrompt(
  input: PromptBuilderInput,
  availableCarsListText: string,
  existingArticlesText = ''
): { userPrompt: string; defaultTokenLimit: number } {
  const { prompt, keyword, carModel, location, locProfile, segmentProfile, calculatedPricing } = input;
  const targetLocation = location || 'Nghệ An & Hà Tĩnh';
  const targetCar = carModel || 'Xe ô tô Hyundai';
  const targetKeyword = keyword || (prompt.length > 5 && prompt.length < 50 ? prompt : `Đánh giá ${targetCar} tại ${targetLocation}`);

  // Chuẩn bị danh sách phiên bản thực tế để AI bám sát
  const groundedVersionsText = calculatedPricing.versionPrices
    .map(
      (v) =>
        `- Phiên bản "${v.version}": Giá niêm yết ${v.listedPrice.toLocaleString('vi-VN')} đ (Lăn bánh tạm tính tại ${
          locProfile.name
        }: ~${v.rollingPrice.toLocaleString('vi-VN')} đ)`
    )
    .join('\n');

  // Xoay vòng Góc tiếp cận (Angles)
  const candidateAngles = segmentProfile.angles || [
    'Gia đình, du lịch & sinh hoạt tiện nghi',
    'Vận hành đường dài, cao tốc & cảm giác lái',
    'Thích ứng thời tiết & địa hình thực tế',
    'Kinh tế, chi phí lăn bánh & nuôi xe tối ưu',
  ];
  const randomAngle = candidateAngles[Math.floor(Math.random() * candidateAngles.length)];

  // Chọn ngẫu nhiên 2-3 khu vực cụ thể từ danh sách huyện/thị
  const shuffledAreas = [...locProfile.areas].sort(() => 0.5 - Math.random());
  const focusAreas = shuffledAreas.slice(0, 3);

  // 3 Phong cách dàn ý (Outlines) xoay vòng
  const outlineTypes = [
    {
      key: 'tinh_huong_trai_nghiem',
      name: 'Dàn ý 1: Đánh giá Trải nghiệm thực tế & Gia đình (Review chuyên sâu - Không ép bảng giá)',
      steps: [
        '1. Đoạn mở đầu (paragraph): Kể một câu chuyện trải nghiệm chân thực của người lái hoặc sinh hoạt gia đình tại ' +
          focusAreas.join(', ') +
          '.',
        `2. Thẻ H2 phân tích dòng xe ${targetCar} sinh ra dành cho ai và giải quyết các nhu cầu gì trong cuộc sống.`,
        '3. Thẻ H2 trải nghiệm không gian khoang lái, sự thoải mái hàng ghế sau và tiện ích giải trí giải nhiệt ngày hè.',
        '4. Thẻ H2 cảm giác lái, sức mạnh động cơ và gói an toàn Hyundai SmartSense trên các cung đường địa phương.',
        `5. Thẻ H2 bảng thông số kỹ thuật chi tiết các phiên bản -> specTable.`,
        '6. prosCons: 3-4 Ưu điểm nổi bật và 1-2 Điểm cần lưu ý khách quan.',
        `7. faq: BẮT BUỘC 3-5 câu hỏi thường gặp thiết thực nhất (về bảo hành 5 năm, lái thử tại ${locProfile.name}, chi phí sử dụng).`,
        '8. leadForm (Đăng ký lái thử tận nhà) -> ctaButton (Gọi Hotline tư vấn).',
      ],
    },
    {
      key: 'gia_truoc',
      name: 'Dàn ý 2: Bảng giá niêm yết & Dự toán chi phí lăn bánh (Tập trung tài chính)',
      steps: [
        '1. Đoạn mở đầu (paragraph): Giới thiệu nhanh xe hợp với ai, mức giá khởi điểm và nhu cầu đi lại thực tế tại ' +
          focusAreas.join(', ') +
          '.',
        `2. Thẻ H2 về giá xe và dự toán chi phí lăn bánh tại ${locProfile.name} -> priceTable -> callout chính sách ưu đãi & hỗ trợ trả góp.`,
        '3. Thẻ H2 trải nghiệm không gian nội thất, độ tiện nghi và giá trị sử dụng lâu dài.',
        '4. Thẻ H2 khả năng vận hành thực tế, độ đầm chắc khung gầm và an toàn.',
        '5. prosCons (Ưu & nhược điểm) -> faq (BẮT BUỘC 3-5 câu hỏi đáp) -> leadForm -> ctaButton.',
      ],
    },
    {
      key: 'so_sanh_chon_ban',
      name: 'Dàn ý 3: So sánh & Tư vấn chọn phiên bản phù hợp (So sánh trang bị)',
      steps: [
        `1. Đoạn mở đầu (paragraph): Đặt ra bài toán phân vân thường gặp của khách hàng tại ${focusAreas.join(
          ', '
        )} khi đứng trước các phiên bản của ${targetCar}.`,
        `2. Thẻ H2 so sánh sự khác biệt cốt lõi giữa các phiên bản ${targetCar} và lời khuyên nên chọn bản nào -> specTable.`,
        `3. Thẻ H2 bảng giá chi tiết và dự toán chi phí lăn bánh từng phiên bản tại ${locProfile.name} -> priceTable -> callout hỗ trợ mua xe.`,
        '4. Thẻ H2 đánh giá trang bị ngoại thất, tiện nghi và công nghệ an toàn SmartSense.',
        '5. prosCons -> faq (BẮT BUỘC 3-5 câu hỏi đáp) -> leadForm -> ctaButton.',
      ],
    },
  ];
  const selectedOutline = outlineTypes[Math.floor(Math.random() * outlineTypes.length)];

  const userPrompt = `<NHIEM_VU>
Viết toàn bộ nội dung tiếp thị & bài viết đánh giá chuyên sâu cho dòng xe: "${targetCar}" tại thị trường ${locProfile.name} (biển số ${locProfile.plateCode}).
Từ khóa chính mục tiêu (Focus Keyword): "${targetKeyword}".
${prompt ? `Ghi chú / Yêu cầu riêng từ người dùng: "${prompt}"\n` : ''}
Tuyệt đối tuân thủ nguyên tắc chống trùng lặp: bài viết phải mang bản sắc riêng của ${targetCar}, không sao chép góc nhìn hay từ khóa của các dòng xe khác.
</NHIEM_VU>

<GOC_TIEP_CAN_CHU_DAO>
Góc tiếp cận bài viết: "${randomAngle}".
Dùng góc này làm sợi chỉ đỏ xuyên suốt bài viết, giải thích tính năng bằng trải nghiệm thực tế thay vì liệt kê thông số khô khan.
</GOC_TIEP_CAN_CHU_DAO>

<CAU_TRUC_DAN_Y_BAI_VIET>
Cấu trúc dàn ý được áp dụng: "${selectedOutline.name}".
Thực hiện các khối nội dung theo trình tự sau (Tên các thẻ H2 phải tự đặt sáng tạo, tự nhiên, KHÔNG dùng số thứ tự kiểu "1. Giá xe..."):
${selectedOutline.steps.map((s) => `- ${s}`).join('\n')}
</CAU_TRUC_DAN_Y_BAI_VIET>

<DU_LIEU_THUC_TE_DAI_LY_BAT_BUOC_SU_DUNG>
- Dòng xe: ${targetCar}
- Phân khúc: ${segmentProfile.label}
- Khách hàng mục tiêu: ${segmentProfile.buyers}
- Nhu cầu trọng tâm của họ: ${segmentProfile.priorities}
- Cần tránh: ${segmentProfile.avoid}
- Dự toán trả trước từ: ${calculatedPricing.traTruocTu.toLocaleString('vi-VN')} đ (Đã tính bao gồm 15% xe + 100% lệ phí trước bạ và phí đăng ký tại ${locProfile.name}).
- Các phiên bản thực tế đang phân phối tại đại lý:
${groundedVersionsText}
${availableCarsListText}
${existingArticlesText ? `${existingArticlesText}\n` : ''}
</DU_LIEU_THUC_TE_DAI_LY_BAT_BUOC_SU_DUNG>

<TRI_THUC_DIA_PHUONG_${locProfile.plateCode}>
Khu vực địa phương ưu tiên nhắc trong bài này: ${focusAreas.join(', ')}.
Đặc thù sử dụng xe thực tế tại ${locProfile.name}:
${locProfile.facts.map((f) => `- ${f}`).join('\n')}
</TRI_THUC_DIA_PHUONG_${locProfile.plateCode}>

<QUY_TAC_TIEU_DE_CHUAN_VA_CHONG_RAP_KHUON>
1. TIÊU ĐỀ BÁO CHÍ CHUYÊN NGHIỆP:
   - Chữ cái đầu câu BẮT BUỘC viết hoa (Sentence Case).
   - Tên thương hiệu và dòng xe BẮT BUỘC viết hoa chuẩn danh từ riêng: "${targetCar}" (TUYỆT ĐỐI KHÔNG viết thường dạng "${targetCar.toLowerCase()}").
   - Từ khóa chính được viết hoa tự nhiên theo ngữ pháp tiếng Việt (ví dụ: "Giá Xe ${targetCar}", "Đánh Giá ${targetCar}").
   - TUYỆT ĐỐI CẤM dùng công thức ghép chuỗi máy móc kèm dấu hai chấm kiểu: "${targetKeyword}: tiện nghi, an toàn..." hoặc "[từ khóa]: [mô tả]".
   - Hãy đặt tiêu đề hấp dẫn như bài báo chuyên ngành ô tô:
     + Phong cách 1: "Đánh Giá ${targetCar} Mới Nhất: Trải Nghiệm Tiện Nghi & An Toàn Cho Gia Đình"
     + Phong cách 2: "${targetCar} Có Gì Nổi Bật? Đánh Giá Chi Tiết & Giá Lăn Bánh Thực Tế"
     + Phong cách 3: "Giá Xe ${targetCar} Lăn Bánh Bao Nhiêu? Dự Toán Chi Phí & Ưu Đãi Đại Lý"
     + Phong cách 4: "Trải Nghiệm Thực Tế ${targetCar} Tại ${locProfile.name}: Đáng Giá Trong Tầm Tiền"
2. ĐOẠN MỞ ĐẦU TỰ NHIÊN: TUYỆT ĐỐI CẤM mở bài bằng câu cửa miệng máy móc kiểu: "Từ những chuyến đi làm tại [TP] đến hành trình đường dài qua Quốc lộ 1A...". Hãy mở bài bằng câu chuyện trải nghiệm, vấn đề thực tế hoặc sự lựa chọn của khách hàng một cách tự nhiên.
3. KHỐI FAQ LÀ BẮT BUỘC 100%: Mỗi bài viết BẮT BUỘC phải có 1 khối "faq" gồm 3 đến 5 câu hỏi đáp thực tế (Schema FAQPage chuẩn SEO). Tuyệt đối không được bỏ quên FAQ.
4. NGUYÊN TẮC BẰNG CHỨNG (Evidence-based): Mọi lời khen ngợi phải đi kèm số liệu kỹ thuật hoặc tình huống thực tế (mã lực, Nm, màn hình kép, làm mát ghế, phanh khẩn cấp FCA, cảnh báo điểm mù BVM).
5. TUYỆT ĐỐI CẤM từ ngữ so sánh tuyệt đối không có căn cứ ("nhất phân khúc", "số 1", "hoàn hảo", "đỉnh cao").

<QUY_TRINH_HAI_BUOC_VACH_DAN_Y_TRUOC_KHI_VIET>
Bạn phải thực hiện tư duy theo 2 bước rõ ràng:
- Bước 1 (Lập dàn ý): Xác định trường "outline" trong đối tượng "article" gồm 3 đến 5 mục H2 chính kèm ý đồ triển khai.
- Bước 2 (Triển khai blocks): Viết các "blocks" bám sát 100% theo các mục của "outline" đã vạch ra.
</QUY_TRINH_HAI_BUOC_VACH_DAN_Y_TRUOC_KHI_VIET>

YÊU CẦU ĐẦU RA (JSON BẮT BUỘC):
1. "moTaChung": 60-120 từ. Nói về ngôn ngữ thiết kế thực tế của xe, vị thế phân khúc, động cơ chủ lực và chính sách bảo hành chính hãng 5 năm / 100.000km.
2. "promotionSummary": 1-2 câu tóm tắt ngắn gọn chính sách ưu đãi (hỗ trợ lệ phí trước bạ, trả góp lãi suất ưu đãi, nhận xe giao ngay tận nhà tại ${locProfile.name}).
3. "traTruocTu": ${calculatedPricing.traTruocTu} (Số nguyên chính xác).
4. "highlightFeatures": Đúng 6 đối tượng điểm nhấn "ĂN KHÁCH NHẤT" của riêng dòng xe ${targetCar} (Mỗi icon dùng 1 lần):
   - icon: một trong các giá trị ['engine', 'transmission', 'power', 'seat', 'fuel', 'safety', 'dimension', 'screen', 'sensor', 'design', 'ground', 'cargo']
   - title: TIÊU ĐỀ VIẾT HOA NGẮN GỌN
   - value: Thông số thật chính xác của dòng xe (không được sao chép mẫu xe khác).
5. "article": Toàn bộ bài viết chuyên sâu:
   - title: 40-65 ký tự, viết hoa chuẩn ngữ pháp tiếng Việt, phản ánh đúng góc tiếp cận "${randomAngle}".
   - outline: Mảng 3-5 đối tượng [{ "level": 2, "title": "Tiêu đề H2...", "description": "Tóm tắt ý đồ..." }] được vạch ra trước.
   - summary: 2-3 câu mở đầu cuốn hút, chứa từ khóa "${targetKeyword}".
   - focusKeyword: "${targetKeyword}"
   - metaTitle: 45-58 ký tự
   - metaDescription: 125-155 ký tự có từ khóa chính và CTA
   - suggestedKeywords: 4-6 từ khóa LSI (có từ khóa kèm địa danh cụ thể ${focusAreas[0]} / ${locProfile.name})
   - blocks: Mảng từ 8 đến 12 blocks tinh gọn tuân thủ đúng dàn ý "outline" đã vạch ra (BẮT BUỘC CÓ khối faq và prosCons).

TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON:
{
  "moTaChung": "...",
  "promotionSummary": "...",
  "traTruocTu": ${calculatedPricing.traTruocTu},
  "highlightFeatures": [
    { "icon": "engine", "title": "ĐỘNG CƠ", "value": "..." }
  ],
  "article": {
    "title": "Tiêu đề chuẩn mực viết hoa đúng ngữ pháp...",
    "outline": [
      { "level": 2, "title": "Tiêu đề H2 thứ 1...", "description": "Tóm tắt ý triển khai..." }
    ],
    "summary": "...",
    "focusKeyword": "${targetKeyword}",
    "metaTitle": "...",
    "metaDescription": "...",
    "suggestedKeywords": ["..."],
    "blocks": []
  }
}`;

  return {
    userPrompt,
    defaultTokenLimit: 6500,
  };
}
