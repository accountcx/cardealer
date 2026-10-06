'use client';

// 🧠 Mental Model: Khối soạn thảo Tiêu đề H2/H3 (HeadingBlock).
// Cung cấp lựa chọn cấp độ thẻ (H2, H3), input tiêu đề in đậm chuẩn SEO,
// và cơ chế Opt-out (ignore-toc) cho phép ẩn tiêu đề khỏi Mục lục để giữ TOC tinh gọn (5-7 ý chính).

import React from 'react';
import { EyeOff, ListTree } from 'lucide-react';
import { Select, Input, Button } from '@cardealer/ui';
import type { EditorBlock } from '../../types';

export interface HeadingBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function HeadingBlock({ block, onUpdate }: HeadingBlockProps) {
  const isIgnored = Boolean(block.ignoreToc);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="w-full sm:w-32 shrink-0 relative z-20">
          <Select
            variant="dark"
            options={[
              { value: '2', label: 'Thẻ H2 (Ý chính)' },
              { value: '3', label: 'Thẻ H3 (Ý phụ)' },
            ]}
            value={String(block.level || 2)}
            onChange={(e) => onUpdate({ level: Number(e.target.value) })}
            className="h-10 bg-slate-900 border-white/10 text-slate-200 text-sm font-medium"
          />
        </div>

        <div className="flex-1">
          <Input
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Tiêu đề đoạn (H2, H3)..."
            className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-bold placeholder:text-slate-600 focus-visible:ring-blue-500/30"
          />
        </div>

        {/* Nút bấm Opt-out: Ẩn / Hiện khỏi Mục lục (ignore-toc) */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onUpdate({ ignoreToc: !isIgnored })}
          className={`h-10 px-3 shrink-0 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isIgnored
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-500/60'
              : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={
            isIgnored
              ? 'Tiêu đề này đang được ẨN khỏi Mục lục (TOC)'
              : 'Bấm để ẨN tiêu đề này khỏi Mục lục (TOC)'
          }
        >
          {isIgnored ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Đã ẩn khỏi TOC</span>
            </>
          ) : (
            <>
              <ListTree className="w-3.5 h-3.5 text-slate-400" />
              <span>Hiện trên TOC</span>
            </>
          )}
        </Button>
      </div>

      {isIgnored && (
        <p className="text-[11px] text-amber-400/90 flex items-center gap-1 italic pl-1">
          <span>ℹ️</span> Tiêu đề này được gắn class <code>ignore-toc</code> và sẽ không hiển thị trên Mục lục để giữ TOC tinh gọn.
        </p>
      )}
    </div>
  );
}
