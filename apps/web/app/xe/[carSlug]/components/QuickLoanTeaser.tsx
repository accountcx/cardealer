'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculateInstallment, formatVND, formatVNDShort } from '@cardealer/core';
import { Calculator, ArrowRight, DollarSign, Percent, Calendar } from 'lucide-react';
import { Button } from '@cardealer/ui';

interface QuickLoanTeaserProps {
  carPrice: number;
  carSlug: string;
  versionSlug: string;
  carName: string;
  versionName: string;
  calculatorUrl?: string;
}

/**
 * 🧠 Mental Model: Widget tính trả góp nhanh tương tác (QuickLoanTeaser).
 * - Giúp khách hàng nhanh chóng ước lượng số tiền trả trước và số tiền góp tháng.
 * - Cho phép kéo chọn tỷ lệ vay (50% - 85%) và số năm vay (3 năm - 8 năm).
 * - Sử dụng thuật toán Dư Nợ Giảm Dần chính xác từ @cardealer/core.
 * - Điều hướng mượt mà sang trang dự toán chi tiết (/gia-lan-banh?xe=...&phien-ban=...).
 */
export function QuickLoanTeaser({
  carPrice,
  carSlug,
  versionSlug,
  carName,
  versionName,
  calculatorUrl,
}: QuickLoanTeaserProps) {
  const [loanPercent, setLoanPercent] = useState<number>(80);
  const [loanYears, setLoanYears] = useState<number>(5);

  const calculation = useMemo(() => {
    if (!carPrice || carPrice <= 0) return null;
    try {
      return calculateInstallment({
        giaXe: carPrice,
        tyLeVayPercent: loanPercent,
        thoiHanVayThang: loanYears * 12,
        laiSuatNamPercent: 7.9,
      });
    } catch {
      return null;
    }
  }, [carPrice, loanPercent, loanYears]);

  const targetCalculatorUrl =
    calculatorUrl || `/gia-lan-banh?tab=tra-gop&xe=${carSlug}&phien-ban=${versionSlug}`;

  if (!calculation) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Dự Toán Trả Góp Ước Tính
            </h2>
            <p className="text-xs text-slate-500">
              Lãi suất ưu đãi chỉ từ 7.9%/năm • Cố định 12 tháng đầu
            </p>
          </div>
        </div>
      </div>

      {/* Bộ điều khiển nhanh: Tỷ lệ vay & Thời hạn vay (Xếp tầng dọc ngăn tràn viền thẻ) */}
      <div className="space-y-4">
        {/* Chọn tỷ lệ vay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-blue-600" />
              Tỷ lệ vay ngân hàng:
            </span>
            <span className="text-blue-600 font-black">{loanPercent}% giá trị xe</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[50, 70, 80, 85].map((pct) => (
              <Button
                key={pct}
                type="button"
                size="sm"
                variant={loanPercent === pct ? 'default' : 'ghost'}
                onClick={() => setLoanPercent(pct)}
                className={`w-full h-8 sm:h-9 rounded-xl text-xs font-bold transition-all ${
                  loanPercent === pct
                    ? 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border-0'
                }`}
              >
                {pct}%
              </Button>
            ))}
          </div>
        </div>

        {/* Chọn thời gian vay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Thời gian vay:
            </span>
            <span className="text-blue-600 font-black">{loanYears} năm ({loanYears * 12} tháng)</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[3, 5, 7, 8].map((yr) => (
              <Button
                key={yr}
                type="button"
                size="sm"
                variant={loanYears === yr ? 'default' : 'ghost'}
                onClick={() => setLoanYears(yr)}
                className={`w-full h-8 sm:h-9 rounded-xl text-xs font-bold transition-all ${
                  loanYears === yr
                    ? 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border-0'
                }`}
              >
                {yr} năm
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Kết Quả Tính Toán Nhanh */}
      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-100">
        <div>
          <span className="text-[11px] font-medium text-slate-500 block">
            Số tiền trả trước (đối ứng):
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900">
            {formatVNDShort(calculation.soTienTraTruoc)}
          </span>
          <span className="text-[10px] text-slate-400 block">({100 - loanPercent}% giá trị xe)</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-medium text-slate-500 block">
            Góp tháng đầu tiên:
          </span>
          <span className="text-base sm:text-lg font-black text-blue-600">
            {formatVND(calculation.tongTienThangDau)}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            (Dư nợ giảm dần các tháng sau)
          </span>
        </div>
      </div>

      {/* Nút Điều Hướng Sang Trang Bảng Tính Trả Góp Chi Tiết */}
      <Button
        asChild
        size="lg"
        className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 active:scale-[0.99] border-0"
      >
        <Link
          href={targetCalculatorUrl}
          className="inline-flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4 text-amber-400" />
          <span>Xem Bảng Tính Trả Góp Chi Tiết</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
