'use client';

import React, { useState } from 'react';
import { Check, ImageOff, Eye, ExternalLink } from 'lucide-react';
import type { MediaItem } from '@cardealer/types';

// 🧠 Mental Model: Thẻ ảnh đơn lẻ trong Thư Viện Media.
// - Hiển thị ảnh vuông sắc nét kèm Image Fallback nếu ảnh hỏng.
// - Checkbox độc lập để phục vụ chọn nhiều ảnh (Batch operations).
// - Badge định dạng (WEBP, PNG, JPG...) và dung lượng tệp.
// - Bấm vào thẻ để mở Drawer xem chi tiết và chỉnh sửa Alt Text.

export interface MediaCardProps {
  media: MediaItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
  onClick?: (media: MediaItem) => void;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function MediaCard({
  media,
  isSelected = false,
  onToggleSelect,
  onClick,
}: MediaCardProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      onClick={() => onClick?.(media)}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-slate-900 cursor-pointer ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/30 dark:border-indigo-500'
          : 'border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800/60">
        {hasError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500">
            <ImageOff className="h-7 w-7 stroke-1" />
            <span className="text-[11px] font-medium">Không thể tải ảnh</span>
          </div>
        ) : (
          <img
            src={media.url}
            alt={media.altText || media.filename}
            onError={() => setHasError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-slate-950/40" />

        {/* Checkbox chọn ảnh (Top Left) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(media.id, e);
          }}
          className={`absolute top-2.5 left-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
            isSelected
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
              : 'border-slate-300/80 bg-white/90 text-transparent hover:border-indigo-400 group-hover:opacity-100 opacity-70 backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/90'
          }`}
          role="checkbox"
          aria-checked={isSelected}
          title={isSelected ? 'Bỏ chọn' : 'Chọn ảnh'}
        >
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        </div>

        {/* Format Badge (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center rounded-md bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
            {media.format || media.mimeType.split('/')[1] || 'IMG'}
          </span>
        </div>

        {/* Quick View Icon (Center on hover) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-xs">
            <Eye className="h-3.5 w-3.5" />
            Chi tiết
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <p
          className="truncate text-xs font-medium text-slate-800 dark:text-slate-200"
          title={media.filename}
        >
          {media.filename}
        </p>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{formatBytes(media.fileSize)}</span>
          {media.width && media.height ? (
            <span>
              {media.width}×{media.height}
            </span>
          ) : (
            <span className="capitalize">{media.folder || 'media'}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton cho MediaCard
 */
export function MediaCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-4/3 w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex justify-between">
          <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-2.5 w-1/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
