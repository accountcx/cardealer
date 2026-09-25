'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '../table';
import { Button } from '../button';
import { Badge } from '../badge';

// 🧠 Mental Model: PriceTableBlock là Bảng Giá Niêm Yết & Dự Toán Lăn Bánh Tự Động cho Xe Hyundai.
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Component-Driven & Shared Primitives First: Tái sử dụng đồng bộ Table, Button, Badge từ thư viện @cardealer/ui.
// 2. 100% Named Export: TUYỆT ĐỐI CẤM export default để đảm bảo tree-shaking và auto-import chuẩn.
// 3. Tối ưu CRO & Trải Nghiệm Mobile: Chống vỡ layout qua wrapper cuộn ngang, nút CTA nhận báo giá lăn bánh cho từng phiên bản.
// 4. 4-State UI Matrix: Xử lý Data State (hiển thị bảng giá format VND), Empty State (chưa có phiên bản), và Ghi chú lưu ý pháp lý.
// 5. WCAG AAA & Reduced Motion: Toàn bộ transition đều gắn motion-reduce:transition-none.

export interface PriceTableVersion {
  id?: string;
  name: string;
  engine?: string;
  price: number;
  promotionalPrice?: number;
  onRoadPriceEstimate?: number;
}

export interface PriceTableBlockProps {
  carId?: string;
  carName?: string;
  headline?: string | null;
  showNote?: boolean;
  versions?: PriceTableVersion[];
  noteText?: string;
  className?: string;
  onRequestQuote?: (versionName: string) => void;
}

export function PriceTableBlock({
  carId,
  carName,
  headline,
  showNote = true,
  versions = [],
  noteText = '* Giá lăn bánh tạm tính đã bao gồm Lệ phí trước bạ, Phí đăng ký biển số, Phí đăng kiểm, Phí bảo trì đường bộ và Bảo hiểm TNDS bắt buộc. Giá thực tế có thể thay đổi tùy thuộc vào chương trình khuyến mại tháng của Hyundai Vinh.',
  className,
  onRequestQuote,
}: PriceTableBlockProps) {
  // Format tiền tệ VND
  const formatCurrency = React.useCallback((amount?: number) => {
    if (typeof amount !== 'number' || amount <= 0) {
      return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const defaultHeadline = carName ? `Bảng Giá Xe ${carName} Mới Nhất` : 'Bảng Giá Niêm Yết & Lăn Bánh';
  const displayHeadline = headline || defaultHeadline;

  return (
    <div className={cn('not-prose my-8 space-y-3 font-sans', className)}>
      {/* Tiêu đề bảng giá */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0072CE]">
              Hyundai Vinh
            </span>
            <span className="text-slate-600">•</span>
            <Badge variant="published" size="sm">
              Cập nhật mới nhất
            </Badge>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {displayHeadline}
          </h3>
        </div>
      </div>

      {/* Khung chứa bảng dữ liệu (Tái sử dụng Table Primitive) */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-xs overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-700/60">
            <TableRow isHeader>
              <TableHead className="font-semibold text-slate-200 text-xs uppercase tracking-wider py-3.5 px-4">
                Phiên Bản Xe
              </TableHead>
              <TableHead className="font-semibold text-slate-200 text-xs uppercase tracking-wider py-3.5 px-4 text-right">
                Giá Niêm Yết
              </TableHead>
              <TableHead className="font-semibold text-slate-200 text-xs uppercase tracking-wider py-3.5 px-4 text-right">
                Tạm Tính Lăn Bánh
              </TableHead>
              <TableHead className="font-semibold text-slate-200 text-xs uppercase tracking-wider py-3.5 px-4 text-center">
                Ưu Đãi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {versions && versions.length > 0 ? (
              // 4-State: DATA STATE
              versions.map((ver, idx) => (
                <TableRow
                  key={ver.id || idx}
                  className={cn(
                    'border-b border-slate-800/60 transition-colors duration-150 motion-reduce:transition-none',
                    'even:bg-slate-900/20 hover:bg-slate-800/40'
                  )}
                >
                  <TableCell className="px-4 py-3.5">
                    <p className="font-semibold text-sm text-white">
                      {ver.name}
                    </p>
                    {ver.engine && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ver.engine}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3.5 text-right font-medium text-sm text-slate-200">
                    {formatCurrency(ver.price)}
                  </TableCell>

                  <TableCell className="px-4 py-3.5 text-right font-bold text-sm text-[#0072CE]">
                    {formatCurrency(ver.onRoadPriceEstimate || ver.price)}
                  </TableCell>

                  <TableCell className="px-4 py-3.5 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestQuote?.(ver.name)}
                      className="h-8 text-xs border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-[#0072CE] hover:text-white hover:border-[#0072CE] transition-colors motion-reduce:transition-none"
                    >
                      Báo giá
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // 4-State: EMPTY STATE
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      Đang cập nhật bảng giá chính thức
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Vui lòng liên hệ bộ phận kinh doanh Hyundai Vinh để nhận chính sách ưu đãi tiền mặt và phụ kiện mới nhất.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ghi chú lưu ý pháp lý & khuyến mại */}
      {showNote && noteText && (
        <p className="text-xs italic text-slate-400 leading-relaxed px-1">
          {noteText}
        </p>
      )}
    </div>
  );
}
