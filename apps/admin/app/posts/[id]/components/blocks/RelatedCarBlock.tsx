'use client';

// 🧠 Mental Model: Khối Giới Thiệu Mẫu Xe Liên Quan (RelatedCarBlock).
// Tích hợp trực tiếp với kho xe hệ thống (CarSummary) từ catalog.service.
// Tự động nạp, đồng bộ và hiển thị trực quan thông tin mẫu xe liên kết (tên xe, slug, giá bán, ảnh đại diện, số chỗ, động cơ).
// Hỗ trợ nạp 1-chạm từ Showroom và chọn ảnh từ Thư viện Media tập trung.

import React, { useState, useEffect } from 'react';
import {
  Car,
  Sparkles,
  Image as ImageIcon,
  RotateCw,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Select } from '@cardealer/ui';
import type { CarSummary } from '../../../../../services/catalog.service';
import type { EditorBlock } from '../../types';

export interface RelatedCarBlockProps {
  block: EditorBlock;
  availableCars: CarSummary[];
  onUpdate: (updates: Partial<EditorBlock>) => void;
  onOpenMediaPicker?: () => void;
}

export function RelatedCarBlock({
  block,
  availableCars,
  onUpdate,
  onOpenMediaPicker,
}: RelatedCarBlockProps) {
  const [showAdvancedEdit, setShowAdvancedEdit] = useState(false);

  // Tìm mẫu xe tương ứng trong kho dữ liệu catalog
  const matchedCar = React.useMemo(() => {
    if (!availableCars || availableCars.length === 0) return undefined;
    return availableCars.find(
      (c) =>
        (block.carSlug && (c.slug === block.carSlug || c.slug.includes(block.carSlug) || block.carSlug.includes(c.slug))) ||
        (block.carName && (c.tenXe.toLowerCase().includes(block.carName.toLowerCase()) || block.carName.toLowerCase().includes(c.tenXe.toLowerCase())))
    );
  }, [availableCars, block.carSlug, block.carName]);

  // Hàm áp dụng toàn bộ thông tin từ dòng xe được chọn
  const applyCarData = (car: CarSummary) => {
    const firstVer = car.versions?.[0];
    const seatVal =
      typeof car.seatRange === 'string' && car.seatRange.includes('chỗ')
        ? parseInt(car.seatRange, 10) || 5
        : firstVer?.seatCount || 5;

    const minPrice =
      car.minPrice ||
      firstVer?.giaKhuyenMai ||
      firstVer?.giaNiemYet ||
      0;

    const carImage =
      car.anhDaiDienUrl ||
      car.versions?.find((v) => v.anhDaiDienUrl)?.anhDaiDienUrl ||
      firstVer?.anhDaiDienUrl ||
      '';

    const fuelType = car.fuelType || firstVer?.dongCo || 'Xăng';

    onUpdate({
      carName: car.tenXe,
      carSlug: car.slug,
      carPrice: minPrice,
      carImage,
      seatCount: seatVal,
      fuelType,
    });
  };

  // Tự động đồng bộ ảnh đại diện nếu block chưa có ảnh nhưng kho xe có sẵn ảnh
  useEffect(() => {
    if (matchedCar && !block.carImage) {
      const bestImage =
        matchedCar.anhDaiDienUrl ||
        matchedCar.versions?.find((v) => v.anhDaiDienUrl)?.anhDaiDienUrl ||
        matchedCar.versions?.[0]?.anhDaiDienUrl ||
        '';
      if (bestImage) {
        onUpdate({ carImage: bestImage });
      }
    }
  }, [matchedCar, block.carImage, onUpdate]);

  const activeImage =
    block.carImage ||
    matchedCar?.anhDaiDienUrl ||
    matchedCar?.versions?.find((v) => v.anhDaiDienUrl)?.anhDaiDienUrl ||
    matchedCar?.versions?.[0]?.anhDaiDienUrl ||
    '';

  const formattedPrice =
    typeof block.carPrice === 'number' && block.carPrice > 0
      ? `${block.carPrice.toLocaleString('vi-VN')} đ`
      : matchedCar && matchedCar.minPrice > 0
      ? `${matchedCar.minPrice.toLocaleString('vi-VN')} đ`
      : 'Liên hệ đại lý';

  const currentCarId = matchedCar?.id || '';

  return (
    <div className="space-y-4 p-4 md:p-5 bg-gradient-to-br from-sky-950/30 via-slate-900/60 to-slate-900/80 rounded-2xl border border-sky-500/30 shadow-lg">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Car size={16} />
          </div>
          <div>
            <label className="text-xs font-bold text-sky-300 uppercase tracking-wider">
              Khối Giới Thiệu Mẫu Xe Liên Quan (Related Car)
            </label>
            <p className="text-[11px] text-slate-400">
              Liên kết với kho xe Showroom để điều hướng người đọc sang trang đặt xe.
            </p>
          </div>
        </div>

        {block.carName && (
          <span className="text-[11px] font-medium text-sky-300 bg-sky-500/15 px-2.5 py-1 rounded-full border border-sky-500/30 flex items-center gap-1.5 w-fit">
            <Sparkles size={12} className="text-sky-400" />
            Đang liên kết: <strong className="text-white">{block.carName}</strong>
          </span>
        )}
      </div>

      {/* Selector: Chọn mẫu xe từ kho Showroom (Responsive Flex Layout) */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-slate-200">
          Chọn mẫu xe từ kho dữ liệu Showroom *
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 min-w-0">
            <Select
              variant="dark"
              placeholder="-- Chọn xe trong kho Showroom để tự động lấy thông tin --"
              value={currentCarId}
              onChange={(e) => {
                const selected = availableCars.find((c) => c.id === e.target.value);
                if (selected) {
                  applyCarData(selected);
                }
              }}
              options={availableCars.map((c) => ({
                value: c.id,
                label: `${c.tenXe} • Giá từ ${(c.minPrice || 0).toLocaleString('vi-VN')} đ`,
              }))}
              className="h-9 w-full bg-slate-950 border-sky-500/30 text-slate-100 text-xs font-medium focus:border-sky-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {matchedCar && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyCarData(matchedCar)}
                className="h-9 text-xs whitespace-nowrap flex items-center justify-center gap-1.5 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300"
                title="Đồng bộ lại thông tin giá, ảnh, thông số mới nhất từ Showroom"
              >
                <RotateCw size={13} />
                <span>Đồng bộ Showroom</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedEdit((prev) => !prev)}
              className="h-9 text-xs whitespace-nowrap px-3 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10"
              title="Tùy chỉnh thông số chi tiết"
            >
              <SlidersHorizontal size={13} className="mr-1.5 text-sky-400" />
              <span>Tùy chỉnh</span>
              {showAdvancedEdit ? <ChevronUp size={13} className="ml-1" /> : <ChevronDown size={13} className="ml-1" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 🌟 THẺ HIỂN THỊ TRỰC QUAN MẪU XE LIÊN KẾT (Live Display Card) */}
      <div className="rounded-xl border border-sky-500/30 bg-slate-950/80 p-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Ảnh xe */}
          <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden border border-white/15 bg-slate-900 shrink-0 group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={block.carName || 'Ảnh xe'}
                className="w-full h-full object-contain p-1.5 bg-slate-900/90 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-car.webp';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-2 text-center bg-slate-950">
                <Car size={26} className="mb-1 text-slate-600" />
                <span>Chưa có ảnh đại diện</span>
              </div>
            )}

            {onOpenMediaPicker && (
              <button
                type="button"
                onClick={onOpenMediaPicker}
                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold cursor-pointer"
                title="Thay đổi ảnh từ thư viện"
              >
                <ImageIcon size={16} />
                <span>Đổi ảnh Media</span>
              </button>
            )}
          </div>

          {/* Chi tiết thông tin xe */}
          <div className="flex-1 w-full space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 flex items-center gap-1">
                <CheckCircle2 size={11} className="text-sky-400" /> Mẫu xe liên kết Showroom
              </span>
              {block.carSlug && (
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                  <ExternalLink size={11} /> /xe/{block.carSlug}
                </span>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-extrabold text-white">
              {block.carName || matchedCar?.tenXe || 'Chưa đặt tên xe'}
            </h4>

            {/* Thông số nhanh */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                💺 {block.seatCount || 5} chỗ ngồi
              </span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                ⛽ {block.fuelType || matchedCar?.fuelType || 'Xăng'}
              </span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10">
                🏷️ Giá niêm yết từ:{' '}
                <strong className="text-rose-400 font-bold">{formattedPrice}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form tùy biến chi tiết khi bấm nút Tùy Chỉnh */}
      {showAdvancedEdit && (
        <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
            <span>Tùy biến ghi đè thông tin hiển thị (Custom Overrides)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tên dòng xe hiển thị</label>
              <Input
                value={block.carName || ''}
                onChange={(e) => onUpdate({ carName: e.target.value })}
                placeholder="e.g. Hyundai Accent All-New"
                className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Slug đường dẫn xe (/xe/...)</label>
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
                className="h-8 bg-slate-900 border-white/10 text-rose-400 text-xs font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-slate-400 font-medium">
                  Đường dẫn ảnh đại diện xe
                </label>
                {onOpenMediaPicker && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenMediaPicker}
                    className="h-6 text-[11px] px-2 flex items-center gap-1 cursor-pointer border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition-colors"
                  >
                    <ImageIcon size={12} />
                    <span>Thư Viện Ảnh</span>
                  </Button>
                )}
              </div>
              <Input
                value={block.carImage || ''}
                onChange={(e) => onUpdate({ carImage: e.target.value })}
                placeholder="e.g. /images/cars/accent.webp hoặc URL ảnh Cloudinary..."
                className="h-8 bg-slate-900 border-white/10 text-slate-100 text-xs font-mono"
              />
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
      )}
    </div>
  );
}
