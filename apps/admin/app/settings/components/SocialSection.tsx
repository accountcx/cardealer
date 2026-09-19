import React from 'react';
import { Share2 } from 'lucide-react';
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

// 🧠 Mental Model: Quản lý liên kết mạng xã hội chính thức của đại lý (Facebook Fanpage, YouTube Channel).
// Tiêu thụ FormField từ @cardealer/ui kết nối với useFormContext.
export const SocialSection: React.FC = () => {
  const { control } = useFormContext<SettingsFormData>();

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <Share2 size={20} className="text-sky-400" />
        <h2 className="text-base font-bold text-slate-100">
          Kênh Mạng Xã Hội & Truyền Thông
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="facebookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fanpage Facebook</FormLabel>
              <FormControl>
                <Input {...field} type="url" placeholder="https://facebook.com/..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="youtubeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kênh YouTube</FormLabel>
              <FormControl>
                <Input {...field} type="url" placeholder="https://youtube.com/@..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
};
