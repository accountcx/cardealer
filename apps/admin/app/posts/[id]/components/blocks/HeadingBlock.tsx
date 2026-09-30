'use client';

// 🧠 Mental Model: Khối soạn thảo Tiêu đề H2/H3 (HeadingBlock).
// Cung cấp lựa chọn cấp độ thẻ (H2, H3) và input tiêu đề in đậm chuẩn SEO.

import React from 'react';
import { Select, Input } from '@cardealer/ui';
import type { EditorBlock } from '../../types';

export interface HeadingBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function HeadingBlock({ block, onUpdate }: HeadingBlockProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0 relative z-20">
        <Select
          variant="dark"
          options={[
            { value: '2', label: 'Thẻ H2' },
            { value: '3', label: 'Thẻ H3' },
          ]}
          value={String(block.level || 2)}
          onChange={(e) => onUpdate({ level: Number(e.target.value) })}
          className="h-10 bg-slate-900 border-white/10 text-slate-200 text-sm"
        />
      </div>
      <div className="flex-1">
        <Input
          value={block.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Tiêu đề đoạn (H2, H3)..."
          className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-bold"
        />
      </div>
    </div>
  );
}
