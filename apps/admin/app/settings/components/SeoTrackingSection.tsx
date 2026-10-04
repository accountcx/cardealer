'use client';

import React, { useState } from 'react';
import {
  Save,
  Check,
  Activity,
  Code,
  Globe,
  FolderOpen,
} from 'lucide-react';
import { Button, Card, Input } from '@cardealer/ui';
import type { SiteSettings } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export interface SeoTrackingSectionProps {
  initialData: SiteSettings;
}

// 🧠 Mental Model: Quản trị Cấu hình SEO Tổng thể, Tracking Analytics, Pixels & Mã Nhúng Tùy Chỉnh.
// Hỗ trợ cấu hình GTM, GA4, Microsoft Clarity, FB Pixel, TikTok Pixel, Zalo Pixel,
// Custom Header Scripts (<head>), Custom Body Scripts (<body>), và Global Fallback Meta.
export const SeoTrackingSection: React.FC<SeoTrackingSectionProps> = ({ initialData }) => {
  const [formData, setFormData] = useState<SiteSettings>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal media picker cho OG Image và Favicon
  const [activeMediaTarget, setActiveMediaTarget] = useState<'defaultImage' | 'favicon' | null>(null);

  const handleChange = (field: keyof SiteSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<SiteSettings>('site_settings', formData);
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
      {/* 1. Header & Nút Lưu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              SEO, Tracking & Mã Nhúng Tùy Chỉnh
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal border border-indigo-400/30">
                Tracking & Metadata
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu hình mã theo dõi Google/Facebook/TikTok/Clarity, mã nhúng Header/Body và thông tin SEO mặc định toàn website
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          {saving ? (
            'Đang lưu...'
          ) : saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Đã lưu thành công</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* 2. Nhóm 1: Mã Theo Dõi (Tracking & Pixels) */}
      <Card variant="glass" className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-700/40">
          <Activity className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Mã Theo Dõi & Đo Lường (Tracking & Pixels)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Tag Manager ID
            </label>
            <Input
              value={formData.gtmId || ''}
              onChange={(e) => handleChange('gtmId', e.target.value)}
              placeholder="VD: GTM-MZ6HJKZR"
              className="bg-slate-800/80 border-slate-700 text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Quản lý toàn bộ tag tiếp thị tập trung qua GTM Container
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Analytics 4 ID (GA4)
            </label>
            <Input
              value={formData.gaId || ''}
              onChange={(e) => handleChange('gaId', e.target.value)}
              placeholder="VD: G-XXXXXXXXXX"
              className="bg-slate-800/80 border-slate-700 text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dùng khi không chạy qua GTM container
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Microsoft Clarity Project ID
            </label>
            <Input
              value={formData.clarityId || ''}
              onChange={(e) => handleChange('clarityId', e.target.value)}
              placeholder="VD: q7z8x9abcd"
              className="bg-slate-800/80 border-slate-700 text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Quay video màn hình & bản đồ nhiệt (Heatmap) hành vi khách hàng
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Facebook Pixel ID (Meta Pixel)
            </label>
            <Input
              value={formData.fbPixelId || ''}
              onChange={(e) => handleChange('fbPixelId', e.target.value)}
              placeholder="VD: 123456789012345"
              className="bg-slate-800/80 border-slate-700 text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Theo dõi chuyển đổi và tạo tệp đối tượng chạy Facebook Ads Retargeting
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              TikTok Pixel ID
            </label>
            <Input
              value={formData.tiktokPixelId || ''}
              onChange={(e) => handleChange('tiktokPixelId', e.target.value)}
              placeholder="VD: CXXXXXXXXXXXXXX"
              className="bg-slate-800/80 border-slate-700 text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Đo lường chuyển đổi cho các chiến dịch TikTok Ads
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Zalo Pixel / SDK ID
            </label>
            <Input
              value={formData.zaloPixelId || ''}
              onChange={(e) => handleChange('zaloPixelId', e.target.value)}
              placeholder="VD: 1234567890"
              className="bg-slate-800/80 border-slate-700 text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Theo dõi sự kiện chuyển đổi Zalo Ads
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Nhóm 2: Mã Nhúng Tùy Chỉnh (Custom Scripts) */}
      <Card variant="glass" className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-700/40">
          <Code className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Mã Nhúng Tùy Chỉnh (Custom Scripts & Meta Tags)
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Mã Nhúng Đầu Trang (&lt;head&gt;)</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Dán các thẻ &lt;meta&gt; xác minh Search Console, Facebook Domain Verification,...
              </span>
            </label>
            <textarea
              rows={4}
              value={formData.customHeaderScripts || ''}
              onChange={(e) => handleChange('customHeaderScripts', e.target.value)}
              placeholder="<meta name='google-site-verification' content='...' />&#10;<meta name='facebook-domain-verification' content='...' />"
              className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3.5 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Mã Nhúng Cuối Thân Trang (&lt;body&gt;)</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Dán mã LiveChat, bong bóng chat Messenger, Zalo Chat hoặc popup của bên thứ 3
              </span>
            </label>
            <textarea
              rows={4}
              value={formData.customBodyScripts || ''}
              onChange={(e) => handleChange('customBodyScripts', e.target.value)}
              placeholder="<!-- Zalo / LiveChat / Custom Script -->&#10;<script>...</script>"
              className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3.5 py-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* 4. Nhóm 3: SEO Mặc Định Toàn Trang (Global SEO Meta) */}
      <Card variant="glass" className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-700/40">
          <Globe className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Cấu Hình SEO Mặc Định Toàn Trang (Global Meta Defaults)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tiêu Đề Trang Web Mặc Định (Default Meta Title)
            </label>
            <Input
              value={formData.siteTitle || ''}
              onChange={(e) => handleChange('siteTitle', e.target.value)}
              placeholder="Xe Hyundai Vinh - Bảng Giá & Ưu Đãi Lăn Bánh"
              className="bg-slate-800/80 border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hậu Tố Tiêu Đề (Title Suffix)
            </label>
            <Input
              value={formData.titleSuffix || ''}
              onChange={(e) => handleChange('titleSuffix', e.target.value)}
              placeholder="| Xe Hyundai Vinh"
              className="bg-slate-800/80 border-slate-700 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Mô Tả Trang Web Mặc Định (Default Meta Description)
          </label>
          <textarea
            rows={3}
            value={formData.defaultDescription || ''}
            onChange={(e) => handleChange('defaultDescription', e.target.value)}
            placeholder="Website phân phối xe Hyundai chính hãng tại Nghệ An, Hà Tĩnh..."
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ảnh Chia Sẻ Mặc Định (Default OG Image - 1200x630px)
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.defaultImage || ''}
                onChange={(e) => handleChange('defaultImage', e.target.value)}
                placeholder="/images/og-image.jpg hoặc link CDN"
                className="bg-slate-800/80 border-slate-700 text-white flex-1"
              />
              <Button
                type="button"
                onClick={() => setActiveMediaTarget('defaultImage')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 rounded-xl flex items-center gap-1.5 text-xs shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Chọn ảnh</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Biểu Tượng Trang Web (Favicon .ico / .png)
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.favicon || ''}
                onChange={(e) => handleChange('favicon', e.target.value)}
                placeholder="/favicon.ico hoặc link CDN"
                className="bg-slate-800/80 border-slate-700 text-white flex-1"
              />
              <Button
                type="button"
                onClick={() => setActiveMediaTarget('favicon')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 rounded-xl flex items-center gap-1.5 text-xs shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Chọn icon</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Media Picker Modal */}
      {activeMediaTarget && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setActiveMediaTarget(null)}
          onSelect={(selected) => {
            if (selected.length > 0 && activeMediaTarget) {
              handleChange(activeMediaTarget, selected[0].url);
            }
            setActiveMediaTarget(null);
          }}
          mode="single"
          title={activeMediaTarget === 'defaultImage' ? 'Chọn Ảnh Đại Diện Chia Sẻ (OG Image)' : 'Chọn Biểu Tượng Favicon'}
          initialSelectedUrls={formData[activeMediaTarget] ? [formData[activeMediaTarget] as string] : []}
        />
      )}
    </form>
  );
};
