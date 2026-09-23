'use client';

import React from 'react';
import type { RollingEstimateCalloutConfig } from '@cardealer/types';
import { Input, Textarea, Label } from '@cardealer/ui';

export interface RollingEstimateFormProps {
  data: RollingEstimateCalloutConfig;
  onChange: (updated: RollingEstimateCalloutConfig) => void;
}

// 🧠 Mental Model: Form cấu hình Phân Khu 4 - Banner Mồi Câu Dẫn Về Trang Tính Giá (Lead Magnet Callout).
// Chuẩn hóa 100% bằng Design System Primitives từ @cardealer/ui (Input, Textarea, Label).
export const RollingEstimateForm: React.FC<RollingEstimateFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof RollingEstimateCalloutConfig>(
    field: K,
    value: RollingEstimateCalloutConfig[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleCommitmentChange = (index: number, val: string) => {
    const updated = [...(data.commitments || [])];
    updated[index] = val;
    updateField('commitments', updated);
  };

  return (
    <div className="space-y-5 pt-4 border-t border-slate-800/80">
      {/* Huy hiệu & Nhãn nút CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Huy Hiệu Nhỏ (Badge Text)
          </Label>
          <Input
            type="text"
            value={data.badgeText}
            onChange={(e) => updateField('badgeText', e.target.value)}
            placeholder="Minh Bạch Giá — Không Chi Phí Ẩn"
            className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
          />
        </div>

        <div>
          <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Nhãn Nút Kêu Gọi Hành Động (CTA Button)
          </Label>
          <Input
            type="text"
            value={data.buttonText}
            onChange={(e) => updateField('buttonText', e.target.value)}
            placeholder="Dự Toán Lăn Bánh Tức Thì (Bước 1/2)"
            className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
          />
        </div>
      </div>

      {/* Tiêu đề giật tít đánh trúng tâm lý */}
      <div>
        <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Tiêu Đề Lớn Kích Thích Tò Mò (Headline)
        </Label>
        <Textarea
          value={data.headline}
          onChange={(e) => updateField('headline', e.target.value)}
          rows={2}
          placeholder="Bạn muốn biết giá lăn bánh chính xác tại TP. Vinh hoặc các huyện Nghệ An sau khi trừ hết khuyến mại tiền mặt?"
          className="w-full bg-slate-950/80 border-slate-800 text-white text-sm resize-none"
        />
      </div>

      {/* Đoạn mô tả chi tiết */}
      <div>
        <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Đoạn Mô Tả Biểu Phí &amp; Khuyến Mãi (Description)
        </Label>
        <Textarea
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          placeholder="Dự toán trọn gói biểu phí nhà nước kèm quà tặng phụ kiện..."
          className="w-full bg-slate-950/80 border-slate-800 text-white text-sm resize-none"
        />
      </div>

      {/* 3 Cam kết nhanh */}
      <div>
        <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          3 Cam Kết Nhanh (Gia Tăng Tỷ Lệ Nhấp)
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((idx) => (
            <Input
              key={idx}
              type="text"
              value={data.commitments?.[idx] || ''}
              onChange={(e) => handleCommitmentChange(idx, e.target.value)}
              placeholder={`Cam kết ${idx + 1}`}
              className="w-full h-10 bg-slate-950/80 border-slate-800 text-white text-xs"
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        💡 <em>Mẹo:</em> Khối banner này sẽ tự động gắn tham số phân khúc và mức giá khách hàng đang chọn trên trang chủ để chuyển thẳng sang công cụ tính giá lăn bánh.
      </p>
    </div>
  );
};
