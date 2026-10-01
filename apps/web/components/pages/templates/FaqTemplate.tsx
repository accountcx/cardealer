'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircleQuestion, PhoneCall } from 'lucide-react';
import type { StaticPage } from '@cardealer/types';

interface FaqTemplateProps {
  page: StaticPage;
}

// WHY: Template hỏi đáp thường gặp dạng Accordion tương tác mượt mà (FAQ / FAQPage).
// Trực tiếp hỗ trợ Google FAQ Rich Results và nâng cao trải nghiệm giải đáp thắc mắc khách hàng.
export function FaqTemplate({ page }: FaqTemplateProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Mua xe Hyundai trả góp tại Vinh cần chuẩn bị trước bao nhiêu tiền?',
      a: 'Quý khách chỉ cần chuẩn bị trước từ 15% đến 20% giá trị xe (khoảng 70 - 150 triệu tùy dòng xe). Phần còn lại ngân hàng sẽ giải ngân trực tiếp cho đại lý với lãi suất ưu đãi.',
    },
    {
      q: 'Thời gian bảo hành chính hãng của xe Hyundai là bao lâu?',
      a: 'Tất cả các dòng xe du lịch Hyundai do TC Motor phân phối tại Việt Nam đều được áp dụng chế độ bảo hành chính hãng 5 năm hoặc 100.000 km (tùy điều kiện nào đến trước).',
    },
    {
      q: 'Tôi có thể đăng ký lái thử xe tại nhà ở Nghệ An và Hà Tĩnh không?',
      a: 'Có. Showroom Hyundai Vinh hỗ trợ mang xe lái thử tận nhà hoàn toàn miễn phí cho khách hàng trên toàn địa bàn tỉnh Nghệ An và Hà Tĩnh. Quý khách chỉ cần liên hệ trước qua hotline.',
    },
    {
      q: 'Showroom có hỗ trợ dịch vụ đăng ký biển số và giao xe tận nhà không?',
      a: 'Đội ngũ chuyên viên sẽ hỗ trợ trọn gói thủ tục nộp thuế trước bạ, bấm biển số, đăng kiểm và vận chuyển xe bằng xe lồng chuyên dụng đến tận cửa nhà quý khách theo ngày giờ phong thủy.',
    },
    {
      q: 'Chi phí bảo dưỡng định kỳ các cấp của xe Hyundai khoảng bao nhiêu?',
      a: 'Chi phí bảo dưỡng cấp 5.000km khoảng 600.000đ - 900.000đ. Các cấp lớn hơn (20.000km, 40.000km) dao động từ 1.800.000đ đến 4.500.000đ tùy theo danh mục phụ tùng thay thế định kỳ.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 font-sans">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
          Trung Tâm Trợ Giúp & FAQ
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {page.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          {page.metaDescription || 'Giải đáp nhanh những câu hỏi phổ biến nhất của khách hàng về giá xe, trả góp và quy trình bảo hành.'}
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-slate-900 text-base hover:text-blue-600"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-blue-600 flex-shrink-0" />
                  {item.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Box liên hệ nếu chưa thỏa mãn */}
      <div className="p-8 rounded-2xl bg-blue-50 border border-blue-200/80 text-center space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">Bạn vẫn còn câu hỏi khác?</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Đội ngũ chuyên viên tư vấn của chúng tôi luôn túc trực 24/7 để giải đáp cụ thể theo từng trường hợp của bạn.
        </p>
        <a
          href="tel:0912345678"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
        >
          <PhoneCall size={16} /> Gọi Hotline 0912 345 678
        </a>
      </div>
    </div>
  );
}
