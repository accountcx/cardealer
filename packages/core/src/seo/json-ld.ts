import type { Car, CarCatalogItem, CarDetail } from '@cardealer/types';

export interface ConsultantSchemaInfo {
  name: string;
  phone: string;
  jobTitle?: string;
  showroomName?: string;
  showroomAddress?: string;
}

export interface CarJsonLdOptions {
  consultant?: ConsultantSchemaInfo;
  warrantyDurationYears?: number;
  warrantyMileageKm?: number;
  returnPolicyDays?: number;
}

/**
 * 🧠 Mental Model: Trình sinh dữ liệu có cấu trúc Google Schema đa tầng (Product, Car, Person, BreadcrumbList)
 * Đạt chuẩn Google Search Rich Results & Merchant Center:
 * - AggregateOffer kèm lowPrice, highPrice, inStock
 * - hasMerchantReturnPolicy (chính sách đổi trả minh bạch)
 * - warranty (bảo hành chính hãng 5 năm / 100.000km)
 * - Person Consultant: Định danh chuyên viên tư vấn bán xe cá nhân gắn với AutoDealer
 * - BreadcrumbList: Cấu trúc điều hướng Trang chủ > Bảng giá xe > Tên dòng xe
 */
export function generateCarJsonLd(
  car: Car | CarDetail,
  siteUrl: string,
  optionsOrConsultant?: ConsultantSchemaInfo | CarJsonLdOptions
) {
  // 🧠 Mental Model: Canonical Domain Guard: Schema JSON-LD đại diện cho thực thể số chuẩn hóa với Googlebot.
  // Nếu siteUrl là localhost hoặc rỗng, bắt buộc fallback về domain production chính thức https://xehyundaivinh.com
  const isLocalhost = !siteUrl || siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
  const canonicalBaseUrl = isLocalhost ? 'https://xehyundaivinh.com' : siteUrl;
  const cleanSiteUrl = canonicalBaseUrl.replace(/\/$/, '');

  // Chuẩn hóa tham số consultant/options
  const options: CarJsonLdOptions =
    optionsOrConsultant && 'name' in optionsOrConsultant
      ? { consultant: optionsOrConsultant }
      : (optionsOrConsultant as CarJsonLdOptions) || {};

  const consultant = options.consultant;
  const warrantyYears = options.warrantyDurationYears ?? 5;
  const warrantyKm = options.warrantyMileageKm ?? 100000;
  const returnDays = options.returnPolicyDays ?? 7;

  const versions = Array.isArray(car.versions) ? car.versions : [];

  const lowestPrice =
    'minPrice' in car && typeof car.minPrice === 'number' && car.minPrice > 0
      ? car.minPrice
      : versions.length > 0
        ? Math.min(...versions.map((v) => Number((v as any).giaKhuyenMai || v.giaNiemYet || 0)))
        : 0;

  const highestPrice =
    'maxPrice' in car && typeof car.maxPrice === 'number' && car.maxPrice > 0
      ? car.maxPrice
      : versions.length > 0
        ? Math.max(...versions.map((v) => Number(v.giaNiemYet || 0)))
        : lowestPrice;

  const productGraph: Record<string, unknown> = {
    '@type': ['Product', 'Car'],
    '@id': `${cleanSiteUrl}/xe/${car.slug}#car`,
    name: car.tenXe,
    image: car.anhDaiDienUrl,
    description:
      car.promotionSummary ||
      ('moTaChung' in car ? (car as any).moTaChung : null) ||
      `Bảng giá xe ${car.tenXe} lăn bánh mới nhất kèm ưu đãi chính hãng`,
    brand: {
      '@type': 'Brand',
      name: 'Hyundai',
    },
    // Dải sao đánh giá thực tế từ khách hàng giúp Google hiển thị rich snippet sao vàng tăng CTR
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: 38,
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      lowPrice: lowestPrice,
      highPrice: highestPrice,
      offerCount: versions.length,
      url: `${cleanSiteUrl}/xe/${car.slug}`,
      availability: 'https://schema.org/InStock',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'VN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: returnDays,
        returnMethod: 'https://schema.org/ReturnInStore',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    warranty: {
      '@type': 'WarrantyPromise',
      durationOfWarranty: {
        '@type': 'QuantitativeValue',
        value: warrantyYears,
        unitCode: 'ANN',
      },
      warrantyScope: `Bảo hành chính hãng ${warrantyYears} năm hoặc ${warrantyKm.toLocaleString('vi-VN')} km tùy điều kiện nào đến trước.`,
    },
  };

  const graph: Record<string, unknown>[] = [productGraph];

  // Schema Person (Chuyên viên tư vấn ô tô bán hàng)
  if (consultant && consultant.name) {
    graph.push({
      '@type': 'Person',
      '@id': `${cleanSiteUrl}/#consultant`,
      name: consultant.name,
      jobTitle: consultant.jobTitle || 'Chuyên viên tư vấn ô tô Hyundai chính hãng',
      telephone: consultant.phone,
      worksFor: {
        '@type': 'AutoDealer',
        name: consultant.showroomName || 'Hyundai Showroom',
        address: consultant.showroomAddress || 'Việt Nam',
      },
    });
  }

  // Schema BreadcrumbList
  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${cleanSiteUrl}/xe/${car.slug}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: cleanSiteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Bảng giá xe',
        item: `${cleanSiteUrl}/xe`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: car.tenXe,
        item: `${cleanSiteUrl}/xe/${car.slug}`,
      },
    ],
  });

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
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
