import type { SeedPageItem } from './static-pages-data-1';

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
            text: 'Website này là kênh thông tin cá nhân do Chuyên viên tư vấn kinh doanh tại Đại lý Hyundai Vinh xây dựng và quản lý, nhằm mục đích cung cấp thông tin sản phẩm, chia sẻ kinh nghiệm sử dụng xe và hỗ trợ báo giá tư vấn cho khách hàng quan tâm đến ',
          },
          {
            type: 'text',
            text: 'các dòng xe ô tô Hyundai',
            marks: [{ type: 'link', attrs: { href: '/xe' } }],
          },
          {
            type: 'text',
            text: '.',
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
