'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import type { StaticPage } from '@cardealer/types';
import type { AutoDealerInfo } from '@cardealer/core';

interface ContactTemplateProps {
  page: StaticPage;
  dealerInfo?: AutoDealerInfo;
}

// WHY: Template thông tin liên hệ & bản đồ Showroom (CONTACT / ContactPage).
// Cung cấp thông tin địa chỉ NAP (Name, Address, Phone) chuẩn SEO Local Business từ Cấu hình Showroom tập trung.
export function ContactTemplate({ page, dealerInfo }: ContactTemplateProps) {
  const showroomName = dealerInfo?.name || 'Showroom Hyundai Vinh';
  const address = dealerInfo?.address?.streetAddress || 'Km 3+500 Đại lộ Lê Nin, Xã Nghi Phú, TP. Vinh, Nghệ An';
  const phone = dealerInfo?.telephone || '0981.234.567';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 font-sans">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Kết Nối Với Chúng Tôi
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {page.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          {page.metaDescription || `${showroomName} luôn sẵn sàng đón tiếp quý khách lái thử, bảo dưỡng và tư vấn mua xe 7 ngày trong tuần.`}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Thông tin liên hệ */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              {showroomName}
            </h2>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="font-bold block text-slate-900 text-sm">Địa Chỉ Showroom</span>
                  <span>{address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="font-bold block text-slate-900 text-sm">Hotline Kinh Doanh</span>
                  <a href={`tel:${cleanPhone}`} className="text-blue-600 font-semibold hover:underline">
                    {phone} (24/7)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="font-bold block text-slate-900 text-sm">Hòm Thư Điện Tử</span>
                  <span>hotro@xehyundaivinh.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="font-bold block text-slate-900 text-sm">Giờ Mở Cửa</span>
                  <span>Thứ 2 - Chủ Nhật: 08:00 - 18:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form liên hệ nhanh */}
        <div className="md:col-span-7">
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Gửi Tin Nhắn Cho Showroom</h2>
            <p className="text-xs text-slate-500">Chúng tôi sẽ liên hệ lại qua điện thoại trong vòng 15 phút.</p>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <h4 className="font-bold text-base">Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-xs">Chuyên viên tư vấn sẽ liên hệ lại qua số điện thoại của bạn ngay.</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên của bạn</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung cần hỗ trợ</label>
                  <textarea
                    rows={4}
                    placeholder="Tôi muốn lái thử Hyundai Santa Fe vào cuối tuần này..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Send size={16} /> Gửi Yêu Cầu Tư Vấn
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
