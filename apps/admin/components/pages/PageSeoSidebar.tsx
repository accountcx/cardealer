'use client';

import React from 'react';
import { Card, Input, Badge } from '@cardealer/ui';
import { SerpPreview } from './SerpPreview';
import { clientEnv } from '@cardealer/env';
import type { StaticPageTemplate, StaticPageSchemaType } from '@cardealer/types';
import { TEMPLATE_DEFAULT_SCHEMA } from '@cardealer/types';

interface PageSeoSidebarProps {
  title: string;
  slug: string;
  templateType: StaticPageTemplate;
  setTemplateType: (val: StaticPageTemplate) => void;
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  canonicalUrl: string;
  setCanonicalUrl: (val: string) => void;
  ogImage: string;
  setOgImage: (val: string) => void;
  noIndex: boolean;
  setNoIndex: (val: boolean) => void;
  schemaType: StaticPageSchemaType;
  setSchemaType: (val: StaticPageSchemaType) => void;
}

// WHY: Tách riêng Sidebar cấu hình Technical SEO (Separation of Concerns & Unit Size Limit).
// Quản lý trạng thái xuất bản, cấu hình OpenGraph, Schema.org và xem trước snippet SERP.
export function PageSeoSidebar({
  title,
  slug,
  templateType,
  setTemplateType,
  isPublished,
  setIsPublished,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  canonicalUrl,
  setCanonicalUrl,
  ogImage,
  setOgImage,
  noIndex,
  setNoIndex,
  schemaType,
  setSchemaType,
}: PageSeoSidebarProps) {
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL || '';

  // WHY: Tự động cập nhật Schema.org tương ứng làm mặc định khi chọn Template (Mental Model Resolver).
  // Vẫn cho phép người dùng chủ động chọn lại Schema khác ở dropdown bên dưới để ghi đè.
  const handleTemplateChange = (val: StaticPageTemplate) => {
    setTemplateType(val);
    const defaultSchema = TEMPLATE_DEFAULT_SCHEMA[val];
    if (defaultSchema) {
      setSchemaType(defaultSchema);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Trạng Thái Xuất Bản & Template */}
      <Card className="p-5 bg-slate-900/60 border border-white/10 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center justify-between">
          <span>Xuất Bản & Giao Diện</span>
          <Badge variant={isPublished ? 'published' : 'draft'}>
            {isPublished ? 'Đã Xuất Bản' : 'Bản Nháp'}
          </Badge>
        </h3>

        {/* Toggle Publish */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="space-y-0.5">
            <span className="text-sm text-slate-200 font-medium">Hiển thị công khai</span>
            <p className="text-xs text-slate-400">Cho phép người dùng truy cập ngoài Website</p>
          </div>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        {/* Layout Template Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Giao diện hiển thị (Template)</label>
          <select
            value={templateType}
            onChange={(e) => handleTemplateChange(e.target.value as StaticPageTemplate)}
            className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="DEFAULT">DEFAULT (WebPage - Văn bản chuẩn)</option>
            <option value="PROFILE_SHOWROOM">PROFILE_SHOWROOM (AboutPage - Giới thiệu Showroom)</option>
            <option value="TIMELINE">TIMELINE (HowTo - Lịch sử & Quy trình mua xe)</option>
            <option value="FINANCE">FINANCE (FinancialProduct - Dự toán & Trả góp)</option>
            <option value="CONTACT">CONTACT (ContactPage - Liên hệ Showroom & Bản đồ)</option>
            <option value="FAQ">FAQ (FAQPage - Hỏi đáp thường gặp & Hỗ trợ)</option>
          </select>
        </div>
      </Card>

      {/* 2. Cấu Hình Technical SEO & SERP */}
      <Card className="p-5 bg-slate-900/60 border border-white/10 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Cấu Hình Technical SEO</h3>

        {/* Meta Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Tiêu đề SEO (Meta Title)</label>
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={title || 'Nhập tiêu đề hiển thị trên Google...'}
            className="bg-slate-800 border-white/10 text-white text-sm"
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Mô tả SEO (Meta Description)</label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Mô tả tóm tắt nội dung trang (140-160 ký tự)..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Schema Type */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Dữ liệu có cấu trúc (Schema.org)</label>
            <span className="text-[11px] text-blue-400">Tự gán theo Template</span>
          </div>
          <select
            value={schemaType || 'WebPage'}
            onChange={(e) => setSchemaType(e.target.value as StaticPageSchemaType)}
            className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="WebPage">WebPage (Trang thông tin thông thường)</option>
            <option value="AboutPage">AboutPage (Trang giới thiệu Showroom)</option>
            <option value="HowTo">HowTo (Trang hướng dẫn / Quy trình mua xe)</option>
            <option value="FinancialProduct">FinancialProduct (Sản phẩm tài chính / Trả góp)</option>
            <option value="ContactPage">ContactPage (Trang liên hệ Showroom)</option>
            <option value="FAQPage">FAQPage (Trang hỏi đáp thường gặp)</option>
          </select>
        </div>

        {/* Canonical URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Canonical URL (Nếu có)</label>
          <Input
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder="https://example.com/gioi-thieu"
            className="bg-slate-800 border-white/10 text-white text-sm"
          />
        </div>

        {/* OG Image URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Ảnh đại diện chia sẻ (OG Image)</label>
          <Input
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://res.cloudinary.com/.../og-banner.jpg"
            className="bg-slate-800 border-white/10 text-white text-sm"
          />
        </div>

        {/* Robots NoIndex */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="space-y-0.5">
            <span className="text-sm text-slate-200 font-medium">Chặn Google lập chỉ mục (noindex)</span>
            <p className="text-xs text-slate-400">Không cho phép trang này xuất hiện trên Google Search</p>
          </div>
          <input
            type="checkbox"
            checked={noIndex}
            onChange={(e) => setNoIndex(e.target.checked)}
            className="w-5 h-5 accent-red-600 rounded cursor-pointer"
          />
        </div>
      </Card>

      {/* 3. Khối SERP Preview thời gian thực */}
      <SerpPreview
        title={title}
        metaTitle={metaTitle}
        slug={slug}
        metaDescription={metaDescription}
        siteUrl={siteUrl}
      />
    </div>
  );
}
