import React from 'react';

/**
 * 🧠 Mental Model: Trạng thái nạp dữ liệu khung (Skeleton Loading State).
 * Thiết kế khớp 100% với bố cục thực tế của trang chi tiết xe,
 * giúp người dùng không cảm thấy giật chuyển layout (CLS = 0) trong quá trình nạp dữ liệu.
 */
export function CarDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pt-4 pb-20 animate-pulse motion-reduce:animate-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-slate-200 rounded w-48" />

        {/* Hero Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột Trái: Car Stage Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[16/10] bg-slate-200 rounded-3xl w-full" />
            {/* Color Swatches Skeleton */}
            <div className="flex justify-center items-center gap-3 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-200" />
              ))}
            </div>
          </div>

          {/* Cột Phải: Specs & Pricing Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="h-20 bg-slate-200 rounded-2xl w-full" />
            <div className="space-y-3 pt-4">
              <div className="h-16 bg-slate-200 rounded-2xl w-full" />
              <div className="h-16 bg-slate-200 rounded-2xl w-full" />
            </div>
          </div>
        </div>

        {/* Consultant & Specs Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          <div className="lg:col-span-8 h-96 bg-slate-200 rounded-3xl" />
          <div className="lg:col-span-4 h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
