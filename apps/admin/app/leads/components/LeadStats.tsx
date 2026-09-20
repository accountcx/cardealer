'use client';

// 🧠 Mental Model: Thẻ chỉ số KPI Lead CRM và bộ lọc tương tác nhanh (Interactive KPI Cards).
// Thiết kế chuẩn Luxury Automotive Dark Theme (#0b0f17, backdrop-blur, border-white/10) khớp 100% với CarStats và UserStats.
// Nhấp vào từng thẻ để kích hoạt bộ lọc trạng thái tương ứng tức thì.

import React from 'react';
import { Users, AlertCircle, PhoneCall, CheckCircle2, XCircle } from 'lucide-react';
import type { LeadStatus } from '@cardealer/types';

export type LeadFilterType = 'all' | LeadStatus;

interface LeadStatsProps {
  total: number;
  newCount: number;
  contactedCount: number;
  convertedCount: number;
  cancelledCount: number;
  activeFilter?: LeadFilterType;
  onFilterChange?: (filter: LeadFilterType) => void;
  isLoading?: boolean;
}

export function LeadStats({
  total,
  newCount,
  contactedCount,
  convertedCount,
  cancelledCount,
  activeFilter = 'all',
  onFilterChange,
  isLoading = false,
}: LeadStatsProps) {
  const cards: Array<{
    id: LeadFilterType;
    label: string;
    count: number;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    activeBorder: string;
    activeGlow: string;
  }> = [
    {
      id: 'all',
      label: 'Tổng Khách Hàng',
      count: total,
      description: 'Toàn bộ phễu đăng ký',
      icon: Users,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      activeBorder: 'border-sky-500/50',
      activeGlow: 'shadow-[0_0_20px_rgba(14,165,233,0.15)]',
    },
    {
      id: 'new',
      label: 'Mới Nhận (Cần gọi)',
      count: newCount,
      description: 'Chờ phản hồi trong 5p',
      icon: AlertCircle,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      activeBorder: 'border-blue-500/50',
      activeGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
    },
    {
      id: 'contacted',
      label: 'Đang Tư Vấn',
      count: contactedCount,
      description: 'Đang gửi báo giá / lái thử',
      icon: PhoneCall,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      activeBorder: 'border-indigo-500/50',
      activeGlow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    },
    {
      id: 'converted',
      label: 'Thành Công (Đã Cọc)',
      count: convertedCount,
      description: 'Chốt hợp đồng mua xe',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      activeBorder: 'border-emerald-500/50',
      activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
    {
      id: 'cancelled',
      label: 'Hủy / Sai Số',
      count: cancelledCount,
      description: 'Số ảo hoặc đổi ý',
      icon: XCircle,
      iconColor: 'text-slate-400',
      iconBg: 'bg-slate-500/10 border-slate-500/20',
      activeBorder: 'border-slate-500/50',
      activeGlow: 'shadow-[0_0_20px_rgba(148,163,184,0.15)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterChange?.(card.id)}
            className={`text-left relative p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
              isActive
                ? `${card.activeBorder} ${card.activeGlow} bg-slate-900/90`
                : 'border-white/10 bg-slate-900/60 hover:bg-slate-900/80 hover:border-white/20'
            } backdrop-blur-xl`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-400">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.iconBg} ${card.iconColor}`}>
                <Icon size={16} />
              </div>
            </div>

            <div className="text-2xl font-black text-white tracking-tight my-1">
              {isLoading ? '...' : card.count.toLocaleString('vi-VN')}
            </div>

            <div className="text-[11px] text-slate-400 border-t border-white/5 pt-2 mt-2 truncate">
              {card.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
