'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getMediaList,
  deleteMedia,
  batchDeleteMedia,
  updateMedia,
} from '../services/media.service';
import type {
  MediaItem,
  MediaQueryInput,
  MediaPaginationResponse,
  UpdateMediaInput,
} from '@cardealer/types';

// 🧠 Mental Model: Custom Hook quản lý dữ liệu, bộ lọc, phân trang và tương tác hàng loạt cho Thư Viện Ảnh (Media Library).
// - Kết nối trực tiếp với mediaService qua typed endpoints.
// - Tự động tải lại danh sách khi page, format, sortBy hoặc search thay đổi.
// - Quản lý tập hợp selectedIds (hỗ trợ xóa hàng loạt hoặc chèn nhiều ảnh).
// - 100% Named Export, anti-reward hacking (không nuốt lỗi).

export interface UseMediaLibraryOptions {
  initialLimit?: number;
  initialSortBy?: MediaQueryInput['sortBy'];
  autoFetch?: boolean;
}

export function useMediaLibrary(options: UseMediaLibraryOptions = {}) {
  const {
    initialLimit = 24,
    initialSortBy = 'newest',
    autoFetch = true,
  } = options;

  const [items, setItems] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<MediaPaginationResponse['pagination']>({
    total: 0,
    page: 1,
    limit: initialLimit,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc tìm kiếm & sắp xếp
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [search, setSearch] = useState<string>('');
  const [format, setFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<MediaQueryInput['sortBy']>(initialSortBy);

  // Lựa chọn nhiều ảnh (Selection Set)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Debounce search timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset về trang 1 khi tìm kiếm
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Hàm fetch danh sách ảnh từ server
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Partial<MediaQueryInput> = {
        page,
        limit,
        sortBy,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (format && format !== 'all') {
        params.format = format;
      }

      const response = await getMediaList(params);
      setItems(response.items || []);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách hình ảnh';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, format, sortBy]);

  // Tự động fetch khi query thay đổi
  useEffect(() => {
    if (autoFetch) {
      fetchMedia();
    }
  }, [autoFetch, fetchMedia]);

  // Cập nhật bộ lọc
  const handleSetFormat = useCallback((newFormat: string) => {
    setFormat(newFormat);
    setPage(1);
  }, []);

  const handleSetSortBy = useCallback((newSortBy: MediaQueryInput['sortBy']) => {
    setSortBy(newSortBy);
    setPage(1);
  }, []);

  // Selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const selectAll = useCallback(() => {
    setSelectedIds(items.map((item) => item.id));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Xóa ảnh đơn lẻ
  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        await deleteMedia(id);
        // Cập nhật state nội bộ ngay lập tức
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xóa ảnh thất bại';
        setError(msg);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    []
  );

  // Xóa hàng loạt ảnh đã chọn
  const batchDeleteSelected = useCallback(async (): Promise<{
    deletedCount: number;
    failedCount: number;
  }> => {
    if (!selectedIds.length) {
      return { deletedCount: 0, failedCount: 0 };
    }

    try {
      setIsDeleting(true);
      const res = await batchDeleteMedia(selectedIds);
      const failedSet = new Set(res.failedIds || []);
      const successfullyDeleted = selectedIds.filter((id) => !failedSet.has(id));

      setItems((prev) => prev.filter((item) => !successfullyDeleted.includes(item.id)));
      setSelectedIds((prev) => prev.filter((id) => failedSet.has(id)));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - res.deletedCount),
      }));

      return {
        deletedCount: res.deletedCount,
        failedCount: res.failedCount,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa hàng loạt thất bại';
      setError(msg);
      return { deletedCount: 0, failedCount: selectedIds.length };
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds]);

  // Cập nhật metadata (Alt Text)
  const updateItem = useCallback(
    async (id: string, data: UpdateMediaInput): Promise<MediaItem | null> => {
      try {
        const updated = await updateMedia(id, data);
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Cập nhật ảnh thất bại';
        setError(msg);
        return null;
      }
    },
    []
  );

  return {
    items,
    pagination,
    loading,
    error,
    page,
    limit,
    search,
    format,
    sortBy,
    selectedIds,
    isDeleting,
    isSelected,
    setPage,
    setLimit,
    setSearch,
    setFormat: handleSetFormat,
    setSortBy: handleSetSortBy,
    toggleSelect,
    selectAll,
    clearSelection,
    deleteItem,
    batchDeleteSelected,
    updateItem,
    refresh: fetchMedia,
  };
}
