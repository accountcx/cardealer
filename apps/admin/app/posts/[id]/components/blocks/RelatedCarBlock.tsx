'use client';

// 🧠 Mental Model: Khối Giới Thiệu Mẫu Xe Liên Quan (RelatedCarBlock).
// Tích hợp trực tiếp với kho xe hệ thống (CarSummary) từ catalog.service.
// Tự động điền slug, giá khởi điểm, số chỗ ngồi, động cơ và ảnh đại diện xe khi chọn.

import React from 'react';
import { Car, Sparkles } from 'lucide-react';
import { Input, Select } from '@cardealer/ui';
import type { CarSummary } from '../../../../../services/catalog.service';
import type { EditorBlock } from '../../types';

export interface RelatedCarBlockProps {
  block: EditorBlock;
  availableCars: CarSummary[];
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function RelatedCarBlock({ block, availableCars, onUpdate }: RelatedCarBlockProps) {
  return (
    <div className="space-y-3.5 p-4 bg-sky-500/5 rounded-xl border border-sky-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
          <Car size={14} /> Khối Giới Thiệu Mẫu Xe Liên Quan (Related Car)
        </label>
        {block.carName && (
          <span className="text-[11px] font-medium text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1 w-fit">
            <Sparkles size={11} className="text-sky-400" />
            Đang liên kết: <strong className="text-white">{block.carName}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cột 1: Tên dòng xe kèm Dropdown chọn trực tiếp từ kho xe */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-300">Tên dòng xe *</label>
          <Select
            variant="dark"
            placeholder="-- Chọn xe từ kho hệ thống --"
            value={availableCars.find((c) => c.slug === block.carSlug)?.id || ''}
            onChange={(e) => {
              const selectedCar = availableCars.find((c) => c.id === e.target.value);
              if (selectedCar) {
                const firstVer = selectedCar.versions?.[0];
                const seatVal =
                  typeof selectedCar.seatRange === 'string' &&
                  selectedCar.seatRange.includes('chỗ')
                    ? parseInt(selectedCar.seatRange, 10) || 5
                    : firstVer?.seatCount || 5;
                onUpdate({
                  carName: selectedCar.tenXe,
                  carSlug: selectedCar.slug,
                  carPrice:
                    selectedCar.minPrice ||
                    firstVer?.giaKhuyenMai ||
                    firstVer?.giaNiemYet ||
                    0,
                  carImage: selectedCar.anhDaiDienUrl || firstVer?.anhDaiDienUrl || '',
                  seatCount: seatVal,
                  fuelType: selectedCar.fuelType || firstVer?.dongCo || 'Xăng',
                });
              }
            }}
            options={availableCars.map((c) => ({
              value: c.id,
              label: `${c.tenXe} • Từ ${(c.minPrice || 0).toLocaleString('vi-VN')} đ`,
            }))}
            className="h-8 bg-slate-950 border-white/10 text-slate-100 text-xs font-medium"
          />
          <Input
            value={block.carName || ''}
            onChange={(e) => onUpdate({ carName: e.target.value })}
            placeholder="Hoặc chỉnh sửa tên xe..."
            className="h-7 bg-slate-950/60 border-white/10 text-slate-200 text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Slug đường dẫn xe</label>
          <Input
            value={block.carSlug || ''}
            onChange={(e) => onUpdate({ carSlug: e.target.value })}
            placeholder="e.g. hyundai-accent"
            className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Giá niêm yết từ (VNĐ)</label>
          <Input
            type="number"
            value={block.carPrice || ''}
            onChange={(e) => onUpdate({ carPrice: Number(e.target.value) || 0 })}
            placeholder="e.g. 439000000"
            className="h-8 bg-slate-900 border-white/10 text-red-400 text-xs font-mono font-bold"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] text-slate-400 mb-1">
            Đường dẫn ảnh đại diện xe
          </label>
          <div className="flex items-center gap-2">
            {block.carImage && (
              <img
                src={block.carImage}
                alt={block.carName || 'Xe'}
                className="w-9 h-8 object-cover rounded border border-white/10 shrink-0 bg-slate-950"
              />
            )}
            <Input
              value={block.carImage || ''}
              onChange={(e) => onUpdate({ carImage: e.target.value })}
              placeholder="e.g. /images/cars/accent.webp"
              className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs flex-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Số chỗ</label>
            <Input
              type="number"
              value={block.seatCount || 5}
              onChange={(e) => onUpdate({ seatCount: Number(e.target.value) || 5 })}
              placeholder="5"
              className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Động cơ</label>
            <Input
              value={block.fuelType || ''}
              onChange={(e) => onUpdate({ fuelType: e.target.value })}
              placeholder="Xăng 1.5L"
              className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
