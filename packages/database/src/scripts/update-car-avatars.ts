import { eq } from 'drizzle-orm';
import { db, schema, queryClient } from '../client';
import type { HighlightFeature } from '@cardealer/types';

interface CarDataItem {
  id: string; // UUID chính xác trong database
  cloudinaryId?: number; // ID tham chiếu từ Cloudinary media library
  slug: string;
  name: string;
  url: string;
  filename: string;
  segment: 'sedan' | 'suv' | 'mpv' | 'hatchback' | 'ev';
  moTaChung: string;
  highlightFeatures: HighlightFeature[];
}

const CAR_DATA_LIST: CarDataItem[] = [
  {
    id: '63a950f0-6875-4b48-b0df-9521800a43e3',
    cloudinaryId: 107,
    slug: 'grand-i10',
    name: 'Hyundai Grand i10',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/i10-icon.webp?_a=BAMAABkS0',
    filename: 'i10-icon.webp',
    segment: 'hatchback',
    moTaChung: 'Bảng giá xe Hyundai Grand i10 lăn bánh mới nhất tại Đại lý 3S Hyundai Vinh. Ưu đãi tiền mặt, tặng phụ kiện chính hãng và bảo hành 5 năm.',
    highlightFeatures: [
      { icon: 'engine', title: 'Động cơ Kappa 1.2L', value: '83 mã lực' },
      { icon: 'dimension', title: 'Chiều dài cơ sở', value: '2.450 mm' },
      { icon: 'screen', title: 'Màn hình cảm ứng', value: '8 inch kết nối Apple CarPlay' },
      { icon: 'sensor', title: 'Cảm biến áp suất lốp', value: 'TPMS tiêu chuẩn' },
    ],
  },
  {
    id: '9ddbbe8d-803d-4013-9948-d2c8a26eb5bb',
    cloudinaryId: 2,
    slug: 'accent',
    name: 'Hyundai Accent',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Accent-icon.webp?_a=BAMAABkS0',
    filename: 'Accent-icon.webp',
    segment: 'sedan',
    moTaChung: 'Bảng giá xe Hyundai Accent thế hệ mới lăn bánh tại TP Vinh, Nghệ An. Hỗ trợ trả góp lãi suất 6.9%, giao xe ngay trong ngày.',
    highlightFeatures: [
      { icon: 'engine', title: 'Động cơ Smartstream', value: '1.5L - 115 mã lực' },
      { icon: 'design', title: 'Dải LED định vị', value: 'Horizon tương lai' },
      { icon: 'safety', title: 'Gói an toàn', value: 'Hyundai SmartSense' },
      { icon: 'screen', title: 'Màn hình kép', value: '10.25 inch liền khối' },
    ],
  },
  {
    id: '3924208c-11d4-4a3a-9817-15e4db1b1616',
    cloudinaryId: 41,
    slug: 'elantra',
    name: 'Hyundai Elantra',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Elantra-icon.webp?_a=BAMAABkS0',
    filename: 'Elantra-icon.webp',
    segment: 'sedan',
    moTaChung: 'Đại lý Hyundai Vinh phân phối Hyundai Elantra thể thao, sang trọng với giá lăn bánh tốt nhất khu vực Nghệ An - Hà Tĩnh.',
    highlightFeatures: [
      { icon: 'design', title: 'Thiết kế', value: '4-Door Coupe thể thao' },
      { icon: 'engine', title: 'Động cơ Turbo', value: 'Smartstream 1.6 T-GDi' },
      { icon: 'chassis', title: 'Khung gầm', value: 'K3 Platform thế hệ mới' },
    ],
  },
  {
    id: '90fe585a-ddaf-4bd1-af5d-f53c40d95d02',
    cloudinaryId: 171,
    slug: 'venue',
    name: 'Hyundai Venue',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/venue-icon.webp?_a=BAMAABkS0',
    filename: 'venue-icon.webp',
    segment: 'suv',
    moTaChung: 'Hyundai Venue SUV trẻ trung, năng động với động cơ Turbo mạnh mẽ. Đăng ký lái thử và nhận báo giá lăn bánh ưu đãi tại Vinh.',
    highlightFeatures: [
      { icon: 'engine', title: 'Động cơ 1.0 Turbo', value: '120 mã lực - 172 Nm' },
      { icon: 'transmission', title: 'Hộp số', value: '7 cấp ly hợp kép 7-DCT' },
      { icon: 'light', title: 'Đèn pha', value: 'Projector LED cao cấp' },
      { icon: 'screen', title: 'Màn hình cảm ứng', value: '8 inch không dây' },
    ],
  },
  {
    id: '81ec61ee-0851-4e7c-b5eb-8bbb91ec2dc3',
    cloudinaryId: 32,
    slug: 'creta',
    name: 'Hyundai Creta',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Creta-icon.webp?_a=BAMAABkS0',
    filename: 'Creta-icon.webp',
    segment: 'suv',
    moTaChung: 'Bảng giá xe Hyundai Creta mới nhất tại Hyundai Vinh. Ưu đãi 50% trước bạ, tặng gói phụ kiện cao cấp và hỗ trợ vay 85% giá trị xe.',
    highlightFeatures: [
      { icon: 'light', title: 'Đèn định vị ẩn', value: 'Parametric Jewel LED' },
      { icon: 'audio', title: 'Âm thanh', value: '8 loa Bose cao cấp' },
      { icon: 'brake', title: 'Phanh tay điện tử', value: 'Auto Hold thông minh' },
      { icon: 'safety', title: 'An toàn', value: 'Hyundai SmartSense' },
    ],
  },
  {
    id: '5a494ace-6e58-4f63-9c24-b32d31b125b4',
    cloudinaryId: 169,
    slug: 'tucson',
    name: 'Hyundai Tucson',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/tucson-icon.webp?_a=BAMAABkS0',
    filename: 'tucson-icon.webp',
    segment: 'suv',
    moTaChung: 'Đánh giá và giá lăn bánh xe Hyundai Tucson thế hệ mới tại Vinh. Thiết kế tương lai Sensuous Sportiness và gói an toàn SmartSense.',
    highlightFeatures: [
      { icon: 'design', title: 'Thiết kế', value: 'Parametric Dynamic' },
      { icon: 'drivetrain', title: 'Dẫn động', value: 'HTRAC 4 bánh toàn thời gian' },
      { icon: 'dimension', title: 'Chiều dài cơ sở', value: '2.755 mm lớn nhất phân khúc' },
      { icon: 'gear', title: 'Cần số điện tử', value: 'Shift-by-Wire nút bấm' },
    ],
  },
  {
    id: 'c22fbfa1-84e5-4d14-ae0a-09dbb1cd0cdd',
    cloudinaryId: 148,
    slug: 'santa-fe',
    name: 'Hyundai Santa Fe',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Santafe-icon.webp?_a=BAMAABkS0',
    filename: 'Santafe-icon.webp',
    segment: 'suv',
    moTaChung: 'Hyundai Santa Fe hoàn toàn mới tại Hyundai Vinh. SUV việt dã cao cấp bậc nhất với nội thất hiện đại và động cơ Smartstream uy lực.',
    highlightFeatures: [
      { icon: 'design', title: 'Thiết kế', value: 'Boxy SUV việt dã sang trọng' },
      { icon: 'screen', title: 'Màn hình cong', value: 'Panorama 12.3 inch kép' },
      { icon: 'engine', title: 'Động cơ Smartstream', value: '2.5L thế hệ mới' },
      { icon: 'seat', title: 'Hàng ghế VIP', value: 'Ghế thương gia chỉnh điện' },
    ],
  },
  {
    id: '6b53a8fc-b270-4f7e-9add-ab4419a2118d',
    cloudinaryId: 35,
    slug: 'custin',
    name: 'Hyundai Custin',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/custin-icon.webp?_a=BAMAABkS0',
    filename: 'custin-icon.webp',
    segment: 'mpv',
    moTaChung: 'Hyundai Custin MPV hạng sang cho gia đình và doanh nghiệp. Báo giá lăn bánh tốt nhất tại Nghệ An, giao xe nhanh đủ màu.',
    highlightFeatures: [
      { icon: 'seat', title: 'Hàng ghế thương gia', value: 'Captain Seat không trọng lực' },
      { icon: 'door', title: 'Cửa lùa điện', value: 'Thông minh 2 bên' },
      { icon: 'engine', title: 'Động cơ Turbo', value: 'Smartstream 2.0 T-GDi' },
    ],
  },
  {
    id: '57b68077-5ff4-4b57-8662-9ab0b90270e6',
    cloudinaryId: 149,
    slug: 'stargazer-x',
    name: 'Hyundai Stargazer X',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Stargazer%20-%20Stargazer%20X%20-%20icon.webp?_a=BAMAABkS0',
    filename: 'Stargazer - Stargazer X - icon.webp',
    segment: 'mpv',
    moTaChung: 'Hyundai Stargazer X đậm chất SUV, không gian rộng rãi 7 chỗ ngồi thực thụ. Hỗ trợ trả góp linh hoạt tại Đại lý Hyundai Vinh.',
    highlightFeatures: [
      { icon: 'clearance', title: 'Khoảng sáng gầm', value: '200 mm đậm chất SUV' },
      { icon: 'seat', title: 'Không gian', value: '7 chỗ ngồi đa dụng thực thụ' },
      { icon: 'brake', title: 'Phanh đĩa', value: '4 bánh kèm phanh tay điện tử' },
    ],
  },
  {
    id: '24187364-6afd-4ec4-a45a-365a23557dda',
    cloudinaryId: 140,
    slug: 'palisade',
    name: 'Hyundai Palisade',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Palisade-icon.webp?_a=BAMAABkS0',
    filename: 'Palisade-icon.webp',
    segment: 'suv',
    moTaChung: 'Flagship SUV cỡ lớn Hyundai Palisade sang trọng, đẳng cấp thượng lưu tại Nghệ An. Trải nghiệm dịch vụ VIP và ưu đãi đặc quyền.',
    highlightFeatures: [
      { icon: 'flagship', title: 'Đẳng cấp', value: 'Flagship SUV đầu bảng' },
      { icon: 'audio', title: 'Nội thất', value: 'Da Nappa cao cấp & 12 loa Krell' },
      { icon: 'engine', title: 'Động cơ Dầu', value: '2.2L CRDi 200 mã lực' },
    ],
  },
  {
    id: '61ca33c8-9b72-45fc-ae29-5a5ac6e9d178',
    cloudinaryId: 110,
    slug: 'ioniq-5',
    name: 'Hyundai Ioniq 5',
    url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/IONIQ5-icon.webp?_a=BAMAABkS0',
    filename: 'IONIQ5-icon.webp',
    segment: 'ev',
    moTaChung: 'Xe điện tương lai Hyundai Ioniq 5 với công nghệ sạc siêu nhanh 800V. Đại lý Hyundai Vinh cung cấp trạm sạc và bảo hành chính hãng.',
    highlightFeatures: [
      { icon: 'charge', title: 'Công nghệ sạc', value: '800V siêu nhanh 10-80% 18p' },
      { icon: 'battery', title: 'Tầm vận hành', value: 'Hơn 450 km / 1 lần sạc' },
      { icon: 'design', title: 'Thiết kế tương lai', value: 'Parametric Pixel độc quyền' },
    ],
  },
];

async function run() {
  console.log('🚀 Bắt đầu quá trình đồng bộ và cập nhật thông tin dòng xe (Ảnh đại diện + Tính năng nổi bật + Mô tả chuẩn)...');

  // 1. Lấy danh sách toàn bộ xe hiện có trong database
  const existingCars = await db.select().from(schema.cars);
  const existingMapById = new Map(existingCars.map((c) => [c.id, c]));
  const existingMapBySlug = new Map(existingCars.map((c) => [c.slug, c]));

  console.log(`📊 Đang có ${existingCars.length} dòng xe trong cơ sở dữ liệu.`);

  const updatedResults: Array<{
    stt: number;
    id: string;
    tenXe: string;
    slug: string;
    action: string;
    soTinhNang: number;
    tinhNangTieuBieu: string;
  }> = [];

  for (let i = 0; i < CAR_DATA_LIST.length; i++) {
    const item = CAR_DATA_LIST[i];
    const existing = existingMapById.get(item.id) || existingMapBySlug.get(item.slug);

    if (existing) {
      // Dòng xe đã tồn tại -> Cập nhật anhDaiDienUrl, highlightFeatures, moTaChung
      await db
        .update(schema.cars)
        .set({
          anhDaiDienUrl: item.url,
          highlightFeatures: item.highlightFeatures,
          moTaChung: item.moTaChung,
          updatedAt: new Date(),
        })
        .where(eq(schema.cars.id, existing.id));

      updatedResults.push({
        stt: i + 1,
        id: existing.id,
        tenXe: existing.tenXe,
        slug: existing.slug,
        action: 'UPDATE',
        soTinhNang: item.highlightFeatures.length,
        tinhNangTieuBieu: item.highlightFeatures.map((f) => `${f.title}: ${f.value}`).join(' | '),
      });
    } else {
      // Dòng xe chưa có -> Tạo mới dòng xe với đầy đủ thông số
      const [inserted] = await db
        .insert(schema.cars)
        .values({
          id: item.id,
          tenXe: item.name,
          slug: item.slug,
          anhDaiDienUrl: item.url,
          highlightFeatures: item.highlightFeatures,
          moTaChung: item.moTaChung,
          segment: item.segment,
          status: 'published',
          isFeatured: true,
          sortOrder: i,
        })
        .returning();

      updatedResults.push({
        stt: i + 1,
        id: inserted.id,
        tenXe: inserted.tenXe,
        slug: item.slug,
        action: 'INSERT (BỔ SUNG MỚI)',
        soTinhNang: item.highlightFeatures.length,
        tinhNangTieuBieu: item.highlightFeatures.map((f) => `${f.title}: ${f.value}`).join(' | '),
      });
    }
  }

  console.log('\n✅ KẾT QUẢ ĐỒNG BỘ ẢNH ĐẠI DIỆN & TÍNH NĂNG NỔI BẬT:');
  console.table(
    updatedResults.map((r) => ({
      STT: r.stt,
      'Tên Xe': r.tenXe,
      Slug: r.slug,
      'Số tính năng': r.soTinhNang,
      'Hành động': r.action,
      'Tính năng tiêu biểu': r.tinhNangTieuBieu.slice(0, 65) + '...',
    }))
  );

  await queryClient.end();
  console.log('🏁 Kết thúc kết nối Database thành công.');
}

run().catch(async (err) => {
  console.error('❌ Lỗi khi cập nhật dữ liệu xe:', err);
  await queryClient.end();
  process.exit(1);
});
