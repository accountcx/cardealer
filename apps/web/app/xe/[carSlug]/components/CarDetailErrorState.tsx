import React from 'react';
import Link from 'next/link';
import { AlertCircle, PhoneCall, ArrowLeft } from 'lucide-react';

interface CarDetailErrorStateProps {
  slug?: string;
  hotline?: string;
}

/**
 * 🧠 Mental Model: Trạng thái lỗi 404 thân thiện người dùng (Friendly Error / Not Found State).
 * Khi khách hàng truy cập một slug xe không tồn tại hoặc xe đang ở trạng thái draft/archived,
 * trang sẽ không để lại trang lỗi trắng bệch mà đưa ra định hướng rõ ràng:
 * 1. Quay lại danh mục toàn bộ dòng xe (/xe).
 * 2. Gọi ngay cho Saler để được tư vấn các mẫu xe tương đương.
 */
export function CarDetailErrorState({
  slug,
  hotline = '0981.234.567',
}: CarDetailErrorStateProps) {
  const cleanPhone = hotline.replace(/\D/g, '');

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-lg w-full text-center p-8 sm:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Không tìm thấy thông tin dòng xe
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Dòng xe với mã{' '}
            <code className="font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-semibold">
              {slug}
            </code>{' '}
            hiện chưa được phát hành hoặc đã ngừng kinh doanh.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/xe"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 motion-reduce:transition-none shadow-sm active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Xem tất cả các dòng xe
          </Link>
          <a
            href={`tel:${cleanPhone}`}
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-sm transition-all duration-200 motion-reduce:transition-none"
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Gọi Em Tư Vấn ({hotline})
          </a>
        </div>
      </div>
    </div>
  );
}
