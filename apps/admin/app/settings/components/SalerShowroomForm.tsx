'use client';

import React from 'react';
import type { SalerShowroomConfig, CommitmentItem } from '@cardealer/types';
import { Input, Select, Textarea } from '@cardealer/ui';

export interface SalerShowroomFormProps {
  data: SalerShowroomConfig;
  onChange: (updated: SalerShowroomConfig) => void;
}

// 🧠 Mental Model: Form cấu hình Phân Khu 3 - VIP Showroom / Hồ Sơ Năng Lực Saler.
// Sử dụng chuẩn hóa 100% các component Primitives từ @cardealer/ui (Input, Select, Textarea).
export const SalerShowroomForm: React.FC<SalerShowroomFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof SalerShowroomConfig>(field: K, value: SalerShowroomConfig[K]) => {
    onChange({ ...data, [field]: value });
  };

  const updateCommitment = (index: number, field: keyof CommitmentItem, val: string) => {
    const updated = [...data.commitments];
    updated[index] = { ...updated[index], [field]: val };
    updateField('commitments', updated);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-800/80">
      {/* Chế độ hiển thị & Tiêu đề */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Chế Độ Hiển Thị"
          value={data.mode}
          onChange={(e) => updateField('mode', e.target.value as 'saler' | 'showroom')}
          options={[
            { value: 'saler', label: 'Hồ Sơ Chuyên Viên Tư Vấn (Cá Nhân)' },
            { value: 'showroom', label: 'Showroom Chính Hãng Chuẩn 3S' },
          ]}
        />

        <div className="md:col-span-2">
          <Input
            label="Tiêu Đề Khối Cam Kết (Headline)"
            value={data.headline}
            onChange={(e) => updateField('headline', e.target.value)}
            placeholder="Cam Kết Vàng Từ Chuyên Viên Tư Vấn"
          />
        </div>
      </div>

      {/* Dynamic Form: Hồ sơ Saler Cá Nhân vs Đại Lý Showroom 3S */}
      {data.mode === 'saler' ? (
        <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Thông Tin Chuyên Viên Tư Vấn (Chế Độ Cá Nhân)
            </h4>
            <span className="text-xs text-slate-400">Hiển thị thẻ danh thiếp chuyên viên VIP</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Họ Tên Chuyên Viên"
              value={data.salerName}
              onChange={(e) => updateField('salerName', e.target.value)}
            />
            <Input
              label="Chức Danh / Vị Trí"
              value={data.salerTitle}
              onChange={(e) => updateField('salerTitle', e.target.value)}
            />
            <Input
              label="Đường Dẫn Ảnh Đại Diện (Avatar)"
              value={data.avatarUrl}
              onChange={(e) => updateField('avatarUrl', e.target.value)}
              placeholder="/images/saler-avatar.webp"
            />
          </div>

          <Textarea
            label="Đoạn Giới Thiệu / Lời Ngỏ Tới Khách Hàng"
            rows={2}
            value={data.introStory}
            onChange={(e) => updateField('introStory', e.target.value)}
          />
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-slate-950/50 border border-sky-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0072CE]" />
              Thông Tin Showroom & Đại Lý Chuẩn 3S
            </h4>
            <span className="text-xs text-sky-400 font-medium">Hiển thị hồ sơ năng lực Showroom 3S toàn cầu</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tên Showroom / Đại Lý"
              value={data.showroomName || 'Hyundai Vinh — Đại Lý Ủy Quyền Chuẩn 3S'}
              onChange={(e) => updateField('showroomName', e.target.value)}
            />
            <Input
              label="Chứng Nhận / Nhãn Showroom"
              value={data.showroomBadge || 'Đại Lý Chuẩn 3S Toàn Cầu GDSI'}
              onChange={(e) => updateField('showroomBadge', e.target.value)}
            />
            <Input
              label="Ảnh Cơ Sở Vật Chất / Showroom"
              value={data.galleryImages?.[0] || '/images/banners/hero-event.webp'}
              onChange={(e) => updateField('galleryImages', [e.target.value])}
              placeholder="/images/banners/hero-event.webp"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Địa Chỉ Đại Lý Showroom"
              value={data.showroomAddress || 'Km 3+500 Đại Lộ Lê Nin, TP. Vinh, Nghệ An'}
              onChange={(e) => updateField('showroomAddress', e.target.value)}
            />
            <Input
              label="Quy Mô / Cơ Sở Vật Chất"
              value={data.showroomExperience || 'Quy mô 5.000m² — Xưởng dịch vụ tiêu chuẩn 3S toàn cầu'}
              onChange={(e) => updateField('showroomExperience', e.target.value)}
            />
          </div>

          <Textarea
            label="Đoạn Giới Thiệu Năng Lực Đại Lý"
            rows={2}
            value={data.showroomIntro || data.introStory}
            onChange={(e) => updateField('showroomIntro', e.target.value)}
          />
        </div>
      )}

      {/* 4 Cam kết vàng */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4">
        <h4 className="text-sm font-semibold text-white">4 Cam Kết Vàng Với Khách Hàng</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.commitments.map((c, idx) => (
            <div key={c.id || idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-mono text-[#0072CE] font-semibold block">Cam Kết #{idx + 1}</span>
              <Input
                value={c.title}
                onChange={(e) => updateCommitment(idx, 'title', e.target.value)}
                placeholder="Tiêu đề cam kết"
              />
              <Textarea
                rows={2}
                value={c.description}
                onChange={(e) => updateCommitment(idx, 'description', e.target.value)}
                placeholder="Mô tả chi tiết cam kết..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
