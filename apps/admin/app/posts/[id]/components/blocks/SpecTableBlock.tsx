'use client';

// 🧠 Mental Model: Khối Bảng So Sánh Thông Số Kỹ Thuật (SpecTableBlock).
// Trình soạn thảo dạng Spreadsheet Matrix: Các cột là Phiên bản xe, các dòng là Thông số.
// Hỗ trợ thêm/xóa cột phiên bản, thêm/xóa/sắp xếp hàng thông số kỹ thuật.

import React from 'react';
import { SlidersHorizontal, Plus, ChevronUp, ChevronDown, GripVertical, Trash2, X } from 'lucide-react';
import { Button, Input } from '@cardealer/ui';
import type { EditorBlock } from '../../types';

export interface SpecTableBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function SpecTableBlock({ block, onUpdate }: SpecTableBlockProps) {
  const specVersions = block.specVersions || [];
  const specRows = block.specRows || [];

  const handleAddColumn = () => {
    const newVerIndex = specVersions.length + 1;
    const nextVersions = [...specVersions, `Phiên bản #${newVerIndex}`];
    const nextRows = specRows.map((r) => ({
      ...r,
      values: [...r.values, ''],
    }));
    onUpdate({ specVersions: nextVersions, specRows: nextRows });
  };

  const handleRemoveColumn = (vIdx: number) => {
    const nextVersions = [...specVersions];
    nextVersions.splice(vIdx, 1);
    const nextRows = specRows.map((r) => {
      const nextVals = [...r.values];
      nextVals.splice(vIdx, 1);
      return { ...r, values: nextVals };
    });
    onUpdate({ specVersions: nextVersions, specRows: nextRows });
  };

  const handleUpdateColumnName = (vIdx: number, value: string) => {
    const nextVersions = [...specVersions];
    nextVersions[vIdx] = value;
    onUpdate({ specVersions: nextVersions });
  };

  const handleAddRow = () => {
    const verCount = specVersions.length || 2;
    onUpdate({
      specRows: [...specRows, { specName: '', values: Array(verCount).fill('') }],
    });
  };

  const handleRemoveRow = (rIdx: number) => {
    const nextRows = [...specRows];
    nextRows.splice(rIdx, 1);
    onUpdate({ specRows: nextRows });
  };

  const handleMoveRow = (rIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? rIdx - 1 : rIdx + 1;
    if (targetIdx < 0 || targetIdx >= specRows.length) return;
    const nextRows = [...specRows];
    const temp = nextRows[rIdx];
    nextRows[rIdx] = nextRows[targetIdx];
    nextRows[targetIdx] = temp;
    onUpdate({ specRows: nextRows });
  };

  const handleUpdateRowName = (rIdx: number, value: string) => {
    const nextRows = [...specRows];
    nextRows[rIdx] = { ...nextRows[rIdx], specName: value };
    onUpdate({ specRows: nextRows });
  };

  const handleUpdateCellValue = (rIdx: number, vIdx: number, value: string) => {
    const nextRows = [...specRows];
    const nextVals = [...nextRows[rIdx].values];
    nextVals[vIdx] = value;
    nextRows[rIdx] = { ...nextRows[rIdx], values: nextVals };
    onUpdate({ specRows: nextRows });
  };

  return (
    <div className="space-y-3.5 p-3.5 bg-slate-900/60 rounded-xl border border-amber-500/20">
      {/* Tiêu đề bảng */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="text-xs font-semibold text-amber-400 shrink-0 flex items-center gap-1.5">
          <SlidersHorizontal size={14} /> Tiêu đề bảng so sánh:
        </label>
        <Input
          value={block.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ví dụ: Bảng So Sánh Thông Số Kỹ Thuật Giữa Các Bản..."
          className="h-9 bg-slate-950 border-white/10 text-slate-100 text-xs font-semibold flex-1"
        />
      </div>

      {/* Spreadsheet-like Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 shadow-inner scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/95 text-slate-300">
              {/* Cột tiêu đề hàng (Sticky) */}
              <th className="py-2.5 px-3 font-bold text-amber-300 min-w-[240px] sticky left-0 z-20 bg-slate-900 border-r border-white/10 shadow-[2px_0_6px_rgba(0,0,0,0.25)]">
                Tên thông số (Hàng)
              </th>

              {/* Các cột phiên bản xe */}
              {specVersions.map((ver, vIdx) => (
                <th key={vIdx} className="py-2.5 px-3 min-w-[190px] border-r border-white/10">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10 focus-within:border-amber-400">
                    <input
                      type="text"
                      value={ver}
                      onChange={(e) => handleUpdateColumnName(vIdx, e.target.value)}
                      className="bg-transparent text-xs text-white font-bold focus:outline-none w-full placeholder:text-slate-500"
                      placeholder={`Bản ${vIdx + 1}`}
                    />
                    {specVersions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveColumn(vIdx)}
                        className="h-5 w-5 text-slate-500 hover:text-red-400 p-0"
                        title="Xóa cột phiên bản này"
                      >
                        <X size={13} />
                      </Button>
                    )}
                  </div>
                </th>
              ))}

              {/* Nút Thêm Cột Phiên Bản */}
              <th className="py-2.5 px-3 min-w-[120px] text-center bg-slate-900/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddColumn}
                  className="h-7 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 px-2.5 rounded-lg border border-amber-500/30 flex items-center gap-1 mx-auto whitespace-nowrap"
                >
                  <Plus size={12} /> Thêm Cột
                </Button>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {specRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors group/row">
                {/* Sticky Row Header */}
                <td className="py-2 px-3 sticky left-0 z-10 bg-slate-950 border-r border-white/10 shadow-[2px_0_6px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5 text-slate-500 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={rIdx === 0}
                        onClick={() => handleMoveRow(rIdx, 'up')}
                        className="h-4 w-4 hover:text-amber-300 disabled:opacity-20 transition-colors p-0"
                        title="Di chuyển dòng lên trên"
                      >
                        <ChevronUp size={13} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={rIdx === specRows.length - 1}
                        onClick={() => handleMoveRow(rIdx, 'down')}
                        className="h-4 w-4 hover:text-amber-300 disabled:opacity-20 transition-colors p-0"
                        title="Di chuyển dòng xuống dưới"
                      >
                        <ChevronDown size={13} />
                      </Button>
                    </div>

                    <GripVertical
                      size={13}
                      className="text-slate-600 shrink-0 group-hover/row:text-slate-400"
                    />

                    <input
                      type="text"
                      value={row.specName}
                      onChange={(e) => handleUpdateRowName(rIdx, e.target.value)}
                      placeholder="Tên thông số (e.g. Mâm xe, Đèn pha...)"
                      className="bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-semibold flex-1 focus:outline-none focus:border-amber-400 focus:bg-slate-800 transition-colors"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRow(rIdx)}
                      className="h-6 w-6 text-slate-500 hover:text-red-400 p-0 shrink-0"
                      title="Xóa dòng thông số này"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </td>

                {/* Clean Data Input Cells */}
                {specVersions.map((_, vIdx) => (
                  <td key={vIdx} className="py-2 px-2.5 border-r border-white/5">
                    <input
                      type="text"
                      value={row.values[vIdx] || ''}
                      onChange={(e) => handleUpdateCellValue(rIdx, vIdx, e.target.value)}
                      placeholder="-"
                      className="w-full bg-slate-900/80 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:bg-slate-800 transition-colors"
                    />
                  </td>
                ))}

                {/* Thứ tự dòng */}
                <td className="py-2 px-2 text-center text-slate-600">
                  <span className="text-[10px] font-mono">#{rIdx + 1}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddRow}
          className="h-8 text-xs text-amber-300 hover:text-amber-200 border-amber-500/30 flex items-center gap-1.5 self-start"
        >
          <Plus size={13} /> Thêm dòng thông số
        </Button>
        <span className="text-[11px] text-slate-500 italic">
          💡 Mẹo: Nhấn phím <strong>Tab</strong> để nhảy nhanh liên tục giữa các ô nhập liệu giống
          Excel / Notion
        </span>
      </div>
    </div>
  );
}
