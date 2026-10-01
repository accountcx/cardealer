import type { CarCatalogItem } from '@cardealer/types';
import { getSegmentConfig, type SegmentSlug } from '../config/segments';

// 🧠 Mental Model: Pure Function lọc danh sách xe theo phân khúc URL slug (/dong-xe/[slug]).
// 1. Immutability: Không làm biến đổi (mutate) mảng xe gốc, bảo vệ an toàn cho In-Memory Cache (ISR).
// 2. Dual Property Matching: So khớp linh hoạt cả car.segment (schema typed) lẫn car.kieuDang (DB raw payload).
// 3. Normalize & Trim: Chuẩn hóa toàn bộ chuỗi về chữ thường (toLowerCase) và loại bỏ khoảng trắng dư thừa (trim).
// 4. Time Complexity O(N): Duyệt đơn tuyến với Set lookup O(1), đáp ứng chỉ số hiệu năng TS-13 (< 5ms cho 200 xe).

export function filterCarsBySegment(
  cars: readonly CarCatalogItem[] | CarCatalogItem[],
  segmentSlug: string
): CarCatalogItem[] {
  const config = getSegmentConfig(segmentSlug);
  if (!config || !Array.isArray(cars) || cars.length === 0) {
    return [];
  }

  const validTargets = new Set<string>(
    config.kieuDangMapping.map((target) => target.trim().toLowerCase())
  );
  validTargets.add(config.slug.toLowerCase());

  return cars.filter((car): car is CarCatalogItem => {
    if (!car) return false;

    // 1. Kiểm tra qua trường car.segment
    if (car.segment && validTargets.has(String(car.segment).trim().toLowerCase())) {
      return true;
    }

    // 2. Kiểm tra qua trường car.kieuDang (nếu payload API trả về kieuDang gốc từ bảng cars)
    if ('kieuDang' in car && typeof (car as { kieuDang?: unknown }).kieuDang === 'string') {
      const rawKieuDang = (car as { kieuDang: string }).kieuDang;
      if (validTargets.has(rawKieuDang.trim().toLowerCase())) {
        return true;
      }
    }

    return false;
  });
}
