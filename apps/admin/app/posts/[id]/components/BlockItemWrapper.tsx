'use client';

// 🧠 Mental Model: Khung bao bọc khối nội dung (BlockItemWrapper).
// 1. Phù hợp 100% với Design System của Admin Shell (#0b0f17, glassmorphism, border-white/10).
// 2. Tự động áp dụng theme viền và màu nhấn riêng biệt cho Callout Box (info, warning, success, note).
// 3. Tích hợp thanh Action Controls chuẩn UI: Di chuyển lên, Di chuyển xuống, Xóa khối với @cardealer/ui.

import React, { useState } from 'react';
import { MoveUp, MoveDown, Trash2, Sparkles, ChevronDown } from 'lucide-react';
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
  onAiGenerate?: (customInstruction?: string) => void;
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
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

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
            <div className="flex items-center mr-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onAiGenerate(customPrompt || undefined)}
                disabled={isAiGenerating}
                isLoading={isAiGenerating}
                className="h-7 px-2 text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 flex items-center gap-1 border border-amber-500/30 rounded-l-md border-r-0 transition-colors cursor-pointer"
                title="Dùng AI viết/điền dữ liệu chuẩn cho khối này (1-Click)"
              >
                <Sparkles size={12} className="text-amber-400 shrink-0" />
                <span>{isAiGenerating ? 'Đang điền...' : 'AI Điền Khối'}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPromptInput((prev) => !prev)}
                disabled={isAiGenerating}
                className={cn(
                  'h-7 px-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 rounded-r-md transition-colors cursor-pointer',
                  showPromptInput && 'bg-amber-500/20 text-amber-300'
                )}
                title="Tùy biến chỉ đạo cho AI..."
              >
                <ChevronDown size={11} className={cn('transition-transform duration-200', showPromptInput && 'rotate-180')} />
              </Button>
            </div>
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

      {/* Inline Custom AI Prompt Input */}
      {showPromptInput && (
        <div className="flex items-center gap-2 p-2 bg-slate-900/80 border border-amber-500/20 rounded-lg animate-in fade-in duration-200">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`Chỉ đạo riêng cho khối ${block.type} (vd: tập trung vào động cơ, mức tiêu hao nhiên liệu...)`}
            className="flex-1 bg-slate-950/80 text-xs text-slate-200 border border-amber-500/30 rounded px-2.5 py-1.5 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAiGenerate?.(customPrompt || undefined);
                setShowPromptInput(false);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onAiGenerate?.(customPrompt || undefined);
              setShowPromptInput(false);
            }}
            disabled={isAiGenerating}
            isLoading={isAiGenerating}
            className="h-7 text-xs px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shrink-0 cursor-pointer"
          >
            Sinh Khối
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowPromptInput(false)}
            className="h-7 text-xs px-2 text-slate-400 hover:text-slate-200"
          >
            Đóng
          </Button>
        </div>
      )}

      {/* Block Specific Content Form Controls */}
      {children}
    </div>
  );
}
