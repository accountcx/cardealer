'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { leadsService } from '../../../../services/leads.service';

export interface ContactFormProps {
  pageSlug: string;
  province?: string;
}

// WHY: Form tiếp nhận thông tin liên hệ và tư vấn (Lead CRM Ingestion).
// Tách từ ContactTemplate để tuân thủ quy tắc unit_size_limit (< 300 dòng).
export function ContactForm({ pageSlug, province = 'Nghệ An' }: ContactFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    notes: '',
    websiteUrl: '', // Honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInputPhone = formData.phone.replace(/\D/g, '');
    if (!/^(03|05|07|08|09)\d{8}$/.test(cleanInputPhone)) {
      setErrorMessage('Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số (bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    try {
      setSubmitting(true);
      await leadsService.createLead({
        fullName: formData.fullName.trim() || 'Khách hàng',
        phone: cleanInputPhone,
        notes: formData.notes.trim() || undefined,
        leadType: 'Liên Hệ',
        province,
        websiteUrl: formData.websiteUrl || undefined,
        metadata: {
          source: 'trang-lien-he',
          pageSlug,
          submittedAt: new Date().toISOString(),
        },
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gửi yêu cầu không thành công. Vui lòng thử lại hoặc gọi Hotline.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3 text-center">
        <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
        <h4 className="font-bold text-base">Gửi Yêu Cầu Thành Công!</h4>
        <p className="text-xs">
          Chuyên viên tư vấn sẽ liên hệ lại qua số điện thoại <strong>{formData.phone}</strong> trong ít phút.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({ fullName: '', phone: '', notes: '', websiteUrl: '' });
          }}
          className="mt-2 text-xs font-semibold text-emerald-700 hover:underline inline-block cursor-pointer"
        >
          Gửi thêm yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
      <h2 className="text-lg font-bold text-slate-900">Gửi Tin Nhắn Cho Chuyên Viên</h2>
      <p className="text-xs text-slate-500">Chúng tôi sẽ liên hệ lại qua điện thoại trong thời gian sớm nhất.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Honeypot field for spam prevention */}
        <input
          type="text"
          name="websiteUrl"
          tabIndex={-1}
          autoComplete="off"
          value={formData.websiteUrl}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          className="hidden"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Họ và tên của bạn <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Nguyễn Văn A"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Số điện thoại liên hệ <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0912 345 678"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung cần hỗ trợ</label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Tôi muốn được tư vấn giá lăn bánh dòng xe..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Đang gửi yêu cầu...
            </>
          ) : (
            <>
              <Send size={16} /> Gửi Yêu Cầu Tư Vấn
            </>
          )}
        </button>
      </form>
    </div>
  );
}
