'use client';

// 🧠 Mental Model: Dòng dữ liệu phiên bản xe trong Bảng giá lăn bánh (PriceTableRow).
// Quản lý thứ tự di chuyển lên/xuống, chọn phiên bản từ catalog, nhập giá niêm yết, ưu đãi và hiển thị giá lăn bánh tạm tính.

import React from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { PriceVersionItem } from '../../types';
import type { CarSummary } from '../../../../../services/catalog.service';
import { formatVnd, parseVnd, toShortMillion } from '../../utils';

export interface VersionOptionItem {
  carId: string;
  carName: string;
  value: string;
  label: string;
  fullLabel: string;
  listedPrice: number;
  discount: number;
  rollingPrice: number;
}

export interface PriceTableRowProps {
  priceItem: PriceVersionItem;
  pIdx: number;
  totalPrices: number;
  currentCarFilter: string;
  availableCars: CarSummary[];
  filteredVersions: VersionOptionItem[];
  allVersionOptions: VersionOptionItem[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onUpdate: (updated: Partial<PriceVersionItem>) => void;
}

export function PriceTableRow({
  priceItem,
  pIdx,
  totalPrices,
  currentCarFilter,
  availableCars,
  filteredVersions,
  allVersionOptions,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdate,
}: PriceTableRowProps) {
  const promoPrice = Math.max(0, (priceItem.listedPrice || 0) - (priceItem.discount || 0));
  const autoRollingPrice = priceItem.rollingPrice || Math.round(promoPrice * 1.1 + 3500000);

  return (
    <tr className="hover:bg-slate-900/40 transition-colors group/row">
      {/* Cột 1: Thứ tự & Reorder Up / Down */}
      <td className="py-2 px-2 sticky left-0 z-10 bg-slate-950 border-r border-white/10 text-center">
        <div className="flex items-center justify-center gap-1 text-slate-500">
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={pIdx === 0}
              onClick={onMoveUp}
              className="h-5 w-5 hover:text-blue-300 disabled:opacity-20 transition-colors p-0"
              title="Di chuyển lên"
            >
              <ChevronUp size={12} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={pIdx === totalPrices - 1}
              onClick={onMoveDown}
              className="h-5 w-5 hover:text-blue-300 disabled:opacity-20 transition-colors p-0"
              title="Di chuyển xuống"
            >
              <ChevronDown size={12} />
            </Button>
          </div>
          <span className="font-mono text-[11px] font-semibold text-slate-400">#{pIdx + 1}</span>
        </div>
      </td>

      {/* Cột 2: Dropdown chọn bản xe */}
      <td className="py-2 px-2.5 border-r border-white/10">
        <select
          value={
            filteredVersions.find(
              (opt) => opt.fullLabel === priceItem.version || opt.value === priceItem.version
            )?.value || ''
          }
          onChange={(e) => {
            const found = allVersionOptions.find((opt) => opt.value === e.target.value);
            if (found) {
              onUpdate({
                version: found.fullLabel,
                listedPrice: found.listedPrice,
                discount: found.discount,
                rollingPrice: found.rollingPrice,
              });
            }
          }}
          className="h-8 w-full bg-slate-900 border border-white/10 rounded px-2 text-xs text-white font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
        >
          <option value="">-- Chọn phiên bản xe --</option>
          {currentCarFilter === 'all' ? (
            availableCars.map((c) => (
              <optgroup key={c.id} label={`Dòng xe ${c.tenXe}`}>
                {(c.versions || []).map((v) => {
                  const cleanVer = v.tenPhienBan.toLowerCase().startsWith(c.tenXe.toLowerCase())
                    ? v.tenPhienBan
                    : `${c.tenXe} ${v.tenPhienBan}`;
                  return (
                    <option key={v.id} value={`${c.id}::${v.id}`}>
                      {cleanVer}
                    </option>
                  );
                })}
              </optgroup>
            ))
          ) : (
            filteredVersions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          )}
        </select>
      </td>

      {/* Cột 3: Giá niêm yết */}
      <td className="py-2 px-2.5 border-r border-white/10">
        <div className="space-y-0.5">
          <input
            type="text"
            value={formatVnd(priceItem.listedPrice)}
            onChange={(e) => {
              const val = parseVnd(e.target.value);
              const promo = Math.max(0, val - (priceItem.discount || 0));
              onUpdate({
                listedPrice: val,
                rollingPrice: Math.round(promo * 1.1 + 3500000),
              });
            }}
            placeholder="0"
            className="h-8 w-full bg-slate-900 border border-white/10 rounded px-2.5 text-xs text-slate-100 font-mono font-medium focus:outline-none focus:border-blue-400 focus:bg-slate-800 transition-colors"
          />
          {priceItem.listedPrice > 0 && (
            <span className="text-[10px] text-blue-300 font-mono block pl-1">
              ≈ {toShortMillion(priceItem.listedPrice)}
            </span>
          )}
        </div>
      </td>

      {/* Cột 4: Ưu đãi giảm giá */}
      <td className="py-2 px-2.5 border-r border-white/10">
        <div className="space-y-0.5">
          <input
            type="text"
            value={formatVnd(priceItem.discount)}
            onChange={(e) => {
              const val = parseVnd(e.target.value);
              const promo = Math.max(0, (priceItem.listedPrice || 0) - val);
              onUpdate({
                discount: val,
                rollingPrice: Math.round(promo * 1.1 + 3500000),
              });
            }}
            placeholder="0"
            className="h-8 w-full bg-slate-900 border border-white/10 rounded px-2.5 text-xs text-emerald-400 font-mono font-medium focus:outline-none focus:border-emerald-400 focus:bg-slate-800 transition-colors"
          />
          {priceItem.discount > 0 && (
            <span className="text-[10px] text-emerald-400 font-mono block pl-1">
              ≈ {toShortMillion(priceItem.discount)}
            </span>
          )}
        </div>
      </td>

      {/* Cột 5: Giá lăn bánh tạm tính (Read only) */}
      <td className="py-2 px-2.5 border-r border-white/10">
        <div className="space-y-0.5">
          <input
            type="text"
            readOnly
            value={formatVnd(autoRollingPrice)}
            placeholder="0"
            className="h-8 w-full bg-slate-950/70 border border-white/5 rounded px-2.5 text-xs text-cyan-300 font-mono font-bold cursor-not-allowed select-none"
            title="Giá lăn bánh tạm tính được hệ thống tự động khóa và tính toán theo thuế trước bạ 10% + 3.500.000đ"
          />
          {autoRollingPrice > 0 && (
            <span className="text-[10px] text-cyan-400/80 font-mono block pl-1">
              ≈ {toShortMillion(autoRollingPrice)} (Tự tính)
            </span>
          )}
        </div>
      </td>

      {/* Cột 6: Xóa dòng */}
      <td className="py-2 px-2 text-center">
        {totalPrices > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 text-slate-500 hover:text-red-400 p-0"
            title="Xóa phiên bản này"
          >
            <Trash2 size={13} />
          </Button>
        )}
      </td>
    </tr>
  );
}
