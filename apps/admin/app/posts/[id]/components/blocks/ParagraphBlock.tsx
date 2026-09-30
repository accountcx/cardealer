'use client';

// 🧠 Mental Model: Khối soạn thảo Đoạn văn bản (ParagraphBlock).
// Cung cấp trường Textarea mượt mà, hỗ trợ tự dãn chiều cao theo nội dung.

import React from 'react';
import { Textarea } from '@cardealer/ui';
import type { EditorBlock } from '../../types';

export interface ParagraphBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function ParagraphBlock({ block, onUpdate }: ParagraphBlockProps) {
  return (
    <Textarea
      rows={3}
      value={block.content || ''}
      onChange={(e) => onUpdate({ content: e.target.value })}
      placeholder="Nhập nội dung đoạn văn..."
      className="bg-slate-900 border-white/10 text-slate-100 text-sm"
    />
  );
}
