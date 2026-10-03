'use client';

import React, { useState, useMemo } from 'react';
import { HelpCircle, ChevronDown, PhoneCall, HelpCircle as QuestionIcon } from 'lucide-react';
import type { StaticPage, BulkSettings } from '@cardealer/types';
import { extractFaqsFromTiptap, type AutoDealerInfo } from '@cardealer/core';
import { PageBlocksRenderer } from '../PageBlocksRenderer';

export interface FaqTemplateProps {
  page: StaticPage;
  dealerInfo?: AutoDealerInfo;
  settings?: BulkSettings;
}

// WHY: Template hỏi đáp thường gặp dạng Accordion tương tác mượt mà (FAQ / FAQPage).
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Zero-Hardcode & Zero-Fallback: 100% câu hỏi trích xuất từ CMS (faqBlock AST) qua extractFaqsFromTiptap.
// 2. Không sinh fake fallback questions khi rỗng, hiển thị Empty State chuẩn mực.
// 3. Render đồng thời các content blocks khác (ảnh, video hướng dẫn, CTA...) qua PageBlocksRenderer.
// 4. Hotline và thông tin tư vấn đồng bộ từ Admin Settings (dealerInfo).
export function FaqTemplate({ page, dealerInfo }: FaqTemplateProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Trích xuất FAQs động từ Tiptap AST Content do Admin cấu hình
  const faqs = useMemo(() => {
    return extractFaqsFromTiptap(page.content);
  }, [page.content]);

  const hasFaqs = faqs.length > 0;
  const hotline = dealerInfo?.telephone || '';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 font-sans">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
          Trung Tâm Trợ Giúp & FAQ
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {page.title}
        </h1>
        {page.metaDescription && (
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            {page.metaDescription}
          </p>
        )}
      </div>

      {/* Accordion List: 100% câu hỏi thật từ CMS */}
      {hasFaqs ? (
        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-slate-900 text-base hover:text-blue-600"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-blue-600 flex-shrink-0" />
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
          <QuestionIcon size={32} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-900 text-base">Chưa có câu hỏi thường gặp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Danh sách giải đáp thắc mắc đang được cập nhật. Bạn có thể liên hệ trực tiếp với chúng tôi để được tư vấn nhanh.
          </p>
        </div>
      )}

      {/* Các khối nội dung khác (đoạn văn giới thiệu, video, callout, CTA...) do Admin biên tập */}
      <PageBlocksRenderer
        content={page.content}
        dealerInfo={dealerInfo}
        excludeTypes={['faqBlock']}
      />

      {/* Box liên hệ nếu có hotline */}
      {hotline && (
        <div className="p-8 rounded-2xl bg-blue-50 border border-blue-200/80 text-center space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Bạn vẫn còn câu hỏi khác?</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Đội ngũ chuyên viên tư vấn của {dealerInfo?.name || 'Showroom'} luôn túc trực để giải đáp cụ thể theo từng trường hợp của bạn.
          </p>
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
          >
            <PhoneCall size={16} /> Gọi Hotline {hotline}
          </a>
        </div>
      )}
    </div>
  );
}
