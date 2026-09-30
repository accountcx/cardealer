'use client';

// 🧠 Mental Model: Khối hộp ghi chú Callout Alert đa phong cách (CalloutBlock).
// Hỗ trợ 4 theme: Info (Thông tin), Warning (Cảnh báo), Success (Ưu đãi), Note (Ghi chú).
// Hiển thị thanh Visual Cue Feedback trực quan báo trước phong cách render trên web ngoài.

import React from 'react';
import { Select, Input, Textarea, cn } from '@cardealer/ui';
import type { EditorBlock } from '../../types';
import { CALLOUT_THEMES } from '../../constants';

export interface CalloutBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function CalloutBlock({ block, onUpdate }: CalloutBlockProps) {
  const theme = CALLOUT_THEMES[block.calloutType || 'info'] || CALLOUT_THEMES.info;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-52 shrink-0 relative z-20">
          <Select
            variant="dark"
            options={[
              { value: 'info', label: 'ℹ️ Thông tin (Info)' },
              { value: 'warning', label: '⚠️ Cảnh báo (Warning)' },
              { value: 'success', label: '🎁 Ưu đãi (Success)' },
              { value: 'note', label: '📝 Ghi chú (Note)' },
            ]}
            value={block.calloutType || 'info'}
            onChange={(e) =>
              onUpdate({
                calloutType: e.target.value as 'info' | 'warning' | 'success' | 'note',
              })
            }
            className={cn('h-10 bg-slate-900 border text-xs font-semibold', theme.selectBorderClass)}
          />
        </div>
        <div className="flex-1">
          <Input
            value={block.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={theme.placeholderTitle}
            className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-semibold placeholder:text-slate-500"
          />
        </div>
      </div>
      <Textarea
        rows={2}
        value={block.content || ''}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder={theme.placeholderContent}
        className="bg-slate-900 border-white/10 text-slate-200 text-sm min-h-[60px] placeholder:text-slate-500"
      />
      {/* Visual Cue Feedback Bar */}
      <div
        className={cn(
          'px-3.5 py-2.5 rounded-lg text-xs flex items-center justify-between border transition-all',
          theme.badge
        )}
      >
        <span className="flex items-center gap-2">
          <span>{theme.icon}</span>
          <span className="font-medium">
            Màu sắc hiển thị: <strong className="font-semibold">{theme.label}</strong> —{' '}
            {theme.previewCue}
          </span>
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 px-1.5 py-0.5 rounded bg-white/10">
          {block.calloutType || 'info'}
        </span>
      </div>
    </div>
  );
}
