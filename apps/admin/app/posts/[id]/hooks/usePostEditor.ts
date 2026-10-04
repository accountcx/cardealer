'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { postService, type CategoryItem } from '../../../../services/post.service';
import { catalogService, type CarSummary } from '../../../../services/catalog.service';
import { uploadSingleMedia } from '../../../../services/media.service';
import { calculateSeoScore, type SeoAnalysisResult, type TiptapDoc } from '@cardealer/core';
import type { OutlineItem, FaqItem, SeoOptimizationResult } from '@cardealer/types';
import type { BlockType, EditorBlock, MediaPickerTarget, PostStatus } from '../types';
import { toSlug, createDefaultBlock } from '../utils';
import { serializeTiptapDoc, deserializeTiptapDoc } from '../ast';

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
  const [categoryId, setCategoryId] = useState('');
  const [anhDaiDienUrl, setAnhDaiDienUrl] = useState('');
  const [anhDaiDienAlt, setAnhDaiDienAlt] = useState('');
  const [tomTat, setTomTat] = useState('');
  const [status, setStatus] = useState<PostStatus>('draft');
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
        setCategoryId(post.categoryId || '');
        setAnhDaiDienUrl(post.anhDaiDienUrl || '');
        setAnhDaiDienAlt(post.anhDaiDienAlt || '');
        setTomTat(post.tomTat || '');
        setStatus(post.status as PostStatus);
        setIsFeatured(post.isFeatured || false);
        setFeaturedOrder(post.featuredOrder || 0);
        setFocusKeyword('');
        setMetaTitle('');
        setMetaDescription('');
        setCanonicalUrl('');
        setNoIndex(false);

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

  // Preview Real-time (Đồng bộ vào sessionStorage và mở tab xem trước)
  const handlePreview = () => {
    const previewPayload = {
      tieuDe,
      slug,
      categoryId,
      categoryName: categories.find((c) => c.id === categoryId)?.tenChuyenMuc || 'Tin tức xe',
      anhDaiDienUrl,
      anhDaiDienAlt,
      tomTat,
      noiDung: tiptapDoc,
      status,
      isFeatured,
      metaTitle,
      metaDescription,
      canonicalUrl,
      updatedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem('cardealer_post_preview', JSON.stringify(previewPayload));
      window.open('/preview/post', '_blank');
    } catch (err) {
      console.error('Lỗi khi mở Preview:', err);
      setToast({ type: 'error', message: 'Không thể mở chế độ xem trước' });
    }
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
      const payload = {
        tieuDe: tieuDe.trim(),
        slug: slug.trim(),
        categoryId: categoryId || undefined,
        anhDaiDienUrl: anhDaiDienUrl || undefined,
        anhDaiDienAlt: anhDaiDienAlt || undefined,
        tomTat: tomTat.trim() || undefined,
        noiDung: tiptapDoc,
        status: targetStatus,
        isFeatured,
        featuredOrder,
        focusKeyword: focusKeyword.trim() || undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        noIndex,
      };

      if (isNew) {
        const created = await postService.createPost(payload);
        setToast({ type: 'success', message: 'Tạo bài viết mới thành công!' });
        router.push(`/posts/${created.data.id}`);
      } else {
        await postService.updatePost(postId, payload);
        setStatus(targetStatus);
        setToast({
          type: 'success',
          message: targetStatus === 'published' ? 'Đã xuất bản bài viết thành công!' : 'Đã lưu bản nháp thành công!',
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu bài viết',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    isNew,
    postId,
    loading,
    saving,
    pageError,
    toast,
    setToast,

    // Categories & Cars
    categories,
    availableCars,

    // Form fields
    tieuDe,
    setTieuDe,
    handleTitleChange,
    slug,
    setSlug,
    originalSlug,
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

    // Content Blocks
    blocks,
    setBlocks,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,

    // AI Helper States & Methods
    isAiModalOpen,
    setIsAiModalOpen,
    insertOutlineBlocks,
    insertFaqBlock,
    appendParagraphBlock,
    applyAiSeo,

    // Media & SEO
    mediaPickerTarget,
    setMediaPickerTarget,
    uploadingSingleImageBlockId,
    uploadingGalleryBlockId,
    uploadingItemKey,
    handleUploadGalleryImages,
    handleUploadGalleryImageAt,
    handleUploadSingleImage,
    seoResult,

    // Actions
    handlePreview,
    handleSave,
  };
}
