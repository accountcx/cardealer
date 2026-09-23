'use client';

import React from 'react';
import type { CarDetailVersion } from '@cardealer/types';
import { formatVND, formatVNDShort } from '@cardealer/core';
import { CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@cardealer/ui';

interface VersionSelectorProps {
  versions: CarDetailVersion[];
  selectedVersionId: string;
  onSelectVersion: (versionSlug: string) => void;
  onScrollToInstallment?: () => void;
}

/**
 * 🧠 Mental Model: Khối chọn phiên bản xe tương tác (Version Selector).
 * - Hiển thị danh sách các phiên bản sắp xếp theo sortOrder.
 * - Thể hiện giá niêm yết chuẩn và giá khuyến mãi (nếu có).
 * - Tự động tính ước tính trả trước tối thiểu (15% giá xe).
 * - Thể hiện chi tiết cấu hình động cơ / hộp số / hệ dẫn động.
 * - Tối ưu UX Mobile: Quy tắc cắt nửa nút (Cut-off Cue), Gradient Mask và Gợi ý lướt trực quan.
 * - Tích hợp link trượt nhanh xuống khối Dự toán trả góp.
 */
export function VersionSelector({
  versions,
  selectedVersionId,
  onSelectVersion,
  onScrollToInstallment,
}: VersionSelectorProps) {
  if (!versions || versions.length === 0) {
    return null;
  }

  const selectedVer = versions.find((v) => v.id === selectedVersionId) || versions[0];
  const selectedActivePrice = selectedVer ? selectedVer.giaKhuyenMai || selectedVer.giaNiemYet : 0;
  const selectedDownPayment = Math.round(selectedActivePrice * 0.15);
  const selectedHasDiscount = Boolean(
    selectedVer?.giaKhuyenMai && selectedVer.giaKhuyenMai < selectedVer.giaNiemYet
  );

  const n = versions.length;
  const isVerticalCompressed = n >= 7;
  const mobileGridClass =
    n === 3
      ? 'grid grid-cols-3 gap-1.5'
      : n === 1
      ? 'grid grid-cols-1 gap-1.5'
      : 'grid grid-cols-2 gap-1.5'; // N = 2, 4, 5, 6

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
          Chọn phiên bản xe ({versions.length} phiên bản)
        </label>
      </div>

      {/* 📱 1. Mobile Dynamic Grid Layout (Tinh gọn spacing, tối ưu Above-the-fold) */}
      <div className="sm:hidden space-y-1.5">
        {isVerticalCompressed ? (
          <div className="space-y-1.5">
            {versions.map((ver) => {
              const isSelected = ver.id === selectedVersionId;
              const activePrice = ver.giaKhuyenMai || ver.giaNiemYet;
              return (
                <Button
                  key={ver.id}
                  type="button"
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`Phiên bản ${ver.tenPhienBan}, giá ${formatVND(activePrice)}`}
                  variant="ghost"
                  onClick={() => onSelectVersion(ver.slug)}
                  className={`w-full h-auto flex items-center justify-between py-1.5 px-3 rounded-xl border text-xs transition-all duration-150 active:scale-[0.99] ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white font-extrabold shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <span className="truncate">{ver.tenPhienBan}</span>
                  <span className={`font-bold ml-2 shrink-0 ${isSelected ? 'text-blue-100' : 'text-rose-600 font-extrabold'}`}>
                    {formatVNDShort(activePrice)}
                  </span>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className={mobileGridClass}>
            {versions.map((ver, index) => {
              const isSelected = ver.id === selectedVersionId;
              const activePrice = ver.giaKhuyenMai || ver.giaNiemYet;
              const isFullWidthFifth = n === 5 && index === 4;

              return (
                <Button
                  key={ver.id}
                  type="button"
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`Phiên bản ${ver.tenPhienBan}, giá ${formatVND(activePrice)}`}
                  variant="ghost"
                  onClick={() => onSelectVersion(ver.slug)}
                  className={`h-auto flex flex-col justify-center items-center text-center py-1.5 px-2 rounded-xl border transition-all duration-150 active:scale-[0.98] ${
                    isFullWidthFifth ? 'col-span-2' : ''
                  } ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white font-extrabold shadow-xs ring-1 ring-blue-600 hover:bg-blue-700'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  {/* Dòng 1: Tên phiên bản */}
                  <span
                    className={`leading-snug line-clamp-2 ${
                      n === 3 ? 'text-[11px]' : 'text-xs'
                    } ${isSelected ? 'text-white font-extrabold' : 'text-slate-800 font-bold'}`}
                  >
                    {ver.tenPhienBan}
                  </span>
                  {/* Dòng 2: Giá rút gọn dạng triệu "xxx tr" */}
                  <span
                    className={`text-[11px] font-bold mt-0.5 ${
                      isSelected ? 'text-blue-100' : 'text-rose-600 font-extrabold'
                    }`}
                  >
                    {formatVNDShort(activePrice)}
                  </span>
                </Button>
              );
            })}
          </div>
        )}

        {/* 1 dòng tóm tắt thông minh: Mẫu 1 Dạng Chip bấm rõ nét với icon 💳 và nút Xem lịch trả ↓ */}
        {selectedVer && (
          <div className="flex items-center justify-between text-[11px] p-1.5 pl-3 rounded-xl bg-blue-50/70 border border-blue-100/90 text-blue-950 font-medium gap-2">
            <span className="flex items-center gap-1 min-w-0">
              {selectedHasDiscount ? (
                <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold truncate">
                  <Zap className="w-3.5 h-3.5 fill-rose-600 text-rose-600 shrink-0" />
                  <span>Giảm {formatVNDShort(selectedVer.giaNiemYet - (selectedVer.giaKhuyenMai || 0))}</span>
                </span>
              ) : (
                <span className="text-slate-600 truncate font-semibold">
                  Niêm yết: {formatVNDShort(selectedVer.giaNiemYet)}
                </span>
              )}
            </span>

            {onScrollToInstallment ? (
              <button
                type="button"
                onClick={onScrollToInstallment}
                className="inline-flex items-center gap-1.5 bg-white text-blue-700 hover:text-blue-800 hover:bg-blue-50/60 active:scale-95 transition-all cursor-pointer shrink-0 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-blue-200/90 shadow-2xs group whitespace-nowrap"
                aria-label={`Ước tính góp từ ${formatVNDShort(selectedDownPayment)}, xem lịch trả lãi suất`}
              >
                <span className="text-xs leading-none">💳</span>
                <span>Góp từ <strong>{formatVNDShort(selectedDownPayment)}</strong></span>
                <span className="text-slate-300">·</span>
                <span className="text-blue-600 underline underline-offset-2 group-hover:text-blue-800">
                  Xem lịch trả ↓
                </span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white text-slate-700 shrink-0 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-blue-200/90 shadow-2xs whitespace-nowrap">
                <span className="text-xs leading-none">💳</span>
                <span>Góp từ <strong>{formatVNDShort(selectedDownPayment)}</strong></span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 🖥️ 2. Desktop Compact Cards (Siêu gọn, không lặp lại thông số) */}
      <div className="hidden sm:grid grid-cols-1 gap-2">
        {versions.map((ver) => {
          const isSelected = ver.id === selectedVersionId;
          const hasDiscount = Boolean(ver.giaKhuyenMai && ver.giaKhuyenMai < ver.giaNiemYet);
          const activePrice = ver.giaKhuyenMai || ver.giaNiemYet;
          const estimatedDownPayment = Math.round(activePrice * 0.15);

          return (
            <Button
              key={ver.id}
              type="button"
              role="button"
              aria-pressed={isSelected}
              aria-label={`Phiên bản ${ver.tenPhienBan}, giá ${formatVND(activePrice)}${isSelected ? ', đang chọn' : ''}`}
              variant="ghost"
              onClick={() => onSelectVersion(ver.slug)}
              className={`w-full h-auto text-left justify-start items-stretch whitespace-normal py-2.5 px-3.5 rounded-xl border transition-all duration-150 ease-in-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 font-normal ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-1 ring-blue-600 hover:bg-blue-50/80'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="w-full flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-extrabold tracking-tight ${
                        isSelected ? 'text-blue-900' : 'text-slate-900'
                      }`}
                    >
                      {ver.tenPhienBan}
                    </span>
                    {hasDiscount && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        <Zap className="w-2.5 h-2.5" />
                        Giảm {formatVNDShort(ver.giaNiemYet - (ver.giaKhuyenMai || 0))}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>Trả trước:</span>
                    <span className="font-semibold text-slate-700">
                      {formatVNDShort(estimatedDownPayment)} (15%)
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm sm:text-base font-black tracking-tight ${
                      isSelected ? 'text-blue-700' : 'text-slate-900'
                    }`}
                  >
                    {formatVND(activePrice)}
                  </div>
                  {hasDiscount && (
                    <div className="text-[11px] text-slate-400 line-through">
                      {formatVND(ver.giaNiemYet)}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
