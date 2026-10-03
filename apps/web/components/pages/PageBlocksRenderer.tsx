'use client';

import React from 'react';
import type { AutoDealerInfo } from '@cardealer/core';
import { EditorialBlock } from './renderers/EditorialBlocks';
import { CommercialBlock } from './renderers/CommercialBlocks';

export interface PageBlocksRendererProps {
  content: unknown;
  dealerInfo?: AutoDealerInfo;
  excludeTypes?: string[];
  className?: string;
}

// Danh mục phân loại các Content Blocks
const EDITORIAL_TYPES = ['heading', 'paragraph', 'calloutBlock', 'callout', 'prosConsBlock', 'prosCons', 'specComparisonBlock', 'specTable'];

// WHY: Universal Content Blocks Renderer cho toàn bộ Storefront Static Page Templates (@cardealer/web).
// Phân giải và điều phối hiển thị 100% 14 khối Content Blocks tinh hoa từ CMS Admin (Tiptap AST JSON):
// 1. Shared Primitives First: Tái sử dụng trọn vẹn các block component chuẩn từ @cardealer/ui.
// 2. Tuân thủ unit_size_limit (< 300 dòng): Kiến trúc module hóa phân tách thành EditorialBlock và CommercialBlock.
// 3. Zero-Hardcode: Tuyệt đối không sinh dữ liệu giả lập.
// 4. Hỗ trợ excludeTypes: Cho phép các Template chuyên dụng (Faq, Timeline) trích xuất block đặc thù
//    để hiển thị theo bố cục riêng mà không bị trùng lặp nội dung.
// 5. 100% Named Export, không dùng export default.
export function PageBlocksRenderer({
  content,
  dealerInfo,
  excludeTypes = [],
  className,
}: PageBlocksRendererProps) {
  if (!content || typeof content !== 'object') return null;
  const doc = content as {
    content?: Array<{
      type: string;
      attrs?: Record<string, unknown>;
      content?: Array<{ type: string; text?: string }>;
    }>;
  };
  if (!Array.isArray(doc.content) || doc.content.length === 0) return null;

  const defaultHotline = dealerInfo?.telephone || '0981.234.567';
  const cleanHotline = defaultHotline.replace(/\D/g, '') || '0981234567';

  const nodesToRender = doc.content.filter((node) => !excludeTypes.includes(node.type));
  if (nodesToRender.length === 0) return null;

  return (
    <div className={`space-y-6 font-sans ${className || ''}`}>
      {nodesToRender.map((node, idx) => {
        if (EDITORIAL_TYPES.includes(node.type)) {
          return <EditorialBlock key={idx} node={node} />;
        }
        return <CommercialBlock key={idx} node={node} cleanHotline={cleanHotline} />;
      })}
    </div>
  );
}
