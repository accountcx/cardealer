'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PhoneCall, Menu, ChevronDown, ChevronRight, FileText, MapPin, Clock, Sparkles } from 'lucide-react';
import type { NavLink, ContactSettings } from '@cardealer/types';
import { sanitizePhoneNumber } from '@cardealer/types';

export interface NavbarProps {
  headerLinks: NavLink[];
  contact: ContactSettings;
  onOpenLeadModal?: () => void;
  onOpenMobileMenu?: () => void;
}

// 🧠 Mental Model: Thanh điều hướng thương hiệu Hyundai Showroom toàn trang.
// 1. Smart Header: Tự động ẩn khi cuộn xuống và hiện lại thanh Navbar trắng khi cuộn lên.
// 2. Không rớt dòng: Class whitespace-nowrap và tỷ lệ khoảng cách linh hoạt trên mọi kích thước màn hình.
// 3. Hiệu ứng Hover sống động (Interactive Hover State): 
//    - Đổi màu chữ sang Electric Blue (#0072CE), nền soft pill, thanh gạch chân trượt mở (scale-x animation).
//    - Dropdown items dịch chuyển nhẹ (translate-x-1) kèm icon lấp lánh phản hồi trực quan.
export const Navbar = ({
  headerLinks,
  contact,
  onOpenLeadModal,
  onOpenMobileMenu,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const cleanServiceHotline = sanitizePhoneNumber(contact.hotlineDichVu);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Xác định trạng thái nền kính mờ khi cuộn qua đỉnh
      setIsScrolled(currentScrollY > 20);

      // Cơ chế Smart Header:
      // - Ở đầu trang (< 60px): Luôn hiển thị đầy đủ
      // - Cuộn xuống: Ẩn thanh header để giải phóng không gian đọc
      // - Cuộn lên: Hiện lại thanh Navbar trắng để người dùng dễ thao tác
      if (currentScrollY <= 60) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        setIsVisible(false); // Cuộn xuống
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsVisible(true); // Cuộn lên
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 1. TOPBAR TIỆN ÍCH (Không fixed/sticky/z-50, chỉ hiện trên Desktop lg:block, tự trôi mất khi cuộn) */}
      {(contact.diaChi || contact.workingHours || contact.hotlineDichVu) && (
        <div className="hidden lg:block w-full bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              {contact.diaChi && (
                <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                  <MapPin className="w-3.5 h-3.5 text-[#0072CE]" />
                  <span className="whitespace-nowrap">{contact.diaChi}</span>
                </div>
              )}
              {contact.workingHours && (
                <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="whitespace-nowrap">{contact.workingHours}</span>
                </div>
              )}
            </div>

            {/* Hotline Dịch Vụ duy nhất trên TopBar đen */}
            {contact.hotlineDichVu && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Hotline Dịch Vụ &amp; Cứu Hộ:</span>
                <a
                  href={`tel:${cleanServiceHotline}`}
                  className="font-bold text-white hover:text-sky-300 transition-colors whitespace-nowrap hover:underline"
                >
                  {contact.hotlineDichVu}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER & NAVBAR (Smart Sticky: Ẩn khi cuộn xuống, hiện khi cuộn lên) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out motion-reduce:transition-none ${isVisible ? 'translate-y-0' : '-translate-y-full'
          } ${isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80 py-2.5'
            : 'bg-white border-b border-slate-100 py-3'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 xl:gap-4">
          {/* Showroom Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none flex-shrink-0">
            <div className="flex items-baseline transition-transform duration-200 group-hover:scale-[1.02]">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#002C6C] whitespace-nowrap group-hover:text-blue-950 transition-colors">
                XE HYUNDAI
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#0072CE] ml-1.5 tracking-tight whitespace-nowrap group-hover:text-sky-500 transition-colors">
                VINH
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Hover state sắc nét, mượt mà) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 flex-nowrap">
            {headerLinks.map((link) => {
              const hasSub = Boolean(link.subLinks && link.subLinks.length > 0);
              return (
                <div key={link.id} className="relative group flex-shrink-0">
                  <Link
                    href={link.url}
                    target={link.newTab ? '_blank' : undefined}
                    className="relative px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-bold text-slate-700 hover:text-[#0072CE] rounded-xl hover:bg-sky-50/70 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none group/link"
                  >
                    <span className="whitespace-nowrap relative z-10 transition-colors duration-200">
                      {link.label}
                    </span>

                    {hasSub && (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0072CE] group-hover:rotate-180 transition-all duration-200 motion-reduce:transition-none flex-shrink-0" />
                    )}

                    {/* Hiệu ứng gạch chân trượt mở (Bottom Accent Underline Indicator) */}
                    <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-[#0072CE] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center pointer-events-none" />
                  </Link>

                  {/* Mega Dropdown Menu với Hover Effect cho từng mục */}
                  {hasSub && (
                    <div className="absolute top-full left-0 hidden group-hover:block pt-2 w-64 xl:w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150 motion-reduce:animate-none">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2.5 space-y-1">
                        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Danh Mục {link.label}
                        </div>
                        {link.subLinks?.map((sub) => (
                          <Link
                            key={sub.id}
                            href={sub.url}
                            target={sub.newTab ? '_blank' : undefined}
                            className="flex items-center justify-between px-3 py-2.5 text-xs xl:text-sm text-slate-700 hover:text-[#002C6C] hover:bg-sky-50/80 rounded-xl transition-all duration-200 font-semibold group/sub whitespace-nowrap"
                          >
                            <span className="whitespace-nowrap group-hover/sub:translate-x-1 transition-transform duration-200 flex items-center gap-1.5">
                              <ChevronRight className="w-3 h-3 text-[#0072CE] opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-200" />
                              {sub.label}
                            </span>
                            <Sparkles className="w-3.5 h-3.5 text-[#0072CE] opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-200 flex-shrink-0 ml-2" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Action CTA: Nút Nhận Báo Giá (Chỉ hiện trên máy tính Desktop, ẩn trên điện thoại) */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={onOpenLeadModal}
              className="h-9 xl:h-10 px-3.5 xl:px-5 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white text-xs xl:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1.5 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#0072CE] cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span className="whitespace-nowrap">Nhận Báo Giá</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all focus-visible:outline-none flex-shrink-0 cursor-pointer"
            aria-label="Mở menu điều hướng trên điện thoại"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>
    </>
  );
};
