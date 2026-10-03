'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button, Input, Label } from '@cardealer/ui';
import type { DeliveryStoriesZoneConfig, DeliveryStoryItem, MediaItem } from '@cardealer/types';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export interface DeliveryStoriesFormProps {
  data: DeliveryStoriesZoneConfig;
  onChange: (updated: DeliveryStoriesZoneConfig) => void;
}

// 🧠 Mental Model: Form quản lý album ảnh bàn giao xe thực tế (Phân Khu 6 - Social Proof).
// Hỗ trợ chọn ảnh từ Media Library (đơn lẻ hoặc hàng loạt) giúp saler dễ dàng tải lên khoảnh khắc trao chìa khóa xe.
export const DeliveryStoriesForm: React.FC<DeliveryStoriesFormProps> = ({ data, onChange }) => {
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);
  const [isBatchPickerOpen, setIsBatchPickerOpen] = useState(false);

  const handleAddStory = () => {
    const newStory: DeliveryStoryItem = {
      id: `story-${Date.now()}`,
      customerName: 'Khách hàng mới',
      location: 'TP. Vinh, Nghệ An',
      carModel: 'Hyundai Tucson',
      imageUrl: '/images/delivery/delivery-1.webp',
      quote: 'Dịch vụ tư vấn rất tận tâm!',
      deliveryDate: 'Tháng 09/2026',
    };
    onChange({ ...data, stories: [...data.stories, newStory] });
  };

  const handleRemoveStory = (index: number) => {
    const updated = data.stories.filter((_, idx) => idx !== index);
    onChange({ ...data, stories: updated });
  };

  const handleUpdateStory = (index: number, field: keyof DeliveryStoryItem, val: string) => {
    const updated = [...data.stories];
    const current = updated[index];
    if (!current) return;
    updated[index] = { ...current, [field]: val };
    onChange({ ...data, stories: updated });
  };

  const handleBatchSelect = (selected: MediaItem[]) => {
    if (!selected || selected.length === 0) return;
    const newStories: DeliveryStoryItem[] = selected.map((item, idx) => ({
      id: `story-${Date.now()}-${idx}`,
      customerName: item.altText || item.filename?.replace(/\.[^/.]+$/, '') || 'Khách hàng trao xe',
      location: 'TP. Vinh, Nghệ An',
      carModel: 'Hyundai Creta / Tucson',
      imageUrl: item.url,
      quote: 'Chúc mừng quý khách đã tin tưởng đồng hành cùng Hyundai Vinh!',
      deliveryDate: 'Tháng 09/2026',
    }));
    onChange({ ...data, stories: [...data.stories, ...newStories] });
    setIsBatchPickerOpen(false);
  };

  const handleSingleSelect = (selected: MediaItem[]) => {
    if (pickingIndex !== null && selected[0]?.url) {
      const updated = [...data.stories];
      const current = updated[pickingIndex];
      if (current) {
        updated[pickingIndex] = {
          ...current,
          imageUrl: selected[0].url,
        };
        onChange({ ...data, stories: updated });
      }
    }
    setPickingIndex(null);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-800/80">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Tiêu Đề Khối Bàn Giao Xe
          </Label>
          <Input
            type="text"
            value={data.headline}
            onChange={(e) => onChange({ ...data, headline: e.target.value })}
            placeholder="Khoảnh Khắc Bàn Giao Xe Thực Tế"
            className="w-full h-11 bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 text-sm focus-visible:ring-[#0072CE]"
          />
        </div>

        <div>
          <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Mô Tả Phụ (Subheadline)
          </Label>
          <Input
            type="text"
            value={data.subheadline}
            onChange={(e) => onChange({ ...data, subheadline: e.target.value })}
            placeholder="Hơn 500+ khách hàng đã tin tưởng..."
            className="w-full h-11 bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 text-sm focus-visible:ring-[#0072CE]"
          />
        </div>
      </div>

      {/* Danh sách ảnh & câu chuyện bàn giao */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-white">
              Danh Sách Khách Hàng Nhận Xe ({data.stories.length})
            </h4>
            <p className="text-xs text-slate-400">
              Nếu để trống, phân khu này sẽ tự động ẩn trên trang chủ theo cơ chế Graceful Degradation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBatchPickerOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900 border-slate-700 hover:bg-slate-800 text-sky-400 text-xs h-9 px-3"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chọn từ Thư Viện</span>
            </Button>
            <Button
              type="button"
              onClick={handleAddStory}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs h-9 px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Thủ Công</span>
            </Button>
          </div>
        </div>

        {data.stories.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
            Chưa có hình ảnh bàn giao nào. Phân khu này sẽ tự động ẩn trên Storefront.
          </div>
        ) : (
          <div className="space-y-3">
            {data.stories.map((story, idx) => (
              <div key={story.id || idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0072CE]">Khách Hàng #{idx + 1}</span>
                    {story.customerName && (
                      <span className="text-xs text-slate-400 font-medium">({story.customerName})</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStory(idx)}
                    className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-[11px] text-slate-400 mb-1">Tên Khách Hàng</Label>
                    <Input
                      type="text"
                      value={story.customerName}
                      onChange={(e) => handleUpdateStory(idx, 'customerName', e.target.value)}
                      placeholder="Anh Nam - TP. Vinh"
                      className="w-full h-9 text-xs bg-slate-900 border-slate-800 text-white focus-visible:ring-[#0072CE]"
                    />
                  </div>

                  <div>
                    <Label className="block text-[11px] text-slate-400 mb-1">Dòng Xe Đã Giao</Label>
                    <Input
                      type="text"
                      value={story.carModel}
                      onChange={(e) => handleUpdateStory(idx, 'carModel', e.target.value)}
                      placeholder="Hyundai Tucson 2.0ĐB"
                      className="w-full h-9 text-xs bg-slate-900 border-slate-800 text-white focus-visible:ring-[#0072CE]"
                    />
                  </div>

                  <div>
                    <Label className="block text-[11px] text-slate-400 mb-1">Đường Dẫn Ảnh Trao Xe</Label>
                    <div className="flex items-center gap-1.5">
                      {story.imageUrl && (
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0 relative flex items-center justify-center">
                          <img
                            src={story.imageUrl}
                            alt={story.customerName || 'Ảnh trao xe'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <Input
                        type="text"
                        value={story.imageUrl}
                        onChange={(e) => handleUpdateStory(idx, 'imageUrl', e.target.value)}
                        placeholder="/images/delivery/delivery-1.webp"
                        className="w-full h-9 text-xs bg-slate-900 border-slate-800 text-white focus-visible:ring-[#0072CE]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPickingIndex(idx)}
                        className="h-9 px-2.5 bg-slate-900 border-slate-700 text-slate-200 hover:text-white shrink-0 flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#0072CE]" />
                        <span>Chọn ảnh</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-[11px] text-slate-400 mb-1">Địa Danh / Khu Vực</Label>
                    <Input
                      type="text"
                      value={story.location || 'TP. Vinh, Nghệ An'}
                      onChange={(e) => handleUpdateStory(idx, 'location', e.target.value)}
                      placeholder="TP. Vinh, Nghệ An"
                      className="w-full h-9 text-xs bg-slate-900 border-slate-800 text-white focus-visible:ring-[#0072CE]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="block text-[11px] text-slate-400 mb-1">Lời Nhận Xét / Cảm Nhận Của Khách Hàng</Label>
                    <Input
                      type="text"
                      value={story.quote}
                      onChange={(e) => handleUpdateStory(idx, 'quote', e.target.value)}
                      placeholder="Em Tuấn tư vấn rất nhiệt tình, giao xe đúng ngày..."
                      className="w-full h-9 text-xs bg-slate-900 border-slate-800 text-white focus-visible:ring-[#0072CE]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Picker Modal đơn lẻ */}
      <MediaPickerModal
        isOpen={pickingIndex !== null}
        onClose={() => setPickingIndex(null)}
        onSelect={handleSingleSelect}
        mode="single"
        title="Chọn Ảnh Bàn Giao Xe"
        initialSelectedUrls={
          pickingIndex !== null && data.stories[pickingIndex]?.imageUrl
            ? [data.stories[pickingIndex].imageUrl]
            : []
        }
      />

      {/* Media Picker Modal hàng loạt */}
      <MediaPickerModal
        isOpen={isBatchPickerOpen}
        onClose={() => setIsBatchPickerOpen(false)}
        onSelect={handleBatchSelect}
        mode="multiple"
        title="Chọn Hàng Loạt Ảnh Bàn Giao Từ Thư Viện"
      />
    </div>
  );
};
