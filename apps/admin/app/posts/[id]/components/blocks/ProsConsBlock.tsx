'use client';

// 🧠 Mental Model: Khối Đánh Giá Ưu Điểm & Nhược Điểm (ProsConsBlock).
// Cấu trúc 2 cột đối xứng: Cột Xanh (Ưu điểm) và Cột Đỏ (Nhược điểm).
// Hỗ trợ tối ưu hóa hiển thị Featured Snippet trên kết quả tìm kiếm Google.

import React from 'react';
import { Scale, ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { Button, Input } from '@cardealer/ui';
import type { EditorBlock } from '../../types';

export interface ProsConsBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function ProsConsBlock({ block, onUpdate }: ProsConsBlockProps) {
  const pros = block.pros || [];
  const cons = block.cons || [];

  const handleAddPro = () => {
    onUpdate({ pros: [...pros, ''] });
  };

  const handleRemovePro = (index: number) => {
    const nextPros = [...pros];
    nextPros.splice(index, 1);
    onUpdate({ pros: nextPros });
  };

  const handleUpdatePro = (index: number, value: string) => {
    const nextPros = [...pros];
    nextPros[index] = value;
    onUpdate({ pros: nextPros });
  };

  const handleAddCon = () => {
    onUpdate({ cons: [...cons, ''] });
  };

  const handleRemoveCon = (index: number) => {
    const nextCons = [...cons];
    nextCons.splice(index, 1);
    onUpdate({ cons: nextCons });
  };

  const handleUpdateCon = (index: number, value: string) => {
    const nextCons = [...cons];
    nextCons[index] = value;
    onUpdate({ cons: nextCons });
  };

  return (
    <div className="space-y-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-emerald-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <Scale size={14} /> Khối Đánh Giá Ưu & Nhược Điểm (Featured Snippet)
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tiêu đề khối</label>
        <Input
          value={block.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ví dụ: Đánh Giá Ưu Điểm & Nhược Điểm Xe..."
          className="h-10 bg-slate-950 border-white/10 text-slate-100 text-xs font-semibold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Cột Xanh: Ưu điểm */}
        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ThumbsUp size={13} /> Ưu Điểm ({pros.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddPro}
              className="h-6 text-[11px] text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 px-2 rounded flex items-center gap-1 border border-emerald-500/30"
            >
              <Plus size={11} /> Thêm ưu điểm
            </Button>
          </div>

          <div className="space-y-2">
            {pros.map((pro, pIdx) => (
              <div key={pIdx} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={pro}
                  onChange={(e) => handleUpdatePro(pIdx, e.target.value)}
                  placeholder="Nhập ưu điểm nổi bật..."
                  className="bg-slate-950 border border-white/10 rounded-md px-2.5 py-1 text-xs text-slate-200 flex-1 focus:outline-none focus:border-emerald-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePro(pIdx)}
                  className="h-6 w-6 text-slate-500 hover:text-red-400 p-0"
                  title="Xóa dòng này"
                >
                  <X size={13} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Cột Đỏ: Nhược điểm */}
        <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <ThumbsDown size={13} /> Nhược Điểm ({cons.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddCon}
              className="h-6 text-[11px] text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 px-2 rounded flex items-center gap-1 border border-rose-500/30"
            >
              <Plus size={11} /> Thêm nhược điểm
            </Button>
          </div>

          <div className="space-y-2">
            {cons.map((con, cIdx) => (
              <div key={cIdx} className="flex items-center gap-1.5">
                <AlertCircle size={13} className="text-rose-400 shrink-0" />
                <input
                  type="text"
                  value={con}
                  onChange={(e) => handleUpdateCon(cIdx, e.target.value)}
                  placeholder="Nhập điểm cần cải thiện..."
                  className="bg-slate-950 border border-white/10 rounded-md px-2.5 py-1 text-xs text-slate-200 flex-1 focus:outline-none focus:border-rose-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCon(cIdx)}
                  className="h-6 w-6 text-slate-500 hover:text-red-400 p-0"
                  title="Xóa dòng này"
                >
                  <X size={13} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
