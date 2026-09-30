'use client';

import React from 'react';
import { Check, AlertCircle, ImageIcon, X } from 'lucide-react';
import { Card, Input, Button, Select } from '@cardealer/ui';
import type { CategoryItem } from '../../../../services/post.service';

export interface PostGeneralInfoCardProps {
  isNew: boolean;
  tieuDe: string;
  onTitleChange: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  originalSlug: string;
  categories: CategoryItem[];
  categoryId: string;
  setCategoryId: (val: string) => void;
  anhDaiDienUrl: string;
  setAnhDaiDienUrl: (val: string) => void;
  anhDaiDienAlt: string;
  setAnhDaiDienAlt: (val: string) => void;
  tomTat: string;
  setTomTat: (val: string) => void;
  onOpenMediaPicker: () => void;
}

export function PostGeneralInfoCard({
  isNew,
  tieuDe,
  onTitleChange,
  slug,
  setSlug,
  originalSlug,
  categories,
  categoryId,
  setCategoryId,
  anhDaiDienUrl,
  setAnhDaiDienUrl,
  anhDaiDienAlt,
  setAnhDaiDienAlt,
  tomTat,
  setTomTat,
  onOpenMediaPicker,
}: PostGeneralInfoCardProps) {
  return (
    <Card className="relative z-20 p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-5">
      {/* Title Input */}
      <div className="space-y-1.5">
        <Input
          label="Tiêu đề bài viết (H1) *"
          value={tieuDe}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Nhập tiêu đề hấp dẫn chuẩn SEO (40 - 65 ký tự)..."
          className="h-12 text-base md:text-lg font-bold bg-slate-950/60 border-white/10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
        />
        <div className="flex justify-between items-center text-xs text-slate-500 px-1">
          <span>Số ký tự: {tieuDe.length} / 65</span>
          {tieuDe.length >= 40 && tieuDe.length <= 65 && (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check size={12} /> Độ dài chuẩn SEO
            </span>
          )}
        </div>
      </div>

      {/* Slug URL with 301 Warning */}
      <div>
        <Input
          label="Đường dẫn tĩnh (URL Slug)"
          leftIcon={<span className="text-slate-500 font-mono text-xs select-none">/tin-tuc/</span>}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="pl-20 font-mono bg-slate-950/60 border-white/10 text-slate-200 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
        />
        {!isNew && originalSlug && slug !== originalSlug && (
          <p className="text-xs text-amber-400 flex items-center gap-1.5 mt-2 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            <AlertCircle size={14} className="shrink-0" />
            Bạn đang thay đổi Slug! Hệ thống sẽ tự động tạo chuyển hướng 301 từ{' '}
            <code className="bg-black/30 px-1 py-0.5 rounded">/tin-tuc/{originalSlug}</code> để bảo toàn PageRank.
          </p>
        )}
      </div>

      {/* Category & Thumbnail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-30">
        <Select
          label="Chuyên mục *"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          variant="dark"
          options={categories.map((c) => ({ value: c.id, label: c.tenChuyenMuc }))}
          className="h-10 rounded-lg bg-slate-950/60 border-white/10 text-slate-200 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Ảnh đại diện (Featured Image) *
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenMediaPicker}
              className="h-7 text-xs flex items-center gap-1.5 cursor-pointer border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-sky-400 hover:text-sky-300"
            >
              <ImageIcon size={13} />
              <span>Chọn từ Thư Viện</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={anhDaiDienUrl}
              onChange={(e) => setAnhDaiDienUrl(e.target.value)}
              placeholder="https://.../anh-dai-dien.webp"
              className="h-10 bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 flex-1 font-mono"
            />
            {anhDaiDienUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAnhDaiDienUrl('');
                  setAnhDaiDienAlt('');
                }}
                aria-label="Xóa ảnh đại diện"
                className="h-10 w-10 shrink-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              >
                <X size={16} />
              </Button>
            )}
          </div>
          {anhDaiDienUrl && (
            <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-950/60 border border-white/10">
              <div className="w-16 h-12 rounded-lg bg-slate-900 border border-white/10 overflow-hidden shrink-0">
                <img
                  src={anhDaiDienUrl}
                  alt={anhDaiDienAlt || 'Preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <p className="text-slate-200 font-semibold truncate font-mono">{anhDaiDienUrl}</p>
                <p className="text-slate-400 truncate">Alt: {anhDaiDienAlt || 'Chưa thiết lập'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alt text & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Thẻ Alt ảnh đại diện (SEO Alt) *"
          value={anhDaiDienAlt}
          onChange={(e) => setAnhDaiDienAlt(e.target.value)}
          placeholder="Mô tả ảnh chứa từ khóa chính..."
          className="h-10 bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
        />

        <Input
          label="Tóm tắt bài viết (Meta Sapo)"
          value={tomTat}
          onChange={(e) => setTomTat(e.target.value)}
          placeholder="Tóm tắt ngắn gọn 1-2 câu mở đầu..."
          className="h-10 bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
        />
      </div>
    </Card>
  );
}
