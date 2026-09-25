// 🧠 Mental Model: PostBottomBar là Client Island Thanh Điều Hướng Đáy Mobile (< 1024px) Tối Ưu Chuyển Đổi Inbound (CRO).
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Client Island Performance: Hydrate độc lập ở client, chỉ hiển thị trên màn hình Mobile & Tablet (lg:hidden),
//    không làm ảnh hưởng đến cấu trúc SSR của trang bài viết.
// 2. Fixed Floating Dock with Safe Area:
//    - Cố định đáy màn hình (fixed bottom-0 left-0 right-0 z-40), hiệu ứng kính mờ glassmorphism (bg-white/95 backdrop-blur-md).
//    - Tích hợp đệm an toàn iOS (pb-[calc(0.625rem+env(safe-area-inset-bottom))]) chống che khuất bởi thanh vuốt Home Bar của iPhone.
// 3. Cụm 3 Nút Chuyển Đổi Vàng (Golden Conversion Trio):
//    - Nút 1: Gọi Hotline Ngay (Giao thức tel: chuẩn, touch target >= 44px).
//    - Nút 2: Nhắn Zalo Tư Vấn 24/7 (Mở ứng dụng Zalo trực tiếp hoặc web chat).
//    - Nút 3: Nhận Báo Giá Lăn Bánh (Nút trọng tâm nổi bật nhất, cuộn mượt xuống Lead Form hoặc mở popup).
// 4. Cá Nhân Hóa Theo Chuyên Mục:
//    - Tự động thay đổi nhãn CTA linh hoạt: 'Báo Giá Lăn Bánh' (cho bài Bảng Giá), 'Duyệt Hồ Sơ Trả Góp' (cho bài Cẩm Nang), 'Đăng Ký Lái Thử' (cho bài Đánh Giá).
// 5. WCAG AAA & Accessibility:
//    - Touch target đạt chuẩn Google/Apple (h-11 = 44px), độ tương phản cao, motion-reduce:transition-none.
// 6. 100% Named Export: TUYỆT ĐỐI CẤM export default.

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, Sparkles, ArrowUpRight } from 'lucide-react';
import { Button } from '@cardealer/ui';

export interface PostBottomBarProps {
  phone?: string;
  zaloPhone?: string;
  ctaText?: string;
  ctaTargetId?: string;
  onCtaClick?: () => void;
  categorySlug?: string;
  carName?: string;
  className?: string;
}

export function PostBottomBar({
  phone = '0941.000.000',
  zaloPhone = '0941000000',
  ctaText,
  ctaTargetId = 'lead-form',
  onCtaClick,
  categorySlug = '',
  carName = 'Hyundai',
  className = '',
}: PostBottomBarProps) {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  // Hiển thị thanh bottom bar khi người dùng bắt đầu cuộn trang xuống > 200px
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Xác định nhãn CTA tự động theo chuyên mục bài viết nếu không truyền ctaText cụ thể
  const resolvedCtaText = React.useMemo(() => {
    if (ctaText) return ctaText;
    if (categorySlug.includes('bang-gia') || categorySlug.includes('khuyen-mai')) {
      return 'Báo Giá Lăn Bánh';
    }
    if (categorySlug.includes('tra-gop') || categorySlug.includes('cam-nang')) {
      return 'Tính Trả Góp';
    }
    if (categorySlug.includes('danh-gia')) {
      return 'Đăng Ký Lái Thử';
    }
    return `Nhận Giá ${carName}`;
  }, [ctaText, categorySlug, carName]);

  // Cuộn mượt đến Form đăng ký trong trang
  const handleScrollToLeadForm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCtaClick) {
      onCtaClick();
      return;
    }

    const formElement =
      document.getElementById(ctaTargetId) ||
      document.querySelector('form') ||
      document.querySelector('[data-role="lead-form"]');

    if (formElement) {
      const headerOffset = 80;
      const elementPosition = formElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Tự động focus vào ô input điện thoại nếu có
      const phoneInput = formElement.querySelector<HTMLInputElement>('input[type="tel"], input[name="phone"]');
      if (phoneInput) {
        setTimeout(() => phoneInput.focus(), 400);
      }
    } else {
      // Nếu không tìm thấy form trong DOM, chuyển hướng gọi điện trực tiếp
      window.location.href = `tel:${phone.replace(/\./g, '')}`;
    }
  };

  if (!isVisible) {
    return null;
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const cleanZalo = zaloPhone.replace(/[^0-9]/g, '');

  return (
    <aside
      aria-label="Thao tác nhanh trên di động"
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(0,0,0,0.06)] transition-all duration-300 animate-in slide-in-from-bottom motion-reduce:transition-none ${className}`}
    >
      <div className="max-w-md mx-auto grid grid-cols-12 gap-2 items-center">
        {/* Nút 1: Gọi Điện Trực Tiếp (3 Cột) */}
        <Link
          href={`tel:${cleanPhone}`}
          aria-label={`Gọi hotline tư vấn ${phone}`}
          className="col-span-3 min-h-[44px] h-11 flex flex-col items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors motion-reduce:transition-none focus:outline-hidden focus:ring-2 focus:ring-red-500"
        >
          <Phone className="w-4 h-4 mb-0.5 text-red-600 animate-pulse motion-reduce:animate-none" />
          <span className="text-[10px] font-bold leading-tight">Gọi Điện</span>
        </Link>

        {/* Nút 2: Nhắn Zalo Tư Vấn (3 Cột) */}
        <Link
          href={`https://zalo.me/${cleanZalo}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat Zalo nhận bảng giá ưu đãi"
          className="col-span-3 min-h-[44px] h-11 flex flex-col items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors motion-reduce:transition-none focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <MessageSquare className="w-4 h-4 mb-0.5 text-blue-600" />
          <span className="text-[10px] font-bold leading-tight">Zalo</span>
        </Link>

        {/* Nút 3: CTA Nhận Báo Giá / Đăng Ký (6 Cột Nổi Bật) */}
        <Button
          type="button"
          onClick={handleScrollToLeadForm}
          aria-label={resolvedCtaText}
          className="col-span-6 min-h-[44px] h-11 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all motion-reduce:transition-none motion-reduce:active:scale-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 border-none"
        >
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-300" />
          <span className="truncate">{resolvedCtaText}</span>
          <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
        </Button>
      </div>
    </aside>
  );
}
