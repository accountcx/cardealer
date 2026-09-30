'use client';

import React from 'react';
import { Card, Input, Textarea, Switch } from '@cardealer/ui';
import { Sparkles, CheckCircle2, AlertCircle, Globe, Link2 } from 'lucide-react';
import type { SeoAnalysisResult } from '@cardealer/core';

export interface PostEditorSidebarProps {
  seoResult: SeoAnalysisResult;
  focusKeyword: string;
  setFocusKeyword: (val: string) => void;
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  canonicalUrl?: string;
  setCanonicalUrl?: (val: string) => void;
  isFeatured: boolean;
  setIsFeatured: (val: boolean) => void;
  noIndex: boolean;
  setNoIndex: (val: boolean) => void;
  slug?: string;
  titleFallback?: string;
  className?: string;
}

export function PostEditorSidebar({
  seoResult,
  focusKeyword,
  setFocusKeyword,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  canonicalUrl,
  setCanonicalUrl,
  isFeatured,
  setIsFeatured,
  noIndex,
  setNoIndex,
  slug = '',
  titleFallback = '',
  className = '',
}: PostEditorSidebarProps) {
  const displayTitle = metaTitle.trim() || titleFallback.trim() || 'Tiêu đề bài viết chưa nhập';
  const displayDescription = metaDescription.trim() || 'Mô tả bài viết sẽ xuất hiện ở đây khi tìm kiếm trên Google (khuyến nghị từ 120 đến 160 ký tự)...';
  const displaySlug = slug.trim() ? `/tin-tuc/${slug.trim()}` : '/tin-tuc/duong-dan-bai-viet';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Real-Time SEO Score Engine Card */}
      <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-cyan-400" />
            Động cơ SEO Real-Time
          </h3>
          <span
            className={`text-lg font-black px-3 py-1 rounded-xl ${
              seoResult.status === 'good'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : seoResult.status === 'needs_improvement'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {seoResult.score}/{seoResult.maxScore || 100}
          </span>
        </div>

        {/* Focus Keyword Input */}
        <div>
          <Input
            label="Từ khóa chính (Focus Keyword)"
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
            placeholder="e.g. giá xe hyundai santa fe 2026"
            className="h-10 rounded-xl bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
          />
        </div>

        {/* SEO Summary Metrics */}
        {seoResult.summary && (
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Số từ</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{seoResult.summary.wordCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Thời gian đọc</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{seoResult.summary.readingTime}p</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Mật độ từ khóa</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{seoResult.summary.keywordDensity}%</p>
            </div>
          </div>
        )}

        {/* 10 SEO Criteria Checklist */}
        <div className="space-y-2.5 pt-1">
          {seoResult.criteria.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
            >
              {item.passed ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {item.score}/{item.maxScore}đ
                  </span>
                </div>
                {item.message && (
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{item.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Google SERP Snippet Preview */}
      <Card className="p-5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Globe size={14} className="text-cyan-400" />
          <span>Mô phỏng hiển thị Google Search (SERP)</span>
        </div>
        <div className="p-3.5 bg-slate-950/80 border border-white/10 rounded-xl space-y-1">
          <div className="text-[11px] text-emerald-400/90 font-mono truncate flex items-center gap-1">
            <span className="text-slate-500">https://hyundai-nghean.vn</span>
            <span>{displaySlug}</span>
          </div>
          <h4 className="text-sm font-semibold text-sky-400 line-clamp-1 hover:underline cursor-pointer">
            {displayTitle}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>
      </Card>

      {/* 3. SEO Metadata & Meta Tags */}
      <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 border-b border-white/10 pb-3 text-sm">
          Cài đặt Meta & Lập chỉ mục
        </h3>

        <div>
          <Input
            label="Meta Title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Để trống nếu dùng tiêu đề chính"
            className="h-9 bg-slate-950/60 border-white/10 text-slate-200 text-xs focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 px-1">
            <span>Khuyến nghị: 50 - 60 ký tự</span>
            <span className={metaTitle.length > 60 ? 'text-amber-400' : 'text-slate-400'}>
              {metaTitle.length} ký tự
            </span>
          </div>
        </div>

        <div>
          <Textarea
            label="Meta Description"
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Mô tả hiển thị trên Google SERP (120 - 160 ký tự)..."
            className="bg-slate-950/60 border-white/10 text-slate-200 text-xs focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 min-h-[64px]"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 px-1">
            <span>Khuyến nghị: 120 - 160 ký tự</span>
            <span
              className={
                metaDescription.length >= 120 && metaDescription.length <= 160
                  ? 'text-emerald-400'
                  : metaDescription.length > 160
                    ? 'text-amber-400'
                    : 'text-slate-400'
              }
            >
              {metaDescription.length} ký tự
            </span>
          </div>
        </div>

        {setCanonicalUrl && (
          <div>
            <Input
              label="Đường dẫn gốc (Canonical URL)"
              leftIcon={<Link2 size={13} className="text-slate-500" />}
              value={canonicalUrl || ''}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://.../bai-viet-goc (nếu sao chép nguồn khác)"
              className="h-9 bg-slate-950/60 border-white/10 text-slate-200 text-xs focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
            />
          </div>
        )}

        <div className="pt-2 border-t border-white/10 space-y-4">
          <Switch
            label="Ghim bài nổi bật"
            description="Hiển thị ở vị trí ưu tiên trang chủ tin tức"
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
          />

          <Switch
            label="Chặn Google index (NoIndex)"
            description="Thêm thẻ meta robots noindex"
            checked={noIndex}
            onCheckedChange={setNoIndex}
          />
        </div>
      </Card>
    </div>
  );
}
