'use client';

import React from 'react';
import type { StaticPage, BulkSettings } from '@cardealer/types';
import type { AutoDealerInfo } from '@cardealer/core';
import { PageBlocksRenderer } from '../PageBlocksRenderer';
import { ContactInfoCards } from './contact/ContactInfoCards';
import { ContactForm } from './contact/ContactForm';

export interface ContactTemplateProps {
  page: StaticPage;
  dealerInfo?: AutoDealerInfo;
  settings?: BulkSettings;
}

// WHY: Template thông tin liên hệ & bản đồ Showroom (CONTACT / ContactPage).
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Zero-Hardcode: Dữ liệu NAP lấy từ Admin Settings, Form liên hệ tích hợp trực tiếp leadsService (CRM Ingestion).
// 2. Chống Spam: Tích hợp trường Honeypot ẩn và xác thực SĐT 10 số.
// 3. 4-State UI: Idle, Submitting, Success và Error state với thông báo rõ ràng.
// 4. Render đồng thời các khối nội dung do Admin biên tập qua PageBlocksRenderer.
// 5. Tuân thủ unit_size_limit (< 300 dòng) qua phân rã module ContactInfoCards và ContactForm.
export function ContactTemplate({ page, dealerInfo, settings }: ContactTemplateProps) {
  const showroomName = dealerInfo?.name || settings?.site?.businessName || page.title;
  const address = dealerInfo?.address?.streetAddress || settings?.site?.address || '';
  const phone = dealerInfo?.telephone || settings?.contact?.hotlineKinhDoanh || settings?.site?.phone || '';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const email = settings?.contact?.email || '';
  const mapEmbed = settings?.footer?.googleMapEmbed || '';

  const hasContent =
    page.content &&
    typeof page.content === 'object' &&
    Array.isArray((page.content as any).content) &&
    (page.content as any).content.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 font-sans">
      {/* 1. Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Kết Nối Với Chúng Tôi
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

      {/* 2. Grid Liên Hệ & Form */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Thông tin liên hệ từ Settings */}
        <div className="md:col-span-5">
          <ContactInfoCards
            showroomName={showroomName}
            address={address}
            phone={phone}
            cleanPhone={cleanPhone}
            email={email}
            settings={settings}
          />
        </div>

        {/* Form liên hệ tiếp nhận Lead CRM */}
        <div className="md:col-span-7">
          <ContactForm
            pageSlug={page.slug}
            province={dealerInfo?.address?.addressLocality || 'Nghệ An'}
          />
        </div>
      </div>

      {/* 3. Google Maps Embed (nếu có cấu hình) */}
      {mapEmbed && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 h-80">
          <iframe
            src={mapEmbed}
            title="Showroom Location Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* 4. Render các khối nội dung bổ sung do Admin soạn */}
      {hasContent && (
        <div className="pt-6 border-t border-slate-200">
          <PageBlocksRenderer content={page.content} dealerInfo={dealerInfo} />
        </div>
      )}
    </div>
  );
}
