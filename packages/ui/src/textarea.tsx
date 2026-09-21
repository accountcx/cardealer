import * as React from 'react';
import { cn } from './lib/utils';

// 🧠 Mental Model: Canonical Shadcn UI Textarea Primitive
// Tích hợp label, helperText, error state đồng bộ với Design System @cardealer/ui

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-slate-300 select-none"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          rows={rows}
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border bg-slate-900/80 p-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors',
            'border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />

        {error && <p className="text-xs font-medium text-red-400">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-400 leading-relaxed">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
