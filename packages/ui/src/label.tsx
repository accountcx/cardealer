'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './lib/utils';

// 🧠 Mental Model: Canonical Shadcn UI Label Primitive
// Hỗ trợ chuẩn Accessible Label cho form fields, liên kết htmlFor, peer-disabled state và CVA styling

export const labelVariants = cva(
  'text-xs font-semibold leading-none text-slate-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none'
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';
