import * as React from 'react';
import { cn } from './lib/utils';

// 🧠 Mental Model: Canonical Shadcn UI Switch Primitive
// Toggle công tắc bật tắt trạng thái (on/off) chuẩn accessibility

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, onChange, label, description, disabled, id, ...props }, ref) => {
    const switchId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      if (onCheckedChange) onCheckedChange(e.target.checked);
    };

    return (
      <div className="flex items-center justify-between gap-4">
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label htmlFor={switchId} className="text-sm font-semibold text-white select-none cursor-pointer">
                {label}
              </label>
            )}
            {description && <p className="text-xs text-slate-400">{description}</p>}
          </div>
        )}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            id={switchId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              'w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer',
              'peer-checked:after:translate-x-full peer-checked:after:border-white',
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
              'peer-checked:bg-[#0072CE] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              className
            )}
          />
        </label>
      </div>
    );
  }
);
Switch.displayName = 'Switch';
