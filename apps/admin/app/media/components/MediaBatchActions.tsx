'use client';

import React, { useState } from 'react';
import { Trash2, X, CheckSquare, Loader2, AlertCircle } from 'lucide-react';

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
            <button
              type="button"
              onClick={onSelectAll}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Chọn {totalPageItems} ảnh
            </button>
          )}

          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Bỏ chọn
          </button>
        </div>

        {/* Delete Action */}
        <div className="flex items-center gap-2 border-l border-slate-700/60 pl-3">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              showConfirm
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
            }`}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {showConfirm
              ? `Xác nhận xóa ${selectedCount} ảnh?`
              : `Xóa ${selectedCount} ảnh`}
          </button>

          {showConfirm && (
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="rounded-xl px-2 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
