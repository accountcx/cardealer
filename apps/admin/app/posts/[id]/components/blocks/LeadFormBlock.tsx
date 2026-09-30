'use client';

// 🧠 Mental Model: Khối Form Thu Thập Báo Giá Lăn Bánh Nhanh (LeadFormBlock).
// Tích hợp chọn dòng xe áp dụng từ Catalog hệ thống (CarSummary).
// Quản lý tiêu đề, mô tả cam kết phản hồi nhanh và nút kêu gọi gửi thông tin.

import React from 'react';
import { Send } from 'lucide-react';
import { Input, Select, Textarea } from '@cardealer/ui';
import type { CarSummary } from '../../../../../services/catalog.service';
import type { EditorBlock } from '../../types';

export interface LeadFormBlockProps {
  block: EditorBlock;
  availableCars: CarSummary[];
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function LeadFormBlock({ block, availableCars, onUpdate }: LeadFormBlockProps) {
  return (
    <div className="space-y-3 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
      <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
        <Send size={14} /> Khối Form Nhận Báo Giá Lăn Bánh Nhanh (Inline Lead Form)
      </label>
      <div className="space-y-2.5">
        {/* Chọn nhanh dòng xe quan tâm */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-indigo-500/30">
          <label className="block text-[11px] font-semibold text-indigo-300 mb-1">
            Chọn dòng xe áp dụng cho Form báo giá:
          </label>
          <Select
            variant="dark"
            placeholder="-- Chọn dòng xe áp dụng --"
            value={availableCars.find((c) => c.tenXe === block.carName)?.id || ''}
            onChange={(e) => {
              const selectedCar = availableCars.find((c) => c.id === e.target.value);
              if (selectedCar) {
                onUpdate({ carName: selectedCar.tenXe });
              }
            }}
            options={availableCars.map((c) => ({
              value: c.id,
              label: c.tenXe,
            }))}
            className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs"
          />
        </div>

        <Input
          value={block.formHeadline || ''}
          onChange={(e) => onUpdate({ formHeadline: e.target.value })}
          placeholder="Tiêu đề Form (e.g. Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay)..."
          className="h-9 bg-slate-900 border-white/10 text-slate-100 text-xs font-bold"
        />
        <Textarea
          rows={2}
          value={block.formSubheadline || ''}
          onChange={(e) => onUpdate({ formSubheadline: e.target.value })}
          placeholder="Mô tả phụ cam kết tư vấn nhanh..."
          className="bg-slate-900 border-white/10 text-slate-200 text-xs min-h-[50px]"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            value={block.carName || ''}
            onChange={(e) => onUpdate({ carName: e.target.value })}
            placeholder="Dòng xe áp dụng (e.g. Hyundai Accent / Creta)..."
            className="h-9 bg-slate-900 border-white/10 text-slate-100 text-xs"
          />
          <Input
            value={block.formButtonText || ''}
            onChange={(e) => onUpdate({ formButtonText: e.target.value })}
            placeholder="Chữ trên nút (e.g. Gửi Báo Giá Ngay)..."
            className="h-9 bg-slate-900 border-white/10 text-slate-100 text-xs font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
