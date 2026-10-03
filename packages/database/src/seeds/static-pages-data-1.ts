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

// 1. Chính sách bảo mật (Privacy Policy) - Persona Chuyên viên tư vấn bán hàng
export const privacyPolicyPage: SeedPageItem = {
  title: 'Chính Sách Bảo Mật Thông Tin',
  slug: 'chinh-sach-bao-mat',
  templateType: 'DEFAULT',
  schemaType: 'WebPage',
  metaTitle: 'Chính Sách Bảo Mật Thông Tin Khách Hàng | Chuyên Viên Tư Vấn Hyundai Vinh',
  metaDescription: 'Cam kết bảo mật thông tin cá nhân của khách hàng khi đăng ký tư vấn giá xe, lái thử và hỗ trợ hồ sơ vay trả góp cùng chuyên viên Hyundai Vinh.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Mục Đích Thu Thập Thông Tin' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Khi quý khách để lại thông tin (Họ tên, Số điện thoại, Email, Dòng xe quan tâm) trên website cá nhân của tôi, dữ liệu này chỉ được sử dụng duy nhất cho các mục đích: (1) Liên hệ tư vấn chi tiết về xe; (2) Gửi bảng báo giá lăn bánh và ưu đãi mới nhất; (3) Hẹn lịch lái thử xe theo yêu cầu.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Cam Kết Bảo Mật Tuyệt Đối' }],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: 'Cam Kết Không Chia Sẻ Dữ Liệu Cho Bên Thứ Ba',
          content: 'Tôi cam kết tuyệt đối KHÔNG bán, trao đổi hay chia sẻ thông tin cá nhân của quý khách cho bất kỳ bên thứ ba nào vì mục đích thương mại hoặc làm phiền.',
        },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Trong trường hợp quý khách có nhu cầu mua xe trả góp, thông tin hồ sơ tài chính chỉ được gửi đến cán bộ tín dụng của Ngân hàng liên kết khi có sự đồng ý và ủy quyền trực tiếp từ quý khách để thẩm định gói vay.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Quyền Lợi Của Khách Hàng' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Quý khách có toàn quyền yêu cầu tôi chỉnh sửa, cập nhật hoặc xóa bỏ hoàn toàn thông tin cá nhân và số điện thoại khỏi danh sách chăm sóc bất cứ lúc nào qua Hotline hoặc Zalo cá nhân.',
          },
        ],
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Liên Hệ Trực Tiếp Chuyên Viên',
          actionType: 'hotline',
          subtext: 'Hỗ trợ tư vấn tận tâm, trung thực và bảo mật 100%',
        },
      },
    ],
  },
};

// 2. Liên hệ (Contact Us) - Kết nối Saler & Showroom
export const contactUsPage: SeedPageItem = {
  title: 'Liên Hệ Tư Vấn & Showroom',
  slug: 'lien-he',
  templateType: 'CONTACT',
  schemaType: 'ContactPage',
  metaTitle: 'Liên Hệ Chuyên Viên Tư Vấn & Showroom Hyundai Vinh',
  metaDescription: 'Kết nối trực tiếp chuyên viên tư vấn bán hàng Hyundai Vinh: Hotline, Zalo, địa chỉ showroom, bản đồ dẫn đường và form đăng ký lái thử tận nơi.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Kênh Tư Vấn Trực Tiếp Cùng Chuyên Viên' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Quý khách đang quan tâm đến các dòng xe Hyundai hoặc cần dự toán chi phí lăn bánh, thủ tục mua xe trả góp? Hãy liên hệ trực tiếp với tôi qua Hotline/Zalo hoặc để lại thông tin tại biểu mẫu bên dưới. Tôi luôn sẵn sàng hỗ trợ 24/7.',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'note',
          title: 'Hỗ Trợ Lái Thử Tận Nhà Miễn Phí',
          content: 'Nếu quý khách bận rộn không thể đến showroom, tôi sẽ trực tiếp mang xe lái thử đến tận nhà hoặc cơ quan tại Nghệ An & Hà Tĩnh để quý khách trải nghiệm thực tế hoàn toàn miễn phí.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Thông Tin Showroom Giao Dịch Chính Thức' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Mọi thủ tục xem xe trực tiếp trong showroom, ký kết hợp đồng mua bán và nhận bàn giao xe đều được thực hiện tại Showroom chính thức của Hyundai Vinh để đảm bảo đầy đủ quyền lợi pháp lý cho quý khách.',
          },
        ],
      },
    ],
  },
};

// 3. Giới thiệu (About Us) - Hồ sơ cá nhân Chuyên viên tư vấn kinh doanh
export const aboutUsPage: SeedPageItem = {
  title: 'Giới Thiệu Chuyên Viên Tư Vấn',
  slug: 'gioi-thieu',
  templateType: 'PROFILE_SHOWROOM',
  schemaType: 'AboutPage',
  metaTitle: 'Giới Thiệu Chuyên Viên Tư Vấn Bán Hàng | Đại Lý Hyundai Vinh',
  metaDescription: 'Hồ sơ chuyên viên tư vấn kinh doanh tại Hyundai Vinh: Bề dày kinh nghiệm, cam kết giá tốt nhất, tư vấn tận tâm, trung thực và hỗ trợ trọn đời sử dụng xe.',
  isPublished: true,
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Xin Chào Quý Khách Hàng!' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Tôi là Chuyên viên tư vấn kinh doanh chính thức tại Đại lý Hyundai Vinh (TC Motor). Với nhiều năm gắn bó trong ngành ô tô và kinh nghiệm tư vấn, bàn giao hàng trăm chiếc xe cho khách hàng tại Nghệ An, Hà Tĩnh và khu vực lân cận, tôi luôn coi sự hài lòng và an tâm của quý khách là ưu tiên hàng đầu.',
          },
        ],
      },
      {
        type: 'calloutBlock',
        attrs: {
          type: 'success',
          title: '4 Cam Kết Vàng Dành Cho Khách Hàng',
          content: '1. Giá xe luôn tốt nhất: Báo giá lăn bánh minh bạch, cập nhật tối đa các chương trình khuyến mãi & quà tặng phụ kiện chính hãng.\n2. Tư vấn trung thực: Lựa chọn phiên bản xe phù hợp nhất với nhu cầu sử dụng và ngân sách thực tế của quý khách.\n3. Hỗ trợ vay ngân hàng nhanh gọn: Đồng hành xử lý hồ sơ trả góp từ A-Z, tỷ lệ duyệt cao, lãi suất ưu đãi.\n4. Đồng hành trọn đời xe: Hỗ trợ kỹ thuật, nhắc lịch bảo dưỡng, cứu hộ và bảo hiểm 24/7 trong suốt quá trình sử dụng.',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Hình Ảnh Bàn Giao Xe Thực Tế' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Niềm vui và sự tin tưởng của quý khách hàng trong những buổi lễ bàn giao xe chính là động lực lớn nhất để tôi không ngừng nỗ lực nâng cao chất lượng phục vụ chuyên nghiệp mỗi ngày.',
          },
        ],
      },
      {
        type: 'prosConsBlock',
        attrs: {
          title: 'Lý Do Quý Khách Nên Đồng Hành Cùng Tôi',
          pros: [
            'Tư vấn tận tâm, giải đáp mọi thắc mắc 24/7 kể cả ngoài giờ hành chính',
            'Hỗ trợ lái thử xe tận nơi tại Nghệ An và Hà Tĩnh miễn phí',
            'Đại diện khách hàng làm việc để có chính sách giá và quà tặng tốt nhất',
            'Hỗ trợ trọn gói thủ tục đăng ký biển số, đăng kiểm và giao xe tận nhà',
          ],
          cons: [
            'Các đợt xe khuyến mãi số lượng có hạn, quý khách nên liên hệ sớm để giữ màu và số khung ưng ý',
          ],
        },
      },
      {
        type: 'ctaButtonBlock',
        attrs: {
          buttonText: 'Liên Hệ Nhận Báo Giá Tốt Nhất',
          actionType: 'hotline',
          subtext: 'Gọi trực tiếp hoặc nhắn tin Zalo để nhận ưu đãi đặc biệt hôm nay',
        },
      },
    ],
  },
};
