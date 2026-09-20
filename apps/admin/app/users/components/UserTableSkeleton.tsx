// 🧠 Mental Model: Skeleton Shimmer Loading cho Bảng Quản trị Nhân viên (SOP UI v2.2.4)
// Tuân thủ 100% Named Export, chiều cao cố định h-11 chống Layout Shift (Zero-CLS)
// và tôn trọng tùy chọn hỗ trợ người khuyết tật (motion-reduce:animate-none).
import React from 'react';
import { Skeleton } from '@cardealer/ui';

export const UserTableSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-3">
      {/* Skeleton Header */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Skeleton Table Rows */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden">
        <div className="h-11 bg-slate-800/40 border-b border-white/5 px-4 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
