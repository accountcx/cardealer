'use client';

import React, { useState } from 'react';
import { Save, Check, Gift, Sparkles, Eye, Clock, ArrowDownCircle, X } from 'lucide-react';
import { Button, Card, Input, Switch } from '@cardealer/ui';
import type { SlideInBannerSettings } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';

export interface SlideInBannerSectionProps {
  initialData: SlideInBannerSettings;
}

// 🧠 Mental Model: Quản trị Popup Voucher & Banner Trượt Góc (SlideInBanner).
// Cho phép Admin tùy biến thông điệp voucher khuyến mãi, nhãn nút CTA, nhãn Floating Badge và bộ kích hoạt (Timer / Scroll depth).
export const SlideInBannerSection: React.FC<SlideInBannerSectionProps> = ({ initialData }) => {
  const [formData, setFormData] = useState<SlideInBannerSettings>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof SlideInBannerSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<SlideInBannerSettings>('slide_in_banner_settings', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#0072CE]" />
            <span>Popup Voucher & Banner Trượt Góc (Slide-In Lead Magnet)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Banner trượt góc tự động kích hoạt khi khách cuộn trang hoặc có ý định rời trang, kích thích để lại SĐT nhận ưu đãi.
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
              <span>Đã Lưu Cấu Hình</span>
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

      {/* Main Settings Card */}
      <Card className="p-5 border-slate-800 bg-slate-900/90 rounded-2xl space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-sm font-bold text-white block">Kích Hoạt Banner Voucher Trượt Toàn Cục</span>
            <span className="text-xs text-slate-400">Tự động xuất hiện trong các bài viết và trang chi tiết xe</span>
          </div>
          <Switch
            checked={formData.enabled}
            onCheckedChange={(val) => handleChange('enabled', val)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Thẻ Huy Hiệu Trên Cùng (Badge Tag) *"
            required
            value={formData.badgeText}
            onChange={(e) => handleChange('badgeText', e.target.value)}
            placeholder="VD: Ưu Đãi Tuần Lễ Vàng"
          />

          <Input
            label="Tiêu Đề Voucher Ưu Đãi *"
            required
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="VD: Voucher Phụ Kiện 15.000.000đ"
          />

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Mô Tả Quyền Lợi Khách Nhận Được *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="VD: Nhận ngay bảng giá lăn bánh ưu đãi độc quyền..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE]"
            />
          </div>

          <Input
            label="Chữ Trên Nút Gửi (CTA Button) *"
            required
            value={formData.buttonText}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            placeholder="VD: Nhận Báo Giá & Voucher"
          />

          <Input
            label="Nhãn Nút Nổi Mobile (Góc Trái) *"
            required
            value={formData.mobileBadgeLabel}
            onChange={(e) => handleChange('mobileBadgeLabel', e.target.value)}
            placeholder="VD: Voucher 15Tr"
          />

          <Input
            label="Nhãn Nút Nổi Desktop (Khi Thu Nhỏ) *"
            required
            value={formData.desktopBadgeLabel}
            onChange={(e) => handleChange('desktopBadgeLabel', e.target.value)}
            placeholder="VD: Voucher Ưu Đãi 15 Triệu"
          />

          <div className="space-y-1">
            <Input
              type="number"
              min={1}
              max={60}
              label="Thời Gian Chờ Tự Động Kích Hoạt (Giây) *"
              required
              value={formData.triggerDelaySeconds}
              onChange={(e) => handleChange('triggerDelaySeconds', Math.max(1, Math.min(60, parseInt(e.target.value, 10) || 6)))}
              placeholder="6"
            />
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              Kích hoạt sau {formData.triggerDelaySeconds} giây khi khách đọc bài
            </span>
          </div>

          <div className="space-y-1">
            <Input
              type="number"
              min={0}
              max={100}
              label="Độ Sâu Cuộn Trang Để Kích Hoạt (%) *"
              required
              value={formData.triggerScrollPercent}
              onChange={(e) => handleChange('triggerScrollPercent', Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 25)))}
              placeholder="25"
            />
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ArrowDownCircle className="w-3 h-3 text-sky-400" />
              Kích hoạt khi khách cuộn qua {formData.triggerScrollPercent}% nội dung bài viết
            </span>
          </div>
        </div>
      </Card>

      {/* Live Visual Preview */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Xem Trước Trực Quan Thẻ Slide-In Trên Storefront</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Desktop Preview */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-400 block">🖥️ Hiển thị trên Máy tính (Desktop Slide-in)</span>
            <div className="max-w-sm w-full rounded-2xl bg-white border border-blue-200 shadow-xl p-4 text-slate-800 relative">
              <button type="button" aria-label="Đóng" className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2 pr-6">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                    {formData.badgeText}
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {formData.title}
                  </h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mb-3 line-clamp-2">
                {formData.description}
              </p>
              <div className="h-8 px-3 rounded-lg bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{formData.buttonText}</span>
              </div>
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-400 block">📱 Hiển thị trên Mobile (Góc dưới bên Trái)</span>
            <div className="flex items-center gap-3 pt-6">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-full shadow-lg border-2 border-white/80">
                <Gift className="w-4 h-4 text-amber-200" />
                <span className="text-xs font-black tracking-tight text-white">
                  {formData.mobileBadgeLabel}
                </span>
              </div>
              <span className="text-xs text-slate-400 italic">
                ← Chạm vào để bung Bottom Sheet nhận quà
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
