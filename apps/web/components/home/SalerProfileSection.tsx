import React from 'react';
import { Shield, Truck, Clock, Landmark, PhoneCall, MessageCircle, Star, Award, CheckCircle2, Building2, MapPin } from 'lucide-react';
import type { SalerShowroomConfig } from '@cardealer/types';
import { sanitizePhoneNumber, normalizeZaloUrl } from '@cardealer/types';

export interface SalerProfileSectionProps {
  config: SalerShowroomConfig;
  hotline?: string;
  zalo?: string;
}

const COMMITMENT_ICONS: Record<string, React.ElementType> = {
  bank: Landmark,
  truck: Truck,
  shield: Shield,
  clock: Clock,
};

// 🧠 Mental Model: Phân khu 3 - VIP Showroom / Hồ Sơ Chuyên Viên Tư Vấn.
// 1. Áp dụng Graceful Degradation: Nếu config.enabled = false ➡️ return null.
// 2. Chế độ linh hoạt config.mode:
//    - 'saler': Hồ sơ cá nhân VIP Business Card của chuyên viên tư vấn bán hàng.
//    - 'showroom': Hồ sơ năng lực Showroom Đại lý chuẩn 3S toàn cầu GDSI.
// 3. Xây dựng niềm tin với khách mua xe qua 4 Cam kết vàng và thông tin liên hệ minh bạch.
export const SalerProfileSection: React.FC<SalerProfileSectionProps> = ({
  config,
  hotline = '0981.234.567',
  zalo = '0981.234.567',
}) => {
  if (!config || !config.enabled) return null;

  const cleanPhone = sanitizePhoneNumber(hotline);
  const cleanZalo = normalizeZaloUrl(zalo);
  const isShowroom = config.mode === 'showroom';

  return (
    <section className="py-12 sm:py-16 bg-slate-50 relative overflow-hidden border-t border-b border-slate-200/60" aria-label={isShowroom ? 'Cam Kết Đại Lý Showroom 3S' : 'Cam Kết Chuyên Viên Tư Vấn'}>
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0072CE]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2.5">
          {isShowroom ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-[#002C6C] text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-[#0072CE]" />
              <span>{config.showroomBadge || 'Hệ Thống Phân Phối Chính Hãng — Tiêu Chuẩn 3S Toàn Cầu'}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Đồng Hành Tận Tâm — Dịch Vụ Chuẩn 5 Sao</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {config.headline}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            {config.subheadline}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Cột Trái: Chế độ Showroom 3S HOẶC Hồ Sơ Tư Vấn Viên (VIP Business Card) */}
          {isShowroom ? (
            <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50">
              <div className="space-y-5">
                {/* Showroom Photo / Banner */}
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 group">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${config.galleryImages?.[0] || '/images/banners/hero-event.webp'})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      {config.showroomBadge || 'Chuẩn 3S GDSI'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                      <span className="text-slate-200 font-semibold ml-1 text-[11px]">5.0</span>
                    </div>
                  </div>
                </div>

                {/* Showroom Titles & Address */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {config.showroomName || 'Hyundai Vinh — Đại Lý Ủy Quyền Chuẩn 3S'}
                  </h3>
                  <div className="flex items-start gap-2 mt-2 text-xs sm:text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-[#0072CE] shrink-0 mt-0.5" />
                    <span>{config.showroomAddress || 'Km 3+500 Đại Lộ Lê Nin, TP. Vinh, Nghệ An'}</span>
                  </div>
                  {config.showroomExperience && (
                    <p className="text-xs text-[#002C6C] font-semibold mt-1 pl-6">
                      {config.showroomExperience}
                    </p>
                  )}
                </div>

                <blockquote className="p-3.5 rounded-2xl bg-slate-50 border-l-4 border-[#002C6C] text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{config.showroomIntro || config.introStory}"
                </blockquote>

                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kho xe lớn nhất miền Trung — Đầy đủ phiên bản giao ngay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Xưởng dịch vụ kỹ thuật cao & phòng chờ thương gia VIP</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-slate-100">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#002C6C]/20 transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Hotline Đại Lý</span>
                </a>
                <a
                  href={cleanZalo || `https://zalo.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0072CE] text-xs sm:text-sm font-bold border border-sky-200 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#0072CE]" />
                  <span>Báo Giá Lăn Bánh</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#002C6C] to-[#0072CE] border-2 border-white shadow-md flex-shrink-0 ring-2 ring-sky-200">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${config.avatarUrl || '/images/saler-avatar.webp'})` }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">{config.salerName}</h3>
                    <p className="text-xs sm:text-sm text-[#0072CE] font-bold mt-0.5">{config.salerTitle}</p>
                    <div className="flex items-center gap-1 mt-1 text-amber-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                      <span className="text-slate-500 font-semibold ml-1.5 text-[11px]">Đánh giá 5.0 (200+ khách hàng)</span>
                    </div>
                  </div>
                </div>

                <blockquote className="p-4 rounded-2xl bg-slate-50 border-l-4 border-[#002C6C] text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{config.introStory}"
                </blockquote>

                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cam kết giá lăn bánh cạnh tranh nhất miền Trung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sẵn sàng mang xe tới tận nhà để quý khách lái thử</span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-slate-100">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#002C6C] hover:bg-[#001D48] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#002C6C]/20 transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Gọi Ngay</span>
                </a>
                <a
                  href={cleanZalo || `https://zalo.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0072CE] text-xs sm:text-sm font-bold border border-sky-200 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#0072CE]" />
                  <span>Chat Zalo</span>
                </a>
              </div>
            </div>
          )}

          {/* Cột Phải: 4 Cam Kết Vàng (7 / 12) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.commitments.map((c, index) => {
              const Icon = COMMITMENT_ICONS[c.icon] || Shield;
              return (
                <div
                  key={c.id || index}
                  className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0072CE] mb-4 group-hover:scale-110 group-hover:bg-[#002C6C] group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#002C6C] transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
