import React from 'react';
import { Car as CarIcon, CheckCircle2, AlertCircle, Flame } from 'lucide-react';
import { Skeleton } from '@cardealer/ui';

// 🧠 Mental Model: Hiển thị nhanh các chỉ số KPI danh mục xe Showroom và đóng vai trò như bộ lọc tương tác.
// Khi quản trị viên nhấp vào từng thẻ KPI (Bản Nháp, Công Khai, Hot), danh sách xe sẽ được lọc tương ứng tức thì.
// Thiết kế thẻ Card hiện đại chuẩn Luxury Automotive Dark Theme kèm Active Indicator và Skeleton Loading chống giật trang (CLS).
export type CarFilterStatus = 'all' | 'published' | 'draft' | 'featured';

interface CarStatsProps {
  total: number;
  published: number;
  draft: number;
  featured: number;
  activeFilter?: CarFilterStatus;
  onFilterChange?: (filter: CarFilterStatus) => void;
  isLoading?: boolean;
}

export function CarStats({
  total,
  published,
  draft,
  featured,
  activeFilter = 'all',
  onFilterChange,
  isLoading = false,
}: CarStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="relative p-3.5 sm:p-4 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl"
          >
            {/* Top row skeleton */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            </div>

            {/* Middle row skeleton */}
            <Skeleton className="h-7 w-12 my-1.5 rounded" />

            {/* Bottom row skeleton */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards: Array<{
    id: CarFilterStatus;
    label: string;
    description: string;
    val: number;
    color: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    bg: string;
  }> = [
    {
      id: 'all',
      label: 'Tổng Dòng Xe',
      description: 'Tất cả sản phẩm',
      val: total,
      color: '#0072CE',
      icon: CarIcon,
      bg: 'from-[#0072CE]/25 to-[#0072CE]/5',
    },
    {
      id: 'published',
      label: 'Đang Công Khai',
      description: 'Hiển thị trên Web',
      val: published,
      color: '#10B981',
      icon: CheckCircle2,
      bg: 'from-emerald-500/25 to-emerald-500/5',
    },
    {
      id: 'draft',
      label: 'Bản Nháp / Ẩn',
      description: 'Chưa mở bán',
      val: draft,
      color: '#F59E0B',
      icon: AlertCircle,
      bg: 'from-amber-500/25 to-amber-500/5',
    },
    {
      id: 'featured',
      label: 'Xe Bán Chạy / Hot',
      description: 'Nổi bật trang chủ',
      val: featured,
      color: '#EF4444',
      icon: Flame,
      bg: 'from-red-500/25 to-red-500/5',
    },
  ];

  const handleCardClick = (cardId: CarFilterStatus) => {
    if (!onFilterChange) return;
    if (activeFilter === cardId && cardId !== 'all') {
      onFilterChange('all');
    } else {
      onFilterChange(cardId);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {statCards.map((s) => {
        const Icon = s.icon;
        const isActive = activeFilter === s.id;

        return (
          <div
            key={s.id}
            onClick={() => handleCardClick(s.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(s.id);
              }
            }}
            className={`relative p-3.5 sm:p-4 rounded-xl border backdrop-blur-xl transition-all duration-200 cursor-pointer select-none group focus:outline-none ${
              isActive
                ? 'bg-slate-800/90 border-[#0072CE] ring-2 ring-[#0072CE]/60 shadow-[0_4px_20px_rgba(0,114,206,0.2)] scale-[1.01]'
                : 'bg-slate-900/60 border-white/10 hover:border-white/25 hover:bg-slate-800/50 hover:shadow-md'
            }`}
          >
            {/* Top row: Label + Icon */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors truncate">
                {s.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${s.bg} border border-white/10 group-hover:scale-105 transition-transform duration-200 ${
                  isActive ? 'ring-1 ring-white/20' : ''
                }`}
                style={{ color: s.color }}
              >
                <Icon size={16} />
              </div>
            </div>

            {/* Middle row: Big Metric Number */}
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-2">
              {s.val}
            </div>

            {/* Bottom row: Subtitle or Active status badge */}
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/5">
              <span className="text-slate-400 text-[11px]">
                {s.description}
              </span>
              {isActive ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Đang lọc
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                  Nhấn để lọc &rarr;
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
