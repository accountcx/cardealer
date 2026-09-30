'use client';

// 🧠 Mental Model: Thanh công cụ chèn nhanh 14 loại Content Block trực quan chuẩn E-E-A-T.
// 100% sử dụng Button từ @cardealer/ui với icon chỉ báo và màu sắc nhận diện danh mục.

import React from 'react';
import {
  Plus,
  Image as ImageIcon,
  Images,
  SlidersHorizontal,
  MousePointerClick,
  Scale,
  Info,
  Table as TableIcon,
  Car,
  Send,
  FileQuestion,
  Video,
} from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { BlockType } from '../types';

export interface AddBlockMenuProps {
  onAddBlock: (type: BlockType) => void;
}

export function AddBlockMenu({ onAddBlock }: AddBlockMenuProps) {
  return (
    <div className="pt-2 border-t border-white/10">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Chèn nhanh Content Block tinh hoa:
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('paragraph')}
          className="text-xs h-9"
        >
          <Plus size={14} /> Đoạn văn
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('heading')}
          className="text-xs h-9"
        >
          <Plus size={14} /> Tiêu đề H2
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('singleImage')}
          className="text-xs h-9 text-cyan-400 hover:text-cyan-300 border-cyan-500/20"
        >
          <ImageIcon size={14} /> Ảnh & Chú thích
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('imageGallery')}
          className="text-xs h-9 text-purple-400 hover:text-purple-300 border-purple-500/20"
        >
          <Images size={14} /> Thư viện ảnh lướt
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('specTable')}
          className="text-xs h-9 text-amber-400 hover:text-amber-300 border-amber-500/20"
        >
          <SlidersHorizontal size={14} /> So sánh thông số
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('ctaButton')}
          className="text-xs h-9 text-rose-400 hover:text-rose-300 border-rose-500/20"
        >
          <MousePointerClick size={14} /> Nút bấm CTA
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('prosCons')}
          className="text-xs h-9 text-emerald-400 hover:text-emerald-300 border-emerald-500/20"
        >
          <Scale size={14} /> Ưu / Nhược điểm
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('callout')}
          className="text-xs h-9 text-amber-300 hover:text-amber-200"
        >
          <Info size={14} /> Callout Box
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('priceTable')}
          className="text-xs h-9 text-blue-400 hover:text-blue-300 border-blue-500/20"
        >
          <TableIcon size={14} /> Bảng giá xe
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('relatedCar')}
          className="text-xs h-9 text-sky-400 hover:text-sky-300 border-sky-500/20"
        >
          <Car size={14} /> Xe gợi ý
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('leadForm')}
          className="text-xs h-9 text-indigo-400 hover:text-indigo-300 border-indigo-500/20"
        >
          <Send size={14} /> Form báo giá
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('faq')}
          className="text-xs h-9 text-emerald-400 hover:text-emerald-300"
        >
          <FileQuestion size={14} /> FAQ Accordion
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('youtube')}
          className="text-xs h-9 text-red-400 hover:text-red-300"
        >
          <Video size={14} /> YouTube
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddBlock('tiktok')}
          className="text-xs h-9 text-pink-400 hover:text-pink-300"
        >
          <Video size={14} /> TikTok
        </Button>
      </div>
    </div>
  );
}
