'use client';

import React, { useState } from 'react';
import { Save, Check, Pin, PhoneCall, Sparkles, Eye } from 'lucide-react';
import { Button, Card, Input, Switch } from '@cardealer/ui';
import type { StickyBarSettings } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';

export interface StickyBarSectionProps {
  initialData: StickyBarSettings;
}

// 🧠 Mental Model: Quản trị Thanh Chốt Đơn Cố Định Chân Trang (ProductStickyBar).
// Cho phép Admin tùy biến nhãn CTA, số hotline gọi nhanh và bật/tắt trên từng thiết bị.
export const StickyBarSection = ({ initialData }: StickyBarSectionProps) => {
  const [formData, setFormData] = useState<StickyBarSettings>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof StickyBarSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<StickyBarSettings>('sticky_bar_settings', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Pin className="w-5 h-5 text-[#0072CE]" />
            <span>Thanh Chốt Đơn Chân Trang (Sticky Bar)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ghim cố định ở đáy màn hình khi cuộn trang, thúc đẩy khách hàng bấm gọi hoặc nhận báo giá ngay lập tức.
          </p>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#0072CE] hover:bg-[#005BA4] text-white text-xs sm:text-sm h-10 px-5 shadow-lg shadow-[#0072CE]/25"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Đã Lưu</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang Lưu...' : 'Lưu Cấu Hình'}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/40 text-red-400 text-xs sm:text-sm rounded-xl border border-red-800/60">
          {error}
        </div>
      )}

      <Card className="p-5 border-slate-800 bg-slate-900/90 rounded-2xl space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-sm font-bold text-white block">Kích Hoạt Thanh Chốt Đơn Toàn Cục</span>
            <span className="text-xs text-slate-400">Bật/tắt hiển thị trên Storefront</span>
          </div>
          <Switch
            checked={formData.enabled}
            onCheckedChange={(val) => handleChange('enabled', val)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Chữ Trên Nút Nhận Báo Giá (CTA Text) *"
            required
            value={formData.ctaText}
            onChange={(e) => handleChange('ctaText', e.target.value)}
            placeholder="VD: NHẬN BÁO GIÁ"
          />

          <Input
            label="Chữ Trên Nút Gọi Điện (Mobile Label) *"
            required
            value={formData.callText}
            onChange={(e) => handleChange('callText', e.target.value)}
            placeholder="VD: GỌI NGAY"
          />

          <Input
            label="Số Hotline Gọi Nhanh *"
            required
            value={formData.hotline}
            onChange={(e) => handleChange('hotline', e.target.value)}
            placeholder="VD: 0981.234.567"
          />

          <Input
            label="Thông Điệp Phụ Kích Cầu (Subtitle)"
            value={formData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="VD: Hỗ trợ trả góp 85% • Giao xe tận nhà"
          />
        </div>

        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.showOnDesktop}
              onCheckedChange={(val) => handleChange('showOnDesktop', val)}
            />
            <span className="text-xs font-medium text-slate-300">Hiển thị trên Máy tính (Desktop)</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.showOnMobile}
              onCheckedChange={(val) => handleChange('showOnMobile', val)}
            />
            <span className="text-xs font-medium text-slate-300">Hiển thị trên Điện thoại (Mobile)</span>
          </div>
        </div>
      </Card>

      {/* Live Visual Preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Xem Trước Trực Quan Khi Xuất Hiện Dưới Chân Màn Hình</span>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                <span>Hyundai Tucson 2026</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs text-slate-400 truncate">{formData.subtitle}</div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-9 px-3 rounded-xl border border-slate-700 text-sky-400 font-semibold text-xs flex items-center gap-1.5 bg-slate-800/80">
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                <span>{formData.hotline}</span>
              </div>
              <div className="h-9 px-4 rounded-xl bg-[#0072CE] text-white font-bold text-xs flex items-center justify-center shadow-md shadow-[#0072CE]/30">
                {formData.ctaText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
