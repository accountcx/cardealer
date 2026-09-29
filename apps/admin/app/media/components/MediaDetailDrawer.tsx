'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Save,
  Loader2,
  Calendar,
  Layers,
  FileText,
  HardDrive,
  Maximize2,
} from 'lucide-react';
import { Button, Input } from '@cardealer/ui';
import type { MediaItem } from '@cardealer/types';
import { formatBytes } from './MediaCard';

// 🧠 Mental Model: Drawer trượt xem chi tiết metadata và chỉnh sửa thông tin ảnh.
// - Hiển thị ảnh sắc nét, kích thước đầy đủ.
// - Sao chép đường dẫn CDN Cloudinary với 1 click.
// - Cập nhật Alt Text phục vụ chuẩn SEO Web.
// - Xóa ảnh an toàn kèm cảnh báo xác nhận.

export interface MediaDetailDrawerProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAltText?: (id: string, altText: string) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

export function MediaDetailDrawer({
  media,
  isOpen,
  onClose,
  onUpdateAltText,
  onDelete,
}: MediaDetailDrawerProps) {
  const [altText, setAltText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (media) {
      setAltText(media.altText || '');
      setConfirmDelete(false);
      setIsCopied(false);
    }
  }, [media]);

  if (!isOpen || !media) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback nếu clipboard API bị hạn chế
    }
  };

  const handleSaveAltText = async () => {
    if (!onUpdateAltText) return;
    try {
      setIsSaving(true);
      await onUpdateAltText(media.id, altText);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      const success = await onDelete(media.id);
      if (success) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(media.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Chi Tiết Hình Ảnh
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Image Preview */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80">
              <img
                src={media.url}
                alt={media.altText || media.filename}
                className="h-full w-full object-contain p-2"
              />
              <a
                href={media.url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-xs hover:bg-slate-900"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Mở ảnh gốc
              </a>
            </div>

            {/* Copy CDN URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Đường dẫn ảnh CDN Cloudinary
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  readOnly
                  value={media.url}
                  className="h-10 text-xs bg-slate-50 dark:bg-slate-850 truncate"
                />
                <Button
                  type="button"
                  size="sm"
                  variant={isCopied ? 'success' : 'primary'}
                  onClick={handleCopyUrl}
                  leftIcon={isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  className="shrink-0 h-10"
                >
                  {isCopied ? 'Đã chép' : 'Sao chép'}
                </Button>
              </div>
            </div>

            {/* Edit Alt Text (SEO) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Văn bản thay thế (Alt Text cho SEO)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Mô tả ảnh cho công cụ tìm kiếm Google..."
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="h-10 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isSaving || altText === (media.altText || '')}
                  isLoading={isSaving}
                  onClick={handleSaveAltText}
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                  className="shrink-0 h-10"
                >
                  Lưu
                </Button>
              </div>
            </div>

            {/* Metadata Info List */}
            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Thông Số Kỹ Thuật
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <FileText className="h-3.5 w-3.5" /> Tên tệp
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-200 truncate" title={media.filename}>
                    {media.filename}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <HardDrive className="h-3.5 w-3.5" /> Dung lượng
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {formatBytes(media.fileSize)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Maximize2 className="h-3.5 w-3.5" /> Kích thước
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {media.width && media.height ? `${media.width} × ${media.height} px` : 'Tự động'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Layers className="h-3.5 w-3.5" /> Định dạng
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-200 uppercase">
                    {media.format || media.mimeType.split('/')[1]}
                  </p>
                </div>

                <div className="col-span-2 space-y-1 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="h-3.5 w-3.5" /> Ngày tải lên
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex items-center justify-between">
            <Button
              type="button"
              variant={confirmDelete ? 'danger' : 'outline'}
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              {confirmDelete ? 'Xác nhận xóa vĩnh viễn?' : 'Xóa ảnh này'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
