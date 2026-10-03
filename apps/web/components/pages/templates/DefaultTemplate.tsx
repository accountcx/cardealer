'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Calendar, ShieldCheck, FileText } from 'lucide-react';
import type { StaticPage, BulkSettings } from '@cardealer/types';
import type { AutoDealerInfo } from '@cardealer/core';
import { PageBlocksRenderer } from '../PageBlocksRenderer';

export interface DefaultTemplateProps {
  page: StaticPage;
  dealerInfo?: AutoDealerInfo;
  settings?: BulkSettings;
}

// WHY: Template mặc định cho các trang chính sách, điều khoản và tài liệu pháp lý (DEFAULT / WebPage).
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Zero-Hardcode: Hiển thị 100% dữ liệu động từ CMS qua PageBlocksRenderer.
// 2. 4-State UI Matrix: Có Empty State khi nội dung rỗng, Data State với typography 65ch tối ưu đọc.
// 3. 100% Named Export, không dùng export default nội bộ.
export function DefaultTemplate({ page, dealerInfo }: DefaultTemplateProps) {
  const hasContent = page.content && typeof page.content === 'object' && Array.isArray((page.content as any).content) && (page.content as any).content.length > 0;

  return (
    <article className="max-w-4xl mx-auto px-4 py-10 sm:py-14 space-y-8 font-sans">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
          <Home size={14} /> Trang Chủ
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate">{page.title}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {page.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            <span>Cập nhật: {new Date(page.updatedAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck size={14} />
            <span>Thông tin xác thực {dealerInfo?.name || 'Showroom'}</span>
          </div>
        </div>
      </header>

      {/* Content Body: Render toàn bộ 14 content blocks từ CMS */}
      <div className="space-y-6">
        {hasContent ? (
          <PageBlocksRenderer content={page.content} dealerInfo={dealerInfo} />
        ) : (
          <div className="py-12 text-center rounded-2xl border border-slate-200 bg-slate-50 p-8 space-y-3">
            <FileText className="mx-auto text-slate-400" size={32} />
            <p className="text-sm font-medium text-slate-700">Nội dung trang đang được cập nhật</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thông tin chi tiết của văn bản chính sách sẽ được bộ phận pháp lý xuất bản trong thời gian sớm nhất.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
