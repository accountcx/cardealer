import React from 'react';
import Link from 'next/link';
import { Award, Users, Car, MapPin, Phone, CheckCircle2, Building2 } from 'lucide-react';
import type { StaticPage } from '@cardealer/types';

interface ProfileShowroomTemplateProps {
  page: StaticPage;
}

// WHY: Template giới thiệu hồ sơ doanh nghiệp & Showroom Hyundai Vinh (PROFILE_SHOWROOM / AboutPage).
// Tối ưu hóa các tín hiệu E-E-A-T (Kinh nghiệm, Chuyên môn, Thẩm quyền, Độ tin cậy) hỗ trợ SEO Entity.
export function ProfileShowroomTemplate({ page }: ProfileShowroomTemplateProps) {
  return (
    <div className="space-y-16 pb-20 font-sans">
      {/* 1. Hero Banner */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Building2 size={14} /> Đại Lý Ủy Quyền Chính Hãng TC Motor
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {page.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {page.metaDescription ||
              'Showroom tiêu chuẩn 3S toàn cầu chuyên cung cấp các dòng xe Hyundai du lịch, thương mại và dịch vụ bảo hành bảo dưỡng chính hãng.'}
          </p>
        </div>
      </section>

      {/* 2. Key Stats Highlights */}
      <section className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white shadow-xl rounded-2xl p-6 border border-slate-100">
          <div className="text-center p-3">
            <span className="block text-3xl font-black text-blue-600 font-mono">10+</span>
            <span className="text-xs text-slate-500 font-medium">Năm Đồng Hành</span>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <span className="block text-3xl font-black text-blue-600 font-mono">15,000+</span>
            <span className="text-xs text-slate-500 font-medium">Xe Lăn Bánh</span>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <span className="block text-3xl font-black text-blue-600 font-mono">98%</span>
            <span className="text-xs text-slate-500 font-medium">Hài Lòng Dịch Vụ</span>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <span className="block text-3xl font-black text-blue-600 font-mono">24/7</span>
            <span className="text-xs text-slate-500 font-medium">Cứu Hộ Tận Nơi</span>
          </div>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Cam Kết Chất Lượng Showroom</h2>
          <p className="text-sm text-slate-500">Mỗi khách hàng là một đại sứ thương hiệu cùng chúng tôi xây dựng giá trị.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <Award className="text-blue-600" size={28} />
            <h3 className="font-bold text-slate-900 text-lg">Xe Mới 100% Chính Hãng</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mọi chiếc xe xuất xưởng đều có giấy chứng nhận kiểm định chất lượng, bảo hành 5 năm hoặc 100.000km.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <Users className="text-blue-600" size={28} />
            <h3 className="font-bold text-slate-900 text-lg">Tư Vấn Tận Tâm Chuyên Nghiệp</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Đội ngũ chuyên viên được đào tạo theo tiêu chuẩn Hyundai toàn cầu, hỗ trợ lái thử tận nhà miễn phí.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <Car className="text-blue-600" size={28} />
            <h3 className="font-bold text-slate-900 text-lg">Xưởng Dịch Vụ 3S Hiện Đại</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống phòng sơn hấp, máy chẩn đoán lỗi chuyên sâu và kho phụ tùng chính hãng sẵn sàng phục vụ.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
