'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from './lib/utils';

// 🧠 Mental Model: Canonical 2026 Adaptive Select Primitive for @cardealer/ui
// Giải quyết triệt để:
// 1. Lỗi Dropdown nhảy tọa độ & co cụm: Mobile (< 768px) dùng Bottom Sheet vừa tầm 60vh.
// 2. Lỗi scroll màn hình cha: Khóa cứng cuộn body + html khi Bottom Sheet mở trên Mobile.
// 3. Tương thích 100% API: Hỗ trợ options array lẫn compound <option>, tích hợp react-hook-form.

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  sheetTitle?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  variant?: 'dark' | 'light';
  containerClassName?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      sheetTitle,
      error,
      helperText,
      id,
      options,
      variant = 'dark',
      containerClassName,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      placeholder = '-- Vui lòng chọn --',
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : generatedId);
    const isLight = variant === 'light';

    // State điều khiển mở/đóng dropdown & Bottom Sheet
    const [isOpen, setIsOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    // Ref cho trigger container & hidden select
    const containerRef = React.useRef<HTMLDivElement>(null);
    const hiddenSelectRef = React.useRef<HTMLSelectElement | null>(null);

    // Đồng bộ ref chuyển tiếp từ ngoài vào
    React.useImperativeHandle(ref, () => hiddenSelectRef.current as HTMLSelectElement);

    // Hàm trích xuất text thuần túy từ ReactNode (ngăn lỗi mảng JSX bị toString() biến thành dấu phẩy)
    const extractText = (node: React.ReactNode): string => {
      if (node === null || node === undefined) return '';
      if (typeof node === 'string' || typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (React.isValidElement(node)) {
        return extractText((node.props as { children?: React.ReactNode }).children);
      }
      return '';
    };

    // Trích xuất danh sách options từ props options hoặc compound <option> children
    const parsedOptions = React.useMemo(() => {
      if (options && options.length > 0) {
        return options;
      }
      const extracted: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && (child.type === 'option' || (child.props as { value?: unknown })?.value !== undefined)) {
          const propsVal = (child.props as { value?: unknown; children?: React.ReactNode; disabled?: boolean });
          const val = propsVal.value !== undefined ? String(propsVal.value) : '';
          const lbl = propsVal.children !== undefined ? extractText(propsVal.children) : val;
          extracted.push({
            value: val,
            label: lbl || val,
            disabled: propsVal.disabled,
          });
        }
      });
      return extracted;
    }, [options, children]);

    // Quản lý giá trị chọn hiện tại (Controlled vs Uncontrolled)
    const [internalValue, setInternalValue] = React.useState<string>(
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ''
    );

    const currentValue = value !== undefined ? String(value) : internalValue;

    // Tìm kiếm Option đang chọn để lấy Label hiển thị
    const currentOption = parsedOptions.find((opt) => String(opt.value) === currentValue);
    const displayLabel = currentOption?.label || (currentValue ? currentValue : placeholder);

    // Client-side detection & Window resize listener
    React.useEffect(() => {
      setMounted(true);
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 🔒 Khóa cuộn màn hình cha triệt để (Bulletproof Mobile Scroll Lock)
    React.useEffect(() => {
      if (!isOpen || !isMobile) return;

      const scrollY = window.scrollY;
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        window.scrollTo(0, scrollY);
      };
    }, [isOpen, isMobile]);

    // Xử lý đóng Dropdown khi click ra ngoài (Desktop)
    React.useEffect(() => {
      if (!isOpen || isMobile) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, isMobile]);

    // Hàm chọn Option
    const handleSelectOption = (opt: SelectOption) => {
      if (opt.disabled || disabled) return;
      setInternalValue(opt.value);
      setIsOpen(false);

      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = opt.value;
        hiddenSelectRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (onChange) {
        const syntheticEvent = {
          target: { value: opt.value, name: props.name || selectId },
          currentTarget: { value: opt.value, name: props.name || selectId },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    // Auto-detect width classes from className if containerClassName doesn't explicitly specify width
    const hasExplicitWidth = containerClassName && /\b(w-|max-w-|min-w-)/.test(containerClassName);
    const widthMatch = !hasExplicitWidth && className ? className.match(/\b(w-(?:\[[^\]]+\]|\S+)|max-w-(?:\[[^\]]+\]|\S+)|min-w-(?:\[[^\]]+\]|\S+))/g) : null;
    const extractedWidth = widthMatch ? widthMatch.join(' ') : undefined;

    // Component Dropdown Popover (Desktop >= 768px)
    const desktopDropdown = isOpen && !isMobile && (
      <div
        className={cn(
          'absolute left-0 top-[calc(100%+6px)] w-full min-w-full z-50 rounded-2xl border shadow-2xl p-1.5 max-h-72 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150',
          isLight
            ? 'border-slate-200 bg-white text-slate-900 shadow-slate-300/50'
            : 'border-slate-800 bg-slate-900/98 text-slate-100 shadow-black/80'
        )}
      >
        {parsedOptions.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">Không có lựa chọn nào</div>
        ) : (
          parsedOptions.map((opt) => {
            const isSelected = String(opt.value) === currentValue;
            return (
              <button
                type="button"
                key={opt.value}
                disabled={opt.disabled}
                onClick={() => handleSelectOption(opt)}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer select-none',
                  isSelected
                    ? isLight
                      ? 'bg-blue-50 text-[#002C6C] font-bold'
                      : 'bg-[#0072CE]/20 text-sky-400 font-bold'
                    : isLight
                    ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  opt.disabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-[#0072CE] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })
        )}
      </div>
    );

    // Tiêu đề hiển thị trên Header của Bottom Sheet
    const resolvedTitle = sheetTitle || label || 'Lựa Chọn Danh Mục';

    // Component Mobile Bottom Sheet (Mobile < 768px)
    const mobileBottomSheet = isOpen && isMobile && mounted && createPortal(
      <div className="fixed inset-0 z-[999] flex flex-col justify-end" role="dialog" aria-modal="true">
        {/* Backdrop Overlay - Chặn touchmove để triệt tiêu scroll màn hình cha */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
          aria-hidden="true"
        />

        {/* Bottom Sheet Drawer - Chiều cao chuẩn 58vh - 60vh không bị choán ngợp */}
        <div
          className={cn(
            'relative z-10 w-full max-h-[60vh] flex flex-col rounded-t-[28px] border-t shadow-2xl animate-in slide-in-from-bottom duration-300 pb-safe overscroll-contain',
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-slate-100'
          )}
        >
          {/* Drag Handle */}
          <div
            className={cn(
              'w-10 h-1.5 rounded-full mx-auto mt-3 mb-1 shrink-0',
              isLight ? 'bg-slate-300' : 'bg-slate-700'
            )}
          />

          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-5 py-3 border-b shrink-0',
              isLight ? 'border-slate-100' : 'border-slate-800'
            )}
          >
            <div
              className={cn(
                'text-base font-bold tracking-tight',
                isLight ? 'text-slate-900' : 'text-white'
              )}
            >
              {resolvedTitle}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer',
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
              )}
              aria-label="Đóng"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* List Options với chiều cao min-h-[46px] vừa vặn và pb-12 tránh bị che bởi nút nổi */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-1.5 pb-12">
            {parsedOptions.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Không có dữ liệu lựa chọn</div>
            ) : (
              parsedOptions.map((opt) => {
                const isSelected = String(opt.value) === currentValue;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    disabled={opt.disabled}
                    onClick={() => handleSelectOption(opt)}
                    className={cn(
                      'w-full text-left min-h-[46px] px-4 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.99]',
                      isSelected
                        ? isLight
                          ? 'bg-blue-50/90 border-2 border-blue-500/80 text-[#002C6C] font-extrabold shadow-sm'
                          : 'bg-[#0072CE]/20 border-2 border-[#0072CE] text-sky-300 font-extrabold'
                        : isLight
                        ? 'bg-slate-50/80 border border-slate-200/80 text-slate-800 font-bold hover:bg-slate-100'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700',
                      opt.disabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <span className="text-sm leading-tight pr-3 font-semibold">{opt.label}</span>
                    <div className="shrink-0 flex items-center justify-center">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#0072CE] text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full border-2',
                            isLight ? 'border-slate-300' : 'border-slate-600'
                          )}
                        />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>,
      document.body
    );

    const selectField = (
      <div ref={containerRef} className={cn('relative w-full', extractedWidth, containerClassName)}>
        {/* Trigger Button hiển thị theo chuẩn UI 2026 */}
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border px-3.5 pr-10 text-sm transition-all cursor-pointer text-left select-none',
            isLight
              ? 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100/70 focus-visible:bg-white focus-visible:ring-[#0072CE]'
              : 'border-slate-800 bg-slate-950/80 text-slate-100 hover:bg-slate-900 focus-visible:ring-[#0072CE]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{displayLabel}</span>

          {/* Chevron Icon Custom Stylized (Rotate khi mở) */}
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 right-3 flex items-center transition-transform duration-200',
              isOpen && 'rotate-180',
              isLight ? 'text-slate-500' : 'text-slate-400'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown Desktop */}
        {desktopDropdown}

        {/* Mobile Bottom Sheet */}
        {mobileBottomSheet}

        {/* Hidden native select để tương thích 100% với form submit & react-hook-form */}
        <select
          ref={hiddenSelectRef}
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
          value={currentValue}
          onChange={(e) => {
            setInternalValue(e.target.value);
            if (onChange) onChange(e);
          }}
          disabled={disabled}
          {...props}
        >
          {parsedOptions.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );

    if (!label && !error && !helperText) {
      return selectField;
    }

    return (
      <div className={cn('w-full space-y-1.5', extractedWidth, containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block text-xs font-semibold select-none',
              isLight ? 'text-slate-700' : 'text-slate-300'
            )}
          >
            {label}
          </label>
        )}

        {selectField}

        {error && <p className="text-xs font-medium text-red-400">{error}</p>}
        {!error && helperText && (
          <p className={cn('text-xs leading-relaxed', isLight ? 'text-slate-500' : 'text-slate-400')}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
