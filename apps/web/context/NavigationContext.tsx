'use client';

import React, { createContext, useContext } from 'react';
import type { NavLink } from '@cardealer/types';

// 🧠 Mental Model: Context cung cấp danh sách menu động được cấu hình từ Admin CMS qua API /api/settings.
export const NavigationContext = createContext<NavLink[]>([]);

export const useNavigationLinks = (): NavLink[] => {
  return useContext(NavigationContext);
};
