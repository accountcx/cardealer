import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card, Input } from '@cardealer/ui';

// 🧠 Mental Model: Tab 2 - 6 Tính Năng Nổi Bật (Highlight Features).
// Grid 6 thẻ điểm nhấn bán hàng hiển thị trực tiếp ở Hero Section của từng dòng xe.
// Sử dụng Card và Input từ @cardealer/ui (Invariant 11).

export interface HighlightFeatureItem {
  icon: string;
  title: string;
  value: string;
}

interface TabFeaturesProps {
  features: HighlightFeatureItem[];
  setFeatures: React.Dispatch<React.SetStateAction<HighlightFeatureItem[]>>;
}

export function TabFeatures({ features, setFeatures }: TabFeaturesProps) {
  const updateFeature = (index: number, field: keyof HighlightFeatureItem, val: string) => {
    setFeatures((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={18} className="text-sky-400" />
        <h3 className="text-base font-bold text-slate-100">
          6 Điểm Nhấn Công Nghệ & Vận Hành Đắt Giá Nhất
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Hiển thị dạng Icon Badge nổi bật ngay dưới banner dòng xe để gây ấn tượng mạnh với khách mua xe.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feat, idx) => (
          <Card key={idx} variant="default" className="p-4 border-slate-700/60 bg-slate-900/60">
            <div className="text-xs font-bold text-sky-400 mb-3">
              Điểm nhấn #{idx + 1}
            </div>
            <div className="space-y-3">
              <Input
                label="Tiêu đề (Viết hoa ngắn gọn)"
                value={feat.title}
                onChange={(e) => updateFeature(idx, 'title', e.target.value)}
              />
              <Input
                label="Giá trị / Công nghệ"
                value={feat.value}
                onChange={(e) => updateFeature(idx, 'value', e.target.value)}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
