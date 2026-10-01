'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, PhoneCall } from 'lucide-react';

export interface SegmentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// 🧠 Mental Model: Local Error Boundary cho Dynamic Route /dong-xe/[slug].
// Cách ly lỗi cục bộ, ngăn chặn lỗi mạng hoặc dữ liệu làm sập toàn bộ giao diện của khách hàng (Zero-White-Screen).
export default function SegmentError({ error, reset }: SegmentErrorProps) {
  useEffect(() => {
    console.error('[SegmentError] Lỗi tại route /dong-xe/[slug]:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            Không Thể Tải Phân Khúc Xe
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hệ thống đang gặp gián đoạn tạm thời khi nạp dữ liệu xe. Quý khách vui lòng thử tải lại hoặc liên hệ với showroom để được hỗ trợ báo giá tức thì.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white font-bold text-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>

          <Link
            href="/xe"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Tất cả dòng xe</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
