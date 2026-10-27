import { db } from '../client';
import { cars } from '../schema/cars';
import { eq, isNotNull } from 'drizzle-orm';
import { sanitizePromotionSummary } from '@cardealer/core';

async function main() {
  console.log('🧹 [Data Hygiene] Bắt đầu quét và làm sạch trường promotionSummary trong bảng cars...');

  const allCars = await db
    .select({
      id: cars.id,
      tenXe: cars.tenXe,
      slug: cars.slug,
      promotionSummary: cars.promotionSummary,
    })
    .from(cars)
    .where(isNotNull(cars.promotionSummary));

  let updatedCount = 0;

  for (const car of allCars) {
    if (!car.promotionSummary) continue;

    const cleaned = sanitizePromotionSummary(car.promotionSummary);
    if (cleaned !== car.promotionSummary) {
      console.log(`\n🚗 Đang cập nhật xe: ${car.tenXe} (${car.slug})`);
      console.log(`   - Gốc : "${car.promotionSummary}"`);
      console.log(`   - Sạch: "${cleaned}"`);

      await db
        .update(cars)
        .set({ promotionSummary: cleaned })
        .where(eq(cars.id, car.id));

      updatedCount++;
    }
  }

  console.log(`\n✅ [Data Hygiene Hoàn Tất] Đã chuẩn hóa thành công ${updatedCount}/${allCars.length} dòng xe.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Lỗi khi thực hiện dọn dẹp promotionSummary:', err);
  process.exit(1);
});
