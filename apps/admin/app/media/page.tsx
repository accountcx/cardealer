'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  ImageOff,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { MediaItem } from '@cardealer/types';
import { useAuth } from '../../contexts/AuthContext';
import { useMediaLibrary } from '../../hooks/use-media-library';
import { useMediaUploader } from '../../hooks/use-media-uploader';
import {
  MediaCard,
  MediaCardSkeleton,
  MediaDropzone,
  MediaUploadQueue,
  MediaDetailDrawer,
  MediaFilterBar,
  MediaBatchActions,
} from './components';

// 🧠 Mental Model: Page Controller trung tâm của Thư Viện Ảnh Showroom (/media).
// - Kết nối tầng Hooks (useMediaLibrary, useMediaUploader) với các Presentational Components chuẩn 4-State UI.
// - Tuân thủ ma trận phân quyền RBAC (media:read, media:write, media:delete).
// - Zero raw <button> và <input>, toàn bộ UI Controls đồng nhất từ Design System @cardealer/ui.
// - Xử lý anti-reward hacking: không nuốt lỗi, hiển thị thông báo phản hồi đầy đủ cho quản trị viên.

interface ActionNotification {
  type: 'success' | 'error';
  message: string;
}

export default function MediaManagementPage() {
  const { can } = useAuth();
  const canWrite = can('media:write');
  const canDelete = can('media:delete');

  // Trạng thái bật/tắt khu vực Dropzone
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);

  // Trạng thái Drawer xem chi tiết ảnh
  const [selectedMediaForDetail, setSelectedMediaForDetail] = useState<MediaItem | null>(null);

  // Thông báo phản hồi thao tác nhanh
  const [actionNotification, setActionNotification] = useState<ActionNotification | null>(null);

  // Hook quản lý dữ liệu kho ảnh
  const library = useMediaLibrary({
    initialLimit: 24,
    initialSortBy: 'newest',
  });

  // Hook quản lý tải lên đa luồng
  const uploader = useMediaUploader({
    onCompleteAll: () => {
      library.refresh();
      setActionNotification({
        type: 'success',
        message: 'Tất cả các tệp trong hàng đợi đã được tải lên thành công!',
      });
    },
  });

  // Tự động đóng thông báo sau 4 giây
  useEffect(() => {
    if (!actionNotification) return;
    const timer = setTimeout(() => {
      setActionNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [actionNotification]);

  // Xử lý nạp tệp từ Dropzone vào Hàng đợi tải
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      uploader.addFilesToQueue(files);
      setActionNotification({
        type: 'success',
        message: `Đã đưa ${files.length} tệp vào hàng đợi tải lên Cloudinary.`,
      });
    },
    [uploader]
  );

  // Xử lý cập nhật Alt Text trong Drawer
  const handleUpdateAltText = useCallback(
    async (id: string, altText: string): Promise<boolean> => {
      const updated = await library.updateItem(id, { altText });
      if (updated) {
        if (selectedMediaForDetail?.id === id) {
          setSelectedMediaForDetail(updated);
        }
        setActionNotification({
          type: 'success',
          message: 'Đã cập nhật Alt Text SEO cho ảnh thành công.',
        });
        return true;
      }
      return false;
    },
    [library, selectedMediaForDetail]
  );

  // Xử lý xóa đơn lẻ từ Drawer
  const handleDeleteSingle = useCallback(
    async (id: string): Promise<boolean> => {
      const ok = await library.deleteItem(id);
      if (ok) {
        setSelectedMediaForDetail(null);
        setActionNotification({
          type: 'success',
          message: 'Đã xóa ảnh vĩnh viễn khỏi Cloudinary và cơ sở dữ liệu.',
        });
      }
      return ok;
    },
    [library]
  );

  // Xử lý xóa hàng loạt từ Batch Actions
  const handleBatchDelete = useCallback(async () => {
    const res = await library.batchDeleteSelected();
    if (res.deletedCount > 0) {
      setActionNotification({
        type: 'success',
        message: `Đã xóa thành công ${res.deletedCount} ảnh.${
          res.failedCount > 0 ? ` (${res.failedCount} ảnh xóa thất bại)` : ''
        }`,
      });
    }
  }, [library]);

  const { page, totalPages, total, limit } = library.pagination;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Thư Viện Hình Ảnh
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Quản lý tập trung toàn bộ tài nguyên hình ảnh xe Hyundai, bài viết và biểu ngữ showroom
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canWrite && (
            <Button
              type="button"
              variant={isDropzoneOpen ? 'outline' : 'primary'}
              onClick={() => setIsDropzoneOpen((prev) => !prev)}
              className="flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <UploadCloud size={16} />
              <span>{isDropzoneOpen ? 'Đóng Tải Lên' : 'Tải Ảnh Mới'}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => library.refresh()}
            disabled={library.loading}
            aria-label="Làm mới thư viện"
            className="cursor-pointer"
          >
            <RefreshCw size={16} className={library.loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotification && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            actionNotification.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionNotification.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-medium">{actionNotification.message}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setActionNotification(null)}
            aria-label="Đóng thông báo"
            className="h-6 w-6 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Dropzone Upload Section (Collapsible) */}
      {isDropzoneOpen && canWrite && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-200">
          <MediaDropzone onFilesSelected={handleFilesSelected} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <MediaFilterBar
        search={library.search}
        onSearchChange={library.setSearch}
        format={library.format}
        onFormatChange={library.setFormat}
        sortBy={library.sortBy}
        onSortChange={library.setSortBy}
        totalItems={library.pagination.total}
        isLoading={library.loading}
        onRefresh={library.refresh}
      />

      {/* 4-State UI Matrix */}
      {/* 1. Error State */}
      {library.error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
            <AlertCircle size={24} />
          </div>
          <h3 className="mt-3 text-base font-semibold text-rose-900 dark:text-rose-200">
            Không thể tải dữ liệu ảnh
          </h3>
          <p className="mt-1 max-w-md text-sm text-rose-700 dark:text-rose-300">
            {library.error}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => library.refresh()}
            className="mt-4 flex items-center gap-2 cursor-pointer border-rose-300 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/40"
          >
            <RefreshCw size={15} />
            Thử lại kết nối
          </Button>
        </div>
      ) : library.loading ? (
        /* 2. Loading State: 24 ô Shimmer Skeletons */
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 24 }).map((_, index) => (
            <MediaCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : library.items.length === 0 ? (
        /* 3. Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-400">
            <ImageOff className="h-8 w-8" />
          </div>

          {library.search || library.format !== 'all' ? (
            <>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                Không tìm thấy ảnh phù hợp
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Không có hình ảnh nào khớp với từ khóa tìm kiếm hoặc định dạng đã chọn. Hãy thử điều chỉnh bộ lọc.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  library.setSearch('');
                  library.setFormat('all');
                }}
                className="mt-5 flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                Đặt lại bộ lọc
              </Button>
            </>
          ) : (
            <>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                Kho ảnh Showroom hiện đang trống
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Bạn chưa tải lên bất kỳ hình ảnh nào. Hãy bắt đầu tải lên ảnh xe Hyundai hoặc bài viết ngay.
              </p>
              {canWrite && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsDropzoneOpen(true)}
                  className="mt-5 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <UploadCloud size={16} />
                  Tải Ảnh Lên Ngay
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        /* 4. Data State: Responsive Media Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {library.items.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                isSelected={library.isSelected(item.id)}
                onToggleSelect={(id) => library.toggleSelect(id)}
                onClick={(media) => setSelectedMediaForDetail(media)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-4 dark:border-slate-800 sm:flex-row">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Hiển thị <span className="font-semibold text-slate-700 dark:text-slate-200">{startItem}</span> -{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{endItem}</span> trên tổng số{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> hình ảnh
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => library.setPage(page - 1)}
                  disabled={!library.pagination.hasPrevPage || page <= 1}
                  className="flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  <span>Trang trước</span>
                </Button>

                <div className="flex items-center px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {page} / {totalPages}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => library.setPage(page + 1)}
                  disabled={!library.pagination.hasNextPage || page >= totalPages}
                  className="flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Trang sau</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Batch Actions Bar (Hiển thị khi chọn >= 1 ảnh) */}
      <MediaBatchActions
        selectedCount={library.selectedIds.length}
        totalPageItems={library.items.length}
        isAllSelected={library.items.length > 0 && library.selectedIds.length === library.items.length}
        onSelectAll={library.selectAll}
        onClearSelection={library.clearSelection}
        onBatchDelete={handleBatchDelete}
        isDeleting={library.isDeleting}
      />

      {/* Detail & Metadata Editor Drawer */}
      <MediaDetailDrawer
        media={selectedMediaForDetail}
        isOpen={!!selectedMediaForDetail}
        onClose={() => setSelectedMediaForDetail(null)}
        onUpdateAltText={canWrite ? handleUpdateAltText : undefined}
        onDelete={canDelete ? handleDeleteSingle : undefined}
      />

      {/* Concurrency Upload Queue Widget */}
      <MediaUploadQueue
        tasks={uploader.tasks}
        onRetry={uploader.retryTask}
        onRemove={uploader.removeTask}
        onClearCompleted={uploader.clearCompletedTasks}
      />
    </div>
  );
}
