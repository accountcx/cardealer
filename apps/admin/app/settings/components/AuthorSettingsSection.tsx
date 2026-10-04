'use client';

import React, { useState } from 'react';
import {
  Save,
  Check,
  UserCheck,
  ShieldCheck,
  Award,
  Phone,
  MessageSquare,
  Share2,
  Image as ImageIcon,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Input } from '@cardealer/ui';
import type { AuthorSettings } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export interface AuthorSettingsSectionProps {
  initialData: AuthorSettings;
}

// 🧠 Mental Model: Quản trị Hồ sơ Tác giả & Thẩm quyền E-E-A-T (Author & Editorial Settings).
// Cho phép Admin tùy biến thông tin Ban Biên Tập / Chuyên gia đánh giá bài viết, số năm kinh nghiệm,
// số điện thoại/Zalo tư vấn trực tiếp và tiểu sử uy tín chuẩn Google E-E-A-T.
export const AuthorSettingsSection: React.FC<AuthorSettingsSectionProps> = ({ initialData }) => {
  const [formData, setFormData] = useState<AuthorSettings>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const handleChange = (field: keyof AuthorSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<AuthorSettings>('author_settings', formData);
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
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Hồ Sơ Tác Giả & Chuẩn E-E-A-T
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal border border-blue-400/30">
                SEO Authority
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tùy chỉnh thông tin chuyên gia/ban biên tập hiển thị tại chân các bài viết tin tức và tối ưu Schema Google News
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all shrink-0"
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
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* 2. Form Cấu Hình Chi Tiết */}
      <Card className="p-6 bg-slate-800/80 border-slate-700/80 rounded-2xl shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/50 pb-3">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Thông Tin Định Danh Tác Giả
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tên Tác Giả */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Tên Tác Giả / Ban Biên Tập <span className="text-rose-400">*</span>
            </label>
            <Input
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="VD: Ban Biên Tập Hyundai Vinh hoặc Nguyễn Văn Tuấn"
              required
              className="bg-slate-900/90 border-slate-700 text-white rounded-xl text-sm"
            />
          </div>

          {/* Chức Danh Chuyên Môn */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Chức Danh / Vị Trí Chuyên Môn <span className="text-rose-400">*</span>
            </label>
            <Input
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="VD: Chuyên gia Phân tích Thị trường & Tư vấn Xe Ô tô"
              required
              className="bg-slate-900/90 border-slate-700 text-white rounded-xl text-sm"
            />
          </div>

          {/* Số Năm Kinh Nghiệm */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Số Năm Kinh Nghiệm Trong Ngành
            </label>
            <Input
              type="number"
              min={0}
              max={50}
              value={formData.experienceYears}
              onChange={(e) => handleChange('experienceYears', parseInt(e.target.value, 10) || 0)}
              placeholder="8"
              className="bg-slate-900/90 border-slate-700 text-white rounded-xl text-sm font-mono"
            />
          </div>

          {/* Hotline Tư Vấn */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              Hotline Tư Vấn Tác Giả
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="0981.234.567"
              className="bg-slate-900/90 border-slate-700 text-white rounded-xl text-sm font-mono"
            />
          </div>

          {/* Số Zalo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Số Zalo Nhận Báo Giá / Tư Vấn
            </label>
            <Input
              value={formData.zaloPhone}
              onChange={(e) => handleChange('zaloPhone', e.target.value)}
              placeholder="0981234567"
              className="bg-slate-900/90 border-slate-700 text-white rounded-xl text-sm font-mono"
            />
          </div>

          {/* URL Ảnh Đại Diện / Avatar */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              Ảnh Đại Diện Tác Giả (Avatar)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 flex items-center justify-center shrink-0 shadow-md">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={formData.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center">
                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  value={formData.avatarUrl}
                  onChange={(e) => handleChange('avatarUrl', e.target.value)}
                  placeholder="https://... hoặc /images/authors/avatar.webp"
                  className="bg-slate-900/90 border-slate-700 text-white rounded-xl text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 rounded-xl px-3.5 shrink-0 flex items-center gap-1.5 text-xs"
                >
                  <FolderOpen className="w-4 h-4 text-sky-400" />
                  <span>Chọn Ảnh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Tiểu Sử / Giới Thiệu Chuyên Môn */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Tiểu Sử & Lời Cam Kết Chuyên Môn (Bio E-E-A-T)
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Giới thiệu đội ngũ chuyên môn, cam kết cung cấp thông tin minh bạch, tư vấn giá xe tối ưu..."
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Đoạn văn ngắn định vị độ uy tín của tác giả, giúp bài viết đạt điểm chất lượng cao theo thuật toán Google Helpful Content.
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Live Preview Giao Diện Storefront */}
      <Card className="p-6 bg-slate-900/80 border-slate-700/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Xem Trước Giao Diện Thực Tế (Live Storefront Preview)
          </span>
          <span className="text-xs text-slate-500">Hiển thị ở cuối mỗi bài viết tin tức</span>
        </div>

        {/* EeatAuthorBox Mockup */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50 p-6 shadow-sm text-slate-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar tác giả */}
            <div className="relative flex-shrink-0">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-sky-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <span
                title="Tác giả được xác thực chuyên môn"
                className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Thông tin thẩm quyền */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="text-lg font-bold text-slate-900 leading-tight">
                  {formData.fullName || 'Ban Biên Tập'}
                </h4>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-0.5 font-semibold flex items-center gap-1 rounded-md">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Đã kiểm duyệt chuyên môn
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium">
                <span>{formData.role || 'Chuyên gia tư vấn xe'}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-blue-700 font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  {formData.experienceYears || 8}+ năm kinh nghiệm
                </span>
                <span className="text-slate-300">•</span>
                <span>Đại lý Ủy Quyền Chính Hãng</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {formData.bio || 'Tiểu sử tác giả...'}
              </p>

              {/* Nút hành động */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold bg-white border border-blue-200 text-blue-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-default"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gọi Tác Giả: {formData.phone || '0981.234.567'}</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-default"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nhắn Zalo</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-default"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chia sẻ bài viết</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        mode="single"
        title="Chọn Ảnh Đại Diện Tác Giả"
        onSelect={(items) => {
          if (items.length > 0) {
            handleChange('avatarUrl', items[0].url);
          }
        }}
      />
    </form>
  );
};
