import { db, schema } from '../index';
import { eq } from 'drizzle-orm';
import { calculateSeoScore } from '@cardealer/core';

// Helper tạo doc Tiptap JSON AST Tree
function createPostDoc(blocks: any[]): any {
  const content = blocks.map((b) => {
    switch (b.type) {
      case 'heading':
        return {
          type: 'heading',
          attrs: { level: b.level || 2 },
          content: [{ type: 'text', text: b.content || '' }],
        };
      case 'callout':
        return {
          type: 'calloutBlock',
          attrs: {
            type: b.calloutType || 'info',
            title: b.title || '',
            content: b.content || '',
          },
        };
      case 'youtube':
        return {
          type: 'youtubeBlock',
          attrs: {
            videoId: b.videoId || 'dQw4w9WgXcQ',
            videoUrl: b.videoUrl || `https://www.youtube.com/watch?v=${b.videoId || 'dQw4w9WgXcQ'}`,
            caption: b.caption || '',
          },
        };
      case 'faq':
        return {
          type: 'faqBlock',
          attrs: {
            questions: b.faqs || [],
          },
        };
      case 'relatedCar':
        return {
          type: 'relatedCarBlock',
          attrs: {
            carName: b.carName || 'Hyundai Accent',
            carSlug: b.carSlug || 'accent',
            slug: b.carSlug || 'accent',
            minPrice: b.carPrice || 439000000,
            imageUrl: b.carImage || 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Accent-icon.webp',
            seatCount: b.seatCount || 5,
            fuelType: b.fuelType || 'Xăng 1.5L',
          },
        };
      case 'priceTable':
        return {
          type: 'priceTableBlock',
          attrs: {
            title: b.title || 'Bảng Giá Xe Hyundai Mới Nhất',
            carSlug: b.carSlug || 'accent',
            prices: b.prices || [],
          },
        };
      case 'singleImage':
        return {
          type: 'singleImageBlock',
          attrs: {
            url: b.imageUrl || '',
            alt: b.imageAlt || 'Hình ảnh xe Hyundai',
            caption: b.caption || '',
          },
        };
      case 'specTable':
        return {
          type: 'specComparisonBlock',
          attrs: {
            title: b.title || 'Bảng So Sánh Thông Số Kỹ Thuật',
            versions: b.specVersions || ['Bản Tiêu Chuẩn', 'Bản Cao Cấp'],
            rows: b.specRows || [],
          },
        };
      case 'ctaButton':
        return {
          type: 'ctaButtonBlock',
          attrs: {
            buttonText: b.ctaButtonText || 'Gọi Hotline Nhận Ưu Đãi',
            actionType: b.ctaActionType || 'hotline',
            customUrl: b.ctaCustomUrl || '',
            phoneNumber: b.ctaPhone || '0942398688',
            subtext: b.ctaSubtext || 'Tư vấn tận tâm - Nhận báo giá lăn bánh kèm ưu đãi tốt nhất',
            variant: b.ctaVariant || 'red',
          },
        };
      case 'prosCons':
        return {
          type: 'prosConsBlock',
          attrs: {
            title: b.title || 'Đánh Giá Ưu & Nhược Điểm Thực Tế',
            pros: b.pros || [],
            cons: b.cons || [],
          },
        };
      case 'paragraph':
      default:
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: b.content || '' }],
        };
    }
  });

  return { type: 'doc', content };
}

// 5 Bài viết đạt chuẩn 10 Tiêu chí SEO Real-Time (100/100) - Độc lập, không trùng lặp, không có inline form
const seoPostsData = [
  // =========================================================================
  // Bài 1: bang-gia-xe-hyundai-thang-8-2026 (Chủ đề: Giá xe & Ưu đãi)
  // =========================================================================
  {
    tieuDe: 'Bảng giá xe Hyundai tháng 8/2026 mới nhất tại Nghệ An & Hà Tĩnh',
    slug: 'bang-gia-xe-hyundai-thang-8-2026',
    focusKeyword: 'Bảng giá xe Hyundai',
    metaDescription: 'Cập nhật Bảng giá xe Hyundai tháng 8/2026 mới nhất tại đại lý Nghệ An & Hà Tĩnh kèm ưu đãi tiền mặt và quà tặng chính hãng hấp dẫn.',
    thumbnail: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Accent-icon.webp',
    thumbnailAlt: 'Bảng giá xe Hyundai tháng 8/2026 mới nhất tại Nghệ An',
    blocks: [
      {
        type: 'paragraph',
        content: 'Bảng giá xe Hyundai tháng 8/2026 tại thị trường Nghệ An và Hà Tĩnh đang ghi nhận những điều chỉnh vô cùng hấp dẫn với hàng loạt chương trình kích cầu mua sắm quy mô lớn từ nhà máy và showroom. Đại lý Hyundai chính hãng mang đến cơ hội vàng giúp khách hàng tại TP Vinh, Diễn Châu, Cửa Lò, Thái Hòa và Hà Tĩnh dễ dàng sở hữu những mẫu xe hiện đại hàng đầu phân khúc như Hyundai Accent, Grand i10, Creta, Tucson, Santa Fe và Palisade.',
      },
      {
        type: 'callout',
        calloutType: 'success',
        title: 'Chính sách độc quyền tháng 8/2026',
        content: 'Khách hàng ký hợp đồng mua xe trong tháng 8/2026 được tặng ngay gói bảo dưỡng miễn phí 3 năm hoặc 50.000km, tặng dán phim cách nhiệt chính hãng và quà tặng phụ kiện độc quyền tại showroom.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Chi tiết Bảng giá xe Hyundai niêm yết và lăn bánh tháng 8/2026',
      },
      {
        type: 'paragraph',
        content: 'Dưới đây là tổng hợp Bảng giá xe Hyundai chi tiết từng mẫu xe cùng mức giảm tiền mặt trực tiếp và quà tặng phụ kiện kèm theo tại showroom trong tháng 8/2026. Mức giá này đã bao gồm thuế giá trị gia tăng (VAT) nhưng chưa bao gồm các khoản thuế phí lăn bánh tại địa phương.',
      },
      {
        type: 'priceTable',
        title: 'Bảng Giá Xe Hyundai Chi Tiết Tháng 8/2026',
        carSlug: 'accent',
        prices: [
          { name: 'Hyundai Grand i10 Hatchback 1.2 MT', price: '360.000.000 VNĐ', note: 'Giảm 25 triệu + Phụ kiện' },
          { name: 'Hyundai Grand i10 Hatchback 1.2 AT', price: '405.000.000 VNĐ', note: 'Giảm 30 triệu + Bảo hiểm' },
          { name: 'Hyundai Accent 1.5 MT', price: '439.000.000 VNĐ', note: 'Giảm 35 triệu + Dán phim' },
          { name: 'Hyundai Accent 1.5 AT Đặc Biệt', price: '529.000.000 VNĐ', note: 'Giảm 45 triệu + Camera hành trình' },
          { name: 'Hyundai Creta 1.5 Cao Cấp', price: '699.000.000 VNĐ', note: 'Giảm 50 triệu tiền mặt' },
          { name: 'Hyundai Tucson 2.0 Xăng Đặc Biệt', price: '859.000.000 VNĐ', note: 'Giảm 75 triệu + Gói quà tặng' },
          { name: 'Hyundai Santa Fe Calligraphy 2.5 AWD', price: '1.269.000.000 VNĐ', note: 'Giảm 100 triệu + Bảo hiểm thân vỏ' },
          { name: 'Hyundai Palisade Prestige 6 chỗ', price: '1.559.000.000 VNĐ', note: 'Ưu đãi lên tới 220 triệu đồng' },
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Đánh giá các dòng xe bán chạy nhất tại showroom',
      },
      {
        type: 'singleImage',
        imageUrl: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Accent-icon.webp',
        imageAlt: 'Bảng giá xe Hyundai Accent thế hệ mới tại Nghệ An',
        caption: 'Hyundai Accent hoàn toàn mới là mẫu sedan hạng B được săn đón nhiều nhất',
      },
      {
        type: 'paragraph',
        content: 'Phân khúc sedan hạng B chứng kiến sức hút áp đảo của Hyundai Accent hoàn toàn mới nhờ thiết kế thể thao Sensuous Sportiness, động cơ Smartstream 1.5L vận hành bền bỉ và gói an toàn chủ động Hyundai SmartSense tiên tiến bậc nhất. Đối với khách hàng gia đình yêu thích xe gầm cao, Hyundai Creta và Hyundai Tucson mang lại không gian nội thất rộng rãi, tiện nghi ngập tràn cùng khả năng cách âm vượt trội trên mọi địa hình miền Trung.',
      },
      {
        type: 'paragraph',
        content: 'Đặc biệt, dòng SUV 7 chỗ cỡ lớn Hyundai Santa Fe và mẫu SUV đầu bảng Hyundai Palisade được giảm giá cực mạnh, tạo điều kiện thuận lợi cho các gia đình đông thành viên và các doanh nghiệp nâng cấp phương tiện di chuyển sang trọng, đẳng cấp với mức chi phí đầu tư tối ưu nhất trong năm 2026. Mọi thông tin cập nhật luôn được đồng bộ trực tiếp từ nhà máy phân phối chính hãng.',
      },
      {
        type: 'paragraph',
        content: 'Bên cạnh mức giá cạnh tranh, chính sách bảo hành 5 năm hoặc 100.000 km cùng mạng lưới xưởng dịch vụ ủy quyền tiêu chuẩn 3S tại TP Vinh giúp khách hàng an tâm tuyệt đối trong suốt quá trình vận hành phương tiện. Đội ngũ kỹ thuật viên giàu kinh nghiệm luôn sẵn sàng phục vụ và cung cấp phụ tùng thay thế chính hãng nhanh chóng.',
      },
      {
        type: 'paragraph',
        content: 'Quý khách hàng quan tâm có thể ghé trực tiếp đại lý để trải nghiệm lái thử thực tế tất cả các dòng xe thế hệ mới, nhận tư vấn tận tâm từ đội ngũ chuyên viên bán hàng giàu kinh nghiệm và nhận báo giá ưu đãi độc quyền kèm gói phụ kiện giá trị cao.',
      },
      {
        type: 'paragraph',
        content: 'Ngoài ra, phòng kinh doanh của chúng tôi thường xuyên tổ chức các sự kiện trải nghiệm lái thử xe cuối tuần tại các quán cà phê lớn ở TP Vinh, thị xã Cửa Lò, Diễn Châu và Hoàng Mai, giúp khách hàng thuận tiện lái thử và cảm nhận chân thực khả năng vận hành của từng dòng xe.',
      },
      {
        type: 'paragraph',
        content: 'Hệ thống showroom hiện đại trang bị đầy đủ khu vực trưng bày xe sang trọng, phòng chờ VIP tiện nghi với wifi tốc độ cao, đồ uống miễn phí và khu vực tư vấn tài chính bảo mật riêng tư, đảm bảo mang đến sự hài lòng tuyệt đối cho mỗi khách hàng khi đến thăm quan và ký kết hợp đồng mua bán xe.',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Accent',
        carSlug: 'accent',
        carPrice: 439000000,
        seatCount: 5,
        fuelType: 'Xăng 1.5L',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Santa Fe',
        carSlug: 'santafe',
        carPrice: 1069000000,
        seatCount: 7,
        fuelType: 'Xăng Smartstream 2.5L',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Kinh nghiệm chọn mua xe hơi phù hợp ngân sách tài chính tại Vinh',
      },
      {
        type: 'paragraph',
        content: 'Khi tham khảo Bảng giá xe Hyundai, quý khách hàng nên cân nhắc kỹ giữa nhu cầu sử dụng thực tế và ngân sách tài chính cá nhân. Nếu thường xuyên di chuyển trong đô thị đông đúc, các dòng xe nhỏ gọn như Grand i10 và Accent sẽ giúp tiết kiệm nhiên liệu tối đa. Trong khi đó, nếu cần phục vụ gia đình đi đường dài hoặc công tác liên tỉnh, các mẫu crossover như Creta và Tucson là sự đầu tư lý tưởng.',
      },
      {
        type: 'paragraph',
        content: 'Chúng tôi luôn đồng hành và hỗ trợ quý khách từ khâu lái thử trải nghiệm xe, tính toán chi phí lăn bánh chính xác tại từng huyện thị, cho đến hỗ trợ thủ tục đăng ký biển số và bàn giao xe tại nhà một cách nhanh chóng, chu đáo.',
      },
      {
        type: 'ctaButton',
        ctaButtonText: 'Nhận Báo Giá Lăn Bánh Trọn Gói',
        ctaActionType: 'hotline',
        ctaPhone: '0942398688',
        ctaSubtext: 'Liên hệ tư vấn viên để nhận báo giá ưu đãi tốt nhất ngay hôm nay',
        ctaVariant: 'red',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Câu hỏi thường gặp của khách hàng mua xe tại Nghệ An',
      },
      {
        type: 'faq',
        faqs: [
          {
            question: 'Bảng giá xe Hyundai tháng 8/2026 đã bao gồm chi phí lăn bánh chưa?',
            answer: 'Giá công bố trong bảng giá là giá niêm yết đã gồm thuế VAT 10%. Chi phí lăn bánh thực tế tại Nghệ An và Hà Tĩnh sẽ cộng thêm lệ phí trước bạ, phí cấp biển số, phí đăng kiểm, bảo hiểm TNDS và bảo trì đường bộ.',
          },
          {
            question: 'Mua xe tại showroom có được giao xe tận nơi không?',
            answer: 'Đại lý hỗ trợ lái thử tận nhà miễn phí và giao xe tận nơi tại tất cả các huyện thị thuộc Nghệ An và Hà Tĩnh bằng xe cứu hộ chuyên dụng.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // Bài 2: danh-gia-chi-tiet-hyundai-santa-fe-all-new-the-he-moi-vua-ra-mat-tai-vinh (Chủ đề: Đánh giá chi tiết xe)
  // =========================================================================
  {
    tieuDe: 'Hyundai Santa Fe All-New thế hệ mới ra mắt tại TP Vinh Nghệ An',
    slug: 'danh-gia-chi-tiet-hyundai-santa-fe-all-new-the-he-moi-vua-ra-mat-tai-vinh',
    focusKeyword: 'Hyundai Santa Fe All-New',
    metaDescription: 'Đánh giá chi tiết Hyundai Santa Fe All-New thế hệ mới tại Vinh với ngoại hình lột xác, nội thất sang trọng và động cơ Smartstream hiện đại.',
    thumbnail: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/SantaFe-icon.webp',
    thumbnailAlt: 'Hyundai Santa Fe All-New thế hệ mới tại Vinh Nghệ An',
    blocks: [
      {
        type: 'paragraph',
        content: 'Hyundai Santa Fe All-New thế hệ mới vừa chính thức trình làng tại TP Vinh, tạo nên một cơn sốt thực sự trong cộng đồng người yêu xe SUV tại khu vực Nghệ An và Hà Tĩnh. Với ngôn ngữ thiết kế hình hộp Boxy việt dã đột phá, kích thước gia tăng đáng kể và hàng loạt công nghệ tương lai, mẫu xe này tiếp tục khẳng định vị thế ông vua phân khúc D-SUV 7 chỗ cao cấp.',
      },
      {
        type: 'callout',
        calloutType: 'warning',
        title: 'Điểm nhấn thế hệ mới',
        content: 'Mẫu xe thế hệ mới sở hữu chiều dài cơ sở lên đến 2.815mm (tăng 50mm), mang lại không gian để chân hàng ghế thứ 2 và thứ 3 rộng nhất từ trước đến nay cùng cụm đèn pha LED định vị chữ H độc bản.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Thiết kế ngoại thất việt dã đột phá của chiếc SUV thế hệ mới',
      },
      {
        type: 'singleImage',
        imageUrl: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/SantaFe-icon.webp',
        imageAlt: 'Ngoại thất xe Hyundai Santa Fe All-New thế hệ mới tại Vinh',
        caption: 'Thiết kế hình hộp khỏe khoắn đầy ấn tượng của Santa Fe thế hệ mới',
      },
      {
        type: 'paragraph',
        content: 'Phần đầu xe gây ấn tượng thị giác mạnh mẽ với dải đèn LED ban ngày hình chữ H trải dài toàn bộ mặt ca-lăng, kết hợp cùng lưới tản nhiệt đóng mở chủ động AAF giúp tối ưu khí động học và nâng cao hiệu quả làm mát động cơ. Thân xe vuông vức với vòm bánh xe cơ bắp, mâm xe hợp kim đa chấu kích thước lên tới 21 inch mang lại phong thái bệ vệ, vững chãi.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Không gian nội thất hạng thương gia trên Hyundai Santa Fe All-New',
      },
      {
        type: 'paragraph',
        content: 'Bước vào khoang lái của chiếc SUV, người dùng sẽ ngỡ ngàng trước không gian sang trọng tựa những mẫu SUV hạng sang cao cấp. Màn hình cong Panoramic Curved Display kết hợp cụm đồng hồ kỹ thuật số 12.3 inch và màn hình giải trí trung tâm 12.3 inch mượt mà, hỗ trợ Apple CarPlay/Android Auto không dây và hệ thống âm thanh vòm Bose 12 loa cao cấp.',
      },
      {
        type: 'paragraph',
        content: 'Ghế ngồi được bọc da Nappa cao cấp dập nổi họa tiết tinh xảo, tích hợp đầy đủ tính năng sưởi ấm, làm mát và nhớ vị trí thông minh. Hàng ghế thứ 2 có tùy chọn cấu hình 6 chỗ kiểu thương gia độc lập Captain Seats hoặc 7 chỗ liền khối tiện dụng. Cửa cốp sau mở rộng toàn phần kiểu Terrace tạo nên không gian sinh hoạt ngoài trời hoàn hảo cho những chuyến dã ngoại cuối tuần cùng gia đình.',
      },
      {
        type: 'paragraph',
        content: 'Bên cạnh đó, các vật liệu chế tạo khoang lái đều hướng tới xu hướng bền vững với da tổng hợp tái chế, ốp gỗ tự nhiên cao cấp và khay khử trùng UV-C độc quyền tích hợp ngay hộc đựng đồ phía trước ghế phụ, bảo vệ sức khỏe tối đa cho các thành viên trong gia đình.',
      },
      {
        type: 'paragraph',
        content: 'Hệ thống điều hòa tự động 3 vùng độc lập cùng cụm cửa gió điều hòa cho cả 3 hàng ghế mang lại không khí mát lạnh nhanh chóng trong những ngày hè oi bức đặc trưng của miền Trung.',
      },
      {
        type: 'specTable',
        title: 'Thông Số Kỹ Thuật Hyundai Santa Fe All-New 2026',
        specVersions: ['Santa Fe 2.5 Exclusive', 'Santa Fe 2.5 Calligraphy AWD'],
        specRows: [
          { specName: 'Kích thước DxRxC (mm)', values: ['4.830 x 1.900 x 1.720', '4.830 x 1.900 x 1.780'] },
          { specName: 'Chiều dài cơ sở (mm)', values: ['2.815', '2.815'] },
          { specName: 'Động cơ', values: ['Smartstream G2.5 Xăng', 'Smartstream G2.5 Turbo'] },
          { specName: 'Công suất tối đa (mã lực)', values: ['194 HP / 6.100 rpm', '281 HP / 5.800 rpm'] },
          { specName: 'Hộp số', values: ['Tự động 8 cấp (8AT)', 'Ly hợp kép ướt 8 cấp (8DCT)'] },
          { specName: 'Hệ dẫn động', values: ['Cầu trước (FWD)', 'Bốn bánh toàn thời gian HTRAC'] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Đánh giá ưu nhược điểm thực tế khi vận hành tại Nghệ An',
      },
      {
        type: 'prosCons',
        title: 'Đánh Giá Ưu & Nhược Điểm Thực Tế Của Xe',
        pros: [
          'Thiết kế ngoại thất hình hộp độc bản, nam tính và phong cách việt dã khác biệt',
          'Khoang hành lý siêu rộng với cửa cốp Terrace siêu lớn phục vụ dã ngoại cắm trại',
          'Gói an toàn chủ động Hyundai SmartSense thế hệ mới nhất với hỗ trợ giữ làn và phanh tự động',
          'Cách âm môi trường và cách âm gầm được cải thiện vượt trội so với thế hệ cũ',
        ],
        cons: [
          'Kích thước lớn đòi hỏi người lái cẩn thận khi xoay xở trong các cung đường ngõ nhỏ',
          'Mức giá lăn bánh của bản Calligraphy cao cấp tương đối tiệm cận các dòng xe sang',
        ],
      },
      {
        type: 'paragraph',
        content: 'Trải nghiệm vận hành thực tế của chiếc xe trên cung đường từ TP Vinh đi bãi biển Cửa Lò và đường mòn Hồ Chí Minh cho thấy hệ thống treo của xe hấp thụ xung lực cực tốt, thân xe cân bằng đầm chắc và khả năng bứt tốc mạnh mẽ vượt trội.',
      },
      {
        type: 'paragraph',
        content: 'Với những cải tiến toàn diện về cả thiết kế, công nghệ và khả năng vận hành thực tế, Hyundai Santa Fe All-New xứng đáng là lựa chọn hàng đầu cho các chủ nhân yêu thích phong cách sống năng động và đề cao sự an toàn cho gia đình.',
      },
      {
        type: 'paragraph',
        content: 'Quý khách hàng tại Nghệ An và Hà Tĩnh có thể liên hệ ngay đại lý để đăng ký lái thử trực tiếp mẫu xe và nhận bảng báo giá lăn bánh chi tiết kèm nhiều quà tặng độc quyền trong tuần này.',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Santa Fe',
        carSlug: 'santafe',
        carPrice: 1069000000,
        seatCount: 7,
        fuelType: 'Xăng Smartstream 2.5L',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Tucson',
        carSlug: 'tucson',
        carPrice: 769000000,
        seatCount: 5,
        fuelType: 'Xăng / Dầu Smartstream',
      },
      {
        type: 'ctaButton',
        ctaButtonText: 'Đăng Ký Lái Thử Santa Fe Tại Vinh',
        ctaActionType: 'hotline',
        ctaPhone: '0942398688',
        ctaSubtext: 'Trải nghiệm lái thử xe thực tế tận nhà hoàn toàn miễn phí',
        ctaVariant: 'red',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Câu hỏi thường gặp của khách hàng quan tâm đến xe',
      },
      {
        type: 'faq',
        faqs: [
          {
            question: 'Mẫu xe thế hệ mới có bản máy dầu Diesel không?',
            answer: 'Thế hệ mới chuyển đổi hoàn toàn sang thế hệ động cơ xăng Smartstream 2.5L hút khí tự nhiên và 2.5L Turbo tăng áp hiệu suất cao, loại bỏ động cơ dầu để bảo vệ môi trường và vận hành êm ái hơn.',
          },
          {
            question: 'Thời gian giao xe tại Nghệ An là bao lâu?',
            answer: 'Hiện tại đại lý có sẵn xe giao ngay đủ màu sắc và các phiên bản với thủ tục nhận xe nhanh chóng trong 1-2 ngày làm việc.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // Bài 3: huong-dan-thu-tuc-mua-xe-hyundai-tra-gop-tai-vinh (Chủ đề: Vay vốn & Tài chính)
  // =========================================================================
  {
    tieuDe: 'Mua xe Hyundai trả góp tại Vinh lãi suất 6.9% thủ tục trọn gói',
    slug: 'huong-dan-thu-tuc-mua-xe-hyundai-tra-gop-tai-vinh',
    focusKeyword: 'mua xe Hyundai trả góp tại Vinh',
    metaDescription: 'Hướng dẫn mua xe Hyundai trả góp tại Vinh với lãi suất ưu đãi chỉ từ 6.9%, thủ tục nhanh gọn, vay tối đa 85% giá trị xe duyệt trong 2 giờ.',
    thumbnail: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Creta-icon.webp',
    thumbnailAlt: 'Thủ tục mua xe Hyundai trả góp tại Vinh lãi suất 6.9%',
    blocks: [
      {
        type: 'paragraph',
        content: 'Dịch vụ mua xe Hyundai trả góp tại Vinh đang là giải pháp tài chính tối ưu được hơn 75% khách hàng cá nhân và doanh nghiệp lựa chọn trong năm 2026. Chỉ với số vốn tự có ban đầu từ 80 triệu đến 150 triệu đồng, quý khách hàng tại Nghệ An và Hà Tĩnh đã có thể sở hữu ngay một chiếc xe ô tô đời mới phục vụ gia đình hoặc kinh doanh dịch vụ mà không cần dồn toàn bộ nguồn vốn dự phòng.',
      },
      {
        type: 'callout',
        calloutType: 'success',
        title: 'Chính sách ưu đãi tài chính',
        content: 'Hợp tác chiến lược cùng các ngân hàng top đầu như Vietcombank, Techcombank, BIDV, VIB mang đến gói lãi suất cố định chỉ 6.9%/năm, hỗ trợ hạn mức vay lên đến 85% giá trị xe trong thời gian tối đa 8 năm (96 tháng).',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Hồ sơ cần chuẩn bị khi làm thủ tục mua xe Hyundai trả góp tại Vinh',
      },
      {
        type: 'paragraph',
        content: 'Thủ tục vay vốn ngày nay đã được đơn giản hóa tối đa nhằm tiết kiệm thời gian cho khách hàng. Đối với khách hàng cá nhân, quý khách chỉ cần chuẩn bị căn cước công dân gắn chip, giấy đăng ký kết hôn (hoặc giấy xác nhận độc thân) và sao kê tài khoản ngân hàng hoặc bảng lương 3 tháng gần nhất.',
      },
      {
        type: 'singleImage',
        imageUrl: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Creta-icon.webp',
        imageAlt: 'Thủ tục mua xe Hyundai trả góp tại Vinh ưu đãi lãi suất',
        caption: 'Hỗ trợ thủ tục trả góp xe Hyundai Creta và các dòng xe khác trọn gói',
      },
      {
        type: 'paragraph',
        content: 'Đối với doanh nghiệp, hồ sơ bao gồm giấy phép đăng ký kinh doanh, báo cáo tài chính năm gần nhất và sao kê tài khoản công ty 6 tháng qua. Đội ngũ chuyên viên tín dụng liên kết tại showroom sẽ trực tiếp hỗ trợ xử lý hồ sơ tận nơi và duyệt hạn mức online chỉ trong 2 đến 4 giờ làm việc. Với chương trình ưu đãi, quý khách hoàn toàn không phải trả thêm bất kỳ chi phí môi giới hay trung gian nào.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Bảng ước tính số tiền trả trước và góp hàng tháng tại Nghệ An',
      },
      {
        type: 'paragraph',
        content: 'Dưới đây là bảng tính mẫu số tiền trả trước tối thiểu và số tiền gốc lãi phải trả hàng tháng (tính theo dư nợ giảm dần) cho các dòng xe phổ biến khi quý khách hàng mua xe Hyundai trả góp tại Vinh với kỳ hạn vay 7 năm:',
      },
      {
        type: 'priceTable',
        title: 'Dự Toán Mua Xe Trả Góp Tháng 8/2026',
        carSlug: 'accent',
        prices: [
          { name: 'Hyundai Grand i10 (Giá từ 360tr)', price: 'Trả trước từ 75 triệu', note: 'Góp tháng từ 3.8 triệu VNĐ' },
          { name: 'Hyundai Accent 1.5 (Giá từ 439tr)', price: 'Trả trước từ 90 triệu', note: 'Góp tháng từ 4.6 triệu VNĐ' },
          { name: 'Hyundai Creta 1.5 (Giá từ 599tr)', price: 'Trả trước từ 125 triệu', note: 'Góp tháng từ 6.2 triệu VNĐ' },
          { name: 'Hyundai Tucson 2.0 (Giá từ 769tr)', price: 'Trả trước từ 160 triệu', note: 'Góp tháng từ 8.1 triệu VNĐ' },
          { name: 'Hyundai Santa Fe 2.5 (Giá từ 1.069tr)', price: 'Trả trước từ 220 triệu', note: 'Góp tháng từ 11.2 triệu VNĐ' },
        ],
      },
      {
        type: 'paragraph',
        content: 'Phương thức thanh toán linh hoạt cho phép khách hàng chủ động chọn ngày trả nợ định kỳ phù hợp với chu kỳ dòng tiền cá nhân hoặc doanh nghiệp. Mọi thắc mắc về phương án tài chính khi mua xe Hyundai trả góp tại Vinh sẽ được chuyên viên tư vấn hỗ trợ giải đáp cặn kẽ và minh bạch nhất.',
      },
      {
        type: 'paragraph',
        content: 'Đặc biệt, đại lý liên kết hỗ trợ trả góp với gói bảo hiểm vật chất xe ưu đãi chiết khấu cao, cam kết quyền lợi bồi thường nhanh chóng và sửa chữa chính hãng tại xưởng dịch vụ ủy quyền ở Nghệ An và Hà Tĩnh.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Quy trình 4 bước hoàn tất thủ tục nhận xe nhanh chóng',
      },
      {
        type: 'paragraph',
        content: 'Bước 1: Khách hàng lựa chọn dòng xe phù hợp và ký hợp đồng đặt cọc tại đại lý. Bước 2: Chuyên viên tín dụng ngân hàng thu thập hồ sơ và ra cam kết cấp tín dụng. Bước 3: Khách hàng thanh toán phần tiền đối ứng và đại lý tiến hành đăng ký biển số xe. Bước 4: Khách hàng ký giải ngân tại ngân hàng và nhận xe mới tại showroom hoặc giao tận nhà.',
      },
      {
        type: 'paragraph',
        content: 'Với sự hỗ trợ chuyên nghiệp từ đội ngũ tư vấn, toàn bộ quy trình từ lúc nộp hồ sơ đến khi nhận xe chỉ mất khoảng 2 đến 3 ngày làm việc, giúp khách hàng tiết kiệm tối đa thời gian và công sức.',
      },
      {
        type: 'paragraph',
        content: 'Chúng tôi cam kết bảo mật 100% thông tin cá nhân của khách hàng và hỗ trợ chứng minh thu nhập linh hoạt cho các hộ kinh doanh tự do, chủ trang trại, tàu thuyền hoặc khách hàng có nguồn thu nhập bằng tiền mặt tại khu vực Bắc Trung Bộ.',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Creta',
        carSlug: 'creta',
        carPrice: 599000000,
        seatCount: 5,
        fuelType: 'Xăng 1.5L Smartstream',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Accent',
        carSlug: 'accent',
        carPrice: 439000000,
        seatCount: 5,
        fuelType: 'Xăng 1.5L Smartstream',
      },
      {
        type: 'ctaButton',
        ctaButtonText: 'Tư Vấn Gói Vay Lãi Suất Tốt Nhất',
        ctaActionType: 'hotline',
        ctaPhone: '0942398688',
        ctaSubtext: 'Bảo mật thông tin - Hỗ trợ chứng minh thu nhập linh hoạt',
        ctaVariant: 'red',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Những lưu ý quan trọng khi vay vốn ngân hàng',
      },
      {
        type: 'faq',
        faqs: [
          {
            question: 'Nợ xấu nhóm 2 hoặc không có bảng lương có vay mua xe được không?',
            answer: 'Đại lý liên kết với nhiều đối tác tài chính linh hoạt, sẵn sàng hỗ trợ khách hàng kinh doanh tự do, tiểu thương hoặc có vướng mắc lịch sử tín dụng nhẹ xử lý hồ sơ thành công.',
          },
          {
            question: 'Có thể tất toán khoản vay trước hạn được không?',
            answer: 'Khách hàng có thể tất toán hợp đồng vay bất kỳ lúc nào với mức phí phạt tất toán trước hạn cực thấp (chỉ từ 0.5% - 1.5% số tiền gốc còn lại hoặc miễn phí sau 3 năm).',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // Bài 4: chi-phi-lan-banh-cac-dong-xe-hyundai-nghe-an-ha-tinh-2026 (Chủ đề: Thuế phí & Lăn bánh)
  // =========================================================================
  {
    tieuDe: 'Chi phí lăn bánh các dòng xe Hyundai tại Nghệ An & Hà Tĩnh 2026',
    slug: 'chi-phi-lan-banh-cac-dong-xe-hyundai-nghe-an-ha-tinh-2026',
    focusKeyword: 'Chi phí lăn bánh các dòng xe Hyundai',
    metaDescription: 'Bảng dự toán Chi phí lăn bánh các dòng xe Hyundai tại Nghệ An và Hà Tĩnh năm 2026 chi tiết từng phiên bản, thuế trước bạ và phí biển số.',
    thumbnail: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Tucson-icon.webp',
    thumbnailAlt: 'Dự toán Chi phí lăn bánh các dòng xe Hyundai tại Nghệ An',
    blocks: [
      {
        type: 'paragraph',
        content: 'Chi phí lăn bánh các dòng xe Hyundai tại Nghệ An và Hà Tĩnh luôn là mối quan tâm hàng đầu của người mua xe ô tô mới. Để chiếc xe có thể lưu hành hợp pháp trên đường, ngoài giá bán niêm yết tại đại lý, chủ sở hữu cần hoàn tất các khoản thuế và lệ phí bắt buộc theo quy định của nhà nước và cơ quan đăng kiểm địa phương.',
      },
      {
        type: 'callout',
        calloutType: 'info',
        title: 'Mức lệ phí trước bạ tại Nghệ An & Hà Tĩnh',
        content: 'Theo quy định hiện hành năm 2026, mức lệ phí trước bạ áp dụng cho xe ô tô chở người dưới 9 chỗ ngồi tại Nghệ An và Hà Tĩnh là 10% giá trị tính thuế niêm yết, lệ phí cấp biển số là 1.000.000 VNĐ.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Các khoản thuế phí cấu thành Chi phí lăn bánh các dòng xe Hyundai tại Nghệ An',
      },
      {
        type: 'paragraph',
        content: 'Tổng các khoản chi phí bắt buộc bao gồm: 1. Giá bán niêm yết của xe (đã gồm VAT). 2. Lệ phí trước bạ (10% giá niêm yết tại Nghệ An, Hà Tĩnh). 3. Lệ phí cấp biển số phương tiện (1.000.000 VNĐ). 4. Phí đăng kiểm phương tiện và kiểm định an toàn (90.000 VNĐ). 5. Phí bảo trì đường bộ 1 năm (1.560.000 VNĐ đối với xe cá nhân). 6. Bảo hiểm trách nhiệm dân sự bắt buộc (480.000 VNĐ - 873.000 VNĐ tùy số chỗ ngồi).',
      },
      {
        type: 'singleImage',
        imageUrl: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Tucson-icon.webp',
        imageAlt: 'Dự toán Chi phí lăn bánh các dòng xe Hyundai tại Nghệ An',
        caption: 'Bảng tính chi phí lăn bánh trọn gói cho xe Hyundai Tucson và các mẫu xe khác',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Bảng dự toán Chi phí lăn bánh các dòng xe Hyundai chi tiết năm 2026',
      },
      {
        type: 'priceTable',
        title: 'Bảng Tính Chi Phí Lăn Bánh Xe Tại Nghệ An (Tạm Tính)',
        carSlug: 'tucson',
        prices: [
          { name: 'Hyundai Grand i10 MT (Niêm yết 360tr)', price: 'Lăn bánh ~ 402 triệu', note: 'Trước bạ: 36tr | Biển số: 1tr' },
          { name: 'Hyundai Accent 1.5 AT (Niêm yết 489tr)', price: 'Lăn bánh ~ 544 triệu', note: 'Trước bạ: 48.9tr | Biển số: 1tr' },
          { name: 'Hyundai Creta 1.5 Đặc Biệt (Niêm yết 650tr)', price: 'Lăn bánh ~ 721 triệu', note: 'Trước bạ: 65tr | Biển số: 1tr' },
          { name: 'Hyundai Tucson 2.0 Xăng (Niêm yết 769tr)', price: 'Lăn bánh ~ 852 triệu', note: 'Trước bạ: 76.9tr | Biển số: 1tr' },
          { name: 'Hyundai Santa Fe 2.5 AWD (Niêm yết 1.269tr)', price: 'Lăn bánh ~ 1.403 triệu', note: 'Trước bạ: 126.9tr | Biển số: 1tr' },
          { name: 'Hyundai Palisade Prestige (Niêm yết 1.559tr)', price: 'Lăn bánh ~ 1.722 triệu', note: 'Trước bạ: 155.9tr | Biển số: 1tr' },
        ],
      },
      {
        type: 'paragraph',
        content: 'Lưu ý rằng mức tính toán Chi phí lăn bánh các dòng xe Hyundai trên là mức tạm tính chuẩn theo quy định của nhà nước. Khi mua xe tại đại lý ủy quyền, quý khách hàng sẽ được áp dụng thêm các chương trình giảm tiền mặt trực tiếp và hỗ trợ lệ phí trước bạ từ showroom, giúp chi phí lăn bánh thực tế tiết kiệm từ 20 đến hơn 100 triệu đồng.',
      },
      {
        type: 'paragraph',
        content: 'Bên cạnh đó, đội ngũ nhân viên dịch vụ của chúng tôi luôn sẵn sàng hỗ trợ trọn gói thủ tục nộp thuế trước bạ điện tử, đăng ký biển số tại công an địa phương và đăng kiểm xe hoàn chỉnh trước khi bàn giao xe tận tay quý khách hàng.',
      },
      {
        type: 'paragraph',
        content: 'Việc nắm rõ dự toán Chi phí lăn bánh các dòng xe Hyundai sẽ giúp chủ xe chủ động chuẩn bị tài chính, tránh phát sinh những chi phí không mong muốn trong quá trình làm thủ tục giấy tờ xe mới tại địa bàn tỉnh Nghệ An và Hà Tĩnh.',
      },
      {
        type: 'paragraph',
        content: 'Đối với khách hàng mua xe dưới hình thức đứng tên công ty doanh nghiệp, các khoản thuế phí như VAT và lệ phí trước bạ còn được khấu trừ thuế và tính vào chi phí hợp lý của doanh nghiệp theo quy định của luật thuế hiện hành.',
      },
      {
        type: 'paragraph',
        content: 'Ngoài các khoản phí bắt buộc, khách hàng có thể tùy chọn tham gia thêm các gói bảo hiểm tự nguyện mở rộng như bảo hiểm thủy kích ngập nước, bảo hiểm mất cắp bộ phận và bảo hiểm tai nạn cho người ngồi trên xe với chi phí rất hợp lý.',
      },
      {
        type: 'paragraph',
        content: 'Để nhận bảng dự toán chính xác nhất cho từng dòng xe và địa chỉ hộ khẩu cụ thể, quý khách chỉ cần để lại số điện thoại hoặc liên hệ hotline để được chuyên viên hỗ trợ tính toán tức thì theo thời gian thực.',
      },
      {
        type: 'paragraph',
        content: 'Chúng tôi cam kết hỗ trợ khách hàng đăng ký biển số xe tại tất cả các huyện thị thuộc Nghệ An như Nghi Lộc, Hưng Nguyên, Thanh Chương, Đô Lương, Nghĩa Đàn và toàn bộ các huyện thuộc tỉnh Hà Tĩnh với chi phí tối ưu và thời gian nhanh nhất.',
      },
      {
        type: 'paragraph',
        content: 'Khách hàng nhận bàn giao xe tại nhà hoàn toàn có thể yên tâm vì mọi thủ tục pháp lý, biên bản bàn giao, sổ bảo hành điện tử và chứng từ hóa đơn đều được bàn giao đầy đủ, minh bạch.',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Tucson',
        carSlug: 'tucson',
        carPrice: 769000000,
        seatCount: 5,
        fuelType: 'Xăng / Dầu Smartstream',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Santa Fe',
        carSlug: 'santafe',
        carPrice: 1069000000,
        seatCount: 7,
        fuelType: 'Xăng Smartstream 2.5L',
      },
      {
        type: 'ctaButton',
        ctaButtonText: 'Nhận Báo Giá Lăn Bánh Kèm Khuyến Mại',
        ctaActionType: 'hotline',
        ctaPhone: '0942398688',
        ctaSubtext: 'Chuyên viên hỗ trợ đăng ký biển số và bấm biển đẹp tận tình',
        ctaVariant: 'red',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Câu hỏi thường gặp về thủ tục đăng ký xe tại địa phương',
      },
      {
        type: 'faq',
        faqs: [
          {
            question: 'Hộ khẩu ở huyện có phải về TP Vinh để đăng ký biển số không?',
            answer: 'Hiện nay công an các huyện thị tại Nghệ An và Hà Tĩnh đã thực hiện thủ tục đăng ký xe và bấm biển số trực tiếp tại công an cấp huyện hoặc xã, vô cùng nhanh chóng và thuận tiện.',
          },
          {
            question: 'Bảo hiểm thân vỏ có bắt buộc trong chi phí lăn bánh không?',
            answer: 'Bảo hiểm thân vỏ (vật chất xe) là tự nguyện đối với khách hàng trả thẳng nhưng là điều kiện bắt buộc nếu quý khách vay ngân hàng mua xe trả góp.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // Bài 5: quy-trinh-bao-duong-xe-hyundai-va-chinh-sach-bao-hanh-5-nam (Chủ đề: Dịch vụ bảo dưỡng & Hậu mãi)
  // =========================================================================
  {
    tieuDe: 'Quy trình bảo dưỡng xe Hyundai và bảo hành 5 năm tại Vinh',
    slug: 'quy-trinh-bao-duong-xe-hyundai-va-chinh-sach-bao-hanh-5-nam',
    focusKeyword: 'bảo dưỡng xe Hyundai',
    metaDescription: 'Hướng dẫn quy trình bảo dưỡng xe Hyundai định kỳ các cấp độ 5.000km, 10.000km, 40.000km và chính sách bảo hành 5 năm chính hãng tại Nghệ An.',
    thumbnail: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Palisade-icon.webp',
    thumbnailAlt: 'Quy trình bảo dưỡng xe Hyundai chính hãng tại Vinh Nghệ An',
    blocks: [
      {
        type: 'paragraph',
        content: 'Quy trình bảo dưỡng xe Hyundai định kỳ đóng vai trò sống còn trong việc duy trì độ bền bỉ, tính năng an toàn và kéo dài tuổi thọ cho chiếc xế yêu của bạn qua từng năm tháng vận hành trên mọi cung đường. Việc thực hiện đúng các mốc bảo dưỡng tiêu chuẩn giúp chủ xe sớm phát hiện hao mòn kỹ thuật, tối ưu mức tiêu hao nhiên liệu và phòng ngừa triệt để các rủi ro hỏng hóc tốn kém khi di chuyển trên đường dài.',
      },
      {
        type: 'callout',
        calloutType: 'success',
        title: 'Chính sách bảo hành 5 năm chính hãng',
        content: 'Tất cả dòng xe du lịch Hyundai mua tại showroom đều áp dụng chính sách bảo hành chính hãng 5 năm hoặc 100.000 km cùng dịch vụ cứu hộ khẩn cấp 24/7 trên toàn địa bàn Nghệ An và Hà Tĩnh.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Các cấp độ bảo dưỡng xe Hyundai theo khuyến cáo nhà sản xuất',
      },
      {
        type: 'singleImage',
        imageUrl: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1764642863/media/Palisade-icon.webp',
        imageAlt: 'Quy trình bảo dưỡng xe Hyundai chính hãng tại Vinh Nghệ An',
        caption: 'Xưởng dịch vụ ủy quyền 3S hiện đại với trang thiết bị chẩn đoán tiên tiến bậc nhất',
      },
      {
        type: 'paragraph',
        content: 'Theo tiêu chuẩn toàn cầu của tập đoàn ô tô, quy trình bảo dưỡng xe Hyundai được phân chia thành 4 cấp độ kỹ thuật nghiêm ngặt nhằm kiểm soát toàn diện tình trạng vận hành của phương tiện. Cấp 1 (mỗi 5.000 km hoặc 3 tháng) tập trung thay dầu bôi trơn động cơ, kiểm tra lọc gió và xiết chặt ốc gầm cùng hệ thống đèn tín hiệu. Cấp 2 (mỗi 10.000 km hoặc 6 tháng) bổ sung thay lọc dầu động cơ, đảo lốp và vệ sinh hệ thống phanh đĩa 4 bánh.',
      },
      {
        type: 'paragraph',
        content: 'Cấp 3 (mỗi 20.000 km hoặc 12 tháng) thực hiện thay lọc gió động cơ, lọc gió điều hòa cabin và cân bằng động bánh xe điện tử. Cấp 4 (mỗi 40.000 km hoặc 24 tháng) là cấp đại tu định kỳ lớn nhất với việc thay toàn bộ dầu phanh, dầu hộp số tự động, dung dịch nước làm mát động cơ, bugi đánh lửa Iridium và kiểm tra hệ thống treo toàn diện.',
      },
      {
        type: 'priceTable',
        title: 'Bảng Chi Phí Bảo Dưỡng Xe Định Kỳ Tham Khảo',
        carSlug: 'palisade',
        prices: [
          { name: 'Bảo dưỡng Cấp 1 (Mốc 5.000 km)', price: '550.000 - 850.000 VNĐ', note: 'Thay dầu máy, kiểm tra 16 hạng mục' },
          { name: 'Bảo dưỡng Cấp 2 (Mốc 10.000 km)', price: '1.100.000 - 1.600.000 VNĐ', note: 'Thay dầu + lọc dầu, vệ sinh phanh' },
          { name: 'Bảo dưỡng Cấp 3 (Mốc 20.000 km)', price: '2.200.000 - 3.200.000 VNĐ', note: 'Thay lọc gió, cân bằng động bánh xe' },
          { name: 'Bảo dưỡng Cấp 4 (Mốc 40.000 km)', price: '4.500.000 - 6.500.000 VNĐ', note: 'Bảo dưỡng lớn, thay dầu phanh & mát' },
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Lợi ích khi bảo dưỡng xe Hyundai tại đại lý ủy quyền 3S',
      },
      {
        type: 'prosCons',
        title: 'So Sánh Bảo Dưỡng Chính Hãng Và Garage Ngoài',
        pros: [
          'Sử dụng 100% phụ tùng thay thế và dầu nhớt chính hãng có tem truy xuất nguồn gốc rõ ràng',
          'Kỹ thuật viên lành nghề được đào tạo bài bản và cấp chứng chỉ quốc tế từ tập đoàn Hyundai',
          'Trang thiết bị máy chẩn đoán điện tử GDS Mobile đọc lỗi chuẩn xác từng thông số kỹ thuật',
          'Lịch sử bảo dưỡng được số hóa đồng bộ toàn quốc, giúp xe giữ giá trị thanh khoản cao khi bán lại',
        ],
        cons: [
          'Cần đặt hẹn trước vào các ngày cao điểm cuối tuần để tránh phải chờ đợi lâu',
          'Chi phí linh kiện phụ tùng chuẩn hãng cao hơn đôi chút so với hàng trôi nổi ngoài thị trường',
        ],
      },
      {
        type: 'paragraph',
        content: 'Xưởng dịch vụ ủy quyền tại TP Vinh sở hữu diện tích mặt bằng rộng lớn với hơn 20 khoang sửa chữa nhanh, buồng sơn sấy hấp tiêu chuẩn quốc tế và phòng chờ VIP phục vụ nước uống, trà bánh miễn phí trong suốt thời gian quý khách chờ nhận xe.',
      },
      {
        type: 'paragraph',
        content: 'Khách hàng hoàn toàn có thể chủ động đặt hẹn bảo dưỡng trực tuyến trước 1 ngày qua hotline hoặc ứng dụng chăm sóc khách hàng để được ưu tiên tiếp nhận ngay khi xe đến xưởng và nhận thêm voucher giảm giá 10% chi phí công lao động sửa chữa.',
      },
      {
        type: 'paragraph',
        content: 'Đội ngũ cố vấn dịch vụ tận tâm cam kết tư vấn đúng hạng mục cần thiết, báo giá minh bạch trước khi thực hiện và không phát sinh bất kỳ khoản phí ngoài dự toán nào mà chưa có sự đồng ý của quý khách.',
      },
      {
        type: 'paragraph',
        content: 'Bên cạnh việc chăm sóc xe định kỳ, trung tâm dịch vụ còn cung cấp dịch vụ chăm sóc làm đẹp xe chuyên sâu như phủ ceramic bảo vệ sơn bóng, dán phim cách nhiệt cao cấp và vệ sinh khử mùi nội thất bằng công nghệ ozone sinh học.',
      },
      {
        type: 'paragraph',
        content: 'Đặc biệt đối với điều kiện thời tiết khắc nghiệt mùa mưa lũ miền Trung, kỹ thuật viên sẽ kiểm tra kỹ lưỡng hệ thống gầm bệ chống rỉ sét, kiểm tra gioăng cao su chống nước và bảo dưỡng hệ thống điện tử để ngăn ngừa nguy cơ chập cháy do ẩm ướt. Chủ xe cũng được hướng dẫn cách kiểm tra áp suất lốp, mức nước rửa kính và tình trạng ắc quy định kỳ tại nhà.',
      },
      {
        type: 'paragraph',
        content: 'Mọi phương tiện sau khi hoàn tất quy trình bảo dưỡng đều được kiểm tra an toàn lần cuối bởi tổ trưởng kỹ thuật và rửa xe hút bụi sạch sẽ trước khi bàn giao tận tay quý khách hàng.',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Palisade',
        carSlug: 'palisade',
        carPrice: 1469000000,
        seatCount: 7,
        fuelType: 'Dầu 2.2L CRDi',
      },
      {
        type: 'relatedCar',
        carName: 'Hyundai Tucson',
        carSlug: 'tucson',
        carPrice: 769000000,
        seatCount: 5,
        fuelType: 'Xăng / Dầu Smartstream',
      },
      {
        type: 'ctaButton',
        ctaButtonText: 'Đặt Lịch Hẹn Bảo Dưỡng Ngay',
        ctaActionType: 'hotline',
        ctaPhone: '0942398688',
        ctaSubtext: 'Ưu tiên tiếp nhận ngay - Tặng voucher giảm 10% công bảo dưỡng',
        ctaVariant: 'emerald',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Câu hỏi thường gặp về quy trình bảo dưỡng và bảo hành xe',
      },
      {
        type: 'faq',
        faqs: [
          {
            question: 'Có bắt buộc phải bảo dưỡng đúng hạn tại hãng để giữ bảo hành?',
            answer: 'Để đảm bảo quyền lợi bảo hành 5 năm chính hãng, quý khách nên thực hiện bảo dưỡng định kỳ tại xưởng dịch vụ ủy quyền để toàn bộ lịch sử được ghi nhận trên hệ thống bảo hành điện tử toàn quốc.',
          },
          {
            question: 'Thời gian bảo dưỡng định kỳ cấp 1 mất bao lâu?',
            answer: 'Thời gian thực hiện bảo dưỡng cấp 1 (5.000km) tiêu chuẩn chỉ mất từ 30 đến 45 phút, quý khách có thể ngồi thư giãn tại phòng chờ VIP và nhận lại xe nhanh chóng.',
          },
        ],
      },
    ],
  },
];

async function seedSeoPosts() {
  console.log('🚀 Bắt đầu tạo 5 bài viết chuẩn SEO Real-Time...');

  // Lấy tác giả đầu tiên hoặc tạo tác giả mặc định
  let author = await db.query.users.findFirst();
  if (!author) {
    console.log('⚠️ Không tìm thấy người dùng, tiến hành tạo người dùng tác giả mặc định...');
    const insertedUsers = await db
      .insert(schema.users)
      .values({
        email: 'admin@cardealer.com',
        passwordHash: 'password-hash',
        fullName: 'Ban Biên Tập Hyundai Nghệ An',
        phone: '0942398688',
        role: 'admin',
        status: 'active',
      })
      .returning();
    author = insertedUsers[0];
  }

  // Đảm bảo có chuyên mục bài viết
  let categoryTinTuc = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, 'tin-tuc-su-kien'),
  });

  if (!categoryTinTuc) {
    console.log('⚠️ Tạo danh mục "Tin Tức & Sự Kiện"...');
    const inserted = await db
      .insert(schema.categories)
      .values({
        tenChuyenMuc: 'Tin Tức & Sự Kiện',
        slug: 'tin-tuc-su-kien',
        moTa: 'Cập nhật tin tức thị trường xe, bảng giá xe Hyundai và các chương trình khuyến mại mới nhất.',
      })
      .returning();
    categoryTinTuc = inserted[0];
  }

  let categoryTuVan = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, 'tu-van-mua-xe'),
  });

  if (!categoryTuVan) {
    console.log('⚠️ Tạo danh mục "Tư Vấn Mua Xe"...');
    const inserted = await db
      .insert(schema.categories)
      .values({
        tenChuyenMuc: 'Tư Vấn Mua Xe',
        slug: 'tu-van-mua-xe',
        moTa: 'Cẩm nang hướng dẫn mua xe trả góp, tính chi phí lăn bánh và kinh nghiệm chọn xe ô tô Hyundai.',
      })
      .returning();
    categoryTuVan = inserted[0];
  }

  // Chèn từng bài viết và in điểm SEO Real-Time
  for (const postData of seoPostsData) {
    const tiptapDoc = createPostDoc(postData.blocks);

    // Kiểm tra điểm SEO qua Động cơ calculateSeoScore
    const seoScore = calculateSeoScore({
      tieuDe: postData.tieuDe,
      slug: postData.slug,
      focusKeyword: postData.focusKeyword,
      noiDung: tiptapDoc,
      metaDescription: postData.metaDescription,
      existingPosts: seoPostsData
        .filter((p) => p.slug !== postData.slug)
        .map((p) => ({
          slug: p.slug,
          focusKeyword: p.focusKeyword,
          tieuDe: p.tieuDe,
        })),
    });

    console.log(`\n📄 [Bài viết] "${postData.tieuDe}"`);
    console.log(`   - Slug: ${postData.slug}`);
    console.log(`   - Focus Keyword: "${postData.focusKeyword}"`);
    console.log(`   - Điểm SEO Real-Time: ${seoScore.score}/100 (${seoScore.status})`);
    console.log(`   - Số từ: ${seoScore.summary.wordCount} từ | H2: ${seoScore.summary.h2Count} | Images: ${seoScore.summary.imageCount} | Internal Links: ${seoScore.summary.internalLinkCount}`);

    // Hiển thị chi tiết từng tiêu chí
    for (const c of seoScore.criteria) {
      const icon = c.passed ? '✅' : '❌';
      console.log(`     ${icon} ${c.label}: ${c.score}/${c.maxScore} (${c.message || ''})`);
    }

    // Xác định chuyên mục phù hợp
    const targetCategory =
      postData.slug.includes('tra-gop') || postData.slug.includes('lan-banh') || postData.slug.includes('bao-duong')
        ? categoryTuVan || categoryTinTuc
        : categoryTinTuc;

    const categoryId = targetCategory ? targetCategory.id : categoryTinTuc!.id;

    // Kiểm tra bài viết đã tồn tại chưa
    const existing = await db.query.posts.findFirst({
      where: eq(schema.posts.slug, postData.slug),
    });

    if (existing) {
      console.log(`   🔄 Cập nhật bài viết hiện có ID: ${existing.id}`);
      await db
        .update(schema.posts)
        .set({
          tieuDe: postData.tieuDe,
          noiDung: tiptapDoc,
          metaTitle: postData.tieuDe,
          metaDescription: postData.metaDescription,
          status: 'published',
          categoryId,
          authorId: author?.id ?? null,
          anhDaiDienUrl: postData.thumbnail,
          anhDaiDienAlt: postData.thumbnailAlt || postData.tieuDe,
          wordCount: seoScore.summary.wordCount,
          readingTime: seoScore.summary.readingTime,
          updatedAt: new Date(),
        })
        .where(eq(schema.posts.id, existing.id));
    } else {
      const inserted = await db
        .insert(schema.posts)
        .values({
          tieuDe: postData.tieuDe,
          slug: postData.slug,
          noiDung: tiptapDoc,
          metaTitle: postData.tieuDe,
          metaDescription: postData.metaDescription,
          status: 'published',
          categoryId,
          authorId: author?.id ?? null,
          anhDaiDienUrl: postData.thumbnail,
          anhDaiDienAlt: postData.thumbnailAlt || postData.tieuDe,
          wordCount: seoScore.summary.wordCount,
          readingTime: seoScore.summary.readingTime,
        })
        .returning();
      console.log(`   ✅ Đã chèn bài viết ID: ${inserted[0].id}`);
    }
  }

  console.log('\n🎉 Hoàn tất tạo 5 bài viết chuẩn SEO Real-Time vào CSDL!');
}

seedSeoPosts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Lỗi khi khởi tạo bài viết SEO:', err);
    process.exit(1);
  });
