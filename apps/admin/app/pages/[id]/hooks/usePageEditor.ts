'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { pagesService } from '../../../../services/pages.service';
import { RESERVED_SLUGS, type StaticPageTemplate, type StaticPageSchemaType } from '@cardealer/types';

// Hàm chuẩn hóa chuỗi tiếng Việt thành slug URL
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

// WHY: Custom Hook quản lý toàn bộ Form State & API Mutation cho Static Page Editor (Separation of Concerns).
// Tách biệt Business Logic khỏi Presentation Layer để đảm bảo Unit Size Limit < 300 dòng cho UI Component.
export function usePageEditor(id?: string) {
  const router = useRouter();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [content, setContent] = useState<Record<string, unknown>>({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
  });
  const [rawTextContent, setRawTextContent] = useState('');
  const [templateType, setTemplateType] = useState<StaticPageTemplate>('DEFAULT');
  const [isPublished, setIsPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [schemaType, setSchemaType] = useState<StaticPageSchemaType>('WebPage');

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
            setContent(page.content as Record<string, unknown>);
            // Lấy text trích xuất nếu có
            const doc = page.content as { content?: Array<{ content?: Array<{ text?: string }> }> };
            const extracted = doc.content?.map(p => p.content?.map(t => t.text).join('')).join('\n') || '';
            setRawTextContent(extracted);
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

  // Tự động sinh slug khi nhập title nếu chưa sửa slug thủ công
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

  // Cập nhật text đơn giản và đồng bộ sang Tiptap AST node tree
  const handleRawTextChange = (text: string) => {
    setRawTextContent(text);
    const paragraphs = text.split('\n\n').filter(Boolean);
    setContent({
      type: 'doc',
      content: paragraphs.map((p) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: p }],
      })),
    });
  };

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

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        content,
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
    content,
    rawTextContent,
    handleRawTextChange,
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
    handleSave,
  };
}
