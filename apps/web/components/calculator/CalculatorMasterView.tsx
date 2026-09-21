'use client';

// 🧠 Mental Model: Master View điều hướng và đồng bộ trạng thái giữa 2 công cụ tài chính:
// 1. Tính Giá Lăn Bánh (SmartCalculator)
// 2. Dự Toán Trả Góp Ngân Hàng (InstallmentEstimatorTab)
// Đồng bộ xe & phiên bản đang chọn qua lại giữa 2 Tab để khách hàng không phải chọn lại.

import { useState, useEffect } from 'react';
import { Button } from '@cardealer/ui';
import SmartCalculator, { type CarItem, type CarVersionItem } from './SmartCalculator';
import InstallmentEstimatorTab from './InstallmentEstimatorTab';

interface CalculatorMasterViewProps {
  cars: CarItem[];
  defaultHotline?: string;
  defaultZaloUrl?: string;
}

export default function CalculatorMasterView({
  cars,
  defaultHotline = '0981.234.567',
  defaultZaloUrl = 'https://zalo.me/0981234567',
}: CalculatorMasterViewProps) {
  const [activeTab, setActiveTab] = useState<'rolling' | 'installment'>('rolling');
  const [carList, setCarList] = useState<CarItem[]>(cars);

  // Cập nhật khi props cars thay đổi
  useEffect(() => {
    if (cars && cars.length > 0) {
      setCarList(cars);
    }
  }, [cars]);

  // Trạng thái xe đang chọn đồng bộ giữa 2 tab
  const [syncedCarName, setSyncedCarName] = useState<string>(cars[0]?.tenXe || 'Hyundai Tucson 2025');
  const [syncedVersion, setSyncedVersion] = useState<CarVersionItem | null>(
    cars[0]?.versions?.[0] || null
  );

  const handleVersionChange = (version: CarVersionItem | null, carName: string) => {
    setSyncedCarName(carName);
    setSyncedVersion(version);
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher với tương phản cao chuẩn UX */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/90 border border-slate-300/90 shadow-inner">
          <Button
            type="button"
            onClick={() => setActiveTab('rolling')}
            className={`h-auto flex items-center gap-2 sm:gap-2.5 px-4 sm:px-8 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer border-0 ${
              activeTab === 'rolling'
                ? 'bg-[#002C6C] text-white shadow-lg shadow-blue-950/20'
                : 'bg-transparent text-slate-700 hover:text-slate-950 hover:bg-white/60 shadow-none'
            }`}
          >
            <span>🚗</span>
            <span>1. DỰ TOÁN GIÁ LĂN BÁNH</span>
          </Button>

          <Button
            type="button"
            onClick={() => setActiveTab('installment')}
            className={`h-auto flex items-center gap-2 sm:gap-2.5 px-4 sm:px-8 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer border-0 ${
              activeTab === 'installment'
                ? 'bg-[#002C6C] text-white shadow-lg shadow-blue-950/20'
                : 'bg-transparent text-slate-700 hover:text-slate-950 hover:bg-white/60 shadow-none'
            }`}
          >
            <span>💳</span>
            <span>2. DỰ TOÁN VAY TRẢ GÓP</span>
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'rolling' ? (
          <SmartCalculator
            cars={carList}
            defaultHotline={defaultHotline}
            defaultZaloUrl={defaultZaloUrl}
            onVersionChange={handleVersionChange}
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
