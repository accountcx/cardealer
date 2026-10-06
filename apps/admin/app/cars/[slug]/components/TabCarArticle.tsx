'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Bot,
  Globe,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button, Card, Input, Textarea, Skeleton } from '@cardealer/ui';
import { catalogService, type CarSummary } from '../../../../services/catalog.service';
import { uploadSingleMedia } from '../../../../services/media.service';
import { calculateSeoScore, type SeoAnalysisResult } from '@cardealer/core';
import type { FullArticleResult, OutlineItem, FaqItem, SeoOptimizationResult } from '@cardealer/types';
import type { BlockType, EditorBlock, MediaPickerTarget } from '../../../posts/[id]/types';
import { serializeTiptapDoc, deserializeTiptapDoc } from '../../../posts/[id]/ast';
import { createDefaultBlock } from '../../../posts/[id]/utils';
import { convertFullArticleBlocksToEditorBlocks } from '../../../posts/[id]/hooks/usePostEditor';
import { BlockItemWrapper } from '../../../posts/[id]/components/BlockItemWrapper';
import { AddBlockMenu } from '../../../posts/[id]/components/AddBlockMenu';
import { AiWritingAssistantModal } from '../../../posts/[id]/components/AiWritingAssistantModal';
import { MediaPickerModal } from '../../../components/MediaPickerModal';

// Content Blocks
import { HeadingBlock } from '../../../posts/[id]/components/blocks/HeadingBlock';
import { ParagraphBlock } from '../../../posts/[id]/components/blocks/ParagraphBlock';
import { CalloutBlock } from '../../../posts/[id]/components/blocks/CalloutBlock';
import { SingleImageBlock } from '../../../posts/[id]/components/blocks/SingleImageBlock';
import { ImageGalleryBlock } from '../../../posts/[id]/components/blocks/ImageGalleryBlock';
import { YouTubeBlock, TikTokBlock } from '../../../posts/[id]/components/blocks/VideoBlocks';
import { FaqBlock } from '../../../posts/[id]/components/blocks/FaqBlock';
import { ProsConsBlock } from '../../../posts/[id]/components/blocks/ProsConsBlock';
import { CtaButtonBlock } from '../../../posts/[id]/components/blocks/CtaButtonBlock';
import { LeadFormBlock } from '../../../posts/[id]/components/blocks/LeadFormBlock';
import { RelatedCarBlock } from '../../../posts/[id]/components/blocks/RelatedCarBlock';
import { PriceTableBlock } from '../../../posts/[id]/components/blocks/PriceTableBlock';
import { SpecTableBlock } from '../../../posts/[id]/components/blocks/SpecTableBlock';

interface TabCarArticleProps {
  carSlug: string;
  carName: string;
}

export function TabCarArticle({ carSlug, carName }: TabCarArticleProps) {
  const isNewCar = !carSlug || carSlug === 'new';

  const [loading, setLoading] = useState(!isNewCar);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available cars for blocks (price table, related cars, lead form)
  const [availableCars, setAvailableCars] = useState<CarSummary[]>([]);

  // Article State
  const [tieuDe, setTieuDe] = useState('');
  const [tomTat, setTomTat] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget>(null);
  const [uploadingSingleBlockId, setUploadingSingleBlockId] = useState<string | null>(null);
  const [uploadingGalleryBlockId, setUploadingGalleryBlockId] = useState<string | null>(null);

  // Load article data
  useEffect(() => {
    async function loadArticle() {
      if (isNewCar) {
        setLoading(false);
        // Default template for new car
        setTieuDe(`Đánh Giá Chi Tiết Xe ${carName || 'Hyundai'}: Giá Lăn Bánh, Thông Số & Ưu Đãi`);
        setFocusKeyword(`giá xe ${carName ? carName.toLowerCase() : 'hyundai'}`);
        setBlocks([
          {
            id: '1',
            type: 'heading',
            level: 2,
            content: `1. Tổng Quan & Vị Thế Dòng Xe ${carName || ''}`,
          },
          {
            id: '2',
            type: 'paragraph',
            content: `${carName || 'Mẫu xe'} là sự kết hợp hoàn hảo giữa ngôn ngữ thiết kế Sensuous Sportiness thời thượng, công nghệ an toàn chủ động Hyundai SmartSense và hiệu năng vận hành vượt trội.`,
          },
          {
            id: '3',
            type: 'prosCons',
            title: `Ưu Điểm & Nhược Điểm Xe ${carName || ''}`,
            pros: ['Thiết kế hiện đại, cuốn hút', 'Trang bị tiện nghi ngập tràn', 'Tiết kiệm nhiên liệu'],
            cons: ['Thời gian chờ nhận xe các phiên bản màu đặc biệt'],
          },
          {
            id: '4',
            type: 'ctaButton',
            ctaButtonText: `Nhận Báo Giá Lăn Bánh & Lái Thử ${carName || ''}`,
            ctaActionType: 'hotline',
            ctaVariant: 'red',
            ctaSubtext: 'Hỗ trợ tư vấn 24/7 - Giao xe tận nhà',
          },
        ]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const article = await catalogService.getCarArticle<any>(carSlug);
        if (article) {
          setTieuDe(article.tieuDe || '');
          setTomTat(article.tomTat || '');
          setStatus(article.status || 'draft');
          setFocusKeyword(article.focusKeyword || '');
          setMetaTitle(article.metaTitle || '');
          setMetaDescription(article.metaDescription || '');
          if (article.noiDung) {
            setBlocks(deserializeTiptapDoc(article.noiDung));
          }
        } else {
          // Initialize defaults for car without article yet
          setTieuDe(`Đánh Giá Chi Tiết Xe ${carName}: Giá Lăn Bánh, Thông Số & Ưu Đãi`);
          setFocusKeyword(`giá xe ${carName.toLowerCase()}`);
          setBlocks([
            {
              id: '1',
              type: 'heading',
              level: 2,
              content: `1. Tổng Quan & Vị Thế Dòng Xe ${carName}`,
            },
            {
              id: '2',
              type: 'paragraph',
              content: `${carName} là mẫu xe chiến lược được người tiêu dùng Việt Nam đặc biệt quan tâm trong phân khúc nhờ kiểu dáng thời thượng và tiện ích đẳng cấp.`,
            },
            {
              id: '3',
              type: 'prosCons',
              title: `Ưu Điểm & Nhược Điểm Xe ${carName}`,
              pros: ['Thiết kế nổi bật phong cách', 'Hệ thống an toàn chủ động thế hệ mới', 'Chi phí bảo dưỡng hợp lý'],
              cons: ['Nhu cầu thị trường lớn có thể khan hiếm màu sắc theo đợt'],
            },
            {
              id: '4',
              type: 'ctaButton',
              ctaButtonText: `Nhận Báo Giá Lăn Bánh ${carName}`,
              ctaActionType: 'hotline',
              ctaVariant: 'red',
              ctaSubtext: 'Tư vấn khuyến mãi tiền mặt & quà tặng chính hãng',
            },
          ]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải bài viết đánh giá';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
    catalogService.getCars().then(setAvailableCars).catch(() => {});
  }, [carSlug, carName, isNewCar]);

  // Real-time SEO Analysis
  const seoResult: SeoAnalysisResult = useMemo(() => {
    return calculateSeoScore({
      tieuDe,
      slug: carSlug,
      noiDung: serializeTiptapDoc(blocks),
      focusKeyword,
      metaDescription,
    });
  }, [tieuDe, carSlug, blocks, focusKeyword, metaDescription]);

  // Block management
  const addBlock = (type: BlockType) => {
    const newBlock = createDefaultBlock(type, availableCars, tieuDe || carName);
    newBlock.id = String(Date.now());
    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<EditorBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Image Upload Handlers
  const handleUploadSingleImage = async (blockId: string, file: File) => {
    try {
      setUploadingSingleBlockId(blockId);
      const media = await uploadSingleMedia(file, tieuDe || carName);
      if (media?.url) {
        updateBlock(blockId, { imageUrl: media.url, imageAlt: media.altText || tieuDe });
      }
    } catch (err: unknown) {
      alert('Tải ảnh lên thất bại. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setUploadingSingleBlockId(null);
    }
  };

  const handleUploadGalleryImages = async (blockId: string, files: FileList | File[]) => {
    try {
      setUploadingGalleryBlockId(blockId);
      const fileArr = Array.from(files);
      const uploaded = await Promise.all(
        fileArr.map((f) => uploadSingleMedia(f, `${carName} - Chi tiết`))
      );
      const newImgs: Array<{ url: string; alt?: string; caption?: string }> = uploaded.map((m) => ({
        url: m.url,
        alt: m.altText || undefined,
        caption: '',
      }));
      const block = blocks.find((b) => b.id === blockId);
      const current = block?.galleryImages || [];
      updateBlock(blockId, { galleryImages: [...current, ...newImgs] });
    } catch (err: unknown) {
      alert('Tải bộ ảnh thất bại.');
    } finally {
      setUploadingGalleryBlockId(null);
    }
  };

  // AI Assistant callbacks
  const handleApplyFullArticle = (article: FullArticleResult) => {
    if (article.title) setTieuDe(article.title);
    if (article.summary) setTomTat(article.summary);
    if (article.focusKeyword) setFocusKeyword(article.focusKeyword);
    if (article.metaTitle) setMetaTitle(article.metaTitle);
    if (article.metaDescription) setMetaDescription(article.metaDescription);
    if (Array.isArray(article.blocks)) {
      setBlocks(convertFullArticleBlocksToEditorBlocks(article.blocks, availableCars, focusKeyword || tieuDe));
    }
    setIsAiModalOpen(false);
  };

  const handleInsertOutline = (items: OutlineItem[]) => {
    const newBlocks: EditorBlock[] = items.map((item, idx) => ({
      id: `ai-outline-${Date.now()}-${idx}`,
      type: 'heading',
      level: typeof item.level === 'number' ? item.level : item.level === 'h3' ? 3 : 2,
      content: item.title,
    }));
    setBlocks((prev) => [...prev, ...newBlocks]);
    setIsAiModalOpen(false);
  };

  const handleInsertFaqs = (faqs: FaqItem[]) => {
    const newBlock: EditorBlock = {
      id: `ai-faq-${Date.now()}`,
      type: 'faq',
      title: `Câu Hỏi Thường Gặp Về Xe ${carName}`,
      faqs,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setIsAiModalOpen(false);
  };

  const handleApplySeo = (seo: SeoOptimizationResult) => {
    if (seo.focusKeyword) setFocusKeyword(seo.focusKeyword);
    if (seo.metaTitle) setMetaTitle(seo.metaTitle);
    if (seo.metaDescription) setMetaDescription(seo.metaDescription);
    setIsAiModalOpen(false);
  };

  // Save Car Article Handler
  const handleSaveArticle = async () => {
    if (isNewCar) {
      setError('Vui lòng lưu thông tin dòng xe mới trước khi biên tập bài viết đánh giá.');
      return;
    }

    const trimmedTitle = tieuDe.trim();
    if (!trimmedTitle) {
      setError('Vui lòng nhập tiêu đề bài viết đánh giá.');
      return;
    }

    // Publish Gatekeeper: Check for placeholders
    if (status === 'published') {
      const contentStr = JSON.stringify(serializeTiptapDoc(blocks)).toLowerCase();
      if (contentStr.includes('[...]') || contentStr.includes('[todo]')) {
        setError('Không thể xuất bản bài viết khi nội dung còn chứa ký tự giữ chỗ [...] hoặc [todo]. Vui lòng bổ sung đầy đủ nội dung hoặc lưu dưới dạng Bản nháp.');
        return;
      }
    }

    setSaving(true);
    setError(null);

    const payload = {
      tieuDe: trimmedTitle,
      tomTat: tomTat.trim() || null,
      noiDung: serializeTiptapDoc(blocks),
      status,
      focusKeyword: focusKeyword.trim() || null,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
    };

    try {
      await catalogService.saveCarArticle(carSlug, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu bài viết đánh giá lên máy chủ';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const currentContentSummary = blocks
    .map((b) => b.content || b.title || '')
    .filter(Boolean)
    .join('\n');

  if (isNewCar) {
    return (
      <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-white/10 space-y-4">
        <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-200">
          Hãy Lưu Dòng Xe Mới Trước Khi Biên Tập Bài Viết Đánh Giá
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Sau khi dòng xe được khởi tạo thành công với slug URL chính thức, bạn có thể quay lại Tab này để soạn thảo bài đánh giá chuyên sâu và tối ưu SEO Google.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Bài Viết Đánh Giá Dòng Xe {carName}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                1-to-1 Native
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Xuất hiện trực tiếp tại trang chi tiết <code className="text-cyan-400 font-mono">/xe/{carSlug}</code> kèm Mục lục thông minh &amp; SEO đa tầng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status selector */}
          <div className="flex items-center bg-slate-950/60 border border-white/10 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                status === 'draft'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bản nháp
            </button>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                status === 'published'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Xuất bản
            </button>
          </div>

          <Button
            type="button"
            variant={saved ? 'success' : 'accent'}
            glow={!saved}
            onClick={handleSaveArticle}
            isLoading={saving}
            leftIcon={saved ? <Check size={16} /> : <Save size={16} />}
          >
            {saved ? 'Đã Lưu Bài Viết!' : 'Lưu Bài Viết'}
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2.5 text-sm shadow-lg">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <span>
            <strong className="font-bold text-red-200">Lỗi:</strong> {error}
          </span>
        </div>
      )}

      {/* Grid: Editor Left (8 cols) + SEO Sidebar Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (8 cols): Title, Sapo & Block Canvas */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. General Article Metadata Card */}
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            <div>
              <Input
                label="Tiêu đề bài viết đánh giá"
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                placeholder={`Đánh giá chi tiết dòng xe ${carName}...`}
                className="h-11 text-base font-bold bg-slate-950/60 border-white/10 text-slate-100 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
            </div>

            <div>
              <Textarea
                label="Đoạn văn mở đầu (Sapo / Tóm tắt đánh giá)"
                rows={3}
                value={tomTat}
                onChange={(e) => setTomTat(e.target.value)}
                placeholder="Dẫn nhập cuốn hút, nêu bật điểm nổi bật của xe và giá trị mang lại cho khách hàng..."
                className="bg-slate-950/60 border-white/10 text-slate-200 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
            </div>
          </Card>

          {/* 2. Block Editor Canvas */}
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  Nội Dung Bài Viết &amp; Content Blocks
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tự động chuyển đổi thành Mục lục (TOC) thông minh và cấu trúc HTML tối ưu Google Bot.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100"
                >
                  <Bot size={14} className="text-cyan-400" />
                  Gọi Trợ Lý AI
                </Button>
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
                  {blocks.length} khối nội dung
                </span>
              </div>
            </div>

            {/* Block List */}
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
                      onUploadFile={(file) => {
                        if (file) handleUploadSingleImage(block.id, file);
                      }}
                      onOpenMediaPicker={() => setMediaPickerTarget({ type: 'singleImage', blockId: block.id })}
                      isUploading={uploadingSingleBlockId === block.id}
                    />
                  )}
                  {block.type === 'imageGallery' && (
                    <ImageGalleryBlock
                      block={block}
                      onUpdate={(upd) => updateBlock(block.id, upd)}
                      onUploadBatch={(files) => {
                        if (files) handleUploadGalleryImages(block.id, files);
                      }}
                      onUploadSingleAt={async (imgIdx, file) => {
                        if (!file) return;
                        const m = await uploadSingleMedia(file);
                        const cur = [...(block.galleryImages || [])];
                        cur[imgIdx] = { ...cur[imgIdx], url: m.url };
                        updateBlock(block.id, { galleryImages: cur });
                      }}
                      onOpenMediaPicker={() => setMediaPickerTarget({ type: 'gallery', blockId: block.id })}
                      isUploadingBatch={uploadingGalleryBlockId === block.id}
                      uploadingItemKey={null}
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
                    <LeadFormBlock
                      block={block}
                      onUpdate={(upd) => updateBlock(block.id, upd)}
                      availableCars={availableCars}
                    />
                  )}
                  {block.type === 'relatedCar' && (
                    <RelatedCarBlock
                      block={block}
                      onUpdate={(upd) => updateBlock(block.id, upd)}
                      availableCars={availableCars}
                      onOpenMediaPicker={() => setMediaPickerTarget({ type: 'relatedCar', blockId: block.id })}
                    />
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

            {/* Quick Add Menu */}
            <AddBlockMenu onAddBlock={addBlock} />
          </Card>
        </div>

        {/* CỘT PHẢI (4 cols): Real-Time SEO & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Real-Time SEO Score Engine */}
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                Động Cơ SEO Xe Real-Time
              </h3>
              <span
                className={`text-lg font-black px-3 py-1 rounded-xl ${
                  seoResult.status === 'good'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : seoResult.status === 'needs_improvement'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {seoResult.score}/{seoResult.maxScore || 100}
              </span>
            </div>

            {/* Focus Keyword */}
            <div>
              <Input
                label="Từ khóa chính (Focus Keyword)"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder={`e.g. giá xe ${carName ? carName.toLowerCase() : 'hyundai santa fe'}`}
                className="h-10 rounded-xl bg-slate-950/60 border-white/10 text-slate-100 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
            </div>

            {/* SEO Summary Metrics */}
            {seoResult.summary && (
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Số từ</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{seoResult.summary.wordCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Thời gian đọc</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{seoResult.summary.readingTime}p</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Mật độ từ khóa</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{seoResult.summary.keywordDensity}%</p>
                </div>
              </div>
            )}

            {/* SEO Criteria Checklist */}
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
                      <span className="font-semibold text-slate-200">{item.label}</span>
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

          {/* 2. Google SERP Snippet Preview */}
          <Card className="p-5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Globe size={14} className="text-cyan-400" />
              <span>Mô phỏng hiển thị Google Search (SERP)</span>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-white/10 rounded-xl space-y-1">
              <div className="text-[11px] text-emerald-400/90 font-mono truncate flex items-center gap-1">
                <span className="text-slate-500">https://xehyundaivinh.com</span>
                <span>/xe/{carSlug}</span>
              </div>
              <h4 className="text-sm font-semibold text-sky-400 line-clamp-1 hover:underline cursor-pointer">
                {metaTitle.trim() || tieuDe.trim() || `Bảng Giá Xe ${carName} 2026`}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {metaDescription.trim() ||
                  tomTat.trim() ||
                  `Đánh giá chi tiết xe ${carName}, bảng giá niêm yết, dự toán lăn bánh, thông số kỹ thuật...`}
              </p>
            </div>
          </Card>

          {/* 3. SEO Meta Tags Override */}
          <Card className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 border-b border-white/10 pb-3 text-sm">
              Cài Đặt Meta Tối Ưu SEO Cho Dòng Xe
            </h3>

            <div>
              <Input
                label="Meta Title (Ưu tiên hiển thị Google)"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Để trống nếu dùng tiêu đề bài viết"
                className="h-9 bg-slate-950/60 border-white/10 text-slate-200 text-xs focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 px-1">
                <span>Khuyến nghị: 50 - 60 ký tự</span>
                <span className={metaTitle.length > 60 ? 'text-amber-400' : 'text-slate-400'}>
                  {metaTitle.length} ký tự
                </span>
              </div>
            </div>

            <div>
              <Textarea
                label="Meta Description (Ưu tiên hiển thị Google)"
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Mô tả tóm tắt thu hút click trên kết quả tìm kiếm Google (120 - 160 ký tự)..."
                className="bg-slate-950/60 border-white/10 text-slate-200 text-xs focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 min-h-[64px]"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 px-1">
                <span>Khuyến nghị: 120 - 160 ký tự</span>
                <span
                  className={
                    metaDescription.length >= 120 && metaDescription.length <= 160
                      ? 'text-emerald-400'
                      : metaDescription.length > 160
                        ? 'text-amber-400'
                        : 'text-slate-400'
                  }
                >
                  {metaDescription.length} ký tự
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AiWritingAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentTitle={tieuDe}
        currentKeyword={focusKeyword}
        currentBlocksText={currentContentSummary}
        availableCars={availableCars}
        onInsertFullArticle={handleApplyFullArticle}
        onInsertOutline={handleInsertOutline}
        onInsertFaqs={handleInsertFaqs}
        onAppendText={(text) => {
          const newBlock: EditorBlock = {
            id: `ai-para-${Date.now()}`,
            type: 'paragraph',
            content: text,
          };
          setBlocks((prev) => [...prev, newBlock]);
        }}
        onApplySeo={handleApplySeo}
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={!!mediaPickerTarget}
        onClose={() => setMediaPickerTarget(null)}
        mode={mediaPickerTarget?.type === 'gallery' ? 'multiple' : 'single'}
        title="Chọn Hình Ảnh Từ Thư Viện"
        onSelect={(selected) => {
          if (!mediaPickerTarget || selected.length === 0) return;
          if (mediaPickerTarget.type === 'singleImage') {
            const first = selected[0];
            updateBlock(mediaPickerTarget.blockId, {
              imageUrl: first.url,
              imageAlt: first.altText || tieuDe,
            });
          } else if (mediaPickerTarget.type === 'gallery') {
            const block = blocks.find((b) => b.id === mediaPickerTarget.blockId);
            const current = block?.galleryImages || [];
            const newImgs = selected.map((s) => ({ url: s.url, alt: s.altText || undefined, caption: '' }));
            updateBlock(mediaPickerTarget.blockId, { galleryImages: [...current, ...newImgs] });
          }
          setMediaPickerTarget(null);
        }}
      />
    </div>
  );
}
