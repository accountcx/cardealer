'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Label } from '@cardealer/ui';
import type { DeliveryStoriesZoneConfig, DeliveryStoryItem } from '@cardealer/types';

export interface DeliveryStoriesFormProps {
  data: DeliveryStoriesZoneConfig;
  onChange: (updated: DeliveryStoriesZoneConfig) => void;
}

// 🧠 Mental Model: Form quản lý album ảnh bàn giao xe thực tế (Phân Khu 5 - Social Proof).
// Hỗ trợ saler thêm/xóa/sửa các khoảnh khắc trao chìa khóa xe cho khách hàng nhằm tạo dựng uy tín chuyển đổi cao.
export const DeliveryStoriesForm: React.FC<DeliveryStoriesFormProps> = ({ data, onChange }) => {
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
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...data, stories: updated });
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
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Danh Sách Khách Hàng Nhận Xe ({data.stories.length})</h4>
            <p className="text-xs text-slate-400">Nếu để trống, phân khu này sẽ tự động ẩn trên trang chủ.</p>
          </div>
          <Button
            type="button"
            onClick={handleAddStory}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs h-9 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Ảnh Bàn Giao</span>
          </Button>
        </div>

        {data.stories.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
            Chưa có hình ảnh bàn giao nào. Phân khu này sẽ tự động ẩn trên Storefront theo cơ chế Graceful Degradation.
          </div>
        ) : (
          <div className="space-y-3">
            {data.stories.map((story, idx) => (
              <div key={story.id || idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0072CE]">Khách Hàng #{idx + 1}</span>
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
                    <Input
                      type="text"
                      value={story.imageUrl}
                      onChange={(e) => handleUpdateStory(idx, 'imageUrl', e.target.value)}
                      placeholder="/images/delivery/delivery-1.webp"
                      className="w-full h-9 text-xs bg-slate-900 border-slate-800 text-white focus-visible:ring-[#0072CE]"
                    />
                  </div>
                </div>

                <div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
