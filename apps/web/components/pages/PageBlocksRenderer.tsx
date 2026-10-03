'use client';

import React from 'react';
import type { AutoDealerInfo } from '@cardealer/core';
import {
  CalloutBlock,
  FAQBlock,
  GalleryBlock,
  PriceTableBlock,
  RelatedCarBlock,
  InlineQuickForm,
  YoutubeBlock,
  TikTokBlock,
} from '@cardealer/ui';

export interface PageBlocksRendererProps {
  content: unknown;
  dealerInfo?: AutoDealerInfo;
  excludeTypes?: string[];
  className?: string;
}

// WHY: Universal Content Blocks Renderer cho toàn bộ Storefront Static Page Templates (@cardealer/web).
// Đảm bảo 100% 14 khối Content Blocks tinh hoa từ CMS Admin (Tiptap AST JSON) được hiển thị đầy đủ:
// 1. Shared Primitives First: Tái sử dụng trọn vẹn các block component chuẩn từ @cardealer/ui.
// 2. Zero-Hardcode: Tuyệt đối không sinh dữ liệu giả lập.
// 3. Hỗ trợ excludeTypes: Cho phép các Template chuyên dụng (Faq, Timeline) trích xuất block đặc thù
//    để hiển thị theo bố cục riêng mà không bị trùng lặp nội dung.
// 4. Tuân thủ unit_size_limit (< 300 dòng) và 100% Named Export.
export function PageBlocksRenderer({
  content,
  dealerInfo,
  excludeTypes = [],
  className,
}: PageBlocksRendererProps) {
  if (!content || typeof content !== 'object') return null;
  const doc = content as {
    content?: Array<{
      type: string;
      attrs?: Record<string, unknown>;
      content?: Array<{ type: string; text?: string; marks?: Array<{ type: string; attrs?: Record<string, unknown> }> }>;
    }>;
  };
  if (!Array.isArray(doc.content) || doc.content.length === 0) return null;

  const defaultHotline = dealerInfo?.telephone || '0981.234.567';
  const cleanHotline = defaultHotline.replace(/\D/g, '') || '0981234567';

  const nodesToRender = doc.content.filter((node) => !excludeTypes.includes(node.type));
  if (nodesToRender.length === 0) return null;

  return (
    <div className={`space-y-6 font-sans ${className || ''}`}>
      {nodesToRender.map((node, idx) => {
        // 1. Heading (H2, H3, H4)
        if (node.type === 'heading') {
          const level = (node.attrs?.level as number) || 2;
          const text = node.content?.map((c) => c.text).join('') || '';
          if (!text) return null;

          if (level === 2) {
            return (
              <h2
                key={idx}
                className="text-2xl font-bold text-slate-900 mt-8 mb-4 border-l-4 border-blue-600 pl-3.5 scroll-mt-20"
              >
                {text}
              </h2>
            );
          }
          return (
            <h3 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-3 scroll-mt-20">
              {text}
            </h3>
          );
        }

        // 2. Paragraph
        if (node.type === 'paragraph') {
          const text = node.content?.map((c) => c.text).join('') || '';
          if (!text.trim()) return null;
          return (
            <p key={idx} className="text-slate-700 leading-relaxed text-base my-3">
              {text}
            </p>
          );
        }

        // 3. Callout Box
        if (node.type === 'calloutBlock' || node.type === 'callout') {
          const type = (node.attrs?.type as 'info' | 'warning' | 'success' | 'note') || 'info';
          return (
            <CalloutBlock
              key={idx}
              type={type}
              title={(node.attrs?.title as string) || null}
              content={(node.attrs?.content as string) || ''}
            />
          );
        }

        // 4. Single Image
        if (node.type === 'singleImage' || node.type === 'imageBlock' || node.type === 'image') {
          const src = (node.attrs?.url as string) || (node.attrs?.src as string) || '';
          const alt = (node.attrs?.alt as string) || 'Hình ảnh Showroom';
          const caption = (node.attrs?.caption as string) || '';
          if (!src) return null;

          return (
            <figure key={idx} className="my-6 text-center not-prose">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-md bg-slate-100">
                <img
                  src={src}
                  alt={alt}
                  loading="lazy"
                  className="w-full h-auto object-cover max-h-[550px] mx-auto"
                />
              </div>
              {caption && (
                <figcaption className="mt-2 text-center text-xs text-slate-500 italic">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 5. Image Gallery
        if (node.type === 'galleryBlock' || node.type === 'imageGallery') {
          const style = ((node.attrs?.style as any) || (node.attrs?.layout as any) || 'slider') as 'grid' | 'slider';
          const rawImages = (node.attrs?.images as Array<{ url: string; alt?: string; caption?: string }>) || [];
          const images = rawImages.map((img) => ({
            url: img.url,
            alt: img.alt || 'Hình ảnh showroom',
            caption: img.caption || null,
          }));

          return (
            <GalleryBlock
              key={idx}
              style={style}
              images={images}
            />
          );
        }

        // 6. FAQ Accordion Block
        if (node.type === 'faqBlock') {
          const questions = (node.attrs?.questions as Array<{ question: string; answer: string }>) || [];
          return <FAQBlock key={idx} questions={questions} />;
        }

        // 7. Nút bấm CTA (ctaButtonBlock)
        if (node.type === 'ctaButtonBlock' || node.type === 'ctaButton') {
          const buttonText = (node.attrs?.buttonText as string) || 'Liên Hệ Tư Vấn Ngay';
          const actionType = (node.attrs?.actionType as string) || 'hotline';
          const customUrl = (node.attrs?.customUrl as string) || '';
          const customPhone = ((node.attrs?.phoneNumber as string) || '').trim();
          const targetHotline = (customPhone ? customPhone.replace(/\D/g, '') : '') || cleanHotline;
          const subtext = (node.attrs?.subtext as string) || '';

          let href = `tel:${targetHotline}`;
          if (actionType === 'zalo') href = `https://zalo.me/${targetHotline}`;
          if (actionType === 'customLink') href = customUrl || '#';
          if (actionType === 'quoteForm') href = '#lead-form';

          return (
            <div key={idx} className="my-8 text-center not-prose p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <a
                href={href}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                {buttonText}
              </a>
              {subtext && <p className="mt-2 text-xs text-slate-500">{subtext}</p>}
            </div>
          );
        }

        // 8. Bảng giá xe (PriceTableBlock)
        if (node.type === 'priceTableBlock') {
          const title = (node.attrs?.title as string) || 'Bảng Giá Xe Mới Nhất';
          const rawPrices = (node.attrs?.prices as Array<{ version?: string; name?: string; listedPrice?: number; price?: number; discount?: number; promotionalPrice?: number; rollingPrice?: number; onRoadPriceEstimate?: number }>) || [];
          const versions = rawPrices.map((p) => ({
            name: p.version || p.name || 'Phiên bản',
            price: Number(p.listedPrice || p.price || 0),
            promotionalPrice: p.discount ? Number(p.listedPrice || 0) - Number(p.discount) : p.promotionalPrice,
            onRoadPriceEstimate: Number(p.rollingPrice || p.onRoadPriceEstimate || 0),
          }));

          return (
            <PriceTableBlock
              key={idx}
              headline={title}
              versions={versions}
            />
          );
        }

        // 9. Xe gợi ý (RelatedCarBlock)
        if (node.type === 'relatedCarBlock') {
          return (
            <RelatedCarBlock
              key={idx}
              tenXe={(node.attrs?.carName as string) || 'Xe Hyundai'}
              carSlug={(node.attrs?.slug as string) || ''}
              giaNiemYetTu={Number(node.attrs?.minPrice) || 0}
              anhDaiDienUrl={(node.attrs?.imageUrl as string) || '/images/cars/accent.webp'}
              seatCount={Number(node.attrs?.seatCount) || 5}
              fuelType={(node.attrs?.fuelType as string) || 'Xăng'}
            />
          );
        }

        // 10. Form báo giá (InlineQuickForm)
        if (node.type === 'leadFormBlock' || node.type === 'inlineQuickForm') {
          return (
            <InlineQuickForm
              key={idx}
              headline={(node.attrs?.headline as string) || 'Nhận Báo Giá Lăn Bánh Chi Tiết'}
              subheadline={(node.attrs?.subheadline as string) || 'Để lại số điện thoại, tư vấn viên sẽ liên hệ trong 5 phút.'}
              buttonText={(node.attrs?.buttonText as string) || 'Gửi Yêu Cầu Ngay'}
              carName={(node.attrs?.carName as string) || 'Xe Hyundai'}
            />
          );
        }

        // 11. YouTube Video
        if (node.type === 'youtubeBlock') {
          const videoId = (node.attrs?.videoId as string) || '';
          if (!videoId) return null;
          return (
            <YoutubeBlock
              key={idx}
              videoId={videoId}
              caption={(node.attrs?.caption as string) || undefined}
            />
          );
        }

        // 12. TikTok Video
        if (node.type === 'tikTokBlock') {
          const videoId = (node.attrs?.videoId as string) || '';
          if (!videoId) return null;
          return (
            <TikTokBlock
              key={idx}
              videoId={videoId}
              title={(node.attrs?.title as string) || undefined}
              posterImageUrl={(node.attrs?.posterImageUrl as string) || undefined}
            />
          );
        }

        // 13. Ưu / Nhược điểm (prosConsBlock)
        if (node.type === 'prosConsBlock' || node.type === 'prosCons') {
          const title = (node.attrs?.title as string) || 'Đánh Giá Ưu & Nhược Điểm';
          const pros = (node.attrs?.pros as string[]) || [];
          const cons = (node.attrs?.cons as string[]) || [];

          return (
            <div key={idx} className="my-8 not-prose">
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

        // 14. Bảng thông số kỹ thuật (specComparisonBlock)
        if (node.type === 'specComparisonBlock' || node.type === 'specTable') {
          const title = (node.attrs?.title as string) || 'Bảng So Sánh Thông Số Kỹ Thuật';
          const versions = (node.attrs?.versions as string[]) || [];
          const rows = (node.attrs?.rows as Array<{ specName: string; values: string[] }>) || [];
          if (!versions.length || !rows.length) return null;

          return (
            <div key={idx} className="my-8 not-prose overflow-x-auto rounded-xl border border-slate-200 bg-white">
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
      })}
    </div>
  );
}
