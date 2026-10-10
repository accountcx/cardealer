import type {
  LocationProfile,
  SegmentProfile,
  CarVersionInput,
  PricingCalculation,
  CalculatedVersionPrice,
} from './ai.types';

// WHY: Domain Knowledge Engine địa phương hóa Nghệ An & Hà Tĩnh để cung cấp thông tin chính xác về thuế, biển số, đặc thù địa hình và thời tiết.
export const LOCAL_PROFILES: Record<string, LocationProfile> = {
  'nghe-an': {
    name: 'Nghệ An',
    plateCode: '37',
    registrationFeePercent: 10,
    plateFee: 1000000,
    areas: ['TP. Vinh', 'Cửa Lò', 'Hoàng Mai', 'Thái Hòa', 'Diễn Châu', 'Quỳnh Lưu', 'Yên Thành', 'Nghi Lộc', 'Nam Đàn', 'Đô Lương', 'Con Cuông'],
    facts: [
      'Tuyến giao thông trọng điểm: Quốc lộ 1A, đường ven biển, đường mòn Hồ Chí Minh, cao tốc Bắc - Nam đoạn Diễn Châu - Bãi Vọt.',
      'Mùa hè chịu ảnh hưởng gió Lào nắng nóng khô rát kéo dài, nhiệt độ ngoài trời thường xuyên trên 40°C → Nhu cầu làm mát cabin nhanh, cửa gió hàng ghế sau và làm mát ghế là trang bị sống còn.',
      'Mùa mưa bão (tháng 9 đến tháng 11) triều cường, nhiều cung đường trũng ngập tại Vinh, Cửa Lò, Nghi Lộc → Khoảng sáng gầm xe và độ đầm chắc khung gầm rất quan trọng.',
      'Miền Tây Nghệ An (Con Cuông, Tương Dương, Quế Phong, Kỳ Sơn) nhiều đèo dốc quanh co → Cần hệ thống cân bằng điện tử, hỗ trợ khởi hành ngang dốc HAC và động cơ khỏe.',
      'Cửa Lò là điểm du lịch mùa hè; nhu cầu người đi làm ăn xa về quê dịp Tết nguyên đán rất lớn.',
    ],
  },
  'ha-tinh': {
    name: 'Hà Tĩnh',
    plateCode: '38',
    registrationFeePercent: 10,
    plateFee: 1000000,
    areas: ['TP. Hà Tĩnh', 'Hồng Lĩnh', 'Kỳ Anh', 'Hương Sơn', 'Đức Thọ', 'Can Lộc', 'Thạch Hà', 'Cẩm Xuyên', 'Nghi Xuân', 'Hương Khê', 'Vũ Quang'],
    facts: [
      'Tuyến giao thông trọng điểm: Quốc lộ 1A, tuyến tránh TP. Hà Tĩnh, cao tốc Diễn Châu - Bãi Vọt - Hàm Nghi - Vũng Áng.',
      'Khu kinh tế Vũng Áng (Kỳ Anh) tập trung đông đảo chuyên gia và doanh nghiệp → Nhu cầu xe công vụ, xe đưa đón và xe gầm cao rất lớn.',
      'Gió phơn Tây Nam mùa hè gay gắt, nhiệt độ mặt đường bỏng rát → Cần điều hòa mát sâu, rèm che nắng và kính cách nhiệt tốt.',
      'Mưa lũ cuối năm thường gây ngập lụt cục bộ nhiều huyện trũng (Cẩm Xuyên, Thạch Hà, Can Lộc) → Ưu tiên xe gầm cao tầm quan sát thoáng.',
      'Phía Tây (Hương Sơn, Hương Khê, Vũ Quang) nhiều đồi núi quanh co, giáp biên giới.',
    ],
  },
};

// WHY: Phân loại theo phân khúc xe để AI chọn đúng tệp khách hàng, ưu tiên trải nghiệm thực tế và tránh ngôn từ rập khuôn.
export const SEGMENT_PROFILES: Record<string, SegmentProfile> = {
  hatchback: {
    label: 'Hatchback / Sedan cỡ nhỏ (A-B) đô thị',
    buyers: 'Người mua xe lần đầu, gia đình trẻ 2-3 người, tài xế kinh doanh dịch vụ taxi công nghệ',
    priorities: 'Bán kính quay vòng nhỏ dễ luồn lách phố chật, ăn xăng ít (5-6L/100km), chi phí bảo dưỡng hạt dẻ, phụ tùng sẵn rẻ, điều hòa làm mát nhanh',
    avoid: 'Tuyệt đối không dùng từ ngữ xa xỉ, không hứa hẹn khả năng off-road hay tốc độ cao',
    angles: ['Chi phí sở hữu tối ưu & Nuôi xe tiết kiệm', 'Chiếc xe che mưa che nắng đầu đời cho gia đình trẻ', 'Hiệu quả kinh tế cho việc chạy dịch vụ'],
  },
  sedan: {
    label: 'Sedan hạng B-C lịch lãm',
    buyers: 'Nhân viên công sở, doanh nhân trẻ, gia đình 3-4 người, người nâng cấp từ xe máy/xe hạng A',
    priorities: 'Thiết kế thể thao khí động học, cảm giác lái đầm chắc trên cao tốc Diễn Châu - Bãi Vọt, cốp sau rộng rãi, độ êm ái cách âm tốt khi đi gặp đối tác',
    avoid: 'Không nhấn mạnh khả năng lội nước hay gầm cao địa hình',
    angles: ['Lịch lãm đi làm, đầm chắc đi đường dài cao tốc', 'Nâng cấp trải nghiệm tiện nghi và an toàn cho gia đình', 'Hình ảnh thành đạt khi gặp đối tác kinh doanh'],
  },
  suv: {
    label: 'SUV / Crossover gầm cao đa dụng',
    buyers: 'Gia đình 4-7 người, người hay về quê đường xa, doanh nhân thường xuyên đi công tác tỉnh',
    priorities: 'Khoảng sáng gầm cao tự tin lội qua đoạn ngập mùa mưa bão, hệ dẫn động HTRAC bám đường đèo dốc, gói an toàn SmartSense chủ động, khoang hành lý lớn gập phẳng',
    avoid: 'Không tâng bốc thành xe siêu địa hình chuyên nghiệp (chỉ là SUV đô thị & đường trường)',
    angles: ['Tự tin vượt đường ngập mùa mưa bão miền Trung & đèo dốc miền Tây', 'Không gian tiện nghi bảo vệ an toàn cho cả gia đình', 'Sự bền bỉ và đẳng cấp trên những hành trình xuyên tỉnh'],
  },
  mpv: {
    label: 'MPV 7 chỗ chuyên chở gia đình & dịch vụ cao cấp',
    buyers: 'Gia đình đông thành viên đa thế hệ, công ty đưa đón chuyên gia, cá nhân chạy xe hợp đồng',
    priorities: 'Cửa trượt điện thông minh 2 bên tiện lợi cho người già/trẻ nhỏ, hàng ghế thương gia Captain thư giãn, ngồi đủ 7 người lớn không bị gò bó, cửa gió điều hòa từng hàng ghế',
    avoid: 'Không tập trung vào cảm giác lái bốc hay phong cách thể thao đua xe',
    angles: ['Sự êm ái tối đa cho cả gia đình đông người về quê dịp Tết', 'Giải pháp vận tải cao cấp, hoàn vốn nhanh và bền bỉ', 'Không gian rộng rãi, chăm sóc chu đáo từng vị trí ngồi'],
  },
  ev: {
    label: 'Xe điện thông minh thế hệ mới',
    buyers: 'Người yêu thích công nghệ xanh, cư dân đô thị có chỗ sạc tiện lợi',
    priorities: 'Vận hành êm ái tuyệt đối không mùi xăng, chi phí sạc siêu rẻ so với xăng, tính năng V2L cấp điện cắm trại, công nghệ hỗ trợ lái ADAS',
    avoid: 'Không nói về tiếng động cơ hay hộp số theo kiểu xe xăng truyền thống',
    angles: ['Kỷ nguyên xanh êm ái, tiết kiệm chi phí vận hành mỗi ngày', 'Trải nghiệm công nghệ lái xe tương lai'],
  },
};

// WHY: Tính toán chính xác chi phí lăn bánh và dự toán trả trước theo mức thuế địa phương (10%) và phí biển số thực tế.
export function calculateCarPricing(
  carVersions: CarVersionInput[],
  locProfile: LocationProfile
): PricingCalculation {
  const regPercent = locProfile.registrationFeePercent;
  const plateFee = locProfile.plateFee || 0;

  let minDownPayment = 0;

  const versionPrices: CalculatedVersionPrice[] = carVersions.map((v) => {
    const listed = Number(v.giaNiemYet) || 500000000;
    const discount = v.giaKhuyenMai && Number(v.giaKhuyenMai) < listed ? listed - Number(v.giaKhuyenMai) : 0;
    const baseForTax = listed - discount;
    const regFee = Math.round((baseForTax * regPercent) / 100);
    // Lăn bánh tạm tính = Giá sau ưu đãi + Thuế trước bạ + Phí cấp biển số
    const rollingPrice = baseForTax + regFee + plateFee;

    // Dự toán trả trước từ: 15% giá xe + thuế trước bạ + phí biển số
    const downPayment = Math.round(baseForTax * 0.15 + regFee + plateFee);
    if (!minDownPayment || downPayment < minDownPayment) {
      minDownPayment = downPayment;
    }

    return {
      version: v.tenPhienBan,
      listedPrice: listed,
      discount,
      rollingPrice,
      note: discount > 0 ? `Ưu đãi trực tiếp ${discount.toLocaleString('vi-VN')} đ` : 'Báo giá tiêu chuẩn',
    };
  });

  // Làm tròn trả trước từ tới triệu đồng gần nhất
  const traTruocTu = Math.ceil(minDownPayment / 1000000) * 1000000;

  return {
    registrationPercent: regPercent,
    plateFee,
    traTruocTu: traTruocTu || 120000000,
    versionPrices,
  };
}
