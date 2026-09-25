'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Card } from '../card';
import { Input } from '../input';
import { Button } from '../button';
import { Badge } from '../badge';
import { Skeleton } from '../skeleton';

// 🧠 Mental Model: GatedContent là Khối Nội Dung Đặc Quyền (Inbound Paywall & Lead Magnet) của Hyundai Vinh.
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Component-Driven & Shared Primitives First: Tái sử dụng 100% UI Primitives từ hệ thống (Card, Input, Button, Badge, Skeleton).
// 2. Cơ chế CRO 1-Chạm Không Rào Cản: Nhập SĐT/Zalo (+ Họ tên tùy chọn) để mở khóa tức thì, loại bỏ hoàn toàn checkbox pháp lý gây cản trở.
// 3. 4-State UI Matrix Chuẩn Mực:
//    - Loading State: Skeleton Shimmer giả lập khối nội dung và overlay card tránh hiện tượng CLS.
//    - Empty State: Khung thông báo khi không có nội dung khả dụng kèm nút CTA xem các dòng xe Hyundai.
//    - Error State: Thông báo lỗi mở khóa kèm mã lỗi và nút Thử lại (Retry).
//    - Success / Unlocked State: Gỡ bỏ lớp làm mờ, hiển thị nội dung đặc quyền sắc nét kèm thông báo mở khóa thành công.
//    - Locked / Paywall State: Làm mờ nhẹ bằng CSS (blur-[6px] select-none pointer-events-none), overlay card trung tâm với biểu tượng khóa vàng sang trọng.
// 4. Tuân thủ SEO & Paywall Schema: Bao bọc class chuẩn .gated-content-section để tích hợp liền mạch với Paywall Schema (isAccessibleForFree: false).
// 5. WCAG AAA & Reduced Motion: Touch targets h-11 (44px), viền mảnh 1px, focus-visible ring, motion-reduce:transition-none.
// 6. 100% Named Export: TUYỆT ĐỐI CẤM export default.

export interface GatedContentUnlockData {
  phone: string;
  fullName?: string;
  carSlug?: string | null;
  postSlug?: string | null;
}

export interface GatedContentProps {
  /** Tiêu đề phần quà hoặc nội dung đặc quyền */
  rewardTitle?: string;
  /** Mô tả ngắn gọn lợi ích khi mở khóa */
  description?: string;
  /** Huy hiệu hiển thị ở đầu khối */
  badgeText?: string;
  /** Nhãn nút mở khóa */
  buttonText?: string;
  /** Nội dung HTML cần khóa (nếu render từ Tiptap AST) */
  gatedHtml?: string;
  /** Nội dung React children cần khóa */
  children?: React.ReactNode;
  /** Slug dòng xe liên quan (ví dụ: 'tucson-2024') */
  carSlug?: string | null;
  /** Slug bài viết liên quan */
  postSlug?: string | null;
  /** Key lưu trạng thái đã mở khóa vào localStorage (tránh bắt user nhập lại khi reload) */
  storageKey?: string;
  /** Trạng thái mở khóa ban đầu */
  isInitiallyUnlocked?: boolean;
  /** Trạng thái đang tải (Loading State) */
  isLoading?: boolean;
  /** Trạng thái không có dữ liệu (Empty State) */
  isEmpty?: boolean;
  /** Thông báo lỗi (Error State) */
  error?: string | null;
  /** Callback xử lý mở khóa và gửi Lead */
  onUnlock?: (data: GatedContentUnlockData) => Promise<boolean> | boolean | void;
  /** Callback thử lại khi gặp lỗi */
  onRetry?: () => void;
  /** Tuỳ biến class bổ sung */
  className?: string;
}

export function GatedContent({
  rewardTitle = 'Bảng Dự Toán Chi Phí Lăn Bánh Chi Tiết Từng Huyện & Ưu Đãi Đại Lý',
  description = 'Để xem chi tiết bảng chiết khấu tiền mặt đặc quyền và gói quà tặng chính hãng, vui lòng nhập số điện thoại hoặc Zalo để mở khóa ngay.',
  badgeText = 'Nội Dung Đặc Quyền',
  buttonText = 'Mở Khóa Ngay',
  gatedHtml,
  children,
  carSlug,
  postSlug,
  storageKey,
  isInitiallyUnlocked = false,
  isLoading = false,
  isEmpty = false,
  error = null,
  onUnlock,
  onRetry,
  className,
}: GatedContentProps) {
  const [phone, setPhone] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = React.useState(isInitiallyUnlocked);

  // Khôi phục trạng thái đã mở khóa từ localStorage nếu có key
  const effectiveStorageKey = React.useMemo(() => {
    if (storageKey) return storageKey;
    if (postSlug) return `cardealer_gated_${postSlug}`;
    return null;
  }, [storageKey, postSlug]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && effectiveStorageKey) {
      const stored = localStorage.getItem(effectiveStorageKey);
      if (stored === 'true') {
        setIsUnlocked(true);
      }
    }
  }, [effectiveStorageKey]);

  // Kiểm tra tính hợp lệ của số điện thoại Việt Nam
  const validatePhone = (value: string): boolean => {
    const cleanPhone = value.trim().replace(/[\s.-]/g, '');
    const phoneRegex = /^(0|\+?84)(3|5|7|8|9)[0-9]{8}$/;
    if (!cleanPhone) {
      setPhoneError('Vui lòng nhập số điện thoại hoặc Zalo để mở khóa');
      return false;
    }
    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError('Số điện thoại không hợp lệ (Ví dụ: 0912345678)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validatePhone(phone)) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onUnlock) {
        const result = await onUnlock({
          phone: phone.trim(),
          fullName: fullName.trim() || undefined,
          carSlug,
          postSlug,
        });

        // Nếu handler trả về false nghĩa là server từ chối
        if (result === false) {
          setSubmitError('Không thể mở khóa nội dung. Vui lòng kiểm tra lại kết nối và thử lại.');
          setIsSubmitting(false);
          return;
        }
      }

      // Mở khóa thành công
      setIsUnlocked(true);
      if (typeof window !== 'undefined' && effectiveStorageKey) {
        try {
          localStorage.setItem(effectiveStorageKey, 'true');
        } catch {
          // Bỏ qua lỗi Safari Private Browsing quota
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi mở khóa nội dung';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 1. Loading State (Skeleton Shimmer)
  // =========================================================================
  if (isLoading) {
    return (
      <div
        className={cn(
          'gated-content-section relative my-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800/80 dark:bg-slate-900/40',
          className
        )}
        aria-busy="true"
        aria-label="Đang tải nội dung đặc quyền"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-48 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="pt-4">
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. Error State (Banner + ErrorCode + Nút Retry)
  // =========================================================================
  const displayError = error || submitError;
  if (displayError && !isUnlocked) {
    return (
      <div
        className={cn(
          'gated-content-section my-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center dark:border-red-500/20 dark:bg-red-950/20',
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500 dark:text-red-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 className="text-base font-semibold text-red-800 dark:text-red-300">
          Không thể mở khóa nội dung đặc quyền
        </h4>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
          {displayError}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-red-500/15 px-2 py-0.5 font-mono text-[11px] text-red-600 dark:text-red-400">
          <span>Mã lỗi:</span>
          <strong>ERR_GATED_CONTENT_LOCKED</strong>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              setSubmitError(null);
              if (onRetry) onRetry();
            }}
            className="h-10 min-w-28 motion-reduce:transition-none"
          >
            Thử lại
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-10"
          >
            <a href="tel:0912345678" aria-label="Gọi hotline hỗ trợ mở khóa">
              Gọi Hotline Hỗ Trợ
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. Empty State (Khi không có nội dung khả dụng)
  // =========================================================================
  const hasContent = Boolean(gatedHtml || children);
  if (isEmpty || !hasContent) {
    return (
      <div
        className={cn(
          'gated-content-section my-8 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center dark:border-slate-800/80 dark:bg-slate-900/30',
          className
        )}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/80 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Chưa có nội dung đặc quyền khả dụng
        </h4>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Phần dữ liệu chuyên sâu đang được đại lý cập nhật. Quý khách có thể xem bảng giá xe công khai.
        </p>
        <div className="mt-4">
          <Button variant="outline" size="sm" asChild className="h-10">
            <a href="/bang-gia-xe">Xem Bảng Giá Xe Hyundai</a>
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. Data State: A) Mở Khóa Thành Công (Unlocked State)
  // =========================================================================
  if (isUnlocked) {
    return (
      <div
        className={cn(
          'gated-content-section my-8 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm transition-all duration-300 dark:border-emerald-500/20 dark:bg-emerald-950/10',
          className
        )}
      >
        {/* Banner xác nhận mở khóa thành công */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="published" size="sm">Đã Mở Khóa Đặc Quyền</Badge>
                <span className="text-xs text-emerald-800 font-medium dark:text-emerald-300">Dành riêng cho bạn</span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5 dark:text-emerald-400">
                Toàn bộ dữ liệu chiết khấu và dự toán chi phí đã sẵn sàng bên dưới.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              <a href="https://zalo.me/0912345678" target="_blank" rel="noopener noreferrer">
                Hỗ Trợ Zalo 24/7
              </a>
            </Button>
          </div>
        </div>

        {/* Nội dung thực sự được hiển thị đầy đủ và sắc nét */}
        <div className="p-5 sm:p-7 motion-reduce:transition-none">
          {gatedHtml ? (
            <div
              className="prose max-w-none text-slate-800 dark:prose-invert dark:text-slate-200"
              dangerouslySetInnerHTML={{ __html: gatedHtml }}
            />
          ) : (
            children
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. Data State: B) Khóa Nội Dung (Locked / Paywall State)
  // =========================================================================
  return (
    <div
      className={cn(
        'gated-content-section relative my-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/40',
        className
      )}
      aria-label="Khối nội dung yêu cầu số điện thoại để mở khóa"
    >
      {/* 1. Lớp nội dung bên dưới bị làm mờ nhẹ (CSS Blur + Unselectable) */}
      <div
        className="max-h-[380px] overflow-hidden p-6 sm:p-8 select-none pointer-events-none filter blur-[6px] opacity-40 transition-all duration-300 motion-reduce:transition-none"
        aria-hidden="true"
      >
        {gatedHtml ? (
          <div
            className="prose max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: gatedHtml }}
          />
        ) : (
          children || (
            <div className="space-y-4">
              <div className="h-6 w-3/4 rounded bg-slate-300 dark:bg-slate-700" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-32 w-full rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
          )
        )}
      </div>

      {/* 2. Lớp phủ Overlay và Card mở khóa nổi ở trung tâm */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-900/30 backdrop-blur-[2px]">
        <Card
          variant="glass"
          className="w-full max-w-lg border-white/15 bg-slate-900/90 p-6 sm:p-8 shadow-2xl rounded-2xl"
        >
          {/* Header Card với Biểu tượng ổ khóa vàng sang trọng */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 ring-4 ring-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="mb-2">
              <Badge variant="accent" size="sm" className="font-bold tracking-wide uppercase">
                {badgeText}
              </Badge>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {rewardTitle}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Form CRO 1-Chạm mở khóa tức thì (SĐT/Zalo + Họ tên tùy chọn, KHÔNG checkbox pháp lý) */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            <div>
              <label htmlFor="gated-phone" className="block text-xs font-medium text-slate-200 mb-1.5">
                Số Điện Thoại / Zalo Nhận Mở Khóa <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Input
                  id="gated-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="0912 345 678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  className={cn(
                    'h-11 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE]',
                    phoneError && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  aria-required="true"
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby={phoneError ? 'gated-phone-error' : undefined}
                />
              </div>
              {phoneError && (
                <p id="gated-phone-error" className="mt-1 text-xs text-red-400 flex items-center gap-1" role="alert">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="gated-name" className="block text-xs font-medium text-slate-200 mb-1.5">
                Họ và Tên <span className="text-slate-400 font-normal">(Tùy chọn)</span>
              </label>
              <Input
                id="gated-name"
                type="text"
                placeholder="Anh/Chị..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-[#0072CE]"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-[#0072CE] to-[#005ba3] hover:from-[#0062b3] hover:to-[#004b87] text-white font-semibold shadow-lg shadow-[#0072CE]/20 transition-all duration-200 motion-reduce:transition-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang mở khóa...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <span>{buttonText}</span>
                </span>
              )}
            </Button>
          </form>

          {/* Cam kết uy tín & Bảo mật */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mở khóa tức thì
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Bảo mật SĐT 100%
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Báo giá chiết khấu đại lý
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
