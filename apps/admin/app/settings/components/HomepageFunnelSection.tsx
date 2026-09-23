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
  Calculator,
} from 'lucide-react';
import {
  Button,
  Switch,
  Input,
  Card,
  Badge,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Controller,
  useForm,
  useWatch,
  type FieldPath,
} from '@cardealer/ui';
import type { HomepageSettings } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';
import { HeroBannerForm } from './HeroBannerForm';
import { LeadFilterForm } from './LeadFilterForm';
import { SalerShowroomForm } from './SalerShowroomForm';
import { DeliveryStoriesForm } from './DeliveryStoriesForm';
import { RollingEstimateForm } from './RollingEstimateForm';

export interface HomepageFunnelSectionProps {
  initialData: HomepageSettings;
}

type ZoneId = 'hero' | 'filter' | 'cars' | 'estimate' | 'saler' | 'delivery' | 'news';

// 🧠 Mental Model: ZoneAccordionItem chuẩn hóa giao diện và trải nghiệm quản trị cho từng phân khu.
// Tái sử dụng triệt để các primitives từ @cardealer/ui (Card, Badge, Button, Switch, FormField).
// Theo dõi trạng thái Bật/Tắt theo thời gian thực (Real-time reactivity) bằng useWatch.
interface ZoneAccordionItemProps {
  id: ZoneId;
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  enabledFieldName: FieldPath<HomepageSettings>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ZoneAccordionItem: React.FC<ZoneAccordionItemProps> = ({
  icon,
  iconClassName,
  title,
  description,
  enabledFieldName,
  isOpen,
  onToggle,
  children,
}) => {
  // Lấy trạng thái kích hoạt thời gian thực của phân khu để hiển thị Badge phản hồi trực quan
  const isEnabled = useWatch<HomepageSettings>({
    name: enabledFieldName,
    defaultValue: true,
  });

  return (
    <Card className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all hover:border-slate-700/60 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Accordion Trigger Header: Căn lề trái (justify-start), không bị căn giữa bởi buttonVariants */}
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-start gap-3.5 text-left focus:outline-none flex-1 min-w-0 group cursor-pointer bg-transparent border-0 p-0 select-none"
        >
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${iconClassName}`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">{title}</h4>
              <Badge
                variant={isEnabled ? 'published' : 'outline'}
                size="sm"
                className="hidden sm:inline-flex"
              >
                {isEnabled ? 'Đang Bật' : 'Đã Tắt'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">{description}</p>
          </div>
        </button>

        {/* Switch & Action Controls */}
        <div className="flex items-center justify-end gap-3 self-end sm:self-center">
          <FormField
            name={enabledFieldName}
            render={({ field }) => (
              <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">Bật Khu Này</span>
                <Switch
                  checked={Boolean(field.value ?? true)}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Accordion Content Body */}
      {isOpen && <div className="pt-4 border-t border-slate-800/80 mt-4">{children}</div>}
    </Card>
  );
};

// 🧠 Mental Model: Trung tâm Quản trị Phễu Chuyển Đổi Trang Chủ (7 Phân Khu).
// 1. Quản lý trạng thái bằng React Hook Form kết hợp với các primitives từ @cardealer/ui.
// 2. Mỗi phân khu có 1 công tắc Bật/Tắt độc lập ngay tại Accordion Header.
// 3. Khi tắt một khu, Storefront tự động ẩn đi (Graceful Degradation) mà không lo lỗi giao diện.
export const HomepageFunnelSection: React.FC<HomepageFunnelSectionProps> = ({ initialData }) => {
  const [openZones, setOpenZones] = useState<Record<ZoneId, boolean>>({
    hero: true,
    filter: false,
    cars: false,
    estimate: false,
    saler: false,
    delivery: false,
    news: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo React Hook Form với giá trị ban đầu và fallback an toàn cho RollingEstimateCallout
  const form = useForm<HomepageSettings>({
    defaultValues: {
      ...initialData,
      rollingEstimateCallout: initialData.rollingEstimateCallout || {
        enabled: true,
        badgeText: 'Minh Bạch Giá — Không Chi Phí Ẩn',
        headline:
          'Bạn muốn biết giá lăn bánh chính xác tại TP. Vinh hoặc các huyện Nghệ An sau khi trừ hết khuyến mại tiền mặt?',
        description:
          'Dự toán trọn gói biểu phí nhà nước (thuế trước bạ 10%, biển số, đăng kiểm, đường bộ) kèm gói quà tặng phụ kiện chính hãng & ưu đãi tiền mặt độc quyền tại Showroom trong tháng 09/2026.',
        buttonText: 'Dự Toán Lăn Bánh Tức Thì (Bước 1/2)',
        commitments: [
          'Biểu phí chuẩn 100%',
          'Trừ khuyến mại đại lý',
          'Dự toán vay góp 24h',
        ],
      },
    },
  });

  const toggleAccordion = (zone: ZoneId) => {
    setOpenZones((prev) => ({ ...prev, [zone]: !prev[zone] }));
  };

  const handleSave = async (formData: HomepageSettings) => {
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<HomepageSettings>('homepage_settings', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu cấu hình trang chủ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Header & Save Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0072CE]" />
              <span>Phễu Chuyển Đổi Trang Chủ (7 Phân Khu)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Toàn quyền điều khiển hiển thị và nội dung 7 phân khu tâm lý mua sắm xe ô tô.
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

        {/* 7 Phân Khu Accordions */}
        <div className="space-y-4">
          {/* KHU 1: HERO EVENT BANNER */}
          <ZoneAccordionItem
            id="hero"
            icon={<Clock className="w-4 h-4" />}
            iconClassName="bg-red-600/10 border-red-600/30 text-red-400"
            title="Khu 1: Hero Event Banner & Countdown"
            description="Banner sự kiện lớn trong tháng, đồng hồ đếm ngược, số suất ưu đãi"
            enabledFieldName="heroBanner.enabled"
            isOpen={openZones.hero}
            onToggle={() => toggleAccordion('hero')}
          >
            <Controller
              control={form.control}
              name="heroBanner"
              render={({ field }) => (
                <HeroBannerForm data={field.value} onChange={field.onChange} />
              )}
            />
          </ZoneAccordionItem>

          {/* KHU 2: LEAD MAGNET HUB */}
          <ZoneAccordionItem
            id="filter"
            icon={<Filter className="w-4 h-4" />}
            iconClassName="bg-blue-600/10 border-blue-600/30 text-blue-400"
            title="Khu 2: Lead Magnet Hub (Bộ Lọc Nhanh)"
            description="Thanh tìm xe nhanh theo ngân sách & kiểu dáng phân khúc"
            enabledFieldName="leadFilter.enabled"
            isOpen={openZones.filter}
            onToggle={() => toggleAccordion('filter')}
          >
            <Controller
              control={form.control}
              name="leadFilter"
              render={({ field }) => (
                <LeadFilterForm data={field.value} onChange={field.onChange} />
              )}
            />
          </ZoneAccordionItem>

          {/* KHU 3: FEATURED CARS SHOWCASE */}
          <ZoneAccordionItem
            id="cars"
            icon={<Car className="w-4 h-4" />}
            iconClassName="bg-indigo-600/10 border-indigo-600/30 text-indigo-400"
            title="Khu 3: Các Dòng Xe Bán Chạy (Featured Cars)"
            description="Hiển thị các dòng xe được ghim nổi bật ngay dưới bộ lọc xe"
            enabledFieldName="featuredCars.enabled"
            isOpen={openZones.cars}
            onToggle={() => toggleAccordion('cars')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="featuredCars.headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Tiêu Đề Khối Xe Bán Chạy
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featuredCars.maxDisplay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Số Lượng Xe Hiển Thị Tối Đa
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={12}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 6))
                            )
                          }
                          className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-slate-400">
                💡 <em>Mẹo:</em> Để chọn xe xuất hiện ở khu vực này, bạn chỉ cần vào menu{' '}
                <strong>Quản Lý Xe</strong> và bật công tắc{' '}
                <strong>&quot;Ghim nổi bật&quot; (isFeatured)</strong> cho dòng xe mong muốn.
              </p>
            </div>
          </ZoneAccordionItem>

          {/* KHU 4: BANNER MỒI CÂU DẪN VỀ TRANG TÍNH GIÁ */}
          <ZoneAccordionItem
            id="estimate"
            icon={<Calculator className="w-4 h-4" />}
            iconClassName="bg-rose-600/10 border-rose-600/30 text-rose-400"
            title="Khu 4: Banner Mồi Câu Dẫn Về Trang Tính Giá (Lead Magnet)"
            description="Khối banner kích thích tò mò giá lăn bánh thực tế sau khuyến mãi tiền mặt"
            enabledFieldName="rollingEstimateCallout.enabled"
            isOpen={openZones.estimate}
            onToggle={() => toggleAccordion('estimate')}
          >
            <Controller
              control={form.control}
              name="rollingEstimateCallout"
              render={({ field }) => (
                <RollingEstimateForm
                  data={
                    field.value || {
                      enabled: true,
                      badgeText: 'Minh Bạch Giá — Không Chi Phí Ẩn',
                      headline:
                        'Bạn muốn biết giá lăn bánh chính xác tại TP. Vinh hoặc các huyện Nghệ An sau khi trừ hết khuyến mại tiền mặt?',
                      description:
                        'Dự toán trọn gói biểu phí nhà nước (thuế trước bạ 10%, biển số, đăng kiểm, đường bộ) kèm gói quà tặng phụ kiện chính hãng & ưu đãi tiền mặt độc quyền tại Showroom trong tháng 09/2026.',
                      buttonText: 'Dự Toán Lăn Bánh Tức Thì (Bước 1/2)',
                      commitments: [
                        'Biểu phí chuẩn 100%',
                        'Trừ khuyến mại đại lý',
                        'Dự toán vay góp 24h',
                      ],
                    }
                  }
                  onChange={field.onChange}
                />
              )}
            />
          </ZoneAccordionItem>

          {/* KHU 5: VIP SHOWROOM / SALER PROFILE */}
          <ZoneAccordionItem
            id="saler"
            icon={<UserCheck className="w-4 h-4" />}
            iconClassName="bg-amber-600/10 border-amber-600/30 text-amber-400"
            title="Khu 5: VIP Showroom / Hồ Sơ Saler Uy Tín"
            description="Hồ sơ cá nhân tư vấn bán hàng hoặc cơ sở 3S + 4 Cam kết vàng"
            enabledFieldName="salerShowroom.enabled"
            isOpen={openZones.saler}
            onToggle={() => toggleAccordion('saler')}
          >
            <Controller
              control={form.control}
              name="salerShowroom"
              render={({ field }) => (
                <SalerShowroomForm data={field.value} onChange={field.onChange} />
              )}
            />
          </ZoneAccordionItem>

          {/* KHU 6: DELIVERY STORIES */}
          <ZoneAccordionItem
            id="delivery"
            icon={<ImageIcon className="w-4 h-4" />}
            iconClassName="bg-emerald-600/10 border-emerald-600/30 text-emerald-400"
            title="Khu 6: Bàn Giao Xe Thực Tế (Social Proof)"
            description="Album hình ảnh khách hàng nhận xe tại showroom/tận nhà"
            enabledFieldName="deliveryStories.enabled"
            isOpen={openZones.delivery}
            onToggle={() => toggleAccordion('delivery')}
          >
            <Controller
              control={form.control}
              name="deliveryStories"
              render={({ field }) => (
                <DeliveryStoriesForm data={field.value} onChange={field.onChange} />
              )}
            />
          </ZoneAccordionItem>

          {/* KHU 7: LATEST NEWS & SPECIAL PROMOTIONS */}
          <ZoneAccordionItem
            id="news"
            icon={<Newspaper className="w-4 h-4" />}
            iconClassName="bg-purple-600/10 border-purple-600/30 text-purple-400"
            title="Khu 7: Tin Tức Khuyến Mại & Sự Kiện"
            description="Khối 3-4 bài viết ưu đãi mới nhất (tự động ẩn nếu danh sách bài viết rỗng)"
            enabledFieldName="latestPromotions.enabled"
            isOpen={openZones.news}
            onToggle={() => toggleAccordion('news')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latestPromotions.headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Tiêu Đề Khối Tin Tức
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="latestPromotions.maxPosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Số Bài Viết Tối Đa
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={6}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 3))
                            )
                          }
                          className="w-full h-11 bg-slate-950/80 border-slate-800 text-white text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-slate-400">
                💡 <em>Lưu ý:</em> Phân khu này sẽ tự động nạp các bài viết mới nhất có phân loại Khuyến Mãi. Nếu chưa có bài viết nào, phân khu sẽ tự động ẩn để giữ trang chủ luôn đẹp mắt.
              </p>
            </div>
          </ZoneAccordionItem>
        </div>
      </form>
    </Form>
  );
};
