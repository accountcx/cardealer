'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button, useForm } from '@cardealer/ui';
import { leadsService } from '@/services/leads.service';
import {
  ShieldCheck,
  Car,
  Banknote,
  Gift,
  Clock,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Send,
  UserCheck,
} from 'lucide-react';

interface QuickTestDriveFormData {
  phone: string;
}

interface ConsultantTrustCardProps {
  salerName: string;
  hotline: string;
  zaloUrl: string;
  avatar?: string;
  carName: string;
  versionName: string;
  colorName?: string | null;
  onOpenLeadModal?: (type?: 'quote' | 'test-drive') => void;
}

/**
 * 🧠 Mental Model: Thẻ thương hiệu cá nhân của Saler (ConsultantTrustCard).
 * - Định vị: Website cá nhân của Chuyên viên tư vấn ô tô xuất sắc.
 * - Trưng bày 5 cam kết vàng đắt giá để xây dựng niềm tin tuyệt đối với người mua xe.
 * - Cung cấp các nút liên hệ 1 chạm: Gọi điện trực tiếp, Chat Zalo và Đăng ký lái thử tận nhà.
 */
export function ConsultantTrustCard({
  salerName,
  hotline,
  zaloUrl,
  avatar,
  carName,
  versionName,
  colorName,
  onOpenLeadModal,
}: ConsultantTrustCardProps) {
  const [testDriveSubmitted, setTestDriveSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickTestDriveFormData>({
    mode: 'onTouched',
  });

  const onSubmit = async (data: QuickTestDriveFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const cleanPhone = data.phone.trim().replace(/^\+84/, '0').replace(/\D/g, '');
      await leadsService.createLead({
        fullName: 'Khách hàng đăng ký lái thử',
        phone: cleanPhone,
        carModel: `${carName} ${versionName}`.trim(),
        carInterest: `${carName} ${versionName} ${colorName ? `(Màu ${colorName})` : ''}`.trim(),
        leadType: 'Lái Thử',
      });
      setTestDriveSubmitted(true);
      reset();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header: Chân dung & Thông tin Saler */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-blue-500/20 shrink-0 overflow-hidden">
          {avatar ? (
            <Image
              src={avatar}
              alt={salerName}
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <UserCheck className="w-8 h-8" />
          )}
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs z-10"
            title="Đang trực tuyến"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full inline-block">
            Chuyên Viên Tư Vấn Chính Hãng
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
            {salerName}
          </p>
          <p className="text-xs text-slate-600">
            Đồng hành & hỗ trợ quý khách từ tư vấn, lái thử đến ngày nhận xe
          </p>
        </div>
      </div>

      {/* Bộ 5 Cam Kết Vàng Bán Hàng */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900">Giá lăn bánh cạnh tranh nhất:</strong> Cam kết bảng
            tính rõ ràng, tối ưu mọi chi phí và ưu đãi tiền mặt tốt nhất.
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Car className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900">Lái thử tận nơi miễn phí:</strong> Em sẵn sàng mang
            xe {carName} đến tận cơ quan hoặc nhà riêng để anh/chị trải nghiệm.
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Banknote className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900">Hỗ trợ trả góp lên tới 85%:</strong> Liên kết các
            ngân hàng lớn, lãi suất ưu đãi, duyệt hồ sơ nhanh gọn trong 4 giờ.
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Gift className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900">Quà tặng phụ kiện cao cấp:</strong> Gói phim cách
            nhiệt chính hãng, thảm lót sàn da, camera hành trình từ cá nhân em {salerName}.
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900">Bàn giao xe đúng ngày giờ hoàng đạo:</strong> Xe
            được kiểm tra kỹ lưỡng, hỗ trợ giao xe tận nhà theo phong thủy của gia chủ.
          </span>
        </div>
      </div>

      {/* Form Nhanh: Đăng Ký Lái Thử Tận Nhà */}
      <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-blue-600" />
            Đăng ký lái thử {carName} tận nhà
          </span>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            Miễn phí 100%
          </span>
        </div>

        {testDriveSubmitted ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đã nhận yêu cầu lái thử!
            </p>
            <p className="text-[11px] text-emerald-700">
              Em {salerName} sẽ gọi lại cho quý khách trong ít phút để sắp xếp lịch xe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Nhập số điện thoại của anh/chị..."
                {...register('phone', {
                  required: 'Vui lòng nhập số điện thoại',
                  pattern: {
                    value: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                    message: 'Số điện thoại không hợp lệ (VD: 0981234567)',
                  },
                })}
                className="flex-1 min-w-0 h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 shadow-sm"
              >
                <Send className="w-3 h-3 mr-1" />
                Gửi Ngay
              </Button>
            </div>
            {errors.phone && (
              <p className="text-[11px] text-rose-600 font-medium pl-1">
                {errors.phone.message}
              </p>
            )}
            {submitError && (
              <p className="text-[11px] text-rose-600 font-medium pl-1">
                {submitError}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Nút Hành Động Trực Tiếp (Gọi điện & Chat Zalo) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          asChild
          size="lg"
          className="h-12 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all motion-reduce:transition-none border-0"
        >
          <a
            href={`tel:${hotline.replace(/\D/g, '')}`}
            className="inline-flex items-center justify-center"
          >
            <PhoneCall className="w-4 h-4 mr-1.5" />
            Gọi Em ({hotline})
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          className="h-12 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all motion-reduce:transition-none border-0"
        >
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Chat Zalo Báo Giá
          </a>
        </Button>
      </div>
    </div>
  );
}
