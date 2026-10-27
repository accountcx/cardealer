import { describe, it, expect } from 'vitest';
import { generateCatalogJsonLd, sanitizePromotionSummary } from '../seo/json-ld';
import type { CarCatalogItem } from '@cardealer/types';

describe('generateCatalogJsonLd', () => {
  it('sinh JSON-LD Schema ItemList hợp lệ với @id, url cấp cao nhất và các AggregateOffer', () => {
    const mockCars: CarCatalogItem[] = [
      {
        id: 'car-1',
        tenXe: 'Hyundai Tucson',
        slug: 'tucson',
        anhDaiDienUrl: '/images/cars/tucson.webp',
        segment: 'suv',
        traTruocTu: 150000000,
        promotionSummary: 'Hỗ trợ lệ phí trước bạ (Tạo nội dung tiếp thị cho dòng xe Hyundai Tucson)',
        fuelType: 'Xăng / Dầu',
        seatRange: '5 chỗ',
        minPrice: 769000000,
        maxPrice: 919000000,
        versionCount: 4,
        isFeatured: true,
        status: 'published',
      },
    ];

    const schema = generateCatalogJsonLd(mockCars, 'https://xehyundaivinh.com') as any;

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('ItemList');
    expect(schema.numberOfItems).toBe(1);
    expect(schema.itemListElement).toHaveLength(1);

    const firstItem = schema.itemListElement[0];
    expect(firstItem['@type']).toBe('ListItem');
    expect(firstItem.position).toBe(1);
    // Entity ID & URL cấp cao nhất chuẩn Google Search Carousel
    expect(firstItem.item['@id']).toBe('https://xehyundaivinh.com/xe/tucson');
    expect(firstItem.item.url).toBe('https://xehyundaivinh.com/xe/tucson');
    expect(firstItem.item['@type']).toEqual(['Product', 'Car']);
    expect(firstItem.item.name).toBe('Hyundai Tucson');
    // Kiểm tra tự động lọc sạch prompt note rò rỉ trong ngoặc đơn
    expect(firstItem.item.description).toBe('Hỗ trợ lệ phí trước bạ');
    expect(firstItem.item.description).not.toContain('Tạo nội dung tiếp thị');
    expect(firstItem.item.offers.lowPrice).toBe(769000000);
    expect(firstItem.item.offers.highPrice).toBe(919000000);
    expect(firstItem.item.offers.url).toBe('https://xehyundaivinh.com/xe/tucson');
  });
});

describe('sanitizePromotionSummary', () => {
  it('loại bỏ triệt để các ghi chú/prompt nội bộ rò rỉ trong ngoặc đơn', () => {
    const cases = [
      {
        raw: 'Showroom sẵn xe giao ngay đủ màu, hỗ trợ lái thử tận nhà. (Tạo nội dung tiếp thị cho dòng xe Hyundai Tucson)',
        expected: 'Showroom sẵn xe giao ngay đủ màu, hỗ trợ lái thử tận nhà.',
      },
      {
        raw: 'Tặng gói bảo dưỡng miễn phí 2 năm. (Đánh giá về dòng xe Custin)',
        expected: 'Tặng gói bảo dưỡng miễn phí 2 năm.',
      },
      {
        raw: 'Lãi suất vay trả góp cố định ưu đãi. (Tự quyết định bài viết cho hợp lý thay vì chỉ thông số và giá)',
        expected: 'Lãi suất vay trả góp cố định ưu đãi.',
      },
      {
        raw: 'Nhận xe chỉ với từ 95 triệu trả trước. (Đánh giá về dòng xe Hyundai Stargazer X không cần bảng giá cũng như các khối kêu gọi)',
        expected: 'Nhận xe chỉ với từ 95 triệu trả trước.',
      },
      {
        raw: 'Hỗ trợ giao xe tận nhà. (Hỗ trợ 50% lệ phí trước bạ, tặng gói phụ kiện cao cấp và bảo hành 5 năm hoặc 100.000 km)',
        expected: 'Hỗ trợ giao xe tận nhà.',
      },
    ];

    for (const { raw, expected } of cases) {
      expect(sanitizePromotionSummary(raw)).toBe(expected);
    }
  });

  it('bảo toàn nội dung hợp lệ không chứa prompt', () => {
    const valid = 'Chương trình tại đại lý có thể gồm hỗ trợ lệ phí trước bạ.';
    expect(sanitizePromotionSummary(valid)).toBe(valid);
  });

  it('xử lý an toàn các giá trị null / undefined / chuỗi rỗng', () => {
    expect(sanitizePromotionSummary(null)).toBe('');
    expect(sanitizePromotionSummary(undefined)).toBe('');
    expect(sanitizePromotionSummary('')).toBe('');
  });
});
