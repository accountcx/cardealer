'use client';

// 🧠 Mental Model: Khối Hỏi Đáp FAQ chuẩn Schema FAQPage (FaqBlock).
// Tối ưu hóa SEO Rich Snippets cho kết quả tìm kiếm Google.
// Quản lý linh hoạt danh sách câu hỏi - giải đáp chi tiết, thêm/xóa từng câu hỏi.

import React from 'react';
import { FileQuestion, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Textarea } from '@cardealer/ui';
import type { EditorBlock } from '../../types';

export interface FaqBlockProps {
  block: EditorBlock;
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

export function FaqBlock({ block, onUpdate }: FaqBlockProps) {
  const faqs = block.faqs && block.faqs.length > 0 ? block.faqs : [{ question: '', answer: '' }];

  const handleAddFaq = () => {
    onUpdate({ faqs: [...faqs, { question: '', answer: '' }] });
  };

  const handleRemoveFaq = (index: number) => {
    const nextFaqs = [...faqs];
    nextFaqs.splice(index, 1);
    onUpdate({ faqs: nextFaqs });
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const nextFaqs = [...faqs];
    nextFaqs[index] = { ...nextFaqs[index], [field]: value };
    onUpdate({ faqs: nextFaqs });
  };

  return (
    <div className="space-y-3 p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileQuestion size={14} /> Danh sách câu hỏi & giải đáp (Schema FAQPage)
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddFaq}
          className="h-7 text-xs text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 px-2.5 flex items-center gap-1 rounded-lg border border-emerald-500/30"
        >
          <Plus size={13} /> Thêm câu hỏi
        </Button>
      </div>

      <div className="space-y-3">
        {faqs.map((faqItem, faqIdx) => (
          <div
            key={faqIdx}
            className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 relative group/faq"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                FAQ #{faqIdx + 1}
              </span>
              {faqs.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFaq(faqIdx)}
                  className="h-6 w-6 text-slate-500 hover:text-red-400 p-0 rounded transition-colors"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
            <Input
              value={faqItem.question}
              onChange={(e) => handleUpdateFaq(faqIdx, 'question', e.target.value)}
              placeholder="Nhập câu hỏi (e.g. Mua xe Hyundai có được giao tận nhà không?)..."
              className="h-9 bg-slate-950/80 border-white/10 text-slate-100 text-xs font-semibold placeholder:text-slate-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/60"
            />
            <Textarea
              rows={2}
              value={faqItem.answer}
              onChange={(e) => handleUpdateFaq(faqIdx, 'answer', e.target.value)}
              placeholder="Nhập câu trả lời giải đáp chi tiết..."
              className="bg-slate-950/80 border-white/10 text-slate-200 text-xs min-h-[56px] placeholder:text-slate-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/60"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
