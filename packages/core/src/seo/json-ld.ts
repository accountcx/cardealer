// 🧠 Mental Model: Trình sinh dữ liệu có cấu trúc Google Schema đa tầng (Product, Car, NewsArticle, Paywall, AutoDealer, FAQPage, VideoObject, BreadcrumbList)
// Đạt chuẩn Google Search Rich Results & Merchant Center:
// - NewsArticle: Cấu trúc báo chí chính thống với tác giả E-E-A-T, ngày đăng, ngày sửa, nhà xuất bản AutoDealer.
// - Paywall Schema (Google Specification): Nhận diện GatedContent, đánh dấu `isAccessibleForFree: false` và `hasPart: .gated-content-section` chống phạt cloaking.
// - FAQPage: Tự động trích xuất các câu hỏi từ FAQBlock Tiptap AST sinh Rich Snippet câu hỏi mở rộng.
// - VideoObject: Tự động sinh rich snippet video cho YoutubeBlock & TikTokBlock.
// - AutoDealer: Thực thể số định danh đại lý ô tô Hyundai Dũng Lạc (Vinh, Nghệ An).
// - Product & Car: AggregateOffer, hasMerchantReturnPolicy, warranty 5 năm.

import type { Car, CarCatalogItem, CarDetail } from '@cardealer/types';
import {
  extractFaqsFromTiptap,
  extractVideosFromTiptap,
  hasGatedContent,
  type ExtractedFaq,
  type ExtractedVideo,
} from '../tiptap/extractor';

// ============================================================================
// 1. INTERFACES & CONFIG TYPES
// ============================================================================

export interface ConsultantSchemaInfo {
  name: string;
  phone: string;
  jobTitle?: string;
  showroomName?: string;
  showroomAddress?: string;
}

export interface CarAggregateRatingInfo {
  ratingValue: number | string;
  reviewCount: number;
  bestRating?: number | string;
  worstRating?: number | string;
}

export interface CarJsonLdOptions {
  consultant?: ConsultantSchemaInfo;
  warrantyDurationYears?: number;
  warrantyMileageKm?: number;
  returnPolicyDays?: number;
  aggregateRating?: CarAggregateRatingInfo; // Chỉ render khi có review thực tế từ database
}

export interface PostAuthorInfo {
  id?: string;
  name: string;
  jobTitle?: string;
  avatarUrl?: string;
  url?: string;
  bio?: string;
  phone?: string;
}

export interface PostCategoryInfo {
  id?: string;
  name: string;
  slug: string;
}

export interface PostForJsonLd {
  id?: string;
  tieuDe: string;
  slug: string;
  anhDaiDienUrl: string;
  anhDaiDienAlt?: string | null;
  tomTat?: string | null;
  noiDung?: unknown; // Tiptap JSON Tree
  createdAt?: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date;
  category?: PostCategoryInfo | null;
  author?: PostAuthorInfo | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
}

export interface AutoDealerInfo {
  name?: string;
  legalName?: string;
  url?: string;
  logoUrl?: string;
  facadeImageUrl?: string;
  telephone?: string;
  priceRange?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    latitude?: number;
    longitude?: number;
  };
  openingHours?: Array<{
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
}

export interface PostJsonLdOptions {
  dealer?: AutoDealerInfo;
  defaultAuthor?: PostAuthorInfo;
}

// ============================================================================
// 2. HELPER UTILS
// ============================================================================

/**
 * 🧠 Canonical Domain Guard: Schema JSON-LD đại diện cho thực thể số chuẩn hóa với Googlebot.
 * Nếu siteUrl là localhost hoặc rỗng, bắt buộc fallback về domain production chính thức https://xehyundaivinh.com
 */
export function sanitizeCanonicalBaseUrl(siteUrl?: string): string {
  const isLocalhost = !siteUrl || siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
  const canonicalBaseUrl = isLocalhost ? 'https://xehyundaivinh.com' : siteUrl;
  return canonicalBaseUrl.replace(/\/$/, '');
}

/**
 * 🧠 Mental Model: Schema Availability Resolver:
 * Xác định trạng thái còn hàng chuẩn Schema.org dựa trên trường status, isAvailable hoặc isPreOrder thực tế của xe.
 * Tránh hardcode InStock khi xe đã ngừng kinh doanh (Discontinued) hoặc hết hàng (OutOfStock).
 */
export function resolveAvailability(car: Car | CarDetail | CarCatalogItem | Record<string, unknown>): string {
  if (!car || typeof car !== 'object') {
    return 'https://schema.org/InStock';
  }

  const status = 'status' in car ? String(car.status) : undefined;
  if (status === 'draft' || status === 'archived') {
    return 'https://schema.org/Discontinued';
  }

  if ('isAvailable' in car && car.isAvailable === false) {
    return 'https://schema.org/OutOfStock';
  }

  if ('isPreOrder' in car && Boolean((car as any).isPreOrder)) {
    return 'https://schema.org/PreOrder';
  }

  return 'https://schema.org/InStock';
}

function toIsoDateString(val?: string | Date | null): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// ============================================================================
// 3. AUTO DEALER SCHEMA GENERATOR
// ============================================================================

/**
 * 🧠 Mental Model: Đại diện cho thực thể số pháp lý và showroom vật lý Hyundai Dũng Lạc (Vinh, Nghệ An).
 * Giúp Google củng cố tín hiệu Local SEO và E-E-A-T cho toàn bộ website và bài viết.
 */
export function generateAutoDealerSchema(siteUrl: string, customDealer?: AutoDealerInfo) {
  const cleanSiteUrl = sanitizeCanonicalBaseUrl(siteUrl);

  return {
    '@type': 'AutoDealer',
    '@id': `${cleanSiteUrl}/#autodealer`,
    name: customDealer?.name || 'Hyundai Dũng Lạc - Đại lý ủy quyền Hyundai Thành Công',
    legalName: customDealer?.legalName || 'Công ty Cổ phần Thương mại Dũng Lạc',
    url: cleanSiteUrl,
    logo: customDealer?.logoUrl || `${cleanSiteUrl}/images/logo-hyundai-vinh.png`,
    image: customDealer?.facadeImageUrl || `${cleanSiteUrl}/images/showroom-facade.webp`,
    telephone: customDealer?.telephone || '0942.391.222',
    priceRange: customDealer?.priceRange || '₫₫ - ₫₫₫₫',
    address: {
      '@type': 'PostalAddress',
      streetAddress: customDealer?.address?.streetAddress || 'Km 3 + 500 Đại lộ Lê Nin, Xã Nghi Phú',
      addressLocality: customDealer?.address?.addressLocality || 'Thành phố Vinh',
      addressRegion: customDealer?.address?.addressRegion || 'Nghệ An',
      postalCode: customDealer?.address?.postalCode || '43000',
      addressCountry: customDealer?.address?.addressCountry || 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: customDealer?.geo?.latitude ?? 18.698342,
      longitude: customDealer?.geo?.longitude ?? 105.679815,
    },
    openingHoursSpecification: customDealer?.openingHours?.map((oh) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: oh.dayOfWeek,
      opens: oh.opens,
      closes: oh.closes,
    })) || [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
  };
}

// ============================================================================
// 4. POST BREADCRUMB SCHEMA GENERATOR
// ============================================================================

/**
 * 🧠 Mental Model: Schema Breadcrumb cho bài viết tin tức:
 * Trang chủ > Tin tức > [Tên chuyên mục nếu có] > Tên bài viết
 */
export function generatePostBreadcrumbSchema(
  post: Pick<PostForJsonLd, 'tieuDe' | 'slug'>,
  siteUrl: string,
  category?: PostCategoryInfo | null
) {
  const cleanSiteUrl = sanitizeCanonicalBaseUrl(siteUrl);

  const itemList = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Trang chủ',
      item: cleanSiteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Tin tức & Khuyến Mãi',
      item: `${cleanSiteUrl}/tin-tuc`,
    },
  ];

  if (category && category.name && category.slug) {
    itemList.push({
      '@type': 'ListItem',
      position: 3,
      name: category.name,
      item: `${cleanSiteUrl}/tin-tuc/danh-muc/${category.slug}`,
    });
    itemList.push({
      '@type': 'ListItem',
      position: 4,
      name: post.tieuDe,
      item: `${cleanSiteUrl}/tin-tuc/${post.slug}`,
    });
  } else {
    itemList.push({
      '@type': 'ListItem',
      position: 3,
      name: post.tieuDe,
      item: `${cleanSiteUrl}/tin-tuc/${post.slug}`,
    });
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${cleanSiteUrl}/tin-tuc/${post.slug}#breadcrumb`,
    itemListElement: itemList,
  };
}

// ============================================================================
// 5. PAYWALL SCHEMA GENERATOR (GOOGLE SPECIFICATION)
// ============================================================================

/**
 * 🧠 Mental Model: Paywall Schema theo chuẩn kỹ thuật chính thức từ Google Search Central.
 * Khi bài viết chứa nội dung độc quyền/bị khóa mờ (Gated Content) yêu cầu khách để lại SĐT/Zalo,
 * ta PHẢI khai báo rõ `isAccessibleForFree: false` và chỉ định `hasPart: .gated-content-section`
 * để Googlebot thu thập nội dung mà TUYỆT ĐỐI KHÔNG phạt lỗi Che giấu nội dung (Cloaking Penalty).
 */
export function generatePaywallSchema(postOrContent: unknown): {
  isAccessibleForFree: boolean;
  hasPart?: {
    '@type': 'WebPageElement';
    isAccessibleForFree: boolean;
    cssSelector: string;
  };
} {
  const content =
    postOrContent && typeof postOrContent === 'object' && 'noiDung' in postOrContent
      ? (postOrContent as { noiDung?: unknown }).noiDung
      : postOrContent;

  const isGated = hasGatedContent(content);

  if (isGated) {
    return {
      isAccessibleForFree: false,
      hasPart: {
        '@type': 'WebPageElement',
        isAccessibleForFree: false,
        cssSelector: '.gated-content-section',
      },
    };
  }

  return {
    isAccessibleForFree: true,
  };
}

// ============================================================================
// 6. FAQ SCHEMA GENERATOR (FAQPage)
// ============================================================================

/**
 * 🧠 Mental Model: Sinh Schema FAQPage từ danh sách câu hỏi FAQBlock.
 * Lưu ý theo cập nhật mới của Google Search: Rich Snippet dạng Accordion trên SERP hiện chỉ ưu tiên
 * cho các cơ quan thẩm quyền (Gov/Health). Tuy nhiên, FAQPage Schema vẫn có vai trò cực kỳ quan trọng
 * trong Semantic Search, Google AI Overviews và LLM Crawlers để xây dựng Knowledge Graph của doanh nghiệp.
 */
export function generateFaqSchema(faqs: ExtractedFaq[]) {
  if (!Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface VideoObjectSchema {
  '@type': 'VideoObject';
  name: string;
  description: string;
  thumbnailUrl: string[];
  uploadDate: string;
  contentUrl: string;
  embedUrl: string;
  duration?: string;
  [key: string]: unknown;
}

/**
 * 🧠 Mental Model: Sinh Schema VideoObject cho các video YouTube và TikTok nhúng trong bài.
 * Bổ sung `duration` (ISO 8601 e.g. PT3M15S) theo khuyến nghị chính thức của Google Video Guidelines
 * và ưu tiên ngày xuất bản thực của video (`video.uploadDate`) để tránh bất đối xứng thời gian.
 */
export function generateVideoSchema(
  videos: ExtractedVideo[],
  siteUrl: string,
  fallbackUploadDate?: string | Date
): VideoObjectSchema[] {
  if (!Array.isArray(videos) || videos.length === 0) {
    return [];
  }

  const cleanSiteUrl = sanitizeCanonicalBaseUrl(siteUrl);

  return videos.map((video): VideoObjectSchema => {
    let thumbnailUrl = video.posterUrl;
    let embedUrl = video.url;

    if (video.type === 'youtube') {
      thumbnailUrl = video.posterUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
      embedUrl = `https://www.youtube.com/embed/${video.videoId}`;
    } else {
      thumbnailUrl = video.posterUrl || `${cleanSiteUrl}/images/tiktok-video-cover.webp`;
    }

    const uploadDate = video.uploadDate ? toIsoDateString(video.uploadDate) : toIsoDateString(fallbackUploadDate);

    const videoObj: VideoObjectSchema = {
      '@type': 'VideoObject',
      name: video.title || 'Video đánh giá & trải nghiệm thực tế xe Hyundai',
      description:
        video.title ||
        'Video đánh giá chi tiết ngoại thất, nội thất, động cơ và tính năng an toàn SmartSense xe Hyundai.',
      thumbnailUrl: [thumbnailUrl],
      uploadDate,
      contentUrl: video.url,
      embedUrl,
      ...(video.duration ? { duration: video.duration } : {}),
    };

    return videoObj;
  });
}

// ============================================================================
// 8. NEWS ARTICLE SCHEMA GENERATOR
// ============================================================================

/**
 * 🧠 Mental Model: Schema NewsArticle chuẩn Google News & E-E-A-T.
 * Định danh bài viết tin tức, tác giả chuyên gia ô tô, ngày xuất bản và chính sách Paywall (nếu có).
 */
export function generateNewsArticleSchema(
  post: PostForJsonLd,
  siteUrl: string,
  options?: PostJsonLdOptions
) {
  const cleanSiteUrl = sanitizeCanonicalBaseUrl(siteUrl);
  const authorInfo = post.author || options?.defaultAuthor;

  const datePublished = toIsoDateString(post.publishedAt || post.createdAt);
  const dateModified = toIsoDateString(post.updatedAt || post.publishedAt || post.createdAt);

  const paywallInfo = generatePaywallSchema(post.noiDung);

  const article: Record<string, unknown> = {
    '@type': 'NewsArticle',
    '@id': `${cleanSiteUrl}/tin-tuc/${post.slug}#article`,
    headline: post.tieuDe,
    description: post.tomTat || post.metaDescription || post.tieuDe,
    image: [post.anhDaiDienUrl],
    datePublished,
    dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${cleanSiteUrl}/tin-tuc/${post.slug}`,
    },
    inLanguage: 'vi-VN',
    author: {
      '@type': 'Person',
      name: authorInfo?.name || 'Ban Biên Tập Hyundai Dũng Lạc',
      jobTitle: authorInfo?.jobTitle || 'Chuyên gia phân tích thị trường ô tô',
      worksFor: {
        '@id': `${cleanSiteUrl}/#autodealer`,
      },
      ...(authorInfo?.avatarUrl ? { image: authorInfo.avatarUrl } : {}),
      ...(authorInfo?.url ? { url: authorInfo.url } : {}),
    },
    publisher: {
      '@id': `${cleanSiteUrl}/#autodealer`,
    },
    ...(post.category?.name ? { articleSection: post.category.name } : {}),
    ...paywallInfo,
  };

  return article;
}

// ============================================================================
// 9. MASTER POST JSON-LD GENERATOR (@graph)
// ============================================================================

/**
 * 🧠 Mental Model: Bộ tổng hợp Master Schema JSON-LD cho toàn bộ bài viết Storefront.
 * Tự động trích xuất FAQ, Videos, Headings, Paywall status và tổ chức thành một cây `@graph` duy nhất:
 * 1. AutoDealer (Tổ chức sở hữu)
 * 2. NewsArticle (Nội dung chính)
 * 3. BreadcrumbList (Điều hướng phân cấp)
 * 4. FAQPage (Nếu có FAQBlock trong nội dung)
 * 5. VideoObject[] (Nếu có YoutubeBlock / TikTokBlock)
 */
export function generatePostMasterJsonLd(post: PostForJsonLd, siteUrl: string, options?: PostJsonLdOptions) {
  const cleanSiteUrl = sanitizeCanonicalBaseUrl(siteUrl);

  const autoDealerGraph = generateAutoDealerSchema(cleanSiteUrl, options?.dealer);
  const articleGraph = generateNewsArticleSchema(post, cleanSiteUrl, options);
  const breadcrumbGraph = generatePostBreadcrumbSchema(post, cleanSiteUrl, post.category);

  const graph: Record<string, unknown>[] = [autoDealerGraph, articleGraph, breadcrumbGraph];

  // Tự động phân tích AST nội dung Tiptap
  if (post.noiDung) {
    // 1. FAQPage Schema
    const faqs = extractFaqsFromTiptap(post.noiDung);
    const faqSchema = generateFaqSchema(faqs);
    if (faqSchema) {
      graph.push(faqSchema);
    }

    // 2. VideoObject Schemas
    const videos = extractVideosFromTiptap(post.noiDung);
    const videoSchemas = generateVideoSchema(videos, cleanSiteUrl, post.publishedAt || post.createdAt);
    if (videoSchemas.length > 0) {
      graph.push(...videoSchemas);
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

// ============================================================================
// 10. CAR & CATALOG SCHEMA GENERATORS (GOOGLE MANUAL ACTION & INVALID PRICE GUARD)
// ============================================================================

/**
 * 🧠 Mental Model: Trình sinh dữ liệu có cấu trúc Google Schema đa tầng (Product, Car, Person, BreadcrumbList)
 * Đạt chuẩn Google Search Rich Results & Merchant Center:
 * - AggregateOffer: Chỉ sinh khi lowPrice > 0 (chống lỗi Invalid Price: 0 của Google Merchant Center).
 * - availability: Xác định động theo trạng thái xe (InStock / OutOfStock / PreOrder / Discontinued).
 * - hasMerchantReturnPolicy: Chính sách đổi trả minh bạch.
 * - warranty: Bảo hành chính hãng 5 năm / 100.000km.
 * - aggregateRating: TUYỆT ĐỐI KHÔNG HARDCODE. Chỉ render khi có dữ liệu reviews thực tế chống phạt Manual Action.
 * - Person Consultant: Định danh chuyên viên tư vấn bán xe cá nhân gắn với AutoDealer.
 * - BreadcrumbList: Cấu trúc điều hướng Trang chủ > Bảng giá xe > Tên dòng xe.
 */
export function generateCarJsonLd(
  car: Car | CarDetail,
  siteUrl: string,
  optionsOrConsultant?: ConsultantSchemaInfo | CarJsonLdOptions
) {
  const cleanSiteUrl = sanitizeCanonicalBaseUrl(siteUrl);

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

  const rawLowestPrice =
    'minPrice' in car && typeof car.minPrice === 'number' && car.minPrice > 0
      ? car.minPrice
      : versions.length > 0
        ? Math.min(
            ...versions
              .map((v) => Number((v as any).giaKhuyenMai || v.giaNiemYet || 0))
              .filter((p) => p > 0)
          )
        : 0;

  const validLowestPrice = isFinite(rawLowestPrice) && rawLowestPrice > 0 ? rawLowestPrice : 0;

  const rawHighestPrice =
    'maxPrice' in car && typeof car.maxPrice === 'number' && car.maxPrice > 0
      ? car.maxPrice
      : versions.length > 0
        ? Math.max(
            ...versions
              .map((v) => Number(v.giaNiemYet || 0))
              .filter((p) => p > 0)
          )
        : validLowestPrice;

  const validHighestPrice = isFinite(rawHighestPrice) && rawHighestPrice > 0 ? rawHighestPrice : validLowestPrice;

  // 🧠 Mental Model: Google Structured Data Manual Action Guard:
  // TUYỆT ĐỐI KHÔNG tự bịa hoặc hardcode aggregateRating ảo (e.g. 4.9/38 reviews) cho mọi dòng xe.
  // Google cấm nghiêm ngặt việc tạo review ảo và sẽ phạt Manual Action thu hồi toàn bộ Rich Snippets.
  // Chỉ render node aggregateRating khi có dữ liệu đánh giá thực tế (reviewCount > 0).
  const ratingData =
    options.aggregateRating ||
    ('aggregateRating' in car && (car as any).aggregateRating && (car as any).aggregateRating.reviewCount > 0
      ? (car as any).aggregateRating
      : undefined);

  const aggregateRatingNode =
    ratingData && Number(ratingData.reviewCount) > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: String(ratingData.ratingValue),
          reviewCount: Number(ratingData.reviewCount),
          bestRating: String(ratingData.bestRating ?? '5'),
          worstRating: String(ratingData.worstRating ?? '1'),
        }
      : undefined;

  // 🧠 Mental Model: Google Merchant Center & Rich Results Invalid Price Guard:
  // Nếu xe chưa cập nhật giá hoặc danh sách phiên bản rỗng (price = 0), tuyệt đối KHÔNG sinh node offers
  // có lowPrice: 0 vì sẽ bị Google Search Console báo lỗi "Invalid Price: 0".
  const availability = resolveAvailability(car);

  const offersNode =
    validLowestPrice > 0
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'VND',
          lowPrice: validLowestPrice,
          highPrice: validHighestPrice,
          offerCount: versions.length || 1,
          url: `${cleanSiteUrl}/xe/${car.slug}`,
          availability,
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'VN',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: returnDays,
            returnMethod: 'https://schema.org/ReturnInStore',
            returnFees: 'https://schema.org/FreeReturn',
          },
        }
      : undefined;

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
    ...(aggregateRatingNode ? { aggregateRating: aggregateRatingNode } : {}),
    ...(offersNode ? { offers: offersNode } : {}),
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
 * - Chỉ render node offers khi giá hợp lệ (> 0) chống lỗi Invalid Price.
 * - availability được tính toán động (InStock / OutOfStock / PreOrder / Discontinued).
 */
export function generateCatalogJsonLd(cars: (CarCatalogItem | Car)[], siteUrl: string) {
  const cleanSiteUrl = sanitizeCanonicalBaseUrl(siteUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bảng Giá Các Dòng Xe Hyundai Chính Hãng 2026',
    description:
      'Danh mục các dòng xe Hyundai Sedan, SUV, MPV, Hatchback và Xe điện kèm giá niêm yết và dự toán lăn bánh mới nhất.',
    numberOfItems: cars.length,
    itemListElement: cars.map((car, index) => {
      const versions = 'versions' in car && Array.isArray(car.versions) ? car.versions : [];
      const rawMinPrice =
        'minPrice' in car && typeof car.minPrice === 'number' && car.minPrice > 0
          ? car.minPrice
          : versions.length > 0
            ? Math.min(
                ...versions
                  .map((v) => Number((v as any).giaKhuyenMai || v.giaNiemYet || 0))
                  .filter((p) => p > 0)
              )
            : 0;

      const validMinPrice = isFinite(rawMinPrice) && rawMinPrice > 0 ? rawMinPrice : 0;

      const rawMaxPrice =
        'maxPrice' in car && typeof car.maxPrice === 'number' && car.maxPrice > 0
          ? car.maxPrice
          : versions.length > 0
            ? Math.max(
                ...versions
                  .map((v) => Number(v.giaNiemYet || 0))
                  .filter((p) => p > 0)
              )
            : validMinPrice;

      const validMaxPrice = isFinite(rawMaxPrice) && rawMaxPrice > 0 ? rawMaxPrice : validMinPrice;

      const versionCount =
        'versionCount' in car && typeof car.versionCount === 'number'
          ? car.versionCount
          : versions.length;

      const availability = resolveAvailability(car);

      // Chỉ render offers khi có giá hợp lệ > 0
      const offersNode =
        validMinPrice > 0
          ? {
              '@type': 'AggregateOffer',
              priceCurrency: 'VND',
              lowPrice: validMinPrice,
              highPrice: validMaxPrice,
              offerCount: versionCount || 1,
              url: `${cleanSiteUrl}/xe/${car.slug}`,
              availability,
            }
          : undefined;

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
          ...(offersNode ? { offers: offersNode } : {}),
        },
      };
    }),
  };
}

