'use client';

import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { HeroBannerConfig, MediaItem } from '@cardealer/types';
import { Input, Select, Switch, Button } from '@cardealer/ui';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export interface HeroBannerFormProps {
  data: HeroBannerConfig;
  onChange: (updated: HeroBannerConfig) => void;
}

// 🧠 Mental Model: Form cấu hình Phân Khu 1 - Hero Event Banner & Countdown Timer.
// Chuẩn hóa 100% bằng Design System Primitives từ @cardealer/ui kèm tích hợp MediaPickerModal.
export const HeroBannerForm: React.FC<HeroBannerFormProps> = ({ data, onChange }) => {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const updateField = <K extends keyof HeroBannerConfig>(field: K, value: HeroBannerConfig[K]) => {
    onChange({ ...data, [field]: value });
  };

  const handleMediaSelect = (selected: MediaItem[]) => {
    if (selected[0]?.url) {
      updateField('mediaUrl', selected[0].url);
    }
    setIsMediaPickerOpen(false);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-800/80">
      {/* Tiêu Đề & Slogan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tiêu Đề Lớn (Headline)"
          value={data.headline}
          onChange={(e) => updateField('headline', e.target.value)}
          placeholder="Ví dụ: Đại Tiệc Ưu Đãi Ô Tô Hyundai Vinh"
        />

        <Input
          label="Slogan Chiến Dịch (Subheadline)"
          value={data.subheadline}
          onChange={(e) => updateField('subheadline', e.target.value)}
          placeholder="Ví dụ: Hỗ trợ 50% trước bạ + quà tặng hấp dẫn"
        />
      </div>

      {/* Media Nền (Ảnh hoặc Link Video) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Loại Media Nền"
          value={data.mediaType}
          onChange={(e) => updateField('mediaType', e.target.value as 'image' | 'video')}
          options={[
            { value: 'image', label: 'Hình Ảnh Banner' },
            { value: 'video', label: 'Video Nền (URL)' },
          ]}
        />

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Đường Dẫn Media (URL Ảnh hoặc Video)
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={data.mediaUrl}
              onChange={(e) => updateField('mediaUrl', e.target.value)}
              placeholder="/images/hero-banner.webp hoặc https://..."
              className="flex-1"
            />
            {data.mediaType === 'image' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMediaPickerOpen(true)}
                className="h-11 px-3 bg-slate-900 border-slate-700 text-slate-200 hover:text-white shrink-0 flex items-center gap-1.5 text-xs"
              >
                <ImageIcon className="w-4 h-4 text-[#0072CE]" />
                <span>Chọn ảnh</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Vị Trí Cụm Nội Dung (Content Position) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Vị Trí Cụm Nội Dung (Chữ & CTA)"
          value={data.contentPosition || 'center-left'}
          onChange={(e) =>
            updateField(
              'contentPosition',
              e.target.value as 'center-left' | 'center-center' | 'center-right'
            )
          }
          options={[
            { value: 'center-left', label: 'Căn Trái (Khuyên dùng khi xe ở bên phải)' },
            { value: 'center-center', label: 'Căn Giữa (Khuyên dùng khi video hoặc xe ở giữa)' },
            { value: 'center-right', label: 'Căn Phải (Khuyên dùng khi xe ở bên trái)' },
          ]}
        />

        <div className="md:col-span-2 flex items-center">
          <p className="text-xs text-slate-400 leading-relaxed pt-2 md:pt-4">
            💡 <strong className="text-slate-300">Gợi ý thiết kế:</strong> Khi đổi vị trí sang Trái / Giữa / Phải, lớp phủ màu (Gradient) trên trang chủ sẽ tự động điều chỉnh hướng để đảm bảo chữ luôn sắc nét và không che khuất chiếc xe.
          </p>
        </div>
      </div>

      {/* Cấu hình Countdown Timer */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4">
        <Switch
          checked={data.countdown.enabled}
          onCheckedChange={(checked) =>
            updateField('countdown', { ...data.countdown, enabled: checked })
          }
          label="Đồng Hồ Đếm Ngược Khuyến Mại (Countdown Timer)"
          description="Tạo tính cấp bách kích thích khách hàng để lại thông tin báo giá."
        />

        {data.countdown.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
            <Input
              label="Thông Điệp Đếm Ngược"
              value={data.countdown.urgencyText}
              onChange={(e) =>
                updateField('countdown', { ...data.countdown, urgencyText: e.target.value })
              }
              placeholder="Ưu đãi tháng vàng chỉ còn:"
            />

            <Input
              label="Thời Gian Kết Thúc Đợt Ưu Đãi"
              type="datetime-local"
              value={data.countdown.targetDate ? data.countdown.targetDate.slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value ? `${e.target.value}:00+07:00` : '';
                updateField('countdown', { ...data.countdown, targetDate: val });
              }}
            />
          </div>
        )}
      </div>

      {/* Cấu hình Số suất ưu đãi còn lại & Nút CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
          <Switch
            checked={data.remainingSlots.enabled}
            onCheckedChange={(checked) =>
              updateField('remainingSlots', { ...data.remainingSlots, enabled: checked })
            }
            label="Huy Hiệu Số Suất Còn Lại"
          />

          {data.remainingSlots.enabled && (
            <div className="space-y-3 pt-2">
              <Input
                label="Số suất ưu đãi còn lại"
                type="number"
                min="0"
                value={data.remainingSlots.slotsCount}
                onChange={(e) =>
                  updateField('remainingSlots', {
                    ...data.remainingSlots,
                    slotsCount: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
              />
              <Input
                label="Dòng chữ hiển thị trên huy hiệu"
                value={data.remainingSlots.badgeText}
                onChange={(e) =>
                  updateField('remainingSlots', { ...data.remainingSlots, badgeText: e.target.value })
                }
              />
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
          <span className="text-sm font-semibold text-white block">Nút Kêu Gọi Hành Động (CTA Button)</span>
          <div className="space-y-3 pt-1">
            <Input
              label="Nhãn nút CTA"
              value={data.ctaButton.text}
              onChange={(e) =>
                updateField('ctaButton', { ...data.ctaButton, text: e.target.value })
              }
              placeholder="Nhận Báo Giá Lăn Bánh Ngay"
            />

            <Select
              label="Hành động khi bấm nút"
              value={data.ctaButton.action}
              onChange={(e) =>
                updateField('ctaButton', {
                  ...data.ctaButton,
                  action: e.target.value as 'quote_modal' | 'tel' | 'url',
                })
              }
              options={[
                { value: 'quote_modal', label: 'Mở Popup Nhận Báo Giá Nhanh (Lead Modal)' },
                { value: 'tel', label: 'Gọi Ngay Hotline Showroom' },
                { value: 'url', label: 'Chuyển Hướng Đường Dẫn Web Tùy Chọn' },
              ]}
            />
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        mode="single"
        title="Chọn Hình Ảnh Hero Banner"
      />
    </div>
  );
};
