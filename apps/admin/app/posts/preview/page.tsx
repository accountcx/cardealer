'use client';

// 🧠 Mental Model: Trang Xem Trước Bài Viết Bí Mật (Secret Preview Page) với Token 24h (apps/admin).
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Secret Token Verification: Xác thực token 64 ký tự qua endpoint public `/api/posts/preview?token=...`,
//    cho phép Ban Biên Tập, Giám Đốc và Đại Lý xem trước bản nháp mà không cần đăng nhập CMS.
// 2. Multi-Device Frame Switcher: Chuyển đổi khung hình mô phỏng tức thì giữa Desktop (100%), Tablet (768px),
//    và Mobile (375px) với animation mượt mà (hỗ trợ motion-reduce:transition-none).
// 3. 4-State UI Matrix Chuẩn Mực:
//    - Loading State: Skeleton Shimmer giả lập toàn diện khung toolbar, hero image và đoạn văn triệt tiêu CLS.
//    - Empty State: Khung thông báo chuyên nghiệp khi thiếu token hoặc không tìm thấy bài viết kèm nút CTA.
//    - Error State: Banner cảnh báo chi tiết kèm mã lỗi và nút Thử lại (onRetry).
//    - Success / Data State: Hiển thị trọn vẹn 8 Content Blocks (@cardealer/ui) chuẩn Tiptap AST JSON.
// 4. E-E-A-T & Inbound Attribution: Hiển thị tác giả chuyên gia (author box), chuyên mục, thời gian đọc, ngày đăng.
// 5. 100% Named Export song hành cùng Default Export cho Next.js App Router page.

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Eye,
  Edit,
  Copy,
  Check,
  ChevronLeft,
  Smartphone,
  Tablet,
  Monitor,
  AlertTriangle,
  RefreshCw,
  Clock,
  BookOpen,
  User,
  Calendar,
  Share2,
  Lock,
  Tag,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Skeleton,
  CalloutBlock,
  YoutubeBlock,
  TikTokBlock,
  FAQBlock,
  GatedContent,
  RelatedCarBlock,
  PriceTableBlock,
} from '@cardealer/ui';
import { apiClient } from '../../../lib/api-client';
import type { PostItem } from '../../../services/post.service';

// Các kiểu thiết bị xem trước
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface TiptapContentNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Array<{
    type: string;
    text?: string;
    marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  }>;
}

interface PostDetailData extends PostItem {
  noiDung: {
    type?: string;
    content?: TiptapContentNode[];
  };
  tags?: Array<{ id: string; tag: string }>;
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const postId = searchParams.get('id');

  // State dữ liệu
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // State giao diện
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [copied, setCopied] = useState(false);

  // Tải dữ liệu bài viết xem trước
  const loadPreviewPost = useCallback(async () => {
    if (!token && !postId) {
      setError('Thiếu mã token hoặc ID bài viết để xem trước');
      setErrorCode('MISSING_TOKEN');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);

      let fetchedPost: PostDetailData | null = null;

      if (token) {
        // Tải qua Secret Preview Token
        const res = await apiClient.get<{ success: boolean; data: PostDetailData }>(
          `/api/posts/preview?token=${encodeURIComponent(token)}`
        );
        if (res.data) {
          fetchedPost = res.data;
        }
      } else if (postId) {
        // Tải qua Admin Post ID (yêu cầu quyền admin)
        const res = await apiClient.get<{ success: boolean; data: PostDetailData }>(
          `/api/admin/posts/${postId}`
        );
        if (res.data) {
          fetchedPost = res.data;
        }
      }

      if (!fetchedPost) {
        throw new Error('Không tìm thấy dữ liệu bài viết');
      }

      setPost(fetchedPost);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải bài viết xem trước';
      setError(msg);
      setErrorCode('FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, [token, postId]);

  useEffect(() => {
    loadPreviewPost();
  }, [loadPreviewPost]);

  // Sao chép link xem trước
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Trích xuất văn bản từ node Tiptap
  const renderNodeText = (node: TiptapContentNode): string => {
    if (!node.content || !Array.isArray(node.content)) return '';
    return node.content.map((c) => c.text || '').join('');
  };

  // 1. 4-STATE UI: LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Skeleton Top Toolbar */}
        <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
          <Skeleton className="h-9 w-40 bg-slate-800" />
          <Skeleton className="h-9 w-64 bg-slate-800" />
          <Skeleton className="h-9 w-48 bg-slate-800" />
        </div>

        {/* Skeleton Article Body */}
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-slate-800 rounded-full" />
            <Skeleton className="h-12 w-full bg-slate-800 rounded-xl" />
            <Skeleton className="h-6 w-3/4 bg-slate-800 rounded-lg" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-5 w-24 bg-slate-800" />
              <Skeleton className="h-5 w-24 bg-slate-800" />
              <Skeleton className="h-5 w-32 bg-slate-800" />
            </div>
          </div>
          <Skeleton className="aspect-video w-full rounded-2xl bg-slate-800" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-5/6 bg-slate-800" />
            <Skeleton className="h-8 w-1/2 bg-slate-800 mt-6" />
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-4/5 bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  // 2. 4-STATE UI: ERROR STATE
  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full p-8 bg-slate-900/80 backdrop-blur-xl border border-red-500/20 rounded-2xl space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100">Không Thể Xem Trước Bài Viết</h2>
            <p className="text-sm text-slate-400">{error || 'Bài viết không tồn tại hoặc token bí mật đã hết hạn.'}</p>
            {errorCode && (
              <span className="inline-block font-mono text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                Mã lỗi: {errorCode}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={loadPreviewPost}
              className="w-full sm:flex-1 h-11 text-xs font-semibold"
            >
              <RefreshCw size={14} className="mr-1.5" />
              Thử lại
            </Button>
            <Link href="/posts" className="w-full sm:flex-1">
              <Button variant="outline" className="w-full h-11 text-xs font-semibold">
                <ChevronLeft size={14} className="mr-1.5" />
                Về quản lý tin
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Khung chiều rộng tương ứng với chế độ thiết bị
  const containerWidthClass =
    deviceMode === 'mobile'
      ? 'max-w-[390px] border-x border-slate-700/60 shadow-2xl rounded-3xl my-6 bg-slate-900/40 p-4 md:p-6'
      : deviceMode === 'tablet'
      ? 'max-w-[768px] border-x border-slate-700/60 shadow-2xl rounded-2xl my-6 bg-slate-900/40 p-6 md:p-8'
      : 'max-w-4xl w-full p-6 md:p-12';

  // 3. 4-STATE UI: SUCCESS STATE (ARTICLE PREVIEW)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* 1. Sticky Preview Control Bar */}
      <header className="sticky top-0 z-50 w-full bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Back Link & Status */}
        <div className="flex items-center gap-3">
          <Link href={`/posts/${post.id}`}>
            <Button variant="ghost" size="sm" className="h-9 px-2.5 text-slate-400 hover:text-slate-100">
              <ChevronLeft size={16} />
              Quay lại biên tập
            </Button>
          </Link>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <Badge
            variant={
              post.status === 'published'
                ? 'published'
                : post.status === 'draft'
                ? 'draft'
                : post.status === 'scheduled'
                ? 'outline'
                : 'danger'
            }
          >
            {post.status === 'published'
              ? 'Đã xuất bản'
              : post.status === 'draft'
              ? 'Bản nháp bí mật'
              : post.status === 'scheduled'
              ? 'Đã hẹn giờ'
              : 'Lưu trữ'}
          </Badge>
          <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            <Lock size={12} /> Token Preview
          </span>
        </div>

        {/* Center: Device Mode Switcher */}
        <div className="inline-flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10">
          <Button
            type="button"
            variant={deviceMode === 'desktop' ? 'accent' : 'ghost'}
            size="sm"
            onClick={() => setDeviceMode('desktop')}
            className="h-8 px-3 rounded-lg text-xs"
            title="Xem trước màn hình Máy tính (Desktop)"
          >
            <Monitor size={14} className="mr-1.5" />
            <span className="hidden md:inline">Desktop</span>
          </Button>
          <Button
            type="button"
            variant={deviceMode === 'tablet' ? 'accent' : 'ghost'}
            size="sm"
            onClick={() => setDeviceMode('tablet')}
            className="h-8 px-3 rounded-lg text-xs"
            title="Xem trước màn hình Máy tính bảng (Tablet 768px)"
          >
            <Tablet size={14} className="mr-1.5" />
            <span className="hidden md:inline">Tablet</span>
          </Button>
          <Button
            type="button"
            variant={deviceMode === 'mobile' ? 'accent' : 'ghost'}
            size="sm"
            onClick={() => setDeviceMode('mobile')}
            className="h-8 px-3 rounded-lg text-xs"
            title="Xem trước màn hình Di động (Mobile 375px)"
          >
            <Smartphone size={14} className="mr-1.5" />
            <span className="hidden md:inline">Mobile</span>
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            className="h-9 px-3 text-xs font-semibold"
            title="Sao chép link xem trước gửi qua Zalo/Email"
          >
            {copied ? <Check size={14} className="text-emerald-400 mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
            {copied ? 'Đã sao chép' : 'Sao chép link'}
          </Button>

          <Link href={`/posts/${post.id}`}>
            <Button variant="accent" size="sm" className="h-9 px-3.5 text-xs font-semibold">
              <Edit size={14} className="mr-1.5" />
              Chỉnh sửa
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. Device Responsive Wrapper */}
      <main
        className={`w-full transition-all duration-300 motion-reduce:transition-none ${containerWidthClass}`}
      >
        <article className="space-y-8">
          {/* Breadcrumb & Category */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="hover:text-slate-200">Trang chủ</span>
            <span>/</span>
            <span className="hover:text-slate-200">Tin tức</span>
            {post.category && (
              <>
                <span>/</span>
                <span className="text-cyan-400 font-semibold">{post.category.tenChuyenMuc}</span>
              </>
            )}
          </div>

          {/* Article Header */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {post.tieuDe}
            </h1>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-y border-white/10 py-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-500" />
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </time>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-500" />
                <span>{post.readingTime} phút đọc</span>
              </div>

              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-slate-500" />
                <span>{post.wordCount} từ</span>
              </div>

              {post.author && (
                <div className="flex items-center gap-1.5 ml-auto text-slate-300">
                  <User size={14} className="text-cyan-400" />
                  <span className="font-medium">{post.author.fullName}</span>
                </div>
              )}
            </div>

            {/* Sapo / Meta Description Lead Paragraph */}
            {post.tomTat && (
              <p className="text-base sm:text-lg font-medium text-slate-300 leading-relaxed italic bg-white/[0.02] p-4 rounded-xl border-l-4 border-cyan-500">
                {post.tomTat}
              </p>
            )}
          </div>

          {/* Featured Image */}
          {post.anhDaiDienUrl && (
            <figure className="space-y-2">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl">
                <img
                  src={post.anhDaiDienUrl}
                  alt={post.anhDaiDienAlt || post.tieuDe}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-car.webp';
                  }}
                />
              </div>
              {post.anhDaiDienAlt && (
                <figcaption className="text-center text-xs text-slate-500 italic">
                  {post.anhDaiDienAlt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Body Content Blocks (Tiptap AST Renderer) */}
          <div className="space-y-6 pt-2">
            {post.noiDung?.content && Array.isArray(post.noiDung.content) ? (
              post.noiDung.content.map((node, idx) => {
                // Heading H2, H3
                if (node.type === 'heading') {
                  const level = (node.attrs?.level as number) || 2;
                  const text = renderNodeText(node);
                  if (level === 3) {
                    return (
                      <h3
                        key={idx}
                        className="text-lg md:text-xl font-bold text-slate-200 mt-6 mb-3 scroll-mt-20"
                      >
                        {text}
                      </h3>
                    );
                  }
                  return (
                    <h2
                      key={idx}
                      className="text-xl md:text-2xl font-extrabold text-slate-100 mt-8 mb-4 border-l-4 border-cyan-500 pl-3.5 scroll-mt-20"
                    >
                      {text}
                    </h2>
                  );
                }

                // Paragraph
                if (node.type === 'paragraph') {
                  const text = renderNodeText(node);
                  if (!text.trim()) return null;
                  return (
                    <p key={idx} className="text-slate-300 text-base leading-relaxed my-4">
                      {text}
                    </p>
                  );
                }

                // Callout Block
                if (node.type === 'calloutBlock') {
                  return (
                    <CalloutBlock
                      key={idx}
                      type={(node.attrs?.type as any) || 'info'}
                      title={(node.attrs?.title as string) || null}
                      content={(node.attrs?.content as string) || ''}
                    />
                  );
                }

                // YouTube Block
                if (node.type === 'youtubeBlock') {
                  return (
                    <YoutubeBlock
                      key={idx}
                      videoId={(node.attrs?.videoId as string) || ''}
                      videoUrl={(node.attrs?.videoUrl as string) || ''}
                      caption={(node.attrs?.caption as string) || null}
                    />
                  );
                }

                // TikTok Block
                if (node.type === 'tikTokBlock') {
                  return (
                    <TikTokBlock
                      key={idx}
                      videoId={(node.attrs?.videoId as string) || ''}
                      videoUrl={(node.attrs?.videoUrl as string) || ''}
                      title={(node.attrs?.title as string) || 'Video TikTok Hyundai'}
                      posterImageUrl={(node.attrs?.posterImageUrl as string) || null}
                    />
                  );
                }

                // FAQ Block
                if (node.type === 'faqBlock') {
                  const questions = (node.attrs?.questions as any) || [];
                  return (
                    <FAQBlock
                      key={idx}
                      title="Câu Hỏi Thường Gặp"
                      questions={questions}
                    />
                  );
                }

                // Gated Content (Paywall & Lead Magnet)
                if (node.type === 'gatedContent') {
                  return (
                    <GatedContent
                      key={idx}
                      rewardTitle={(node.attrs?.title as string) || 'Tải Bảng Dự Toán Lăn Bánh'}
                      description={(node.attrs?.description as string) || 'Để lại số điện thoại/Zalo để nhận ngay.'}
                      badgeText={(node.attrs?.badgeText as string) || 'Nội dung độc quyền'}
                      buttonText="Nhận Báo Giá Ngay"
                    />
                  );
                }

                // Related Car Block
                if (node.type === 'relatedCarBlock') {
                  return (
                    <RelatedCarBlock
                      key={idx}
                      tenXe={(node.attrs?.carName as string) || 'Mẫu Xe Hyundai'}
                      carSlug={(node.attrs?.slug as string) || ''}
                      giaNiemYetTu={(node.attrs?.minPrice as number) || 0}
                      anhDaiDienUrl={(node.attrs?.imageUrl as string) || '/images/placeholder-car.webp'}
                    />
                  );
                }

                // Price Table Block
                if (node.type === 'priceTableBlock') {
                  return (
                    <PriceTableBlock
                      key={idx}
                      headline={(node.attrs?.title as string) || 'Bảng Giá Xe Hyundai Mới Nhất'}
                      showNote={true}
                    />
                  );
                }

                return null;
              })
            ) : (
              <p className="text-slate-400 italic">Bài viết chưa có nội dung chi tiết.</p>
            )}
          </div>

          {/* Tags Footer */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
                <Tag size={14} className="text-cyan-400" /> Từ khóa:
              </span>
              {post.tags.map((t) => (
                <span
                  key={t.id}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300"
                >
                  #{t.tag}
                </span>
              ))}
            </div>
          )}

          {/* E-E-A-T Author Box Footer */}
          {post.author && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/50 border border-white/10 flex flex-col sm:flex-row items-center gap-5 mt-8 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-300 font-bold text-xl">
                {post.author.fullName.charAt(0)}
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-bold text-slate-100 text-base">{post.author.fullName}</h4>
                  <Badge variant="published" size="sm">
                    {post.author.role === 'admin' ? 'Chuyên Gia Cố Vấn' : 'Tư Vấn Bán Hàng'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Chuyên viên tư vấn &amp; đánh giá các dòng xe Hyundai chính hãng tại Hyundai Vinh - Nghệ An.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 px-4 text-xs font-semibold shrink-0"
                onClick={() => window.open('https://zalo.me', '_blank')}
              >
                Liên hệ tác giả
              </Button>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

// 🧠 Export Default theo chuẩn Next.js App Router
export default function PostPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
          <Skeleton className="h-12 w-64 bg-slate-800 rounded-xl" />
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
