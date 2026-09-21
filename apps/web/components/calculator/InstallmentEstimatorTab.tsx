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
import { LeadQuoteForm, type LeadQuoteFormData, Label, Button } from '@cardealer/ui';
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
  const [submittedData, setSubmittedData] = useState<LeadQuoteFormData | null>(null);
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

  const handleUnlock = async (data: LeadQuoteFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const cleanPhone = data.phone.trim().replace(/^\+84/, '0').replace(/\D/g, '');

      await leadsService.createLead({
        fullName: data.fullName.trim(),
        phone: cleanPhone,
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
      });

      setSubmittedData({ fullName: data.fullName.trim(), phone: cleanPhone });
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
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Số tiền trả trước:
              </Label>
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
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Thời hạn vay vốn:
              </Label>
              <span className="text-sm font-black text-[#0072CE] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {loanTermYears} năm ({loanTermMonths} tháng)
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {[3, 4, 5, 6, 7, 8].map((year) => (
                <Button
                  key={year}
                  type="button"
                  onClick={() => setLoanTermYears(year)}
                  className={`h-auto py-2.5 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
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
          <div className="space-y-5 bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/40 p-6 sm:p-8 rounded-3xl border-2 border-sky-200/80 shadow-lg">
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

            <LeadQuoteForm
              onSubmit={handleUnlock}
              loading={isSubmitting}
              error={errorMsg}
              submitText="ĐĂNG KÝ HỒ SƠ VAY NHANH — DUYỆT TRONG 24H"
              buttonClassName="h-14 sm:h-16 text-base sm:text-lg font-black tracking-wider shadow-xl shadow-red-600/20 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110"
              defaultValues={{
                fullName: initialFullName,
                phone: initialPhone,
              }}
            />

            <p className="text-center text-xs text-slate-500 font-medium">
              🔒 Bảo mật tuyệt đối • Hỗ trợ chứng minh thu nhập • Không phát sinh phí hồ sơ
            </p>
          </div>
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
                  Cảm ơn Quý khách <strong className="font-bold">{submittedData?.fullName || initialFullName}</strong>. Chuyên viên tài chính Showroom Hyundai Vinh sẽ liên hệ trực tiếp qua số điện thoại <strong className="font-bold">{submittedData?.phone || initialPhone}</strong> để hướng dẫn thủ tục vay ngân hàng ưu đãi nhất!
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
