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
  const [fullName, setFullName] = useState<string>(initialFullName);
  const [phone, setPhone] = useState<string>(initialPhone);
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

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Họ và tên phải có ít nhất 2 ký tự');
      return;
    }

    if (!phoneRegex.test(phone.trim())) {
      setErrorMsg('Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          carModel: tenXe,
          carVersion: tenPhienBan,
          leadType: 'Dự Toán Trả Góp',
          estimatedTotal: effectivePrice,
          notes: `Vay ${loanPercent}% (${result.soTienVay.toLocaleString('vi-VN')} ₫) trong ${loanTermYears} năm. Gốc lãi tháng đầu: ${result.tongTienThangDau.toLocaleString('vi-VN')} ₫`,
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
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setIsUnlocked(true);
      } else {
        setErrorMsg(resData.error || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!');
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng liên hệ Hotline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl shadow-blue-950/10 border border-slate-200/80 overflow-hidden">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002C6C] to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-sky-300 border border-white/15 backdrop-blur-md mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Lãi Suất Ưu Đãi 7.9%/năm (Cố Định Năm Đầu)
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            Bảng Tính Vay Mua Xe Trả Góp
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Ước tính hạn mức vay tối đa 85% giá trị xe, kỳ hạn linh hoạt từ 1 đến 8 năm theo phương thức dư nợ giảm dần.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 md:p-10 space-y-8">
        {/* Car Info Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#002C6C] text-white flex items-center justify-center font-bold text-base">
              🚗
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Dòng xe tính trả góp:</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900">
                {tenXe} {tenPhienBan ? `— ${tenPhienBan}` : ''}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-semibold">Giá xe tính vay:</div>
            <div className="text-base sm:text-lg font-black text-[#002C6C]">
              {new Intl.NumberFormat('vi-VN').format(effectivePrice)} ₫
            </div>
          </div>
        </div>

        {/* Sliders & Parameters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-6 rounded-3xl border border-slate-200/80">
          {/* Slider: Tỷ Lệ Trả Trước */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Số tiền trả trước:
              </label>
              <span className="text-sm font-black text-[#0072CE] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {downPaymentPercent}% ({new Intl.NumberFormat('vi-VN').format(result.soTienTraTruoc)} ₫)
              </span>
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

            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>15% (Tối thiểu)</span>
              <span>30%</span>
              <span>50%</span>
              <span>70%</span>
              <span>85% (Tối đa)</span>
            </div>
          </div>

          {/* Selector: Thời Hạn Vay */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Thời hạn vay vốn:
              </label>
              <span className="text-sm font-black text-[#0072CE] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {loanTermYears} năm ({loanTermMonths} tháng)
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {[3, 4, 5, 6, 7, 8].map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setLoanTermYears(year)}
                  className={`py-2.5 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
                    loanTermYears === year
                      ? 'bg-[#002C6C] text-white border-[#002C6C] shadow-md shadow-blue-950/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {year}N
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Monthly Payment Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#002C6C] via-[#0b1b3a] to-[#00173b] text-white p-6 sm:p-8 text-center shadow-xl">
          <div className="relative z-10">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-sky-300 border border-white/15 mb-2">
              Ước Tính Gốc + Lãi Tháng Đầu Tiên
            </span>
            <div className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300">
              {new Intl.NumberFormat('vi-VN').format(result.tongTienThangDau)}{' '}
              <span className="text-xl sm:text-2xl font-bold text-sky-400">VNĐ</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
              Vay <span className="font-bold text-white">{loanPercent}%</span> giá trị xe ({new Intl.NumberFormat('vi-VN').format(result.soTienVay)} ₫) trong {loanTermYears} năm
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="bg-slate-100/80 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider">
            <span>Hạng mục thanh toán vay ngân hàng</span>
            <span>Số tiền ước tính</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
              <span className="font-medium text-slate-600">Số tiền vay ngân hàng ({loanPercent}%):</span>
              <span className="font-bold text-slate-900">
                {new Intl.NumberFormat('vi-VN').format(result.soTienVay)} ₫
              </span>
            </div>

            <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
              <span className="font-medium text-slate-600">• Tiền gốc trả đều hàng tháng:</span>
              <span className={`font-bold text-slate-900 ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
                {new Intl.NumberFormat('vi-VN').format(result.tienGocHangThang)} ₫
              </span>
            </div>

            <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
              <span className="font-medium text-slate-600">• Tiền lãi tháng đầu tiên ({annualRate}%/năm):</span>
              <span className={`font-bold text-slate-900 ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
                {new Intl.NumberFormat('vi-VN').format(result.tienLaiThangDau)} ₫
              </span>
            </div>

            <div className="p-4 flex justify-between items-center bg-sky-50/60">
              <span className="font-bold text-slate-900 uppercase">Tổng Gốc + Lãi Tháng Đầu:</span>
              <span className={`font-black text-base sm:text-lg text-[#002C6C] ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
                {new Intl.NumberFormat('vi-VN').format(result.tongTienThangDau)} ₫
              </span>
            </div>
          </div>
        </div>

        {/* ==================== SOFT-GATE LEAD CAPTURE FORM ==================== */}
        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="space-y-5 bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/40 p-6 sm:p-8 rounded-3xl border-2 border-sky-200/80 shadow-lg">
            <div className="text-center max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 mb-2">
                ⚡ Hỗ trợ thẩm định hồ sơ duyệt vay trong 24h
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Đăng Ký Nhận Kết Quả Duyệt Vay & Lịch Trả Nợ Chi Tiết
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Chuyên viên tín dụng Showroom sẽ gửi bảng lịch trả nợ từng tháng và kết nối ngân hàng lãi suất tốt nhất.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <span className="text-base">⚠️</span> {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Họ và tên Quý khách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full p-3.5 bg-white border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 rounded-xl text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Số điện thoại nhận duyệt vay (Zalo/SMS) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Ví dụ: 0912 345 678 (10 số)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full p-3.5 bg-white border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 rounded-xl text-sm font-semibold text-slate-900 outline-none transition"
                />
              </div>
            </div>

            {/* Red CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-white text-base sm:text-lg tracking-wider transition-all duration-300 shadow-xl shadow-red-600/20 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3"
            >
              <span>{isSubmitting ? 'ĐANG GỬI HỒ SƠ...' : 'ĐĂNG KÝ HỒ SƠ VAY NHANH — DUYỆT TRONG 24H'}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <p className="text-center text-xs text-slate-500 font-medium">
              🔒 Bảo mật tuyệt đối • Hỗ trợ chứng minh thu nhập • Không phát sinh phí hồ sơ
            </p>
          </form>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400/50 rounded-2xl p-5 text-emerald-900 shadow-lg shadow-emerald-500/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                ✓
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-emerald-950">
                  ĐÃ TIẾP NHẬN HỒ SƠ TƯ VẤN TRẢ GÓP!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 mt-0.5 leading-relaxed">
                  Cảm ơn Quý khách <strong className="font-bold">{fullName}</strong>. Chuyên viên tài chính Showroom Hyundai Vinh sẽ liên hệ trực tiếp qua số điện thoại <strong className="font-bold">{phone}</strong> để hướng dẫn thủ tục vay ngân hàng ưu đãi nhất!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${defaultHotline.replace(/\D/g, '')}`}
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-white text-sm sm:text-base shadow-lg shadow-blue-950/20 bg-[#002C6C] hover:brightness-110 transition"
              >
                <span>📞</span> Gọi Trực Tiếp Hotline: {defaultHotline}
              </a>
              <a
                href={defaultZaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-white text-sm sm:text-base shadow-lg shadow-sky-500/20 bg-[#0072CE] hover:brightness-110 transition"
              >
                <span>💬</span> Trao Đổi Qua Zalo Ngay
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
