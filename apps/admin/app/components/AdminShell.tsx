'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Car, 
  Palette, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import { clientEnv } from '@cardealer/env';
import { Button, Badge } from '@cardealer/ui';
import { authService } from '../../services/auth.service';

interface AdminShellProps {
  children: React.ReactNode;
}

// 🧠 Mental Model: AdminShell cung cấp Fixed Topbar và Fixed Sidebar không bị cuộn theo trang
// Khóa viewport với `fixed inset-0 overflow-hidden`, chỉ cho phép phần `<main>` cuộn nội dung độc lập
export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Không hiển thị Shell tại trang Login
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/login');
    router.refresh();
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navItems = [
    { label: 'Dòng Xe Hyundai', href: '/cars', icon: Car, active: pathname.startsWith('/cars') || pathname === '/' },
    { label: 'Bảng Màu Ngoại Thất', href: '/colors', icon: Palette, active: pathname.startsWith('/colors') },
    { label: 'Khách Hàng & Báo Giá', href: '#', icon: Users, badge: 'Phase 2', disabled: true },
    { label: 'Bài Viết & Đánh Giá', href: '#', icon: FileText, badge: 'Phase 4', disabled: true },
    { label: 'Cài Đặt Showroom', href: '/settings', icon: Settings, active: pathname.startsWith('/settings') },
  ];

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[#0B0F17] text-slate-100 font-sans antialiased select-none">
      {/* 1. FIXED SIDEBAR (CỐ ĐỊNH HOÀN TOÀN BÊN TRÁI) */}
      <aside
        className={`flex flex-col justify-between shrink-0 h-full border-r border-white/10 bg-slate-900/95 backdrop-blur-2xl transition-all duration-300 z-30 overflow-y-auto ${
          isSidebarOpen ? 'w-64 p-5' : 'w-20 p-3'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002C6C] to-[#0072CE] flex items-center justify-center font-black text-lg text-white shadow-[0_4px_15px_rgba(0,114,206,0.35)] shrink-0">
              H
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <div className="text-sm font-extrabold text-white tracking-tight leading-tight">
                  CarDealer CMS
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  Hyundai Vinh Showroom
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {isSidebarOpen && (
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5">
                Quản Trị Hệ Thống
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  {item.disabled ? (
                    <div
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed ${
                        !isSidebarOpen && 'justify-center'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        {isSidebarOpen && <span>{item.label}</span>}
                      </div>
                      {isSidebarOpen && item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        !isSidebarOpen && 'justify-center'
                      } ${
                        item.active
                          ? 'bg-gradient-to-r from-[#002C6C] to-[#005BA6] text-white shadow-[0_4px_15px_rgba(0,44,108,0.4)] border border-sky-400/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={item.active ? 'text-sky-300' : 'text-slate-400'}
                        />
                        {isSidebarOpen && <span>{item.label}</span>}
                      </div>
                      {isSidebarOpen && item.active && (
                        <ChevronRight size={14} className="text-sky-300" />
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-xs font-black text-sky-400 shadow-sm shrink-0">
                TH
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">Tuấn Hyundai</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck size={12} /> Quản Trị Viên
                </div>
              </div>
            </div>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut size={15} />}
            className="w-full text-xs font-semibold py-2"
          >
            {isSidebarOpen && 'Đăng Xuất'}
          </Button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE (BÊN PHẢI) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* FIXED TOPBAR (CỐ ĐỊNH Ở TRÊN CÙNG) */}
        <header className="h-16 shrink-0 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Thu gọn / Mở rộng Sidebar"
              type="button"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Admin</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-bold">Quản Lý Showroom</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              title="Chuyển đổi giao diện Sáng / Tối (UI_SPEC.md)"
              type="button"
            >
              {theme === 'dark' ? (
                <Sun size={14} className="text-amber-400" />
              ) : (
                <Moon size={14} className="text-sky-400" />
              )}
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>

            {/* External Website Link */}
            <a
              href={clientEnv.NEXT_PUBLIC_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink size={14} /> Xem Website Khách Hàng
            </a>
          </div>
        </header>

        {/* 3. INDEPENDENT SCROLLING CONTENT AREA (CHỈ PHẦN NÀY ĐƯỢC CUỘN) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 select-text">
          <div className="w-full max-w-[1720px] mx-auto pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
