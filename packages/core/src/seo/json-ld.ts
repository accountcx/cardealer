import type { Car } from '@cardealer/types';

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
