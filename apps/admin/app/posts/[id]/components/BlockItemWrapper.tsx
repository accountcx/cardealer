'use client';

// 🧠 Mental Model: Khung bao bọc khối nội dung (BlockItemWrapper).
// 1. Phù hợp 100% với Design System của Admin Shell (#0b0f17, glassmorphism, border-white/10).
// 2. Tự động áp dụng theme viền và màu nhấn riêng biệt cho Callout Box (info, warning, success, note).
// 3. Tích hợp thanh Action Controls chuẩn UI: Di chuyển lên, Di chuyển xuống, Xóa khối với @cardealer/ui.

import React from 'react';
import { MoveUp, MoveDown, Trash2, Sparkles } from 'lucide-react';
import { Button, cn } from '@cardealer/ui';
import type { EditorBlock } from '../types';
import { CALLOUT_THEMES } from '../constants';

export interface BlockItemWrapperProps {
  block: EditorBlock;
  index: number;
  totalBlocks: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAiGenerate?: () => void;
  isAiGenerating?: boolean;
  children: React.ReactNode;
}

export function BlockItemWrapper({
  block,
  index,
  totalBlocks,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAiGenerate,
  isAiGenerating,
  children,
}: BlockItemWrapperProps) {
  const calloutTheme =
    block.type === 'callout'
      ? CALLOUT_THEMES[block.calloutType || 'info'] || CALLOUT_THEMES.info
      : null;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border space-y-3 relative group transition-all',
        calloutTheme
          ? calloutTheme.cardClass
          : 'border-white/10 bg-slate-950/40 hover:border-cyan-500/30'
      )}
    >
      {/* Block Header & Action Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
        <span
          className={cn(
            'font-semibold uppercase tracking-wider flex items-center gap-1.5',
            calloutTheme ? calloutTheme.headerTextClass : 'text-cyan-400'
          )}
        >
          {block.type === 'heading' && `Tiêu đề H${block.level || 2}`}
          {block.type === 'paragraph' && 'Đoạn văn bản'}
          {block.type === 'callout' && (
            <>
              <span>{calloutTheme?.icon}</span>
              <span>Khối hộp ghi chú: {calloutTheme?.label}</span>
            </>
          )}
          {block.type === 'youtube' && 'Video YouTube'}
          {block.type === 'tiktok' && 'Video TikTok'}
          {block.type === 'faq' && 'Khối FAQ (Hỏi Đáp)'}
          {block.type === 'relatedCar' && 'Khối xe gợi ý'}
          {block.type === 'priceTable' && 'Bảng giá lăn bánh'}
          {block.type === 'leadForm' && 'Form thu thập báo giá'}
          {block.type === 'singleImage' && 'Ảnh Đơn & Chú Thích (SEO Alt + Caption)'}
          {block.type === 'imageGallery' && 'Thư Viện Ảnh Lướt (Carousel / Grid)'}
          {block.type === 'specTable' && 'Bảng So Sánh Thông Số Kỹ Thuật'}
          {block.type === 'ctaButton' && 'Nút Kêu Gọi Hành Động (CTA Button)'}
          {block.type === 'prosCons' && 'Khối Ưu / Nhược Điểm (Featured Snippet)'}
        </span>

        <div className="flex items-center gap-1">
          {onAiGenerate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAiGenerate}
              disabled={isAiGenerating}
              isLoading={isAiGenerating}
              className="h-7 px-2 text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 flex items-center gap-1 border border-amber-500/30 rounded-md transition-colors mr-1 cursor-pointer"
              title="Dùng AI viết/điền dữ liệu chuẩn cho khối này"
            >
              <Sparkles size={12} className="text-amber-400 shrink-0" />
              <span>AI Điền Khối Này</span>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-7 w-7 text-slate-500 hover:text-slate-200 disabled:opacity-30"
            title="Di chuyển lên"
          >
            <MoveUp size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === totalBlocks - 1}
            className="h-7 w-7 text-slate-500 hover:text-slate-200 disabled:opacity-30"
            title="Di chuyển xuống"
          >
            <MoveDown size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-7 w-7 text-slate-500 hover:text-red-400 ml-1"
            title="Xóa khối"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Block Specific Content Form Controls */}
      {children}
    </div>
  );
}
