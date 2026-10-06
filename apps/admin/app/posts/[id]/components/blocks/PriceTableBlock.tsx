'use client';

// 🧠 Mental Model: Khối Bảng Giá & Chi Phí Lăn Bánh Tham Khảo (PriceTableBlock).
// Thiết kế giao diện Spreadsheet trực quan, hỗ trợ lọc theo dòng xe hoặc toàn bộ danh mục xe.
// Tính năng 1-chạm "Tự động điền giá từ Showroom" để nạp ngay danh sách tất cả phiên bản kèm giá niêm yết, ưu đãi và lăn bánh.

import React from 'react';
import { Table as TableIcon, Car, Plus, Sparkles } from 'lucide-react';
import { Button, Input } from '@cardealer/ui';
import type { CarSummary } from '../../../../../services/catalog.service';
import type { EditorBlock, PriceVersionItem } from '../../types';
import { PriceTableRow, type VersionOptionItem } from './PriceTableRow';

export interface PriceTableBlockProps {
  block: EditorBlock;
  availableCars: CarSummary[];
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function PriceTableBlock({ block, availableCars, onUpdate }: PriceTableBlockProps) {
  // Chuẩn hóa danh sách các phiên bản phục vụ dropdown & auto-fill
  const allVersionOptions: VersionOptionItem[] = React.useMemo(() => {
    return availableCars.flatMap((c) =>
      (c.versions || []).map((v) => {
        const cleanVer = v.tenPhienBan.toLowerCase().startsWith(c.tenXe.toLowerCase())
          ? v.tenPhienBan
          : `${c.tenXe} ${v.tenPhienBan}`;
        const listed = v.giaNiemYet || 0;
        const promo = v.giaKhuyenMai || listed;
        const discount = Math.max(0, listed - promo);
        return {
          carId: c.id,
          carName: c.tenXe,
          value: `${c.id}::${v.id}`,
          label: `${cleanVer} (Niêm yết: ${listed.toLocaleString('vi-VN')} đ)`,
          fullLabel: cleanVer,
          listedPrice: listed,
          discount,
          rollingPrice: Math.round(promo * 1.1 + 3500000),
        };
      })
    );
  }, [availableCars]);

  const currentCarFilter = block.carFilter || 'all';
  const filteredVersions =
    currentCarFilter === 'all'
      ? allVersionOptions
      : allVersionOptions.filter((opt) => opt.carId === currentCarFilter);

  const prices: PriceVersionItem[] =
    block.prices && block.prices.length > 0
      ? block.prices
      : [
          {
            version: 'Hyundai Accent 1.5 AT',
            listedPrice: 489000000,
            discount: 30000000,
            rollingPrice: 512000000,
          },
        ];

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= prices.length) return;
    const nextPrices = [...prices];
    const temp = nextPrices[index];
    nextPrices[index] = nextPrices[targetIndex];
    nextPrices[targetIndex] = temp;
    onUpdate({ prices: nextPrices });
  };

  const handleRemove = (index: number) => {
    const nextPrices = [...prices];
    nextPrices.splice(index, 1);
    onUpdate({ prices: nextPrices });
  };

  const handleUpdateItem = (index: number, updated: Partial<PriceVersionItem>) => {
    const nextPrices = [...prices];
    nextPrices[index] = { ...nextPrices[index], ...updated };
    onUpdate({ prices: nextPrices });
  };

  const handleAddVersion = () => {
    const targetCar =
      currentCarFilter !== 'all'
        ? availableCars.find((c) => c.id === currentCarFilter)
        : availableCars[0];
    const firstVer = targetCar?.versions?.[0];
    const listed = firstVer?.giaNiemYet || 489000000;
    const promo = firstVer?.giaKhuyenMai || listed;
    const discount = Math.max(0, listed - promo);
    const cleanVer = firstVer
      ? firstVer.tenPhienBan.toLowerCase().startsWith(targetCar.tenXe.toLowerCase())
        ? firstVer.tenPhienBan
        : `${targetCar.tenXe} ${firstVer.tenPhienBan}`
      : 'Hyundai Accent 1.5 AT';

    onUpdate({
      prices: [
        ...prices,
        {
          version: cleanVer,
          listedPrice: listed,
          discount,
          rollingPrice: Math.round(promo * 1.1 + 3500000),
        },
      ],
    });
  };

  // Tự động điền tất cả các phiên bản của dòng xe đang chọn (hoặc tất cả các xe)
  const handleAutoFillFromCatalog = () => {
    const targetVersions = filteredVersions.length > 0 ? filteredVersions : allVersionOptions;
    if (targetVersions.length === 0) return;

    const newPrices: PriceVersionItem[] = targetVersions.map((opt) => ({
      version: opt.fullLabel,
      listedPrice: opt.listedPrice,
      discount: opt.discount,
      rollingPrice: opt.rollingPrice,
    }));

    const selectedCar = availableCars.find((c) => c.id === currentCarFilter);
    const updatedTitle =
      !block.title || block.title === 'Bảng Giá Xe Hyundai Mới Nhất'
        ? selectedCar
          ? `Bảng Giá Xe ${selectedCar.tenXe} & Dự Toán Lăn Bánh`
          : 'Bảng Giá & Chi Phí Lăn Bánh Các Dòng Xe Hyundai'
        : block.title;

    onUpdate({
      title: updatedTitle,
      prices: newPrices,
    });
  };

  return (
    <div className="space-y-3.5 p-3.5 bg-blue-500/5 rounded-xl border border-blue-500/20">
      {/* Header bar: Tiêu đề bảng & Bộ lọc dòng xe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-semibold text-blue-400 shrink-0 flex items-center gap-1.5">
            <TableIcon size={14} /> Tiêu đề bảng giá:
          </label>
          <Input
            value={block.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Tiêu đề bảng giá (e.g. Bảng Giá Xe Hyundai Mới Nhất Tại TP. Vinh)..."
            className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs font-bold flex-1 placeholder:text-slate-600"
          />
        </div>

        {/* Bộ lọc theo dòng xe */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Car size={13} className="text-blue-400" /> Dòng xe:
          </label>
          <select
            value={block.carFilter || 'all'}
            onChange={(e) => onUpdate({ carFilter: e.target.value })}
            className="h-8 bg-slate-900 border border-white/10 rounded-lg px-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="all">Tất cả dòng xe ({availableCars.length})</option>
            {availableCars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tenXe} ({(c.versions || []).length} bản)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spreadsheet-like Table Rows */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 shadow-inner scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/95 text-slate-300">
              <th className="py-2.5 px-3 min-w-[70px] font-semibold text-slate-400 text-center sticky left-0 z-20 bg-slate-900 border-r border-white/10">
                Thứ tự
              </th>
              <th className="py-2.5 px-3 min-w-[260px] font-semibold text-blue-300 border-r border-white/10">
                Phiên bản xe *
              </th>
              <th className="py-2.5 px-3 min-w-[170px] font-semibold text-slate-200 border-r border-white/10">
                Giá niêm yết (VNĐ)
              </th>
              <th className="py-2.5 px-3 min-w-[160px] font-semibold text-emerald-400 border-r border-white/10">
                Ưu đãi giảm giá (VNĐ)
              </th>
              <th className="py-2.5 px-3 min-w-[190px] font-semibold text-cyan-300 border-r border-white/10">
                Giá lăn bánh tạm tính (Read only)
              </th>
              <th className="py-2.5 px-2 min-w-[45px] text-center font-semibold text-slate-400">
                Xóa
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {prices.map((priceItem, pIdx) => (
              <PriceTableRow
                key={pIdx}
                priceItem={priceItem}
                pIdx={pIdx}
                totalPrices={prices.length}
                currentCarFilter={currentCarFilter}
                availableCars={availableCars}
                filteredVersions={filteredVersions}
                allVersionOptions={allVersionOptions}
                onMoveUp={() => handleMove(pIdx, 'up')}
                onMoveDown={() => handleMove(pIdx, 'down')}
                onRemove={() => handleRemove(pIdx)}
                onUpdate={(updated) => handleUpdateItem(pIdx, updated)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddVersion}
            className="h-8 text-xs text-blue-300 hover:text-blue-200 border-blue-500/30 flex items-center gap-1.5 self-start"
          >
            <Plus size={13} /> Thêm phiên bản
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAutoFillFromCatalog}
            className="h-8 text-xs text-cyan-300 hover:text-cyan-100 bg-cyan-950/40 border-cyan-500/30 hover:bg-cyan-900/50 flex items-center gap-1.5 self-start"
            title="Tự động nạp danh sách phiên bản và giá niêm yết từ cơ sở dữ liệu showroom"
          >
            <Sparkles size={13} className="text-cyan-400" /> Tự động điền giá từ Showroom ({filteredVersions.length} bản)
          </Button>
        </div>

        <span className="text-[11px] text-slate-500 italic">
          💡 Giá lăn bánh tạm tính được khóa (Read-only) và tự động tính theo công thức: (Niêm yết -
          Giảm giá) × 1.10 + 3.500.000đ.
        </span>
      </div>
    </div>
  );
}
