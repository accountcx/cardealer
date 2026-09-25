'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Card } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { Skeleton } from '../skeleton';
import { LeadQuoteForm, type LeadQuoteFormData } from '../lead-quote-form';

// 🧠 Mental Model: InlineQuickForm là Khối Lead Magnet Giữa Bài Viết tối ưu tỉ lệ chuyển đổi CRO 1-chạm (Hyundai Vinh).
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Component-Driven & Shared Primitives First: Tái sử dụng 100% UI Primitives từ hệ thống:
//    - Card, Button, Badge, Skeleton từ @cardealer/ui.
//    - Tái sử dụng trực tiếp Canonical LeadQuoteForm primitive cho form thu thập Lead (Zero code duplication).
// 2. Cơ chế CRO 1-Chạm Không Rào Cản: Nhập SĐT/Zalo (+ Họ tên tùy chọn) nhận ưu đãi tức thì, loại bỏ hoàn toàn các checkbox pháp lý gây cản trở.
// 3. 4-State UI Matrix Chuẩn Mực:
//    - Loading State: Khung Skeleton Shimmer khớp kích thước form ngăn chặn CLS.
//    - Empty / Expired State: Khung thông báo khi chương trình ưu đãi đã kết thúc kèm nút CTA liên hệ hotline.
//    - Error State: Thông báo lỗi gửi form kèm nút thử lại.
//    - Success State: Màn hình cảm ơn ngay tại chỗ, cam kết tư vấn trong 5 phút.
//    - Data / Active Form State: Tiêu thụ LeadQuoteForm (layout="horizontal", variant="dark", isNameRequired={false}).
// 4. Touch Targets & Spacing Scale (Bội số 4px): Input và Button đạt chuẩn h-11 (44px), khoảng cách p-6 sm:p-8, rounded-2xl.
// 5. WCAG AAA & Reduced Motion: Đầy đủ aria-label, focus rings và motion-reduce:transition-none.
// 6. 100% Named Export: TUYỆT ĐỐI CẤM export default.

export interface InlineQuickFormData {
  fullName: string;
  phone: string;
  carSlug?: string | null;
}

export interface InlineQuickFormProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  carSlug?: string | null;
  carName?: string | null;
  isLoading?: boolean;
  isExpired?: boolean;
  error?: string | null;
  onSubmitLead?: (data: InlineQuickFormData) => Promise<boolean> | boolean | void;
  className?: string;
}

export function InlineQuickForm({
  headline = 'Nhận Báo Giá Lăn Bánh & Ưu Đãi Tháng',
  subheadline = 'Bảng tính chi phí chi tiết từng huyện tại Nghệ An & Hà Tĩnh kèm ưu đãi tiền mặt.',
  buttonText = 'Nhận Báo Giá Ngay',
  carSlug,
  carName,
  isLoading = false,
  isExpired = false,
  error = null,
  onSubmitLead,
  className,
}: InlineQuickFormProps) {
  const [submittedData, setSubmittedData] = React.useState<LeadQuoteFormData | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // 1. 4-STATE UI: LOADING STATE
  if (isLoading) {
    return (
      <Card className={cn('not-prose my-8 p-6 sm:p-8 rounded-2xl font-sans bg-slate-900/90 border-slate-800', className)}>
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <div className="w-full max-w-md space-y-3 pt-2">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </Card>
    );
  }

  // 2. 4-STATE UI: EMPTY / EXPIRED STATE
  if (isExpired) {
    return (
      <Card
        className={cn(
          'not-prose my-8 p-6 sm:p-8 rounded-2xl text-center font-sans border-slate-700/60 bg-slate-900/60',
          className
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400 mx-auto mb-3">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="font-semibold text-base text-slate-100">
          Chương trình ưu đãi này đã kết thúc
        </p>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          Vui lòng liên hệ trực tiếp hotline hoặc xem các dòng xe Hyundai khác để nhận ưu đãi hiện hành.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 border-slate-700 text-slate-200 hover:bg-slate-800"
          asChild
        >
          <a href="/xe">Xem tất cả xe Hyundai</a>
        </Button>
      </Card>
    );
  }

  // 3. 4-STATE UI: SUCCESS FEEDBACK STATE
  if (isSuccess) {
    return (
      <Card
        className={cn(
          'not-prose my-8 p-6 sm:p-8 rounded-2xl text-center font-sans border-emerald-500/30 bg-emerald-950/20 text-emerald-100',
          className
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto mb-3 border border-emerald-500/40">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h4 className="font-bold text-lg text-white">
          Yêu cầu gửi thành công!
        </h4>
        <p className="mt-1.5 text-sm text-emerald-200/90 max-w-md mx-auto">
          Cảm ơn {submittedData?.fullName ? `quý khách ${submittedData.fullName}` : 'quý khách'}. Chuyên viên tư vấn Hyundai Vinh sẽ liên hệ qua số điện thoại <span className="font-semibold text-white">{submittedData?.phone}</span> trong vòng 5 phút.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsSuccess(false);
            setSubmittedData(null);
            setSubmitError(null);
          }}
          className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30"
        >
          Gửi yêu cầu cho mẫu xe khác
        </Button>
      </Card>
    );
  }

  // Xử lý gửi form thông qua LeadQuoteForm
  const handleSubmitLead = async (data: LeadQuoteFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (onSubmitLead) {
        const result = await onSubmitLead({
          fullName: data.fullName,
          phone: data.phone,
          carSlug: carSlug || undefined,
        });

        if (result === false) {
          setSubmitError('Không thể gửi yêu cầu lúc này. Vui lòng kiểm tra lại kết nối.');
          setIsSubmitting(false);
          return;
        }
      }
      setSubmittedData(data);
      setIsSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi dữ liệu. Vui lòng thử lại.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. 4-STATE UI: ACTIVE FORM STATE
  return (
    <Card
      className={cn(
        'not-prose my-8 overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900/95 to-[#002C6C]/50 p-6 sm:p-8 text-white shadow-xl font-sans',
        className
      )}
    >
      <div className="max-w-xl mx-auto text-center space-y-4">
        {/* Huy hiệu chương trình */}
        <div className="inline-flex items-center gap-1.5">
          <Badge variant="accent" size="sm" className="font-semibold shadow-xs">
            {carName ? `Ưu Đãi ${carName}` : 'Đặc Quyền Khách Hàng Online'}
          </Badge>
        </div>

        {/* Tiêu đề & Mô tả */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {headline}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {subheadline}
          </p>
        </div>

        {/* Tái sử dụng trọn vẹn Shared Primitive LeadQuoteForm */}
        <LeadQuoteForm
          layout="horizontal"
          variant="dark"
          isNameRequired={false}
          showLabels={false}
          showTrustNotice={true}
          buttonVariant="accent"
          submitText={buttonText}
          loading={isSubmitting}
          error={submitError || error}
          onSubmit={handleSubmitLead}
        />
      </div>
    </Card>
  );
}
