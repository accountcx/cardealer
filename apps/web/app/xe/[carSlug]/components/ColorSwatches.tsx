'use client';

import React from 'react';
import type { VersionColor } from '@cardealer/types';
import { Check } from 'lucide-react';
import { Button } from '@cardealer/ui';

interface ColorSwatchesProps {
  colors: VersionColor[];
  selectedColorId: string | null;
  onSelectColor: (color: VersionColor) => void;
}

/**
 * 🧠 Mental Model: Bảng chọn chấm màu sơn xe thực tế (Tactile Color Swatches).
 * - Hỗ trợ sơn phối 2 màu (Two-tone roof/body) qua linear-gradient 135 độ.
 * - Hiệu ứng ánh kim bóng bẩy (Metallic gloss overlay).
 * - Tooltip hiển thị tên màu tiếng Việt chuẩn khi di chuột.
 * - Đảm bảo chuẩn tiếp cận WCAG 2.1 AA (role="radiogroup", role="radio", aria-checked).
 */
export function ColorSwatches({
  colors,
  selectedColorId,
  onSelectColor,
}: ColorSwatchesProps) {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Chọn màu sơn ngoại thất"
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 py-1.5"
    >
      {colors.map((color) => {
        const isSelected = selectedColorId === color.colorId;
        const backgroundStyle =
          color.isTwoTone && color.secondaryHexCode
            ? `linear-gradient(135deg, ${color.secondaryHexCode} 45%, ${color.hexCode} 45%)`
            : color.hexCode;

        return (
          <Button
            key={color.colorId}
            type="button"
            variant="ghost"
            size="icon"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectColor(color)}
            title={color.tenMau}
            className={`group relative w-7 h-7 sm:w-8 sm:h-8 rounded-full p-0 transition-transform duration-150 ease-in-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isSelected
                ? 'scale-115 ring-2 ring-blue-600 ring-offset-2 ring-offset-white shadow-sm'
                : 'hover:scale-110 border border-slate-300/80 shadow-2xs'
            }`}
            style={{
              background: backgroundStyle,
            }}
          >
            {/* Visual Gloss Highlight */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none" />

            {/* Checkmark icon for active swatch if selected */}
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Check
                  className={`w-4 h-4 drop-shadow ${
                    // Sử dụng icon màu tương phản dựa trên độ sáng cơ bản
                    color.hexCode.toLowerCase() === '#ffffff' || color.hexCode.toLowerCase() === '#f8fafc'
                      ? 'text-slate-900'
                      : 'text-white'
                  }`}
                />
              </span>
            )}

            {/* Micro-Tooltip hiển thị khi Hover */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg pointer-events-none transition-all">
              {color.tenMau}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
