'use client';

import { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type {
  NavigationSettings,
  FloatingSellerSettings,
  StickyBarSettings,
  FooterSettings,
  ContactSettings,
  HomepageSettings,
} from '@cardealer/types';
import {
  NavigationSettingsSchema,
  FloatingSellerSettingsSchema,
  StickyBarSettingsSchema,
  FooterSettingsSchema,
  ContactSettingsSchema,
  HomepageSettingsSchema,
} from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';
import type { SettingsFormData } from '../types';

// WHY: Custom Hook nạp toàn bộ dữ liệu cấu hình 6 domain settings song song (0-waterfall).
// Tách từ SettingsPage để tuân thủ nguyên tắc unit_size_limit (< 300 dòng).
export function useSettingsLoader(
  form: UseFormReturn<SettingsFormData>,
  canRead: boolean,
  authLoading: boolean
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contactData, setContactData] = useState<ContactSettings>(ContactSettingsSchema.parse({}));
  const [navData, setNavData] = useState<NavigationSettings>(NavigationSettingsSchema.parse({}));
  const [sellerData, setSellerData] = useState<FloatingSellerSettings>(FloatingSellerSettingsSchema.parse({}));
  const [stickyData, setStickyData] = useState<StickyBarSettings>(StickyBarSettingsSchema.parse({}));
  const [footerData, setFooterData] = useState<FooterSettings>(FooterSettingsSchema.parse({}));
  const [homepageData, setHomepageData] = useState<HomepageSettings>(HomepageSettingsSchema.parse({}));

  useEffect(() => {
    if (authLoading) return;
    if (!canRead) {
      setLoading(false);
      return;
    }

    async function loadAllSettings() {
      try {
        setLoading(true);
        setError(null);

        const [showroomRes, contactRes, navRes, sellerRes, stickyRes, footerRes, homepageRes] =
          await Promise.allSettled([
            settingsService.getSettingByKey<Record<string, unknown>>('showroom_settings'),
            settingsService.getSettingByKey<ContactSettings>('contact_settings'),
            settingsService.getSettingByKey<NavigationSettings>('navigation_settings'),
            settingsService.getSettingByKey<FloatingSellerSettings>('floating_seller_settings'),
            settingsService.getSettingByKey<StickyBarSettings>('sticky_bar_settings'),
            settingsService.getSettingByKey<FooterSettings>('footer_settings'),
            settingsService.getSettingByKey<HomepageSettings>('homepage_settings'),
          ]);

        const showroomData = showroomRes.status === 'fulfilled' ? showroomRes.value || {} : {};
        const parsedContact =
          contactRes.status === 'fulfilled' && contactRes.value
            ? ContactSettingsSchema.parse(contactRes.value)
            : ContactSettingsSchema.parse({});
        setContactData(parsedContact);

        form.reset({
          showroomName: (showroomData.showroomName as string) || parsedContact?.showroomName || '',
          sellerName: (showroomData.sellerName as string) || parsedContact?.sellerName || '',
          sellerAvatar: (showroomData.sellerAvatar as string) || parsedContact?.sellerAvatar || '',
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

        if (navRes.status === 'fulfilled' && navRes.value) {
          setNavData(NavigationSettingsSchema.parse(navRes.value));
        }
        if (sellerRes.status === 'fulfilled' && sellerRes.value) {
          setSellerData(FloatingSellerSettingsSchema.parse(sellerRes.value));
        }
        if (stickyRes.status === 'fulfilled' && stickyRes.value) {
          setStickyData(StickyBarSettingsSchema.parse(stickyRes.value));
        }
        if (footerRes.status === 'fulfilled' && footerRes.value) {
          setFooterData(FooterSettingsSchema.parse(footerRes.value));
        }
        if (homepageRes.status === 'fulfilled' && homepageRes.value) {
          setHomepageData(HomepageSettingsSchema.parse(homepageRes.value));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Chưa có cấu hình showroom trong cơ sở dữ liệu';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadAllSettings();
  }, [form, authLoading, canRead]);

  return {
    loading,
    error,
    contactData,
    setContactData,
    navData,
    sellerData,
    stickyData,
    footerData,
    homepageData,
  };
}
