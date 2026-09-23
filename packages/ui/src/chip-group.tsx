'use client';

import * as React from 'react';
import { cn } from './lib/utils';
import { Button } from './button';

export interface ChipOption {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface ChipGroupProps {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  unselectedClassName?: string;
  scrollableOnMobile?: boolean;
  gridCols?: 2 | 3 | 4 | 5 | 6;
  showCheckIcon?: boolean;
  showEdgeGradient?: boolean;
  disabled?: boolean;
}

// 🧠 Mental Model: Inline SVG Check Icon không phụ thuộc bên ngoài
const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3 sm:w-3.5 sm:h-3.5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

// 🧠 Mental Model: ChipGroup (FilterChipGroup) - Primitives UI phục vụ bộ lọc & chọn tiêu chí
// 1. Chuẩn Mobile-First: Cuộn ngang mượt mà, hỗ trợ scroll-snap chống cắt cụt chữ mép nút.
// 2. Dynamic Scroll Indicators: Tự động đo lường độ tràn (overflow) theo thời gian thực:
//    - Chỉ hiển thị gradient khi thực sự có nội dung bị tràn (scrollWidth > clientWidth).
//    - Triệt tiêu hoàn toàn lỗi "ô vuông tối màu" khi danh sách nút vừa vặn màn hình (như hàng Ngân Sách).
// 3. Bảo toàn lề an toàn (Safe Margin): Có padding đệm hai đầu để nút đầu tiên không bị dính sát hoặc mất chữ cái đầu.
// 4. Accessibility: Bọc role="radiogroup" và role="radio" cho từng chip với aria-checked.
export const ChipGroup: React.FC<ChipGroupProps> = ({
  options,
  value,
  onChange,
  className,
  unselectedClassName,
  scrollableOnMobile = true,
  gridCols = 4,
  showCheckIcon = true,
  showEdgeGradient = true,
  disabled = false,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Kiểm tra trạng thái cuộn thực tế của container
  const updateScrollIndicators = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || !scrollableOnMobile) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    // Chỉ kích hoạt khi nội dung tràn thực tế > 4px
    const hasOverflow = el.scrollWidth > el.clientWidth + 4;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 6);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, [scrollableOnMobile]);

  React.useEffect(() => {
    updateScrollIndicators();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => updateScrollIndicators();
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators, options]);

  const gridClasses = React.useMemo(() => {
    switch (gridCols) {
      case 2:
        return 'md:grid md:grid-cols-2';
      case 3:
        return 'md:grid md:grid-cols-3';
      case 5:
        return 'md:grid md:grid-cols-5';
      case 6:
        return 'md:grid md:grid-cols-6';
      case 4:
      default:
        return 'md:grid md:grid-cols-4';
    }
  }, [gridCols]);

  const handleChipClick = (id: string) => {
    onChange(id);
    // Nếu bấm vào nút đầu tiên, cuộn mượt về đầu danh sách để hiển thị trọn vẹn
    if (id === options[0]?.id && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={scrollContainerRef}
        role="radiogroup"
        className={cn(
          scrollableOnMobile
            ? 'flex flex-nowrap overflow-x-auto gap-1.5 sm:gap-2.5 px-0.5 py-0.5 sm:px-0 sm:py-0 sm:flex-wrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth [scroll-snap-type:x_proximity] [scroll-padding-left:4px]'
            : 'flex flex-wrap gap-1.5 sm:gap-2.5',
          gridClasses,
          className
        )}
      >
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <Button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              variant={isSelected ? 'accent' : 'outline'}
              glow={isSelected}
              leftIcon={
                isSelected && showCheckIcon ? (
                  <CheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  opt.icon
                )
              }
              onClick={() => handleChipClick(opt.id)}
              className={cn(
                'shrink-0 whitespace-nowrap h-9 sm:h-11 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer active:scale-95 select-none [scroll-snap-align:start]',
                isSelected
                  ? 'shadow-md shadow-[#0072CE]/30 font-bold'
                  : cn(
                      'bg-[#1e293b]/90 text-slate-200 border-slate-700/80 hover:border-slate-500 hover:bg-slate-700 hover:text-white shadow-sm shadow-black/20',
                      unselectedClassName
                    )
              )}
            >
              {opt.shortLabel && <span className="sm:hidden">{opt.shortLabel}</span>}
              <span className={opt.shortLabel ? 'hidden sm:inline' : ''}>{opt.label}</span>
              {opt.badge !== undefined && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
                  {opt.badge}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Lớp mờ gradient mép TRÁI: Chỉ hiển thị khi đã cuộn sang phải và còn nội dung bên trái */}
      {scrollableOnMobile && showEdgeGradient && canScrollLeft && (
        <div className="sm:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent z-10 transition-opacity duration-200" />
      )}

      {/* Lớp mờ gradient mép PHẢI: Chỉ hiển thị khi CÓ OVERFLOW VÀ CHƯA CUỘN HẾT sang phải */}
      {scrollableOnMobile && showEdgeGradient && canScrollRight && (
        <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-900/95 via-slate-900/70 to-transparent z-10 transition-opacity duration-200" />
      )}
    </div>
  );
};
