'use client';

import * as React from 'react';
import { Button } from './button';
import { cn } from './lib/utils';

export interface AdminShellNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string;
  disabled?: boolean;
}

export interface AdminShellUser {
  fullName?: string;
  role?: string;
  roleLabel?: string;
  avatarText?: string;
}

export interface AdminShellProps {
  children: React.ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
  brandLogo?: React.ReactNode;
  navItems: AdminShellNavItem[];
  navSectionTitle?: string;
  user?: AdminShellUser | null;
  userLoading?: boolean;
  profileHref?: string;
  onLogout?: () => void;
  logoutText?: string;
  breadcrumbs?: React.ReactNode;
  topbarActions?: React.ReactNode;
  externalSiteUrl?: string;
  externalSiteLabel?: string;
  defaultSidebarOpen?: boolean;
  linkComponent?: React.ElementType;
  className?: string;
}

// 🧠 Mental Model: Canonical Reusable Admin Layout Shell (@cardealer/ui)
// 1. Cố định Viewport hoàn toàn (`fixed inset-0 overflow-hidden`), ngăn hiện tượng thanh cuộn kép.
// 2. Fixed Collapsible Sidebar bên trái (chuyển đổi w-64 và w-20 kèm transition mượt mà).
// 3. Fixed Topbar bên phải kèm breadcrumbs, theme toggle và external link.
// 4. Content Workspace độc lập (`<main className="overflow-y-auto">`) cho phép cuộn tự do.
export const AdminShell: React.FC<AdminShellProps> = ({
  children,
  brandTitle = 'CarDealer CMS',
  brandSubtitle = 'Hyundai Vinh Showroom',
  brandLogo,
  navItems,
  navSectionTitle = 'Quản Trị Hệ Thống',
  user,
  userLoading = false,
  profileHref = '/profile',
  onLogout,
  logoutText = 'Đăng Xuất',
  breadcrumbs,
  topbarActions,
  externalSiteUrl,
  externalSiteLabel = 'Xem Website Khách Hàng',
  defaultSidebarOpen = true,
  linkComponent: LinkComp = 'a',
  className,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(defaultSidebarOpen);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getInitials = (name?: string) => {
    if (!name) return 'NV';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleBadgeClasses = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
      case 'manager':
        return 'text-sky-300 bg-sky-500/10 border-sky-500/20';
      case 'editor':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const formatRoleLabel = (userObj?: AdminShellUser | null) => {
    if (!userObj) return 'NHÂN VIÊN';
    if (userObj.roleLabel) return userObj.roleLabel;
    switch (userObj.role) {
      case 'admin':
        return 'ADMIN';
      case 'manager':
        return 'QUẢN LÝ';
      case 'editor':
        return 'BIÊN TẬP';
      default:
        return 'SALES';
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 flex overflow-hidden bg-[#0B0F17] text-slate-100 font-sans antialiased select-none',
        className
      )}
    >
      {/* 1. FIXED SIDEBAR (CỐ ĐỊNH HOÀN TOÀN BÊN TRÁI) */}
      <aside
        className={cn(
          'flex flex-col justify-between shrink-0 h-full border-r border-white/10 bg-slate-900/95 backdrop-blur-2xl transition-all duration-300 z-30 overflow-y-auto',
          isSidebarOpen ? 'w-64 p-5' : 'w-20 p-3'
        )}
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-white/10">
            {brandLogo ? (
              brandLogo
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002C6C] to-[#0072CE] flex items-center justify-center font-black text-lg text-white shadow-[0_4px_15px_rgba(0,114,206,0.35)] shrink-0">
                H
              </div>
            )}
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <div className="text-sm font-extrabold text-white tracking-tight leading-tight">
                  {brandTitle}
                </div>
                {brandSubtitle && (
                  <div className="text-[11px] text-slate-400 font-medium truncate">
                    {brandSubtitle}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {isSidebarOpen && navSectionTitle && (
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5">
                {navSectionTitle}
              </div>
            )}

            {/* Skeleton loading khi chưa tải xong User Profile */}
            {userLoading && !user && (
              <div className="space-y-2 px-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-xl bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            )}

            {navItems.map((item) => {
              return (
                <div key={item.label}>
                  {item.disabled ? (
                    <div
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed',
                        !isSidebarOpen && 'justify-center'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && <span className="shrink-0">{item.icon}</span>}
                        {isSidebarOpen && <span>{item.label}</span>}
                      </div>
                      {isSidebarOpen && item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ) : (
                    <LinkComp
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                        !isSidebarOpen && 'justify-center',
                        item.active
                          ? 'bg-gradient-to-r from-[#002C6C] to-[#005BA6] text-white shadow-[0_4px_15px_rgba(0,44,108,0.4)] border border-sky-400/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && (
                          <span
                            className={cn(
                              'shrink-0',
                              item.active ? 'text-sky-300' : 'text-slate-400'
                            )}
                          >
                            {item.icon}
                          </span>
                        )}
                        {isSidebarOpen && <span>{item.label}</span>}
                      </div>
                      {isSidebarOpen && item.active && (
                        <svg
                          className="w-3.5 h-3.5 text-sky-300 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </LinkComp>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {isSidebarOpen &&
            (userLoading ? (
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-800 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3.5 w-24 bg-slate-800 rounded" />
                  <div className="h-2.5 w-16 bg-slate-800 rounded" />
                </div>
              </div>
            ) : user ? (
              <LinkComp
                href={profileHref}
                className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-xs font-black text-sky-400 shadow-sm shrink-0">
                  {user.avatarText ?? getInitials(user.fullName)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                    {user.fullName || 'Nhân Viên'}
                  </div>
                  <div
                    className={cn(
                      'text-[10px] font-bold inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-md border',
                      getRoleBadgeClasses(user.role)
                    )}
                  >
                    <svg
                      className="w-2.5 h-2.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    {formatRoleLabel(user)}
                  </div>
                </div>
              </LinkComp>
            ) : null)}

          {onLogout && (
            <Button
              variant="danger"
              size="sm"
              onClick={onLogout}
              className="w-full text-xs font-semibold py-2"
              leftIcon={
                <svg
                  className="w-3.5 h-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              }
            >
              {isSidebarOpen && logoutText}
            </Button>
          )}
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
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {breadcrumbs ? (
              breadcrumbs
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Admin</span>
                <span className="text-slate-600">/</span>
                <span className="text-white font-bold">Quản Lý Showroom</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {topbarActions ? (
              topbarActions
            ) : (
              <>
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  title="Chuyển đổi giao diện Sáng / Tối"
                  type="button"
                >
                  {theme === 'dark' ? (
                    <svg
                      className="w-3.5 h-3.5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5 text-sky-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                  <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </button>

                {/* External Website Link */}
                {externalSiteUrl && (
                  <a
                    href={externalSiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-3.5 py-1.5 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {externalSiteLabel}
                  </a>
                )}
              </>
            )}
          </div>
        </header>

        {/* 3. INDEPENDENT SCROLLING CONTENT AREA (CHỈ PHẦN NÀY ĐƯỢC CUỘN) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 select-text">
          <div className="w-full max-w-[1720px] mx-auto pb-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
