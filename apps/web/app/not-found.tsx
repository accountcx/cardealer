import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Car, Newspaper, Phone, FileQuestion, ArrowRight } from 'lucide-react';
import { Button, Card } from '@cardealer/ui';
import { getStorefrontSettings } from '../services/settings.service';

export const metadata: Metadata = {
  title: '404 - Không Tìm Thấy Trang | Hyundai Vinh',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn mới.',
  robots: {
    index: false,
    follow: true,
  },
};

// 🧠 Mental Model: SEO Friendly 404 Error Handler.
// 1. Trả về mã trạng thái HTTP 404 thực thể ngăn chặn Soft-404 penalty từ Googlebot.
// 2. robots: { index: false, follow: true } giúp bot không lập chỉ mục URL chết nhưng vẫn theo các link điều hướng hữu ích.
// 3. Giữ chân người dùng với các phễu chuyển đổi chính: Xem Xe, Dự Toán Lăn Bánh, Tin Tức & Hotline.
export default async function NotFound() {
  const settings = await getStorefrontSettings();
  const hotline = settings.contact?.hotlineKinhDoanh || settings.site?.phone || '0981.234.567';
  const cleanPhone = hotline.replace(/[^0-9]/g, '') || '0981234567';

  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-slate-50 to-slate-100">
      <Card className="max-w-xl w-full p-8 sm:p-10 bg-white border border-slate-200/90 shadow-xl rounded-3xl text-center space-y-6">
        {/* Biểu tượng 404 */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-inner">
          <FileQuestion className="w-10 h-10 animate-pulse" />
        </div>

        {/* Thông điệp */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Mã Lỗi: 404 Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Không Tìm Thấy Trang Yêu Cầu
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Đường dẫn bạn truy cập có thể đã được thay đổi, xóa bỏ hoặc tạm thời không khả dụng. Quý khách vui lòng chọn các liên kết chuyển hướng bên dưới.
          </p>
        </div>

        {/* Lưới điều hướng nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          <Link
            href="/"
            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">Trang Chủ Showroom</div>
              <div className="text-[11px] text-slate-500">Khám phá ưu đãi tháng</div>
            </div>
          </Link>

          <Link
            href="/xe"
            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">Bảng Giá Các Dòng Xe</div>
              <div className="text-[11px] text-slate-500">Accent, Creta, Tucson, Santa Fe</div>
            </div>
          </Link>

          <Link
            href="/gia-lan-banh"
            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-amber-700">Dự Toán Giá Lăn Bánh</div>
              <div className="text-[11px] text-slate-500">Tính thuế phí trọn gói</div>
            </div>
          </Link>

          <Link
            href="/tin-tuc"
            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">Tin Tức Khuyến Mãi</div>
              <div className="text-[11px] text-slate-500">Cập nhật chính sách mới</div>
            </div>
          </Link>
        </div>

        {/* Nút Gọi Hotline Hỗ Trợ */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-xs text-slate-500">Cần hỗ trợ tư vấn xe ngay?</span>
          <Link href={`tel:${cleanPhone}`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs px-4 py-2 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hotline: {hotline}</span>
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
