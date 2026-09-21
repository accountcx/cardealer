import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './lib/utils';

// 🧠 Mental Model: Shadcn UI Button Component với class-variance-authority (cva)
// Kế thừa tokens màu Hyundai (#002C6C Primary, #0072CE Accent) và chuẩn Accessible Slot pattern

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[#002C6C] text-white hover:bg-[#001D47] active:scale-[0.98] focus-visible:ring-[#0072CE]',
        primary:
          'bg-[#002C6C] text-white hover:bg-[#001D47] active:scale-[0.98] focus-visible:ring-[#0072CE]',
        accent:
          'bg-[#0072CE] text-white hover:bg-[#005BA6] active:scale-[0.98] focus-visible:ring-[#0072CE]',
        secondary:
          'bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98] border border-white/10',
        outline:
          'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white',
        danger:
          'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 active:scale-[0.98]',
        success:
          'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 active:scale-[0.98]',
        ghost:
          'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
        link:
          'text-[#0072CE] underline-offset-4 hover:underline p-0 h-auto font-normal',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 rounded-xl px-6 text-base font-bold',
        icon: 'h-9 w-9 p-0',
      },
      glow: {
        true: 'shadow-[0_4px_20px_rgba(0,114,206,0.35)] hover:shadow-[0_6px_25px_rgba(0,114,206,0.5)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      glow: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, glow, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
