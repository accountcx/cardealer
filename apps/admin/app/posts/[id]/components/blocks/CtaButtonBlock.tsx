'use client';

// 🧠 Mental Model: Khối Nút Kêu Gọi Hành Động Đơn Lẻ (CtaButtonBlock).
// 1. Lựa chọn màu sắc nhận diện: Đỏ nổi bật (Hotline), Xanh dương (Báo giá), Xanh ngọc (Zalo).
// 2. Lựa chọn hành vi click: Gọi Hotline trực tiếp, Chat Zalo OA, Cuộn form báo giá, Link URL ngoài.
// 3. Hiển thị khung xem trước (Live Preview Button) phản chiếu chính xác màu sắc và hiệu ứng trên web người dùng.

import React from 'react';
import { MousePointerClick } from 'lucide-react';
import { Input, Select } from '@cardealer/ui';
import type { EditorBlock } from '../../types';

export interface CtaButtonBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function CtaButtonBlock({ block, onUpdate }: CtaButtonBlockProps) {
  return (
    <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-xl border border-rose-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
          <MousePointerClick size={14} /> Nút Kêu Gọi Hành Động Đơn Lẻ (CTA Button)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Màu sắc:</span>
          {(['red', 'blue', 'emerald'] as const).map((clr) => (
            <button
              key={clr}
              type="button"
              onClick={() => onUpdate({ ctaVariant: clr })}
              className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                clr === 'red' ? 'bg-red-600' : clr === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'
              } ${
                block.ctaVariant === clr
                  ? 'scale-125 border-white ring-2 ring-white/30'
                  : 'border-transparent opacity-60'
              }`}
              title={
                clr === 'red'
                  ? 'Đỏ nổi bật (Hotline)'
                  : clr === 'blue'
                    ? 'Xanh dương (Báo giá)'
                    : 'Xanh ngọc (Zalo)'
              }
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
            Nhãn nút (Button Text) *
          </label>
          <Input
            value={block.ctaButtonText || ''}
            onChange={(e) => onUpdate({ ctaButtonText: e.target.value })}
            placeholder="Ví dụ: Gọi Hotline Ngay hoặc Chat Zalo Nhận Báo Giá"
            className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
            Hành động khi click
          </label>
          <Select
            variant="dark"
            options={[
              { value: 'hotline', label: '📞 Gọi Hotline trực tiếp (tel:)' },
              { value: 'zalo', label: '💬 Mở Zalo OA Chat' },
              { value: 'quoteForm', label: '📋 Cuộn xuống Form báo giá lăn bánh' },
              { value: 'customLink', label: '🔗 Mở liên kết tuỳ chỉnh (URL ngoài)' },
            ]}
            value={block.ctaActionType || 'hotline'}
            onChange={(e) =>
              onUpdate({
                ctaActionType: e.target.value as 'hotline' | 'zalo' | 'quoteForm' | 'customLink',
              })
            }
            className="h-10 bg-slate-950 border-white/10 text-slate-200 text-xs"
          />
        </div>

        {block.ctaActionType === 'hotline' && (
          <div className="md:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">
              Số Hotline gọi tới (Tùy chọn)
            </label>
            <Input
              value={block.ctaPhone || ''}
              onChange={(e) => onUpdate({ ctaPhone: e.target.value })}
              placeholder="Để trống sẽ tự động lấy Hotline Bán Hàng trong Cài Đặt..."
              className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              💡 Để trống để tự động dùng Hotline Bán Hàng được cấu hình trong Cài Đặt Hệ Thống.
            </p>
          </div>
        )}

        {block.ctaActionType === 'zalo' && (
          <div className="md:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">
              Số Zalo nhận tin nhắn (Tùy chọn)
            </label>
            <Input
              value={block.ctaPhone || ''}
              onChange={(e) => onUpdate({ ctaPhone: e.target.value })}
              placeholder="Để trống sẽ tự động lấy Số Zalo Showroom trong Cài Đặt..."
              className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              💡 Để trống để tự động dùng Số Zalo được cấu hình trong Cài Đặt Hệ Thống.
            </p>
          </div>
        )}

        {block.ctaActionType === 'customLink' && (
          <div className="md:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">
              Đường dẫn liên kết tuỳ chỉnh *
            </label>
            <Input
              value={block.ctaCustomUrl || ''}
              onChange={(e) => onUpdate({ ctaCustomUrl: e.target.value })}
              placeholder="https://..."
              className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-mono"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
            Dòng phụ chú dưới nút (Tùy chọn)
          </label>
          <Input
            value={block.ctaSubtext || ''}
            onChange={(e) => onUpdate({ ctaSubtext: e.target.value })}
            placeholder="Ví dụ: Hỗ trợ tư vấn 24/7 - Báo giá lăn bánh giảm tiền mặt trực tiếp"
            className="h-9 bg-slate-950 border-white/10 text-slate-300 text-xs"
          />
        </div>
      </div>

      {/* Live Preview Button */}
      <div className="pt-2 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-white/5">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-mono">
          Xem trước trên Web:
        </span>
        <div
          className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg cursor-pointer ${
            block.ctaVariant === 'blue'
              ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 shadow-blue-500/25'
              : block.ctaVariant === 'emerald'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-500/25'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-red-500/25'
          }`}
        >
          {block.ctaButtonText || 'Gọi Hotline Tư Vấn Ngay'}
        </div>
        {block.ctaSubtext && (
          <span className="text-[11px] text-slate-400 mt-1 italic">{block.ctaSubtext}</span>
        )}
      </div>
    </div>
  );
}
