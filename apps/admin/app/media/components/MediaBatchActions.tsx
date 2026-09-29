'use client';

import React, { useState } from 'react';
import { Trash2, X, CheckSquare } from 'lucide-react';
import { Button } from '@cardealer/ui';

// 🧠 Mental Model: Thanh tác vụ nổi khi người dùng chọn nhiều ảnh (Batch Actions Bar).
// - Nổi cố định ở đáy màn hình với hiệu ứng Glassmorphism hiện đại.
// - Hiển thị số lượng ảnh đang được chọn.
// - Cung cấp các thao tác: Chọn tất cả, Bỏ chọn toàn bộ, và Xóa hàng loạt có bước xác nhận bảo vệ.

export interface MediaBatchActionsProps {
  selectedCount: number;
  totalPageItems: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => Promise<void>;
  isDeleting?: boolean;
}

export function MediaBatchActions({
  selectedCount,
  totalPageItems,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onBatchDelete,
  isDeleting = false,
}: MediaBatchActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (selectedCount === 0) return null;

  const handleDeleteClick = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    await onBatchDelete();
    setShowConfirm(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-950/95">
        {/* Count Label */}
        <div className="flex items-center gap-2 border-r border-slate-700/60 pr-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold">
            {selectedCount}
          </span>
          <span className="text-xs font-medium text-slate-200">Đã chọn</span>
        </div>

        {/* Select All / Deselect buttons */}
        <div className="flex items-center gap-1.5">
          {!isAllSelected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              leftIcon={<CheckSquare className="h-3.5 w-3.5" />}
              className="text-slate-300 hover:text-white"
            >
              Chọn {totalPageItems} ảnh
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            leftIcon={<X className="h-3.5 w-3.5" />}
            className="text-slate-300 hover:text-white"
          >
            Bỏ chọn
          </Button>
        </div>

        {/* Delete Action */}
        <div className="flex items-center gap-2 border-l border-slate-700/60 pl-3">
          <Button
            type="button"
            variant={showConfirm ? 'danger' : 'outline'}
            size="sm"
            onClick={handleDeleteClick}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            {showConfirm
              ? `Xác nhận xóa ${selectedCount} ảnh?`
              : `Xóa ${selectedCount} ảnh`}
          </Button>

          {showConfirm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirm(false)}
              className="text-slate-400 hover:text-white"
            >
              Hủy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
