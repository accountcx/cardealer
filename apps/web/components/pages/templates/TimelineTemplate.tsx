import React from 'react';
import { CheckCircle2, ChevronRight, Compass, ShieldCheck } from 'lucide-react';
import type { StaticPage } from '@cardealer/types';

interface TimelineTemplateProps {
  page: StaticPage;
}

// WHY: Template dòng thời gian hoặc các bước quy trình mua xe chuẩn mực (TIMELINE / HowTo).
// Tương thích với Google HowTo Schema, giúp khách hàng nắm rõ các mốc hành trình minh bạch.
export function TimelineTemplate({ page }: TimelineTemplateProps) {
  const steps = [
    {
      step: 'Bước 01',
      title: 'Tư Vấn Chọn Xe & Lái Thử Trải Nghiệm',
      desc: 'Chuyên viên lắng nghe nhu cầu sử dụng, dự toán ngân sách và mang xe tới tận nơi để quý khách lái thử thực tế.',
    },
    {
      step: 'Bước 02',
      title: 'Báo Giá Lăn Bánh & Ưu Đãi Tiền Mặt',
      desc: 'Cung cấp bảng tính chi tiết lệ phí trước bạ, đăng ký biển số và các gói phụ kiện chính hãng tặng kèm.',
    },
    {
      step: 'Bước 03',
      title: 'Ký Hợp Đồng & Thẩm Định Hồ Sơ Trả Góp',
      desc: 'Ký hợp đồng mua bán minh bạch. Đối tác ngân hàng liên kết phê duyệt hồ sơ vay vốn trong vòng 24 giờ.',
    },
    {
      step: 'Bước 04',
      title: 'Kiểm Định PDI & Hoàn Tất Thủ Tục Bấm Biển',
      desc: 'Xe được kiểm tra 80 hạng mục kỹ thuật tiêu chuẩn PDI. Hỗ trợ bấm biển số đẹp và dán thẻ thu phí tự động.',
    },
    {
      step: 'Bước 05',
      title: 'Lễ Bàn Giao Xe Trang Trọng & Hậu Mãi',
      desc: 'Tổ chức lễ trao hoa nhận xe tại showroom hoặc giao xe tận nhà bằng xe chuyên dụng. Kích hoạt bảo hành điện tử.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 font-sans">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Quy Trình Chuẩn 5 Bước
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {page.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          {page.metaDescription || 'Minh bạch trong từng giao dịch, hỗ trợ trọn gói từ lúc chọn xe đến ngày lăn bánh an tâm.'}
        </p>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-blue-500/30 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
        {steps.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Dot Indicator */}
            <div className="absolute -left-[31px] sm:-left-[47px] top-1 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow flex items-center justify-center text-white text-xs font-bold">
              {idx + 1}
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 transition-all hover:shadow-md hover:border-blue-300">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{item.step}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
