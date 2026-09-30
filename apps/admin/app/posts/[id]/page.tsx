'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Sparkles, AlertCircle, X, Check, ImageIcon } from 'lucide-react';
import { Button, Input, Card, Skeleton, Select } from '@cardealer/ui';

import { postService, type CategoryItem } from '../../../services/post.service';
import { catalogService, type CarSummary } from '../../../services/catalog.service';
import { mediaService } from '../../../services/media.service';
import { calculateSeoScore, type SeoAnalysisResult, type TiptapDoc } from '@cardealer/core';
import { useAuth } from '../../../contexts/AuthContext';
import { AccessDenied } from '../../components/AccessDenied';
import { MediaPickerModal } from '../../components/MediaPickerModal';

import { PostEditorHeader } from './components/PostEditorHeader';
import { AddBlockMenu } from './components/AddBlockMenu';
import { BlockItemWrapper } from './components/BlockItemWrapper';
import { PostEditorSidebar } from './components/PostEditorSidebar';

import { HeadingBlock } from './components/blocks/HeadingBlock';
import { ParagraphBlock } from './components/blocks/ParagraphBlock';
import { CalloutBlock } from './components/blocks/CalloutBlock';
import { SingleImageBlock } from './components/blocks/SingleImageBlock';
import { ImageGalleryBlock } from './components/blocks/ImageGalleryBlock';
import { YouTubeBlock, TikTokBlock } from './components/blocks/VideoBlocks';
import { FaqBlock } from './components/blocks/FaqBlock';
import { ProsConsBlock } from './components/blocks/ProsConsBlock';
import { CtaButtonBlock } from './components/blocks/CtaButtonBlock';
import { LeadFormBlock } from './components/blocks/LeadFormBlock';
import { RelatedCarBlock } from './components/blocks/RelatedCarBlock';
import { PriceTableBlock } from './components/blocks/PriceTableBlock';
import { SpecTableBlock } from './components/blocks/SpecTableBlock';

import type { BlockType, EditorBlock, MediaPickerTarget, PostStatus } from './types';
import { toSlug, createDefaultBlock } from './utils';
import { serializeTiptapDoc, deserializeTiptapDoc } from './ast';

export default function PostEditorPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const rawId = params?.id as string | undefined;
  const isNew = rawId === 'new' || pathname.endsWith('/new') || !rawId;
  const postId = isNew ? 'new' : (rawId || '');

  const { loading: authLoading, can } = useAuth();

  // State dữ liệu bài viết
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [availableCars, setAvailableCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [, setPageError] = useState<string | null>(null);

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
      <PostEditorHeader
        isNew={isNew}
        tieuDe={tieuDe}
        status={status}
        saving={saving}
        onPreview={handlePreview}
        onSave={handleSave}
      />

      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-top-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
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
                  <code className="bg-black/30 px-1 py-0.5 rounded">/tin-tuc/{originalSlug}</code> để bảo toàn PageRank.
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
                      <p className="text-slate-200 font-semibold truncate font-mono">{anhDaiDienUrl}</p>
                      <p className="text-slate-400 truncate">Alt: {anhDaiDienAlt || 'Chưa thiết lập'}</p>
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
              {blocks.map((block, idx) => (
                <BlockItemWrapper
                  key={block.id}
                  block={block}
                  index={idx}
                  totalBlocks={blocks.length}
                  onMoveUp={() => moveBlock(idx, 'up')}
                  onMoveDown={() => moveBlock(idx, 'down')}
                  onRemove={() => removeBlock(block.id)}
                >
                  {block.type === 'heading' && (
                    <HeadingBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'paragraph' && (
                    <ParagraphBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'callout' && (
                    <CalloutBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'singleImage' && (
                    <SingleImageBlock
                      block={block}
                      onUpdate={(upd) => updateBlock(block.id, upd)}
                      onUploadFile={(file) => handleUploadSingleImage(block.id, file)}
                      onOpenMediaPicker={() => setMediaPickerTarget({ type: 'singleImage', blockId: block.id })}
                      isUploading={uploadingSingleImageBlockId === block.id}
                    />
                  )}
                  {block.type === 'imageGallery' && (
                    <ImageGalleryBlock
                      block={block}
                      onUpdate={(upd) => updateBlock(block.id, upd)}
                      onUploadBatch={(files) => handleUploadGalleryImages(block.id, files)}
                      onUploadSingleAt={(imgIdx, file) => handleUploadGalleryImageAt(block.id, imgIdx, file)}
                      onOpenMediaPicker={() => setMediaPickerTarget({ type: 'gallery', blockId: block.id })}
                      isUploadingBatch={uploadingGalleryBlockId === block.id}
                      uploadingItemKey={uploadingItemKey}
                    />
                  )}
                  {block.type === 'youtube' && (
                    <YouTubeBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'tiktok' && (
                    <TikTokBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'faq' && (
                    <FaqBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'prosCons' && (
                    <ProsConsBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'ctaButton' && (
                    <CtaButtonBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'leadForm' && (
                    <LeadFormBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} availableCars={availableCars} />
                  )}
                  {block.type === 'relatedCar' && (
                    <RelatedCarBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} availableCars={availableCars} />
                  )}
                  {block.type === 'priceTable' && (
                    <PriceTableBlock
                      block={block}
                      onUpdate={(upd) => updateBlock(block.id, upd)}
                      availableCars={availableCars}
                    />
                  )}
                  {block.type === 'specTable' && (
                    <SpecTableBlock block={block} onUpdate={(upd) => updateBlock(block.id, upd)} />
                  )}
                </BlockItemWrapper>
              ))}
            </div>

            {/* Quick Add Toolbar */}
            <AddBlockMenu onAddBlock={addBlock} />
          </Card>
        </div>

        {/* CỘT PHẢI: Bảng Chấm Điểm SEO Real-Time & Cài Đặt (4 Cột) */}
        <div className="lg:col-span-4">
          <PostEditorSidebar
            seoResult={seoResult}
            focusKeyword={focusKeyword}
            setFocusKeyword={setFocusKeyword}
            metaTitle={metaTitle}
            setMetaTitle={setMetaTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            canonicalUrl={canonicalUrl}
            setCanonicalUrl={setCanonicalUrl}
            isFeatured={isFeatured}
            setIsFeatured={setIsFeatured}
            noIndex={noIndex}
            setNoIndex={setNoIndex}
            slug={slug}
            titleFallback={tieuDe}
          />
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
          mediaPickerTarget?.type === 'featured' && anhDaiDienUrl ? [anhDaiDienUrl] : []
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
