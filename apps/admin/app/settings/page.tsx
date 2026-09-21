'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Form, Card, Skeleton } from '@cardealer/ui';
import type {
  NavigationSettings,
  FloatingSellerSettings,
  StickyBarSettings,
  FooterSettings,
  ContactSettings,
} from '@cardealer/types';
import {
  NavigationSettingsSchema,
  FloatingSellerSettingsSchema,
  StickyBarSettingsSchema,
  FooterSettingsSchema,
  ContactSettingsSchema,
} from '@cardealer/types';
import { BrandSection } from './components/BrandSection';
import { ContactSection } from './components/ContactSection';
import { SocialSection } from './components/SocialSection';
import { LegalSection } from './components/LegalSection';
import { SettingsTabNav, type SettingsTabId } from './components/SettingsTabNav';
import { NavigationSection } from './components/NavigationSection';
import { FloatingSellerSection } from './components/FloatingSellerSection';
import { StickyBarSection } from './components/StickyBarSection';
import { FooterSection } from './components/FooterSection';
import { settingsService } from '../../services/settings.service';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied } from '../components/AccessDenied';

const settingsSchema = z.object({
  showroomName: z.string().trim().min(1, 'Vui lòng nhập tên showroom'),
  diaChi: z.string().trim().min(1, 'Vui lòng nhập địa chỉ showroom'),
  googleMapsUrl: z.string(),
  hotlineKinhDoanh: z.string().trim().min(1, 'Vui lòng nhập hotline bán hàng'),
  hotlineDichVu: z.string(),
  zaloNumber: z.string().trim().min(1, 'Vui lòng nhập số Zalo kết nối'),
  email: z.string(),
  facebookUrl: z.string(),
  tiktokUrl: z.string(),
  youtubeUrl: z.string(),
  legalBusinessName: z.string().optional(),
  legalBusinessLicense: z.string().optional(),
  legalCopyrightText: z.string().optional(),
  legalBctCertificateUrl: z.string().optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// 🧠 Mental Model: Trung tâm Quản trị Cấu hình Hệ thống & Storefront Shell.
// Phân chia thành 5 Tab chuyên biệt:
// 1. Showroom & Pháp lý (Tên đại lý, hotline, địa chỉ, social media, pháp nhân, GPKD, bản quyền Footer)
// 2. Menu Điều Hướng (Navigation Builder đa cấp)
// 3. Chuyên Viên Nổi (Avatar, hotline, link Zalo, trực tuyến 24/7)
// 4. Thanh Chốt Đơn (Thanh cố định đáy trang, nhãn CTA, hotline kích hoạt)
// 5. Chân Trang (Cấu hình 4 phân khu Footer dynamic, link điều hướng, chứng nhận)
export default function SettingsPage() {
  const { can, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>('showroom');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // States lưu cấu hình cho từng Tab chuyên biệt
  const [contactData, setContactData] = useState<ContactSettings>(ContactSettingsSchema.parse({}));
  const [navData, setNavData] = useState<NavigationSettings>(NavigationSettingsSchema.parse({}));
  const [sellerData, setSellerData] = useState<FloatingSellerSettings>(FloatingSellerSettingsSchema.parse({}));
  const [stickyData, setStickyData] = useState<StickyBarSettings>(StickyBarSettingsSchema.parse({}));
  const [footerData, setFooterData] = useState<FooterSettings>(FooterSettingsSchema.parse({}));

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      showroomName: '',
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

  useEffect(() => {
    if (authLoading) return;
    if (!can('system:read')) {
      setLoading(false);
      return;
    }

    async function loadAllSettings() {
      try {
        setLoading(true);
        setError(null);
        
        // Tải song song tất cả các domain settings
        const [showroomRes, contactRes, navRes, sellerRes, stickyRes, footerRes] = await Promise.allSettled([
          settingsService.getSettingByKey<Record<string, unknown>>('showroom_settings'),
          settingsService.getSettingByKey<ContactSettings>('contact_settings'),
          settingsService.getSettingByKey<NavigationSettings>('navigation_settings'),
          settingsService.getSettingByKey<FloatingSellerSettings>('floating_seller_settings'),
          settingsService.getSettingByKey<StickyBarSettings>('sticky_bar_settings'),
          settingsService.getSettingByKey<FooterSettings>('footer_settings'),
        ]);

        // Tab 1: Showroom & Legal data
        const showroomData = showroomRes.status === 'fulfilled' ? showroomRes.value || {} : {};
        const parsedContact = contactRes.status === 'fulfilled' && contactRes.value ? ContactSettingsSchema.parse(contactRes.value) : ContactSettingsSchema.parse({});
        setContactData(parsedContact);

        form.reset({
          showroomName: (showroomData.showroomName as string) || parsedContact?.showroomName || '',
          diaChi: (showroomData.diaChi as string) || parsedContact?.diaChi || '',
          googleMapsUrl: (showroomData.googleMapsUrl as string) || parsedContact?.googleMapsUrl || '',
          hotlineKinhDoanh: (showroomData.hotlineKinhDoanh as string) || parsedContact?.hotlineKinhDoanh || '',
          hotlineDichVu: (showroomData.hotlineDichVu as string) || parsedContact?.hotlineDichVu || '',
          zaloNumber: (showroomData.zaloNumber as string) || parsedContact?.zaloNumber || '',
          email: (showroomData.email as string) || parsedContact?.email || '',
          facebookUrl: (showroomData.facebookUrl as string) || parsedContact?.socialMedia?.facebookUrl || '',
          tiktokUrl: (showroomData.tiktokUrl as string) || parsedContact?.socialMedia?.tiktokUrl || '',
          youtubeUrl: (showroomData.youtubeUrl as string) || parsedContact?.socialMedia?.youtubeUrl || '',
          legalBusinessName: (showroomData.legalBusinessName as string) || (showroomData.legal as any)?.businessName || parsedContact?.legal?.businessName || '',
          legalBusinessLicense: (showroomData.legalBusinessLicense as string) || (showroomData.legal as any)?.businessLicense || parsedContact?.legal?.businessLicense || '',
          legalCopyrightText: (showroomData.legalCopyrightText as string) || (showroomData.legal as any)?.copyrightText || parsedContact?.legal?.copyrightText || '',
          legalBctCertificateUrl: (showroomData.legalBctCertificateUrl as string) || (showroomData.legal as any)?.bctCertificateUrl || parsedContact?.legal?.bctCertificateUrl || '',
        });

        // Tab 2: Navigation data
        if (navRes.status === 'fulfilled' && navRes.value) {
          setNavData(NavigationSettingsSchema.parse(navRes.value));
        }

        // Tab 3: Floating Seller data
        if (sellerRes.status === 'fulfilled' && sellerRes.value) {
          setSellerData(FloatingSellerSettingsSchema.parse(sellerRes.value));
        }

        // Tab 4: Sticky Bar data
        if (stickyRes.status === 'fulfilled' && stickyRes.value) {
          setStickyData(StickyBarSettingsSchema.parse(stickyRes.value));
        }

        // Tab 5: Footer data
        if (footerRes.status === 'fulfilled' && footerRes.value) {
          setFooterData(FooterSettingsSchema.parse(footerRes.value));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Chưa có cấu hình showroom trong cơ sở dữ liệu';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadAllSettings();
  }, [form, authLoading, can]);

  const onSubmitShowroom = async (data: SettingsFormData) => {
    setSaveError(null);
    try {
      // Chuẩn hóa payload cho contact_settings để đồng bộ với Storefront Footer & Bulk Settings
      const baseContact = contactData || ContactSettingsSchema.parse({});
      const contactPayload: ContactSettings = ContactSettingsSchema.parse({
        ...baseContact,
        showroomName: data.showroomName,
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
      setError(null);
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

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Cài Đặt Hệ Thống & Giao Diện
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Quản trị thông tin đại lý Xe Hyundai Vinh, cấu trúc thanh menu và các tiện ích chốt đơn trực tuyến.
        </p>
      </div>

      {/* Tabs Navigation */}
      <SettingsTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Skeleton Loading State */}
      {loading ? (
        <div className="space-y-4">
          <Card variant="glass" className="p-6">
            <Skeleton className="h-7 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      ) : (
        <>
          {/* TAB 1: SHOWROOM & LIÊN HỆ */}
          {activeTab === 'showroom' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitShowroom)} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Thông Tin Showroom & Pháp Lý</h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Tên đại lý Xe Hyundai Vinh, hotline kinh doanh, hotline dịch vụ, địa chỉ và liên kết mạng xã hội.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {saved && (
                      <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-400 animate-in fade-in duration-200">
                        <Check className="w-4 h-4" /> Đã lưu thành công!
                      </span>
                    )}
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="bg-[#0072CE] hover:bg-[#005BA4] text-white flex items-center gap-2 h-10 px-5 shadow-lg shadow-[#0072CE]/25"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Lưu Thông Tin</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {saveError && (
                  <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <BrandSection />
                <ContactSection />
                <SocialSection />
                <LegalSection />
              </form>
            </Form>
          )}

          {/* TAB 2: MENU ĐIỀU HƯỚNG */}
          {activeTab === 'navigation' && (
            <NavigationSection initialData={navData} />
          )}

          {/* TAB 3: CHUYÊN VIÊN NỔI */}
          {activeTab === 'floatingSeller' && (
            <FloatingSellerSection initialData={sellerData} />
          )}

          {/* TAB 4: THANH CHỐT ĐƠN */}
          {activeTab === 'stickyBar' && (
            <StickyBarSection initialData={stickyData} />
          )}

          {/* TAB 5: CHÂN TRANG */}
          {activeTab === 'footer' && (
            <FooterSection initialData={footerData} />
          )}
        </>
      )}
    </div>
  );
}
