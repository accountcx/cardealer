'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { VersionColor } from '@cardealer/types';
import { Sparkles } from 'lucide-react';

import { ColorSwatches } from './ColorSwatches';

interface CarHeroExperienceProps {
  carName: string;
  versionName: string;
  currentColor: VersionColor | null;
  fallbackImage: string;
  availableColors?: VersionColor[];
  onSelectColor?: (color: VersionColor) => void;
}

/**
 * 🧠 Mental Model: Luxury Studio Stage hiển thị ngoại thất xe (CarHeroExperience).
 * - Tỷ lệ khung hình chuẩn 16:10 cố định (CLS = 0) chống giật khung.
 * - LCP Priority: nạp ảnh chất lượng cao đầu tiên với priority={true} và sizes chuẩn.
 * - Studio Radial Stage Glow và Ambient Tire Shadow dưới gầm bánh xe tạo độ sâu chân thực.
 * - Tích hợp cụm chấm chọn màu sơn ngoại thất xúc giác (28-32px) ngay dưới chân ảnh xe.
 * - Hiệu ứng chuyển màu cross-fade nhẹ nhàng (< 100ms) kết hợp với memory cache.
 */
export function CarHeroExperience({
  carName,
  versionName,
  currentColor,
  fallbackImage,
  availableColors = [],
  onSelectColor,
}: CarHeroExperienceProps) {
  const displayImage = currentColor?.anhXeTheoMauUrl || fallbackImage;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeImageSrc, setActiveImageSrc] = useState(displayImage);

  // Hiệu ứng chuyển ảnh khi đổi màu
  useEffect(() => {
    if (displayImage !== activeImageSrc) {
      setImageLoaded(false);
      setActiveImageSrc(displayImage);
    }
  }, [displayImage, activeImageSrc]);

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-slate-100/90 via-slate-50/50 to-white border border-slate-200/80 p-4 sm:p-7 overflow-hidden shadow-sm">
      {/* Studio Radial Stage Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-[16/10] bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Badge định danh phiên bản & trạng thái */}
      <div className="relative z-10 flex items-center justify-between mb-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-300"
            style={{
              background:
                currentColor?.isTwoTone && currentColor?.secondaryHexCode
                  ? `linear-gradient(135deg, ${currentColor.secondaryHexCode} 50%, ${currentColor.hexCode} 50%)`
                  : currentColor?.hexCode || '#FFFFFF',
            }}
          />
          {currentColor ? currentColor.tenMau : 'Màu tiêu chuẩn'}
        </span>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Phiên bản {versionName}
        </span>
      </div>

      {/* Hero Car Image Container (Tỷ lệ vàng 16:10, CLS = 0) */}
      <div className="relative w-full aspect-[16/10] max-h-[460px] mx-auto flex items-center justify-center">
        <Image
          src={activeImageSrc}
          alt={`${carName} ${versionName} - Màu ${currentColor?.tenMau || 'ngoại thất'}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 750px"
          className={`object-contain transition-opacity duration-200 ease-in-out motion-reduce:transition-none ${
            imageLoaded ? 'opacity-100' : 'opacity-85'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Realistic Ambient Tire Floor Shadow */}
        <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-slate-950/20 blur-xl rounded-full pointer-events-none" />
      </div>

      {/* 🎨 Interactive Tactile Color Swatches Area (Gắn trực tiếp dưới chân ảnh xe) */}
      <div className="text-center pt-2 sm:pt-3 space-y-1 relative z-10">
        <p className="text-xs text-slate-600 font-medium">
          Màu sơn ngoại thất:{' '}
          <span className="font-extrabold text-blue-900">
            {currentColor ? currentColor.tenMau : 'Trắng Ngọc Trai'}
          </span>
        </p>

        {availableColors.length > 0 && onSelectColor && (
          <ColorSwatches
            colors={availableColors}
            selectedColorId={currentColor?.colorId || null}
            onSelectColor={onSelectColor}
          />
        )}
      </div>
    </div>
  );
}
