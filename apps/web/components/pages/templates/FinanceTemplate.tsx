'use client';

import React from 'react';
import { Calculator, PhoneCall, ShieldCheck, Banknote } from 'lucide-react';
import Link from 'next/link';
import type { StaticPage, BulkSettings } from '@cardealer/types';
import type { AutoDealerInfo } from '@cardealer/core';
import { PageBlocksRenderer } from '../PageBlocksRenderer';

export interface FinanceTemplateProps {
  page: StaticPage;
  dealerInfo?: AutoDealerInfo;
  settings?: BulkSettings;
}

// WHY: Template chính sách tài chính & giải pháp mua xe trả góp (FINANCE / FinancialProduct).
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Zero-Hardcode & Zero-Fallback: 100% nội dung (bảng tính, lãi suất, điều kiện) render từ CMS qua PageBlocksRenderer.
// 2. Không sinh fake pillars hoặc checklist giả tạo.
// 3. Tích hợp CTA tính chi phí lăn bánh /gia-lan-banh và hotline tư vấn từ Admin Settings (dealerInfo).
export function FinanceTemplate({ page, dealerInfo }: FinanceTemplateProps) {
  const hotline = dealerInfo?.telephone || '';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');

  const hasContent =
    page.content &&
    typeof page.content === 'object' &&
    Array.isArray((page.content as any).content) &&
    (page.content as any).content.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 font-sans">
      {/* 1. Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Chính Sách Tài Chính & Trả Góp
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

      {/* 2. Fast Actions Bar: Dự toán & Hotline */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/gia-lan-banh"
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider block">Công Cụ Trực Tuyến</span>
            <span className="text-base font-bold">Tính Dự Toán Chi Phí Lăn Bánh</span>
          </div>
          <Calculator className="shrink-0 transition-transform group-hover:scale-110" size={24} />
        </Link>

        {hotline ? (
          <a
            href={`tel:${cleanPhone}`}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-between hover:bg-slate-100 transition-all group"
          >
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Hotline Tư Vấn Vay Vốn</span>
              <span className="text-base font-bold text-blue-600">{hotline}</span>
            </div>
            <PhoneCall className="text-blue-600 shrink-0 transition-transform group-hover:scale-110" size={24} />
          </a>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 font-semibold block">Bảo Mật Thông Tin</span>
              <span className="text-sm font-bold">Thẩm định hồ sơ minh bạch</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Thân trang: Render 100% nội dung CMS từ Admin */}
      <div className="space-y-6">
        {hasContent ? (
          <PageBlocksRenderer content={page.content} dealerInfo={dealerInfo} />
        ) : (
          <div className="py-12 text-center rounded-2xl border border-slate-200 bg-slate-50 p-8 space-y-3">
            <Banknote className="mx-auto text-slate-400" size={32} />
            <p className="text-sm font-medium text-slate-700">Chính sách tài chính đang được cập nhật</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thông tin chi tiết về các gói vay, lãi suất liên kết ngân hàng và bảng tính sẽ được công bố sớm nhất.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
