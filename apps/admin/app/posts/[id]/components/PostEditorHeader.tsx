'use client';

// 🧠 Mental Model: Thanh điều hướng & Action Toolbar của Studio Soạn Thảo (@cardealer/admin).
// Hỗ trợ: Quay lại danh sách, xem trạng thái bài viết, nút Xem trước Live Preview, Lưu nháp và Xuất bản.

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Eye, Save, Send } from 'lucide-react';
import { Button, Badge } from '@cardealer/ui';
import type { PostStatus } from '../types';

export interface PostEditorHeaderProps {
  isNew: boolean;
  tieuDe: string;
  status: PostStatus;
  saving: boolean;
  onPreview: () => void;
  onSave: (status: 'draft' | 'published') => void;
}

export function PostEditorHeader({
  isNew,
  tieuDe,
  status,
  saving,
  onPreview,
  onSave,
}: PostEditorHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="h-10 px-3 text-slate-400 hover:text-slate-100">
            <ChevronLeft size={18} />
            Quay lại
          </Button>
        </Link>
        <div className="h-5 w-px bg-white/10" />
        <h1 className="text-xl md:text-2xl font-bold text-slate-100 truncate max-w-md">
          {isNew ? 'Viết bài mới' : tieuDe || 'Chỉnh sửa bài viết'}
        </h1>
        <Badge
          variant={
            status === 'published'
              ? 'published'
              : status === 'draft'
                ? 'draft'
                : status === 'scheduled'
                  ? 'outline'
                  : 'danger'
          }
        >
          {status === 'published' ? 'Đã xuất bản' : status === 'draft' ? 'Bản nháp' : status}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="secondary"
          onClick={onPreview}
          disabled={saving}
          className="flex items-center gap-2 h-11 px-4 font-semibold text-xs"
          title="Xem trước nội dung thực tế (Tự động đồng bộ những gì đang có)"
        >
          <Eye size={16} />
          {saving ? 'Đang chuẩn bị...' : 'Xem trước'}
        </Button>

        <Button
          variant="secondary"
          onClick={() => onSave('draft')}
          disabled={saving}
          className="flex items-center gap-2 h-11 px-4 font-semibold text-xs"
        >
          <Save size={16} />
          Lưu nháp
        </Button>

        <Button
          variant="accent"
          onClick={() => onSave('published')}
          disabled={saving}
          className="flex items-center gap-2 h-11 px-5 font-semibold text-xs shadow-lg shadow-cyan-500/20"
        >
          <Send size={16} />
          {saving ? 'Đang lưu...' : 'Xuất bản'}
        </Button>
      </div>
    </div>
  );
}
