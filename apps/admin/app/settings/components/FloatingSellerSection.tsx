'use client';

import React, { useState } from 'react';
import { Save, Check, UserCheck, ShieldCheck, PhoneCall, MessageCircle, Eye } from 'lucide-react';
import { Button, Card } from '@cardealer/ui';
import type { FloatingSellerSettings } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';

export interface FloatingSellerSectionProps {
  initialData: FloatingSellerSettings;
}

// 🧠 Mental Model: Quản trị Widget Chuyên Viên Nổi (FloatingSeller).
// Cho phép đổi chuyên viên trực ca, avatar, số điện thoại hotline và link Zalo trực tiếp.
// Kèm khung xem trước trực quan (Live Visual Preview) giúp Admin yên tâm trước khi bấm lưu.
export const FloatingSellerSection = ({ initialData }: FloatingSellerSectionProps) => {
  const [formData, setFormData] = useState<FloatingSellerSettings>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FloatingSellerSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<FloatingSellerSettings>('floating_seller_settings', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu cấu hình chuyên viên');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Cấu Hình Widget Chuyên Viên Tư Vấn Nổi</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tùy biến avatar, thông tin liên hệ và lời chào hiển thị góc màn hình Storefront.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs (2 Cột) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 border-slate-800 bg-slate-900/90 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white">Trạng Thái Kích Hoạt Widget</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0072CE]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ Tên Chuyên Viên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sellerName}
                  onChange={(e) => handleChange('sellerName', e.target.value)}
                  placeholder="VD: Tuấn Hyundai"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số Hotline Kích Hoạt Cuộc Gọi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sellerPhone}
                  onChange={(e) => handleChange('sellerPhone', e.target.value)}
                  placeholder="VD: 0981.234.567"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Liên Kết Zalo (OA hoặc cá nhân) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sellerZalo}
                  onChange={(e) => handleChange('sellerZalo', e.target.value)}
                  placeholder="https://zalo.me/0981234567"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đường Dẫn Ảnh Avatar (WebP/JPG)
                </label>
                <input
                  type="text"
                  value={formData.sellerAvatar}
                  onChange={(e) => handleChange('sellerAvatar', e.target.value)}
                  placeholder="/images/avatars/sale-tuan.webp"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dòng Trạng Thái (Status Text)
              </label>
              <input
                type="text"
                value={formData.statusText}
                onChange={(e) => handleChange('statusText', e.target.value)}
                placeholder="VD: Đang trực tuyến - Hỗ trợ 24/7"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lời Chào Tư Vấn (Greeting Message)
              </label>
              <textarea
                rows={2}
                value={formData.greetingMessage}
                onChange={(e) => handleChange('greetingMessage', e.target.value)}
                placeholder="Nhập lời chào thân thiện đến khách hàng..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-colors"
              />
            </div>
          </Card>
        </div>

        {/* Live Visual Preview (1 Cột) */}
        <div>
          <div className="sticky top-20 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Xem Trước Trực Quan (Preview)</span>
            </div>

            <Card className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-xl">
              {/* Preview Card */}
              <div className="w-full bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full bg-slate-800 overflow-hidden border-2 border-[#0072CE] flex items-center justify-center font-bold text-xs text-slate-300">
                    AVATAR
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1">
                      {formData.sellerName || 'Tên chuyên viên'}
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{formData.statusText || 'Trực tuyến'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                  {formData.greetingMessage || 'Lời chào'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-[#002C6C] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>Gọi Ngay</span>
                  </div>
                  <div className="h-8 bg-[#0068FF] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>Chat Zalo</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center">
                Trạng thái: <span className="font-semibold text-white">{formData.enabled ? 'Đang bật' : 'Đang tắt'}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
};
