import { describe, it, expect } from 'vitest';
import {
  calculateSeoScore,
  normalizeText,
  countKeywordOccurrences,
  isInternalLink,
  calculateTokenSimilarity,
} from '../seo/score';

describe('SEO Scoring Engine - 10 Criteria Enhanced (calculateSeoScore)', () => {
  // Mock document Tiptap hoàn hảo chuẩn SEO
  const validTiptapDoc = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Bảng giá xe Hyundai Tucson 2026 tại Nghệ An đang thu hút sự quan tâm lớn từ khách hàng mua xe SUV đô thị. Với thiết kế hiện đại và công nghệ tiên tiến, mẫu xe mang lại trải nghiệm vượt trội cho gia đình bạn trên mọi cung đường.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Đánh giá ngoại thất Hyundai Tucson 2026 tại Vinh Nghệ An' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Mẫu xe Hyundai Tucson 2026 tại Nghệ An sở hữu lưới tản nhiệt Parametric Jewel ẩn đèn định vị LED độc đáo. Xe có kích thước rộng rãi, phù hợp với điều kiện giao thông cả thành thị lẫn đường trường miền Trung. Khách hàng quan tâm có thể xem thêm thông số kỹ thuật chi tiết tại trang của chúng tôi.',
          },
        ],
      },
      {
        type: 'image',
        attrs: {
          src: 'https://xehyundaivinh.com/tucson-front.jpg',
          alt: 'Ngoại thất Hyundai Tucson 2026 tại Nghệ An chính hãng',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Chi phí lăn bánh và bảng giá xe tại Hà Tĩnh' }],
      },
      {
        type: 'paragraph',
        content: [
          // Nhân bản đoạn văn để đạt đủ >= 600 từ
          {
            type: 'text',
            text: Array(45)
              .fill(
                'Hyundai Tucson 2026 tại Nghệ An là sự lựa chọn hàng đầu cho phân khúc SUV hạng C với trang bị động cơ SmartStream và gói an toàn chủ động SmartSense. Đại lý Hyundai Vinh luôn có sẵn xe giao ngay đủ màu sắc và hỗ trợ trả góp lãi suất ưu đãi.'
              )
              .join(' '),
          },
        ],
      },
      {
        type: 'relatedCarBlock',
        attrs: { carSlug: 'tucson-2026' },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Quý khách có thể tham khảo thêm ',
          },
          {
            type: 'text',
            marks: [{ type: 'link', attrs: { href: '/bang-gia-xe' } }],
            text: 'bảng giá xe Hyundai mới nhất',
          },
          {
            type: 'text',
            text: ' hoặc liên hệ showroom.',
          },
        ],
      },
    ],
  };

  it('1. Đạt điểm cao (good >= 80) khi bài viết tối ưu chuẩn mực 10 tiêu chí', () => {
    const result = calculateSeoScore({
      tieuDe: 'Giá Xe Hyundai Tucson 2026 Lăn Bánh Tại Vinh Nghệ An Mới Nhất', // 58 ký tự
      slug: 'gia-xe-hyundai-tucson-2026-tai-nghe-an',
      focusKeyword: 'Hyundai Tucson 2026 tại Nghệ An',
      noiDung: validTiptapDoc,
      metaDescription:
        'Cập nhật bảng giá xe Hyundai Tucson 2026 tại Nghệ An lăn bánh tại TP Vinh mới nhất kèm ưu đãi tiền mặt và gói quà tặng chính hãng từ đại lý.', // 142 ký tự
      existingPosts: [{ slug: 'gia-xe-santa-fe', focusKeyword: 'Hyundai Santa Fe 2026' }],
    });

    expect(result.success).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.status).toBe('good');
    expect(result.criteria).toHaveLength(10);

    const titleCrit = result.criteria.find((c) => c.id === 'title_length');
    expect(titleCrit?.passed).toBe(true);
    expect(titleCrit?.score).toBe(10);

    const slugCrit = result.criteria.find((c) => c.id === 'slug_keyword');
    expect(slugCrit?.passed).toBe(true);

    const introCrit = result.criteria.find((c) => c.id === 'intro_keyword');
    expect(introCrit?.passed).toBe(true);

    const wordCrit = result.criteria.find((c) => c.id === 'word_count');
    expect(wordCrit?.passed).toBe(true);
    expect(result.summary.wordCount).toBeGreaterThanOrEqual(600);

    const h2Crit = result.criteria.find((c) => c.id === 'h2_structure');
    expect(h2Crit?.passed).toBe(true);
    expect(result.summary.h2Count).toBeGreaterThanOrEqual(2);

    const imageCrit = result.criteria.find((c) => c.id === 'image_alts');
    expect(imageCrit?.passed).toBe(true);

    const linkCrit = result.criteria.find((c) => c.id === 'internal_links');
    expect(linkCrit?.passed).toBe(true);
    expect(result.summary.internalLinkCount).toBeGreaterThanOrEqual(2);

    const metaCrit = result.criteria.find((c) => c.id === 'meta_desc');
    expect(metaCrit?.passed).toBe(true);

    const canniCrit = result.criteria.find((c) => c.id === 'cannibalization');
    expect(canniCrit?.passed).toBe(true);
  });

  it('2. Word Boundary Matching: Không bắt nhầm Substring Collision giữa "i10" và "chi 100tr", "tuc" và "tucson"', () => {
    // Văn bản có chứa "chi 100 triệu", "thi 10 điểm", nhưng KHÔNG có từ khóa đơn lẻ "i10"
    const textWithFakeMatches = 'Khách hàng chi 100 triệu đồng để mua xe và được tặng 10 voucher. Mẫu xe Tucson rất đẹp.';
    
    // Đếm "i10": Phải là 0 vì chỉ có "100" hoặc "10"
    expect(countKeywordOccurrences(textWithFakeMatches, 'i10')).toBe(0);

    // Đếm "tuc": Phải là 0 vì "tucson" là 1 từ liền, không có từ "tuc" đứng độc lập
    expect(countKeywordOccurrences(textWithFakeMatches, 'tuc')).toBe(0);

    // Khi có "Hyundai i10" và "TP Vinh"
    const realText = 'Bảng giá Hyundai i10 lăn bánh tại TP Vinh mới nhất hôm nay.';
    expect(countKeywordOccurrences(realText, 'i10')).toBe(1);
    expect(countKeywordOccurrences(realText, 'vinh')).toBe(1);
  });

  it('3. Mật độ cụm từ khóa dài (Long-tail Density) không bị phạt false-positive nhồi nhét', () => {
    // Cụm từ khóa dài 6 từ: "giá xe hyundai creta tại vinh"
    const longTailDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Bài viết cập nhật giá xe hyundai creta tại vinh mới nhất năm 2026. ' +
                Array(15).fill('Mẫu xe sở hữu nhiều ưu điểm vượt trội về vận hành và tiện nghi sang trọng trong phân khúc SUV đô thị gầm cao.').join(' ') +
                ' Khách hàng có thể tham khảo giá xe hyundai creta tại vinh trực tiếp từ nhân viên tư vấn.' +
                Array(15).fill('Đại lý hỗ trợ trả góp lãi suất thấp nhất thị trường với thủ tục nhanh gọn.').join(' ') +
                ' Để nhận báo giá xe hyundai creta tại vinh tốt nhất xin liên hệ ngay.',
            },
          ],
        },
      ],
    };

    const result = calculateSeoScore({
      tieuDe: 'Bảng Giá Xe Hyundai Creta Tại Vinh Mới Nhất Năm 2026',
      slug: 'gia-xe-hyundai-creta-tai-vinh',
      focusKeyword: 'giá xe hyundai creta tại vinh', // 6 từ, xuất hiện 3 lần trong bài ~700 từ
      noiDung: longTailDoc,
    });

    const densityCrit = result.criteria.find((c) => c.id === 'keyword_density');
    expect(result.summary.isLongTail).toBe(true);
    expect(result.summary.keywordOccurrences).toBe(3);
    // Phrase occurrence density ~ 3 / 700 * 100 = 0.43% -> Trong ngưỡng chuẩn 0.3% - 1.2%
    expect(densityCrit?.passed).toBe(true);
    expect(densityCrit?.score).toBe(10);
  });

  it('4. Cảnh báo lỗi phân cấp Heading khi phát hiện thẻ H1 bên trong editor body', () => {
    const docWithH1InBody = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 }, // LỖI: H1 nằm trong body
          content: [{ type: 'text', text: 'Thẻ H1 Bị Trùng Lặp Trong Body' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Mục 1 H2 hợp lệ tại Vinh' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Mục 2 H2 hợp lệ tại Nghệ An' }],
        },
      ],
    };

    const result = calculateSeoScore({
      noiDung: docWithH1InBody,
      focusKeyword: 'Hyundai Tucson',
    });

    const h2Crit = result.criteria.find((c) => c.id === 'h2_structure');
    expect(h2Crit?.passed).toBe(false);
    expect(h2Crit?.score).toBeLessThanOrEqual(3);
    expect(h2Crit?.message).toContain('Phát hiện thẻ H1 bên trong nội dung');
  });

  it('5. Trích xuất đoạn mở đầu chuẩn từ Paragraph đầu tiên (không bị lẫn ảnh hoặc callout phía trên)', () => {
    const docWithCalloutOnTop = {
      type: 'doc',
      content: [
        {
          type: 'calloutBlock',
          attrs: { type: 'info' },
          content: [{ type: 'text', text: 'Khung thông báo lưu ý đầu bài không có từ khóa.' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Đoạn văn mở đầu chính thức có chứa Hyundai Creta 2026 tại Nghệ An cho khách hàng mua xe.',
            },
          ],
        },
      ],
    };

    const result = calculateSeoScore({
      noiDung: docWithCalloutOnTop,
      focusKeyword: 'Hyundai Creta 2026',
    });

    const introCrit = result.criteria.find((c) => c.id === 'intro_keyword');
    expect(introCrit?.passed).toBe(true);
    expect(introCrit?.score).toBe(10);
  });

  it('6. Thẩm định URL nội bộ an toàn (không bị lừa bởi link mạng xã hội có chứa tên miền)', () => {
    // Link nội bộ
    expect(isInternalLink('/xe/tucson')).toBe(true);
    expect(isInternalLink('#thong-so')).toBe(true);
    expect(isInternalLink('https://xehyundaivinh.com/tin-tuc')).toBe(true);
    expect(isInternalLink('http://cardealer.local/xe')).toBe(true);

    // Link ngoài có chứa substring nhưng khác hostname (Cấm nhận là internal link)
    expect(isInternalLink('https://facebook.com/xehyundaivinh')).toBe(false);
    expect(isInternalLink('https://youtube.com/watch?v=123&author=xehyundaivinh')).toBe(false);
    expect(isInternalLink('https://tiktok.com/@hyundaivinh')).toBe(false);
  });

  it('7. Cảnh báo Cannibalization Guard nâng cao với độ tương đồng Token Similarity', () => {
    const similarity = calculateTokenSimilarity(
      'đánh giá xe hyundai tucson 2026',
      'đánh giá hyundai tucson 2026 mới'
    );
    expect(similarity).toBeGreaterThan(0.7);

    // Test cảnh báo với bài viết có độ tương đồng biến thể cao
    const result = calculateSeoScore({
      focusKeyword: 'đánh giá xe hyundai tucson 2026',
      existingPosts: [
        {
          id: 'post-99',
          slug: 'danh-gia-hyundai-tucson-2026-moi',
          focusKeyword: 'đánh giá xe hyundai tucson 2026',
          tieuDe: 'Đánh giá xe Hyundai Tucson 2026 chi tiết',
        },
      ],
    });

    const canniCrit = result.criteria.find((c) => c.id === 'cannibalization');
    expect(canniCrit?.passed).toBe(false);
    expect(canniCrit?.score).toBe(0);
    expect(canniCrit?.message).toContain('ăn thịt từ khóa');
  });

  it('8. Thưởng điểm khi từ khóa nằm ở nửa đầu tiêu đề (tăng CTR) và cảnh báo khi nằm ở cuối', () => {
    // Từ khóa ở đầu tiêu đề
    const resultEarly = calculateSeoScore({
      tieuDe: 'Hyundai Tucson 2026: Đánh Giá Chi Tiết Và Bảng Giá Lăn Bánh',
      focusKeyword: 'Hyundai Tucson 2026',
    });
    const titleCritEarly = resultEarly.criteria.find((c) => c.id === 'title_length');
    expect(titleCritEarly?.passed).toBe(true);
    expect(titleCritEarly?.score).toBe(10);
    expect(titleCritEarly?.message).toContain('nửa đầu tiêu đề');

    // Từ khóa ở cuối tiêu đề
    const resultLate = calculateSeoScore({
      tieuDe: 'Bảng Giá Lăn Bánh Xe SUV Mới Nhất Mẫu Xe Hyundai Tucson 2026',
      focusKeyword: 'Hyundai Tucson 2026',
    });
    const titleCritLate = resultLate.criteria.find((c) => c.id === 'title_length');
    expect(titleCritLate?.passed).toBe(true);
    expect(titleCritLate?.score).toBe(9);
    expect(titleCritLate?.message).toContain('nên chuyển từ khóa chính lên nửa đầu');
  });

  it('9. Cảnh báo khi URL Slug quá dài (> 75 ký tự)', () => {
    const result = calculateSeoScore({
      slug: 'bang-gia-xe-hyundai-tucson-2026-moi-nhat-hom-nay-tai-cac-huyen-tinh-nghe-an-ha-tinh', // 83 ký tự
      focusKeyword: 'hyundai-tucson-2026',
    });
    const slugCrit = result.criteria.find((c) => c.id === 'slug_keyword');
    expect(slugCrit?.passed).toBe(true);
    expect(slugCrit?.score).toBe(8); // Bị trừ điểm nhẹ do slug quá dài
    expect(slugCrit?.message).toContain('hơi dài');
  });
});
