'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '@cardealer/ui';
import type { EditorBlock, BlockType } from '../../app/posts/[id]/types';
import type { PageMediaPickerTarget } from '../../app/pages/[id]/hooks/usePageEditor';
import { AddBlockMenu } from '../../app/posts/[id]/components/AddBlockMenu';
import { BlockItemWrapper } from '../../app/posts/[id]/components/BlockItemWrapper';

import { HeadingBlock } from '../../app/posts/[id]/components/blocks/HeadingBlock';
import { ParagraphBlock } from '../../app/posts/[id]/components/blocks/ParagraphBlock';
import { CalloutBlock } from '../../app/posts/[id]/components/blocks/CalloutBlock';
import { SingleImageBlock } from '../../app/posts/[id]/components/blocks/SingleImageBlock';
import { ImageGalleryBlock } from '../../app/posts/[id]/components/blocks/ImageGalleryBlock';
import { YouTubeBlock, TikTokBlock } from '../../app/posts/[id]/components/blocks/VideoBlocks';
import { FaqBlock } from '../../app/posts/[id]/components/blocks/FaqBlock';
import { ProsConsBlock } from '../../app/posts/[id]/components/blocks/ProsConsBlock';
import { CtaButtonBlock } from '../../app/posts/[id]/components/blocks/CtaButtonBlock';
import { PriceTableBlock } from '../../app/posts/[id]/components/blocks/PriceTableBlock';
import { SpecTableBlock } from '../../app/posts/[id]/components/blocks/SpecTableBlock';
import { LeadFormBlock } from '../../app/posts/[id]/components/blocks/LeadFormBlock';
import type { CarSummary } from '../../services/catalog.service';

interface PageBlocksEditorProps {
  blocks: EditorBlock[];
  availableCars?: CarSummary[];
  onAddBlock: (type: BlockType) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onRemoveBlock: (id: string) => void;
  onUpdateBlock: (id: string, updates: Partial<EditorBlock>) => void;
  onOpenMediaPicker: (target: PageMediaPickerTarget) => void;
}

// WHY: Visual Content Block Editor cho Trang Tĩnh (Tương đồng 100% với Post Editor Studio).
// Cho phép SEO Marketer tùy biến cấu trúc linh hoạt theo từng Template E-E-A-T và tự động serialize sang Tiptap AST.
export function PageBlocksEditor({
  blocks,
  availableCars = [],
  onAddBlock,
  onMoveBlock,
  onRemoveBlock,
  onUpdateBlock,
  onOpenMediaPicker,
}: PageBlocksEditorProps) {
  return (
    <Card className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-cyan-400" />
            Nội Dung Trang Tĩnh & Content Blocks
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sắp xếp các khối văn bản, ảnh, bảng giá và CTA chuẩn Tiptap AST Node Tree.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
          {blocks.length} khối nội dung
        </span>
      </div>

      {/* Danh sách các khối nội dung */}
      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <BlockItemWrapper
            key={block.id}
            block={block}
            index={idx}
            totalBlocks={blocks.length}
            onMoveUp={() => onMoveBlock(idx, 'up')}
            onMoveDown={() => onMoveBlock(idx, 'down')}
            onRemove={() => onRemoveBlock(block.id)}
          >
            {block.type === 'heading' && (
              <HeadingBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'paragraph' && (
              <ParagraphBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'callout' && (
              <CalloutBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'singleImage' && (
              <SingleImageBlock
                block={block}
                onUpdate={(upd) => onUpdateBlock(block.id, upd)}
                onUploadFile={() => {}}
                onOpenMediaPicker={() => onOpenMediaPicker({ type: 'singleImage', blockId: block.id })}
                isUploading={false}
              />
            )}
            {block.type === 'imageGallery' && (
              <ImageGalleryBlock
                block={block}
                onUpdate={(upd) => onUpdateBlock(block.id, upd)}
                onUploadBatch={() => {}}
                onUploadSingleAt={() => {}}
                onOpenMediaPicker={() => onOpenMediaPicker({ type: 'gallery', blockId: block.id })}
                isUploadingBatch={false}
                uploadingItemKey={null}
              />
            )}
            {block.type === 'youtube' && (
              <YouTubeBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'tiktok' && (
              <TikTokBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'faq' && (
              <FaqBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'prosCons' && (
              <ProsConsBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'ctaButton' && (
              <CtaButtonBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'priceTable' && (
              <PriceTableBlock
                block={block}
                onUpdate={(upd) => onUpdateBlock(block.id, upd)}
                availableCars={availableCars}
              />
            )}
            {block.type === 'specTable' && (
              <SpecTableBlock block={block} onUpdate={(upd) => onUpdateBlock(block.id, upd)} />
            )}
            {block.type === 'leadForm' && (
              <LeadFormBlock
                block={block}
                onUpdate={(upd) => onUpdateBlock(block.id, upd)}
                availableCars={availableCars}
              />
            )}
          </BlockItemWrapper>
        ))}
      </div>

      {/* Toolbar thêm nhanh block */}
      <AddBlockMenu onAddBlock={onAddBlock} />
    </Card>
  );
}
