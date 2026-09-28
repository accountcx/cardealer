// 🧠 Mental Model: SlideInBanner là Client Island Banner Trượt Góc & Voucher Popup Thông Minh (Hyundai Vinh).
// Tuân thủ triệt để nguyên tắc Phân Bổ Tọa Độ & Tránh Va Chạm (Coordinate Matrix & Anti-Collision):
// 1. Mobile (< 768px):
//    - KHÔNG BAO GIỜ tự động bung to đè lấp nội dung (triệt tiêu 100% Google Interstitial Penalty & tránh che bảng giá/thông số).
//    - Hiển thị Floating Gift Badge mini tại góc dưới bên Trái (bottom-20 left-4), nằm an toàn trên thanh Bottom Bar.
//    - Chỉ khi khách hàng chủ động chạm vào hộp quà, mới kích hoạt Bottom Sheet / Modal nhận voucher 15 triệu.
//    - Góc dưới bên Phải (bottom-4 / bottom-20 right-4) hoàn toàn được giải phóng cho cụm Tư vấn 24/7 (Hotline / Zalo) thuận ngón tay cái.
// 2. Desktop (>= 768px):
//    - Góc dưới bên Trái: Để trống, giữ không gian thoáng đãng cho bài viết.
//    - Góc dưới bên Phải: Phân tầng dọc (Vertical Stacking):
//        + Voucher Card nằm ở tầng trên (bottom-32 right-6 lg:right-8 z-40).
//        + Widget Tư vấn 24/7 cố định ở tầng dưới (bottom-6 right-6 lg:right-8 z-50).
//    - Khi bấm đóng (X): Thu nhỏ thành Floating Badge ngay tại tầng trên, bấm vào mở lại bất kỳ lúc nào.
// 3. Inbound Conversion 1-Chạm: Tích hợp leadsService, xử lý lead an toàn.
// 4. 100% Named Export.

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
  hotline?: string;
  phoneToCall?: string;
}

export function SlideInBanner({
  carName = 'Hyundai',
  postId,
  utmSource = 'slide_in_exit_intent',
  className = '',
  hotline = '0981.234.567',
  phoneToCall,
}: SlideInBannerProps) {
  // Trạng thái kích hoạt (sau 6s, cuộn 25% hoặc Exit-intent)
  const [isTriggered, setIsTriggered] = React.useState<boolean>(false);
  // Trạng thái mở thẻ trên Desktop
  const [isDesktopOpen, setIsDesktopOpen] = React.useState<boolean>(false);
  // Trạng thái mở Bottom Sheet / Modal trên Mobile
  const [isMobileModalOpen, setIsMobileModalOpen] = React.useState<boolean>(false);

  // Form states
  const [phone, setPhone] = React.useState<string>('');
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [hasInteracted, setHasInteracted] = React.useState<boolean>(false);

  const cleanPhone = (phoneToCall || hotline).replace(/\D/g, '') || '0981234567';

  // 1. Kích hoạt thông minh: Timer 6s, Scroll depth 25%, Exit-Intent
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const triggerActivation = () => {
      if (hasInteracted) return;
      setIsTriggered(true);
      setHasInteracted(true);

      // Phân bổ thiết bị: Desktop tự động mở Card, Mobile chỉ hiện Gift Badge góc trái
      if (window.innerWidth >= 768) {
        setIsDesktopOpen(true);
      }
    };

    // A. Desktop Exit-Intent (Rê chuột lên mép trên trình duyệt)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 12 && !hasInteracted) {
        triggerActivation();
      }
    };

    // B. Scroll Depth (Cuộn qua 25% chiều dài bài viết)
    const handleScroll = () => {
      if (hasInteracted) return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercentage = (window.scrollY / scrollHeight) * 100;

      if (scrollPercentage >= 25) {
        triggerActivation();
      }
    };

    // C. Timer sau 6 giây
    const timer = setTimeout(() => {
      triggerActivation();
    }, 6000);

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [hasInteracted]);

  // Khóa cuộn trang khi Bottom Sheet trên Mobile đang mở
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isMobileModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileModalOpen]);

  // Đóng Bottom Sheet khi bấm ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileModalOpen) setIsMobileModalOpen(false);
        if (isDesktopOpen) setIsDesktopOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileModalOpen, isDesktopOpen]);

  // Tự động thu nhỏ banner nếu người dùng mở hộp thoại Chuyên viên tư vấn
  React.useEffect(() => {
    const handleSellerOpen = () => {
      setIsDesktopOpen(false);
    };
    window.addEventListener('floating-seller-open', handleSellerOpen);
    return () => window.removeEventListener('floating-seller-open', handleSellerOpen);
  }, []);

  const handleOpenDesktop = () => {
    setIsDesktopOpen(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('slide-in-banner-open'));
    }
  };

  // 2. Xử lý đóng banner trên Desktop -> Thu nhỏ thành Desktop Floating Badge
  const handleDismissDesktop = () => {
    setIsDesktopOpen(false);
  };

  // 3. Xử lý gửi Lead 1-chạm
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = phone.trim().replace(/\s+/g, '');

    // Validate số điện thoại Việt Nam (10 chữ số)
    const phoneRegex = /^(0)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(formattedPhone)) {
      setErrorMessage('Vui lòng nhập đúng số điện thoại (10 chữ số)');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await leadsService.createLead({
        phone: formattedPhone,
        fullName: 'Khách nhận Voucher Ưu Đãi 15 Triệu',
        carModel: carName,
        leadType: 'Báo Giá',
        notes: `Khách đăng ký nhận gói phụ kiện 15 triệu & ưu đãi lăn bánh xe ${carName} từ Slide-in Banner (Bài viết: ${postId || 'N/A'}, UTM: ${utmSource})`,
      });

      setStatus('success');

      // Tự động đóng sau 3.5 giây khi gửi thành công
      setTimeout(() => {
        setIsMobileModalOpen(false);
        setIsDesktopOpen(false);
      }, 3500);
    } catch {
      setStatus('error');
      setErrorMessage('Có lỗi xảy ra. Quý khách vui lòng gọi hotline trực tiếp.');
    }
  };

  if (!isTriggered) return null;

  return (
    <>
      {/* ========================================================================= */}
      {/* 📱 PHÂN KHU 1: MOBILE (< 768px)                                           */}
      {/* ========================================================================= */}

      {/* 🎁 1.A. Mobile Floating Gift Badge (Góc dưới bên Trái, trên thanh Bottom Bar) */}
      <div className="fixed bottom-20 left-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileModalOpen(true)}
          aria-label="Nhận Voucher Ưu Đãi 15 Triệu"
          className="group relative flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-full shadow-2xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all border-2 border-white/80 animate-bounce motion-reduce:animate-none"
        >
          <div className="relative">
            <Gift className="w-5 h-5 text-amber-200" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300" />
            </span>
          </div>
          <span className="text-xs font-black tracking-tight text-white drop-shadow-xs">
            Voucher 15Tr
          </span>
        </button>
      </div>

      {/* 📋 1.B. Mobile Bottom Sheet / Modal (Chỉ xuất hiện khi người dùng CHỦ ĐỘNG click vào hộp quà) */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end justify-center">
          {/* Backdrop tối làm mờ nền */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileModalOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Card */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Ưu đãi đặt cọc xe Hyundai"
            className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"
          >
            {/* Thanh kéo trang trí */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />

            {/* Nút Đóng X */}
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(false)}
              aria-label="Đóng popup ưu đãi"
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Banner */}
            <div className="flex items-center gap-3 mb-3 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 mb-0.5">
                  Ưu Đãi Tuần Lễ Vàng
                </span>
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  Voucher Phụ Kiện 15.000.000đ
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Nhận ngay bảng giá lăn bánh ưu đãi độc quyền và gói bảo hiểm vật chất chính hãng khi đăng ký tư vấn xe{' '}
              <strong className="text-slate-900">{carName}</strong> hôm nay.
            </p>

            {/* Form nhận ưu đãi / Trạng thái thành công */}
            {status === 'success' ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-sm">Đã tiếp nhận yêu cầu thành công!</div>
                  <div className="text-xs text-emerald-700 mt-0.5">Chuyên viên Hyundai Vinh sẽ gửi bảng tính chi tiết qua Zalo trong 5 phút.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Nhập số điện thoại Zalo của bạn..."
                    disabled={status === 'submitting'}
                    className="w-full min-h-[48px] h-12 px-4 text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 placeholder:text-slate-400 bg-slate-50/70"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-600 font-semibold px-1">{errorMessage}</p>
                )}

                <div className="flex gap-2.5 pt-1">
                  <Button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex-1 min-h-[48px] h-12 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Nhận Báo Giá & Voucher</span>
                      </>
                    )}
                  </Button>
                  <a
                    href={`tel:${cleanPhone}`}
                    aria-label="Gọi hotline tư vấn nhanh"
                    className="min-h-[48px] min-w-[48px] px-3.5 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-200 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-blue-700" />
                  </a>
                </div>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">🔒 Cam kết bảo mật 100%</span>
              <span>Hotline Showroom: <strong className="text-slate-700">{hotline}</strong></span>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💻 PHÂN KHU 2: DESKTOP (>= 768px)                                         */}
      {/* Phân tầng dọc: Nằm ở tầng trên (bottom-32 right-6), Widget Tư vấn ở tầng dưới */}
      {/* ========================================================================= */}

      {/* 🎁 2.A. Khi Desktop Card đóng: Hiển thị Floating Badge tại tầng trên */}
      {!isDesktopOpen && (
        <button
          type="button"
          onClick={handleOpenDesktop}
          aria-label="Xem ưu đãi voucher phụ kiện 15 triệu"
          className="fixed bottom-[104px] right-6 lg:right-8 z-40 hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-bold text-xs shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all animate-bounce motion-reduce:animate-none border border-white/20"
        >
          <Gift className="w-4 h-4 text-amber-200" />
          <span>Voucher Ưu Đãi 15 Triệu</span>
        </button>
      )}

      {/* 📋 2.B. Khi Desktop Card mở: Thẻ Slide-In góc phải tầng trên */}
      {isDesktopOpen && (
        <aside
          role="dialog"
          aria-label="Ưu đãi đặt cọc xe Hyundai"
          className={`fixed bottom-[104px] right-6 lg:right-8 z-40 hidden md:block max-w-sm w-full rounded-2xl bg-white border border-blue-200/90 shadow-[0_16px_48px_rgba(0,44,108,0.2)] p-5 text-slate-800 transition-all duration-300 animate-in slide-in-from-bottom-6 fade-in motion-reduce:transition-none ${className}`}
        >
          {/* Nút Đóng / Thu Nhỏ */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDismissDesktop}
            aria-label="Thu nhỏ banner ưu đãi"
            className="absolute top-2.5 right-2.5 min-h-[36px] min-w-[36px] p-0 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Header Banner */}
          <div className="flex items-center gap-2.5 mb-2.5 pr-8">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
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

          <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
            Nhận bảng giá lăn bánh ưu đãi và gói bảo hiểm vật chất chính hãng khi đặt cọc trực tuyến xe{' '}
            <strong className="text-slate-900">{carName}</strong> hôm nay.
          </p>

          {/* Form / Trạng thái gửi thành công */}
          {status === 'success' ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold">Đã tiếp nhận yêu cầu!</div>
                <div className="text-[11px] text-emerald-700">Tư vấn viên sẽ gửi báo giá qua Zalo trong 5 phút.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitLead} className="space-y-2.5">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Nhập số điện thoại / Zalo..."
                  disabled={status === 'submitting'}
                  className="w-full min-h-[40px] h-10 px-3.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                />
              </div>

              {errorMessage && (
                <p className="text-[11px] text-red-600 font-medium px-1">{errorMessage}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex-1 min-h-[40px] h-10 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
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
                  href={`tel:${cleanPhone}`}
                  aria-label="Gọi hotline tư vấn nhanh"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-700" />
                </a>
              </div>
            </form>
          )}

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Bảo mật thông tin 100%</span>
            <span>Hotline: {hotline}</span>
          </div>
        </aside>
      )}
    </>
  );
}
