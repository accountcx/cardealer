'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { pagesService } from '../../../../services/pages.service';
import { RESERVED_SLUGS, type StaticPageTemplate, type StaticPageSchemaType } from '@cardealer/types';
import type { TiptapDoc } from '@cardealer/core';
import type { EditorBlock, BlockType } from '../../../posts/[id]/types';
import { serializeTiptapDoc, deserializeTiptapDoc } from '../../../posts/[id]/ast';
import { catalogService, type CarSummary } from '../../../../services/catalog.service';
import type { MediaItem } from '@cardealer/types';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export type PageMediaPickerTarget =
  | { type: 'ogImage' }
  | { type: 'singleImage'; blockId: string }
  | { type: 'gallery'; blockId: string }
  | null;

// WHY: Custom Hook quản trị toàn bộ Form State & Content Blocks AST Tree cho Static Page Editor (Mental Model Conformance).
// Đồng bộ 100% với Post Editor Studio, tự động chuyển đổi qua lại giữa Visual Blocks và Tiptap JSON AST Tree.
export function usePageEditor(id?: string) {
  const router = useRouter();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Danh mục xe phục vụ các block PriceTable, RelatedCar, LeadForm
  const [availableCars, setAvailableCars] = useState<CarSummary[]>([]);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [templateType, setTemplateType] = useState<StaticPageTemplate>('DEFAULT');
  const [isPublished, setIsPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [schemaType, setSchemaType] = useState<StaticPageSchemaType>('WebPage');

  // Content Blocks State (Visual Tiptap AST Editor)
  const [blocks, setBlocks] = useState<EditorBlock[]>([
    { id: '1', type: 'paragraph', content: 'Nhập nội dung mở đầu cho trang tĩnh tại đây...' },
  ]);

  // Media Picker Modal Target State
  const [mediaPickerTarget, setMediaPickerTarget] = useState<PageMediaPickerTarget>(null);

  // Load dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (!isNew && id) {
      let isMounted = true;
      setLoading(true);
      pagesService
        .getPageById(id)
        .then((page) => {
          if (!isMounted) return;
          setTitle(page.title);
          setSlug(page.slug);
          setSlugManuallyEdited(true);
          setTemplateType(page.templateType);
          setIsPublished(page.isPublished);
          setMetaTitle(page.metaTitle || '');
          setMetaDescription(page.metaDescription || '');
          setCanonicalUrl(page.canonicalUrl || '');
          setOgImage(page.ogImage || '');
          setNoIndex(page.noIndex);
          setSchemaType(page.schemaType || 'WebPage');

          if (page.content && typeof page.content === 'object') {
            const loadedBlocks = deserializeTiptapDoc(page.content as TiptapDoc);
            if (loadedBlocks.length > 0) {
              setBlocks(loadedBlocks);
            }
          }
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : 'Không thể tải thông tin trang tĩnh';
          if (isMounted) setError(msg.replace(/[\r\n]/g, ' '));
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [id, isNew]);

  // Tự động sinh slug khi nhập title nếu chưa sửa thủ công
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew && !slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(val));
  };

  // Quản lý Content Blocks (Thêm, Xóa, Đổi vị trí, Cập nhật)
  const addBlock = useCallback((type: BlockType) => {
    const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    let initialProps: Partial<EditorBlock> = {};

    switch (type) {
      case 'heading':
        initialProps = { level: 2, content: 'Tiêu đề mới' };
        break;
      case 'paragraph':
        initialProps = { content: '' };
        break;
      case 'callout':
        initialProps = { calloutType: 'info', title: 'Lưu ý quan trọng', content: '' };
        break;
      case 'singleImage':
        initialProps = { imageUrl: '', imageAlt: '', caption: '' };
        break;
      case 'imageGallery':
        initialProps = { galleryStyle: 'slider', galleryImages: [] };
        break;
      case 'faq':
        initialProps = { faqs: [{ question: 'Câu hỏi thường gặp?', answer: 'Câu trả lời chi tiết...' }] };
        break;
      case 'ctaButton':
        initialProps = { ctaButtonText: 'Đăng Ký Tư Vấn Ngay', ctaActionType: 'quoteForm', ctaVariant: 'blue' };
        break;
      case 'prosCons':
        initialProps = { pros: ['Ưu điểm nổi bật 1'], cons: ['Nhược điểm cần lưu ý 1'] };
        break;
      default:
        initialProps = {};
    }

    setBlocks((prev) => [...prev, { id: newId, type, ...initialProps }]);
  }, []);

  const removeBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }, []);

  const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index]!;
      next[index] = next[targetIndex]!;
      next[targetIndex] = temp;
      return next;
    });
  }, []);

  const updateBlock = useCallback((blockId: string, updates: Partial<EditorBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b)));
  }, []);

  // Fetch danh mục xe phục vụ các blocks
  useEffect(() => {
    catalogService.getCars().then(setAvailableCars).catch(() => {});
  }, []);

  // Xử lý chọn ảnh từ MediaPickerModal
  const handleMediaSelect = useCallback(
    (selected: MediaItem[]) => {
      if (!selected.length || !mediaPickerTarget) return;

      if (mediaPickerTarget.type === 'ogImage') {
        setOgImage(selected[0]?.url || '');
      } else if (mediaPickerTarget.type === 'singleImage') {
        updateBlock(mediaPickerTarget.blockId, {
          imageUrl: selected[0]?.url || '',
          imageAlt: selected[0]?.altText || selected[0]?.filename || '',
        });
      } else if (mediaPickerTarget.type === 'gallery') {
        const newImages = selected.map((item) => ({
          url: item.url,
          alt: item.altText || item.filename || '',
          caption: item.altText || '',
        }));
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === mediaPickerTarget.blockId
              ? { ...b, galleryImages: [...(b.galleryImages || []), ...newImages] }
              : b
          )
        );
      }
      setMediaPickerTarget(null);
    },
    [mediaPickerTarget, updateBlock]
  );

  // Lưu trang (Tạo mới hoặc Cập nhật)
  const handleSave = async (publishOverride?: boolean) => {
    try {
      setSaving(true);
      setError(null);

      const publishState = publishOverride !== undefined ? publishOverride : isPublished;

      // Validate client cơ bản
      if (!title.trim()) throw new Error('Vui lòng nhập tiêu đề trang');
      if (!slug.trim()) throw new Error('Vui lòng nhập đường dẫn slug');
      if ((RESERVED_SLUGS as readonly string[]).includes(slug.trim())) {
        throw new Error(`Đường dẫn '/${slug.trim()}' trùng với hệ thống (Reserved Slug). Vui lòng chọn slug khác.`);
      }

      // WHY: Serialize blocks thành cấu trúc Tiptap JSON AST Tree Node chuẩn.
      const astContent = serializeTiptapDoc(blocks);

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        content: astContent as Record<string, unknown>,
        templateType,
        isPublished: publishState,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        ogImage: ogImage.trim() || undefined,
        noIndex,
        schemaType,
      };

      if (isNew) {
        await pagesService.createPage(payload);
      } else {
        await pagesService.updatePage(id, payload);
      }

      router.push('/pages');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu trang tĩnh';
      setError(msg.replace(/[\r\n]/g, ' '));
    } finally {
      setSaving(false);
    }
  };

  return {
    isNew,
    loading,
    saving,
    error,
    title,
    handleTitleChange,
    slug,
    handleSlugChange,
    blocks,
    availableCars,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlock,
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
    mediaPickerTarget,
    setMediaPickerTarget,
    handleMediaSelect,
    handleSave,
  };
}
