'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Check,
  Search,
  RefreshCw,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Modal, Button, Input, Select, type SelectOption } from '@cardealer/ui';
import type { MediaItem } from '@cardealer/types';
import { useMediaLibrary } from '../../hooks/use-media-library';
import { useMediaUploader } from '../../hooks/use-media-uploader';
import { MediaDropzone } from '../media/components/MediaDropzone';
import { MediaCard, MediaCardSkeleton } from '../media/components/MediaCard';

// 🧠 Mental Model: Component Hộp thoại Chọn Hình Ảnh Dùng Chung (Reusable MediaPickerModal).
// - Đóng vai trò là cầu nối giữa Kho ảnh số trung tâm (Media Library) và các biểu mẫu nhập liệu (CarForm, PostEditor, Profile).
// - 2 Tabs chuyển đổi trực quan:
//   1. Tab "Thư Viện Ảnh": Tìm kiếm, lọc định dạng, phân trang, chọn 1 hoặc nhiều ảnh kèm highlight sắc nét.
//   2. Tab "Tải Ảnh Mới Lên": Kéo thả ảnh với MediaDropzone, tự động đưa vào selection và chuyển về Thư viện sau khi tải xong.
// - Hỗ trợ 2 chế độ:
//   • `mode="single"`: Chọn 1 ảnh duy nhất (hỗ trợ double-click để chọn nhanh).
//   • `mode="multiple"`: Chọn nhiều ảnh (dành cho Gallery, bộ sưu tập).
// - 100% Named Exports, Zero Raw HTML Controls (sử dụng 100% Design System @cardealer/ui).

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: MediaItem[]) => void;
  mode?: 'single' | 'multiple';
  title?: string;
  initialSelectedUrls?: string[];
}

const FORMAT_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tất cả định dạng' },
  { value: 'webp', label: 'WEBP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG / JPG' },
  { value: 'svg+xml', label: 'SVG' },
  { value: 'gif', label: 'GIF' },
];

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  mode = 'single',
  title,
  initialSelectedUrls = [],
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

  // Hook quản lý dữ liệu kho ảnh
  const library = useMediaLibrary({
    initialLimit: 15,
    initialSortBy: 'newest',
    autoFetch: isOpen,
  });

  // Hook tải ảnh đa luồng
  const uploader = useMediaUploader({
    onSuccessSingle: (newMedia: MediaItem) => {
      // Khi upload thành công 1 ảnh: Tự động đưa vào selection
      setSelectedItems((prev) => {
        if (mode === 'single') {
          return [newMedia];
        }
        if (prev.some((item) => item.id === newMedia.id)) return prev;
        return [newMedia, ...prev];
      });
    },
    onCompleteAll: () => {
      // Làm mới lại danh sách và chuyển về tab Thư Viện
      library.refresh();
      setActiveTab('library');
    },
  });

  // Khi modal mở, khởi tạo selection theo initialSelectedUrls nếu có
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedUrls.length > 0 && library.items.length > 0) {
        const preSelected = library.items.filter((item) =>
          initialSelectedUrls.includes(item.url)
        );
        if (preSelected.length > 0) {
          setSelectedItems(preSelected);
        }
      }
    } else {
      // Reset khi đóng
      setSelectedItems([]);
      setActiveTab('library');
      uploader.clearCompletedTasks();
    }
  }, [isOpen]);

  // Set các ID đã chọn để tra cứu nhanh O(1)
  const selectedIdSet = useMemo(() => {
    return new Set(selectedItems.map((item) => item.id));
  }, [selectedItems]);

  // Xử lý chọn ảnh khi click vào thẻ ảnh
  const handleItemClick = useCallback(
    (media: MediaItem) => {
      if (mode === 'single') {
        setSelectedItems([media]);
      } else {
        setSelectedItems((prev) => {
          const exists = prev.some((item) => item.id === media.id);
          if (exists) {
            return prev.filter((item) => item.id !== media.id);
          }
          return [...prev, media];
        });
      }
    },
    [mode]
  );

  // Xử lý double-click: Chọn ngay và đóng modal ở mode single
  const handleItemDoubleClick = useCallback(
    (media: MediaItem) => {
      if (mode === 'single') {
        onSelect([media]);
        onClose();
      }
    },
    [mode, onSelect, onClose]
  );

  // Xử lý nút Xác Nhận
  const handleConfirm = useCallback(() => {
    if (selectedItems.length === 0) return;
    onSelect(selectedItems);
    onClose();
  }, [selectedItems, onSelect, onClose]);

  // Xử lý nhận files từ Dropzone
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      uploader.addFilesToQueue(files);
    },
    [uploader]
  );

  const modalTitle =
    title ||
    (mode === 'single'
      ? 'Chọn Một Hình Ảnh Từ Thư Viện'
      : 'Chọn Hình Ảnh Từ Thư Viện');

  const { page, totalPages, total } = library.pagination;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl max-h-[90vh] flex flex-col p-6 sm:p-7 overflow-hidden"
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header Tabs Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={activeTab === 'library' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('library')}
              className="flex items-center gap-2 cursor-pointer rounded-xl font-medium"
            >
              <ImageIcon size={16} />
              <span>Thư Viện Ảnh ({total})</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === 'upload' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-2 cursor-pointer rounded-xl font-medium"
            >
              <UploadCloud size={16} />
              <span>Tải Ảnh Mới Lên</span>
            </Button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {mode === 'single'
              ? 'Nhấp chọn 1 ảnh hoặc nhấp đúp để chọn nhanh'
              : 'Nhấp chọn nhiều ảnh để tạo bộ sưu tập'}
          </div>
        </div>

        {/* Tab 1: Thư Viện Ảnh (Library) */}
        {activeTab === 'library' && (
          <div className="flex flex-col flex-1 min-h-0 space-y-3">
            {/* Thanh tìm kiếm & bộ lọc mini */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Input
                  type="text"
                  placeholder="Tìm theo tên tệp hoặc Alt Text..."
                  value={library.search}
                  onChange={(e) => library.setSearch(e.target.value)}
                  leftIcon={<Search size={15} className="text-slate-400" />}
                  rightIcon={
                    library.search ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => library.setSearch('')}
                        aria-label="Xóa từ khóa tìm kiếm"
                        className="h-6 w-6 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <X size={12} />
                      </Button>
                    ) : undefined
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="w-full sm:w-44 h-9">
                <Select
                  options={FORMAT_OPTIONS}
                  value={library.format}
                  onChange={(e) => library.setFormat(e.target.value)}
                  placeholder="Định dạng"
                  className="h-9 text-xs"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => library.refresh()}
                disabled={library.loading}
                aria-label="Làm mới danh sách ảnh"
                className="h-9 w-9 shrink-0 cursor-pointer"
              >
                <RefreshCw
                  size={14}
                  className={library.loading ? 'animate-spin' : ''}
                />
              </Button>
            </div>

            {/* Vùng Lưới Ảnh Cuộn (Scrollable Grid) */}
            <div className="flex-1 overflow-y-auto max-h-[48vh] pr-1 rounded-xl border border-slate-200/60 p-2 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40">
              {library.error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-rose-500 font-medium">{library.error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => library.refresh()}
                    className="mt-3 cursor-pointer"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : library.loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, idx) => (
                    <MediaCardSkeleton key={`picker-skel-${idx}`} />
                  ))}
                </div>
              ) : library.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <ImageOff size={22} />
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Không tìm thấy hình ảnh nào
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    {library.search || library.format !== 'all'
                      ? 'Thử điều chỉnh lại từ khóa tìm kiếm hoặc định dạng lọc.'
                      : 'Kho ảnh hiện đang trống. Hãy chuyển sang Tab "Tải Ảnh Mới Lên".'}
                  </p>
                  {library.search || library.format !== 'all' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        library.setSearch('');
                        library.setFormat('all');
                      }}
                      className="mt-3 flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <SlidersHorizontal size={12} />
                      Đặt lại bộ lọc
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveTab('upload')}
                      className="mt-3 flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <UploadCloud size={14} />
                      Tải Ảnh Lên Ngay
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {library.items.map((item) => {
                    const isSelected = selectedIdSet.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onDoubleClick={() => handleItemDoubleClick(item)}
                        className="cursor-pointer"
                      >
                        <MediaCard
                          media={item}
                          isSelected={isSelected}
                          onToggleSelect={() => handleItemClick(item)}
                          onClick={() => handleItemClick(item)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Phân trang Mini */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Trang <span className="font-semibold">{page}</span> / {totalPages} (Tổng {total} ảnh)
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => library.setPage(page - 1)}
                    disabled={!library.pagination.hasPrevPage || page <= 1}
                    className="h-8 px-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => library.setPage(page + 1)}
                    disabled={!library.pagination.hasNextPage || page >= totalPages}
                    className="h-8 px-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Tải Ảnh Mới Lên (Upload) */}
        {activeTab === 'upload' && (
          <div className="flex flex-col flex-1 justify-center py-4">
            <MediaDropzone
              onFilesSelected={handleFilesSelected}
              disabled={uploader.isUploading}
            />

            {/* Trạng thái tiến trình upload nếu đang chạy */}
            {uploader.tasks.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Hàng đợi tải lên: {uploader.tasks.length} tệp</span>
                  <span>
                    Hoàn tất: {uploader.completedCount}/{uploader.tasks.length}
                  </span>
                </div>
                {uploader.failedCount > 0 && (
                  <p className="mt-1 text-rose-500 font-medium">
                    Có {uploader.failedCount} tệp gặp sự cố tải lên.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200/80 pt-3 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {selectedItems.length > 0 ? (
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <Check size={14} />
                Đã chọn {selectedItems.length} hình ảnh
              </span>
            ) : (
              <span className="text-slate-400">Chưa chọn hình ảnh nào</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              Hủy bỏ
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-1.5 cursor-pointer shadow-xs disabled:cursor-not-allowed"
            >
              <Check size={14} />
              <span>Xác Nhận Sử Dụng</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
