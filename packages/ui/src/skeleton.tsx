import * as React from 'react';
import { cn } from './lib/utils';

// 🧠 Mental Model: Canonical Shadcn UI Skeleton Primitive
// Tạo hiệu ứng shimmer lấp lánh (pulsing wave) với nền chuyển sắc nhẹ nhàng trên Dark Theme
// Thay thế hoàn toàn cho Spinner truyền thống để triệt tiêu hiện tượng Content Layout Shift (CLS)
// Giữ nguyên khung hình học chính xác của trang trong suốt thời gian tải dữ liệu từ máy chủ.

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-800/70 border border-white/5',
        className
      )}
      {...props}
    />
  );
}
