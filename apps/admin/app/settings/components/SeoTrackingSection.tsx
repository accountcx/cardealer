'use client';

import React, { useState } from 'react';
import {
  Save,
  Check,
  Activity,
  Code,
  Globe,
  FolderOpen,
  Sparkles,
  Key,
  Bot,
  Eye,
  EyeOff,
  Sliders,
} from 'lucide-react';
import { Button, Card, Input } from '@cardealer/ui';
import type { SiteSettings } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export interface SeoTrackingSectionProps {
  initialData: SiteSettings;
}

const PRESET_MODELS = [
  'gpt-luna-6',
  'gpt-6-luna',
  'gpt-5.6-luna',
  'gpt-6',
  'gpt-5',
  'gpt-4o-mini',
  'gpt-4o',
  'o3-mini',
  'o1',
  'o1-mini',
  'gpt-4.5-preview',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
];

// 🧠 Mental Model: Quản trị Cấu hình SEO Tổng thể, Tracking Analytics, Pixels, Custom Scripts & AI Writing Assistant.
// Hỗ trợ cấu hình GTM, GA4, Microsoft Clarity, FB Pixel, TikTok Pixel, Zalo Pixel,
// Custom Header Scripts (<head>), Custom Body Scripts (<body>), Global Fallback Meta, và OpenAI API Key cho Post Editor.
export const SeoTrackingSection: React.FC<SeoTrackingSectionProps> = ({ initialData }) => {
  const [formData, setFormData] = useState<SiteSettings>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(
    !PRESET_MODELS.includes(formData.openaiModel || 'gpt-4o-mini')
  );

  // Modal media picker cho OG Image và Favicon
  const [activeMediaTarget, setActiveMediaTarget] = useState<'defaultImage' | 'favicon' | null>(null);

  const handleChange = (field: keyof SiteSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModelSelect = (val: string) => {
    if (val === 'custom') {
      setIsCustomModel(true);
    } else {
      setIsCustomModel(false);
      handleChange('openaiModel', val);
    }
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
              SEO, Tracking & Trí Tuệ Nhân Tạo (AI)
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal border border-indigo-400/30">
                SEO & AI Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu hình mã theo dõi Google/Facebook/TikTok, mã nhúng Header/Body, OpenAI API Key viết bài và SEO mặc định toàn website
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

      {/* 2. Nhóm 1: Trợ Lý AI Viết Bài (OpenAI / ChatGPT) */}
      <Card variant="glass" className="p-6 space-y-5 border-cyan-500/30 bg-slate-900/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Trợ Lý AI Viết Bài & Tối Ưu SEO (ChatGPT / OpenAI Engine)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
            Tiptap AI Integration
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                Khóa API OpenAI (OpenAI API Key)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Bắt đầu bằng `sk-...`
              </span>
            </label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={formData.openaiApiKey || ''}
                onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                placeholder="sk-proj-..."
                className="bg-slate-950/80 border-slate-700 text-white font-mono text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label={showApiKey ? 'Ẩn API Key' : 'Hiện API Key'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Khóa API được lưu trữ an toàn trong Database và chỉ được gọi bảo mật qua backend server của hệ thống.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                Mô Hình AI (Model)
              </label>
              <button
                type="button"
                onClick={() => setIsCustomModel(!isCustomModel)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                {isCustomModel ? 'Chọn mẫu có sẵn' : 'Nhập mã tùy chỉnh'}
              </button>
            </div>

            {isCustomModel ? (
              <Input
                value={formData.openaiModel || ''}
                onChange={(e) => handleChange('openaiModel', e.target.value)}
                placeholder="VD: gpt-4o, gpt-4o-mini, o3-mini..."
                className="h-10 bg-slate-950/80 border-cyan-500/50 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
              />
            ) : (
              <select
                value={formData.openaiModel || 'gpt-4o-mini'}
                onChange={(e) => handleModelSelect(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-950/80 border border-slate-700 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
              >
                <optgroup label="🚀 Dòng Thế Hệ Mới (Frontier & Next-Gen)">
                  <option value="gpt-luna-6">GPT-Luna-6 (Mô hình Frontier Luna v6)</option>
                  <option value="gpt-6-luna">GPT-6 Luna (Mô hình Frontier & Siêu tốc độ thế hệ mới)</option>
                  <option value="gpt-5.6-luna">GPT-5.6 Luna (Mô hình sáng tạo & tốc độ cao thế hệ mới)</option>
                  <option value="gpt-6">GPT-6 (Next-Gen Autonomous Frontier AI)</option>
                  <option value="gpt-5">GPT-5 (Mô hình đa nhiệm toàn năng thế hệ 5)</option>
                </optgroup>
                <optgroup label="⚡ Dòng GPT-4o Khuyên Dùng (Nhanh & Chuẩn SEO)">
                  <option value="gpt-4o-mini">GPT-4o Mini (Khuyên dùng: Siêu nhanh, Tiết kiệm chi phí, Chuẩn SEO 100%)</option>
                  <option value="gpt-4o">GPT-4o (Flagship: Văn phong mượt mà, phân tích sâu sắc nhất)</option>
                  <option value="gpt-4.5-preview">GPT-4.5 Preview (Mô hình nghiên cứu chuyên sâu)</option>
                </optgroup>
                <optgroup label="🧠 Dòng Tư Duy Lập Luận (Reasoning - O Series)">
                  <option value="o3-mini">o3-mini (Lập luận toán & phân tích thông số xe chuyên sâu)</option>
                  <option value="o1">o1 (Tư duy chuyên sâu đa chiều)</option>
                  <option value="o1-mini">o1-mini (Tư duy nhanh gọn)</option>
                </optgroup>
                <optgroup label="📦 Dòng Tiền Nhiệm (Legacy)">
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </optgroup>
                <option value="custom">✏️ Nhập mã model tùy chỉnh khác...</option>
              </select>
            )}

            <p className="text-[11px] text-slate-400 mt-1">
              Đang dùng: <span className="font-mono text-cyan-400 font-semibold">{formData.openaiModel || 'gpt-4o-mini'}</span>.
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Nhóm 2: Mã Theo Dõi (Tracking & Pixels) */}
      <Card variant="glass" className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-700/40">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Mã Theo Dõi & Đo Lường (Tracking & Pixels)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Tag Manager (GTM ID)
            </label>
            <Input
              value={formData.gtmId || ''}
              onChange={(e) => handleChange('gtmId', e.target.value)}
              placeholder="GTM-MZ6HJKZR"
              className="bg-slate-950/80 border-slate-700 text-white font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Định dạng: GTM-XXXXXXX</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Analytics 4 (GA4 Measurement ID)
            </label>
            <Input
              value={formData.gaId || ''}
              onChange={(e) => handleChange('gaId', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="bg-slate-950/80 border-slate-700 text-white font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Định dạng: G-XXXXXXXXXX</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Microsoft Clarity Project ID
            </label>
            <Input
              value={formData.clarityId || ''}
              onChange={(e) => handleChange('clarityId', e.target.value)}
              placeholder="vídụ: abcdef1234"
              className="bg-slate-950/80 border-slate-700 text-white font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Quay video màn hình & Heatmap</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Facebook Pixel ID (Meta Pixel)
            </label>
            <Input
              value={formData.fbPixelId || ''}
              onChange={(e) => handleChange('fbPixelId', e.target.value)}
              placeholder="VD: 123456789012345"
              className="bg-slate-950/80 border-slate-700 text-white font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Dùng cho chạy quảng cáo Facebook Ads</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              TikTok Pixel ID
            </label>
            <Input
              value={formData.tiktokPixelId || ''}
              onChange={(e) => handleChange('tiktokPixelId', e.target.value)}
              placeholder="VD: CXXXXXXXXXXXXXXX"
              className="bg-slate-950/80 border-slate-700 text-white font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Dùng cho chạy quảng cáo TikTok Ads</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Zalo Official Account / Pixel ID
            </label>
            <Input
              value={formData.zaloPixelId || ''}
              onChange={(e) => handleChange('zaloPixelId', e.target.value)}
              placeholder="VD: zalo_pixel_id"
              className="bg-slate-950/80 border-slate-700 text-white font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Dùng cho Zalo Ads & OA tracking</p>
          </div>
        </div>
      </Card>

      {/* 4. Nhóm 3: Mã Nhúng Tùy Chỉnh (Custom Scripts) */}
      <Card variant="glass" className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-700/40">
          <Code className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Mã Nhúng Tùy Chỉnh (Custom Scripts Header & Body)
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mã nhúng Header (chèn vào thẻ &lt;head&gt;)
            </label>
            <textarea
              value={formData.customHeaderScripts || ''}
              onChange={(e) => handleChange('customHeaderScripts', e.target.value)}
              placeholder="<!-- Dán thẻ <meta google-site-verification...>, Facebook Domain Verification, Livechat scripts... -->"
              rows={4}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700 p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dán các thẻ meta xác minh Google Search Console, Pinterest, Bing hoặc script tải trước (Preload).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mã nhúng Body / Footer (chèn vào cuối thẻ &lt;body&gt;)
            </label>
            <textarea
              value={formData.customBodyScripts || ''}
              onChange={(e) => handleChange('customBodyScripts', e.target.value)}
              placeholder="<!-- Dán mã nhúng bong bóng chat Zalo Widget, Facebook Messenger, Call Button 3rd party... -->"
              rows={4}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700 p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dán các mã nhúng widget chat Zalo, Messenger, popup khuyến mãi của đối tác thứ ba.
            </p>
          </div>
        </div>
      </Card>

      {/* 5. Nhóm 4: Cấu Hình SEO Mặc Định Toàn Site (Global SEO Fallback) */}
      <Card variant="glass" className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-700/40">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            4. Cấu Hình SEO & OpenGraph Mặc Định (Global Fallback)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tiêu đề Trang Chủ (Site Title)
            </label>
            <Input
              value={formData.siteTitle || ''}
              onChange={(e) => handleChange('siteTitle', e.target.value)}
              placeholder="Xe Hyundai Vinh - Đại Lý Ủy Quyền Chính Hãng"
              className="bg-slate-950/80 border-slate-700 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hậu tố Tiêu đề (Title Suffix)
            </label>
            <Input
              value={formData.titleSuffix || ''}
              onChange={(e) => handleChange('titleSuffix', e.target.value)}
              placeholder="| Xe Hyundai Vinh"
              className="bg-slate-950/80 border-slate-700 text-white text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Được tự động gắn vào sau tiêu đề các trang con</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Mô tả SEO Mặc định (Default Meta Description)
          </label>
          <textarea
            value={formData.defaultDescription || ''}
            onChange={(e) => handleChange('defaultDescription', e.target.value)}
            placeholder="Website phân phối xe Hyundai chính hãng tại Nghệ An, Hà Tĩnh..."
            rows={3}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700 p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Độ dài lý tưởng: 120-155 ký tự. Hiện tại: <span className="font-mono text-cyan-400">{(formData.defaultDescription || '').length}</span> ký tự.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ảnh Chia Sẻ Mạng Xã Hội Mặc Định (OG Image URL)
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.defaultImage || ''}
                onChange={(e) => handleChange('defaultImage', e.target.value)}
                placeholder="/images/og-image.jpg"
                className="bg-slate-950/80 border-slate-700 text-white text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setActiveMediaTarget('defaultImage')}
                className="shrink-0 flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Chọn ảnh
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Kích thước chuẩn: 1200x630px (Dưới 1MB)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Favicon Icon URL
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.favicon || ''}
                onChange={(e) => handleChange('favicon', e.target.value)}
                placeholder="/favicon.ico"
                className="bg-slate-950/80 border-slate-700 text-white text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setActiveMediaTarget('favicon')}
                className="shrink-0 flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Chọn icon
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Định dạng: .ico, .png (Kích thước 32x32px hoặc 48x48px)</p>
          </div>
        </div>
      </Card>

      {/* Modal Chọn Ảnh Từ Thư Viện Dùng Chung */}
      <MediaPickerModal
        isOpen={!!activeMediaTarget}
        onClose={() => setActiveMediaTarget(null)}
        mode="single"
        title={activeMediaTarget === 'favicon' ? 'Chọn Icon Favicon' : 'Chọn Ảnh Chia Sẻ Mạng Xã Hội (OG Image)'}
        initialSelectedUrls={
          activeMediaTarget === 'favicon' && formData.favicon
            ? [formData.favicon]
            : activeMediaTarget === 'defaultImage' && formData.defaultImage
            ? [formData.defaultImage]
            : []
        }
        onSelect={(selected) => {
          if (!activeMediaTarget || selected.length === 0) return;
          const url = selected[0].url;
          if (activeMediaTarget === 'favicon') {
            handleChange('favicon', url);
          } else if (activeMediaTarget === 'defaultImage') {
            handleChange('defaultImage', url);
          }
          setActiveMediaTarget(null);
        }}
      />
    </form>
  );
};
