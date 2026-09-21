'use client';

import * as React from 'react';
import { cn } from './lib/utils';

// 🧠 Mental Model: Canonical Shadcn UI Dialog/Modal Primitive
// Backdrop làm mờ kiểu kính (Glassmorphism), khóa cuộn trang khi mở và hoạt ảnh nhẹ

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'dark' | 'light';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  variant = 'dark',
  showCloseButton = true,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isLight = variant === 'light';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 backdrop-blur-sm transition-opacity animate-in fade-in',
          isLight ? 'bg-slate-900/60' : 'bg-black/75'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-2xl shadow-2xl transition-all duration-200 animate-in zoom-in-95',
          isLight
            ? 'border border-slate-200 bg-white text-slate-900 p-6 sm:p-7'
            : 'border border-white/10 bg-slate-900/95 text-slate-100 p-6',
          className
        )}
      >
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              {title && (
                typeof title === 'string' ? (
                  <h3 className={cn('text-lg font-bold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                    {title}
                  </h3>
                ) : (
                  title
                )
              )}
              {description && (
                typeof description === 'string' ? (
                  <p className={cn('text-xs mt-1', isLight ? 'text-slate-500' : 'text-slate-400')}>
                    {description}
                  </p>
                ) : (
                  description
                )
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'rounded-lg p-1.5 transition-colors',
                  isLight
                    ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                )}
                type="button"
                aria-label="Đóng"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
};
