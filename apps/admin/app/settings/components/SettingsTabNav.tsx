'use client';

import {
  Building2,
  Compass,
  UserCheck,
  Pin,
  LayoutTemplate,
  Sparkles,
  Gift,
  Award,
  Activity,
} from 'lucide-react';
import { Button } from '@cardealer/ui';

export type SettingsTabId =
  | 'showroom'
  | 'seoTracking'
  | 'homepage'
  | 'navigation'
  | 'floatingSeller'
  | 'stickyBar'
  | 'slideInBanner'
  | 'author'
  | 'footer';

export interface TabItem {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: React.ElementType;
}

export const SETTINGS_TABS: TabItem[] = [
  {
    id: 'showroom',
    label: 'Showroom & Liên Hệ',
    description: 'Tên đại lý, hotline 24/7, địa chỉ, bản đồ và pháp lý',
    icon: Building2,
  },
  {
    id: 'seoTracking',
    label: 'SEO & Tracking',
    description: 'Google Tag Manager, GA4, FB Pixel, Clarity, mã nhúng Header/Body và SEO mặc định',
    icon: Activity,
  },
  {
    id: 'homepage',
    label: 'Trang Chủ (Phễu 7 Khu)',
    description: 'Bật/tắt 7 phân khu, banner sự kiện, đếm ngược, cam kết saler, album giao xe',
    icon: Sparkles,
  },
  {
    id: 'navigation',
    label: 'Menu Điều Hướng',
    description: 'Menu đa cấp, liên kết sản phẩm, thứ tự hiển thị',
    icon: Compass,
  },
  {
    id: 'floatingSeller',
    label: 'Chuyên Viên Nổi',
    description: 'Widget tư vấn trực tuyến, avatar, số điện thoại, Zalo',
    icon: UserCheck,
  },
  {
    id: 'stickyBar',
    label: 'Thanh Chốt Đơn',
    description: 'Thanh ghim cố định đáy màn hình, nhãn nút CTA, hotline',
    icon: Pin,
  },
  {
    id: 'slideInBanner',
    label: 'Popup Voucher & Trượt',
    description: 'Banner trượt góc, popup voucher ưu đãi, thời gian trễ và % cuộn',
    icon: Gift,
  },
  {
    id: 'author',
    label: 'Tác Giả & E-E-A-T',
    description: 'Thông tin ban biên tập, chuyên gia bài viết, số năm kinh nghiệm và tiểu sử E-E-A-T',
    icon: Award,
  },
  {
    id: 'footer',
    label: 'Chân Trang (Footer)',
    description: 'Danh mục dòng xe, dịch vụ, bản đồ Google Maps và huy hiệu',
    icon: LayoutTemplate,
  },
];

export interface SettingsTabNavProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

// 🧠 Mental Model: Thanh điều hướng 9 phân khu cấu hình trong trang Admin Settings.
// Sử dụng các icon từ lucide-react và tab pills hiện đại với focus rings chuẩn WCAG.
export const SettingsTabNav = ({ activeTab, onTabChange }: SettingsTabNavProps) => {
  return (
    <nav className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg" aria-label="Cài đặt hệ thống tabs">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Button
            key={tab.id}
            type="button"
            variant={isActive ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 border border-sky-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
            <span>{tab.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};
