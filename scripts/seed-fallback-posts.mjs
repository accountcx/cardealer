import postgres from '../node_modules/.pnpm/node_modules/postgres/src/index.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc .env trực tiếp
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[match[1]] = value;
  }
}

const dbUrl = envVars.DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is missing in .env');
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function seed() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu bài viết vào cơ sở dữ liệu...');

  // 1. Đảm bảo tồn tại tài khoản Tác Giả / Tư Vấn Viên
  let [author] = await sql`
    SELECT id, full_name, email, role, phone, avatar_url 
    FROM users 
    WHERE role IN ('admin', 'editor', 'manager', 'sales') 
    LIMIT 1
  `;

  if (!author) {
    const authorId = crypto.randomUUID();
    [author] = await sql`
      INSERT INTO users (id, full_name, email, password_hash, role, phone, avatar_url)
      VALUES (
        ${authorId},
        'Ban Biên Tập Hyundai Vinh',
        'bbt@xehyundaivinh.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
        'editor',
        '0941.000.000',
        '/images/avatars/consultant-1.webp'
      )
      RETURNING id, full_name, email, role, phone, avatar_url
    `;
    console.log('✓ Đã tạo tài khoản tác giả mặc định:', author.full_name);
  } else {
    console.log('✓ Sử dụng tài khoản tác giả:', author.full_name, `(${author.id})`);
  }

  // 2. Danh mục bài viết
  const categoriesData = [
    {
      tenChuyenMuc: 'Bảng Giá & Khuyến Mãi',
      slug: 'bang-gia-khuyen-mai',
      moTa: 'Cập nhật bảng giá xe Hyundai và chương trình khuyến mãi giảm giá mới nhất.',
      sortOrder: 1,
    },
    {
      tenChuyenMuc: 'Cẩm Nang Mua Xe',
      slug: 'cam-nang-mua-xe',
      moTa: 'Hướng dẫn thủ tục mua xe trả góp, tính chi phí lăn bánh và bảo hiểm.',
      sortOrder: 2,
    },
    {
      tenChuyenMuc: 'Đánh Giá Xe',
      slug: 'danh-gia-xe',
      moTa: 'Đánh giá chi tiết ngoại thất, nội thất và khả năng vận hành thực tế.',
      sortOrder: 3,
    },
  ];

  const categoryMap = {};

  for (const cat of categoriesData) {
    const [existing] = await sql`SELECT id FROM categories WHERE slug = ${cat.slug} LIMIT 1`;
    if (existing) {
      categoryMap[cat.slug] = existing.id;
    } else {
      const [inserted] = await sql`
        INSERT INTO categories (id, ten_chuyen_muc, slug, mo_ta, sort_order)
        VALUES (${crypto.randomUUID()}, ${cat.tenChuyenMuc}, ${cat.slug}, ${cat.moTa}, ${cat.sortOrder})
        RETURNING id
      `;
      categoryMap[cat.slug] = inserted.id;
    }
    console.log(`✓ Chuyên mục '${cat.tenChuyenMuc}': ${categoryMap[cat.slug]}`);
  }

  // 3. Khởi tạo 3 bài viết tinh hoa
  const postsToSeed = [
    {
      slug: 'bang-gia-xe-hyundai-thang-09-2026-vinh',
      tieuDe: 'Bảng Giá Xe Hyundai Mới Nhất Tháng 09/2026 Tại TP. Vinh, Nghệ An: Ưu Đãi Lăn Bánh Lên Đến 100 Triệu',
      categorySlug: 'bang-gia-khuyen-mai',
      anhDaiDienUrl: '/images/banners/hero-event.webp',
      anhDaiDienAlt: 'Bảng giá xe Hyundai 2026 tại Nghệ An',
      tomTat: 'Tổng hợp toàn bộ giá niêm yết, chính sách giảm giá tiền mặt, gói phụ kiện chính hãng và dự toán chi phí lăn bánh các dòng xe Accent, Creta, Tucson, Santa Fe mới nhất tại đại lý Hyundai Vinh.',
      metaTitle: 'Bảng Giá Xe Hyundai Tháng 09/2026 Tại Vinh - Ưu Đãi Lăn Bánh 100 Triệu',
      metaDescription: 'Cập nhật bảng giá xe Hyundai tháng 09/2026 tại TP. Vinh, Nghệ An. Giảm tiền mặt đến 100 triệu, tặng bảo hiểm thân vỏ và phụ kiện chính hãng. Hỗ trợ vay trả góp 85%.',
      isFeatured: true,
      featuredOrder: 1,
      readingTime: 4,
      wordCount: 1450,
      tags: ['Bảng Giá Xe', 'Khuyến Mãi Hyundai', 'Giá Lăn Bánh Vinh'],
      contentAst: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Đại lý Hyundai Dũng Lạc (Hyundai Vinh) xin gửi tới quý khách hàng chương trình ưu đãi đặc biệt và bảng giá chi tiết cập nhật mới nhất tháng 09/2026. Với cam kết mang đến sản phẩm chính hãng với mức chiết khấu tốt nhất khu vực miền Trung, chúng tôi luôn sẵn sàng hỗ trợ quý khách từ khâu lái thử đến khi bàn giao xe tận nhà.',
              },
            ],
          },
          {
            type: 'calloutBlock',
            attrs: {
              type: 'info',
              title: 'Mẹo Tiết Kiệm Chi Phí Khi Mua Xe',
              content: 'Đặt cọc trong tuần lễ vàng để nhận ngay gói bảo hiểm vật chất 1 năm chính hãng cùng bộ quà tặng phụ kiện dán phim cách nhiệt cao cấp trị giá 15.000.000đ.',
            },
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Bảng Giá & Chi Phí Lăn Bánh Tham Khảo (Tháng 09/2026)' }],
          },
          {
            type: 'priceTableBlock',
            attrs: {
              title: 'Bảng Giá Xe Hyundai Mới Nhất Tại TP. Vinh',
              prices: [
                { version: 'Hyundai Grand i10 1.2 AT', listedPrice: 405000000, discount: 25000000, rollingPrice: 425000000 },
                { version: 'Hyundai Accent 1.5 AT Tiêu Chuẩn', listedPrice: 489000000, discount: 30000000, rollingPrice: 512000000 },
                { version: 'Hyundai Accent 1.5 AT Đặc Biệt', listedPrice: 569000000, discount: 35000000, rollingPrice: 595000000 },
                { version: 'Hyundai Creta 1.5 Cao Cấp', listedPrice: 699000000, discount: 45000000, rollingPrice: 735000000 },
                { version: 'Hyundai Tucson 2.0 Xăng Đặc Biệt', listedPrice: 839000000, discount: 60000000, rollingPrice: 878000000 },
                { version: 'Hyundai Santa Fe 2.5 Prestige', listedPrice: 1265000000, discount: 95000000, rollingPrice: 1320000000 },
              ],
            },
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Mẫu Xe Được Quan Tâm Nhiều Nhất' }],
          },
          {
            type: 'relatedCarBlock',
            attrs: {
              carName: 'Hyundai Accent 2026',
              slug: 'hyundai-accent',
              minPrice: 439000000,
              imageUrl: '/images/cars/accent.webp',
              seatCount: 5,
              fuelType: 'Xăng 1.5L',
            },
          },
          {
            type: 'relatedCarBlock',
            attrs: {
              carName: 'Hyundai Creta 2026',
              slug: 'hyundai-creta',
              minPrice: 599000000,
              imageUrl: '/images/cars/creta.webp',
              seatCount: 5,
              fuelType: 'Xăng 1.5L Smartstream',
            },
          },
          {
            type: 'leadFormBlock',
            attrs: {
              headline: 'Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay',
              subheadline: 'Để lại thông tin, chuyên viên tư vấn sẽ gửi bảng tính chi phí lăn bánh chính xác và số tiền trả góp hàng tháng qua Zalo trong 5 phút.',
              buttonText: 'Gửi Báo Giá Ngay',
              carName: 'Hyundai Accent / Creta',
            },
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Giải Đáp Thắc Mắc Thường Gặp (FAQ)' }],
          },
          {
            type: 'faqBlock',
            attrs: {
              questions: [
                {
                  question: 'Giá lăn bánh xe Hyundai tại Nghệ An gồm những khoản chi phí nào?',
                  answer: 'Giá lăn bánh bao gồm: Giá sau giảm trừ của đại lý + Lệ phí trước bạ (10% tại Nghệ An) + Phí biển số (1.000.000đ) + Phí đăng kiểm + Phí bảo trì đường bộ 1 năm + Bảo hiểm TNDS bắt buộc.',
                },
                {
                  question: 'Mua xe trả góp tại Hyundai Vinh cần chuẩn bị trước bao nhiêu tiền?',
                  answer: 'Quý khách chỉ cần trả trước từ 15% - 20% giá trị xe (khoảng 80 - 120 triệu tùy dòng xe Accent hay Creta). Ngân hàng hỗ trợ vay tối đa 85% trong 8 năm.',
                },
                {
                  question: 'Đại lý có hỗ trợ giao xe tận nhà tại các huyện trong tỉnh Nghệ An và Hà Tĩnh không?',
                  answer: 'Hyundai Vinh hỗ trợ giao xe tận nơi bằng xe chuyên dụng miễn phí trên toàn địa bàn Nghệ An (Diễn Châu, Đô Lương, Quỳnh Lưu, Thái Hòa...) và Hà Tĩnh.',
                },
              ],
            },
          },
        ],
      },
    },
    {
      slug: 'thu-tuc-mua-xe-tra-gop-lai-suat-thap-2026',
      tieuDe: 'Thủ Tục Mua Xe Ô Tô Trả Góp Lãi Suất Thấp 2026: Hướng Dẫn Bao Đậu Hồ Sơ Trong 24 Giờ',
      categorySlug: 'cam-nang-mua-xe',
      anhDaiDienUrl: '/images/delivery/delivery-1.webp',
      anhDaiDienAlt: 'Tư vấn mua xe Hyundai trả góp',
      tomTat: 'Quy trình vay ngân hàng mua xe Hyundai đơn giản, vay tối đa 85% giá trị xe, thời hạn lên đến 8 năm với bảng tính số tiền trả góp gốc và lãi hàng tháng chi tiết.',
      metaTitle: 'Hướng Dẫn Mua Xe Ô Tô Trả Góp 2026 - Lãi Suất Thấp, Duyệt 24 Giờ',
      metaDescription: 'Thủ tục mua xe Hyundai trả góp năm 2026 đơn giản, giải ngân nhanh. Hỗ trợ khách hàng cá nhân và doanh nghiệp, chứng minh thu nhập linh hoạt, lãi suất ưu đãi chỉ từ 6.8%/năm.',
      isFeatured: false,
      featuredOrder: 0,
      readingTime: 5,
      wordCount: 1650,
      tags: ['Vay Mua Xe', 'Thủ Tục Trả Góp'],
      contentAst: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Mua xe ô tô trả góp ngày nay đã trở thành giải pháp tài chính thông minh được hơn 70% khách hàng tại Nghệ An và Hà Tĩnh lựa chọn. Bạn không cần phải bỏ ra một số tiền quá lớn ngay lập tức mà vẫn có thể sở hữu một chiếc xe mới phục vụ công việc và gia đình.',
              },
            ],
          },
          {
            type: 'calloutBlock',
            attrs: {
              type: 'success',
              title: 'Gói Vay Ưu Đãi Lãi Suất Chỉ Từ 6.8%/Năm',
              content: 'Hyundai Vinh liên kết trực tiếp với các ngân hàng đối tác chiến lược (Vietcombank, BIDV, VIB, Shinhan Bank) mang đến gói vay lãi suất cố định ưu đãi đặc quyền cho khách hàng mua xe Hyundai trong năm 2026.',
            },
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Hồ Sơ Giấy Tờ Cần Chuẩn Bị' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Đối với khách hàng cá nhân: Căn cước công dân gắn chip, Giấy xác nhận tình trạng hôn nhân (Đăng ký kết hôn hoặc Giấy độc thân), và Chứng minh thu nhập (Hợp đồng lao động, sao kê lương 6 tháng gần nhất hoặc sổ đỏ/tài sản tích lũy kinh doanh).',
              },
            ],
          },
          {
            type: 'leadFormBlock',
            attrs: {
              headline: 'Tư Vấn Hồ Sơ Vay Trả Góp Miễn Phí',
              subheadline: 'Gửi thông tin cho chúng tôi để được chuyên viên tín dụng thẩm định và thông báo hạn mức vay tối đa trong 2 giờ.',
              buttonText: 'Thẩm Định Hồ Sơ Ngay',
              carName: 'Tất cả dòng xe Hyundai',
            },
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Câu Hỏi Thường Gặp Về Vay Mua Xe' }],
          },
          {
            type: 'faqBlock',
            attrs: {
              questions: [
                {
                  question: 'Nợ xấu nhóm 2 hoặc không có sao kê lương có vay mua xe được không?',
                  answer: 'Chúng tôi liên kết với hơn 8 ngân hàng đối tác lớn, có gói chuyên biệt hỗ trợ chứng minh qua tài sản tích lũy, cơ sở kinh doanh hộ cá thể hoặc nhà đất.',
                },
                {
                  question: 'Thời gian xét duyệt hồ sơ vay mua xe Hyundai mất bao lâu?',
                  answer: 'Chỉ từ 4 đến 8 giờ làm việc kể từ lúc nhận đủ hồ sơ hình ảnh qua Zalo, ngân hàng sẽ ra cam kết cho vay chính thức.',
                },
              ],
            },
          },
        ],
      },
    },
    {
      slug: 'danh-gia-chi-tiet-hyundai-santa-fe-2026',
      tieuDe: 'Đánh Giá Chi Tiết Hyundai Santa Fe 2026 Hoàn Toàn Mới: Đột Phá Không Gian & Công Nghệ',
      categorySlug: 'danh-gia-xe',
      anhDaiDienUrl: '/images/cars/tucson.webp',
      anhDaiDienAlt: 'Hyundai Santa Fe 2026 thế hệ mới',
      tomTat: 'Khám phá ngoại thất vuông vức việt dã, nội thất hạng thương gia 2 màn hình cong panoramic, gói an toàn SmartSense nâng cấp và khả năng vận hành mạnh mẽ trên cung đường miền Trung.',
      metaTitle: 'Đánh Giá Xe Hyundai Santa Fe 2026 Thế Hệ Mới - Thiết Kế & Vận Hành',
      metaDescription: 'Chi tiết đánh giá Hyundai Santa Fe 2026: Không gian 7 chỗ rộng rãi bậc nhất phân khúc, động cơ SmartStream thế hệ mới, trang bị ngập tràn cùng giá bán hấp dẫn tại Nghệ An.',
      isFeatured: true,
      featuredOrder: 2,
      readingTime: 6,
      wordCount: 1980,
      tags: ['Santa Fe 2026', 'Đánh Giá Xe SUV'],
      contentAst: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hyundai Santa Fe 2026 hoàn toàn mới lột xác với ngôn ngữ thiết kế hình hộp việt dã đậm chất SUV đích thực, mang đến không gian rộng rãi vượt trội và khoang nội thất chuẩn thương gia.',
              },
            ],
          },
          {
            type: 'calloutBlock',
            attrs: {
              type: 'info',
              title: 'Điểm Nhấn Công Nghệ Đỉnh Cao',
              content: 'Hệ thống an toàn chủ động Hyundai SmartSense thế hệ mới với khả năng phát hiện người đi bộ, hỗ trợ giữ làn đường và kiểm soát hành trình thích ứng Stop & Go toàn dải tốc độ.',
            },
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Thiết Kế Ngoại Thất Đột Phá Đậm Chất Việt Dã' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Dải đèn định vị chữ H biểu tượng cùng thân xe cơ bắp, cửa cốp sau siêu rộng mở ra phong cách sống cắm trại dã ngoại đẳng cấp cho cả gia đình.',
              },
            ],
          },
          {
            type: 'relatedCarBlock',
            attrs: {
              carName: 'Hyundai Santa Fe 2026',
              slug: 'santa-fe-2026',
              minPrice: 1069000000,
              imageUrl: '/images/cars/tucson.webp',
              seatCount: 7,
              fuelType: 'Xăng 2.5L Turbo Smartstream',
            },
          },
          {
            type: 'leadFormBlock',
            attrs: {
              headline: 'Đăng Ký Lái Thử Hyundai Santa Fe 2026',
              subheadline: 'Trải nghiệm trực tiếp khả năng vận hành êm ái và trang bị ngập tràn tận nơi tại Nghệ An & Hà Tĩnh.',
              buttonText: 'Đăng Ký Lái Thử Ngay',
              carName: 'Hyundai Santa Fe 2026',
            },
          },
        ],
      },
    },
  ];

  for (const post of postsToSeed) {
    const categoryId = categoryMap[post.categorySlug];
    const previewToken = crypto.randomBytes(32).toString('hex');
    const postId = crypto.randomUUID();

    const [upserted] = await sql`
      INSERT INTO posts (
        id,
        tieu_de,
        slug,
        category_id,
        author_id,
        anh_dai_dien_url,
        anh_dai_dien_alt,
        tom_tat,
        noi_dung,
        status,
        is_featured,
        featured_order,
        reading_time,
        word_count,
        meta_title,
        meta_description,
        canonical_url,
        preview_token,
        view_count,
        created_at,
        updated_at
      )
      VALUES (
        ${postId},
        ${post.tieuDe},
        ${post.slug},
        ${categoryId},
        ${author.id},
        ${post.anhDaiDienUrl},
        ${post.anhDaiDienAlt},
        ${post.tomTat},
        ${JSON.stringify(post.contentAst)},
        'published',
        ${post.isFeatured},
        ${post.featuredOrder},
        ${post.readingTime},
        ${post.wordCount},
        ${post.metaTitle},
        ${post.metaDescription},
        ${'/tin-tuc/' + post.slug},
        ${previewToken},
        1250,
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        tieu_de = EXCLUDED.tieu_de,
        category_id = EXCLUDED.category_id,
        author_id = EXCLUDED.author_id,
        anh_dai_dien_url = EXCLUDED.anh_dai_dien_url,
        anh_dai_dien_alt = EXCLUDED.anh_dai_dien_alt,
        tom_tat = EXCLUDED.tom_tat,
        noi_dung = EXCLUDED.noi_dung,
        status = 'published',
        is_featured = EXCLUDED.is_featured,
        featured_order = EXCLUDED.featured_order,
        reading_time = EXCLUDED.reading_time,
        word_count = EXCLUDED.word_count,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        canonical_url = EXCLUDED.canonical_url,
        updated_at = NOW()
      RETURNING id, tieu_de, slug, preview_token
    `;

    console.log(`✓ Đã lưu bài viết vào DB: [${upserted.slug}] "${upserted.tieu_de}"`);

    // Lưu Tags
    await sql`DELETE FROM post_tags WHERE post_id = ${upserted.id}`;
    for (const tag of post.tags) {
      await sql`
        INSERT INTO post_tags (id, post_id, tag)
        VALUES (${crypto.randomUUID()}, ${upserted.id}, ${tag})
      `;
    }
  }

  console.log('🎉 KHỞI TẠO BÀI VIẾT VÀO DATABASE THÀNH CÔNG 100%!');
  await sql.end();
}

seed().catch((err) => {
  console.error('❌ Lỗi khởi tạo dữ liệu bài viết:', err);
  process.exit(1);
});
