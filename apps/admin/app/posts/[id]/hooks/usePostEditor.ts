'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { postService, type CategoryItem } from '../../../../services/post.service';
import { catalogService, type CarSummary } from '../../../../services/catalog.service';
import { uploadSingleMedia } from '../../../../services/media.service';
import { calculateSeoScore, type SeoAnalysisResult, type TiptapDoc } from '@cardealer/core';
import type { OutlineItem, FaqItem, SeoOptimizationResult, FullArticleResult, FullArticleBlock } from '@cardealer/types';
import type { BlockType, EditorBlock, MediaPickerTarget, PostStatus } from '../types';
import { toSlug, createDefaultBlock } from '../utils';
import { serializeTiptapDoc, deserializeTiptapDoc } from '../ast';

// Helper format ISO date to datetime-local input string (YYYY-MM-DDTHH:mm)
function formatDatetimeForInput(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const offsetMs = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - offsetMs);
  return localDate.toISOString().slice(0, 16);
}


/**
 * Chuyển đổi mảng FullArticleBlock từ AI sang danh sách EditorBlock của Post Editor
 */
export function convertFullArticleBlocksToEditorBlocks(
  blocks: FullArticleBlock[],
  availableCars: CarSummary[] = [],
  keywordOrTitle?: string
): EditorBlock[] {
  const baseId = Date.now();
  return blocks.map((b, idx) => {
    const id = `ai-blk-${baseId}-${idx}`;
    if (b.type === 'heading') {
      return {
        id,
        type: 'heading',
        level: b.level || 2,
        content: b.content || '',
      };
    }
    if (b.type === 'callout') {
      return {
        id,
        type: 'callout',
        title: b.title || 'Lưu ý tư vấn mua xe',
        calloutType: b.calloutType || 'info',
        content: b.content || '',
      };
    }
    if (b.type === 'faq') {
      return {
        id,
        type: 'faq',
        title: b.title || 'Câu Hỏi Thường Gặp (FAQ)',
        faqs: b.faqs || [],
      };
    }
    if (b.type === 'prosCons') {
      return {
        id,
        type: 'prosCons',
        title: b.title || 'Đánh Giá Ưu & Nhược Điểm Thực Tế',
        pros: b.pros || [],
        cons: b.cons || [],
      };
    }
    if (b.type === 'ctaButton') {
      return {
        id,
        type: 'ctaButton',
        ctaButtonText: b.ctaButtonText || 'Nhận Báo Giá Lăn Bánh & Lái Thử',
        ctaActionType: b.ctaActionType || 'hotline',
        ctaSubtext: b.ctaSubtext || 'Hỗ trợ 24/7 - Giao xe tận nơi',
        ctaVariant: b.ctaVariant || 'red',
        ctaPhone: b.ctaPhone || '',
        ctaCustomUrl: b.ctaCustomUrl || '',
      };
    }
    if (b.type === 'singleImage') {
      let fallbackImage = b.imageUrl || '';
      if (!fallbackImage && availableCars.length > 0) {
        const matched = availableCars.find((c) => c.anhDaiDienUrl);
        if (matched?.anhDaiDienUrl) fallbackImage = matched.anhDaiDienUrl;
      }
      return {
        id,
        type: 'singleImage',
        imageUrl: fallbackImage,
        imageAlt: b.imageAlt || b.caption || keywordOrTitle || 'Hình ảnh chi tiết xe ô tô Hyundai',
        caption: b.caption || '',
      };
    }
    if (b.type === 'imageGallery') {
      return {
        id,
        type: 'imageGallery',
        title: b.title || 'Bộ Sưu Tập Hình Ảnh Chi Tiết',
        galleryStyle: 'slider',
        galleryImages: b.galleryImages || [],
      };
    }
    if (b.type === 'specTable') {
      return {
        id,
        type: 'specTable',
        title: typeof b.title === 'string' ? b.title : '',
        specVersions:
          b.specVersions && b.specVersions.length > 0
            ? b.specVersions
            : ['Bản Tiêu Chuẩn', 'Bản Đặc Biệt', 'Bản Cao Cấp'],
        specRows: b.specRows && b.specRows.length > 0 ? b.specRows : [],
      };
    }
    if (b.type === 'priceTable') {
      return {
        id,
        type: 'priceTable',
        title: typeof b.title === 'string' ? b.title : '',
        carSlug: b.carSlug || '',
        prices: b.prices || [],
      };
    }
    if (b.type === 'relatedCar') {
      const matchedCar = availableCars.find(
        (c) =>
          (b.carSlug && c.slug === b.carSlug) ||
          (b.carName && c.tenXe.toLowerCase().includes(b.carName.toLowerCase()))
      );
      return {
        id,
        type: 'relatedCar',
        carName: matchedCar?.tenXe || b.carName || 'Hyundai Accent 2026',
        carSlug: matchedCar?.slug || b.carSlug || 'hyundai-accent',
        carPrice: matchedCar?.minPrice || b.carPrice || 439000000,
        carImage: matchedCar?.anhDaiDienUrl || b.carImage || '/images/cars/accent.webp',
        seatCount: (matchedCar?.seatRange ? parseInt(matchedCar.seatRange) : 5) || b.seatCount || 5,
        fuelType: matchedCar?.fuelType || b.fuelType || 'Xăng 1.5L',
      };
    }
    if (b.type === 'leadForm') {
      return {
        id,
        type: 'leadForm',
        carName: b.carName || '',
        formHeadline: b.formHeadline || 'Đăng Ký Nhận Báo Giá Lăn Bánh & Lái Thử Tận Nhà',
        formSubheadline:
          b.formSubheadline || 'Chuyên viên tư vấn sẽ liên hệ gửi dự toán chi phí chi tiết trong 5 phút.',
        formButtonText: b.formButtonText || 'Gửi Yêu Cầu Nhận Báo Giá',
      };
    }
    if (b.type === 'youtube') {
      return {
        id,
        type: 'youtube',
        videoId: b.videoId || 'dQw4w9WgXcQ',
        videoUrl: b.videoUrl || (b.videoId ? `https://www.youtube.com/watch?v=${b.videoId}` : ''),
        title: b.title || 'Video Đánh Giá Thực Tế & Trải Nghiệm Lái Thử',
        caption: b.caption || '',
      };
    }
    if (b.type === 'tiktok') {
      return {
        id,
        type: 'tiktok',
        videoUrl: b.videoUrl || '',
        videoId: b.videoId || '',
        title: b.title || 'Video Trải Nghiệm Ngắn',
      };
    }
    return {
      id,
      type: 'paragraph',
      content: b.content || '',
    };
  });
}

export function usePostEditor() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const rawId = params?.id as string | undefined;
  const isNew = rawId === 'new' || pathname.endsWith('/new') || !rawId;
  const postId = isNew ? 'new' : (rawId || '');

  // State dữ liệu danh mục & kho xe
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [availableCars, setAvailableCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Form Fields
  const [tieuDe, setTieuDe] = useState('');
  const [slug, setSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [previewToken, setPreviewToken] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [anhDaiDienUrl, setAnhDaiDienUrl] = useState('');
  const [anhDaiDienAlt, setAnhDaiDienAlt] = useState('');
  const [tomTat, setTomTat] = useState('');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [publishedAt, setPublishedAt] = useState<string>(() => formatDatetimeForInput(new Date()));
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState(0);
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [noIndex, setNoIndex] = useState(false);

  // Content Blocks
  const [blocks, setBlocks] = useState<EditorBlock[]>([
    { id: '1', type: 'paragraph', content: '' },
  ]);

  // UI Modals & Helpers
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null);
  const [uploadingSingleImageBlockId, setUploadingSingleImageBlockId] = useState<string | null>(null);
  const [uploadingGalleryBlockId, setUploadingGalleryBlockId] = useState<string | null>(null);
  const [uploadingItemKey, setUploadingItemKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto clear toast after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Categories & Cars
  useEffect(() => {
    postService
      .getCategories()
      .then((res) => {
        const catList = res.data || [];
        setCategories(catList);
        if (catList.length > 0 && !categoryId) {
          setCategoryId(catList[0].id);
        }
      })
      .catch((err) => console.error('Lỗi khi tải danh mục bài viết:', err));

    catalogService
      .getCars()
      .then((cars) => {
        setAvailableCars(cars || []);
      })
      .catch((err) => console.error('Lỗi khi tải danh sách xe:', err));
  }, []);

  // Fetch Post if Edit Mode
  useEffect(() => {
    if (isNew) return;

    setLoading(true);
    setPageError(null);
    postService
      .getPostById(postId)
      .then((res) => {
        const post = res.data;
        if (!post) {
          setPageError('Không tìm thấy bài viết này');
          return;
        }
        setTieuDe(post.tieuDe || '');
        setSlug(post.slug || '');
        setOriginalSlug(post.slug || '');
        setPreviewToken(post.previewToken || '');
        setCategoryId(post.categoryId || '');
        setAnhDaiDienUrl(post.anhDaiDienUrl || '');
        setAnhDaiDienAlt(post.anhDaiDienAlt || '');
        setTomTat(post.tomTat || '');
        setStatus(post.status as PostStatus);

        const rawDate = post.publishedAt || post.createdAt;
        if (rawDate) {
          setPublishedAt(formatDatetimeForInput(rawDate));
        }

        setIsFeatured(post.isFeatured || false);
        setFeaturedOrder(post.featuredOrder || 0);
        setFocusKeyword(post.focusKeyword || '');
        setMetaTitle(post.metaTitle || '');
        setMetaDescription(post.metaDescription || '');
        setCanonicalUrl(post.canonicalUrl || '');
        setNoIndex(post.noIndex || false);

        if (post.noiDung) {
          const parsedBlocks = deserializeTiptapDoc(post.noiDung);
          setBlocks(parsedBlocks.length > 0 ? parsedBlocks : [{ id: '1', type: 'paragraph', content: '' }]);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu bài viết';
        setPageError(msg);
      })
      .finally(() => setLoading(false));
  }, [isNew, postId]);

  // Sinh Tiptap JSON AST Tree từ blocks
  const tiptapDoc = useMemo(() => {
    return serializeTiptapDoc(blocks);
  }, [blocks]);

  // Động cơ tính điểm SEO Real-Time 10 Tiêu Chí
  const seoResult: SeoAnalysisResult = useMemo(() => {
    return calculateSeoScore({
      tieuDe,
      slug,
      metaDescription,
      focusKeyword,
      noiDung: tiptapDoc as unknown as TiptapDoc,
      currentPostId: isNew ? undefined : postId,
    });
  }, [tieuDe, slug, metaDescription, focusKeyword, tiptapDoc, isNew, postId]);

  // Thao tác với Block
  const addBlock = (type: BlockType) => {
    const newBlock = createDefaultBlock(type, availableCars, tieuDe);
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

  // AI Helper Functions
  const insertOutlineBlocks = (outline: OutlineItem[]) => {
    const newBlocks: EditorBlock[] = [];
    const baseId = Date.now();
    outline.forEach((item, idx) => {
      const isH3 = item.level === 'h3' || item.level === 3;
      newBlocks.push({
        id: `ai-h-${baseId}-${idx}`,
        type: 'heading',
        level: isH3 ? 3 : 2,
        content: item.title,
      });
      if (item.points && item.points.length > 0) {
        newBlocks.push({
          id: `ai-p-${baseId}-${idx}`,
          type: 'paragraph',
          content: item.points.map((pt) => `• ${pt}`).join('\n'),
        });
      } else if (item.description) {
        newBlocks.push({
          id: `ai-p-${baseId}-${idx}`,
          type: 'paragraph',
          content: item.description,
        });
      }
    });
    setBlocks((prev) => [...prev, ...newBlocks]);
    setToast({ type: 'success', message: `Đã chèn ${newBlocks.length} khối nội dung từ dàn ý AI!` });
  };

  const insertFaqBlock = (faqs: FaqItem[]) => {
    const newBlock: EditorBlock = {
      id: `ai-faq-${Date.now()}`,
      type: 'faq',
      title: 'Câu Hỏi Thường Gặp (FAQ)',
      faqs: faqs.map((f) => ({ question: f.question, answer: f.answer })),
    };
    setBlocks((prev) => [...prev, newBlock]);
    setToast({ type: 'success', message: `Đã chèn khối FAQ (${faqs.length} câu hỏi) vào bài viết!` });
  };

  const appendParagraphBlock = (content: string) => {
    const newBlock: EditorBlock = {
      id: `ai-text-${Date.now()}`,
      type: 'paragraph',
      content,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setToast({ type: 'success', message: 'Đã chèn đoạn văn bản AI vào cuối bài viết!' });
  };

  const applyAiSeo = (seo: SeoOptimizationResult) => {
    if (seo.metaTitle) setMetaTitle(seo.metaTitle);
    if (seo.metaDescription) setMetaDescription(seo.metaDescription);
    if (seo.focusKeyword) setFocusKeyword(seo.focusKeyword);
    setToast({ type: 'success', message: 'Đã tối ưu hóa Meta Title & Description vào SEO Sidebar!' });
  };

  const insertContentBlocks = (blocksToInsert: FullArticleBlock[]) => {
    if (!blocksToInsert || blocksToInsert.length === 0) return;
    const mapped = convertFullArticleBlocksToEditorBlocks(blocksToInsert, availableCars, focusKeyword || tieuDe);
    setBlocks((prev) => {
      if (prev.length === 1 && prev[0].type === 'paragraph' && !prev[0].content?.trim()) {
        return mapped;
      }
      return [...prev, ...mapped];
    });
    setToast({
      type: 'success',
      message: `Đã chèn thành công ${mapped.length} Content Block tinh hoa vào bài viết!`,
    });
  };

  const applyFullArticle = (article: FullArticleResult) => {
    if (article.title) {
      setTieuDe(article.title);
      if (isNew || !slug || slug === originalSlug) {
        setSlug(toSlug(article.title));
      }
    }
    if (article.summary) {
      setTomTat(article.summary);
    }
    if (article.focusKeyword) {
      setFocusKeyword(article.focusKeyword);
    }
    if (article.metaTitle) {
      setMetaTitle(article.metaTitle);
    }
    if (article.metaDescription) {
      setMetaDescription(article.metaDescription);
    }
    if (!anhDaiDienAlt) {
      setAnhDaiDienAlt(article.focusKeyword || article.title || 'Hình ảnh đại diện bài viết');
    }

    if (article.blocks && article.blocks.length > 0) {
      const newBlocks = convertFullArticleBlocksToEditorBlocks(
        article.blocks,
        availableCars,
        article.focusKeyword || article.title
      );
      setBlocks(newBlocks);
      setToast({
        type: 'success',
        message: `Đã tự động khởi tạo toàn bộ bài viết hoàn chỉnh (${newBlocks.length} khối nội dung) & Cấu hình SEO 100% chuẩn On-Page!`,
      });
    }
  };

  // Upload ảnh trực tiếp lên Cloudinary
  const handleUploadGalleryImages = async (blockId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingGalleryBlockId(blockId);
    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map((file) => uploadSingleMedia(file));
      const results = await Promise.all(uploadPromises);
      const newItems = results.map((res) => ({
        url: res.url,
        alt: res.altText || res.filename || 'Hình ảnh bài viết',
        caption: res.filename || '',
      }));

      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          return {
            ...b,
            galleryImages: [...(b.galleryImages || []), ...newItems],
          };
        })
      );
      setToast({ type: 'success', message: `Đã tải lên thành công ${results.length} ảnh` });
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Tải lên bộ sưu tập ảnh thất bại',
      });
    } finally {
      setUploadingGalleryBlockId(null);
    }
  };

  const handleUploadGalleryImageAt = async (blockId: string, imageIndex: number, file: File | null) => {
    if (!file) return;
    const itemKey = `${blockId}-${imageIndex}`;
    setUploadingItemKey(itemKey);
    try {
      const res = await uploadSingleMedia(file);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId || !b.galleryImages) return b;
          const updated = [...b.galleryImages];
          updated[imageIndex] = {
            ...updated[imageIndex],
            url: res.url,
            alt: res.altText || res.filename,
          };
          return { ...b, galleryImages: updated };
        })
      );
      setToast({ type: 'success', message: 'Cập nhật ảnh thành công' });
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Thay đổi ảnh thất bại',
      });
    } finally {
      setUploadingItemKey(null);
    }
  };

  const handleUploadSingleImage = async (blockId: string, file: File | null) => {
    if (!file) return;
    setUploadingSingleImageBlockId(blockId);
    try {
      const res = await uploadSingleMedia(file);
      updateBlock(blockId, {
        imageUrl: res.url,
        imageAlt: res.altText || res.filename || 'Hình ảnh bài viết',
        caption: res.filename,
      });
      setToast({ type: 'success', message: 'Tải ảnh đơn thành công' });
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Tải ảnh thất bại',
      });
    } finally {
      setUploadingSingleImageBlockId(null);
    }
  };

  const handleTitleChange = (val: string) => {
    setTieuDe(val);
    if (isNew || slug === originalSlug || !slug) {
      setSlug(toSlug(val));
    }
  };

  // Preview Real-time (Tự động lưu bản nháp vào DB + Mở trực tiếp Web Storefront UI /tin-tuc/[slug]?token=...)
  const handlePreview = async () => {
    let activePostId = postId;
    const finalTieuDe = tieuDe.trim() || 'Bài viết xem trước (Bản nháp)';
    let finalSlug = slug.trim() || toSlug(finalTieuDe) || `draft-${Date.now()}`;
    let activeToken = previewToken;
    const targetSaveStatus = status === 'published' ? 'published' : 'draft';

    // 1. Tự động lưu bản nháp vào CSDL để đồng bộ previewToken và nội dung mới nhất
    setSaving(true);
    try {
      const resolvedPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : undefined;
      const payload = {
        tieuDe: finalTieuDe,
        slug: finalSlug,
        categoryId: categoryId || undefined,
        anhDaiDienUrl: anhDaiDienUrl || undefined,
        anhDaiDienAlt: anhDaiDienAlt || undefined,
        tomTat: tomTat.trim() || undefined,
        noiDung: tiptapDoc,
        status: targetSaveStatus,
        publishedAt: resolvedPublishedAt,
        createdAt: resolvedPublishedAt,
        isFeatured,
        featuredOrder,
        focusKeyword: focusKeyword.trim() || undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        noIndex,
      };

      if (isNew || activePostId === 'new') {
        const res = await postService.createPost(payload);
        if (res.data?.id) {
          activePostId = res.data.id;
          if (res.data.previewToken) activeToken = res.data.previewToken;
          if (res.data.slug) finalSlug = res.data.slug;
          setPreviewToken(activeToken);
          setSlug(finalSlug);
          setOriginalSlug(finalSlug);
          router.replace(`/posts/${activePostId}`);
        }
      } else {
        const res = await postService.updatePost(activePostId, payload);
        if (res.data?.previewToken) activeToken = res.data.previewToken;
        if (res.data?.slug) finalSlug = res.data.slug;
        setPreviewToken(activeToken);
        setSlug(finalSlug);
        setOriginalSlug(finalSlug);
      }
      setToast({ type: 'success', message: 'Đã lưu bản nháp và mở giao diện Web thực tế!' });
    } catch (err: unknown) {
      console.warn('Lỗi khi tự động lưu bản nháp server:', err);
    } finally {
      setSaving(false);
    }

    // 2. Xác định Base URL của Web Storefront (apps/web)
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const storefrontBaseUrl = isLocal
      ? `http://${window.location.hostname}:3002`
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://xehyundaivinh.com');

    // 3. Mở tab Xem trước trực tiếp trên Web Storefront (/tin-tuc/[slug]?token=...)
    const queryParam = activeToken ? `?token=${encodeURIComponent(activeToken)}` : '';
    const targetUrl = `${storefrontBaseUrl}/tin-tuc/${encodeURIComponent(finalSlug)}${queryParam}`;

    window.open(targetUrl, '_blank');
  };

  // Save / Publish
  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (!tieuDe.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập tiêu đề bài viết' });
      return;
    }
    if (!slug.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập đường dẫn slug' });
      return;
    }

    setSaving(true);
    try {
      const resolvedPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : undefined;
      const payload = {
        tieuDe: tieuDe.trim(),
        slug: slug.trim(),
        categoryId: categoryId || undefined,
        anhDaiDienUrl: anhDaiDienUrl || undefined,
        anhDaiDienAlt: anhDaiDienAlt || undefined,
        tomTat: tomTat.trim() || undefined,
        noiDung: tiptapDoc,
        status: targetStatus,
        publishedAt: resolvedPublishedAt,
        createdAt: resolvedPublishedAt,
        isFeatured,
        featuredOrder,
        focusKeyword: focusKeyword.trim() || undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        noIndex,
      };

      if (isNew) {
        const res = await postService.createPost(payload);
        setToast({ type: 'success', message: targetStatus === 'published' ? 'Đã xuất bản bài viết thành công!' : 'Tạo bản nháp bài viết mới thành công!' });
        if (res.data?.id) {
          if (res.data.previewToken) setPreviewToken(res.data.previewToken);
          router.replace(`/posts/${res.data.id}`);
        }
      } else {
        const res = await postService.updatePost(postId, payload);
        if (res.data?.previewToken) setPreviewToken(res.data.previewToken);
        setStatus(targetStatus);
        setOriginalSlug(slug.trim());
        setToast({
          type: 'success',
          message: targetStatus === 'published' ? 'Đã xuất bản bài viết thành công!' : 'Đã lưu bản nháp bài viết thành công!',
        });
      }
    } catch (err: unknown) {
      console.error('Lỗi khi lưu bài viết:', err);
      const msg = err instanceof Error ? err.message : 'Không thể lưu bài viết';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return {
    isNew,
    postId,
    categories,
    availableCars,
    loading,
    saving,
    pageError,
    toast,
    setToast,
    // Fields
    tieuDe,
    setTieuDe,
    handleTitleChange,
    slug,
    setSlug,
    originalSlug,
    setOriginalSlug,
    previewToken,
    categoryId,
    setCategoryId,
    anhDaiDienUrl,
    setAnhDaiDienUrl,
    anhDaiDienAlt,
    setAnhDaiDienAlt,
    tomTat,
    setTomTat,
    status,
    setStatus,
    publishedAt,
    setPublishedAt,
    isFeatured,
    setIsFeatured,
    featuredOrder,
    setFeaturedOrder,
    focusKeyword,
    setFocusKeyword,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    canonicalUrl,
    setCanonicalUrl,
    noIndex,
    setNoIndex,
    // Blocks
    blocks,
    setBlocks,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    // Helpers
    seoResult,
    handleSave,
    handlePreview,
    insertOutlineBlocks,
    insertFaqBlock,
    appendParagraphBlock,
    applyAiSeo,
    applyFullArticle,
    insertContentBlocks,
    // UI states
    isAiModalOpen,
    setIsAiModalOpen,
    mediaPickerTarget,
    setMediaPickerTarget,
    uploadingSingleImageBlockId,
    uploadingGalleryBlockId,
    uploadingItemKey,
    handleUploadGalleryImages,
    handleUploadGalleryImageAt,
    handleUploadSingleImage,
  };
}
