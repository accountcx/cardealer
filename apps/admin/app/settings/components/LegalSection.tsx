import React from 'react';
import { Scale, FileText, Award, ShieldCheck } from 'lucide-react';
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

// 🧠 Mental Model: Quản trị Thông tin Pháp lý, Giấy phép ĐKKD và Bản quyền Chân trang (Legal & Copyright).
// Các trường này là TÙY CHỌN (không bắt buộc và không ép fallback), phù hợp cho cả saler cá nhân lẫn showroom doanh nghiệp.
export const LegalSection: React.FC = () => {
  const { control } = useFormContext<SettingsFormData>();

  return (
    <Card variant="glass" className="p-6 bg-slate-900/90 border-slate-800">
      <div className="flex items-center gap-2.5 mb-5">
        <Scale size={20} className="text-[#0072CE]" />
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Thông Tin Pháp Lý &amp; Bản Quyền Chân Trang (Tùy Chọn)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cấu hình tùy chọn dành cho đại lý / doanh nghiệp. Nếu bạn là chuyên viên tư vấn (saler cá nhân), bạn có thể để trống hoàn toàn các trường này.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="legalBusinessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 font-semibold text-xs sm:text-sm">
                  Tên Pháp Nhân Doanh Nghiệp (Tùy chọn)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    leftIcon={<FileText size={16} className="text-slate-400" />}
                    placeholder="Để trống nếu là saler cá nhân..."
                    className="bg-slate-950/90 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#0072CE]"
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
                <FormLabel className="text-slate-300 font-semibold text-xs sm:text-sm">
                  Số Giấy Phép ĐKKD / Mã Số Thuế (Tùy chọn)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    leftIcon={<ShieldCheck size={16} className="text-slate-400" />}
                    placeholder="Để trống nếu là saler cá nhân..."
                    className="bg-slate-950/90 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#0072CE]"
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
                <FormLabel className="text-slate-300 font-semibold text-xs sm:text-sm">
                  Dòng Chữ Bản Quyền Footer (Copyright - Tùy chọn)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="VD: © 2026 Tuấn Hyundai (hoặc để trống)..."
                    className="bg-slate-950/90 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#0072CE]"
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
                <FormLabel className="text-slate-300 font-semibold text-xs sm:text-sm">
                  Đường Dẫn Chứng Nhận Bộ Công Thương (Tùy chọn)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="url"
                    leftIcon={<Award size={16} className="text-slate-400" />}
                    placeholder="Để trống nếu không có..."
                    className="bg-slate-950/90 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#0072CE]"
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
