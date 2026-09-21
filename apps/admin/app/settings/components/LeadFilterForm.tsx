'use client';

import React from 'react';
import { Input, Label } from '@cardealer/ui';
import type { LeadFilterConfig } from '@cardealer/types';

export interface LeadFilterFormProps {
  data: LeadFilterConfig;
  onChange: (updated: LeadFilterConfig) => void;
}

// 🧠 Mental Model: Form cấu hình Phân Khu 2 - Lead Magnet Hub (Bộ Lọc Nhanh).
// Cho phép saler cấu hình tiêu đề và quản lý các mốc ngân sách tìm kiếm nhanh cho khách hàng.
export const LeadFilterForm: React.FC<LeadFilterFormProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6 pt-4 border-t border-slate-800/80">
      <div>
        <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Tiêu Đề Khối Bộ Lọc (Headline)
        </Label>
        <Input
          type="text"
          value={data.headline}
          onChange={(e) => onChange({ ...data, headline: e.target.value })}
          placeholder="Tìm Kiếm Nhanh Chiếc Xe Ưng Ý Của Bạn"
          className="w-full h-11 bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 text-sm focus-visible:ring-[#0072CE]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Các mốc ngân sách gợi ý */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
          <h4 className="text-sm font-semibold text-white">Các Mốc Ngân Sách Gợi Ý</h4>
          <p className="text-xs text-slate-400">Khách hàng có thể bấm nhanh 1 chạm để lọc xe theo khả năng tài chính:</p>
          <div className="space-y-2">
            {data.priceRanges.map((pr, idx) => (
              <div key={pr.id || idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="font-medium text-white">{pr.label}</span>
                <span className="text-slate-400">
                  {pr.min === null ? `Dưới ${(pr.max || 0) / 1_000_000}tr` : pr.max === null ? `Trên ${(pr.min || 0) / 1_000_000}tr` : `${pr.min / 1_000_000} - ${pr.max / 1_000_000}tr`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kiểu dáng xe hỗ trợ */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
          <h4 className="text-sm font-semibold text-white">Kiểu Dáng Xe Phân Khúc</h4>
          <p className="text-xs text-slate-400">Các tab kiểu dáng xe hiển thị để khách hàng chọn nhanh:</p>
          <div className="space-y-2">
            {data.bodyStyles.map((bs, idx) => (
              <div key={bs.id || idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="font-medium text-white">{bs.label}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[#0072CE] font-mono text-[11px] uppercase">
                  {bs.segment}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
