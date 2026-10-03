'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, PhoneCall, CalendarClock } from 'lucide-react';
import type { StaticPage, BulkSettings } from '@cardealer/types';
import { extractStepsFromTiptap, type AutoDealerInfo } from '@cardealer/core';
import { PageBlocksRenderer } from '../PageBlocksRenderer';

export interface TimelineTemplateProps {
  page: StaticPage;
  dealerInfo?: AutoDealerInfo;
  settings?: BulkSettings;
}

// WHY: Template dòng thời gian hoặc các bước quy trình mua bán/giao xe chuẩn mực (TIMELINE / HowTo).
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Zero-Hardcode & Zero-Fallback: 100% các bước trích xuất thực tế từ Tiptap AST qua extractStepsFromTiptap.
// 2. Không sinh fake fallback steps khi rỗng, hiển thị Empty State chuẩn mực.
// 3. Render đồng thời các khối nội dung khác (ảnh, bảng giá, lead form, video...) qua PageBlocksRenderer.
// 4. Đồng bộ hoàn hảo giữa UI và Google HowTo Schema JSON-LD.
export function TimelineTemplate({ page, dealerInfo }: TimelineTemplateProps) {
  const steps = useMemo(() => {
    return extractStepsFromTiptap(page.content);
  }, [page.content]);

  const hasSteps = steps.length > 0;
  const hotline = dealerInfo?.telephone || '';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 font-sans">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Quy Trình Chuẩn {hasSteps ? `${steps.length} Bước` : 'Minh Bạch'}
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

      {/* Timeline Steps */}
      {hasSteps ? (
        <div className="relative border-l-2 border-blue-500/30 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
          {steps.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Dot Indicator */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow flex items-center justify-center text-white text-xs font-bold">
                {item.position || idx + 1}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 transition-all hover:shadow-md hover:border-blue-300">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Bước {String(item.position || idx + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
          <CalendarClock size={32} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-900 text-base">Quy trình đang được cập nhật</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Các bước thực hiện chi tiết sẽ được công bố sớm. Quý khách vui lòng liên hệ tư vấn viên để được hướng dẫn trực tiếp.
          </p>
        </div>
      )}

      {/* Các khối nội dung khác (ảnh bàn giao xe, bảng giá, lead form...) do Admin biên tập */}
      <PageBlocksRenderer
        content={page.content}
        dealerInfo={dealerInfo}
        excludeTypes={['timelineStep', 'stepBlock']}
      />

      {/* Box Hotline hỗ trợ */}
      {hotline && (
        <div className="p-8 rounded-2xl bg-blue-50 border border-blue-200/80 text-center space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Cần hướng dẫn chi tiết quy trình?</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Đội ngũ chuyên viên {dealerInfo?.name || 'Showroom'} sẵn sàng đồng hành cùng quý khách từ bước lái thử đến ngày nhận xe.
          </p>
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
          >
            <PhoneCall size={16} /> Liên Hệ Hotline {hotline}
          </a>
        </div>
      )}
    </div>
  );
}
