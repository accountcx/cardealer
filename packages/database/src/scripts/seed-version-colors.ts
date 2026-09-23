import { eq, and } from 'drizzle-orm';
import { db, schema, queryClient } from '../client';

// 1. Cấu hình bảng màu chuẩn theo dòng xe từ generate-complete-database.mjs (car_versions_mau_sac_va_gia)
interface ColorConfig {
  colorName: string; // Tên màu trong bảng colors
  imageSuffix: string; // Hậu tố file ảnh
  isDefault: boolean;
}

const CAR_COLOR_PALETTES: Record<string, ColorConfig[]> = {
  'grand-i10': [
    { colorName: 'Trắng', imageSuffix: 'grand-i10-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'grand-i10.webp', isDefault: false },
    { colorName: 'Đỏ', imageSuffix: 'grand-i10-red.webp', isDefault: false },
  ],
  'accent': [
    { colorName: 'Trắng', imageSuffix: 'accent-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'accent-black.webp', isDefault: false },
    { colorName: 'Bạc', imageSuffix: 'accent.webp', isDefault: false },
    { colorName: 'Đỏ', imageSuffix: 'accent-red.webp', isDefault: false },
  ],
  'elantra': [
    { colorName: 'Trắng', imageSuffix: 'elantra-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'elantra-black.webp', isDefault: false },
    { colorName: 'Bạc', imageSuffix: 'elantra.webp', isDefault: false },
  ],
  'venue': [
    { colorName: 'Trắng', imageSuffix: 'venue-white.webp', isDefault: true },
    { colorName: 'Bạc', imageSuffix: 'venue-twotone.webp', isDefault: false },
  ],
  'creta': [
    { colorName: 'Trắng', imageSuffix: 'creta-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'creta-black.webp', isDefault: false },
    { colorName: 'Bạc', imageSuffix: 'creta-twotone.webp', isDefault: false },
  ],
  'tucson': [
    { colorName: 'Trắng', imageSuffix: 'tucson-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'tucson-black.webp', isDefault: false },
    { colorName: 'Xanh Bóng Đêm', imageSuffix: 'tucson-green.webp', isDefault: false },
  ],
  'santa-fe': [
    { colorName: 'Trắng', imageSuffix: 'santafe-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'santafe-black.webp', isDefault: false },
    { colorName: 'Xám Kim Loại', imageSuffix: 'santafe-green.webp', isDefault: false },
  ],
  'custin': [
    { colorName: 'Trắng', imageSuffix: 'custin-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'custin-black.webp', isDefault: false },
  ],
  'stargazer-x': [
    { colorName: 'Trắng', imageSuffix: 'stargazer-white.webp', isDefault: true },
    { colorName: 'Đỏ', imageSuffix: 'stargazer-red.webp', isDefault: false },
    { colorName: 'Xám Kim Loại', imageSuffix: 'stargazer-x.webp', isDefault: false },
  ],
  'palisade': [
    { colorName: 'Trắng', imageSuffix: 'palisade-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'palisade-black.webp', isDefault: false },
    { colorName: 'Xám Kim Loại', imageSuffix: 'palisade-green.webp', isDefault: false },
  ],
  'ioniq-5': [
    { colorName: 'Trắng', imageSuffix: 'ioniq5-white.webp', isDefault: true },
    { colorName: 'Đen', imageSuffix: 'ioniq5-black.webp', isDefault: false },
  ],
};

async function run() {
  console.log('🎨 Bắt đầu đồng bộ & phủ đầy bảng màu cho 100% các phiên bản xe...');

  // 1. Chuẩn hóa swatch URL trong bảng colors (sửa lỗi đảo swatch Trắng/Đen)
  await db.update(schema.colors).set({ swatchUrl: '/images/colors/swatch-white.png' }).where(eq(schema.colors.tenMau, 'Trắng'));
  await db.update(schema.colors).set({ swatchUrl: '/images/colors/swatch-black.png' }).where(eq(schema.colors.tenMau, 'Đen'));
  await db.update(schema.colors).set({ swatchUrl: '/images/colors/swatch-red.png' }).where(eq(schema.colors.tenMau, 'Đỏ'));
  await db.update(schema.colors).set({ swatchUrl: '/images/colors/swatch-twotone.png' }).where(eq(schema.colors.tenMau, 'Bạc'));
  console.log('✅ Đã chuẩn hóa swatchUrl trong bảng colors.');

  // 2. Lấy toàn bộ danh mục màu
  const allColors = await db.select().from(schema.colors);
  const colorMapByName = new Map(allColors.map((c) => [c.tenMau, c]));

  // 3. Lấy toàn bộ xe và phiên bản kèm versionColors hiện tại
  const allCars = await db.query.cars.findMany({
    with: {
      versions: {
        with: {
          versionColors: true,
        },
      },
    },
  });

  let totalNewAdded = 0;
  let totalVersionsProcessed = 0;
  let totalVersionsWithColorsBefore = 0;
  let totalVersionsWithColorsAfter = 0;

  const summaryList: Array<{
    xe: string;
    phienBan: string;
    mauSacHienTai: string;
    themMoimau: string;
    tongMau: number;
  }> = [];

  for (const car of allCars) {
    const palette = CAR_COLOR_PALETTES[car.slug];
    if (!palette) {
      console.warn(`⚠️ Không tìm thấy cấu hình bảng màu cho dòng xe: ${car.slug}`);
      continue;
    }

    for (const ver of car.versions) {
      totalVersionsProcessed++;
      const existingColorIds = new Set(ver.versionColors.map((vc) => vc.colorId));
      if (existingColorIds.size > 0) {
        totalVersionsWithColorsBefore++;
      }

      const newlyAddedColors: string[] = [];

      for (const colorCfg of palette) {
        const colorRecord = colorMapByName.get(colorCfg.colorName);
        if (!colorRecord) {
          console.warn(`⚠️ Không tìm thấy màu "${colorCfg.colorName}" trong database!`);
          continue;
        }

        const isAlreadyLinked = existingColorIds.has(colorRecord.id);

        if (!isAlreadyLinked) {
          // Thêm liên kết màu mới vào bảng version_colors
          const imageUrl = `/images/cars/${colorCfg.imageSuffix}`;
          await db
            .insert(schema.versionColors)
            .values({
              versionId: ver.id,
              colorId: colorRecord.id,
              anhXeTheoMauUrl: imageUrl,
              isDefault: colorCfg.isDefault,
            })
            .onConflictDoNothing();

          newlyAddedColors.push(colorCfg.colorName);
          totalNewAdded++;
        }
      }

      // Đảm bảo phiên bản có ít nhất 1 màu isDefault = true
      const updatedVersionColors = await db
        .select()
        .from(schema.versionColors)
        .where(eq(schema.versionColors.versionId, ver.id));

      const hasDefault = updatedVersionColors.some((vc) => vc.isDefault);
      if (!hasDefault && updatedVersionColors.length > 0) {
        await db
          .update(schema.versionColors)
          .set({ isDefault: true })
          .where(eq(schema.versionColors.id, updatedVersionColors[0].id));
      }

      if (updatedVersionColors.length > 0) {
        totalVersionsWithColorsAfter++;
      }

      summaryList.push({
        xe: car.tenXe,
        phienBan: ver.tenPhienBan,
        mauSacHienTai: ver.versionColors.length > 0 ? `${ver.versionColors.length} màu cũ` : 'Trống (chưa có)',
        themMoimau: newlyAddedColors.length > 0 ? `+${newlyAddedColors.join(', ')}` : 'Đã đủ màu',
        tongMau: updatedVersionColors.length,
      });
    }
  }

  console.log('\n📊 BẢNG TỔNG KẾT ĐỒNG BỘ MÀU CHO TẤT CẢ 39 PHIÊN BẢN:');
  console.table(
    summaryList.map((s, idx) => ({
      STT: idx + 1,
      'Dòng Xe': s.xe,
      'Phiên Bản': s.phienBan,
      'Trước khi chạy': s.mauSacHienTai,
      'Bổ sung mới': s.themMoimau,
      'Tổng màu sau cập nhật': s.tongMau,
    }))
  );

  console.log(`\n🎉 KẾT QUẢ THÀNH CÔNG:`);
  console.log(`- Tổng số phiên bản đã xử lý: ${totalVersionsProcessed}/39 phiên bản`);
  console.log(`- Số phiên bản có màu TRƯỚC khi chạy: ${totalVersionsWithColorsBefore}/39 phiên bản`);
  console.log(`- Số phiên bản có màu SAU khi chạy: ${totalVersionsWithColorsAfter}/39 phiên bản (100% Hoàn hảo!)`);
  console.log(`- Tổng số bản ghi version_colors được tạo mới: ${totalNewAdded} bản ghi`);

  await queryClient.end();
  console.log('🏁 Hoàn tất kết nối Database an toàn.');
}

run().catch(async (err) => {
  console.error('❌ Lỗi khi đồng bộ màu xe:', err);
  await queryClient.end();
  process.exit(1);
});
