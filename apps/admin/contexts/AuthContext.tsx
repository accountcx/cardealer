'use client';

// 🧠 Mental Model: Centralized AuthContext & RBAC State Provider cho Admin Portal.
// Cung cấp thông tin phiên làm việc, role và hàm `can(action)` O(1) kiểm tra quyền RBAC.
// Đồng bộ tức thì khi đăng nhập / đăng xuất mà không cần tải lại trang.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { canUser } from '../lib/permissions';
import type { UserResponse, Role, PermissionAction } from '@cardealer/types';

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  can: (action: PermissionAction) => boolean;
  refreshUser: () => Promise<UserResponse | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<UserResponse | null> => {
    try {
      const res: any = await authService.getProfile();
      const userData: UserResponse = res?.user || res;
      if (userData && userData.id && userData.role) {
        setUser(userData);
        return userData;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Không tải thông tin người dùng nếu đang ở trang login
    if (pathname === '/login') {
      setLoading(false);
      return;
    }

    refreshUser();
  }, [pathname, refreshUser]);

  const can = useCallback(
    (action: PermissionAction): boolean => {
      if (loading || !user || !user.role) return false;
      return canUser(user, action);
    },
    [user, loading]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
    // Xóa cookie token
    document.cookie = 'admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, can, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
