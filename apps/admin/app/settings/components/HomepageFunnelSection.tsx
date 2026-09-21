'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  UserCheck,
  Car,
  Image as ImageIcon,
  Newspaper,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Button, Switch, Input, Label } from '@cardealer/ui';
import type { HomepageSettings } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';
import { HeroBannerForm } from './HeroBannerForm';
import { LeadFilterForm } from './LeadFilterForm';
import { SalerShowroomForm } from './SalerShowroomForm';
import { DeliveryStoriesForm } from './DeliveryStoriesForm';

export interface HomepageFunnelSectionProps {
  initialData: HomepageSettings;
}

type ZoneId = 'hero' | 'filter' | 'saler' | 'cars' | 'delivery' | 'news';

// 🧠 Mental Model: Trung tâm Quản trị Phễu Chuyển Đổi Trang Chủ (6 Phân Khu).
// Mỗi phân khu có 1 công tắc Bật/Tắt độc lập ngay tại Accordion Header.
// Khi tắt một khu, Storefront tự động ẩn đi (Graceful Degradation) mà không lo lỗi giao diện.
export const HomepageFunnelSection: React.FC<HomepageFunnelSectionProps> = ({ initialData }) => {
  const [data, setData] = useState<HomepageSettings>(initialData);
  const [openZones, setOpenZones] = useState<Record<ZoneId, boolean>>({
    hero: true,
    filter: false,
    saler: false,
    cars: false,
    delivery: false,
    news: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAccordion = (zone: ZoneId) => {
    setOpenZones((prev) => ({ ...prev, [zone]: !prev[zone] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<HomepageSettings>('homepage_settings', data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu cấu hình trang chủ');
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
            <Sparkles className="w-5 h-5 text-[#0072CE]" />
            <span>Phễu Chuyển Đổi Trang Chủ (6 Phân Khu)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Toàn quyền điều khiển hiển thị và nội dung 6 phân khu tâm lý mua sắm xe ô tô.
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
              <Save className="w-4 h-4 text-white" />
              <span>{saving ? 'Đang Lưu...' : 'Lưu Thay Đổi Trang Chủ'}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Phân Khu Accordions */}
      <div className="space-y-4">
        {/* KHU 1: HERO EVENT BANNER */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => toggleAccordion('hero')}
              className="h-auto p-0 hover:bg-transparent flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Khu 1: Hero Event Banner & Countdown</h4>
                <p className="text-xs text-slate-400">Banner sự kiện lớn trong tháng, đồng hồ đếm ngược, số suất ưu đãi</p>
              </div>
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Bật Khu Này</span>
                <Switch
                  checked={data.heroBanner.enabled}
                  onCheckedChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      heroBanner: { ...prev.heroBanner, enabled: val },
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleAccordion('hero')}
                className="h-8 w-8 p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {openZones.hero ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {openZones.hero && (
            <div className="pt-4 border-t border-slate-800/80 mt-4">
              <HeroBannerForm
                data={data.heroBanner}
                onChange={(updated) => setData((prev) => ({ ...prev, heroBanner: updated }))}
              />
            </div>
          )}
        </div>

        {/* KHU 2: LEAD MAGNET HUB */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => toggleAccordion('filter')}
              className="h-auto p-0 hover:bg-transparent flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-400">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Khu 2: Lead Magnet Hub (Bộ Lọc Nhanh)</h4>
                <p className="text-xs text-slate-400">Thanh tìm xe nhanh theo ngân sách & kiểu dáng phân khúc</p>
              </div>
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Bật Khu Này</span>
                <Switch
                  checked={data.leadFilter.enabled}
                  onCheckedChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      leadFilter: { ...prev.leadFilter, enabled: val },
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleAccordion('filter')}
                className="h-8 w-8 p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {openZones.filter ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {openZones.filter && (
            <LeadFilterForm
              data={data.leadFilter}
              onChange={(updated) => setData((prev) => ({ ...prev, leadFilter: updated }))}
            />
          )}
        </div>

        {/* KHU 3: VIP SHOWROOM / SALER PROFILE */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => toggleAccordion('saler')}
              className="h-auto p-0 hover:bg-transparent flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-amber-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Khu 3: VIP Showroom / Hồ Sơ Saler Uy Tín</h4>
                <p className="text-xs text-slate-400">Hồ sơ cá nhân tư vấn bán hàng hoặc cơ sở 3S + 4 Cam kết vàng</p>
              </div>
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Bật Khu Này</span>
                <Switch
                  checked={data.salerShowroom.enabled}
                  onCheckedChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      salerShowroom: { ...prev.salerShowroom, enabled: val },
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleAccordion('saler')}
                className="h-8 w-8 p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {openZones.saler ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {openZones.saler && (
            <SalerShowroomForm
              data={data.salerShowroom}
              onChange={(updated) => setData((prev) => ({ ...prev, salerShowroom: updated }))}
            />
          )}
        </div>

        {/* KHU 4: FEATURED CARS SHOWCASE */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => toggleAccordion('cars')}
              className="h-auto p-0 hover:bg-transparent flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-600/30 flex items-center justify-center text-indigo-400">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Khu 4: Các Dòng Xe Bán Chạy (Featured Cars)</h4>
                <p className="text-xs text-slate-400">Hiển thị các dòng xe được ghim nổi bật từ trang Quản lý Xe (/admin/cars)</p>
              </div>
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Bật Khu Này</span>
                <Switch
                  checked={data.featuredCars.enabled}
                  onCheckedChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      featuredCars: { ...prev.featuredCars, enabled: val },
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleAccordion('cars')}
                className="h-8 w-8 p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {openZones.cars ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {openZones.cars && (
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Tiêu Đề Khối Xe Bán Chạy
                  </Label>
                  <Input
                    type="text"
                    value={data.featuredCars.headline}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        featuredCars: { ...prev.featuredCars, headline: e.target.value },
                      }))
                    }
                    className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Số Lượng Xe Hiển Thị Tối Đa
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={data.featuredCars.maxDisplay}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        featuredCars: {
                          ...prev.featuredCars,
                          maxDisplay: Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 6)),
                        },
                      }))
                    }
                    className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                💡 <em>Mẹo:</em> Để chọn xe xuất hiện ở khu vực này, bạn chỉ cần vào menu <strong>Quản Lý Xe</strong> và bật công tắc <strong>"Ghim nổi bật" (isFeatured)</strong> cho dòng xe mong muốn.
              </p>
            </div>
          )}
        </div>

        {/* KHU 5: DELIVERY STORIES */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => toggleAccordion('delivery')}
              className="h-auto p-0 hover:bg-transparent flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-600/30 flex items-center justify-center text-emerald-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Khu 5: Bàn Giao Xe Thực Tế (Social Proof)</h4>
                <p className="text-xs text-slate-400">Album hình ảnh khách hàng nhận xe tại showroom/tận nhà</p>
              </div>
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Bật Khu Này</span>
                <Switch
                  checked={data.deliveryStories.enabled}
                  onCheckedChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      deliveryStories: { ...prev.deliveryStories, enabled: val },
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleAccordion('delivery')}
                className="h-8 w-8 p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {openZones.delivery ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {openZones.delivery && (
            <DeliveryStoriesForm
              data={data.deliveryStories}
              onChange={(updated) => setData((prev) => ({ ...prev, deliveryStories: updated }))}
            />
          )}
        </div>

        {/* KHU 6: LATEST NEWS & SPECIAL PROMOTIONS */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => toggleAccordion('news')}
              className="h-auto p-0 hover:bg-transparent flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-600/30 flex items-center justify-center text-purple-400">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Khu 6: Tin Tức Khuyến Mại & Sự Kiện</h4>
                <p className="text-xs text-slate-400">Khối 3-4 bài viết ưu đãi mới nhất (tự động ẩn nếu danh sách bài viết rỗng)</p>
              </div>
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Bật Khu Này</span>
                <Switch
                  checked={data.latestPromotions.enabled}
                  onCheckedChange={(val) =>
                    setData((prev) => ({
                      ...prev,
                      latestPromotions: { ...prev.latestPromotions, enabled: val },
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleAccordion('news')}
                className="h-8 w-8 p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {openZones.news ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {openZones.news && (
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Tiêu Đề Khối Tin Tức
                  </Label>
                  <Input
                    type="text"
                    value={data.latestPromotions.headline}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        latestPromotions: { ...prev.latestPromotions, headline: e.target.value },
                      }))
                    }
                    className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Số Bài Viết Tối Đa
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={data.latestPromotions.maxPosts}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        latestPromotions: {
                          ...prev.latestPromotions,
                          maxPosts: Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 3)),
                        },
                      }))
                    }
                    className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                💡 <em>Lưu ý:</em> Phân khu này sẽ tự động nạp các bài viết mới nhất có phân loại Khuyến Mãi. Nếu chưa có bài viết nào, phân khu sẽ tự động ẩn để giữ trang chủ luôn đẹp mắt.
              </p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
