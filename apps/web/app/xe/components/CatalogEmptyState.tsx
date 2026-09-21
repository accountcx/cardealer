'use client';

import React from 'react';
import { SearchX, RotateCcw, PhoneCall } from 'lucide-react';
import { Button } from '@cardealer/ui';

export interface CatalogEmptyStateProps {
  onReset: () => void;
  contactHotline?: string;
}

// 🧠 Mental Model: Component Empty State khi bộ lọc không tìm thấy dòng xe phù hợp (Zero-State).
// 1. Cung cấp thông điệp hướng dẫn rõ ràng, lịch thiệp và không để người dùng gặp "ngõ cụt" (Dead-end UX).
// 2. Nút hành động chính kích hoạt đặt lại bộ lọc tức thì về trạng thái mặc định (reset in-memory + sync URL).
// 3. Tích hợp tùy chọn liên hệ Hotline trực tiếp để nhận tư vấn xe chuyên biệt nếu khách có nhu cầu riêng.
// 4. Tuân thủ 100% Named Export, UI Primitives từ @cardealer/ui và chuẩn tiếp cận WCAG AAA.
export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({
  onReset,
  contactHotline,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-sm my-6 transition-all duration-300 motion-reduce:transition-none"
    >
      {/* Icon Badge Trung Tâm */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-sky-50 text-[#0072CE] flex items-center justify-center mb-5 ring-8 ring-sky-50/50 shadow-inner">
        <SearchX className="w-8 h-8 sm:w-10 sm:h-10 text-[#0072CE]" aria-hidden="true" />
      </div>

      {/* Thông Điệp Nghiệp Vụ */}
      <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
        Không Tìm Thấy Dòng Xe Phù Hợp
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
        Rất tiếc, hiện tại không có dòng xe nào thỏa mãn đồng thời các tiêu chí phân khúc và mức ngân sách đã chọn.
        Quý khách vui lòng thử điều chỉnh lại bộ lọc hoặc xem toàn bộ danh mục xe.
      </p>

      {/* Nhóm Nút Hành Động */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-[#0072CE] to-[#005BA4] hover:from-[#005BA4] hover:to-[#00427A] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#0072CE]/25 hover:shadow-[#0072CE]/40 transition-all duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:outline-none"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Xóa Bộ Lọc &amp; Xem Tất Cả Xe</span>
        </Button>

        {contactHotline && (
          <a
            href={`tel:${contactHotline.replace(/\s+/g, '')}`}
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none gap-2 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Gọi Tư Vấn Riêng: {contactHotline}</span>
          </a>
        )}
      </div>
    </div>
  );
};
