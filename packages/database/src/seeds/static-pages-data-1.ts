import type { StaticPageTemplate, StaticPageSchemaType } from '@cardealer/types';

export interface SeedPageItem {
  title: string;
  slug: string;
  templateType: StaticPageTemplate;
  schemaType: StaticPageSchemaType;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  content: {
    type: 'doc';
    content: Array<Record<string, unknown>>;
  };
}

// 1. Chính sách bảo mật (Privacy Policy)
export const privacyPolicyPage: SeedPageItem = {
  title: 'Chính Sách Bảo Mật Thông Tin',
  slug: 'chinh-sach-bao-mat',
  templateType: 'DEFAULT',
  schemaType: 'WebPage',
  metaTitle: 'Chính Sách Bảo Mật Thông Tin Khách Hàng | Hyundai Vinh',
  metaDescription: 'Cam kết bảo mật tuyệt đối thông tin khách hàng, số điện thoại và hồ sơ vay vốn khi đăng ký tư vấn mua xe tại Hyundai Vinh.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Mục Đích và Phạm Vi Thu Thập Thông Tin' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Khi quý khách hàng truy cập website, đăng ký nhận báo giá lăn bánh, yêu cầu lái thử hoặc tư vấn mua xe trả góp, chúng tôi thu thập các thông tin cần thiết gồm: Họ và tên, Số điện thoại liên hệ, Địa chỉ Email, và Tỉnh/Thành phố sinh sống.',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'info',
          title: 'Mục Đích Sử Dụng Thông Tin Minh Bạch',
          content: 'Thông tin thu thập chỉ phục vụ mục đích: (1) Cung cấp bảng giá lăn bánh và ưu đãi mới nhất; (2) Hỗ trợ lái thử xe tận nơi; (3) Hướng dẫn thủ tục ngân hàng theo đúng nguyện vọng của quý khách.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Cam Kết Bảo Mật Thông Tin Cá Nhân' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Chúng tôi cam kết tuyệt đối không bán, chuyển nhượng, trao đổi hay chia sẻ dữ liệu cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại hoặc quảng cáo ngoài hệ thống.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Dữ liệu hồ sơ tài chính chỉ được cung cấp cho các đối tác Ngân hàng liên kết uy tín (Vietcombank, BIDV, Techcombank, VPBank...) khi có sự chấp thuận và ủy quyền trực tiếp từ quý khách để tiến hành thẩm định hạn mức vay mua xe.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Quyền Lợi Của Khách Hàng Đối Với Dữ Liệu' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Khách hàng có toàn quyền yêu cầu kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân đã lưu trữ trên hệ thống bất cứ lúc nào bằng cách liên hệ trực tiếp với chuyên viên tư vấn hoặc qua Hotline chính thức.',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: 'Tiêu Chuẩn Mã Hóa & An Toàn Dữ Liệu',
          content: 'Mọi dữ liệu truyền tải qua website đều được bảo vệ bằng giao thức mã hóa SSL 256-bit chuẩn quốc tế, ngăn ngừa tối đa rủi ro rò rỉ hoặc can thiệp trái phép.',
        },
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Liên Hệ Hỗ Trợ Bảo Mật Dữ Liệu',
          actionType: 'hotline',
          subtext: 'Bộ phận Chăm sóc khách hàng tiếp nhận phản hồi 24/7',
        },
      },
    ],
  },
};

// 2. Liên hệ (Contact Us)
export const contactUsPage: SeedPageItem = {
  title: 'Liên Hệ Đại Lý Hyundai Vinh',
  slug: 'lien-he',
  templateType: 'CONTACT',
  schemaType: 'ContactPage',
  metaTitle: 'Liên Hệ Showroom & Chuyên Viên Tư Vấn Hyundai Vinh',
  metaDescription: 'Thông tin liên hệ chính thức Showroom Hyundai Vinh: Hotline kinh doanh, vị trí bản đồ Google Maps, form đăng ký lái thử và tư vấn bảng giá.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Kênh Tiếp Nhận Thông Tin & Hỗ Trợ Khách Hàng' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Đại lý Hyundai Vinh hân hạnh phục vụ quý khách hàng tại Nghệ An, Hà Tĩnh và khu vực Bắc Trung Bộ với đầy đủ các dịch vụ 3S tiêu chuẩn toàn cầu: Bán hàng (Sales), Dịch vụ hậu mãi (Service) và Phụ tùng chính hãng (Spare parts).',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'note',
          title: 'Hỗ Trợ Lái Thử & Tư Vấn Tận Nhà',
          content: 'Quý khách bận rộn không thể ghé showroom? Hãy đặt lịch hẹn, đội ngũ chuyên viên sẽ mang mẫu xe bạn yêu thích đến tận nhà hoặc cơ quan để trải nghiệm hoàn toàn miễn phí.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Thời Gian Làm Việc Tại Showroom' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '• Khu vực Trưng bày & Bán hàng: 08:00 - 18:00 (Từ Thứ Hai đến Chủ Nhật hàng tuần).\n• Xưởng Dịch vụ & Bảo dưỡng: 07:30 - 17:00 (Từ Thứ Hai đến Thứ Bảy).',
          },
        ],
      },
    ],
  },
};

// 3. Giới thiệu (About Us)
export const aboutUsPage: SeedPageItem = {
  title: 'Giới Thiệu Về Chúng Tôi',
  slug: 'gioi-thieu',
  templateType: 'PROFILE_SHOWROOM',
  schemaType: 'AboutPage',
  metaTitle: 'Giới Thiệu Showroom Hyundai Vinh & Đội Ngũ Tư Vấn Chuyên Nghiệp',
  metaDescription: 'Tìm hiểu về Hyundai Vinh - Đại lý ủy quyền chính thức của TC Motor tại Nghệ An, bề dày kinh nghiệm, cam kết giá tốt và đồng hành trọn đời xe.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Về Đại Lý Hyundai Vinh' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Showroom Hyundai Vinh tự hào là một trong những đại lý ủy quyền 3S chính thức của Tập đoàn TC Motor tại khu vực miền Trung. Với cơ sở hạ tầng hiện đại, trang thiết bị chẩn đoán tiên tiến cùng đội ngũ chuyên viên tư vấn được đào tạo bài bản theo tiêu chuẩn quốc tế của Hyundai Motor Company.',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: 'Cam Kết Vàng Từ Đội Ngũ Tư Vấn',
          content: '1. Cam kết mức giá lăn bánh và chương trình khuyến mãi cạnh tranh nhất thị trường.\n2. Tư vấn giải pháp tài chính trung thực, minh bạch, tối ưu chi phí cho khách hàng.\n3. Hỗ trợ trọn gói thủ tục đăng ký, đăng kiểm, giao xe tận nhà theo yêu cầu.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Giá Trị Cốt Lõi & Đồng Hành Trọn Đời' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Chúng tôi không chỉ trao gửi chiếc xe, mà còn là người bạn đồng hành tin cậy trong suốt vòng đời sử dụng của quý khách. Mọi vấn đề kỹ thuật, lịch nhắc bảo dưỡng định kỳ và hỗ trợ xử lý sự cố bảo hiểm 24/7 đều được thực hiện tận tâm, chu đáo.',
          },
        ],
      },
      {
        type: 'prosConsBlock',
        attrs: {
          title: 'Đặc Quyền Khi Mua Xe Tại Hyundai Vinh',
          pros: [
            'Xe có sẵn, đủ màu, giao ngay tận nơi',
            'Bảo hành chính hãng 5 năm hoặc 100.000 km',
            'Hỗ trợ vay trả góp 85% với lãi suất ưu đãi cố định',
            'Đội ngũ kỹ thuật viên đạt chứng chỉ quốc tế',
          ],
          cons: [
            'Số lượng xe giao ngay trong các đợt khuyến mãi lớn có thể hết sớm',
            'Xưởng dịch vụ đông vào các ngày cuối tuần, nên đặt hẹn trước',
          ],
        },
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Gặp Gỡ Chuyên Viên Tư Vấn',
          actionType: 'hotline',
          subtext: 'Nhận báo giá độc quyền và ưu đãi phụ kiện cao cấp trong tháng',
        },
      },
    ],
  },
};
