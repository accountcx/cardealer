'use client';

import React from 'react';
import { Search, X, Filter, ArrowUpDown, RefreshCw } from 'lucide-react';
import type { MediaQueryInput } from '@cardealer/types';

// 🧠 Mental Model: Thanh tìm kiếm, lọc và sắp xếp ảnh trong kho.
// - Tìm kiếm thời gian thực (đã debounce 350ms ở useMediaLibrary).
// - Lọc nhanh theo định dạng ảnh (WEBP, PNG, JPG, SVG, GIF).
// - Sắp xếp theo ngày tải lên, dung lượng hoặc tên file.
// - Nút làm mới dữ liệu (Refresh).

export interface MediaFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  format: string;
  onFormatChange: (value: string) => void;
  sortBy: MediaQueryInput['sortBy'];
  onSortChange: (value: MediaQueryInput['sortBy']) => void;
  totalItems?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const FORMAT_OPTIONS = [
  { value: 'all', label: 'Tất cả định dạng' },
  { value: 'webp', label: 'WEBP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG / JPG' },
  { value: 'svg+xml', label: 'SVG' },
  { value: 'gif', label: 'GIF' },
];

const SORT_OPTIONS: { value: MediaQueryInput['sortBy']; label: string }[] = [
  { value: 'newest', label: 'Mới nhất trước' },
  { value: 'oldest', label: 'Cũ nhất trước' },
  { value: 'size_desc', label: 'Dung lượng giảm dần' },
  { value: 'size_asc', label: 'Dung lượng tăng dần' },
  { value: 'name_asc', label: 'Tên tệp (A-Z)' },
];

export function MediaFilterBar({
  search,
  onSearchChange,
  format,
  onFormatChange,
  sortBy,
  onSortChange,
  totalItems,
  isLoading = false,
  onRefresh,
}: MediaFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên tệp hoặc Alt Text..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-9 text-xs text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Xóa tìm kiếm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filters and Sorters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Format Filter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
          >
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as MediaQueryInput['sortBy'])}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none dark:text-slate-200 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Total Count Badge */}
        {totalItems !== undefined && (
          <span className="hidden lg:inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {totalItems} ảnh
          </span>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
