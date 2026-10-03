'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Form, Skeleton } from '@cardealer/ui';
import type { ContactSettings } from '@cardealer/types';
import { ContactSettingsSchema } from '@cardealer/types';
import { BrandSection } from './components/BrandSection';
import { ContactSection } from './components/ContactSection';
import { SocialSection } from './components/SocialSection';
import { LegalSection } from './components/LegalSection';
import { SettingsTabNav, type SettingsTabId } from './components/SettingsTabNav';
import { NavigationSection } from './components/NavigationSection';
import { FloatingSellerSection } from './components/FloatingSellerSection';
import { StickyBarSection } from './components/StickyBarSection';
import { SlideInBannerSection } from './components/SlideInBannerSection';
import { FooterSection } from './components/FooterSection';
import { HomepageFunnelSection } from './components/HomepageFunnelSection';
import { settingsService } from '../../services/settings.service';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied } from '../components/AccessDenied';
import { useSettingsLoader } from './hooks/useSettingsLoader';
import { settingsSchema, type SettingsFormData } from './types';

// 🧠 Mental Model: Trung tâm Quản trị Cấu hình Hệ thống & Storefront Shell.
// Phân chia thành 7 Tab chuyên biệt (Showroom, Trang chủ, Navigation, Chuyên viên nổi, Sticky Bar, Popup Voucher, Footer).
// Tuân thủ triệt để unit_size_limit (< 300 dòng) qua custom hook useSettingsLoader.
export default function SettingsPage() {
  const { can, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>('showroom');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      showroomName: '',
      sellerName: '',
      sellerAvatar: '',
      diaChi: '',
      googleMapsUrl: '',
      hotlineKinhDoanh: '',
      hotlineDichVu: '',
      zaloNumber: '',
      email: '',
      facebookUrl: '',
      tiktokUrl: '',
      youtubeUrl: '',
      legalBusinessName: '',
      legalBusinessLicense: '',
      legalCopyrightText: '',
      legalBctCertificateUrl: '',
    },
    mode: 'onChange',
  });

  const {
    loading,
    error,
    contactData,
    setContactData,
    navData,
    sellerData,
    stickyData,
    slideInData,
    footerData,
    homepageData,
  } = useSettingsLoader(form, can('system:read'), authLoading);

  const onSubmitShowroom = async (data: SettingsFormData) => {
    setSaveError(null);
    try {
      const baseContact = contactData || ContactSettingsSchema.parse({});
      const contactPayload: ContactSettings = ContactSettingsSchema.parse({
        ...baseContact,
        showroomName: data.showroomName,
        sellerName: data.sellerName || baseContact.sellerName || '',
        sellerAvatar: data.sellerAvatar || baseContact.sellerAvatar || '',
        diaChi: data.diaChi,
        googleMapsUrl: data.googleMapsUrl,
        hotlineKinhDoanh: data.hotlineKinhDoanh,
        hotlineDichVu: data.hotlineDichVu,
        zaloNumber: data.zaloNumber,
        email: data.email,
        socialMedia: {
          ...baseContact.socialMedia,
          facebookUrl: data.facebookUrl || '',
          tiktokUrl: data.tiktokUrl || '',
          youtubeUrl: data.youtubeUrl || '',
        },
        legal: {
          businessName: data.legalBusinessName?.trim() || '',
          businessLicense: data.legalBusinessLicense?.trim() || '',
          copyrightText: data.legalCopyrightText?.trim() || '',
          bctCertificateUrl: data.legalBctCertificateUrl?.trim() || undefined,
        },
      });

      const showroomPayload = {
        ...data,
        legal: {
          businessName: data.legalBusinessName?.trim() || '',
          businessLicense: data.legalBusinessLicense?.trim() || '',
          copyrightText: data.legalCopyrightText?.trim() || '',
          bctCertificateUrl: data.legalBctCertificateUrl?.trim() || '',
        },
      };

      await Promise.all([
        settingsService.updateSettingByKey('showroom_settings', showroomPayload),
        settingsService.updateSettingByKey('contact_settings', contactPayload),
      ]);

      setContactData(contactPayload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu cấu hình lên máy chủ';
      setSaveError(msg);
    }
  };

  if (!authLoading && !can('system:read')) {
    return (
      <AccessDenied
        title="Cấu Hình Showroom & Hệ Thống"
        message="Chỉ Quản Trị Viên (Admin) và Quản Lý (Manager) mới có quyền truy cập và chỉnh sửa thông tin đại lý showroom."
        requiredPermission="system:read"
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <Skeleton className="h-64 w-full bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Cấu Hình Hệ Thống & Storefront
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quản trị nhận diện thương hiệu, thông tin hotline, mạng xã hội, pháp lý và các module chốt đơn.
          </p>
        </div>

        {activeTab === 'showroom' && can('system:write') && (
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmitShowroom)}
            disabled={form.formState.isSubmitting}
            className="flex items-center gap-2 bg-[#0072CE] hover:bg-[#005BA4] text-white text-xs sm:text-sm h-10 px-5 shadow-lg shadow-[#0072CE]/25"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Đã Lưu Cấu Hình</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{form.formState.isSubmitting ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* 2. Global Error Notifications */}
      {saveError && (
        <div className="p-4 bg-red-950/40 text-red-400 text-xs sm:text-sm rounded-xl border border-red-800/60 flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-amber-950/40 text-amber-400 text-xs sm:text-sm rounded-xl border border-amber-800/60 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-amber-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Thử lại
          </Button>
        </div>
      )}

      {/* 3. Tab Navigation Pills */}
      <SettingsTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 4. Tab Contents */}
      {activeTab === 'showroom' && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitShowroom)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BrandSection />
              <ContactSection />
            </div>

            <SocialSection />
            <LegalSection />
          </form>
        </Form>
      )}

      {activeTab === 'homepage' && <HomepageFunnelSection initialData={homepageData} />}
      {activeTab === 'navigation' && <NavigationSection initialData={navData} />}
      {activeTab === 'floatingSeller' && <FloatingSellerSection initialData={sellerData} />}
      {activeTab === 'stickyBar' && <StickyBarSection initialData={stickyData} />}
      {activeTab === 'slideInBanner' && <SlideInBannerSection initialData={slideInData} />}
      {activeTab === 'footer' && <FooterSection initialData={footerData} />}
    </div>
  );
}
