// 🧠 Mental Model: SlideInBanner là Client Island Banner Trượt Góc Thông Minh Kích Hoạt Exit-Intent / Scroll Depth (Hyundai Vinh).
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Client Island Performance: Hydrate độc lập ở client, gắn listener thụ động.
// 2. Intelligent Trigger:
//    - Tự động xuất hiện sau 6s hoặc khi cuộn qua 25% bài viết hoặc Exit-Intent.
// 3. Respectful Non-Destructive UX:
//    - Khi bấm đóng (X), không biến mất vĩnh viễn mà thu nhỏ thành Floating Gift Badge ở góc màn hình.
//    - Khách hàng có thể bấm vào Floating Badge bất kỳ lúc nào để mở lại banner ưu đãi.
// 4. Inbound Conversion 1-Chạm:
//    - Kết nối trực tiếp leadsService chuẩn xác và an toàn.
// 5. 100% Named Export.

'use client';

import * as React from 'react';
import { X, Sparkles, CheckCircle2, Phone, Gift, Loader2 } from 'lucide-react';
import { Button } from '@cardealer/ui';
import { leadsService } from '../services/leads.service';

export interface SlideInBannerProps {
  carName?: string;
  postId?: string;
  utmSource?: string;
  className?: string;
}

export function SlideInBanner({
  carName = 'Hyundai',
  postId,
  utmSource = 'slide_in_exit_intent',
  className = '',
}: SlideInBannerProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [phone, setPhone] = React.useState<string>('');
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [hasInteracted, setHasInteracted] = React.useState<boolean>(false);

  // 1. Kích hoạt banner thông minh (Scroll 25%, Timer 6s hoặc Exit-intent)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // A. Desktop Exit-Intent Listener (Rê chuột lên top thanh URL)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 12 && !hasInteracted) {
        setIsOpen(true);
        setHasInteracted(true);
      }
    };

    // B. Scroll-Depth Listener (Cuộn qua 25% bài viết)
    const handleScroll = () => {
      if (hasInteracted) return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercentage = (window.scrollY / scrollHeight) * 100;

      if (scrollPercentage >= 25) {
        setIsOpen(true);
        setHasInteracted(true);
      }
    };

    // C. Timer sau 6 giây
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsOpen(true);
        setHasInteracted(true);
      }
    }, 6000);

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [hasInteracted]);

  // 2. Xử lý đóng banner -> Thu nhỏ thành Floating Badge
  const handleDismiss = () => {
    setIsOpen(false);
    setHasInteracted(true);
  };

  // 3. Xử lý gửi Lead 1-chạm
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    // Validate số điện thoại Việt Nam
    const phoneRegex = /^(0)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Vui lòng nhập đúng số điện thoại (10 chữ số)');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await leadsService.createLead({
        phone: cleanPhone,
        fullName: 'Khách nhận Voucher Ưu Đãi',
        carModel: carName,
        leadType: 'Báo Giá',
        notes: `Khách đăng ký nhận gói phụ kiện 15 triệu & ưu đãi lăn bánh xe ${carName} từ Slide-in Banner (Bài viết: ${postId || 'N/A'}, UTM: ${utmSource})`,
      });

      setStatus('success');

      // Tự động đóng sau 4 giây khi thành công
      setTimeout(() => {
        setIsOpen(false);
      }, 4000);
    } catch {
      setStatus('error');
      setErrorMessage('Có lỗi xảy ra. Quý khách vui lòng gọi hotline trực tiếp.');
    }
  };

  return (
    <>
      {/* 🎁 Khi banner đang đóng: Hiển thị Floating Badge để user có thể click mở lại bất kỳ lúc nào */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Xem ưu đãi voucher phụ kiện 15 triệu"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-bold text-xs shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all animate-bounce motion-reduce:animate-none border border-white/20"
        >
          <Gift className="w-4 h-4 text-amber-200" />
          <span className="hidden sm:inline">Ưu Đãi 15 Triệu</span>
          <span className="sm:hidden">Ưu Đãi</span>
        </button>
      )}

      {/* 📋 Khi banner mở: Hiển thị thẻ Popup Slide-in */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="Ưu đãi đặt cọc xe Hyundai"
          className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 max-w-[340px] sm:max-w-sm w-[calc(100vw-2rem)] rounded-2xl bg-white border border-blue-200/90 shadow-[0_12px_40px_rgba(0,44,108,0.18)] p-5 text-slate-800 transition-all duration-300 animate-in slide-in-from-bottom-6 fade-in motion-reduce:transition-none ${className}`}
        >
          {/* Nút Đóng / Thu Nhỏ */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            aria-label="Thu nhỏ banner ưu đãi"
            className="absolute top-2.5 right-2.5 min-h-[44px] min-w-[44px] p-0 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Header Banner */}
          <div className="flex items-center gap-2.5 mb-2.5 pr-8">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-blue-700 animate-bounce motion-reduce:animate-none" />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 mb-0.5">
                Ưu Đãi Tuần Lễ Vàng
              </span>
              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                Voucher Phụ Kiện 15.000.000đ
              </h4>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Nhận bảng giá lăn bánh ưu đãi và gói bảo hiểm vật chất chính hãng khi đặt cọc trực tuyến xe{' '}
            <strong>{carName}</strong> hôm nay.
          </p>

          {/* Form / Success Matrix */}
          {status === 'success' ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="font-bold">Đã tiếp nhận yêu cầu!</div>
                <div className="text-[11px] text-emerald-700">Tư vấn viên sẽ gửi báo giá qua Zalo trong 5 phút.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitLead} className="space-y-2.5">
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Nhập số điện thoại / Zalo..."
                  disabled={status === 'submitting'}
                  className="w-full min-h-[44px] h-11 px-3.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                />
              </div>

              {errorMessage && (
                <p className="text-[11px] text-red-600 font-medium px-1">{errorMessage}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex-1 min-h-[44px] h-11 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Nhận Báo Giá Ngay</span>
                    </>
                  )}
                </Button>
                <a
                  href="tel:0941000000"
                  aria-label="Gọi hotline tư vấn nhanh"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-700" />
                </a>
              </div>
            </form>
          )}

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Bảo mật thông tin 100%</span>
            <span>Hotline: 0941.000.000</span>
          </div>
        </aside>
      )}
    </>
  );
}

