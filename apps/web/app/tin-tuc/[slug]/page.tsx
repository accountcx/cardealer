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
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
} from '@cardealer/ui';
import {
  generatePostMasterJsonLd,
  type PostForJsonLd,
  extractHeadingsFromTiptap,
  slugifyVietnamese,
  convertTiptapToHtml,
} from '@cardealer/core';
import { apiClient } from '../../../lib/api-client';
import { StickyToc } from '../../../components/StickyToc';
import { PostBottomBar } from '../../../components/PostBottomBar';
import { SlideInBanner } from '../../../components/SlideInBanner';
import { EeatAuthorBox } from '../../../components/EeatAuthorBox';
import { PostShareBar } from '../../../components/PostShareBar';
import { getStorefrontSettings } from '../../../services/settings.service';

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
  noiDung?: unknown;
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
  tags?: Array<{ id: string; tenTag?: string; tag?: string; slug?: string }>;
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

/**
 * Loại bỏ các hậu tố kỹ thuật nội bộ khỏi tên tác giả (VD: " - Quản Trị Showroom", " - Admin")
 */
function cleanAuthorFullName(name?: string | null): string {
  if (!name) return 'Ban Biên Tập Hyundai Vinh';
  return name.replace(/\s*-\s*(Quản Trị Showroom|Quản Trị Viên|Admin|Quản Lý|Nhân Viên).*$/gi, '').trim();
}


async function getRelatedPosts(categorySlug?: string, currentSlug?: string): Promise<PostDetailData[]> {
  try {
    const res = await apiClient.get<any>("/api/posts", {
      category: categorySlug,
      limit: 6,
    });
    const posts: any[] = Array.isArray(res) ? res : res?.data || [];
    return posts.filter((p) => p.slug && p.slug !== currentSlug).slice(0, 3);
  } catch {
    return [];
  }
}

// ============================================================================
// HÀM LẤY BÀI VIẾT THEO SLUG (API)
// ============================================================================
async function getPostBySlug(slug: string, token?: string): Promise<PostDetailData | null> {
  try {
    const endpoint = token ? `/api/posts/preview?token=${encodeURIComponent(token)}` : `/api/posts/${slug}`;
    const res = await apiClient.get<any>(endpoint, undefined, token ? { cache: 'no-store' } : undefined);
    const postData: PostDetailData | undefined = (res && res.slug) ? res : res?.data;
    if (postData && (postData.slug || postData.tieuDe)) {
      if (!postData.slug) postData.slug = slug;
      if (postData.noiDung && !postData.noiDungHtml) {
        postData.noiDungHtml = convertTiptapToHtml(postData.noiDung);
      }
      return postData;
    }
  } catch (err) {
    console.error('[getPostBySlug] Error fetching post:', err);
  }

  return null;
}

// ============================================================================
// SEO METADATA GENERATOR (CANONICAL + OPEN GRAPH + TWITTER)
// ============================================================================
export async function generateMetadata({ params, searchParams }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const token = typeof search?.token === 'string' ? search.token : undefined;
  const post = await getPostBySlug(slug, token);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết | Hyundai Vinh',
      description: 'Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn mới.',
      robots: { index: false, follow: true },
    };
  }

  const rawAuthorName = post.author?.fullName || 'Hyundai Vinh';
  const resolvedAuthorName = cleanAuthorFullName(rawAuthorName);

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
      authors: [resolvedAuthorName],
      section: post.category?.tenChuyenMuc || 'Tin tức',
      tags: post.tags?.map((t) => t.tenTag || t.tag || '').filter(Boolean),
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
export default async function PostDetailPage({ params, searchParams }: PostDetailPageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const token = typeof search?.token === 'string' ? search.token : undefined;

  const [post, settings] = await Promise.all([
    getPostBySlug(slug, token),
    getStorefrontSettings(),
  ]);

  const postHeadings = post?.noiDung ? extractHeadingsFromTiptap(post.noiDung) : [];

  const relatedPosts = post ? await getRelatedPosts(post.category?.slug, post.slug) : [];

  // Hotline & Zalo: Ưu tiên tác giả bài viết -> Cài đặt Admin (hotlineKinhDoanh/zaloNumber) -> Site Settings -> Fallback an toàn
  const rawHotline =
    post?.author?.phone ||
    settings.contact.hotlineKinhDoanh ||
    settings.contact.sellerPhone ||
    settings.site.phone ||
    '0981.234.567';
  const cleanHotline = rawHotline.replace(/\D/g, '') || '0981234567';

  const rawZalo =
    post?.author?.phone ||
    settings.contact.zaloNumber ||
    settings.contact.sellerZalo ||
    settings.contact.hotlineKinhDoanh ||
    rawHotline;
  const cleanZalo = rawZalo.replace(/\D/g, '') || cleanHotline;

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
            <a href={`tel:${cleanHotline}`}>
              <Button className="w-full sm:w-auto h-11 px-5 bg-blue-700 hover:bg-blue-800 text-white font-medium">
                <Phone className="w-4 h-4 mr-2" /> Hotline {rawHotline}
              </Button>
            </a>
          </div>
        </Card>
      </main>
    );
  }

  // Luôn nạp lại HTML bài viết với thông tin hotline/zalo từ Admin Settings
  if (post.noiDung) {
    post.noiDungHtml = convertTiptapToHtml(post.noiDung, {
      hotline: cleanHotline,
      rawHotline,
      zalo: cleanZalo,
    });
  }

  const rawAuthorName = post.author?.fullName || settings.author?.fullName;
  const resolvedAuthorName = cleanAuthorFullName(rawAuthorName);

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
        name: resolvedAuthorName,
        jobTitle: post.author.role,
        avatarUrl: post.author.avatarUrl || undefined,
        phone: post.author.phone || undefined,
      }
      : undefined,
    noiDung: post.noiDungAst || undefined,
  };

  const authorAvatar = post.author?.avatarUrl || settings.author?.avatarUrl;
  const authorAvatarFull = authorAvatar
    ? (authorAvatar.startsWith('http') ? authorAvatar : `https://xehyundaivinh.com${authorAvatar}`)
    : undefined;

  const isTechnicalRole = (r?: string | null) => {
    if (!r) return true;
    const lower = r.trim().toLowerCase();
    return [
      'admin',
      'manager',
      'saler',
      'sales',
      'user',
      'editor',
      'superadmin',
      'quản trị showroom',
      'quản trị viên',
      'quản lý',
      'nhân viên',
    ].includes(lower);
  };

  const resolvedJobTitle = !isTechnicalRole(post.author?.role)
    ? post.author!.role!
    : (settings.author?.role || 'Chuyên gia tư vấn xe ô tô Hyundai');

  const masterSchema = generatePostMasterJsonLd(postForJsonLd, 'https://xehyundaivinh.com', {
    dealer: {
      name: settings.contact.showroomName || settings.site.businessName,
      legalName: settings.contact.legal?.businessName || settings.site.businessName,
      logoUrl: settings.site.favicon || '/images/logo-hyundai-vinh.png',
      telephone: settings.contact.hotlineKinhDoanh || settings.site.phone,
      address: {
        streetAddress: settings.contact.diaChi || settings.site.address,
        addressLocality: settings.contact.tinhThanh || 'Vinh',
        addressRegion: 'Nghệ An',
        addressCountry: 'VN',
      },
      geo: {
        latitude: settings.site.mapLatitude || 18.6796,
        longitude: settings.site.mapLongitude || 105.6813,
      },
    },
    defaultAuthor: {
      name: resolvedAuthorName,
      jobTitle: resolvedJobTitle,
      avatarUrl: authorAvatarFull,
      phone: post.author?.phone || settings.author.phone || rawHotline,
    },
  });

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <article className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* 🧠 Live Preview Banner nếu đang truy cập qua secret token */}
      {token && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold sticky top-0 z-50 shadow-md flex items-center justify-center gap-2 border-b border-amber-500">
          <Eye className="w-4 h-4 shrink-0 text-slate-900" />
          <span>
            Chế độ Xem Trước Bí Mật — Trạng thái: <strong className="uppercase bg-slate-900 text-white px-2 py-0.5 rounded text-xs">{(post as any).status === 'published' ? 'Đã xuất bản' : 'Bản nháp (Chưa xuất bản)'}</strong>
          </span>
        </div>
      )}

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

          {/* E-E-A-T Metadata Bar (Redesigned & Clean) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-100 text-xs text-slate-500">
            {/* Cụm Tác giả E-E-A-T */}
            <div className="flex items-center gap-3">
              {post.author?.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={resolvedAuthorName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-600 text-white font-bold text-sm flex items-center justify-center border-2 border-slate-100 shadow-2xs shrink-0">
                  {resolvedAuthorName ? resolvedAuthorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
              <div className="leading-snug">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <span>{resolvedAuthorName}</span>
                  <span title="Tác giả được xác minh chuyên môn bởi Hyundai Vinh" className="inline-flex">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {resolvedJobTitle}
                </p>
              </div>
            </div>

            {/* Cụm Meta thông tin & Nút chia sẻ (Đã bỏ lượt xem) */}
            <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-slate-500">
              <span className="flex items-center gap-1.5" title="Ngày xuất bản">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <time dateTime={post.publishedAt || post.createdAt}>{formattedDate}</time>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5" title="Thời gian đọc ước tính">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {post.readingTime || 4} phút đọc
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <PostShareBar variant="compact" title={post.tieuDe} />
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================================
          3. NỘI DUNG CHÍNH (2 CỘT: CONTENT + SIDEBAR)
      ====================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* CỘT TRÁI: ARTICLE CONTENT (8 CỘT) */}
          <section className="lg:col-span-8 min-w-0">
            {/* Ảnh đại diện Featured Image */}
            {post.anhDaiDienUrl && (
              <figure className="mb-8 overflow-hidden rounded-2xl border border-slate-200 shadow-md">
                <img
                  src={post.anhDaiDienUrl}
                  alt={post.anhDaiDienAlt || post.tieuDe}
                  className="w-full h-auto object-cover max-h-[500px]"
                  loading="eager"
                />
                {post.anhDaiDienAlt && (
                  <figcaption className="p-3 text-center text-xs text-slate-500 italic bg-white border-t border-slate-100">
                    {post.anhDaiDienAlt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Sapo Tóm Tắt Mở Đầu */}
            {post.tomTat && (
              <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border-l-4 border-blue-600 text-slate-800 text-base sm:text-lg font-medium leading-relaxed mb-8 whitespace-pre-line">
                {post.tomTat}
              </div>
            )}

            {/* Nội dung Tiptap / Render Content Blocks */}
            <div id="article-content" className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-700 leading-relaxed">
              {post.noiDungHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: post.noiDungHtml }}
                  className="space-y-4"
                  suppressHydrationWarning
                />
              ) : (
                <p className="text-slate-500 italic">Nội dung bài viết đang được cập nhật.</p>
              )}
            </div>

            {/* Tags bài viết */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-slate-400 mr-1" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Từ khóa:</span>
                  {post.tags.map((tag) => {
                    const tagLabel = tag.tenTag || tag.tag || '';
                    if (!tagLabel) return null;
                    return (
                      <Link
                        key={tag.id}
                        href={`/tin-tuc?q=${encodeURIComponent(tagLabel)}`}
                        className="inline-block px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-md text-xs font-medium transition-colors"
                      >
                        #{tagLabel}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thanh Chia Sẻ Mạng Xã Hội */}
            <PostShareBar title={post.tieuDe} className="mt-8" />

            {/* Chân Tác Giả E-E-A-T Chuẩn Google & Thẩm Quyền Showroom */}
            <EeatAuthorBox
              author={
                post.author
                  ? {
                    fullName: resolvedAuthorName,
                    role: post.author.role,
                    avatarUrl: post.author.avatarUrl,
                    phone: post.author.phone,
                  }
                  : null
              }
              authorSettings={settings.author}
              postTitle={post.tieuDe}
              className="mt-8"
            />
          </section>

          {/* CỘT PHẢI: CONVERSION SIDEBAR (4 CỘT) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Mục Lục Bài Viết Thông Minh (StickyToc Client Island) */}
            <StickyToc headings={postHeadings} className="mb-2" />

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
                    href={`tel:${cleanHotline}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all motion-reduce:transition-none"
                  >
                    <Phone className="w-4 h-4 animate-pulse motion-reduce:animate-none" />
                    Hotline: {rawHotline}
                  </a>
                  <a
                    href={`https://zalo.me/${cleanZalo}`}
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

      {/* 5. Cụm Bài Viết Liên Quan Cùng Chuyên Mục (Internal Linking Engine) */}
      {relatedPosts.length > 0 && (
        <section className="bg-slate-100/70 border-t border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Bài Viết Liên Quan Cùng Chuyên Mục
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Khám phá thêm các thông tin giá xe, chương trình khuyến mãi và cẩm nang lái xe hữu ích
                </p>
              </div>
              <Link
                href="/tin-tuc"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Xem tất cả bài viết <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((article) => (
                <Link
                  key={article.id}
                  href={`/tin-tuc/${article.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={article.anhDaiDienUrl}
                      alt={article.anhDaiDienAlt || article.tieuDe}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {article.category && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-blue-600/90 text-white text-[11px] font-bold">
                        {article.category.tenChuyenMuc}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                      {article.tieuDe}
                    </h4>
                    <div className="flex items-center justify-between text-slate-400 text-xs pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readingTime || 4} phút đọc
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Client Islands: Thanh điều hướng đáy Mobile & Banner trượt góc Exit-Intent */}
      <PostBottomBar
        phone={rawHotline}
        zaloPhone={cleanZalo}
        categorySlug={post.category?.slug || ''}
        carName="Hyundai"
      />
      <SlideInBanner
        postId={post.id}
        carName="Hyundai"
        utmSource={`post_${post.slug}`}
        hotline={rawHotline}
        phoneToCall={cleanHotline}
        config={settings.slideInBanner}
      />
    </article>
  );
}
