'use client';

import React, { useState } from 'react';
import type { BulkSettings } from '@cardealer/types';
import { Navbar } from './Navbar';
import { MobileDrawer } from './MobileDrawer';
import { FloatingSeller } from './FloatingSeller';
import { ProductStickyBar } from './ProductStickyBar';
import { LeadQuoteModal } from './LeadQuoteModal';
import { NavigationContext } from '../../context/NavigationContext';

export interface ViewportCoordinatorProps {
  settings: BulkSettings;
  children: React.ReactNode;
}

// 🧠 Mental Model: Viewport Coordinator điều phối toàn bộ các thành phần Shell và Widgets tương tác của Storefront.
// 1. Quản trị trạng thái hiển thị của Mobile Drawer và Lead Quote Modal.
// 2. Lắng nghe sự kiện scroll của StickyBar để nâng độ cao của FloatingSeller, ngăn ngừa 100% rủi ro va chạm trên Mobile (R6 Mitigation).
export const ViewportCoordinator = ({ settings, children }: ViewportCoordinatorProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadModalCarTitle, setLeadModalCarTitle] = useState<string | undefined>(undefined);
  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);

  React.useEffect(() => {
    const handleOpenLeadModal = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setLeadModalCarTitle(detail?.carTitle);
      setIsLeadModalOpen(true);
    };
    window.addEventListener('open-lead-modal', handleOpenLeadModal);
    return () => window.removeEventListener('open-lead-modal', handleOpenLeadModal);
  }, []);

  return (
    <NavigationContext.Provider value={settings.navigation.headerLinks}>
      <div className="min-h-screen flex flex-col justify-between relative overflow-x-clip">
        {/* 1. Showroom Navbar & TopBar */}
        <Navbar
          headerLinks={settings.navigation.headerLinks}
          contact={settings.contact}
          onOpenLeadModal={() => setIsLeadModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* 2. Mobile Navigation Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          headerLinks={settings.navigation.headerLinks}
          contact={settings.contact}
          onOpenLeadModal={() => setIsLeadModalOpen(true)}
        />

        {/* 3. Thân Trang (Page Content) */}
        <main className="flex-1 w-full overflow-x-clip">{children}</main>

        {/* 4. Widget Chuyên Viên Nổi (Tự động nâng cao khi StickyBar xuất hiện) */}
        <FloatingSeller
          settings={settings.floatingSeller}
          isStickyBarVisible={isStickyBarVisible}
        />

        {/* 5. Thanh Chốt Đơn Cố Định Đáy Màn Hình */}
        <ProductStickyBar
          settings={settings.stickyBar}
          onOpenLeadModal={() => setIsLeadModalOpen(true)}
          onVisibilityChange={setIsStickyBarVisible}
        />

        {/* 6. Modal Thu Thập Báo Giá Nhanh */}
        <LeadQuoteModal
          isOpen={isLeadModalOpen}
          onClose={() => {
            setIsLeadModalOpen(false);
            setLeadModalCarTitle(undefined);
          }}
          carTitle={leadModalCarTitle}
        />
      </div>
    </NavigationContext.Provider>
  );
};
