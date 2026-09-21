'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, PhoneCall, Send, Sparkles } from 'lucide-react';

export interface LeadQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  carTitle?: string;
}

// 🧠 Mental Model: Modal thu thập Lead báo giá nhanh từ Header CTA và StickyBar CTA.
// 1. Kiểm tra số điện thoại chuẩn 10 số di động Việt Nam.
// 2. Gửi về POST /api/leads với tag 'Báo Giá Nhanh'.
export const LeadQuoteModal = ({ isOpen, onClose, carTitle }: LeadQuoteModalProps) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          carInterest: carTitle || 'Tư vấn báo giá xe Hyundai',
          leadType: 'Báo Giá Nhanh',
        }),
      });

      if (!res.ok) {
        throw new Error('Không thể gửi yêu cầu, vui lòng thử lại');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFullName('');
        setPhone('');
        onClose();
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200 motion-reduce:animate-none space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0072CE] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ưu Đãi Đặc Quyền Tháng Này</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Nhận Báo Giá & Ưu Đãi Lăn Bánh
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {carTitle ? `Dòng xe: ${carTitle}` : 'Chuyên viên Hyundai Vinh sẽ liên hệ gửi bảng giá chi tiết trong 5 phút.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Gửi Yêu Cầu Thành Công!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Cảm ơn anh/chị. Chuyên viên tư vấn Hyundai Vinh sẽ liên hệ qua số <strong>{phone}</strong> ngay ạ.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên Quý Khách *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Điện Thoại Nhận Báo Giá *
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0981234567 (10 chữ số)"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#002C6C] hover:bg-[#001D48] text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Đang gửi thông tin...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Gửi Yêu Cầu Nhận Báo Giá Ngay</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
