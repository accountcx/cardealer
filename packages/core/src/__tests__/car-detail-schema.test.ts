import { describe, it, expect } from 'vitest';
import { CarDetailSchema, type CarDetail } from '@cardealer/types';
import { generateCarJsonLd } from '../seo/json-ld';

describe('Phase 4.4: Car Detail Schema & Multi-Tier JSON-LD', () => {
  const mockCarDetail: CarDetail = {
    id: 'car-tucson-uuid',
    tenXe: 'Hyundai Tucson 2026',
    slug: 'tucson-2026',
    anhDaiDienUrl: '/images/cars/tucson.webp',
    catalogFileUrl: '/catalogs/tucson.pdf',
    segment: 'suv',
    taxRate: 0.1,
    traTruocTu: 150000000,
    promotionSummary: 'Tặng 50% trước bạ + Gói phụ kiện chính hãng 25 triệu',
    fuelType: 'Xăng / Turbo / Dầu',
    highlightFeatures: [
      { icon: 'Shield', title: 'SmartSense', value: 'An toàn chủ động' },
      { icon: 'Zap', title: 'HTRAC', value: 'Dẫn động 4 bánh' },
    ],
    moTaChung: 'Dòng xe C-SUV cao cấp thế hệ mới của Hyundai.',
    isFeatured: true,
    status: 'published',
    sortOrder: 1,
    versionCount: 1,
    minPrice: 769000000,
    maxPrice: 919000000,
    versions: [
      {
        id: 'ver-standard',
        carId: 'car-tucson-uuid',
        tenPhienBan: '2.0 Tiêu Chuẩn',
        slug: '2-0-tieu-chuan',
        giaNiemYet: 769000000,
        giaKhuyenMai: 759000000,
        seatCount: 5,
        dongCo: 'SmartStream G2.0',
        hopSo: '6 AT',
        danDong: 'FWD',
        anhDaiDienUrl: '/images/cars/tucson-standard.webp',
        boSuuTapAnh: ['/images/gallery/1.webp', '/images/gallery/2.webp'],
        specGroups: [
          {
            groupName: 'Động cơ & Khung gầm',
            specs: [{ label: 'Dung tích', value: '1,999 cc' }],
          },
        ],
        sortOrder: 1,
        colors: [
          {
            colorId: 'color-white',
            tenMau: 'Trắng Ngọc Trai',
            slug: 'trang-ngoc-trai',
            hexCode: '#F8FAFC',
            isTwoTone: false,
            secondaryHexCode: null,
            anhXeTheoMauUrl: '/images/cars/tucson-white.webp',
            isDefault: true,
          },
          {
            colorId: 'color-red',
            tenMau: 'Đỏ Mận',
            slug: 'do-man',
            hexCode: '#991B1B',
            isTwoTone: false,
            secondaryHexCode: null,
            anhXeTheoMauUrl: '/images/cars/tucson-red.webp',
            isDefault: false,
          },
        ],
      },
    ],
  };

  it('TS-01: CarDetailSchema xác thực thành công mock data chuẩn', () => {
    const parseResult = CarDetailSchema.safeParse(mockCarDetail);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.slug).toBe('tucson-2026');
      expect(parseResult.data.versions[0].colors).toHaveLength(2);
      expect(parseResult.data.versions[0].colors[0].slug).toBe('trang-ngoc-trai');
    }
  });

  it('TS-02: generateCarJsonLd tạo schema đa tầng Product, Person, Breadcrumbs, Warranty, ReturnPolicy', () => {
    const siteUrl = 'https://salerhyundai.vn';
    const consultant = {
      name: 'Nguyễn Văn Saler',
      phone: '0988123456',
      showroomName: 'Hyundai Phạm Văn Đồng',
      showroomAddress: '138 Phạm Văn Đồng, Hà Nội',
    };

    const jsonLd = generateCarJsonLd(mockCarDetail, siteUrl, {
      consultant,
      aggregateRating: {
        ratingValue: '4.9',
        reviewCount: 38,
      },
    }) as any;

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(Array.isArray(jsonLd['@graph'])).toBe(true);

    const graph = jsonLd['@graph'];

    // 1. Kiểm tra Product & Car
    const product = graph.find((item: any) =>
      Array.isArray(item['@type']) && item['@type'].includes('Product') && item['@type'].includes('Car')
    );
    expect(product).toBeDefined();
    expect(product.name).toBe('Hyundai Tucson 2026');
    expect(product.offers['@type']).toBe('AggregateOffer');
    expect(product.offers.lowPrice).toBe(769000000);
    expect(product.offers.highPrice).toBe(919000000);
    expect(product.offers.availability).toBe('https://schema.org/InStock');
    expect(product.offers.hasMerchantReturnPolicy['@type']).toBe('MerchantReturnPolicy');
    expect(product.warranty['@type']).toBe('WarrantyPromise');
    expect(product.aggregateRating['@type']).toBe('AggregateRating');
    expect(product.aggregateRating.ratingValue).toBe('4.9');

    // Kiểm tra cơ chế chống phạt Google Manual Action: Không truyền review thực tế -> Không sinh aggregateRating ảo
    const cleanJsonLd = generateCarJsonLd(mockCarDetail, siteUrl, { consultant }) as any;
    const cleanProduct = cleanJsonLd['@graph'].find((item: any) =>
      Array.isArray(item['@type']) && item['@type'].includes('Product')
    );
    expect(cleanProduct.aggregateRating).toBeUndefined();

    // 2. Kiểm tra Person (Saler Consultant)
    const person = graph.find((item: any) => item['@type'] === 'Person');
    expect(person).toBeDefined();
    expect(person.name).toBe('Nguyễn Văn Saler');
    expect(person.telephone).toBe('0988123456');
    expect(person.worksFor['@type']).toBe('AutoDealer');
    expect(person.worksFor.name).toBe('Hyundai Phạm Văn Đồng');

    // 3. Kiểm tra BreadcrumbList
    const breadcrumb = graph.find((item: any) => item['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[2].name).toBe('Hyundai Tucson 2026');
    expect(breadcrumb.itemListElement[2].item).toBe('https://salerhyundai.vn/xe/tucson-2026');
  });
});
