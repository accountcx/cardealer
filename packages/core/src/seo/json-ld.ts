import type { Car, CarCatalogItem } from '@cardealer/types';

/**
 * Trình sinh dữ liệu có cấu trúc Google Schema (Product & Car) tự động
 */
export function generateCarJsonLd(car: Car, siteUrl: string) {
  const lowestPrice =
    car.versions.length > 0
      ? Math.min(...car.versions.map((v) => v.giaKhuyenMai || v.giaNiemYet))
      : 0;

  const highestPrice =
    car.versions.length > 0
      ? Math.max(...car.versions.map((v) => v.giaNiemYet))
      : 0;

  return {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Car'],
    name: car.tenXe,
    image: car.anhDaiDienUrl,
    description: car.promotionSummary || car.moTaChung || `Bảng giá xe ${car.tenXe} lăn bánh mới nhất`,
    brand: {
      '@type': 'Brand',
      name: 'Hyundai',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      lowPrice: lowestPrice,
      highPrice: highestPrice,
      offerCount: car.versions.length,
      url: `${siteUrl}/xe/${car.slug}`,
      availability: 'https://schema.org/InStock',
    },
  };
}

/**
 * 🧠 Mental Model: Trình sinh dữ liệu có cấu trúc Google Schema (ItemList & AggregateOffer)
 * cho toàn bộ danh mục sản phẩm /xe.
 * Giúp Google Search nhận diện danh sách sản phẩm và hiển thị Rich Snippets (khoảng giá, tình trạng còn hàng).
 */
export function generateCatalogJsonLd(cars: (CarCatalogItem | Car)[], siteUrl: string) {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bảng Giá Các Dòng Xe Hyundai Chính Hãng 2026',
    description:
      'Danh mục các dòng xe Hyundai Sedan, SUV, MPV, Hatchback và Xe điện kèm giá niêm yết và dự toán lăn bánh mới nhất.',
    numberOfItems: cars.length,
    itemListElement: cars.map((car, index) => {
      const versions = 'versions' in car && Array.isArray(car.versions) ? car.versions : [];
      const minPrice =
        'minPrice' in car && typeof car.minPrice === 'number' && car.minPrice > 0
          ? car.minPrice
          : versions.length > 0
            ? Math.min(...versions.map((v) => Number((v as any).giaKhuyenMai || v.giaNiemYet)))
            : 0;

      const maxPrice =
        'maxPrice' in car && typeof car.maxPrice === 'number' && car.maxPrice > 0
          ? car.maxPrice
          : versions.length > 0
            ? Math.max(...versions.map((v) => Number(v.giaNiemYet)))
            : minPrice;

      const versionCount =
        'versionCount' in car && typeof car.versionCount === 'number'
          ? car.versionCount
          : versions.length;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': ['Product', 'Car'],
          name: car.tenXe,
          image: car.anhDaiDienUrl,
          description:
            car.promotionSummary ||
            ('moTaChung' in car ? (car as any).moTaChung : null) ||
            `Bảng giá xe Hyundai ${car.tenXe} mới nhất`,
          brand: {
            '@type': 'Brand',
            name: 'Hyundai',
          },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'VND',
            lowPrice: minPrice,
            highPrice: maxPrice,
            offerCount: versionCount,
            url: `${cleanSiteUrl}/xe/${car.slug}`,
            availability: 'https://schema.org/InStock',
          },
        },
      };
    }),
  };
}
