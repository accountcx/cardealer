# 🌐 Frontend Integration & Modern UI Specification: Thư Viện Ảnh Admin & Tích Hợp Cloudinary

## 1. Cấu Trúc Thư Mục & Phân Rã Component (Component Hierarchy)

Áp dụng mô hình **Monorepo Modular Architecture** với 100% **Named Exports**:

```text
apps/admin/
├── app/
│   ├── media/
│   │   ├── page.tsx                     # Page Controller: Quản lý tổng thể trang Thư Viện Ảnh
│   │   └── components/
│   │       ├── MediaDropzone.tsx        # Drag & Drop Zone: Vùng kéo thả tệp với animation mượt
│   │       ├── MediaUploadQueue.tsx     # Queue Drawer/Bar: Hiển thị tiến trình tải (%) từng tệp
│   │       ├── MediaGrid.tsx            # Lưới hiển thị danh sách ảnh (4-State Pattern)
│   │       ├── MediaCard.tsx            # Thẻ ảnh đơn lẻ: Thumbnail, checkbox chọn, badge format
│   │       ├── MediaDetailDrawer.tsx    # Drawer chi tiết: Xem ảnh full, metadata, copy URL, sửa Alt Text
│   │       ├── MediaFilterBar.tsx       # Thanh tìm kiếm realtime, lọc format, sắp xếp
│   │       └── MediaBatchActions.tsx    # Thanh tác vụ nổi khi chọn nhiều ảnh (Xóa hàng loạt, Bỏ chọn)
│   └── components/
│       └── MediaPickerModal.tsx         # Component DÙNG CHUNG: Popup chọn ảnh nhúng vào Car/Post form
├── hooks/
│   ├── use-media-library.ts             # Hook quản lý fetch danh sách, phân trang, bộ lọc
│   └── use-media-uploader.ts            # Hook điều phối Concurrency Queue tải ảnh (max 3 luồng)
├── services/
│   └── media.service.ts                 # API Client: Gọi endpoints /api/admin/media/*
└── types/
    └── media.types.ts                   # UI Data Contracts & Interfaces
```

---

## 2. Ma Trận 4 Trạng Thái Giao Diện (4-State UI Matrix)

| Thành phần (Component) | 1. Loading State | 2. Empty State | 3. Error State (Mapped API Code) | 4. Success / Data State |
| :--- | :--- | :--- | :--- | :--- |
| **`MediaGrid`** | Lưới 24 ô `MediaCardSkeleton` với hiệu ứng Shimmer Pulse đồng đều. | Khung nét đứt bo tròn, Icon `ImageOff`, thông điệp "Chưa có ảnh nào trong kho" + Nút "Tải ảnh ngay". | Banner đỏ cảnh báo kết nối, hiển thị mã lỗi (`CLOUDINARY_UPLOAD_FAILED`, `DATABASE_ERROR`) + Nút "Thử lại". | Hiển thị Grid Responsive (2 cột mobile ➡️ 4 cột tablet ➡️ 6 cột desktop), hiển thị ảnh WebP sắc nét. |
| **`MediaDropzone`** | Khóa tương tác, hiển thị Spinner mờ khi đang khởi tạo. | Viền nét đứt màu Slate/Blue, Icon `UploadCloud` lơ lửng, hướng dẫn kéo thả hoặc click chọn. | Viền đỏ nhấp nháy nếu kéo thả tệp quá 10MB hoặc sai định dạng (`FILE_TOO_LARGE`, `INVALID_FILE_TYPE`). | Viền xanh Indigo Active khi người dùng đang kéo tệp lướt qua vùng Dropzone (`isDragActive`). |
| **`MediaUploadQueue`** | Danh sách thanh tiến trình chạy đều 0% ➡️ 100%. | Ẩn hoàn toàn khi không có tác vụ tải lên ngầm. | Card tệp chuyển viền đỏ, hiển thị icon cảnh báo tam giác kèm nút "Thử lại" (Retry). | Icon tích xanh tròn `CheckCircle`, thông báo "Đã tải xong", tự động fade-out sau 3 giây. |
| **`MediaPickerModal`** | Tab "Thư viện" hiển thị Skeleton, Tab "Tải ảnh" hiển thị Dropzone. | Kho ảnh rỗng: hiển thị CTA chuyển sang Tab "Tải ảnh mới". | Hiển thị Toast thông báo lỗi quyền hạn nếu không có quyền upload. | Cho phép chọn 1 hoặc nhiều ảnh kèm số lượng đã chọn (`Đã chọn 2 ảnh`), nút "Xác nhận chèn". |

---

## 3. Đặc Tả Code Giao Diện Chuẩn Mực (Tailwind CSS & WCAG AAA)

### A. Component Skeleton (Loading State)
```tsx
import React from 'react';

export const MediaCardSkeleton = () => {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 p-2 dark:border-slate-800/80 dark:bg-slate-900">
      <div className="h-full w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
      </div>
    </div>
  );
};
```

### B. Component Empty State
```tsx
import React from 'react';
import { ImageOff, UploadCloud } from 'lucide-react';

interface MediaEmptyStateProps {
  onOpenUpload: () => void;
}

export const MediaEmptyState = ({ onOpenUpload }: MediaEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-400">
        <ImageOff className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        Kho ảnh Showroom hiện đang trống
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Bạn chưa tải lên bất kỳ hình ảnh nào. Hãy bắt đầu tải lên ảnh xe Hyundai hoặc bài viết ngay.
      </p>
      <button
        type="button"
        onClick={onOpenUpload}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <UploadCloud className="h-4 w-4" />
        Tải Ảnh Lên Ngay
      </button>
    </div>
  );
};
```

### C. Component MediaPickerModal (Dùng chung cho toàn hệ thống)
```tsx
import React, { useState } from 'react';
import { Modal } from '@cardealer/ui';
import { Image, UploadCloud, Check, X } from 'lucide-react';
import type { MediaItem } from '../types/media.types';

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: MediaItem[]) => void;
  mode?: 'single' | 'multiple';
  title?: string;
  initialSelectedUrls?: string[];
}

export const MediaPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  mode = 'single',
  title = 'Chọn Hình Ảnh Từ Thư Viện',
  initialSelectedUrls = [],
}: MediaPickerModalProps) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

  const handleConfirm = () => {
    onSelect(selectedItems);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-5xl">
      <div className="flex flex-col space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
              activeTab === 'library'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Image className="h-4 w-4" />
            Thư Viện Ảnh Có Sẵn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            Tải Ảnh Mới Lên
          </button>
        </div>

        {/* Tab Contents: Grid hoặc Dropzone */}
        <div className="min-h-[420px] max-h-[60vh] overflow-y-auto pr-1">
          {activeTab === 'library' ? (
            <div>{/* MediaGrid rendered here with selection highlighting */}</div>
          ) : (
            <div>{/* MediaDropzone rendered here, auto switch to library on upload success */}</div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <span className="text-xs text-slate-500">
            {selectedItems.length > 0
              ? `Đã chọn ${selectedItems.length} hình ảnh`
              : 'Chưa chọn hình ảnh nào'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={handleConfirm}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Xác Nhận Sử Dụng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
```

---

## 4. Hook Điều Phối Tải Lên Hàng Đợi (Concurrency Queue Hook)

Tệp: `apps/admin/hooks/use-media-uploader.ts` (100% Named Export)
- **Kiến trúc HTTP:** 100% Native `fetch()` thuần túy thông qua `mediaService.uploadSingleMedia` (tự động nhận diện `FormData`, hỗ trợ SSR, không dùng `XMLHttpRequest`).
- **Trạng thái UI:** Indeterminate Loading State (Spinner / Shimmer Pulse) kèm các trạng thái trực quan: `pending` (chờ) ➡️ `uploading` (đang tải) ➡️ `success` (xong) / `error` (thất bại kèm Retry).

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { uploadSingleMedia } from '../services/media.service';
import type { MediaItem, UploadTask } from '@cardealer/types';

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

  const onSuccessSingleRef = useRef(onSuccessSingle);
  onSuccessSingleRef.current = onSuccessSingle;

  const onCompleteAllRef = useRef(onCompleteAll);
  onCompleteAllRef.current = onCompleteAll;

  const isUploading = tasks.some(
    (t) => t.status === 'uploading' || t.status === 'pending'
  );

  const processNext = useCallback(() => {
    while (
      activeCountRef.current < MAX_CONCURRENT_UPLOADS &&
      queueRef.current.length > 0
    ) {
      const nextTask = queueRef.current.shift();
      if (!nextTask) break;

      activeCountRef.current += 1;

      // Cập nhật trạng thái bắt đầu upload (Indeterminate loading)
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

      queueRef.current.push(...newTasks);
      setTasks((prev) => [...prev, ...newTasks]);
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

        queueRef.current.push(updatedTask);
        setTimeout(() => processNext(), 0);
        return prev.map((t) => (t.id === taskId ? updatedTask : t));
      });
    },
    [processNext]
  );

  const removeTask = useCallback((taskId: string) => {
    queueRef.current = queueRef.current.filter((t) => t.id !== taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status !== 'success'));
  }, []);

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
```

