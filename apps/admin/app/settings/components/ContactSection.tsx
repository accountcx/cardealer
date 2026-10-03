import React, { useState } from 'react';
import { Phone, Mail, User, Image as ImageIcon } from 'lucide-react';
import {
  Card,
  Input,
  Button,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@cardealer/ui';
import { useFormContext } from 'react-hook-form';
import type { SettingsFormData } from '../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';

// 🧠 Mental Model: Quản lý các kênh hotline kinh doanh, cứu hộ dịch vụ, Zalo chat, chuyên viên tư vấn, avatar và email.
// Hỗ trợ chọn ảnh đại diện trực tiếp từ Kho ảnh MediaPickerModal hoặc nhập URL tùy chỉnh.
export const ContactSection: React.FC = () => {
  const { control, setValue, watch } = useFormContext<SettingsFormData>();
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const avatarUrl = watch('sellerAvatar');

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <Phone size={20} className="text-sky-400" />
        <h2 className="text-base font-bold text-slate-100">
          Thông Tin Chuyên Viên & Đường Dây Nóng Hỗ Trợ 24/7
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="sellerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ Tên Chuyên Viên Tư Vấn Đại Diện</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ví dụ: Tuấn Hyundai"
                  leftIcon={<User size={16} />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Chọn ảnh đại diện Avatar chuyên viên từ Thư viện Media */}
        <div className="md:col-span-2">
          <FormField
            control={control}
            name="sellerAvatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ảnh Đại Diện Chuyên Viên (Avatar)</FormLabel>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-sky-400/40 bg-slate-800 flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>
                  <FormControl>
                    <div className="flex-1">
                      <Input
                        {...field}
                        placeholder="Đường dẫn ảnh hoặc chọn từ thư viện..."
                        leftIcon={<ImageIcon size={16} />}
                      />
                    </div>
                  </FormControl>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="shrink-0 flex items-center gap-1.5 text-xs h-10 px-3.5 border-white/10 hover:border-sky-500/40 cursor-pointer"
                  >
                    <ImageIcon size={14} className="text-sky-400" />
                    <span>Thư Viện Ảnh</span>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-2">
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
      </div>

      {/* Modal Chọn Ảnh Từ Thư Viện Media */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        mode="single"
        title="Chọn Ảnh Đại Diện Chuyên Viên"
        onSelect={(items) => {
          if (items.length > 0) {
            setValue('sellerAvatar', items[0].url, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        }}
      />
    </Card>
  );
};
