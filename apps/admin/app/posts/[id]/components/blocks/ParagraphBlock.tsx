'use client';

// 🧠 Mental Model: Khối soạn thảo Đoạn văn bản (ParagraphBlock) chuẩn SEO.
// Cung cấp trường Textarea mượt mà, thanh công cụ gắn liên kết nội bộ (Internal Links),
// thanh Quick Link Chips 1-click (dòng xe showroom & trang tiện ích)
// và Modal chọn liên kết trực quan, tự động bóc tách thành Markdown [anchor](url).

import React, { useState, useRef } from 'react';
import { Link2, Car, Layers, Compass, Check, ArrowRight } from 'lucide-react';
import { Textarea, Modal, Button, Input } from '@cardealer/ui';
import type { CarSummary } from '../../../../../services/catalog.service';
import type { EditorBlock } from '../../types';

export interface ParagraphBlockProps {
  block: EditorBlock;
  availableCars?: CarSummary[];
  onUpdate: (updates: Partial<EditorBlock>) => void;
}

const UTILITY_PAGES = [
  { name: 'Bảng Giá Xe', url: '/bang-gia-xe', desc: 'Bảng giá niêm yết & ưu đãi mới nhất' },
  { name: 'Dự Toán Chi Phí', url: '/du-toan-chi-phi', desc: 'Công cụ tính giá lăn bánh & trả góp' },
  { name: 'Liên Hệ Báo Giá', url: '/lien-he', desc: 'Trang gửi yêu cầu & thông tin showroom' },
  { name: 'Tin Tức Thị Trường', url: '/tin-tuc', desc: 'Chuyên mục tin tức & cẩm nang ô tô' },
];

export function ParagraphBlock({ block, availableCars = [], onUpdate }: ParagraphBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'car' | 'utility' | 'custom'>('car');
  const [anchorText, setAnchorText] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');

  // 🎯 Chèn cú pháp Markdown [anchor](url) vào vị trí con trỏ hoặc thay thế vùng bôi đen
  const insertLinkAtSelection = (anchor: string, url: string) => {
    if (!anchor.trim() || !url.trim()) return;
    const textarea = textareaRef.current;
    const currentContent = block.content || '';
    const markdownLink = `[${anchor.trim()}](${url.trim()})`;

    if (textarea) {
      const start = textarea.selectionStart ?? currentContent.length;
      const end = textarea.selectionEnd ?? currentContent.length;
      const before = currentContent.substring(0, start);
      const after = currentContent.substring(end);
      const newContent = `${before}${markdownLink}${after}`;
      onUpdate({ content: newContent });

      // Đặt lại tiêu điểm và dời con trỏ về sau đoạn vừa chèn
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + markdownLink.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      const newContent = currentContent ? `${currentContent} ${markdownLink}` : markdownLink;
      onUpdate({ content: newContent });
    }
  };

  // 🎯 Mở Modal chọn link và bắt lấy selection hiện tại
  const handleOpenLinkModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        const selected = (block.content || '').substring(start, end);
        setAnchorText(selected);
      } else {
        setAnchorText('');
      }
    }

    if (availableCars.length > 0) {
      setActiveTab('car');
      setSelectedCarId(availableCars[0].id);
      setTargetUrl(`/dong-xe/${availableCars[0].slug}`);
    } else {
      setActiveTab('utility');
      setTargetUrl(UTILITY_PAGES[0].url);
    }
    setIsModalOpen(true);
  };

  // 🎯 Xác nhận chèn từ Modal
  const handleConfirmModalInsert = () => {
    let finalAnchor = anchorText.trim();
    let finalUrl = targetUrl.trim();

    if (activeTab === 'car') {
      const car = availableCars.find((c) => c.id === selectedCarId);
      if (car) {
        finalUrl = `/dong-xe/${car.slug}`;
        if (!finalAnchor) finalAnchor = car.tenXe;
      }
    } else if (activeTab === 'utility') {
      if (!finalAnchor) {
        const match = UTILITY_PAGES.find((p) => p.url === finalUrl);
        finalAnchor = match ? match.name : 'Trang tiện ích';
      }
    }

    if (!finalUrl) return;
    if (!finalAnchor) finalAnchor = 'Liên kết';

    insertLinkAtSelection(finalAnchor, finalUrl);
    setIsModalOpen(false);
    setAnchorText('');
    setTargetUrl('');
  };

  return (
    <div className="space-y-2">
      {/* 🛠️ Toolbar gắn link */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <span>Đoạn văn bản</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Hỗ trợ link:</span>
          <code className="text-sky-300 bg-slate-800/80 border border-slate-700/60 px-1 py-0.5 rounded text-[10px]">
            [tên](/duong-dan)
          </code>
        </span>
        <button
          type="button"
          onClick={handleOpenLinkModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-700/50 hover:border-sky-500/70 transition-all shadow-xs cursor-pointer"
          title="Chèn liên kết nội bộ tới dòng xe hoặc trang tiện ích"
        >
          <Link2 size={13} className="text-sky-400" />
          <span>Gắn link nội bộ</span>
        </button>
      </div>

      {/* 📝 Trường nhập nội dung */}
      <Textarea
        ref={textareaRef}
        rows={4}
        value={block.content || ''}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Nhập nội dung đoạn văn... Bạn có thể bôi đen chữ và bấm 'Gắn link nội bộ' hoặc bấm các chip gợi ý nhanh bên dưới."
        className="bg-slate-900 border-white/10 text-slate-100 text-sm leading-relaxed"
      />

      {/* ⚡ Thanh Quick Link Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium mr-1 select-none">
          <Link2 size={11} className="text-sky-400" /> Chèn nhanh:
        </span>

        {/* Tiện ích hệ thống */}
        {UTILITY_PAGES.map((page) => (
          <button
            key={page.url}
            type="button"
            onClick={() => insertLinkAtSelection(page.name, page.url)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-sky-950 text-slate-300 hover:text-sky-300 border border-slate-700/70 hover:border-sky-500/60 transition-colors text-[11px] cursor-pointer"
            title={`Chèn nhanh: [${page.name}](${page.url})`}
          >
            <span className="text-slate-500 hover:text-sky-400 font-bold">+</span>
            <span>{page.name}</span>
          </button>
        ))}

        {/* Dòng xe Showroom */}
        {availableCars.slice(0, 6).map((car) => (
          <button
            key={car.id}
            type="button"
            onClick={() => insertLinkAtSelection(car.tenXe, `/dong-xe/${car.slug}`)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 hover:text-blue-200 border border-blue-800/40 hover:border-blue-500/60 transition-colors text-[11px] cursor-pointer"
            title={`Chèn nhanh: [${car.tenXe}](/dong-xe/${car.slug})`}
          >
            <span className="text-blue-400/70 font-bold">+</span>
            <span>{car.tenXe}</span>
          </button>
        ))}
      </div>

      {/* 🔗 Modal Chèn Link Nội Bộ Trực Quan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-white">
            <Link2 className="text-sky-400 w-5 h-5" />
            <span>Chèn Liên Kết Nội Bộ (Internal Link)</span>
          </div>
        }
        description="Gắn liên kết tới dòng xe showroom hoặc trang tiện ích giúp tối ưu SEO On-Page và tăng chuyển đổi."
        className="max-w-lg bg-slate-900 border-white/10"
      >
        <div className="space-y-4 pt-1">
          {/* Anchor Text Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Văn bản hiển thị (Anchor Text)
            </label>
            <Input
              value={anchorText}
              onChange={(e) => setAnchorText(e.target.value)}
              placeholder="Ví dụ: Hyundai Santa Fe 2026, Xem bảng giá xe..."
              className="bg-slate-800 border-white/10 text-white text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Đoạn chữ mà người đọc sẽ nhìn thấy và nhấp vào trong bài viết.
            </p>
          </div>

          {/* Chọn Tab nguồn link */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Chọn trang đích liên kết
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/80 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('car');
                  if (availableCars.length > 0) {
                    setSelectedCarId(availableCars[0].id);
                    setTargetUrl(`/dong-xe/${availableCars[0].slug}`);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'car'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car size={13} />
                <span>Dòng xe ({availableCars.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('utility');
                  setTargetUrl(UTILITY_PAGES[0].url);
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'utility'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers size={13} />
                <span>Trang tiện ích</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('custom');
                  setTargetUrl('');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>Tùy chỉnh</span>
              </button>
            </div>
          </div>

          {/* Tab Content 1: Danh sách xe Showroom */}
          {activeTab === 'car' && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 border border-white/5 rounded-lg p-2 bg-slate-950/50">
              {availableCars.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  Chưa có dữ liệu dòng xe trong showroom.
                </div>
              ) : (
                availableCars.map((car) => {
                  const isSelected = selectedCarId === car.id;
                  return (
                    <div
                      key={car.id}
                      onClick={() => {
                        setSelectedCarId(car.id);
                        setTargetUrl(`/dong-xe/${car.slug}`);
                        if (!anchorText) setAnchorText(car.tenXe);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-500/60 text-sky-200'
                          : 'bg-slate-800/40 hover:bg-slate-800 border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Car size={14} className={isSelected ? 'text-sky-400' : 'text-slate-500'} />
                        <span className="text-xs font-medium">{car.tenXe}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">/dong-xe/{car.slug}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab Content 2: Trang tiện ích hệ thống */}
          {activeTab === 'utility' && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 border border-white/5 rounded-lg p-2 bg-slate-950/50">
              {UTILITY_PAGES.map((page) => {
                const isSelected = targetUrl === page.url;
                return (
                  <div
                    key={page.url}
                    onClick={() => {
                      setTargetUrl(page.url);
                      if (!anchorText) setAnchorText(page.name);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-500/60 text-sky-200'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-white/5 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium">{page.name}</div>
                      <div className="text-[11px] text-slate-400">{page.desc}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{page.url}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content 3: URL tùy chỉnh */}
          {activeTab === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Đường dẫn liên kết (URL)
              </label>
              <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="Ví dụ: /tin-tuc/danh-gia-xe, https://hyundai.vn..."
                className="bg-slate-800 border-white/10 text-white text-sm font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Khuyến nghị: Dùng đường dẫn tương đối bắt đầu bằng &quot;/&quot; cho liên kết nội bộ để bảo toàn PageRank.
              </p>
            </div>
          )}

          {/* Xem trước cú pháp Markdown sinh ra */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Xem trước:</span>
            <code className="text-sky-300 font-mono text-[11px]">
              [{anchorText.trim() || 'anchor'}]({targetUrl.trim() || '/url'})
            </code>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="border-white/10 text-slate-300 hover:bg-slate-800"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmModalInsert}
              disabled={!targetUrl.trim()}
              className="bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Chèn Liên Kết</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
