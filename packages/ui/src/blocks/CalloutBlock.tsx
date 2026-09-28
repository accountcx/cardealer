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
    container: 'bg-blue-50 border-blue-600',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    contentColor: 'text-slate-700',
    defaultTitle: 'Thông tin lưu ý',
  },
  warning: {
    container: 'bg-amber-50 border-amber-500',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-950',
    contentColor: 'text-amber-900',
    defaultTitle: 'Cảnh báo quan trọng',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-500',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-950',
    contentColor: 'text-emerald-900',
    defaultTitle: 'Ưu đãi & Khuyến nghị',
  },
  note: {
    container: 'bg-slate-100 border-slate-400',
    iconColor: 'text-slate-500',
    titleColor: 'text-slate-900',
    contentColor: 'text-slate-600',
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
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect width="20" height="5" x="2" y="7" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
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
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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
        'not-prose my-6 flex items-start gap-3.5 rounded-r-2xl rounded-l-sm border-l-4 p-4.5 sm:p-5 text-sm leading-relaxed shadow-xs',
        'transition-colors duration-200 motion-reduce:transition-none',
        currentVariant.container,
        className
      )}
      role={type === 'warning' ? 'alert' : 'note'}
      aria-label={displayTitle || 'Ghi chú'}
    >
      <div className="mt-0.5 shrink-0">
        <CalloutIcon type={type} className={currentVariant.iconColor} />
      </div>
      <div className="flex-1 space-y-1.5">
        {displayTitle && (
          <h4 className={cn('font-bold tracking-tight text-base leading-snug', currentVariant.titleColor)}>
            {displayTitle}
          </h4>
        )}
        {bodyContent && (
          <div className={cn('text-sm leading-relaxed', currentVariant.contentColor)}>
            {bodyContent}
          </div>
        )}
      </div>
    </aside>
  );
}
