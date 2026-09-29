'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { uploadSingleMedia } from '../services/media.service';
import type { MediaItem, UploadTask } from '@cardealer/types';

// 🧠 Mental Model: Concurrency Queue Hook cho việc Upload nhiều ảnh đồng thời.
// - Khống chế tối đa MAX_CONCURRENT_UPLOADS (3 luồng) song song để tránh nghẽn bandwidth hoặc Cloudinary rate limit.
// - Vận hành 100% bằng fetch thuần túy thông qua mediaService.uploadSingleMedia.
// - Quản lý trạng thái đa tầng: pending, uploading (indeterminate state), success, error kèm khả năng Retry.

const MAX_CONCURRENT_UPLOADS = 3;

export interface UseMediaUploaderOptions {
  onSuccessSingle?: (media: MediaItem) => void;
  onCompleteAll?: () => void;
}

export function useMediaUploader(options?: UseMediaUploaderOptions) {
  const { onSuccessSingle, onCompleteAll } = options || {};

  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const activeCountRef = useRef(0);
  const queueRef = useRef<UploadTask[]>([]);

  // Giữ callback references mới nhất để tránh stale closures
  const onSuccessSingleRef = useRef(onSuccessSingle);
  onSuccessSingleRef.current = onSuccessSingle;

  const onCompleteAllRef = useRef(onCompleteAll);
  onCompleteAllRef.current = onCompleteAll;

  const isUploading = tasks.some(
    (t) => t.status === 'uploading' || t.status === 'pending'
  );

  const processNext = useCallback(() => {
    // Nếu đạt ngưỡng tối đa hoặc không còn task pending trong queue
    while (
      activeCountRef.current < MAX_CONCURRENT_UPLOADS &&
      queueRef.current.length > 0
    ) {
      const nextTask = queueRef.current.shift();
      if (!nextTask) break;

      activeCountRef.current += 1;

      // Cập nhật trạng thái bắt đầu upload (Indeterminate Loading)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === nextTask.id ? { ...t, status: 'uploading', progress: 50 } : t
        )
      );

      uploadSingleMedia(nextTask.file)
        .then((mediaItem) => {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === nextTask.id
                ? {
                    ...t,
                    status: 'success',
                    progress: 100,
                    result: mediaItem,
                    errorMessage: undefined,
                  }
                : t
            )
          );
          if (onSuccessSingleRef.current) {
            onSuccessSingleRef.current(mediaItem);
          }
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Tải lên thất bại';
          setTasks((prev) =>
            prev.map((t) =>
              t.id === nextTask.id
                ? { ...t, status: 'error', errorMessage: message }
                : t
            )
          );
        })
        .finally(() => {
          activeCountRef.current = Math.max(0, activeCountRef.current - 1);

          // Nếu hết tác vụ đang chạy và queue rỗng
          if (activeCountRef.current === 0 && queueRef.current.length === 0) {
            if (onCompleteAllRef.current) {
              onCompleteAllRef.current();
            }
          }

          processNext();
        });
    }
  }, []);

  const addFilesToQueue = useCallback(
    (files: File[]) => {
      if (!files.length) return;

      const newTasks: UploadTask[] = files.map((file) => ({
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        progress: 0,
        status: 'pending',
      }));

      // Đẩy vào queue nội bộ
      queueRef.current.push(...newTasks);

      // Cập nhật state hiển thị cho UI
      setTasks((prev) => [...prev, ...newTasks]);

      // Kích hoạt worker pool
      processNext();
    },
    [processNext]
  );

  const retryTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === taskId);
        if (!target) return prev;

        const updatedTask: UploadTask = {
          ...target,
          status: 'pending',
          progress: 0,
          errorMessage: undefined,
        };

        // Đưa lại vào queue nội bộ
        queueRef.current.push(updatedTask);

        setTimeout(() => processNext(), 0);

        return prev.map((t) => (t.id === taskId ? updatedTask : t));
      });
    },
    [processNext]
  );

  const removeTask = useCallback((taskId: string) => {
    // Loại khỏi queue nếu chưa chạy
    queueRef.current = queueRef.current.filter((t) => t.id !== taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status !== 'success'));
  }, []);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      queueRef.current = [];
      activeCountRef.current = 0;
    };
  }, []);

  const activeCount = tasks.filter((t) => t.status === 'uploading').length;
  const completedCount = tasks.filter((t) => t.status === 'success').length;
  const failedCount = tasks.filter((t) => t.status === 'error').length;

  return {
    tasks,
    isUploading,
    activeCount,
    completedCount,
    failedCount,
    addFilesToQueue,
    retryTask,
    removeTask,
    clearCompletedTasks,
  };
}
