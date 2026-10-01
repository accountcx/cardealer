'use client';

import React from 'react';
import { Globe, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, Badge } from '@cardealer/ui';

interface SerpPreviewProps {
  title?: string;
  metaTitle?: string;
  slug?: string;
  metaDescription?: string;
  siteUrl?: string;
}

// WHY: SERP Preview Component mô phỏng kết quả tìm kiếm Google theo thời gian thực (Mental Model Conformance).
// Cung cấp phản hồi trực quan ngay khi SEO Marketer soạn thảo metaTitle / metaDescription, ngăn chặn vượt quá pixel width của Google SERP.
export function SerpPreview({
  title = '',
  metaTitle = '',
  slug = '',
  metaDescription = '',
  siteUrl = 'https://cardealer.vn',
}: SerpPreviewProps) {
  const displayTitle = metaTitle.trim() || title.trim() || 'Tiêu đề trang tĩnh';
  const displaySlug = slug.trim() ? `/${slug.trim()}` : '/duong-dan-trang';
  const displayDesc =
    metaDescription.trim() ||
    'Chưa có mô tả Meta Description. Hãy nhập đoạn mô tả hấp dẫn (140-160 ký tự) để tăng tỷ lệ nhấp chuột (CTR) từ kết quả tìm kiếm Google.';

  const titleLength = displayTitle.length;
  const descLength = metaDescription.trim().length;

  // Đánh giá độ dài tiêu đề (50 - 60 ký tự là lý tưởng)
  const isTitleOptimal = titleLength >= 40 && titleLength <= 65;
  // Đánh giá độ dài mô tả (120 - 160 ký tự là lý tưởng)
  const isDescOptimal = descLength >= 120 && descLength <= 165;

  return (
    <Card className="p-4 bg-slate-900/60 border border-white/10 rounded-xl space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">Google SERP Preview</span>
        </div>
        <Badge variant={isTitleOptimal && isDescOptimal ? 'published' : 'draft'} className="text-xs">
          {isTitleOptimal && isDescOptimal ? 'SEO Chuẩn' : 'Cần Tối Ưu'}
        </Badge>
      </div>

      {/* Snippet Card */}
      <div className="p-3 bg-white dark:bg-[#1a1f2c] rounded-lg border border-slate-200 dark:border-white/5 space-y-1 font-sans">
        {/* Dòng 1: URL Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 truncate">
          <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Globe size={11} />
          </div>
          <span className="truncate">{siteUrl}</span>
          <span>›</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{displaySlug}</span>
        </div>

        {/* Dòng 2: Tiêu đề Google SERP (Màu xanh đặc trưng) */}
        <h3 className="text-base font-medium text-blue-600 dark:text-[#8ab4f8] hover:underline cursor-pointer truncate leading-snug">
          {displayTitle}
        </h3>

        {/* Dòng 3: Đoạn trích mô tả */}
        <p className="text-xs text-slate-600 dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>
      </div>

      {/* Bộ đếm ký tự & thanh trạng thái */}
      <div className="space-y-2 pt-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Độ dài Tiêu đề:</span>
          <span className={`font-mono ${isTitleOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
            {titleLength}/60 ký tự
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Độ dài Mô tả:</span>
          <span className={`font-mono ${isDescOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
            {descLength}/160 ký tự
          </span>
        </div>
      </div>
    </Card>
  );
}
