// 🧠 Mental Model: Trang Chi Tiết Bài Viết & Inbound Marketing Hub Storefront (/tin-tuc/[slug]).
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Server-Side Rendering (RSC) & ISR 60s: Kết xuất dữ liệu bài viết theo slug tại server, tối ưu Core Web Vitals (LCP < 1.2s, CLS = 0).
// 2. SEO Best Practices 10 Tiêu Chí:
//    - Cố định Canonical URL tuyệt đối: https://xehyundaivinh.com/tin-tuc/[slug].
//    - OpenGraph 1200x630 chuẩn báo chí xe hơi, Twitter Summary Large Image.
//    - Nhúng Master Schema JSON-LD từ @cardealer/core (NewsArticle, AutoDealer, BreadcrumbList, FAQPage, VideoObject, Paywall).
// 3. E-E-A-T Authority & Content Blocks:
//    - Breadcrumbs phân cấp rõ ràng (Trang chủ > Tin tức > Chuyên mục > Tiêu đề bài viết).
//    - Header bài viết: Tiêu đề H1, Badge chuyên mục, Ngày đăng, Thời gian đọc, Lượt xem, Tác giả chuyên gia.
//    - Khối tóm tắt Sapo thanh lịch, dẫn nhập cuốn hút.
//    - Nội dung chuẩn Rich Content: Hỗ trợ CalloutBlock, PriceTableBlock, FAQBlock, RelatedCarBlock, InlineQuickForm.
// 4. 4-State UI Matrix:
//    - Data State: Render bài viết hoàn chỉnh, bố cục 2 cột (Content + Conversion Sidebar).
//    - Empty/Not-Found State: Giao diện 404 thân thiện, gợi ý các bài viết hot hoặc nút quay lại Hub Tin tức.
//    - Error State: Graceful Degradation qua hệ thống Fallback Articles chi tiết.
// 5. 100% Named Export + Default Export cho Next.js App Router Page.

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  Share2,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Tag,
  ArrowLeft,
  FileQuestion,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CalloutBlock,
  FAQBlock,
  InlineQuickForm,
  RelatedCarBlock,
  PriceTableBlock,
} from '@cardealer/ui';
import { generatePostMasterJsonLd, type PostForJsonLd } from '@cardealer/core';
import { apiClient } from '../../../lib/api-client';
import { StickyToc } from '../../../components/StickyToc';
import { PostBottomBar } from '../../../components/PostBottomBar';
import { SlideInBanner } from '../../../components/SlideInBanner';
import { EeatAuthorBox } from '../../../components/EeatAuthorBox';

export const revalidate = 60; // Next.js ISR: 60s

export interface PostDetailData {
  id: string;
  tieuDe: string;
  slug: string;
  anhDaiDienUrl: string;
  anhDaiDienAlt?: string;
  tomTat?: string | null;
  noiDungHtml?: string;
  noiDungAst?: Record<string, unknown> | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  category?: {
    id: string;
    tenChuyenMuc: string;
    slug: string;
  } | null;
  author?: {
    id: string;
    fullName: string;
    role?: string;
    avatarUrl?: string | null;
    phone?: string | null;
  } | null;
  isFeatured?: boolean;
  featuredOrder?: number;
  readingTime: number;
  wordCount?: number;
  viewCount?: number;
  tags?: Array<{ id: string; tenTag: string; slug: string }>;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Content Blocks data giả lập cho fallback
  faqs?: Array<{ question: string; answer: string }>;
  prices?: Array<{ version: string; listedPrice: number; discount: number; rollingPrice: number }>;
}

export interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ============================================================================
// DỮ LIỆU BÀI VIẾT FALLBACK ĐẦY ĐỦ (DỰ PHÒNG KHI DB TRỐNG)
// ============================================================================
const FALLBACK_DETAIL_ARTICLES: Record<string, PostDetailData> = {
  'bang-gia-xe-hyundai-thang-09-2026-vinh': {
    id: 'fb-1',
    tieuDe: 'Bảng Giá Xe Hyundai Mới Nhất Tháng 09/2026 Tại TP. Vinh, Nghệ An: Ưu Đãi Lăn Bánh Lên Đến 100 Triệu',
    slug: 'bang-gia-xe-hyundai-thang-09-2026-vinh',
    anhDaiDienUrl: '/images/banners/hero-event.webp',
    anhDaiDienAlt: 'Bảng giá xe Hyundai 2026 tại Nghệ An',
    tomTat:
      'Tổng hợp toàn bộ giá niêm yết, chính sách giảm giá tiền mặt, gói phụ kiện chính hãng và dự toán chi phí lăn bánh các dòng xe Accent, Creta, Tucson, Santa Fe mới nhất tại đại lý Hyundai Vinh.',
    metaTitle: 'Bảng Giá Xe Hyundai Tháng 09/2026 Tại Vinh - Ưu Đãi Lăn Bánh 100 Triệu',
    metaDescription:
      'Cập nhật bảng giá xe Hyundai tháng 09/2026 tại TP. Vinh, Nghệ An. Giảm tiền mặt đến 100 triệu, tặng bảo hiểm thân vỏ và phụ kiện chính hãng. Hỗ trợ vay trả góp 85%.',
    category: { id: 'cat-1', tenChuyenMuc: 'Bảng Giá & Khuyến Mãi', slug: 'bang-gia-khuyen-mai' },
    author: {
      id: 'u-1',
      fullName: 'Ban Biên Tập Hyundai Vinh',
      role: 'Chuyên gia Phân tích Thị trường Ô tô',
      avatarUrl: '/images/avatars/consultant-1.webp',
      phone: '0941.000.000',
    },
    readingTime: 4,
    wordCount: 1450,
    viewCount: 1820,
    publishedAt: '2026-09-22T08:00:00.000Z',
    createdAt: '2026-09-22T08:00:00.000Z',
    tags: [
      { id: 't-1', tenTag: 'Bảng Giá Xe', slug: 'bang-gia-xe' },
      { id: 't-2', tenTag: 'Khuyến Mãi Hyundai', slug: 'khuyen-mai-hyundai' },
      { id: 't-3', tenTag: 'Giá Lăn Bánh Vinh', slug: 'gia-lan-banh-vinh' },
    ],
    prices: [
      { version: 'Hyundai Grand i10 1.2 AT', listedPrice: 405000000, discount: 25000000, rollingPrice: 425000000 },
      { version: 'Hyundai Accent 1.5 AT Tiêu Chuẩn', listedPrice: 489000000, discount: 30000000, rollingPrice: 512000000 },
      { version: 'Hyundai Accent 1.5 AT Đặc Biệt', listedPrice: 569000000, discount: 35000000, rollingPrice: 595000000 },
      { version: 'Hyundai Creta 1.5 Cao Cấp', listedPrice: 699000000, discount: 45000000, rollingPrice: 735000000 },
      { version: 'Hyundai Tucson 2.0 Xăng Đặc Biệt', listedPrice: 839000000, discount: 60000000, rollingPrice: 878000000 },
      { version: 'Hyundai Santa Fe 2.5 Prestige', listedPrice: 1265000000, discount: 95000000, rollingPrice: 1320000000 },
    ],
    faqs: [
      {
        question: 'Giá lăn bánh xe Hyundai tại Nghệ An gồm những khoản chi phí nào?',
        answer:
          'Giá lăn bánh bao gồm: Giá sau giảm trừ của đại lý + Lệ phí trước bạ (10% tại Nghệ An) + Phí biển số (1.000.000đ) + Phí đăng kiểm + Phí bảo trì đường bộ 1 năm + Bảo hiểm TNDS bắt buộc.',
      },
      {
        question: 'Mua xe trả góp tại Hyundai Vinh cần chuẩn bị trước bao nhiêu tiền?',
        answer:
          'Quý khách chỉ cần trả trước từ 15% - 20% giá trị xe (khoảng 80 - 120 triệu tùy dòng xe Accent hay Creta). Ngân hàng hỗ trợ vay tối đa 85% trong 8 năm.',
      },
      {
        question: 'Đại lý có hỗ trợ giao xe tận nhà tại các huyện trong tỉnh Nghệ An và Hà Tĩnh không?',
        answer:
          'Hyundai Vinh hỗ trợ giao xe tận nơi bằng xe chuyên dụng miễn phí trên toàn địa bàn Nghệ An (Diễn Châu, Đô Lương, Quỳnh Lưu, Thái Hòa...) và Hà Tĩnh.',
      },
    ],
  },
  'thu-tuc-mua-xe-tra-gop-lai-suat-thap-2026': {
    id: 'fb-2',
    tieuDe: 'Thủ Tục Mua Xe Ô Tô Trả Góp Lãi Suất Thấp 2026: Hướng Dẫn Bao Đậu Hồ Sơ Trong 24 Giờ',
    slug: 'thu-tuc-mua-xe-tra-gop-lai-suat-thap-2026',
    anhDaiDienUrl: '/images/delivery/delivery-1.webp',
    anhDaiDienAlt: 'Tư vấn mua xe Hyundai trả góp',
    tomTat:
      'Quy trình vay ngân hàng mua xe Hyundai đơn giản, vay tối đa 85% giá trị xe, thời hạn lên đến 8 năm với bảng tính số tiền trả góp gốc và lãi hàng tháng chi tiết.',
    metaTitle: 'Hướng Dẫn Mua Xe Ô Tô Trả Góp 2026 - Lãi Suất Thấp, Duyệt 24 Giờ',
    metaDescription:
      'Thủ tục mua xe Hyundai trả góp năm 2026 đơn giản, giải ngân nhanh. Hỗ trợ khách hàng cá nhân và doanh nghiệp, chứng minh thu nhập linh hoạt, lãi suất ưu đãi chỉ từ 6.8%/năm.',
    category: { id: 'cat-2', tenChuyenMuc: 'Cẩm Nang Mua Xe', slug: 'cam-nang-mua-xe' },
    author: {
      id: 'u-2',
      fullName: 'Nguyễn Văn Tuấn',
      role: 'Trưởng nhóm Tư vấn Tài chính & Tín dụng',
      avatarUrl: '/images/avatars/consultant-2.webp',
      phone: '0941.111.222',
    },
    readingTime: 5,
    wordCount: 1650,
    viewCount: 1420,
    publishedAt: '2026-09-20T09:30:00.000Z',
    createdAt: '2026-09-20T09:30:00.000Z',
    tags: [
      { id: 't-4', tenTag: 'Vay Mua Xe', slug: 'vay-mua-xe' },
      { id: 't-5', tenTag: 'Thủ Tục Trả Góp', slug: 'thu-tuc-tra-gop' },
    ],
    faqs: [
      {
        question: 'Nợ xấu nhóm 2 hoặc không có sao kê lương có vay mua xe được không?',
        answer:
          'Chúng tôi liên kết với hơn 8 ngân hàng đối tác lớn, có gói chuyên biệt hỗ trợ chứng minh qua tài sản tích lũy, cơ sở kinh doanh hộ cá thể hoặc nhà đất.',
      },
      {
        question: 'Thời gian xét duyệt hồ sơ vay mua xe Hyundai mất bao lâu?',
        answer:
          'Chỉ từ 4 đến 8 giờ làm việc kể từ lúc nhận đủ hồ sơ hình ảnh qua Zalo, ngân hàng sẽ ra cam kết cho vay chính thức.',
      },
    ],
  },
  'danh-gia-chi-tiet-hyundai-santa-fe-2026': {
    id: 'fb-3',
    tieuDe: 'Đánh Giá Chi Tiết Hyundai Santa Fe 2026 Hoàn Toàn Mới: Đột Phá Không Gian & Công Nghệ',
    slug: 'danh-gia-chi-tiet-hyundai-santa-fe-2026',
    anhDaiDienUrl: '/images/cars/tucson.webp',
    anhDaiDienAlt: 'Hyundai Santa Fe 2026 thế hệ mới',
    tomTat:
      'Khám phá ngoại thất vuông vức việt dã, nội thất hạng thương gia 2 màn hình cong panoramic, gói an toàn SmartSense nâng cấp và khả năng vận hành mạnh mẽ trên cung đường miền Trung.',
    metaTitle: 'Đánh Giá Xe Hyundai Santa Fe 2026 Thế Hệ Mới - Thiết Kế & Vận Hành',
    metaDescription:
      'Chi tiết đánh giá Hyundai Santa Fe 2026: Không gian 7 chỗ rộng rãi bậc nhất phân khúc, động cơ SmartStream thế hệ mới, trang bị ngập tràn cùng giá bán hấp dẫn tại Nghệ An.',
    category: { id: 'cat-3', tenChuyenMuc: 'Đánh Giá Xe', slug: 'danh-gia-xe' },
    author: {
      id: 'u-3',
      fullName: 'Lê Hoàng Nam',
      role: 'Chuyên gia Đánh giá Xe & Lái thử',
      avatarUrl: '/images/avatars/consultant-3.webp',
      phone: '0941.333.444',
    },
    readingTime: 6,
    wordCount: 1980,
    viewCount: 3100,
    publishedAt: '2026-09-18T14:15:00.000Z',
    createdAt: '2026-09-18T14:15:00.000Z',
    tags: [
      { id: 't-6', tenTag: 'Santa Fe 2026', slug: 'santa-fe-2026' },
      { id: 't-7', tenTag: 'Đánh Giá Xe SUV', slug: 'danh-gia-xe-suv' },
    ],
  },
};

// ============================================================================
// HÀM LẤY BÀI VIẾT THEO SLUG (API + FALLBACK DEGRADATION)
// ============================================================================
async function getPostBySlug(slug: string): Promise<PostDetailData | null> {
  try {
    const res = await apiClient.get<any>(`/api/posts/${slug}`);
    if (res && res.data && res.data.slug) {
      return res.data;
    }
  } catch {
    // Tiếp tục fallback
  }

  // Tìm trong fallback store
  if (FALLBACK_DETAIL_ARTICLES[slug]) {
    return FALLBACK_DETAIL_ARTICLES[slug];
  }

  // Fallback tổng quát nếu slug không tồn tại nhưng có từ khóa khớp
  const generalKeys = Object.keys(FALLBACK_DETAIL_ARTICLES);
  const matchedKey = generalKeys.find((k) => slug.includes(k) || k.includes(slug));
  if (matchedKey) {
    return FALLBACK_DETAIL_ARTICLES[matchedKey];
  }

  return null;
}

// ============================================================================
// SEO METADATA GENERATOR (CANONICAL + OPEN GRAPH + TWITTER)
// ============================================================================
export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết | Hyundai Vinh',
      description: 'Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn mới.',
      robots: { index: false, follow: true },
    };
  }

  const title = post.metaTitle || `${post.tieuDe} | Đại Lý Hyundai Vinh`;
  const description =
    post.metaDescription ||
    post.tomTat ||
    `Đọc bài viết ${post.tieuDe} chi tiết từ các chuyên gia tư vấn tại đại lý Hyundai Vinh.`;
  const canonicalUrl = `/tin-tuc/${post.slug}`;
  const imageUrl = post.anhDaiDienUrl.startsWith('http')
    ? post.anhDaiDienUrl
    : `https://xehyundaivinh.com${post.anhDaiDienUrl}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt || post.publishedAt || post.createdAt,
      authors: [post.author?.fullName || 'Hyundai Vinh'],
      section: post.category?.tenChuyenMuc || 'Tin tức',
      tags: post.tags?.map((t) => t.tenTag),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.anhDaiDienAlt || post.tieuDe,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

// ============================================================================
// MAIN SERVER COMPONENT: POST DETAIL PAGE
// ============================================================================
export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // 1. EMPTY / 404 STATE
  if (!post) {
    return (
      <main className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full text-center p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Nội dung bài viết với đường dẫn <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-blue-800">/{slug}</span> có thể đã được thay đổi hoặc tạm ẩn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tin-tuc">
              <Button variant="outline" className="w-full sm:w-auto h-11 px-5 border-slate-300">
                <ArrowLeft className="w-4 h-4 mr-2" /> Về Hub Tin tức
              </Button>
            </Link>
            <a href="tel:0941000000">
              <Button className="w-full sm:w-auto h-11 px-5 bg-blue-700 hover:bg-blue-800 text-white font-medium">
                <Phone className="w-4 h-4 mr-2" /> Hotline 0941.000.000
              </Button>
            </a>
          </div>
        </Card>
      </main>
    );
  }

  // 2. CHUẨN BỊ MASTER SCHEMA JSON-LD (@cardealer/core)
  const postForJsonLd: PostForJsonLd = {
    id: post.id,
    tieuDe: post.tieuDe,
    slug: post.slug,
    tomTat: post.tomTat,
    anhDaiDienUrl: post.anhDaiDienUrl,
    anhDaiDienAlt: post.anhDaiDienAlt,
    publishedAt: post.publishedAt || post.createdAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    category: post.category ? { id: post.category.id, name: post.category.tenChuyenMuc, slug: post.category.slug } : undefined,
    author: post.author
      ? {
          id: post.author.id,
          name: post.author.fullName,
          jobTitle: post.author.role,
          avatarUrl: post.author.avatarUrl || undefined,
          phone: post.author.phone || undefined,
        }
      : undefined,
    noiDung: post.noiDungAst || undefined,
  };

  const masterSchema = generatePostMasterJsonLd(postForJsonLd, 'https://xehyundaivinh.com', {
    defaultAuthor: {
      name: post.author?.fullName || 'Ban Biên Tập Hyundai Vinh',
      jobTitle: post.author?.role || 'Chuyên gia tư vấn xe ô tô Hyundai',
      avatarUrl: post.author?.avatarUrl ? `https://xehyundaivinh.com${post.author.avatarUrl}` : undefined,
      phone: post.author?.phone || '0941.000.000',
    },
  });

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <article className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* 🧠 5 Schemas JSON-LD Master Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(masterSchema) }}
      />

      {/* ======================================================================
          1. BREADCRUMBS PHÂN CẤP CHUẨN SEO
      ====================================================================== */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 text-slate-400" />
            <Link href="/tin-tuc" className="hover:text-blue-700 transition-colors">
              Tin tức
            </Link>
            {post.category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 text-slate-400" />
                <Link
                  href={`/tin-tuc?chuyenMuc=${post.category.slug}`}
                  className="hover:text-blue-700 transition-colors"
                >
                  {post.category.tenChuyenMuc}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 text-slate-400" />
            <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md" title={post.tieuDe}>
              {post.tieuDe}
            </span>
          </nav>
        </div>
      </div>

      {/* ======================================================================
          2. HEADER BÀI VIẾT (HERO SECTION)
      ====================================================================== */}
      <header className="bg-white border-b border-slate-200/80 pt-8 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Badge chuyên mục */}
          {post.category && (
            <div className="mb-4">
              <Link href={`/tin-tuc?chuyenMuc=${post.category.slug}`}>
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs px-3 py-1 font-semibold uppercase tracking-wider rounded-md transition-colors">
                  {post.category.tenChuyenMuc}
                </Badge>
              </Link>
            </div>
          )}

          {/* H1 Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.25] mb-6">
            {post.tieuDe}
          </h1>

          {/* E-E-A-T Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-800 text-sm overflow-hidden flex-shrink-0">
                {post.author?.fullName ? post.author.fullName.charAt(0).toUpperCase() : <User className="w-5 h-5 text-blue-700" />}
              </div>
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>{post.author?.fullName || 'Ban Biên Tập Hyundai Vinh'}</span>
                  <span title="Tác giả được xác minh bởi Hyundai Vinh" className="inline-flex">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </span>
                </div>
                <div className="text-xs text-slate-500">{post.author?.role || 'Chuyên gia tư vấn xe'}</div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-slate-500">
              <span className="flex items-center gap-1.5" title="Ngày xuất bản">
                <Calendar className="w-4 h-4 text-slate-400" />
                <time dateTime={post.publishedAt || post.createdAt}>{formattedDate}</time>
              </span>
              <span className="flex items-center gap-1.5" title="Thời gian đọc ước tính">
                <Clock className="w-4 h-4 text-slate-400" />
                {post.readingTime || 4} phút đọc
              </span>
              {post.viewCount !== undefined && (
                <span className="hidden sm:flex items-center gap-1.5" title="Lượt xem">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {post.viewCount.toLocaleString('vi-VN')} xem
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================================
          3. NỘI DUNG CHÍNH (2 CỘT: CONTENT + SIDEBAR)
      ====================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* CỘT TRÁI: BÀI VIẾT CHI TIẾT (8 CỘT) */}
          <section className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            {/* Ảnh đại diện 16:9 */}
            {post.anhDaiDienUrl && (
              <figure className="mb-8 rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={post.anhDaiDienUrl}
                    alt={post.anhDaiDienAlt || post.tieuDe}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                    loading="eager"
                  />
                </div>
                {post.anhDaiDienAlt && (
                  <figcaption className="text-center text-xs text-slate-500 py-2.5 px-4 bg-slate-50 border-t border-slate-100 italic">
                    {post.anhDaiDienAlt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Sapo Tóm Tắt Mở Đầu */}
            {post.tomTat && (
              <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border-l-4 border-blue-600 text-slate-800 text-base sm:text-lg font-medium leading-relaxed mb-8">
                {post.tomTat}
              </div>
            )}

            {/* Nội dung Tiptap / Render Content Blocks */}
            <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-700 leading-relaxed">
              {post.noiDungHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: post.noiDungHtml }}
                  className="space-y-4"
                />
              ) : (
                <>
                  <p>
                    Đại lý <strong>Hyundai Dũng Lạc (Hyundai Vinh)</strong> xin gửi tới quý khách hàng chương trình ưu đãi đặc biệt và bảng giá chi tiết cập nhật mới nhất. Với cam kết mang đến sản phẩm chính hãng với mức chiết khấu tốt nhất khu vực miền Trung, chúng tôi luôn sẵn sàng hỗ trợ quý khách từ khâu lái thử đến khi bàn giao xe tận nhà.
                  </p>

                  {/* Block 1: Callout Lời khuyên tư vấn */}
                  <CalloutBlock
                    type="info"
                    title="Mẹo Tiết Kiệm Chi Phí Khi Mua Xe"
                    content="Đặt cọc trong tuần lễ vàng để nhận ngay gói bảo hiểm vật chất 1 năm chính hãng cùng bộ quà tặng phụ kiện dán phim cách nhiệt cao cấp trị giá 15.000.000đ."
                  />

                  {/* Block 2: Bảng giá niêm yết & Lăn bánh (PriceTableBlock) */}
                  {post.prices && post.prices.length > 0 && (
                    <div className="my-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Bảng Giá & Chi Phí Lăn Bánh Tham Khảo (Tháng 09/2026)
                      </h3>
                      <PriceTableBlock
                        carName="Hyundai 2026"
                        headline="Bảng Giá Xe Hyundai Mới Nhất Tại TP. Vinh"
                        versions={post.prices.map((p) => ({
                          name: p.version,
                          price: p.listedPrice,
                          promotionalPrice: p.listedPrice - p.discount,
                          onRoadPriceEstimate: p.rollingPrice,
                        }))}
                      />
                    </div>
                  )}

                  <p>
                    Tất cả các dòng xe bán ra tại Hyundai Vinh đều được áp dụng chính sách bảo hành chính hãng 5 năm hoặc 100.000 km (tùy điều kiện nào đến trước). Đội ngũ kỹ thuật viên tay nghề cao được đào tạo bài bản theo tiêu chuẩn Hyundai Motor Company toàn cầu.
                  </p>

                  {/* Block 3: Xe Liên Quan (RelatedCarBlock) */}
                  <div className="my-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Mẫu Xe Được Quan Tâm Nhiều Nhất
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <RelatedCarBlock
                        carSlug="hyundai-accent"
                        tenXe="Hyundai Accent 2026"
                        giaNiemYetTu={439000000}
                        anhDaiDienUrl="/images/cars/accent.webp"
                        seatCount={5}
                        fuelType="Xăng 1.5L"
                      />
                      <RelatedCarBlock
                        carSlug="hyundai-creta"
                        tenXe="Hyundai Creta 2026"
                        giaNiemYetTu={599000000}
                        anhDaiDienUrl="/images/cars/creta.webp"
                        seatCount={5}
                        fuelType="Xăng 1.5L Smartstream"
                      />
                    </div>
                  </div>

                  {/* Block 4: Inline Lead Form (Đăng ký nhận báo giá trong bài viết) */}
                  <div className="my-8">
                    <InlineQuickForm
                      headline="Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay"
                      subheadline="Để lại thông tin, chuyên viên tư vấn sẽ gửi bảng tính chi phí lăn bánh chính xác và số tiền trả góp hàng tháng qua Zalo trong 5 phút."
                      buttonText="Gửi Báo Giá Ngay"
                      carName="Hyundai Accent / Creta"
                    />
                  </div>

                  {/* Block 5: Câu hỏi thường gặp (FAQBlock) */}
                  {post.faqs && post.faqs.length > 0 && (
                    <div className="my-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">
                        Giải Đáp Thắc Mắc Thường Gặp
                      </h3>
                      <FAQBlock
                        title="Câu Hỏi Khách Hàng Quan Tâm Khi Mua Xe"
                        questions={post.faqs}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tags bài viết */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-slate-400 mr-1" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Từ khóa:</span>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tin-tuc?q=${encodeURIComponent(tag.tenTag)}`}
                      className="inline-block px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-md text-xs font-medium transition-colors"
                    >
                      #{tag.tenTag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Chân Tác Giả E-E-A-T Chuẩn Google & Inbound Contact */}
            <EeatAuthorBox
              author={
                post.author
                  ? {
                      fullName: post.author.fullName,
                      role: post.author.role,
                      avatarUrl: post.author.avatarUrl,
                      phone: post.author.phone,
                    }
                  : null
              }
              postTitle={post.tieuDe}
              className="mt-8"
            />
          </section>

          {/* CỘT PHẢI: CONVERSION SIDEBAR (4 CỘT) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Mục Lục Bài Viết Thông Minh (StickyToc Client Island) */}
            <StickyToc className="mb-2" />

            {/* Khung Tư Vấn Trực Tiếp 24/7 */}
            <Card className="p-6 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white rounded-2xl border-none shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block px-2.5 py-1 bg-blue-500/20 text-blue-300 text-[11px] font-semibold tracking-wider uppercase rounded-md mb-3">
                  Hỗ Trợ Khách Hàng 24/7
                </span>
                <h3 className="text-xl font-bold mb-2">Đăng Ký Tư Vấn & Lái Thử Tại Nhà</h3>
                <p className="text-xs text-blue-200 leading-relaxed mb-5">
                  Trải nghiệm trực tiếp các dòng xe Hyundai mới nhất tại nhà riêng hoặc cơ quan hoàn toàn miễn phí.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:0941000000"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all motion-reduce:transition-none"
                  >
                    <Phone className="w-4 h-4 animate-pulse motion-reduce:animate-none" />
                    Hotline: 0941.000.000
                  </a>
                  <a
                    href="https://zalo.me/0941000000"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 transition-colors"
                  >
                    Nhắn Zalo Tư Vấn Miễn Phí
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cam kết giá tốt nhất
                  </span>
                  <span>Duyệt hồ sơ 24h</span>
                </div>
              </div>
            </Card>

            {/* Khung Khuyến Mãi Nổi Bật */}
            <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Chính Sách Ưu Đãi Đặc Biệt
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Giảm 50% đến 100% lệ phí trước bạ cho xe lắp ráp trong nước.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Tặng phụ kiện cao cấp: Dán phim Lummax, lót sàn da 6D, camera hành trình.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Hỗ trợ trả góp lãi suất 0% trong 6 tháng đầu hoặc cố định 8 năm.</span>
                </li>
              </ul>
            </Card>

            {/* Nút Quay Lại Danh Sách */}
            <div className="text-center pt-2">
              <Link
                href="/tin-tuc"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Xem tất cả bài viết tin tức khác
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* 4. Client Islands: Thanh điều hướng đáy Mobile & Banner trượt góc Exit-Intent */}
      <PostBottomBar
        phone="0941.000.000"
        zaloPhone="0941000000"
        categorySlug={post.category?.slug || ''}
        carName="Hyundai"
      />
      <SlideInBanner
        postId={post.id}
        carName="Hyundai"
        utmSource={`post_${post.slug}`}
      />
    </article>
  );
}
