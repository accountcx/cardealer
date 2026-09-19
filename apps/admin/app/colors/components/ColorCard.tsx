import React from 'react';
import { Edit3, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card, Button } from '@cardealer/ui';

export interface ColorItem {
  id: string;
  tenMau: string;
  hexCode: string;
  isTwoTone: boolean;
  secondaryHexCode?: string | null;
  swatchUrl?: string | null;
}

interface ColorCardProps {
  color: ColorItem;
  onEdit: (color: ColorItem) => void;
  onDelete: (id: string) => void;
}

// 🧠 Mental Model: Thẻ hiển thị mã màu sơn ngoại thất chuẩn màu hãng Hyundai theo SCHEMA.md.
// Hỗ trợ ảnh Swatch mẫu sơn thật, màu Two-Tone tương hỗ và đổ bóng kim loại sang trọng.
export const ColorCard: React.FC<ColorCardProps> = ({ color, onEdit, onDelete }) => {
  return (
    <Card
      variant="glass"
      className="overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl group flex flex-col justify-between bg-slate-900/80"
    >
      <div>
        {/* Glossy Automotive Paint Swatch */}
        <div
          className="h-28 w-full relative border-b border-white/10 overflow-hidden shadow-inner"
          style={{
            background:
              color.isTwoTone && color.secondaryHexCode
                ? `linear-gradient(135deg, ${color.hexCode} 55%, ${color.secondaryHexCode} 55%)`
                : color.hexCode,
          }}
        >
          {/* Subtle light reflection overlay for car paint gloss effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20 pointer-events-none" />

          {color.isTwoTone && (
            <div className="absolute top-3 right-3 z-10">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-md">
                Two-Tone
              </span>
            </div>
          )}

          {color.swatchUrl && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-sky-400 border border-white/10">
                <ImageIcon size={11} /> Swatch
              </span>
            </div>
          )}
        </div>

        {/* Info Body */}
        <div className="p-4 space-y-2.5">
          <h3 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2">
            {color.tenMau}
          </h3>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-white/5 w-fit">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm shrink-0"
              style={{ backgroundColor: color.hexCode }}
            />
            <span className="font-semibold text-slate-200">{color.hexCode}</span>

            {color.isTwoTone && color.secondaryHexCode && (
              <>
                <span className="text-slate-600">/</span>
                <span
                  className="inline-block w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm shrink-0"
                  style={{ backgroundColor: color.secondaryHexCode }}
                />
                <span className="font-semibold text-slate-200">{color.secondaryHexCode}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 mt-2 flex items-center justify-end gap-2 border-t border-white/5 pt-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(color)}
          leftIcon={<Edit3 size={13} />}
          className="text-xs font-semibold"
        >
          Sửa
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(color.id)}
          aria-label="Xóa mã màu"
          className="text-xs font-semibold px-2.5"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </Card>
  );
};
