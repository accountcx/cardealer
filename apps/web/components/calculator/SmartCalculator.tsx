'use client';

// 🧠 Mental Model: Master State Container cho Phễu Chuyển Đổi Lead 2 Bước (Smart Calculator).
// Chuẩn thiết kế Showroom Hyundai Flagship cao cấp (Hyundai Deep Navy #002C6C, Electric Blue #0072CE).
// 1. Áp dụng State Machine 3 trạng thái ('input' -> 'gate [blur-sm]' -> 'success [unblur]').
// 2. Chống mất dữ liệu khi F5 (R11) qua sessionStorage sync.
// 3. Zero-Cost Client Phone Validation (R2) kiểm tra 10 số di động VN.
// 4. Bẫy Honeypot ẩn (R1) chống bot spam.

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateRollingCost } from '@cardealer/core';
import type { RollingCostBreakdown } from '@cardealer/types';
import { Input, Label, Select, Button } from '@cardealer/ui';
import { leadsService } from '../../services/leads.service';
import { AppError } from '../../lib/api-client';

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
  segment?: string;
  versions: CarVersionItem[];
}

interface SmartCalculatorProps {
  cars: CarItem[];
  initialCarSlug?: string;
  defaultHotline?: string;
  defaultZaloUrl?: string;
  onVersionChange?: (version: CarVersionItem | null, carName: string) => void;
  onStateChange?: (state: CalculatorState) => void;
  resetSignal?: number;
  onSwitchToInstallment?: () => void;
}

const STORAGE_KEY = 'cardealer_rolling_calculator_session';

export default function SmartCalculator({
  cars,
  initialCarSlug,
  defaultHotline = '0941.153.666',
  defaultZaloUrl = 'https://zalo.me/0941153666',
  onVersionChange,
  onStateChange,
  resetSignal,
  onSwitchToInstallment,
}: SmartCalculatorProps) {
  const searchParams = useSearchParams();
  const targetSlug = searchParams.get('model') || searchParams.get('xe') || searchParams.get('car') || initialCarSlug;
  const targetSegment = searchParams.get('segment');

  // 🧠 Mental Model: Hàm tìm kiếm dòng xe tương ứng dựa theo Slug, Tên xe hoặc Phân khúc từ URL query params
  const findCarBySlugOrName = (slugOrName?: string | null, segment?: string | null) => {
    if (!cars || cars.length === 0) return undefined;
    if (slugOrName) {
      const clean = slugOrName.toLowerCase().trim();
      const matched = (
        cars.find((c) => c.slug?.toLowerCase() === clean) ||
        cars.find((c) => c.slug?.toLowerCase().includes(clean)) ||
        cars.find((c) => c.tenXe?.toLowerCase().includes(clean)) ||
        cars.find((c) => clean.includes(c.slug?.toLowerCase()))
      );
      if (matched) return matched;
    }
    if (segment && segment !== 'all') {
      const cleanSeg = segment.toLowerCase().trim();
      const matched = cars.find((c) => c.segment?.toLowerCase() === cleanSeg);
      if (matched) return matched;
    }
    return cars[0];
  };

  const [state, setState] = useState<CalculatorState>('input');

  // Input Form States: Ưu tiên khởi tạo đúng dòng xe từ URL Query Params (?model=... hoặc ?segment=...)
  const initialMatchedCar = findCarBySlugOrName(targetSlug, targetSegment);
  const [selectedCarName, setSelectedCarName] = useState<string>(initialMatchedCar?.tenXe || cars[0]?.tenXe || '');
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

  // Ref cho Micro-UX: Auto-scroll & Auto-focus
  const leadFormRef = useRef<HTMLFormElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ state lên MasterView để ẩn/hiện Tabs switcher
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const updateState = (newState: CalculatorState) => {
    setState(newState);
    onStateChangeRef.current?.(newState);
  };

  // Tự động focus ô SĐT và cuộn nhẹ đưa form vào trung tâm khi sang Bước 2
  useEffect(() => {
    if (state === 'gate') {
      if (leadFormRef.current) {
        leadFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Ref giữ callback onVersionChange ổn định giữa các lần render
  const onVersionChangeRef = useRef(onVersionChange);
  useEffect(() => {
    onVersionChangeRef.current = onVersionChange;
  }, [onVersionChange]);

  // 0. Tự động đồng bộ dòng xe khi URL query parameter (?model=... / ?xe=... / ?segment=...) hoặc danh sách cars thay đổi
  useEffect(() => {
    if ((targetSlug || targetSegment) && cars && cars.length > 0) {
      const matched = findCarBySlugOrName(targetSlug, targetSegment);
      if (matched && matched.tenXe !== selectedCarName) {
        setSelectedCarName(matched.tenXe);
      }
    }
  }, [targetSlug, targetSegment, cars]);

  // 1. Cập nhật danh sách phiên bản khi chọn dòng xe
  useEffect(() => {
    const foundCar = cars.find((c) => c.tenXe === selectedCarName) || cars[0];
    if (foundCar) {
      if (selectedCarName !== foundCar.tenXe) {
        setSelectedCarName(foundCar.tenXe);
      }
      const vers = foundCar.versions || [];
      setAvailableVersions(vers);
      if (vers.length > 0) {
        const isExistingVersion = vers.some((v) => v.tenPhienBan === selectedVersionName);
        const versionToSet = isExistingVersion ? selectedVersionName : vers[0].tenPhienBan;
        setSelectedVersionName(versionToSet);
        if (onVersionChangeRef.current) {
          const verObj = vers.find((v) => v.tenPhienBan === versionToSet) || vers[0];
          onVersionChangeRef.current(verObj, foundCar.tenXe);
        }
      } else {
        setSelectedVersionName('');
        if (onVersionChangeRef.current) onVersionChangeRef.current(null, foundCar.tenXe);
      }
    } else {
      setAvailableVersions([]);
      setSelectedVersionName('');
      if (onVersionChangeRef.current) onVersionChangeRef.current(null, '');
    }
  }, [selectedCarName, cars]);

  // Khi người dùng đổi phiên bản xe
  const handleVersionSelect = (versionName: string) => {
    setSelectedVersionName(versionName);
    const ver = availableVersions.find((v) => v.tenPhienBan === versionName) || null;
    if (onVersionChange) onVersionChange(ver, selectedCarName);
  };

  // 2. Phục hồi trạng thái khi F5 tải lại trang (R11) - Chỉ áp dụng khi URL không có query param chỉ định xe
  useEffect(() => {
    try {
      if (!targetSlug) {
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
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [targetSlug]);

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
    updateState('gate');

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
    const cleaned = rawPhone.replace(/^\+84/, '0').replace(/\D/g, '');
    const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return vnPhoneRegex.test(cleaned);
  };

  // 5. Xử lý Submit Lead Form (Gate -> Success)
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);

    if (honeypot.trim() !== '') {
      updateState('success');
      return;
    }

    if (!validateVietnamPhone(phone)) {
      setLeadError('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = phone.replace(/^\+84/, '0').replace(/\D/g, '');

    try {
      const payload = {
        fullName: fullName.trim() || 'Khách hàng',
        phone: cleanPhone,
        province: selectedProvince,
        preferredTime: 'Bất kỳ',
        preferredContactTime: 'Bất kỳ',
        leadType: 'Giá Lăn Bánh' as const,
        carModel: selectedCarName,
        carVersion: selectedVersionName,
        estimatedTotal: calculatedResult?.tongGiaLanBanh || 0,
        notes: `Đăng ký nhận báo giá lăn bánh & ưu đãi đại lý cho ${selectedCarName} - ${selectedVersionName} tại ${selectedProvince}.`,
        metadata: {
          ...calculatedResult,
          selectedProvince,
        },
        websiteUrl: honeypot,
        website_url: honeypot,
      };

      await leadsService.createLead(payload);

      updateState('success');
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
      } catch (e) {
        console.warn('Cannot save state to sessionStorage', e);
      }
    } catch (err: unknown) {
      if (err instanceof AppError && err.statusCode === 429) {
        setLeadError('Quý khách đã gửi yêu cầu gần đây. Vui lòng chờ 10 phút hoặc gọi trực tiếp Hotline!');
      } else {
        const errMsg = err instanceof Error ? err.message : 'Có lỗi khi gửi thông tin. Vui lòng thử lại!';
        setLeadError(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    updateState('input');
    setCalculatedResult(null);
    setLeadError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  };

  // Lắng nghe resetSignal từ component cha (MasterView)
  useEffect(() => {
    if (resetSignal && resetSignal > 0) {
      handleReset();
    }
  }, [resetSignal]);

  const currentSelectedVersion = availableVersions.find((v) => v.tenPhienBan === selectedVersionName);

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-950/10 border border-slate-200/80 overflow-hidden">
      {/* 1. Header & Progress Stepper - Thu gọn tối đa khi ở Bước 2 (<40px) */}
      <div className={`bg-gradient-to-r from-slate-900 via-[#002C6C] to-slate-900 text-white relative overflow-hidden transition-all ${state === 'input' ? 'p-4 sm:p-7 md:p-8' : 'p-2.5 sm:p-4'
        }`}>
        {/* Glow Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10">
          {state === 'input' ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-white/10 text-sky-300 border border-white/15 backdrop-blur-md mb-1.5 sm:mb-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-400 animate-ping" />
                Dự Toán Giá Lăn Bánh Trọn Gói 2026
              </div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                Bảng Tính Giá Lăn Bánh Ô Tô Hyundai
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 sm:mt-1 max-w-xl">
                Tự động áp dụng biểu thuế trước bạ 10%, phí biển số TP. Vinh & các huyện Nghệ An chính xác 100%.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-white/10 text-sky-300 border border-white/15">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {state === 'gate' ? 'Bước 2/2: Mở Khóa Báo Giá & Ưu Đãi' : '✓ Đã Mở Khóa Bảng Tính'}
              </div>
              <span className="text-xs font-bold text-sky-300">{state === 'gate' ? '85%' : '100%'}</span>
            </div>
          )}

          {/* Minimalist 2026 Stepper Line */}
          <div className={`${state === 'input' ? 'mt-3.5 sm:mt-5 pt-2.5 sm:pt-3 border-t border-white/10' : 'mt-2'}`}>
            {state === 'input' && (
              <div className="flex items-center justify-between text-xs mb-1.5 sm:mb-2">
                <span className="text-slate-300 font-semibold text-[11px] sm:text-xs">
                  Bước 1/2: Chọn thông tin xe &amp; địa phương
                </span>
                <span className="text-sky-300 font-bold text-[11px] sm:text-xs">
                  50%
                </span>
              </div>
            )}
            <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-sky-400 to-[#0072CE]"
                style={{
                  width: state === 'input' ? '50%' : state === 'gate' ? '85%' : '100%',
                  backgroundColor: state === 'success' ? '#10B981' : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3.5 sm:p-6 md:p-8">
        {/* ==================== STATE 1: INPUT STEP ==================== */}
        {state === 'input' && (
          <form onSubmit={handleCalculateRolling} className="space-y-4 sm:space-y-6">
            {/* Quick Price Snapshot Card (Unified Top Anchor) */}
            {currentSelectedVersion && (
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-blue-200/80 shadow-md shadow-blue-900/5 p-3.5 sm:p-5 transition-all">
                {/* Hyundai Signature Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#002C6C] via-[#0072CE] to-sky-400" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Car & Version info with Hyundai Emblem Badge */}
                  <div className="flex items-center gap-3.5">
                    {/* Hyundai Emblem Soft Circular Badge */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100/90 border border-blue-200 flex items-center justify-center shadow-inner text-[#002C6C] ring-4 ring-blue-50/60 shrink-0">
                      <svg className="w-7 h-5" viewBox="0 0 100 60" fill="currentColor">
                        <path d="M50,4.8C25.4,4.8,5.5,16.1,5.5,30c0,13.9,19.9,25.2,44.5,25.2c24.6,0,44.5-11.3,44.5-25.2C94.5,16.1,74.6,4.8,50,4.8z M50,51.8C28.2,51.8,10.6,42,10.6,30c0-12,17.6-21.8,39.4-21.8c21.8,0,39.4,9.8,39.4,21.8C89.4,42,71.8,51.8,50,51.8z" opacity="0.3" />
                        <path d="M37.5,17.2c-1.8,0-3.3,1.3-3.6,3.1L27.4,45.8c-0.2,1,0.5,2,1.5,2h5.2c1.8,0,3.3-1.3,3.6-3.1l2.4-11.2h19.8l-2.4,11.2c-0.2,1,0.5,2,1.5,2h5.2c1.8,0,3.3-1.3,3.6-3.1l6.5-25.5c0.2-1-0.5-2-1.5-2h-5.2c-1.8,0-3.3,1.3-3.6,3.1l-2.2,10.5H43.9l2.2-10.5c0.2-1-0.5-2-1.5-2H37.5z" />
                      </svg>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-100/80 text-[#002C6C]">
                          Dòng xe đang chọn
                        </span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                        {selectedCarName}{' '}
                        <span className="text-[#0072CE] font-bold">
                          — {currentSelectedVersion.tenPhienBan}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Listed Price with Sharp Typography & Strong Contrast */}
                  <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:flex-col justify-between sm:items-end items-baseline">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Giá niêm yết nhà máy
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#002C6C] tracking-tight">
                      <span className="tabular-nums">
                        {new Intl.NumberFormat('vi-VN').format(currentSelectedVersion.giaNiemYet)}
                      </span>{' '}
                      <span className="text-base font-extrabold text-[#0072CE]">₫</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid 3 Lựa Chọn Cốt Lõi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
              {/* 1. Chọn Dòng Xe */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <svg className="w-4 h-4 text-[#0072CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 16v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2m14 0H5m14 0a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 012-2" />
                  </svg>
                  1. Chọn Dòng Xe <span className="text-red-500">*</span>
                </Label>
                <Select
                  variant="light"
                  sheetTitle="1. Chọn Dòng Xe Hyundai"
                  value={selectedCarName}
                  onChange={(e) => setSelectedCarName(e.target.value)}
                  className="p-3 sm:p-4 pr-10 bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 focus:border-[#0072CE] focus:bg-white rounded-xl sm:rounded-2xl text-slate-900 font-bold text-sm h-12 sm:h-14"
                >
                  {cars.map((c) => (
                    <option key={c.id} value={c.tenXe}>
                      {c.tenXe}
                    </option>
                  ))}
                </Select>
              </div>

              {/* 2. Chọn Phiên Bản */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <svg className="w-4 h-4 text-[#0072CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  2. Chọn Phiên Bản <span className="text-red-500">*</span>
                </Label>
                <Select
                  variant="light"
                  sheetTitle="2. Chọn Phiên Bản Xe"
                  value={selectedVersionName}
                  onChange={(e) => handleVersionSelect(e.target.value)}
                  disabled={availableVersions.length === 0}
                  className="p-3 sm:p-4 pr-10 bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 focus:border-[#0072CE] focus:bg-white rounded-xl sm:rounded-2xl text-slate-900 font-bold text-sm h-12 sm:h-14 disabled:opacity-50"
                >
                  {availableVersions.length === 0 ? (
                    <option value="">-- Vui lòng chọn xe --</option>
                  ) : (
                    availableVersions.map((v) => (
                      <option key={v.id} value={v.tenPhienBan}>
                        {`${v.tenPhienBan} (${new Intl.NumberFormat('vi-VN').format(v.giaNiemYet)} ₫)`}
                      </option>
                    ))
                  )}
                </Select>
              </div>

              {/* 3. Nơi Đăng Ký Biển Số */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <svg className="w-4 h-4 text-[#0072CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  3. Nơi Đăng Ký Biển Số <span className="text-red-500">*</span>
                </Label>
                <Select
                  variant="light"
                  sheetTitle="3. Nơi Đăng Ký Biển Số"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="p-3 sm:p-4 pr-10 bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 focus:border-[#0072CE] focus:bg-white rounded-xl sm:rounded-2xl text-slate-900 font-bold text-sm h-12 sm:h-14"
                >
                  <option value="Vinh">TP. Vinh</option>
                  <option value="Huyện Khác (Nghệ An)">Các Huyện Nghệ An</option>
                  <option value="Hà Tĩnh">Hà Tĩnh</option>
                </Select>
              </div>
            </div>

            {/* Submit Button & Cross-sell to Installment CTA */}
            <div className="space-y-2 mt-3 sm:mt-5">
              <Button
                type="submit"
                disabled={!selectedVersionName}
                className="w-full h-auto min-h-[48px] sm:min-h-[56px] py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black text-white text-xs min-[360px]:text-sm sm:text-base md:text-lg tracking-tight sm:tracking-normal transition-all duration-300 shadow-xl shadow-blue-900/20 bg-gradient-to-r from-[#002C6C] via-[#0072CE] to-[#002C6C] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 sm:gap-3 group border-0 whitespace-normal text-center leading-snug break-words overflow-hidden"
              >
                <span className="text-center">NHẬN BÁO GIÁ LĂN BÁNH &amp; KHUYẾN MÃI ĐẠI LÝ</span>
                <svg className="w-5 h-5 shrink-0 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>

              {/* Lối tắt chuyển tab (Cross-sell CTA) sang Trả góp */}
              {onSwitchToInstallment && (
                <div className="space-y-1.5 text-center pt-1">
                  <button
                    type="button"
                    onClick={onSwitchToInstallment}
                    className="w-full h-auto min-h-[44px] sm:min-h-[48px] py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl font-black text-[#002C6C] hover:text-white border-2 border-[#002C6C] hover:bg-[#002C6C] bg-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs sm:text-sm active:scale-[0.99]"
                  >
                    <span>💳</span>
                    <span>TÍNH PHƯƠNG ÁN MUA TRẢ GÓP XE NÀY →</span>
                  </button>

                  {currentSelectedVersion && (
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      💡 Chỉ cần trả trước từ <strong className="text-[#002C6C] font-black">~{Math.round((currentSelectedVersion.giaNiemYet * 0.2) / 1_000_000)} triệu</strong> (nhận xe ngay).{' '}
                      <button
                        type="button"
                        onClick={onSwitchToInstallment}
                        className="text-[#0072CE] font-bold hover:underline cursor-pointer inline-flex items-center"
                      >
                        Xem bảng tính trả góp →
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        )}

        {/* ==================== STATE 2: GATE & STATE 3: SUCCESS ==================== */}
        {(state === 'gate' || state === 'success') && calculatedResult && (
          <div className="space-y-4 sm:space-y-5">
            {/* Success Banner */}
            {state === 'success' && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-emerald-900 shadow-lg shadow-emerald-500/10 flex items-center gap-3.5 sm:gap-4 animate-in fade-in zoom-in-95">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-md">
                  ✓
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-lg text-emerald-950">
                    ĐÃ MỞ KHÓA TOÀN BỘ BẢNG CHI PHÍ LĂN BÁNH &amp; ƯU ĐÃI!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-0.5 leading-relaxed">
                    Cảm ơn Quý khách ({phone}). Chuyên viên Showroom Hyundai Vinh sẽ gửi file dự toán lăn bánh kèm gói ưu đãi tiền mặt và phụ kiện độc quyền qua Zalo trong 30 giây!
                  </p>
                </div>
              </div>
            )}

            {/* KHỐI 1: TỔNG GIÁ LĂN BÁNH TẠM TÍNH (Showcase Card) */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#002C6C] via-[#0b1b3a] to-[#00173b] text-white p-4 sm:p-6 text-center shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 text-sky-300 border border-white/15 mb-1 sm:mb-1.5">
                  Tổng Giá Lăn Bánh Tạm Tính ({selectedProvince})
                </span>
                <div className="text-2xl min-[360px]:text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mt-0.5 text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300">
                  {new Intl.NumberFormat('vi-VN').format(calculatedResult.tongGiaLanBanh)}{' '}
                  <span className="text-lg sm:text-2xl font-bold text-sky-400">VNĐ</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                  Áp dụng cho: <span className="font-bold text-white">{selectedCarName}</span> — {selectedVersionName}
                </p>
              </div>
            </div>

            {/* Callout dẫn đường sang Trả góp ở Bước 2 */}
            {onSwitchToInstallment && (
              <div className="bg-gradient-to-r from-sky-50 via-blue-50/80 to-indigo-50 border border-sky-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-800 text-center sm:text-left">
                  <span className="text-base sm:text-lg shrink-0">💡</span>
                  <span>
                    Muốn mua trả góp? Gói vay ưu đãi chỉ từ{' '}
                    <strong className="text-[#002C6C] font-black">
                      ~{((calculatedResult.giaXe * 0.8 / 60 + (calculatedResult.giaXe * 0.8 * 0.079 / 12)) / 1_000_000).toFixed(1)} triệu/tháng
                    </strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToInstallment}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002C6C] hover:bg-[#001f4d] text-white text-xs font-bold transition shadow-sm cursor-pointer shrink-0 active:scale-95"
                >
                  <span>Chuyển sang tính lịch trả góp</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* KHỐI 2: ĐẨY FORM NHẬP SĐT LÊN NGAY SAU TỔNG GIÁ (ABOVE THE FOLD) */}
            {state === 'gate' && (
              <form
                ref={leadFormRef}
                onSubmit={handleLeadSubmit}
                className="space-y-3 sm:space-y-3.5 bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-sky-300 shadow-xl"
              >
                <div className="text-center max-w-xl mx-auto space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <span>🎁</span> Ưu Đãi Độc Quyền Trong Tháng
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight leading-snug">
                    Mở khóa bảng kê chi tiết 6 khoản phí &amp; Ưu đãi riêng tháng này
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Chuyên viên sẽ gửi file bảng tính lăn bánh kèm gói ưu đãi tiền mặt độc quyền qua Zalo:
                  </p>
                </div>

                {leadError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
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

                {/* Single Frictionless Field: Phone Number */}
                <div className="max-w-md mx-auto space-y-2.5">
                  <div className="relative">
                    <Input
                      ref={phoneInputRef}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="Số điện thoại của Quý khách (có Zalo)..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full h-12 bg-white border-2 border-slate-300 focus:border-[#0072CE] focus-visible:ring-[#0072CE] rounded-xl text-base sm:text-sm font-bold text-slate-900 pl-4 pr-10 shadow-sm"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      📱
                    </span>
                  </div>

                  {/* High Converting Red CTA Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-auto min-h-[48px] sm:min-h-[54px] py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black text-white text-xs min-[360px]:text-sm sm:text-base tracking-tight transition-all duration-300 shadow-xl shadow-red-600/30 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border-none whitespace-normal text-center leading-snug break-words"
                  >
                    {isSubmitting ? (
                      <span className="text-center">ĐANG GỬI YÊU CẦU...</span>
                    ) : (
                      <>
                        <span className="text-center break-words max-w-full leading-snug uppercase tracking-wide">
                          NHẬN BÁO GIÁ QUA ZALO NGAY
                        </span>
                        <svg className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </Button>

                  {/* Micro-copy Trust Signals */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-3 text-[11px] text-slate-500 font-medium pt-0.5 text-center">
                    <span className="flex items-center justify-center gap-1">
                      <span>🔒</span> Cam kết bảo mật thông tin &amp; Không spam
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center justify-center gap-1">
                      <span>⚡</span> Gửi tự động qua Zalo trong 30 giây
                    </span>
                  </div>
                </div>
              </form>
            )}

            {/* KHỐI 3: BẢNG 6 KHOẢN PHÍ (NẰM DƯỚI LÀM NỀN CHỨNG MINH TRỰC QUAN) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="font-bold flex items-center gap-1.5 text-slate-700">
                  {state === 'gate' ? '🔒 Bảng kê 6 khoản phí chi tiết (Điền SĐT phía trên để mở khóa):' : '✓ Chi tiết 6 khoản phí lăn bánh:'}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="bg-slate-100/80 px-3.5 sm:px-5 py-2 sm:py-2.5 border-b border-slate-200 flex justify-between items-center text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  <span>Khoản mục chi phí bắt buộc & tự nguyện</span>
                  <span>Số tiền ước tính</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                      1. Giá xe niêm yết:
                    </span>
                    <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none opacity-50' : ''}`}>
                      {new Intl.NumberFormat('vi-VN').format(calculatedResult.giaXe)} ₫
                    </span>
                  </div>

                  <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                      2. Lệ phí trước bạ (10%):
                    </span>
                    <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none opacity-50' : ''}`}>
                      {new Intl.NumberFormat('vi-VN').format(calculatedResult.lePhiTruocBa)} ₫
                    </span>
                  </div>

                  <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                      3. Phí cấp biển số ({selectedProvince}):
                    </span>
                    <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none opacity-50' : ''}`}>
                      {new Intl.NumberFormat('vi-VN').format(calculatedResult.phiBienSo)} ₫
                    </span>
                  </div>

                  <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                      4. Phí đăng kiểm phương tiện:
                    </span>
                    <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none opacity-50' : ''}`}>
                      {new Intl.NumberFormat('vi-VN').format(calculatedResult.phiDangKiem)} ₫
                    </span>
                  </div>

                  <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                      5. Phí bảo trì đường bộ (12 tháng):
                    </span>
                    <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none opacity-50' : ''}`}>
                      {new Intl.NumberFormat('vi-VN').format(calculatedResult.phiBaoTriDuongBo)} ₫
                    </span>
                  </div>

                  <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 flex justify-between items-center hover:bg-slate-50/60 transition">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
                      6. Bảo hiểm TNDS bắt buộc (1 năm):
                    </span>
                    <span className={`font-bold text-slate-900 ${state === 'gate' ? 'blur-sm select-none opacity-50' : ''}`}>
                      {new Intl.NumberFormat('vi-VN').format(calculatedResult.baoHiemTNDS)} ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* STATE 3 (SUCCESS): HOTLINE & ZALO ACTION BUTTONS */}
            {state === 'success' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <a
                    href={`tel:${defaultHotline.replace(/\D/g, '')}`}
                    className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl sm:rounded-2xl font-black text-white text-sm sm:text-base shadow-lg shadow-blue-950/20 bg-[#002C6C] hover:brightness-110 transition"
                  >
                    <span>📞</span> Gọi Hotline: {defaultHotline}
                  </a>
                  <a
                    href={defaultZaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl sm:rounded-2xl font-black text-white text-sm sm:text-base shadow-lg shadow-sky-500/20 bg-[#0072CE] hover:brightness-110 transition"
                  >
                    <span>💬</span> Nhắn Zalo Báo Giá Tức Thì
                  </a>
                </div>
              </div>
            )}

            {/* Nút quay lại chọn xe khác */}
            <div className="text-center pt-1">
              <Button
                type="button"
                variant="link"
                onClick={handleReset}
                className="text-xs sm:text-sm font-bold text-slate-500 hover:text-[#0072CE] underline cursor-pointer transition h-auto p-0"
              >
                ← Chọn lại dòng xe hoặc phiên bản khác
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
