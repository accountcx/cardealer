import type { FullArticleBlock, AiCarSummary } from '@cardealer/types';

// WHY: Chuẩn hóa từng block bài viết trả về từ AI, chống runtime TypeError (undefined values) và bổ sung dữ liệu thực tế từ Showroom.
export function normalizeArticleBlock(
  blk: FullArticleBlock,
  availableCars?: AiCarSummary[],
  targetCar = ''
): FullArticleBlock {
  if (!blk || typeof blk !== 'object') {
    return { type: 'paragraph', content: '' };
  }

  // 1. Chuẩn hóa khối specTable (Bảng so sánh thông số kỹ thuật)
  if (blk.type === 'specTable') {
    const rawVersions = Array.isArray(blk.specVersions) ? blk.specVersions : [];
    const specVersions =
      rawVersions.length > 0
        ? rawVersions.map((v) => String(v || '').trim()).filter(Boolean)
        : ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt'];

    const effectiveVersions = specVersions.length > 0 ? specVersions : ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt'];
    const rawRows = Array.isArray(blk.specRows) ? blk.specRows : [];

    const specRows = rawRows.map((r) => {
      const rowObj = (r && typeof r === 'object' ? r : {}) as Record<string, unknown>;
      const specName = String(rowObj.specName || rowObj.name || '').trim();
      let values: string[] = [];

      if (Array.isArray(rowObj.values)) {
        values = rowObj.values.map((v) => (v !== null && v !== undefined ? String(v) : ''));
      } else if (typeof rowObj.value === 'string') {
        values = [rowObj.value];
      }

      // Đảm bảo số lượng cột values luôn khớp với số cột phiên bản
      while (values.length < effectiveVersions.length) {
        values.push('');
      }

      return { specName, values };
    });

    return {
      ...blk,
      title: typeof blk.title === 'string' ? blk.title : 'Bảng Thông Số Kỹ Thuật',
      specVersions: effectiveVersions,
      specRows,
    };
  }

  // 2. Tự động làm giàu khối xe liên quan (relatedCar) từ kho xe Showroom
  if (blk.type === 'relatedCar' && availableCars && availableCars.length > 0) {
    const matched =
      availableCars.find(
        (c) =>
          (blk.carSlug && c.slug === blk.carSlug) ||
          (blk.carName && c.tenXe.toLowerCase().includes(blk.carName.toLowerCase()))
      ) || availableCars[0];

    return {
      ...blk,
      carName: matched?.tenXe || blk.carName || 'Hyundai Accent',
      carSlug: matched?.slug || blk.carSlug || 'hyundai-accent',
      carPrice: matched?.minPrice || matched?.giaNiemYetTu || blk.carPrice || 439000000,
      carImage: matched?.anhDaiDienUrl || blk.carImage || '',
      seatCount: blk.seatCount || (matched?.seatRange ? parseInt(matched.seatRange, 10) : 5) || 5,
      fuelType: matched?.fuelType || blk.fuelType || 'Xăng',
    };
  }

  // 3. Tự động gán ảnh đại diện xe từ kho vào singleImage nếu AI để trống
  if (blk.type === 'singleImage' && !blk.imageUrl && availableCars && availableCars.length > 0) {
    const matchedCar = availableCars.find(
      (c) =>
        targetCar.toLowerCase().includes(c.tenXe.toLowerCase()) ||
        c.tenXe.toLowerCase().includes(targetCar.toLowerCase())
    );
    if (matchedCar?.anhDaiDienUrl) {
      return { ...blk, imageUrl: matchedCar.anhDaiDienUrl };
    }
  }

  return blk;
}

// WHY: Chuẩn hóa danh sách các khối bài viết
export function normalizeAndEnrichBlocks(
  blocks: FullArticleBlock[],
  availableCars?: AiCarSummary[],
  targetCar = ''
): FullArticleBlock[] {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];
  return blocks.map((blk) => normalizeArticleBlock(blk, availableCars, targetCar));
}

// WHY: Tạo khối FAQ chuẩn chỉnh khi AI không sinh hoặc sinh thiếu câu hỏi
export function createFallbackFaqBlock(targetCar: string, locationName: string): FullArticleBlock {
  return {
    type: 'faq',
    title: `Câu Hỏi Thường Gặp Về ${targetCar}`,
    faqs: [
      {
        question: `Chính sách bảo hành xe ${targetCar} chính hãng là bao lâu?`,
        answer: `Xe ${targetCar} được áp dụng bảo hành chính hãng 5 năm hoặc 100.000 km (tùy điều kiện nào đến trước) trên toàn hệ thống đại lý ủy quyền 3S toàn quốc.`,
      },
      {
        question: `Đại lý có hỗ trợ lái thử ${targetCar} tận nhà tại ${locationName} không?`,
        answer: `Có. Quý khách hàng tại ${locationName} có thể liên hệ đăng ký lái thử tận nhà miễn phí để trải nghiệm thực tế khả năng vận hành và tiện nghi.`,
      },
      {
        question: `Chi phí lăn bánh ${targetCar} tại ${locationName} tạm tính gồm những gì?`,
        answer: `Chi phí lăn bánh gồm giá xe sau ưu đãi, lệ phí trước bạ 10% tại ${locationName}, lệ phí cấp biển số và các khoản phí đăng ký lưu hành. Liên hệ showroom để nhận bảng tính chi tiết.`,
      },
    ],
  };
}
