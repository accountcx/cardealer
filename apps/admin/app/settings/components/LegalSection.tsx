import React from 'react';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
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
import type { SettingsFormData } from '../types';

// 🧠 Mental Model: Quản trị thông tin pháp lý doanh nghiệp, GPKD, bản quyền Footer và logo chứng nhận Bộ Công Thương.
// Tiêu thụ FormField từ @cardealer/ui kết nối với useFormContext.
export const LegalSection: React.FC = () => {
  const { control } = useFormContext<SettingsFormData>();

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <ShieldAlert size={20} className="text-sky-400" />
        <h2 className="text-base font-bold text-slate-100">
          Thông Tin Pháp Lý & Đăng Ký Bộ Công Thương
        </h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="legalBusinessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Doanh Nghiệp Pháp Nhân</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ví dụ: Công ty Cổ phần Ô tô Hyundai Vinh"
                    leftIcon={<FileText size={16} />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="legalBusinessLicense"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giấy Phép Kinh Doanh / Mã Số Thuế</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ví dụ: GPKD số 2901234567 do Sở KH&ĐT Nghệ An cấp"
                    leftIcon={<FileText size={16} />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="legalCopyrightText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dòng Bản Quyền Chân Trang (Copyright)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ví dụ: © 2026 Xe Hyundai Vinh. All rights reserved."
                    leftIcon={<FileText size={16} />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="legalBctCertificateUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Chứng Nhận Bộ Công Thương (Nếu có)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="url"
                    placeholder="http://online.gov.vn/Home/WebDetails/..."
                    leftIcon={<CheckCircle2 size={16} />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Card>
  );
};
