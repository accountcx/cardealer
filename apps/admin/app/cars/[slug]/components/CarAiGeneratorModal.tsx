'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Cpu,
  Fuel,
  Users,
  Sliders,
  DollarSign,
  Tag,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Modal, Button, Card, Input, Textarea } from '@cardealer/ui';
import { aiService } from '../../../../services/ai.service';
import type { CarFullContentResult, FullArticleResult } from '@cardealer/types';

export interface CarAiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  carName: string;
  carSlug: string;
  isNewCar?: boolean;
  onApply: (data: {
    moTaChung: string;
    promotionSummary: string;
    traTruocTu?: number;
    highlightFeatures: Array<{ icon: string; title: string; value: string }>;
    article?: FullArticleResult;
    applyArticle: boolean;
  }) => Promise<void> | void;
}

function getFeatureIcon(iconName: string) {
  const norm = (iconName || '').toLowerCase();
  if (norm.includes('engine') || norm.includes('động cơ')) return <Cpu size={16} className="text-sky-400" />;
  if (norm.includes('trans') || norm.includes('hộp số')) return <Sliders size={16} className="text-indigo-400" />;
  if (norm.includes('power') || norm.includes('công suất')) return <Zap size={16} className="text-amber-400" />;
  if (norm.includes('seat') || norm.includes('chỗ')) return <Users size={16} className="text-emerald-400" />;
  if (norm.includes('fuel') || norm.includes('nhiên liệu')) return <Fuel size={16} className="text-rose-400" />;
  if (norm.includes('safe') || norm.includes('an toàn')) return <ShieldCheck size={16} className="text-teal-400" />;
  return <Sparkles size={16} className="text-purple-400" />;
}

export function CarAiGeneratorModal({
  isOpen,
  onClose,
  carName,
  carSlug,
  isNewCar = false,
  onApply,
}: CarAiGeneratorModalProps) {
  const [inputCarName, setInputCarName] = useState(carName || '');
  const [inputLocation, setInputLocation] = useState('Nghệ An & Hà Tĩnh');
  const [inputPrompt, setInputPrompt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<CarFullContentResult | null>(null);

  // Apply checkboxes
  const [applyGeneral, setApplyGeneral] = useState(true);
  const [applyFeatures, setApplyFeatures] = useState(true);
  const [applyArticle, setApplyArticle] = useState(!isNewCar);

  useEffect(() => {
    if (isOpen) {
      setInputCarName(carName || '');
      setErrorMsg(null);
      if (!generatedData) {
        setInputPrompt('Hỗ trợ 50% lệ phí trước bạ, tặng gói phụ kiện cao cấp và bảo hành 5 năm hoặc 100.000 km');
      }
    }
  }, [isOpen, carName]);

  const handleGenerate = async () => {
    const targetName = inputCarName.trim();
    if (!targetName) {
      setErrorMsg('Vui lòng nhập tên dòng xe cần sinh nội dung.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await aiService.generate({
        action: 'generate_car_content',
        prompt: inputPrompt.trim() || `Tạo nội dung tiếp thị cho dòng xe ${targetName}`,
        carModel: targetName,
        carSlug: carSlug,
        location: inputLocation.trim() || 'Nghệ An & Hà Tĩnh',
        keyword: `giá xe ${targetName.toLowerCase()}`,
      });

      if (res && res.carContent) {
        setGeneratedData(res.carContent);
      } else {
        setErrorMsg('Không nhận được dữ liệu phản hồi từ AI. Vui lòng thử lại.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gọi dịch vụ AI tạo nội dung';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async () => {
    if (!generatedData) return;

    setApplying(true);
    try {
      await onApply({
        moTaChung: applyGeneral ? generatedData.moTaChung : '',
        promotionSummary: applyGeneral ? generatedData.promotionSummary : '',
        traTruocTu: applyGeneral ? generatedData.traTruocTu : undefined,
        highlightFeatures: applyFeatures ? generatedData.highlightFeatures : [],
        article: applyArticle ? generatedData.article : undefined,
        applyArticle,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi áp dụng nội dung AI';
      setErrorMsg(msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-base font-bold text-slate-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-tr from-amber-500 to-sky-500 text-white shadow-md">
            <Sparkles size={16} />
          </div>
          <span>AI Điền Toàn Bộ Dòng Xe (All-in-One Auto Fill)</span>
        </div>
      }
      description="Tự động khởi tạo chuẩn SEO: Mô tả tổng quan, Ưu đãi đại lý, 6 Điểm nhấn công nghệ và Bài viết đánh giá chuyên sâu."
      className="max-w-4xl"
    >
      <div className="space-y-6 pt-2 pb-1 max-h-[75vh] overflow-y-auto pr-1">
        {/* Input Configuration Card */}
        <Card variant="default" className="p-4 border-slate-700/60 bg-slate-900/60 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Tên Dòng Xe *"
                placeholder="Ví dụ: Hyundai Creta, Hyundai Santa Fe..."
                value={inputCarName}
                onChange={(e) => setInputCarName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Input
                label="Thị Trường / Địa Phương Ưu Tiên SEO *"
                placeholder="Ví dụ: Nghệ An & Hà Tĩnh"
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ghi Chú Ưu Đãi / Khuyến Mãi Đặc Thù Hoặc Yêu Cầu Bổ Sung
            </label>
            <Textarea
              placeholder="Ví dụ: Giảm 50% trước bạ, tặng camera hành trình, bảo hành 5 năm, hỗ trợ trả góp 85% nhận xe ngay..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              ⚡ Mô hình AI phân tích thông số kỹ thuật xe và tạo toàn bộ dữ liệu chỉ trong vài giây.
            </span>
            <Button
              type="button"
              variant="accent"
              glow
              onClick={handleGenerate}
              isLoading={loading}
              leftIcon={<Sparkles size={15} />}
              className="bg-linear-to-r from-amber-500 to-sky-500 hover:from-amber-600 hover:to-sky-600 text-white font-medium"
            >
              {generatedData ? 'Tạo Lại Toàn Bộ Dữ Liệu' : '🚀 Bắt Đầu Sinh Nội Dung AI'}
            </Button>
          </div>
        </Card>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2.5 text-xs shadow-md">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Generated Content Preview */}
        {generatedData && (
          <div className="space-y-5 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-200">
                  Xem Trước Kết Quả Tạo Tự Động
                </h4>
              </div>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Sẵn sàng áp dụng
              </span>
            </div>

            {/* Checkbox Options */}
            <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={applyGeneral}
                  onChange={(e) => setApplyGeneral(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500/40"
                />
                <span>Điền Thông Tin Chung & Ưu Đãi</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={applyFeatures}
                  onChange={(e) => setApplyFeatures(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500/40"
                />
                <span>Điền 6 Điểm Nhấn Công Nghệ</span>
              </label>

              <label className={`flex items-center gap-2 font-medium ${isNewCar ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={applyArticle}
                  disabled={isNewCar}
                  onChange={(e) => setApplyArticle(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500/40 disabled:opacity-40"
                />
                <span>Lưu Bài Viết Đánh Giá Chuyên Sâu {isNewCar ? '(Cần lưu dòng xe trước)' : ''}</span>
              </label>
            </div>

            {/* 1. Thông Tin Chung & Khuyến Mãi */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Tag size={14} className="text-sky-400" />
                <span>1. Thông Tin Chung & Khuyến Mãi</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Mô Tả Tổng Quan (Mô tả chung dòng xe):</span>
                  <p className="text-slate-200 leading-relaxed">{generatedData.moTaChung}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Trả Trước Tối Thiểu Ước Tính:</span>
                  <div className="text-lg font-bold text-amber-400">
                    {generatedData.traTruocTu ? `${generatedData.traTruocTu.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Tương đương 15-20% giá trị xe</span>
                </div>

                <div className="md:col-span-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Tóm Tắt Khuyến Mãi & Hỗ Trợ Đại Lý:</span>
                  </span>
                  <p className="text-amber-100/90 leading-relaxed">{generatedData.promotionSummary}</p>
                </div>
              </div>
            </div>

            {/* 2. 6 Điểm Nhấn Công Nghệ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Zap size={14} className="text-amber-400" />
                <span>2. 6 Điểm Nhấn Công Nghệ & Vận Hành</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {generatedData.highlightFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5 shadow-xs"
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getFeatureIcon(feat.icon || feat.title)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {feat.title}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-0.5 line-clamp-2">
                        {feat.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Bài Viết Đánh Giá Chuyên Sâu */}
            {generatedData.article && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <BookOpen size={14} className="text-indigo-400" />
                  <span>3. Bài Viết Đánh Giá Chuyên Sâu (Chuẩn SEO Real-Time)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 line-clamp-1">
                      {generatedData.article.title}
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[11px] text-indigo-300 font-mono">
                      Từ khóa: {generatedData.article.focusKeyword}
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px] line-clamp-2">
                    {generatedData.article.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      📦 {generatedData.article.blocks.length} Content Blocks
                    </span>
                    <span className="text-slate-500">
                      (Bảng giá, Thông số kỹ thuật, Ưu & nhược điểm, FAQ, Form nhận báo giá)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={applying}>
            Đóng
          </Button>

          {generatedData && (
            <Button
              type="button"
              variant="accent"
              glow
              onClick={handleApplyClick}
              isLoading={applying}
              leftIcon={<Check size={16} />}
              className="bg-linear-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-medium"
            >
              Áp Dụng Vào Dòng Xe Ngay
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
