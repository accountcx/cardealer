'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Fuel, Layers, Tag, ArrowRight, Calculator } from 'lucide-react';
import { formatVNDShort } from '@cardealer/core';
import type { CarCatalogItem } from '@cardealer/types';
import { Button, Skeleton } from '@cardealer/ui';

export interface SmartCarCardProps {
  car: CarCatalogItem;
}

// 🧠 Mental Model: Skeleton loader cho Thẻ xe SmartCarCard theo đúng tỷ lệ 16:9.
// Triệt tiêu giật layout (CLS), chuẩn hóa phân tầng Giá bán to rõ và 2 nút CTA Khối.
export const SmartCarCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="rounded-3xl bg-white border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm animate-pulse motion-reduce:animate-none"
    >
      <div>
        {/* Khung ảnh xe tỷ lệ 16:9 */}
        <div className="w-full aspect-[16/9] bg-slate-100 relative p-3 flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-2xl bg-slate-200/70" />
          <Skeleton className="absolute top-3 right-3 w-16 h-6 rounded-full bg-slate-300/80" />
        </div>

        {/* Thân thẻ xe skeleton */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-3/4 rounded-md bg-slate-200/80" />
            <Skeleton className="h-3 w-20 rounded bg-slate-200/60" />
            <Skeleton className="h-7 w-1/2 rounded-md bg-slate-200/80" />
          </div>

          {/* Quick specs skeleton */}
          <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <Skeleton className="h-4 w-full rounded bg-slate-200/60" />
            <Skeleton className="h-4 w-full rounded bg-slate-200/60" />
            <Skeleton className="h-4 w-full rounded bg-slate-200/60" />
          </div>

          {/* Trả trước thanh mảnh */}
          <Skeleton className="h-9 w-full rounded-xl bg-slate-100" />
        </div>
      </div>

      {/* 2 nút CTA skeleton */}
      <div className="p-5 sm:p-6 pt-0 grid grid-cols-2 gap-2.5">
        <Skeleton className="h-11 w-full rounded-xl bg-slate-200/70" />
        <Skeleton className="h-11 w-full rounded-xl bg-slate-200/70" />
      </div>
    </div>
  );
};

// 🧠 Mental Model: Component Thẻ Xe Thông Minh Showroom (Smart Car Card v2.2).
// 1. Khắc phục tỷ lệ ảnh xe: Tỷ lệ chuẩn 16:9, xe to rõ chiếm 75-80% diện tích, tôn dáng sản phẩm.
// 2. Tag phân khúc tối giản cao cấp: Pill bán trong suốt nền tối gắn bên trong góc trên ảnh xe.
// 3. Xử lý thanh ưu đãi màu đỏ: Hỗ trợ xuống dòng mềm mại (2 dòng), không bao giờ bị cắt cụt ba chấm.
// 4. Phân cấp thông tin rõ rệt: Tên xe nổi bật, Giá niêm yết chữ TO ĐẬM (20-24px) màu Navy chủ đạo, hộp trả trước thanh mảnh.
// 5. Thiết kế lại 2 nút CTA: Nút phụ "Dự toán Lăn Bánh" (viền sang) & Nút chính "Xem Chi Tiết" (khối xanh đậm Hyundai) với chuẩn Touch Target h-11.
export const SmartCarCard: React.FC<SmartCarCardProps> = ({ car }) => {
  // Tính toán khoảng giá hiển thị
  const minPrice = Number(car.minPrice || 0);
  const maxPrice = Number(car.maxPrice || 0);

  const priceDisplay =
    minPrice > 0
      ? minPrice === maxPrice
        ? formatVNDShort(minPrice)
        : `${formatVNDShort(minPrice)} - ${formatVNDShort(maxPrice)}`
      : 'Liên hệ đại lý';

  const fuelDisplay = car.fuelType || 'Xăng / Dầu';
  const seatDisplay = car.seatRange || '5 chỗ';
  const versionDisplay =
    car.versionCount && car.versionCount > 0
      ? `${car.versionCount} phiên bản`
      : 'Đa phiên bản';

  return (
    <article
      aria-label={`Dòng xe ${car.tenXe}`}
      className="group rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80 flex flex-col justify-between overflow-hidden motion-reduce:transition-none"
    >
      <div>
        {/* 1. Vùng Ảnh Xe Showroom Tỷ Lệ 16:9: Chiếc xe to rõ, chiếm 75% - 80% diện tích */}
        <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-slate-50 to-slate-100/70 overflow-hidden flex items-center justify-center p-2 sm:p-2.5">
          <Link
            href={`/xe/${car.slug}`}
            className="w-full h-full block focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none rounded-2xl overflow-hidden"
            tabIndex={-1}
            aria-hidden="true"
          >
            <div
              className="w-full h-full bg-contain bg-no-repeat bg-center transition-transform duration-500 group-hover:scale-105 drop-shadow-md motion-reduce:transition-none motion-reduce:transform-none"
              style={{ backgroundImage: `url(${car.anhDaiDienUrl || '/images/cars/default.webp'})` }}
            />
          </Link>

          {/* 5. Tag phân khúc bán trong suốt gắn bên trong góc trên ảnh xe */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-white text-xs font-bold uppercase tracking-wider shadow-md font-mono z-10">
            {car.segment}
          </div>
        </div>

        {/* 2. Ruy-băng Khuyến mãi: Cho phép xuống 2 dòng mềm mại, không bị cắt cụt đuôi */}
        {car.promotionSummary && (
          <div className="mx-4 sm:mx-5 -mt-3 relative z-10 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold flex items-start gap-1.5 shadow-md shadow-red-600/25">
            <Tag className="w-3.5 h-3.5 shrink-0 text-amber-300 mt-0.5" aria-hidden="true" />
            <span className="line-clamp-2 leading-snug">{car.promotionSummary}</span>
          </div>
        )}

        {/* 3. Nội dung Thân Card */}
        <div className={`p-5 sm:p-6 space-y-3.5 sm:space-y-4 ${car.promotionSummary ? 'pt-3 sm:pt-4' : ''}`}>
          {/* Tên xe & Giá niêm yết TO ĐẬM */}
          <div className="space-y-1">
            <Link
              href={`/xe/${car.slug}`}
              className="group-hover:text-[#0072CE] transition-colors focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none rounded block"
            >
              <h3 className="text-lg sm:text-xl font-black text-slate-900 line-clamp-1 tracking-tight">
                {car.tenXe}
              </h3>
            </Link>

            {/* Dòng giá niêm yết to rõ - Thông tin tìm kiếm cốt lõi */}
            <div className="pt-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Giá niêm yết
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#002C6C] tracking-tight block">
                {priceDisplay}
              </span>
            </div>
          </div>

          {/* 4. Quick Specs Pills: Chỗ ngồi, Nhiên liệu, Số phiên bản */}
          <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 text-xs">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate font-medium">{seatDisplay}</span>
            </div>
            <div className="flex items-center justify-center gap-1 border-x border-slate-200/80 px-1">
              <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate font-medium">{fuelDisplay}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate font-medium">{versionDisplay}</span>
            </div>
          </div>

          {/* Huy hiệu Trả trước Tối thiểu: Thiết kế thanh mảnh, không tranh chấp giá chính */}
          {car.traTruocTu && car.traTruocTu > 0 ? (
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-sky-50/70 border border-sky-100/80 text-xs">
              <span className="text-slate-500 font-medium">Trả trước chỉ từ:</span>
              <span className="font-extrabold text-[#002C6C]">
                {formatVNDShort(car.traTruocTu)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-150 text-xs">
              <span className="text-slate-500 font-medium">Hỗ trợ trả góp:</span>
              <span className="font-bold text-slate-700">Đến 85% giá trị xe</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Ranh giới rõ ràng cho 2 nút CTA: Nút phụ Viền & Nút chính Khối Xanh Đậm */}
      <div className="p-5 sm:p-6 pt-0 grid grid-cols-2 gap-2.5">
        {/* Nút Phụ (Secondary CTA): Dự toán Lăn Bánh */}
        <Button
          asChild
          variant="outline"
          className="h-11 px-3 rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all active:scale-95 motion-reduce:transition-none motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Link href={`/gia-lan-banh?xe=${car.slug}`}>
            <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dự Toán Lăn Bánh</span>
          </Link>
        </Button>

        {/* Nút Chính (Primary CTA): Xem Chi Tiết Dòng Xe */}
        <Button
          asChild
          variant="default"
          glow
          className="h-11 px-3 rounded-xl bg-[#002C6C] hover:bg-[#001D47] text-white text-xs font-bold transition-all shadow-md shadow-[#002C6C]/25 hover:shadow-[#002C6C]/40 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Link href={`/xe/${car.slug}`}>
            <span>Xem Chi Tiết</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
};
