'use client';

import React from 'react';
import Link from 'next/link';
import { CalloutBlock } from '@cardealer/ui';

export interface EditorialBlockProps {
  node: {
    type: string;
    attrs?: Record<string, unknown>;
    content?: Array<{
      type: string;
      text?: string;
      marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    }>;
  };
}

// WHY: Render nội dung rich text dạng chuỗi (text, marks: link, bold, italic).
function renderInlineContent(content?: EditorialBlockProps['node']['content']) {
  if (!content || !Array.isArray(content)) return null;

  return content.map((child, idx) => {
    if (!child.text) return null;
    let nodeElement: React.ReactNode = child.text;

    if (Array.isArray(child.marks) && child.marks.length > 0) {
      for (const mark of child.marks) {
        if (mark.type === 'bold') {
          nodeElement = <strong>{nodeElement}</strong>;
        } else if (mark.type === 'italic') {
          nodeElement = <em>{nodeElement}</em>;
        } else if (mark.type === 'link') {
          const href = (mark.attrs?.href as string) || '#';
          const target = (mark.attrs?.target as string) || undefined;
          const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
          nodeElement = (
            <Link
              href={href}
              target={target}
              rel={rel}
              className="text-blue-600 hover:text-blue-700 underline font-medium transition-colors"
            >
              {nodeElement}
            </Link>
          );
        }
      }
    }

    return <React.Fragment key={idx}>{nodeElement}</React.Fragment>;
  });
}

// WHY: Render các khối văn bản biên tập báo chí & so sánh (Editorial Blocks).
// Tách từ PageBlocksRenderer để tuân thủ nguyên tắc unit_size_limit (< 300 dòng).
// 100% Named Export, không dùng export default.
export function EditorialBlock({ node }: EditorialBlockProps) {
  // 1. Heading (H2, H3)
  if (node.type === 'heading') {
    const level = (node.attrs?.level as number) || 2;
    const hasText = node.content?.some((c) => c.text && c.text.trim().length > 0);
    if (!hasText) return null;

    if (level === 2) {
      return (
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 border-l-4 border-blue-600 pl-3.5 scroll-mt-20">
          {renderInlineContent(node.content)}
        </h2>
      );
    }
    return (
      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3 scroll-mt-20">
        {renderInlineContent(node.content)}
      </h3>
    );
  }

  // 2. Paragraph
  if (node.type === 'paragraph') {
    const hasText = node.content?.some((c) => c.text && c.text.trim().length > 0);
    if (!hasText) return null;
    return (
      <p className="text-slate-700 leading-relaxed text-base my-3 whitespace-pre-line">
        {renderInlineContent(node.content)}
      </p>
    );
  }

  // 3. Callout Box
  if (node.type === 'calloutBlock' || node.type === 'callout') {
    const type = (node.attrs?.type as 'info' | 'warning' | 'success' | 'note') || 'info';
    return (
      <CalloutBlock
        type={type}
        title={(node.attrs?.title as string) || null}
        content={(node.attrs?.content as string) || ''}
      />
    );
  }

  // 4. Ưu / Nhược điểm (prosConsBlock)
  if (node.type === 'prosConsBlock' || node.type === 'prosCons') {
    const title = (node.attrs?.title as string) || 'Đánh Giá Ưu & Nhược Điểm';
    const pros = (node.attrs?.pros as string[]) || [];
    const cons = (node.attrs?.cons as string[]) || [];

    return (
      <div className="my-8 not-prose">
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
              ✓ Ưu Điểm ({pros.length})
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {pros.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-3">
              ✗ Nhược Điểm ({cons.length})
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {cons.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 5. Bảng thông số kỹ thuật (specComparisonBlock)
  if (node.type === 'specComparisonBlock' || node.type === 'specTable') {
    const title = (node.attrs?.title as string) || 'Bảng So Sánh Thông Số Kỹ Thuật';
    const versions = (node.attrs?.versions as string[]) || [];
    const rows = (node.attrs?.rows as Array<{ specName: string; values: string[] }>) || [];
    if (!versions.length || !rows.length) return null;

    return (
      <div className="my-8 not-prose overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="p-3 font-bold text-slate-800 min-w-[140px]">Thông Số</th>
              {versions.map((v, i) => (
                <th key={i} className="p-3 font-bold text-slate-800 text-center min-w-[120px]">{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-900">{r.specName}</td>
                {(r.values || []).map((val, vi) => (
                  <td key={vi} className="p-3 text-center text-slate-600">{val || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}
