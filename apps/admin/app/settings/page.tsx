'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Form, Card, Skeleton } from '@cardealer/ui';
import { BrandSection } from './components/BrandSection';
import { ContactSection } from './components/ContactSection';
import { SocialSection } from './components/SocialSection';
import { settingsService } from '../../services/settings.service';

const settingsSchema = z.object({
  showroomName: z.string().trim().min(1, 'Vui lòng nhập tên showroom'),
  diaChi: z.string().trim().min(1, 'Vui lòng nhập địa chỉ showroom'),
  googleMapsUrl: z.string(),
  hotlineKinhDoanh: z.string().trim().min(1, 'Vui lòng nhập hotline bán hàng'),
  hotlineDichVu: z.string(),
  zaloNumber: z.string().trim().min(1, 'Vui lòng nhập số Zalo kết nối'),
  email: z.string(),
  facebookUrl: z.string(),
  youtubeUrl: z.string(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// 🧠 Mental Model: Trang cấu hình Showroom phân chia thành 3 sub-sections độc lập (Brand, Contact, Social) tuân thủ SRP.
// Tích hợp react-hook-form FormProvider để quản trị form state tập trung, Type-Safe qua Zod.
export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      youtubeUrl: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError(null);
        const data = await settingsService.getSettings();
        if (data) {
          form.reset({
            showroomName: data.showroomName || '',
            diaChi: data.diaChi || '',
            googleMapsUrl: data.googleMapsUrl || '',
            hotlineKinhDoanh: data.hotlineKinhDoanh || '',
            hotlineDichVu: data.hotlineDichVu || '',
            zaloNumber: data.zaloNumber || '',
            email: data.email || '',
            facebookUrl: data.facebookUrl || '',
            youtubeUrl: data.youtubeUrl || '',
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Chưa có cấu hình showroom trong cơ sở dữ liệu';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [form]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaveError(null);
    try {
      await settingsService.updateSettings(data);
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu cấu hình lên máy chủ';
      setSaveError(msg);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-100 tracking-tight">
                Cấu Hình Đại Lý & Showroom
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Thiết lập thông tin liên hệ, hotline tư vấn báo giá, Zalo và địa chỉ showroom hiển thị trên toàn hệ thống
              </p>
            </div>

            <Button
              variant={saved ? 'success' : 'accent'}
              glow={!saved}
              type="submit"
              isLoading={form.formState.isSubmitting}
              leftIcon={saved ? <Check size={16} /> : <Save size={16} />}
            >
              {saved ? 'Đã Lưu Thành Công!' : 'Lưu Cấu Hình'}
            </Button>
          </div>

          {/* Save Error Notification */}
          {saveError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2.5 text-sm shadow-lg">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <span>
                <strong className="font-bold text-red-200">Lỗi lưu cấu hình:</strong> {saveError}
              </span>
            </div>
          )}

          {/* Load Info / Warning */}
          {error && (
            <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 flex items-center gap-2.5 text-xs">
              <AlertCircle size={16} className="text-sky-400 shrink-0" />
              <span>
                Thông báo: {error}. Bạn có thể điền các trường bên dưới và nhấn <strong>Lưu Cấu Hình</strong> để tạo mới.
              </span>
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              {/* BrandSection Skeleton */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-5 w-64 rounded" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-56 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-44 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </Card>

              {/* ContactSection Skeleton */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-5 w-72 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-44 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </Card>

              {/* SocialSection Skeleton */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-5 w-60 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <BrandSection />
              <ContactSection />
              <SocialSection />
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
