import { describe, it, expect } from 'vitest';
import { generateCatalogJsonLd } from '../seo/json-ld';
import type { CarCatalogItem } from '@cardealer/types';

describe('generateCatalogJsonLd', () => {
  it('sinh JSON-LD Schema ItemList hợp lệ với các AggregateOffer', () => {
    const mockCars: CarCatalogItem[] = [
      {
        id: 'car-1',
        tenXe: 'Hyundai Tucson',
        slug: 'tucson',
        anhDaiDienUrl: '/images/cars/tucson.webp',
        segment: 'suv',
        traTruocTu: 150000000,
        promotionSummary: 'Giảm 50% trước bạ',
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
    expect(firstItem.item.name).toBe('Hyundai Tucson');
    expect(firstItem.item.offers.lowPrice).toBe(769000000);
    expect(firstItem.item.offers.highPrice).toBe(919000000);
    expect(firstItem.item.offers.url).toBe('https://xehyundaivinh.com/xe/tucson');
  });
});
