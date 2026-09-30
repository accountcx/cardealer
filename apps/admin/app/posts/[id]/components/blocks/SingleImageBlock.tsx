'use client';

// 🧠 Mental Model: Khối Hình ảnh Đơn & Tối ưu SEO (SingleImageBlock).
// Hỗ trợ chọn từ Thư viện ảnh tập trung hoặc tải tệp trực tiếp từ máy lên Cloudinary CDN.
// Quản lý chặt chẽ Alt text SEO và Caption hiển thị dưới chân ảnh.

import React from 'react';
import { Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Button, Input } from '@cardealer/ui';
import type { EditorBlock } from '../../types';

export interface SingleImageBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
  onOpenMediaPicker: () => void;
  onUploadFile: (file: File | null) => void;
  isUploading: boolean;
}

export function SingleImageBlock({
  block,
  onUpdate,
  onOpenMediaPicker,
  onUploadFile,
  isUploading,
}: SingleImageBlockProps) {
  return (
    <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-xl border border-cyan-500/20">
      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
        <ImageIcon size={14} /> Hình Ảnh Đơn & Tối Ưu SEO (Alt + Caption)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] text-slate-400 font-medium">
              Đường dẫn ảnh (URL Image) *
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenMediaPicker}
                className="h-6 text-[11px] px-2 flex items-center gap-1 cursor-pointer border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300"
              >
                <ImageIcon size={12} />
                <span>Thư Viện Ảnh</span>
              </Button>
              <label
                className={`text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 transition-colors whitespace-nowrap shrink-0 select-none ${
                  isUploading
                    ? 'opacity-60 cursor-not-allowed pointer-events-none'
                    : 'cursor-pointer'
                }`}
              >
                {isUploading ? (
                  <Loader2 size={12} className="shrink-0 animate-spin text-cyan-400" />
                ) : (
                  <Upload size={12} className="shrink-0" />
                )}
                <span>{isUploading ? 'Đang đẩy lên...' : 'Tải từ máy'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onUploadFile(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>
          <Input
            value={block.imageUrl || ''}
            onChange={(e) => onUpdate({ imageUrl: e.target.value })}
            placeholder="Dán link ảnh https://... hoặc chọn từ Thư Viện Ảnh bên trên"
            className="h-9 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium flex items-center justify-between">
            <span>Thẻ Alt ảnh (Chuẩn SEO) *</span>
            <span className="text-[10px] text-emerald-400 font-mono">Google Images</span>
          </label>
          <Input
            value={block.imageAlt || ''}
            onChange={(e) => onUpdate({ imageAlt: e.target.value })}
            placeholder="Ví dụ: Khoang lái xe Hyundai Tucson phiên bản Cao cấp..."
            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
            Dòng chú thích chân ảnh (Caption)
          </label>
          <Input
            value={block.caption || ''}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Ví dụ: Khoang lái Tucson phiên bản Cao cấp bọc da nâu..."
            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
          />
        </div>
      </div>
      {block.imageUrl && (
        <div className="flex items-center gap-3 p-2 bg-slate-950/80 rounded-lg border border-white/5">
          <img
            src={block.imageUrl}
            alt={block.imageAlt || 'Xem trước ảnh'}
            className="w-20 h-14 object-cover rounded border border-white/10"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="text-xs text-slate-400 truncate flex-1">
            <p className="font-semibold text-slate-200 truncate">
              {block.caption || 'Chưa có chú thích'}
            </p>
            <p className="text-[11px] text-slate-500 truncate font-mono">
              Alt: {block.imageAlt || 'Chưa có alt text'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
