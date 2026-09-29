'use client';

import React from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import { Select, Button, Input, type SelectOption } from '@cardealer/ui';
import type { MediaQueryInput } from '@cardealer/types';

// 🧠 Mental Model: Thanh tìm kiếm, lọc và sắp xếp ảnh trong kho.
// - Dùng Input chuẩn từ @cardealer/ui (kèm leftIcon Search và rightIcon Button X clear search).
// - Lọc nhanh theo định dạng ảnh sử dụng Select component chuẩn từ @cardealer/ui.
// - Sắp xếp đa chiều (mới/cũ/kích thước/tên) đồng bộ Design System.
// - Nút làm mới dữ liệu sử dụng Button size="icon" chuẩn từ @cardealer/ui.

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

const FORMAT_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tất cả định dạng' },
  { value: 'webp', label: 'WEBP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG / JPG' },
  { value: 'svg+xml', label: 'SVG' },
  { value: 'gif', label: 'GIF' },
];

const SORT_OPTIONS: SelectOption[] = [
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
      {/* Search Input dùng Input và Button chuẩn từ @cardealer/ui */}
      <div className="relative flex-1 max-w-md">
        <Input
          type="text"
          placeholder="Tìm theo tên tệp hoặc Alt Text..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          rightIcon={
            search ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onSearchChange('')}
                className="h-6 w-6 rounded-md p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : undefined
          }
          className="h-10 rounded-xl text-xs bg-slate-50/50 border-slate-200 dark:border-slate-700 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Filters, Sorters and Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Format Select Dropdown */}
        <div className="w-full sm:w-44">
          <Select
            options={FORMAT_OPTIONS}
            value={format}
            onChange={(e) => onFormatChange(e.target.value)}
            sheetTitle="Lọc Theo Định Dạng Ảnh"
            className="h-10 text-xs rounded-xl"
            containerClassName="w-full"
          />
        </div>

        {/* Sort By Select Dropdown */}
        <div className="w-full sm:w-48">
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as MediaQueryInput['sortBy'])}
            sheetTitle="Sắp Xếp Danh Sách Ảnh"
            className="h-10 text-xs rounded-xl"
            containerClassName="w-full"
          />
        </div>

        {/* Total Count Badge */}
        {totalItems !== undefined && (
          <span className="hidden xl:inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {totalItems} ảnh
          </span>
        )}

        {/* Refresh Button from @cardealer/ui */}
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
}
