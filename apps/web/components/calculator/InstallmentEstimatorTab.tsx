'use client';

// 🧠 Mental Model: Sub-Tab Dự Toán Trả Góp Ngân Hàng theo phương thức Dư Nợ Giảm Dần.
// Chuẩn thiết kế Showroom Hyundai Luxury tương thích 100% với SmartCalculator.
// 1. Kéo Slider % trả trước (15% - 85%) và chọn kỳ hạn vay (3 - 8 năm) linh hoạt.
// 2. Bảng chi tiết gốc & lãi hàng tháng bị LÀM MỜ (blur-sm) khi chưa mở khóa.
// 3. Khách hàng nhập Họ tên & Số điện thoại (10 số) -> Gửi lead về POST /api/leads.
// 4. Sau khi gửi thành công -> Mở khóa bảng tính sắc nét và hiển thị thông báo "Chuyên viên sẽ liên lạc lại ngay".

import { useState } from 'react';
import { calculateInstallment } from '@cardealer/core';
import type { InstallmentCalculationResult } from '@cardealer/types';
import { Label, Button, Input } from '@cardealer/ui';
import { leadsService } from '../../services/leads.service';
import { AppError } from '../../lib/api-client';

interface InstallmentEstimatorTabProps {
  giaXe: number;
  tenXe: string;
  tenPhienBan?: string;
  defaultHotline?: string;
  defaultZaloUrl?: string;
  initialFullName?: string;
  initialPhone?: string;
}

export default function InstallmentEstimatorTab({
  giaXe,
  tenXe,
  tenPhienBan = '',
  defaultHotline = '0941.153.666',
  defaultZaloUrl = 'https://zalo.me/0941153666',
  initialFullName = '',
  initialPhone = '',
}: InstallmentEstimatorTabProps) {
  // Calculation parameters
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // Mặc định trả trước 20%
  const [loanTermYears, setLoanTermYears] = useState<number>(5); // Mặc định 5 năm (60 tháng)
  const annualRate = 7.9; // 7.9%/năm

  // Gate state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>(initialPhone || '');
  const [submittedData, setSubmittedData] = useState<{ fullName?: string; phone: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tính toán số liệu
  const loanPercent = 100 - downPaymentPercent;
  const loanTermMonths = loanTermYears * 12;

  const effectivePrice = giaXe > 0 ? giaXe : 769_000_000;

  const result: InstallmentCalculationResult = calculateInstallment({
    giaXe: effectivePrice,
    tyLeVayPercent: loanPercent,
    thoiHanVayThang: loanTermMonths,
    laiSuatNamPercent: annualRate,
  });

  const handleQuickUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleaned = phone.replace(/^\+84/, '0').replace(/\D/g, '');
    const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!vnPhoneRegex.test(cleaned)) {
      setErrorMsg('Vui lòng nhập đúng số điện thoại di động (10 chữ số bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    setIsSubmitting(true);
    try {
      await leadsService.createLead({
        fullName: initialFullName?.trim() || 'Khách hàng',
        phone: cleaned,
        carModel: tenXe,
        carVersion: tenPhienBan,
        leadType: 'Dự Toán Trả Góp',
        estimatedTotal: effectivePrice,
        notes: `Mở khóa bảng tính trả góp & nhận lịch trả nợ qua Zalo. Vay ${loanPercent}% (${result.soTienVay.toLocaleString('vi-VN')} ₫) trong ${loanTermYears} năm. Gốc lãi tháng đầu: ${result.tongTienThangDau.toLocaleString('vi-VN')} ₫`,
        metadata: {
          downPaymentPercent,
          loanPercent,
          loanTermYears,
          soTienTraTruoc: result.soTienTraTruoc,
          soTienVay: result.soTienVay,
          tienGocHangThang: result.tienGocHangThang,
          tienLaiThangDau: result.tienLaiThangDau,
          tongTienThangDau: result.tongTienThangDau,
        },
      });

      setSubmittedData({ fullName: initialFullName?.trim() || 'Khách hàng', phone: cleaned });
      setIsUnlocked(true);
    } catch (err: unknown) {
      if (err instanceof AppError && err.statusCode === 429) {
        setErrorMsg('Quý khách đã gửi yêu cầu gần đây. Vui lòng chờ 10 phút hoặc gọi trực tiếp Hotline!');
      } else {
        setErrorMsg(
          err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-950/10 border border-slate-200/80 overflow-hidden">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002C6C] to-slate-900 text-white p-4 sm:p-7 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-sky-300 border border-white/15 backdrop-blur-md mb-1.5 sm:mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Lãi Suất Ưu Đãi 7.9%/năm (Cố Định Năm Đầu)
          </div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            Bảng Tính Vay Mua Xe Trả Góp
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Ước tính hạn mức vay tối đa 85% giá trị xe, kỳ hạn linh hoạt từ 1 đến 8 năm theo phương thức dư nợ giảm dần.
          </p>
        </div>
      </div>

      <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Quick Price Snapshot Card (Unified Top Anchor - Identical to Tab 1) */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-blue-200/80 shadow-md shadow-blue-900/5 p-3.5 sm:p-5 transition-all">
          {/* Hyundai Signature Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#002C6C] via-[#0072CE] to-sky-400" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Car & Version info with Hyundai Emblem Badge */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100/90 border border-blue-200 flex items-center justify-center shadow-inner text-[#002C6C] ring-4 ring-blue-50/60 shrink-0">
                <svg className="w-7 h-5" viewBox="0 0 100 60" fill="currentColor">
                  <path d="M50,4.8C25.4,4.8,5.5,16.1,5.5,30c0,13.9,19.9,25.2,44.5,25.2c24.6,0,44.5-11.3,44.5-25.2C94.5,16.1,74.6,4.8,50,4.8z M50,51.8C28.2,51.8,10.6,42,10.6,30c0-12,17.6-21.8,39.4-21.8c21.8,0,39.4,9.8,39.4,21.8C89.4,42,71.8,51.8,50,51.8z" opacity="0.3"/>
                  <path d="M37.5,17.2c-1.8,0-3.3,1.3-3.6,3.1L27.4,45.8c-0.2,1,0.5,2,1.5,2h5.2c1.8,0,3.3-1.3,3.6-3.1l2.4-11.2h19.8l-2.4,11.2c-0.2,1,0.5,2,1.5,2h5.2c1.8,0,3.3-1.3,3.6-3.1l6.5-25.5c0.2-1-0.5-2-1.5-2h-5.2c-1.8,0-3.3,1.3-3.6,3.1l-2.2,10.5H43.9l2.2-10.5c0.2-1-0.5-2-1.5-2H37.5z"/>
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-100/80 text-[#002C6C]">
                    Dòng xe tính trả góp
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  {tenXe}{' '}
                  {tenPhienBan && (
                    <span className="text-[#0072CE] font-bold">
                      — {tenPhienBan}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Listed Price with Sharp Typography & Strong Contrast */}
            <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:flex-col justify-between sm:items-end items-baseline">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Giá xe tính vay
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#002C6C] tracking-tight">
                <span className="tabular-nums">
                  {new Intl.NumberFormat('vi-VN').format(effectivePrice)}
                </span>{' '}
                <span className="text-base font-extrabold text-[#0072CE]">₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sliders & Parameters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-slate-50/70 p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80">
          {/* Slider: Tỷ Lệ Trả Trước */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-col min-[390px]:flex-row min-[390px]:items-center justify-between gap-1.5 min-[390px]:gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Số tiền trả trước:
              </Label>
              <div className="self-end min-[390px]:self-auto inline-flex items-center gap-1.5 bg-blue-50 px-2.5 sm:px-3 py-1 rounded-xl border-2 border-blue-300 shadow-sm whitespace-nowrap">
                <span className="text-xs sm:text-sm font-black text-[#0072CE]">
                  {downPaymentPercent}%
                </span>
                <span className="text-slate-400 font-normal text-xs">•</span>
                <span className="text-xs sm:text-sm font-black text-[#002C6C] tabular-nums">
                  {new Intl.NumberFormat('vi-VN').format(result.soTienTraTruoc)} ₫
                </span>
              </div>
            </div>

            <input
              type="range"
              min={15}
              max={85}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0072CE]"
            />

            <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-0.5">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                15% <span className="font-normal text-[11px] text-slate-400">(Tối thiểu)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                85% <span className="font-normal text-[11px] text-slate-400">(Tối đa)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
              </span>
            </div>
          </div>

          {/* Selector: Thời Hạn Vay */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-col min-[390px]:flex-row min-[390px]:items-center justify-between gap-1.5 min-[390px]:gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Thời hạn vay vốn:
              </Label>
              <div className="self-end min-[390px]:self-auto inline-flex items-center gap-1.5 bg-sky-50 px-2.5 sm:px-3 py-1 rounded-xl border border-sky-200 shadow-sm whitespace-nowrap">
                <span className="text-xs sm:text-sm font-black text-[#0072CE]">
                  {loanTermYears} năm
                </span>
                <span className="text-slate-400 font-normal text-xs">•</span>
                <span className="text-xs sm:text-sm font-bold text-slate-600">
                  {loanTermMonths} tháng
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {[3, 4, 5, 6, 7, 8].map((year) => (
                <Button
                  key={year}
                  type="button"
                  onClick={() => setLoanTermYears(year)}
                  className={`h-auto py-2 sm:py-2.5 px-0 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
                    loanTermYears === year
                      ? 'bg-[#002C6C] text-white border-[#002C6C] shadow-md shadow-blue-950/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {year}N
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Monthly Payment Card with Seamless Lead Action */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#002C6C] via-[#0b1b3a] to-[#00173b] text-white p-4 sm:p-6 shadow-xl border border-blue-400/20">
          <div className="absolute top-0 right-0 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Phần 1: Số tiền ước tính tháng đầu */}
          <div className="text-center relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 text-sky-300 border border-white/15 mb-1.5">
              Ước Tính Gốc + Lãi Tháng Đầu Tiên
            </span>
            <div className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300">
              {new Intl.NumberFormat('vi-VN').format(result.tongTienThangDau)}{' '}
              <span className="text-lg sm:text-2xl font-bold text-sky-400">VNĐ</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Vay <span className="font-bold text-white">{loanPercent}%</span> giá trị xe ({new Intl.NumberFormat('vi-VN').format(result.soTienVay)} ₫) trong {loanTermYears} năm
            </p>
          </div>

          {/* Phần 2: FORM LỒNG TRỰC TIẾP TRONG CARD (KHI CHƯA MỞ KHÓA) */}
          {!isUnlocked ? (
            <div className="relative z-10 mt-4 pt-3.5 border-t border-white/15 max-w-md mx-auto">
              <div className="text-center space-y-1 mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Mở Khóa Lịch Trả Nợ Chi Tiết
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  Nhập số điện thoại để nhận bảng tính gốc lãi chi tiết từng tháng qua Zalo:
                </h3>
              </div>

              {errorMsg && (
                <div className="p-2 mb-2 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <span>⚠️</span> {errorMsg}
                </div>
              )}

              <form onSubmit={handleQuickUnlock} className="space-y-2">
                <div className="relative">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Số điện thoại của Quý khách (có Zalo)..."
                    className="w-full h-11 sm:h-12 bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-300 focus:border-[#0072CE] focus-visible:ring-[#0072CE] rounded-xl text-sm font-bold pl-4 pr-10 shadow-sm"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    📱
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-white rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2 border-0 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <span>Đang gửi thông tin...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5.16-1.31C8.58 21.53 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.57 0-3.04-.45-4.29-1.22l-.31-.19-3.07.78.82-2.97-.2-.33C4.18 14.81 3.75 13.44 3.75 12c0-4.55 3.7-8.25 8.25-8.25s8.25 3.7 8.25 8.25-3.7 8.25-8.25 8.25z"/>
                      </svg>
                      <span>GỬI BẢNG TÍNH QUA ZALO</span>
                    </>
                  )}
                </Button>

                {/* Micro-copy Trust Signals */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-3 text-[11px] text-slate-300 font-medium pt-0.5 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <span>🔒</span> Cam kết bảo mật &amp; Không spam
                  </span>
                  <span className="hidden sm:inline text-slate-400">•</span>
                  <span className="flex items-center justify-center gap-1">
                    <span>⚡</span> Gửi tự động qua Zalo trong 30 giây
                  </span>
                </div>
              </form>
            </div>
          ) : (
            /* Khi đã mở khóa: hiển thị thông báo & nút liên hệ ngay trong card */
            <div className="relative z-10 mt-4 pt-3.5 border-t border-white/15 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold">
                ✓ Đã tiếp nhận yêu cầu gửi bảng tính qua Zalo ({submittedData?.phone || phone})!
              </div>
              <p className="text-xs text-slate-200">Chuyên viên tư vấn trả góp sẽ gửi file chi tiết qua Zalo trong 30 giây.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto pt-1">
                <a
                  href={`tel:${defaultHotline.replace(/\D/g, '')}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white text-xs sm:text-sm bg-white/15 hover:bg-white/25 transition border border-white/20"
                >
                  <span>📞</span> Hotline: {defaultHotline}
                </a>
                <a
                  href={defaultZaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white text-xs sm:text-sm bg-sky-500 hover:bg-sky-400 transition"
                >
                  <span>💬</span> Nhắn Zalo Ngay
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Breakdown Table (NẰM DƯỚI LÀM BẰNG CHỨNG TRỰC QUAN) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold flex items-center gap-1.5 text-slate-700">
              {!isUnlocked ? '🔒 Bảng chi tiết gốc lãi từng tháng (Điền SĐT phía trên để mở khóa):' : '✓ Chi tiết gốc & lãi hàng tháng:'}
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="bg-slate-100/90 px-3.5 sm:px-5 py-2 sm:py-2.5 border-b border-slate-200 flex justify-between items-center text-[11px] sm:text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              <span className="truncate">Hạng mục thanh toán vay</span>
              <span className="shrink-0 text-right">Số tiền ước tính</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                <span className="font-semibold text-slate-600">1. Số tiền vay ngân hàng ({loanPercent}%):</span>
                <span className="font-bold text-slate-900">
                  {new Intl.NumberFormat('vi-VN').format(result.soTienVay)} ₫
                </span>
              </div>

              <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                <span className="font-semibold text-slate-600">• Tiền gốc trả đều hàng tháng:</span>
                <span className={`font-bold text-slate-900 ${!isUnlocked ? 'blur-sm select-none opacity-50' : ''}`}>
                  {new Intl.NumberFormat('vi-VN').format(result.tienGocHangThang)} ₫
                </span>
              </div>

              <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                <span className="font-semibold text-slate-600">• Tiền lãi tháng đầu tiên ({annualRate}%/năm):</span>
                <span className={`font-bold text-slate-900 ${!isUnlocked ? 'blur-sm select-none opacity-50' : ''}`}>
                  {new Intl.NumberFormat('vi-VN').format(result.tienLaiThangDau)} ₫
                </span>
              </div>

              <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center bg-sky-50/60">
                <span className="font-bold text-slate-900 uppercase">Tổng Gốc + Lãi Tháng Đầu:</span>
                <span className={`font-black text-base sm:text-lg text-[#002C6C] ${!isUnlocked ? 'blur-sm select-none opacity-50' : ''}`}>
                  {new Intl.NumberFormat('vi-VN').format(result.tongTienThangDau)} ₫
                </span>
              </div>

              <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                <span className="font-semibold text-slate-600">• Lịch trả nợ từng tháng ({loanTermMonths} tháng):</span>
                <span className={`font-bold text-slate-700 ${!isUnlocked ? 'blur-sm select-none opacity-50' : ''}`}>
                  Dư nợ giảm dần ({loanTermYears} năm)
                </span>
              </div>

              <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                <span className="font-semibold text-slate-600">• Tổng thanh toán toàn bộ kỳ hạn:</span>
                <span className={`font-bold text-slate-700 ${!isUnlocked ? 'blur-sm select-none opacity-50' : ''}`}>
                  Xem chi tiết khi mở khóa
                </span>
              </div>

              <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                <span className="font-semibold text-slate-600">• Tiết kiệm tiền lãi theo gói ưu đãi:</span>
                <span className={`font-bold text-slate-700 ${!isUnlocked ? 'blur-sm select-none opacity-50' : ''}`}>
                  Ưu đãi lãi suất 7.9%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
