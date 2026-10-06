'use client';

import React from 'react';
import {
  FAQBlock,
  GalleryBlock,
  PriceTableBlock,
  RelatedCarBlock,
  InlineQuickForm,
  YoutubeBlock,
  TikTokBlock,
} from '@cardealer/ui';

export interface CommercialBlockProps {
  node: {
    type: string;
    attrs?: Record<string, unknown>;
  };
  cleanHotline: string;
}

// WHY: Render các khối thương mại, truyền thông và chuyển đổi CRO (Commercial & Media Blocks).
// Tách từ PageBlocksRenderer nhằm tuân thủ nghiêm ngặt principle unit_size_limit (< 300 dòng).
// Tái sử dụng 100% UI primitives từ @cardealer/ui.
export function CommercialBlock({ node, cleanHotline }: CommercialBlockProps) {
  // 1. Single Image
  if (node.type === 'singleImage' || node.type === 'imageBlock' || node.type === 'image') {
    const src = (node.attrs?.url as string) || (node.attrs?.src as string) || '';
    const alt = (node.attrs?.alt as string) || 'Hình ảnh Showroom';
    const caption = (node.attrs?.caption as string) || '';
    if (!src) return null;

    return (
      <figure className="my-6 text-center not-prose">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-md bg-slate-100">
          <img src={src} alt={alt} loading="lazy" className="w-full h-auto object-cover max-h-[550px] mx-auto" />
        </div>
        {caption && <figcaption className="mt-2 text-center text-xs text-slate-500 italic">{caption}</figcaption>}
      </figure>
    );
  }

  // 2. Image Gallery
  if (node.type === 'galleryBlock' || node.type === 'imageGallery') {
    const style = ((node.attrs?.style as any) || (node.attrs?.layout as any) || 'slider') as 'grid' | 'slider';
    const rawImages = (node.attrs?.images as Array<{ url: string; alt?: string; caption?: string }>) || [];
    const images = rawImages.map((img) => ({
      url: img.url,
      alt: img.alt || 'Hình ảnh showroom',
      caption: img.caption || null,
    }));

    return <GalleryBlock style={style} images={images} />;
  }

  // 3. FAQ Accordion Block
  if (node.type === 'faqBlock') {
    const title = (node.attrs?.title as string) || (node.attrs?.headline as string) || undefined;
    const questions = (node.attrs?.questions as Array<{ question: string; answer: string }>) || [];
    return <FAQBlock title={title} questions={questions} />;
  }

  // 4. Nút bấm CTA (ctaButtonBlock)
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
      <div className="my-8 text-center not-prose p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <a
          href={href}
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          {buttonText}
        </a>
        {subtext && <p className="mt-2 text-xs text-slate-500 whitespace-pre-line">{subtext}</p>}
      </div>
    );
  }

  // 5. Bảng giá xe (PriceTableBlock)
  if (node.type === 'priceTableBlock') {
    const title = (node.attrs?.title as string) || 'Bảng Giá Xe Mới Nhất';
    const rawPrices = (node.attrs?.prices as Array<{ version?: string; name?: string; listedPrice?: number; price?: number; discount?: number; promotionalPrice?: number; rollingPrice?: number; onRoadPriceEstimate?: number }>) || [];
    const versions = rawPrices.map((p) => ({
      name: p.version || p.name || 'Phiên bản',
      price: Number(p.listedPrice || p.price || 0),
      promotionalPrice: p.discount ? Number(p.listedPrice || 0) - Number(p.discount) : p.promotionalPrice,
      onRoadPriceEstimate: Number(p.rollingPrice || p.onRoadPriceEstimate || 0),
    }));

    return <PriceTableBlock headline={title} versions={versions} />;
  }

  // 6. Xe gợi ý (RelatedCarBlock)
  if (node.type === 'relatedCarBlock') {
    return (
      <RelatedCarBlock
        tenXe={(node.attrs?.carName as string) || 'Xe Hyundai'}
        carSlug={(node.attrs?.slug as string) || ''}
        giaNiemYetTu={Number(node.attrs?.minPrice) || 0}
        anhDaiDienUrl={(node.attrs?.imageUrl as string) || '/images/cars/accent.webp'}
        seatCount={Number(node.attrs?.seatCount) || 5}
        fuelType={(node.attrs?.fuelType as string) || 'Xăng'}
      />
    );
  }

  // 7. Form báo giá (InlineQuickForm)
  if (node.type === 'leadFormBlock' || node.type === 'inlineQuickForm') {
    return (
      <InlineQuickForm
        headline={(node.attrs?.headline as string) || 'Nhận Báo Giá Lăn Bánh Chi Tiết'}
        subheadline={(node.attrs?.subheadline as string) || 'Để lại số điện thoại, tư vấn viên sẽ liên hệ trong 5 phút.'}
        buttonText={(node.attrs?.buttonText as string) || 'Gửi Yêu Cầu Ngay'}
        carName={(node.attrs?.carName as string) || 'Xe Hyundai'}
      />
    );
  }

  // 8. YouTube Video
  if (node.type === 'youtubeBlock') {
    const videoId = (node.attrs?.videoId as string) || '';
    if (!videoId) return null;
    return <YoutubeBlock videoId={videoId} caption={(node.attrs?.caption as string) || undefined} />;
  }

  // 9. TikTok Video
  if (node.type === 'tikTokBlock') {
    const videoId = (node.attrs?.videoId as string) || '';
    if (!videoId) return null;
    return (
      <TikTokBlock
        videoId={videoId}
        title={(node.attrs?.title as string) || undefined}
        posterImageUrl={(node.attrs?.posterImageUrl as string) || undefined}
      />
    );
  }

  return null;
}
