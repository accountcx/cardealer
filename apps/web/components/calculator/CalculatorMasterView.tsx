'use client';

// 🧠 Mental Model: Master View điều hướng và đồng bộ trạng thái giữa 2 công cụ tài chính:
// 1. Tính Giá Lăn Bánh (SmartCalculator)
// 2. Dự Toán Trả Góp Ngân Hàng (InstallmentEstimatorTab)
// Đồng bộ xe & phiên bản đang chọn qua lại giữa 2 Tab để khách hàng không phải chọn lại.

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@cardealer/ui';
import SmartCalculator, { type CarItem, type CarVersionItem } from './SmartCalculator';
import InstallmentEstimatorTab from './InstallmentEstimatorTab';

interface CalculatorMasterViewProps {
  cars: CarItem[];
  initialCarSlug?: string;
  initialSegment?: string;
  defaultHotline?: string;
  defaultZaloUrl?: string;
}

export default function CalculatorMasterView({
  cars,
  initialCarSlug,
  initialSegment,
  defaultHotline = '0981.234.567',
  defaultZaloUrl = 'https://zalo.me/0981234567',
}: CalculatorMasterViewProps) {
  const searchParams = useSearchParams();
  const targetSlug = searchParams.get('model') || searchParams.get('xe') || searchParams.get('car') || initialCarSlug;
  const targetSegment = searchParams.get('segment') || initialSegment;
  const targetVersionSlug = searchParams.get('phien-ban') || searchParams.get('version');
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'rolling' | 'installment'>(
    tabParam === 'tra-gop' || tabParam === 'installment' ? 'installment' : 'rolling'
  );
  const [rollingState, setRollingState] = useState<'input' | 'gate' | 'success'>('input');
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [carList, setCarList] = useState<CarItem[]>(cars);

  // 🧠 Mental Model: Xử lý cử chỉ vuốt ngang (Swipe Gesture) tự nhiên trên mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Chỉ nhận diện swipe khi độ vuốt ngang > 55px và góc vuốt ngang chiếm ưu thế (> 1.5 lần trục dọc)
    // Hoàn toàn không ảnh hưởng hay cản trở thao tác cuộn dọc trang
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && activeTab === 'rolling') {
        // Vuốt sang trái -> chuyển sang Tab 2 (Vay trả góp)
        setActiveTab('installment');
      } else if (deltaX > 0 && activeTab === 'installment') {
        // Vuốt sang phải -> quay lại Tab 1 (Giá lăn bánh)
        setActiveTab('rolling');
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // 🧠 Mental Model: Hàm tìm kiếm xe ban đầu phù hợp với Query Param URL (?model=... / ?xe=... / ?segment=...)
  const findMatchingCar = (carListToSearch: CarItem[], slugOrName?: string | null, segment?: string | null) => {
    if (!carListToSearch || carListToSearch.length === 0) return undefined;
    if (slugOrName) {
      const clean = slugOrName.toLowerCase().trim();
      const matched = (
        carListToSearch.find((c) => c.slug?.toLowerCase() === clean) ||
        carListToSearch.find((c) => c.slug?.toLowerCase().includes(clean)) ||
        carListToSearch.find((c) => c.tenXe?.toLowerCase().includes(clean)) ||
        carListToSearch.find((c) => clean.includes(c.slug?.toLowerCase()))
      );
      if (matched) return matched;
    }
    if (segment && segment !== 'all') {
      const cleanSeg = segment.toLowerCase().trim();
      const matched = carListToSearch.find((c) => c.segment?.toLowerCase() === cleanSeg);
      if (matched) return matched;
    }
    return carListToSearch[0];
  };

  const findMatchingVersion = (matchedCar?: CarItem, verSlug?: string | null) => {
    if (!matchedCar || !matchedCar.versions || matchedCar.versions.length === 0) return null;
    if (verSlug) {
      const cleanVer = verSlug.toLowerCase().trim();
      const found = matchedCar.versions.find(
        (v) =>
          v.slug?.toLowerCase() === cleanVer ||
          v.tenPhienBan?.toLowerCase().includes(cleanVer) ||
          cleanVer.includes(v.slug?.toLowerCase() || '')
      );
      if (found) return found;
    }
    return matchedCar.versions[0] || null;
  };

  const initialMatchedCar = findMatchingCar(cars, targetSlug, targetSegment);

  // Trạng thái xe đang chọn đồng bộ giữa 2 tab
  const [syncedCarName, setSyncedCarName] = useState<string>(
    initialMatchedCar?.tenXe || cars[0]?.tenXe || 'Hyundai Tucson 2025'
  );
  const [syncedVersion, setSyncedVersion] = useState<CarVersionItem | null>(
    findMatchingVersion(initialMatchedCar, targetVersionSlug) ||
      initialMatchedCar?.versions?.[0] ||
      cars[0]?.versions?.[0] ||
      null
  );

  // Đồng bộ tab từ URL searchParams
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab === 'tra-gop' || currentTab === 'installment') {
      setActiveTab('installment');
    } else if (currentTab === 'lan-banh' || currentTab === 'rolling') {
      setActiveTab('rolling');
    }
  }, [searchParams]);

  // Cập nhật khi props cars hoặc targetSlug/targetSegment thay đổi
  useEffect(() => {
    if (cars && cars.length > 0) {
      setCarList(cars);
      if (targetSlug || targetSegment) {
        const matched = findMatchingCar(cars, targetSlug, targetSegment);
        if (matched) {
          setSyncedCarName(matched.tenXe);
          setSyncedVersion(findMatchingVersion(matched, targetVersionSlug));
        }
      }
    }
  }, [cars, targetSlug, targetSegment, targetVersionSlug]);

  const handleVersionChange = (version: CarVersionItem | null, carName: string) => {
    setSyncedCarName(carName);
    setSyncedVersion(version);
  };

  const handleSwitchToInstallment = () => {
    setActiveTab('installment');
    // Cuộn nhẹ lên đầu bảng tính để khách thấy ngay
    const calcElement = document.getElementById('calculator-main-anchor');
    if (calcElement) {
      calcElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Tab Switcher - Ẩn ở Bước 2 để tránh tốn diện tích & tránh bấm nhầm mất tiến trình */}
      {activeTab === 'rolling' && rollingState !== 'input' ? (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100/90 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setResetSignal((prev) => prev + 1);
              setRollingState('input');
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#002C6C] transition cursor-pointer"
          >
            <span>←</span>
            <span>Chọn lại xe hoặc phiên bản khác</span>
          </button>
          <span className="text-[11px] sm:text-xs font-bold text-[#0072CE]">
            {rollingState === 'gate' ? 'Bước 2/2' : '✓ Hoàn tất'}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 px-1 sm:px-2">
          {/* Segmented Control iOS Style */}
          <div className="w-full max-w-md sm:max-w-lg grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 shadow-inner gap-1.5">
            <Button
              type="button"
              onClick={() => setActiveTab('rolling')}
              className={`w-full h-auto flex items-center justify-center gap-1 min-[360px]:gap-1.5 sm:gap-2 px-1 min-[360px]:px-2 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer border-0 whitespace-nowrap overflow-hidden ${activeTab === 'rolling'
                ? 'bg-[#002C6C] text-white shadow-md shadow-blue-950/25'
                : 'bg-white/80 text-slate-700 hover:text-slate-950 hover:bg-white shadow-sm border border-slate-200/60'
                }`}
            >
              <span className="shrink-0 text-xs min-[360px]:text-sm">🚗</span>
              <span className="sm:hidden font-black text-[11px] min-[360px]:text-xs tracking-tight truncate">1. GIÁ LĂN BÁNH</span>
              <span className="hidden sm:inline font-black text-xs sm:text-sm tracking-wide">1. DỰ TOÁN GIÁ LĂN BÁNH</span>
            </Button>

            <Button
              type="button"
              onClick={() => setActiveTab('installment')}
              className={`w-full h-auto flex items-center justify-center gap-1 min-[360px]:gap-1.5 sm:gap-2 px-1 min-[360px]:px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer border-0 whitespace-nowrap overflow-hidden relative ${activeTab === 'installment'
                ? 'bg-[#002C6C] text-white shadow-md shadow-blue-950/25'
                : 'bg-white/80 text-slate-700 hover:text-slate-950 hover:bg-white shadow-sm border border-slate-200/60'
                }`}
            >
              <span className="shrink-0 text-xs min-[360px]:text-sm">💳</span>
              <span className="sm:hidden font-black text-[11px] min-[360px]:text-xs tracking-tight truncate">2. VAY TRẢ GÓP</span>
              <span className="hidden sm:inline font-black text-xs sm:text-sm tracking-wide">2. DỰ TOÁN VAY TRẢ GÓP</span>
              {/* Badge kích thích tò mò: Lãi 7.9% */}
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-tight bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm shrink-0 animate-pulse">
                Lãi 7.9%
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Tab Content với Touch Swipe Gesture */}
      <div
        id="calculator-main-anchor"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="transition-all duration-300"
      >
        {activeTab === 'rolling' ? (
          <SmartCalculator
            cars={carList}
            initialCarSlug={targetSlug}
            defaultHotline={defaultHotline}
            defaultZaloUrl={defaultZaloUrl}
            onVersionChange={handleVersionChange}
            onStateChange={setRollingState}
            resetSignal={resetSignal}
            onSwitchToInstallment={handleSwitchToInstallment}
          />
        ) : (
          <InstallmentEstimatorTab
            giaXe={syncedVersion?.giaNiemYet || carList[0]?.versions?.[0]?.giaNiemYet || 769_000_000}
            tenXe={syncedCarName}
            tenPhienBan={syncedVersion?.tenPhienBan || carList[0]?.versions?.[0]?.tenPhienBan || ''}
            defaultHotline={defaultHotline}
            defaultZaloUrl={defaultZaloUrl}
          />
        )}
      </div>
    </div>
  );
}
