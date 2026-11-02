'use client';

import React, { useState } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

export interface FooterMapFacadeProps {
  mapEmbedUrl: string;
  googleMapsUrl?: string;
}

// 🧠 Mental Model: Google Maps Facade Pattern tối ưu Core Web Vitals.
// Mặc định hiển thị thẻ Facade giao diện bản đồ thu nhỏ kèm ghim vị trí Showroom và nút hành động.
// Chỉ nhúng iframe Google Maps thực tế khi người dùng chủ động tương tác bấm "Xem bản đồ",
// giúp loại bỏ hoàn toàn 417 KiB JS và 292ms CPU lúc tải trang ban đầu (TBT & CPU Bottleneck Mitigation).
export const FooterMapFacade: React.FC<FooterMapFacadeProps> = ({
  mapEmbedUrl,
  googleMapsUrl,
}) => {
  const [isInteractive, setIsInteractive] = useState(false);

  if (isInteractive) {
    return (
      <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
        <iframe
          src={mapEmbedUrl}
          title="Vị trí Showroom Xe Hyundai Vinh"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative shadow-inner p-3 flex flex-col justify-between group">
      {/* Nền bản đồ đồ họa tinh tế */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0072CE_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      <div className="relative z-10 flex items-start gap-2">
        <div className="p-1.5 rounded-lg bg-[#0072CE]/20 text-[#0072CE] border border-[#0072CE]/30 shrink-0">
          <MapPin className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <p className="text-xs font-bold text-white tracking-wide">
            Showroom Hyundai Vinh
          </p>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Tp. Vinh, Tỉnh Nghệ An
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setIsInteractive(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#0072CE] hover:bg-[#005BA4] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Navigation className="w-3 h-3" />
          <span>Xem bản đồ</span>
        </button>

        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Mở Google Maps chỉ đường"
            aria-label="Mở Google Maps chỉ đường"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
