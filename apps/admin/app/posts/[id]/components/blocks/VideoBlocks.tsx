'use client';

// 🧠 Mental Model: Khối nhúng Video YouTube & Video TikTok (VideoBlocks).
// Tự động phân tích và trích xuất Video ID từ các định dạng URL phổ biến bằng helper @cardealer/core.
// Hiển thị huy hiệu nhận diện màu xanh lá khi bóc tách ID thành công.

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@cardealer/ui';
import { extractYoutubeId, extractTikTokId } from '@cardealer/core';
import type { EditorBlock } from '../../types';

export interface VideoBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function YouTubeBlock({ block, onUpdate }: VideoBlockProps) {
  return (
    <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
            Link Video YouTube hoặc Video ID *
          </label>
          <Input
            value={block.videoUrl || block.videoId || ''}
            onChange={(e) => {
              const val = e.target.value;
              const cleanId = extractYoutubeId(val);
              onUpdate({
                videoUrl: val,
                videoId: cleanId,
              });
            }}
            placeholder="Dán link (https://www.youtube.com/watch?v=... hoặc https://youtu.be/...) hoặc Video ID"
            className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
            Chú thích video (Tùy chọn)
          </label>
          <Input
            value={block.caption || ''}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Nhập chú thích hoặc tiêu đề video..."
            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
          />
        </div>
      </div>
      {block.videoId && (
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <CheckCircle2 size={13} className="shrink-0" />
          <span>
            Đã nhận diện YouTube Video ID:{' '}
            <strong className="font-mono font-bold text-white">{block.videoId}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

export function TikTokBlock({ block, onUpdate }: VideoBlockProps) {
  return (
    <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
            Link Video TikTok hoặc Video ID *
          </label>
          <Input
            value={block.videoUrl || block.videoId || ''}
            onChange={(e) => {
              const val = e.target.value;
              const cleanId = extractTikTokId(val);
              onUpdate({
                videoUrl: val,
                videoId: cleanId,
              });
            }}
            placeholder="Dán link (https://www.tiktok.com/@.../video/...) hoặc Video ID"
            className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
            Tiêu đề video TikTok (Tùy chọn)
          </label>
          <Input
            value={block.title || block.caption || ''}
            onChange={(e) =>
              onUpdate({ title: e.target.value, caption: e.target.value })
            }
            placeholder="Tiêu đề video TikTok..."
            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
          />
        </div>
      </div>
      {block.videoId && (
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <CheckCircle2 size={13} className="shrink-0" />
          <span>
            Đã nhận diện TikTok Video ID:{' '}
            <strong className="font-mono font-bold text-white">{block.videoId}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
