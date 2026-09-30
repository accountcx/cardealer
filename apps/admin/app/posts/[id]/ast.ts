import { extractYoutubeId, extractTikTokId, type TiptapDoc } from '@cardealer/core';
import type { EditorBlock, PriceVersionItem } from './types';

// 🔄 Chuyển đổi danh sách Content Blocks sang cấu trúc Tiptap JSON AST Tree
export function serializeTiptapDoc(blocks: EditorBlock[]): TiptapDoc {
  const content = blocks.map((b) => {
    switch (b.type) {
      case 'heading':
        return {
          type: 'heading',
          attrs: { level: b.level || 2 },
          content: [{ type: 'text', text: b.content || '' }],
        };
      case 'callout':
        return {
          type: 'calloutBlock',
          attrs: {
            type: b.calloutType || 'info',
            title: b.title || '',
            content: b.content || '',
          },
        };
      case 'youtube': {
        const ytId = extractYoutubeId(b.videoId || b.videoUrl || '');
        return {
          type: 'youtubeBlock',
          attrs: {
            videoId: ytId || 'dQw4w9WgXcQ',
            videoUrl: b.videoUrl || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : ''),
            caption: b.caption || '',
          },
        };
      }
      case 'tiktok': {
        const ttId = extractTikTokId(b.videoId || b.videoUrl || '');
        return {
          type: 'tikTokBlock',
          attrs: {
            videoId: ttId || '7000000000000000000',
            videoUrl: b.videoUrl || (ttId ? `https://www.tiktok.com/@hyundai/video/${ttId}` : ''),
            title: b.title || b.caption || '',
            posterImageUrl: b.posterUrl || '',
          },
        };
      }
      case 'faq':
        return {
          type: 'faqBlock',
          attrs: {
            questions: b.faqs || [
              { question: 'Hyundai Santa Fe 2026 có mấy phiên bản?', answer: 'Có 5 phiên bản chính hãng.' },
            ],
          },
        };

      case 'relatedCar':
        return {
          type: 'relatedCarBlock',
          attrs: {
            carName: b.carName || 'Hyundai Accent 2026',
            slug: b.carSlug || 'hyundai-accent',
            minPrice: b.carPrice || 439000000,
            imageUrl: b.carImage || '/images/cars/accent.webp',
            seatCount: b.seatCount || 5,
            fuelType: b.fuelType || 'Xăng 1.5L',
          },
        };
      case 'priceTable':
        return {
          type: 'priceTableBlock',
          attrs: {
            title: b.title || 'Bảng Giá Xe Hyundai Mới Nhất',
            prices: b.prices || [
              { version: 'Hyundai Accent 1.5 AT', listedPrice: 489000000, discount: 30000000, rollingPrice: 512000000 },
              { version: 'Hyundai Creta 1.5 Cao Cấp', listedPrice: 699000000, discount: 45000000, rollingPrice: 735000000 },
            ],
          },
        };
      case 'leadForm':
        return {
          type: 'leadFormBlock',
          attrs: {
            headline: b.formHeadline || 'Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay',
            subheadline: b.formSubheadline || 'Để lại thông tin, chuyên viên tư vấn sẽ gửi bảng tính chi phí lăn bánh chính xác và số tiền trả góp hàng tháng qua Zalo trong 5 phút.',
            buttonText: b.formButtonText || 'Gửi Báo Giá Ngay',
            carName: b.carName || 'Hyundai Accent / Creta',
          },
        };
      case 'singleImage':
        return {
          type: 'singleImage',
          attrs: {
            url: b.imageUrl || '',
            alt: b.imageAlt || 'Hình ảnh minh họa xe Hyundai',
            caption: b.caption || '',
          },
        };
      case 'imageGallery':
        return {
          type: 'galleryBlock',
          attrs: {
            title: b.title || 'Bộ Sưu Tập Hình Ảnh Chi Tiết',
            style: b.galleryStyle || 'slider',
            images: b.galleryImages || [],
          },
        };
      case 'specTable':
        return {
          type: 'specComparisonBlock',
          attrs: {
            title: b.title || 'Bảng So Sánh Thông Số Kỹ Thuật',
            versions: b.specVersions || ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt'],
            rows: b.specRows || [],
          },
        };
      case 'ctaButton':
        return {
          type: 'ctaButtonBlock',
          attrs: {
            buttonText: b.ctaButtonText || 'Gọi Hotline Tư Vấn Ngay',
            actionType: b.ctaActionType || 'hotline',
            customUrl: b.ctaCustomUrl || '',
            phoneNumber: b.ctaPhone || '',
            subtext: b.ctaSubtext || 'Hỗ trợ tư vấn giá lăn bánh & ưu đãi độc quyền 24/7',
            variant: b.ctaVariant || 'red',
          },
        };
      case 'prosCons':
        return {
          type: 'prosConsBlock',
          attrs: {
            title: b.title || 'Đánh Giá Ưu & Nhược Điểm',
            pros: b.pros || [],
            cons: b.cons || [],
          },
        };
      case 'paragraph':
      default:
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: b.content || '' }],
        };
    }
  });

  return { type: 'doc', content };
}

// 🔄 Chuyển đổi ngược từ Tiptap JSON AST Tree sang danh sách Content Blocks
export function deserializeTiptapDoc(doc: TiptapDoc): EditorBlock[] {
  if (!doc || !Array.isArray(doc.content)) return [];
  return doc.content.map((node, idx): EditorBlock => {
    const id = String(idx + 1);
    const text = node.content && node.content[0] ? (node.content[0].text || '') : '';

    if (node.type === 'heading') {
      return {
        id,
        type: 'heading',
        level: (node.attrs?.level as number) || 2,
        content: text,
      };
    }
    if (node.type === 'calloutBlock') {
      return {
        id,
        type: 'callout',
        calloutType: (node.attrs?.type as any) || 'info',
        title: (node.attrs?.title as string) || '',
        content: (node.attrs?.content as string) || '',
      };
    }
    if (node.type === 'youtubeBlock') {
      return {
        id,
        type: 'youtube',
        videoId: (node.attrs?.videoId as string) || '',
        videoUrl: (node.attrs?.videoUrl as string) || '',
        caption: (node.attrs?.caption as string) || '',
      };
    }
    if (node.type === 'tikTokBlock') {
      return {
        id,
        type: 'tiktok',
        videoId: (node.attrs?.videoId as string) || '',
        videoUrl: (node.attrs?.videoUrl as string) || '',
        title: (node.attrs?.title as string) || '',
        posterUrl: (node.attrs?.posterImageUrl as string) || '',
      };
    }
    if (node.type === 'faqBlock') {
      return {
        id,
        type: 'faq',
        faqs: (node.attrs?.questions as any) || [],
      };
    }
    // Legacy gatedContent → chuyển thành ctaButton (Gated Content đã bị gỡ bỏ)
    if (node.type === 'gatedContent') {
      return {
        id,
        type: 'ctaButton',
        ctaButtonText: ((node.attrs?.title as string) || 'Gọi Hotline Nhận Báo Giá Ưu Đãi').replace(/^📞\s*/, ''),
        ctaActionType: 'hotline',
        ctaCustomUrl: '',
        ctaSubtext: (node.attrs?.description as string) || 'Tư vấn tận tâm - Nhận báo giá lăn bánh kèm ưu đãi tiền mặt tốt nhất',
        ctaVariant: 'red',
      };
    }
    if (node.type === 'priceTableBlock') {
      return {
        id,
        type: 'priceTable',
        title: (node.attrs?.title as string) || 'Bảng Giá Xe Hyundai Mới Nhất',
        prices: (node.attrs?.prices as PriceVersionItem[]) || [],
      };
    }
    if (node.type === 'relatedCarBlock') {
      return {
        id,
        type: 'relatedCar',
        carName: (node.attrs?.carName as string) || 'Hyundai Accent 2026',
        carSlug: (node.attrs?.slug as string) || 'hyundai-accent',
        carPrice: Number(node.attrs?.minPrice) || 439000000,
        carImage: (node.attrs?.imageUrl as string) || '/images/cars/accent.webp',
        seatCount: Number(node.attrs?.seatCount) || 5,
        fuelType: (node.attrs?.fuelType as string) || 'Xăng 1.5L',
      };
    }
    if (node.type === 'leadFormBlock' || node.type === 'inlineQuickForm') {
      return {
        id,
        type: 'leadForm',
        formHeadline: (node.attrs?.headline as string) || 'Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay',
        formSubheadline: (node.attrs?.subheadline as string) || 'Để lại thông tin, chuyên viên tư vấn sẽ gửi bảng tính chi phí lăn bánh chính xác qua Zalo trong 5 phút.',
        formButtonText: (node.attrs?.buttonText as string) || 'Gửi Báo Giá Ngay',
        carName: (node.attrs?.carName as string) || 'Hyundai Accent / Creta',
      };
    }
    if (node.type === 'singleImage' || node.type === 'imageBlock' || node.type === 'image') {
      return {
        id,
        type: 'singleImage',
        imageUrl: (node.attrs?.url as string) || (node.attrs?.src as string) || '',
        imageAlt: (node.attrs?.alt as string) || '',
        caption: (node.attrs?.caption as string) || '',
      };
    }
    if (node.type === 'imageGallery' || node.type === 'galleryBlock') {
      return {
        id,
        type: 'imageGallery',
        title: (node.attrs?.title as string) || 'Bộ Sưu Tập Hình Ảnh Chi Tiết',
        galleryStyle: ((node.attrs?.style as any) || (node.attrs?.layout as any) || 'slider'),
        galleryImages: (node.attrs?.images as any) || [],
      };
    }
    if (node.type === 'specTable' || node.type === 'specComparisonBlock') {
      return {
        id,
        type: 'specTable',
        title: (node.attrs?.title as string) || 'Bảng So Sánh Thông Số Kỹ Thuật',
        specVersions: (node.attrs?.versions as string[]) || ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt'],
        specRows: (node.attrs?.rows as any) || [],
      };
    }
    if (node.type === 'ctaButton' || node.type === 'ctaButtonBlock') {
      return {
        id,
        type: 'ctaButton',
        ctaButtonText: ((node.attrs?.buttonText as string) || 'Gọi Hotline Tư Vấn Ngay').replace(/^📞\s*/, ''),
        ctaActionType: (node.attrs?.actionType as any) || 'hotline',
        ctaCustomUrl: (node.attrs?.customUrl as string) || '',
        ctaPhone: (node.attrs?.phoneNumber as string) || '',
        ctaSubtext: (node.attrs?.subtext as string) || '',
        ctaVariant: (node.attrs?.variant as any) || 'red',
      };
    }
    if (node.type === 'prosCons' || node.type === 'prosConsBlock') {
      return {
        id,
        type: 'prosCons',
        title: (node.attrs?.title as string) || 'Đánh Giá Ưu & Nhược Điểm',
        pros: (node.attrs?.pros as string[]) || [],
        cons: (node.attrs?.cons as string[]) || [],
      };
    }
    return {
      id,
      type: 'paragraph',
      content: text,
    };
  });
}
