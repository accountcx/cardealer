import * as React from 'react';
import { cn } from './lib/utils';

// 🧠 Mental Model: Canonical Shadcn UI Select Primitive
// Hỗ trợ cả 2 dạng: Options array hoặc Compound <option> children
// Tích hợp label, helperText, error state đồng bộ với Design System @cardealer/ui

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  variant?: 'dark' | 'light';
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options, variant = 'dark', containerClassName, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);
    const isLight = variant === 'light';

    // Auto-detect width classes from className if containerClassName doesn't explicitly specify width
    const hasExplicitWidth = containerClassName && /\b(w-|max-w-|min-w-)/.test(containerClassName);
    const widthMatch = !hasExplicitWidth && className ? className.match(/\b(w-(?:\[[^\]]+\]|\S+)|max-w-(?:\[[^\]]+\]|\S+)|min-w-(?:\[[^\]]+\]|\S+))/g) : null;
    const extractedWidth = widthMatch ? widthMatch.join(' ') : undefined;

    const selectField = (
      <div className={cn('relative w-full', extractedWidth, containerClassName)}>
        <select
          id={selectId}
          className={cn(
            'flex h-11 w-full appearance-none rounded-xl border px-3.5 pr-10 text-sm transition-colors cursor-pointer',
            isLight
              ? 'border-slate-200 bg-slate-50 text-slate-900 focus-visible:bg-white focus-visible:ring-[#0072CE]'
              : 'border-slate-800 bg-slate-950/80 text-slate-100 focus-visible:ring-[#0072CE]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {/* Chevron Icon Custom Stylized */}
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 right-3 flex items-center',
            isLight ? 'text-slate-500' : 'text-slate-400'
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
