'use client';

import React from 'react';
import { Sparkles, AlertCircle, X, Check, Bot } from 'lucide-react';
import { Button, Card, Skeleton } from '@cardealer/ui';

import { useAuth } from '../../../contexts/AuthContext';
import { AccessDenied } from '../../components/AccessDenied';
import { MediaPickerModal } from '../../components/MediaPickerModal';

import { usePostEditor } from './hooks/usePostEditor';
import { PostEditorHeader } from './components/PostEditorHeader';
import { PostGeneralInfoCard } from './components/PostGeneralInfoCard';
import { AddBlockMenu } from './components/AddBlockMenu';
import { BlockItemWrapper } from './components/BlockItemWrapper';
import { PostEditorSidebar } from './components/PostEditorSidebar';
import { AiWritingAssistantModal } from './components/AiWritingAssistantModal';

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

export default function PostEditorPage() {
  const { loading: authLoading, can } = useAuth();
  const editor = usePostEditor();

  if (authLoading || editor.loading) {
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

  // Tóm tắt nội dung text của các block hiện có để làm ngữ cảnh cho AI
  const currentContentSummary = editor.blocks
    .map((b) => {
      if (b.type === 'heading') return `[H${b.level || 2}] ${b.content || ''}`;
      if (b.type === 'paragraph') return b.content || '';
      if (b.type === 'callout') return `[Lưu ý] ${b.content || ''}`;
      if (b.type === 'faq') return `[FAQ] ${b.faqs?.map((f) => `Q: ${f.question} | A: ${f.answer}`).join('; ') || ''}`;
      return `[Khối ${b.type}]`;
    })
    .join('\n')
    .slice(0, 3000);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Toolbar */}
      <PostEditorHeader
        isNew={editor.isNew}
        tieuDe={editor.tieuDe}
        status={editor.status}
        saving={editor.saving}
        onPreview={editor.handlePreview}
        onSave={editor.handleSave}
        onOpenAi={() => editor.setIsAiModalOpen(true)}
      />

      {/* Toast Alert Banner */}
      {editor.toast && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-top-2 border ${
            editor.toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {editor.toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{editor.toast.message}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.setToast(null)}
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
          <PostGeneralInfoCard
            isNew={editor.isNew}
            tieuDe={editor.tieuDe}
            onTitleChange={editor.handleTitleChange}
            slug={editor.slug}
            setSlug={editor.setSlug}
            originalSlug={editor.originalSlug}
            categories={editor.categories}
            categoryId={editor.categoryId}
            setCategoryId={editor.setCategoryId}
            anhDaiDienUrl={editor.anhDaiDienUrl}
            setAnhDaiDienUrl={editor.setAnhDaiDienUrl}
            anhDaiDienAlt={editor.anhDaiDienAlt}
            setAnhDaiDienAlt={editor.setAnhDaiDienAlt}
            tomTat={editor.tomTat}
            setTomTat={editor.setTomTat}
            onOpenMediaPicker={() => editor.setMediaPickerTarget({ type: 'featured' })}
          />

          {/* Visual Content Block Editor */}
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

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => editor.setIsAiModalOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100"
                >
                  <Bot size={14} className="text-cyan-400" />
                  Gọi Trợ Lý AI
                </Button>
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
                  {editor.blocks.length} khối nội dung
                </span>
              </div>
            </div>

            {/* Block List Render */}
            <div className="space-y-4">
              {editor.blocks.map((block, idx) => (
                <BlockItemWrapper
                  key={block.id}
                  block={block}
                  index={idx}
                  totalBlocks={editor.blocks.length}
                  onMoveUp={() => editor.moveBlock(idx, 'up')}
                  onMoveDown={() => editor.moveBlock(idx, 'down')}
                  onRemove={() => editor.removeBlock(block.id)}
                >
                  {block.type === 'heading' && (
                    <HeadingBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'paragraph' && (
                    <ParagraphBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'callout' && (
                    <CalloutBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'singleImage' && (
                    <SingleImageBlock
                      block={block}
                      onUpdate={(upd) => editor.updateBlock(block.id, upd)}
                      onUploadFile={(file) => editor.handleUploadSingleImage(block.id, file)}
                      onOpenMediaPicker={() => editor.setMediaPickerTarget({ type: 'singleImage', blockId: block.id })}
                      isUploading={editor.uploadingSingleImageBlockId === block.id}
                    />
                  )}
                  {block.type === 'imageGallery' && (
                    <ImageGalleryBlock
                      block={block}
                      onUpdate={(upd) => editor.updateBlock(block.id, upd)}
                      onUploadBatch={(files) => editor.handleUploadGalleryImages(block.id, files)}
                      onUploadSingleAt={(imgIdx, file) => editor.handleUploadGalleryImageAt(block.id, imgIdx, file)}
                      onOpenMediaPicker={() => editor.setMediaPickerTarget({ type: 'gallery', blockId: block.id })}
                      isUploadingBatch={editor.uploadingGalleryBlockId === block.id}
                      uploadingItemKey={editor.uploadingItemKey}
                    />
                  )}
                  {block.type === 'youtube' && (
                    <YouTubeBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'tiktok' && (
                    <TikTokBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'faq' && (
                    <FaqBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'prosCons' && (
                    <ProsConsBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'ctaButton' && (
                    <CtaButtonBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                  {block.type === 'leadForm' && (
                    <LeadFormBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} availableCars={editor.availableCars} />
                  )}
                  {block.type === 'relatedCar' && (
                    <RelatedCarBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} availableCars={editor.availableCars} />
                  )}
                  {block.type === 'priceTable' && (
                    <PriceTableBlock
                      block={block}
                      onUpdate={(upd) => editor.updateBlock(block.id, upd)}
                      availableCars={editor.availableCars}
                    />
                  )}
                  {block.type === 'specTable' && (
                    <SpecTableBlock block={block} onUpdate={(upd) => editor.updateBlock(block.id, upd)} />
                  )}
                </BlockItemWrapper>
              ))}
            </div>

            {/* Quick Add Toolbar */}
            <AddBlockMenu onAddBlock={editor.addBlock} />
          </Card>
        </div>

        {/* CỘT PHẢI: Bảng Chấm Điểm SEO Real-Time & Cài Đặt (4 Cột) */}
        <div className="lg:col-span-4">
          <PostEditorSidebar
            seoResult={editor.seoResult}
            focusKeyword={editor.focusKeyword}
            setFocusKeyword={editor.setFocusKeyword}
            metaTitle={editor.metaTitle}
            setMetaTitle={editor.setMetaTitle}
            metaDescription={editor.metaDescription}
            setMetaDescription={editor.setMetaDescription}
            canonicalUrl={editor.canonicalUrl}
            setCanonicalUrl={editor.setCanonicalUrl}
            isFeatured={editor.isFeatured}
            setIsFeatured={editor.setIsFeatured}
            noIndex={editor.noIndex}
            setNoIndex={editor.setNoIndex}
            slug={editor.slug}
            titleFallback={editor.tieuDe}
          />
        </div>
      </div>

      {/* Modal Trợ Lý AI Viết Bài */}
      <AiWritingAssistantModal
        isOpen={editor.isAiModalOpen}
        onClose={() => editor.setIsAiModalOpen(false)}
        currentTitle={editor.tieuDe}
        currentKeyword={editor.focusKeyword}
        currentBlocksText={currentContentSummary}
        onInsertOutline={(items) => editor.insertOutlineBlocks(items)}
        onInsertFaqs={(faqs) => editor.insertFaqBlock(faqs)}
        onAppendText={(text) => editor.appendParagraphBlock(text)}
        onApplySeo={(seo) => editor.applyAiSeo(seo)}
      />

      {/* Modal Chọn Ảnh Từ Thư Viện Dùng Chung */}
      <MediaPickerModal
        isOpen={!!editor.mediaPickerTarget}
        onClose={() => editor.setMediaPickerTarget(null)}
        mode={editor.mediaPickerTarget?.type === 'gallery' ? 'multiple' : 'single'}
        title={
          editor.mediaPickerTarget?.type === 'featured'
            ? 'Chọn Ảnh Đại Diện Bài Viết (Featured Image)'
            : editor.mediaPickerTarget?.type === 'gallery'
            ? 'Chọn Nhiều Ảnh Cho Bộ Sưu Tập (Gallery)'
            : 'Chọn Hình Ảnh Cho Bài Viết'
        }
        initialSelectedUrls={
          editor.mediaPickerTarget?.type === 'featured' && editor.anhDaiDienUrl ? [editor.anhDaiDienUrl] : []
        }
        onSelect={(selected) => {
          if (!editor.mediaPickerTarget || selected.length === 0) return;

          if (editor.mediaPickerTarget.type === 'featured') {
            const first = selected[0];
            editor.setAnhDaiDienUrl(first.url);
            if (first.altText) {
              editor.setAnhDaiDienAlt(first.altText);
            }
          } else if (editor.mediaPickerTarget.type === 'singleImage') {
            const first = selected[0];
            editor.updateBlock(editor.mediaPickerTarget.blockId, {
              imageUrl: first.url,
              imageAlt: first.altText || first.filename,
              caption: first.filename,
            });
          } else if (editor.mediaPickerTarget.type === 'gallery') {
            const targetBlockId = editor.mediaPickerTarget.blockId;
            const newItems = selected.map((m) => ({
              url: m.url,
              alt: m.altText || m.filename,
              caption: m.filename,
            }));
            editor.setBlocks((prev) =>
              prev.map((b) => {
                if (b.id !== targetBlockId) return b;
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
