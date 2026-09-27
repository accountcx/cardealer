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
  Lock,
  Car,
  Table as TableIcon,
  Info,
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
} from '@cardealer/ui';
import { postService, type PostItem, type CategoryItem } from '../../../services/post.service';
import { catalogService, type CarSummary } from '../../../services/catalog.service';
import { calculateSeoScore, type SeoAnalysisResult, type TiptapDoc } from '@cardealer/core';
import { useAuth } from '../../../contexts/AuthContext';
import { AccessDenied } from '../../components/AccessDenied';

// Các loại Block trực quan chuẩn E-E-A-T & High Conversion
type BlockType =
  | 'paragraph'
  | 'heading'
  | 'callout'
  | 'youtube'
  | 'tiktok'
  | 'faq'
  | 'gated'
  | 'relatedCar'
  | 'priceTable'
  | 'leadForm';

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
  gatedBadge?: string;
  gatedDesc?: string;
  carName?: string;
  carSlug?: string;
  carPrice?: number;
  carImage?: string;
  seatCount?: number;
  fuelType?: string;
  prices?: PriceVersionItem[];
  formHeadline?: string;
  formSubheadline?: string;
  formButtonText?: string;
}

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
              title: b.title || 'Thông tin lưu ý',
              content: b.content || '',
            },
          };
        case 'youtube':
          return {
            type: 'youtubeBlock',
            attrs: {
              videoId: b.videoId || 'dQw4w9WgXcQ',
              videoUrl: b.videoUrl || `https://www.youtube.com/watch?v=${b.videoId || ''}`,
              caption: b.caption || '',
            },
          };
        case 'tiktok':
          return {
            type: 'tikTokBlock',
            attrs: {
              videoId: b.videoId || '7000000000000000000',
              videoUrl: b.videoUrl || `https://www.tiktok.com/@hyundai/video/${b.videoId || ''}`,
              title: b.title || '',
              posterImageUrl: b.posterUrl || '',
            },
          };
        case 'faq':
          return {
            type: 'faqBlock',
            attrs: {
              questions: b.faqs || [
                { question: 'Hyundai Santa Fe 2026 có mấy phiên bản?', answer: 'Có 5 phiên bản chính hãng.' },
              ],
            },
          };
        case 'gated':
          return {
            type: 'gatedContent',
            attrs: {
              badgeText: b.gatedBadge || 'Nội dung độc quyền',
              title: b.title || 'Tải Bảng Dự Toán Lăn Bánh Chi Tiết',
              description: b.gatedDesc || 'Để lại SĐT/Zalo nhận báo giá trong 5 phút.',
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
      if (node.type === 'gatedContent') {
        return {
          id,
          type: 'gated',
          gatedBadge: (node.attrs?.badgeText as string) || '',
          title: (node.attrs?.title as string) || '',
          gatedDesc: (node.attrs?.description as string) || '',
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
        type === 'callout'
          ? 'Lưu ý quan trọng'
          : type === 'gated'
            ? 'Nhận Báo Giá Lăn Bánh Ưu Đãi'
            : type === 'priceTable'
              ? 'Bảng Giá & Chi Phí Lăn Bánh Tham Khảo (Tháng 09/2026)'
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
          ? (availableCars.length > 0 && availableCars[0].versions && availableCars[0].versions.length > 0
            ? availableCars[0].versions.map((v) => {
              const listed = v.giaNiemYet || 0;
              const promo = v.giaKhuyenMai || listed;
              const discount = Math.max(0, listed - promo);
              const cleanVer = v.tenPhienBan.toLowerCase().startsWith(availableCars[0].tenXe.toLowerCase())
                ? v.tenPhienBan
                : `${availableCars[0].tenXe} ${v.tenPhienBan}`;
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
              { version: 'Hyundai Creta 1.5 Cao Cấp', listedPrice: 699000000, discount: 45000000, rollingPrice: 735000000 },
            ])
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

              <Input
                label="Link ảnh đại diện (Featured Image) *"
                value={anhDaiDienUrl}
                onChange={(e) => setAnhDaiDienUrl(e.target.value)}
                placeholder="https://.../anh-dai-dien.webp"
                className="h-10 bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
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
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className="p-4 rounded-xl border border-white/10 bg-slate-950/40 space-y-3 relative group hover:border-cyan-500/30 transition-all"
                >
                  {/* Block Header & Action Controls */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                    <span className="font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      {block.type === 'heading' && `Tiêu đề H${block.level || 2}`}
                      {block.type === 'paragraph' && 'Đoạn văn bản'}
                      {block.type === 'callout' && 'Khối hộp ghi chú (Callout)'}
                      {block.type === 'youtube' && 'Video YouTube'}
                      {block.type === 'tiktok' && 'Video TikTok'}
                      {block.type === 'faq' && 'Khối FAQ (Hỏi Đáp)'}
                      {block.type === 'gated' && 'Khối Gated Content (Khóa mờ)'}
                      {block.type === 'relatedCar' && 'Khối xe gợi ý'}
                      {block.type === 'priceTable' && 'Bảng giá lăn bánh'}
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

                  {block.type === 'callout' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-44 shrink-0 relative z-20">
                          <Select
                            variant="dark"
                            options={[
                              { value: 'info', label: 'Thông tin (Info)' },
                              { value: 'warning', label: 'Cảnh báo (Warning)' },
                              { value: 'success', label: 'Ưu đãi (Success)' },
                              { value: 'note', label: 'Ghi chú (Note)' },
                            ]}
                            value={block.calloutType || 'info'}
                            onChange={(e) => updateBlock(block.id, { calloutType: e.target.value as any })}
                            className="h-10 bg-slate-900 border-white/10 text-slate-200 text-xs font-semibold"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            placeholder="Tiêu đề hộp ghi chú..."
                            className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-semibold"
                          />
                        </div>
                      </div>
                      <Textarea
                        rows={2}
                        value={block.content || ''}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Nội dung chi tiết trong hộp callout..."
                        className="bg-slate-900 border-white/10 text-slate-200 text-sm min-h-[60px]"
                      />
                    </div>
                  )}

                  {block.type === 'youtube' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={block.videoId || ''}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            videoId: e.target.value,
                            videoUrl: `https://www.youtube.com/watch?v=${e.target.value}`,
                          })
                        }
                        placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)"
                        className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-mono"
                      />
                      <Input
                        value={block.caption || ''}
                        onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                        placeholder="Chú thích video..."
                        className="h-10 bg-slate-900 border-white/10 text-slate-200 text-sm"
                      />
                    </div>
                  )}

                  {block.type === 'gated' && (
                    <div className="space-y-2 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <Input
                        value={block.title || ''}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder="Tiêu đề form mở khóa (e.g. Tải Bảng Dự Toán Lăn Bánh Chi Tiết)..."
                        className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-bold"
                      />
                      <Input
                        value={block.gatedDesc || ''}
                        onChange={(e) => updateBlock(block.id, { gatedDesc: e.target.value })}
                        placeholder="Mô tả hấp dẫn (e.g. Để lại SĐT/Zalo nhận file báo giá tức thì)..."
                        className="h-9 bg-slate-900 border-white/10 text-slate-300 text-xs"
                      />
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

                  {block.type === 'priceTable' && (
                    <div className="space-y-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                          <TableIcon size={14} /> Bảng Giá & Chi Phí Lăn Bánh Tham Khảo
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentPrices = block.prices || [];
                            updateBlock(block.id, {
                              prices: [
                                ...currentPrices,
                                {
                                  version: '',
                                  listedPrice: 0,
                                  discount: 0,
                                  rollingPrice: 0,
                                },
                              ],
                            });
                          }}
                          className="h-7 text-xs text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 px-2.5 flex items-center gap-1 rounded-lg border border-blue-500/30"
                        >
                          <Plus size={13} /> Thêm phiên bản xe
                        </Button>
                      </div>

                      <Input
                        value={block.title || ''}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder="Tiêu đề bảng giá (e.g. Bảng Giá Xe Hyundai Mới Nhất Tại TP. Vinh)..."
                        className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-bold placeholder:text-slate-600"
                      />

                      <div className="space-y-3">
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
                        ).map((priceItem, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-2.5 relative group/price"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-mono text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded">
                                Dòng phiên bản #{pIdx + 1}
                              </span>
                              {(block.prices?.length || 0) > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextPrices = [...(block.prices || [])];
                                    nextPrices.splice(pIdx, 1);
                                    updateBlock(block.id, { prices: nextPrices });
                                  }}
                                  className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                                  title="Xóa phiên bản này"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                              {/* ⚡ Cột 1: Tên phiên bản với Dropdown chọn từ kho xe (Chiếm 5/12 chiều rộng) */}
                              <div className="lg:col-span-5 space-y-1">
                                <label className="block text-[11px] font-semibold text-slate-300">
                                  Tên phiên bản *
                                </label>
                                <Select
                                  variant="dark"
                                  placeholder="-- Bấm vào đây để chọn phiên bản xe --"
                                  value={allVersionOptions.find((opt) => opt.fullLabel === priceItem.version || opt.value === priceItem.version)?.value || ''}
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
                                  options={allVersionOptions.map((opt) => ({
                                    value: opt.value,
                                    label: opt.label,
                                  }))}
                                  className="h-9 bg-slate-950 border-white/10 text-slate-100 text-xs font-medium"
                                />
                              </div>

                              {/* Giá niêm yết (2/12) */}
                              <div className="lg:col-span-2">
                                <label className="block text-[11px] text-slate-400 mb-1">
                                  Giá niêm yết (VNĐ)
                                </label>
                                <Input
                                  type="number"
                                  value={priceItem.listedPrice || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
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
                                  placeholder="Giá niêm yết..."
                                  className="h-9 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono font-medium"
                                />
                              </div>

                              {/* Ưu đãi giảm giá (2/12) */}
                              <div className="lg:col-span-2">
                                <label className="block text-[11px] text-slate-400 mb-1">
                                  Ưu đãi giảm giá (VNĐ)
                                </label>
                                <Input
                                  type="number"
                                  value={priceItem.discount || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
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
                                  placeholder="Giảm giá..."
                                  className="h-9 bg-slate-950 border-white/10 text-emerald-400 text-xs font-mono font-medium"
                                />
                              </div>

                              {/* Giá lăn bánh tạm tính (3/12) */}
                              <div className="lg:col-span-3">
                                <label className="block text-[11px] text-slate-400 mb-1">
                                  Giá lăn bánh tạm tính (VNĐ)
                                </label>
                                <Input
                                  type="number"
                                  value={priceItem.rollingPrice || ''}
                                  onChange={(e) => {
                                    const nextPrices = [...(block.prices || [])];
                                    nextPrices[pIdx] = {
                                      ...nextPrices[pIdx],
                                      rollingPrice: Number(e.target.value) || 0,
                                    };
                                    updateBlock(block.id, { prices: nextPrices });
                                  }}
                                  placeholder="Lăn bánh..."
                                  className="h-9 bg-slate-950 border-white/10 text-cyan-300 text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-900/60 rounded-xl border border-white/10">
                      <Input
                        value={block.videoId || ''}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            videoId: e.target.value,
                            videoUrl: `https://www.tiktok.com/@hyundai/video/${e.target.value}`,
                          })
                        }
                        placeholder="TikTok Video ID (e.g. 7000000000000000000)"
                        className="h-10 bg-slate-900 border-white/10 text-slate-100 text-sm font-mono"
                      />
                      <Input
                        value={block.title || ''}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder="Tiêu đề video TikTok..."
                        className="h-10 bg-slate-900 border-white/10 text-slate-200 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
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
                  onClick={() => addBlock('gated')}
                  className="text-xs h-9 text-yellow-400 hover:text-yellow-300 border-yellow-500/30"
                >
                  <Lock size={14} /> Gated Content (Paywall)
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
    </div>
  );
}
