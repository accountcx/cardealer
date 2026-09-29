'use client';

import React, { useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  FileImage,
} from 'lucide-react';
import type { UploadTask } from '@cardealer/types';
import { Button } from '@cardealer/ui';
import { formatBytes } from './MediaCard';

// 🧠 Mental Model: Khay theo dõi hàng đợi tải ảnh (Upload Queue Drawer / Widget).
// - Hiển thị trạng thái realtime của từng tác vụ tải lên.
// - Indeterminate loading state mượt mà với spinner và icon trực quan.
// - Hỗ trợ thao tác thử lại (Retry) cho từng ảnh gặp sự cố và dọn dẹp danh sách đã tải xong.

export interface MediaUploadQueueProps {
  tasks: UploadTask[];
  onRetry: (taskId: string) => void;
  onRemove: (taskId: string) => void;
  onClearCompleted: () => void;
}

export function MediaUploadQueue({
  tasks,
  onRetry,
  onRemove,
  onClearCompleted,
}: MediaUploadQueueProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!tasks.length) return null;

  const activeCount = tasks.filter(
    (t) => t.status === 'uploading' || t.status === 'pending'
  ).length;
  const completedCount = tasks.filter((t) => t.status === 'success').length;
  const failedCount = tasks.filter((t) => t.status === 'error').length;

  return (
    <div className="fixed bottom-5 right-5 z-40 w-96 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-850/80">
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          ) : failedCount > 0 ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            {activeCount > 0
              ? `Đang tải ${activeCount} tệp...`
              : `Đã hoàn tất (${completedCount}/${tasks.length})`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {completedCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearCompleted}
              className="h-6 px-2 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Xóa xong
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            title={isCollapsed ? 'Mở rộng' : 'Thu nhỏ'}
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Task List (Expandable) */}
      {!isCollapsed && (
        <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto p-2 dark:divide-slate-800/60">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <FileImage className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                    {task.file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatBytes(task.file.size)}
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {task.status === 'pending' && (
                  <span className="text-[11px] text-slate-400">Đang chờ...</span>
                )}
                {task.status === 'uploading' && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-[11px] font-medium">Tải lên...</span>
                  </div>
                )}
                {task.status === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                {task.status === 'error' && (
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[10px] font-medium text-rose-500"
                      title={task.errorMessage}
                    >
                      Lỗi
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRetry(task.id)}
                      className="h-6 w-6 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      title="Thử lại"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(task.id)}
                  className="h-6 w-6 rounded text-slate-400 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  title="Xóa khỏi hàng đợi"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
