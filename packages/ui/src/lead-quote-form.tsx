'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './form';
import { Input } from './input';
import { Button } from './button';
import { cn } from './lib/utils';

export interface LeadQuoteFormData {
  fullName: string;
  phone: string;
}

export interface LeadQuoteFormProps {
  onSubmit: (data: LeadQuoteFormData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
  submitText?: string;
  className?: string;
  buttonClassName?: string;
  defaultValues?: Partial<LeadQuoteFormData>;
}

// 🧠 Mental Model: Canonical Shadcn UI Lead Collection Form Primitive
// 1. Tích hợp react-hook-form xử lý form state và validation chuẩn số điện thoại Việt Nam.
// 2. Tiêu thụ trọn vẹn Design System Primitives: FormField, FormItem, Input, Button từ @cardealer/ui.
// 3. Tái sử dụng linh hoạt giữa Modal Báo Giá (Web) và Landing Page / Lead Magnet Hub.
export const LeadQuoteForm: React.FC<LeadQuoteFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  submitText = 'Gửi Yêu Cầu Nhận Báo Giá Ngay',
  className,
  buttonClassName,
  defaultValues = { fullName: '', phone: '' },
}) => {
  const form = useForm<LeadQuoteFormData>({
    defaultValues,
    mode: 'onTouched',
  });

  const handleSubmit = async (data: LeadQuoteFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn('space-y-4', className)}>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="fullName"
          rules={{
            required: 'Vui lòng nhập họ và tên của bạn',
            minLength: { value: 2, message: 'Họ tên tối thiểu 2 ký tự' },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-bold">Họ và Tên Quý Khách *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="VD: Nguyễn Văn An"
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#0072CE] focus-visible:border-transparent h-11 px-3.5"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          rules={{
            required: 'Vui lòng nhập số điện thoại',
            pattern: {
              value: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
              message: 'Số điện thoại không hợp lệ (cần 10 chữ số di động VN, ví dụ: 0981234567)',
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-bold">Số Điện Thoại Nhận Báo Giá *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="VD: 0981234567 (10 chữ số)"
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#0072CE] focus-visible:border-transparent h-11 px-3.5"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full h-auto min-h-[48px] py-3 px-4 bg-[#002C6C] hover:bg-[#001D48] text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-normal break-words overflow-hidden',
            buttonClassName
          )}
        >
          {loading ? (
            <span className="whitespace-normal leading-snug">Đang gửi thông tin...</span>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-sky-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span className="whitespace-normal break-words leading-snug text-center max-w-full">
                {submitText}
              </span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
