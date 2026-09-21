'use client';

import React from 'react';
import { Camera, MapPin, Quote, Sparkles } from 'lucide-react';
import type { DeliveryStoriesZoneConfig } from '@cardealer/types';

export interface DeliveryStoriesSectionProps {
  config: DeliveryStoriesZoneConfig;
}

// 🧠 Mental Model: Phân khu 5 - Testimonials & Delivery Stories (Khoảnh Khắc Bàn Giao Xe).
// 1. Áp dụng Graceful Degradation: Nếu config.enabled = false HOẶC danh sách stories rỗng ➡️ return null hoàn toàn.
// 2. Bằng chứng xã hội thực tế (Social Proof) người thật - việc thật giúp tăng mạnh tỷ lệ chuyển đổi cọc xe.
export const DeliveryStoriesSection: React.FC<DeliveryStoriesSectionProps> = ({ config }) => {
  if (!config || !config.enabled || !config.stories || config.stories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-slate-50 relative overflow-hidden border-t border-b border-slate-200/60" aria-label="Khách Hàng Nhận Xe Thực Tế">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>Người Thật Việc Thật — Bàn Giao Tận Tay</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {config.headline}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {config.subheadline}
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {config.stories.map((story) => (
            <div
              key={story.id}
              className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Handover Frame */}
                <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${story.imageUrl || '/images/delivery/default.webp'})` }}
                  />
                  
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/95 backdrop-blur shadow-sm border border-slate-200/60 text-slate-800 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#0072CE]" />
                    <span>{story.location}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#002C6C] transition-colors">
                      {story.customerName}
                    </h3>
                    <p className="text-xs font-bold text-[#0072CE] mt-0.5">
                      {story.carModel}
                    </p>
                  </div>

                  {story.quote && (
                    <blockquote className="text-xs sm:text-sm text-slate-600 italic leading-relaxed relative pl-3.5 border-l-2 border-[#002C6C] bg-slate-50 p-3 rounded-r-xl">
                      "{story.quote}"
                    </blockquote>
                  )}
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 text-[11px] text-slate-400 font-medium">
                Bàn giao: {story.deliveryDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
