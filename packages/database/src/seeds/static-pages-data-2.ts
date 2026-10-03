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
  metaDescription: 'Chính sách bảo hành xe Hyundai 5 năm hoặc 100.000km từ TC Motor. Lịch bảo dưỡng định kỳ, các trường hợp loại trừ và quyền lợi dịch vụ tại đại lý ủy quyền.',
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
            text: 'Tất cả ',
          },
          {
            type: 'text',
            text: 'các dòng xe du lịch Hyundai',
            marks: [{ type: 'link', attrs: { href: '/xe' } }],
          },
          {
            type: 'text',
            text: ' do TC Motor phân phối chính hãng và tôi tư vấn đến tay quý khách đều được áp dụng chế độ bảo hành tiêu chuẩn: 5 năm hoặc 100.000 km (tùy điều kiện nào đến trước).',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: 'Phạm Vi Áp Dụng Trên Toàn Quốc',
          content: 'Chính sách bảo hành chính hãng có giá trị tại tất cả các Đại lý ủy quyền 3S của Hyundai trên toàn quốc. Dù quý khách ở Nghệ An, Hà Tĩnh hay di chuyển công tác tại bất kỳ tỉnh thành nào, quyền lợi bảo hành đều được đảm bảo 100%.',
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
            text: 'Để xe luôn vận hành an toàn và duy trì trọn vẹn hiệu lực bảo hành, quý khách cần thực hiện bảo dưỡng định kỳ theo khuyến nghị từ nhà sản xuất:',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'info',
          title: 'Lịch Bảo Dưỡng Định Kỳ Tiêu Chuẩn',
          content: '• Mốc 1.000 km đầu tiên: Kiểm tra tổng thể xe miễn phí sau thời gian chạy rà ban đầu.\n• Mốc 5.000 km / 15.000 km / 25.000 km: Bảo dưỡng cấp nhỏ, thay dầu động cơ, kiểm tra lọc gió và hệ thống phanh.\n• Mốc 10.000 km / 20.000 km: Bảo dưỡng cấp trung bình, thay lọc dầu, vệ sinh điều hòa, đảo lốp xe.\n• Mốc 40.000 km / 80.000 km: Bảo dưỡng cấp lớn, thay thế các loại dầu hộp số, nước làm mát, dầu phanh và kiểm tra toàn diện.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Thông Tin Loại Trừ: Các Trường Hợp Không Được Bảo Hành' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Nhằm đảm bảo tính minh bạch về mặt pháp lý và tránh các tranh chấp không đáng có, chính sách bảo hành chính hãng sẽ không áp dụng chi trả cho các trường hợp sau:',
          },
        ],
      },
      {
        type: 'faqBlock',
        attrs: {
          questions: [
            {
              question: 'Trường hợp nào xe bị từ chối bảo hành do ngoại lực và sử dụng sai mục đích?',
              answer: 'Hãng từ chối bảo hành đối với: (1) Hư hỏng do tai nạn giao thông, va chạm, ngập nước (thủy kích), hỏa hoạn hoặc thiên tai; (2) Sử dụng xe sai mục đích thiết kế (đua xe, chở quá tải trọng, vượt địa hình khắc nghiệt); (3) Sử dụng nhiên liệu, dầu động cơ hoặc dung dịch làm mát không đúng tiêu chuẩn khuyến cáo của Hyundai.',
            },
            {
              question: 'Tự ý độ chế, can thiệp thiết bị điện hoặc phần mềm có bị mất bảo hành không?',
              answer: 'Có. Việc tự ý can thiệp thay đổi kết cấu cơ khí, độ chế hệ thống điện không chính hãng, nâng cấp chip phần mềm ECM hoặc lắp đặt các phụ kiện không rõ nguồn gốc gây chập cháy hay quá tải sẽ làm mất quyền lợi bảo hành đối với các cụm chi tiết liên quan.',
            },
            {
              question: 'Các chi tiết hao mòn tự nhiên có được bảo hành miễn phí không?',
              answer: 'Các bộ phận hao mòn tự nhiên theo thời gian sử dụng như: lưỡi gạt mưa, má phanh, đĩa côn, lốp xe, bóng đèn halogen, cầu chì, và các loại dung dịch tiêu hao sẽ không thuộc phạm vi bảo hành miễn phí (trừ trường hợp phát hiện lỗi vật liệu chế tạo từ nhà máy).',
            },
            {
              question: 'Có được bảo hành nếu sửa chữa tại garage bên ngoài không thuộc ủy quyền?',
              answer: 'Nếu xe gặp sự cố bắt nguồn trực tiếp từ việc sửa chữa, thay thế phụ tùng giả mạo tại các cơ sở garage không được Hyundai ủy quyền, hãng sẽ từ chối bảo hành cho hạng mục hư hỏng phát sinh đó.',
            },
          ],
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '4. Sự Đồng Hành & Liên Kết Tiện Ích Cho Khách Hàng' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Trong suốt vòng đời sử dụng xe, tôi luôn sẵn sàng hỗ trợ quý khách: Nhắc lịch bảo dưỡng định kỳ, hỗ trợ đặt hẹn ưu tiên tại xưởng dịch vụ ủy quyền và hướng dẫn quy trình thủ tục bảo hiểm khi có sự cố. Quý khách cũng có thể xem thêm ',
          },
          {
            type: 'text',
            text: 'dự toán giá lăn bánh chi tiết',
            marks: [{ type: 'link', attrs: { href: '/gia-lan-banh' } }],
          },
          {
            type: 'text',
            text: ' hoặc tham khảo ',
          },
          {
            type: 'text',
            text: 'hướng dẫn thủ tục mua xe trả góp',
            marks: [{ type: 'link', attrs: { href: '/thu-tuc-mua-xe-tra-gop' } }],
          },
          {
            type: 'text',
            text: '. Nếu có bất kỳ thắc mắc nào, hãy ',
          },
          {
            type: 'text',
            text: 'liên hệ trực tiếp với tôi',
            marks: [{ type: 'link', attrs: { href: '/lien-he' } }],
          },
          {
            type: 'text',
            text: ' để được tư vấn chu đáo nhất.',
          },
        ],
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Hỗ Trợ Đặt Hẹn Bảo Dưỡng Nhanh',
          actionType: 'hotline',
          subtext: 'Chuyên viên hỗ trợ kết nối trực tiếp xưởng dịch vụ ủy quyền',
        },
      },
    ],
  },
};
