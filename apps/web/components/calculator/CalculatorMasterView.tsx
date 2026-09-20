'use client';

// 🧠 Mental Model: Master View điều hướng và đồng bộ trạng thái giữa 2 công cụ tài chính:
// 1. Tính Giá Lăn Bánh (SmartCalculator)
// 2. Dự Toán Trả Góp Ngân Hàng (InstallmentEstimatorTab)
// Đồng bộ xe & phiên bản đang chọn qua lại giữa 2 Tab để khách hàng không phải chọn lại.

import { useState } from 'react';
import SmartCalculator, { type CarItem, type CarVersionItem } from './SmartCalculator';
import InstallmentEstimatorTab from './InstallmentEstimatorTab';

interface CalculatorMasterViewProps {
  cars: CarItem[];
  defaultHotline?: string;
  defaultZaloUrl?: string;
}

export default function CalculatorMasterView({
  cars,
  defaultHotline = '0941.153.666',
  defaultZaloUrl = 'https://zalo.me/0941153666',
}: CalculatorMasterViewProps) {
  const [activeTab, setActiveTab] = useState<'rolling' | 'installment'>('rolling');

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
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('rolling')}
            className={`flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
              activeTab === 'rolling'
                ? 'bg-[#002C6C] text-white shadow-lg shadow-blue-950/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🚗</span>
            <span>1. DỰ TOÁN GIÁ LĂN BÁNH</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('installment')}
            className={`flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
              activeTab === 'installment'
                ? 'bg-[#002C6C] text-white shadow-lg shadow-blue-950/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>💳</span>
            <span>2. DỰ TOÁN VAY TRẢ GÓP</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'rolling' ? (
          <SmartCalculator
            cars={cars}
            defaultHotline={defaultHotline}
            defaultZaloUrl={defaultZaloUrl}
            onVersionChange={handleVersionChange}
          />
        ) : (
          <InstallmentEstimatorTab
            giaXe={syncedVersion?.giaNiemYet || cars[0]?.versions?.[0]?.giaNiemYet || 769_000_000}
            tenXe={syncedCarName}
            tenPhienBan={syncedVersion?.tenPhienBan || cars[0]?.versions?.[0]?.tenPhienBan || ''}
            defaultHotline={defaultHotline}
            defaultZaloUrl={defaultZaloUrl}
          />
        )}
      </div>
    </div>
  );
}
