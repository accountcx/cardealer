'use client';

// 🧠 Mental Model: Studio Biên Tập Bài Viết & Động Cơ Phân Tích SEO Real-Time (apps/admin).
// 1. Phù hợp 100% với Design System của Admin Shell (#0b0f17, glassmorphism, border-white/10, text-white).
// 2. Tương thích chuẩn Server-Side Tiptap JSON AST Tree: Quản lý và chuyển đổi hai chiều trực quan.
// 3. Tích hợp trực tiếp động cơ chấm điểm SEO Real-Time `calculateSeoScore()` từ @cardealer/core:
//    - Chấm điểm 10 tiêu chí tức thì mỗi khi biên tập viên gõ phím.
//    - Cảnh báo trực quan theo 3 cấp độ: Tốt (Xanh), Cần cải thiện (Vàng), Yếu (Đỏ).
// 4. Publish Gatekeeper: Chặn ngay trên giao diện nếu bài viết còn ký tự giữ chỗ chưa hoàn thiện [...].
// 5. Cảnh báo tự động sinh 301 Redirect khi biên tập viên thay đổi Slug của bài viết.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams, usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Save,
  Send,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Video,
  FileQuestion,
  Car,
  Table as TableIcon,
  Info,
  Image as ImageIcon,
  Images,
  ImagePlus,
  Upload,
  SlidersHorizontal,
  MousePointerClick,
  Scale,
  PlusCircle,
  MinusCircle,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  Skeleton,
  Select,
  Textarea,
  Switch,
  cn,
} from '@cardealer/ui';
import { postService, type PostItem, type CategoryItem } from '../../../services/post.service';
import { catalogService, type CarSummary } from '../../../services/catalog.service';
import { calculateSeoScore, extractYoutubeId, extractTikTokId, type SeoAnalysisResult, type TiptapDoc } from '@cardealer/core';
import { useAuth } from '../../../contexts/AuthContext';
import { AccessDenied } from '../../components/AccessDenied';
import { MediaPickerModal } from '../../components/MediaPickerModal';

// Các loại Block trực quan chuẩn E-E-A-T & High Conversion
type BlockType =
  | 'paragraph'
  | 'heading'
  | 'callout'
  | 'youtube'
  | 'tiktok'
  | 'faq'
  | 'relatedCar'
  | 'priceTable'
  | 'leadForm'
  | 'singleImage'
  | 'imageGallery'
  | 'specTable'
  | 'ctaButton'
  | 'prosCons';

export interface PriceVersionItem {
  version: string;
  listedPrice: number;
  discount: number;
  rollingPrice: number;
}

interface EditorBlock {
  id: string;
  type: BlockType;
  level?: number; // Cho heading (2, 3)
  content?: string; // Cho paragraph, heading, callout
  title?: string;
  calloutType?: 'info' | 'warning' | 'success' | 'note';
  videoId?: string;
  videoUrl?: string;
  caption?: string;
  posterUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;

  carName?: string;
  carSlug?: string;
  carPrice?: number;
  carImage?: string;
  seatCount?: number;
  fuelType?: string;
  prices?: PriceVersionItem[];
  carFilter?: string; // Bộ lọc dòng xe cho PriceTable Block
  formHeadline?: string;
  formSubheadline?: string;
  formButtonText?: string;
  // Khối ảnh đơn có Alt Text & Chú thích
  imageUrl?: string;
  imageAlt?: string;
  // Thư viện ảnh lướt / Carousel
  galleryStyle?: 'slider' | 'grid';
  galleryImages?: Array<{ url: string; alt?: string; caption?: string }>;
  // Bảng so sánh thông số kỹ thuật
  specVersions?: string[];
  specRows?: Array<{ specName: string; values: string[] }>;
  // Nút bấm CTA
  ctaButtonText?: string;
  ctaActionType?: 'hotline' | 'zalo' | 'quoteForm' | 'customLink';
  ctaCustomUrl?: string;
  ctaPhone?: string;
  ctaSubtext?: string;
  ctaVariant?: 'red' | 'blue' | 'emerald';
  // Khối Ưu / Nhược điểm
  pros?: string[];
  cons?: string[];
}

const CALLOUT_THEMES: Record<string, {
  label: string;
  badge: string;
  icon: string;
  cardClass: string;
  headerTextClass: string;
  selectBorderClass: string;
  placeholderTitle: string;
  placeholderContent: string;
  previewCue: string;
}> = {
  info: {
    label: 'Thông tin (Info)',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: 'ℹ️',
    cardClass: 'border-l-4 border-l-blue-600 border-blue-500/40 bg-blue-950/20 shadow-blue-950/20',
    headerTextClass: 'text-blue-400',
    selectBorderClass: 'border-blue-500/40 text-blue-300',
    placeholderTitle: 'Ví dụ: Lưu ý khi chuẩn bị hồ sơ vay mua xe trả góp...',
    placeholderContent: 'Nhập nội dung lưu ý, hướng dẫn chi tiết dành cho người đọc...',
    previewCue: 'Nền blue-50 nhạt, Viền blue-600, Chữ xám chì slate-700',
  },
  warning: {
    label: 'Cảnh báo (Warning)',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: '⚠️',
    cardClass: 'border-l-4 border-l-amber-500 border-amber-500/40 bg-amber-950/20 shadow-amber-950/20',
    headerTextClass: 'text-amber-400',
    selectBorderClass: 'border-amber-500/40 text-amber-300',
    placeholderTitle: 'Ví dụ: Cảnh báo rủi ro khi mua phụ tùng trôi nổi...',
    placeholderContent: 'Nhập nội dung cảnh báo các nguy cơ hoặc điều kiện bảo hành...',
    previewCue: 'Nền amber-50 hổ phách, Viền amber-500, Chữ amber-900',
  },
  success: {
    label: 'Ưu đãi (Success)',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: '🎁',
    cardClass: 'border-l-4 border-l-emerald-500 border-emerald-500/40 bg-emerald-950/20 shadow-emerald-950/20',
    headerTextClass: 'text-emerald-400',
    selectBorderClass: 'border-emerald-500/40 text-emerald-300',
    placeholderTitle: 'Ví dụ: Gói quà tặng phụ kiện chính hãng 15 triệu đồng...',
    placeholderContent: 'Nhập thông tin quà tặng, chiết khấu đặc biệt hoặc khuyến mãi...',
    previewCue: 'Nền mint emerald-50, Viền emerald-500, Chữ emerald-900',
  },
  note: {
    label: 'Ghi chú (Note)',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    icon: '📝',
    cardClass: 'border-l-4 border-l-slate-400 border-slate-500/40 bg-slate-900/50 shadow-slate-950/20',
    headerTextClass: 'text-slate-300',
    selectBorderClass: 'border-slate-500/40 text-slate-300',
    placeholderTitle: 'Ví dụ: Ghi chú cập nhật từ ban biên tập...',
    placeholderContent: 'Nhập ghi chú biên tập, chú thích thêm cho bài viết...',
    previewCue: 'Nền slate-100 xám mát, Viền slate-400, Chữ slate-600',
  },
};

export default function PostEditorPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const rawId = params?.id as string | undefined;
  const isNew = rawId === 'new' || pathname.endsWith('/new') || !rawId;
  const postId = isNew ? 'new' : (rawId || '');

  const { user, loading: authLoading, can } = useAuth();

  // State dữ liệu bài viết
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [availableCars, setAvailableCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Form Fields
  const [tieuDe, setTieuDe] = useState('');
  const [slug, setSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [anhDaiDienUrl, setAnhDaiDienUrl] = useState('');
  const [anhDaiDienAlt, setAnhDaiDienAlt] = useState('');

  // Media Picker Modal State
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    | { type: 'featured' }
    | { type: 'singleImage'; blockId: string }
    | { type: 'gallery'; blockId: string }
    | null
  >(null);
  const [tomTat, setTomTat] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled' | 'archived'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState(0);
  const [focusKeyword, setFocusKeyword] = useState('');

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  // Block Content State
  const [blocks, setBlocks] = useState<EditorBlock[]>([
    { id: '1', type: 'paragraph', content: 'Giới thiệu tổng quan về mẫu xe Hyundai thế hệ mới...' },
  ]);

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Tự động sinh Slug từ Tiêu đề (nếu chưa tự nhập)
  const handleTitleChange = (val: string) => {
    setTieuDe(val);
    if (isNew || !slug || slug === toSlug(tieuDe)) {
      setSlug(toSlug(val));
    }
  };

  function toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // 💰 Helper format tiền tệ VNĐ có phân cách hàng nghìn (ví dụ: 529000000 -> "529.000.000")
  function formatVnd(value: number | string | undefined | null): string {
    if (value === undefined || value === null || value === '') return '';
    const num = typeof value === 'number' ? value : Number(String(value).replace(/\D/g, ''));
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('vi-VN');
  }

  // Chuyển chuỗi tiền tệ phân cách về số nguyên (ví dụ: "529.000.000" -> 529000000)
  function parseVnd(value: string): number {
    const clean = value.replace(/\D/g, '');
    return clean ? Number(clean) : 0;
  }

  // Chuyển số tiền sang dạng triệu rút gọn (ví dụ: 529000000 -> "529 tr", 19000000 -> "19 tr")
  function toShortMillion(value: number | undefined | null): string {
    if (!value || isNaN(value) || value === 0) return '';
    if (value >= 1000000000) {
      const ty = (value / 1000000000).toFixed(value % 1000000000 === 0 ? 0 : 2);
      return `${ty} tỷ`;
    }
    if (value >= 1000000) {
      const tr = (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1);
      return `${tr} tr`;
    }
    return `${value.toLocaleString('vi-VN')} đ`;
  }

  // Tải danh mục
  useEffect(() => {
    postService
      .getCategories()
      .then((res: any) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setCategories(list);
        if (isNew && list.length > 0) {
          setCategoryId((prev) => prev || list[0].id);
        }
      })
      .catch((err) => console.error('[Post Editor] Lỗi tải chuyên mục:', err));

    // 🧠 Tải danh sách xe từ Database để hỗ trợ nạp dữ liệu cho RelatedCar & PriceTable Block
    catalogService
      .getCars()
      .then((res: any) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setAvailableCars(list);
      })
      .catch((err) => console.error('[Post Editor] Lỗi tải danh mục xe:', err));
  }, [isNew]);

  // Tải dữ liệu bài viết nếu chế độ Edit
  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    if (postId && postId !== 'new') {
      setLoading(true);
      postService
        .getPostById(postId)
        .then((res) => {
          if (res.success && res.data) {
            const p = res.data;
            setTieuDe(p.tieuDe || '');
            setSlug(p.slug || '');
            setOriginalSlug(p.slug || '');
            setCategoryId(p.categoryId || '');
            setAnhDaiDienUrl(p.anhDaiDienUrl || '');
            setAnhDaiDienAlt(p.anhDaiDienAlt || '');
            setTomTat(p.tomTat || '');
            setStatus(p.status);
            setIsFeatured(p.isFeatured);
            setFeaturedOrder(p.featuredOrder);
            setPreviewToken(p.previewToken || null);

            // Chuyển đổi Tiptap JSON AST sang blocks nội bộ
            if (p.noiDung && typeof p.noiDung === 'object') {
              const converted = deserializeTiptapDoc(p.noiDung as TiptapDoc);
              if (converted.length > 0) {
                setBlocks(converted);
              }
            }
          }
        })
        .catch((err) => {
          setPageError(err instanceof Error ? err.message : 'Lỗi tải bài viết');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isNew, postId]);

  // Chuyển đổi Block List sang Tiptap JSON Tree
  const tiptapDoc = useMemo((): TiptapDoc => {
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
  }, [blocks]);

  // Deserialize Tiptap AST sang Editor Block
  function deserializeTiptapDoc(doc: TiptapDoc): EditorBlock[] {
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

  // Chấm điểm SEO Real-Time với 10 Tiêu Chí
  const seoResult: SeoAnalysisResult = useMemo(() => {
    return calculateSeoScore({
      tieuDe,
      slug,
      noiDung: tiptapDoc,
      focusKeyword: focusKeyword.trim() || tieuDe.slice(0, 30),
      metaDescription: metaDescription || tomTat,
    });
  }, [tieuDe, slug, tiptapDoc, focusKeyword, metaDescription, tomTat]);

  // 🧠 Danh sách toàn bộ phiên bản xe từ kho hệ thống phục vụ chọn trực tiếp ở từng dòng bảng giá
  const allVersionOptions = useMemo(() => {
    const result: Array<{
      value: string;
      label: string;
      fullLabel: string;
      carId: string;
      carName: string;
      listedPrice: number;
      discount: number;
      rollingPrice: number;
    }> = [];

    availableCars.forEach((c) => {
      (c.versions || []).forEach((v) => {
        const cleanVerName = v.tenPhienBan.toLowerCase().startsWith(c.tenXe.toLowerCase())
          ? v.tenPhienBan
          : `${c.tenXe} ${v.tenPhienBan}`;
        const listed = v.giaNiemYet || 0;
        const promo = v.giaKhuyenMai || listed;
        const discount = Math.max(0, listed - promo);
        // Thuế trước bạ 10% tại Nghệ An + 3.500.000đ biển số, đăng kiểm, bảo trì & TNDS
        const rolling = Math.round(promo * 1.10 + 3500000);

        result.push({
          value: `${c.id}::${v.id}`,
          label: cleanVerName,
          fullLabel: cleanVerName,
          carId: c.id,
          carName: c.tenXe,
          listedPrice: listed,
          discount,
          rollingPrice: rolling,
        });
      });
    });

    return result;
  }, [availableCars]);

  // Thao tác với Block
  const addBlock = (type: BlockType) => {
    const newId = String(Date.now());
    const newBlock: EditorBlock = {
      id: newId,
      type,
      content: type === 'heading' ? 'Tiêu đề đoạn mới' : type === 'paragraph' ? 'Nhập nội dung đoạn văn...' : '',
      level: 2,
      calloutType: 'info',
      title:
        type === 'priceTable'
              ? 'Bảng Giá & Chi Phí Lăn Bánh Tham Khảo (Tháng 09/2026)'
              : type === 'imageGallery'
                ? 'Bộ Sưu Tập Hình Ảnh Chi Tiết Ngoại Thất & Nội Thất'
                : type === 'specTable'
                  ? 'Bảng So Sánh Thông Số Kỹ Thuật Giữa Các Phiên Bản'
                  : type === 'prosCons'
                    ? 'Đánh Giá Ưu Điểm & Nhược Điểm Thực Tế'
                    : '',
      faqs:
        type === 'faq'
          ? [
            {
              question: 'Giá xe đã bao gồm các loại thuế phí lăn bánh chưa?',
              answer: 'Giá niêm yết đã bao gồm 10% VAT nhưng chưa bao gồm lệ phí trước bạ và phí đăng ký biển số.',
            },
          ]
          : undefined,
      prices:
        type === 'priceTable'
          ? (() => {
            const matchedCar = availableCars.find((c) =>
              tieuDe.toLowerCase().includes(c.tenXe.toLowerCase()) ||
              c.tenXe.toLowerCase().includes(tieuDe.toLowerCase())
            ) || availableCars[0];
            return matchedCar && matchedCar.versions && matchedCar.versions.length > 0
              ? matchedCar.versions.map((v) => {
                const listed = v.giaNiemYet || 0;
                const promo = v.giaKhuyenMai || listed;
                const discount = Math.max(0, listed - promo);
                const cleanVer = v.tenPhienBan.toLowerCase().startsWith(matchedCar.tenXe.toLowerCase())
                  ? v.tenPhienBan
                  : `${matchedCar.tenXe} ${v.tenPhienBan}`;
                return {
                  version: cleanVer,
                  listedPrice: listed,
                  discount,
                  rollingPrice: Math.round(promo * 1.10 + 3500000),
                };
              })
              : [
                { version: 'Hyundai Accent 1.5 AT Tiêu Chuẩn', listedPrice: 489000000, discount: 30000000, rollingPrice: 512000000 },
                { version: 'Hyundai Accent 1.5 AT Đặc Biệt', listedPrice: 569000000, discount: 35000000, rollingPrice: 595000000 },
                { version: 'Hyundai Accent 1.5 AT Cao Cấp', listedPrice: 629000000, discount: 35000000, rollingPrice: 665000000 },
              ];
          })()
          : undefined,
      carFilter:
        type === 'priceTable'
          ? (availableCars.find((c) =>
            tieuDe.toLowerCase().includes(c.tenXe.toLowerCase()) ||
            c.tenXe.toLowerCase().includes(tieuDe.toLowerCase())
          )?.id || (availableCars.length > 0 ? availableCars[0].id : 'all'))
          : undefined,
      carName:
        type === 'relatedCar'
          ? (availableCars[0]?.tenXe || 'Hyundai Accent 2026')
          : type === 'leadForm'
            ? (availableCars[0]?.tenXe || 'Hyundai Accent / Creta')
            : undefined,
      carSlug: type === 'relatedCar' ? (availableCars[0]?.slug || 'hyundai-accent') : undefined,
      carPrice: type === 'relatedCar' ? (availableCars[0]?.minPrice || 439000000) : undefined,
      carImage: type === 'relatedCar' ? (availableCars[0]?.anhDaiDienUrl || '/images/cars/accent.webp') : undefined,
      seatCount: type === 'relatedCar' ? (availableCars[0]?.versions?.[0]?.seatCount || 5) : undefined,
      fuelType: type === 'relatedCar' ? (availableCars[0]?.fuelType || 'Xăng 1.5L Smartstream') : undefined,
      formHeadline: type === 'leadForm' ? 'Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay' : undefined,
      formSubheadline: type === 'leadForm' ? 'Để lại thông tin, chuyên viên tư vấn sẽ gửi bảng tính chi phí lăn bánh chính xác và số tiền trả góp hàng tháng qua Zalo trong 5 phút.' : undefined,
      formButtonText: type === 'leadForm' ? 'Gửi Báo Giá Ngay' : undefined,
      // Khối ảnh đơn
      imageUrl: type === 'singleImage' ? '' : undefined,
      imageAlt: type === 'singleImage' ? 'Khoang lái xe Hyundai Tucson phiên bản Cao cấp' : undefined,
      caption: type === 'singleImage' ? 'Khoang lái Tucson phiên bản Cao cấp bọc da nâu sang trọng' : undefined,
      // Thư viện ảnh lướt / Carousel
      galleryStyle: type === 'imageGallery' ? 'slider' : undefined,
      galleryImages:
        type === 'imageGallery'
          ? [
            { url: '', alt: 'Ngoại thất đầu xe', caption: 'Lưới tản nhiệt dạng tham số tích hợp đèn LED ban ngày ẩn' },
            { url: '', alt: 'Khoang lái tiện nghi', caption: 'Cụm màn hình kép 12.3 inch hướng về phía người lái' },
            { url: '', alt: 'Không gian hàng ghế sau', caption: 'Khoang hành khách rộng rãi và độ ngả lưng ghế thoải mái' },
          ]
          : undefined,
      // Bảng so sánh thông số kỹ thuật
      specVersions:
        type === 'specTable'
          ? ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt', 'Bản Cao Cấp']
          : undefined,
      specRows:
        type === 'specTable'
          ? [
            { specName: 'Động cơ & Hộp số', values: ['1.5L Xăng (115 Hp) - iVT', '1.5L Xăng (115 Hp) - iVT', '1.5L Turbo (160 Hp) - 7DCT'] },
            { specName: 'Kích thước mâm lốp', values: ['17 inch Hợp kim', '18 inch Phay bóng', '19 inch Thể thao N-Line'] },
            { specName: 'Hệ thống đèn chiếu sáng', values: ['Bi-Halogen Projector', 'LED toàn phần tự động', 'Full LED thích ứng Matrix'] },
            { specName: 'Gói an toàn SmartSense', values: ['Cơ bản (ABS, ESC, HAC)', 'Cảnh báo điểm mù + Cam lùi', 'Full SmartSense chủ động'] },
            { specName: 'Ghế bọc da & Làm mát', values: ['Ghế nỉ cao cấp', 'Da đục lỗ làm mát ghế', 'Da Nappa đục lỗ + Nhớ vị trí'] },
          ]
          : undefined,
      // Nút bấm CTA
      ctaButtonText: type === 'ctaButton' ? 'Gọi Hotline Nhận Báo Giá Ưu Đãi' : undefined,
      ctaActionType: type === 'ctaButton' ? 'hotline' : undefined,
      ctaCustomUrl: type === 'ctaButton' ? '' : undefined,
      ctaSubtext: type === 'ctaButton' ? 'Tư vấn tận tâm - Nhận báo giá lăn bánh kèm ưu đãi tiền mặt tốt nhất' : undefined,
      ctaVariant: type === 'ctaButton' ? 'red' : undefined,
      // Khối Ưu / Nhược điểm
      pros:
        type === 'prosCons'
          ? [
            'Thiết kế ngoại thất Sensuous Sportiness thời thượng, bắt mắt',
            'Khoang nội thất rộng rãi hàng đầu phân khúc, trang bị nhiều tiện nghi hiện đại',
            'Động cơ Smartstream êm ái, vận hành mượt mà và tiết kiệm nhiên liệu',
            'Gói công nghệ an toàn Hyundai SmartSense cao cấp bảo vệ tối đa',
          ]
          : undefined,
      cons:
        type === 'prosCons'
          ? [
            'Phiên bản Tiêu chuẩn vẫn trang bị phanh tay cơ và ghế nỉ',
            'Khả năng cách âm gầm ở dải tốc độ cao trên 100km/h còn tiếng ồn nhẹ',
          ]
          : undefined,
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<EditorBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    setBlocks((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Submit Lưu/Xuất Bản Bài Viết
  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (!tieuDe || tieuDe.length < 20) {
      setToast({ type: 'error', message: 'Tiêu đề bài viết phải có ít nhất 20 ký tự' });
      return;
    }
    if (!slug) {
      setToast({ type: 'error', message: 'Đường dẫn tĩnh (Slug) không được để trống' });
      return;
    }
    if (!categoryId) {
      setToast({ type: 'error', message: 'Vui lòng chọn chuyên mục cho bài viết' });
      return;
    }
    if (!anhDaiDienUrl) {
      setToast({ type: 'error', message: 'Vui lòng cung cấp link ảnh đại diện bài viết' });
      return;
    }

    // 🧠 Publish Gatekeeper: Chặn xuất bản nếu còn placeholder [...]
    if (targetStatus === 'published') {
      const fullText = blocks.map((b) => b.content || b.title || '').join(' ');
      const placeholderRegex = /\[\s*\.\.\.\s*\]|\[\s*…\s*\]|\[cần bổ sung\]|\[todo\]/i;
      if (placeholderRegex.test(fullText)) {
        setToast({
          type: 'error',
          message:
            'Chặn xuất bản: Bài viết vẫn còn ký tự giữ chỗ chưa hoàn thiện ([...], [cần bổ sung], hoặc [todo]).',
        });
        return;
      }
    }

    const payload = {
      tieuDe,
      slug,
      categoryId,
      anhDaiDienUrl,
      anhDaiDienAlt: anhDaiDienAlt || tieuDe,
      tomTat: tomTat || null,
      noiDung: tiptapDoc,
      status: targetStatus,
      isFeatured,
      featuredOrder,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      canonicalUrl: canonicalUrl || null,
      noIndex,
    };

    try {
      setSaving(true);
      if (isNew) {
        const res = await postService.createPost(payload);
        setToast({ type: 'success', message: 'Tạo bài viết mới thành công!' });
        setTimeout(() => router.push('/posts'), 1200);
      } else {
        await postService.updatePost(postId, payload);
        setStatus(targetStatus);
        setToast({ type: 'success', message: 'Cập nhật bài viết thành công!' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu bài viết';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  // 🧠 Live Preview Handler: Tự động lưu những gì đang có trên form vào DB nháp rồi mở xem trước
  const handlePreview = async () => {
    if (!tieuDe.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập tiêu đề bài viết trước khi xem trước!' });
      return;
    }

    try {
      setSaving(true);
      const targetStatus = status || 'draft';
      const effectiveSlug = slug.trim() || toSlug(tieuDe);
      if (!slug.trim()) setSlug(effectiveSlug);

      const payload = {
        tieuDe,
        slug: effectiveSlug,
        categoryId: categoryId || undefined,
        anhDaiDienUrl,
        anhDaiDienAlt: anhDaiDienAlt || tieuDe,
        tomTat: tomTat || null,
        noiDung: tiptapDoc,
        status: targetStatus,
        isFeatured,
        featuredOrder,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        noIndex,
      };

      let activeToken = previewToken;

      if (isNew) {
        const res = await postService.createPost(payload);
        if (res.success && res.data) {
          activeToken = res.data.previewToken || null;
          setPreviewToken(activeToken);
          setToast({ type: 'success', message: 'Đã lưu bản nháp và mở tab xem trước!' });
          window.history.replaceState(null, '', `/posts/${res.data.id}`);
        }
      } else {
        const res = await postService.updatePost(postId, payload);
        if (res.success && res.data) {
          activeToken = res.data.previewToken || previewToken;
          setPreviewToken(activeToken);
          setToast({ type: 'success', message: 'Đã đồng bộ nội dung đang sửa vào xem trước!' });
        }
      }

      if (activeToken) {
        const url = `${window.location.origin.replace(':3001', ':3002')}/tin-tuc/preview?token=${activeToken}`;
        window.open(url, '_blank');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi chuẩn bị xem trước bài viết';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  // RBAC Guard
  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <div className="grid grid-cols-12 gap-8">
          <Skeleton className="col-span-8 h-[600px] bg-slate-800 rounded-2xl" />
          <Skeleton className="col-span-4 h-[600px] bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!can('posts:write')) {
    return <AccessDenied message="Bạn không có quyền chỉnh sửa hoặc xuất bản bài viết." />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/posts">
            <Button variant="ghost" size="sm" className="h-10 px-3 text-slate-400 hover:text-slate-100">
              <ChevronLeft size={18} />
              Quay lại
            </Button>
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 truncate max-w-md">
            {isNew ? 'Viết bài mới' : tieuDe || 'Chỉnh sửa bài viết'}
          </h1>
          <Badge
            variant={
              status === 'published'
                ? 'published'
                : status === 'draft'
                  ? 'draft'
                  : status === 'scheduled'
                    ? 'outline'
                    : 'danger'
            }
          >
            {status === 'published' ? 'Đã xuất bản' : status === 'draft' ? 'Bản nháp' : status}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePreview}
            disabled={saving}
            className="flex items-center gap-2 h-11 px-4 font-semibold text-xs"
            title="Xem trước nội dung thực tế (Tự động đồng bộ những gì đang có)"
          >
            <Eye size={16} />
            {saving ? 'Đang chuẩn bị...' : 'Xem trước'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 h-11 px-4 font-semibold text-xs"
          >
            <Save size={16} />
            Lưu nháp
          </Button>

          <Button
            variant="accent"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 h-11 px-5 font-semibold text-xs shadow-lg shadow-cyan-500/20"
          >
            <Send size={16} />
            {saving ? 'Đang lưu...' : 'Xuất bản'}
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-all ${toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-200 h-7 w-7 p-0 shrink-0"
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {/* 2. Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: Soạn Thảo & Khối Nội Dung (8 Cột) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="relative z-20 p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-5">
            {/* Title Input */}
            <div className="space-y-1.5">
              <Input
                label="Tiêu đề bài viết (H1) *"
                value={tieuDe}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề hấp dẫn chuẩn SEO (40 - 65 ký tự)..."
                className="h-12 text-base md:text-lg font-bold bg-slate-950/60 border-white/10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
              <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                <span>Số ký tự: {tieuDe.length} / 65</span>
                {tieuDe.length >= 40 && tieuDe.length <= 65 && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check size={12} /> Độ dài chuẩn SEO
                  </span>
                )}
              </div>
            </div>

            {/* Slug URL with 301 Warning */}
            <div>
              <Input
                label="Đường dẫn tĩnh (URL Slug)"
                leftIcon={<span className="text-slate-500 font-mono text-xs select-none">/tin-tuc/</span>}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="pl-20 font-mono bg-slate-950/60 border-white/10 text-slate-200 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
              {!isNew && originalSlug && slug !== originalSlug && (
                <p className="text-xs text-amber-400 flex items-center gap-1.5 mt-2 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  <AlertCircle size={14} className="shrink-0" />
                  Bạn đang thay đổi Slug! Hệ thống sẽ tự động tạo chuyển hướng 301 từ{' '}
                  <code className="bg-black/30 px-1 py-0.5 rounded">/tin-tuc/{originalSlug}</code> để bảo toàn
                  PageRank.
                </p>
              )}
            </div>

            {/* Category & Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-30">
              <Select
                label="Chuyên mục *"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                variant="dark"
                options={categories.map((c) => ({ value: c.id, label: c.tenChuyenMuc }))}
                className="h-10 rounded-lg bg-slate-950/60 border-white/10 text-slate-200 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Ảnh đại diện (Featured Image) *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMediaPickerTarget({ type: 'featured' })}
                    className="h-7 text-xs flex items-center gap-1.5 cursor-pointer border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-sky-400 hover:text-sky-300"
                  >
                    <ImageIcon size={13} />
                    <span>Chọn từ Thư Viện</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={anhDaiDienUrl}
                    onChange={(e) => setAnhDaiDienUrl(e.target.value)}
                    placeholder="https://.../anh-dai-dien.webp"
                    className="h-10 bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 flex-1 font-mono"
                  />
                  {anhDaiDienUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAnhDaiDienUrl('');
                        setAnhDaiDienAlt('');
                      }}
                      aria-label="Xóa ảnh đại diện"
                      className="h-10 w-10 shrink-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
                {anhDaiDienUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-950/60 border border-white/10">
                    <div className="w-16 h-12 rounded-lg bg-slate-900 border border-white/10 overflow-hidden shrink-0">
                      <img
                        src={anhDaiDienUrl}
                        alt={anhDaiDienAlt || 'Preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="text-slate-200 font-semibold truncate font-mono">
                        {anhDaiDienUrl}
                      </p>
                      <p className="text-slate-400 truncate">
                        Alt: {anhDaiDienAlt || 'Chưa thiết lập'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alt text & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Thẻ Alt ảnh đại diện (SEO Alt) *"
                value={anhDaiDienAlt}
                onChange={(e) => setAnhDaiDienAlt(e.target.value)}
                placeholder="Mô tả ảnh chứa từ khóa chính..."
                className="h-10 bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />

              <Input
                label="Tóm tắt bài viết (Meta Sapo)"
                value={tomTat}
                onChange={(e) => setTomTat(e.target.value)}
                placeholder="Tóm tắt ngắn gọn 1-2 câu mở đầu..."
                className="h-10 bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
            </div>
          </Card>

          {/* 3. Visual Content Block Editor */}
          <Card className="relative z-10 p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  Nội Dung Bài Viết & Content Blocks
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sắp xếp và tùy biến linh hoạt các khối nội dung tinh hoa chuẩn Tiptap AST.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
                {blocks.length} khối nội dung
              </span>
            </div>

            {/* Block List Render */}
            <div className="space-y-4">
              {blocks.map((block, idx) => {
                const calloutTheme =
                  block.type === 'callout'
                    ? CALLOUT_THEMES[block.calloutType || 'info'] || CALLOUT_THEMES.info
                    : null;

                return (
                <div
                  key={block.id}
                  className={cn(
                    "p-4 rounded-xl border space-y-3 relative group transition-all",
                    calloutTheme
                      ? calloutTheme.cardClass
                      : "border-white/10 bg-slate-950/40 hover:border-cyan-500/30"
                  )}
                >
                  {/* Block Header & Action Controls */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                    <span
                      className={cn(
                        "font-semibold uppercase tracking-wider flex items-center gap-1.5",
                        calloutTheme ? calloutTheme.headerTextClass : "text-cyan-400"
                      )}
                    >
                      {block.type === 'heading' && `Tiêu đề H${block.level || 2}`}
                      {block.type === 'paragraph' && 'Đoạn văn bản'}
                      {block.type === 'callout' && (
                        <>
                          <span>{calloutTheme?.icon}</span>
                          <span>Khối hộp ghi chú: {calloutTheme?.label}</span>
                        </>
                      )}
                      {block.type === 'youtube' && 'Video YouTube'}
                      {block.type === 'tiktok' && 'Video TikTok'}
                      {block.type === 'faq' && 'Khối FAQ (Hỏi Đáp)'}

                      {block.type === 'relatedCar' && 'Khối xe gợi ý'}
                      {block.type === 'priceTable' && 'Bảng giá lăn bánh'}
                      {block.type === 'leadForm' && 'Form thu thập báo giá'}
                      {block.type === 'singleImage' && 'Ảnh Đơn & Chú Thích (SEO Alt + Caption)'}
                      {block.type === 'imageGallery' && 'Thư Viện Ảnh Lướt (Carousel / Grid)'}
                      {block.type === 'specTable' && 'Bảng So Sánh Thông Số Kỹ Thuật'}
                      {block.type === 'ctaButton' && 'Nút Kêu Gọi Hành Động (CTA Button)'}
                      {block.type === 'prosCons' && 'Khối Ưu / Nhược Điểm (Featured Snippet)'}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveBlock(idx, 'up')}
                        disabled={idx === 0}
                        className="h-7 w-7 text-slate-500 hover:text-slate-200 disabled:opacity-30"
                        title="Di chuyển lên"
                      >
                        <MoveUp size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveBlock(idx, 'down')}
                        disabled={idx === blocks.length - 1}
                        className="h-7 w-7 text-slate-500 hover:text-slate-200 disabled:opacity-30"
                        title="Di chuyển xuống"
                      >
                        <MoveDown size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBlock(block.id)}
                        className="h-7 w-7 text-slate-500 hover:text-red-400 ml-1"
                        title="Xóa khối"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Block Specific Form Controls */}
                  {block.type === 'paragraph' && (
                    <Textarea
                      rows={3}
                      value={block.content || ''}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      placeholder="Nhập nội dung đoạn văn..."
                      className="bg-slate-900 border-white/10 text-slate-100 text-sm"
                    />
                  )}

                  {block.type === 'heading' && (
                    <div className="flex items-center gap-3">
                      <div className="w-32 shrink-0 relative z-20">
                        <Select
                          variant="dark"
                          options={[
                            { value: '2', label: 'Thẻ H2' },
                            { value: '3', label: 'Thẻ H3' },
                          ]}
                          value={String(block.level || 2)}
                          onChange={(e) => updateBlock(block.id, { level: Number(e.target.value) })}
                          className="h-10 bg-slate-900 border-white/10 text-slate-200 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={block.content || ''}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Tiêu đề đoạn (H2, H3)..."
                          className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'callout' && (() => {
                    const theme = CALLOUT_THEMES[block.calloutType || 'info'] || CALLOUT_THEMES.info;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-52 shrink-0 relative z-20">
                            <Select
                              variant="dark"
                              options={[
                                { value: 'info', label: 'ℹ️ Thông tin (Info)' },
                                { value: 'warning', label: '⚠️ Cảnh báo (Warning)' },
                                { value: 'success', label: '🎁 Ưu đãi (Success)' },
                                { value: 'note', label: '📝 Ghi chú (Note)' },
                              ]}
                              value={block.calloutType || 'info'}
                              onChange={(e) => updateBlock(block.id, { calloutType: e.target.value as any })}
                              className={cn("h-10 bg-slate-900 border text-xs font-semibold", theme.selectBorderClass)}
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              value={block.title || ''}
                              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                              placeholder={theme.placeholderTitle}
                              className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-semibold placeholder:text-slate-500"
                            />
                          </div>
                        </div>
                        <Textarea
                          rows={2}
                          value={block.content || ''}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder={theme.placeholderContent}
                          className="bg-slate-900 border-white/10 text-slate-200 text-sm min-h-[60px] placeholder:text-slate-500"
                        />
                        {/* Visual Cue Feedback Bar */}
                        <div className={cn(
                          "px-3.5 py-2.5 rounded-lg text-xs flex items-center justify-between border transition-all",
                          theme.badge
                        )}>
                          <span className="flex items-center gap-2">
                            <span>{theme.icon}</span>
                            <span className="font-medium">Màu sắc hiển thị: <strong className="font-semibold">{theme.label}</strong> — {theme.previewCue}</span>
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 px-1.5 py-0.5 rounded bg-white/10">
                            {block.calloutType || 'info'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {block.type === 'youtube' && (
                    <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Link Video YouTube hoặc Video ID *
                          </label>
                          <Input
                            value={block.videoUrl || block.videoId || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const cleanId = extractYoutubeId(val);
                              updateBlock(block.id, {
                                videoUrl: val,
                                videoId: cleanId,
                              });
                            }}
                            placeholder="Dán link (https://www.youtube.com/watch?v=... hoặc https://youtu.be/...) hoặc Video ID"
                            className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Chú thích video (Tùy chọn)
                          </label>
                          <Input
                            value={block.caption || ''}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                            placeholder="Nhập chú thích hoặc tiêu đề video..."
                            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                      {block.videoId && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 size={13} className="shrink-0" />
                          <span>Đã nhận diện YouTube Video ID: <strong className="font-mono font-bold text-white">{block.videoId}</strong></span>
                        </div>
                      )}
                    </div>
                  )}



                  {block.type === 'faq' && (
                    <div className="space-y-3 p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileQuestion size={14} /> Danh sách câu hỏi & giải đáp (Schema FAQPage)
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentFaqs = block.faqs || [];
                            updateBlock(block.id, {
                              faqs: [...currentFaqs, { question: '', answer: '' }],
                            });
                          }}
                          className="h-7 text-xs text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 px-2.5 flex items-center gap-1 rounded-lg border border-emerald-500/30"
                        >
                          <Plus size={13} /> Thêm câu hỏi
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {(block.faqs && block.faqs.length > 0 ? block.faqs : [{ question: '', answer: '' }]).map(
                          (faqItem, faqIdx) => (
                            <div
                              key={faqIdx}
                              className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 relative group/faq"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                                  FAQ #{faqIdx + 1}
                                </span>
                                {(block.faqs?.length || 0) > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextFaqs = [...(block.faqs || [])];
                                      nextFaqs.splice(faqIdx, 1);
                                      updateBlock(block.id, { faqs: nextFaqs });
                                    }}
                                    className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                                    title="Xóa câu hỏi này"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                              <Input
                                value={faqItem.question}
                                onChange={(e) => {
                                  const nextFaqs = [...(block.faqs || [{ question: '', answer: '' }])];
                                  nextFaqs[faqIdx] = { ...nextFaqs[faqIdx], question: e.target.value };
                                  updateBlock(block.id, { faqs: nextFaqs });
                                }}
                                placeholder="Nhập câu hỏi (e.g. Mua xe Hyundai có được giao tận nhà không?)..."
                                className="h-9 bg-slate-950/80 border-white/10 text-slate-100 text-xs font-semibold placeholder:text-slate-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/60"
                              />
                              <Textarea
                                rows={2}
                                value={faqItem.answer}
                                onChange={(e) => {
                                  const nextFaqs = [...(block.faqs || [{ question: '', answer: '' }])];
                                  nextFaqs[faqIdx] = { ...nextFaqs[faqIdx], answer: e.target.value };
                                  updateBlock(block.id, { faqs: nextFaqs });
                                }}
                                placeholder="Nhập câu trả lời giải đáp chi tiết..."
                                className="bg-slate-950/80 border-white/10 text-slate-200 text-xs min-h-[56px] placeholder:text-slate-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/60"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. Bảng Giá & Chi Phí Lăn Bánh Tham Khảo (Spreadsheet Table Row Layout) */}
                  {block.type === 'priceTable' && (
                    <div className="space-y-3.5 p-3.5 bg-blue-500/5 rounded-xl border border-blue-500/20">
                      {/* Header bar: Tiêu đề bảng & Bộ lọc dòng xe tránh chọn nhầm xe */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-xs font-semibold text-blue-400 shrink-0 flex items-center gap-1.5">
                            <TableIcon size={14} /> Tiêu đề bảng giá:
                          </label>
                          <Input
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            placeholder="Tiêu đề bảng giá (e.g. Bảng Giá Xe Hyundai Mới Nhất Tại TP. Vinh)..."
                            className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs font-bold flex-1 placeholder:text-slate-600"
                          />
                        </div>

                        {/* Bộ lọc theo dòng xe bài viết đang nói đến */}
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                            <Car size={13} className="text-blue-400" /> Dòng xe:
                          </label>
                          <select
                            value={block.carFilter || 'all'}
                            onChange={(e) => {
                              const selectedCarId = e.target.value;
                              updateBlock(block.id, { carFilter: selectedCarId });
                            }}
                            className="h-8 bg-slate-900 border border-white/10 rounded-lg px-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
                          >
                            <option value="all">Tất cả dòng xe ({availableCars.length})</option>
                            {availableCars.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.tenXe} ({(c.versions || []).length} bản)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Spreadsheet-like Table Rows */}
                      {(() => {
                        const currentCarFilter = block.carFilter || 'all';
                        const filteredVersions = currentCarFilter === 'all'
                          ? allVersionOptions
                          : allVersionOptions.filter((opt) => opt.carId === currentCarFilter);

                        return (
                          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 shadow-inner scrollbar-thin scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-white/10 bg-slate-900/95 text-slate-300">
                                  <th className="py-2.5 px-3 min-w-[70px] font-semibold text-slate-400 text-center sticky left-0 z-20 bg-slate-900 border-r border-white/10">
                                    Thứ tự
                                  </th>
                                  <th className="py-2.5 px-3 min-w-[260px] font-semibold text-blue-300 border-r border-white/10">
                                    Phiên bản xe *
                                  </th>
                                  <th className="py-2.5 px-3 min-w-[170px] font-semibold text-slate-200 border-r border-white/10">
                                    Giá niêm yết (VNĐ)
                                  </th>
                                  <th className="py-2.5 px-3 min-w-[160px] font-semibold text-emerald-400 border-r border-white/10">
                                    Ưu đãi giảm giá (VNĐ)
                                  </th>
                                  <th className="py-2.5 px-3 min-w-[190px] font-semibold text-cyan-300 border-r border-white/10">
                                    Giá lăn bánh tạm tính (Read only)
                                  </th>
                                  <th className="py-2.5 px-2 min-w-[45px] text-center font-semibold text-slate-400">
                                    Xóa
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-white/5">
                                {(block.prices && block.prices.length > 0
                                  ? block.prices
                                  : [
                                    {
                                      version: 'Hyundai Accent 1.5 AT',
                                      listedPrice: 489000000,
                                      discount: 30000000,
                                      rollingPrice: 512000000,
                                    },
                                  ]
                                ).map((priceItem, pIdx) => {
                                  const promoPrice = Math.max(0, (priceItem.listedPrice || 0) - (priceItem.discount || 0));
                                  // Thuế trước bạ 10% tại Nghệ An + 3.500.000đ biển số, đăng kiểm, bảo trì & TNDS
                                  const autoRollingPrice = priceItem.rollingPrice || Math.round(promoPrice * 1.10 + 3500000);

                                  return (
                                    <tr key={pIdx} className="hover:bg-slate-900/40 transition-colors group/row">
                                      {/* Cột 1: Thứ tự & Reorder Up / Down */}
                                      <td className="py-2 px-2 sticky left-0 z-10 bg-slate-950 border-r border-white/10 text-center">
                                        <div className="flex items-center justify-center gap-1 text-slate-500">
                                          <div className="flex flex-col gap-0.5">
                                            <button
                                              type="button"
                                              disabled={pIdx === 0}
                                              onClick={() => {
                                                const currentPrices = [...(block.prices || [])];
                                                if (pIdx === 0) return;
                                                const temp = currentPrices[pIdx];
                                                currentPrices[pIdx] = currentPrices[pIdx - 1];
                                                currentPrices[pIdx - 1] = temp;
                                                updateBlock(block.id, { prices: currentPrices });
                                              }}
                                              className="hover:text-blue-300 disabled:opacity-20 transition-colors p-0.5"
                                              title="Di chuyển lên"
                                            >
                                              <ChevronUp size={12} />
                                            </button>
                                            <button
                                              type="button"
                                              disabled={pIdx === (block.prices || []).length - 1}
                                              onClick={() => {
                                                const currentPrices = [...(block.prices || [])];
                                                if (pIdx >= currentPrices.length - 1) return;
                                                const temp = currentPrices[pIdx];
                                                currentPrices[pIdx] = currentPrices[pIdx + 1];
                                                currentPrices[pIdx + 1] = temp;
                                                updateBlock(block.id, { prices: currentPrices });
                                              }}
                                              className="hover:text-blue-300 disabled:opacity-20 transition-colors p-0.5"
                                              title="Di chuyển xuống"
                                            >
                                              <ChevronDown size={12} />
                                            </button>
                                          </div>
                                          <span className="font-mono text-[11px] font-semibold text-slate-400">
                                            #{pIdx + 1}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Cột 2: Dropdown chọn bản xe (Có Optgroup theo dòng xe nếu chọn Tất cả) */}
                                      <td className="py-2 px-2.5 border-r border-white/10">
                                        <select
                                          value={
                                            filteredVersions.find(
                                              (opt) => opt.fullLabel === priceItem.version || opt.value === priceItem.version
                                            )?.value || ''
                                          }
                                          onChange={(e) => {
                                            const found = allVersionOptions.find((opt) => opt.value === e.target.value);
                                            if (found) {
                                              const nextPrices = [...(block.prices || [])];
                                              nextPrices[pIdx] = {
                                                ...nextPrices[pIdx],
                                                version: found.fullLabel,
                                                listedPrice: found.listedPrice,
                                                discount: found.discount,
                                                rollingPrice: found.rollingPrice,
                                              };
                                              updateBlock(block.id, { prices: nextPrices });
                                            }
                                          }}
                                          className="h-8 w-full bg-slate-900 border border-white/10 rounded px-2 text-xs text-white font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
                                        >
                                          <option value="">-- Chọn phiên bản xe --</option>
                                          {currentCarFilter === 'all' ? (
                                            availableCars.map((c) => (
                                              <optgroup key={c.id} label={`Dòng xe ${c.tenXe}`}>
                                                {(c.versions || []).map((v) => {
                                                  const cleanVer = v.tenPhienBan.toLowerCase().startsWith(c.tenXe.toLowerCase())
                                                    ? v.tenPhienBan
                                                    : `${c.tenXe} ${v.tenPhienBan}`;
                                                  return (
                                                    <option key={v.id} value={`${c.id}::${v.id}`}>
                                                      {cleanVer}
                                                    </option>
                                                  );
                                                })}
                                              </optgroup>
                                            ))
                                          ) : (
                                            filteredVersions.map((opt) => (
                                              <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </option>
                                            ))
                                          )}
                                        </select>
                                      </td>

                                      {/* Cột 3: Giá niêm yết (Format phân cách hàng nghìn + Triệu rút gọn) */}
                                      <td className="py-2 px-2.5 border-r border-white/10">
                                        <div className="space-y-0.5">
                                          <input
                                            type="text"
                                            value={formatVnd(priceItem.listedPrice)}
                                            onChange={(e) => {
                                              const val = parseVnd(e.target.value);
                                              const nextPrices = [...(block.prices || [])];
                                              const discount = nextPrices[pIdx]?.discount || 0;
                                              const promo = Math.max(0, val - discount);
                                              nextPrices[pIdx] = {
                                                ...nextPrices[pIdx],
                                                listedPrice: val,
                                                rollingPrice: Math.round(promo * 1.10 + 3500000),
                                              };
                                              updateBlock(block.id, { prices: nextPrices });
                                            }}
                                            placeholder="0"
                                            className="h-8 w-full bg-slate-900 border border-white/10 rounded px-2.5 text-xs text-slate-100 font-mono font-medium focus:outline-none focus:border-blue-400 focus:bg-slate-800 transition-colors"
                                          />
                                          {priceItem.listedPrice > 0 && (
                                            <span className="text-[10px] text-blue-300 font-mono block pl-1">
                                              ≈ {toShortMillion(priceItem.listedPrice)}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Cột 4: Ưu đãi giảm giá (Format phân cách hàng nghìn + Triệu rút gọn) */}
                                      <td className="py-2 px-2.5 border-r border-white/10">
                                        <div className="space-y-0.5">
                                          <input
                                            type="text"
                                            value={formatVnd(priceItem.discount)}
                                            onChange={(e) => {
                                              const val = parseVnd(e.target.value);
                                              const nextPrices = [...(block.prices || [])];
                                              const listed = nextPrices[pIdx]?.listedPrice || 0;
                                              const promo = Math.max(0, listed - val);
                                              nextPrices[pIdx] = {
                                                ...nextPrices[pIdx],
                                                discount: val,
                                                rollingPrice: Math.round(promo * 1.10 + 3500000),
                                              };
                                              updateBlock(block.id, { prices: nextPrices });
                                            }}
                                            placeholder="0"
                                            className="h-8 w-full bg-slate-900 border border-white/10 rounded px-2.5 text-xs text-emerald-400 font-mono font-medium focus:outline-none focus:border-emerald-400 focus:bg-slate-800 transition-colors"
                                          />
                                          {priceItem.discount > 0 && (
                                            <span className="text-[10px] text-emerald-400 font-mono block pl-1">
                                              ≈ {toShortMillion(priceItem.discount)}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Cột 5: Giá lăn bánh tạm tính (READ ONLY - Tự động tính toán) */}
                                      <td className="py-2 px-2.5 border-r border-white/10">
                                        <div className="space-y-0.5">
                                          <input
                                            type="text"
                                            readOnly
                                            value={formatVnd(autoRollingPrice)}
                                            placeholder="0"
                                            className="h-8 w-full bg-slate-950/70 border border-white/5 rounded px-2.5 text-xs text-cyan-300 font-mono font-bold cursor-not-allowed select-none"
                                            title="Giá lăn bánh tạm tính được hệ thống tự động khóa và tính toán theo thuế trước bạ 10% + 3.500.000đ"
                                          />
                                          {autoRollingPrice > 0 && (
                                            <span className="text-[10px] text-cyan-400/80 font-mono block pl-1">
                                              ≈ {toShortMillion(autoRollingPrice)} (Tự tính)
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Cột 6: Xóa dòng */}
                                      <td className="py-2 px-2 text-center">
                                        {(block.prices?.length || 0) > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const nextPrices = [...(block.prices || [])];
                                              nextPrices.splice(pIdx, 1);
                                              updateBlock(block.id, { prices: nextPrices });
                                            }}
                                            className="text-slate-500 hover:text-red-400 p-1.5 rounded transition-colors"
                                            title="Xóa phiên bản này"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const currentPrices = block.prices || [];
                            const currentCarFilter = block.carFilter || 'all';
                            const targetCar = currentCarFilter !== 'all'
                              ? availableCars.find((c) => c.id === currentCarFilter)
                              : availableCars[0];
                            const firstVer = targetCar?.versions?.[0];
                            const listed = firstVer?.giaNiemYet || 489000000;
                            const promo = firstVer?.giaKhuyenMai || listed;
                            const discount = Math.max(0, listed - promo);
                            const cleanVer = firstVer
                              ? (firstVer.tenPhienBan.toLowerCase().startsWith(targetCar.tenXe.toLowerCase())
                                ? firstVer.tenPhienBan
                                : `${targetCar.tenXe} ${firstVer.tenPhienBan}`)
                              : 'Hyundai Accent 1.5 AT';

                            updateBlock(block.id, {
                              prices: [
                                ...currentPrices,
                                {
                                  version: cleanVer,
                                  listedPrice: listed,
                                  discount,
                                  rollingPrice: Math.round(promo * 1.10 + 3500000),
                                },
                              ],
                            });
                          }}
                          className="h-8 text-xs text-blue-300 hover:text-blue-200 border-blue-500/30 flex items-center gap-1.5 self-start"
                        >
                          <Plus size={13} /> Thêm phiên bản xe
                        </Button>

                        <span className="text-[11px] text-slate-500 italic">
                          💡 Giá lăn bánh tạm tính được khóa (Read-only) và tự động tính theo công thức: (Niêm yết - Giảm giá) × 1.10 + 3.500.000đ.
                        </span>
                      </div>
                    </div>
                  )}

                  {block.type === 'relatedCar' && (
                    <div className="space-y-3.5 p-4 bg-sky-500/5 rounded-xl border border-sky-500/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Car size={14} /> Khối Giới Thiệu Mẫu Xe Liên Quan (Related Car)
                        </label>
                        {block.carName && (
                          <span className="text-[11px] font-medium text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1 w-fit">
                            <Sparkles size={11} className="text-sky-400" />
                            Đang liên kết: <strong className="text-white">{block.carName}</strong>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Cột 1: Tên dòng xe kèm Dropdown chọn trực tiếp từ kho xe */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Tên dòng xe *
                          </label>
                          <Select
                            variant="dark"
                            placeholder="-- Chọn xe từ kho hệ thống --"
                            value={availableCars.find((c) => c.slug === block.carSlug)?.id || ''}
                            onChange={(e) => {
                              const selectedCar = availableCars.find((c) => c.id === e.target.value);
                              if (selectedCar) {
                                const firstVer = selectedCar.versions?.[0];
                                const seatVal = typeof selectedCar.seatRange === 'string' && selectedCar.seatRange.includes('chỗ')
                                  ? parseInt(selectedCar.seatRange, 10) || 5
                                  : firstVer?.seatCount || 5;
                                updateBlock(block.id, {
                                  carName: selectedCar.tenXe,
                                  carSlug: selectedCar.slug,
                                  carPrice: selectedCar.minPrice || (firstVer?.giaKhuyenMai || firstVer?.giaNiemYet) || 0,
                                  carImage: selectedCar.anhDaiDienUrl || firstVer?.anhDaiDienUrl || '',
                                  seatCount: seatVal,
                                  fuelType: selectedCar.fuelType || firstVer?.dongCo || 'Xăng',
                                });
                              }
                            }}
                            options={availableCars.map((c) => ({
                              value: c.id,
                              label: `${c.tenXe} • Từ ${(c.minPrice || 0).toLocaleString('vi-VN')} đ`,
                            }))}
                            className="h-8 bg-slate-950 border-white/10 text-slate-100 text-xs font-medium"
                          />
                          <Input
                            value={block.carName || ''}
                            onChange={(e) => updateBlock(block.id, { carName: e.target.value })}
                            placeholder="Hoặc chỉnh sửa tên xe..."
                            className="h-7 bg-slate-950/60 border-white/10 text-slate-200 text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Slug đường dẫn xe</label>
                          <Input
                            value={block.carSlug || ''}
                            onChange={(e) => updateBlock(block.id, { carSlug: e.target.value })}
                            placeholder="e.g. hyundai-accent"
                            className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Giá niêm yết từ (VNĐ)</label>
                          <Input
                            type="number"
                            value={block.carPrice || ''}
                            onChange={(e) => updateBlock(block.id, { carPrice: Number(e.target.value) || 0 })}
                            placeholder="e.g. 439000000"
                            className="h-8 bg-slate-900 border-white/10 text-red-400 text-xs font-mono font-bold"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] text-slate-400 mb-1">Đường dẫn ảnh đại diện xe</label>
                          <div className="flex items-center gap-2">
                            {block.carImage && (
                              <img
                                src={block.carImage}
                                alt={block.carName || 'Xe'}
                                className="w-9 h-8 object-cover rounded border border-white/10 shrink-0 bg-slate-950"
                              />
                            )}
                            <Input
                              value={block.carImage || ''}
                              onChange={(e) => updateBlock(block.id, { carImage: e.target.value })}
                              placeholder="e.g. /images/cars/accent.webp"
                              className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs flex-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Số chỗ</label>
                            <Input
                              type="number"
                              value={block.seatCount || 5}
                              onChange={(e) => updateBlock(block.id, { seatCount: Number(e.target.value) || 5 })}
                              placeholder="5"
                              className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Động cơ</label>
                            <Input
                              value={block.fuelType || ''}
                              onChange={(e) => updateBlock(block.id, { fuelType: e.target.value })}
                              placeholder="Xăng 1.5L"
                              className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === 'leadForm' && (
                    <div className="space-y-3 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                      <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Send size={14} /> Khối Form Nhận Báo Giá Lăn Bánh Nhanh (Inline Lead Form)
                      </label>
                      <div className="space-y-2.5">
                        {/* ⚡ Chọn nhanh dòng xe quan tâm */}
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-indigo-500/30">
                          <label className="block text-[11px] font-semibold text-indigo-300 mb-1">
                            Chọn dòng xe áp dụng cho Form báo giá:
                          </label>
                          <Select
                            variant="dark"
                            placeholder="-- Chọn dòng xe áp dụng --"
                            value={availableCars.find((c) => c.tenXe === block.carName)?.id || ''}
                            onChange={(e) => {
                              const selectedCar = availableCars.find((c) => c.id === e.target.value);
                              if (selectedCar) {
                                updateBlock(block.id, { carName: selectedCar.tenXe });
                              }
                            }}
                            options={availableCars.map((c) => ({
                              value: c.id,
                              label: c.tenXe,
                            }))}
                            className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs"
                          />
                        </div>

                        <Input
                          value={block.formHeadline || ''}
                          onChange={(e) => updateBlock(block.id, { formHeadline: e.target.value })}
                          placeholder="Tiêu đề Form (e.g. Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay)..."
                          className="h-9 bg-slate-900 border-white/10 text-slate-100 text-xs font-bold"
                        />
                        <Textarea
                          rows={2}
                          value={block.formSubheadline || ''}
                          onChange={(e) => updateBlock(block.id, { formSubheadline: e.target.value })}
                          placeholder="Mô tả phụ cam kết tư vấn nhanh..."
                          className="bg-slate-900 border-white/10 text-slate-200 text-xs min-h-[50px]"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            value={block.carName || ''}
                            onChange={(e) => updateBlock(block.id, { carName: e.target.value })}
                            placeholder="Dòng xe áp dụng (e.g. Hyundai Accent / Creta)..."
                            className="h-9 bg-slate-900 border-white/10 text-slate-100 text-xs"
                          />
                          <Input
                            value={block.formButtonText || ''}
                            onChange={(e) => updateBlock(block.id, { formButtonText: e.target.value })}
                            placeholder="Chữ trên nút (e.g. Gửi Báo Giá Ngay)..."
                            className="h-9 bg-slate-900 border-white/10 text-slate-100 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === 'tiktok' && (
                    <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Link Video TikTok hoặc Video ID *
                          </label>
                          <Input
                            value={block.videoUrl || block.videoId || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const cleanId = extractTikTokId(val);
                              updateBlock(block.id, {
                                videoUrl: val,
                                videoId: cleanId,
                              });
                            }}
                            placeholder="Dán link (https://www.tiktok.com/@.../video/...) hoặc Video ID"
                            className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Tiêu đề video TikTok (Tùy chọn)
                          </label>
                          <Input
                            value={block.title || block.caption || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value, caption: e.target.value })}
                            placeholder="Tiêu đề video TikTok..."
                            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                      {block.videoId && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 size={13} className="shrink-0" />
                          <span>Đã nhận diện TikTok Video ID: <strong className="font-mono font-bold text-white">{block.videoId}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 1. Khối Hình ảnh & Chú thích (Single Image + SEO Alt + Caption) */}
                  {block.type === 'singleImage' && (
                    <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-xl border border-cyan-500/20">
                      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                        <ImageIcon size={14} /> Hình Ảnh Đơn & Tối Ưu SEO (Alt + Caption)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] text-slate-400 font-medium">
                              Đường dẫn ảnh (URL Image) *
                            </label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setMediaPickerTarget({ type: 'singleImage', blockId: block.id })}
                                className="h-6 text-[11px] px-2 flex items-center gap-1 cursor-pointer border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300"
                              >
                                <ImageIcon size={12} />
                                <span>Thư Viện Ảnh</span>
                              </Button>
                              <label className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 transition-colors">
                                <Upload size={12} />
                                <span>Tải từ máy</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const dataUrl = event.target?.result as string;
                                      if (dataUrl) {
                                        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                                        updateBlock(block.id, {
                                          imageUrl: dataUrl,
                                          imageAlt: block.imageAlt || cleanName,
                                          caption: block.caption || cleanName,
                                        });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          <Input
                            value={block.imageUrl || ''}
                            onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                            placeholder="Dán link ảnh https://... hoặc chọn từ Thư Viện Ảnh bên trên"
                            className="h-9 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium flex items-center justify-between">
                            <span>Thẻ Alt ảnh (Chuẩn SEO) *</span>
                            <span className="text-[10px] text-emerald-400 font-mono">Google Images</span>
                          </label>
                          <Input
                            value={block.imageAlt || ''}
                            onChange={(e) => updateBlock(block.id, { imageAlt: e.target.value })}
                            placeholder="Ví dụ: Khoang lái xe Hyundai Tucson phiên bản Cao cấp..."
                            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Dòng chú thích chân ảnh (Caption)
                          </label>
                          <Input
                            value={block.caption || ''}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                            placeholder="Ví dụ: Khoang lái Tucson phiên bản Cao cấp bọc da nâu..."
                            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                      {block.imageUrl && (
                        <div className="flex items-center gap-3 p-2 bg-slate-950/80 rounded-lg border border-white/5">
                          <img
                            src={block.imageUrl}
                            alt={block.imageAlt || 'Xem trước ảnh'}
                            className="w-20 h-14 object-cover rounded border border-white/10"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                          <div className="text-xs text-slate-400 truncate flex-1">
                            <p className="font-semibold text-slate-200 truncate">{block.caption || 'Chưa có chú thích'}</p>
                            <p className="text-[11px] text-slate-500 truncate font-mono">Alt: {block.imageAlt || 'Chưa có alt text'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Thư viện ảnh lướt / Carousel / Grid (CMS-grade Image Manager) */}
                  {block.type === 'imageGallery' && (
                    <div className="space-y-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-purple-500/20">
                      {/* Header bar: Title & Layout selector */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-xs font-semibold text-purple-400 shrink-0 flex items-center gap-1.5">
                            <Images size={15} /> Tiêu đề bộ sưu tập:
                          </label>
                          <Input
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            placeholder="Ví dụ: Chùm ảnh ngoại thất & nội thất Hyundai Tucson thực tế..."
                            className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs font-semibold flex-1"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-400 font-medium">Kiểu hiển thị:</span>
                          <button
                            type="button"
                            onClick={() => updateBlock(block.id, { galleryStyle: 'slider' })}
                            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                              block.galleryStyle !== 'grid'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Slider Vuốt (Mobile)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBlock(block.id, { galleryStyle: 'grid' })}
                            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                              block.galleryStyle === 'grid'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Lưới 3 cột
                          </button>
                        </div>
                      </div>

                      {/* Action Toolbar: Count + Batch Upload + Add Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-medium pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-200 font-semibold">
                            Danh sách hình ảnh ({(block.galleryImages || []).length} ảnh)
                          </span>
                          <span className="text-[10px] text-slate-500 hidden sm:inline">
                            (Khuyến nghị: Đầu xe ➔ Thân xe ➔ Đuôi xe ➔ Nội thất)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMediaPickerTarget({ type: 'gallery', blockId: block.id })}
                            className="h-7 px-2.5 text-xs text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <ImageIcon size={13} />
                            <span>Chọn từ Thư Viện</span>
                          </Button>

                          {/* Tải ảnh từ máy tính (hỗ trợ chọn nhiều ảnh cùng lúc) */}
                          <label className="h-7 px-2.5 text-xs text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/30 flex items-center gap-1.5 cursor-pointer transition-colors">
                            <Upload size={13} />
                            <span>Tải ảnh từ máy</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;
                                Array.from(files).forEach((file) => {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const dataUrl = event.target?.result as string;
                                    if (dataUrl) {
                                      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                                      setBlocks((prev) =>
                                        prev.map((b) => {
                                          if (b.id !== block.id) return b;
                                          const current = b.galleryImages || [];
                                          return {
                                            ...b,
                                            galleryImages: [
                                              ...current,
                                              {
                                                url: dataUrl,
                                                alt: cleanName || 'Hình ảnh chi tiết xe',
                                                caption: cleanName || '',
                                              },
                                            ],
                                          };
                                        })
                                      );
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }}
                            />
                          </label>

                          {/* Thêm một hàng ảnh trống */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const current = block.galleryImages || [];
                              updateBlock(block.id, {
                                galleryImages: [
                                  ...current,
                                  { url: '', alt: 'Hình ảnh chi tiết xe', caption: '' },
                                ],
                              });
                            }}
                            className="h-7 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 rounded-lg border border-white/10 flex items-center gap-1"
                          >
                            <Plus size={13} /> Thêm ảnh
                          </Button>
                        </div>
                      </div>

                      {/* List of Image Cards (CMS-grade layout) */}
                      <div className="space-y-3">
                        {(block.galleryImages || []).map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', String(imgIdx));
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                              if (isNaN(fromIndex) || fromIndex === imgIdx) return;
                              const currentImages = [...(block.galleryImages || [])];
                              const [movedItem] = currentImages.splice(fromIndex, 1);
                              currentImages.splice(imgIdx, 0, movedItem);
                              updateBlock(block.id, { galleryImages: currentImages });
                            }}
                            className="p-3 bg-slate-950/80 rounded-xl border border-white/10 hover:border-purple-500/40 transition-all space-y-2 group/img relative"
                          >
                            <div className="flex items-start gap-3">
                              {/* Cột 1: Tay cầm kéo thả ::: + Nút lên/xuống */}
                              <div className="flex flex-col items-center justify-center gap-0.5 text-slate-500 pt-1 shrink-0 select-none">
                                <button
                                  type="button"
                                  disabled={imgIdx === 0}
                                  onClick={() => {
                                    const currentImages = [...(block.galleryImages || [])];
                                    if (imgIdx === 0) return;
                                    const temp = currentImages[imgIdx];
                                    currentImages[imgIdx] = currentImages[imgIdx - 1];
                                    currentImages[imgIdx - 1] = temp;
                                    updateBlock(block.id, { galleryImages: currentImages });
                                  }}
                                  className="hover:text-purple-300 disabled:opacity-20 transition-colors p-0.5"
                                  title="Di chuyển ảnh lên trước"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <div
                                  className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-purple-400 transition-colors"
                                  title="Kéo thả để sắp xếp thứ tự ảnh"
                                >
                                  <GripVertical size={16} />
                                </div>
                                <button
                                  type="button"
                                  disabled={imgIdx === (block.galleryImages || []).length - 1}
                                  onClick={() => {
                                    const currentImages = [...(block.galleryImages || [])];
                                    if (imgIdx >= currentImages.length - 1) return;
                                    const temp = currentImages[imgIdx];
                                    currentImages[imgIdx] = currentImages[imgIdx + 1];
                                    currentImages[imgIdx + 1] = temp;
                                    updateBlock(block.id, { galleryImages: currentImages });
                                  }}
                                  className="hover:text-purple-300 disabled:opacity-20 transition-colors p-0.5"
                                  title="Di chuyển ảnh xuống sau"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                <span className="text-[10px] font-mono text-purple-400 font-bold mt-0.5">
                                  #{imgIdx + 1}
                                </span>
                              </div>

                              {/* Cột 2: Thumbnail Preview Square (Click để đổi/tải ảnh) */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex flex-col items-center justify-center group/thumb shadow-inner">
                                {img.url ? (
                                  <>
                                    <img
                                      src={img.url}
                                      alt={img.alt || 'Ảnh xem trước'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                    {/* Overlay click đổi ảnh */}
                                    <label className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium gap-1 text-center p-1">
                                      <Upload size={14} className="text-purple-400" />
                                      <span>Đổi ảnh</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const reader = new FileReader();
                                          reader.onload = (event) => {
                                            const dataUrl = event.target?.result as string;
                                            if (dataUrl) {
                                              const nextImages = [...(block.galleryImages || [])];
                                              nextImages[imgIdx] = { ...nextImages[imgIdx], url: dataUrl };
                                              updateBlock(block.id, { galleryImages: nextImages });
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }}
                                      />
                                    </label>
                                  </>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer border border-dashed border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/10 rounded-xl p-1 text-center transition-colors">
                                    <ImagePlus size={18} className="text-purple-400 mb-0.5" />
                                    <span className="text-[10px] text-purple-300 font-medium leading-tight">+ Tải ảnh</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const dataUrl = event.target?.result as string;
                                          if (dataUrl) {
                                            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                                            const nextImages = [...(block.galleryImages || [])];
                                            nextImages[imgIdx] = {
                                              ...nextImages[imgIdx],
                                              url: dataUrl,
                                              alt: cleanName || 'Hình ảnh chi tiết xe',
                                              caption: cleanName || '',
                                            };
                                            updateBlock(block.id, { galleryImages: nextImages });
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }}
                                    />
                                  </label>
                                )}
                              </div>

                              {/* Cột 3: Trường nhập liệu có label rõ ràng (Alt Text SEO & Chú thích) */}
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                  {/* Ô 1: Alt Text (SEO) */}
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                                      <span>Alt Text (SEO) *</span>
                                      <span className="text-[10px] text-emerald-400 font-mono font-normal">Cho Google đọc</span>
                                    </label>
                                    <Input
                                      value={img.alt || ''}
                                      onChange={(e) => {
                                        const nextImages = [...(block.galleryImages || [])];
                                        nextImages[imgIdx] = { ...nextImages[imgIdx], alt: e.target.value };
                                        updateBlock(block.id, { galleryImages: nextImages });
                                      }}
                                      placeholder="Ví dụ: Ngoại thất đầu xe với lưới tản nhiệt tham số..."
                                      className="h-8 bg-slate-900 border-white/10 text-slate-200 text-xs focus-visible:ring-purple-500/20 focus-visible:border-purple-500"
                                    />
                                  </div>

                                  {/* Ô 2: Chú thích ảnh (Caption) */}
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                                      <span>Chú thích (Caption)</span>
                                      <span className="text-[10px] text-purple-300 font-mono font-normal">Cho khách đọc dưới chân ảnh</span>
                                    </label>
                                    <Input
                                      value={img.caption || ''}
                                      onChange={(e) => {
                                        const nextImages = [...(block.galleryImages || [])];
                                        nextImages[imgIdx] = { ...nextImages[imgIdx], caption: e.target.value };
                                        updateBlock(block.id, { galleryImages: nextImages });
                                      }}
                                      placeholder="Ví dụ: Cụm màn hình kép 12.3 inch hướng về phía người lái..."
                                      className="h-8 bg-slate-900 border-white/10 text-slate-200 text-xs focus-visible:ring-purple-500/20 focus-visible:border-purple-500"
                                    />
                                  </div>
                                </div>

                                {/* Dòng URL ảnh bổ sung (nếu muốn paste URL ngoài) */}
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="text-[10px] text-slate-500 font-mono shrink-0">URL:</span>
                                  <input
                                    type="text"
                                    value={img.url}
                                    onChange={(e) => {
                                      const nextImages = [...(block.galleryImages || [])];
                                      nextImages[imgIdx] = { ...nextImages[imgIdx], url: e.target.value };
                                      updateBlock(block.id, { galleryImages: nextImages });
                                    }}
                                    placeholder="Dán link ảnh https://... hoặc tải trực tiếp vào ô xem trước"
                                    className="h-6 w-full bg-slate-900/60 border border-white/5 rounded px-2 text-[11px] text-slate-400 font-mono focus:outline-none focus:border-purple-400 focus:text-slate-200"
                                  />
                                </div>
                              </div>

                              {/* Cột 4: Nút Xóa ảnh */}
                              <div className="pt-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextImages = [...(block.galleryImages || [])];
                                    nextImages.splice(imgIdx, 1);
                                    updateBlock(block.id, { galleryImages: nextImages });
                                  }}
                                  className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                  title="Xóa ảnh này"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Bảng So Sánh Thông Số Kỹ Thuật (Spreadsheet-like Grid Table Editor) */}
                  {block.type === 'specTable' && (
                    <div className="space-y-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-amber-500/20">
                      {/* Tiêu đề bảng gọn gàng, không bị lặp 2 lần */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-xs font-semibold text-amber-400 shrink-0 flex items-center gap-1.5">
                          <SlidersHorizontal size={14} /> Tiêu đề bảng so sánh:
                        </label>
                        <Input
                          value={block.title || ''}
                          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          placeholder="Ví dụ: Bảng So Sánh Thông Số Kỹ Thuật Giữa Các Bản..."
                          className="h-9 bg-slate-950 border-white/10 text-slate-100 text-xs font-semibold flex-1"
                        />
                      </div>

                      {/* Spreadsheet-like Grid Table */}
                      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 shadow-inner scrollbar-thin scrollbar-thumb-slate-700">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-slate-900/95 text-slate-300">
                              {/* Cột tiêu đề hàng (Sticky) */}
                              <th className="py-2.5 px-3 font-bold text-amber-300 min-w-[240px] sticky left-0 z-20 bg-slate-900 border-r border-white/10 shadow-[2px_0_6px_rgba(0,0,0,0.25)]">
                                Tên thông số (Hàng)
                              </th>

                              {/* Các cột phiên bản xe */}
                              {(block.specVersions || []).map((ver, vIdx) => (
                                <th key={vIdx} className="py-2.5 px-3 min-w-[190px] border-r border-white/10">
                                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10 focus-within:border-amber-400">
                                    <input
                                      type="text"
                                      value={ver}
                                      onChange={(e) => {
                                        const nextVersions = [...(block.specVersions || [])];
                                        nextVersions[vIdx] = e.target.value;
                                        updateBlock(block.id, { specVersions: nextVersions });
                                      }}
                                      className="bg-transparent text-xs text-white font-bold focus:outline-none w-full placeholder:text-slate-500"
                                      placeholder={`Bản ${vIdx + 1}`}
                                    />
                                    {(block.specVersions || []).length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextVersions = [...(block.specVersions || [])];
                                          nextVersions.splice(vIdx, 1);
                                          const nextRows = (block.specRows || []).map((r) => {
                                            const nextVals = [...r.values];
                                            nextVals.splice(vIdx, 1);
                                            return { ...r, values: nextVals };
                                          });
                                          updateBlock(block.id, { specVersions: nextVersions, specRows: nextRows });
                                        }}
                                        className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                                        title="Xóa cột phiên bản này"
                                      >
                                        <X size={13} />
                                      </button>
                                    )}
                                  </div>
                                </th>
                              ))}

                              {/* Nút Thêm Cột Phiên Bản */}
                              <th className="py-2.5 px-3 min-w-[120px] text-center bg-slate-900/60">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const versions = block.specVersions || [];
                                    const newVerIndex = versions.length + 1;
                                    const nextVersions = [...versions, `Phiên bản #${newVerIndex}`];
                                    const nextRows = (block.specRows || []).map((r) => ({
                                      ...r,
                                      values: [...r.values, ''],
                                    }));
                                    updateBlock(block.id, { specVersions: nextVersions, specRows: nextRows });
                                  }}
                                  className="h-7 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 px-2.5 rounded-lg border border-amber-500/30 flex items-center gap-1 mx-auto whitespace-nowrap"
                                >
                                  <Plus size={12} /> Thêm Cột
                                </Button>
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-white/5">
                            {(block.specRows || []).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors group/row">
                                {/* Sticky Row Header: Reorder Controls + Spec Name + Delete */}
                                <td className="py-2 px-3 sticky left-0 z-10 bg-slate-950 border-r border-white/10 shadow-[2px_0_6px_rgba(0,0,0,0.25)]">
                                  <div className="flex items-center gap-1.5">
                                    {/* Sắp xếp thứ tự dòng (Reorder Up / Down) */}
                                    <div className="flex flex-col gap-0.5 text-slate-500 shrink-0">
                                      <button
                                        type="button"
                                        disabled={rIdx === 0}
                                        onClick={() => {
                                          const currentRows = [...(block.specRows || [])];
                                          if (rIdx === 0) return;
                                          const temp = currentRows[rIdx];
                                          currentRows[rIdx] = currentRows[rIdx - 1];
                                          currentRows[rIdx - 1] = temp;
                                          updateBlock(block.id, { specRows: currentRows });
                                        }}
                                        className="hover:text-amber-300 disabled:opacity-20 transition-colors p-0.5"
                                        title="Di chuyển dòng lên trên"
                                      >
                                        <ChevronUp size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={rIdx === (block.specRows || []).length - 1}
                                        onClick={() => {
                                          const currentRows = [...(block.specRows || [])];
                                          if (rIdx >= currentRows.length - 1) return;
                                          const temp = currentRows[rIdx];
                                          currentRows[rIdx] = currentRows[rIdx + 1];
                                          currentRows[rIdx + 1] = temp;
                                          updateBlock(block.id, { specRows: currentRows });
                                        }}
                                        className="hover:text-amber-300 disabled:opacity-20 transition-colors p-0.5"
                                        title="Di chuyển dòng xuống dưới"
                                      >
                                        <ChevronDown size={13} />
                                      </button>
                                    </div>

                                    <GripVertical size={13} className="text-slate-600 shrink-0 group-hover/row:text-slate-400" />

                                    <input
                                      type="text"
                                      value={row.specName}
                                      onChange={(e) => {
                                        const nextRows = [...(block.specRows || [])];
                                        nextRows[rIdx] = { ...nextRows[rIdx], specName: e.target.value };
                                        updateBlock(block.id, { specRows: nextRows });
                                      }}
                                      placeholder="Tên thông số (e.g. Mâm xe, Đèn pha...)"
                                      className="bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-semibold flex-1 focus:outline-none focus:border-amber-400 focus:bg-slate-800 transition-colors"
                                    />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextRows = [...(block.specRows || [])];
                                        nextRows.splice(rIdx, 1);
                                        updateBlock(block.id, { specRows: nextRows });
                                      }}
                                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                                      title="Xóa dòng thông số này"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>

                                {/* Clean Data Input Cells (Không nhãn tiền tố thừa) */}
                                {(block.specVersions || []).map((_, vIdx) => (
                                  <td key={vIdx} className="py-2 px-2.5 border-r border-white/5">
                                    <input
                                      type="text"
                                      value={row.values[vIdx] || ''}
                                      onChange={(e) => {
                                        const nextRows = [...(block.specRows || [])];
                                        const nextVals = [...(nextRows[rIdx].values || [])];
                                        nextVals[vIdx] = e.target.value;
                                        nextRows[rIdx] = { ...nextRows[rIdx], values: nextVals };
                                        updateBlock(block.id, { specRows: nextRows });
                                      }}
                                      placeholder="-"
                                      className="w-full bg-slate-900/80 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:bg-slate-800 transition-colors"
                                    />
                                  </td>
                                ))}

                                {/* Thứ tự dòng */}
                                <td className="py-2 px-2 text-center text-slate-600">
                                  <span className="text-[10px] font-mono">#{rIdx + 1}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const currentRows = block.specRows || [];
                            const verCount = (block.specVersions || []).length || 2;
                            updateBlock(block.id, {
                              specRows: [
                                ...currentRows,
                                { specName: '', values: Array(verCount).fill('') },
                              ],
                            });
                          }}
                          className="h-8 text-xs text-amber-300 hover:text-amber-200 border-amber-500/30 flex items-center gap-1.5 self-start"
                        >
                          <Plus size={13} /> Thêm dòng thông số
                        </Button>
                        <span className="text-[11px] text-slate-500 italic">
                          💡 Mẹo: Nhấn phím <strong>Tab</strong> để nhảy nhanh liên tục giữa các ô nhập liệu giống Excel / Notion
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 4. Nút Kêu Gọi Hành Động (CTA Button Block) */}
                  {block.type === 'ctaButton' && (
                    <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-xl border border-rose-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
                          <MousePointerClick size={14} /> Nút Kêu Gọi Hành Động Đơn Lẻ (CTA Button)
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400">Màu sắc:</span>
                          {(['red', 'blue', 'emerald'] as const).map((clr) => (
                            <button
                              key={clr}
                              type="button"
                              onClick={() => updateBlock(block.id, { ctaVariant: clr })}
                              className={`w-5 h-5 rounded-full border transition-transform ${
                                clr === 'red' ? 'bg-red-600' : clr === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'
                              } ${block.ctaVariant === clr ? 'scale-125 border-white ring-2 ring-white/30' : 'border-transparent opacity-60'}`}
                              title={clr === 'red' ? 'Đỏ nổi bật (Hotline)' : clr === 'blue' ? 'Xanh dương (Báo giá)' : 'Xanh ngọc (Zalo)'}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">Nhãn nút (Button Text) *</label>
                          <Input
                            value={block.ctaButtonText || ''}
                            onChange={(e) => updateBlock(block.id, { ctaButtonText: e.target.value })}
                            placeholder="Ví dụ: Gọi Hotline Ngay hoặc Chat Zalo Nhận Báo Giá"
                            className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">Hành động khi click</label>
                          <Select
                            variant="dark"
                            options={[
                              { value: 'hotline', label: '📞 Gọi Hotline trực tiếp (tel:)' },
                              { value: 'zalo', label: '💬 Mở Zalo OA Chat' },
                              { value: 'quoteForm', label: '📋 Cuộn xuống Form báo giá lăn bánh' },
                              { value: 'customLink', label: '🔗 Mở liên kết tuỳ chỉnh (URL ngoài)' },
                            ]}
                            value={block.ctaActionType || 'hotline'}
                            onChange={(e) => updateBlock(block.id, { ctaActionType: e.target.value as any })}
                            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
                          />
                        </div>

                        {block.ctaActionType === 'hotline' && (
                          <div className="md:col-span-2">
                            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Số Hotline gọi tới (Tùy chọn)</label>
                            <Input
                              value={block.ctaPhone || ''}
                              onChange={(e) => updateBlock(block.id, { ctaPhone: e.target.value })}
                              placeholder="Để trống sẽ tự động lấy Hotline Bán Hàng trong Cài Đặt..."
                              className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">💡 Để trống để tự động dùng Hotline Bán Hàng được cấu hình trong Cài Đặt Hệ Thống.</p>
                          </div>
                        )}

                        {block.ctaActionType === 'zalo' && (
                          <div className="md:col-span-2">
                            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Số Zalo nhận tin nhắn (Tùy chọn)</label>
                            <Input
                              value={block.ctaPhone || ''}
                              onChange={(e) => updateBlock(block.id, { ctaPhone: e.target.value })}
                              placeholder="Để trống sẽ tự động lấy Số Zalo Showroom trong Cài Đặt..."
                              className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">💡 Để trống để tự động dùng Số Zalo được cấu hình trong Cài Đặt Hệ Thống.</p>
                          </div>
                        )}

                        {block.ctaActionType === 'customLink' && (
                          <div className="md:col-span-2">
                            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Đường dẫn liên kết tuỳ chỉnh *</label>
                            <Input
                              value={block.ctaCustomUrl || ''}
                              onChange={(e) => updateBlock(block.id, { ctaCustomUrl: e.target.value })}
                              placeholder="https://..."
                              className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">Dòng phụ chú dưới nút (Tùy chọn)</label>
                          <Input
                            value={block.ctaSubtext || ''}
                            onChange={(e) => updateBlock(block.id, { ctaSubtext: e.target.value })}
                            placeholder="Ví dụ: Hỗ trợ tư vấn 24/7 - Báo giá lăn bánh giảm tiền mặt trực tiếp"
                            className="h-9 bg-slate-950 border-white/10 text-slate-300 text-xs"
                          />
                        </div>
                      </div>

                      {/* Live Preview Button */}
                      <div className="pt-2 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Xem trước trên Web:</span>
                        <div
                          className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg cursor-pointer ${
                            block.ctaVariant === 'blue'
                              ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 shadow-blue-500/25'
                              : block.ctaVariant === 'emerald'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-500/25'
                                : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-red-500/25'
                          }`}
                        >
                          {block.ctaButtonText || 'Gọi Hotline Tư Vấn Ngay'}
                        </div>
                        {block.ctaSubtext && (
                          <span className="text-[11px] text-slate-400 mt-1 italic">{block.ctaSubtext}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 5. Khối Ưu / Nhược Điểm (Pros & Cons Block) */}
                  {block.type === 'prosCons' && (
                    <div className="space-y-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                          <Scale size={14} /> Khối Đánh Giá Ưu & Nhược Điểm (Featured Snippet)
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tiêu đề khối</label>
                        <Input
                          value={block.title || ''}
                          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          placeholder="Ví dụ: Đánh Giá Ưu Điểm & Nhược Điểm Xe..."
                          className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* Cột Xanh: Ưu điểm */}
                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <ThumbsUp size={13} /> Ưu Điểm ({(block.pros || []).length})
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentPros = block.pros || [];
                                updateBlock(block.id, { pros: [...currentPros, ''] });
                              }}
                              className="h-6 text-[11px] text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 px-2 rounded flex items-center gap-1 border border-emerald-500/30"
                            >
                              <Plus size={11} /> Thêm ưu điểm
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {(block.pros || []).map((pro, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                <input
                                  type="text"
                                  value={pro}
                                  onChange={(e) => {
                                    const nextPros = [...(block.pros || [])];
                                    nextPros[pIdx] = e.target.value;
                                    updateBlock(block.id, { pros: nextPros });
                                  }}
                                  placeholder="Nhập ưu điểm nổi bật..."
                                  className="bg-slate-950 border border-white/10 rounded-md px-2.5 py-1 text-xs text-slate-200 flex-1 focus:outline-none focus:border-emerald-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextPros = [...(block.pros || [])];
                                    nextPros.splice(pIdx, 1);
                                    updateBlock(block.id, { pros: nextPros });
                                  }}
                                  className="text-slate-500 hover:text-red-400 p-0.5"
                                  title="Xóa dòng này"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cột Đỏ: Nhược điểm */}
                        <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                              <ThumbsDown size={13} /> Nhược Điểm ({(block.cons || []).length})
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentCons = block.cons || [];
                                updateBlock(block.id, { cons: [...currentCons, ''] });
                              }}
                              className="h-6 text-[11px] text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 px-2 rounded flex items-center gap-1 border border-rose-500/30"
                            >
                              <Plus size={11} /> Thêm nhược điểm
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {(block.cons || []).map((con, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-1.5">
                                <AlertCircle size={13} className="text-rose-400 shrink-0" />
                                <input
                                  type="text"
                                  value={con}
                                  onChange={(e) => {
                                    const nextCons = [...(block.cons || [])];
                                    nextCons[cIdx] = e.target.value;
                                    updateBlock(block.id, { cons: nextCons });
                                  }}
                                  placeholder="Nhập điểm cần cải thiện..."
                                  className="bg-slate-950 border border-white/10 rounded-md px-2.5 py-1 text-xs text-slate-200 flex-1 focus:outline-none focus:border-rose-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextCons = [...(block.cons || [])];
                                    nextCons.splice(cIdx, 1);
                                    updateBlock(block.id, { cons: nextCons });
                                  }}
                                  className="text-slate-500 hover:text-red-400 p-0.5"
                                  title="Xóa dòng này"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>

            {/* Quick Add Toolbar */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Chèn nhanh Content Block tinh hoa:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('paragraph')}
                  className="text-xs h-9"
                >
                  <Plus size={14} /> Đoạn văn
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('heading')}
                  className="text-xs h-9"
                >
                  <Plus size={14} /> Tiêu đề H2
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('singleImage')}
                  className="text-xs h-9 text-cyan-400 hover:text-cyan-300 border-cyan-500/20"
                >
                  <ImageIcon size={14} /> Ảnh & Chú thích
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('imageGallery')}
                  className="text-xs h-9 text-purple-400 hover:text-purple-300 border-purple-500/20"
                >
                  <Images size={14} /> Thư viện ảnh lướt
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('specTable')}
                  className="text-xs h-9 text-amber-400 hover:text-amber-300 border-amber-500/20"
                >
                  <SlidersHorizontal size={14} /> So sánh thông số
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('ctaButton')}
                  className="text-xs h-9 text-rose-400 hover:text-rose-300 border-rose-500/20"
                >
                  <MousePointerClick size={14} /> Nút bấm CTA
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('prosCons')}
                  className="text-xs h-9 text-emerald-400 hover:text-emerald-300 border-emerald-500/20"
                >
                  <Scale size={14} /> Ưu / Nhược điểm
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('callout')}
                  className="text-xs h-9 text-amber-300 hover:text-amber-200"
                >
                  <Info size={14} /> Callout Box
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('priceTable')}
                  className="text-xs h-9 text-blue-400 hover:text-blue-300 border-blue-500/20"
                >
                  <TableIcon size={14} /> Bảng giá xe
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('relatedCar')}
                  className="text-xs h-9 text-sky-400 hover:text-sky-300 border-sky-500/20"
                >
                  <Car size={14} /> Xe gợi ý
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('leadForm')}
                  className="text-xs h-9 text-indigo-400 hover:text-indigo-300 border-indigo-500/20"
                >
                  <Send size={14} /> Form báo giá
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('faq')}
                  className="text-xs h-9 text-emerald-400 hover:text-emerald-300"
                >
                  <FileQuestion size={14} /> FAQ Accordion
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('youtube')}
                  className="text-xs h-9 text-red-400 hover:text-red-300"
                >
                  <Video size={14} /> YouTube
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addBlock('tiktok')}
                  className="text-xs h-9 text-pink-400 hover:text-pink-300"
                >
                  <Video size={14} /> TikTok
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* CỘT PHẢI: Bảng Chấm Điểm SEO Real-Time & Cài Đặt (4 Cột) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Real-Time SEO Score Card */}
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                Động cơ SEO Real-Time
              </h3>
              <span
                className={`text-lg font-black px-3 py-1 rounded-xl ${seoResult.status === 'good'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : seoResult.status === 'needs_improvement'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
              >
                {seoResult.score}/{seoResult.maxScore || 100}
              </span>
            </div>

            {/* Focus Keyword Input */}
            <div>
              <Input
                label="Từ khóa chính (Focus Keyword)"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g. giá xe hyundai santa fe 2026"
                className="h-10 rounded-xl bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
            </div>

            {/* 10 SEO Criteria Checklist */}
            <div className="space-y-2.5 pt-1">
              {seoResult.criteria.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
                >
                  {item.passed ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200">
                        {item.label}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.score}/{item.maxScore}đ
                      </span>
                    </div>
                    {item.message && (
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{item.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. SEO Metadata & Meta Tags */}
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 border-b border-white/10 pb-3 text-sm">
              Cài đặt Meta & Lập chỉ mục
            </h3>

            <div>
              <Input
                label="Meta Title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Để trống nếu dùng tiêu đề chính"
                className="h-9 bg-slate-950/60 border-white/10 text-slate-200 text-xs focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
            </div>

            <div>
              <Textarea
                label="Meta Description"
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Mô tả hiển thị trên Google SERP (120 - 160 ký tự)..."
                className="bg-slate-950/60 border-white/10 text-slate-200 text-xs focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 min-h-[64px]"
              />
            </div>

            <div className="pt-2 border-t border-white/10 space-y-4">
              <Switch
                label="Ghim bài nổi bật"
                description="Hiển thị ở vị trí ưu tiên trang chủ tin tức"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />

              <Switch
                label="Chặn Google index (NoIndex)"
                description="Thêm thẻ meta robots noindex"
                checked={noIndex}
                onCheckedChange={setNoIndex}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Chọn Ảnh Từ Thư Viện Dùng Chung */}
      <MediaPickerModal
        isOpen={!!mediaPickerTarget}
        onClose={() => setMediaPickerTarget(null)}
        mode={mediaPickerTarget?.type === 'gallery' ? 'multiple' : 'single'}
        title={
          mediaPickerTarget?.type === 'featured'
            ? 'Chọn Ảnh Đại Diện Bài Viết (Featured Image)'
            : mediaPickerTarget?.type === 'gallery'
            ? 'Chọn Nhiều Ảnh Cho Bộ Sưu Tập (Gallery)'
            : 'Chọn Hình Ảnh Cho Bài Viết'
        }
        initialSelectedUrls={
          mediaPickerTarget?.type === 'featured' && anhDaiDienUrl
            ? [anhDaiDienUrl]
            : []
        }
        onSelect={(selected) => {
          if (!mediaPickerTarget || selected.length === 0) return;

          if (mediaPickerTarget.type === 'featured') {
            const first = selected[0];
            setAnhDaiDienUrl(first.url);
            if (first.altText) {
              setAnhDaiDienAlt(first.altText);
            }
          } else if (mediaPickerTarget.type === 'singleImage') {
            const first = selected[0];
            updateBlock(mediaPickerTarget.blockId, {
              imageUrl: first.url,
              imageAlt: first.altText || first.filename,
              caption: first.filename,
            });
          } else if (mediaPickerTarget.type === 'gallery') {
            const newItems = selected.map((m) => ({
              url: m.url,
              alt: m.altText || m.filename,
              caption: m.filename,
            }));
            setBlocks((prev) =>
              prev.map((b) => {
                if (b.id !== mediaPickerTarget.blockId) return b;
                return {
                  ...b,
                  galleryImages: [...(b.galleryImages || []), ...newItems],
                };
              })
            );
          }
        }}
      />
    </div>
  );
}
