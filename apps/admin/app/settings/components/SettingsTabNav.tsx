'use client';

import { Building2, Compass, UserCheck, Pin, LayoutTemplate, Sparkles } from 'lucide-react';
import { Button } from '@cardealer/ui';

export type SettingsTabId = 'showroom' | 'homepage' | 'navigation' | 'floatingSeller' | 'stickyBar' | 'footer';

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

// 🧠 Mental Model: Thanh điều hướng 4 phân khu cấu hình trong trang Admin Settings.
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
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            className={`h-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none ${isActive
                ? 'bg-[#0072CE] text-white shadow-md shadow-[#0072CE]/30 border border-[#0072CE]/50 hover:bg-[#005BA4] hover:text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};
