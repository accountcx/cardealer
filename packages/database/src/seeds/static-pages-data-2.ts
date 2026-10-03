import type { SeedPageItem } from './static-pages-data-1';

// 4. Thủ tục mua xe trả góp (Financing Guide) - Hướng dẫn từ Chuyên viên tư vấn
export const installmentGuidePage: SeedPageItem = {
  title: 'Thủ Tục Mua Xe Trả Góp',
  slug: 'thu-tuc-mua-xe-tra-gop',
  templateType: 'FINANCE',
  schemaType: 'FinancialProduct',
  metaTitle: 'Hướng Dẫn Thủ Tục Mua Xe Hyundai Trả Góp Chi Tiết | Chuyên Viên Tư Vấn',
  metaDescription: 'Chính sách vay mua xe ô tô Hyundai trả góp tối đa 80-85%, thời hạn vay tới 8 năm. Chuyên viên tư vấn đồng hành hướng dẫn hồ sơ cá nhân và doanh nghiệp.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Chính Sách Vay Mua Xe Trả Góp' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Với sự liên kết chặt chẽ cùng mạng lưới ngân hàng uy tín hàng đầu (Vietcombank, BIDV, Techcombank, VIB, Shinhan Bank...), tôi sẽ hỗ trợ quý khách lựa chọn gói vay có lãi suất thấp nhất và thủ tục đơn giản nhất:',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: 'Hạn Mức & Thời Hạn Vay Tối Ưu',
          content: '• Hạn mức vay: Hỗ trợ vay tối đa 80% - 85% giá trị xe (Quý khách chỉ cần chuẩn bị trước 15% - 20%).\n• Thời gian vay: Linh hoạt từ 2 năm đến 8 năm (lên đến 96 tháng) tùy nhu cầu.\n• Lãi suất: Ưu đãi cố định trong thời gian đầu, biên độ sau ưu đãi rõ ràng, minh bạch.\n• Trả nợ linh hoạt: Tính trên dư nợ giảm dần, có thể tất toán trước hạn.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Hồ Sơ Cần Thiết Quý Khách Cần Chuẩn Bị' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Tôi sẽ trực tiếp hỗ trợ quý khách chuẩn bị và hoàn thiện hồ sơ nhanh chóng, không mất nhiều thời gian đi lại:',
          },
        ],
      },
      {
        type: 'prosConsBlock',
        attrs: {
          title: 'Hồ Sơ Yêu Cầu Theo Từng Đối Tượng',
          pros: [
            'Khách hàng Cá nhân: CCCD gắn chip (của cả 2 vợ chồng nếu đã kết hôn), Giấy đăng ký kết hôn hoặc Giấy xác nhận tình trạng độc thân.',
            'Chứng minh thu nhập cá nhân: Hợp đồng lao động, sao kê lương 6 tháng gần nhất (hoặc sổ sách ghi chép, hợp đồng cho thuê nhà/xe nếu kinh doanh tự do).',
            'Tôi sẵn sàng hỗ trợ khách hàng kinh doanh tự do chứng minh nguồn thu thực tế.',
          ],
          cons: [
            'Khách hàng Doanh nghiệp: Giấy phép Đăng ký kinh doanh, CCCD của Người đại diện theo pháp luật.',
            'Báo cáo tài chính & Tờ khai thuế 1 năm gần nhất, Sao kê tài khoản ngân hàng của doanh nghiệp 6 tháng gần nhất.',
          ],
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Quy Trình 4 Bước Từ Đặt Cọc Đến Nhận Xe' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Bước 1: Quý khách chọn xe và ký hợp đồng đặt cọc mua xe trực tiếp tại showroom Hyundai Vinh.\nBước 2: Tôi kết nối chuyên viên ngân hàng thẩm định hồ sơ và phát hành Thông báo cho vay (Cam kết giải ngân) trong 24 - 48 giờ.\nBước 3: Quý khách đóng số tiền đối ứng còn lại, tôi sẽ đại diện hỗ trợ đăng ký biển số, đăng kiểm xe trọn gói.\nBước 4: Quý khách ký giải ngân tại ngân hàng, tôi tiến hành bàn giao xe và toàn bộ giấy tờ tận tay quý khách.',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'info',
          title: 'Hỗ Trợ Xử Lý Hồ Sơ Khó & Hạn Mức Cao',
          content: 'Quý khách có vướng mắc về thủ tục chứng minh tài chính hoặc cần tư vấn phương án vay tối ưu nhất? Hãy liên hệ trực tiếp để tôi hỗ trợ lên phương án chi tiết cho từng trường hợp cụ thể.',
        },
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Tư Vấn Gói Vay Trả Góp Ngay',
          actionType: 'hotline',
          subtext: 'Bảo mật thông tin tín dụng và hỗ trợ tận tâm 24/7',
        },
      },
    ],
  },
};

// 5. Chính sách Bảo hành & Bảo dưỡng (Warranty & Maintenance)
export const warrantyPolicyPage: SeedPageItem = {
  title: 'Chính Sách Bảo Hành & Bảo Dưỡng',
  slug: 'chinh-sach-bao-hanh-bao-duong',
  templateType: 'DEFAULT',
  schemaType: 'WebPage',
  metaTitle: 'Chính Sách Bảo Hành & Bảo Dưỡng Xe Hyundai Chính Hãng Toàn Quốc',
  metaDescription: 'Chính sách bảo hành xe Hyundai 5 năm hoặc 100.000km từ TC Motor. Lịch bảo dưỡng định kỳ và quyền lợi dịch vụ tại các đại lý ủy quyền trên toàn quốc.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Thời Hạn Bảo Hành Chính Hãng' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Tất cả các dòng xe du lịch Hyundai do TC Motor phân phối và tôi tư vấn đến tay quý khách đều áp dụng chính sách bảo hành chính hãng tiêu chuẩn: 5 năm hoặc 100.000 km (tùy điều kiện nào đến trước).',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: 'Phạm Vi Áp Dụng Trên Toàn Quốc',
          content: 'Chính sách bảo hành chính hãng có giá trị tại tất cả các Đại lý ủy quyền của Hyundai trên toàn quốc. Dù quý khách ở Nghệ An, Hà Tĩnh hay di chuyển bất cứ tỉnh thành nào, quyền lợi bảo hành đều được đảm bảo 100%.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Quy Định Các Mốc Bảo Dưỡng Định Kỳ' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Để xe luôn vận hành an toàn và duy trì trọn vẹn quyền lợi bảo hành, quý khách cần thực hiện bảo dưỡng định kỳ theo khuyến cáo của nhà sản xuất:',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'info',
          title: 'Lịch Bảo Dưỡng Định Kỳ Khuyến Nghị',
          content: '• Mốc 1.000 km đầu tiên: Kiểm tra tổng thể xe miễn phí sau thời gian chạy rà.\n• Mốc 5.000 km / 15.000 km / 25.000 km: Bảo dưỡng cấp nhỏ, thay dầu động cơ, kiểm tra hệ thống phanh.\n• Mốc 10.000 km / 20.000 km: Bảo dưỡng cấp trung bình, thay lọc dầu, vệ sinh điều hòa, đảo lốp.\n• Mốc 40.000 km / 80.000 km: Bảo dưỡng cấp lớn, thay thế các loại dầu hộp số, nước làm mát và kiểm tra toàn diện.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Sự Đồng Hành Của Chuyên Viên' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Trong suốt quá trình sử dụng xe, tôi sẽ trực tiếp hỗ trợ quý khách: Nhắc lịch bảo dưỡng định kỳ, đặt hẹn trước với xưởng dịch vụ Hyundai Vinh để không phải chờ đợi, và hỗ trợ hướng dẫn quy trình bảo hiểm khi có sự cố.',
          },
        ],
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Hỗ Trợ Đặt Hẹn Bảo Dưỡng',
          actionType: 'hotline',
          subtext: 'Chuyên viên hỗ trợ kết nối trực tiếp xưởng dịch vụ ủy quyền',
        },
      },
    ],
  },
};

// 6. Điều khoản sử dụng (Terms of Service) - Tuyên bố pháp lý & Saler Disclaimer
export const termsOfServicePage: SeedPageItem = {
  title: 'Điều Khoản Sử Dụng',
  slug: 'dieu-khoan-su-dung',
  templateType: 'DEFAULT',
  schemaType: 'WebPage',
  metaTitle: 'Điều Khoản Sử Dụng Website & Tuyên Bố Pháp Lý | Chuyên Viên Hyundai',
  metaDescription: 'Điều khoản sử dụng website, bản quyền nội dung và tuyên bố miễn trừ trách nhiệm của chuyên viên tư vấn bán hàng đại lý Hyundai Vinh.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Mục Đích Hoạt Động Của Website' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Website này là kênh thông tin cá nhân do Chuyên viên tư vấn kinh doanh tại Đại lý Hyundai Vinh xây dựng và quản lý, nhằm mục đích cung cấp thông tin sản phẩm, chia sẻ kinh nghiệm sử dụng xe và hỗ trợ báo giá tư vấn cho khách hàng quan tâm đến các dòng xe Hyundai.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Tuyên Bố Miễn Trừ Trách Nhiệm' }],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'warning',
          title: 'Tính Chất Tham Khảo Của Bảng Giá & Khuyến Mãi',
          content: 'Bảng giá niêm yết, dự toán chi phí lăn bánh, thông số kỹ thuật và các chương trình khuyến mãi trên website chỉ mang tính chất tham khảo tại thời điểm biên soạn và có thể thay đổi bởi Hyundai Thành Công hoặc Đại lý mà không cần báo trước.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Xác Nhận Giá Trị Thực Tế & Ký Kết Hợp Đồng' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Tôi là chuyên viên tư vấn đại diện giới thiệu và hỗ trợ bán hàng. Mọi giao dịch đặt cọc, thanh toán và ký kết hợp đồng mua bán xe chỉ có giá trị pháp lý khi khách hàng thực hiện trực tiếp tại Showroom Hyundai Vinh và có hợp đồng đóng dấu mộc đỏ pháp nhân của Công ty.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '4. Bản Quyền Nội Dung & Hình Ảnh' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Các bài viết phân tích, hình ảnh chụp thực tế bàn giao xe và video do tôi tự sản xuất thuộc bản quyền của website này. Logo và thương hiệu Hyundai thuộc bản quyền của Hyundai Motor Company và TC Motor.',
          },
        ],
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Liên Hệ Trực Tiếp Để Có Báo Giá Chuẩn Xác',
          actionType: 'hotline',
          subtext: 'Hẹn lịch tư vấn và xem xe trực tiếp tại showroom Hyundai Vinh',
        },
      },
    ],
  },
};
