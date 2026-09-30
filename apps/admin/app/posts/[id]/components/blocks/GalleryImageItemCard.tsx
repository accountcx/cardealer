'use client';

// 🧠 Mental Model: Thẻ ảnh đơn lẻ trong Bộ sưu tập Thư viện ảnh lướt (GalleryImageItemCard).
// Hỗ trợ kéo thả sắp xếp, đổi ảnh trực tiếp với Cloudinary stream, nhập Alt SEO và Caption.

import React from 'react';
import {
  Upload,
  Loader2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Trash2,
  ImagePlus,
} from 'lucide-react';
import { Button, Input } from '@cardealer/ui';

export interface GalleryImageItem {
  url: string;
  alt?: string;
  caption?: string;
}

export interface GalleryImageItemCardProps {
  img: GalleryImageItem;
  imgIdx: number;
  totalImages: number;
  blockId: string;
  isUploading: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onUpdate: (updated: Partial<GalleryImageItem>) => void;
  onUploadSingle: (file: File | null) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function GalleryImageItemCard({
  img,
  imgIdx,
  totalImages,
  isUploading,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdate,
  onUploadSingle,
  onDragStart,
  onDragOver,
  onDrop,
}: GalleryImageItemCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="p-3 bg-slate-950/80 rounded-xl border border-white/10 hover:border-purple-500/40 transition-all space-y-2 group/img relative"
    >
      <div className="flex items-start gap-3">
        {/* Cột 1: Tay cầm kéo thả ::: + Nút lên/xuống */}
        <div className="flex flex-col items-center justify-center gap-0.5 text-slate-500 pt-1 shrink-0 select-none">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={imgIdx === 0}
            onClick={onMoveUp}
            className="h-6 w-6 text-slate-500 hover:text-purple-300 disabled:opacity-20 p-0"
            title="Di chuyển ảnh lên trước"
          >
            <ChevronUp size={14} />
          </Button>
          <div
            className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-purple-400 transition-colors"
            title="Kéo thả để sắp xếp thứ tự ảnh"
          >
            <GripVertical size={16} />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={imgIdx === totalImages - 1}
            onClick={onMoveDown}
            className="h-6 w-6 text-slate-500 hover:text-purple-300 disabled:opacity-20 p-0"
            title="Di chuyển ảnh xuống sau"
          >
            <ChevronDown size={14} />
          </Button>
          <span className="text-[10px] font-mono text-purple-400 font-bold mt-0.5">
            #{imgIdx + 1}
          </span>
        </div>

        {/* Cột 2: Thumbnail Preview Square */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex flex-col items-center justify-center group/thumb shadow-inner">
          {img.url ? (
            <>
              <img
                src={img.url}
                alt={img.alt || 'Ảnh xem trước'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <label className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium gap-1 text-center p-1 select-none">
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="text-purple-400 animate-spin" />
                    <span className="whitespace-nowrap text-purple-300">Đang tải...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} className="text-purple-400 shrink-0" />
                    <span className="whitespace-nowrap">Đổi ảnh</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onUploadSingle(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer border border-dashed border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/10 rounded-xl p-1 text-center transition-colors select-none">
              {isUploading ? (
                <>
                  <Loader2 size={18} className="text-purple-400 animate-spin mb-0.5" />
                  <span className="text-[10px] text-purple-300 font-medium leading-tight whitespace-nowrap">
                    Đang tải...
                  </span>
                </>
              ) : (
                <>
                  <ImagePlus size={18} className="text-purple-400 mb-0.5 shrink-0" />
                  <span className="text-[10px] text-purple-300 font-medium leading-tight whitespace-nowrap">
                    + Tải ảnh
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onUploadSingle(file);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>

        {/* Cột 3: Trường nhập liệu (Alt Text SEO & Chú thích) */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Alt Text (SEO) *</span>
                <span className="text-[10px] text-emerald-400 font-mono font-normal">
                  Cho Google đọc
                </span>
              </label>
              <Input
                value={img.alt || ''}
                onChange={(e) => onUpdate({ alt: e.target.value })}
                placeholder="Ví dụ: Ngoại thất đầu xe với lưới tản nhiệt tham số..."
                className="h-8 bg-slate-900 border-white/10 text-slate-200 text-xs focus-visible:ring-purple-500/20 focus-visible:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Chú thích (Caption)</span>
                <span className="text-[10px] text-purple-300 font-mono font-normal">
                  Cho khách đọc dưới chân ảnh
                </span>
              </label>
              <Input
                value={img.caption || ''}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                placeholder="Ví dụ: Cụm màn hình kép 12.3 inch hướng về phía người lái..."
                className="h-8 bg-slate-900 border-white/10 text-slate-200 text-xs focus-visible:ring-purple-500/20 focus-visible:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-500 font-mono shrink-0">URL:</span>
            <input
              type="text"
              value={img.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="Dán link ảnh https://... hoặc tải trực tiếp vào ô xem trước"
              className="h-6 w-full bg-slate-900/60 border border-white/5 rounded px-2 text-[11px] text-slate-400 font-mono focus:outline-none focus:border-purple-400 focus:text-slate-200"
            />
          </div>
        </div>

        {/* Nút xóa ảnh */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 text-slate-500 hover:text-red-400 p-0 shrink-0"
          title="Xóa hình ảnh này"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
}
