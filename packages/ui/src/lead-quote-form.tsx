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
  /** Hàm callback khi submit lead thành công */
  onSubmit: (data: LeadQuoteFormData) => Promise<void> | void;
  /** Trạng thái loading đang gửi */
  loading?: boolean;
  /** Thông báo lỗi từ server */
  error?: string | null;
  /** Nội dung nhãn nút bấm submit */
  submitText?: string;
  /** ClassName bổ sung cho form */
  className?: string;
  /** ClassName bổ sung cho nút bấm */
  buttonClassName?: string;
  /** Giá trị mặc định */
  defaultValues?: Partial<LeadQuoteFormData>;
  /** Bố cục trường nhập liệu: 'vertical' (Modal) hoặc 'horizontal' (Lead Magnet giữa bài) */
  layout?: 'vertical' | 'horizontal';
  /** Giao diện màu sắc: 'light' (nền trắng modal) hoặc 'dark' (nền tối thẻ card) */
  variant?: 'light' | 'dark';
  /** Bắt buộc nhập họ tên hay không (Mặc định true, false cho cơ chế CRO 1-chạm) */
  isNameRequired?: boolean;
  /** Hiển thị nhãn trường nhập liệu FormLabel (Mặc định true) */
  showLabels?: boolean;
  /** Hiển thị thông điệp cam kết bảo mật và tốc độ phản hồi 5 phút (Mặc định false) */
  showTrustNotice?: boolean;
  /** Biến thể màu sắc nút bấm */
  buttonVariant?: 'primary' | 'accent';
}

// 🧠 Mental Model: Canonical Shadcn UI Lead Collection Form Primitive
// 1. Tích hợp react-hook-form xử lý form state và validation chuẩn số điện thoại Việt Nam.
// 2. Tiêu thụ trọn vẹn Design System Primitives: FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Button từ @cardealer/ui.
// 3. Tái sử dụng linh hoạt giữa Modal Báo Giá (Web), Landing Page, và Inbound Lead Magnet Hub (InlineQuickForm, GatedContent).
export const LeadQuoteForm: React.FC<LeadQuoteFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  submitText = 'Gửi Yêu Cầu Nhận Báo Giá Ngay',
  className,
  buttonClassName,
  defaultValues = { fullName: '', phone: '' },
  layout = 'vertical',
  variant = 'light',
  isNameRequired = true,
  showLabels = true,
  showTrustNotice = false,
  buttonVariant = 'primary',
}) => {
  const form = useForm<LeadQuoteFormData>({
    defaultValues,
    mode: 'onTouched',
  });

  const handleSubmit = async (data: LeadQuoteFormData) => {
    await onSubmit(data);
  };

  const isDark = variant === 'dark';
  const isHorizontal = layout === 'horizontal';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(isHorizontal ? 'space-y-3 pt-2 text-left' : 'space-y-4', className)}
        noValidate
      >
        {error && (
          <div
            className={cn(
              'rounded-xl text-xs border',
              isDark
                ? 'p-2.5 border-red-500/30 bg-red-950/30 text-red-200'
                : 'p-3 bg-red-50 text-red-700 border-red-200'
            )}
            role="alert"
          >
            {error}
          </div>
        )}

        <div className={cn(isHorizontal && 'flex flex-col sm:flex-row gap-3')}>
          {/* Trường Họ và Tên */}
          <div className={cn(isHorizontal && 'flex-1')}>
            <FormField
              control={form.control}
              name="fullName"
              rules={
                isNameRequired
                  ? {
                      required: 'Vui lòng nhập họ và tên của bạn',
                      minLength: { value: 2, message: 'Họ tên tối thiểu 2 ký tự' },
                    }
                  : undefined
              }
              render={({ field }) => (
                <FormItem>
                  {showLabels && (
                    <FormLabel className={cn('block font-bold', isDark ? 'text-slate-200 text-xs' : 'text-slate-700')}>
                      Họ và Tên Quý Khách {isNameRequired && '*'}
                    </FormLabel>
                  )}
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={isNameRequired ? 'VD: Nguyễn Văn An' : 'Họ và tên (không bắt buộc)'}
                      className={cn(
                        'h-11 px-3.5 rounded-xl transition-colors',
                        isDark
                          ? 'bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE]'
                          : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#0072CE] focus-visible:border-transparent'
                      )}
                      leftIcon={
                        !showLabels ? (
                          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        ) : undefined
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Trường Số Điện Thoại */}
          <div className={cn(isHorizontal && 'flex-1')}>
            <FormField
              control={form.control}
              name="phone"
              rules={{
                required: 'Vui lòng nhập số điện thoại hoặc Zalo',
                validate: (val) => {
                  const clean = val.trim().replace(/[\s.-]/g, '');
                  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
                  if (!clean) return 'Vui lòng nhập số điện thoại hoặc Zalo';
                  if (!phoneRegex.test(clean)) return 'Số điện thoại không đúng định dạng (10 số)';
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem>
                  {showLabels && (
                    <FormLabel className={cn('block font-bold', isDark ? 'text-slate-200 text-xs' : 'text-slate-700')}>
                      Số Điện Thoại Nhận Báo Giá *
                    </FormLabel>
                  )}
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder={showLabels ? 'VD: 0981234567 (10 chữ số)' : 'Số điện thoại / Zalo *'}
                      className={cn(
                        'h-11 px-3.5 rounded-xl transition-colors',
                        isDark
                          ? 'bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE]'
                          : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#0072CE] focus-visible:border-transparent'
                      )}
                      leftIcon={
                        !showLabels ? (
                          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        ) : undefined
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Nút bấm Submit */}
        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className={cn(
            'w-full h-11 rounded-xl font-bold text-sm transition-all motion-reduce:transition-none flex items-center justify-center gap-2',
            buttonVariant === 'accent'
              ? 'bg-[#0072CE] hover:bg-[#005BA6] text-white shadow-lg shadow-[#0072CE]/30'
              : 'min-h-[48px] py-3 px-4 bg-[#002C6C] hover:bg-[#001D48] text-white shadow-md active:scale-[0.98]',
            buttonClassName
          )}
          rightIcon={
            buttonVariant === 'accent' ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            ) : undefined
          }
        >
          {loading ? (
            <span className="whitespace-normal leading-snug">Đang gửi thông tin...</span>
          ) : (
            <>
              {buttonVariant !== 'accent' && (
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
              )}
              <span className="whitespace-normal break-words leading-snug text-center max-w-full">
                {submitText}
              </span>
            </>
          )}
        </Button>

        {/* Cam kết bảo mật & tốc độ phản hồi */}
        {showTrustNotice && (
          <div className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-slate-400">
            <svg className="h-3.5 w-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Thông tin được bảo mật tuyệt đối. Tư vấn viên liên hệ trong 5 phút.</span>
          </div>
        )}
      </form>
    </Form>
  );
};
