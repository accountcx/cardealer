'use client';

// 🧠 Mental Model: Khối Thư viện ảnh lướt / Carousel / Grid (ImageGalleryBlock).
// Quản lý tiêu đề bộ sưu tập, chọn kiểu hiển thị (Slider / Grid), và danh sách GalleryImageItemCard.

import React from 'react';
import { Images, Image as ImageIcon, Upload, Plus, Loader2 } from 'lucide-react';
import { Button, Input } from '@cardealer/ui';
import type { EditorBlock } from '../../types';
import { GalleryImageItemCard, type GalleryImageItem } from './GalleryImageItemCard';

export interface ImageGalleryBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
  onOpenMediaPicker: () => void;
  onUploadBatch: (files: FileList | null) => void;
  onUploadSingleAt: (index: number, file: File | null) => void;
  isUploadingBatch: boolean;
  uploadingItemKey: string | null;
}

export function ImageGalleryBlock({
  block,
  onUpdate,
  onOpenMediaPicker,
  onUploadBatch,
  onUploadSingleAt,
  isUploadingBatch,
  uploadingItemKey,
}: ImageGalleryBlockProps) {
  const galleryImages: GalleryImageItem[] = block.galleryImages || [];

  const handleUpdateItem = (index: number, updated: Partial<GalleryImageItem>) => {
    const nextImages = [...galleryImages];
    nextImages[index] = { ...nextImages[index], ...updated };
    onUpdate({ galleryImages: nextImages });
  };

  const handleRemoveItem = (index: number) => {
    const nextImages = [...galleryImages];
    nextImages.splice(index, 1);
    onUpdate({ galleryImages: nextImages });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;
    const nextImages = [...galleryImages];
    const temp = nextImages[index];
    nextImages[index] = nextImages[targetIndex];
    nextImages[targetIndex] = temp;
    onUpdate({ galleryImages: nextImages });
  };

  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (isNaN(fromIndex) || fromIndex === toIndex) return;
    const nextImages = [...galleryImages];
    const [moved] = nextImages.splice(fromIndex, 1);
    nextImages.splice(toIndex, 0, moved);
    onUpdate({ galleryImages: nextImages });
  };

  return (
    <div className="space-y-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-purple-500/20">
      {/* Header bar: Title & Layout selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <label className="text-xs font-semibold text-purple-400 shrink-0 flex items-center gap-1.5">
            <Images size={15} /> Tiêu đề bộ sưu tập:
          </label>
          <Input
            value={block.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Ví dụ: Chùm ảnh ngoại thất & nội thất Hyundai Tucson thực tế..."
            className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs font-semibold flex-1 min-w-0"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Kiểu hiển thị:</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ galleryStyle: 'slider' })}
            className={`h-7 px-2.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              block.galleryStyle !== 'grid'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Slider Vuốt (Mobile)
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ galleryStyle: 'grid' })}
            className={`h-7 px-2.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              block.galleryStyle === 'grid'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Lưới 3 cột
          </Button>
        </div>
      </div>

      {/* Action Toolbar: Count + Batch Upload + Add Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-medium pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-slate-200 font-semibold whitespace-nowrap">
            Danh sách hình ảnh ({galleryImages.length} ảnh)
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline truncate">
            (Khuyến nghị: Đầu xe ➔ Thân xe ➔ Đuôi xe ➔ Nội thất)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenMediaPicker}
            className="h-7 px-2.5 text-xs text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/30 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <ImageIcon size={13} className="shrink-0" />
            <span>Chọn từ Thư Viện</span>
          </Button>

          {/* Tải ảnh từ máy tính đẩy lên Cloudinary */}
          <label
            className={`h-7 px-2.5 text-xs text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/30 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors select-none ${
              isUploadingBatch
                ? 'opacity-60 cursor-not-allowed pointer-events-none'
                : 'cursor-pointer'
            }`}
          >
            {isUploadingBatch ? (
              <Loader2 size={13} className="shrink-0 animate-spin text-purple-400" />
            ) : (
              <Upload size={13} className="shrink-0" />
            )}
            <span>{isUploadingBatch ? 'Đang đẩy lên Cloudinary...' : 'Tải ảnh từ máy'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={isUploadingBatch}
              onChange={(e) => {
                onUploadBatch(e.target.files);
                e.target.value = '';
              }}
            />
          </label>

          {/* Thêm một hàng ảnh trống */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onUpdate({
                galleryImages: [
                  ...galleryImages,
                  { url: '', alt: 'Hình ảnh chi tiết xe', caption: '' },
                ],
              });
            }}
            className="h-7 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 rounded-lg border border-white/10 flex items-center gap-1"
          >
            <Plus size={13} /> Thêm ảnh
          </Button>
        </div>
      </div>

      {/* List of Image Cards */}
      <div className="space-y-3">
        {galleryImages.map((img, imgIdx) => (
          <GalleryImageItemCard
            key={imgIdx}
            img={img}
            imgIdx={imgIdx}
            totalImages={galleryImages.length}
            blockId={block.id}
            isUploading={uploadingItemKey === `${block.id}-${imgIdx}`}
            onMoveUp={() => handleMove(imgIdx, 'up')}
            onMoveDown={() => handleMove(imgIdx, 'down')}
            onRemove={() => handleRemoveItem(imgIdx)}
            onUpdate={(updated) => handleUpdateItem(imgIdx, updated)}
            onUploadSingle={(file) => onUploadSingleAt(imgIdx, file)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(imgIdx));
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
              handleDrop(fromIndex, imgIdx);
            }}
          />
        ))}
      </div>
    </div>
  );
}
