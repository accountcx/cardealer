'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { Button } from '@cardealer/ui';
import { formatVNDShort } from '@cardealer/core';
import type { Car } from '@cardealer/types';

export interface CarShowcaseCardProps {
  car: Car;
}

// 🧠 Mental Model: Client Component hiển thị thẻ xe trong Featured Showcase.
// Tích hợp 2 nút hành động: Xem chi tiết (chuyển /xe/[slug]) và Nhận báo giá (mở LeadQuoteModal với context dòng xe).
export const CarShowcaseCard: React.FC<CarShowcaseCardProps> = ({ car }) => {
  const handleOpenModal = () => {
    window.dispatchEvent(
      new CustomEvent('open-lead-modal', {
        detail: { source: 'homepage_featured', carSlug: car.slug },
      })
    );
  };

  // Tính toán khoảng giá từ các phiên bản
  const minPrice =
    car.versions && car.versions.length > 0
      ? Math.min(...car.versions.map((v) => Number(v.giaKhuyenMai || v.giaNiemYet)))
      : (car as any).minPrice || 0;

  const maxPrice =
    car.versions && car.versions.length > 0
      ? Math.max(...car.versions.map((v) => Number(v.giaNiemYet)))
      : (car as any).maxPrice || 0;

  return (
    <div className="group rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Car Image with Segment Badge */}
        <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-slate-50 to-slate-100/90 overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="w-full h-full bg-contain bg-no-repeat bg-center transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
            style={{ backgroundImage: `url(${car.anhDaiDienUrl || '/images/cars/default.webp'})` }}
          />

          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200/80 text-slate-700 text-[11px] font-bold uppercase tracking-wider shadow-sm font-mono z-10">
            {car.segment}
          </div>
        </div>

        {/* Promotion Ribbon Bar (Không bao giờ đè lên badge segment) */}
        {car.promotionSummary && (
          <div className="mx-4 sm:mx-5 -mt-3.5 relative z-10 px-3 py-1 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/25">
            <Tag className="w-3 h-3 shrink-0 text-amber-300" />
            <span className="truncate">{car.promotionSummary}</span>
          </div>
        )}

        {/* Content Body */}
        <div className={`p-5 sm:p-6 space-y-3 sm:space-y-4 ${car.promotionSummary ? 'pt-3 sm:pt-4' : ''}`}>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#002C6C] transition-colors line-clamp-1">
              {car.tenXe}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Giá niêm yết:{' '}
              <span className="font-bold text-slate-800">
                {minPrice > 0 ? (minPrice === maxPrice ? formatVNDShort(minPrice) : `${formatVNDShort(minPrice)} - ${formatVNDShort(maxPrice)}`) : 'Liên hệ đại lý'}
              </span>
            </p>
          </div>

          {/* Mức trả trước từ X triệu */}
          {car.traTruocTu && car.traTruocTu > 0 ? (
            <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-100 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Trả trước chỉ từ:</span>
              <span className="text-sm font-black text-[#002C6C]">
                {formatVNDShort(car.traTruocTu)}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">Hỗ trợ trả góp:</span>
              <span className="text-xs font-bold text-slate-700">Lên đến 85% giá trị xe</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 grid grid-cols-2 gap-2.5">
        <Link
          href={`/xe/${car.slug}`}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200/60"
        >
          <span>Chi Tiết</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Button
          type="button"
          onClick={handleOpenModal}
          className="h-auto flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white text-xs font-bold shadow-md shadow-[#002C6C]/20 transition-all active:scale-[0.98] border-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Báo Giá</span>
        </Button>
      </div>
    </div>
  );
};
