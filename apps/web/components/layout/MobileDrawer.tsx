'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, PhoneCall, MessageCircle, MapPin, Clock, FileText } from 'lucide-react';
import type { NavLink, ContactSettings } from '@cardealer/types';
import { sanitizePhoneNumber, normalizeZaloUrl } from '@cardealer/types';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  headerLinks: NavLink[];
  contact: ContactSettings;
  onOpenLeadModal?: () => void;
}

// 🧠 Mental Model: Drawer điều hướng trên thiết bị di động với khả năng mở rộng danh mục đa cấp (Accordion).
// 1. Phân chia độc lập: Khu vực danh mục cuộn dọc mượt mà; 2 nút CTA Gọi & Zalo luôn ghim cố định ở đáy.
// 2. Chiều cao nút bấm tối thiểu 48px (h-12) đáp ứng chuẩn WCAG 2.1 AAA Touch Targets cho người dùng lái xe.
export const MobileDrawer = ({
  isOpen,
  onClose,
  headerLinks,
  contact,
  onOpenLeadModal,
}: MobileDrawerProps) => {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'nav-cars': true, // Mặc định mở menu Dòng xe cho khách dễ chọn
  });

  const cleanHotline = sanitizePhoneNumber(contact.hotlineKinhDoanh);
  const cleanZaloUrl = normalizeZaloUrl(contact.zaloNumber || contact.hotlineKinhDoanh);

  const toggleSubMenu = (id: string) => {
    setExpandedMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden flex">
      {/* Backdrop nền mờ */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300 motion-reduce:animate-none">
        {/* Header Drawer */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-baseline">
            <span className="text-lg font-black text-[#002C6C]">HYUNDAI</span>
            <span className="text-lg font-black text-[#0072CE] ml-1">VINH</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Đóng menu điều hướng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {headerLinks.map((link) => {
            const hasSub = Boolean(link.subLinks && link.subLinks.length > 0);
            const isExpanded = Boolean(expandedMenus[link.id]);

            return (
              <div key={link.id} className="border-b border-slate-50 pb-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={link.url}
                    onClick={onClose}
                    className="flex-1 py-2.5 px-2 text-sm font-bold text-slate-800 hover:text-[#0072CE] hover:bg-sky-50/70 rounded-xl transition-all duration-150"
                  >
                    {link.label}
                  </Link>

                  {hasSub && (
                    <button
                      type="button"
                      onClick={() => toggleSubMenu(link.id)}
                      className="p-2 text-slate-400 hover:text-[#0072CE] hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                      aria-label={`Mở rộng menu ${link.label}`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${
                          isExpanded ? 'rotate-180 text-[#0072CE]' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Submenu Accordion */}
                {hasSub && isExpanded && (
                  <div className="pl-4 py-1 space-y-1 bg-slate-50 rounded-xl mb-2">
                    {link.subLinks?.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.url}
                        onClick={onClose}
                        className="block py-2 px-3 text-xs font-semibold text-slate-600 hover:text-[#0072CE] hover:bg-sky-100/60 rounded-lg transition-all duration-150"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Nút Nhận Báo Giá Nhanh */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLeadModal?.();
              }}
              className="w-full h-11 bg-[#002C6C] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Yêu Cầu Báo Giá Lăn Bánh</span>
            </button>
          </div>

          {/* Thông tin đại lý vắn tắt */}
          {(contact.diaChi || contact.workingHours) && (
            <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              {contact.diaChi && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0072CE] flex-shrink-0 mt-0.5" />
                  <span>{contact.diaChi}</span>
                </div>
              )}
              {contact.workingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{contact.workingHours}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed 1-Touch Bottom CTAs */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 grid grid-cols-2 gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <a
            href={`tel:${cleanHotline}`}
            className="h-12 bg-[#002C6C] hover:bg-[#001D48] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>GỌI HOTLINE</span>
          </a>

          <a
            href={cleanZaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 bg-[#0068FF] hover:bg-[#0052CC] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>CHAT ZALO</span>
          </a>
        </div>
      </div>
    </div>
  );
};
