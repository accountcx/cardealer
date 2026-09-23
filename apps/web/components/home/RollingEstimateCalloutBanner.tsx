'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { RollingEstimateCalloutConfig } from '@cardealer/types';
import { useHomeFilter } from './HomeFilterContext';

export interface RollingEstimateCalloutBannerProps {
  config?: RollingEstimateCalloutConfig;
  hotline?: string;
}

// 🧠 Mental Model: Phân khu 4 - Banner Mồi Câu Dẫn Về Trang Tính Giá (Lead Magnet Callout).
// Đặt ngay sau danh sách xe bán chạy (Khu 3):
// 1. Đánh trúng tâm lý tò mò chi phí thực tế sau khi trừ khuyến mại độc quyền.
// 2. Toàn quyền tùy biến nội dung qua Admin Portal (Homepage Funnel Settings).
// 3. Tự động mang theo query param phân khúc / mức giá đang chọn sang /gia-lan-banh.
// 4. Tuân thủ Graceful Degradation: Tự động ẩn nếu admin tắt công tắc bật/tắt.
export const RollingEstimateCalloutBanner: React.FC<RollingEstimateCalloutBannerProps> = ({
  config,
  hotline = '0981.234.567',
}) => {
  const filterContext = useHomeFilter();

  if (config && !config.enabled) return null;

  const badgeText = config?.badgeText || 'Minh Bạch Giá — Không Chi Phí Ẩn';
  const headline =
    config?.headline ||
    'Bạn muốn biết giá lăn bánh chính xác tại TP. Vinh hoặc các huyện Nghệ An sau khi trừ hết khuyến mại tiền mặt?';
  const description =
    config?.description ||
    'Dự toán trọn gói biểu phí nhà nước (thuế trước bạ 10%, biển số, đăng kiểm, đường bộ) kèm gói quà tặng phụ kiện chính hãng & ưu đãi tiền mặt độc quyền tại Showroom trong tháng 09/2026.';
  const buttonText = config?.buttonText || 'Dự Toán Lăn Bánh Tức Thì (Bước 1/2)';
  const commitments = config?.commitments || [
    'Biểu phí chuẩn 100%',
    'Trừ khuyến mại đại lý',
    'Dự toán vay góp 24h',
  ];

  const selectedSegment = filterContext?.selectedSegment || 'all';
  const selectedPrice = filterContext?.selectedPrice || 'all';

  // Xây dựng URL đích kèm tham số đang chọn
  const buildCalculatorUrl = () => {
    const params = new URLSearchParams();
    if (selectedSegment !== 'all') params.set('segment', selectedSegment);
    if (selectedPrice !== 'all') params.set('budget', selectedPrice);
    const qs = params.toString();
    return qs ? `/gia-lan-banh?${qs}` : '/gia-lan-banh';
  };

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#00173B] via-[#002C6C] to-[#00173B] text-white p-6 sm:p-10 lg:p-12 shadow-2xl shadow-blue-950/30 border border-blue-900/60">
          {/* Background Glow Decors */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left Content Column */}
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-sky-300 text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{badgeText}</span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                {headline}
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-normal">
                {description}
              </p>

              {/* Cam kết nhanh */}
              {commitments && commitments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {commitments.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-sky-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Action Column */}
            <div className="lg:shrink-0 flex flex-col items-stretch sm:items-center lg:items-end gap-3.5">
              <Button
                asChild
                className="h-13 sm:h-14 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.99] border-0 flex items-center justify-center gap-2.5 cursor-pointer w-full sm:w-auto"
              >
                <Link href={buildCalculatorUrl()}>
                  <Calculator className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Hoặc gọi chuyên viên tư vấn: <strong className="text-white font-bold">{hotline}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
