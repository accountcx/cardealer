import React, { useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Modal, LeadQuoteForm, type LeadQuoteFormData } from '@cardealer/ui';
import { leadsService } from '../../services/leads.service';
import { AppError } from '../../lib/api-client';

export interface LeadQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  carTitle?: string;
}

// 🧠 Mental Model: Modal thu thập Lead báo giá nhanh từ Header CTA và StickyBar CTA.
// Tiêu thụ Modal và LeadQuoteForm chuẩn hóa từ @cardealer/ui (sử dụng react-hook-form & Shadcn UI Primitives).
export const LeadQuoteModal = ({ isOpen, onClose, carTitle }: LeadQuoteModalProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: LeadQuoteFormData) => {
    setError(null);
    setLoading(true);

    try {
      const cleanPhone = data.phone.trim().replace(/^\+84/, '0').replace(/\D/g, '');

      await leadsService.createLead({
        fullName: data.fullName.trim(),
        phone: cleanPhone,
        carModel: carTitle || 'Tư vấn báo giá xe Hyundai',
        carInterest: carTitle || 'Tư vấn báo giá xe Hyundai',
        leadType: 'Báo Giá',
      });

      setSubmittedPhone(cleanPhone);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof AppError && err.statusCode === 429) {
        setError('Quý khách đã gửi yêu cầu gần đây. Vui lòng chờ 10 phút hoặc gọi trực tiếp Hotline!');
      } else {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi thông tin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="light"
      className="max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl z-[60]"
      title={
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0072CE] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ưu Đãi Đặc Quyền Tháng Này</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            Nhận Báo Giá & Ưu Đãi Lăn Bánh
          </h3>
        </div>
      }
      description={
        carTitle ? `Dòng xe: ${carTitle}` : 'Chuyên viên Hyundai Vinh sẽ liên hệ gửi bảng giá chi tiết trong 5 phút.'
      }
    >
      {success ? (
        <div className="py-8 text-center space-y-3 animate-in fade-in duration-300">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Gửi Yêu Cầu Thành Công!</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Cảm ơn anh/chị. Chuyên viên tư vấn Hyundai Vinh sẽ liên hệ qua số <strong>{submittedPhone}</strong> ngay ạ.
          </p>
        </div>
      ) : (
        <LeadQuoteForm
          onSubmit={handleFormSubmit}
          loading={loading}
          error={error}
        />
      )}
    </Modal>
  );
};
