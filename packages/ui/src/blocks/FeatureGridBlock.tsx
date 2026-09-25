import * as React from 'react';
import { cn } from '../lib/utils';
import { Card } from '../card';

// 🧠 Mental Model: FeatureGridBlock là Lưới Trình Diễn Trang Bị & Gói An Toàn Hyundai SmartSense cho News Hub & Car Review.
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Component-Driven & Shared Primitives First: Tái sử dụng Card primitive chuẩn (@cardealer/ui) với hiệu ứng dark glass/border.
// 2. 100% Named Export: TUYỆT ĐỐI CẤM export default để hỗ trợ tree-shaking và auto-import chuẩn.
// 3. WCAG AAA & Reduced Motion: Toàn bộ transition/transform BẮT BUỘC gắn motion-reduce:transition-none motion-reduce:transform-none.
// 4. Zero Ad-hoc Styling: Bảng màu Slate dark mode đồng bộ Design Tokens (border-slate-800, text-slate-100, brand blue #0072CE).
// 5. SmartSense Fallback: Hiển thị minh họa chuyên nghiệp khi trang bị chưa nạp URL ảnh từ CMS.

export interface FeatureItem {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface FeatureGridBlockProps {
  columns?: '2' | '3' | '4';
  features?: FeatureItem[];
  className?: string;
}

const columnStyles = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export function FeatureGridBlock({
  columns = '3',
  features = [],
  className,
}: FeatureGridBlockProps) {
  // Fallback an toàn: nếu mảng rỗng thì không render phần tử rác
  if (!features || features.length === 0) {
    return null;
  }

  const gridColClass = columnStyles[columns] || columnStyles['3'];

  return (
    <div className={cn('not-prose my-8 font-sans', className)}>
      <div className={cn('grid gap-4 sm:gap-6', gridColClass)}>
        {features.map((feature, idx) => (
          <Card
            key={idx}
            className={cn(
              'group flex flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 shadow-sm backdrop-blur-xs',
              'transition-all duration-300 motion-reduce:transition-none',
              'hover:-translate-y-1 hover:border-[#0072CE]/40 hover:shadow-md hover:shadow-[#0072CE]/5 motion-reduce:hover:transform-none'
            )}
          >
            {/* Khung ảnh trang bị với hiệu ứng zoom mượt mà */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-800/80">
              {feature.imageUrl ? (
                <img
                  src={feature.imageUrl}
                  alt={feature.title}
                  loading="lazy"
                  className={cn(
                    'h-full w-full object-cover',
                    'transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100'
                  )}
                />
              ) : (
                /* Fallback icon khi tính năng chưa nạp ảnh */
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-slate-400">
                  <svg
                    className={cn(
                      'h-8 w-8 text-[#0072CE] transition-transform duration-300 group-hover:scale-110',
                      'motion-reduce:transition-none motion-reduce:group-hover:scale-100'
                    )}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span className="mt-2 text-xs font-semibold tracking-wide text-slate-300">
                    Hyundai SmartSense
                  </span>
                </div>
              )}
            </div>

            {/* Nội dung chi tiết tính năng */}
            <div className="mt-4 flex flex-1 flex-col justify-between">
              <div>
                <h4
                  className={cn(
                    'font-semibold text-base tracking-tight text-slate-100',
                    'transition-colors duration-200 group-hover:text-[#0072CE] motion-reduce:transition-none'
                  )}
                >
                  {feature.title}
                </h4>
                {feature.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400 line-clamp-3">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
