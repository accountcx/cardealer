import * as React from 'react';
import { cn } from '../lib/utils';

// 🧠 Mental Model: CalloutBlock là Khối Hộp Ghi Chú & Cảnh Báo Chuẩn Editorial cho Hyundai Vinh News Hub.
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. 100% Named Export: TUYỆT ĐỐI CẤM export default để tương thích tốt với tree-shaking và auto-import.
// 2. Zero Ad-hoc Styling: Phối hợp hài hòa cùng Design Tokens hệ thống (Dark mode Slate, Brand colors).
// 3. WCAG AAA & A11y: Đạt độ tương phản màu chuẩn (>= 4.5:1), gán ARIA role (alert/note), kèm motion-reduce:transition-none.
// 4. Robust Fallback: Xử lý an toàn khi content/children rỗng.

export type CalloutType = 'info' | 'warning' | 'success' | 'note';

export interface CalloutBlockProps {
  type?: CalloutType;
  title?: string | null;
  content?: string;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles = {
  info: {
    container: 'bg-blue-950/20 border-blue-500 text-blue-100 dark:bg-blue-950/30 dark:border-blue-400 dark:text-blue-100',
    iconColor: 'text-blue-400 dark:text-blue-400',
    titleColor: 'text-blue-200 dark:text-blue-200',
    defaultTitle: 'Thông tin lưu ý',
  },
  warning: {
    container: 'bg-amber-950/20 border-amber-500 text-amber-100 dark:bg-amber-950/30 dark:border-amber-400 dark:text-amber-100',
    iconColor: 'text-amber-400 dark:text-amber-400',
    titleColor: 'text-amber-200 dark:text-amber-200',
    defaultTitle: 'Cảnh báo quan trọng',
  },
  success: {
    container: 'bg-emerald-950/20 border-emerald-500 text-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-400 dark:text-emerald-100',
    iconColor: 'text-emerald-400 dark:text-emerald-400',
    titleColor: 'text-emerald-200 dark:text-emerald-200',
    defaultTitle: 'Ưu đãi & Khuyến nghị',
  },
  note: {
    container: 'bg-slate-900/60 border-slate-500 text-slate-200 dark:bg-slate-900/80 dark:border-slate-500 dark:text-slate-200',
    iconColor: 'text-slate-400 dark:text-slate-400',
    titleColor: 'text-slate-100 dark:text-slate-100',
    defaultTitle: 'Ghi chú biên tập',
  },
};

function CalloutIcon({ type, className }: { type: CalloutType; className?: string }) {
  switch (type) {
    case 'warning':
      return (
        <svg
          className={cn('h-5 w-5 shrink-0', className)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'success':
      return (
        <svg
          className={cn('h-5 w-5 shrink-0', className)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'note':
      return (
        <svg
          className={cn('h-5 w-5 shrink-0', className)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg
          className={cn('h-5 w-5 shrink-0', className)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

export function CalloutBlock({
  type = 'info',
  title,
  content,
  className,
  children,
}: CalloutBlockProps) {
  const currentVariant = variantStyles[type] || variantStyles.info;
  const displayTitle = title === undefined ? currentVariant.defaultTitle : title;
  const bodyContent = children || content;

  // Fallback: nếu không có cả tiêu đề lẫn nội dung thì không render block rác
  if (!displayTitle && !bodyContent) {
    return null;
  }

  return (
    <aside
      className={cn(
        'not-prose my-6 flex items-start gap-3.5 rounded-r-xl border-l-4 p-4 text-sm leading-relaxed shadow-xs',
        'transition-colors duration-200 motion-reduce:transition-none',
        currentVariant.container,
        className
      )}
      role={type === 'warning' ? 'alert' : 'note'}
      aria-label={displayTitle || 'Ghi chú'}
    >
      <CalloutIcon type={type} className={currentVariant.iconColor} />
      <div className="flex-1 space-y-1">
        {displayTitle && (
          <h4 className={cn('font-semibold tracking-tight text-base', currentVariant.titleColor)}>
            {displayTitle}
          </h4>
        )}
        {bodyContent && (
          <div className="text-inherit opacity-95">
            {bodyContent}
          </div>
        )}
      </div>
    </aside>
  );
}
