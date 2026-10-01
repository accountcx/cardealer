import React from 'react';
import { DollarSign, Percent, ShieldCheck, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import type { StaticPage } from '@cardealer/types';
import Link from 'next/link';

interface FinanceTemplateProps {
  page: StaticPage;
}

// WHY: Template chính sách tài chính & giải pháp mua xe trả góp (FINANCE / FinancialProduct).
// Tối ưu hóa chuyển đổi với bảng đối chiếu lãi suất và hồ sơ vay vốn tinh gọn.
export function FinanceTemplate({ page }: FinanceTemplateProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 font-sans">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Chính Sách Tài Chính Showroom
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {page.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          {page.metaDescription || 'Hỗ trợ vay mua xe lên tới 85% giá trị hợp đồng, thời hạn tối đa 8 năm với lãi suất ưu đãi chỉ từ 0.6%/tháng.'}
        </p>
      </div>

      {/* 3 Trụ Cột Tài Chính */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <Percent className="text-blue-600" size={28} />
          <h3 className="font-bold text-slate-900 text-lg">Lãi Suất Ưu Đãi Cố Định</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Liên kết trực tiếp với các ngân hàng lớn (Vietcombank, BIDV, Techcombank) với gói lãi suất cố định 12-24 tháng.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <DollarSign className="text-emerald-600" size={28} />
          <h3 className="font-bold text-slate-900 text-lg">Trả Trước Chỉ Từ 15%</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chỉ cần từ 70 - 120 triệu đồng nhận ngay xe Hyundai lăn bánh, không phụ thu các chi phí ẩn.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <ShieldCheck className="text-amber-500" size={28} />
          <h3 className="font-bold text-slate-900 text-lg">Thủ Tục Đơn Giản 24H</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Phê duyệt hạn mức nhanh qua CCCD gắn chip, không cần chứng minh thu nhập phức tạp.
          </p>
        </div>
      </div>

      {/* Hồ sơ cần chuẩn bị */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Hồ Sơ Vay Vốn Cần Chuẩn Bị</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Khách Hàng Cá Nhân</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Căn cước công dân gắn chip (Vợ & Chồng)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Giấy đăng ký kết hôn hoặc Xác nhận độc thân</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Sao kê tài khoản lương hoặc Hợp đồng lao động</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Khách Hàng Doanh Nghiệp</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Giấy phép đăng ký kinh doanh & Điều lệ công ty</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Báo cáo tài chính & Tờ khai thuế 1 năm gần nhất</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Sao kê tài khoản ngân hàng doanh nghiệp 6 tháng</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
