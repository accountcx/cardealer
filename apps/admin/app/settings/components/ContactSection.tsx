import React from 'react';
import { Phone, Mail } from 'lucide-react';
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

// 🧠 Mental Model: Quản lý các kênh hotline kinh doanh, cứu hộ dịch vụ, Zalo chat và email chính thức.
// Tiêu thụ FormField từ @cardealer/ui kết nối với useFormContext.
export const ContactSection: React.FC = () => {
  const { control } = useFormContext<SettingsFormData>();

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <Phone size={20} className="text-sky-400" />
        <h2 className="text-base font-bold text-slate-100">
          Đường Dây Nóng Tư Vấn Bán Hàng & Hỗ Trợ 24/7
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="hotlineKinhDoanh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotline Bán Hàng & Báo Giá *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0912.345.678"
                  leftIcon={<Phone size={16} />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="zaloNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số Điện Thoại Kết Nối Zalo *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0912345678"
                  leftIcon={<Phone size={16} />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="hotlineDichVu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotline Dịch Vụ & Cứu Hộ 24/7</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0987.654.321"
                  leftIcon={<Phone size={16} />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hòm Thư Điện Tử (Email)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="info@xehyundaivinh.com"
                  leftIcon={<Mail size={16} />}
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
