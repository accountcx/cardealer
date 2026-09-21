'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Car, 
  Palette, 
  FileText, 
  Users, 
  Settings, 
  UserCheck,
  User as UserIcon,
} from 'lucide-react';
import { clientEnv } from '@cardealer/env';
import { AdminShell as SharedAdminShell, type AdminShellNavItem } from '@cardealer/ui';
import { useAuth } from '../../contexts/AuthContext';
import type { PermissionAction } from '@cardealer/types';

interface AdminShellProps {
  children: React.ReactNode;
}

interface NavItemConfig extends AdminShellNavItem {
  permission?: PermissionAction;
}

// 🧠 Mental Model: AdminShell Page Controller
// Tiêu thụ component layout dùng chung AdminShell từ @cardealer/ui
// Kết nối Router Next.js, Auth Context, RBAC Permission Matrix và Environment Variables
export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { user, loading, can, logout } = useAuth();

  // Không hiển thị Shell tại trang Login
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const allNavItems: NavItemConfig[] = [
    {
      label: 'Dòng Xe Hyundai',
      href: '/cars',
      icon: <Car size={18} />,
      permission: 'cars:read',
      active: pathname.startsWith('/cars') || pathname === '/',
    },
    {
      label: 'Bảng Màu Ngoại Thất',
      href: '/colors',
      icon: <Palette size={18} />,
      permission: 'cars:write',
      active: pathname.startsWith('/colors'),
    },
    {
      label: 'Tài Khoản Nhân Sự',
      href: '/users',
      icon: <UserCheck size={18} />,
      permission: 'users:read',
      active: pathname.startsWith('/users'),
    },
    {
      label: 'Hồ Sơ & Bảo Mật',
      href: '/profile',
      icon: <UserIcon size={18} />,
      active: pathname.startsWith('/profile'),
    },
    {
      label: 'Khách Hàng & Báo Giá',
      href: '/leads',
      icon: <Users size={18} />,
      permission: 'leads:read',
      active: pathname.startsWith('/leads'),
    },
    {
      label: 'Bài Viết & Đánh Giá',
      href: '#',
      icon: <FileText size={18} />,
      badge: 'Phase 4',
      disabled: true,
    },
    {
      label: 'Cài Đặt Showroom',
      href: '/settings',
      icon: <Settings size={18} />,
      permission: 'system:read',
      active: pathname.startsWith('/settings'),
    },
  ];

  // 🧠 Lọc Navigation theo ma trận quyền RBAC:
  // Nếu người dùng không có permission tương ứng với Role thì ẨN HOÀN TOÀN nav item
  const visibleNavItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    if (loading || !user || !user.role) return false;
    return can(item.permission);
  });

  return (
    <SharedAdminShell
      brandTitle="CarDealer CMS"
      brandSubtitle="Hyundai Vinh Showroom"
      navItems={visibleNavItems}
      user={user}
      userLoading={loading}
      profileHref="/profile"
      onLogout={logout}
      linkComponent={Link}
      externalSiteUrl={clientEnv.NEXT_PUBLIC_SITE_URL}
      externalSiteLabel="Xem Website Khách Hàng"
    >
      {children}
    </SharedAdminShell>
  );
}
