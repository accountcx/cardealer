import React from 'react';
import Link from 'next/link';
import { Home, Calendar, Clock, ShieldCheck } from 'lucide-react';
import type { StaticPage } from '@cardealer/types';

interface DefaultTemplateProps {
  page: StaticPage;
}

// WHY: Template mặc định cho các trang chính sách, điều khoản và tài liệu pháp lý (DEFAULT / WebPage).
// Bố cục tối ưu tỷ lệ đọc (Typography 65ch), có breadcrumbs điều hướng chuẩn SEO.
export function DefaultTemplate({ page }: DefaultTemplateProps) {
  // Trích xuất text hoặc render đoạn văn từ Tiptap AST
  const doc = page.content as {
    content?: Array<{
      type: string;
      attrs?: Record<string, unknown>;
      content?: Array<{ type: string; text?: string }>;
    }>;
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-10 sm:py-14 space-y-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
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
            <span>Thông tin xác thực Showroom</span>
          </div>
        </div>
      </header>

      {/* Content Body */}
      <div className="prose prose-slate max-w-none space-y-5 text-slate-700 leading-relaxed text-base">
        {doc?.content && Array.isArray(doc.content) && doc.content.length > 0 ? (
          doc.content.map((node, idx) => {
            if (node.type === 'heading') {
              const text = node.content?.map((t) => t.text).join('') || '';
              return (
                <h2 key={idx} className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  {text}
                </h2>
              );
            }
            if (node.type === 'paragraph') {
              const text = node.content?.map((t) => t.text).join('') || '';
              return <p key={idx}>{text}</p>;
            }
            if (node.type === 'calloutBlock') {
              const attrs = node.attrs as { title?: string; content?: string } | undefined;
              return (
                <div key={idx} className="p-4 my-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  {attrs?.title && <h4 className="font-bold text-sm mb-1">{attrs.title}</h4>}
                  <p className="text-sm">{attrs?.content}</p>
                </div>
              );
            }
            return null;
          })
        ) : (
          <p className="italic text-slate-400">Nội dung trang đang được cập nhật...</p>
        )}
      </div>
    </article>
  );
}
