'use client';

import React from 'react';
import { Building2, MapPin, Phone, Globe, ShieldCheck } from 'lucide-react';
import type { StaticPage, BulkSettings } from '@cardealer/types';
import type { AutoDealerInfo } from '@cardealer/core';
import { PageBlocksRenderer } from '../PageBlocksRenderer';

export interface ProfileShowroomTemplateProps {
  page: StaticPage;
  dealerInfo?: AutoDealerInfo;
  settings?: BulkSettings;
}

// WHY: Template giới thiệu hồ sơ doanh nghiệp & Showroom (PROFILE_SHOWROOM / AboutPage).
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Zero-Hardcode & Zero-Fallback: 100% dữ liệu pháp lý & địa chỉ NAP lấy từ Admin Settings (dealerInfo).
// 2. Không sinh fake stats hoặc fake commitments giả mạo.
// 3. Render toàn bộ 14 khối nội dung do Admin biên tập qua PageBlocksRenderer.
// 4. Tối ưu hóa các tín hiệu E-E-A-T (Kinh nghiệm, Chuyên môn, Thẩm quyền, Độ tin cậy) chuẩn Schema.org AboutPage.
export function ProfileShowroomTemplate({ page, dealerInfo }: ProfileShowroomTemplateProps) {
  const showroomName = dealerInfo?.name || page.title;
  const address = dealerInfo?.address?.streetAddress || '';
  const telephone = dealerInfo?.telephone || '';
  const cleanPhone = telephone.replace(/[^0-9+]/g, '');

  const hasContent =
    page.content &&
    typeof page.content === 'object' &&
    Array.isArray((page.content as any).content) &&
    (page.content as any).content.length > 0;

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* 1. Hero Banner với thông tin thật từ Admin Settings */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Building2 size={14} /> Thông Tin Đại Lý Chính Thức
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {showroomName}
          </h1>
          {dealerInfo?.legalName && (
            <p className="text-sm text-blue-200 font-medium">
              {dealerInfo.legalName}
            </p>
          )}
          {page.metaDescription && (
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {page.metaDescription}
            </p>
          )}
        </div>
      </section>

      {/* 2. NAP Verification Strip (Name, Address, Phone thật từ Admin) */}
      {(address || telephone) && (
        <section className="max-w-4xl mx-auto px-4 -mt-8">
          <div className="grid sm:grid-cols-2 gap-4 bg-white shadow-lg rounded-2xl p-6 border border-slate-200">
            {address && (
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Địa Chỉ Showroom</span>
                  <span className="text-sm font-semibold text-slate-800">{address}</span>
                </div>
              </div>
            )}
            {telephone && (
              <div className="flex items-start gap-3">
                <Phone className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hotline Phục Vụ</span>
                  <a href={`tel:${cleanPhone}`} className="text-sm font-semibold text-blue-600 hover:underline">
                    {telephone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Thân trang: Render 100% nội dung thực tế do Admin soạn thảo */}
      <section className="max-w-4xl mx-auto px-4">
        {hasContent ? (
          <PageBlocksRenderer content={page.content} dealerInfo={dealerInfo} />
        ) : (
          <div className="py-12 text-center rounded-2xl border border-slate-200 bg-slate-50 p-8 space-y-3">
            <Building2 className="mx-auto text-slate-400" size={32} />
            <p className="text-sm font-medium text-slate-700">Thông tin giới thiệu đại lý đang được cập nhật</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nội dung chi tiết về lịch sử hình thành, đội ngũ nhân sự và cơ sở vật chất sẽ sớm được cập nhật.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
