import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './lib/utils';

// 🧠 Mental Model: Shadcn UI Badge Primitive với class-variance-authority (cva)
// Chuẩn hoá phân loại trạng thái xe, phiên bản và cờ đánh dấu trong Admin CMS

export const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
        published: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        draft: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
        accent: 'bg-[#0072CE]/20 text-[#0072CE] border border-[#0072CE]/40',
        neutral: 'bg-slate-800 text-slate-300 border border-white/10',
        outline: 'text-slate-300 border border-slate-700',
        secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-750',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
