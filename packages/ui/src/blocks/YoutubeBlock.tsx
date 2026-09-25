'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Skeleton } from '../skeleton';

// 🧠 Mental Model: YoutubeBlock là Video Ngang tỉ lệ 16:9 áp dụng mô hình Facade Lazy-Loading.
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Facade Pattern: Chỉ tải ảnh bìa chất lượng cao từ YouTube CDN (hqdefault.jpg) và nút Play ảo khi khởi tạo.
//    Loại bỏ hoàn toàn ~1.2MB scripts/embeds nặng nề (widget_api.js, fonts, metrics), tối ưu hoá LCP và FID/INP.
// 2. 4-State UI Matrix:
//    - Loading State: Khung Skeleton Shimmer aspect-video chống hiện tượng giật layout (CLS).
//    - Empty / Fallback State: Khung thông báo chuyên nghiệp khi thiếu mã videoId.
//    - Data State (Facade View): Ảnh thumbnail sắc nét, overlay gradient và nút Play chuẩn nhận diện.
//    - Active Iframe State: Tự động phát với domain youtube-nocookie.com bảo vệ quyền riêng tư người dùng.
// 3. 100% Named Export: TUYỆT ĐỐI CẤM export default để đảm bảo tree-shaking và auto-import chuẩn.
// 4. Zero Arbitrary Styling & Spacing Scale: Chuẩn Tailwind spacing bội số 4px (h-14, w-20, p-6, my-8), loại bỏ mã màu hex cứng.
// 5. WCAG AAA & Reduced Motion: Toàn bộ transition/transform BẮT BUỘC gắn motion-reduce:transition-none motion-reduce:transform-none.

export interface YoutubeBlockProps {
  videoUrl?: string;
  videoId?: string;
  caption?: string | null;
  isLoading?: boolean;
  className?: string;
}

export function YoutubeBlock({
  videoUrl,
  videoId,
  caption,
  isLoading = false,
  className,
}: YoutubeBlockProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoadingIframe, setIsLoadingIframe] = React.useState(true);

  // 1. 4-STATE UI: LOADING STATE
  if (isLoading) {
    return (
      <figure className={cn('not-prose my-8 mx-auto w-full max-w-3xl font-sans', className)}>
        <Skeleton className="aspect-video w-full rounded-2xl" />
        {caption && <Skeleton className="h-4 w-48 mx-auto mt-2.5 rounded-md" />}
      </figure>
    );
  }

  // 2. 4-STATE UI: EMPTY / FALLBACK STATE
  if (!videoId) {
    return (
      <div
        className={cn(
          'not-prose my-8 mx-auto flex aspect-video w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center font-sans text-slate-400',
          className
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400 mb-3">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
        </div>
        <p className="font-semibold text-sm text-slate-200">
          Chưa có video đánh giá xe
        </p>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">
          Nội dung video trên kênh YouTube chính thức của đại lý sẽ sớm được cập nhật tại đây.
        </p>
      </div>
    );
  }

  // URL thumbnail YouTube chất lượng cao
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  // Embed URL với domain youtube-nocookie bảo vệ quyền riêng tư người dùng
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <figure className={cn('not-prose my-8 mx-auto w-full max-w-3xl font-sans', className)}>
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl',
          'transition-all duration-300 motion-reduce:transition-none'
        )}
      >
        {!isPlaying ? (
          // 3. 4-STATE UI: DATA STATE - FACADE POSTER VIEW (Zero Third-Party JS)
          <div className="relative h-full w-full select-none">
            <img
              src={thumbnailUrl}
              alt={caption || 'Video đánh giá xe Hyundai'}
              loading="lazy"
              className="h-full w-full object-cover"
            />

            {/* Lớp phủ Gradient tối ưu độ tương phản */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

            {/* Nút Play YouTube lớn ở giữa (Touch targets chuẩn 56px x 80px, màu chuẩn red-600) */}
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label={`Phát video YouTube: ${caption || 'Video đánh giá xe'}`}
              className={cn(
                'group absolute inset-0 m-auto flex h-14 w-20 items-center justify-center rounded-2xl',
                'bg-red-600 text-white shadow-xl transition-all duration-200',
                'hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/40',
                'motion-reduce:hover:scale-100 motion-reduce:transition-none'
              )}
            >
              <svg
                className="h-8 w-8 fill-current transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polygon points="9.5 7.5 16.5 12 9.5 16.5 9.5 7.5" />
              </svg>
            </button>
          </div>
        ) : (
          // 4. ACTIVE IFRAME VIEW (Nhúng tự động khi click-to-play)
          <div className="relative h-full w-full bg-black">
            {isLoadingIframe && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-slate-950 text-slate-400">
                <svg
                  className="h-8 w-8 animate-spin text-red-500 motion-reduce:animate-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
                </svg>
                <span className="text-xs">Đang tải video YouTube...</span>
              </div>
            )}
            <iframe
              src={embedUrl}
              title={caption || 'Video YouTube'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIsLoadingIframe(false)}
              className="h-full w-full border-0"
            />
          </div>
        )}
      </div>

      {caption && (
        <figcaption className="mt-2.5 text-center text-xs text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
