import React from 'react';
import { Building2, MapPin, Globe } from 'lucide-react';
import {
  Card,
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@cardealer/ui';
import { useFormContext } from 'react-hook-form';
import type { SettingsFormData } from '../page';

// 🧠 Mental Model: Quản lý thông tin định danh thương hiệu, địa chỉ showroom và tích hợp Google Maps.
// Tiêu thụ FormField từ @cardealer/ui kết nối với useFormContext.
export const BrandSection: React.FC = () => {
  const { control } = useFormContext<SettingsFormData>();

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <Building2 size={20} className="text-sky-400" />
        <h2 className="text-base font-bold text-slate-100">
          Thông Tin Thương Hiệu & Showroom
        </h2>
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="showroomName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên Showroom / Đại Lý Chính Thức *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ví dụ: Xe Hyundai Vinh"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="diaChi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa Chỉ Trưng Bày & Trụ Sở Showroom *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  leftIcon={<MapPin size={16} />}
                  placeholder="Ví dụ: Km 3+500 Đại lộ Lê Nin, Xã Nghi Phú, TP. Vinh, Nghệ An"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="googleMapsUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đường Dẫn Bản Đồ Google Maps</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  leftIcon={<Globe size={16} />}
                  placeholder="https://maps.google.com/?q=..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
};
