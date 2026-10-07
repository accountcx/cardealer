'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Cpu,
  Sliders,
  Users,
  Fuel,
  ShieldCheck,
  Maximize2,
  Monitor,
  Radio,
  RotateCw,
} from 'lucide-react';
import { Card, Input, Button } from '@cardealer/ui';
import { aiService } from '../../../../services/ai.service';

// 🧠 Mental Model: Tab 2 - 6 Tính Năng Nổi Bật (Highlight Features).
// Grid 6 thẻ điểm nhấn bán hàng hiển thị trực tiếp ở Hero Section của từng dòng xe.
// Tích hợp AI sinh thông minh:
// 1. Nút sinh tự động cả 6 điểm nhấn theo đúng thông số dòng xe.
// 2. Nút AI sinh riêng từng ô điểm nhấn để linh hoạt bổ sung, tránh thiếu sót.

export interface HighlightFeatureItem {
  icon: string;
  title: string;
  value: string;
}

interface TabFeaturesProps {
  features: HighlightFeatureItem[];
  setFeatures: React.Dispatch<React.SetStateAction<HighlightFeatureItem[]>>;
  carName?: string;
}

const ICON_OPTIONS = [
  { value: 'engine', label: 'Động cơ', icon: Cpu },
  { value: 'transmission', label: 'Hộp số', icon: Sliders },
  { value: 'power', label: 'Công suất', icon: Zap },
  { value: 'seat', label: 'Chỗ ngồi', icon: Users },
  { value: 'fuel', label: 'Nhiên liệu', icon: Fuel },
  { value: 'safety', label: 'An toàn', icon: ShieldCheck },
  { value: 'dimension', label: 'Kích thước', icon: Maximize2 },
  { value: 'screen', label: 'Màn hình', icon: Monitor },
  { value: 'sensor', label: 'Cảm biến', icon: Radio },
  { value: 'design', label: 'Thiết kế', icon: Sparkles },
];

function renderFeatureIcon(iconKey: string) {
  const matched = ICON_OPTIONS.find((opt) => opt.value === iconKey);
  const IconComp = matched ? matched.icon : Sparkles;
  return <IconComp size={16} className="text-sky-400" />;
}

export function TabFeatures({ features, setFeatures, carName }: TabFeaturesProps) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const updateFeature = (index: number, field: keyof HighlightFeatureItem, val: string) => {
    setFeatures((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // AI Điền Tự Động Cả 6 Điểm Nhấn
  const handleGenerateAllFeatures = async () => {
    setGeneratingAll(true);
    try {
      const res = await aiService.generate({
        action: 'generate_car_content',
        carModel: carName || 'Xe ô tô Hyundai',
        prompt: `Tạo 6 điểm nhấn công nghệ cho xe ${carName || 'Hyundai'}`,
        location: 'Nghệ An & Hà Tĩnh',
      });
      if (res?.carContent?.highlightFeatures && res.carContent.highlightFeatures.length > 0) {
        setFeatures(res.carContent.highlightFeatures);
      }
    } catch (err) {
      console.error('Lỗi sinh toàn bộ tính năng:', err);
    } finally {
      setGeneratingAll(false);
    }
  };

  // AI Điền Riêng Từng Mục Điểm Nhấn
  const handleGenerateSingleFeature = async (index: number) => {
    setGeneratingIndex(index);
    try {
      const res = await aiService.generate({
        action: 'generate_car_content',
        carModel: carName || 'Xe ô tô Hyundai',
        prompt: `Lấy điểm nhấn kỹ thuật vị trí #${index + 1} cho xe ${carName || 'Hyundai'}`,
        location: 'Nghệ An & Hà Tĩnh',
      });
      if (res?.carContent?.highlightFeatures?.[index]) {
        const targetFeat = res.carContent.highlightFeatures[index];
        setFeatures((prev) => {
          const copy = [...prev];
          copy[index] = {
            icon: targetFeat.icon || copy[index]?.icon || 'engine',
            title: targetFeat.title || copy[index]?.title || '',
            value: targetFeat.value || copy[index]?.value || '',
          };
          return copy;
        });
      }
    } catch (err) {
      console.error('Lỗi sinh tính năng riêng:', err);
    } finally {
      setGeneratingIndex(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-sky-400" />
            <h3 className="text-base font-bold text-slate-100">
              6 Điểm Nhấn Công Nghệ & Vận Hành Đắt Giá Nhất
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Hiển thị dạng Icon Badge nổi bật ngay dưới banner dòng xe để gây ấn tượng mạnh với khách mua xe.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleGenerateAllFeatures}
          isLoading={generatingAll}
          leftIcon={<Sparkles size={14} className="text-amber-400" />}
          className="border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 shrink-0 font-medium cursor-pointer"
        >
          ✨ AI Điền Tự Động Cả 6 Điểm Nhấn
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feat, idx) => (
          <Card key={idx} variant="default" className="p-4 border-slate-700/60 bg-slate-900/60 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    {renderFeatureIcon(feat.icon)}
                  </div>
                  <span className="text-xs font-bold text-sky-400">
                    Điểm nhấn #{idx + 1}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGenerateSingleFeature(idx)}
                  isLoading={generatingIndex === idx}
                  className="h-6 px-2 text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 rounded cursor-pointer"
                  title={`Dùng AI sinh riêng thông số cho điểm nhấn #${idx + 1}`}
                >
                  <Sparkles size={11} className="mr-1 text-amber-400" />
                  AI Điền
                </Button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Biểu Tượng (Icon)
                </label>
                <select
                  value={feat.icon || 'engine'}
                  onChange={(e) => updateFeature(idx, 'icon', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tiêu đề (Viết hoa ngắn gọn)"
                value={feat.title}
                onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                placeholder="Ví dụ: ĐỘNG CƠ, HỘP SỐ..."
              />

              <Input
                label="Giá trị / Công nghệ"
                value={feat.value}
                onChange={(e) => updateFeature(idx, 'value', e.target.value)}
                placeholder="Ví dụ: Smartstream 1.5L, 115 Mã Lực..."
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
