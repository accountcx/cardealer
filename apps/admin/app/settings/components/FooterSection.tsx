'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Save, Check, MapPin, Eye, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button, Card, Switch, Input, Textarea, Label } from '@cardealer/ui';
import type { FooterSettings, FooterLinkItem } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';

export interface FooterSectionProps {
  initialData: FooterSettings;
}

// 🧠 Mental Model: Quản trị Chân Trang Storefront (Footer Management).
// Cho phép Admin tùy biến 100% nội dung:
// - Mô tả đại lý Cột 1
// - Danh mục liên kết Dòng xe Cột 2
// - Danh mục liên kết Công cụ & Hậu mãi Cột 3 (kèm badge HOT)
// - Mã nhúng Google Maps iframe Cột 4
// - Huy hiệu chứng nhận chính hãng
export const FooterSection = ({ initialData }: FooterSectionProps) => {
  const [formData, setFormData] = useState<FooterSettings>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FooterSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Cột 2: Dòng xe
  const handleAddCol2Link = () => {
    const newItem: FooterLinkItem = {
      id: `f2-${Date.now()}`,
      label: 'Dòng Xe Mới',
      url: '/xe',
      newTab: false,
    };
    setFormData((prev) => ({ ...prev, column2Links: [...prev.column2Links, newItem] }));
  };

  const handleUpdateCol2Link = (index: number, field: keyof FooterLinkItem, value: unknown) => {
    const updated = [...formData.column2Links];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, column2Links: updated }));
  };

  const handleDeleteCol2Link = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      column2Links: prev.column2Links.filter((_, i) => i !== index),
    }));
  };

  // Cột 3: Công cụ
  const handleAddCol3Link = () => {
    const newItem: FooterLinkItem = {
      id: `f3-${Date.now()}`,
      label: 'Liên Kết Dịch Vụ',
      url: '/gia-lan-banh',
      badge: '',
      newTab: false,
    };
    setFormData((prev) => ({ ...prev, column3Links: [...prev.column3Links, newItem] }));
  };

  const handleUpdateCol3Link = (index: number, field: keyof FooterLinkItem, value: unknown) => {
    const updated = [...formData.column3Links];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, column3Links: updated }));
  };

  const handleDeleteCol3Link = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      column3Links: prev.column3Links.filter((_, i) => i !== index),
    }));
  };

  // Lưu cấu hình footer_settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<FooterSettings>('footer_settings', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu cấu hình chân trang');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Quản Trị Chân Trang (Footer CMS)</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tùy biến các cột liên kết, mã nhúng bản đồ Google Maps và chứng nhận chính hãng ở đáy website.
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
              <span>{saving ? 'Đang Lưu...' : 'Lưu Chân Trang'}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/40 text-red-400 text-xs sm:text-sm rounded-xl border border-red-800/60">
          {error}
        </div>
      )}

      {/* Cấu Hình Cột 1 & Huy Hiệu Chứng Nhận */}
      <Card className="p-5 border-slate-800 bg-slate-900/90 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-sm font-bold text-white block">Mô Tả Đại Lý (Cột 1) & Chứng Nhận Pháp Lý</span>
            <span className="text-xs text-slate-400">Xuất hiện ngay dưới logo Xe Hyundai Vinh</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">Bật huy hiệu chứng nhận:</span>
            <Switch
              checked={formData.showCertifiedBadge}
              onCheckedChange={(val) => handleChange('showCertifiedBadge', val)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="block text-xs font-semibold text-slate-300 mb-1">
              Đoạn Giới Thiệu Ngắn (Cột 1) *
            </Label>
            <Textarea
              rows={2}
              required
              value={formData.column1Description}
              onChange={(e) => handleChange('column1Description', e.target.value)}
              placeholder="VD: Chuyên trang phân phối và cập nhật bảng giá xe Hyundai chính hãng..."
              className="w-full border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE]"
            />
          </div>

          <div>
            <Label className="block text-xs font-semibold text-slate-300 mb-1">
              Chữ Trên Huy Hiệu Chứng Nhận (Badge Text)
            </Label>
            <Input
              type="text"
              value={formData.certifiedBadgeText}
              onChange={(e) => handleChange('certifiedBadgeText', e.target.value)}
              placeholder="VD: Chính Hãng TC Motor"
              className="w-full border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE]"
            />
          </div>
        </div>
      </Card>

      {/* Cấu Hình Cột 2 & Cột 3 Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CỘT 2: DÒNG XE HYUNDAI */}
        <Card className="p-5 border-slate-800 bg-slate-900/90 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white block">Cột 2: Danh Mục Xe</span>
              <span className="text-xs text-slate-400">({formData.column2Links.length} liên kết)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCol2Link}
              className="flex items-center gap-1.5 text-xs h-8 border-slate-700 bg-slate-800 text-sky-400 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Xe</span>
            </Button>
          </div>

          <div>
            <Label className="block text-xs font-semibold text-slate-300 mb-1">
              Tiêu Đề Cột 2 *
            </Label>
            <Input
              type="text"
              required
              value={formData.column2Title}
              onChange={(e) => handleChange('column2Title', e.target.value)}
              className="w-full border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE]"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {formData.column2Links.map((link, idx) => (
              <div key={link.id || idx} className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <Input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleUpdateCol2Link(idx, 'label', e.target.value)}
                  placeholder="Tên dòng xe"
                  className="flex-1 h-8 text-xs border-slate-700/70 bg-slate-900 text-white placeholder:text-slate-500"
                />
                <Input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateCol2Link(idx, 'url', e.target.value)}
                  placeholder="/xe?kieuDang=..."
                  className="flex-1 h-8 text-xs border-slate-700/70 bg-slate-900 text-white placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCol2Link(idx)}
                  className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Xóa liên kết"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* CỘT 3: CÔNG CỤ & DỊCH VỤ */}
        <Card className="p-5 border-slate-800 bg-slate-900/90 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white block">Cột 3: Công Cụ & Hậu Mãi</span>
              <span className="text-xs text-slate-400">({formData.column3Links.length} liên kết)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCol3Link}
              className="flex items-center gap-1.5 text-xs h-8 border-slate-700 bg-slate-800 text-sky-400 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Dịch Vụ</span>
            </Button>
          </div>

          <div>
            <Label className="block text-xs font-semibold text-slate-300 mb-1">
              Tiêu Đề Cột 3 *
            </Label>
            <Input
              type="text"
              required
              value={formData.column3Title}
              onChange={(e) => handleChange('column3Title', e.target.value)}
              className="w-full border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE]"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {formData.column3Links.map((link, idx) => (
              <div key={link.id || idx} className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <Input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleUpdateCol3Link(idx, 'label', e.target.value)}
                  placeholder="Tên công cụ/dịch vụ"
                  className="flex-1 h-8 text-xs border-slate-700/70 bg-slate-900 text-white placeholder:text-slate-500"
                />
                <Input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateCol3Link(idx, 'url', e.target.value)}
                  placeholder="/gia-lan-banh"
                  className="flex-1 h-8 text-xs border-slate-700/70 bg-slate-900 text-white placeholder:text-slate-500"
                />
                <Input
                  type="text"
                  value={link.badge || ''}
                  onChange={(e) => handleUpdateCol3Link(idx, 'badge', e.target.value)}
                  placeholder="Badge (VD: HOT)"
                  className="w-20 h-8 text-xs border-slate-700/70 bg-slate-900 text-amber-300 placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCol3Link(idx)}
                  className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Xóa liên kết"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CỘT 4: BẢN ĐỒ GOOGLE MAPS EMBED */}
      <Card className="p-5 border-slate-800 bg-slate-900/90 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-sm font-bold text-white block">Cột 4: Bản Đồ Showroom & Mã Nhúng Google Maps</span>
            <span className="text-xs text-slate-400">Nhúng trực tiếp bản đồ định vị showroom phục vụ khách hàng tìm đường</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="block text-xs font-semibold text-slate-300 mb-1">
              Tiêu Đề Cột 4 *
            </Label>
            <Input
              type="text"
              required
              value={formData.column4Title}
              onChange={(e) => handleChange('column4Title', e.target.value)}
              className="w-full border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE] mb-3"
            />

            <Label className="block text-xs font-semibold text-slate-300 mb-1">
              Đường Dẫn Iframe Google Maps Embed (URL trong thuộc tính src=&quot;...&quot;)
            </Label>
            <Textarea
              rows={3}
              value={formData.googleMapEmbed}
              onChange={(e) => handleChange('googleMapEmbed', e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE] font-mono text-xs"
            />
          </div>

          {/* Mini Preview Bản Đồ */}
          <div className="h-40 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative flex items-center justify-center">
            {formData.googleMapEmbed ? (
              <iframe
                src={formData.googleMapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Bản đồ xem trước"
              />
            ) : (
              <div className="text-center p-3 text-xs text-slate-500">
                <MapPin className="w-6 h-6 text-[#0072CE] mx-auto mb-1 opacity-70" />
                <span>Chưa nhập mã nhúng bản đồ</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </form>
  );
};
