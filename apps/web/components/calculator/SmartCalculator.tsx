'use client';

// 🧠 Mental Model: Master State Container cho Phễu Chuyển Đổi Lead 2 Bước (Smart Calculator).
// Chuẩn thiết kế Showroom Hyundai Flagship cao cấp (Hyundai Deep Navy #002C6C, Electric Blue #0072CE).
// 1. Áp dụng State Machine 3 trạng thái ('input' -> 'gate [blur-sm]' -> 'success [unblur]').
// 2. Chống mất dữ liệu khi F5 (R11) qua sessionStorage sync.
// 3. Zero-Cost Client Phone Validation (R2) kiểm tra 10 số di động VN.
// 4. Bẫy Honeypot ẩn (R1) chống bot spam.

import { useState, useEffect } from 'react';
import { calculateRollingCost } from '@cardealer/core';
import type { RollingCostBreakdown } from '@cardealer/types';

export type CalculatorState = 'input' | 'gate' | 'success';

export interface CarVersionItem {
  id: string;
  tenPhienBan: string;
  giaNiemYet: number;
}

export interface CarItem {
  id: string;
  tenXe: string;
  slug: string;
  versions: CarVersionItem[];
}

interface SmartCalculatorProps {
  cars: CarItem[];
  defaultHotline?: string;
  defaultZaloUrl?: string;
  onVersionChange?: (version: CarVersionItem | null, carName: string) => void;
}

const STORAGE_KEY = 'cardealer_rolling_calculator_session';

export default function SmartCalculator({
  cars,
  defaultHotline = '0941.153.666',
  defaultZaloUrl = 'https://zalo.me/0941153666',
  onVersionChange,
}: SmartCalculatorProps) {
  const [state, setState] = useState<CalculatorState>('input');

  // Input Form States
  const [selectedCarName, setSelectedCarName] = useState<string>(cars[0]?.tenXe || '');
  const [selectedVersionName, setSelectedVersionName] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('Vinh');
  const [availableVersions, setAvailableVersions] = useState<CarVersionItem[]>([]);

  // Calculation Results
  const [calculatedResult, setCalculatedResult] = useState<RollingCostBreakdown | null>(null);

  // Lead Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState<'Sáng (8h - 12h)' | 'Chiều (13h - 18h)' | 'Bất kỳ'>('Bất kỳ');
  const [honeypot, setHoneypot] = useState('');
  const [leadError, setLeadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cập nhật danh sách phiên bản khi chọn dòng xe
  useEffect(() => {
    const foundCar = cars.find((c) => c.tenXe === selectedCarName);
    if (foundCar && foundCar.versions) {
      setAvailableVersions(foundCar.versions);
      if (foundCar.versions.length > 0) {
        setSelectedVersionName(foundCar.versions[0].tenPhienBan);
        if (onVersionChange) {
          onVersionChange(foundCar.versions[0], foundCar.tenXe);
        }
      } else {
        setSelectedVersionName('');
        if (onVersionChange) onVersionChange(null, foundCar.tenXe);
      }
    } else {
      setAvailableVersions([]);
      setSelectedVersionName('');
      if (onVersionChange) onVersionChange(null, '');
    }
  }, [selectedCarName, cars, onVersionChange]);

  // Khi người dùng đổi phiên bản xe
  const handleVersionSelect = (versionName: string) => {
    setSelectedVersionName(versionName);
    const ver = availableVersions.find((v) => v.tenPhienBan === versionName) || null;
    if (onVersionChange) onVersionChange(ver, selectedCarName);
  };

  // 2. Phục hồi trạng thái khi F5 tải lại trang (R11)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.state === 'gate' || parsed.state === 'success') {
          setState(parsed.state);
          setSelectedCarName(parsed.carName || '');
          setSelectedVersionName(parsed.versionName || '');
          setSelectedProvince(parsed.province || 'Vinh');
          setCalculatedResult(parsed.calculatedResult || null);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.phone) setPhone(parsed.phone);
        }
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // 3. Xử lý Chuyển từ Step 1 (Input) sang Step 2 (Gate)
  const handleCalculateRolling = (e: React.FormEvent) => {
    e.preventDefault();
    const currentVersion = availableVersions.find((v) => v.tenPhienBan === selectedVersionName);
    if (!currentVersion) return;

    const tinhThanhCode =
      selectedProvince === 'Vinh'
        ? 'nghe_an_vinh'
        : selectedProvince === 'Hà Tĩnh'
        ? 'ha_tinh'
        : 'nghe_an_huyen';

    const result = calculateRollingCost({
      giaXe: currentVersion.giaNiemYet,
      tinhThanhCode,
      soChoNgoi: 5,
      hasBaoHiemThanVo: true,
      hasPhiDichVu: true,
    });

    setCalculatedResult(result);
    setState('gate');

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: 'gate',
          carName: selectedCarName,
          versionName: selectedVersionName,
          province: selectedProvince,
          calculatedResult: result,
        })
      );
    } catch {
      // Ignored
    }
  };

  // 4. Client Phone Validation (R2)
  const validateVietnamPhone = (rawPhone: string): boolean => {
    const cleaned = rawPhone.replace(/\D/g, '');
    const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return vnPhoneRegex.test(cleaned);
  };

  // 5. Xử lý Submit Lead Form (Gate -> Success)
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);

    if (honeypot.trim() !== '') {
      setState('success');
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setLeadError('Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).');
      return;
    }

    if (!validateVietnamPhone(phone)) {
      setLeadError('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const payload = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        province: selectedProvince,
        preferredContactTime: preferredTime,
        leadType: 'Báo Giá Lăn Bánh',
        carModel: selectedCarName,
        carVersion: selectedVersionName,
        estimatedTotal: calculatedResult?.tongGiaLanBanh || 0,
        notes: `Đăng ký xem chi tiết lăn bánh ${selectedCarName} - ${selectedVersionName} tại ${selectedProvince}. Khung giờ gọi: ${preferredTime}`,
        metadata: {
          ...calculatedResult,
          selectedProvince,
        },
        website_url: honeypot,
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setLeadError('Quý khách đã gửi yêu cầu gần đây. Vui lòng chờ 10 phút hoặc gọi trực tiếp Hotline!');
        } else {
          setLeadError(json.error || 'Có lỗi khi gửi thông tin. Vui lòng thử lại!');
        }
        setIsSubmitting(false);
        return;
      }

      setState('success');
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            state: 'success',
            carName: selectedCarName,
            versionName: selectedVersionName,
            province: selectedProvince,
            calculatedResult,
            fullName,
            phone: cleanPhone,
          })
        );
      } catch {
        // Ignored
      }
    } catch {
      setLeadError('Lỗi kết nối máy chủ. Vui lòng kiểm tra lại mạng hoặc liên hệ Hotline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setState('input');
    setCalculatedResult(null);
    setLeadError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  };

  const currentSelectedVersion = availableVersions.find((v) => v.tenPhienBan === selectedVersionName);

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl shadow-blue-950/10 border border-slate-200/80 overflow-hidden">
      {/* 1. Header & Progress Stepper */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002C6C] to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        {/* Glow Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-sky-300 border border-white/15 backdrop-blur-md mb-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                Dự Toán Giá Lăn Bánh Trọn Gói 2026
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                Bảng Tính Giá Lăn Bánh Ô Tô Hyundai
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Tự động áp dụng biểu thuế trước bạ 10%, phí biển số TP. Vinh & các huyện Nghệ An chính xác 100%.
              </p>
            </div>

            {/* Step Counter Badge */}
            <div className="self-start sm:self-center bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Tiến trình</div>
              <div className="text-lg font-black text-white">
                {state === 'input' && 'Bước 1 / 2'}
                {state === 'gate' && 'Bước 2 / 2'}
                {state === 'success' && '✓ Hoàn Tất'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-6">
            <div
              className="h-full transition-all duration-700 ease-out rounded-full bg-gradient-to-r from-sky-400 to-[#0072CE]"
              style={{
                width: state === 'input' ? '50%' : '100%',
                backgroundColor: state === 'success' ? '#10B981' : undefined,
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 md:p-10">
        {/* ==================== STATE 1: INPUT STEP ==================== */}
        {state === 'input' && (
          <form onSubmit={handleCalculateRolling} className="space-y-8">
            {/* Grid 3 Lựa Chọn Cốt Lõi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Chọn Dòng Xe */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <svg className="w-4 h-4 text-[#0072CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 16v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2m14 0H5m14 0a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 012-2" />
                  </svg>
                  1. Chọn Dòng Xe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCarName}
                    onChange={(e) => setSelectedCarName(e.target.value)}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 focus:border-[#0072CE] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm transition outline-none cursor-pointer appearance-none shadow-sm"
                  >
                    {cars.map((c) => (
                      <option key={c.id} value={c.tenXe}>
                        {c.tenXe}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* 2. Chọn Phiên Bản */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <svg className="w-4 h-4 text-[#0072CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  2. Chọn Phiên Bản <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedVersionName}
                    onChange={(e) => handleVersionSelect(e.target.value)}
                    disabled={availableVersions.length === 0}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 focus:border-[#0072CE] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm transition outline-none cursor-pointer appearance-none shadow-sm disabled:opacity-50"
                  >
                    {availableVersions.length === 0 ? (
                      <option value="">-- Vui lòng chọn xe --</option>
                    ) : (
                      availableVersions.map((v) => (
                        <option key={v.id} value={v.tenPhienBan}>
                          {v.tenPhienBan} ({new Intl.NumberFormat('vi-VN').format(v.giaNiemYet)} ₫)
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* 3. Nơi Đăng Ký Biển Số */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <svg className="w-4 h-4 text-[#0072CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  3. Nơi Đăng Ký Biển Số <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 focus:border-[#0072CE] focus:bg-white rounded-2xl text-slate-900 font-bold text-sm transition outline-none cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="Vinh">TP. Vinh (Biển số 1.000.000 ₫)</option>
                    <option value="Huyện Khác (Nghệ An)">Các Huyện Nghệ An (Biển số 200.000 ₫)</option>
                    <option value="Hà Tĩnh">Tỉnh Hà Tĩnh (Biển số 1.000.000 ₫)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Price Snapshot Card */}
            {currentSelectedVersion && (
              <div className="bg-gradient-to-r from-sky-50 via-indigo-50/50 to-sky-50 p-5 rounded-2xl border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#002C6C] text-white flex items-center justify-center font-black text-xl shadow-md">
                    H
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Dòng xe đang chọn:</div>
                    <div className="text-base font-extrabold text-slate-900">
                      {selectedCarName} - {currentSelectedVersion.tenPhienBan}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">Giá niêm yết nhà máy:</div>
                  <div className="text-xl sm:text-2xl font-black text-[#002C6C]">
                    {new Intl.NumberFormat('vi-VN').format(currentSelectedVersion.giaNiemYet)} ₫
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedVersionName}
              className="w-full py-4 sm:py-5 px-8 rounded-2xl font-black text-white text-base sm:text-lg tracking-wider transition-all duration-300 shadow-xl shadow-blue-900/20 bg-gradient-to-r from-[#002C6C] via-[#0072CE] to-[#002C6C] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3 group"
            >
              <span>XEM DỰ TOÁN GIÁ LĂN BÁNH CHI TIẾT</span>
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>
        )}

        {/* ==================== STATE 2: GATE & STATE 3: SUCCESS ==================== */}
        {(state === 'gate' || state === 'success') && calculatedResult && (
          <div className="space-y-8">
            {/* Success Banner */}
            {state === 'success' && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400/50 rounded-2xl p-5 text-emerald-900 shadow-lg shadow-emerald-500/10 flex items-center gap-4 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                  ✓
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-emerald-950">
                    ĐÃ MỞ KHÓA TOÀN BỘ BẢNG CHI PHÍ LĂN BÁNH & ƯU ĐÃI!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-0.5 leading-relaxed">
                    Cảm ơn Quý khách <strong className="font-bold">{fullName}</strong> ({phone}). Chuyên viên Showroom Hyundai Vinh sẽ liên hệ gửi kèm gói ưu đãi tiền mặt và phụ kiện độc quyền trong 5 phút!
                  </p>
                </div>
              </div>
            )}

            {/* Total Rolling Cost Showcase Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#002C6C] via-[#0b1b3a] to-[#00173b] text-white p-6 sm:p-8 text-center shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-sky-300 border border-white/15 mb-2">
                  Tổng Giá Lăn Bánh Tạm Tính ({selectedProvince})
                </span>
                <div className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mt-1 text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300">
                  {new Intl.NumberFormat('vi-VN').format(calculatedResult.tongGiaLanBanh)}{' '}
                  <span className="text-xl sm:text-2xl font-bold text-sky-400">VNĐ</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                  Áp dụng cho: <span className="font-bold text-white">{selectedCarName}</span> — {selectedVersionName}
                </p>
              </div>
            </div>

            {/* 6 Fees Itemized Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="bg-slate-100/80 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider">
                <span>Khoản mục chi phí bắt buộc & tự nguyện</span>
                <span>Số tiền ước tính</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                  <span className="font-medium text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                    1. Giá xe niêm yết:
                  </span>
                  <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none' : ''}`}>
                    {new Intl.NumberFormat('vi-VN').format(calculatedResult.giaXe)} ₫
                  </span>
                </div>

                <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                  <span className="font-medium text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                    2. Lệ phí trước bạ (10%):
                  </span>
                  <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none' : ''}`}>
                    {new Intl.NumberFormat('vi-VN').format(calculatedResult.lePhiTruocBa)} ₫
                  </span>
                </div>

                <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                  <span className="font-medium text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                    3. Phí cấp biển số ({selectedProvince}):
                  </span>
                  <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none' : ''}`}>
                    {new Intl.NumberFormat('vi-VN').format(calculatedResult.phiBienSo)} ₫
                  </span>
                </div>

                <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                  <span className="font-medium text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                    4. Phí đăng kiểm phương tiện:
                  </span>
                  <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none' : ''}`}>
                    {new Intl.NumberFormat('vi-VN').format(calculatedResult.phiDangKiem)} ₫
                  </span>
                </div>

                <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                  <span className="font-medium text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                    5. Phí bảo trì đường bộ (12 tháng):
                  </span>
                  <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none' : ''}`}>
                    {new Intl.NumberFormat('vi-VN').format(calculatedResult.phiBaoTriDuongBo)} ₫
                  </span>
                </div>

                <div className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                  <span className="font-medium text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                    6. Bảo hiểm TNDS bắt buộc (1 năm):
                  </span>
                  <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none' : ''}`}>
                    {new Intl.NumberFormat('vi-VN').format(calculatedResult.baoHiemTNDS)} ₫
                  </span>
                </div>
              </div>
            </div>

            {/* ==================== STATE 2 (GATE): SOFT-GATE LEAD FORM ==================== */}
            {state === 'gate' && (
              <form onSubmit={handleLeadSubmit} className="space-y-5 bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/40 p-6 sm:p-8 rounded-3xl border-2 border-sky-200/80 shadow-lg">
                <div className="text-center max-w-xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
                    🎁 Đang áp dụng khuyến mại giảm tiền mặt trong tháng
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Nhập Thông Tin Để Mở Khóa Bảng Chi Phí & Nhận Ưu Đãi Độc Quyền
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Bảng chi phí trên chưa trừ khuyến mại tiền mặt & quà tặng phụ kiện chính hãng tại Showroom.
                  </p>
                </div>

                {leadError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <span className="text-base">⚠️</span> {leadError}
                  </div>
                )}

                {/* Honeypot hidden field */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

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
                      Số điện thoại nhận báo giá (Zalo/SMS) <span className="text-red-500">*</span>
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Khung giờ Quý khách tiện nghe máy:
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {(['Sáng (8h - 12h)', 'Chiều (13h - 18h)', 'Bất kỳ'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPreferredTime(t)}
                        className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          preferredTime === t
                            ? 'bg-[#002C6C] text-white border-[#002C6C] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High Converting Red CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-white text-base sm:text-lg tracking-wider transition-all duration-300 shadow-xl shadow-red-600/20 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3"
                >
                  <span>{isSubmitting ? 'ĐANG GỬI YÊU CẦU...' : 'XEM GIÁ LĂN BÁNH THỰC TẾ & NHẬN ƯU ĐÃI'}</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <p className="text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                  <span>🔒</span> Cam kết bảo mật thông tin 100% — Không làm phiền ngoài nhu cầu tư vấn xe.
                </p>
              </form>
            )}

            {/* ==================== STATE 3 (SUCCESS): HOTLINE & ZALO ==================== */}
            {state === 'success' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={`tel:${defaultHotline.replace(/\D/g, '')}`}
                    className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-white text-sm sm:text-base shadow-lg shadow-blue-950/20 bg-[#002C6C] hover:brightness-110 transition"
                  >
                    <span>📞</span> Gọi Hotline: {defaultHotline}
                  </a>
                  <a
                    href={defaultZaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-white text-sm sm:text-base shadow-lg shadow-sky-500/20 bg-[#0072CE] hover:brightness-110 transition"
                  >
                    <span>💬</span> Nhắn Zalo Báo Giá Tức Thì
                  </a>
                </div>
              </div>
            )}

            {/* Nút quay lại chọn xe khác */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs sm:text-sm font-bold text-slate-500 hover:text-[#0072CE] underline cursor-pointer transition"
              >
                ← Tính toán dòng xe hoặc phiên bản khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
