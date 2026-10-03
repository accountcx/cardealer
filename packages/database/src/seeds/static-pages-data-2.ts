import type { SeedPageItem } from './static-pages-data-1';

// 4. Thủ tục mua xe trả góp (Financing Guide)
export const installmentGuidePage: SeedPageItem = {
  title: 'Thủ Tục Mua Xe Trả Góp',
  slug: 'thu-tuc-mua-xe-tra-gop',
  templateType: 'FINANCE',
  schemaType: 'FinancialProduct',
  metaTitle: 'Hướng Dẫn Thủ Tục Mua Xe Hyundai Trả Góp Lãi Suất Tốt Nhất',
  metaDescription: 'Chính sách vay mua xe ô tô Hyundai trả góp lên tới 85% giá trị xe, thời hạn vay tối đa 8 năm. Hướng dẫn hồ sơ cá nhân và doanh nghiệp chi tiết.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Chính Sách & Lợi Ích Gói Vay Mua Xe Trả Góp' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Chương trình hợp tác chiến lược giữa Hyundai Vinh và các ngân hàng lớn (Vietcombank, BIDV, Techcombank, VIB, Shinhan Bank...) mang đến giải pháp tài chính linh hoạt, giúp bạn sở hữu ô tô ngay hôm nay chỉ với chi phí ban đầu từ 15 - 20% giá trị xe.',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: 'Hạn Mức & Thời Gian Vay Linh Hoạt',
          content: '• Tỷ lệ tài trợ: Hỗ trợ vay tối đa 80% - 85% giá trị hợp đồng mua xe.\n• Thời hạn vay vốn: Linh hoạt kéo dài từ 2 đến 8 năm (24 - 96 tháng).\n• Lãi suất ưu đãi: Cố định ưu đãi trong 12 - 24 tháng đầu tiên.\n• Phương thức trả nợ: Dư nợ giảm dần, giảm bớt áp lực tài chính hàng tháng.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Hồ Sơ Cần Chuẩn Bị (Đơn Giản & Nhanh Gọn)' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Đội ngũ tư vấn sẽ hỗ trợ thu thập hồ sơ và xử lý phê duyệt hạn mức trước khi bạn ký hợp đồng mua xe:',
          },
        ],
      },
      {
        type: 'prosConsBlock',
        attrs: {
          title: 'Hồ Sơ Yêu Cầu Theo Đối Tượng Khách Hàng',
          pros: [
            'Khách hàng Cá nhân: CCCD gắn chip (vợ & chồng nếu đã kết hôn), Giấy đăng ký kết hôn / Xác nhận độc thân.',
            'Chứng minh thu nhập cá nhân: Hợp đồng lao động, sao kê lương 6 tháng gần nhất (hoặc giấy tờ chứng minh nguồn thu kinh doanh tự do).',
            'Chuyên viên hỗ trợ thẩm định tận nhà đối với khách hàng tự kinh doanh.',
          ],
          cons: [
            'Khách hàng Doanh nghiệp: Giấy chứng nhận ĐKKD, CCCD của Người đại diện pháp luật.',
            'Báo cáo tài chính & Tờ khai thuế 1 năm gần nhất, Sao kê tài khoản ngân hàng của Công ty 6 tháng gần nhất.',
          ],
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Quy Trình Mua Xe Trả Góp 4 Bước Chuẩn' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Bước 1: Ký hợp đồng mua bán xe và đặt cọc tại showroom Hyundai Vinh.\nBước 2: Chuyên viên ngân hàng liên hệ thu thập hồ sơ và ra Thông báo cho vay (Cam kết giải ngân) trong 24 - 48 giờ.\nBước 3: Khách hàng thanh toán phần tiền đối ứng còn lại và đại lý tiến hành đăng ký biển số xe.\nBước 4: Ký hợp đồng tín dụng tại ngân hàng, nhận giải ngân và Showroom tiến hành bàn giao xe tận tay quý khách.',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'info',
          title: 'Hỗ Trợ Xử Lý Hồ Sơ Khó',
          content: 'Quý khách gặp khó khăn về chứng minh thu nhập hoặc có lịch sử nợ cần giải trình? Đội ngũ tư vấn tín dụng giàu kinh nghiệm của chúng tôi luôn sẵn sàng hỗ trợ tìm giải pháp ngân hàng phù hợp nhất.',
        },
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Đăng Ký Tư Vấn Gói Vay Tối Ưu',
          actionType: 'hotline',
          subtext: 'Bảo mật tuyệt đối thông tin tín dụng khách hàng',
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
  metaTitle: 'Chính Sách Bảo Hành & Bảo Dưỡng Ô Tô Hyundai Chính Hãng',
  metaDescription: 'Chính sách bảo hành xe Hyundai 5 năm hoặc 100.000km từ TC Motor. Lịch bảo dưỡng định kỳ và quyền lợi dịch vụ tại đại lý ủy quyền toàn quốc.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Thời Hạn & Điều Kiện Bảo Hành Chính Hãng' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Tất cả các dòng xe ô tô du lịch Hyundai phân phối chính hãng bởi TC Motor (Hyundai Thành Công) đều được áp dụng chế độ bảo hành chính hãng tiêu chuẩn: 5 năm hoặc 100.000 km (tùy theo điều kiện nào đến trước).',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: 'Phạm Vi Hiệu Lực Toàn Quốc',
          content: 'Sổ bảo hành điện tử của quý khách có giá trị tại tất cả các Đại lý ủy quyền 3S của Hyundai trên toàn lãnh thổ Việt Nam. Quý khách hoàn toàn an tâm khi di chuyển công tác hoặc du lịch đường dài.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Các Mốc Bảo Dưỡng Định Kỳ Tiêu Chuẩn' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Để xe luôn vận hành êm ái, an toàn và duy trì hiệu lực bảo hành trọn vẹn, quý khách cần thực hiện bảo dưỡng theo các cấp độ định kỳ khuyến nghị từ nhà sản xuất:',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'info',
          title: 'Lịch Bảo Dưỡng Khuyến Nghị',
          content: '• Cấp 1 (1.000 km đầu tiên): Kiểm tra tổng thể miễn phí ban đầu, siết ốc gầm và cân chỉnh.\n• Cấp nhỏ (Mỗi 5.000 km hoặc 3 - 6 tháng): Thay dầu động cơ, kiểm tra lọc gió và hệ thống phanh.\n• Cấp trung bình (Mỗi 10.000 km / 20.000 km): Thay lọc dầu, vệ sinh hệ thống điều hòa, đảo lốp xe.\n• Cấp lớn (Mỗi 40.000 km / 80.000 km): Thay dầu hộp số, nước làm mát, dầu phanh, bugi và kiểm tra toàn diện.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Quyền Lợi Khi Bảo Dưỡng Tại Xưởng Dịch Vụ Hyundai' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '• 100% phụ tùng, dầu nhớt và vật tư thay thế chính hãng có tem mác nguồn gốc rõ ràng.\n• Thiết bị chẩn đoán chuyên sâu GDS Mobile độc quyền từ Hyundai toàn cầu.\n• Đội ngũ cố vấn dịch vụ và kỹ thuật viên đạt chứng chỉ chuyên môn cao cấp.',
          },
        ],
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Đặt Hẹn Dịch Vụ & Bảo Dưỡng',
          actionType: 'hotline',
          subtext: 'Ưu tiên tiếp nhận nhanh và giảm thời gian chờ đợi tại xưởng',
        },
      },
    ],
  },
};

// 6. Điều khoản sử dụng (Terms of Service)
export const termsOfServicePage: SeedPageItem = {
  title: 'Điều Khoản Sử Dụng',
  slug: 'dieu-khoan-su-dung',
  templateType: 'DEFAULT',
  schemaType: 'WebPage',
  metaTitle: 'Điều Khoản Sử Dụng Website & Tuyên Bố Pháp Lý | Hyundai Vinh',
  metaDescription: 'Điều khoản sử dụng, bản quyền nội dung và tuyên bố miễn trừ trách nhiệm về thông tin bảng giá xe trên website đại lý Hyundai Vinh.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Chấp Thuận Các Điều Khoản' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Chào mừng quý khách đến với website chính thức của chuyên viên tư vấn đại lý Hyundai Vinh. Bằng việc truy cập, tham khảo bảng giá hoặc gửi thông tin liên hệ, quý khách đồng ý tuân thủ các điều khoản và quy định được nêu rõ dưới đây.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Tuyên Bố Miễn Trừ Trách Nhiệm Về Giá & Thông Số' }],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'warning',
          title: 'Tính Chất Tham Khảo Của Bảng Giá',
          content: 'Mọi thông tin về giá niêm yết, dự toán chi phí lăn bánh, mức giảm giá và thông số kỹ thuật xe trên website mang tính chất tham khảo tại thời điểm cập nhật. Nhà phân phối TC Motor và Đại lý có quyền thay đổi trang bị hoặc chính sách giá mà không cần thông báo trước.',
        },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Mọi giao dịch mua bán, thỏa thuận tiền cọc hoặc chính sách khuyến mãi chỉ có giá trị pháp lý ràng buộc khi được xác nhận bằng Hợp đồng mua bán xe có dấu mộc đỏ pháp nhân của Công ty ký kết trực tiếp tại Showroom.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Quyền Sở Hữu Trí Tuệ & Bản Quyền' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Logo Hyundai và các nhãn hiệu liên quan thuộc sở hữu của Hyundai Motor Company. Toàn bộ bài viết phân tích, hình ảnh thực tế bàn giao xe, infographic và nội dung sáng tạo trên website thuộc quyền sở hữu của Ban quản trị. Mọi hành vi sao chép nhằm mục đích thương mại mà chưa được sự đồng ý bằng văn bản đều là vi phạm bản quyền.',
          },
        ],
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Liên Hệ Showroom Trực Tiếp',
          actionType: 'hotline',
          subtext: 'Đến trực tiếp showroom để ký hợp đồng và nhận quyền lợi tốt nhất',
        },
      },
    ],
  },
};
