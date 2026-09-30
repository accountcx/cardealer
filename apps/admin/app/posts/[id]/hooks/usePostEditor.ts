'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { postService, type CategoryItem } from '../../../../services/post.service';
import { catalogService, type CarSummary } from '../../../../services/catalog.service';
import { mediaService } from '../../../../services/media.service';
import { calculateSeoScore, type SeoAnalysisResult, type TiptapDoc } from '@cardealer/core';
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

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  // Media Picker Modal State
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget>(null);

  // Cloudinary Direct Upload State
  const [uploadingGalleryBlockId, setUploadingGalleryBlockId] = useState<string | null>(null);
  const [uploadingItemKey, setUploadingItemKey] = useState<string | null>(null);
  const [uploadingSingleImageBlockId, setUploadingSingleImageBlockId] = useState<string | null>(null);

  // Block Content State
  const [blocks, setBlocks] = useState<EditorBlock[]>([
    { id: '1', type: 'paragraph', content: 'Giới thiệu tổng quan về mẫu xe Hyundai thế hệ mới...' },
  ]);

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Tự động sinh Slug từ Tiêu đề
  const handleTitleChange = (val: string) => {
    setTieuDe(val);
    if (isNew || !slug || slug === toSlug(tieuDe)) {
      setSlug(toSlug(val));
    }
  };

  // Tải danh mục & catalog xe
  useEffect(() => {
    postService
      .getCategories()
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setCategories(list);
        if (isNew && list.length > 0) {
          setCategoryId((prev) => prev || list[0].id);
        }
      })
      .catch((err) => console.error('[Post Editor] Lỗi tải chuyên mục:', err));

    catalogService
      .getCars()
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
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
            setStatus(p.status as PostStatus);
            setIsFeatured(p.isFeatured);
            setFeaturedOrder(p.featuredOrder);
            setPreviewToken(p.previewToken || null);

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
  const tiptapDoc = useMemo((): TiptapDoc => serializeTiptapDoc(blocks), [blocks]);

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

  // Upload ảnh trực tiếp lên Cloudinary
  const handleUploadGalleryImages = async (blockId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingGalleryBlockId(blockId);
    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map(async (file) => {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const mediaItem = await mediaService.uploadSingleMedia(file, cleanName);
        return {
          url: mediaItem.url,
          alt: mediaItem.altText || cleanName || 'Hình ảnh chi tiết xe',
          caption: cleanName || '',
        };
      });

      const newGalleryImages = await Promise.all(uploadPromises);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          return { ...b, galleryImages: [...(b.galleryImages || []), ...newGalleryImages] };
        })
      );
      setToast({ type: 'success', message: `Đã tải ${newGalleryImages.length} ảnh lên Cloudinary thành công!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải ảnh lên Cloudinary';
      setToast({ type: 'error', message: `Lỗi tải ảnh lên Cloudinary: ${msg}` });
    } finally {
      setUploadingGalleryBlockId(null);
    }
  };

  const handleUploadGalleryImageAt = async (blockId: string, imgIdx: number, file: File | null) => {
    if (!file) return;
    const itemKey = `${blockId}-${imgIdx}`;
    setUploadingItemKey(itemKey);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const mediaItem = await mediaService.uploadSingleMedia(file, cleanName);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const current = [...(b.galleryImages || [])];
          current[imgIdx] = {
            ...current[imgIdx],
            url: mediaItem.url,
            alt: current[imgIdx]?.alt || cleanName || 'Hình ảnh chi tiết xe',
            caption: current[imgIdx]?.caption || cleanName || '',
          };
          return { ...b, galleryImages: current };
        })
      );
      setToast({ type: 'success', message: 'Đã tải ảnh lên Cloudinary thành công!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải ảnh lên Cloudinary';
      setToast({ type: 'error', message: `Lỗi tải ảnh lên Cloudinary: ${msg}` });
    } finally {
      setUploadingItemKey(null);
    }
  };

  const handleUploadSingleImage = async (blockId: string, file: File | null) => {
    if (!file) return;
    setUploadingSingleImageBlockId(blockId);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const mediaItem = await mediaService.uploadSingleMedia(file, cleanName);
      updateBlock(blockId, {
        imageUrl: mediaItem.url,
        imageAlt: cleanName,
        caption: cleanName,
      });
      setToast({ type: 'success', message: 'Đã tải ảnh lên Cloudinary thành công!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải ảnh lên Cloudinary';
      setToast({ type: 'error', message: `Lỗi tải ảnh lên Cloudinary: ${msg}` });
    } finally {
      setUploadingSingleImageBlockId(null);
    }
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

    if (targetStatus === 'published') {
      const fullText = blocks.map((b) => b.content || b.title || '').join(' ');
      const placeholderRegex = /\[\s*\.\.\.\s*\]|\[\s*…\s*\]|\[cần bổ sung\]|\[todo\]/i;
      if (placeholderRegex.test(fullText)) {
        setToast({
          type: 'error',
          message: 'Chặn xuất bản: Bài viết vẫn còn ký tự giữ chỗ chưa hoàn thiện ([...], [cần bổ sung], hoặc [todo]).',
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
        await postService.createPost(payload);
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

  // Live Preview Handler
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

  return {
    isNew,
    postId,
    categories,
    availableCars,
    loading,
    saving,
    pageError,
    // Fields
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
    // State & blocks
    blocks,
    setBlocks,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    // Upload & modals
    mediaPickerTarget,
    setMediaPickerTarget,
    uploadingGalleryBlockId,
    uploadingItemKey,
    uploadingSingleImageBlockId,
    handleUploadGalleryImages,
    handleUploadGalleryImageAt,
    handleUploadSingleImage,
    // Toast & actions
    toast,
    setToast,
    seoResult,
    handleSave,
    handlePreview,
  };
}
